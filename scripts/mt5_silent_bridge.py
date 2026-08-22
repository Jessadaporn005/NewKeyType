#!/usr/bin/env python3
"""Authenticated, read-only MT5 Demo observer for CyberDeck Shadow telemetry.

The observer never sends, modifies, or closes orders. It emits no simulated
fallback data and refuses any account that MT5 does not identify as Demo.
It never receives an XM password; it attaches to an already authenticated
local terminal selected by the Electron host.
"""

from __future__ import annotations

import hmac
import json
import os
import sys
import threading
import time
import uuid
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

try:
    import MetaTrader5 as mt5
except ImportError:
    mt5 = None


HOST = "127.0.0.1"
PORT = 5055
PACKET_SOURCE = "CYBERDECK_MT5_DEMO_GATEWAY"
PACKET_SCHEMA = 1
SESSION_ID = uuid.uuid4().hex
ACCESS_TOKEN = os.environ.get("CYBERDECK_MT5_DEMO_TOKEN", "")
TERMINAL_PATH = os.environ.get("CYBERDECK_MT5_TERMINAL_PATH", "").strip()
EXPECTED_COMPANY = os.environ.get("CYBERDECK_MT5_EXPECTED_COMPANY", "").strip()
EXPECTED_SERVER_PREFIX = os.environ.get("CYBERDECK_MT5_EXPECTED_SERVER_PREFIX", "").strip()
SYMBOL_CANDIDATES = tuple(
    item.strip()
    for item in os.environ.get("CYBERDECK_MT5_DEMO_SYMBOLS", "GOLD,XAUUSD,GOLD#").split(",")
    if item.strip() and len(item.strip()) <= 40
)
AUTH_SCHEME = "CyberDeck-HMAC"
AUTH_WINDOW_MS = 5_000

_packet_lock = threading.Lock()
_nonce_lock = threading.Lock()
_used_nonces: dict[str, int] = {}
_sequence = 0
_active_symbol: str | None = None
_terminal_initialized = False
_latest_packet: dict[str, object] = {
    "schemaVersion": PACKET_SCHEMA,
    "source": PACKET_SOURCE,
    "mode": "DEMO",
    "sessionId": SESSION_ID,
    "sequence": 0,
    "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    "status": "DISCONNECTED",
    "connected": False,
    "reason": "WAITING_FOR_VERIFIED_MT5_DEMO_ACCOUNT",
}


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _request_signature(token: str, timestamp_text: str, nonce: str) -> str:
    message = f"GET\n/api/mt5/demo/stream\n{timestamp_text}\n{nonce}".encode("utf-8")
    return hmac.new(token.encode("utf-8"), message, "sha256").hexdigest()


def _response_signature(token: str, nonce: str, encoded_body: bytes) -> str:
    return hmac.new(
        token.encode("utf-8"),
        nonce.encode("utf-8") + b"\n" + encoded_body,
        "sha256",
    ).hexdigest()


def _safe_float(value: object) -> float:
    parsed = float(value)
    if not (-1e12 <= parsed <= 1e12):
        raise ValueError("numeric value outside observer bounds")
    return parsed


def _position_to_json(position: object) -> dict[str, object]:
    side = "BUY" if position.type == mt5.POSITION_TYPE_BUY else "SELL"
    return {
        "ticket": str(position.ticket),
        "symbol": str(position.symbol),
        "side": side,
        "volume": _safe_float(position.volume),
        "entryPrice": _safe_float(position.price_open),
        "currentPrice": _safe_float(position.price_current),
        "stopPrice": _safe_float(position.sl),
        "targetPrice": _safe_float(position.tp),
        "profit": _safe_float(position.profit),
        "magic": int(position.magic),
    }


def _depth_to_json(book: object) -> dict[str, list[dict[str, float]]]:
    bids: list[dict[str, float]] = []
    asks: list[dict[str, float]] = []
    for item in book or []:
        level = {
            "price": _safe_float(item.price),
            "volume": _safe_float(getattr(item, "volume_dbl", item.volume)),
        }
        if item.type == mt5.BOOK_TYPE_BUY:
            bids.append(level)
        elif item.type == mt5.BOOK_TYPE_SELL:
            asks.append(level)
    bids.sort(key=lambda level: level["price"], reverse=True)
    asks.sort(key=lambda level: level["price"])
    return {"bids": bids[:20], "asks": asks[:20]}


def _set_disconnected(reason: str) -> None:
    global _latest_packet
    with _packet_lock:
        _latest_packet = {
            "schemaVersion": PACKET_SCHEMA,
            "source": PACKET_SOURCE,
            "mode": "DEMO",
            "sessionId": SESSION_ID,
            "sequence": _sequence,
            "timestamp": _utc_now(),
            "status": "DISCONNECTED",
            "connected": False,
            "reason": reason[:160],
        }


def _initialize_terminal() -> bool:
    global _terminal_initialized
    if _terminal_initialized:
        terminal = mt5.terminal_info()
        return bool(terminal is not None and terminal.connected)
    if TERMINAL_PATH:
        if not os.path.isfile(TERMINAL_PATH):
            return False
        _terminal_initialized = bool(mt5.initialize(TERMINAL_PATH))
    else:
        _terminal_initialized = bool(mt5.initialize())
    return _terminal_initialized


def _select_verified_symbol() -> tuple[str, object] | tuple[None, None]:
    global _active_symbol
    candidates = (_active_symbol,) if _active_symbol else SYMBOL_CANDIDATES
    for candidate in candidates:
        if not candidate:
            continue
        info = mt5.symbol_info(candidate)
        if info is None:
            continue
        if not info.visible:
            mt5.symbol_select(candidate, True)
        tick = mt5.symbol_info_tick(candidate)
        if tick is not None and tick.bid > 0 and tick.ask >= tick.bid:
            _active_symbol = candidate
            return candidate, tick
    return None, None


def _capture_demo_snapshot() -> None:
    global _latest_packet, _sequence
    if mt5 is None:
        _set_disconnected("METATRADER5_PYTHON_PACKAGE_NOT_INSTALLED")
        return
    if not _initialize_terminal():
        _set_disconnected("MT5_INITIALIZATION_FAILED")
        return

    account = mt5.account_info()
    if account is None:
        _set_disconnected("MT5_ACCOUNT_UNAVAILABLE")
        return
    if account.trade_mode != mt5.ACCOUNT_TRADE_MODE_DEMO:
        _set_disconnected("NON_DEMO_ACCOUNT_BLOCKED")
        return
    if EXPECTED_COMPANY and str(account.company).casefold() != EXPECTED_COMPANY.casefold():
        _set_disconnected("UNEXPECTED_BROKER_COMPANY_BLOCKED")
        return
    if EXPECTED_SERVER_PREFIX and not str(account.server).casefold().startswith(EXPECTED_SERVER_PREFIX.casefold()):
        _set_disconnected("UNEXPECTED_BROKER_SERVER_BLOCKED")
        return

    symbol, tick = _select_verified_symbol()
    if symbol is None or tick is None:
        _set_disconnected("VALID_DEMO_QUOTE_UNAVAILABLE")
        return

    mt5.market_book_add(symbol)
    book = mt5.market_book_get(symbol)
    positions = [_position_to_json(position) for position in (mt5.positions_get() or [])]
    depth = _depth_to_json(book)
    _sequence += 1
    packet = {
        "schemaVersion": PACKET_SCHEMA,
        "source": PACKET_SOURCE,
        "mode": "DEMO",
        "sessionId": SESSION_ID,
        "sequence": _sequence,
        "timestamp": _utc_now(),
        "status": "DEMO_SHADOW_OBSERVER",
        "connected": True,
        "symbol": symbol,
        "quote": {"symbol": symbol, "bid": _safe_float(tick.bid), "ask": _safe_float(tick.ask)},
        "depth": depth,
        "account": {
            "login": str(account.login),
            "server": str(account.server),
            "company": str(account.company),
            "currency": str(account.currency),
            "tradeMode": "DEMO",
            "leverage": int(account.leverage),
            "balance": _safe_float(account.balance),
            "equity": _safe_float(account.equity),
            "margin": _safe_float(account.margin),
            "freeMargin": _safe_float(account.margin_free),
            "positions": positions,
        },
    }
    with _packet_lock:
        _latest_packet = packet


def _observer_loop() -> None:
    while True:
        try:
            _capture_demo_snapshot()
        except Exception as error:
            _set_disconnected(f"OBSERVER_ERROR:{type(error).__name__}")
        time.sleep(1.0)


class DemoObserverHandler(BaseHTTPRequestHandler):
    def _authenticated_nonce(self) -> str | None:
        supplied = self.headers.get("Authorization", "")
        timestamp_text = self.headers.get("X-CyberDeck-Timestamp", "")
        nonce = self.headers.get("X-CyberDeck-Nonce", "")
        try:
            timestamp_ms = int(timestamp_text)
        except ValueError:
            return None
        now_ms = int(time.time() * 1000)
        if abs(now_ms - timestamp_ms) > AUTH_WINDOW_MS:
            return None
        if len(nonce) != 32 or any(char not in "0123456789abcdefABCDEF" for char in nonce):
            return None
        expected_signature = _request_signature(ACCESS_TOKEN, timestamp_text, nonce)
        expected_authorization = f"{AUTH_SCHEME} {expected_signature}"
        if not ACCESS_TOKEN or not hmac.compare_digest(supplied, expected_authorization):
            return None
        with _nonce_lock:
            expired = [value for value, seen_at in _used_nonces.items() if now_ms - seen_at > AUTH_WINDOW_MS]
            for value in expired:
                del _used_nonces[value]
            if nonce in _used_nonces:
                return None
            _used_nonces[nonce] = now_ms
        return nonce

    def _send_json(self, status: int, payload: dict[str, object], response_nonce: str | None = None) -> None:
        encoded = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        if response_nonce:
            response_signature = _response_signature(ACCESS_TOKEN, response_nonce, encoded)
            self.send_header("X-CyberDeck-Response-HMAC", response_signature)
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self) -> None:
        if self.path != "/api/mt5/demo/stream":
            self._send_json(404, {"error": "NOT_FOUND"})
            return
        response_nonce = self._authenticated_nonce()
        if not response_nonce:
            self._send_json(401, {"error": "AUTHENTICATION_REQUIRED"})
            return
        with _packet_lock:
            packet = dict(_latest_packet)
        self._send_json(200, packet, response_nonce)

    def do_POST(self) -> None:
        self._send_json(405, {"error": "READ_ONLY_DEMO_OBSERVER"})

    def do_OPTIONS(self) -> None:
        self._send_json(405, {"error": "CORS_DISABLED"})

    def log_message(self, format: str, *args: object) -> None:
        return


def main() -> int:
    if "--auth-self-test" in sys.argv:
        test_token = "0123456789abcdef0123456789abcdef"
        test_nonce = "00112233445566778899aabbccddeeff"
        request_ok = _request_signature(test_token, "1787200000000", test_nonce) == "0971ec641a11e9652880eb5032b438c9f4097eb85f6c2c8424751f3569ebdb2d"
        response_ok = _response_signature(test_token, test_nonce, b"ok") == "4cc7fa45c7de2371ef0941820e423610caa24c2a91c09ac619ccb0dbfd773d15"
        if not request_ok or not response_ok:
            print("MT5 Demo HMAC self-test failed.", file=sys.stderr)
            return 1
        print("MT5 Demo HMAC self-test passed.")
        return 0
    if len(ACCESS_TOKEN) < 32:
        print("CYBERDECK_MT5_DEMO_TOKEN must contain at least 32 characters.", file=sys.stderr)
        return 78
    if mt5 is None:
        print("MetaTrader5 Python package is not installed.", file=sys.stderr)
        return 69

    observer = threading.Thread(target=_observer_loop, daemon=True)
    observer.start()
    server = ThreadingHTTPServer((HOST, PORT), DemoObserverHandler)
    print(f"Read-only MT5 Demo observer listening on {HOST}:{PORT} (authenticated endpoint).")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        try:
            if _active_symbol:
                mt5.market_book_release(_active_symbol)
            mt5.shutdown()
        except Exception:
            pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

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
from urllib.parse import parse_qs, urlparse

try:
    import MetaTrader5 as mt5
except ImportError:
    mt5 = None


HOST = "127.0.0.1"
PORT = 5055
PACKET_SOURCE = "CYBERDECK_MT5_DEMO_GATEWAY"
PACKET_SCHEMA = 1
MARKET_SOURCE = "XM_MT5_DEMO_BARS"
MARKET_SCHEMA = "CYBERDECK_XM_MARKET_SNAPSHOT_V1"
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
APPROVED_MARKETS = {
    "XAU/USD": "GOLD",
    "EUR/USD": "EURUSD",
    "GBP/USD": "GBPUSD",
    "USOIL": "OILCash",
}
APPROVED_TIMEFRAMES = {
    "1m": (mt5.TIMEFRAME_M1 if mt5 else 1, 60),
    "5m": (mt5.TIMEFRAME_M5 if mt5 else 5, 300),
    "15m": (mt5.TIMEFRAME_M15 if mt5 else 15, 900),
    "1h": (mt5.TIMEFRAME_H1 if mt5 else 16385, 3600),
    "1D": (mt5.TIMEFRAME_D1 if mt5 else 16408, 86400),
}

_packet_lock = threading.Lock()
_nonce_lock = threading.Lock()
_mt5_lock = threading.Lock()
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


def _request_signature(token: str, timestamp_text: str, nonce: str, request_path: str = "/api/mt5/demo/stream") -> str:
    message = f"GET\n{request_path}\n{timestamp_text}\n{nonce}".encode("utf-8")
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


def _verified_demo_account() -> tuple[object | None, str | None]:
    if not _initialize_terminal():
        return None, "MT5_INITIALIZATION_FAILED"
    account = mt5.account_info()
    if account is None:
        return None, "MT5_ACCOUNT_UNAVAILABLE"
    if account.trade_mode != mt5.ACCOUNT_TRADE_MODE_DEMO:
        return None, "NON_DEMO_ACCOUNT_BLOCKED"
    if EXPECTED_COMPANY and str(account.company).casefold() != EXPECTED_COMPANY.casefold():
        return None, "UNEXPECTED_BROKER_COMPANY_BLOCKED"
    if EXPECTED_SERVER_PREFIX and not str(account.server).casefold().startswith(EXPECTED_SERVER_PREFIX.casefold()):
        return None, "UNEXPECTED_BROKER_SERVER_BLOCKED"
    return account, None


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


def _capture_demo_snapshot_locked() -> None:
    global _latest_packet, _sequence
    if mt5 is None:
        _set_disconnected("METATRADER5_PYTHON_PACKAGE_NOT_INSTALLED")
        return
    account, account_error = _verified_demo_account()
    if account_error:
        _set_disconnected(account_error)
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


def _capture_demo_snapshot() -> None:
    with _mt5_lock:
        _capture_demo_snapshot_locked()


def _market_error(reason: str) -> dict[str, object]:
    return {
        "schemaVersion": MARKET_SCHEMA,
        "source": MARKET_SOURCE,
        "mode": "DEMO_MARKET_DATA",
        "capturedAt": _utc_now(),
        "status": "UNAVAILABLE",
        "reason": reason[:160],
        "authority": {
            "paperDecisionInfluence": False,
            "demoExecutionInfluence": False,
            "liveEligible": False,
        },
    }


def _contract_to_json(info: object) -> dict[str, object]:
    return {
        "digits": int(info.digits),
        "point": _safe_float(info.point),
        "tickSize": _safe_float(info.trade_tick_size),
        "tickValueProfit": _safe_float(info.trade_tick_value_profit),
        "tickValueLoss": _safe_float(info.trade_tick_value_loss),
        "contractSize": _safe_float(info.trade_contract_size),
        "volumeMin": _safe_float(info.volume_min),
        "volumeMax": _safe_float(info.volume_max),
        "volumeStep": _safe_float(info.volume_step),
        "stopsLevel": int(info.trade_stops_level),
        "freezeLevel": int(info.trade_freeze_level),
        "tradeMode": "FULL" if info.trade_mode == mt5.SYMBOL_TRADE_MODE_FULL else "BLOCKED",
        "executionMode": int(info.trade_exemode),
        "fillingMode": int(info.filling_mode),
        "orderMode": int(info.order_mode),
        "currencyBase": str(info.currency_base),
        "currencyProfit": str(info.currency_profit),
        "currencyMargin": str(info.currency_margin),
    }


def _closed_bar_to_json(rate: object, timeframe_seconds: int) -> dict[str, object]:
    open_time_ms = int(rate["time"]) * 1000
    return {
        "openTimeMs": open_time_ms,
        "closeTimeMs": open_time_ms + timeframe_seconds * 1000 - 1,
        "open": _safe_float(rate["open"]),
        "high": _safe_float(rate["high"]),
        "low": _safe_float(rate["low"]),
        "close": _safe_float(rate["close"]),
        "volume": _safe_float(rate["real_volume"] if rate["real_volume"] > 0 else rate["tick_volume"]),
        "spreadPoints": int(rate["spread"]),
        "closed": True,
    }


def _capture_market_snapshot(asset_id: str, timeframe_id: str, limit: int) -> dict[str, object]:
    if mt5 is None:
        return _market_error("METATRADER5_PYTHON_PACKAGE_NOT_INSTALLED")
    with _mt5_lock:
        account, account_error = _verified_demo_account()
        if account_error:
            return _market_error(account_error)
        broker_symbol = APPROVED_MARKETS.get(asset_id)
        timeframe = APPROVED_TIMEFRAMES.get(timeframe_id)
        if not broker_symbol or not timeframe:
            return _market_error("UNAPPROVED_MARKET_MAPPING")
        timeframe_value, timeframe_seconds = timeframe
        info = mt5.symbol_info(broker_symbol)
        if info is None:
            return _market_error("APPROVED_BROKER_SYMBOL_UNAVAILABLE")
        if not info.visible and not mt5.symbol_select(broker_symbol, True):
            return _market_error("APPROVED_BROKER_SYMBOL_NOT_SELECTABLE")
        info = mt5.symbol_info(broker_symbol)
        tick = mt5.symbol_info_tick(broker_symbol)
        if info is None or tick is None or tick.bid <= 0 or tick.ask < tick.bid:
            return _market_error("VALID_BROKER_QUOTE_UNAVAILABLE")
        # Position zero is the currently forming MT5 bar. Starting at one is a
        # deliberate fail-closed boundary: only completed broker bars are exposed.
        rates = mt5.copy_rates_from_pos(broker_symbol, timeframe_value, 1, limit)
        if rates is None or len(rates) < 1:
            return _market_error("CLOSED_BROKER_BARS_UNAVAILABLE")
        captured_at_ms = int(time.time() * 1000)
        closed_bars = [
            _closed_bar_to_json(rate, timeframe_seconds)
            for rate in rates
            if int(rate["time"]) * 1000 + timeframe_seconds * 1000 - 1 <= captured_at_ms
        ]
        if not closed_bars:
            return _market_error("NO_VERIFIABLY_CLOSED_BROKER_BARS")
        tick_time_ms = int(getattr(tick, "time_msc", 0) or int(tick.time) * 1000)
        return {
            "schemaVersion": MARKET_SCHEMA,
            "source": MARKET_SOURCE,
            "mode": "DEMO_MARKET_DATA",
            "capturedAt": datetime.fromtimestamp(captured_at_ms / 1000, timezone.utc).isoformat().replace("+00:00", "Z"),
            "status": "VERIFIED_CLOSED_BARS",
            "assetId": asset_id,
            "brokerSymbol": broker_symbol,
            "timeframe": timeframe_id,
            "timeframeSeconds": timeframe_seconds,
            "formingBarExcluded": True,
            "account": {
                "loginSuffix": str(account.login)[-4:],
                "server": str(account.server),
                "company": str(account.company),
                "tradeMode": "DEMO",
            },
            "quote": {
                "bid": _safe_float(tick.bid),
                "ask": _safe_float(tick.ask),
                "timeMs": tick_time_ms,
            },
            "contract": _contract_to_json(info),
            "closedBars": closed_bars,
            "authority": {
                "paperDecisionInfluence": True,
                "demoExecutionInfluence": False,
                "liveEligible": False,
            },
        }


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
        expected_signature = _request_signature(ACCESS_TOKEN, timestamp_text, nonce, self.path)
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
        parsed = urlparse(self.path)
        is_stream = self.path == "/api/mt5/demo/stream"
        is_market = parsed.path == "/api/mt5/demo/market"
        if not is_stream and not is_market:
            self._send_json(404, {"error": "NOT_FOUND"})
            return
        market_request: tuple[str, str, int] | None = None
        if is_market:
            try:
                query = parse_qs(parsed.query, keep_blank_values=True, strict_parsing=True)
            except ValueError:
                self._send_json(400, {"error": "INVALID_MARKET_QUERY"})
                return
            if set(query) != {"asset", "timeframe", "limit"} or any(len(values) != 1 for values in query.values()):
                self._send_json(400, {"error": "INVALID_MARKET_QUERY"})
                return
            asset_id = query["asset"][0]
            timeframe_id = query["timeframe"][0]
            try:
                limit = int(query["limit"][0])
            except ValueError:
                self._send_json(400, {"error": "INVALID_MARKET_LIMIT"})
                return
            if asset_id not in APPROVED_MARKETS or timeframe_id not in APPROVED_TIMEFRAMES or not 20 <= limit <= 5000:
                self._send_json(400, {"error": "UNAPPROVED_MARKET_REQUEST"})
                return
            market_request = (asset_id, timeframe_id, limit)
        response_nonce = self._authenticated_nonce()
        if not response_nonce:
            self._send_json(401, {"error": "AUTHENTICATION_REQUIRED"})
            return
        if market_request:
            try:
                packet = _capture_market_snapshot(*market_request)
            except Exception as error:
                packet = _market_error(f"MARKET_SNAPSHOT_ERROR:{type(error).__name__}")
        else:
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
        market_path = "/api/mt5/demo/market?asset=XAU%2FUSD&timeframe=5m&limit=80"
        market_ok = _request_signature(test_token, "1787200000000", test_nonce, market_path) == "70bc27ae912e84272ae306b0cf71af5e2510ab009d7c4ab37211f1798045f14f"
        response_ok = _response_signature(test_token, test_nonce, b"ok") == "4cc7fa45c7de2371ef0941820e423610caa24c2a91c09ac619ccb0dbfd773d15"
        if not request_ok or not market_ok or not response_ok:
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

"""One-shot, fail-closed XM MT5 Demo canary executor.

This is the only packaged component allowed to call MetaTrader5.order_send.
It accepts one short-lived host-issued intent on stdin, permits exactly 0.01 lot,
requires an already authenticated XM Demo terminal, sends at most once, and
then reconciles the resulting protected position before returning an ACK.
"""

from __future__ import annotations

import json
import math
import os
import re
import sys
import time
from typing import Any

try:
    import MetaTrader5 as mt5
except ImportError:  # pragma: no cover - exercised by the packaged host check
    mt5 = None


REQUEST_SCHEMA = "MT5_DEMO_ORDER_INTENT_V1"
ACK_SCHEMA = "MT5_DEMO_ORDER_ACK_V1"
ACK_SOURCE = "CYBERDECK_MT5_DEMO_GATEWAY"
REQUEST_SOURCE = "CYBERDECK_CERTIFIED_MT5_DEMO_ORDER"
EXPECTED_POLICY = "CERTIFIED_DEMO_ONLY_FAIL_CLOSED_V1"
TERMINAL_PATH = os.environ.get("CYBERDECK_MT5_TERMINAL_PATH", "").strip()
EXPECTED_COMPANY = os.environ.get("CYBERDECK_MT5_EXPECTED_COMPANY", "XM Global Limited").strip()
EXPECTED_SERVER_PREFIX = os.environ.get("CYBERDECK_MT5_EXPECTED_SERVER_PREFIX", "XMGlobal-").strip()
EXPECTED_LOGIN = os.environ.get("CYBERDECK_MT5_EXPECTED_LOGIN", "").strip()
APPROVED_MARKETS = {
    "XAU/USD": "GOLD",
    "EUR/USD": "EURUSD",
    "GBP/USD": "GBPUSD",
    "USOIL": "OILCash",
}
MAX_INPUT_BYTES = 16 * 1024
CANARY_VOLUME = 0.01
MAGIC = 99001
COMMENT = "CYBERDECK_DEMO_CANARY"


def _finite(value: object, minimum: float, maximum: float) -> float | None:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return None
    return parsed if math.isfinite(parsed) and minimum <= parsed <= maximum else None


def _ack(success: bool, reason: str, intent: dict[str, Any] | None = None, **values: object) -> dict[str, object]:
    safe_intent = intent if isinstance(intent, dict) else {}
    return {
        "schemaVersion": ACK_SCHEMA,
        "source": ACK_SOURCE,
        "mode": "DEMO",
        "success": success,
        "accepted": False,
        "reason": reason,
        "executionAttempted": False,
        "liveEligible": False,
        "intentId": safe_intent.get("intentId"),
        "nonce": safe_intent.get("nonce"),
        **values,
    }


def _initialize() -> bool:
    if mt5 is None:
        return False
    if TERMINAL_PATH:
        return os.path.isfile(TERMINAL_PATH) and bool(mt5.initialize(TERMINAL_PATH))
    return bool(mt5.initialize())


def _select_filling_mode(info: object) -> int:
    if int(info.filling_mode) & 2:
        return mt5.ORDER_FILLING_IOC
    if int(info.filling_mode) & 1:
        return mt5.ORDER_FILLING_FOK
    return mt5.ORDER_FILLING_RETURN


def _same_price(left: object, right: float, point: float) -> bool:
    parsed = _finite(left, 0, 1e12)
    return parsed is not None and math.isclose(parsed, right, rel_tol=0, abs_tol=max(point * 2, 1e-8))


def _validate_intent(payload: object) -> tuple[dict[str, Any] | None, str | None]:
    if not isinstance(payload, dict):
        return None, "INVALID_CANARY_INPUT"
    if payload.get("schemaVersion") != REQUEST_SCHEMA or payload.get("policy") != EXPECTED_POLICY:
        return None, "INVALID_CANARY_SCHEMA_OR_POLICY"
    if payload.get("source") != REQUEST_SOURCE or payload.get("mode") != "DEMO" or payload.get("liveEligible") is not False:
        return None, "DEMO_ONLY_AUTHORITY_REQUIRED"
    asset_id = payload.get("assetId")
    symbol = payload.get("symbol")
    side = payload.get("side")
    if APPROVED_MARKETS.get(asset_id) != symbol or side not in ("BUY", "SELL"):
        return None, "UNAPPROVED_CANARY_MARKET_OR_SIDE"
    volume = _finite(payload.get("volume"), CANARY_VOLUME, CANARY_VOLUME)
    stop_price = _finite(payload.get("stopPrice"), 0.00000001, 1e12)
    target_price = _finite(payload.get("targetPrice"), 0.00000001, 1e12)
    magic = payload.get("magic")
    nonce = payload.get("nonce")
    intent_id = payload.get("intentId")
    expires_at_ms = _finite(payload.get("expiresAtMs"), 1, 1e16)
    if volume != CANARY_VOLUME or stop_price is None or target_price is None or magic != MAGIC:
        return None, "INVALID_CANARY_PROTECTED_VALUES"
    if not isinstance(nonce, str) or not re.fullmatch(r"[a-f0-9]{32}", nonce, re.IGNORECASE):
        return None, "INVALID_CANARY_NONCE"
    if not isinstance(intent_id, str) or not intent_id.startswith("MT5D:CYBERDECK:") or len(intent_id) > 220:
        return None, "INVALID_CANARY_INTENT_ID"
    now_ms = time.time() * 1000
    if expires_at_ms is None or expires_at_ms < now_ms or expires_at_ms > now_ms + 30_000:
        return None, "EXPIRED_CANARY_INTENT"
    return payload, None


def execute_canary(payload: object) -> dict[str, object]:
    intent, error = _validate_intent(payload)
    if error or intent is None:
        return _ack(False, error or "INVALID_CANARY_INTENT")
    if not _initialize():
        return _ack(False, "MT5_INITIALIZATION_FAILED", intent)

    try:
        account = mt5.account_info()
        if account is None or account.trade_mode != mt5.ACCOUNT_TRADE_MODE_DEMO:
            return _ack(False, "VERIFIED_DEMO_ACCOUNT_REQUIRED", intent)
        if EXPECTED_LOGIN and str(account.login) != EXPECTED_LOGIN:
            return _ack(False, "DEMO_ACCOUNT_IDENTITY_CHANGED", intent)
        if EXPECTED_COMPANY and str(account.company).casefold() != EXPECTED_COMPANY.casefold():
            return _ack(False, "UNEXPECTED_BROKER_COMPANY_BLOCKED", intent)
        if EXPECTED_SERVER_PREFIX and not str(account.server).casefold().startswith(EXPECTED_SERVER_PREFIX.casefold()):
            return _ack(False, "UNEXPECTED_BROKER_SERVER_BLOCKED", intent)
        if getattr(account, "trade_allowed", False) is not True or getattr(account, "trade_expert", False) is not True:
            return _ack(False, "MT5_ALGO_TRADING_NOT_ALLOWED", intent)

        existing_positions = mt5.positions_get()
        if existing_positions is None:
            return _ack(False, "BROKER_POSITION_QUERY_FAILED", intent)
        if len(existing_positions) != 0:
            return _ack(False, "CANARY_REQUIRES_ZERO_OPEN_POSITIONS", intent)

        symbol = str(intent["symbol"])
        side = str(intent["side"])
        volume = float(intent["volume"])
        stop_price = float(intent["stopPrice"])
        target_price = float(intent["targetPrice"])
        info = mt5.symbol_info(symbol)
        if info is None:
            return _ack(False, "APPROVED_BROKER_SYMBOL_UNAVAILABLE", intent)
        if not info.visible and not mt5.symbol_select(symbol, True):
            return _ack(False, "APPROVED_BROKER_SYMBOL_NOT_SELECTABLE", intent)
        info = mt5.symbol_info(symbol)
        tick = mt5.symbol_info_tick(symbol)
        if info is None or tick is None or info.trade_mode != mt5.SYMBOL_TRADE_MODE_FULL:
            return _ack(False, "BROKER_SYMBOL_NOT_TRADEABLE", intent)
        if not math.isclose(volume, float(info.volume_min), rel_tol=0, abs_tol=1e-9):
            return _ack(False, "CANARY_MUST_EQUAL_BROKER_MINIMUM_VOLUME", intent)
        if not math.isclose(volume / float(info.volume_step), round(volume / float(info.volume_step)), rel_tol=0, abs_tol=1e-7):
            return _ack(False, "BROKER_VOLUME_STEP_FAILED", intent)

        order_type = mt5.ORDER_TYPE_BUY if side == "BUY" else mt5.ORDER_TYPE_SELL
        price = float(tick.ask if side == "BUY" else tick.bid)
        geometry_valid = stop_price < price < target_price if side == "BUY" else target_price < price < stop_price
        if not geometry_valid:
            return _ack(False, "INVALID_PROTECTIVE_GEOMETRY", intent)
        minimum_distance = float(info.trade_stops_level) * float(info.point)
        if minimum_distance > 0 and (abs(price - stop_price) < minimum_distance or abs(target_price - price) < minimum_distance):
            return _ack(False, "BROKER_STOP_DISTANCE_RULE_FAILED", intent)

        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": volume,
            "type": order_type,
            "price": price,
            "sl": stop_price,
            "tp": target_price,
            "deviation": 10,
            "magic": MAGIC,
            "comment": COMMENT,
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": _select_filling_mode(info),
        }
        check = mt5.order_check(request)
        if check is None or int(check.retcode) != 0:
            return _ack(False, "FINAL_BROKER_ORDER_CHECK_REJECTED", intent, brokerRetcode=None if check is None else int(check.retcode))

        # Exactly one execution primitive is permitted. Never retry an ambiguous result.
        result = mt5.order_send(request)
        if result is None:
            return _ack(False, "BROKER_ORDER_RESULT_AMBIGUOUS_LOCKED", intent, executionAttempted=True)
        retcode = int(result.retcode)
        if retcode != int(mt5.TRADE_RETCODE_DONE):
            return _ack(
                False,
                "BROKER_ORDER_REJECTED_NO_RETRY",
                intent,
                executionAttempted=True,
                brokerRetcode=retcode,
                brokerComment=str(result.comment)[:160],
            )

        position = None
        for _ in range(10):
            candidates = mt5.positions_get(symbol=symbol)
            if candidates is not None:
                position = next(
                    (
                        item for item in candidates
                        if int(item.magic) == MAGIC
                        and str(getattr(item, "comment", "")) == COMMENT
                        and math.isclose(float(item.volume), volume, rel_tol=0, abs_tol=1e-9)
                    ),
                    None,
                )
            if position is not None:
                break
            time.sleep(0.2)
        if position is None:
            return _ack(
                False,
                "FILLED_ORDER_NOT_RECONCILED_LOCKED",
                intent,
                executionAttempted=True,
                accepted=True,
                brokerRetcode=retcode,
                brokerOrder=str(result.order),
                brokerDeal=str(result.deal),
            )

        expected_type = mt5.POSITION_TYPE_BUY if side == "BUY" else mt5.POSITION_TYPE_SELL
        point = float(info.point)
        protected = int(position.type) == int(expected_type) and _same_price(position.sl, stop_price, point) and _same_price(position.tp, target_price, point)
        if not protected:
            return _ack(
                False,
                "POSITION_PROTECTION_RECONCILIATION_FAILED_LOCKED",
                intent,
                executionAttempted=True,
                accepted=True,
                ticket=str(position.ticket),
                brokerRetcode=retcode,
            )
        return _ack(
            True,
            "XM_DEMO_CANARY_ACCEPTED_AND_RECONCILED",
            intent,
            executionAttempted=True,
            accepted=True,
            ticket=str(position.ticket),
            acceptedPrice=float(position.price_open),
            symbol=symbol,
            side=side,
            volume=volume,
            stopPrice=stop_price,
            targetPrice=target_price,
            magic=MAGIC,
            brokerRetcode=retcode,
            brokerOrder=str(result.order),
            brokerDeal=str(result.deal),
            reconciliation={"positionObserved": True, "protectionObserved": True},
        )
    finally:
        mt5.shutdown()


def main() -> int:
    if "--self-test" in sys.argv:
        valid = {
            "schemaVersion": REQUEST_SCHEMA,
            "policy": EXPECTED_POLICY,
            "source": REQUEST_SOURCE,
            "mode": "DEMO",
            "liveEligible": False,
            "assetId": "XAU/USD",
            "symbol": "GOLD",
            "side": "BUY",
            "volume": CANARY_VOLUME,
            "stopPrice": 100.0,
            "targetPrice": 110.0,
            "magic": MAGIC,
            "nonce": "a" * 32,
            "intentId": "MT5D:CYBERDECK:SELFTEST:" + "a" * 32,
            "expiresAtMs": time.time() * 1000 + 5000,
        }
        accepted, accepted_error = _validate_intent(valid)
        oversized = dict(valid, volume=0.02)
        wrong_mode = dict(valid, mode="LIVE")
        passed = accepted is not None and accepted_error is None and _validate_intent(oversized)[0] is None and _validate_intent(wrong_mode)[0] is None
        print("MT5 Demo canary executor self-test passed." if passed else "MT5 Demo canary executor self-test failed.")
        return 0 if passed else 1
    raw = sys.stdin.buffer.read(MAX_INPUT_BYTES + 1)
    if len(raw) > MAX_INPUT_BYTES:
        print(json.dumps(_ack(False, "CANARY_INPUT_TOO_LARGE"), separators=(",", ":")))
        return 64
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        print(json.dumps(_ack(False, "INVALID_CANARY_JSON"), separators=(",", ":")))
        return 65
    result = execute_canary(payload)
    print(json.dumps(result, separators=(",", ":")))
    return 0 if result.get("success") else 1


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""One-shot XM MT5 Demo order preflight for CyberDeck.

This process performs broker-side calculations and an order check only. It has
no execution primitive, never receives a password, and refuses non-Demo
accounts, unapproved symbols, oversized volume, or missing protective prices.
"""

from __future__ import annotations

import json
import math
import os
import sys

try:
    import MetaTrader5 as mt5
except ImportError:
    mt5 = None


SCHEMA = "CYBERDECK_XM_DEMO_PREFLIGHT_V1"
TERMINAL_PATH = os.environ.get("CYBERDECK_MT5_TERMINAL_PATH", "").strip()
EXPECTED_COMPANY = os.environ.get("CYBERDECK_MT5_EXPECTED_COMPANY", "").strip()
EXPECTED_SERVER_PREFIX = os.environ.get("CYBERDECK_MT5_EXPECTED_SERVER_PREFIX", "").strip()
APPROVED_MARKETS = {
    "XAU/USD": "GOLD",
    "EUR/USD": "EURUSD",
    "GBP/USD": "GBPUSD",
    "USOIL": "OILCash",
}
MAX_INPUT_BYTES = 16 * 1024
MAX_VOLUME = 0.5
MAGIC = 99001


def _result(success: bool, reason: str, **values: object) -> dict[str, object]:
    return {
        "schemaVersion": SCHEMA,
        "mode": "DEMO_PREFLIGHT",
        "success": success,
        "reason": reason,
        "executionAttempted": False,
        "liveEligible": False,
        **values,
    }


def _finite(value: object, minimum: float, maximum: float) -> float | None:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return None
    return parsed if math.isfinite(parsed) and minimum <= parsed <= maximum else None


def _volume_aligned(volume: float, minimum: float, maximum: float, step: float) -> bool:
    if not minimum <= volume <= min(maximum, MAX_VOLUME) or step <= 0:
        return False
    units = round(volume / step)
    return math.isclose(volume, units * step, rel_tol=0, abs_tol=max(1e-9, step * 1e-7))


def _initialize() -> bool:
    if mt5 is None:
        return False
    if TERMINAL_PATH:
        return os.path.isfile(TERMINAL_PATH) and bool(mt5.initialize(TERMINAL_PATH))
    return bool(mt5.initialize())


def _select_filling_mode(info: object) -> int:
    # SYMBOL_FILLING_IOC is the flag value 2 while ORDER_FILLING_IOC is 1.
    if int(info.filling_mode) & 2:
        return mt5.ORDER_FILLING_IOC
    if int(info.filling_mode) & 1:
        return mt5.ORDER_FILLING_FOK
    return mt5.ORDER_FILLING_RETURN


def run_preflight(payload: object) -> dict[str, object]:
    if not isinstance(payload, dict):
        return _result(False, "INVALID_PREFLIGHT_INPUT")
    asset_id = payload.get("assetId")
    side = payload.get("side")
    broker_symbol = APPROVED_MARKETS.get(asset_id)
    if not broker_symbol or side not in ("BUY", "SELL"):
        return _result(False, "UNAPPROVED_MARKET_OR_SIDE")
    volume = _finite(payload.get("volume"), 0.00000001, MAX_VOLUME)
    stop_price = _finite(payload.get("stopPrice"), 0.00000001, 1e12)
    target_price = _finite(payload.get("targetPrice"), 0.00000001, 1e12)
    if volume is None or stop_price is None or target_price is None:
        return _result(False, "INVALID_PROTECTED_ORDER_VALUES")
    if not _initialize():
        return _result(False, "MT5_INITIALIZATION_FAILED")

    try:
        account = mt5.account_info()
        if account is None or account.trade_mode != mt5.ACCOUNT_TRADE_MODE_DEMO:
            return _result(False, "VERIFIED_DEMO_ACCOUNT_REQUIRED")
        if EXPECTED_COMPANY and str(account.company).casefold() != EXPECTED_COMPANY.casefold():
            return _result(False, "UNEXPECTED_BROKER_COMPANY_BLOCKED")
        if EXPECTED_SERVER_PREFIX and not str(account.server).casefold().startswith(EXPECTED_SERVER_PREFIX.casefold()):
            return _result(False, "UNEXPECTED_BROKER_SERVER_BLOCKED")

        info = mt5.symbol_info(broker_symbol)
        if info is None:
            return _result(False, "APPROVED_BROKER_SYMBOL_UNAVAILABLE")
        if not info.visible and not mt5.symbol_select(broker_symbol, True):
            return _result(False, "APPROVED_BROKER_SYMBOL_NOT_SELECTABLE")
        info = mt5.symbol_info(broker_symbol)
        tick = mt5.symbol_info_tick(broker_symbol)
        if info is None or tick is None or info.trade_mode != mt5.SYMBOL_TRADE_MODE_FULL:
            return _result(False, "BROKER_SYMBOL_NOT_TRADEABLE")
        if not _volume_aligned(volume, float(info.volume_min), float(info.volume_max), float(info.volume_step)):
            return _result(False, "BROKER_VOLUME_RULE_FAILED")

        order_type = mt5.ORDER_TYPE_BUY if side == "BUY" else mt5.ORDER_TYPE_SELL
        price = float(tick.ask if side == "BUY" else tick.bid)
        geometry_valid = stop_price < price < target_price if side == "BUY" else target_price < price < stop_price
        if not geometry_valid:
            return _result(False, "INVALID_PROTECTIVE_GEOMETRY")
        minimum_distance = float(info.trade_stops_level) * float(info.point)
        if minimum_distance > 0 and (abs(price - stop_price) < minimum_distance or abs(target_price - price) < minimum_distance):
            return _result(False, "BROKER_STOP_DISTANCE_RULE_FAILED")

        estimated_stop_result = mt5.order_calc_profit(order_type, broker_symbol, volume, price, stop_price)
        estimated_target_result = mt5.order_calc_profit(order_type, broker_symbol, volume, price, target_price)
        estimated_margin = mt5.order_calc_margin(order_type, broker_symbol, volume, price)
        if estimated_stop_result is None or estimated_target_result is None or estimated_margin is None:
            return _result(False, "BROKER_CALCULATION_UNAVAILABLE")
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": broker_symbol,
            "volume": volume,
            "type": order_type,
            "price": price,
            "sl": stop_price,
            "tp": target_price,
            "deviation": 10,
            "magic": MAGIC,
            "comment": "CYBERDECK_DEMO_PREFLIGHT",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": _select_filling_mode(info),
        }
        check = mt5.order_check(request)
        if check is None:
            return _result(False, "BROKER_ORDER_CHECK_UNAVAILABLE")
        approved = int(check.retcode) == 0
        return _result(
            True,
            "BROKER_PREFLIGHT_APPROVED" if approved else "BROKER_PREFLIGHT_REJECTED",
            preflightApproved=approved,
            assetId=asset_id,
            brokerSymbol=broker_symbol,
            side=side,
            volume=volume,
            referencePrice=price,
            stopPrice=stop_price,
            targetPrice=target_price,
            estimatedStopLoss=abs(float(estimated_stop_result)),
            estimatedTargetProfit=float(estimated_target_result),
            estimatedMargin=float(estimated_margin),
            brokerRetcode=int(check.retcode),
            brokerComment=str(check.comment)[:160],
            account={
                "loginSuffix": str(account.login)[-4:],
                "server": str(account.server),
                "tradeMode": "DEMO",
                "currency": str(account.currency),
                "equity": float(account.equity),
                "freeMargin": float(account.margin_free),
            },
            authority={
                "calculationOnly": True,
                "mayPlaceOrder": False,
                "liveEligible": False,
            },
        )
    finally:
        mt5.shutdown()


def main() -> int:
    if "--self-test" in sys.argv:
        aligned = _volume_aligned(0.1, 0.01, 50, 0.01)
        blocked = not _volume_aligned(0.105, 0.01, 50, 0.01) and not _volume_aligned(0.51, 0.01, 50, 0.01)
        print("MT5 Demo preflight self-test passed." if aligned and blocked else "MT5 Demo preflight self-test failed.")
        return 0 if aligned and blocked else 1
    raw = sys.stdin.buffer.read(MAX_INPUT_BYTES + 1)
    if len(raw) > MAX_INPUT_BYTES:
        print(json.dumps(_result(False, "PREFLIGHT_INPUT_TOO_LARGE"), separators=(",", ":")))
        return 64
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        print(json.dumps(_result(False, "INVALID_PREFLIGHT_JSON"), separators=(",", ":")))
        return 65
    result = run_preflight(payload)
    print(json.dumps(result, separators=(",", ":")))
    return 0 if result.get("success") else 1


if __name__ == "__main__":
    raise SystemExit(main())

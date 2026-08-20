export const BACKTEST_METHOD = 'BAR_CLOSE_SIGNAL_NEXT_BAR_OPEN_V1';

const roundMoney = value => Number(Number(value).toFixed(2));
const round = (value, digits = 8) => Number(Number(value).toFixed(digits));

function finitePositive(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function validateCandles(candles) {
  if (!Array.isArray(candles) || candles.length < 3) return false;
  let previousTime = -Infinity;
  return candles.every(candle => {
    const time = Number(candle?.time);
    const open = finitePositive(candle?.open);
    const high = finitePositive(candle?.high);
    const low = finitePositive(candle?.low);
    const close = finitePositive(candle?.close);
    const valid = Number.isFinite(time)
      && time > previousTime
      && open && high && low && close
      && high >= Math.max(open, close)
      && low <= Math.min(open, close)
      && high >= low;
    previousTime = time;
    return Boolean(valid);
  });
}

function normalizeDecision(rawDecision, referencePrice, minimumRiskReward) {
  if (!rawDecision || typeof rawDecision !== 'object') return { accepted: false, reason: 'NO_DECISION' };
  const action = String(rawDecision.action || rawDecision.side || '').toUpperCase();
  const side = action.includes('BUY') || action === 'LONG'
    ? 'LONG'
    : action.includes('SELL') || action === 'SHORT'
      ? 'SHORT'
      : null;
  if (!side) return { accepted: false, reason: 'HOLD_OR_UNKNOWN_ACTION' };

  const stopPrice = finitePositive(rawDecision.stopPrice ?? rawDecision.sl);
  const targetPrice = finitePositive(rawDecision.targetPrice ?? rawDecision.tp ?? rawDecision.tp1);
  if (!stopPrice || !targetPrice) return { accepted: false, reason: 'INVALID_STOP_OR_TARGET' };
  const geometryValid = side === 'LONG'
    ? stopPrice < referencePrice && targetPrice > referencePrice
    : stopPrice > referencePrice && targetPrice < referencePrice;
  if (!geometryValid) return { accepted: false, reason: 'INVALID_ORDER_GEOMETRY' };

  const risk = Math.abs(referencePrice - stopPrice);
  const reward = Math.abs(targetPrice - referencePrice);
  const riskReward = reward / risk;
  if (!Number.isFinite(riskReward) || riskReward < minimumRiskReward) {
    return { accepted: false, reason: 'MINIMUM_RISK_REWARD_NOT_MET', riskReward: round(riskReward, 4) };
  }
  return {
    accepted: true,
    decision: {
      side,
      stopPrice,
      targetPrice,
      riskReward: round(riskReward, 4),
      reason: String(rawDecision.reason || rawDecision.rationale || ''),
      signalId: rawDecision.signalId ? String(rawDecision.signalId) : null
    }
  };
}

function freezeHistory(candles, endIndex) {
  return Object.freeze(candles.slice(0, endIndex + 1).map(candle => Object.freeze({ ...candle })));
}

export function runBarCloseBacktest(candles, signalFunction, options = {}) {
  const initialCapital = finitePositive(options.initialCapital) || 100000;
  const warmupCandles = Math.max(1, Math.floor(Number(options.warmupCandles) || 20));
  const riskPerTradePercent = Math.min(2, Math.max(0.1, Number(options.riskPerTradePercent) || 1));
  const maxDrawdownPercent = Math.min(50, Math.max(1, Number(options.maxDrawdownPercent) || 10));
  const feeBps = Math.min(100, Math.max(0, Number(options.feeBps) || 0));
  const slippageBps = Math.min(100, Math.max(0, Number(options.slippageBps) || 0));
  const maximumLeverage = Math.min(20, Math.max(1, Number(options.maximumLeverage) || 1));
  const minimumRiskReward = Math.max(0.1, Number(options.minimumRiskReward) || 1);
  const maxTrades = Math.min(10000, Math.max(1, Math.floor(Number(options.maxTrades) || 1000)));
  const audit = [];
  const trades = [];
  let sequence = 0;
  const record = (event, candleIndex, details = {}) => {
    audit.push(Object.freeze({ sequence: ++sequence, event, candleIndex, candleTime: candles?.[candleIndex]?.time ?? null, details: Object.freeze({ ...details }) }));
  };

  if (!validateCandles(candles) || typeof signalFunction !== 'function') {
    return Object.freeze({
      method: BACKTEST_METHOD,
      status: 'INVALID_INPUT_FAIL_CLOSED',
      lookaheadSafe: true,
      trades: Object.freeze([]),
      audit: Object.freeze([]),
      metrics: null
    });
  }

  let balance = initialCapital;
  let peakEquity = initialCapital;
  let maximumDrawdownSeen = 0;
  let position = null;
  let pendingDecision = null;
  let status = 'COMPLETED';

  const adversePrice = (price, side, isEntry) => {
    const fraction = slippageBps / 10000;
    const direction = side === 'LONG'
      ? (isEntry ? 1 : -1)
      : (isEntry ? -1 : 1);
    return price * (1 + direction * fraction);
  };

  const closePosition = (rawExitPrice, candleIndex, exitReason) => {
    const exitPrice = adversePrice(rawExitPrice, position.side, false);
    const priceDifference = position.side === 'LONG'
      ? exitPrice - position.entryPrice
      : position.entryPrice - exitPrice;
    const grossPnl = priceDifference * position.quantity;
    const exitFee = Math.abs(exitPrice * position.quantity) * (feeBps / 10000);
    const netPnl = grossPnl - position.entryFee - exitFee;
    balance += grossPnl - exitFee;
    const trade = Object.freeze({
      ...position,
      exitIndex: candleIndex,
      exitTime: candles[candleIndex].time,
      exitPrice: round(exitPrice),
      exitReason,
      grossPnl: roundMoney(grossPnl),
      fees: roundMoney(position.entryFee + exitFee),
      netPnl: roundMoney(netPnl),
      balanceAfter: roundMoney(balance)
    });
    trades.push(trade);
    record('POSITION_CLOSED', candleIndex, { tradeNumber: trades.length, side: trade.side, reason: exitReason, netPnl: trade.netPnl });
    position = null;
  };

  for (let index = 0; index < candles.length; index += 1) {
    const candle = candles[index];

    if (pendingDecision && !position) {
      const entryPrice = adversePrice(candle.open, pendingDecision.side, true);
      const geometryValid = pendingDecision.side === 'LONG'
        ? pendingDecision.stopPrice < entryPrice && pendingDecision.targetPrice > entryPrice
        : pendingDecision.stopPrice > entryPrice && pendingDecision.targetPrice < entryPrice;
      if (!geometryValid) {
        record('ENTRY_REJECTED_GAP_GEOMETRY', index, { signalIndex: pendingDecision.signalIndex });
      } else {
        const equityBeforeEntry = balance;
        const riskBudget = equityBeforeEntry * (riskPerTradePercent / 100);
        const unitRisk = Math.abs(entryPrice - pendingDecision.stopPrice);
        const riskQuantity = riskBudget / unitRisk;
        const leverageQuantityCap = (equityBeforeEntry * maximumLeverage) / entryPrice;
        const quantity = Math.min(riskQuantity, leverageQuantityCap);
        const entryFee = Math.abs(entryPrice * quantity) * (feeBps / 10000);
        if (quantity > 0 && entryFee < balance) {
          balance -= entryFee;
          position = {
            side: pendingDecision.side,
            signalIndex: pendingDecision.signalIndex,
            signalTime: candles[pendingDecision.signalIndex].time,
            entryIndex: index,
            entryTime: candle.time,
            entryPrice: round(entryPrice),
            stopPrice: pendingDecision.stopPrice,
            targetPrice: pendingDecision.targetPrice,
            quantity: round(quantity),
            riskBudget: roundMoney(riskBudget),
            entryFee: roundMoney(entryFee),
            riskReward: pendingDecision.riskReward,
            signalId: pendingDecision.signalId,
            reason: pendingDecision.reason
          };
          record('POSITION_OPENED_NEXT_BAR', index, { signalIndex: position.signalIndex, side: position.side, entryPrice: position.entryPrice, quantity: position.quantity });
        } else {
          record('ENTRY_REJECTED_CAPITAL', index, { signalIndex: pendingDecision.signalIndex });
        }
      }
      pendingDecision = null;
    }

    if (position) {
      const stopHit = position.side === 'LONG' ? candle.low <= position.stopPrice : candle.high >= position.stopPrice;
      const targetHit = position.side === 'LONG' ? candle.high >= position.targetPrice : candle.low <= position.targetPrice;
      if (stopHit && targetHit) {
        closePosition(position.stopPrice, index, 'STOP_AND_TARGET_SAME_BAR_CONSERVATIVE_STOP');
      } else if (stopHit) {
        const gapStopPrice = position.side === 'LONG'
          ? Math.min(candle.open, position.stopPrice)
          : Math.max(candle.open, position.stopPrice);
        closePosition(gapStopPrice, index, 'STOP_LOSS');
      } else if (targetHit) {
        closePosition(position.targetPrice, index, 'TAKE_PROFIT');
      }
    }

    const markedPnl = position
      ? (position.side === 'LONG' ? candle.close - position.entryPrice : position.entryPrice - candle.close) * position.quantity
      : 0;
    const estimatedExitFee = position ? Math.abs(candle.close * position.quantity) * (feeBps / 10000) : 0;
    const markedEquity = balance + markedPnl - estimatedExitFee;
    peakEquity = Math.max(peakEquity, markedEquity);
    const drawdown = peakEquity > 0 ? ((peakEquity - markedEquity) / peakEquity) * 100 : 100;
    maximumDrawdownSeen = Math.max(maximumDrawdownSeen, drawdown);

    if (drawdown >= maxDrawdownPercent) {
      if (position) closePosition(candle.close, index, 'MAX_DRAWDOWN_RISK_GATE');
      record('BACKTEST_HALTED_MAX_DRAWDOWN', index, { drawdownPercent: round(drawdown, 4), limitPercent: maxDrawdownPercent });
      status = 'HALTED_MAX_DRAWDOWN';
      break;
    }
    if (trades.length >= maxTrades) {
      record('BACKTEST_HALTED_MAX_TRADES', index, { maxTrades });
      status = 'HALTED_MAX_TRADES';
      break;
    }

    if (!position && !pendingDecision && index >= warmupCandles - 1 && index < candles.length - 1) {
      try {
        const rawDecision = signalFunction(freezeHistory(candles, index), Object.freeze({ index, balance: roundMoney(balance) }));
        const normalized = normalizeDecision(rawDecision, candle.close, minimumRiskReward);
        if (normalized.accepted) {
          pendingDecision = { ...normalized.decision, signalIndex: index };
          record('SIGNAL_ACCEPTED_FOR_NEXT_BAR', index, { side: pendingDecision.side, riskReward: pendingDecision.riskReward });
        } else if (normalized.reason !== 'NO_DECISION' && normalized.reason !== 'HOLD_OR_UNKNOWN_ACTION') {
          record('SIGNAL_REJECTED', index, { reason: normalized.reason, riskReward: normalized.riskReward ?? null });
        }
      } catch (error) {
        record('SIGNAL_FUNCTION_ERROR_FAIL_CLOSED', index, { error: String(error?.message || error) });
      }
    }
  }

  if (position && status === 'COMPLETED') {
    closePosition(candles.at(-1).close, candles.length - 1, 'END_OF_DATA');
  }

  const wins = trades.filter(trade => trade.netPnl > 0);
  const losses = trades.filter(trade => trade.netPnl < 0);
  const grossProfit = wins.reduce((sum, trade) => sum + trade.netPnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + trade.netPnl, 0));
  const netPnl = balance - initialCapital;
  const metrics = Object.freeze({
    initialCapital: roundMoney(initialCapital),
    finalCapital: roundMoney(balance),
    netPnl: roundMoney(netPnl),
    returnPercent: round((netPnl / initialCapital) * 100, 4),
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRatePercent: trades.length ? round((wins.length / trades.length) * 100, 2) : 0,
    profitFactor: grossLoss > 0 ? round(grossProfit / grossLoss, 4) : grossProfit > 0 ? null : 0,
    maximumDrawdownPercent: round(maximumDrawdownSeen, 4),
    feesPaid: roundMoney(trades.reduce((sum, trade) => sum + trade.fees, 0))
  });

  return Object.freeze({
    method: BACKTEST_METHOD,
    status,
    lookaheadSafe: true,
    executionAssumptions: Object.freeze({
      signalAt: 'BAR_CLOSE',
      entryAt: 'NEXT_BAR_OPEN',
      sameBarStopTarget: 'STOP_FIRST_CONSERVATIVE',
      feeBps,
      slippageBps,
      riskPerTradePercent,
      maxDrawdownPercent,
      maximumLeverage
    }),
    trades: Object.freeze(trades),
    audit: Object.freeze(audit),
    metrics
  });
}

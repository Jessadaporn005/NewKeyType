export const PAPER_ACCOUNT_MODEL = 'BALANCE_MARGIN_SEPARATE_V1';

const roundMoney = value => Number(Number(value).toFixed(2));

function positiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function normalizeRiskPercent(value, fallback = 2) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Number(Math.min(5, Math.max(0.1, parsed)).toFixed(2));
}

export function createPaperPosition({ id, assetId, side, entryPrice, marginUSD, leverage, openedAt, spreadAtOpen, sl = null, tp = null }) {
  const safeEntry = positiveNumber(entryPrice);
  const safeMargin = positiveNumber(marginUSD);
  const safeLeverage = positiveNumber(leverage);
  const normalizedSide = String(side || '').toUpperCase();
  if (!id || !assetId || !safeEntry || !safeMargin || !safeLeverage || !['LONG', 'SHORT'].includes(normalizedSide)) {
    return null;
  }

  const notionalUSD = safeMargin * safeLeverage;
  return {
    id: String(id),
    assetId: String(assetId),
    side: normalizedSide,
    entryPrice: safeEntry,
    currentPrice: safeEntry,
    amountUSD: roundMoney(safeMargin),
    marginUSD: roundMoney(safeMargin),
    leverage: safeLeverage,
    notionalUSD: roundMoney(notionalUSD),
    size: notionalUSD / safeEntry,
    pnlUSD: 0,
    pnlPercent: 0,
    openTime: openedAt || new Date().toISOString(),
    spreadAtOpen: spreadAtOpen || null,
    sl,
    tp,
    accountModel: PAPER_ACCOUNT_MODEL
  };
}

export function markPaperPosition(position, exitPrice) {
  const safeExit = positiveNumber(exitPrice);
  const entryPrice = positiveNumber(position?.entryPrice);
  const marginUSD = positiveNumber(position?.marginUSD ?? position?.amountUSD);
  const leverage = positiveNumber(position?.leverage);
  if (!position || !safeExit || !entryPrice || !marginUSD || !leverage || !['LONG', 'SHORT'].includes(position.side)) {
    return null;
  }

  const notionalUSD = positiveNumber(position.notionalUSD) || marginUSD * leverage;
  const priceDifference = position.side === 'LONG' ? safeExit - entryPrice : entryPrice - safeExit;
  const pnlUSD = (priceDifference / entryPrice) * notionalUSD;
  return {
    ...position,
    currentPrice: safeExit,
    marginUSD: roundMoney(marginUSD),
    amountUSD: roundMoney(marginUSD),
    notionalUSD: roundMoney(notionalUSD),
    pnlUSD: roundMoney(pnlUSD),
    pnlPercent: Number(((pnlUSD / marginUSD) * 100).toFixed(2)),
    accountModel: PAPER_ACCOUNT_MODEL
  };
}

export function restorePaperPosition(rawPosition) {
  if (!rawPosition || typeof rawPosition !== 'object' || Array.isArray(rawPosition)) return null;
  const leverage = positiveNumber(rawPosition.leverage);
  if (!leverage || leverage > 500) return null;
  const stop = positiveNumber(rawPosition.sl);
  const target = positiveNumber(rawPosition.tp);
  const entry = positiveNumber(rawPosition.entryPrice);
  const side = String(rawPosition.side || '').toUpperCase();
  const protectiveGeometryValid = side === 'LONG'
    ? stop && target && stop < entry && target > entry
    : side === 'SHORT'
      ? stop && target && stop > entry && target < entry
      : false;
  if (!protectiveGeometryValid) return null;
  const basePosition = createPaperPosition({
    id: rawPosition.id,
    assetId: rawPosition.assetId,
    side: rawPosition.side,
    entryPrice: rawPosition.entryPrice,
    marginUSD: rawPosition.marginUSD ?? rawPosition.amountUSD,
    leverage,
    openedAt: typeof rawPosition.openTime === 'string' ? rawPosition.openTime : null,
    spreadAtOpen: typeof rawPosition.spreadAtOpen === 'string' ? rawPosition.spreadAtOpen : null,
    sl: stop,
    tp: target
  });
  if (!basePosition) return null;
  const restored = markPaperPosition(basePosition, rawPosition.currentPrice || rawPosition.entryPrice);
  return restored ? {
    ...restored,
    executionSource: rawPosition.executionSource === 'RULE_AUTO_PAPER' ? 'RULE_AUTO_PAPER' : 'MANUAL_PAPER',
    decisionAuditId: typeof rawPosition.decisionAuditId === 'string' ? rawPosition.decisionAuditId.slice(0, 100) : null,
    protectiveOrderSource: typeof rawPosition.protectiveOrderSource === 'string'
      ? rawPosition.protectiveOrderSource
      : 'RESTORED_VALIDATED_ORDERS'
  } : null;
}

export function restorePaperTradeHistory(rawTrades, maxTrades = 100) {
  if (!Array.isArray(rawTrades)) return [];
  const restored = [];
  const seenIds = new Set();
  for (const rawTrade of rawTrades.slice(0, Math.max(0, maxTrades))) {
    const trade = restorePaperPosition(rawTrade);
    if (!trade || seenIds.has(trade.id)) continue;
    seenIds.add(trade.id);
    restored.push({
      ...trade,
      closeTime: typeof rawTrade.closeTime === 'string' ? rawTrade.closeTime : null,
      closedAt: Number.isFinite(Date.parse(rawTrade.closedAt)) ? new Date(Date.parse(rawTrade.closedAt)).toISOString() : null,
      exitReason: typeof rawTrade.exitReason === 'string' ? rawTrade.exitReason : 'RESTORED_TRADE'
    });
  }
  return restored;
}

export function deriveProtectiveOrders({ side, entryPrice, signal = null, spreadValue = 0, minimumRiskReward = 1.5 }) {
  const normalizedSide = String(side || '').toUpperCase();
  const entry = positiveNumber(entryPrice);
  if (!entry || !['LONG', 'SHORT'].includes(normalizedSide)) return null;
  const signalEntry = positiveNumber(signal?.entry) || entry;
  const signalStop = positiveNumber(signal?.sl);
  const signalTarget = positiveNumber(signal?.tp1 ?? signal?.tp);
  const signalRiskDistance = signalStop ? Math.abs(signalEntry - signalStop) : 0;
  const signalRewardDistance = signalTarget ? Math.abs(signalTarget - signalEntry) : 0;
  const riskDistance = Math.max(entry * 0.002, Math.abs(Number(spreadValue) || 0) * 3, signalRiskDistance);
  const rewardDistance = Math.max(riskDistance * Math.max(1.2, Number(minimumRiskReward) || 1.5), signalRewardDistance);
  const digits = Math.max(2, Math.min(8, Number(signal?.digits) || 8));
  const stopPrice = normalizedSide === 'LONG' ? entry - riskDistance : entry + riskDistance;
  const targetPrice = normalizedSide === 'LONG' ? entry + rewardDistance : entry - rewardDistance;
  if (targetPrice <= 0 || stopPrice <= 0) return null;
  return {
    stopPrice: Number(stopPrice.toFixed(digits)),
    targetPrice: Number(targetPrice.toFixed(digits)),
    riskRewardRatio: Number((rewardDistance / riskDistance).toFixed(4)),
    source: signalRiskDistance > 0 && signalRewardDistance > 0
      ? 'SIGNAL_DISTANCE_RULE_MIRRORED_TO_ORDER_SIDE'
      : 'FALLBACK_FIXED_DISTANCE_RULE'
  };
}

export function evaluatePaperOpenRisk({ balanceUSD, positions = [], requestedMarginUSD, maxPositions = 3, maxUsedMarginPercent = 50 }) {
  const account = summarizePaperAccount(balanceUSD, positions);
  const requestedMargin = positiveNumber(requestedMarginUSD);
  if (!requestedMargin) return { allowed: false, reason: 'INVALID_MARGIN_AMOUNT', account };
  if (positions.length >= Math.max(1, Number(maxPositions) || 3)) {
    return { allowed: false, reason: 'MAX_OPEN_POSITIONS', account };
  }
  if (requestedMargin > Math.max(0, account.freeMargin)) {
    return { allowed: false, reason: 'INSUFFICIENT_FREE_MARGIN', account };
  }
  const marginLimit = Math.max(0, account.equity) * (Math.min(100, Math.max(1, Number(maxUsedMarginPercent) || 50)) / 100);
  if (account.usedMargin + requestedMargin > marginLimit) {
    return { allowed: false, reason: 'MAX_USED_MARGIN_PERCENT', account, marginLimit: roundMoney(marginLimit) };
  }
  return { allowed: true, reason: 'RISK_GATE_CLEARED', account, marginLimit: roundMoney(marginLimit) };
}

export function evaluatePaperExit(position) {
  if (!position || !Number.isFinite(Number(position.currentPrice))) return null;
  const currentPrice = Number(position.currentPrice);
  const stopPrice = positiveNumber(position.sl);
  const targetPrice = positiveNumber(position.tp);
  const margin = positiveNumber(position.marginUSD ?? position.amountUSD);
  const pnl = Number(position.pnlUSD);
  if (margin && Number.isFinite(pnl) && pnl <= -margin) return 'LIQUIDATION_LOSS_LIMIT';
  if (position.side === 'LONG') {
    if (stopPrice && currentPrice <= stopPrice) return 'STOP_LOSS';
    if (targetPrice && currentPrice >= targetPrice) return 'TAKE_PROFIT';
  } else if (position.side === 'SHORT') {
    if (stopPrice && currentPrice >= stopPrice) return 'STOP_LOSS';
    if (targetPrice && currentPrice <= targetPrice) return 'TAKE_PROFIT';
  }
  return null;
}

export function restorePaperPositions(rawPositions, maxPositions = 50) {
  if (!Array.isArray(rawPositions)) return [];
  const restored = [];
  const seenIds = new Set();
  for (const rawPosition of rawPositions.slice(0, Math.max(0, maxPositions))) {
    const position = restorePaperPosition(rawPosition);
    if (!position || seenIds.has(position.id)) continue;
    seenIds.add(position.id);
    restored.push(position);
  }
  return restored;
}

export function summarizePaperAccount(balanceUSD, positions = []) {
  const balance = Math.max(0, Number.isFinite(Number(balanceUSD)) ? Number(balanceUSD) : 0);
  const validPositions = Array.isArray(positions) ? positions : [];
  const usedMargin = validPositions.reduce((sum, position) => {
    const margin = Number(position?.marginUSD ?? position?.amountUSD);
    return sum + (Number.isFinite(margin) && margin > 0 ? margin : 0);
  }, 0);
  const unrealizedPnL = validPositions.reduce((sum, position) => {
    const pnl = Number(position?.pnlUSD);
    return sum + (Number.isFinite(pnl) ? pnl : 0);
  }, 0);
  const equity = balance + unrealizedPnL;
  const freeMargin = equity - usedMargin;
  const marginLevel = usedMargin > 0 ? Number(((equity / usedMargin) * 100).toFixed(1)) : null;

  let marginStatus = 'NO OPEN MARGIN';
  if (marginLevel !== null && marginLevel < 120) marginStatus = 'MARGIN CALL RISK 🔴';
  else if (marginLevel !== null && marginLevel < 250) marginStatus = 'MODERATE 🟡';
  else if (marginLevel !== null) marginStatus = 'HEALTHY 🟢';

  return {
    accountModel: PAPER_ACCOUNT_MODEL,
    balance: roundMoney(balance),
    usedMargin: roundMoney(usedMargin),
    unrealizedPnL: roundMoney(unrealizedPnL),
    equity: roundMoney(equity),
    freeMargin: roundMoney(freeMargin),
    marginLevel,
    marginStatus
  };
}

export function settlePaperPosition(balanceUSD, position) {
  const balance = Math.max(0, Number.isFinite(Number(balanceUSD)) ? Number(balanceUSD) : 0);
  const pnl = Number(position?.pnlUSD);
  if (!position || !Number.isFinite(pnl)) return null;
  return roundMoney(Math.max(0, balance + pnl));
}

export function calculatePaperPositionSize({ asset, entryPrice, stopPrice, equityUSD, freeMarginUSD, riskPercent, leverage }) {
  const entry = positiveNumber(entryPrice);
  const stop = positiveNumber(stopPrice);
  const equity = positiveNumber(equityUSD);
  const availableMargin = Math.max(0, Number(freeMarginUSD) || 0);
  const maxAssetLeverage = positiveNumber(asset?.leverageMax) || 1;
  const effectiveLeverage = Math.min(positiveNumber(leverage) || 1, maxAssetLeverage);
  const normalizedRisk = normalizeRiskPercent(riskPercent);
  if (!asset || !entry || !stop || !equity || entry === stop) return null;

  const riskBudgetUSD = equity * (normalizedRisk / 100);
  const stopFraction = Math.abs(entry - stop) / entry;
  const requestedNotionalUSD = riskBudgetUSD / stopFraction;
  const maxNotionalByMargin = availableMargin * effectiveLeverage;
  const notionalUSD = Math.min(requestedNotionalUSD, maxNotionalByMargin);
  const requiredMarginUSD = notionalUSD / effectiveLeverage;
  const quantity = notionalUSD / entry;
  const actualRiskUSD = notionalUSD * stopFraction;
  const lotSize = positiveNumber(asset.lotSize);
  const sizeUnit = lotSize ? 'LOTS' : 'UNITS';
  const sizeValue = lotSize ? quantity / lotSize : quantity;

  return {
    riskPercent: normalizedRisk,
    riskBudgetUSD: roundMoney(riskBudgetUSD),
    actualRiskUSD: roundMoney(actualRiskUSD),
    entryPrice: entry,
    stopPrice: stop,
    stopDistance: Math.abs(entry - stop),
    effectiveLeverage,
    notionalUSD: roundMoney(notionalUSD),
    requiredMarginUSD: roundMoney(requiredMarginUSD),
    quantity: Number(quantity.toFixed(8)),
    sizeUnit,
    sizeValue: Number(sizeValue.toFixed(lotSize ? 4 : 8)),
    limitedByMargin: requestedNotionalUSD > maxNotionalByMargin
  };
}

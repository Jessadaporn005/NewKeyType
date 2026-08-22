export const VERIFIED_PAPER_BOT_SCHEMA = 'VERIFIED_PAPER_BOT_V1';
export const VERIFIED_PAPER_BOT_POLICY = 'CLOSED_BAR_RULE_BOT_PAPER_ONLY_V1';

const ACTION_SIDE = Object.freeze({ BUY: 'LONG', 'STRONG BUY': 'LONG', SELL: 'SHORT', 'STRONG SELL': 'SHORT' });

function finite(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function dayKey(timestamp) {
  const parsed = finite(timestamp);
  return parsed === null ? null : new Date(parsed).toISOString().slice(0, 10);
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function initialState(balanceUSD = 0, now = Date.now()) {
  const balance = Math.max(0, finite(balanceUSD) || 0);
  return {
    schemaVersion: VERIFIED_PAPER_BOT_SCHEMA,
    policy: VERIFIED_PAPER_BOT_POLICY,
    enabled: false,
    killSwitch: false,
    dayKey: dayKey(now),
    dayStartBalanceUSD: balance,
    peakEquityUSD: balance,
    lastEvaluatedCandleTime: null,
    lastExecutedCandleTime: null,
    lastDecision: null,
    decisionLog: []
  };
}

export function createVerifiedPaperBotState(balanceUSD = 0, now = Date.now()) {
  return deepFreeze(initialState(balanceUSD, now));
}

export function restoreVerifiedPaperBotState(value, { balanceUSD = 0, now = Date.now() } = {}) {
  if (!value || value.schemaVersion !== VERIFIED_PAPER_BOT_SCHEMA || value.policy !== VERIFIED_PAPER_BOT_POLICY) {
    return createVerifiedPaperBotState(balanceUSD, now);
  }
  const currentDay = dayKey(now);
  const persistedDay = typeof value.dayKey === 'string' ? value.dayKey : null;
  const safeBalance = Math.max(0, finite(balanceUSD) || 0);
  const sameDay = persistedDay === currentDay;
  const decisionLog = Array.isArray(value.decisionLog)
    ? value.decisionLog.slice(0, 100).filter(item => item?.schemaVersion === VERIFIED_PAPER_BOT_SCHEMA
      && item?.policy === VERIFIED_PAPER_BOT_POLICY && typeof item?.decisionId === 'string')
    : [];
  return deepFreeze({
    schemaVersion: VERIFIED_PAPER_BOT_SCHEMA,
    policy: VERIFIED_PAPER_BOT_POLICY,
    enabled: value.enabled === true,
    killSwitch: value.killSwitch === true,
    dayKey: currentDay,
    dayStartBalanceUSD: sameDay ? Math.max(0, finite(value.dayStartBalanceUSD) ?? safeBalance) : safeBalance,
    peakEquityUSD: Math.max(safeBalance, sameDay ? finite(value.peakEquityUSD) ?? safeBalance : safeBalance),
    lastEvaluatedCandleTime: finite(value.lastEvaluatedCandleTime),
    lastExecutedCandleTime: finite(value.lastExecutedCandleTime),
    lastDecision: decisionLog[0] || null,
    decisionLog: Object.freeze(decisionLog)
  });
}

export function setVerifiedPaperBotEnabled(state, enabled, { balanceUSD = 0, now = Date.now() } = {}) {
  const restored = restoreVerifiedPaperBotState(state, { balanceUSD, now });
  return deepFreeze({ ...restored, enabled: enabled === true && restored.killSwitch !== true });
}

export function armVerifiedPaperBotKillSwitch(state, { balanceUSD = 0, now = Date.now() } = {}) {
  const restored = restoreVerifiedPaperBotState(state, { balanceUSD, now });
  return deepFreeze({ ...restored, enabled: false, killSwitch: true });
}

export function resetVerifiedPaperBotKillSwitch(state, { balanceUSD = 0, now = Date.now() } = {}) {
  const restored = restoreVerifiedPaperBotState(state, { balanceUSD, now });
  return deepFreeze({ ...restored, enabled: false, killSwitch: false });
}

function resolveResearch(patterns, dataset) {
  if (!dataset?.success || dataset?.provenance?.verified !== true || dataset?.provenance?.simulation === true) {
    return Object.freeze({ tier: 'EXPLORATORY_PAPER', validated: false, reason: 'NO_VERIFIED_FORWARD_OUTCOMES', riskPercent: 0.25 });
  }
  const rows = Array.isArray(dataset.summary?.byPattern) ? dataset.summary.byPattern : [];
  const alignedTypes = new Set(patterns.map(pattern => pattern.type));
  const supported = rows.filter(row => alignedTypes.has(row.key)
    && row.descriptiveSampleThresholdMet === true
    && finite(row.expectancyR) !== null
    && Number(row.expectancyR) > 0);
  return supported.length > 0
    ? Object.freeze({ tier: 'FORWARD_EVIDENCE_PAPER', validated: true, reason: 'POSITIVE_FORWARD_PATTERN_EVIDENCE', riskPercent: 0.5 })
    : Object.freeze({ tier: 'EXPLORATORY_PAPER', validated: false, reason: 'PATTERN_FORWARD_GATE_NOT_PASSED', riskPercent: 0.25 });
}

function reject(reason, details = {}) {
  return deepFreeze({
    success: true,
    execute: false,
    reason,
    decision: null,
    details,
    decisionEligible: false,
    executionMode: 'PAPER_ONLY'
  });
}

export function evaluateVerifiedPaperBotDecision({
  state,
  marketPacket,
  marketDecision,
  signal,
  positions = [],
  paperAccount,
  patternResearch = null,
  aiReaderReport = null,
  maxDailyLossPercent = 2,
  maxDrawdownPercent = 4,
  minimumRuleScore = 68,
  now = Date.now()
} = {}) {
  const balance = Math.max(0, finite(paperAccount?.balance) || 0);
  const equity = finite(paperAccount?.equity);
  const restored = restoreVerifiedPaperBotState(state, { balanceUSD: balance, now });
  if (!restored.enabled) return reject(restored.killSwitch ? 'KILL_SWITCH_ARMED' : 'BOT_DISABLED');
  if (equity === null || equity <= 0) return reject('INVALID_PAPER_ACCOUNT');
  if (!marketPacket || marketPacket.provenance?.verified !== true || marketPacket.provenance?.simulation === true
    || marketDecision?.eligible !== true) return reject('VERIFIED_MARKET_DECISION_REQUIRED');
  const closedCandle = Array.isArray(marketPacket.decisionCandles) ? marketPacket.decisionCandles.at(-1) : null;
  const candleTime = finite(closedCandle?.openTimeMs ?? (finite(closedCandle?.time) === null ? null : Number(closedCandle.time) * 1000));
  if (candleTime === null || closedCandle?.barClosed === false) return reject('CLOSED_DECISION_CANDLE_REQUIRED');
  if (restored.lastEvaluatedCandleTime === candleTime) return reject('CANDLE_ALREADY_EVALUATED', { candleTime });

  const peakEquityUSD = Math.max(restored.peakEquityUSD, equity);
  const dailyLossPercent = restored.dayStartBalanceUSD > 0
    ? Math.max(0, ((restored.dayStartBalanceUSD - equity) / restored.dayStartBalanceUSD) * 100)
    : 0;
  const drawdownPercent = peakEquityUSD > 0 ? Math.max(0, ((peakEquityUSD - equity) / peakEquityUSD) * 100) : 0;
  if (dailyLossPercent >= Math.max(0.1, Number(maxDailyLossPercent) || 2)) {
    return reject('MAX_DAILY_LOSS_REACHED', { dailyLossPercent, drawdownPercent, candleTime });
  }
  if (drawdownPercent >= Math.max(0.1, Number(maxDrawdownPercent) || 4)) {
    return reject('MAX_DRAWDOWN_REACHED', { dailyLossPercent, drawdownPercent, candleTime });
  }

  const action = String(signal?.action || '').toUpperCase();
  const side = ACTION_SIDE[action] || null;
  if (!side || signal?.isExplorationProbe === true) return reject('QUALIFIED_BUY_OR_SELL_SIGNAL_REQUIRED', { action, candleTime });
  const ruleScore = finite(signal?.ruleScore);
  if (ruleScore === null || ruleScore < Math.max(50, Number(minimumRuleScore) || 68)) {
    return reject('MINIMUM_RULE_SCORE_NOT_MET', { ruleScore, candleTime });
  }
  if (signal?.regime?.decisionEligible !== true) return reject('REGIME_EVIDENCE_NOT_ELIGIBLE', { candleTime });
  const expectedSentiment = side === 'LONG' ? 'BULLISH' : 'BEARISH';
  const patterns = (Array.isArray(signal?.patternEvidence) ? signal.patternEvidence : [])
    .filter(pattern => pattern?.confirmed === true && pattern?.decisionEligible === true
      && String(pattern.sentiment).toUpperCase() === expectedSentiment);
  if (patterns.length < 1) return reject('ALIGNED_CONFIRMED_PATTERN_REQUIRED', { expectedSentiment, candleTime });
  if (positions.some(position => position?.assetId === marketPacket.symbol)) {
    return reject('ONE_POSITION_PER_ASSET', { candleTime });
  }
  if (positions.length >= 2) return reject('VERIFIED_BOT_MAX_POSITIONS', { candleTime });
  const entry = finite(signal?.entry);
  const stop = finite(signal?.sl);
  const target = finite(signal?.tp1);
  const geometryValid = side === 'LONG'
    ? entry !== null && stop !== null && target !== null && stop < entry && target > entry
    : entry !== null && stop !== null && target !== null && stop > entry && target < entry;
  if (!geometryValid) return reject('INVALID_PROTECTIVE_GEOMETRY', { candleTime });
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  const riskRewardRatio = risk > 0 ? reward / risk : 0;
  if (riskRewardRatio < 1.5) return reject('MINIMUM_RISK_REWARD_NOT_MET', { riskRewardRatio, candleTime });

  const research = resolveResearch(patterns, patternResearch);
  const decisionId = `VPB:${marketPacket.symbol}:${marketPacket.timeframe}:${candleTime}:${side}`;
  const decision = deepFreeze({
    schemaVersion: VERIFIED_PAPER_BOT_SCHEMA,
    policy: VERIFIED_PAPER_BOT_POLICY,
    decisionId,
    decidedAt: new Date(Number(now)).toISOString(),
    executionMode: 'PAPER_ONLY',
    action,
    side,
    assetId: marketPacket.symbol,
    timeframe: marketPacket.timeframe,
    packetSequence: marketPacket.sequence,
    candleTime,
    ruleScore,
    riskRewardRatio: Number(riskRewardRatio.toFixed(4)),
    patternEvidenceIds: Object.freeze(patterns.map(pattern => pattern.id).slice(0, 12)),
    research,
    requestedRiskPercent: research.riskPercent,
    accountRisk: Object.freeze({
      dayStartBalanceUSD: restored.dayStartBalanceUSD,
      equityUSD: equity,
      peakEquityUSD,
      dailyLossPercent: Number(dailyLossPercent.toFixed(4)),
      drawdownPercent: Number(drawdownPercent.toFixed(4))
    }),
    aiReader: Object.freeze({
      reportId: typeof aiReaderReport?.reportId === 'string' ? aiReaderReport.reportId : null,
      stance: typeof aiReaderReport?.stance === 'string' ? aiReaderReport.stance : null,
      influence: false
    }),
    authority: Object.freeze({ decisionEligible: true, executionEligible: true, paperOnly: true, liveEligible: false })
  });
  return deepFreeze({ success: true, execute: true, reason: 'VERIFIED_PAPER_DECISION_ACCEPTED', decision, decisionEligible: true, executionMode: 'PAPER_ONLY' });
}

export function recordVerifiedPaperBotDecision(state, result, { executed = false, balanceUSD = 0, equityUSD = null, now = Date.now() } = {}) {
  const restored = restoreVerifiedPaperBotState(state, { balanceUSD, now });
  const decision = result?.decision;
  if (!decision || decision.schemaVersion !== VERIFIED_PAPER_BOT_SCHEMA || decision.policy !== VERIFIED_PAPER_BOT_POLICY) {
    const evaluatedCandleTime = finite(result?.details?.candleTime);
    if (evaluatedCandleTime === null) return restored;
    return deepFreeze({ ...restored, lastEvaluatedCandleTime: evaluatedCandleTime });
  }
  const record = deepFreeze({ ...decision, executed: executed === true });
  const log = [record, ...restored.decisionLog.filter(item => item.decisionId !== record.decisionId)].slice(0, 100);
  const equity = finite(equityUSD);
  return deepFreeze({
    ...restored,
    peakEquityUSD: Math.max(restored.peakEquityUSD, equity ?? restored.peakEquityUSD),
    lastEvaluatedCandleTime: decision.candleTime,
    lastExecutedCandleTime: executed ? decision.candleTime : restored.lastExecutedCandleTime,
    lastDecision: record,
    decisionLog: Object.freeze(log)
  });
}

import { detectEvidenceBasedMarketRegime } from './marketRegime.js';
import { PATTERN_EVIDENCE_SCHEMA, detectConfirmedChartPatterns } from './patternEvidence.js';

export const PATTERN_RESEARCH_DATASET_SCHEMA = 1;
export const PATTERN_RESEARCH_SAMPLE_SCHEMA = 'PATTERN_OUTCOME_SAMPLE_V1';
export const PATTERN_RESEARCH_METHOD = 'CONFIRM_CLOSE_NEXT_OPEN_FIRST_BARRIER_CONSERVATIVE_V1';
export const PATTERN_RESEARCH_STAGE = 'RESEARCH_SHADOW_ZERO_TRADE_INFLUENCE';

const SAMPLE_STATUSES = new Set(['COMPLETED', 'PENDING', 'REJECTED']);
const VERIFIED_RESEARCH_SOURCES = new Set(['BINANCE_KLINES_REST']);
const DEFAULT_MAX_SAMPLES = 250;

function finite(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function round(value, digits = 8) {
  return Number(Number(value).toFixed(digits));
}

function shortText(value, maximumLength = 160) {
  return typeof value === 'string' ? value.slice(0, maximumLength) : '';
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function candleOpenTimeMs(candle) {
  const explicit = finite(candle?.openTimeMs);
  if (explicit !== null) return Math.round(explicit);
  const time = finite(candle?.time);
  if (time === null) return null;
  return Math.round(time >= 1e12 ? time : time * 1000);
}

function normalizeClosedCandles(inputCandles, { timeframeSeconds, collectedAt }) {
  if (!Array.isArray(inputCandles) || inputCandles.length < 51) {
    return { accepted: false, reason: 'AT_LEAST_51_CLOSED_BARS_REQUIRED' };
  }
  const parsedTimeframeSeconds = finite(timeframeSeconds);
  if (parsedTimeframeSeconds === null || parsedTimeframeSeconds < 1) {
    return { accepted: false, reason: 'VALID_TIMEFRAME_REQUIRED' };
  }
  const timeframeMs = Math.floor(parsedTimeframeSeconds) * 1000;
  const observedAt = finite(collectedAt) ?? Date.now();
  const candles = [];
  let previousOpenTimeMs = null;
  for (const source of inputCandles) {
    const openTimeMs = candleOpenTimeMs(source);
    const closeTimeMs = finite(source?.closeTimeMs) ?? (openTimeMs === null ? null : openTimeMs + timeframeMs - 1);
    const open = finite(source?.open);
    const high = finite(source?.high);
    const low = finite(source?.low);
    const close = finite(source?.close);
    const volume = finite(source?.volume ?? 0);
    const chronologyValid = openTimeMs !== null
      && (previousOpenTimeMs === null || openTimeMs > previousOpenTimeMs)
      && (previousOpenTimeMs === null || openTimeMs - previousOpenTimeMs === timeframeMs);
    const geometryValid = open !== null && high !== null && low !== null && close !== null && volume !== null
      && open > 0 && close > 0 && high >= Math.max(open, close) && low <= Math.min(open, close)
      && high >= low && volume >= 0;
    const closed = source?.barClosed !== false && closeTimeMs !== null && closeTimeMs <= observedAt;
    if (!chronologyValid || !geometryValid || !closed) {
      return { accepted: false, reason: !chronologyValid ? 'INVALID_CANDLE_CHRONOLOGY_OR_GAP' : !geometryValid ? 'INVALID_OHLCV' : 'FORMING_OR_FUTURE_BAR_REJECTED' };
    }
    candles.push(Object.freeze({
      time: Math.floor(openTimeMs / 1000),
      openTimeMs,
      closeTimeMs: Math.round(closeTimeMs),
      open,
      high,
      low,
      close,
      volume,
      barClosed: true
    }));
    previousOpenTimeMs = openTimeMs;
  }
  return { accepted: true, candles: Object.freeze(candles), timeframeMs, observedAt };
}

function hashText(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function candleFingerprint(candles) {
  return hashText(candles.map(candle => [
    candle.openTimeMs,
    candle.open,
    candle.high,
    candle.low,
    candle.close,
    candle.volume
  ].join(':')).join('|'));
}

function adversePrice(price, side, isEntry, slippageBps) {
  const fraction = slippageBps / 10000;
  const direction = side === 'LONG'
    ? (isEntry ? 1 : -1)
    : (isEntry ? -1 : 1);
  return price * (1 + direction * fraction);
}

function compactPattern(pattern) {
  return {
    schema: pattern.schema,
    method: pattern.method,
    id: pattern.id,
    type: pattern.type,
    name: pattern.name,
    sentiment: pattern.sentiment,
    weightAtDetection: pattern.weight,
    calibratedAtDetection: pattern.calibrated === true,
    evidence: {
      startTime: pattern.evidence?.startTime ?? null,
      endTime: pattern.evidence?.endTime ?? null,
      anchorTimes: [...(pattern.evidence?.anchorTimes || [])],
      metrics: { ...(pattern.evidence?.metrics || {}) }
    },
    confirmation: { ...(pattern.confirmation || {}) },
    invalidation: { ...(pattern.invalidation || {}) }
  };
}

function compactRegime(regime) {
  return {
    schema: regime?.schema || null,
    method: regime?.method || null,
    id: regime?.id || null,
    type: regime?.type || 'UNKNOWN',
    direction: regime?.direction || 'NEUTRAL',
    decisionEligibleAtDetection: regime?.decisionEligible === true,
    calibratedAtDetection: regime?.calibrated === true,
    ruleAlignmentScoreAtDetection: finite(regime?.ruleAlignmentScore),
    evidence: {
      startTime: regime?.evidence?.startTime ?? null,
      endTime: regime?.evidence?.endTime ?? null,
      closedBarCount: regime?.evidence?.closedBarCount ?? null,
      emaSeparationRatio: regime?.evidence?.emaSeparationRatio ?? null,
      ema20SlopeRatio: regime?.evidence?.ema20SlopeRatio ?? null,
      currentBandWidthRatio: regime?.evidence?.currentBandWidthRatio ?? null,
      volatilityRatio: regime?.evidence?.volatilityRatio ?? null
    }
  };
}

function evaluatePatternOutcome(candles, pattern, regime, signalIndex, metadata, config) {
  const entryIndex = signalIndex + 1;
  const side = pattern.sentiment === 'BULLISH' ? 'LONG' : pattern.sentiment === 'BEARISH' ? 'SHORT' : null;
  const base = {
    schema: PATTERN_RESEARCH_SAMPLE_SCHEMA,
    method: PATTERN_RESEARCH_METHOD,
    stage: PATTERN_RESEARCH_STAGE,
    researchOnly: true,
    decisionEligible: false,
    weightInfluence: false,
    id: `${PATTERN_RESEARCH_SAMPLE_SCHEMA}:${metadata.assetId}:${metadata.timeframe}:${pattern.type}:${pattern.confirmation.barTime}`,
    assetId: metadata.assetId,
    timeframe: metadata.timeframe,
    source: metadata.source,
    side,
    signalIndex,
    signalTime: candles[signalIndex].openTimeMs,
    entryIndex,
    pattern: compactPattern(pattern),
    regime: compactRegime(regime),
    assumptions: {
      analysisWindowBars: config.analysisWindowBars,
      entry: 'NEXT_BAR_OPEN_WITH_ADVERSE_SLIPPAGE',
      exit: 'FIRST_STOP_OR_TARGET_THEN_HORIZON_CLOSE',
      sameBarCollision: 'STOP_FIRST_CONSERVATIVE',
      horizonBars: config.horizonBars,
      targetR: config.targetR,
      roundTripCostBps: config.roundTripCostBps,
      slippageBps: config.slippageBps
    }
  };

  if (!side || entryIndex >= candles.length) {
    return deepFreeze({
      ...base,
      status: 'PENDING',
      pendingReason: side ? 'NEXT_BAR_NOT_AVAILABLE' : 'PATTERN_DIRECTION_NOT_SUPPORTED',
      entryTime: null,
      labelTime: null,
      outcome: null,
      leakageAudit: { historyEndsAtSignal: true, futureStartIndex: entryIndex, lastFutureIndexRead: null, fullHorizonAvailable: false }
    });
  }

  const entryCandle = candles[entryIndex];
  const entryPrice = adversePrice(entryCandle.open, side, true, config.slippageBps);
  const stopPrice = finite(pattern.invalidation?.price);
  const riskPerUnit = stopPrice === null ? null : Math.abs(entryPrice - stopPrice);
  const geometryValid = riskPerUnit !== null && riskPerUnit > 0 && (side === 'LONG' ? stopPrice < entryPrice : stopPrice > entryPrice);
  if (!geometryValid) {
    return deepFreeze({
      ...base,
      status: 'REJECTED',
      rejectionReason: 'INVALID_INVALIDATION_GEOMETRY_AT_NEXT_OPEN',
      entryTime: entryCandle.openTimeMs,
      labelTime: null,
      outcome: null,
      leakageAudit: { historyEndsAtSignal: true, futureStartIndex: entryIndex, lastFutureIndexRead: entryIndex, fullHorizonAvailable: false }
    });
  }

  const targetPrice = side === 'LONG'
    ? entryPrice + riskPerUnit * config.targetR
    : entryPrice - riskPerUnit * config.targetR;
  if (targetPrice <= 0) {
    return deepFreeze({
      ...base,
      status: 'REJECTED',
      rejectionReason: 'INVALID_TARGET_GEOMETRY',
      entryTime: entryCandle.openTimeMs,
      labelTime: null,
      outcome: null,
      leakageAudit: { historyEndsAtSignal: true, futureStartIndex: entryIndex, lastFutureIndexRead: entryIndex, fullHorizonAvailable: false }
    });
  }

  const horizonEndIndex = signalIndex + config.horizonBars;
  const availableEndIndex = Math.min(horizonEndIndex, candles.length - 1);
  let maximumFavorableExcursionR = 0;
  let maximumAdverseExcursionR = 0;
  let exitReason = null;
  let rawExitPrice = null;
  let exitIndex = null;
  let excursionAmbiguous = false;

  for (let index = entryIndex; index <= availableEndIndex; index += 1) {
    const candle = candles[index];
    const favorable = side === 'LONG' ? candle.high - entryPrice : entryPrice - candle.low;
    const adverse = side === 'LONG' ? entryPrice - candle.low : candle.high - entryPrice;
    maximumFavorableExcursionR = Math.max(maximumFavorableExcursionR, favorable / riskPerUnit);
    maximumAdverseExcursionR = Math.max(maximumAdverseExcursionR, adverse / riskPerUnit);
    const stopHit = side === 'LONG' ? candle.low <= stopPrice : candle.high >= stopPrice;
    const targetHit = side === 'LONG' ? candle.high >= targetPrice : candle.low <= targetPrice;
    if (stopHit && targetHit) {
      exitReason = 'STOP_AND_TARGET_SAME_BAR_CONSERVATIVE_STOP';
      rawExitPrice = side === 'LONG' ? Math.min(candle.open, stopPrice) : Math.max(candle.open, stopPrice);
      exitIndex = index;
      excursionAmbiguous = true;
      break;
    }
    if (stopHit) {
      exitReason = 'STOP_LOSS';
      rawExitPrice = side === 'LONG' ? Math.min(candle.open, stopPrice) : Math.max(candle.open, stopPrice);
      exitIndex = index;
      break;
    }
    if (targetHit) {
      exitReason = 'TAKE_PROFIT';
      rawExitPrice = targetPrice;
      exitIndex = index;
      break;
    }
  }

  const fullHorizonAvailable = availableEndIndex >= horizonEndIndex;
  if (exitReason === null && !fullHorizonAvailable) {
    return deepFreeze({
      ...base,
      status: 'PENDING',
      pendingReason: 'FULL_HORIZON_NOT_AVAILABLE',
      entryTime: entryCandle.openTimeMs,
      labelTime: null,
      entryPrice: round(entryPrice),
      stopPrice: round(stopPrice),
      targetPrice: round(targetPrice),
      riskPerUnit: round(riskPerUnit),
      outcome: null,
      observedExcursion: {
        maximumFavorableExcursionR: round(maximumFavorableExcursionR, 6),
        maximumAdverseExcursionR: round(maximumAdverseExcursionR, 6)
      },
      leakageAudit: { historyEndsAtSignal: true, futureStartIndex: entryIndex, lastFutureIndexRead: availableEndIndex, fullHorizonAvailable: false }
    });
  }

  if (exitReason === null) {
    exitReason = 'HORIZON_CLOSE';
    rawExitPrice = candles[horizonEndIndex].close;
    exitIndex = horizonEndIndex;
  }
  const exitPrice = adversePrice(rawExitPrice, side, false, config.slippageBps);
  const directionalGrossReturn = side === 'LONG'
    ? (exitPrice - entryPrice) / entryPrice
    : (entryPrice - exitPrice) / entryPrice;
  const grossReturnBps = directionalGrossReturn * 10000;
  const netReturnBps = grossReturnBps - config.roundTripCostBps;
  const netReturnR = (netReturnBps / 10000) * (entryPrice / riskPerUnit);
  const outcomeCode = exitReason === 'TAKE_PROFIT'
    ? 'TARGET_HIT'
    : exitReason === 'STOP_LOSS' || exitReason.includes('CONSERVATIVE_STOP')
      ? 'STOP_HIT'
      : netReturnBps > 0
        ? 'HORIZON_PROFIT_AFTER_COST'
        : netReturnBps < 0
          ? 'HORIZON_LOSS_AFTER_COST'
          : 'HORIZON_FLAT_AFTER_COST';

  return deepFreeze({
    ...base,
    status: 'COMPLETED',
    entryTime: entryCandle.openTimeMs,
    labelTime: candles[exitIndex].openTimeMs,
    entryPrice: round(entryPrice),
    stopPrice: round(stopPrice),
    targetPrice: round(targetPrice),
    riskPerUnit: round(riskPerUnit),
    exitIndex,
    exitTime: candles[exitIndex].openTimeMs,
    exitPrice: round(exitPrice),
    outcome: {
      code: outcomeCode,
      exitReason,
      targetHit: outcomeCode === 'TARGET_HIT',
      stopHit: outcomeCode === 'STOP_HIT',
      positiveAfterCost: netReturnBps > 0,
      grossReturnBps: round(grossReturnBps, 4),
      netReturnBps: round(netReturnBps, 4),
      netReturnR: round(netReturnR, 6),
      maximumFavorableExcursionR: round(maximumFavorableExcursionR, 6),
      maximumAdverseExcursionR: round(maximumAdverseExcursionR, 6),
      excursionAmbiguous
    },
    leakageAudit: {
      historyEndsAtSignal: true,
      signalIndexBeforeEntry: signalIndex < entryIndex,
      futureStartIndex: entryIndex,
      lastFutureIndexRead: exitIndex,
      fullHorizonAvailable
    }
  });
}

function groupMetrics(samples, keySelector, minimumCompletedSamples) {
  const groups = new Map();
  for (const sample of samples) {
    const key = keySelector(sample);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(sample);
  }
  return Object.freeze([...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, groupSamples]) => {
    const completed = groupSamples.filter(sample => sample.status === 'COMPLETED');
    const positiveR = completed.filter(sample => sample.outcome.netReturnR > 0).reduce((sum, sample) => sum + sample.outcome.netReturnR, 0);
    const negativeR = Math.abs(completed.filter(sample => sample.outcome.netReturnR < 0).reduce((sum, sample) => sum + sample.outcome.netReturnR, 0));
    const mean = selector => completed.length ? completed.reduce((sum, sample) => sum + selector(sample), 0) / completed.length : null;
    const targetHits = completed.filter(sample => sample.outcome.targetHit).length;
    const stopHits = completed.filter(sample => sample.outcome.stopHit).length;
    return deepFreeze({
      key,
      detected: groupSamples.length,
      completed: completed.length,
      pending: groupSamples.filter(sample => sample.status === 'PENDING').length,
      rejected: groupSamples.filter(sample => sample.status === 'REJECTED').length,
      targetHits,
      stopHits,
      targetHitRatePercent: completed.length ? round((targetHits / completed.length) * 100, 2) : null,
      stopHitRatePercent: completed.length ? round((stopHits / completed.length) * 100, 2) : null,
      positiveAfterCostRatePercent: completed.length ? round((completed.filter(sample => sample.outcome.positiveAfterCost).length / completed.length) * 100, 2) : null,
      expectancyR: mean(sample => sample.outcome.netReturnR) === null ? null : round(mean(sample => sample.outcome.netReturnR), 6),
      profitFactorR: negativeR > 0 ? round(positiveR / negativeR, 6) : positiveR > 0 ? null : 0,
      averageMfeR: mean(sample => sample.outcome.maximumFavorableExcursionR) === null ? null : round(mean(sample => sample.outcome.maximumFavorableExcursionR), 6),
      averageMaeR: mean(sample => sample.outcome.maximumAdverseExcursionR) === null ? null : round(mean(sample => sample.outcome.maximumAdverseExcursionR), 6),
      averageNetReturnBps: mean(sample => sample.outcome.netReturnBps) === null ? null : round(mean(sample => sample.outcome.netReturnBps), 4),
      descriptiveSampleThresholdMet: completed.length >= minimumCompletedSamples,
      calibrated: false,
      promotionEligible: false,
      decisionEligible: false
    });
  }));
}

function summarizeSamples(samples, minimumCompletedSamples) {
  const completed = samples.filter(sample => sample.status === 'COMPLETED');
  return deepFreeze({
    detected: samples.length,
    completed: completed.length,
    pending: samples.filter(sample => sample.status === 'PENDING').length,
    rejected: samples.filter(sample => sample.status === 'REJECTED').length,
    minimumCompletedSamples,
    descriptiveOnly: true,
    calibrated: false,
    promotionEligible: false,
    decisionEligible: false,
    byPattern: groupMetrics(samples, sample => sample.pattern.type, minimumCompletedSamples),
    byRegime: groupMetrics(samples, sample => `${sample.regime.type}:${sample.regime.direction}`, minimumCompletedSamples),
    byAssetTimeframe: groupMetrics(samples, sample => `${sample.assetId}:${sample.timeframe}`, minimumCompletedSamples)
  });
}

function failureDataset(status, reason, metadata = {}, config = {}) {
  return deepFreeze({
    schemaVersion: PATTERN_RESEARCH_DATASET_SCHEMA,
    method: PATTERN_RESEARCH_METHOD,
    stage: PATTERN_RESEARCH_STAGE,
    success: false,
    status,
    reason,
    researchOnly: true,
    decisionEligible: false,
    weightInfluence: false,
    datasetId: null,
    config: { ...config },
    provenance: {
      source: shortText(metadata.source) || 'UNSPECIFIED',
      assetId: shortText(metadata.assetId, 80) || null,
      timeframe: shortText(metadata.timeframe, 20) || null,
      verified: metadata.verified === true,
      simulation: metadata.simulation === true
    },
    samples: Object.freeze([]),
    summary: summarizeSamples([], Math.max(1, Number(config.minimumCompletedSamples) || 30))
  });
}

export function buildPatternOutcomeResearchDataset(inputCandles, metadata = {}, options = {}) {
  const requestedAnalysisWindow = finite(options.analysisWindowBars);
  const requestedHorizon = finite(options.horizonBars);
  const requestedTargetR = finite(options.targetR);
  const requestedCost = finite(options.roundTripCostBps);
  const requestedSlippage = finite(options.slippageBps);
  const requestedMinimumSamples = finite(options.minimumCompletedSamples);
  const requestedMaxSamples = finite(options.maxSamples);
  const config = Object.freeze({
    analysisWindowBars: Math.min(500, Math.max(50, Math.floor(requestedAnalysisWindow ?? 80))),
    horizonBars: Math.min(100, Math.max(2, Math.floor(requestedHorizon ?? 12))),
    targetR: Math.min(10, Math.max(0.5, requestedTargetR ?? 2)),
    roundTripCostBps: Math.min(200, Math.max(0, requestedCost ?? 12)),
    slippageBps: Math.min(100, Math.max(0, requestedSlippage ?? 2)),
    minimumCompletedSamples: Math.min(1000, Math.max(10, Math.floor(requestedMinimumSamples ?? 30))),
    maxSamples: Math.min(DEFAULT_MAX_SAMPLES, Math.max(10, Math.floor(requestedMaxSamples ?? DEFAULT_MAX_SAMPLES)))
  });
  const sourceMetadata = {
    source: shortText(metadata.source) || 'UNSPECIFIED',
    adapter: shortText(metadata.adapter),
    assetId: shortText(metadata.assetId, 80),
    timeframe: shortText(metadata.timeframe, 20),
    timeframeSeconds: Math.floor(Number(metadata.timeframeSeconds) || 0),
    collectedAt: finite(metadata.collectedAt) ?? Date.now(),
    verified: metadata.verified === true,
    simulation: metadata.simulation === true
  };
  if (!sourceMetadata.verified || sourceMetadata.simulation || !VERIFIED_RESEARCH_SOURCES.has(sourceMetadata.source)) {
    return failureDataset('SOURCE_REJECTED', 'VERIFIED_NON_SIMULATION_SOURCE_REQUIRED', sourceMetadata, config);
  }
  if (!sourceMetadata.assetId || !sourceMetadata.timeframe) {
    return failureDataset('METADATA_REJECTED', 'ASSET_AND_TIMEFRAME_REQUIRED', sourceMetadata, config);
  }
  const normalized = normalizeClosedCandles(inputCandles, sourceMetadata);
  if (!normalized.accepted) {
    return failureDataset('DATA_REJECTED', normalized.reason, sourceMetadata, config);
  }

  const candles = normalized.candles;
  const detectedSamples = [];
  const seenPatternIds = new Set();
  for (let signalIndex = 49; signalIndex < candles.length; signalIndex += 1) {
    const historyStartIndex = Math.max(0, signalIndex - config.analysisWindowBars + 1);
    const history = candles.slice(historyStartIndex, signalIndex + 1);
    const regime = detectEvidenceBasedMarketRegime(history);
    const patterns = detectConfirmedChartPatterns(history);
    for (const pattern of patterns) {
      if (pattern.schema !== PATTERN_EVIDENCE_SCHEMA || seenPatternIds.has(pattern.id)) continue;
      seenPatternIds.add(pattern.id);
      detectedSamples.push(evaluatePatternOutcome(candles, pattern, regime, signalIndex, sourceMetadata, config));
    }
  }
  const samples = Object.freeze(detectedSamples.slice(-config.maxSamples));
  const fingerprint = candleFingerprint(candles);
  const datasetId = `PATTERN_RESEARCH:${sourceMetadata.assetId}:${sourceMetadata.timeframe}:${fingerprint}:${config.analysisWindowBars}:${config.horizonBars}:${config.targetR}`;
  return deepFreeze({
    schemaVersion: PATTERN_RESEARCH_DATASET_SCHEMA,
    method: PATTERN_RESEARCH_METHOD,
    stage: PATTERN_RESEARCH_STAGE,
    success: true,
    status: 'COMPLETED_RESEARCH_ONLY',
    reason: null,
    researchOnly: true,
    decisionEligible: false,
    weightInfluence: false,
    calibrated: false,
    datasetId,
    generatedAt: sourceMetadata.collectedAt,
    config: { ...config },
    provenance: {
      source: sourceMetadata.source,
      adapter: sourceMetadata.adapter,
      assetId: sourceMetadata.assetId,
      timeframe: sourceMetadata.timeframe,
      timeframeSeconds: sourceMetadata.timeframeSeconds,
      verified: true,
      simulation: false,
      candleCount: candles.length,
      firstCandleTime: candles[0].openTimeMs,
      lastCandleTime: candles.at(-1).openTimeMs,
      candleFingerprint: fingerprint,
      detectedBeforeRetentionLimit: detectedSamples.length,
      retainedSamples: samples.length
    },
    lookaheadAudit: {
      patternDetectionUsesHistoryThroughSignalOnly: true,
      entryBeginsOnNextBar: true,
      labelsReadForwardOnlyAfterSignal: true,
      unresolvedRightEdgeSamplesRemainPending: true,
      sameBarCollisionUsesConservativeStop: true
    },
    samples,
    summary: summarizeSamples(samples, config.minimumCompletedSamples)
  });
}

function sanitizePersistedSample(sample) {
  if (!sample || sample.schema !== PATTERN_RESEARCH_SAMPLE_SCHEMA || !SAMPLE_STATUSES.has(sample.status)) return null;
  if (typeof sample.id !== 'string' || typeof sample.assetId !== 'string' || typeof sample.timeframe !== 'string'
    || typeof sample.pattern?.id !== 'string' || typeof sample.pattern?.type !== 'string'
    || typeof sample.regime?.type !== 'string' || typeof sample.regime?.direction !== 'string') return null;
  const signalTime = finite(sample.signalTime);
  const entryTime = finite(sample.entryTime);
  const labelTime = finite(sample.labelTime);
  if (signalTime === null) return null;
  if (sample.status === 'COMPLETED' && (entryTime === null || labelTime === null || entryTime <= signalTime || labelTime < entryTime || !sample.outcome)) return null;
  if (sample.status === 'COMPLETED') {
    const requiredOutcomeNumbers = [
      sample.outcome.netReturnR,
      sample.outcome.netReturnBps,
      sample.outcome.grossReturnBps,
      sample.outcome.maximumFavorableExcursionR,
      sample.outcome.maximumAdverseExcursionR
    ];
    if (typeof sample.outcome.code !== 'string' || typeof sample.outcome.exitReason !== 'string'
      || requiredOutcomeNumbers.some(value => finite(value) === null)) return null;
  }
  const copy = JSON.parse(JSON.stringify(sample));
  copy.stage = PATTERN_RESEARCH_STAGE;
  copy.researchOnly = true;
  copy.decisionEligible = false;
  copy.weightInfluence = false;
  return deepFreeze(copy);
}

export function restorePatternOutcomeResearchDataset(value) {
  if (!value || value.schemaVersion !== PATTERN_RESEARCH_DATASET_SCHEMA || value.method !== PATTERN_RESEARCH_METHOD
    || value.success !== true || value.provenance?.verified !== true || value.provenance?.simulation === true
    || !VERIFIED_RESEARCH_SOURCES.has(value.provenance?.source)
    || !Array.isArray(value.samples) || value.samples.length > DEFAULT_MAX_SAMPLES) return null;
  const samples = [];
  const ids = new Set();
  for (const candidate of value.samples) {
    const sample = sanitizePersistedSample(candidate);
    if (!sample || ids.has(sample.id)) return null;
    ids.add(sample.id);
    samples.push(sample);
  }
  const restoredHorizon = finite(value.config?.horizonBars);
  const restoredAnalysisWindow = finite(value.config?.analysisWindowBars);
  const restoredTargetR = finite(value.config?.targetR);
  const restoredCost = finite(value.config?.roundTripCostBps);
  const restoredSlippage = finite(value.config?.slippageBps);
  const restoredMinimumSamples = finite(value.config?.minimumCompletedSamples);
  const restoredMaxSamples = finite(value.config?.maxSamples);
  const minimumCompletedSamples = Math.min(1000, Math.max(10, Math.floor(restoredMinimumSamples ?? 30)));
  return deepFreeze({
    schemaVersion: PATTERN_RESEARCH_DATASET_SCHEMA,
    method: PATTERN_RESEARCH_METHOD,
    stage: PATTERN_RESEARCH_STAGE,
    success: true,
    status: 'RESTORED_RESEARCH_ONLY',
    reason: null,
    researchOnly: true,
    decisionEligible: false,
    weightInfluence: false,
    calibrated: false,
    datasetId: shortText(value.datasetId, 240) || null,
    generatedAt: finite(value.generatedAt),
    config: {
      analysisWindowBars: Math.min(500, Math.max(50, Math.floor(restoredAnalysisWindow ?? 80))),
      horizonBars: Math.min(100, Math.max(2, Math.floor(restoredHorizon ?? 12))),
      targetR: Math.min(10, Math.max(0.5, restoredTargetR ?? 2)),
      roundTripCostBps: Math.min(200, Math.max(0, restoredCost ?? 12)),
      slippageBps: Math.min(100, Math.max(0, restoredSlippage ?? 2)),
      minimumCompletedSamples,
      maxSamples: Math.min(DEFAULT_MAX_SAMPLES, Math.max(10, Math.floor(restoredMaxSamples ?? DEFAULT_MAX_SAMPLES)))
    },
    provenance: {
      source: shortText(value.provenance?.source) || 'UNSPECIFIED',
      adapter: shortText(value.provenance?.adapter),
      assetId: shortText(value.provenance?.assetId, 80) || null,
      timeframe: shortText(value.provenance?.timeframe, 20) || null,
      timeframeSeconds: Math.max(0, Math.floor(finite(value.provenance?.timeframeSeconds) ?? 0)),
      verified: value.provenance?.verified === true,
      simulation: value.provenance?.simulation === true,
      candleCount: Math.max(0, Math.floor(finite(value.provenance?.candleCount) ?? 0)),
      firstCandleTime: finite(value.provenance?.firstCandleTime),
      lastCandleTime: finite(value.provenance?.lastCandleTime),
      candleFingerprint: shortText(value.provenance?.candleFingerprint, 32) || null,
      detectedBeforeRetentionLimit: Math.max(0, Math.floor(finite(value.provenance?.detectedBeforeRetentionLimit) ?? samples.length)),
      retainedSamples: samples.length
    },
    lookaheadAudit: {
      patternDetectionUsesHistoryThroughSignalOnly: true,
      entryBeginsOnNextBar: true,
      labelsReadForwardOnlyAfterSignal: true,
      unresolvedRightEdgeSamplesRemainPending: true,
      sameBarCollisionUsesConservativeStop: true
    },
    samples: Object.freeze(samples),
    summary: summarizeSamples(samples, minimumCompletedSamples)
  });
}

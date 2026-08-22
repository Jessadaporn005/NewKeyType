export const MARKET_DATA_HEALTH_VERSION = 'MARKET_DATA_HEALTH_V1';
export const MARKET_DATA_EVIDENCE_VERSION = 'MARKET_DATA_EVIDENCE_V1';

export const MARKET_DATA_HEALTH_STATUS = Object.freeze({
  STARTING: 'STARTING',
  HEALTHY: 'HEALTHY',
  DEGRADED: 'DEGRADED',
  OFFLINE: 'OFFLINE',
  SIMULATION: 'SIMULATION'
});

export const MARKET_DATA_ATTEMPT_OUTCOME = Object.freeze({
  SUCCESS: 'SUCCESS',
  NO_DATA: 'NO_DATA',
  QUALITY_REJECTED: 'QUALITY_REJECTED',
  NO_VERIFIED_ADAPTER: 'NO_VERIFIED_ADAPTER',
  SUPERSEDED: 'SUPERSEDED'
});

const OUTCOMES = new Set(Object.values(MARKET_DATA_ATTEMPT_OUTCOME));

function finiteOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function positiveInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function shortText(value, maxLength = 160) {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  return clean ? clean.slice(0, maxLength) : null;
}

export function calculateMarketDataRefreshDelay({
  timeframeSeconds = 300,
  consecutiveFailures = 0,
  adapterSupported = true,
  healthyMinimumMs = 15000,
  healthyMaximumMs = 60000,
  retryBaseMs = 5000,
  retryMaximumMs = 60000
} = {}) {
  if (adapterSupported !== true) return null;
  const failures = positiveInteger(consecutiveFailures);
  if (failures > 0) {
    return Math.min(
      Math.max(1000, finiteOrNull(retryMaximumMs) || 60000),
      Math.max(1000, finiteOrNull(retryBaseMs) || 5000) * (2 ** Math.min(8, failures - 1))
    );
  }
  const minimum = Math.max(1000, finiteOrNull(healthyMinimumMs) || 15000);
  const maximum = Math.max(minimum, finiteOrNull(healthyMaximumMs) || 60000);
  const timeframeMs = Math.max(1, finiteOrNull(timeframeSeconds) || 300) * 1000;
  return Math.min(maximum, Math.max(minimum, Math.round(timeframeMs / 4)));
}

export function createMarketDataHealth({
  symbol,
  timeframe,
  adapterSupported = true,
  now = Date.now()
} = {}) {
  const atMs = finiteOrNull(now);
  return Object.freeze({
    healthVersion: MARKET_DATA_HEALTH_VERSION,
    status: adapterSupported === true ? MARKET_DATA_HEALTH_STATUS.STARTING : MARKET_DATA_HEALTH_STATUS.SIMULATION,
    symbol: shortText(symbol, 80),
    timeframe: shortText(timeframe, 20),
    adapterSupported: adapterSupported === true,
    inFlight: false,
    activeRequestId: null,
    attemptCount: 0,
    successCount: 0,
    consecutiveFailures: 0,
    packetSequence: 0,
    lastAttemptAtMs: null,
    lastSuccessAtMs: null,
    lastFailureAtMs: null,
    lastFailureReason: adapterSupported === true ? null : MARKET_DATA_ATTEMPT_OUTCOME.NO_VERIFIED_ADAPTER,
    nextRefreshAtMs: null,
    createdAtMs: atMs
  });
}

export function beginMarketDataAttempt(health, { requestId, at = Date.now() } = {}) {
  const base = health?.healthVersion === MARKET_DATA_HEALTH_VERSION
    ? health
    : createMarketDataHealth({ now: at });
  return Object.freeze({
    ...base,
    inFlight: true,
    activeRequestId: shortText(requestId, 100),
    attemptCount: base.attemptCount + 1,
    lastAttemptAtMs: finiteOrNull(at),
    nextRefreshAtMs: null
  });
}

export function settleMarketDataAttempt(health, {
  outcome,
  reason = null,
  at = Date.now(),
  packetSequence = health?.packetSequence,
  timeframeSeconds = 300
} = {}) {
  const base = health?.healthVersion === MARKET_DATA_HEALTH_VERSION
    ? health
    : createMarketDataHealth({ now: at });
  const safeOutcome = OUTCOMES.has(outcome) ? outcome : MARKET_DATA_ATTEMPT_OUTCOME.NO_DATA;
  const atMs = finiteOrNull(at);
  const success = safeOutcome === MARKET_DATA_ATTEMPT_OUTCOME.SUCCESS;
  const unsupported = safeOutcome === MARKET_DATA_ATTEMPT_OUTCOME.NO_VERIFIED_ADAPTER || base.adapterSupported !== true;
  const consecutiveFailures = success ? 0 : unsupported ? base.consecutiveFailures : base.consecutiveFailures + 1;
  const status = success
    ? MARKET_DATA_HEALTH_STATUS.HEALTHY
    : unsupported
      ? MARKET_DATA_HEALTH_STATUS.SIMULATION
      : base.successCount > 0
        ? MARKET_DATA_HEALTH_STATUS.DEGRADED
        : MARKET_DATA_HEALTH_STATUS.OFFLINE;
  const delayMs = calculateMarketDataRefreshDelay({
    timeframeSeconds,
    consecutiveFailures,
    adapterSupported: base.adapterSupported
  });
  return Object.freeze({
    ...base,
    status,
    inFlight: false,
    activeRequestId: null,
    successCount: base.successCount + (success ? 1 : 0),
    consecutiveFailures,
    packetSequence: positiveInteger(packetSequence, base.packetSequence),
    lastSuccessAtMs: success ? atMs : base.lastSuccessAtMs,
    lastFailureAtMs: success || unsupported ? base.lastFailureAtMs : atMs,
    lastFailureReason: success ? null : shortText(reason, 180) || safeOutcome,
    nextRefreshAtMs: delayMs === null || atMs === null ? null : atMs + delayMs
  });
}

export function createMarketDataEvidence({
  requestId,
  generation,
  source,
  symbol,
  timeframe,
  startedAt,
  finishedAt,
  outcome,
  reason = null,
  packet = null,
  rawCandleCount = null
} = {}) {
  const safeOutcome = OUTCOMES.has(outcome) ? outcome : MARKET_DATA_ATTEMPT_OUTCOME.NO_DATA;
  const startedAtMs = finiteOrNull(startedAt);
  const finishedAtMs = finiteOrNull(finishedAt);
  const firstCandle = packet?.candles?.[0] || null;
  const lastCandle = packet?.candles?.at?.(-1) || null;
  return Object.freeze({
    evidenceVersion: MARKET_DATA_EVIDENCE_VERSION,
    requestId: shortText(requestId, 100),
    generation: positiveInteger(generation),
    source: shortText(source, 100),
    symbol: shortText(symbol, 80),
    timeframe: shortText(timeframe, 20),
    startedAtMs,
    finishedAtMs,
    durationMs: startedAtMs === null || finishedAtMs === null ? null : Math.max(0, finishedAtMs - startedAtMs),
    outcome: safeOutcome,
    reason: shortText(reason, 180),
    packetSequence: positiveInteger(packet?.sequence),
    packetSchemaVersion: finiteOrNull(packet?.schemaVersion),
    packetQuality: shortText(packet?.quality?.status, 80),
    rawCandleCount: finiteOrNull(rawCandleCount),
    acceptedCandleCount: finiteOrNull(packet?.quality?.acceptedCount),
    closedBarCount: finiteOrNull(packet?.quality?.closedBarCount),
    formingBarCount: finiteOrNull(packet?.quality?.formingBarCount),
    firstOpenTimeMs: finiteOrNull(firstCandle?.openTimeMs),
    lastOpenTimeMs: finiteOrNull(lastCandle?.openTimeMs),
    lastCloseTimeMs: finiteOrNull(lastCandle?.closeTimeMs)
  });
}

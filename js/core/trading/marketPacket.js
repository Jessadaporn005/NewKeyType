export const MARKET_PACKET_SCHEMA_VERSION = 1;

export const MARKET_PACKET_SOURCES = Object.freeze({
  BINANCE_KLINES_REST: 'BINANCE_KLINES_REST',
  SIMULATED_FALLBACK: 'SIMULATED_FALLBACK'
});

const SOURCE_POLICY = Object.freeze({
  [MARKET_PACKET_SOURCES.BINANCE_KLINES_REST]: Object.freeze({
    verified: true,
    simulation: false,
    label: 'BINANCE KLINES'
  }),
  [MARKET_PACKET_SOURCES.SIMULATED_FALLBACK]: Object.freeze({
    verified: false,
    simulation: true,
    label: 'SIMULATION LAB'
  })
});

function finite(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function timeMs(value) {
  const parsed = finite(value);
  if (parsed === null || parsed <= 0) return null;
  return parsed < 1e12 ? Math.round(parsed * 1000) : Math.round(parsed);
}

function freezeCandle(rawCandle, timeframeSeconds, observedAtMs) {
  const openTimeMs = timeMs(rawCandle?.openTimeMs ?? rawCandle?.time);
  const open = finite(rawCandle?.open);
  const high = finite(rawCandle?.high);
  const low = finite(rawCandle?.low);
  const close = finite(rawCandle?.close);
  const volume = finite(rawCandle?.volume);
  if (openTimeMs === null || open === null || high === null || low === null || close === null || volume === null) return null;
  if (open <= 0 || high <= 0 || low <= 0 || close <= 0 || volume < 0) return null;
  if (high < low || high < Math.max(open, close) || low > Math.min(open, close)) return null;

  const explicitCloseTimeMs = timeMs(rawCandle?.closeTimeMs ?? rawCandle?.closeTime);
  const closeTimeMs = explicitCloseTimeMs ?? (openTimeMs + timeframeSeconds * 1000 - 1);
  if (closeTimeMs < openTimeMs) return null;
  // Closure is derived from timestamps controlled by the adapter contract.
  // A caller-provided boolean must never promote a still-forming bar.
  const barClosed = closeTimeMs <= observedAtMs;
  return Object.freeze({
    time: Math.floor(openTimeMs / 1000),
    openTimeMs,
    closeTimeMs,
    open,
    high,
    low,
    close,
    volume,
    barClosed
  });
}

function uniqueReasons(reasons) {
  return Object.freeze([...new Set(reasons)]);
}

export function evaluateMarketPacketDecisionEligibility(packet, {
  now = Date.now(),
  minimumDecisionCandles = packet?.minimumDecisionCandles,
  maxDecisionAgeMs = packet?.maxDecisionAgeMs
} = {}) {
  const reasons = [];
  const nowMs = timeMs(now);
  const minimumBars = Math.max(20, Number.parseInt(minimumDecisionCandles, 10) || 50);
  const maximumAge = Math.max(60000, Number(maxDecisionAgeMs) || 10 * 60 * 1000);

  if (!packet || packet.schemaVersion !== MARKET_PACKET_SCHEMA_VERSION) reasons.push('INVALID_MARKET_PACKET');
  if (packet?.provenance?.verified !== true) reasons.push('UNVERIFIED_SOURCE');
  if (packet?.provenance?.simulation === true) reasons.push('SIMULATED_SOURCE');
  if (packet?.quality?.status !== 'VALID') reasons.push(`QUALITY_${packet?.quality?.status || 'UNKNOWN'}`);
  if (!Array.isArray(packet?.decisionCandles) || packet.decisionCandles.length < minimumBars) reasons.push('INSUFFICIENT_CLOSED_BARS');

  const lastClosed = Array.isArray(packet?.decisionCandles) ? packet.decisionCandles.at(-1) : null;
  const lastClosedAtMs = finite(lastClosed?.closeTimeMs);
  const observedAtMs = finite(packet?.observedAtMs);
  let dataAgeMs = null;
  if (nowMs === null || lastClosedAtMs === null || observedAtMs === null) {
    reasons.push('MISSING_DECISION_TIMESTAMP');
  } else {
    dataAgeMs = Math.max(0, nowMs - lastClosedAtMs);
    if (lastClosedAtMs > nowMs + 1000) reasons.push('FUTURE_CLOSED_BAR');
    if (observedAtMs > nowMs + 1000) reasons.push('FUTURE_OBSERVATION');
    if (nowMs - observedAtMs > maximumAge) reasons.push('STALE_SNAPSHOT');
    if (dataAgeMs > maximumAge) reasons.push('STALE_CLOSED_BAR');
  }

  const frozenReasons = uniqueReasons(reasons);
  return Object.freeze({
    eligible: frozenReasons.length === 0,
    reasons: frozenReasons,
    evaluatedAtMs: nowMs,
    dataAgeMs,
    minimumDecisionCandles: minimumBars,
    maxDecisionAgeMs: maximumAge
  });
}

export function createMarketPacket({
  source,
  adapter = null,
  sequence = 0,
  requestId = null,
  symbol,
  timeframe,
  timeframeSeconds,
  observedAt = Date.now(),
  candles,
  minimumDecisionCandles = 50,
  maxDecisionAgeMs = null
} = {}) {
  const sourcePolicy = SOURCE_POLICY[source] || Object.freeze({ verified: false, simulation: false, label: 'UNVERIFIED SOURCE' });
  const observedAtMs = timeMs(observedAt);
  const safeTimeframeSeconds = Math.max(1, Number.parseInt(timeframeSeconds, 10) || 0);
  const minimumBars = Math.max(20, Number.parseInt(minimumDecisionCandles, 10) || 50);
  const maximumAge = Math.max(60000, Number(maxDecisionAgeMs) || safeTimeframeSeconds * 2000 + 30000);
  const rawCandles = Array.isArray(candles) ? candles : [];
  const normalized = [];
  let malformedCount = 0;
  for (const rawCandle of rawCandles) {
    const candle = observedAtMs === null ? null : freezeCandle(rawCandle, safeTimeframeSeconds, observedAtMs);
    if (candle) normalized.push(candle);
    else malformedCount += 1;
  }

  let chronological = true;
  let duplicateCount = 0;
  let gapCount = 0;
  let futureOpenCount = 0;
  const seenOpenTimes = new Set();
  for (let index = 0; index < normalized.length; index += 1) {
    const candle = normalized[index];
    if (seenOpenTimes.has(candle.openTimeMs)) duplicateCount += 1;
    seenOpenTimes.add(candle.openTimeMs);
    if (observedAtMs !== null && candle.openTimeMs > observedAtMs + 1000) futureOpenCount += 1;
    if (index > 0) {
      const delta = candle.openTimeMs - normalized[index - 1].openTimeMs;
      if (delta <= 0) chronological = false;
      else if (delta !== safeTimeframeSeconds * 1000) gapCount += 1;
    }
  }

  const decisionCandles = Object.freeze(normalized.filter(candle => candle.barClosed));
  const formingCandles = Object.freeze(normalized.filter(candle => !candle.barClosed));
  let qualityStatus = 'VALID';
  if (observedAtMs === null || safeTimeframeSeconds <= 0 || !symbol || !timeframe) qualityStatus = 'INVALID_METADATA';
  else if (rawCandles.length === 0) qualityStatus = 'NO_CANDLES';
  else if (malformedCount > 0) qualityStatus = 'MALFORMED_CANDLES';
  else if (duplicateCount > 0) qualityStatus = 'DUPLICATE_CANDLES';
  else if (!chronological) qualityStatus = 'OUT_OF_ORDER';
  else if (gapCount > 0) qualityStatus = 'GAPPED_CANDLES';
  else if (futureOpenCount > 0) qualityStatus = 'FUTURE_CANDLES';

  const quality = Object.freeze({
    status: qualityStatus,
    inputCount: rawCandles.length,
    acceptedCount: normalized.length,
    closedBarCount: decisionCandles.length,
    formingBarCount: formingCandles.length,
    malformedCount,
    duplicateCount,
    gapCount,
    futureOpenCount,
    chronological
  });
  const packet = {
    schemaVersion: MARKET_PACKET_SCHEMA_VERSION,
    sequence: Math.max(0, Number.parseInt(sequence, 10) || 0),
    requestId: typeof requestId === 'string' ? requestId.slice(0, 100) : null,
    source,
    adapter: typeof adapter === 'string' ? adapter.slice(0, 120) : null,
    symbol: String(symbol || ''),
    timeframe: String(timeframe || ''),
    timeframeSeconds: safeTimeframeSeconds,
    observedAtMs,
    observedAt: observedAtMs === null ? null : new Date(observedAtMs).toISOString(),
    minimumDecisionCandles: minimumBars,
    maxDecisionAgeMs: maximumAge,
    provenance: Object.freeze({
      source,
      label: sourcePolicy.label,
      verified: sourcePolicy.verified,
      simulation: sourcePolicy.simulation
    }),
    quality,
    candles: Object.freeze(normalized),
    decisionCandles,
    formingCandles
  };
  packet.decision = evaluateMarketPacketDecisionEligibility(packet, { now: observedAtMs, minimumDecisionCandles: minimumBars, maxDecisionAgeMs: maximumAge });
  return Object.freeze(packet);
}

export function summarizeMarketPacket(packet, { now = Date.now() } = {}) {
  const decision = evaluateMarketPacketDecisionEligibility(packet, { now });
  return Object.freeze({
    schemaVersion: packet?.schemaVersion ?? null,
    packetSequence: packet?.sequence ?? 0,
    requestId: packet?.requestId || null,
    source: packet?.source || 'NO_SOURCE',
    sourceLabel: packet?.provenance?.label || 'NO VERIFIED SOURCE',
    symbol: packet?.symbol || null,
    timeframe: packet?.timeframe || null,
    isRealFeed: packet?.provenance?.verified === true && packet?.provenance?.simulation !== true,
    isSimulation: packet?.provenance?.simulation === true,
    decisionEligible: decision.eligible,
    decisionReasons: decision.reasons,
    dataAgeMs: decision.dataAgeMs,
    quality: packet?.quality?.status || 'NO_PACKET',
    closedBars: packet?.quality?.closedBarCount || 0,
    formingBars: packet?.quality?.formingBarCount || 0
  });
}

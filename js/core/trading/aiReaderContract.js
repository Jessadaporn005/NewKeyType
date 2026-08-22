export const AI_READER_INPUT_SCHEMA = 'AI_READER_INPUT_V1';
export const AI_READER_REPORT_SCHEMA = 'AI_READER_REPORT_V1';
export const AI_READER_POLICY = 'LOCAL_LLM_SHADOW_READER_NO_EXECUTION_V1';

const STANCES = new Set(['BULLISH', 'BEARISH', 'NEUTRAL']);
const FORBIDDEN_OUTPUT_KEYS = new Set([
  'action', 'order', 'orders', 'quantity', 'lots', 'lot', 'leverage', 'execute',
  'entry', 'entryprice', 'stoploss', 'takeprofit', 'sl', 'tp', 'position', 'positions'
]);

function finite(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function text(value, maxLength = 500) {
  if (typeof value !== 'string') return null;
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return clean ? clean.slice(0, maxLength) : null;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function stableFingerprint(value) {
  const source = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function sanitizeCandle(candle) {
  const openTimeMs = finite(candle?.openTimeMs ?? (finite(candle?.time) === null ? null : Number(candle.time) * 1000));
  const open = finite(candle?.open);
  const high = finite(candle?.high);
  const low = finite(candle?.low);
  const close = finite(candle?.close);
  const volume = finite(candle?.volume ?? 0);
  if ([openTimeMs, open, high, low, close, volume].includes(null)
    || open <= 0 || close <= 0 || high < Math.max(open, close) || low > Math.min(open, close)
    || low < 0 || volume < 0 || candle?.barClosed === false) return null;
  return Object.freeze({ openTimeMs, open, high, low, close, volume });
}

function sanitizePatterns(patterns) {
  if (!Array.isArray(patterns)) return Object.freeze([]);
  return Object.freeze(patterns.slice(0, 12).map(pattern => {
    const id = text(pattern?.id, 220);
    const type = text(pattern?.type, 100);
    const sentiment = STANCES.has(String(pattern?.sentiment || '').toUpperCase())
      ? String(pattern.sentiment).toUpperCase()
      : 'NEUTRAL';
    if (!id || !type || pattern?.confirmed !== true || pattern?.status !== 'CONFIRMED') return null;
    return Object.freeze({
      id,
      type,
      name: text(pattern?.name, 120) || type,
      sentiment,
      confirmationTime: finite(pattern?.confirmation?.barTime),
      confirmationMethod: text(pattern?.confirmation?.method, 160),
      invalidationCondition: text(pattern?.invalidation?.condition, 160),
      invalidationPrice: finite(pattern?.invalidation?.price),
      ruleAlignmentScore: finite(pattern?.ruleAlignmentScore)
    });
  }).filter(Boolean));
}

function sanitizeResearchSummary(dataset) {
  if (!dataset || dataset.success !== true || dataset.provenance?.verified !== true
    || dataset.provenance?.simulation === true) return null;
  const byPattern = Array.isArray(dataset.summary?.byPattern)
    ? dataset.summary.byPattern.slice(0, 16).map(item => Object.freeze({
        key: text(item?.key, 100),
        completed: Math.max(0, Math.floor(finite(item?.completed) || 0)),
        expectancyR: finite(item?.expectancyR),
        positiveAfterCostRatePercent: finite(item?.positiveAfterCostRatePercent),
        descriptiveSampleThresholdMet: item?.descriptiveSampleThresholdMet === true
      })).filter(item => item.key)
    : [];
  return Object.freeze({
    datasetId: text(dataset.datasetId, 240),
    completed: Math.max(0, Math.floor(finite(dataset.summary?.completed) || 0)),
    minimumCompletedSamples: Math.max(1, Math.floor(finite(dataset.summary?.minimumCompletedSamples) || 30)),
    descriptiveOnly: true,
    byPattern: Object.freeze(byPattern)
  });
}

export function createAIReaderInput({
  marketPacket,
  asset,
  timeframe,
  signal,
  patterns,
  patternResearch,
  now = Date.now()
} = {}) {
  const createdAt = finite(now);
  if (createdAt === null || !marketPacket || marketPacket.provenance?.verified !== true
    || marketPacket.provenance?.simulation === true || !Array.isArray(marketPacket.decisionCandles)) {
    return Object.freeze({ success: false, reason: 'VERIFIED_MARKET_PACKET_REQUIRED' });
  }
  const candles = marketPacket.decisionCandles.slice(-40).map(sanitizeCandle);
  if (candles.length < 20 || candles.includes(null)) {
    return Object.freeze({ success: false, reason: 'AT_LEAST_20_VALID_CLOSED_BARS_REQUIRED' });
  }
  const safePatterns = sanitizePatterns(patterns);
  const regime = signal?.regime && typeof signal.regime === 'object'
    ? Object.freeze({
        schema: text(signal.regime.schema, 80),
        type: text(signal.regime.type, 80),
        direction: text(signal.regime.direction, 40),
        label: text(signal.regime.label, 140),
        confidenceScore: finite(signal.regime.confidenceScore),
        evidence: Object.freeze((Array.isArray(signal.regime.evidence) ? signal.regime.evidence : [])
          .slice(0, 12).map(item => text(item, 180)).filter(Boolean))
      })
    : null;
  const base = {
    schemaVersion: AI_READER_INPUT_SCHEMA,
    policy: AI_READER_POLICY,
    createdAt: new Date(createdAt).toISOString(),
    market: Object.freeze({
      assetId: text(asset?.id, 80),
      timeframe: text(timeframe?.id, 20),
      source: text(marketPacket.provenance?.source, 100),
      packetSequence: finite(marketPacket.sequence),
      collectedAt: finite(marketPacket.collectedAt),
      verified: true,
      simulation: false,
      closedBarsOnly: true
    }),
    candles: Object.freeze(candles),
    ruleEngine: Object.freeze({
      action: text(signal?.action, 80),
      ruleScore: finite(signal?.ruleScore),
      rationale: text(signal?.rationale, 700),
      entryReference: finite(signal?.entry),
      stopReference: finite(signal?.sl),
      targetReference: finite(signal?.tp1)
    }),
    regime,
    patterns: safePatterns,
    research: sanitizeResearchSummary(patternResearch),
    authority: Object.freeze({
      shadowOnly: true,
      decisionEligible: false,
      executionInfluence: false,
      weightInfluence: false,
      mayIssueOrders: false
    })
  };
  const inputId = `AI_READ:${base.market.assetId || 'UNKNOWN'}:${base.market.timeframe || 'UNKNOWN'}:${stableFingerprint(base)}`;
  return Object.freeze({ success: true, input: deepFreeze({ ...base, inputId }) });
}

function hasForbiddenKey(value, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 6) return false;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_OUTPUT_KEYS.has(key.toLowerCase().replace(/[^a-z]/g, ''))) return true;
    if (hasForbiddenKey(child, depth + 1)) return true;
  }
  return false;
}

export function validateAIReaderOutput(rawOutput, input, provider = {}) {
  if (!input || input.schemaVersion !== AI_READER_INPUT_SCHEMA || !rawOutput || typeof rawOutput !== 'object'
    || Array.isArray(rawOutput)) return Object.freeze({ accepted: false, reason: 'INVALID_READER_OUTPUT' });
  if (hasForbiddenKey(rawOutput)) return Object.freeze({ accepted: false, reason: 'ORDER_LIKE_OUTPUT_REJECTED' });
  const stance = String(rawOutput.stance || '').toUpperCase();
  const summary = text(rawOutput.summary, 900);
  const interpretation = text(rawOutput.interpretation, 1800);
  const uncertainties = Array.isArray(rawOutput.uncertainties)
    ? rawOutput.uncertainties.slice(0, 8).map(item => text(item, 240)).filter(Boolean)
    : [];
  const citedEvidenceIds = Array.isArray(rawOutput.citedEvidenceIds)
    ? rawOutput.citedEvidenceIds.slice(0, 12).map(item => text(item, 240)).filter(Boolean)
    : [];
  const allowedEvidenceIds = new Set(input.patterns.map(pattern => pattern.id));
  if (!STANCES.has(stance) || !summary || !interpretation || uncertainties.length < 1
    || citedEvidenceIds.some(id => !allowedEvidenceIds.has(id))) {
    return Object.freeze({ accepted: false, reason: 'READER_SCHEMA_VALIDATION_FAILED' });
  }
  const generatedAtMs = finite(provider.generatedAt ?? Date.now());
  const model = text(provider.model, 120);
  if (generatedAtMs === null || provider.type !== 'LOCAL_OLLAMA' || !model) {
    return Object.freeze({ accepted: false, reason: 'UNVERIFIED_LOCAL_PROVIDER' });
  }
  const report = deepFreeze({
    schemaVersion: AI_READER_REPORT_SCHEMA,
    policy: AI_READER_POLICY,
    reportId: `AI_REPORT:${stableFingerprint([input.inputId, model, rawOutput, generatedAtMs])}`,
    inputId: input.inputId,
    generatedAt: new Date(generatedAtMs).toISOString(),
    provider: { type: 'LOCAL_OLLAMA', model, localOnly: true, apiKeyRequired: false, realLLM: true },
    stance,
    summary,
    interpretation,
    uncertainties: Object.freeze(uncertainties),
    citedEvidenceIds: Object.freeze(citedEvidenceIds),
    authority: {
      stage: 'SHADOW_READER',
      decisionEligible: false,
      executionInfluence: false,
      weightInfluence: false,
      mayIssueOrders: false
    }
  });
  return Object.freeze({ accepted: true, reason: 'VALID_LOCAL_AI_SHADOW_REPORT', report });
}

export function restoreAIReaderReport(value) {
  if (!value || value.schemaVersion !== AI_READER_REPORT_SCHEMA || value.policy !== AI_READER_POLICY
    || value.provider?.type !== 'LOCAL_OLLAMA' || value.provider?.localOnly !== true
    || value.provider?.realLLM !== true || value.authority?.decisionEligible !== false
    || value.authority?.executionInfluence !== false || value.authority?.weightInfluence !== false
    || value.authority?.mayIssueOrders !== false || !STANCES.has(value.stance)
    || !text(value.inputId, 300) || !text(value.reportId, 120) || !Number.isFinite(Date.parse(value.generatedAt))) return null;
  const raw = {
    stance: value.stance,
    summary: value.summary,
    interpretation: value.interpretation,
    uncertainties: value.uncertainties,
    citedEvidenceIds: value.citedEvidenceIds
  };
  if (hasForbiddenKey(raw)) return null;
  const summary = text(value.summary, 900);
  const interpretation = text(value.interpretation, 1800);
  const uncertainties = Array.isArray(value.uncertainties)
    ? value.uncertainties.slice(0, 8).map(item => text(item, 240)).filter(Boolean)
    : [];
  const citedEvidenceIds = Array.isArray(value.citedEvidenceIds)
    ? value.citedEvidenceIds.slice(0, 12).map(item => text(item, 240)).filter(Boolean)
    : [];
  const model = text(value.provider?.model, 120);
  if (!summary || !interpretation || !model || uncertainties.length < 1) return null;
  return deepFreeze({
    schemaVersion: AI_READER_REPORT_SCHEMA,
    policy: AI_READER_POLICY,
    reportId: text(value.reportId, 120),
    inputId: text(value.inputId, 300),
    generatedAt: new Date(Date.parse(value.generatedAt)).toISOString(),
    provider: { type: 'LOCAL_OLLAMA', model, localOnly: true, apiKeyRequired: false, realLLM: true },
    stance: value.stance,
    summary,
    interpretation,
    uncertainties: Object.freeze(uncertainties),
    citedEvidenceIds: Object.freeze(citedEvidenceIds),
    authority: { stage: 'SHADOW_READER', decisionEligible: false, executionInfluence: false, weightInfluence: false, mayIssueOrders: false }
  });
}

export const PAPER_EXECUTION_AUDIT_VERSION = 'PAPER_EXECUTION_AUDIT_V1';

const EVENT_TYPES = new Set(['OPEN_ACCEPTED', 'OPEN_REJECTED', 'POSITION_CLOSED']);
const EXECUTION_SOURCES = new Set(['MANUAL_PAPER', 'RULE_AUTO_PAPER']);

function finiteOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function shortText(value, maxLength = 160) {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  return clean ? clean.slice(0, maxLength) : null;
}

export function createPaperExecutionAuditEvent(rawEvent = {}) {
  if (!rawEvent || typeof rawEvent !== 'object' || Array.isArray(rawEvent)) return null;
  const eventType = String(rawEvent.eventType || '').toUpperCase();
  if (!EVENT_TYPES.has(eventType)) return null;
  const eventId = shortText(rawEvent.eventId, 100);
  if (!eventId) return null;
  const parsedAt = Date.parse(rawEvent.at);
  if (!Number.isFinite(parsedAt)) return null;

  const sourceCandidate = String(rawEvent.executionSource || '').toUpperCase();
  const executionSource = EXECUTION_SOURCES.has(sourceCandidate) ? sourceCandidate : 'MANUAL_PAPER';
  const decision = rawEvent.decision && typeof rawEvent.decision === 'object'
    ? Object.freeze({
        action: shortText(rawEvent.decision.action, 80),
        ruleScore: finiteOrNull(rawEvent.decision.ruleScore),
        targetScoreMethod: shortText(rawEvent.decision.targetScoreMethod, 100),
        newsAccepted: rawEvent.decision.newsAccepted === true,
        memoryAccepted: rawEvent.decision.memoryAccepted === true,
        feedMode: shortText(rawEvent.decision.feedMode, 80),
        marketPacketSchema: finiteOrNull(rawEvent.decision.marketPacketSchema),
        marketSource: shortText(rawEvent.decision.marketSource, 100),
        marketQuality: shortText(rawEvent.decision.marketQuality, 80),
        marketDecisionEligible: rawEvent.decision.marketDecisionEligible === true,
        marketDecisionReasons: shortText(rawEvent.decision.marketDecisionReasons, 240),
        dataAgeMs: finiteOrNull(rawEvent.decision.dataAgeMs),
        candleTime: finiteOrNull(rawEvent.decision.candleTime)
      })
    : null;

  return Object.freeze({
    auditVersion: PAPER_EXECUTION_AUDIT_VERSION,
    eventId,
    at: new Date(parsedAt).toISOString(),
    eventType,
    executionSource,
    reason: shortText(rawEvent.reason, 120),
    orderId: shortText(rawEvent.orderId, 100),
    assetId: shortText(rawEvent.assetId, 80),
    side: ['LONG', 'SHORT'].includes(String(rawEvent.side || '').toUpperCase())
      ? String(rawEvent.side).toUpperCase()
      : null,
    marginUSD: finiteOrNull(rawEvent.marginUSD),
    entryPrice: finiteOrNull(rawEvent.entryPrice),
    exitPrice: finiteOrNull(rawEvent.exitPrice),
    stopPrice: finiteOrNull(rawEvent.stopPrice),
    targetPrice: finiteOrNull(rawEvent.targetPrice),
    pnlUSD: finiteOrNull(rawEvent.pnlUSD),
    balanceAfterUSD: finiteOrNull(rawEvent.balanceAfterUSD),
    riskGateReason: shortText(rawEvent.riskGateReason, 120),
    decision
  });
}

export function restorePaperExecutionAudit(rawEvents, maxEvents = 250) {
  if (!Array.isArray(rawEvents)) return [];
  const restored = [];
  const seenIds = new Set();
  for (const rawEvent of rawEvents.slice(0, Math.max(0, maxEvents))) {
    const event = createPaperExecutionAuditEvent(rawEvent);
    if (!event || seenIds.has(event.eventId)) continue;
    seenIds.add(event.eventId);
    restored.push(event);
  }
  return restored;
}

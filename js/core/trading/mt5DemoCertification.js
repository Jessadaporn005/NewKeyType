import { reconcileMT5DemoAccount, validateMT5DemoPacket } from './mt5DemoGateway.js';

export const MT5_DEMO_CERTIFICATION_SCHEMA = 1;
export const MT5_DEMO_CERTIFICATION_POLICY = 'CONTINUOUS_AUTHENTICATED_DEMO_TELEMETRY_V1';

const MINIMUM_PACKETS = 31;
const MINIMUM_DURATION_MS = 30_000;
const MAXIMUM_CAPTURE_GAP_MS = 2_500;
const MAXIMUM_PACKETS = 600;

function observedTime(value) {
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function result({ certified = false, reasons = [], ...details } = {}) {
  return Object.freeze({
    schemaVersion: MT5_DEMO_CERTIFICATION_SCHEMA,
    policy: MT5_DEMO_CERTIFICATION_POLICY,
    stage: 'DEMO_TELEMETRY_SHADOW',
    certified,
    decisionEligible: false,
    decisionInfluence: false,
    reasons: Object.freeze([...reasons]),
    ...details
  });
}

export function certifyMT5DemoTelemetrySession(records, {
  expectedMagic = 99001,
  expectedOpenTickets = []
} = {}) {
  if (!Array.isArray(records)) return result({ reasons: ['TRACE_ARRAY_REQUIRED'] });
  if (records.length < MINIMUM_PACKETS) {
    return result({ reasons: [`INSUFFICIENT_PACKETS:${records.length}/${MINIMUM_PACKETS}`], packetCount: records.length });
  }
  if (records.length > MAXIMUM_PACKETS) {
    return result({ reasons: [`TRACE_TOO_LARGE:${records.length}/${MAXIMUM_PACKETS}`], packetCount: records.length });
  }
  if (!Array.isArray(expectedOpenTickets) || expectedOpenTickets.length > 100) {
    return result({ reasons: ['INVALID_EXPECTED_TICKETS'] });
  }

  const reasons = [];
  let previousPacket = null;
  let previousObservedAt = null;
  let firstObservedAt = null;
  let expectedSessionId = null;
  let expectedIdentity = null;
  let expectedSymbol = null;
  let maximumObservedGapMs = 0;
  let validatedPacketCount = 0;

  for (let index = 0; index < records.length; index++) {
    const record = records[index];
    const currentObservedAt = observedTime(record?.observedAt);
    if (currentObservedAt === null) {
      reasons.push(`INVALID_OBSERVED_TIME:${index}`);
      break;
    }
    if (record?.transportAuthenticated !== true) {
      reasons.push(`UNAUTHENTICATED_CAPTURE:${index}`);
      break;
    }
    if (previousObservedAt !== null) {
      const gap = currentObservedAt - previousObservedAt;
      if (gap <= 0) {
        reasons.push(`NON_MONOTONIC_CAPTURE_TIME:${index}`);
        break;
      }
      maximumObservedGapMs = Math.max(maximumObservedGapMs, gap);
      if (gap > MAXIMUM_CAPTURE_GAP_MS) {
        reasons.push(`CAPTURE_GAP_EXCEEDED:${index}:${gap}`);
        break;
      }
    } else {
      firstObservedAt = currentObservedAt;
    }

    const validation = validateMT5DemoPacket(record?.packet, {
      now: currentObservedAt,
      maxAgeMs: 2_000,
      futureToleranceMs: 500,
      lastSequence: previousPacket?.sequence || 0,
      expectedSessionId,
      transportAuthenticated: true
    });
    if (!validation.accepted) {
      reasons.push(`PACKET_REJECTED:${index}:${validation.reason}`);
      break;
    }
    const packet = validation.packet;
    if (previousPacket && packet.sequence !== previousPacket.sequence + 1) {
      reasons.push(`SEQUENCE_GAP:${index}:${previousPacket.sequence}->${packet.sequence}`);
      break;
    }
    const identity = `${packet.account.login}\n${packet.account.server}\n${packet.account.currency}`;
    if (expectedIdentity && identity !== expectedIdentity) {
      reasons.push(`ACCOUNT_IDENTITY_CHANGED:${index}`);
      break;
    }
    if (expectedSymbol && packet.symbol !== expectedSymbol) {
      reasons.push(`SYMBOL_CHANGED:${index}`);
      break;
    }
    const reconciliation = reconcileMT5DemoAccount(previousPacket, packet, { expectedMagic, expectedOpenTickets });
    if (!reconciliation.reconciled) {
      reasons.push(...reconciliation.reasons.map(reason => `RECONCILIATION_FAILED:${index}:${reason}`));
      break;
    }
    if (packet.validation.decisionEligible !== false) {
      reasons.push(`DECISION_AUTHORITY_PRESENT:${index}`);
      break;
    }

    expectedSessionId ||= packet.sessionId;
    expectedIdentity ||= identity;
    expectedSymbol ||= packet.symbol;
    previousPacket = packet;
    previousObservedAt = currentObservedAt;
    validatedPacketCount += 1;
  }

  const durationMs = firstObservedAt !== null && previousObservedAt !== null
    ? previousObservedAt - firstObservedAt
    : 0;
  if (reasons.length === 0 && durationMs < MINIMUM_DURATION_MS) {
    reasons.push(`INSUFFICIENT_DURATION:${durationMs}/${MINIMUM_DURATION_MS}`);
  }
  const login = previousPacket?.account?.login || '';
  return result({
    certified: reasons.length === 0,
    reasons,
    packetCount: records.length,
    validatedPacketCount,
    durationMs,
    maximumObservedGapMs,
    sessionId: expectedSessionId,
    symbol: expectedSymbol,
    account: previousPacket ? Object.freeze({
      loginSuffix: login.slice(-4),
      server: previousPacket.account.server,
      currency: previousPacket.account.currency,
      tradeMode: 'DEMO'
    }) : null,
    firstObservedAt: firstObservedAt === null ? null : new Date(firstObservedAt).toISOString(),
    lastObservedAt: previousObservedAt === null ? null : new Date(previousObservedAt).toISOString(),
    firstSequence: records[0]?.packet?.sequence ?? null,
    lastSequence: previousPacket?.sequence ?? null,
    traceAuthenticity: 'CAPTURE_RECORDS_CLAIM_HMAC_VERIFICATION; LOCAL_TRACE_NOT_HARDWARE_ATTESTED'
  });
}

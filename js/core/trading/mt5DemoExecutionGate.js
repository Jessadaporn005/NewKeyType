import { MT5_DEMO_CERTIFICATION_POLICY } from './mt5DemoCertification.js';
import { MT5_DEMO_PACKET_SOURCE, reconcileMT5DemoAccount } from './mt5DemoGateway.js';
import { MT5_DEMO_READINESS_POLICY } from './mt5DemoReadiness.js';

export const MT5_DEMO_EXECUTION_STATE_SCHEMA = 'MT5_DEMO_EXECUTION_STATE_V1';
export const MT5_DEMO_ORDER_INTENT_SCHEMA = 'MT5_DEMO_ORDER_INTENT_V1';
export const MT5_DEMO_ORDER_ACK_SCHEMA = 'MT5_DEMO_ORDER_ACK_V1';
export const MT5_DEMO_EXECUTION_POLICY = 'CERTIFIED_DEMO_ONLY_FAIL_CLOSED_V1';

function finite(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function text(value, maxLength = 160) {
  if (typeof value !== 'string') return null;
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return clean ? clean.slice(0, maxLength) : null;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

export function createMT5DemoExecutionState() {
  return deepFreeze({
    schemaVersion: MT5_DEMO_EXECUTION_STATE_SCHEMA,
    policy: MT5_DEMO_EXECUTION_POLICY,
    enabled: false,
    killSwitch: true,
    unlockedAt: null,
    certificationSessionId: null,
    expectedTickets: Object.freeze([]),
    processedIntentIds: Object.freeze([]),
    authority: { demoOnly: true, liveEligible: false, simulatedFallbackAllowed: false }
  });
}

export function unlockMT5DemoExecution(state, {
  readiness,
  certification,
  runtimeDemoCapability = false,
  operatorConfirmedDemo = false,
  now = Date.now()
} = {}) {
  void state;
  const checks = Object.freeze({
    runtimeDemoCapability: runtimeDemoCapability === true,
    operatorConfirmedDemo: operatorConfirmedDemo === true,
    readiness: readiness?.policy === MT5_DEMO_READINESS_POLICY && readiness?.readyForDemoOrderCertification === true,
    telemetryCertification: certification?.policy === MT5_DEMO_CERTIFICATION_POLICY && certification?.certified === true,
    demoAccount: certification?.account?.tradeMode === 'DEMO',
    sessionBound: typeof certification?.sessionId === 'string' && certification.sessionId.length >= 16
  });
  if (!Object.values(checks).every(Boolean)) {
    return deepFreeze({ success: false, reason: 'DEMO_EXECUTION_UNLOCK_GATES_NOT_PASSED', checks, state: createMT5DemoExecutionState() });
  }
  const unlockedAt = finite(now);
  if (unlockedAt === null) return deepFreeze({ success: false, reason: 'INVALID_UNLOCK_TIME', checks, state: createMT5DemoExecutionState() });
  return deepFreeze({
    success: true,
    reason: 'CERTIFIED_DEMO_EXECUTION_UNLOCKED_FOR_SESSION',
    checks,
    state: {
      schemaVersion: MT5_DEMO_EXECUTION_STATE_SCHEMA,
      policy: MT5_DEMO_EXECUTION_POLICY,
      enabled: true,
      killSwitch: false,
      unlockedAt: new Date(unlockedAt).toISOString(),
      certificationSessionId: certification.sessionId,
      expectedTickets: Object.freeze([]),
      processedIntentIds: Object.freeze([]),
      authority: { demoOnly: true, liveEligible: false, simulatedFallbackAllowed: false }
    }
  });
}

export function armMT5DemoExecutionKillSwitch() {
  return createMT5DemoExecutionState();
}

export function createMT5DemoOrderIntent({
  state,
  paperBotDecision,
  symbol,
  approvedSymbolMap = {},
  volume,
  quote,
  stopPrice,
  targetPrice,
  magic = 99001,
  now = Date.now(),
  nonce = null
} = {}) {
  if (!state || state.schemaVersion !== MT5_DEMO_EXECUTION_STATE_SCHEMA || state.policy !== MT5_DEMO_EXECUTION_POLICY
    || state.enabled !== true || state.killSwitch !== false || state.authority?.liveEligible !== false) {
    return deepFreeze({ success: false, reason: 'DEMO_EXECUTION_LOCKED' });
  }
  if (!paperBotDecision || paperBotDecision.executionMode !== 'PAPER_ONLY'
    || paperBotDecision.authority?.decisionEligible !== true || paperBotDecision.authority?.liveEligible !== false) {
    return deepFreeze({ success: false, reason: 'VERIFIED_PAPER_BOT_DECISION_REQUIRED' });
  }
  const side = paperBotDecision.side === 'LONG' ? 'BUY' : paperBotDecision.side === 'SHORT' ? 'SELL' : null;
  const safeSymbol = text(symbol, 40);
  const approvedBrokerSymbol = text(approvedSymbolMap?.[paperBotDecision.assetId], 40);
  const safeVolume = finite(volume);
  const bid = finite(quote?.bid);
  const ask = finite(quote?.ask);
  const sl = finite(stopPrice);
  const tp = finite(targetPrice);
  const safeMagic = finite(magic);
  const createdAt = finite(now);
  const safeNonce = text(nonce, 64);
  if (!side || !safeSymbol || !approvedBrokerSymbol || safeSymbol !== approvedBrokerSymbol || safeVolume === null || safeVolume <= 0 || safeVolume > 0.5
    || bid === null || ask === null || bid <= 0 || ask < bid || sl === null || tp === null || sl <= 0 || tp <= 0
    || !Number.isSafeInteger(safeMagic) || safeMagic !== 99001 || createdAt === null
    || !safeNonce || !/^[a-f0-9]{32}$/i.test(safeNonce)) return deepFreeze({ success: false, reason: 'INVALID_DEMO_ORDER_FIELDS' });
  const referencePrice = side === 'BUY' ? ask : bid;
  const geometryValid = side === 'BUY' ? sl < referencePrice && tp > referencePrice : sl > referencePrice && tp < referencePrice;
  if (!geometryValid) return deepFreeze({ success: false, reason: 'INVALID_DEMO_PROTECTIVE_GEOMETRY' });
  const intentId = `MT5D:CYBERDECK:${paperBotDecision.decisionId}:${safeNonce}`;
  if (state.processedIntentIds.includes(intentId)) return deepFreeze({ success: false, reason: 'DUPLICATE_DEMO_INTENT' });
  return deepFreeze({
    success: true,
    reason: 'CERTIFIED_DEMO_INTENT_CREATED',
    intent: {
      schemaVersion: MT5_DEMO_ORDER_INTENT_SCHEMA,
      policy: MT5_DEMO_EXECUTION_POLICY,
      source: 'CYBERDECK_CERTIFIED_MT5_DEMO_ORDER',
      mode: 'DEMO',
      intentId,
      nonce: safeNonce.toLowerCase(),
      createdAt: new Date(createdAt).toISOString(),
      expiresAt: new Date(createdAt + 30_000).toISOString(),
      certificationSessionId: state.certificationSessionId,
      paperBotDecisionId: paperBotDecision.decisionId,
      assetId: paperBotDecision.assetId,
      symbol: safeSymbol,
      side,
      volume: Number(safeVolume.toFixed(4)),
      referenceQuote: { bid, ask },
      stopPrice: sl,
      targetPrice: tp,
      magic: safeMagic,
      deviationPoints: 10,
      simulatedFallbackAllowed: false,
      liveEligible: false
    }
  });
}

export function validateMT5DemoOrderAcknowledgement(raw, intent, {
  transportAuthenticated = false,
  now = Date.now()
} = {}) {
  if (transportAuthenticated !== true) return deepFreeze({ accepted: false, reason: 'UNAUTHENTICATED_DEMO_ACK' });
  if (!intent || intent.schemaVersion !== MT5_DEMO_ORDER_INTENT_SCHEMA || intent.mode !== 'DEMO'
    || !raw || raw.schemaVersion !== MT5_DEMO_ORDER_ACK_SCHEMA || raw.source !== MT5_DEMO_PACKET_SOURCE
    || raw.mode !== 'DEMO' || raw.intentId !== intent.intentId || raw.nonce !== intent.nonce) {
    return deepFreeze({ accepted: false, reason: 'DEMO_ACK_CONTRACT_MISMATCH' });
  }
  const receivedAt = finite(now);
  const expiresAt = Date.parse(intent.expiresAt);
  const ticket = text(String(raw.ticket ?? ''), 80);
  const acceptedPrice = finite(raw.acceptedPrice);
  const volume = finite(raw.volume);
  const magic = finite(raw.magic);
  if (receivedAt === null || !Number.isFinite(expiresAt) || receivedAt > expiresAt + 5000
    || raw.accepted !== true || !ticket || acceptedPrice === null || acceptedPrice <= 0
    || volume !== intent.volume || magic !== intent.magic || raw.symbol !== intent.symbol || raw.side !== intent.side
    || finite(raw.stopPrice) !== intent.stopPrice || finite(raw.targetPrice) !== intent.targetPrice) {
    return deepFreeze({ accepted: false, reason: 'INVALID_OR_EXPIRED_DEMO_ACK' });
  }
  return deepFreeze({
    accepted: true,
    reason: 'AUTHENTICATED_DEMO_ORDER_ACK_ACCEPTED',
    acknowledgement: {
      schemaVersion: MT5_DEMO_ORDER_ACK_SCHEMA,
      intentId: intent.intentId,
      ticket,
      symbol: intent.symbol,
      side: intent.side,
      volume: intent.volume,
      acceptedPrice,
      stopPrice: intent.stopPrice,
      targetPrice: intent.targetPrice,
      magic: intent.magic,
      mode: 'DEMO',
      liveEligible: false
    }
  });
}

export function recordMT5DemoOrderAcknowledgement(state, validation) {
  if (!state?.enabled || state.killSwitch || validation?.accepted !== true) return armMT5DemoExecutionKillSwitch();
  const ack = validation.acknowledgement;
  return deepFreeze({
    ...state,
    expectedTickets: Object.freeze([...new Set([...state.expectedTickets, ack.ticket])].slice(-100)),
    processedIntentIds: Object.freeze([...new Set([...state.processedIntentIds, ack.intentId])].slice(-100))
  });
}

export function reconcileMT5DemoExecution(state, previousPacket, currentPacket) {
  if (!state?.enabled || state.killSwitch) return deepFreeze({ reconciled: false, reasons: Object.freeze(['DEMO_EXECUTION_LOCKED']) });
  return reconcileMT5DemoAccount(previousPacket, currentPacket, {
    expectedMagic: 99001,
    expectedOpenTickets: state.expectedTickets
  });
}

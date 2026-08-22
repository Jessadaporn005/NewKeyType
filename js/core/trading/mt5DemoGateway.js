export const MT5_DEMO_PACKET_SCHEMA = 1;
export const MT5_DEMO_PACKET_SOURCE = 'CYBERDECK_MT5_DEMO_GATEWAY';
export const MT5_DEMO_VALIDATION_POLICY = 'AUTHENTICATED_FRESH_DEMO_PACKET_V1';

function reject(reason) {
  return Object.freeze({ accepted: false, reason, packet: null, policy: MT5_DEMO_VALIDATION_POLICY });
}

function finiteNumber(value, { min = -Number.MAX_VALUE, max = Number.MAX_VALUE } = {}) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

function safeText(value, maxLength = 120) {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  return clean ? clean.slice(0, maxLength) : null;
}

function normalizeDepth(levels, side) {
  if (!Array.isArray(levels) || levels.length > 20) return null;
  const normalized = [];
  for (const level of levels) {
    const price = finiteNumber(level?.price, { min: Number.EPSILON, max: 1e12 });
    const volume = finiteNumber(level?.volume, { min: 0, max: 1e9 });
    if (price === null || volume === null) return null;
    normalized.push(Object.freeze({ price, volume }));
  }
  normalized.sort((a, b) => side === 'BID' ? b.price - a.price : a.price - b.price);
  return Object.freeze(normalized);
}

function normalizePositions(rawPositions) {
  if (!Array.isArray(rawPositions) || rawPositions.length > 100) return null;
  const tickets = new Set();
  const positions = [];
  for (const raw of rawPositions) {
    const ticket = String(raw?.ticket ?? '').trim();
    const symbol = safeText(raw?.symbol, 40);
    const side = String(raw?.side || raw?.type || '').toUpperCase();
    const volume = finiteNumber(raw?.volume, { min: Number.EPSILON, max: 1000 });
    const entryPrice = finiteNumber(raw?.entryPrice ?? raw?.price_open, { min: Number.EPSILON, max: 1e12 });
    const currentPrice = finiteNumber(raw?.currentPrice ?? raw?.price_current, { min: Number.EPSILON, max: 1e12 });
    const stopPrice = finiteNumber(raw?.stopPrice ?? raw?.sl, { min: 0, max: 1e12 });
    const targetPrice = finiteNumber(raw?.targetPrice ?? raw?.tp, { min: 0, max: 1e12 });
    const profit = finiteNumber(raw?.profit, { min: -1e12, max: 1e12 });
    const magic = finiteNumber(raw?.magic, { min: 0, max: Number.MAX_SAFE_INTEGER });
    if (!ticket || tickets.has(ticket) || !symbol || !['BUY', 'SELL'].includes(side)
      || volume === null || entryPrice === null || currentPrice === null
      || stopPrice === null || targetPrice === null || profit === null || magic === null) return null;
    tickets.add(ticket);
    positions.push(Object.freeze({ ticket, symbol, side, volume, entryPrice, currentPrice, stopPrice, targetPrice, profit, magic }));
  }
  return Object.freeze(positions);
}

export function validateMT5DemoPacket(rawPacket, {
  now = Date.now(),
  maxAgeMs = 5000,
  futureToleranceMs = 1000,
  lastSequence = 0,
  expectedSessionId = null,
  transportAuthenticated = false
} = {}) {
  if (transportAuthenticated !== true) return reject('UNAUTHENTICATED_TRANSPORT');
  if (!rawPacket || typeof rawPacket !== 'object' || Array.isArray(rawPacket)) return reject('INVALID_PACKET');
  if (rawPacket.schemaVersion !== MT5_DEMO_PACKET_SCHEMA) return reject('UNSUPPORTED_SCHEMA');
  if (rawPacket.source !== MT5_DEMO_PACKET_SOURCE) return reject('UNVERIFIED_SOURCE');
  if (rawPacket.mode !== 'DEMO') return reject('DEMO_MODE_REQUIRED');

  const sessionId = safeText(rawPacket.sessionId, 100);
  if (!sessionId || !/^[A-Za-z0-9_-]{16,100}$/.test(sessionId)) return reject('INVALID_SESSION_ID');
  if (expectedSessionId && sessionId !== expectedSessionId) return reject('SESSION_CHANGED');
  const sequence = finiteNumber(rawPacket.sequence, { min: 1, max: Number.MAX_SAFE_INTEGER });
  if (!Number.isInteger(sequence)) return reject('INVALID_SEQUENCE');
  if (sequence <= Number(lastSequence || 0)) return reject('REPLAYED_OR_OUT_OF_ORDER_PACKET');

  const packetTime = Date.parse(rawPacket.timestamp);
  const decisionTime = Number(now);
  if (!Number.isFinite(packetTime) || !Number.isFinite(decisionTime)) return reject('INVALID_TIMESTAMP');
  if (packetTime > decisionTime + futureToleranceMs) return reject('FUTURE_PACKET');
  if (decisionTime - packetTime > maxAgeMs) return reject('STALE_PACKET');

  const account = rawPacket.account;
  const login = String(account?.login ?? '').trim();
  const server = safeText(account?.server, 120);
  const currency = safeText(account?.currency, 16);
  if (!login || !server || !currency || account?.tradeMode !== 'DEMO') return reject('VERIFIED_DEMO_ACCOUNT_REQUIRED');
  const balance = finiteNumber(account.balance, { min: 0, max: 1e12 });
  const equity = finiteNumber(account.equity, { min: -1e12, max: 1e12 });
  const margin = finiteNumber(account.margin, { min: 0, max: 1e12 });
  const freeMargin = finiteNumber(account.freeMargin, { min: -1e12, max: 1e12 });
  if ([balance, equity, margin, freeMargin].includes(null)) return reject('INVALID_ACCOUNT_VALUES');
  const positions = normalizePositions(account.positions);
  if (!positions) return reject('INVALID_POSITIONS');

  const symbol = safeText(rawPacket.symbol, 40);
  const quoteSymbol = safeText(rawPacket.quote?.symbol, 40);
  const bid = finiteNumber(rawPacket.quote?.bid, { min: Number.EPSILON, max: 1e12 });
  const ask = finiteNumber(rawPacket.quote?.ask, { min: Number.EPSILON, max: 1e12 });
  if (!symbol || quoteSymbol !== symbol || bid === null || ask === null || ask < bid) return reject('INVALID_QUOTE');
  if ((ask - bid) / bid > 0.1) return reject('IMPLAUSIBLE_SPREAD');
  const bids = normalizeDepth(rawPacket.depth?.bids, 'BID');
  const asks = normalizeDepth(rawPacket.depth?.asks, 'ASK');
  if (!bids || !asks) return reject('INVALID_MARKET_DEPTH');

  const packet = Object.freeze({
    schemaVersion: MT5_DEMO_PACKET_SCHEMA,
    source: MT5_DEMO_PACKET_SOURCE,
    mode: 'DEMO',
    sessionId,
    sequence,
    timestamp: new Date(packetTime).toISOString(),
    status: 'DEMO_SHADOW_VERIFIED',
    mt5_connected: true,
    symbol,
    quote: Object.freeze({ symbol, bid, ask }),
    depth: Object.freeze({ bids, asks }),
    account: Object.freeze({ login, server, currency, tradeMode: 'DEMO', balance, equity, margin, freeMargin, positions }),
    validation: Object.freeze({
      accepted: true,
      decisionEligible: false,
      mode: 'DEMO_SHADOW',
      policy: MT5_DEMO_VALIDATION_POLICY
    })
  });
  return Object.freeze({ accepted: true, reason: 'VALID_DEMO_SHADOW_PACKET', packet, policy: MT5_DEMO_VALIDATION_POLICY });
}

export function reconcileMT5DemoAccount(previousPacket, currentPacket, {
  expectedMagic = null,
  expectedOpenTickets = [],
  allowedSystemTickets = []
} = {}) {
  if (currentPacket?.validation?.accepted !== true || currentPacket.mode !== 'DEMO') {
    return Object.freeze({ reconciled: false, reasons: ['CURRENT_PACKET_NOT_VALIDATED_DEMO'] });
  }
  const reasons = [];
  if (previousPacket) {
    if (previousPacket?.validation?.accepted !== true || previousPacket.sessionId !== currentPacket.sessionId) {
      reasons.push('SESSION_CONTINUITY_FAILED');
    }
    if (currentPacket.sequence <= Number(previousPacket.sequence || 0)) reasons.push('SEQUENCE_NOT_MONOTONIC');
  }

  const account = currentPacket.account;
  const identityTolerance = Math.max(0.05, Math.abs(account.equity) * 0.0001);
  if (Math.abs((account.equity - account.margin) - account.freeMargin) > identityTolerance) {
    reasons.push('FREE_MARGIN_IDENTITY_MISMATCH');
  }
  const ticketSet = new Set(account.positions.map(position => position.ticket));
  for (const ticket of expectedOpenTickets.map(String)) {
    if (!ticketSet.has(ticket)) reasons.push(`EXPECTED_TICKET_MISSING:${ticket}`);
  }
  if (expectedMagic !== null) {
    const systemPositions = account.positions.filter(item => item.magic === Number(expectedMagic));
    const previousSystemTickets = new Set(
      (previousPacket?.account?.positions || [])
        .filter(item => item.magic === Number(expectedMagic))
        .map(item => item.ticket)
    );
    const explicitlyExpectedTickets = new Set([
      ...expectedOpenTickets.map(String),
      ...(Array.isArray(allowedSystemTickets) ? allowedSystemTickets.map(String) : [])
    ]);
    for (const position of systemPositions) {
      if (!previousSystemTickets.has(position.ticket) && !explicitlyExpectedTickets.has(position.ticket)) {
        reasons.push(`UNEXPECTED_SYSTEM_POSITION:${position.ticket}`);
      }
      const protectedGeometry = position.side === 'BUY'
        ? position.stopPrice > 0 && position.stopPrice < position.entryPrice && position.targetPrice > position.entryPrice
        : position.stopPrice > position.entryPrice && position.targetPrice > 0 && position.targetPrice < position.entryPrice;
      if (!protectedGeometry) reasons.push(`UNPROTECTED_SYSTEM_POSITION:${position.ticket}`);
    }
  }
  return Object.freeze({
    reconciled: reasons.length === 0,
    reasons: Object.freeze(reasons),
    sessionId: currentPacket.sessionId,
    sequence: currentPacket.sequence,
    positionCount: account.positions.length
  });
}

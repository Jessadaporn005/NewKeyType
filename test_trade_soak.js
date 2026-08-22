import { createAIReaderInput, validateAIReaderOutput } from './js/core/trading/aiReaderContract.js';
import { MARKET_PACKET_SOURCES, createMarketPacket, evaluateMarketPacketDecisionEligibility } from './js/core/trading/marketPacket.js';
import { PATTERN_RESEARCH_METHOD } from './js/core/trading/patternOutcomeResearch.js';
import { promotePatternStrategyMemory } from './js/core/trading/patternMemoryPromotion.js';
import {
  armVerifiedPaperBotKillSwitch,
  createVerifiedPaperBotState,
  evaluateVerifiedPaperBotDecision,
  recordVerifiedPaperBotDecision,
  setVerifiedPaperBotEnabled
} from './js/core/trading/verifiedPaperBot.js';
import { MT5_DEMO_PACKET_SOURCE, reconcileMT5DemoAccount, validateMT5DemoPacket } from './js/core/trading/mt5DemoGateway.js';

let passed = 0;
let failed = 0;
function assert(condition, name) {
  if (condition) {
    passed += 1;
    console.log(`[PASS] ${name}`);
  } else {
    failed += 1;
    console.error(`[FAIL] ${name}`);
  }
}

function makeCandles(observedAt, count = 61, step = 300000) {
  return Array.from({ length: count }, (_, index) => {
    const openTimeMs = observedAt - (count - 1 - index) * step;
    const open = 100 + index * 0.02;
    const close = open + (index % 2 ? 0.01 : -0.005);
    return {
      time: Math.floor(openTimeMs / 1000), openTimeMs, closeTimeMs: openTimeMs + step - 1,
      open, high: Math.max(open, close) + 0.05, low: Math.min(open, close) - 0.05, close, volume: 100 + index
    };
  });
}

const startedAt = Date.now();
const firstHeap = process.memoryUsage().heapUsed;
let verifiedPackets = 0;
let simulationLeaks = 0;
for (let index = 0; index < 500; index += 1) {
  const observedAt = 1760000000000 + index * 300000;
  const packet = createMarketPacket({
    source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
    sequence: index + 1,
    requestId: `SOAK_${index}`,
    symbol: 'BTC/USDT', timeframe: '5m', timeframeSeconds: 300, observedAt,
    candles: makeCandles(observedAt)
  });
  if (evaluateMarketPacketDecisionEligibility(packet, { now: observedAt }).eligible) verifiedPackets += 1;
  if (index % 17 === 0) {
    const simulated = createMarketPacket({
      source: MARKET_PACKET_SOURCES.SIMULATED_FALLBACK,
      symbol: 'BTC/USDT', timeframe: '5m', timeframeSeconds: 300, observedAt,
      candles: makeCandles(observedAt)
    });
    if (evaluateMarketPacketDecisionEligibility(simulated, { now: observedAt }).eligible) simulationLeaks += 1;
  }
}
assert(verifiedPackets === 500 && simulationLeaks === 0, '500 refresh generations preserve verified-vs-simulation authority separation');

const readerObservedAt = 1765000000000;
const readerPacket = createMarketPacket({
  source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
  sequence: 1,
  symbol: 'BTC/USDT', timeframe: '5m', timeframeSeconds: 300, observedAt: readerObservedAt,
  candles: makeCandles(readerObservedAt)
});
const readerInput = createAIReaderInput({
  marketPacket: readerPacket,
  asset: { id: 'BTC/USDT' }, timeframe: { id: '5m' },
  signal: { action: 'BUY', ruleScore: 75, rationale: 'bounded test', entry: 101, sl: 99, tp1: 105 },
  patterns: [], now: readerObservedAt
}).input;
let unsafeAIOutputsAccepted = 0;
for (let index = 0; index < 300; index += 1) {
  const output = index % 3 === 0
    ? { stance: 'BULLISH', summary: 'unsafe', interpretation: 'unsafe', uncertainties: ['risk'], citedEvidenceIds: [], action: 'BUY' }
    : index % 3 === 1
      ? { stance: 'BULLISH', summary: 'bad citation', interpretation: 'bad citation', uncertainties: ['risk'], citedEvidenceIds: ['FORGED'] }
      : { stance: 'UNKNOWN', summary: 'bad stance', interpretation: 'bad stance', uncertainties: ['risk'], citedEvidenceIds: [] };
  if (validateAIReaderOutput(output, readerInput, { type: 'LOCAL_OLLAMA', model: 'fault-model', generatedAt: readerObservedAt }).accepted) unsafeAIOutputsAccepted += 1;
}
assert(unsafeAIOutputsAccepted === 0, '300 malformed or order-like Local AI outputs all fail closed');

const paperBotPattern = { id: 'PATTERN:SOAK', type: 'BULLISH_ENGULFING_CONFIRMED', sentiment: 'BULLISH', confirmed: true, decisionEligible: true };
const paperBotSignal = {
  action: 'STRONG BUY', ruleScore: 80, entry: 101, sl: 99, tp1: 105,
  regime: { decisionEligible: true }, patternEvidence: [paperBotPattern]
};
let botState = setVerifiedPaperBotEnabled(createVerifiedPaperBotState(100000, readerObservedAt), true, { balanceUSD: 100000, now: readerObservedAt });
const firstBotDecision = evaluateVerifiedPaperBotDecision({
  state: botState, marketPacket: readerPacket,
  marketDecision: evaluateMarketPacketDecisionEligibility(readerPacket, { now: readerObservedAt }),
  signal: paperBotSignal, paperAccount: { balance: 100000, equity: 100000 }, now: readerObservedAt
});
botState = recordVerifiedPaperBotDecision(botState, firstBotDecision, { executed: true, balanceUSD: 100000, equityUSD: 100000, now: readerObservedAt });
let duplicateBotExecutions = 0;
for (let index = 0; index < 1000; index += 1) {
  const replay = evaluateVerifiedPaperBotDecision({
    state: botState, marketPacket: readerPacket,
    marketDecision: evaluateMarketPacketDecisionEligibility(readerPacket, { now: readerObservedAt }),
    signal: paperBotSignal, paperAccount: { balance: 100000, equity: 100000 }, now: readerObservedAt
  });
  if (replay.execute) duplicateBotExecutions += 1;
}
const killedBot = armVerifiedPaperBotKillSwitch(botState, { balanceUSD: 100000, now: readerObservedAt });
assert(firstBotDecision.execute && duplicateBotExecutions === 0 && killedBot.killSwitch && !killedBot.enabled,
  '1,000 repeated evaluations cannot duplicate a closed-bar Paper Bot decision and kill remains authoritative');

function mt5Packet(sequence, timestamp) {
  return {
    schemaVersion: 1,
    source: MT5_DEMO_PACKET_SOURCE,
    mode: 'DEMO',
    sessionId: '0123456789abcdef0123456789abcdef',
    sequence,
    timestamp: new Date(timestamp).toISOString(),
    symbol: 'XAUUSD',
    quote: { symbol: 'XAUUSD', bid: 2500, ask: 2500.2 },
    depth: { bids: [], asks: [] },
    account: {
      login: '12345678', server: 'XMGlobal-Demo', currency: 'USD', tradeMode: 'DEMO',
      balance: 100000, equity: 100000, margin: 0, freeMargin: 100000, positions: []
    }
  };
}
let previousPacket = null;
let lastSequence = 0;
let acceptedMT5Packets = 0;
for (let sequence = 1; sequence <= 500; sequence += 1) {
  const observedAt = 1770000000000 + sequence * 1000;
  const validation = validateMT5DemoPacket(mt5Packet(sequence, observedAt), {
    now: observedAt,
    lastSequence,
    expectedSessionId: previousPacket?.sessionId || null,
    transportAuthenticated: true
  });
  if (validation.accepted && reconcileMT5DemoAccount(previousPacket, validation.packet).reconciled) {
    acceptedMT5Packets += 1;
    previousPacket = validation.packet;
    lastSequence = sequence;
  }
}
const replayedMT5 = validateMT5DemoPacket(mt5Packet(250, 1770000000000 + 501000), {
  now: 1770000000000 + 501000,
  lastSequence,
  expectedSessionId: previousPacket.sessionId,
  transportAuthenticated: true
});
assert(acceptedMT5Packets === 500 && !replayedMT5.accepted && replayedMT5.reason === 'REPLAYED_OR_OUT_OF_ORDER_PACKET',
  '500 authenticated MT5 packets reconcile continuously and an injected replay is rejected');

const overlappingSamples = Array.from({ length: 200 }, (_, index) => ({
  status: 'COMPLETED', signalTime: 1780000000000 + index * 1000, labelTime: 1780000000000 + index * 1000 + 300000,
  pattern: { type: 'BULLISH_ENGULFING_CONFIRMED' }, outcome: { netReturnR: 0.5 }
}));
const overlappingPromotion = promotePatternStrategyMemory({
  success: true, method: PATTERN_RESEARCH_METHOD, datasetId: 'SOAK_OVERLAP', generatedAt: 1781000000000,
  provenance: { verified: true, simulation: false, candleFingerprint: 'soak1234' },
  lookaheadAudit: { patternDetectionUsesHistoryThroughSignalOnly: true, entryBeginsOnNextBar: true, labelsReadForwardOnlyAfterSignal: true },
  samples: overlappingSamples
});
assert(overlappingPromotion.promotedCount === 0, '200 highly overlapping wins cannot promote Pattern memory');

const durationMs = Date.now() - startedAt;
const heapDeltaMB = (process.memoryUsage().heapUsed - firstHeap) / (1024 * 1024);
console.log(`TRADE SOAK: ${passed} passed, ${failed} failed • ${durationMs}ms • heap delta ${heapDeltaMB.toFixed(2)} MB`);
if (failed > 0) process.exitCode = 1;

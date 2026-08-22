import { MARKET_TYPES, TRADING_ASSETS, findTradingAsset } from './js/core/trading/marketCatalog.js';
import { calculateDynamicSpread as calculateCoreSpread } from './js/core/trading/spreadModel.js';
import { calculateEMA, calculateBollingerBands, calculateRSI, calculateMACD } from './js/core/trading/indicators.js';
import { calculateTargetScore, TARGET_SCORE_METHOD } from './js/core/trading/targetScore.js';
import {
  calculatePaperPositionSize,
  createPaperPosition,
  deriveProtectiveOrders,
  evaluatePaperExit,
  evaluatePaperOpenRisk,
  markPaperPosition,
  normalizeRiskPercent,
  restorePaperPositions,
  settlePaperPosition,
  summarizePaperAccount
} from './js/core/trading/paperAccount.js';
import { isLegacyDemoSeed, migrateLegacyDemoSeed, selectLatestPaperState } from './js/core/trading/gymState.js';
import { evaluateRuleCountercheck, RULE_COUNTERCHECK_METHOD } from './js/core/trading/ruleCountercheck.js';
import { migrateProfile, PROFILE_SCHEMA_VERSION } from './js/profileStore.js';
import { BACKTEST_METHOD, runBarCloseBacktest } from './js/core/trading/backtestEngine.js';
import { resolveDecisionNews, VERIFIED_NEWS_PROVENANCE } from './js/core/trading/newsInputPolicy.js';
import { resolveDecisionStrategyMemory, VALIDATED_MEMORY_PROVENANCE } from './js/core/trading/strategyMemoryPolicy.js';
import { createPaperExecutionAuditEvent, restorePaperExecutionAudit } from './js/core/trading/paperExecutionAudit.js';
import {
  MARKET_PACKET_SOURCES,
  createMarketPacket,
  evaluateMarketPacketDecisionEligibility,
  summarizeMarketPacket
} from './js/core/trading/marketPacket.js';
import {
  MARKET_DATA_ATTEMPT_OUTCOME,
  MARKET_DATA_HEALTH_STATUS,
  beginMarketDataAttempt,
  calculateMarketDataRefreshDelay,
  createMarketDataEvidence,
  createMarketDataHealth,
  settleMarketDataAttempt
} from './js/core/trading/marketDataHealth.js';
import { MT5_DEMO_PACKET_SOURCE, reconcileMT5DemoAccount, validateMT5DemoPacket } from './js/core/trading/mt5DemoGateway.js';
import { certifyMT5DemoTelemetrySession } from './js/core/trading/mt5DemoCertification.js';
import { assessMT5DemoReadiness } from './js/core/trading/mt5DemoReadiness.js';
import {
  MT5_DEMO_ORDER_ACK_SCHEMA,
  armMT5DemoExecutionKillSwitch,
  createMT5DemoExecutionState,
  createMT5DemoOrderIntent,
  recordMT5DemoOrderAcknowledgement,
  unlockMT5DemoExecution,
  validateMT5DemoOrderAcknowledgement
} from './js/core/trading/mt5DemoExecutionGate.js';
import { extractMLFeatures, predictMLDirection, restoreMLShadowModel, restoreMLShadowReport, trainAndEvaluateMLShadow } from './js/core/trading/mlShadowModel.js';
import { PATTERN_EVIDENCE_SCHEMA, detectConfirmedChartPatterns } from './js/core/trading/patternEvidence.js';
import { MARKET_REGIME_SCHEMA, detectEvidenceBasedMarketRegime } from './js/core/trading/marketRegime.js';
import {
  PATTERN_RESEARCH_METHOD,
  PATTERN_RESEARCH_STAGE,
  buildPatternOutcomeResearchDataset,
  restorePatternOutcomeResearchDataset
} from './js/core/trading/patternOutcomeResearch.js';
import { PATTERN_MEMORY_PROMOTION_POLICY, promotePatternStrategyMemory } from './js/core/trading/patternMemoryPromotion.js';
import {
  AI_READER_POLICY,
  createAIReaderInput,
  restoreAIReaderReport,
  validateAIReaderOutput
} from './js/core/trading/aiReaderContract.js';
import {
  VERIFIED_PAPER_BOT_POLICY,
  armVerifiedPaperBotKillSwitch,
  createVerifiedPaperBotState,
  evaluateVerifiedPaperBotDecision,
  recordVerifiedPaperBotDecision,
  setVerifiedPaperBotEnabled
} from './js/core/trading/verifiedPaperBot.js';
import { fetchHistoricalExchangeCandles, fetchRealExchangeCandles, getMarketDataDisclosure, hasVerifiedMarketDataAdapter } from './js/services/trading/binanceMarketData.js';
import { AITradingEngine, DEFAULT_STRATEGY_WEIGHTS, calculateDynamicSpread as calculateLegacySpread, generateAISignal, TRADING_ASSETS as LEGACY_ASSET_EXPORT } from './js/aiTradingEngine.js';
import { resolveRuntimeCapabilities } from './js/runtimeConfig.js';

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

function makeMarketPacketCandles(observedAtMs, count = 61, timeframeMs = 300000) {
  const firstOpenTimeMs = observedAtMs - (count - 1) * timeframeMs;
  return Array.from({ length: count }, (_, index) => {
    const openTimeMs = firstOpenTimeMs + index * timeframeMs;
    const open = 100 + index * 0.02;
    const close = open + 0.01;
    return {
      time: Math.floor(openTimeMs / 1000),
      openTimeMs,
      closeTimeMs: openTimeMs + timeframeMs - 1,
      open,
      high: close + 0.05,
      low: open - 0.05,
      close,
      volume: 100 + index
    };
  });
}

const attemptedCapabilityOverride = resolveRuntimeCapabilities({ demoTradingEnabled: true, liveTradingEnabled: true, allowSimulatedBrokerFallback: true });
assert(attemptedCapabilityOverride.demoTradingEnabled === false && attemptedCapabilityOverride.liveTradingEnabled === false && attemptedCapabilityOverride.allowSimulatedBrokerFallback === false, 'Renderer overrides cannot enable broker execution capabilities');

assert(MARKET_TYPES.BINANCE === 'binance' && MARKET_TYPES.XM === 'xm', 'Market catalog exposes stable market identifiers');
assert(TRADING_ASSETS.every(asset => asset.executionMode === 'PAPER_ONLY'), 'Every catalog asset is explicitly Paper-only');
assert(LEGACY_ASSET_EXPORT === TRADING_ASSETS, 'Legacy facade and new core share one immutable asset catalog');
assert(findTradingAsset('CYBER/USDT')?.dataMode === 'SIMULATED_ONLY', 'Fictional assets are marked simulated-only');
assert(getMarketDataDisclosure('XAU/USD').includes('PROXY') && getMarketDataDisclosure('XAU/USD').includes('NOT XAU/USD SPOT'), 'Gold adapter discloses the PAXG proxy');

const deterministicSpread = calculateCoreSpread(findTradingAsset('BTC/USDT'), 100, null, null, () => 0.5);
assert(deterministicSpread.source === 'SIMULATED_SPREAD_MODEL' && deterministicSpread.bidPrice < deterministicSpread.askPrice, 'Spread model is labeled and produces valid bid/ask ordering');

const validPayload = [[1710000000000, '100', '105', '95', '102', '123.4']];
const candles = await fetchRealExchangeCandles('BTC/USDT', '5m', 80, {
  fetchImpl: async () => ({ ok: true, json: async () => validPayload })
});
assert(Array.isArray(candles) && candles[0].high === 105 && candles[0].low === 95, 'Binance adapter validates and parses a valid OHLCV response');

const invalidCandles = await fetchRealExchangeCandles('BTC/USDT', '5m', 80, {
  fetchImpl: async () => ({ ok: true, json: async () => [[1710000000000, '100', '90', '95', '102', '1']] })
});
assert(invalidCandles === null, 'Binance adapter rejects invalid OHLC geometry');
assert(await fetchRealExchangeCandles('EUR/USD', '5m', 80, { fetchImpl: async () => { throw new Error('must not call'); } }) === null, 'Unsupported instruments fail closed without calling a fake adapter');

const packetObservedAt = 1760000000000;
const packetCandles = makeMarketPacketCandles(packetObservedAt);
const verifiedPacket = createMarketPacket({
  source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
  adapter: 'BINANCE KLINES',
  sequence: 7,
  requestId: 'MKT_TEST_7',
  symbol: 'BTC/USDT',
  timeframe: '5m',
  timeframeSeconds: 300,
  observedAt: packetObservedAt,
  candles: packetCandles
});
assert(verifiedPacket.decision.eligible && verifiedPacket.decisionCandles.length === 60 && verifiedPacket.formingCandles.length === 1, 'MarketPacket admits only verified closed bars to the decision dataset');
assert(Object.isFrozen(verifiedPacket) && Object.isFrozen(verifiedPacket.candles) && Object.isFrozen(verifiedPacket.candles[0]), 'MarketPacket and normalized candles are immutable');
assert(evaluateMarketPacketDecisionEligibility(verifiedPacket, { now: packetObservedAt + 700000 }).eligible === false, 'MarketPacket rejects stale snapshots at decision time');

const falselyClaimedClosedCandles = packetCandles.map((candle, index) => index === packetCandles.length - 1 ? { ...candle, barClosed: true } : candle);
const falselyClaimedClosedPacket = createMarketPacket({
  source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
  symbol: 'BTC/USDT',
  timeframe: '5m',
  timeframeSeconds: 300,
  observedAt: packetObservedAt,
  candles: falselyClaimedClosedCandles
});
assert(falselyClaimedClosedPacket.decisionCandles.length === 60 && falselyClaimedClosedPacket.formingCandles.length === 1, 'MarketPacket ignores caller claims that promote a still-forming bar to closed');

const simulatedPacket = createMarketPacket({
  source: MARKET_PACKET_SOURCES.SIMULATED_FALLBACK,
  adapter: 'LOCAL_RANDOM_WALK_SIMULATION',
  symbol: 'BTC/USDT',
  timeframe: '5m',
  timeframeSeconds: 300,
  observedAt: packetObservedAt,
  candles: packetCandles
});
assert(!simulatedPacket.decision.eligible && simulatedPacket.decision.reasons.includes('SIMULATED_SOURCE'), 'Simulation packets are explicitly denied decision authority');

const duplicatePacket = createMarketPacket({
  source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
  symbol: 'BTC/USDT',
  timeframe: '5m',
  timeframeSeconds: 300,
  observedAt: packetObservedAt,
  candles: [...packetCandles.slice(0, 30), packetCandles[29], ...packetCandles.slice(30)]
});
assert(duplicatePacket.quality.status === 'DUPLICATE_CANDLES' && !duplicatePacket.decision.eligible, 'MarketPacket fails closed on duplicate exchange bars');

const gappedPacket = createMarketPacket({
  source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
  symbol: 'BTC/USDT',
  timeframe: '5m',
  timeframeSeconds: 300,
  observedAt: packetObservedAt,
  candles: packetCandles.filter((_, index) => index !== 30)
});
assert(gappedPacket.quality.status === 'GAPPED_CANDLES' && !gappedPacket.decision.eligible, 'MarketPacket fails closed when exchange history contains a gap');

const malformedPacketCandles = packetCandles.map(candle => ({ ...candle }));
malformedPacketCandles[20].high = malformedPacketCandles[20].low - 1;
const malformedPacket = createMarketPacket({
  source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
  symbol: 'BTC/USDT',
  timeframe: '5m',
  timeframeSeconds: 300,
  observedAt: packetObservedAt,
  candles: malformedPacketCandles
});
assert(malformedPacket.quality.status === 'MALFORMED_CANDLES' && !malformedPacket.decision.eligible, 'MarketPacket rejects malformed OHLCV before signal analysis');

const outOfOrderCandles = packetCandles.map(candle => ({ ...candle }));
[outOfOrderCandles[20], outOfOrderCandles[21]] = [outOfOrderCandles[21], outOfOrderCandles[20]];
const outOfOrderPacket = createMarketPacket({
  source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
  symbol: 'BTC/USDT',
  timeframe: '5m',
  timeframeSeconds: 300,
  observedAt: packetObservedAt,
  candles: outOfOrderCandles
});
assert(outOfOrderPacket.quality.status === 'OUT_OF_ORDER' && !outOfOrderPacket.decision.eligible, 'MarketPacket rejects out-of-order exchange bars');

const futurePacket = createMarketPacket({
  source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
  symbol: 'BTC/USDT',
  timeframe: '5m',
  timeframeSeconds: 300,
  observedAt: packetObservedAt - 600000,
  candles: packetCandles
});
assert(futurePacket.quality.status === 'FUTURE_CANDLES' && !futurePacket.decision.eligible, 'MarketPacket rejects candles whose open time is in the future');
const packetSummary = summarizeMarketPacket(verifiedPacket, { now: packetObservedAt });
assert(packetSummary.decisionEligible && packetSummary.sourceLabel === 'BINANCE KLINES' && packetSummary.closedBars === 60 && packetSummary.packetSequence === 7 && packetSummary.requestId === 'MKT_TEST_7', 'MarketPacket summary exposes truthful source, sequence, and closed-bar status for the UI');

const aiReaderInputResult = createAIReaderInput({
  marketPacket: verifiedPacket,
  asset: { id: 'BTC/USDT' },
  timeframe: { id: '5m' },
  signal: {
    action: 'BUY', confidence: 64, rationale: 'Rule evidence only', entry: 101, sl: 99, tp1: 105,
    regime: { schema: 'MARKET_REGIME_V1', type: 'TREND', direction: 'BULLISH', label: 'Bullish trend', confidenceScore: 60, evidence: ['EMA slope positive'] }
  },
  patterns: [{
    id: 'PATTERN_EVIDENCE_V1:TEST:1', type: 'TEST_CONFIRMED', name: 'Test evidence', sentiment: 'BULLISH',
    confirmed: true, status: 'CONFIRMED', confirmation: { barTime: 1, method: 'CLOSED_BAR' },
    invalidation: { condition: 'CLOSE_BELOW_LOW', price: 99 }, ruleAlignmentScore: 70
  }],
  now: packetObservedAt
});
assert(aiReaderInputResult.success && aiReaderInputResult.input.authority.executionInfluence === false
  && aiReaderInputResult.input.candles.length === 40 && Object.isFrozen(aiReaderInputResult.input), 'AI Reader accepts only a bounded immutable verified closed-bar contract with zero authority');
const aiReaderValidation = validateAIReaderOutput({
  stance: 'BULLISH', summary: 'Closed-bar evidence leans upward.', interpretation: 'Trend evidence is aligned but remains uncertain.',
  uncertainties: ['The next closed bar can invalidate the pattern.'], citedEvidenceIds: ['PATTERN_EVIDENCE_V1:TEST:1']
}, aiReaderInputResult.input, { type: 'LOCAL_OLLAMA', model: 'local-test-model', generatedAt: packetObservedAt });
assert(aiReaderValidation.accepted && aiReaderValidation.report.provider.realLLM === true
  && aiReaderValidation.report.authority.mayIssueOrders === false, 'AI Reader validates a real local-LLM shadow report without granting order authority');
assert(!validateAIReaderOutput({
  stance: 'BULLISH', summary: 'Unsafe', interpretation: 'Unsafe', uncertainties: ['Risk'], citedEvidenceIds: [], action: 'BUY'
}, aiReaderInputResult.input, { type: 'LOCAL_OLLAMA', model: 'local-test-model', generatedAt: packetObservedAt }).accepted, 'AI Reader rejects order-like fields even when a model attempts to emit them');
assert(restoreAIReaderReport(aiReaderValidation.report)?.policy === AI_READER_POLICY
  && restoreAIReaderReport({ ...aiReaderValidation.report, authority: { ...aiReaderValidation.report.authority, executionInfluence: true } }) === null,
  'Persisted AI Reader reports restore only with shadow-only authority intact');

const paperBotPattern = {
  id: 'PATTERN_EVIDENCE_V1:BOT:1', type: 'BOT_PATTERN', sentiment: 'BULLISH', confirmed: true, decisionEligible: true
};
const paperBotSignal = {
  action: 'STRONG BUY', ruleScore: 82, isExplorationProbe: false, entry: 101, sl: 99, tp1: 105,
  regime: { decisionEligible: true, direction: 'BULLISH' }, patternEvidence: [paperBotPattern]
};
const paperBotMarketDecision = evaluateMarketPacketDecisionEligibility(verifiedPacket, { now: packetObservedAt });
const paperBotAccount = { balance: 100000, equity: 100000, freeMargin: 100000 };
const disabledPaperBotState = createVerifiedPaperBotState(100000, packetObservedAt);
assert(evaluateVerifiedPaperBotDecision({ state: disabledPaperBotState, marketPacket: verifiedPacket, marketDecision: paperBotMarketDecision,
  signal: paperBotSignal, paperAccount: paperBotAccount, now: packetObservedAt }).reason === 'BOT_DISABLED', 'Verified Paper Bot starts disabled and cannot self-enable');
const enabledPaperBotState = setVerifiedPaperBotEnabled(disabledPaperBotState, true, { balanceUSD: 100000, now: packetObservedAt });
const paperBotDecision = evaluateVerifiedPaperBotDecision({
  state: enabledPaperBotState,
  marketPacket: verifiedPacket,
  marketDecision: paperBotMarketDecision,
  signal: paperBotSignal,
  positions: [],
  paperAccount: paperBotAccount,
  aiReaderReport: aiReaderValidation.report,
  now: packetObservedAt
});
assert(paperBotDecision.execute && paperBotDecision.decision.policy === VERIFIED_PAPER_BOT_POLICY
  && paperBotDecision.decision.requestedRiskPercent === 0.25 && paperBotDecision.decision.aiReader.influence === false
  && paperBotDecision.decision.authority.liveEligible === false, 'Verified Paper Bot admits a confirmed closed-bar setup at exploratory Paper risk while AI remains advisory-only');
const recordedPaperBotState = recordVerifiedPaperBotDecision(enabledPaperBotState, paperBotDecision, {
  executed: true, balanceUSD: 100000, equityUSD: 100000, now: packetObservedAt
});
assert(evaluateVerifiedPaperBotDecision({ state: recordedPaperBotState, marketPacket: verifiedPacket, marketDecision: paperBotMarketDecision,
  signal: paperBotSignal, paperAccount: paperBotAccount, now: packetObservedAt }).reason === 'CANDLE_ALREADY_EVALUATED', 'Verified Paper Bot cannot duplicate a decision on the same closed candle');
const dailyLossBotDecision = evaluateVerifiedPaperBotDecision({
  state: enabledPaperBotState, marketPacket: verifiedPacket, marketDecision: paperBotMarketDecision, signal: paperBotSignal,
  paperAccount: { balance: 100000, equity: 97000, freeMargin: 97000 }, now: packetObservedAt
});
assert(dailyLossBotDecision.reason === 'MAX_DAILY_LOSS_REACHED', 'Verified Paper Bot trips before entry after the Paper daily-loss limit');
const killedPaperBotState = armVerifiedPaperBotKillSwitch(enabledPaperBotState, { balanceUSD: 100000, now: packetObservedAt });
assert(killedPaperBotState.killSwitch && !killedPaperBotState.enabled
  && evaluateVerifiedPaperBotDecision({ state: killedPaperBotState, marketPacket: verifiedPacket, marketDecision: paperBotMarketDecision,
    signal: paperBotSignal, paperAccount: paperBotAccount, now: packetObservedAt }).reason === 'KILL_SWITCH_ARMED', 'Verified Paper Bot kill switch persists off-state and blocks all new Paper decisions');

const missingMT5Readiness = assessMT5DemoReadiness({});
assert(missingMT5Readiness.status === 'MT5_XDEMO_NOT_INSTALLED' && !missingMT5Readiness.readyForDemoOrderCertification,
  'MT5 readiness reports a truthful installation gate when no terminal evidence exists');
const uncertifiedMT5Readiness = assessMT5DemoReadiness({
  terminalInstalled: true, terminalRunning: true, pythonBridgeDependencyAvailable: true, bridgeScriptPresent: true,
  scriptIntegrityVerified: true, observerEnabled: true, observerProcessRunning: true,
  gatewayEnabled: true, accessTokenConfigured: true, demoAccountObserved: true,
  account: { server: 'XMGlobal-Demo', loginSuffix: '1234', tradeMode: 'DEMO' }, telemetryCertified: false
});
assert(uncertifiedMT5Readiness.status === 'CONTINUOUS_TELEMETRY_CERTIFICATION_REQUIRED'
  && uncertifiedMT5Readiness.authority.executionInfluence === false, 'MT5 readiness cannot skip the continuous authenticated telemetry certification gate');
const readyMT5Readiness = assessMT5DemoReadiness({
  terminalInstalled: true, terminalRunning: true, pythonBridgeDependencyAvailable: true, bridgeScriptPresent: true,
  scriptIntegrityVerified: true, observerEnabled: true, observerProcessRunning: true,
  gatewayEnabled: true, accessTokenConfigured: true, demoAccountObserved: true,
  account: { server: 'XMGlobal-Demo', loginSuffix: '1234', tradeMode: 'DEMO' }, telemetryCertified: true
});
assert(readyMT5Readiness.readyForDemoOrderCertification && readyMT5Readiness.authority.liveEligible === false,
  'Completing observer readiness permits only the next Demo certification stage and never Live authority');
const lockedDemoExecution = unlockMT5DemoExecution(createMT5DemoExecutionState(), {
  readiness: readyMT5Readiness,
  certification: {
    policy: 'CONTINUOUS_AUTHENTICATED_DEMO_TELEMETRY_V1', certified: true,
    sessionId: '0123456789abcdef0123456789abcdef', account: { tradeMode: 'DEMO' }
  },
  runtimeDemoCapability: false,
  operatorConfirmedDemo: true,
  now: packetObservedAt
});
assert(!lockedDemoExecution.success && lockedDemoExecution.state.killSwitch, 'MT5 Demo execution stays kill-switched while the release capability is disabled');
const unlockedDemoExecution = unlockMT5DemoExecution(createMT5DemoExecutionState(), {
  readiness: readyMT5Readiness,
  certification: {
    policy: 'CONTINUOUS_AUTHENTICATED_DEMO_TELEMETRY_V1', certified: true,
    sessionId: '0123456789abcdef0123456789abcdef', account: { tradeMode: 'DEMO' }
  },
  runtimeDemoCapability: true,
  operatorConfirmedDemo: true,
  now: packetObservedAt
});
const demoIntentResult = createMT5DemoOrderIntent({
  state: unlockedDemoExecution.state,
  paperBotDecision: paperBotDecision.decision,
  symbol: 'BTCUSD.demo',
  approvedSymbolMap: { 'BTC/USDT': 'BTCUSD.demo' },
  volume: 0.1,
  quote: { bid: 100.9, ask: 101 },
  stopPrice: 99,
  targetPrice: 105,
  now: packetObservedAt,
  nonce: '00112233445566778899aabbccddeeff'
});
assert(unlockedDemoExecution.success && demoIntentResult.success && demoIntentResult.intent.mode === 'DEMO'
  && demoIntentResult.intent.liveEligible === false && demoIntentResult.intent.simulatedFallbackAllowed === false,
  'Certified MT5 Demo gate creates only short-lived allowlisted Demo intents with no fallback or Live authority');
const demoAckValidation = validateMT5DemoOrderAcknowledgement({
  schemaVersion: MT5_DEMO_ORDER_ACK_SCHEMA,
  source: MT5_DEMO_PACKET_SOURCE,
  mode: 'DEMO',
  intentId: demoIntentResult.intent.intentId,
  nonce: demoIntentResult.intent.nonce,
  accepted: true,
  ticket: '900001',
  symbol: 'BTCUSD.demo',
  side: 'BUY',
  volume: 0.1,
  acceptedPrice: 101,
  stopPrice: 99,
  targetPrice: 105,
  magic: 99001
}, demoIntentResult.intent, { transportAuthenticated: true, now: packetObservedAt + 1000 });
const demoExecutionAfterAck = recordMT5DemoOrderAcknowledgement(unlockedDemoExecution.state, demoAckValidation);
assert(demoAckValidation.accepted && demoExecutionAfterAck.expectedTickets.includes('900001'), 'Authenticated MT5 Demo acknowledgement becomes an expected reconciliation ticket');
assert(!createMT5DemoOrderIntent({ state: armMT5DemoExecutionKillSwitch(), paperBotDecision: paperBotDecision.decision }).success,
  'MT5 Demo kill switch blocks intent creation before any broker request can exist');

assert(hasVerifiedMarketDataAdapter('BTC/USDT') && !hasVerifiedMarketDataAdapter('EUR/USD'), 'Market adapter registry distinguishes verified exchange routes from Simulation-only assets');
assert(calculateMarketDataRefreshDelay({ timeframeSeconds: 60 }) === 15000 && calculateMarketDataRefreshDelay({ timeframeSeconds: 300 }) === 60000, 'Healthy refresh cadence is bounded to protect the source from excessive polling');
assert(calculateMarketDataRefreshDelay({ consecutiveFailures: 1 }) === 5000 && calculateMarketDataRefreshDelay({ consecutiveFailures: 2 }) === 10000 && calculateMarketDataRefreshDelay({ adapterSupported: false }) === null, 'Failed refresh attempts use bounded exponential backoff and unsupported assets do not poll');

let healthState = createMarketDataHealth({ symbol: 'BTC/USDT', timeframe: '5m', now: packetObservedAt });
healthState = beginMarketDataAttempt(healthState, { requestId: 'health-1', at: packetObservedAt + 1 });
healthState = settleMarketDataAttempt(healthState, { outcome: MARKET_DATA_ATTEMPT_OUTCOME.SUCCESS, at: packetObservedAt + 2, packetSequence: 1, timeframeSeconds: 300 });
assert(healthState.status === MARKET_DATA_HEALTH_STATUS.HEALTHY && healthState.successCount === 1 && healthState.consecutiveFailures === 0, 'Source health becomes healthy only after a successful verified packet');
healthState = beginMarketDataAttempt(healthState, { requestId: 'health-2', at: packetObservedAt + 3 });
healthState = settleMarketDataAttempt(healthState, { outcome: MARKET_DATA_ATTEMPT_OUTCOME.NO_DATA, reason: 'NO_DATA_FROM_ADAPTER', at: packetObservedAt + 4, timeframeSeconds: 300 });
assert(healthState.status === MARKET_DATA_HEALTH_STATUS.DEGRADED && healthState.consecutiveFailures === 1 && healthState.nextRefreshAtMs === packetObservedAt + 5004, 'A failed refresh degrades a previously healthy source and schedules the first retry');

const healthEvidence = createMarketDataEvidence({
  requestId: 'evidence-1', generation: 2, source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
  symbol: 'BTC/USDT', timeframe: '5m', startedAt: packetObservedAt, finishedAt: packetObservedAt + 25,
  outcome: MARKET_DATA_ATTEMPT_OUTCOME.SUCCESS, packet: verifiedPacket, rawCandleCount: packetCandles.length
});
assert(Object.isFrozen(healthEvidence) && healthEvidence.durationMs === 25 && healthEvidence.packetSequence === 7 && healthEvidence.rawCandleCount === 61, 'Each refresh produces immutable bounded request evidence without storing credentials');

const pipelineNow = Date.now();
const pipelineCandles = makeMarketPacketCandles(pipelineNow, 80);
let pipelineFetchCalls = 0;
const pipelineEngine = new AITradingEngine({
  marketDataFetch: async () => {
    pipelineFetchCalls += 1;
    return pipelineCandles;
  }
});
pipelineEngine.requestRender = () => {};
const initialPipelineLoad = await pipelineEngine.loadCandles();
assert(initialPipelineLoad.success && pipelineFetchCalls === 1 && pipelineEngine.marketDataHealth.status === MARKET_DATA_HEALTH_STATUS.HEALTHY, 'Engine initial load adopts one verified snapshot and marks the source healthy');
assert(pipelineEngine.marketPacket.sequence === 1 && pipelineEngine.marketDataEvidence[0]?.outcome === MARKET_DATA_ATTEMPT_OUTCOME.SUCCESS, 'Engine links the active packet to its successful request evidence');

const retainedVerifiedPacket = pipelineEngine.marketPacket;
pipelineEngine.marketDataFetch = async () => null;
const degradedRefresh = await pipelineEngine.refreshMarketDataSnapshot();
assert(!degradedRefresh.success && pipelineEngine.marketDataHealth.status === MARKET_DATA_HEALTH_STATUS.DEGRADED && pipelineEngine.marketPacket === retainedVerifiedPacket, 'Transient source failure retains the last immutable verified packet instead of replacing it with random data');
assert(pipelineEngine.marketDataHealth.consecutiveFailures === 1 && pipelineEngine.marketDataEvidence[0]?.outcome === MARKET_DATA_ATTEMPT_OUTCOME.NO_DATA, 'Transient failure records evidence and begins exponential retry state');

pipelineEngine.marketDataFetch = async () => makeMarketPacketCandles(Date.now(), 80);
const recoveredRefresh = await pipelineEngine.refreshMarketDataSnapshot();
assert(recoveredRefresh.success && pipelineEngine.marketDataHealth.status === MARKET_DATA_HEALTH_STATUS.HEALTHY && pipelineEngine.marketDataHealth.consecutiveFailures === 0 && pipelineEngine.marketPacket.sequence > retainedVerifiedPacket.sequence, 'A later verified response recovers health and advances packet sequence monotonically');
assert(pipelineEngine.startMarketDataRefreshLoop({ immediate: false }) && pipelineEngine.marketDataTimer, 'Healthy source starts one automatic refresh timer');
pipelineEngine.stopMarketDataRefreshLoop({ invalidate: false });
assert(pipelineEngine.marketDataTimer === null && pipelineEngine.marketDataRefreshEnabled === false, 'Automatic source refresh timer stops cleanly with the Trade view');
pipelineEngine.startMarketDataRefreshLoop({ immediate: false });
pipelineEngine.startReplay();
assert(pipelineEngine.isReplayMode && pipelineEngine.marketDataTimer === null && pipelineEngine.marketDataRefreshEnabled === false, 'Chart replay invalidates pending source refresh so a live response cannot overwrite historical candles');
pipelineEngine.exitReplay();
assert(!pipelineEngine.isReplayMode && pipelineEngine.marketDataRefreshEnabled && pipelineEngine.marketDataTimer, 'Leaving chart replay resumes verified source refresh immediately');
pipelineEngine.stopMarketDataRefreshLoop({ invalidate: false });

let resolveOverlapFetch;
let overlapFetchCalls = 0;
const overlapEngine = new AITradingEngine({
  marketDataFetch: () => {
    overlapFetchCalls += 1;
    return new Promise(resolve => { resolveOverlapFetch = resolve; });
  }
});
overlapEngine.requestRender = () => {};
const overlapPending = overlapEngine.loadCandles();
const overlapRejected = await overlapEngine.refreshMarketDataSnapshot();
assert(overlapRejected.reason === 'REFRESH_ALREADY_IN_FLIGHT' && overlapFetchCalls === 1, 'Automatic pipeline cannot issue overlapping requests for the same market generation');
resolveOverlapFetch(pipelineCandles);
await overlapPending;

let unsupportedFetchCalls = 0;
const unsupportedPipelineEngine = new AITradingEngine({ marketDataFetch: async () => { unsupportedFetchCalls += 1; return pipelineCandles; } });
unsupportedPipelineEngine.requestRender = () => {};
unsupportedPipelineEngine.activeAsset = findTradingAsset('EUR/USD');
const unsupportedLoad = await unsupportedPipelineEngine.loadCandles();
assert(!unsupportedLoad.success && unsupportedFetchCalls === 0 && unsupportedPipelineEngine.marketPacket.provenance.simulation === true, 'Assets without a verified adapter enter Simulation Lab without making a misleading exchange request');
assert(unsupportedPipelineEngine.marketDataHealth.status === MARKET_DATA_HEALTH_STATUS.SIMULATION && unsupportedPipelineEngine.marketDataHealth.nextRefreshAtMs === null, 'Simulation-only source health is explicit and does not schedule futile retries');

let resolveSupersededFetch;
const supersededEngine = new AITradingEngine({ marketDataFetch: () => new Promise(resolve => { resolveSupersededFetch = resolve; }) });
supersededEngine.requestRender = () => {};
const supersededPending = supersededEngine.loadCandles();
supersededEngine.marketDataStreamGeneration += 1;
resolveSupersededFetch(pipelineCandles);
const supersededResult = await supersededPending;
assert(supersededResult.reason === 'SUPERSEDED_MARKET_REQUEST' && supersededEngine.marketPacket === null && supersededEngine.marketDataEvidence[0]?.outcome === MARKET_DATA_ATTEMPT_OUTCOME.SUPERSEDED, 'A late response from an older generation cannot overwrite the active market target');

const paginationUrls = [];
const paginatedCandles = await fetchHistoricalExchangeCandles('BTC/USDT', '5m', 700, {
  fetchImpl: async url => {
    paginationUrls.push(url);
    const parsedUrl = new URL(url);
    const batchLimit = Number(parsedUrl.searchParams.get('limit'));
    const endTime = Number(parsedUrl.searchParams.get('endTime')) || 1750000000000;
    const firstTime = endTime - (batchLimit - 1) * 300000;
    const payload = Array.from({ length: batchLimit }, (_, index) => {
      const openTime = firstTime + index * 300000;
      const price = 100 + (openTime % 1000000) / 1000000;
      return [openTime, String(price), String(price + 1), String(price - 1), String(price + 0.2), '10'];
    });
    return { ok: true, json: async () => payload };
  }
});
assert(paginatedCandles?.length === 700 && paginationUrls.length === 2 && paginationUrls[1].includes('endTime='), 'Binance history adapter paginates into an ordered de-duplicated dataset');

let duplicatePageCalls = 0;
const duplicatePayload = Array.from({ length: 500 }, (_, index) => {
  const openTime = 1740000000000 + index * 300000;
  return [openTime, '100', '101', '99', '100.2', '10'];
});
const duplicatePageCandles = await fetchHistoricalExchangeCandles('BTC/USDT', '5m', 700, {
  fetchImpl: async () => {
    duplicatePageCalls += 1;
    return { ok: true, json: async () => duplicatePayload };
  }
});
assert(duplicatePageCandles?.length === 500 && duplicatePageCalls === 2, 'Binance history adapter stops safely when a provider repeats the same page');

const indicatorCandles = Array.from({ length: 30 }, (_, index) => ({ close: 100 + index }));
assert(calculateEMA(indicatorCandles, 5).length === 30, 'EMA core preserves candle alignment');
const bands = calculateBollingerBands(indicatorCandles, 5);
assert(bands.upper[29] > bands.middle[29] && bands.middle[29] > bands.lower[29], 'Bollinger core preserves band ordering');
assert(calculateRSI(indicatorCandles, 14).every(value => value >= 0 && value <= 100), 'RSI core remains bounded');
assert(calculateMACD(indicatorCandles).histogram.length === 30, 'MACD core preserves candle alignment');

const legacySpread = calculateLegacySpread(findTradingAsset('BTC/USDT'), 100, null, null);
assert(legacySpread.source === 'SIMULATED_SPREAD_MODEL', 'Legacy trading facade delegates to the new labeled core');

const targetScore = calculateTargetScore(100, 102, 99, { type: 'TRENDING_MOMENTUM' }, 50);
assert(targetScore.method === TARGET_SCORE_METHOD && targetScore.calibrated === false, 'Target setup output is labeled as an uncalibrated deterministic score');
assert(targetScore.scorePercent === calculateTargetScore(100, 102, 99, { type: 'TRENDING_MOMENTUM' }, 50).scorePercent, 'Target rule score is deterministic');
assert(calculateTargetScore(100, 100, 100, null, 50).valid === false, 'Target rule score rejects zero-distance setup inputs');

const paperPosition = createPaperPosition({ id: 'p1', assetId: 'BTC/USDT', side: 'LONG', entryPrice: 101, marginUSD: 1000, leverage: 10 });
const markedPosition = markPaperPosition(paperPosition, 99);
const account = summarizePaperAccount(100000, [markedPosition]);
assert(account.usedMargin === 1000 && account.equity === 99801.98 && account.freeMargin === 98801.98, 'Paper account separates balance, locked margin, unrealized PnL, and equity');
assert(settlePaperPosition(100000, markedPosition) === account.equity, 'Closing a paper position realizes PnL without returning margin twice');
assert(normalizeRiskPercent(99) === 5 && normalizeRiskPercent(-2) === 0.1, 'Paper risk percentage is clamped to the supported safety range');

const cryptoSize = calculatePaperPositionSize({ asset: findTradingAsset('BTC/USDT'), entryPrice: 100, stopPrice: 99, equityUSD: 100000, freeMarginUSD: 100000, riskPercent: 2, leverage: 10 });
assert(cryptoSize.sizeUnit === 'UNITS' && cryptoSize.requiredMarginUSD === 20000 && cryptoSize.actualRiskUSD === 2000, 'Crypto sizing converts stop risk into notional, quantity, and required margin');
const fxSize = calculatePaperPositionSize({ asset: findTradingAsset('EUR/USD'), entryPrice: 1, stopPrice: 0.99, equityUSD: 10000, freeMarginUSD: 10000, riskPercent: 1, leverage: 10 });
assert(fxSize.sizeUnit === 'LOTS' && fxSize.sizeValue === 0.1, 'Contract-based instruments report lots instead of crypto units');

const operatorA = Object.create(AITradingEngine.prototype);
operatorA.app = { username: 'Trader_A' };
const operatorB = Object.create(AITradingEngine.prototype);
operatorB.app = { username: 'Trader_B' };
assert(operatorA.getGymStorageKey() !== operatorB.getGymStorageKey(), 'Paper Trade browser storage is isolated per operator');
assert(Object.values(DEFAULT_STRATEGY_WEIGHTS).every(weight => weight.wins === 0 && weight.losses === 0 && weight.weightMultiplier === 1), 'New operators start with neutral strategy weights and no fabricated trade history');
const evidenceProfileEngine = Object.create(AITradingEngine.prototype);
evidenceProfileEngine.strategyWeights = JSON.parse(JSON.stringify(DEFAULT_STRATEGY_WEIGHTS));
evidenceProfileEngine.aiJournal = [];
assert(evidenceProfileEngine.getSetupMastery().every(setup => setup.count === 0 && setup.mastery === null && setup.status === 'UNOBSERVED'), 'Pattern profile exposes zero observations instead of fabricated mastery percentages');
assert(evidenceProfileEngine.seedInitialAIJournal() === false && evidenceProfileEngine.aiJournal.length === 0, 'Fabricated starter journal seeding is disabled');

const legacyDemoState = {
  stats: { totalTrades: 18, wins: 14, losses: 4, winRate: 77.8, netPnlUSD: 8420.5, samplesStudied: 3420 },
  journal: [{ id: 'AI_TR_01' }, { id: 'AI_TR_02' }, { id: 'AI_TR_03' }]
};
assert(isLegacyDemoSeed(legacyDemoState), 'Legacy fabricated starter history is detected by an exact signature');
assert(migrateLegacyDemoSeed(legacyDemoState).state.stats.totalTrades === 0, 'Exact legacy starter history migrates to a truthful zero baseline');
assert(!isLegacyDemoSeed({ ...legacyDemoState, stats: { ...legacyDemoState.stats, totalTrades: 19 } }), 'User-modified Paper history is not mistaken for the legacy demo seed');

const countercheck = evaluateRuleCountercheck([], null, null, 50, 100);
assert(countercheck.method === RULE_COUNTERCHECK_METHOD && countercheck.independentAgents === false, 'Bull-vs-risk countercheck is labeled as one deterministic rule module, not multiple AI agents');
assert(countercheck.orderBook.source === 'NO_VERIFIED_DATA', 'Rule countercheck refuses to infer whale flow without verified order-book data');

const signalCandles = Array.from({ length: 80 }, (_, index) => {
  const open = 100 + index * 0.2;
  const close = open + 0.1;
  return { time: 1710000000000 + index * 300000, open, high: close + 0.2, low: open - 0.2, close, volume: 100 + index };
});
const signalAsset = findTradingAsset('BTC/USDT');
const signalSpread = calculateCoreSpread(signalAsset, signalCandles.at(-1).close, signalCandles.at(-1), null, () => 0.5);

const confirmedEngulfingCandles = Array.from({ length: 60 }, (_, index) => {
  const open = 100 + (index % 2) * 0.03;
  const close = open + 0.02;
  return { time: 1720000000000 + index * 300000, open, high: open + 0.3, low: open - 0.3, close, volume: 100 + index };
});
confirmedEngulfingCandles[57] = { ...confirmedEngulfingCandles[57], open: 100.4, high: 100.6, low: 99.2, close: 99.5 };
confirmedEngulfingCandles[58] = { ...confirmedEngulfingCandles[58], open: 99.4, high: 100.8, low: 99.2, close: 100.6 };
confirmedEngulfingCandles[59] = { ...confirmedEngulfingCandles[59], open: 100.6, high: 101.2, low: 100.5, close: 101.0 };
const confirmedEngulfingPatterns = detectConfirmedChartPatterns(confirmedEngulfingCandles);
const confirmedEngulfing = confirmedEngulfingPatterns.find(pattern => pattern.type === 'BULLISH_ENGULFING_CONFIRMED');
assert(confirmedEngulfing?.schema === PATTERN_EVIDENCE_SCHEMA && confirmedEngulfing.confirmed && confirmedEngulfing.decisionEligible, 'Pattern engine admits a bullish engulfing only after the next closed bar confirms above the setup high');
assert(Object.isFrozen(confirmedEngulfingPatterns) && Object.isFrozen(confirmedEngulfing) && Object.isFrozen(confirmedEngulfing.evidence) && Object.isFrozen(confirmedEngulfing.confirmation) && Object.isFrozen(confirmedEngulfing.invalidation), 'Confirmed pattern evidence, confirmation, and invalidation contracts are immutable');
assert(detectConfirmedChartPatterns(confirmedEngulfingCandles).find(pattern => pattern.type === 'BULLISH_ENGULFING_CONFIRMED')?.id === confirmedEngulfing.id, 'Confirmed pattern IDs are deterministic for the same closed-bar evidence');
const earlierPatternPrefix = Array.from({ length: 5 }, (_, index) => ({
  time: confirmedEngulfingCandles[0].time - (5 - index) * 300000,
  open: 100,
  high: 100.3,
  low: 99.7,
  close: 100.02,
  volume: 80 + index
}));
assert(detectConfirmedChartPatterns([...earlierPatternPrefix, ...confirmedEngulfingCandles]).find(pattern => pattern.type === 'BULLISH_ENGULFING_CONFIRMED')?.id === confirmedEngulfing.id, 'Pattern ID remains stable when older history is prepended because anchors use exchange times, not array positions');

const unconfirmedEngulfingCandles = confirmedEngulfingCandles.map(candle => ({ ...candle }));
unconfirmedEngulfingCandles[59] = { ...unconfirmedEngulfingCandles[59], open: 100.6, high: 100.75, low: 100.5, close: 100.7 };
assert(!detectConfirmedChartPatterns(unconfirmedEngulfingCandles).some(pattern => pattern.type === 'BULLISH_ENGULFING_CONFIRMED'), 'A visually plausible engulfing setup has zero decision authority before confirmation closes above its high');
const formingConfirmationCandles = confirmedEngulfingCandles.map((candle, index) => index === 59 ? { ...candle, barClosed: false } : { ...candle });
assert(!detectConfirmedChartPatterns(formingConfirmationCandles).some(pattern => pattern.type === 'BULLISH_ENGULFING_CONFIRMED'), 'A still-forming confirmation bar cannot confirm a chart pattern');
const interleavedFormingCandles = confirmedEngulfingCandles.map((candle, index) => index === 58 ? { ...candle, barClosed: false } : { ...candle });
assert(detectConfirmedChartPatterns(interleavedFormingCandles).length === 0, 'Pattern evidence fails closed when a forming bar appears inside the closed-bar sequence');
const duplicatePatternTimeCandles = confirmedEngulfingCandles.map((candle, index) => index === 59 ? { ...candle, time: confirmedEngulfingCandles[58].time } : { ...candle });
assert(detectConfirmedChartPatterns(duplicatePatternTimeCandles).length === 0 && detectEvidenceBasedMarketRegime(duplicatePatternTimeCandles).type === 'INVALID_EVIDENCE', 'Duplicate or out-of-order timestamps invalidate Pattern and Regime evidence');

const doubleBottomCandles = Array.from({ length: 30 }, (_, index) => ({
  time: 1730000000000 + index * 300000,
  open: 104,
  high: 104.5,
  low: 103.5,
  close: 104.1,
  volume: 200 + index
}));
doubleBottomCandles[8] = { ...doubleBottomCandles[8], open: 102, high: 102.5, low: 100, close: 101.5 };
doubleBottomCandles[12] = { ...doubleBottomCandles[12], open: 104.5, high: 106, low: 104, close: 105.5 };
doubleBottomCandles[18] = { ...doubleBottomCandles[18], open: 102, high: 102.4, low: 100.1, close: 101.7 };
doubleBottomCandles[28] = { ...doubleBottomCandles[28], open: 105, high: 105.8, low: 104.8, close: 105.5 };
doubleBottomCandles[29] = { ...doubleBottomCandles[29], open: 105.5, high: 106, low: 105.3, close: 105.9 };
assert(!detectConfirmedChartPatterns(doubleBottomCandles).some(pattern => pattern.type === 'DOUBLE_BOTTOM_BREAKOUT_CONFIRMED'), 'Two similar lows alone are not mislabeled as a confirmed Double Bottom without a neckline breakout');
const confirmedDoubleBottomCandles = doubleBottomCandles.map(candle => ({ ...candle }));
confirmedDoubleBottomCandles[29] = { ...confirmedDoubleBottomCandles[29], open: 105.8, high: 106.7, low: 105.7, close: 106.5 };
assert(detectConfirmedChartPatterns(confirmedDoubleBottomCandles).some(pattern => pattern.type === 'DOUBLE_BOTTOM_BREAKOUT_CONFIRMED'), 'Double Bottom gains decision authority only after a closed-bar neckline breakout');

const insufficientRegime = detectEvidenceBasedMarketRegime(confirmedEngulfingCandles.slice(0, 49));
assert(insufficientRegime.schema === MARKET_REGIME_SCHEMA && insufficientRegime.type === 'INSUFFICIENT_EVIDENCE' && insufficientRegime.decisionEligible === false, 'Market regime fails closed instead of inventing a Range classification below 50 closed bars');
const trendingRegime = detectEvidenceBasedMarketRegime(signalCandles);
assert(trendingRegime.schema === MARKET_REGIME_SCHEMA && trendingRegime.type === 'TRENDING_MOMENTUM' && trendingRegime.direction === 'BULLISH' && trendingRegime.decisionEligible, 'EMA separation, slope, band width, and five-bar alignment confirm a bullish trend regime');
assert(Object.isFrozen(trendingRegime) && Object.isFrozen(trendingRegime.evidence) && Object.isFrozen(trendingRegime.invalidation), 'Market regime evidence and invalidation contracts are immutable');
const formingOutlierCandles = [...signalCandles, { time: signalCandles.at(-1).time + 300000, open: 116, high: 250, low: 20, close: 30, volume: 9999, barClosed: false }];
assert(detectEvidenceBasedMarketRegime(formingOutlierCandles).id === trendingRegime.id, 'A forming-bar outlier cannot repaint the confirmed market regime');
const widenedSpreadRegime = detectEvidenceBasedMarketRegime(signalCandles, { spreadInfo: { isWidened: true, source: 'TEST_SPREAD' } });
assert(widenedSpreadRegime.type === trendingRegime.type && widenedSpreadRegime.evidence.spreadInfluence === false && widenedSpreadRegime.evidence.executionSpreadWidened === true, 'Execution spread is recorded but cannot masquerade as price-derived market regime evidence');
const malformedRegimeCandles = signalCandles.map((candle, index) => index === 30 ? { ...candle, high: candle.low - 1 } : { ...candle });
assert(detectEvidenceBasedMarketRegime(malformedRegimeCandles).type === 'INVALID_EVIDENCE' && detectEvidenceBasedMarketRegime(malformedRegimeCandles).decisionEligible === false, 'Malformed closed bars invalidate the entire regime window instead of being silently skipped');
const bearishRegimeCandles = Array.from({ length: 80 }, (_, index) => {
  const open = 120 - index * 0.2;
  const close = open - 0.1;
  return { time: 1735000000000 + index * 300000, open, high: open + 0.2, low: close - 0.2, close, volume: 250 + index };
});
const bearishRegime = detectEvidenceBasedMarketRegime(bearishRegimeCandles);
const bearishRegimeCountercheck = evaluateRuleCountercheck([], bearishRegime, null, 50, bearishRegimeCandles.at(-1).close);
assert(bearishRegime.direction === 'BEARISH' && bearishRegimeCountercheck.riskFactors.some(factor => factor.includes('Bearish Momentum Trend')), 'Bearish trend evidence is treated as risk, never as a bullish factor');
const flatRegimeCandles = Array.from({ length: 80 }, (_, index) => {
  const open = 100 + (index % 2 === 0 ? -0.01 : 0.01);
  const close = 100 + (index % 3 === 0 ? 0.01 : -0.01);
  return { time: 1740000000000 + index * 300000, open, high: Math.max(open, close) + 0.02, low: Math.min(open, close) - 0.02, close, volume: 300 + index };
});
assert(detectEvidenceBasedMarketRegime(flatRegimeCandles).type === 'RANGE_COMPRESSION', 'Low band width and flat EMA evidence classify a closed-bar Range Compression');

const integratedSignal = generateAISignal(signalCandles, signalAsset, [], null, DEFAULT_STRATEGY_WEIGHTS, signalSpread, null, 'balanced');
assert(integratedSignal.targetScore?.calibrated === false && integratedSignal.ruleCountercheck?.independentAgents === false, 'Integrated signal path returns the truthful rule-score and single countercheck contracts');
assert(integratedSignal.quantDesk?.agents?.length === 4, 'Integrated signal path completes all four deterministic analysis modules');
const injectedLegacyPatternSignal = generateAISignal(signalCandles, signalAsset, [{ name: 'Injected Pattern', weight: 999999 }], null, DEFAULT_STRATEGY_WEIGHTS, signalSpread, null, 'balanced');
const injectedCounterfeitPatternSignal = generateAISignal(signalCandles, signalAsset, [{ schema: PATTERN_EVIDENCE_SCHEMA, id: 'FAKE', confirmed: true, decisionEligible: true, name: 'Counterfeit', weight: 999999 }], null, DEFAULT_STRATEGY_WEIGHTS, signalSpread, null, 'balanced');
assert(injectedLegacyPatternSignal.action === integratedSignal.action && injectedLegacyPatternSignal.ruleScore === integratedSignal.ruleScore && injectedCounterfeitPatternSignal.ruleScore === integratedSignal.ruleScore, 'Caller-supplied legacy or counterfeit patterns cannot inject score; the signal independently derives evidence from candles');
const integratedConfirmedPatternSignal = generateAISignal(confirmedEngulfingCandles, signalAsset, [], null, DEFAULT_STRATEGY_WEIGHTS, signalSpread, null, 'balanced');
assert(integratedConfirmedPatternSignal.patternEvidence.some(pattern => pattern.id === confirmedEngulfing.id), 'Integrated signal exposes the exact confirmed pattern evidence it used');
const insufficientRegimeSignal = generateAISignal(signalCandles.slice(0, 49), signalAsset, [], null, DEFAULT_STRATEGY_WEIGHTS, signalSpread, null, 'balanced');
assert(insufficientRegimeSignal.action === 'INSUFFICIENT REGIME DATA / HOLD' && insufficientRegimeSignal.regime.decisionEligible === false && insufficientRegimeSignal.targetScore.valid === false, 'Signal and target score fail closed until the market regime has 50 closed bars');

const patternResearchCandles = confirmedEngulfingCandles.map(candle => ({ ...candle }));
patternResearchCandles.push(
  { time: confirmedEngulfingCandles.at(-1).time + 300000, open: 101, high: 102, low: 100.5, close: 101.8, volume: 500 },
  { time: confirmedEngulfingCandles.at(-1).time + 600000, open: 101.8, high: 105, low: 101.5, close: 104.8, volume: 520 }
);
for (let index = 62; index < 80; index += 1) {
  patternResearchCandles.push({
    time: confirmedEngulfingCandles[0].time + index * 300000,
    open: 104.8,
    high: 105,
    low: 104.6,
    close: 104.85,
    volume: 500 + index
  });
}
const researchMetadata = {
  source: 'BINANCE_KLINES_REST',
  adapter: 'TEST VERIFIED HISTORY',
  assetId: 'BTC/USDT',
  timeframe: '5m',
  timeframeSeconds: 300,
  collectedAt: patternResearchCandles.at(-1).time + 300000,
  verified: true,
  simulation: false
};
const patternResearch = buildPatternOutcomeResearchDataset(patternResearchCandles, researchMetadata, {
  horizonBars: 5,
  targetR: 2,
  roundTripCostBps: 10,
  slippageBps: 0
});
const engulfingResearchSample = patternResearch.samples.find(sample => sample.pattern.id === confirmedEngulfing.id);
assert(patternResearch.success && patternResearch.method === PATTERN_RESEARCH_METHOD && patternResearch.stage === PATTERN_RESEARCH_STAGE && patternResearch.decisionEligible === false && patternResearch.weightInfluence === false, 'Pattern outcome dataset is explicitly Research Shadow with zero decision and weight authority');
assert(engulfingResearchSample?.status === 'COMPLETED' && engulfingResearchSample.outcome.code === 'TARGET_HIT' && engulfingResearchSample.entryIndex === 60 && engulfingResearchSample.exitIndex === 61, 'Confirmed Pattern enters only at the next bar open and labels the first future target hit');
assert(engulfingResearchSample.signalTime < engulfingResearchSample.entryTime && engulfingResearchSample.entryTime <= engulfingResearchSample.labelTime && engulfingResearchSample.leakageAudit.historyEndsAtSignal, 'Pattern label records an auditable no-lookahead signal, entry, and label timeline');
assert(engulfingResearchSample.outcome.maximumFavorableExcursionR >= 2 && engulfingResearchSample.outcome.maximumAdverseExcursionR >= 0 && engulfingResearchSample.outcome.netReturnR < 2, 'Pattern research records MFE/MAE and subtracts configured costs from R outcome');
assert(Object.isFrozen(patternResearch) && Object.isFrozen(patternResearch.samples) && Object.isFrozen(engulfingResearchSample.outcome) && patternResearch.summary.promotionEligible === false, 'Research dataset, outcomes, and descriptive summaries are immutable and cannot self-promote');

const researchPrefix = buildPatternOutcomeResearchDataset(patternResearchCandles.slice(0, 62), {
  ...researchMetadata,
  collectedAt: patternResearchCandles[61].time + 300000
}, { horizonBars: 5, targetR: 2, roundTripCostBps: 10, slippageBps: 0 });
const prefixSample = researchPrefix.samples.find(sample => sample.pattern.id === confirmedEngulfing.id);
assert(prefixSample?.outcome.code === engulfingResearchSample.outcome.code && prefixSample.outcome.netReturnR === engulfingResearchSample.outcome.netReturnR && prefixSample.labelTime === engulfingResearchSample.labelTime, 'A label resolved at an early barrier is identical when later candles are unavailable');

const mutatedAfterLabelCandles = patternResearchCandles.map((candle, index) => index > 61
  ? { ...candle, open: 80, high: 81, low: 79, close: 80.5 }
  : { ...candle });
const mutatedAfterLabelResearch = buildPatternOutcomeResearchDataset(mutatedAfterLabelCandles, researchMetadata, { horizonBars: 5, targetR: 2, roundTripCostBps: 10, slippageBps: 0 });
const mutatedAfterLabelSample = mutatedAfterLabelResearch.samples.find(sample => sample.pattern.id === confirmedEngulfing.id);
assert(mutatedAfterLabelSample?.outcome.netReturnR === engulfingResearchSample.outcome.netReturnR && mutatedAfterLabelSample.exitTime === engulfingResearchSample.exitTime, 'Changing candles after a resolved label cannot rewrite the earlier Pattern outcome');

const pendingResearch = buildPatternOutcomeResearchDataset(patternResearchCandles.slice(0, 61), {
  ...researchMetadata,
  collectedAt: patternResearchCandles[60].time + 300000
}, { horizonBars: 5, targetR: 2, roundTripCostBps: 10, slippageBps: 0 });
assert(pendingResearch.samples.find(sample => sample.pattern.id === confirmedEngulfing.id)?.status === 'PENDING', 'Right-edge Pattern remains pending when neither barrier nor the full horizon is available');

const collisionCandlesResearch = patternResearchCandles.map(candle => ({ ...candle }));
collisionCandlesResearch[60] = { ...collisionCandlesResearch[60], open: 101, high: 105, low: 98, close: 101 };
const collisionResearch = buildPatternOutcomeResearchDataset(collisionCandlesResearch, researchMetadata, { horizonBars: 5, targetR: 2, roundTripCostBps: 0, slippageBps: 0 });
assert(collisionResearch.samples.find(sample => sample.pattern.id === confirmedEngulfing.id)?.outcome.exitReason === 'STOP_AND_TARGET_SAME_BAR_CONSERVATIVE_STOP', 'Ambiguous same-bar Pattern target/stop collision is labeled as the conservative stop');

const rejectedResearchSource = buildPatternOutcomeResearchDataset(patternResearchCandles, { ...researchMetadata, verified: false }, { horizonBars: 5 });
assert(!rejectedResearchSource.success && rejectedResearchSource.status === 'SOURCE_REJECTED' && rejectedResearchSource.samples.length === 0, 'Pattern research rejects unverified or Simulation market history');
const tamperedResearch = JSON.parse(JSON.stringify(patternResearch));
tamperedResearch.decisionEligible = true;
tamperedResearch.weightInfluence = true;
tamperedResearch.summary.promotionEligible = true;
tamperedResearch.samples[0].decisionEligible = true;
const restoredResearch = restorePatternOutcomeResearchDataset(tamperedResearch);
assert(restoredResearch?.decisionEligible === false && restoredResearch.weightInfluence === false && restoredResearch.summary.promotionEligible === false && restoredResearch.samples.every(sample => sample.decisionEligible === false), 'Persisted Pattern research is revalidated and cannot restore forged trading authority');

const engineResearchStart = 1755000000000;
const engineResearchNow = engineResearchStart + 120 * 300000;
let engineResearchCallbackCount = 0;
const engineResearch = new AITradingEngine({
  onPatternResearchUpdate: () => { engineResearchCallbackCount += 1; }
});
engineResearch.saveGymState = () => {};
const engineResearchResult = await engineResearch.runPatternResearchEvaluation({
  totalBars: 120,
  now: engineResearchNow,
  fetchOptions: {
    fetchImpl: async url => {
      const limit = Number(new URL(url).searchParams.get('limit'));
      const payload = Array.from({ length: limit }, (_, index) => {
        const openTime = engineResearchStart + index * 300000;
        return [openTime, '100', '100.3', '99.7', '100.02', '10', openTime + 299999];
      });
      return { ok: true, json: async () => payload };
    }
  }
});
assert(engineResearchResult.success && engineResearch.patternResearchDataset === engineResearchResult.dataset && engineResearchCallbackCount === 1, 'Trade engine can fetch verified closed history, build the Research Dataset, and publish it without execution authority');
let resolveResearchFetch;
const supersededPatternResearchEngine = new AITradingEngine();
supersededPatternResearchEngine.saveGymState = () => {};
const supersededPatternResearchPending = supersededPatternResearchEngine.runPatternResearchEvaluation({
  totalBars: 120,
  now: engineResearchNow,
  fetchOptions: {
    fetchImpl: () => new Promise(resolve => {
      resolveResearchFetch = () => resolve({
        ok: true,
        json: async () => Array.from({ length: 120 }, (_, index) => {
          const openTime = engineResearchStart + index * 300000;
          return [openTime, '100', '100.3', '99.7', '100.02', '10', openTime + 299999];
        })
      });
    })
  }
});
supersededPatternResearchEngine.patternResearchGeneration += 1;
resolveResearchFetch();
const supersededPatternResearchResult = await supersededPatternResearchPending;
assert(!supersededPatternResearchResult.success && supersededPatternResearchResult.reason === 'PATTERN_RESEARCH_SUPERSEDED' && supersededPatternResearchEngine.patternResearchDataset === null, 'A superseded Pattern research request cannot overwrite the active market research state');

const paperEngine = Object.create(AITradingEngine.prototype);
const paperPacketObservedAt = Date.now();
const paperPacketCandles = makeMarketPacketCandles(paperPacketObservedAt);
const verifiedPaperPacket = createMarketPacket({
  source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
  adapter: 'BINANCE KLINES',
  symbol: 'BTC/USDT',
  timeframe: '5m',
  timeframeSeconds: 300,
  observedAt: paperPacketObservedAt,
  candles: paperPacketCandles
});
paperEngine.marketPacket = verifiedPaperPacket;
paperEngine.isReplayMode = false;
paperEngine.candles = verifiedPaperPacket.candles.map(candle => ({ ...candle }));
paperEngine.activeAsset = signalAsset;
paperEngine.currentSpreadInfo = { askPrice: 101, bidPrice: 99, spreadValue: 2, spreadFormatted: '$2.00' };
paperEngine.activeNews = null;
paperEngine.positions = [];
paperEngine.tradeHistory = [];
paperEngine.paperBalanceUSD = 100000;
paperEngine.leverage = 10;
paperEngine.riskPercent = 2;
paperEngine.signal = { sl: 99, tp1: 102 };
paperEngine.sound = null;
paperEngine.toasts = null;
paperEngine.saveGymState = () => {};
let paperPositionUpdates = 0;
paperEngine.onPositionUpdate = () => { paperPositionUpdates += 1; };
paperEngine.onMoneyManagementUpdate = () => {};
paperEngine.openPosition('LONG', 1000);
assert(paperEngine.paperBalanceUSD === 100000 && paperEngine.positions[0]?.pnlUSD === -198.02, 'Engine Paper open locks margin separately and marks the full immediate spread cost');
assert(paperEngine.setAccountCapital(50000) === false && paperEngine.paperBalanceUSD === 100000, 'Engine refuses to reset Paper capital while a position is open');
paperEngine.closePosition(paperEngine.positions[0].id);
assert(paperEngine.paperBalanceUSD === 99801.98 && paperEngine.positions.length === 0 && paperPositionUpdates === 2, 'Engine Paper close realizes PnL once and emits open/close position updates');
assert(paperEngine.executionAudit[0]?.eventType === 'POSITION_CLOSED' && paperEngine.executionAudit[1]?.eventType === 'OPEN_ACCEPTED', 'Engine records ordered Paper open and close audit events');

paperEngine.marketPacket = createMarketPacket({
  source: MARKET_PACKET_SOURCES.SIMULATED_FALLBACK,
  adapter: 'LOCAL_RANDOM_WALK_SIMULATION',
  symbol: 'BTC/USDT',
  timeframe: '5m',
  timeframeSeconds: 300,
  observedAt: paperPacketObservedAt,
  candles: paperPacketCandles
});
const blockedSimulationOpen = paperEngine.openPosition('LONG', 1000);
assert(!blockedSimulationOpen.success && blockedSimulationOpen.reason === 'MARKET_DATA_NOT_DECISION_ELIGIBLE' && paperEngine.positions.length === 0, 'Paper execution is blocked when the visible chart is backed by simulation data');
assert(paperEngine.executionAudit[0]?.decision?.marketSource === 'SIMULATED_FALLBACK' && paperEngine.executionAudit[0]?.decision?.marketDecisionEligible === false, 'Rejected Paper orders preserve their market-source decision audit');
paperEngine.marketPacket = verifiedPaperPacket;

const validAuditEvent = createPaperExecutionAuditEvent({
  eventId: 'audit-1', at: '2026-08-20T00:00:00.000Z', eventType: 'OPEN_REJECTED',
  executionSource: 'MANUAL_PAPER', reason: 'MAX_OPEN_POSITIONS', assetId: 'BTC/USDT', side: 'LONG',
  decision: {
    marketPacketSchema: 1, marketPacketSequence: 9, marketRequestId: 'MKT_AUDIT_9',
    marketSource: 'BINANCE_KLINES_REST', marketQuality: 'VALID', marketHealthStatus: 'HEALTHY', marketDecisionEligible: true
  }
});
assert(validAuditEvent?.decision?.marketSource === 'BINANCE_KLINES_REST' && validAuditEvent?.decision?.marketPacketSequence === 9 && validAuditEvent?.decision?.marketHealthStatus === 'HEALTHY' && restorePaperExecutionAudit([validAuditEvent, validAuditEvent, { eventType: 'UNKNOWN' }]).length === 1, 'Paper audit preserves packet and health provenance while rejecting invalid events and duplicate IDs');

const persistedPosition = {
  id: 'persisted-1', assetId: 'BTC/USDT', side: 'LONG', entryPrice: 100,
  currentPrice: 99, marginUSD: 1000, leverage: 10, pnlUSD: 999999, sl: 99, tp: 102
};
const restoredPositions = restorePaperPositions([
  persistedPosition,
  { ...persistedPosition },
  { ...persistedPosition, id: 'bad-side', side: 'SIDEWAYS' },
  { ...persistedPosition, id: 'bad-leverage', leverage: 9999 }
]);
assert(restoredPositions.length === 1 && restoredPositions[0].pnlUSD === -100, 'Paper restart rejects invalid/duplicate positions and recomputes PnL instead of trusting stored values');

const freshProfile = migrateProfile({}, 'FreshTrader');
assert(freshProfile.profileSchemaVersion === PROFILE_SCHEMA_VERSION && freshProfile.tradingData.paper.stats.totalTrades === 0, 'Fresh persisted profiles start with a truthful zero Paper history');
const migratedLegacyProfile = migrateProfile({ tradingData: { paper: { stats: legacyDemoState.stats, journal: [] } } }, 'LegacyTrader');
assert(migratedLegacyProfile.tradingData.paper.stats.totalTrades === 0, 'Persisted legacy starter stats migrate even when the old journal was empty');
const recoveredProfile = migrateProfile({
  tradingData: { paper: { paperAccountModel: 'BALANCE_MARGIN_SEPARATE_V1', positions: [persistedPosition] } }
}, 'RecoveryTrader');
assert(recoveredProfile.tradingData.paper.positions[0]?.pnlUSD === -100, 'Profile migration restores a valid open Paper position through the validated account contract');
assert(selectLatestPaperState({ savedAt: '2026-01-02T00:00:00Z', positions: [persistedPosition] }, { savedAt: '2026-01-01T00:00:00Z', positions: [] }).positions.length === 1, 'Restart recovery prefers the newest saved state instead of the state with more synthetic samples');

const backtestCandles = [
  { time: 1, open: 100, high: 100.5, low: 99.5, close: 100, volume: 1 },
  { time: 2, open: 100, high: 100.5, low: 99.5, close: 100, volume: 1 },
  { time: 3, open: 100, high: 100.5, low: 99.5, close: 100, volume: 1 },
  { time: 4, open: 100, high: 102.5, low: 99.5, close: 102, volume: 1 },
  { time: 5, open: 102, high: 102.5, low: 101.5, close: 102, volume: 1 }
];
const observedHistoryLengths = [];
const lookaheadBacktest = runBarCloseBacktest(backtestCandles, history => {
  observedHistoryLengths.push(history.length);
  return history.length === 3 ? { action: 'LONG', sl: 99, tp1: 102, reason: 'test' } : { action: 'HOLD' };
}, { warmupCandles: 3, initialCapital: 100000, riskPerTradePercent: 1 });
assert(lookaheadBacktest.method === BACKTEST_METHOD && lookaheadBacktest.lookaheadSafe && lookaheadBacktest.trades[0]?.signalIndex === 2 && lookaheadBacktest.trades[0]?.entryIndex === 3, 'Backtest signals at bar close and enters only at the next bar open');
assert(observedHistoryLengths[0] === 3 && lookaheadBacktest.trades[0]?.exitReason === 'TAKE_PROFIT', 'Backtest strategy receives only history available at each decision point');

const collisionCandles = backtestCandles.map(candle => ({ ...candle }));
collisionCandles[3] = { ...collisionCandles[3], high: 103, low: 98, close: 100 };
const collisionBacktest = runBarCloseBacktest(collisionCandles, history => history.length === 3 ? { action: 'BUY', sl: 99, tp1: 102 } : null, { warmupCandles: 3 });
assert(collisionBacktest.trades[0]?.exitReason === 'STOP_AND_TARGET_SAME_BAR_CONSERVATIVE_STOP', 'Ambiguous same-bar TP/SL collision resolves to the stop loss conservatively');

const costBacktest = runBarCloseBacktest(backtestCandles, history => history.length === 3 ? { action: 'BUY', sl: 99, tp1: 102 } : null, { warmupCandles: 3, feeBps: 10, slippageBps: 10 });
assert(costBacktest.metrics.feesPaid > 0 && costBacktest.metrics.netPnl < lookaheadBacktest.metrics.netPnl, 'Backtest deducts configured fees and adverse slippage');

let invalidSignalCalls = 0;
const invalidBacktest = runBarCloseBacktest([{ ...backtestCandles[0], high: 90 }, ...backtestCandles.slice(1)], () => { invalidSignalCalls += 1; return null; });
assert(invalidBacktest.status === 'INVALID_INPUT_FAIL_CLOSED' && invalidSignalCalls === 0, 'Invalid OHLC data fails closed before strategy evaluation');

const drawdownBacktest = runBarCloseBacktest(collisionCandles, history => history.length === 3 ? { action: 'LONG', sl: 99, tp1: 102 } : null, { warmupCandles: 3, riskPerTradePercent: 1, maxDrawdownPercent: 1 });
assert(drawdownBacktest.status === 'HALTED_MAX_DRAWDOWN', 'Backtest risk gate halts after reaching the configured maximum drawdown');
assert(drawdownBacktest.audit.every((event, index) => event.sequence === index + 1) && Object.isFrozen(drawdownBacktest.audit), 'Backtest produces an ordered immutable audit trail');

const integratedBacktestEngine = Object.create(AITradingEngine.prototype);
integratedBacktestEngine.fullHistoricalCandles = signalCandles;
integratedBacktestEngine.candles = signalCandles;
integratedBacktestEngine.activeAsset = signalAsset;
integratedBacktestEngine.strategyWeights = DEFAULT_STRATEGY_WEIGHTS;
integratedBacktestEngine.riskAppetite = 'balanced';
integratedBacktestEngine.isRealFeed = true;
const backtestObservedAt = signalCandles.at(-1).time + 300000;
integratedBacktestEngine.marketPacket = createMarketPacket({
  source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
  adapter: 'BINANCE KLINES',
  symbol: 'BTC/USDT',
  timeframe: '5m',
  timeframeSeconds: 300,
  observedAt: backtestObservedAt,
  candles: signalCandles.map(candle => ({ ...candle, openTimeMs: candle.time, closeTimeMs: candle.time + 300000 - 1 }))
});
integratedBacktestEngine.fullHistoricalCandles = integratedBacktestEngine.marketPacket.decisionCandles;
const integratedRuleBacktest = integratedBacktestEngine.runRuleBacktest({ warmupCandles: 30, maxTrades: 5, now: backtestObservedAt });
assert(integratedRuleBacktest.strategy.modelType === 'RULE_BASED_NOT_ML' && integratedRuleBacktest.strategy.newsIncluded === false && integratedRuleBacktest.strategy.mt5Included === false, 'Current Trade rules run through backtest without synthetic news or MT5 inputs');
assert(integratedRuleBacktest.lookaheadSafe && integratedRuleBacktest.dataProvenance.candleCount === 80 && integratedRuleBacktest.dataProvenance.source === 'BINANCE_KLINES_REST', 'Current rule backtest preserves next-bar execution and immutable data provenance');

const disabledAuthorityEngine = Object.create(AITradingEngine.prototype);
disabledAuthorityEngine.isAutoTrading = false;
disabledAuthorityEngine.toasts = null;
disabledAuthorityEngine.aiStats = { totalTrades: 0, samplesStudied: 0 };
assert(disabledAuthorityEngine.toggleAutoTrading(true) === false && disabledAuthorityEngine.checkAutoTradeExecution().reason === 'LEGACY_AUTO_SCENARIO_DECISION_AUTHORITY_DISABLED', 'Legacy automatic scenario runner cannot acquire Paper decision authority');
assert(disabledAuthorityEngine.runFastTrainingDrill().reason === 'SYNTHETIC_LEARNING_AUTHORITY_DISABLED' && disabledAuthorityEngine.aiStats.totalTrades === 0, 'Random Fast-Train cannot fabricate learning statistics');

const replayEngine = Object.create(AITradingEngine.prototype);
replayEngine.isReplayMode = true;
replayEngine.fullHistoricalCandles = signalCandles;
replayEngine.replayIndex = 40;
replayEngine.candles = signalCandles.slice(0, 40).map(candle => ({ ...candle }));
replayEngine.activeAsset = signalAsset;
replayEngine.replayInterval = null;
replayEngine.replaySpeed = 1;
replayEngine.analyzeMarket = () => {};
replayEngine.requestRender = () => {};
replayEngine.onReplayUpdate = () => {};
let replayPositionMarks = 0;
replayEngine.updatePositionPnL = () => { replayPositionMarks += 1; };
const replayCloseBeforeTick = replayEngine.candles.at(-1).close;
replayEngine.simulateLiveTick();
assert(replayEngine.candles.at(-1).close === replayCloseBeforeTick, 'Live tick simulation cannot mutate historical candles during chart replay');
replayEngine.stepReplay(1);
assert(replayPositionMarks === 0, 'Chart replay cannot revalue current Paper positions using historical prices');
assert(replayEngine.toggleReplayPlayback() === true && replayEngine.replayInterval, 'Chart replay play control starts the previously missing playback timer');
replayEngine.stopReplayPlayback();
assert(replayEngine.replayInterval === null, 'Chart replay playback timer stops cleanly');

const fixedDecisionTime = 1710000000000;
const simulatedNews = { provenance: 'SIMULATED_SCENARIO', source: 'Demo', headline: 'Huge rally', sentimentScore: 25, publishedAt: fixedDecisionTime - 1000 };
const verifiedNews = { provenance: VERIFIED_NEWS_PROVENANCE, source: 'Verified Wire', headline: 'Timestamped market event', sentimentScore: 20, publishedAt: fixedDecisionTime - 1000 };
const noNewsSpread = calculateCoreSpread(signalAsset, 100, null, null, () => 0.5, fixedDecisionTime);
const simulatedNewsSpread = calculateCoreSpread(signalAsset, 100, null, simulatedNews, () => 0.5, fixedDecisionTime);
const verifiedNewsSpread = calculateCoreSpread(signalAsset, 100, null, verifiedNews, () => 0.5, fixedDecisionTime);
assert(simulatedNewsSpread.multiplier === noNewsSpread.multiplier && simulatedNewsSpread.newsInfluenceApplied === false, 'Simulated news has zero influence on the spread and risk gate');
assert(verifiedNewsSpread.multiplier > noNewsSpread.multiplier && verifiedNewsSpread.newsInfluenceApplied === true, 'Only fresh verified timestamped news may influence the spread model');
assert(resolveDecisionNews({ ...verifiedNews, publishedAt: fixedDecisionTime + 1 }, { decisionTime: fixedDecisionTime }).reason === 'FUTURE_NEWS_REJECTED', 'Future-dated news is rejected to prevent lookahead');

const signalWithoutNews = generateAISignal(signalCandles, signalAsset, [], null, DEFAULT_STRATEGY_WEIGHTS, signalSpread, null, 'balanced', fixedDecisionTime);
const signalWithSimulatedNews = generateAISignal(signalCandles, signalAsset, [], simulatedNews, DEFAULT_STRATEGY_WEIGHTS, signalSpread, null, 'balanced', fixedDecisionTime);
assert(signalWithSimulatedNews.action === signalWithoutNews.action && signalWithSimulatedNews.ruleScore === signalWithoutNews.ruleScore && signalWithSimulatedNews.decisionNewsPolicy.accepted === false, 'Display-only news scenarios cannot change the Trade signal');
const signalWithVerifiedNews = generateAISignal(signalCandles, signalAsset, [], verifiedNews, DEFAULT_STRATEGY_WEIGHTS, signalSpread, null, 'balanced', fixedDecisionTime);
assert(signalWithVerifiedNews.decisionNewsPolicy.accepted === true, 'Verified fresh news enters the signal through an explicit audited policy');

const syntheticMemory = { wins: 100, losses: 0, winRate: 100, provenance: 'SYNTHETIC_PAPER_SCENARIO' };
assert(resolveDecisionStrategyMemory(syntheticMemory, { decisionTime: fixedDecisionTime }).accepted === false, 'Synthetic training memory cannot influence a Trade decision');
const validatedMemory = resolveDecisionStrategyMemory({
  wins: 24,
  losses: 6,
  provenance: VALIDATED_MEMORY_PROVENANCE,
  outOfSampleValidated: true,
  trainedAt: new Date(fixedDecisionTime - 1000).toISOString(),
  validationEvidence: {
    policy: PATTERN_MEMORY_PROMOTION_POLICY,
    passed: true,
    datasetId: 'verified-dataset',
    candleFingerprint: 'abcdef12',
    independentSamples: 30,
    foldCount: 4,
    positiveFolds: 3,
    lookaheadVerified: true,
    overlapPurged: true
  }
}, { decisionTime: fixedDecisionTime });
assert(validatedMemory.accepted === true && validatedMemory.observations === 30 && validatedMemory.winRate === 80, 'Sufficient out-of-sample strategy memory passes the decision policy');
assert(resolveDecisionStrategyMemory({
  wins: 24, losses: 6, provenance: VALIDATED_MEMORY_PROVENANCE, outOfSampleValidated: true,
  trainedAt: new Date(fixedDecisionTime - 1000).toISOString()
}, { decisionTime: fixedDecisionTime }).reason === 'VALIDATION_EVIDENCE_REQUIRED', 'A provenance label alone cannot forge validated strategy memory');

const promotionSamples = Array.from({ length: 64 }, (_, index) => ({
  status: 'COMPLETED',
  signalTime: 1700000000000 + index * 600000,
  labelTime: 1700000000000 + index * 600000 + 300000,
  pattern: { type: 'BULLISH_ENGULFING_CONFIRMED' },
  outcome: { netReturnR: index % 4 === 3 ? -0.05 : 0.2 }
}));
const promotionDataset = {
  success: true,
  method: PATTERN_RESEARCH_METHOD,
  datasetId: 'promotion-dataset',
  generatedAt: fixedDecisionTime - 1000,
  provenance: { verified: true, simulation: false, candleFingerprint: 'promotion12' },
  lookaheadAudit: {
    patternDetectionUsesHistoryThroughSignalOnly: true,
    entryBeginsOnNextBar: true,
    labelsReadForwardOnlyAfterSignal: true
  },
  samples: promotionSamples
};
const promotionReport = promotePatternStrategyMemory(promotionDataset);
assert(promotionReport.promotedCount === 1 && promotionReport.memories['Bullish Engulfing']?.validationEvidence.overlapPurged === true,
  'Pattern memory promotes only after non-overlapping outcomes pass four chronological evidence folds');
const overlappingPromotionReport = promotePatternStrategyMemory({
  ...promotionDataset,
  samples: promotionSamples.map((sample, index) => ({ ...sample, signalTime: 1700000000000 + index * 1000, labelTime: 1700000000000 + index * 1000 + 300000 }))
});
assert(overlappingPromotionReport.promotedCount === 0, 'Overlapping outcome labels are purged and cannot inflate Pattern memory observations');
const memoryPattern = [{ name: 'EMA Ribbon Uptrend', weight: 0 }];
const matchingSyntheticWeights = { 'EMA Ribbon Uptrend': syntheticMemory };
const signalWithoutMemory = generateAISignal(signalCandles, signalAsset, memoryPattern, null, null, signalSpread, null, 'balanced', fixedDecisionTime);
const signalWithSyntheticMemory = generateAISignal(signalCandles, signalAsset, memoryPattern, null, matchingSyntheticWeights, signalSpread, null, 'balanced', fixedDecisionTime);
assert(signalWithSyntheticMemory.ruleScore === signalWithoutMemory.ruleScore && signalWithSyntheticMemory.decisionMemoryPolicy.accepted === false, 'Synthetic strategy memory has zero influence on the Trade signal');

const validDemoPacketRaw = {
  schemaVersion: 1,
  source: MT5_DEMO_PACKET_SOURCE,
  mode: 'DEMO',
  sessionId: 'demo_session_123456789',
  sequence: 7,
  timestamp: new Date(fixedDecisionTime - 500).toISOString(),
  symbol: 'XAUUSD',
  quote: { symbol: 'XAUUSD', bid: 2748.5, ask: 2748.7 },
  depth: { bids: [{ price: 2748.5, volume: 2 }], asks: [{ price: 2748.7, volume: 3 }] },
  account: {
    login: '12345', server: 'Broker-Demo', currency: 'USD', tradeMode: 'DEMO',
    balance: 10000, equity: 10000, margin: 0, freeMargin: 10000, positions: []
  }
};
assert(validateMT5DemoPacket(validDemoPacketRaw, { now: fixedDecisionTime }).reason === 'UNAUTHENTICATED_TRANSPORT', 'Plain localhost MT5 packets are rejected without authenticated transport');
const validatedDemo = validateMT5DemoPacket(validDemoPacketRaw, { now: fixedDecisionTime, transportAuthenticated: true });
assert(validatedDemo.accepted === true && validatedDemo.packet.validation.decisionEligible === false, 'Fresh authenticated Demo packet enters shadow mode only');
assert(validateMT5DemoPacket({ ...validDemoPacketRaw, mode: 'LIVE' }, { now: fixedDecisionTime, transportAuthenticated: true }).reason === 'DEMO_MODE_REQUIRED', 'MT5 Live packets cannot enter the Demo gateway');
assert(validateMT5DemoPacket(validDemoPacketRaw, { now: fixedDecisionTime, transportAuthenticated: true, lastSequence: 7 }).reason === 'REPLAYED_OR_OUT_OF_ORDER_PACKET', 'MT5 packet sequence blocks replay and out-of-order data');
assert(reconcileMT5DemoAccount(null, validatedDemo.packet).reconciled === true, 'Validated Demo account reconciles its financial identity');
const unexpectedSystemPacket = validateMT5DemoPacket({
  ...validDemoPacketRaw,
  sequence: 8,
  account: {
    ...validDemoPacketRaw.account,
    margin: 100,
    freeMargin: 9900,
    positions: [{
      ticket: '99001', symbol: 'XAUUSD', side: 'BUY', volume: 0.1,
      entryPrice: 2748.6, currentPrice: 2748.7, stopPrice: 2740,
      targetPrice: 2760, profit: 1, magic: 99001
    }]
  }
}, { now: fixedDecisionTime, transportAuthenticated: true }).packet;
assert(reconcileMT5DemoAccount(null, unexpectedSystemPacket, { expectedMagic: 99001 }).reconciled === false, 'Demo reconciliation blocks unexpected system-owned broker positions');
const shadowSignal = generateAISignal(signalCandles, signalAsset, [], null, null, signalSpread, validatedDemo.packet, 'balanced', fixedDecisionTime);
assert(shadowSignal.ruleScore === signalWithoutNews.ruleScore && shadowSignal.mt5Intel?.decisionInfluence === false, 'MT5 Demo shadow telemetry cannot change the Trade signal');

const demoTelemetryRecords = Array.from({ length: 31 }, (_, index) => {
  const observedAt = fixedDecisionTime + index * 1000;
  return {
    observedAt,
    transportAuthenticated: true,
    packet: {
      ...validDemoPacketRaw,
      sequence: index + 1,
      timestamp: new Date(observedAt).toISOString()
    }
  };
});
const demoTelemetryCertification = certifyMT5DemoTelemetrySession(demoTelemetryRecords);
assert(demoTelemetryCertification.certified === true
  && demoTelemetryCertification.packetCount === 31
  && demoTelemetryCertification.durationMs === 30000
  && demoTelemetryCertification.decisionEligible === false, 'MT5 Demo certification requires a continuous reconciled 30-second Shadow session');
const sequenceGapRecords = demoTelemetryRecords.map((record, index) => index === 12
  ? { ...record, packet: { ...record.packet, sequence: record.packet.sequence + 1 } }
  : record);
assert(certifyMT5DemoTelemetrySession(sequenceGapRecords).reasons.some(reason => reason.startsWith('SEQUENCE_GAP:12:')), 'MT5 Demo certification rejects a missing sequence even when packets remain monotonic');
const unauthenticatedTrace = demoTelemetryRecords.map((record, index) => index === 8
  ? { ...record, transportAuthenticated: false }
  : record);
assert(certifyMT5DemoTelemetrySession(unauthenticatedTrace).reasons.includes('UNAUTHENTICATED_CAPTURE:8'), 'MT5 Demo certification rejects any capture without authenticated transport');

const mlCandles = [];
let previousMLClose = 100;
for (let index = 0; index < 420; index++) {
  const close = 100 + index * 0.01 + Math.sin(index / 5) * 2 + Math.sin(index / 17);
  const open = previousMLClose;
  mlCandles.push({
    time: 1720000000 + index * 300,
    open,
    high: Math.max(open, close) + 0.25,
    low: Math.min(open, close) - 0.25,
    close,
    volume: 100 + Math.sin(index / 7) * 20 + index * 0.02
  });
  previousMLClose = close;
}
const featuresBeforeFutureMutation = extractMLFeatures(mlCandles, 100);
const mutatedFutureCandles = mlCandles.map(candle => ({ ...candle }));
mutatedFutureCandles[250].close += 10;
mutatedFutureCandles[250].high = Math.max(mutatedFutureCandles[250].high, mutatedFutureCandles[250].close + 0.25);
assert(JSON.stringify(featuresBeforeFutureMutation) === JSON.stringify(extractMLFeatures(mutatedFutureCandles, 100)), 'ML features cannot read candles from the future');
const mlEvaluation = trainAndEvaluateMLShadow(mlCandles, {
  assetId: 'BTC/USDT', timeframe: '5m', source: 'TEST_CHRONOLOGICAL_FIXTURE',
  horizonBars: 3, roundTripCostBps: 0, now: fixedDecisionTime
});
assert(mlEvaluation.success === true && mlEvaluation.model.samplesSeen === mlEvaluation.report.split.train, 'ML Shadow performs real weight updates on the chronological training split');
assert(mlEvaluation.report.trainingBalance.positiveSamples + mlEvaluation.report.trainingBalance.negativeSamples === mlEvaluation.report.split.train
  && mlEvaluation.report.walkForward.folds.every(fold => fold.trainingBalance.positiveSamples + fold.trainingBalance.negativeSamples === fold.train), 'ML Shadow derives class balancing independently from each training window');
assert(mlEvaluation.report.split.trainLabelEndTime < mlEvaluation.report.split.validationFeatureStartTime
  && mlEvaluation.report.split.validationLabelEndTime < mlEvaluation.report.split.testFeatureStartTime, 'ML Shadow purges horizon overlap between train, validation, and test');
assert(mlEvaluation.report.walkForward.foldCount === 4
  && mlEvaluation.report.walkForward.folds.every(fold => fold.leakageFree && fold.trainLabelEndTime < fold.testFeatureStartTime), 'ML Shadow repeats purged expanding-window evaluation across four leakage-free folds');
assert(mlEvaluation.report.walkForward.totalTestExamples === mlEvaluation.report.walkForward.folds.reduce((sum, fold) => sum + fold.test, 0)
  && mlEvaluation.report.walkForward.aggregate.balancedAccuracy >= 0
  && mlEvaluation.report.walkForward.aggregate.balancedAccuracy <= 1
  && mlEvaluation.report.walkForward.aggregate.predictedPositiveRate >= 0
  && mlEvaluation.report.walkForward.aggregate.predictedPositiveRate <= 1, 'ML Shadow reports bounded aggregate walk-forward evidence and prediction-side balance');
const mlPrediction = predictMLDirection(mlEvaluation.model, mlCandles);
assert(mlPrediction?.rawProbabilityUp > 0 && mlPrediction.rawProbabilityUp < 1 && mlPrediction.decisionInfluence === false, 'ML Shadow emits a bounded prediction with zero execution influence');
const restoredMLModel = restoreMLShadowModel({ ...mlEvaluation.model, certification: { promotionCandidate: true, decisionEligible: true } });
assert(restoredMLModel?.certification.promotionCandidate === true && restoredMLModel.certification.decisionEligible === false, 'Persisted ML models cannot self-promote into decision authority');
assert(restoreMLShadowModel({ ...mlEvaluation.model, weights: [Infinity] }) === null, 'Invalid persisted ML weights fail closed');
const tamperedMLReport = restoreMLShadowReport({
  ...mlEvaluation.report,
  promotionCandidate: true,
  promotionChecks: Object.fromEntries(Object.keys(mlEvaluation.report.promotionChecks).map(key => [key, true])),
  test: {
    ...mlEvaluation.report.test,
    balancedAccuracy: 0.5,
    brier: mlEvaluation.report.test.baseline.brier,
    logLoss: mlEvaluation.report.test.baseline.logLoss
  }
});
assert(tamperedMLReport?.promotionCandidate === false, 'Persisted ML reports recalculate evidence gates instead of trusting stored promotion flags');
const tamperedWalkForwardBoundary = {
  ...mlEvaluation.report,
  walkForward: {
    ...mlEvaluation.report.walkForward,
    folds: mlEvaluation.report.walkForward.folds.map((fold, index) => index === 0
      ? { ...fold, testFeatureStartTime: fold.trainLabelEndTime }
      : fold)
  }
};
assert(restoreMLShadowReport(tamperedWalkForwardBoundary) === null, 'Persisted ML reports reject walk-forward folds with boundary leakage');
assert(restoreMLShadowReport({
  ...mlEvaluation.report,
  walkForward: {
    ...mlEvaluation.report.walkForward,
    folds: mlEvaluation.report.walkForward.folds.map((fold, index) => index === 0
      ? { ...fold, metrics: { ...fold.metrics, predictedPositiveRate: null } }
      : fold)
  }
}) === null, 'Persisted ML reports reject incomplete prediction-collapse diagnostics');
assert(restoreMLShadowReport({
  ...mlEvaluation.report,
  trainingBalance: { ...mlEvaluation.report.trainingBalance, positiveWeight: mlEvaluation.report.trainingBalance.positiveWeight + 0.1 }
}) === null, 'Persisted ML reports reject class weights that were not derived from the training split');

const protectiveLong = deriveProtectiveOrders({ side: 'LONG', entryPrice: 100, signal: { entry: 100, sl: 99, tp1: 102, digits: 2 }, spreadValue: 0.1, minimumRiskReward: 1.5 });
const protectiveShort = deriveProtectiveOrders({ side: 'SHORT', entryPrice: 100, signal: { entry: 100, sl: 99, tp1: 102, digits: 2 }, spreadValue: 0.1, minimumRiskReward: 1.5 });
assert(protectiveLong.stopPrice < 100 && protectiveLong.targetPrice > 100 && protectiveShort.stopPrice > 100 && protectiveShort.targetPrice < 100, 'Protective SL/TP geometry is mirrored safely to the actual Paper order side');
assert(evaluatePaperOpenRisk({ balanceUSD: 10000, positions: [], requestedMarginUSD: 6000, maxUsedMarginPercent: 50 }).reason === 'MAX_USED_MARGIN_PERCENT', 'Paper risk gate caps aggregate used margin');
assert(evaluatePaperOpenRisk({ balanceUSD: 10000, positions: [persistedPosition, persistedPosition, persistedPosition], requestedMarginUSD: 100, maxPositions: 3 }).reason === 'MAX_OPEN_POSITIONS', 'Paper risk gate caps simultaneous positions');
assert(evaluatePaperExit({ side: 'LONG', currentPrice: 98, sl: 99, tp: 102, marginUSD: 1000, pnlUSD: -200 }) === 'STOP_LOSS', 'Paper protective exit detects a long stop loss');

paperEngine.currentSpreadInfo = { askPrice: 101, bidPrice: 99, spreadValue: 2, spreadFormatted: '$2.00' };
const autoExitOpen = paperEngine.openPosition('LONG', 1000);
const stopTouchBid = Number((autoExitOpen.position.sl - 0.01).toFixed(signalAsset.digits));
paperEngine.currentSpreadInfo = { askPrice: stopTouchBid + 2, bidPrice: stopTouchBid, spreadValue: 2, spreadFormatted: '$2.00' };
paperEngine.updatePositionPnL();
assert(autoExitOpen.success && paperEngine.positions.length === 0 && paperEngine.tradeHistory[0]?.exitReason === 'STOP_LOSS', 'Engine automatically closes a Paper position when its protective stop is reached');

console.log(`TRADE CORE: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;

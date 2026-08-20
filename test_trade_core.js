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
import { MT5_DEMO_PACKET_SOURCE, reconcileMT5DemoAccount, validateMT5DemoPacket } from './js/core/trading/mt5DemoGateway.js';
import { certifyMT5DemoTelemetrySession } from './js/core/trading/mt5DemoCertification.js';
import { extractMLFeatures, predictMLDirection, restoreMLShadowModel, restoreMLShadowReport, trainAndEvaluateMLShadow } from './js/core/trading/mlShadowModel.js';
import { fetchHistoricalExchangeCandles, fetchRealExchangeCandles, getMarketDataDisclosure } from './js/services/trading/binanceMarketData.js';
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
assert(packetSummary.decisionEligible && packetSummary.sourceLabel === 'BINANCE KLINES' && packetSummary.closedBars === 60, 'MarketPacket summary exposes truthful source and closed-bar status for the UI');

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
const integratedSignal = generateAISignal(signalCandles, signalAsset, [], null, DEFAULT_STRATEGY_WEIGHTS, signalSpread, null, 'balanced');
assert(integratedSignal.targetScore?.calibrated === false && integratedSignal.ruleCountercheck?.independentAgents === false, 'Integrated signal path returns the truthful rule-score and single countercheck contracts');
assert(integratedSignal.quantDesk?.agents?.length === 4, 'Integrated signal path completes all four deterministic analysis modules');

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
  decision: { marketPacketSchema: 1, marketSource: 'BINANCE_KLINES_REST', marketQuality: 'VALID', marketDecisionEligible: true }
});
assert(validAuditEvent?.decision?.marketSource === 'BINANCE_KLINES_REST' && restorePaperExecutionAudit([validAuditEvent, validAuditEvent, { eventType: 'UNKNOWN' }]).length === 1, 'Paper audit preserves data provenance while rejecting invalid events and duplicate IDs');

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
  trainedAt: new Date(fixedDecisionTime - 1000).toISOString()
}, { decisionTime: fixedDecisionTime });
assert(validatedMemory.accepted === true && validatedMemory.observations === 30 && validatedMemory.winRate === 80, 'Sufficient out-of-sample strategy memory passes the decision policy');
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

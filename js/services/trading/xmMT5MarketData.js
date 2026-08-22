import {
  XM_APPROVED_SYMBOLS,
  XM_MARKET_PACKET_SOURCE,
  hasXMMarketAdapter,
  validateXMMarketSnapshot
} from '../../core/trading/xmMarketDataGateway.js';

export { hasXMMarketAdapter };

function resolveGateway(options = {}) {
  if (options.gateway && typeof options.gateway.getMT5DemoMarketSnapshot === 'function') return options.gateway;
  if (typeof window !== 'undefined' && window.cyberSystemAPI
    && typeof window.cyberSystemAPI.getMT5DemoMarketSnapshot === 'function') return window.cyberSystemAPI;
  return null;
}

export async function fetchXMMarketCandles(assetId, timeframe, limit = 80, options = {}) {
  if (!hasXMMarketAdapter(assetId)) return null;
  const gateway = resolveGateway(options);
  if (!gateway) return null;
  const safeLimit = Math.max(20, Math.min(5000, Number.parseInt(limit, 10) || 80));
  const response = await gateway.getMT5DemoMarketSnapshot(assetId, timeframe, safeLimit);
  if (response?.success !== true || response?.transportAuthenticated !== true) return null;
  const validation = validateXMMarketSnapshot(response.packet, {
    expectedAssetId: assetId,
    expectedTimeframe: timeframe,
    transportAuthenticated: true,
    now: options.now || Date.now(),
    maxSnapshotAgeMs: options.maxSnapshotAgeMs || 5000
  });
  if (!validation.accepted || validation.snapshot.formingBarExcluded !== true
    || validation.snapshot.authority.paperDecisionInfluence !== true) return null;
  return Object.freeze({
    candles: validation.snapshot.closedBars,
    source: XM_MARKET_PACKET_SOURCE,
    adapter: `XM MT5 DEMO ${validation.snapshot.brokerSymbol} — CLOSED BARS`,
    brokerSymbol: validation.snapshot.brokerSymbol,
    brokerMode: 'DEMO',
    contract: validation.snapshot.contract,
    quote: validation.snapshot.quote,
    account: validation.snapshot.account,
    sessionGapCount: validation.snapshot.sessionGapCount,
    formingBarExcluded: true
  });
}

export async function fetchHistoricalXMMarketCandles(assetId, timeframe, totalLimit = 2000, options = {}) {
  const result = await fetchXMMarketCandles(assetId, timeframe, totalLimit, options);
  return Array.isArray(result?.candles) && result.candles.length >= 120 ? result.candles : null;
}

export function getXMMarketDataDisclosure(assetId) {
  const brokerSymbol = XM_APPROVED_SYMBOLS[assetId];
  return brokerSymbol ? `XM MT5 DEMO ${brokerSymbol} — VERIFIED CLOSED BARS` : 'NO VERIFIED XM ADAPTER';
}

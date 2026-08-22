export const MARKET_TYPES = Object.freeze({
  BINANCE: 'binance',
  XM: 'xm'
});

const paperAsset = (definition) => Object.freeze({
  executionMode: 'PAPER_ONLY',
  ...definition
});

export const TRADING_ASSETS = Object.freeze([
  paperAsset({ id: 'BTC/USDT', name: 'Bitcoin', market: 'binance', dataMode: 'BINANCE_OR_SIMULATED', basePrice: 96420.50, unit: '₿', minTick: 0.5, digits: 2, leverageMax: 50, baseSpread: 2.50, spreadUnit: '$', binanceSymbol: 'BTCUSDT' }),
  paperAsset({ id: 'ETH/USDT', name: 'Ethereum', market: 'binance', dataMode: 'BINANCE_OR_SIMULATED', basePrice: 3580.00, unit: 'Ξ', minTick: 0.1, digits: 2, leverageMax: 50, baseSpread: 0.35, spreadUnit: '$', binanceSymbol: 'ETHUSDT' }),
  paperAsset({ id: 'SOL/USDT', name: 'Solana', market: 'binance', dataMode: 'BINANCE_OR_SIMULATED', basePrice: 198.40, unit: '◎', minTick: 0.01, digits: 2, leverageMax: 20, baseSpread: 0.08, spreadUnit: '$', binanceSymbol: 'SOLUSDT' }),
  paperAsset({ id: 'NVDA/USD', name: 'NVIDIA Reference Scenario', market: 'binance', dataMode: 'SIMULATED_ONLY', basePrice: 142.80, unit: '$', minTick: 0.01, digits: 2, leverageMax: 10, baseSpread: 0.05, spreadUnit: '$' }),
  paperAsset({ id: 'CYBER/USDT', name: 'Fictional Darknet Index', market: 'binance', dataMode: 'SIMULATED_ONLY', basePrice: 42.50, unit: '⚡', minTick: 0.01, digits: 2, leverageMax: 25, baseSpread: 0.02, spreadUnit: '$' }),
  paperAsset({ id: 'QUANTUM/USDT', name: 'Fictional Qubit Protocol', market: 'binance', dataMode: 'SIMULATED_ONLY', basePrice: 850.00, unit: 'Ψ', minTick: 0.1, digits: 2, leverageMax: 20, baseSpread: 0.30, spreadUnit: '$' }),
  paperAsset({ id: 'XAU/USD', name: 'Gold — XM Demo', market: 'xm', dataMode: 'XM_MT5_DEMO_OR_SIMULATED', brokerSymbol: 'GOLD', basePrice: 2748.50, unit: 'oz', minTick: 0.01, digits: 2, leverageMax: 500, lotSize: 100, pipValue: 1, baseSpread: 0.22, spreadUnit: 'pts' }),
  paperAsset({ id: 'EUR/USD', name: 'EUR/USD — XM Demo', market: 'xm', dataMode: 'XM_MT5_DEMO_OR_SIMULATED', brokerSymbol: 'EURUSD', basePrice: 1.0845, unit: '€', minTick: 0.00001, digits: 5, leverageMax: 500, lotSize: 100000, pipValue: 1, baseSpread: 0.00012, spreadUnit: 'pips' }),
  paperAsset({ id: 'GBP/USD', name: 'GBP/USD — XM Demo', market: 'xm', dataMode: 'XM_MT5_DEMO_OR_SIMULATED', brokerSymbol: 'GBPUSD', basePrice: 1.2980, unit: '£', minTick: 0.00001, digits: 5, leverageMax: 500, lotSize: 100000, pipValue: 1, baseSpread: 0.00015, spreadUnit: 'pips' }),
  paperAsset({ id: 'USOIL', name: 'WTI Oil — XM Demo', market: 'xm', dataMode: 'XM_MT5_DEMO_OR_SIMULATED', brokerSymbol: 'OILCash', basePrice: 71.40, unit: 'bbl', minTick: 0.01, digits: 2, leverageMax: 100, lotSize: 100, pipValue: 1, baseSpread: 0.035, spreadUnit: 'pts' })
]);

export const TIMEFRAMES = Object.freeze([
  Object.freeze({ id: '1m', label: '1m', seconds: 60, candleCount: 80, binanceInterval: '1m' }),
  Object.freeze({ id: '5m', label: '5m', seconds: 300, candleCount: 80, binanceInterval: '5m' }),
  Object.freeze({ id: '15m', label: '15m', seconds: 900, candleCount: 80, binanceInterval: '15m' }),
  Object.freeze({ id: '1h', label: '1h', seconds: 3600, candleCount: 80, binanceInterval: '1h' }),
  Object.freeze({ id: '1D', label: '1D', seconds: 86400, candleCount: 80, binanceInterval: '1d' })
]);

export function findTradingAsset(assetId) {
  return TRADING_ASSETS.find(asset => asset.id === assetId) || null;
}

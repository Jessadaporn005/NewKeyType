const BINANCE_SYMBOLS = Object.freeze({
  'BTC/USDT': 'BTCUSDT',
  'ETH/USDT': 'ETHUSDT',
  'SOL/USDT': 'SOLUSDT',
  'XAU/USD': 'PAXGUSDT'
});

const BINANCE_INTERVALS = Object.freeze({
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '1D': '1d'
});

export function hasVerifiedMarketDataAdapter(symbol) {
  return Object.prototype.hasOwnProperty.call(BINANCE_SYMBOLS, symbol);
}

function parseCandle(item) {
  if (!Array.isArray(item) || item.length < 6) return null;
  const openTimeMs = Number(item[0]);
  const explicitCloseTimeMs = Number(item[6]);
  const candle = {
    time: Math.floor(openTimeMs / 1000),
    openTimeMs,
    closeTimeMs: Number.isFinite(explicitCloseTimeMs) && explicitCloseTimeMs > openTimeMs
      ? explicitCloseTimeMs
      : null,
    open: Number(item[1]),
    high: Number(item[2]),
    low: Number(item[3]),
    close: Number(item[4]),
    volume: Number(item[5])
  };
  if (![candle.time, candle.openTimeMs, candle.open, candle.high, candle.low, candle.close, candle.volume].every(Number.isFinite)) return null;
  if (candle.time <= 0 || candle.openTimeMs <= 0 || candle.open <= 0 || candle.high < candle.low || candle.high < Math.max(candle.open, candle.close) || candle.low > Math.min(candle.open, candle.close) || candle.volume < 0) return null;
  return candle;
}

export async function fetchRealExchangeCandles(symbol = 'BTC/USDT', interval = '5m', limit = 80, options = {}) {
  const binanceSymbol = BINANCE_SYMBOLS[symbol];
  if (!binanceSymbol) return null;

  const safeLimit = Math.max(10, Math.min(500, Number.parseInt(limit, 10) || 80));
  const binanceInterval = BINANCE_INTERVALS[interval] || '5m';
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 3500);
  try {
    const endTime = Number(options.endTime);
    const endTimeQuery = Number.isFinite(endTime) && endTime > 0 ? `&endTime=${Math.floor(endTime)}` : '';
    const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=${safeLimit}${endTimeQuery}`;
    const res = await fetchImpl(url, { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) return null;
    const rawData = await res.json();
    if (!Array.isArray(rawData) || rawData.length === 0) return null;
    const candles = rawData.map(parseCandle).filter(Boolean);
    return candles.length === rawData.length && candles.length > 0 ? candles : null;
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchHistoricalExchangeCandles(symbol = 'BTC/USDT', interval = '5m', totalLimit = 2000, options = {}) {
  if (!BINANCE_SYMBOLS[symbol]) return null;
  const safeTotal = Math.max(120, Math.min(5000, Number.parseInt(totalLimit, 10) || 2000));
  const byTimestamp = new Map();
  let endTime = Number.isFinite(Number(options.endTime)) ? Number(options.endTime) : null;
  let remaining = safeTotal;
  let previousOldestTime = Infinity;
  let batchCount = 0;
  const maximumBatches = Math.ceil(safeTotal / 500) + 2;

  while (remaining > 0 && batchCount < maximumBatches) {
    batchCount += 1;
    const batchLimit = Math.min(500, remaining);
    const batch = await fetchRealExchangeCandles(symbol, interval, batchLimit, { ...options, endTime });
    if (!Array.isArray(batch) || batch.length === 0) break;
    const sizeBeforeBatch = byTimestamp.size;
    for (const candle of batch) byTimestamp.set(candle.time, candle);
    if (byTimestamp.size === sizeBeforeBatch) break;
    remaining = safeTotal - byTimestamp.size;
    if (batch.length < batchLimit || remaining <= 0) break;
    const oldestTimeSeconds = Math.min(...batch.map(candle => candle.time));
    if (!Number.isFinite(oldestTimeSeconds) || oldestTimeSeconds >= previousOldestTime) break;
    previousOldestTime = oldestTimeSeconds;
    endTime = oldestTimeSeconds * 1000 - 1;
  }

  const candles = [...byTimestamp.values()].sort((left, right) => left.time - right.time);
  return candles.length >= 120 ? candles.slice(-safeTotal) : null;
}

export function getMarketDataDisclosure(symbol) {
  if (symbol === 'XAU/USD') return 'BINANCE PAXG/USDT PROXY — NOT XAU/USD SPOT';
  return hasVerifiedMarketDataAdapter(symbol) ? 'BINANCE KLINES' : 'NO VERIFIED ADAPTER';
}

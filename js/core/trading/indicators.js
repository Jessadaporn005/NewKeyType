function normalizePeriod(period, fallback) {
  const value = Number.parseInt(period, 10);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}
function normalizeCandles(candles) {
  return Array.isArray(candles) ? candles : [];
}

export function calculateEMA(candles, period = 20) {
  const source = normalizeCandles(candles);
  const safePeriod = normalizePeriod(period, 20);
  const ema = [];
  const k = 2 / (safePeriod + 1);
  if (source.length === 0) return ema;

  let sum = 0;
  for (let i = 0; i < Math.min(safePeriod, source.length); i++) sum += Number(source[i].close);
  let prevEma = sum / Math.min(safePeriod, source.length);

  for (let i = 0; i < source.length; i++) {
    if (i < safePeriod - 1) ema.push(null);
    else if (i === safePeriod - 1) ema.push(prevEma);
    else {
      const curEma = Number(source[i].close) * k + prevEma * (1 - k);
      ema.push(curEma);
      prevEma = curEma;
    }
  }
  return ema;
}

export function calculateBollingerBands(candles, period = 20, stdDevMultiplier = 2) {
  const source = normalizeCandles(candles);
  const safePeriod = normalizePeriod(period, 20);
  const multiplier = Number.isFinite(Number(stdDevMultiplier)) ? Number(stdDevMultiplier) : 2;
  const upper = [];
  const middle = [];
  const lower = [];

  for (let i = 0; i < source.length; i++) {
    if (i < safePeriod - 1) {
      upper.push(null);
      middle.push(null);
      lower.push(null);
      continue;
    }
    const window = source.slice(i - safePeriod + 1, i + 1).map(candle => Number(candle.close));
    const sma = window.reduce((sum, value) => sum + value, 0) / safePeriod;
    const variance = window.reduce((sum, value) => sum + Math.pow(value - sma, 2), 0) / safePeriod;
    const stdDev = Math.sqrt(variance);
    middle.push(sma);
    upper.push(sma + stdDev * multiplier);
    lower.push(sma - stdDev * multiplier);
  }
  return { upper, middle, lower };
}

export function calculateRSI(candles, period = 14) {
  const source = normalizeCandles(candles);
  const safePeriod = normalizePeriod(period, 14);
  const rsi = [];
  if (source.length <= safePeriod) return source.map(() => 50);

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= safePeriod; i++) {
    const diff = Number(source[i].close) - Number(source[i - 1].close);
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  let avgGain = gains / safePeriod;
  let avgLoss = losses / safePeriod;

  for (let i = 0; i < source.length; i++) {
    if (i < safePeriod) {
      rsi.push(50);
      continue;
    }
    if (i > safePeriod) {
      const diff = Number(source[i].close) - Number(source[i - 1].close);
      avgGain = (avgGain * (safePeriod - 1) + (diff > 0 ? diff : 0)) / safePeriod;
      avgLoss = (avgLoss * (safePeriod - 1) + (diff < 0 ? Math.abs(diff) : 0)) / safePeriod;
    }
    if (avgLoss === 0) rsi.push(100);
    else rsi.push(Math.round(100 - (100 / (1 + avgGain / avgLoss))));
  }
  return rsi;
}

export function calculateMACD(candles, fast = 12, slow = 26, signal = 9) {
  const source = normalizeCandles(candles);
  const fastEMA = calculateEMA(source, fast);
  const slowEMA = calculateEMA(source, slow);
  const macdLine = source.map((_, index) => fastEMA[index] === null || slowEMA[index] === null ? 0 : fastEMA[index] - slowEMA[index]);
  const signalLine = calculateEMA(macdLine.map(close => ({ close })), signal);
  const histogram = macdLine.map((value, index) => value - (signalLine[index] === null ? 0 : signalLine[index]));
  return { macdLine, signalLine, histogram };
}

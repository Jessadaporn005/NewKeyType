import { calculateBollingerBands, calculateEMA } from './indicators.js';

export const MARKET_REGIME_SCHEMA = 'MARKET_REGIME_EVIDENCE_V1';
export const MARKET_REGIME_METHOD = 'CLOSED_BAR_EMA_BB_TRUE_RANGE_V1';

function finite(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validCandle(candle) {
  const open = finite(candle?.open);
  const high = finite(candle?.high);
  const low = finite(candle?.low);
  const close = finite(candle?.close);
  return open !== null && high !== null && low !== null && close !== null
    && open > 0 && close > 0 && high >= Math.max(open, close) && low <= Math.min(open, close);
}

function average(values) {
  const valid = values.filter(Number.isFinite);
  return valid.length > 0 ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
}

function median(values) {
  const valid = values.filter(Number.isFinite).sort((left, right) => left - right);
  if (valid.length === 0) return 0;
  const middle = Math.floor(valid.length / 2);
  return valid.length % 2 ? valid[middle] : (valid[middle - 1] + valid[middle]) / 2;
}

function candleTime(candle, fallback) {
  return Math.round(finite(candle?.openTimeMs ?? candle?.time) ?? fallback);
}

function hasStrictChronology(candles) {
  let previousTime = null;
  for (const candle of candles) {
    const currentTime = finite(candle?.openTimeMs ?? candle?.time);
    if (currentTime === null || (previousTime !== null && currentTime <= previousTime)) return false;
    previousTime = currentTime;
  }
  return true;
}

function trueRanges(candles) {
  return candles.map((candle, index) => {
    const previousClose = index > 0 ? candles[index - 1].close : candle.open;
    return Math.max(candle.high - candle.low, Math.abs(candle.high - previousClose), Math.abs(candle.low - previousClose));
  });
}

function freezeRegime({ type, direction, label, badgeClass, icon, description, candles, evidence, invalidation, ruleAlignmentScore, decisionEligible = true }) {
  const startIndex = Math.max(0, candles.length - 50);
  const endIndex = Math.max(0, candles.length - 1);
  const startTime = candles.length > 0 ? candleTime(candles[startIndex], startIndex) : null;
  const endTime = candles.length > 0 ? candleTime(candles[endIndex], endIndex) : null;
  return Object.freeze({
    schema: MARKET_REGIME_SCHEMA,
    method: MARKET_REGIME_METHOD,
    id: `${MARKET_REGIME_SCHEMA}:${type}:${startTime}:${endTime}`,
    type,
    direction,
    label,
    badgeClass,
    icon,
    desc: description,
    confirmed: decisionEligible,
    decisionEligible,
    calibrated: false,
    ruleAlignmentScore,
    trendStrength: ruleAlignmentScore,
    volatilityRatio: evidence.volatilityRatio ?? null,
    evidence: Object.freeze({
      startIndex,
      endIndex,
      startTime,
      endTime,
      closedBarCount: candles.length,
      ...evidence,
      newsInfluence: false,
      spreadInfluence: false
    }),
    invalidation: Object.freeze({ ...invalidation })
  });
}

export function detectEvidenceBasedMarketRegime(inputCandles = [], { spreadInfo = null } = {}) {
  const sourceCandles = Array.isArray(inputCandles) ? inputCandles : [];
  const firstFormingIndex = sourceCandles.findIndex(candle => candle?.barClosed === false);
  const formingBarsAreTrailing = firstFormingIndex < 0
    || sourceCandles.slice(firstFormingIndex).every(candle => candle?.barClosed === false);
  const candles = firstFormingIndex < 0 ? [...sourceCandles] : sourceCandles.slice(0, firstFormingIndex);
  const invalidClosedBars = candles.filter(candle => !validCandle(candle)).length;
  const chronologyValid = hasStrictChronology(candles);
  if (!Array.isArray(inputCandles) || !formingBarsAreTrailing || invalidClosedBars > 0 || !chronologyValid) {
    return freezeRegime({
      type: 'INVALID_EVIDENCE',
      direction: 'NEUTRAL',
      label: 'INVALID CLOSED-BAR EVIDENCE',
      badgeClass: 'regime-range',
      icon: '⚪',
      description: 'ข้อมูลแท่งปิดผิดรูปแบบหรือมีแท่งกำลังก่อตัวแทรกกลางลำดับ ระบบจึงไม่จัดประเภทสภาวะตลาด',
      candles: [],
      decisionEligible: false,
      ruleAlignmentScore: 0,
      evidence: {
        requiredClosedBars: 50,
        providedBars: sourceCandles.length,
        invalidClosedBars,
        formingBarsAreTrailing,
        chronologyValid,
        volatilityRatio: null,
        executionSpreadWidened: spreadInfo?.isWidened === true,
        executionSpreadSource: spreadInfo?.source || null
      },
      invalidation: { condition: 'REPLACE_WITH_VALID_ORDERED_CLOSED_BARS', price: null }
    });
  }
  if (candles.length < 50) {
    return freezeRegime({
      type: 'INSUFFICIENT_EVIDENCE',
      direction: 'NEUTRAL',
      label: 'INSUFFICIENT CLOSED-BAR EVIDENCE',
      badgeClass: 'regime-range',
      icon: '⚪',
      description: `ต้องมีแท่งปิดอย่างน้อย 50 แท่ง แต่มี ${candles.length} แท่ง`,
      candles,
      decisionEligible: false,
      ruleAlignmentScore: 0,
      evidence: { requiredClosedBars: 50, volatilityRatio: null, executionSpreadWidened: spreadInfo?.isWidened === true, executionSpreadSource: spreadInfo?.source || null },
      invalidation: { condition: 'COLLECT_AT_LEAST_50_CLOSED_BARS', price: null }
    });
  }

  const ema20 = calculateEMA(candles, 20);
  const ema50 = calculateEMA(candles, 50);
  const bands = calculateBollingerBands(candles, 20, 2);
  const lastIndex = candles.length - 1;
  const price = candles[lastIndex].close;
  const currentEMA20 = ema20[lastIndex];
  const currentEMA50 = ema50[lastIndex];
  const slopeReferenceIndex = Math.max(19, lastIndex - 5);
  const slopeReference = ema20[slopeReferenceIndex] || currentEMA20;
  const emaSeparationRatio = Math.abs(currentEMA20 - currentEMA50) / price;
  const ema20SlopeRatio = (currentEMA20 - slopeReference) / price;
  const currentBandWidthRatio = ((bands.upper[lastIndex] || price) - (bands.lower[lastIndex] || price)) / price;
  const historicalBandWidths = [];
  for (let index = Math.max(19, lastIndex - 30); index < lastIndex; index += 1) {
    if (bands.upper[index] !== null && bands.lower[index] !== null) historicalBandWidths.push((bands.upper[index] - bands.lower[index]) / candles[index].close);
  }
  const medianBandWidthRatio = median(historicalBandWidths) || currentBandWidthRatio || 1;
  const bandWidthRatioToBaseline = currentBandWidthRatio / medianBandWidthRatio;
  const ranges = trueRanges(candles);
  const recentATR = average(ranges.slice(-10));
  const baselineATR = average(ranges.slice(-30, -10)) || recentATR || 1;
  const volatilityRatio = recentATR / baselineATR;
  const atrPriceRatio = recentATR / price;
  const bullishAlignmentBars = candles.slice(-5).filter((candle, offset) => candle.close > ema20[lastIndex - 4 + offset]).length;
  const bearishAlignmentBars = candles.slice(-5).filter((candle, offset) => candle.close < ema20[lastIndex - 4 + offset]).length;
  const commonEvidence = {
    ema20: currentEMA20,
    ema50: currentEMA50,
    emaSeparationRatio,
    ema20SlopeRatio,
    currentBandWidthRatio,
    medianBandWidthRatio,
    bandWidthRatioToBaseline,
    recentATR,
    baselineATR,
    atrPriceRatio,
    volatilityRatio,
    bullishAlignmentBars,
    bearishAlignmentBars,
    executionSpreadWidened: spreadInfo?.isWidened === true,
    executionSpreadSource: spreadInfo?.source || null
  };

  const bullishTrend = currentEMA20 > currentEMA50 && price > currentEMA20
    && emaSeparationRatio >= 0.0025 && ema20SlopeRatio >= 0.001 && bullishAlignmentBars >= 4
    && currentBandWidthRatio >= 0.008;
  const bearishTrend = currentEMA20 < currentEMA50 && price < currentEMA20
    && emaSeparationRatio >= 0.0025 && ema20SlopeRatio <= -0.001 && bearishAlignmentBars >= 4
    && currentBandWidthRatio >= 0.008;
  if (bullishTrend || bearishTrend) {
    const bullish = bullishTrend;
    const score = Math.min(95, Math.round(70 + emaSeparationRatio * 2500 + Math.abs(ema20SlopeRatio) * 2500));
    return freezeRegime({
      type: 'TRENDING_MOMENTUM',
      direction: bullish ? 'BULLISH' : 'BEARISH',
      label: bullish ? 'CONFIRMED BULLISH TREND' : 'CONFIRMED BEARISH TREND',
      badgeClass: bullish ? 'regime-bull' : 'regime-bear',
      icon: bullish ? '🟢' : '🔻',
      description: `EMA20/50 แยกตัว มี slope และราคาปิดอยู่ฝั่งเดียวกันอย่างน้อย ${bullish ? bullishAlignmentBars : bearishAlignmentBars}/5 แท่ง`,
      candles,
      evidence: commonEvidence,
      invalidation: { condition: bullish ? 'CLOSE_BELOW_EMA50' : 'CLOSE_ABOVE_EMA50', price: currentEMA50 },
      ruleAlignmentScore: score
    });
  }

  if (volatilityRatio >= 1.5 && atrPriceRatio >= 0.004) {
    return freezeRegime({
      type: 'VOLATILITY_EXPANSION',
      direction: 'NEUTRAL',
      label: 'CONFIRMED VOLATILITY EXPANSION',
      badgeClass: 'regime-shock',
      icon: '⚡',
      description: 'True Range เฉลี่ย 10 แท่งขยายอย่างน้อย 1.5 เท่าจาก baseline ก่อนหน้า โดยยังไม่มี trend alignment ครบ',
      candles,
      evidence: commonEvidence,
      invalidation: { condition: 'VOLATILITY_RATIO_BELOW_1_15', price: null },
      ruleAlignmentScore: Math.min(90, Math.round(65 + (volatilityRatio - 1.5) * 20))
    });
  }

  const compressed = bandWidthRatioToBaseline <= 0.75
    || (currentBandWidthRatio < 0.008 && emaSeparationRatio < 0.0015 && Math.abs(ema20SlopeRatio) < 0.0008);
  if (compressed) {
    return freezeRegime({
      type: 'RANGE_COMPRESSION',
      direction: 'NEUTRAL',
      label: 'CONFIRMED RANGE COMPRESSION',
      badgeClass: 'regime-range',
      icon: '🟡',
      description: 'Bollinger width ต่ำกว่า baseline หรือ EMA แยกตัวและ slope ต่ำตามเกณฑ์ที่ระบุ',
      candles,
      evidence: commonEvidence,
      invalidation: { condition: 'BAND_WIDTH_RATIO_ABOVE_1_20_OR_TREND_CONFIRMED', price: null },
      ruleAlignmentScore: Math.min(88, Math.round(68 + Math.max(0, 0.75 - bandWidthRatioToBaseline) * 40))
    });
  }

  return freezeRegime({
    type: 'TRANSITION',
    direction: 'NEUTRAL',
    label: 'UNCONFIRMED MARKET TRANSITION',
    badgeClass: 'regime-range',
    icon: '⚪',
    description: 'ข้อมูลผ่านขั้นต่ำแล้ว แต่ยังไม่ครบเงื่อนไข Trend, Volatility Expansion หรือ Range Compression',
    candles,
    evidence: commonEvidence,
    invalidation: { condition: 'RECLASSIFY_ON_NEXT_CLOSED_BAR', price: null },
    ruleAlignmentScore: 45
  });
}

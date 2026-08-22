export const PATTERN_EVIDENCE_SCHEMA = 'PATTERN_EVIDENCE_V1';
export const PATTERN_DETECTION_METHOD = 'CLOSED_BAR_CONFIRMED_PRICE_ACTION_V1';

function finite(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidCandle(candle) {
  const open = finite(candle?.open);
  const high = finite(candle?.high);
  const low = finite(candle?.low);
  const close = finite(candle?.close);
  const volume = finite(candle?.volume ?? 0);
  return open !== null && high !== null && low !== null && close !== null && volume !== null
    && open > 0 && close > 0 && high >= Math.max(open, close) && low <= Math.min(open, close)
    && high >= low && volume >= 0;
}

function candleTime(candle, fallbackIndex) {
  const value = finite(candle?.openTimeMs ?? candle?.time);
  return value === null ? fallbackIndex : Math.round(value);
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

function average(values) {
  const valid = values.filter(Number.isFinite);
  return valid.length > 0 ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
}

function range(candle) {
  return Math.max(0, Number(candle.high) - Number(candle.low));
}

function body(candle) {
  return Math.abs(Number(candle.close) - Number(candle.open));
}

function freezePattern({
  type,
  name,
  sentiment,
  weight,
  description,
  candles,
  startIndex,
  endIndex,
  anchorIndices,
  confirmationIndex,
  confirmationMethod,
  invalidationCondition,
  invalidationPrice,
  metrics,
  ruleAlignmentScore
}) {
  const startTime = candleTime(candles[startIndex], startIndex);
  const endTime = candleTime(candles[endIndex], endIndex);
  const confirmationTime = candleTime(candles[confirmationIndex], confirmationIndex);
  const anchors = Object.freeze([...anchorIndices]);
  const anchorTimes = Object.freeze(anchorIndices.map(index => candleTime(candles[index], index)));
  const id = `${PATTERN_EVIDENCE_SCHEMA}:${type}:${startTime}:${endTime}:${anchorTimes.join('-')}`;
  return Object.freeze({
    schema: PATTERN_EVIDENCE_SCHEMA,
    method: PATTERN_DETECTION_METHOD,
    id,
    type,
    name,
    sentiment,
    status: 'CONFIRMED',
    confirmed: true,
    decisionEligible: true,
    calibrated: false,
    ruleAlignmentScore: Math.max(0, Math.min(100, Math.round(ruleAlignmentScore))),
    weight,
    desc: description,
    evidence: Object.freeze({
      startIndex,
      endIndex,
      startTime,
      endTime,
      windowSize: endIndex - startIndex + 1,
      anchorIndices: anchors,
      anchorTimes,
      metrics: Object.freeze({ ...metrics }),
      closedBarPolicy: 'EXPLICIT_FORMING_BARS_EXCLUDED'
    }),
    confirmation: Object.freeze({
      barIndex: confirmationIndex,
      barTime: confirmationTime,
      barsRequired: 1,
      method: confirmationMethod
    }),
    invalidation: Object.freeze({
      condition: invalidationCondition,
      price: Number.isFinite(invalidationPrice) ? invalidationPrice : null
    })
  });
}

function findLocalLows(candles, startIndex, endIndex) {
  const points = [];
  for (let index = Math.max(1, startIndex); index <= Math.min(candles.length - 2, endIndex); index += 1) {
    if (candles[index].low <= candles[index - 1].low && candles[index].low < candles[index + 1].low) points.push(index);
  }
  return points;
}

function findLocalHighs(candles, startIndex, endIndex) {
  const points = [];
  for (let index = Math.max(1, startIndex); index <= Math.min(candles.length - 2, endIndex); index += 1) {
    if (candles[index].high >= candles[index - 1].high && candles[index].high > candles[index + 1].high) points.push(index);
  }
  return points;
}

export function detectConfirmedChartPatterns(inputCandles = []) {
  if (!Array.isArray(inputCandles)) return Object.freeze([]);
  const firstFormingIndex = inputCandles.findIndex(candle => candle?.barClosed === false);
  const formingBarsAreTrailing = firstFormingIndex < 0
    || inputCandles.slice(firstFormingIndex).every(candle => candle?.barClosed === false);
  if (!formingBarsAreTrailing) return Object.freeze([]);
  const candles = firstFormingIndex < 0 ? [...inputCandles] : inputCandles.slice(0, firstFormingIndex);
  if (candles.some(candle => !isValidCandle(candle)) || !hasStrictChronology(candles)) return Object.freeze([]);
  const length = candles.length;
  if (length < 12) return Object.freeze([]);
  const patterns = [];
  const confirmationIndex = length - 1;
  const confirmation = candles[confirmationIndex];
  const setup = candles[length - 2];
  const setupPrevious = candles[length - 3];
  const recentAverageRange = average(candles.slice(Math.max(0, length - 20), length - 1).map(range));
  const safeAverageRange = recentAverageRange || range(setup) || setup.close * 0.001;

  const setupBody = body(setup);
  const previousBody = body(setupPrevious);
  const bullishEngulfing = setupPrevious.close < setupPrevious.open
    && setup.close > setup.open
    && setup.open <= setupPrevious.close
    && setup.close >= setupPrevious.open
    && setupBody >= previousBody * 1.05;
  if (bullishEngulfing && confirmation.close > setup.high && confirmation.close > confirmation.open) {
    patterns.push(freezePattern({
      type: 'BULLISH_ENGULFING_CONFIRMED',
      name: 'Confirmed Bullish Engulfing',
      sentiment: 'BULLISH',
      weight: 14,
      description: 'แท่ง Bullish Engulfing ผ่านการยืนยันด้วยแท่งปิดเหนือจุดสูงของแท่งรูปแบบ',
      candles,
      startIndex: length - 3,
      endIndex: confirmationIndex,
      anchorIndices: [length - 3, length - 2, confirmationIndex],
      confirmationIndex,
      confirmationMethod: 'NEXT_BAR_CLOSE_ABOVE_PATTERN_HIGH',
      invalidationCondition: 'CLOSE_BELOW_PATTERN_LOW',
      invalidationPrice: Math.min(setup.low, setupPrevious.low),
      metrics: { setupBodyRatio: previousBody > 0 ? setupBody / previousBody : null, breakoutDistance: confirmation.close - setup.high },
      ruleAlignmentScore: 72
    }));
  }

  const bearishEngulfing = setupPrevious.close > setupPrevious.open
    && setup.close < setup.open
    && setup.open >= setupPrevious.close
    && setup.close <= setupPrevious.open
    && setupBody >= previousBody * 1.05;
  if (bearishEngulfing && confirmation.close < setup.low && confirmation.close < confirmation.open) {
    patterns.push(freezePattern({
      type: 'BEARISH_ENGULFING_CONFIRMED',
      name: 'Confirmed Bearish Engulfing',
      sentiment: 'BEARISH',
      weight: -14,
      description: 'แท่ง Bearish Engulfing ผ่านการยืนยันด้วยแท่งปิดต่ำกว่าจุดต่ำของแท่งรูปแบบ',
      candles,
      startIndex: length - 3,
      endIndex: confirmationIndex,
      anchorIndices: [length - 3, length - 2, confirmationIndex],
      confirmationIndex,
      confirmationMethod: 'NEXT_BAR_CLOSE_BELOW_PATTERN_LOW',
      invalidationCondition: 'CLOSE_ABOVE_PATTERN_HIGH',
      invalidationPrice: Math.max(setup.high, setupPrevious.high),
      metrics: { setupBodyRatio: previousBody > 0 ? setupBody / previousBody : null, breakoutDistance: setup.low - confirmation.close },
      ruleAlignmentScore: 72
    }));
  }

  const setupRange = range(setup);
  const setupLowerWick = Math.min(setup.open, setup.close) - setup.low;
  const setupUpperWick = setup.high - Math.max(setup.open, setup.close);
  const contextStart = Math.max(0, length - 9);
  const contextWithoutConfirmation = candles.slice(contextStart, confirmationIndex);
  const contextLow = Math.min(...contextWithoutConfirmation.map(candle => candle.low));
  const contextHigh = Math.max(...contextWithoutConfirmation.map(candle => candle.high));
  const hammerShape = setupRange > 0 && setupBody / setupRange <= 0.35
    && setupLowerWick >= Math.max(setupBody * 2, setupRange * 0.5)
    && setupUpperWick <= Math.max(setupBody, setupRange * 0.2)
    && setup.low === contextLow;
  if (hammerShape && confirmation.close > setup.high && confirmation.close > confirmation.open) {
    patterns.push(freezePattern({
      type: 'BULLISH_HAMMER_CONFIRMED',
      name: 'Confirmed Bullish Hammer',
      sentiment: 'BULLISH',
      weight: 12,
      description: 'Hammer เกิดที่จุดต่ำของ evidence window และมีแท่งถัดไปปิดเหนือจุดสูงเพื่อยืนยัน',
      candles,
      startIndex: contextStart,
      endIndex: confirmationIndex,
      anchorIndices: [length - 2, confirmationIndex],
      confirmationIndex,
      confirmationMethod: 'NEXT_BAR_CLOSE_ABOVE_HAMMER_HIGH',
      invalidationCondition: 'CLOSE_BELOW_HAMMER_LOW',
      invalidationPrice: setup.low,
      metrics: { lowerWickBodyRatio: setupBody > 0 ? setupLowerWick / setupBody : null, contextLow },
      ruleAlignmentScore: 68
    }));
  }

  const shootingStarShape = setupRange > 0 && setupBody / setupRange <= 0.35
    && setupUpperWick >= Math.max(setupBody * 2, setupRange * 0.5)
    && setupLowerWick <= Math.max(setupBody, setupRange * 0.2)
    && setup.high === contextHigh;
  if (shootingStarShape && confirmation.close < setup.low && confirmation.close < confirmation.open) {
    patterns.push(freezePattern({
      type: 'BEARISH_SHOOTING_STAR_CONFIRMED',
      name: 'Confirmed Bearish Shooting Star',
      sentiment: 'BEARISH',
      weight: -12,
      description: 'Shooting Star เกิดที่จุดสูงของ evidence window และมีแท่งถัดไปปิดต่ำกว่าจุดต่ำเพื่อยืนยัน',
      candles,
      startIndex: contextStart,
      endIndex: confirmationIndex,
      anchorIndices: [length - 2, confirmationIndex],
      confirmationIndex,
      confirmationMethod: 'NEXT_BAR_CLOSE_BELOW_STAR_LOW',
      invalidationCondition: 'CLOSE_ABOVE_STAR_HIGH',
      invalidationPrice: setup.high,
      metrics: { upperWickBodyRatio: setupBody > 0 ? setupUpperWick / setupBody : null, contextHigh },
      ruleAlignmentScore: 68
    }));
  }

  if (length >= 24) {
    const searchStart = Math.max(0, length - 45);
    const searchEnd = length - 2;
    const toleranceRatio = Math.min(0.012, Math.max(0.0025, (safeAverageRange / confirmation.close) * 0.75));
    const localLows = findLocalLows(candles, searchStart, searchEnd);
    let doubleBottom = null;
    for (let rightPointer = localLows.length - 1; rightPointer >= 1 && !doubleBottom; rightPointer -= 1) {
      const secondIndex = localLows[rightPointer];
      for (let leftPointer = rightPointer - 1; leftPointer >= 0; leftPointer -= 1) {
        const firstIndex = localLows[leftPointer];
        const separation = secondIndex - firstIndex;
        if (separation < 5 || separation > 30) continue;
        const firstLow = candles[firstIndex].low;
        const secondLow = candles[secondIndex].low;
        const similarity = Math.abs(secondLow - firstLow) / Math.max(firstLow, secondLow);
        const neckline = Math.max(...candles.slice(firstIndex, secondIndex + 1).map(candle => candle.high));
        const depth = neckline - ((firstLow + secondLow) / 2);
        if (similarity <= toleranceRatio && depth >= safeAverageRange * 1.1
          && setup.close <= neckline && confirmation.close > neckline && confirmation.close > confirmation.open) {
          doubleBottom = { firstIndex, secondIndex, firstLow, secondLow, neckline, similarity, depth };
          break;
        }
      }
    }
    if (doubleBottom) {
      patterns.push(freezePattern({
        type: 'DOUBLE_BOTTOM_BREAKOUT_CONFIRMED',
        name: 'Confirmed Double Bottom Breakout',
        sentiment: 'BULLISH',
        weight: 20,
        description: 'Swing low สองจุดอยู่ใน tolerance และแท่งล่าสุดปิดทะลุ neckline เป็นครั้งแรก',
        candles,
        startIndex: doubleBottom.firstIndex,
        endIndex: confirmationIndex,
        anchorIndices: [doubleBottom.firstIndex, doubleBottom.secondIndex, confirmationIndex],
        confirmationIndex,
        confirmationMethod: 'CLOSE_CROSSES_ABOVE_NECKLINE',
        invalidationCondition: 'CLOSE_BELOW_SECOND_SWING_LOW',
        invalidationPrice: Math.min(doubleBottom.firstLow, doubleBottom.secondLow) - safeAverageRange * 0.2,
        metrics: { neckline: doubleBottom.neckline, lowSimilarityRatio: doubleBottom.similarity, patternDepth: doubleBottom.depth, toleranceRatio },
        ruleAlignmentScore: 82
      }));
    }

    const localHighs = findLocalHighs(candles, searchStart, searchEnd);
    let doubleTop = null;
    for (let rightPointer = localHighs.length - 1; rightPointer >= 1 && !doubleTop; rightPointer -= 1) {
      const secondIndex = localHighs[rightPointer];
      for (let leftPointer = rightPointer - 1; leftPointer >= 0; leftPointer -= 1) {
        const firstIndex = localHighs[leftPointer];
        const separation = secondIndex - firstIndex;
        if (separation < 5 || separation > 30) continue;
        const firstHigh = candles[firstIndex].high;
        const secondHigh = candles[secondIndex].high;
        const similarity = Math.abs(secondHigh - firstHigh) / Math.max(firstHigh, secondHigh);
        const neckline = Math.min(...candles.slice(firstIndex, secondIndex + 1).map(candle => candle.low));
        const depth = ((firstHigh + secondHigh) / 2) - neckline;
        if (similarity <= toleranceRatio && depth >= safeAverageRange * 1.1
          && setup.close >= neckline && confirmation.close < neckline && confirmation.close < confirmation.open) {
          doubleTop = { firstIndex, secondIndex, firstHigh, secondHigh, neckline, similarity, depth };
          break;
        }
      }
    }
    if (doubleTop) {
      patterns.push(freezePattern({
        type: 'DOUBLE_TOP_BREAKDOWN_CONFIRMED',
        name: 'Confirmed Double Top Breakdown',
        sentiment: 'BEARISH',
        weight: -20,
        description: 'Swing high สองจุดอยู่ใน tolerance และแท่งล่าสุดปิดหลุด neckline เป็นครั้งแรก',
        candles,
        startIndex: doubleTop.firstIndex,
        endIndex: confirmationIndex,
        anchorIndices: [doubleTop.firstIndex, doubleTop.secondIndex, confirmationIndex],
        confirmationIndex,
        confirmationMethod: 'CLOSE_CROSSES_BELOW_NECKLINE',
        invalidationCondition: 'CLOSE_ABOVE_SECOND_SWING_HIGH',
        invalidationPrice: Math.max(doubleTop.firstHigh, doubleTop.secondHigh) + safeAverageRange * 0.2,
        metrics: { neckline: doubleTop.neckline, highSimilarityRatio: doubleTop.similarity, patternDepth: doubleTop.depth, toleranceRatio },
        ruleAlignmentScore: 82
      }));
    }
  }

  if (length >= 14) {
    const first = candles[length - 4];
    const displacement = candles[length - 3];
    const third = candles[length - 2];
    const displacementBody = body(displacement);
    const baselineBody = average(candles.slice(Math.max(0, length - 13), length - 3).map(body)) || safeAverageRange * 0.4;
    if (third.low > first.high && displacement.close > displacement.open
      && displacementBody >= baselineBody * 1.5 && confirmation.close > third.high) {
      patterns.push(freezePattern({
        type: 'BULLISH_FVG_CONTINUATION_CONFIRMED',
        name: 'Confirmed Bullish Fair Value Gap',
        sentiment: 'BULLISH',
        weight: 14,
        description: 'Three-candle imbalance มี displacement body และแท่งถัดไปปิดเหนือโครงสร้างเพื่อยืนยัน continuation',
        candles,
        startIndex: length - 4,
        endIndex: confirmationIndex,
        anchorIndices: [length - 4, length - 3, length - 2, confirmationIndex],
        confirmationIndex,
        confirmationMethod: 'NEXT_BAR_CLOSE_ABOVE_IMBALANCE_STRUCTURE',
        invalidationCondition: 'CLOSE_BELOW_GAP_LOWER_BOUND',
        invalidationPrice: first.high,
        metrics: { gapLower: first.high, gapUpper: third.low, displacementBodyRatio: displacementBody / baselineBody },
        ruleAlignmentScore: 74
      }));
    }
    if (third.high < first.low && displacement.close < displacement.open
      && displacementBody >= baselineBody * 1.5 && confirmation.close < third.low) {
      patterns.push(freezePattern({
        type: 'BEARISH_FVG_CONTINUATION_CONFIRMED',
        name: 'Confirmed Bearish Fair Value Gap',
        sentiment: 'BEARISH',
        weight: -14,
        description: 'Three-candle imbalance มี bearish displacement และแท่งถัดไปปิดต่ำกว่าโครงสร้างเพื่อยืนยัน continuation',
        candles,
        startIndex: length - 4,
        endIndex: confirmationIndex,
        anchorIndices: [length - 4, length - 3, length - 2, confirmationIndex],
        confirmationIndex,
        confirmationMethod: 'NEXT_BAR_CLOSE_BELOW_IMBALANCE_STRUCTURE',
        invalidationCondition: 'CLOSE_ABOVE_GAP_UPPER_BOUND',
        invalidationPrice: first.low,
        metrics: { gapLower: third.high, gapUpper: first.low, displacementBodyRatio: displacementBody / baselineBody },
        ruleAlignmentScore: 74
      }));
    }
  }

  const sweepReference = candles.slice(Math.max(0, length - 13), length - 2);
  if (sweepReference.length >= 8) {
    const referenceLow = Math.min(...sweepReference.map(candle => candle.low));
    const referenceHigh = Math.max(...sweepReference.map(candle => candle.high));
    const lowerWick = Math.min(setup.open, setup.close) - setup.low;
    const upperWick = setup.high - Math.max(setup.open, setup.close);
    if (setup.low < referenceLow && setup.close > referenceLow && lowerWick >= Math.max(setupBody, safeAverageRange * 0.35)
      && confirmation.close > setup.high && confirmation.close > confirmation.open) {
      patterns.push(freezePattern({
        type: 'BULLISH_LIQUIDITY_SWEEP_CONFIRMED',
        name: 'Confirmed Bullish Liquidity Sweep',
        sentiment: 'BULLISH',
        weight: 16,
        description: 'ราคากวาดต่ำกว่า reference low แล้วกลับมาปิดเหนือระดับ ก่อนแท่งถัดไปยืนยันเหนือ sweep high',
        candles,
        startIndex: Math.max(0, length - 13),
        endIndex: confirmationIndex,
        anchorIndices: [length - 2, confirmationIndex],
        confirmationIndex,
        confirmationMethod: 'RECLAIM_REFERENCE_LOW_AND_CONFIRM_ABOVE_SWEEP_HIGH',
        invalidationCondition: 'CLOSE_BELOW_SWEEP_LOW',
        invalidationPrice: setup.low,
        metrics: { referenceLow, sweepDistance: referenceLow - setup.low },
        ruleAlignmentScore: 78
      }));
    }
    if (setup.high > referenceHigh && setup.close < referenceHigh && upperWick >= Math.max(setupBody, safeAverageRange * 0.35)
      && confirmation.close < setup.low && confirmation.close < confirmation.open) {
      patterns.push(freezePattern({
        type: 'BEARISH_LIQUIDITY_SWEEP_CONFIRMED',
        name: 'Confirmed Bearish Liquidity Sweep',
        sentiment: 'BEARISH',
        weight: -16,
        description: 'ราคากวาดสูงกว่า reference high แล้วกลับมาปิดต่ำกว่าระดับ ก่อนแท่งถัดไปยืนยันต่ำกว่า sweep low',
        candles,
        startIndex: Math.max(0, length - 13),
        endIndex: confirmationIndex,
        anchorIndices: [length - 2, confirmationIndex],
        confirmationIndex,
        confirmationMethod: 'REJECT_REFERENCE_HIGH_AND_CONFIRM_BELOW_SWEEP_LOW',
        invalidationCondition: 'CLOSE_ABOVE_SWEEP_HIGH',
        invalidationPrice: setup.high,
        metrics: { referenceHigh, sweepDistance: setup.high - referenceHigh },
        ruleAlignmentScore: 78
      }));
    }
  }

  const byType = new Map();
  for (const pattern of patterns) if (!byType.has(pattern.type)) byType.set(pattern.type, pattern);
  return Object.freeze([...byType.values()].sort((left, right) => Math.abs(right.weight) - Math.abs(left.weight) || left.type.localeCompare(right.type)));
}

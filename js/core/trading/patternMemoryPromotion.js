import { PATTERN_RESEARCH_METHOD } from './patternOutcomeResearch.js';
import { VALIDATED_MEMORY_EVIDENCE_POLICY, VALIDATED_MEMORY_PROVENANCE } from './strategyMemoryPolicy.js';

export const PATTERN_MEMORY_PROMOTION_POLICY = VALIDATED_MEMORY_EVIDENCE_POLICY;

const PATTERN_KEY_RULES = Object.freeze([
  ['BULLISH_ENGULFING', 'Bullish Engulfing'],
  ['BEARISH_ENGULFING', 'Bearish Engulfing'],
  ['DOUBLE_BOTTOM', 'Double Bottom'],
  ['DOUBLE_TOP', 'Double Top'],
  ['BULLISH_HAMMER', 'Hammer / Bullish Pinbar'],
  ['BEARISH_SHOOTING_STAR', 'Shooting Star / Bearish Pinbar'],
  ['FVG', 'Fair Value Gap (FVG)'],
  ['LIQUIDITY_SWEEP', 'Liquidity Sweep']
]);

function finite(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function strategyKey(patternType) {
  const type = String(patternType || '').toUpperCase();
  return PATTERN_KEY_RULES.find(([fragment]) => type.includes(fragment))?.[1] || null;
}

function purgeOverlappingSamples(samples) {
  const sorted = [...samples].sort((left, right) => Number(left.signalTime) - Number(right.signalTime));
  const independent = [];
  let lastLabelTime = -Infinity;
  for (const sample of sorted) {
    const signalTime = finite(sample?.signalTime);
    const labelTime = finite(sample?.labelTime);
    const netReturnR = finite(sample?.outcome?.netReturnR);
    if (sample?.status !== 'COMPLETED' || signalTime === null || labelTime === null || labelTime < signalTime || netReturnR === null) continue;
    if (signalTime <= lastLabelTime) continue;
    independent.push(sample);
    lastLabelTime = labelTime;
  }
  return independent;
}

function metrics(samples) {
  const returns = samples.map(sample => Number(sample.outcome.netReturnR));
  const wins = returns.filter(value => value > 0).length;
  const losses = returns.length - wins;
  const positiveR = returns.filter(value => value > 0).reduce((sum, value) => sum + value, 0);
  const negativeR = Math.abs(returns.filter(value => value <= 0).reduce((sum, value) => sum + value, 0));
  const expectancyR = returns.length ? returns.reduce((sum, value) => sum + value, 0) / returns.length : null;
  const winRate = returns.length ? wins / returns.length : null;
  let wilsonLowerBound = null;
  if (returns.length) {
    const z = 1.96;
    const denominator = 1 + (z * z) / returns.length;
    const centre = winRate + (z * z) / (2 * returns.length);
    const adjustment = z * Math.sqrt((winRate * (1 - winRate) + (z * z) / (4 * returns.length)) / returns.length);
    wilsonLowerBound = (centre - adjustment) / denominator;
  }
  return deepFreeze({
    samples: returns.length,
    wins,
    losses,
    winRatePercent: winRate === null ? null : Number((winRate * 100).toFixed(4)),
    wilsonLowerBoundPercent: wilsonLowerBound === null ? null : Number((wilsonLowerBound * 100).toFixed(4)),
    expectancyR: expectancyR === null ? null : Number(expectancyR.toFixed(6)),
    profitFactorR: negativeR > 0 ? Number((positiveR / negativeR).toFixed(6)) : positiveR > 0 ? null : 0
  });
}

function evaluatePatternGroup(patternType, samples, dataset, { minimumIndependentSamples = 60, foldCount = 4 } = {}) {
  const independent = purgeOverlappingSamples(samples);
  const aggregate = metrics(independent);
  const folds = [];
  if (independent.length >= foldCount) {
    for (let fold = 0; fold < foldCount; fold += 1) {
      const start = Math.floor((independent.length * fold) / foldCount);
      const end = Math.floor((independent.length * (fold + 1)) / foldCount);
      const foldSamples = independent.slice(start, end);
      folds.push(deepFreeze({
        fold: fold + 1,
        firstSignalTime: finite(foldSamples[0]?.signalTime),
        lastLabelTime: finite(foldSamples.at(-1)?.labelTime),
        metrics: metrics(foldSamples)
      }));
    }
  }
  const foldExpectancies = folds.map(fold => fold.metrics.expectancyR).filter(Number.isFinite);
  const positiveFolds = foldExpectancies.filter(value => value > 0).length;
  const worstFoldExpectancyR = foldExpectancies.length ? Math.min(...foldExpectancies) : null;
  const expectancyRangeR = foldExpectancies.length ? Math.max(...foldExpectancies) - Math.min(...foldExpectancies) : null;
  const checks = deepFreeze({
    verifiedDataset: dataset.provenance?.verified === true && dataset.provenance?.simulation === false,
    lookaheadAuditPassed: dataset.lookaheadAudit?.patternDetectionUsesHistoryThroughSignalOnly === true
      && dataset.lookaheadAudit?.entryBeginsOnNextBar === true
      && dataset.lookaheadAudit?.labelsReadForwardOnlyAfterSignal === true,
    enoughIndependentSamples: independent.length >= minimumIndependentSamples,
    fourChronologicalFolds: folds.length === foldCount && folds.every(fold => fold.metrics.samples >= 10),
    positiveFoldMajority: positiveFolds >= Math.ceil(foldCount * 0.75),
    aggregateExpectancyPositive: aggregate.expectancyR !== null && aggregate.expectancyR >= 0.05,
    aggregateProfitFactor: aggregate.profitFactorR === null || aggregate.profitFactorR >= 1.1,
    uncertaintyBound: aggregate.wilsonLowerBoundPercent !== null && aggregate.wilsonLowerBoundPercent >= 45,
    worstFoldControlled: worstFoldExpectancyR !== null && worstFoldExpectancyR >= -0.15,
    stableAcrossFolds: expectancyRangeR !== null && expectancyRangeR <= 1
  });
  const promoted = Object.values(checks).every(Boolean);
  const key = strategyKey(patternType);
  const lastLabelTime = finite(independent.at(-1)?.labelTime);
  const evaluation = deepFreeze({
    patternType,
    strategyKey: key,
    promoted: promoted && key !== null,
    detectedCompletedSamples: samples.length,
    independentSamples: independent.length,
    overlapPurgedSamples: Math.max(0, samples.length - independent.length),
    aggregate,
    folds: Object.freeze(folds),
    positiveFolds,
    worstFoldExpectancyR,
    expectancyRangeR: expectancyRangeR === null ? null : Number(expectancyRangeR.toFixed(6)),
    checks
  });
  if (!evaluation.promoted) return deepFreeze({ evaluation, memory: null });
  const memory = deepFreeze({
    wins: aggregate.wins,
    losses: aggregate.losses,
    winRate: aggregate.winRatePercent,
    weightMultiplier: Number(Math.max(0.9, Math.min(1.1, 1 + aggregate.expectancyR * 0.05)).toFixed(4)),
    lastLesson: `Validated ${independent.length} non-overlapping forward outcomes; expectancy ${aggregate.expectancyR}R`,
    provenance: VALIDATED_MEMORY_PROVENANCE,
    outOfSampleValidated: true,
    trainedAt: new Date(lastLabelTime).toISOString(),
    validationEvidence: {
      policy: PATTERN_MEMORY_PROMOTION_POLICY,
      passed: true,
      datasetId: dataset.datasetId,
      candleFingerprint: dataset.provenance.candleFingerprint,
      patternType,
      independentSamples: independent.length,
      foldCount,
      positiveFolds,
      aggregateExpectancyR: aggregate.expectancyR,
      worstFoldExpectancyR,
      lookaheadVerified: true,
      overlapPurged: true
    }
  });
  return deepFreeze({ evaluation, memory });
}

export function promotePatternStrategyMemory(dataset, options = {}) {
  if (!dataset || dataset.success !== true || dataset.method !== PATTERN_RESEARCH_METHOD
    || dataset.provenance?.verified !== true || dataset.provenance?.simulation === true || !Array.isArray(dataset.samples)) {
    return deepFreeze({ success: false, reason: 'VERIFIED_PATTERN_RESEARCH_DATASET_REQUIRED', memories: {}, evaluations: [] });
  }
  const grouped = new Map();
  for (const sample of dataset.samples) {
    if (sample?.status !== 'COMPLETED' || typeof sample?.pattern?.type !== 'string') continue;
    if (!grouped.has(sample.pattern.type)) grouped.set(sample.pattern.type, []);
    grouped.get(sample.pattern.type).push(sample);
  }
  const memories = {};
  const evaluations = [];
  for (const [patternType, samples] of grouped.entries()) {
    const result = evaluatePatternGroup(patternType, samples, dataset, options);
    evaluations.push(result.evaluation);
    if (result.memory && result.evaluation.strategyKey) memories[result.evaluation.strategyKey] = result.memory;
  }
  return deepFreeze({
    success: true,
    policy: PATTERN_MEMORY_PROMOTION_POLICY,
    datasetId: dataset.datasetId,
    generatedAt: dataset.generatedAt,
    promotedCount: Object.keys(memories).length,
    memories,
    evaluations: Object.freeze(evaluations)
  });
}

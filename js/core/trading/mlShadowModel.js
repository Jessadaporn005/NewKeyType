export const ML_SHADOW_MODEL_SCHEMA = 2;
export const ML_SHADOW_MODEL_TYPE = 'BALANCED_LOGISTIC_DIRECTION_V2';
export const ML_FEATURE_SCHEMA = 'RETURNS_TREND_RANGE_VOLUME_V1';
export const ML_SHADOW_EVALUATION_METHOD = 'CHRONOLOGICAL_HOLDOUT_AND_REPEATED_WALK_FORWARD_V2';
export const ML_TRAINING_OBJECTIVE = 'TRAIN_ONLY_INVERSE_FREQUENCY_WEIGHTED_LOG_LOSS_V1';

const FEATURE_COUNT = 8;
const MIN_HISTORY = 21;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function finite(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sigmoid(value) {
  const bounded = clamp(value, -30, 30);
  return 1 / (1 + Math.exp(-bounded));
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function validateCandles(candles) {
  if (!Array.isArray(candles)) return false;
  let previousTime = -Infinity;
  for (const candle of candles) {
    const time = finite(candle?.time);
    const open = finite(candle?.open);
    const high = finite(candle?.high);
    const low = finite(candle?.low);
    const close = finite(candle?.close);
    const volume = finite(candle?.volume);
    if ([time, open, high, low, close, volume].includes(null)
      || time <= previousTime || open <= 0 || close <= 0 || low <= 0
      || high < Math.max(open, close) || low > Math.min(open, close) || volume < 0) return false;
    previousTime = time;
  }
  return true;
}

function ema(values, period) {
  if (!values.length) return 0;
  const multiplier = 2 / (period + 1);
  let result = values[0];
  for (let index = 1; index < values.length; index++) {
    result = values[index] * multiplier + result * (1 - multiplier);
  }
  return result;
}

function rsi(closes, period = 14) {
  if (closes.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let index = closes.length - period; index < closes.length; index++) {
    const change = closes[index] - closes[index - 1];
    if (change >= 0) gains += change;
    else losses -= change;
  }
  if (losses === 0) return gains === 0 ? 50 : 100;
  const relativeStrength = gains / losses;
  return 100 - (100 / (1 + relativeStrength));
}

export function extractMLFeatures(candles, index = candles?.length - 1) {
  if (!validateCandles(candles) || !Number.isInteger(index) || index < MIN_HISTORY - 1 || index >= candles.length) return null;
  const start = Math.max(0, index - 20);
  const window = candles.slice(start, index + 1);
  const closes = window.map(candle => candle.close);
  const volumes = window.map(candle => candle.volume);
  const current = candles[index];
  const close1 = candles[index - 1].close;
  const close5 = candles[index - 5].close;
  const close10 = candles[index - 10].close;
  const currentClose = current.close;
  const averageVolume = Math.max(Number.EPSILON, mean(volumes.slice(0, -1)));
  const ema5 = ema(closes.slice(-10), 5);
  const ema20 = ema(closes, 20);

  return Object.freeze([
    clamp(Math.log(currentClose / close1) / 0.02, -3, 3),
    clamp(Math.log(currentClose / close5) / 0.05, -3, 3),
    clamp(Math.log(currentClose / close10) / 0.08, -3, 3),
    clamp(((current.close - current.open) / currentClose) / 0.02, -3, 3),
    clamp(((current.high - current.low) / currentClose) / 0.03, 0, 3),
    clamp(((ema5 - ema20) / currentClose) / 0.03, -3, 3),
    clamp((rsi(closes, 14) - 50) / 25, -2, 2),
    clamp(Math.log((current.volume + 1) / (averageVolume + 1)), -3, 3)
  ].map(value => Number(value.toFixed(8))));
}

export function createMLShadowModel(metadata = {}) {
  return {
    schemaVersion: ML_SHADOW_MODEL_SCHEMA,
    modelType: ML_SHADOW_MODEL_TYPE,
    featureSchema: ML_FEATURE_SCHEMA,
    trainingObjective: ML_TRAINING_OBJECTIVE,
    weights: Array(FEATURE_COUNT).fill(0),
    bias: 0,
    samplesSeen: 0,
    positiveSamples: 0,
    negativeSamples: 0,
    trainedThroughTime: null,
    trainedAt: null,
    dataProvenance: {
      source: typeof metadata.source === 'string' ? metadata.source.slice(0, 120) : 'UNSPECIFIED',
      assetId: typeof metadata.assetId === 'string' ? metadata.assetId.slice(0, 80) : null,
      timeframe: typeof metadata.timeframe === 'string' ? metadata.timeframe.slice(0, 20) : null,
      firstCandleTime: finite(metadata.firstCandleTime),
      lastCandleTime: finite(metadata.lastCandleTime),
      candleCount: Math.max(0, Number(metadata.candleCount) || 0)
    },
    certification: {
      stage: 'SHADOW',
      promotionCandidate: false,
      decisionEligible: false
    }
  };
}

export function predictMLDirection(model, candles, index = candles?.length - 1) {
  const restored = restoreMLShadowModel(model);
  const features = extractMLFeatures(candles, index);
  if (!restored || !features) return null;
  const score = restored.weights.reduce((sum, weight, featureIndex) => sum + weight * features[featureIndex], restored.bias);
  const rawProbabilityUp = sigmoid(score);
  return Object.freeze({
    modelType: ML_SHADOW_MODEL_TYPE,
    featureSchema: ML_FEATURE_SCHEMA,
    direction: rawProbabilityUp >= 0.5 ? 'UP' : 'DOWN',
    rawProbabilityUp: Number(rawProbabilityUp.toFixed(6)),
    calibrated: false,
    stage: 'SHADOW',
    decisionInfluence: false,
    candleTime: candles[index].time,
    samplesSeen: restored.samplesSeen
  });
}

function trainExample(model, example, classWeights, baseLearningRate = 0.04, l2 = 0.0005) {
  const prediction = sigmoid(model.weights.reduce((sum, weight, index) => sum + weight * example.features[index], model.bias));
  const exampleWeight = example.label === 1 ? classWeights.positiveWeight : classWeights.negativeWeight;
  const error = (prediction - example.label) * exampleWeight;
  const learningRate = baseLearningRate / Math.sqrt(1 + model.samplesSeen / 100);
  for (let index = 0; index < model.weights.length; index++) {
    const gradient = error * example.features[index] + l2 * model.weights[index];
    model.weights[index] = clamp(model.weights[index] - learningRate * gradient, -25, 25);
  }
  model.bias = clamp(model.bias - learningRate * error, -25, 25);
  model.samplesSeen += 1;
  if (example.label === 1) model.positiveSamples += 1;
  else model.negativeSamples += 1;
  model.trainedThroughTime = example.labelTime;
}

function buildExamples(candles, horizonBars, roundTripCostBps) {
  const examples = [];
  const costThreshold = Math.max(0, Number(roundTripCostBps) || 0) / 10000;
  for (let index = MIN_HISTORY - 1; index + horizonBars < candles.length; index++) {
    const features = extractMLFeatures(candles, index);
    if (!features) continue;
    const currentClose = candles[index].close;
    const futureClose = candles[index + horizonBars].close;
    const futureReturn = (futureClose - currentClose) / currentClose;
    if (Math.abs(futureReturn) <= costThreshold) continue;
    examples.push(Object.freeze({
      features,
      label: futureReturn > costThreshold ? 1 : 0,
      featureTime: candles[index].time,
      labelTime: candles[index + horizonBars].time,
      futureReturn
    }));
  }
  return examples;
}

function deriveTrainingClassWeights(examples) {
  const positiveSamples = examples.reduce((sum, example) => sum + Number(example.label === 1), 0);
  const negativeSamples = examples.length - positiveSamples;
  if (positiveSamples < 1 || negativeSamples < 1) return null;
  return Object.freeze({
    positiveSamples,
    negativeSamples,
    positiveWeight: Number((examples.length / (2 * positiveSamples)).toFixed(8)),
    negativeWeight: Number((examples.length / (2 * negativeSamples)).toFixed(8))
  });
}

function metricsFor(model, examples, baselineProbability) {
  if (!examples.length) return null;
  let correct = 0;
  let truePositive = 0;
  let trueNegative = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  let predictedPositiveCount = 0;
  let brier = 0;
  let logLoss = 0;
  let baselineCorrect = 0;
  let baselineBrier = 0;
  let baselineLogLoss = 0;
  const baselineDirection = baselineProbability >= 0.5 ? 1 : 0;
  for (const example of examples) {
    const probability = sigmoid(model.weights.reduce((sum, weight, index) => sum + weight * example.features[index], model.bias));
    const predicted = probability >= 0.5 ? 1 : 0;
    if (predicted === 1) predictedPositiveCount += 1;
    if (predicted === example.label) correct += 1;
    if (example.label === 1) {
      positiveCount += 1;
      if (predicted === 1) truePositive += 1;
    } else {
      negativeCount += 1;
      if (predicted === 0) trueNegative += 1;
    }
    brier += (probability - example.label) ** 2;
    logLoss += -(example.label * Math.log(clamp(probability, 1e-9, 1 - 1e-9))
      + (1 - example.label) * Math.log(clamp(1 - probability, 1e-9, 1 - 1e-9)));
    if (baselineDirection === example.label) baselineCorrect += 1;
    baselineBrier += (baselineProbability - example.label) ** 2;
    baselineLogLoss += -(example.label * Math.log(clamp(baselineProbability, 1e-9, 1 - 1e-9))
      + (1 - example.label) * Math.log(clamp(1 - baselineProbability, 1e-9, 1 - 1e-9)));
  }
  const count = examples.length;
  const sensitivity = positiveCount ? truePositive / positiveCount : 0;
  const specificity = negativeCount ? trueNegative / negativeCount : 0;
  return Object.freeze({
    count,
    accuracy: Number((correct / count).toFixed(6)),
    balancedAccuracy: Number(((sensitivity + specificity) / 2).toFixed(6)),
    sensitivity: Number(sensitivity.toFixed(6)),
    specificity: Number(specificity.toFixed(6)),
    predictedPositiveRate: Number((predictedPositiveCount / count).toFixed(6)),
    brier: Number((brier / count).toFixed(6)),
    logLoss: Number((logLoss / count).toFixed(6)),
    positiveRate: Number((positiveCount / count).toFixed(6)),
    baseline: Object.freeze({
      probabilityUp: Number(baselineProbability.toFixed(6)),
      accuracy: Number((baselineCorrect / count).toFixed(6)),
      brier: Number((baselineBrier / count).toFixed(6)),
      logLoss: Number((baselineLogLoss / count).toFixed(6))
    })
  });
}

function evaluateRepeatedWalkForward(examples, metadata, horizonBars, requestedFoldCount = 4) {
  const foldCount = Math.max(3, Math.min(5, Number.parseInt(requestedFoldCount, 10) || 4));
  const initialTrainEnd = Math.floor(examples.length * 0.5);
  const foldSize = Math.floor((examples.length - initialTrainEnd) / foldCount);
  if (initialTrainEnd - horizonBars < 100 || foldSize < 20) return null;

  const folds = [];
  for (let foldIndex = 0; foldIndex < foldCount; foldIndex++) {
    const testStart = initialTrainEnd + foldIndex * foldSize;
    const testEnd = foldIndex === foldCount - 1 ? examples.length : testStart + foldSize;
    const trainExamples = examples.slice(0, Math.max(0, testStart - horizonBars));
    const testExamples = examples.slice(testStart, testEnd);
    if (trainExamples.length < 100 || testExamples.length < 20) return null;

    const foldModel = createMLShadowModel(metadata);
    const trainingBalance = deriveTrainingClassWeights(trainExamples);
    if (!trainingBalance) return null;
    for (const example of trainExamples) trainExample(foldModel, example, trainingBalance);
    const baselineProbability = clamp(foldModel.positiveSamples / Math.max(1, foldModel.samplesSeen), 1e-6, 1 - 1e-6);
    const metrics = metricsFor(foldModel, testExamples, baselineProbability);
    const trainLabelEndTime = trainExamples.at(-1)?.labelTime || null;
    const testFeatureStartTime = testExamples[0]?.featureTime || null;
    const leakageFree = Number.isFinite(trainLabelEndTime)
      && Number.isFinite(testFeatureStartTime)
      && trainLabelEndTime < testFeatureStartTime;
    folds.push(Object.freeze({
      fold: foldIndex + 1,
      train: trainExamples.length,
      test: testExamples.length,
      trainLabelEndTime,
      testFeatureStartTime,
      purgedEmbargoExamples: horizonBars,
      leakageFree,
      trainingBalance,
      metrics
    }));
  }

  const totalTestExamples = folds.reduce((sum, fold) => sum + fold.test, 0);
  const weightedMetric = selector => Number((folds.reduce(
    (sum, fold) => sum + selector(fold.metrics) * fold.test,
    0
  ) / totalTestExamples).toFixed(6));
  const balancedAccuracies = folds.map(fold => fold.metrics.balancedAccuracy);
  const foldsBeatingBaselineBrier = folds.filter(fold => fold.metrics.brier + 0.005 < fold.metrics.baseline.brier).length;
  const foldsBeatingBaselineLogLoss = folds.filter(fold => fold.metrics.logLoss < fold.metrics.baseline.logLoss).length;
  const nonDegenerateFoldCount = folds.filter(fold => fold.metrics.predictedPositiveRate >= 0.1 && fold.metrics.predictedPositiveRate <= 0.9).length;

  return Object.freeze({
    method: 'EXPANDING_WINDOW_PURGED_WALK_FORWARD_V1',
    foldCount,
    initialTrainExamples: initialTrainEnd - horizonBars,
    totalTestExamples,
    allLeakageFree: folds.every(fold => fold.leakageFree),
    foldsBeatingBaselineBrier,
    foldsBeatingBaselineLogLoss,
    nonDegenerateFoldCount,
    minimumFoldBalancedAccuracy: Number(Math.min(...balancedAccuracies).toFixed(6)),
    maximumFoldBalancedAccuracy: Number(Math.max(...balancedAccuracies).toFixed(6)),
    balancedAccuracyRange: Number((Math.max(...balancedAccuracies) - Math.min(...balancedAccuracies)).toFixed(6)),
    aggregate: Object.freeze({
      accuracy: weightedMetric(metrics => metrics.accuracy),
      balancedAccuracy: weightedMetric(metrics => metrics.balancedAccuracy),
      sensitivity: weightedMetric(metrics => metrics.sensitivity),
      specificity: weightedMetric(metrics => metrics.specificity),
      predictedPositiveRate: weightedMetric(metrics => metrics.predictedPositiveRate),
      brier: weightedMetric(metrics => metrics.brier),
      logLoss: weightedMetric(metrics => metrics.logLoss),
      baselineBrier: weightedMetric(metrics => metrics.baseline.brier),
      baselineLogLoss: weightedMetric(metrics => metrics.baseline.logLoss)
    }),
    folds: Object.freeze(folds)
  });
}

export function trainAndEvaluateMLShadow(candles, {
  assetId = null,
  timeframe = null,
  source = 'UNSPECIFIED',
  horizonBars = 3,
  roundTripCostBps = 12,
  walkForwardFolds = 4,
  now = Date.now()
} = {}) {
  const evaluationTime = finite(now);
  if (evaluationTime === null) return Object.freeze({ success: false, reason: 'INVALID_EVALUATION_TIME' });
  if (!validateCandles(candles) || candles.length < 120) {
    return Object.freeze({ success: false, reason: 'AT_LEAST_120_VALID_CHRONOLOGICAL_CANDLES_REQUIRED' });
  }
  const safeHorizon = Math.max(1, Math.min(20, Number.parseInt(horizonBars, 10) || 3));
  const examples = buildExamples(candles, safeHorizon, roundTripCostBps);
  if (examples.length < 90) return Object.freeze({ success: false, reason: 'INSUFFICIENT_NON_NEUTRAL_EXAMPLES' });

  const trainEnd = Math.floor(examples.length * 0.6);
  const validationEnd = Math.floor(examples.length * 0.8);
  // Purge a horizon-sized embargo before each holdout. Training labels therefore
  // cannot use prices that belong to the following evaluation segment.
  const trainExamples = examples.slice(0, Math.max(0, trainEnd - safeHorizon));
  const validationExamples = examples.slice(trainEnd, Math.max(trainEnd, validationEnd - safeHorizon));
  const testExamples = examples.slice(validationEnd);
  if (trainExamples.length < 30 || validationExamples.length < 10 || testExamples.length < 10) {
    return Object.freeze({ success: false, reason: 'INSUFFICIENT_EXAMPLES_AFTER_HOLDOUT_EMBARGO' });
  }
  const model = createMLShadowModel({
    source,
    assetId,
    timeframe,
    firstCandleTime: candles[0].time,
    lastCandleTime: candles.at(-1).time,
    candleCount: candles.length
  });
  const trainingBalance = deriveTrainingClassWeights(trainExamples);
  if (!trainingBalance) return Object.freeze({ success: false, reason: 'TRAINING_SPLIT_REQUIRES_BOTH_CLASSES' });
  for (const example of trainExamples) trainExample(model, example, trainingBalance);
  model.weights = model.weights.map(weight => Number(weight.toFixed(10)));
  model.bias = Number(model.bias.toFixed(10));
  model.trainedAt = new Date(evaluationTime).toISOString();

  const baselineProbability = clamp(model.positiveSamples / Math.max(1, model.samplesSeen), 1e-6, 1 - 1e-6);
  const validationMetrics = metricsFor(model, validationExamples, baselineProbability);
  const testMetrics = metricsFor(model, testExamples, baselineProbability);
  const walkForward = evaluateRepeatedWalkForward(examples, {
    source,
    assetId,
    timeframe,
    firstCandleTime: candles[0].time,
    lastCandleTime: candles.at(-1).time,
    candleCount: candles.length
  }, safeHorizon, walkForwardFolds);
  if (!walkForward) return Object.freeze({ success: false, reason: 'INSUFFICIENT_EXAMPLES_FOR_REPEATED_WALK_FORWARD' });
  const requiredMajority = Math.ceil(walkForward.foldCount * 0.75);
  const promotionChecks = Object.freeze({
    sufficientTrainSamples: trainExamples.length >= 200,
    sufficientValidationSamples: validationExamples.length >= 50,
    sufficientTestSamples: testExamples.length >= 50,
    balancedTestClasses: testMetrics.positiveRate >= 0.2 && testMetrics.positiveRate <= 0.8,
    beatsBaselineBrier: testMetrics.brier + 0.005 < testMetrics.baseline.brier,
    beatsBaselineLogLoss: testMetrics.logLoss < testMetrics.baseline.logLoss,
    minimumBalancedAccuracy: testMetrics.balancedAccuracy >= 0.52,
    nonDegenerateHoldoutPredictions: testMetrics.predictedPositiveRate >= 0.1 && testMetrics.predictedPositiveRate <= 0.9,
    stableAcrossHoldouts: Math.abs(validationMetrics.brier - testMetrics.brier) <= 0.08,
    sufficientWalkForwardFolds: walkForward.foldCount >= 4,
    walkForwardLeakageFree: walkForward.allLeakageFree,
    walkForwardBalancedAccuracy: walkForward.aggregate.balancedAccuracy >= 0.52,
    walkForwardBeatsBaselineBrier: walkForward.foldsBeatingBaselineBrier >= requiredMajority,
    walkForwardBeatsBaselineLogLoss: walkForward.foldsBeatingBaselineLogLoss >= requiredMajority,
    walkForwardNonDegeneratePredictions: walkForward.nonDegenerateFoldCount === walkForward.foldCount,
    walkForwardWorstFoldNotCollapsed: walkForward.minimumFoldBalancedAccuracy >= 0.48,
    walkForwardStability: walkForward.balancedAccuracyRange <= 0.12
  });
  const promotionCandidate = Object.values(promotionChecks).every(Boolean);
  model.certification = {
    stage: 'SHADOW',
    promotionCandidate,
    decisionEligible: false
  };

  const report = Object.freeze({
    method: ML_SHADOW_EVALUATION_METHOD,
    generatedAt: model.trainedAt,
    stage: 'SHADOW',
    decisionInfluence: false,
    calibrated: false,
    trainingObjective: ML_TRAINING_OBJECTIVE,
    trainingBalance,
    horizonBars: safeHorizon,
    roundTripCostBps: Number(roundTripCostBps) || 0,
    split: Object.freeze({
      train: trainExamples.length,
      validation: validationExamples.length,
      test: testExamples.length,
      purgedEmbargoExamples: safeHorizon * 2,
      trainLabelEndTime: trainExamples.at(-1)?.labelTime || null,
      validationFeatureStartTime: validationExamples[0]?.featureTime || null,
      validationLabelEndTime: validationExamples.at(-1)?.labelTime || null,
      testFeatureStartTime: testExamples[0]?.featureTime || null
    }),
    validation: validationMetrics,
    test: testMetrics,
    walkForward,
    promotionChecks,
    promotionCandidate,
    dataProvenance: Object.freeze({ ...model.dataProvenance })
  });
  return Object.freeze({ success: true, model: restoreMLShadowModel(model), report });
}

export function restoreMLShadowModel(rawModel) {
  if (!rawModel || typeof rawModel !== 'object' || Array.isArray(rawModel)) return null;
  if (rawModel.schemaVersion !== ML_SHADOW_MODEL_SCHEMA
    || rawModel.modelType !== ML_SHADOW_MODEL_TYPE
    || rawModel.featureSchema !== ML_FEATURE_SCHEMA
    || rawModel.trainingObjective !== ML_TRAINING_OBJECTIVE
    || !Array.isArray(rawModel.weights)
    || rawModel.weights.length !== FEATURE_COUNT) return null;
  const weights = rawModel.weights.map(finite);
  const bias = finite(rawModel.bias);
  const samplesSeen = finite(rawModel.samplesSeen);
  const positiveSamples = finite(rawModel.positiveSamples);
  const negativeSamples = finite(rawModel.negativeSamples);
  if (weights.includes(null) || weights.some(weight => Math.abs(weight) > 25) || bias === null || Math.abs(bias) > 25
    || !Number.isInteger(samplesSeen) || samplesSeen < 0
    || !Number.isInteger(positiveSamples) || positiveSamples < 0
    || !Number.isInteger(negativeSamples) || negativeSamples < 0
    || positiveSamples + negativeSamples !== samplesSeen) return null;
  const trainedAt = Date.parse(rawModel.trainedAt);
  if (samplesSeen > 0 && !Number.isFinite(trainedAt)) return null;

  const model = createMLShadowModel(rawModel.dataProvenance || {});
  model.weights = weights;
  model.bias = bias;
  model.samplesSeen = samplesSeen;
  model.positiveSamples = positiveSamples;
  model.negativeSamples = negativeSamples;
  model.trainedThroughTime = finite(rawModel.trainedThroughTime);
  model.trainedAt = Number.isFinite(trainedAt) ? new Date(trainedAt).toISOString() : null;
  model.certification = {
    stage: 'SHADOW',
    promotionCandidate: rawModel.certification?.promotionCandidate === true,
    decisionEligible: false
  };
  return Object.freeze({
    ...model,
    weights: Object.freeze([...model.weights]),
    dataProvenance: Object.freeze({ ...model.dataProvenance }),
    certification: Object.freeze({ ...model.certification })
  });
}

export function restoreMLShadowReport(rawReport) {
  if (!rawReport || typeof rawReport !== 'object'
    || rawReport.method !== ML_SHADOW_EVALUATION_METHOD
    || rawReport.trainingObjective !== ML_TRAINING_OBJECTIVE) return null;
  const generatedAt = Date.parse(rawReport.generatedAt);
  if (!Number.isFinite(generatedAt)) return null;
  const sanitizeMetrics = rawMetrics => {
    const count = finite(rawMetrics?.count);
    const accuracy = finite(rawMetrics?.accuracy);
    const balancedAccuracy = finite(rawMetrics?.balancedAccuracy);
    const sensitivity = finite(rawMetrics?.sensitivity);
    const specificity = finite(rawMetrics?.specificity);
    const predictedPositiveRate = finite(rawMetrics?.predictedPositiveRate);
    const brier = finite(rawMetrics?.brier);
    const logLoss = finite(rawMetrics?.logLoss);
    const positiveRate = finite(rawMetrics?.positiveRate);
    const baselineProbability = finite(rawMetrics?.baseline?.probabilityUp);
    const baselineAccuracy = finite(rawMetrics?.baseline?.accuracy);
    const baselineBrier = finite(rawMetrics?.baseline?.brier);
    const baselineLogLoss = finite(rawMetrics?.baseline?.logLoss);
    if (!Number.isInteger(count) || count < 1
      || [accuracy, balancedAccuracy, sensitivity, specificity, predictedPositiveRate, brier, positiveRate, baselineProbability, baselineAccuracy, baselineBrier].some(value => value === null || value < 0 || value > 1)
      || logLoss === null || logLoss < 0 || baselineLogLoss === null || baselineLogLoss < 0) return null;
    return Object.freeze({
      count, accuracy, balancedAccuracy, sensitivity, specificity, predictedPositiveRate, brier, logLoss, positiveRate,
      baseline: Object.freeze({ probabilityUp: baselineProbability, accuracy: baselineAccuracy, brier: baselineBrier, logLoss: baselineLogLoss })
    });
  };
  const validation = sanitizeMetrics(rawReport.validation);
  const test = sanitizeMetrics(rawReport.test);
  const trainCount = finite(rawReport.split?.train);
  const validationCount = finite(rawReport.split?.validation);
  const testCount = finite(rawReport.split?.test);
  if (!validation || !test || !Number.isInteger(trainCount) || trainCount < 1
    || !Number.isInteger(validationCount) || validationCount !== validation.count
    || !Number.isInteger(testCount) || testCount !== test.count) return null;
  const sanitizeTrainingBalance = (rawBalance, expectedCount) => {
    const positiveSamples = finite(rawBalance?.positiveSamples);
    const negativeSamples = finite(rawBalance?.negativeSamples);
    const positiveWeight = finite(rawBalance?.positiveWeight);
    const negativeWeight = finite(rawBalance?.negativeWeight);
    if (!Number.isInteger(positiveSamples) || positiveSamples < 1
      || !Number.isInteger(negativeSamples) || negativeSamples < 1
      || positiveSamples + negativeSamples !== expectedCount
      || positiveWeight === null || positiveWeight <= 0
      || negativeWeight === null || negativeWeight <= 0) return null;
    const expectedPositiveWeight = Number((expectedCount / (2 * positiveSamples)).toFixed(8));
    const expectedNegativeWeight = Number((expectedCount / (2 * negativeSamples)).toFixed(8));
    if (Math.abs(positiveWeight - expectedPositiveWeight) > 1e-8
      || Math.abs(negativeWeight - expectedNegativeWeight) > 1e-8) return null;
    return Object.freeze({ positiveSamples, negativeSamples, positiveWeight, negativeWeight });
  };
  const trainingBalance = sanitizeTrainingBalance(rawReport.trainingBalance, trainCount);
  if (!trainingBalance) return null;
  const horizonBars = Math.max(1, Math.min(20, Number.parseInt(rawReport.horizonBars, 10) || 3));
  const rawWalkForward = rawReport.walkForward;
  const foldCount = finite(rawWalkForward?.foldCount);
  if (rawWalkForward?.method !== 'EXPANDING_WINDOW_PURGED_WALK_FORWARD_V1'
    || !Number.isInteger(foldCount) || foldCount < 3 || foldCount > 5
    || !Array.isArray(rawWalkForward.folds) || rawWalkForward.folds.length !== foldCount) return null;
  const folds = [];
  for (let index = 0; index < rawWalkForward.folds.length; index++) {
    const rawFold = rawWalkForward.folds[index];
    const foldTrain = finite(rawFold?.train);
    const foldTest = finite(rawFold?.test);
    const trainLabelEndTime = finite(rawFold?.trainLabelEndTime);
    const testFeatureStartTime = finite(rawFold?.testFeatureStartTime);
    const metrics = sanitizeMetrics(rawFold?.metrics);
    const foldTrainingBalance = sanitizeTrainingBalance(rawFold?.trainingBalance, foldTrain);
    if (rawFold?.fold !== index + 1
      || !Number.isInteger(foldTrain) || foldTrain < 100
      || !Number.isInteger(foldTest) || foldTest < 20
      || !metrics || metrics.count !== foldTest || !foldTrainingBalance
      || trainLabelEndTime === null || testFeatureStartTime === null
      || trainLabelEndTime >= testFeatureStartTime) return null;
    folds.push(Object.freeze({
      fold: index + 1,
      train: foldTrain,
      test: foldTest,
      trainLabelEndTime,
      testFeatureStartTime,
      purgedEmbargoExamples: horizonBars,
      leakageFree: true,
      trainingBalance: foldTrainingBalance,
      metrics
    }));
  }
  const totalWalkForwardTests = folds.reduce((sum, fold) => sum + fold.test, 0);
  const weightedMetric = selector => Number((folds.reduce(
    (sum, fold) => sum + selector(fold.metrics) * fold.test,
    0
  ) / totalWalkForwardTests).toFixed(6));
  const balancedAccuracies = folds.map(fold => fold.metrics.balancedAccuracy);
  const nonDegenerateFoldCount = folds.filter(fold => fold.metrics.predictedPositiveRate >= 0.1 && fold.metrics.predictedPositiveRate <= 0.9).length;
  const walkForward = Object.freeze({
    method: 'EXPANDING_WINDOW_PURGED_WALK_FORWARD_V1',
    foldCount,
    initialTrainExamples: folds[0].train,
    totalTestExamples: totalWalkForwardTests,
    allLeakageFree: true,
    foldsBeatingBaselineBrier: folds.filter(fold => fold.metrics.brier + 0.005 < fold.metrics.baseline.brier).length,
    foldsBeatingBaselineLogLoss: folds.filter(fold => fold.metrics.logLoss < fold.metrics.baseline.logLoss).length,
    nonDegenerateFoldCount,
    minimumFoldBalancedAccuracy: Number(Math.min(...balancedAccuracies).toFixed(6)),
    maximumFoldBalancedAccuracy: Number(Math.max(...balancedAccuracies).toFixed(6)),
    balancedAccuracyRange: Number((Math.max(...balancedAccuracies) - Math.min(...balancedAccuracies)).toFixed(6)),
    aggregate: Object.freeze({
      accuracy: weightedMetric(metrics => metrics.accuracy),
      balancedAccuracy: weightedMetric(metrics => metrics.balancedAccuracy),
      sensitivity: weightedMetric(metrics => metrics.sensitivity),
      specificity: weightedMetric(metrics => metrics.specificity),
      predictedPositiveRate: weightedMetric(metrics => metrics.predictedPositiveRate),
      brier: weightedMetric(metrics => metrics.brier),
      logLoss: weightedMetric(metrics => metrics.logLoss),
      baselineBrier: weightedMetric(metrics => metrics.baseline.brier),
      baselineLogLoss: weightedMetric(metrics => metrics.baseline.logLoss)
    }),
    folds: Object.freeze(folds)
  });
  const requiredMajority = Math.ceil(walkForward.foldCount * 0.75);
  const promotionChecks = Object.freeze({
    sufficientTrainSamples: trainCount >= 200,
    sufficientValidationSamples: validationCount >= 50,
    sufficientTestSamples: testCount >= 50,
    balancedTestClasses: test.positiveRate >= 0.2 && test.positiveRate <= 0.8,
    beatsBaselineBrier: test.brier + 0.005 < test.baseline.brier,
    beatsBaselineLogLoss: test.logLoss < test.baseline.logLoss,
    minimumBalancedAccuracy: test.balancedAccuracy >= 0.52,
    nonDegenerateHoldoutPredictions: test.predictedPositiveRate >= 0.1 && test.predictedPositiveRate <= 0.9,
    stableAcrossHoldouts: Math.abs(validation.brier - test.brier) <= 0.08,
    sufficientWalkForwardFolds: walkForward.foldCount >= 4,
    walkForwardLeakageFree: walkForward.allLeakageFree,
    walkForwardBalancedAccuracy: walkForward.aggregate.balancedAccuracy >= 0.52,
    walkForwardBeatsBaselineBrier: walkForward.foldsBeatingBaselineBrier >= requiredMajority,
    walkForwardBeatsBaselineLogLoss: walkForward.foldsBeatingBaselineLogLoss >= requiredMajority,
    walkForwardNonDegeneratePredictions: walkForward.nonDegenerateFoldCount === walkForward.foldCount,
    walkForwardWorstFoldNotCollapsed: walkForward.minimumFoldBalancedAccuracy >= 0.48,
    walkForwardStability: walkForward.balancedAccuracyRange <= 0.12
  });
  const promotionCandidate = Object.values(promotionChecks).every(Boolean);
  const source = typeof rawReport.dataProvenance?.source === 'string'
    ? rawReport.dataProvenance.source.slice(0, 120)
    : 'UNSPECIFIED';
  return Object.freeze({
    method: ML_SHADOW_EVALUATION_METHOD,
    generatedAt: new Date(generatedAt).toISOString(),
    stage: 'SHADOW',
    decisionInfluence: false,
    calibrated: false,
    trainingObjective: ML_TRAINING_OBJECTIVE,
    trainingBalance,
    horizonBars,
    roundTripCostBps: Math.max(0, finite(rawReport.roundTripCostBps) || 0),
    split: Object.freeze({
      train: trainCount,
      validation: validationCount,
      test: testCount,
      purgedEmbargoExamples: Math.max(0, finite(rawReport.split?.purgedEmbargoExamples) || 0),
      trainLabelEndTime: finite(rawReport.split?.trainLabelEndTime),
      validationFeatureStartTime: finite(rawReport.split?.validationFeatureStartTime),
      validationLabelEndTime: finite(rawReport.split?.validationLabelEndTime),
      testFeatureStartTime: finite(rawReport.split?.testFeatureStartTime)
    }),
    validation,
    test,
    walkForward,
    promotionChecks,
    promotionCandidate,
    dataProvenance: Object.freeze({
      source,
      assetId: typeof rawReport.dataProvenance?.assetId === 'string' ? rawReport.dataProvenance.assetId.slice(0, 80) : null,
      timeframe: typeof rawReport.dataProvenance?.timeframe === 'string' ? rawReport.dataProvenance.timeframe.slice(0, 20) : null,
      firstCandleTime: finite(rawReport.dataProvenance?.firstCandleTime),
      lastCandleTime: finite(rawReport.dataProvenance?.lastCandleTime),
      candleCount: Math.max(0, finite(rawReport.dataProvenance?.candleCount) || 0)
    })
  });
}

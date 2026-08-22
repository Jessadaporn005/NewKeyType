export const STRATEGY_MEMORY_POLICY = 'VALIDATED_OUT_OF_SAMPLE_MEMORY_ONLY_V1';
export const VALIDATED_MEMORY_PROVENANCE = 'WALK_FORWARD_OUT_OF_SAMPLE_VALIDATED';
export const VALIDATED_MEMORY_EVIDENCE_POLICY = 'PURGED_CHRONOLOGICAL_PATTERN_MEMORY_V1';

function reject(reason, observations = 0) {
  return Object.freeze({
    accepted: false,
    reason,
    observations,
    policy: STRATEGY_MEMORY_POLICY,
    scoreAdjustment: 0
  });
}

export function resolveDecisionStrategyMemory(rawMemory, {
  decisionTime = Date.now(),
  minimumObservations = 30
} = {}) {
  if (!rawMemory || typeof rawMemory !== 'object') return reject('NO_STRATEGY_MEMORY');

  const wins = Number(rawMemory.wins);
  const losses = Number(rawMemory.losses);
  if (!Number.isInteger(wins) || wins < 0 || !Number.isInteger(losses) || losses < 0) {
    return reject('INVALID_OBSERVATION_COUNTS');
  }

  const observations = wins + losses;
  if (rawMemory.provenance !== VALIDATED_MEMORY_PROVENANCE) {
    return reject('UNVERIFIED_OR_SYNTHETIC_PROVENANCE', observations);
  }
  if (rawMemory.outOfSampleValidated !== true) {
    return reject('OUT_OF_SAMPLE_VALIDATION_REQUIRED', observations);
  }
  const evidence = rawMemory.validationEvidence;
  if (!evidence || evidence.policy !== VALIDATED_MEMORY_EVIDENCE_POLICY || evidence.passed !== true
    || evidence.lookaheadVerified !== true || evidence.overlapPurged !== true
    || !Number.isInteger(Number(evidence.independentSamples)) || Number(evidence.independentSamples) !== observations
    || !Number.isInteger(Number(evidence.foldCount)) || Number(evidence.foldCount) < 4
    || !Number.isInteger(Number(evidence.positiveFolds)) || Number(evidence.positiveFolds) < Math.ceil(Number(evidence.foldCount) * 0.75)
    || typeof evidence.datasetId !== 'string' || !evidence.datasetId
    || typeof evidence.candleFingerprint !== 'string' || !evidence.candleFingerprint) {
    return reject('VALIDATION_EVIDENCE_REQUIRED', observations);
  }
  if (observations < Math.max(1, Number(minimumObservations) || 30)) {
    return reject('INSUFFICIENT_OBSERVATIONS', observations);
  }

  const trainedAt = Date.parse(rawMemory.trainedAt);
  const decisionTimestamp = Number(decisionTime);
  if (!Number.isFinite(trainedAt) || !Number.isFinite(decisionTimestamp)) {
    return reject('INVALID_TRAINING_TIMESTAMP', observations);
  }
  if (trainedAt > decisionTimestamp) {
    return reject('FUTURE_TRAINING_DATA_REJECTED', observations);
  }

  const winRate = (wins / observations) * 100;
  const scoreAdjustment = Math.max(-10, Math.min(10, (winRate - 50) * 0.2));
  return Object.freeze({
    accepted: true,
    reason: 'VALIDATED_MEMORY_ACCEPTED',
    observations,
    wins,
    losses,
    winRate: Number(winRate.toFixed(1)),
    scoreAdjustment: Number(scoreAdjustment.toFixed(2)),
    trainedAt: new Date(trainedAt).toISOString(),
    policy: STRATEGY_MEMORY_POLICY
  });
}

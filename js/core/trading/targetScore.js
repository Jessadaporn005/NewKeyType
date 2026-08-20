export const TARGET_SCORE_METHOD = 'DETERMINISTIC_RULE_SCORE_UNCALIBRATED';

function finiteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Produces a deterministic rule-alignment score for a proposed TP/SL setup.
 * This is deliberately not described as a probability: it has not been
 * calibrated against historical out-of-sample outcomes.
 */
export function calculateTargetScore(entry = 0, target = 0, stop = 0, regime = null, rsi = 50) {
  const safeEntry = finiteNumber(entry);
  const safeTarget = finiteNumber(target);
  const safeStop = finiteNumber(stop);
  const safeRsi = finiteNumber(rsi);
  const targetDistance = safeEntry === null || safeTarget === null ? 0 : Math.abs(safeTarget - safeEntry);
  const stopDistance = safeEntry === null || safeStop === null ? 0 : Math.abs(safeEntry - safeStop);
  const valid = targetDistance > 0 && stopDistance > 0 && safeRsi !== null;

  if (!valid) {
    return {
      method: TARGET_SCORE_METHOD,
      calibrated: false,
      valid: false,
      scorePercent: 50,
      cautionScorePercent: 50,
      rating: 'INSUFFICIENT INPUT',
      riskRewardRatio: null
    };
  }

  const riskRewardRatio = targetDistance / stopDistance;
  let score = 68;

  if (riskRewardRatio <= 1.5) score += 12;
  else if (riskRewardRatio >= 3) score -= 14;

  if (safeRsi > 40 && safeRsi < 60) score += 4.5;
  if (regime?.type === 'TRENDING_MOMENTUM') score += 8;
  else if (regime?.type === 'MACRO_VOLATILITY_SHOCK') score -= 12;

  const scorePercent = Math.min(94.5, Math.max(35, Number(score.toFixed(1))));
  return {
    method: TARGET_SCORE_METHOD,
    calibrated: false,
    valid: true,
    scorePercent,
    cautionScorePercent: Number((100 - scorePercent).toFixed(1)),
    rating: scorePercent >= 75
      ? 'STRONG RULE ALIGNMENT'
      : scorePercent >= 60
        ? 'MIXED RULE ALIGNMENT'
        : 'WEAK RULE ALIGNMENT',
    riskRewardRatio: Number(riskRewardRatio.toFixed(4))
  };
}

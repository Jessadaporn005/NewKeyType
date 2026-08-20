export const VERIFIED_NEWS_PROVENANCE = 'VERIFIED_TIMESTAMPED_NEWS';

function timestampMs(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value < 1e12 ? value * 1000 : value;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function resolveDecisionNews(news, options = {}) {
  if (!news || typeof news !== 'object' || Array.isArray(news)) {
    return { accepted: false, reason: 'NO_NEWS_INPUT', news: null };
  }
  if (news.provenance !== VERIFIED_NEWS_PROVENANCE) {
    return { accepted: false, reason: 'UNVERIFIED_OR_SIMULATED_NEWS', news: null };
  }

  const decisionTime = timestampMs(options.decisionTime ?? Date.now());
  const publishedAt = timestampMs(news.publishedAt);
  const maxAgeMs = Math.max(60000, Number(options.maxAgeMs) || 30 * 60 * 1000);
  const sentimentScore = Number(news.sentimentScore);
  if (!decisionTime || !publishedAt) return { accepted: false, reason: 'MISSING_VALID_TIMESTAMP', news: null };
  if (publishedAt > decisionTime) return { accepted: false, reason: 'FUTURE_NEWS_REJECTED', news: null };
  if (decisionTime - publishedAt > maxAgeMs) return { accepted: false, reason: 'STALE_NEWS_REJECTED', news: null };
  if (!Number.isFinite(sentimentScore) || sentimentScore < -25 || sentimentScore > 25) {
    return { accepted: false, reason: 'INVALID_SENTIMENT_SCORE', news: null };
  }
  if (typeof news.headline !== 'string' || !news.headline.trim() || typeof news.source !== 'string' || !news.source.trim()) {
    return { accepted: false, reason: 'MISSING_SOURCE_OR_HEADLINE', news: null };
  }

  return {
    accepted: true,
    reason: 'VERIFIED_FRESH_TIMESTAMPED_NEWS',
    news: Object.freeze({
      id: news.id ? String(news.id) : null,
      symbol: news.symbol ? String(news.symbol) : 'ALL',
      source: news.source.trim(),
      headline: news.headline.trim(),
      sentiment: sentimentScore > 5 ? 'BULLISH' : sentimentScore < -5 ? 'BEARISH' : 'NEUTRAL',
      sentimentScore,
      publishedAt,
      provenance: VERIFIED_NEWS_PROVENANCE
    })
  };
}

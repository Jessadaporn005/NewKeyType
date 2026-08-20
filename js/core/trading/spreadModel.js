import { TRADING_ASSETS } from './marketCatalog.js';
import { resolveDecisionNews } from './newsInputPolicy.js';

export function calculateDynamicSpread(asset = TRADING_ASSETS[0], currentPrice = 100, candle = null, activeNews = null, random = Math.random, decisionTime = Date.now()) {
  const safePrice = Number.isFinite(Number(currentPrice)) && Number(currentPrice) > 0 ? Number(currentPrice) : 100;
  const baseSpread = Number(asset?.baseSpread) || (safePrice * 0.00015);
  const randomValue = Math.max(0, Math.min(1, Number(random()) || 0));
  let multiplier = 1.0 + (randomValue * 0.18 - 0.09);

  if (candle && Number(candle.high) > Number(candle.low)) {
    const range = Number(candle.high) - Number(candle.low);
    const normRange = safePrice * 0.002;
    if (range > normRange * 1.5) multiplier += Math.min(1.4, (range / normRange) * 0.35);
  }

  const newsPolicy = resolveDecisionNews(activeNews, { decisionTime });
  if (newsPolicy.accepted && Math.abs(newsPolicy.news.sentimentScore) >= 15) {
    multiplier += 0.75;
  }

  const digits = Number.isInteger(asset?.digits) ? asset.digits : 2;
  const isWidened = multiplier >= 1.45;
  const spreadValue = Number((baseSpread * multiplier).toFixed(digits));
  const bidPrice = Number((safePrice - spreadValue / 2).toFixed(digits));
  const askPrice = Number((safePrice + spreadValue / 2).toFixed(digits));

  let spreadFormatted = '';
  if (asset?.spreadUnit === 'pips') {
    spreadFormatted = (spreadValue / 0.0001).toFixed(1) + ' Pips';
  } else if (asset?.spreadUnit === 'pts') {
    spreadFormatted = Math.round(spreadValue / 0.01) + ' pts ($' + spreadValue.toFixed(2) + ')';
  } else {
    spreadFormatted = '$' + spreadValue.toFixed(digits);
  }

  return {
    source: 'SIMULATED_SPREAD_MODEL',
    spreadValue,
    spreadFormatted,
    bidPrice,
    askPrice,
    isWidened,
    newsInfluenceApplied: newsPolicy.accepted,
    newsPolicyReason: newsPolicy.reason,
    multiplier: Number(multiplier.toFixed(2)),
    status: isWidened ? 'WIDENED (SIMULATED VOLATILITY ⚠️)' : 'STANDARD SIMULATED SPREAD (🟡)'
  };
}

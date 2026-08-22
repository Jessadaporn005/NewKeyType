/**
 * AUDITABLE RULE-BASED TRADING TERMINAL & PATTERN EVIDENCE ENGINE
 * Inspired by TradingView and Binance Pro. Features real-time OHLCV market feeds,
 * technical indicators (EMA Ribbon, Bollinger Bands, RSI, MACD),
 * closed-bar confirmed chart-pattern evidence (Double Bottom/Top, Engulfing, Pin Bars, FVG and Liquidity Sweeps),
 * deterministic Trade Signals (BUY/SELL with TP/SL & uncalibrated Rule Score),
 * interactive HTML5 Canvas Candlestick Chart with crosshair, and Paper Trading simulator.
 */

import { profileStore } from './profileStore.js';
import { resolveRuntimeCapabilities } from './runtimeConfig.js';
import { MARKET_TYPES, TRADING_ASSETS, TIMEFRAMES } from './core/trading/marketCatalog.js';
import { calculateDynamicSpread as calculateSpreadFromCore } from './core/trading/spreadModel.js';
import { calculateEMA, calculateBollingerBands, calculateRSI, calculateMACD } from './core/trading/indicators.js';
import { calculateTargetScore } from './core/trading/targetScore.js';
import {
  PAPER_ACCOUNT_MODEL,
  calculatePaperPositionSize,
  createPaperPosition,
  deriveProtectiveOrders,
  evaluatePaperExit,
  evaluatePaperOpenRisk,
  markPaperPosition,
  normalizeRiskPercent,
  restorePaperPositions,
  restorePaperTradeHistory,
  settlePaperPosition,
  summarizePaperAccount
} from './core/trading/paperAccount.js';
import { createZeroPaperGymStats, migrateLegacyDemoSeed, selectLatestPaperState } from './core/trading/gymState.js';
import { evaluateRuleCountercheck as evaluateRuleCountercheckCore } from './core/trading/ruleCountercheck.js';
import { runBarCloseBacktest } from './core/trading/backtestEngine.js';
import { resolveDecisionNews } from './core/trading/newsInputPolicy.js';
import { resolveDecisionStrategyMemory } from './core/trading/strategyMemoryPolicy.js';
import { createPaperExecutionAuditEvent, restorePaperExecutionAudit } from './core/trading/paperExecutionAudit.js';
import { reconcileMT5DemoAccount, validateMT5DemoPacket } from './core/trading/mt5DemoGateway.js';
import { assessMT5DemoReadiness } from './core/trading/mt5DemoReadiness.js';
import { predictMLDirection, restoreMLShadowModel, restoreMLShadowReport, trainAndEvaluateMLShadow } from './core/trading/mlShadowModel.js';
import { PATTERN_EVIDENCE_SCHEMA, detectConfirmedChartPatterns } from './core/trading/patternEvidence.js';
import { detectEvidenceBasedMarketRegime } from './core/trading/marketRegime.js';
import { buildPatternOutcomeResearchDataset, restorePatternOutcomeResearchDataset } from './core/trading/patternOutcomeResearch.js';
import { promotePatternStrategyMemory } from './core/trading/patternMemoryPromotion.js';
import { createAIReaderInput, restoreAIReaderReport, validateAIReaderOutput } from './core/trading/aiReaderContract.js';
import {
  armVerifiedPaperBotKillSwitch,
  createVerifiedPaperBotState,
  evaluateVerifiedPaperBotDecision,
  recordVerifiedPaperBotDecision,
  resetVerifiedPaperBotKillSwitch,
  restoreVerifiedPaperBotState,
  setVerifiedPaperBotEnabled
} from './core/trading/verifiedPaperBot.js';
import {
  MARKET_PACKET_SOURCES,
  createMarketPacket,
  evaluateMarketPacketDecisionEligibility,
  summarizeMarketPacket
} from './core/trading/marketPacket.js';
import {
  MARKET_DATA_ATTEMPT_OUTCOME,
  beginMarketDataAttempt,
  calculateMarketDataRefreshDelay,
  createMarketDataEvidence,
  createMarketDataHealth,
  settleMarketDataAttempt
} from './core/trading/marketDataHealth.js';
import {
  fetchHistoricalExchangeCandles as fetchBinanceHistory,
  fetchRealExchangeCandles as fetchBinanceCandles,
  getMarketDataDisclosure,
  hasVerifiedMarketDataAdapter
} from './services/trading/binanceMarketData.js';

export { MARKET_TYPES, TRADING_ASSETS, TIMEFRAMES };
export { calculateEMA, calculateBollingerBands, calculateRSI, calculateMACD };
export { calculateTargetScore };
export { calculatePaperPositionSize, normalizeRiskPercent, summarizePaperAccount };
export { evaluateRuleCountercheckCore as evaluateRuleCountercheck };
export { runBarCloseBacktest };

export function calculateDynamicSpread(asset = TRADING_ASSETS[0], currentPrice = 100, candle = null, activeNews = null) {
  return calculateSpreadFromCore(asset, currentPrice, candle, activeNews);
}

export const LIVE_MARKET_NEWS_FEED = [
  {
    id: 'news_01',
    symbol: 'BTC/USDT',
    source: 'Bloomberg Terminal',
    time: '2m ago',
    headline: 'US Federal Reserve Signals Liquidity Easing; Global Crypto Inflows Surge +$1.8B',
    sentiment: 'BULLISH',
    sentimentScore: 20,
    impact: 'ธนาคารกลางสหรัฐฯ ส่งสัญญาณผ่อนคลายนโยบายการเงิน หนุนเม็ดเงินไหลเข้าสินทรัพย์เสี่ยงอย่างมีนัยสำคัญ'
  },
  {
    id: 'news_gold_01',
    symbol: 'XAU/USD',
    source: 'XM Global Gold Desk',
    time: '3m ago',
    headline: 'Central Bank Gold Reserves Surge to Multi-Decade Highs Amid Global Macro Hedging',
    sentiment: 'BULLISH',
    sentimentScore: 24,
    impact: 'ธนาคารกลางทั่วโลกเดินหน้าเข้าซื้อทองคำแท่งสำรอง ดันราคา XAU/USD ทะลุแนวต้านสำคัญ'
  },
  {
    id: 'news_02',
    symbol: 'BTC/USDT',
    source: 'CoinDesk Macro',
    time: '5m ago',
    headline: 'Institutional Spot ETF Inflows Break Weekly All-Time High Record',
    sentiment: 'BULLISH',
    sentimentScore: 18,
    impact: 'สถาบันการเงินขนาดใหญ่เพิ่มสัดส่วนการถือครอง Bitcoin Spot ETF ดันปริมาณความต้องการซื้อต่อเนื่อง'
  },
  {
    id: 'news_eur_01',
    symbol: 'EUR/USD',
    source: 'ECB Monetary Bulletin',
    time: '6m ago',
    headline: 'Eurozone Inflation Cools to 2.1%; Resilient Manufacturing Orders Boost Euro Demand',
    sentiment: 'BULLISH',
    sentimentScore: 16,
    impact: 'เงินเฟ้อยุโรปชะลอตัว ดอกเบี้ยมีเสถียรภาพ หนุนค่าเงินยูโรแข็งค่าเทียบดอลลาร์'
  },
  {
    id: 'news_03',
    symbol: 'ETH/USDT',
    source: 'Ethereum Foundation',
    time: '8m ago',
    headline: 'Layer 2 Blob Scaling Upgrade Successfully Deployed on Mainnet',
    sentiment: 'BULLISH',
    sentimentScore: 15,
    impact: 'ค่าธรรมเนียมเครือข่ายลดลง 90% ดึงดูดผู้ใช้งานและนักพัฒนากลับสู่ระบบนิเวศ Ethereum'
  },
  {
    id: 'news_04',
    symbol: 'SOL/USDT',
    source: 'Solana Floor',
    time: '11m ago',
    headline: 'Solana DEX Volume Flips Ethereum for 3rd Consecutive Month',
    sentiment: 'BULLISH',
    sentimentScore: 16,
    impact: 'ปริมาณการซื้อขายบน Solana เติบโตแข็งแกร่ง หนุนความต้องการถือเหรียญ SOL ค่า Gas'
  },
  {
    id: 'news_05',
    symbol: 'NVDA/USD',
    source: 'Reuters Tech',
    time: '14m ago',
    headline: 'Next-Gen Blackwell AI GPUs Enter Full Mass Production with 100% Allocation',
    sentiment: 'BULLISH',
    sentimentScore: 22,
    impact: 'คำสั่งซื้อชิป AI ล้นหลาม รายได้และผลกำไรของ NVIDIA ยังมีแนวโน้มเติบโตแบบก้าวกระโดด'
  },
  {
    id: 'news_06',
    symbol: 'ALL',
    source: 'SEC Regulatory Brief',
    time: '18m ago',
    headline: 'Regulatory Task Force Imposes Increased Compliance on Unregistered Yield Derivatives',
    sentiment: 'BEARISH',
    sentimentScore: -16,
    impact: 'ความไม่แน่นอนด้านกฎหมายสร้างความกังวลระยะสั้นต่อกลุ่มโทเคนผลตอบแทนสูง'
  }
];

export function analyzeNewsSentiment(headline = '', summary = '') {
  const text = (headline + ' ' + summary).toLowerCase();
  const bullishKeywords = ['etf', 'inflow', 'surge', 'record', 'ath', 'rate cut', 'adoption', 'partnership', 'breakout', 'bullish', 'approval', 'gain', 'expansion', 'mass production', 'gold reserves', 'resilient'];
  const bearishKeywords = ['ban', 'hack', 'sec', 'lawsuit', 'crackdown', 'inflation', 'dump', 'bearish', 'selloff', 'probe', 'outage', 'risk', 'warning', 'drop'];

  let score = 0;
  bullishKeywords.forEach(w => { if (text.includes(w)) score += 5; });
  bearishKeywords.forEach(w => { if (text.includes(w)) score -= 5; });

  score = Math.max(-25, Math.min(25, score));
  const sentiment = score > 5 ? 'BULLISH' : score < -5 ? 'BEARISH' : 'NEUTRAL';
  return { sentiment, score };
}

// Live Global Internet Market Ingestion & Pattern Learning Radar
export const LIVE_INTERNET_KNOWLEDGE_FEED = [
  {
    id: 'intel_01',
    category: 'WHALE_ORDERFLOW',
    badge: '🐳 WHALE ACCUMULATION',
    source: 'Binance Deep Book API',
    text: 'ตรวจพบคำสั่งซื้อสะสมก้อนใหญ่ (Iceberg Order) มูลค่า $42.8M บริเวณแนวรับ $94,800 - $95,200 บน BTC/USDT',
    impactFactor: '+14% Bullish Confluence',
    timestamp: 'Just now'
  },
  {
    id: 'intel_02',
    category: 'MACRO_FOREX',
    badge: '💶 FOREX MACRO',
    source: 'ECB & Bloomberg Terminal',
    text: 'ดัชนีดอลลาร์สหรัฐฯ (DXY) ปฏิเสธแนวต้าน 106.50 ส่งผลให้สภาพคล่องไหลเข้าสู่คู่เงิน EUR/USD และ GBP/USD',
    impactFactor: '+11% Forex Momentum',
    timestamp: '1m ago'
  },
  {
    id: 'intel_03',
    category: 'GOLD_BULLION',
    badge: '🥇 GOLD ARBITRAGE',
    source: 'London Bullion Market (LBMA)',
    text: 'ส่วนต่างราคาซื้อขายทองคำแท่งกายภาพ (Physical Gold Premium) ในลอนดอนและซูริกพุ่งแตะระดับสูงสุดในรอบ 6 เดือน',
    impactFactor: '+18% Gold Support',
    timestamp: '2m ago'
  },
  {
    id: 'intel_04',
    category: 'SMC_STRUCTURE',
    badge: '⚡ SMC LIQUIDITY SWEEP',
    source: 'Institutional Flow Radar',
    text: 'อัลกอริทึมตรวจจับการกวาด Stop Loss ใต้ Low ของวันก่อนหน้า (Asia Session Low) แล้วเกิดแท่งเทียนดีดกลับรวดเร็ว',
    impactFactor: '+15% Liquidity Rejection',
    timestamp: '4m ago'
  },
  {
    id: 'intel_05',
    category: 'COMMODITY_ENERGY',
    badge: '🛢️ CRUDE SUPPLY',
    source: 'OPEC+ Monitoring Committee',
    text: 'รายงานโควตากำลังการผลิตน้ำมันดิบมีความสอดคล้อง 98.4% หนุนราคา USOIL ให้ตั้งฐานแข็งแกร่งบริเวณแนวรับ',
    impactFactor: '+9% Commodity Stability',
    timestamp: '6m ago'
  },
  {
    id: 'intel_06',
    category: 'NEURAL_REPLAY',
    badge: '🧠 REPLAY DISTILLATION',
    source: 'Autonomous Post-Mortem Gym',
    text: 'ทบทวนสถิติ False Breakout ย้อนหลัง 18 ไม้ ➡️ ระบบปรับเพิ่มเงื่อนไขการยืนยัน Volume จากเดิม 1.2x เป็น 1.5x ค่าเฉลี่ย',
    impactFactor: 'Weight Adjusted',
    timestamp: '8m ago'
  },
  {
    id: 'intel_07',
    category: 'VOLATILITY_MATRIX',
    badge: '📊 VOLATILITY COMPRESSION',
    source: 'CBOE & Deribit Options Matrix',
    text: 'ค่า Implied Volatility (IV) บีบตัวแคบลงสู่จุดต่ำสุดรอบสัปดาห์ ส่งสัญญาณเตรียมเกิดการขยายตัวของเทรนด์ใหญ่',
    impactFactor: '+12% Expansion Catalyst',
    timestamp: '10m ago'
  }
];

export async function fetchRealExchangeCandles(symbol = 'BTC/USDT', interval = '5m', limit = 80) {
  return fetchBinanceCandles(symbol, interval, limit);
}

/**
 * AI Pattern Recognition Engine
 */
export function detectChartPatterns(candles = []) {
  return detectConfirmedChartPatterns(candles);
}

// Neutral starting weights. Observations are added only by explicit Paper scenarios.
export const DEFAULT_STRATEGY_WEIGHTS = {
  'Bullish Engulfing': { wins: 0, losses: 0, winRate: 0, weightMultiplier: 1, lastLesson: '' },
  'Bearish Engulfing': { wins: 0, losses: 0, winRate: 0, weightMultiplier: 1, lastLesson: '' },
  'Double Bottom': { wins: 0, losses: 0, winRate: 0, weightMultiplier: 1, lastLesson: '' },
  'Double Top': { wins: 0, losses: 0, winRate: 0, weightMultiplier: 1, lastLesson: '' },
  'Hammer / Bullish Pinbar': { wins: 0, losses: 0, winRate: 0, weightMultiplier: 1, lastLesson: '' },
  'Shooting Star / Bearish Pinbar': { wins: 0, losses: 0, winRate: 0, weightMultiplier: 1, lastLesson: '' },
  'Fair Value Gap (FVG)': { wins: 0, losses: 0, winRate: 0, weightMultiplier: 1, lastLesson: '' },
  'Liquidity Sweep': { wins: 0, losses: 0, winRate: 0, weightMultiplier: 1, lastLesson: '' },
  'Ascending Triangle': { wins: 0, losses: 0, winRate: 0, weightMultiplier: 1, lastLesson: '' }
};

// =========================================================================
// DEEP AI COGNITION & ADAPTIVE REGIME ENGINES
// =========================================================================

export function detectMarketRegime(candles = [], activeNews = null, spreadInfo = null) {
  void activeNews;
  return detectEvidenceBasedMarketRegime(candles, { spreadInfo });
}

export function calculateMonteCarloProbability(entry = 0, tp = 0, sl = 0, regime = null, curRSI = 50) {
  const targetScore = calculateTargetScore(entry, tp, sl, regime, curRSI);
  return {
    tpProbabilityPercent: targetScore.scorePercent,
    slRiskPercent: targetScore.cautionScorePercent,
    confidenceRating: targetScore.rating,
    method: targetScore.method,
    calibrated: false,
    deprecated: true
  };
}

export function evaluateAdversarialDebate(patterns = [], marketRegime = null, whaleData = null, curRSI = 50, currentPrice = 0) {
  const result = evaluateRuleCountercheckCore(patterns, marketRegime, whaleData, curRSI, currentPrice);
  return {
    method: result.method,
    independentAgents: false,
    bullAdvocate: { name: 'BULLISH FACTOR RULES', stance: 'BULLISH_FACTORS', arguments: result.bullishFactors },
    bearSkeptic: { name: 'RISK FACTOR RULES', stance: 'RISK_FACTORS', arguments: result.riskFactors },
    whaleSpecialist: { name: 'ORDER-BOOK INPUT CHECK', ...result.orderBook },
    debateOutcome: result.outcome,
    debateColor: result.outcomeColor,
    deprecated: true
  };
}

export function extractGoldenRulesFromJournal(journal = []) {
  const baseRules = [
    { id: 1, text: 'ห้ามเปิดออเดอร์ในแท่งที่อยู่ห่างเส้น EMA20 มากเกินไป เพื่อป้องกันการย่อตัว Mean-Reversion', tag: 'MOMENTUM' },
    { id: 2, text: 'เมื่อค่า Broker Spread ถ่างเกิน 30 pts ให้งดการเข้าไม้ทุกกรณีเพื่อรักษาความได้เปรียบ', tag: 'SPREAD_SHIELD' },
    { id: 3, text: 'ให้ความสำคัญกับ Liquidity Sweep ใต้แนวรับสำคัญมากกว่าการไล่ซื้อที่ยอด Breakout', tag: 'SMC_ORDERFLOW' },
    { id: 4, text: 'หากโดน Stop Loss 2 ครั้งติดในสภาวะตลาดเดิม ให้ปรับลดน้ำหนัก Penalty ลงทันที', tag: 'META_LEARNING' },
    { id: 5, text: 'รักษาอัตราส่วน Risk:Reward ขั้นต่ำ 1:2.0 เสมอเพื่อให้ระบบสร้างกำไรได้แม้ Win Rate อยู่ที่ 45-50%', tag: 'RISK_MATH' }
  ];

  if (!journal || journal.length === 0) return baseRules;

  // Extract from recent losses
  const losses = journal.filter(j => !j.isWin);
  if (losses.length > 0) {
    const recentLoss = losses[0];
    if (recentLoss.learningLesson) {
      baseRules.unshift({
        id: 0,
        text: `[กฎสดจากบทเรียนล่าสุด]: ${recentLoss.learningLesson.replace('❌ บันทึกข้อผิดพลาด (Penalty Applied):', '').trim()}`,
        tag: 'LIVE_DISTILLATION'
      });
    }
  }

  return baseRules.slice(0, 6);
}

export function generateAISignal(candles = [], asset = null, patterns = [], activeNews = null, strategyWeights = null, spreadInfo = null, mt5Data = null, riskAppetite = 'balanced', decisionTime = Date.now()) {
  if (!candles || candles.length < 20) {
    return {
      action: 'CALCULATING...',
      badgeClass: 'signal-calc',
      ruleScore: 50,
      entry: asset ? asset.basePrice : 0,
      tp1: asset ? asset.basePrice * 1.01 : 0,
      tp2: asset ? asset.basePrice * 1.02 : 0,
      sl: asset ? asset.basePrice * 0.99 : 0,
      rrRatio: '1:2',
      rationale: 'กำลังรวบรวมข้อมูลแท่งเทียนสดเพื่อประมวลผลโมเมนตัม...',
      factors: []
    };
  }

  void patterns;
  const decisionPatterns = detectConfirmedChartPatterns(candles).filter(pattern => pattern.schema === PATTERN_EVIDENCE_SCHEMA
    && pattern.confirmed === true
    && pattern.decisionEligible === true
    && Number.isFinite(Number(pattern.weight)));

  const currentPrice = candles[candles.length - 1].close;
  const ema20 = calculateEMA(candles, 20);
  const ema50 = calculateEMA(candles, 50);
  const ema200 = calculateEMA(candles, 200);
  const rsi = calculateRSI(candles, 14);
  const macd = calculateMACD(candles, 12, 26, 9);
  const bb = calculateBollingerBands(candles, 20, 2);

  const curEMA20 = ema20[ema20.length - 1] || currentPrice;
  const curEMA50 = ema50[ema50.length - 1] || currentPrice;
  const curEMA200 = ema200[ema200.length - 1] || currentPrice;
  const curRSI = rsi[rsi.length - 1] || 50;
  const curMACDHist = macd.histogram[macd.histogram.length - 1] || 0;
  const curBBLower = bb.lower[bb.lower.length - 1] || currentPrice * 0.98;
  const curBBUpper = bb.upper[bb.upper.length - 1] || currentPrice * 1.02;

  // Composite Score Calculation (-100 to +100)
  let score = 0;

  // 1. Trend Alignment (EMA Ribbon)
  if (currentPrice > curEMA20 && curEMA20 > curEMA50) score += 25;
  else if (currentPrice < curEMA20 && curEMA20 < curEMA50) score -= 25;

  if (curEMA50 > curEMA200) score += 15; // Golden Cross Macro
  else score -= 15; // Death Cross Macro

  // 2. Momentum (RSI)
  if (curRSI <= 32) score += 30; // Deeply Oversold (Rebound likely)
  else if (curRSI >= 68) score -= 30; // Overbought
  else if (curRSI > 50) score += 10;
  else score -= 10;

  // 3. Volatility & Mean Reversion (Bollinger Bands)
  if (currentPrice <= curBBLower * 1.002) score += 20; // At Lower Band support
  if (currentPrice >= curBBUpper * 0.998) score -= 20; // At Upper Band resistance

  // 4. MACD Momentum
  if (curMACDHist > 0) score += 15;
  else score -= 15;

  // 5. Pattern Multipliers
  decisionPatterns.forEach(p => {
    score += p.weight;
  });

  // 6. Only verified, fresh, timestamped news may affect a decision.
  const decisionNewsPolicy = resolveDecisionNews(activeNews, { decisionTime });
  const decisionNews = decisionNewsPolicy.news;
  let newsImpactText = '';
  if (decisionNews) {
    score += decisionNews.sentimentScore;
    newsImpactText = `\n\n📰 [VERIFIED NEWS INPUT]: ข่าว "${decisionNews.headline}" (${decisionNews.sentiment}) ถูกนำมาถ่วงน้ำหนักตามเวลาที่ตรวจสอบแล้ว`;
  } else if (activeNews) {
    newsImpactText = `\n\n🧪 [DISPLAY-ONLY NEWS SCENARIO]: ข่าวจำลอง/ข่าวที่ไม่ผ่านการยืนยันมีน้ำหนักต่อสัญญาณเป็นศูนย์`;
  }

  // 7. Only validated out-of-sample strategy memory may affect a decision.
  let appliedMemoryInsight = null;
  let decisionMemoryPolicy = Object.freeze({
    accepted: false,
    reason: 'NO_MATCHING_PATTERN',
    observations: 0,
    scoreAdjustment: 0
  });
  const weights = strategyWeights || DEFAULT_STRATEGY_WEIGHTS;
  if (decisionPatterns.length > 0 && weights) {
    for (const pat of decisionPatterns) {
      const matchKey = Object.keys(weights).find(k => pat.name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(pat.name.toLowerCase()));
      if (matchKey) {
        const exp = weights[matchKey];
        decisionMemoryPolicy = resolveDecisionStrategyMemory(exp, { decisionTime });
        if (decisionMemoryPolicy.accepted) {
          const boost = decisionMemoryPolicy.scoreAdjustment;
          score += score >= 0 ? boost : -boost;
          const isHighConviction = decisionMemoryPolicy.winRate >= 75;
          const isLowConviction = decisionMemoryPolicy.winRate < 50;
          appliedMemoryInsight = {
            setupName: matchKey,
            winRate: decisionMemoryPolicy.winRate,
            observations: decisionMemoryPolicy.observations,
            scoreAdjustment: boost,
            isHighConviction,
            isLowConviction,
            badgeText: `VALIDATED MEMORY (${decisionMemoryPolicy.observations} OOS)`,
            text: `สถิติ Walk-forward นอกชุดฝึกของ "${matchKey}" ผ่านนโยบายแล้ว: ${decisionMemoryPolicy.winRate}% จาก ${decisionMemoryPolicy.observations} ตัวอย่าง • ปรับ Rule Score ${boost >= 0 ? '+' : ''}${boost}`
          };
        }
        break;
      }
    }
  }

  // 7.5 Authenticated MT5 Demo packets remain shadow-only until separately certified.
  const validatedMT5Shadow = mt5Data?.validation?.accepted === true && mt5Data?.mode === 'DEMO' ? mt5Data : null;
  const decisionMT5Data = validatedMT5Shadow?.validation?.decisionEligible === true ? validatedMT5Shadow : null;
  const mt5Intel = validatedMT5Shadow ? {
    connected: true,
    status: validatedMT5Shadow.status,
    mode: 'DEMO_SHADOW',
    symbol: validatedMT5Shadow.symbol,
    bid: validatedMT5Shadow.quote.bid,
    ask: validatedMT5Shadow.quote.ask,
    decisionInfluence: false
  } : null;

  // 8. Dynamic Market Regime Detection
  const regime = detectMarketRegime(candles, decisionNews, spreadInfo);

  // 9. Deterministic bullish-vs-risk rule countercheck (not independent agents).
  const countercheckCore = evaluateRuleCountercheckCore(decisionPatterns, regime, decisionMT5Data?.dom_depth, curRSI, currentPrice);
  const debate = evaluateAdversarialDebate(decisionPatterns, regime, decisionMT5Data?.dom_depth, curRSI, currentPrice);

  // 10. Four deterministic analysis modules.
  const smcVote = score >= 35 ? 'BUY 🟢' : score <= -35 ? 'SELL 🔴' : 'HOLD 🟡';
  const smcHighlight = decisionPatterns.length > 0 ? decisionPatterns[0].name : (curEMA20 > curEMA50 ? 'EMA Ribbon Uptrend' : 'EMA Downtrend');
  const smcConfidence = Math.min(99, Math.round(50 + Math.abs(score) / 2));

  const newsScore = decisionNews?.sentimentScore || 0;
  const macroVote = newsScore > 5 ? 'BULLISH 🟢' : newsScore < -5 ? 'BEARISH 🔴' : 'NEUTRAL 🟡';
  const macroHeadline = decisionNews?.headline || 'NO VERIFIED NEWS INPUT';

  const isSpreadWidened = spreadInfo ? spreadInfo.isWidened : false;
  const isRegimeEvidenceInsufficient = regime.decisionEligible !== true;
  const isSpreadRiskVetoed = isSpreadWidened && (Math.abs(score) < 60);
  const isVetoed = isRegimeEvidenceInsufficient || isSpreadRiskVetoed;
  const croVote = isRegimeEvidenceInsufficient
    ? 'WAITING FOR EVIDENCE ⏳'
    : isSpreadRiskVetoed
      ? 'VETO BLOCKED ❌'
      : 'CLEARED / APPROVED ✅';
  const croReason = isRegimeEvidenceInsufficient
    ? `⏳ ระงับการตัดสินใจ: มีแท่งปิด ${regime.evidence.closedBarCount}/${regime.evidence.requiredClosedBars || 50} แท่ง`
    : isSpreadRiskVetoed
      ? '⚠️ ระงับการเข้าไม้: สเปรดถ่างสูงและโมเมนตัมไม่หนาแน่นพอ'
      : '✅ ผ่านเกณฑ์ Risk/Reward และสเปรดปกติ';

  // Determine Action, Exploration Probe, and Consensus
  let action = 'NEUTRAL / HOLD';
  let badgeClass = 'signal-hold';
  let isExplorationProbe = false;
  let consensusType = '3/4 RULE ALIGNMENT';

  if (isRegimeEvidenceInsufficient) {
    action = 'INSUFFICIENT REGIME DATA / HOLD';
    badgeClass = 'signal-calc';
    consensusType = 'REGIME EVIDENCE REQUIRED';
  } else if (isSpreadRiskVetoed) {
    action = 'RISK VETOED / HOLD';
    badgeClass = 'signal-veto';
    consensusType = 'CRO VETO OVERRIDE ❌';
  } else if (score >= 45 || (riskAppetite === 'alpha_hunter' && score >= 28)) {
    const isUnanimous = macroVote.includes('BULLISH') && countercheckCore.outcome === 'BULL RULES ALIGNED';
    consensusType = isUnanimous ? '4/4 RULE ALIGNMENT 🌟' : '3/4 RULE ALIGNMENT';
    if (score < 45 && riskAppetite === 'alpha_hunter') {
      isExplorationProbe = true;
      action = 'ALPHA PROBE BUY (🧪)';
      badgeClass = 'signal-probe';
    } else {
      action = (score >= 75 && isUnanimous) ? 'STRONG BUY' : 'BUY';
      badgeClass = action.includes('STRONG') ? 'signal-strong-buy' : 'signal-buy';
    }
  } else if (score <= -45 || (riskAppetite === 'alpha_hunter' && score <= -28)) {
    const isUnanimous = macroVote.includes('BEARISH');
    consensusType = isUnanimous ? '4/4 RULE ALIGNMENT 🌟' : '3/4 RULE ALIGNMENT';
    if (score > -45 && riskAppetite === 'alpha_hunter') {
      isExplorationProbe = true;
      action = 'ALPHA PROBE SELL (🧪)';
      badgeClass = 'signal-probe';
    } else {
      action = (score <= -75 && isUnanimous) ? 'STRONG SELL' : 'SELL';
      badgeClass = action.includes('STRONG') ? 'signal-strong-sell' : 'signal-sell';
    }
  }

  // Deterministic desk summary (four named rule modules; no independent AI agents)
  const quantDesk = {
    consensusType,
    isVetoed,
    agents: [
      { id: 'price_action', name: '🏹 CONFIRMED PRICE-ACTION RULE', role: 'Closed-bar Pattern Evidence', vote: smcVote, detail: smcHighlight, confidence: `${smcConfidence}% rule score` },
      { id: 'macro', name: '⚡ MACRO SCENARIO RULE', role: 'Scenario Sentiment', vote: macroVote, detail: macroHeadline.slice(0, 38) + '...', confidence: `${Math.abs(newsScore)} pts` },
      { id: 'cro', name: '🛡️ RISK GATE', role: 'Spread & Capital Defense', vote: croVote, detail: croReason, isSafe: !isVetoed },
      { id: 'whale', name: '🐋 ORDER-BOOK INPUT CHECK', role: 'External Depth Packet', vote: countercheckCore.orderBook.verdict, detail: countercheckCore.orderBook.description, isSafe: countercheckCore.orderBook.source !== 'UNVERIFIED_EXTERNAL_PACKET' }
    ]
  };

  // Auditable decision-factor nodes
  const cotNodes = [
    { step: 1, title: '1. MARKET REGIME EVIDENCE', desc: `${regime.label} (${regime.desc})`, status: regime.badgeClass, isPass: regime.decisionEligible === true },
    { step: 2, title: '2. RULE COUNTERCHECK', desc: `${countercheckCore.outcome} • Bullish (${countercheckCore.bullishFactors.length}) vs Risk (${countercheckCore.riskFactors.length})`, status: countercheckCore.outcome, isPass: true },
    { step: 3, title: '3. CONFIRMED PRICE ACTION', desc: decisionPatterns.length > 0 ? decisionPatterns[0].name : 'NO CONFIRMED PATTERN', status: decisionPatterns.length > 0 ? 'CONFIRMED 🟢' : 'NEUTRAL', isPass: decisionPatterns.length > 0 },
    { step: 4, title: '4. SPREAD & RISK CLEARANCE', desc: croReason, status: isVetoed ? 'VETOED ❌' : 'CLEARED ✅', isPass: !isVetoed },
    { step: 5, title: '5. FINAL DECISION', desc: `Consensus: ${action} (${consensusType})`, status: action, isPass: !isVetoed }
  ];

  // Calculate Entry, TP, SL, Risk/Reward
  const isLong = score >= 0;
  const atr = Math.abs(curBBUpper - curBBLower) / 4 || (currentPrice * 0.015);

  const entry = currentPrice;
  const sl = isLong ? Number((entry - atr * 1.2).toFixed(asset ? asset.digits : 2)) : Number((entry + atr * 1.2).toFixed(asset ? asset.digits : 2));
  const tp1 = isLong ? Number((entry + atr * 2.0).toFixed(asset ? asset.digits : 2)) : Number((entry - atr * 2.0).toFixed(asset ? asset.digits : 2));
  const tp2 = isLong ? Number((entry + atr * 3.8).toFixed(asset ? asset.digits : 2)) : Number((entry - atr * 3.8).toFixed(asset ? asset.digits : 2));

  const riskAmount = Math.abs(entry - sl);
  const rewardAmount = Math.abs(tp1 - entry);
  const rrRatio = (rewardAmount / (riskAmount || 1)).toFixed(2);

  // Deterministic, uncalibrated rule-alignment score (not a probability).
  const targetScore = calculateTargetScore(entry, tp1, sl, regime, curRSI);

  // Confluence Factors Checklist
  const factors = [
    { name: `EMA 20/50 Trend Alignment (${curEMA20 > curEMA50 ? 'BULLISH 🟢' : 'BEARISH 🔴'})`, pass: isLong ? curEMA20 > curEMA50 : curEMA20 < curEMA50 },
    { name: `RSI Oscillator (${curRSI.toFixed(1)} - ${curRSI < 35 ? 'OVERSOLD' : curRSI > 65 ? 'OVERBOUGHT' : 'BALANCED'})`, pass: isLong ? curRSI < 55 : curRSI > 45 },
    { name: `MACD Zero-Line Momentum (${curMACDHist >= 0 ? '+BULLISH' : '-BEARISH'})`, pass: isLong ? curMACDHist > 0 : curMACDHist < 0 },
    { name: `Bollinger Band Position (${currentPrice < (curBBLower + curBBUpper)/2 ? 'Discount Zone' : 'Premium Zone'})`, pass: true }
  ];

  // Optimal Timing & Anti-FOMO Advice
  const optimalTiming = {
    windowText: isLong ? `รอจังหวะ Pullback ย่อแตะ $${(entry - atr * 0.4).toFixed(asset ? asset.digits : 2)} เพื่อความได้เปรียบ` : `รอจังหวะ Rebound เด้งแตะ $${(entry + atr * 0.4).toFixed(asset ? asset.digits : 2)} เพื่อเข้า Short`,
    antiFomoWarning: Math.abs(currentPrice - curEMA20) / currentPrice > 0.006 ? '⚠️ ราคาอยู่ห่างจากเส้น EMA20 มากเกินไป ห้ามไล่ราคาเด็ดขาด!' : '✅ ระยะห่างจากแนวรับอยู่ในเกณฑ์ปลอดภัย'
  };

  // Thai deterministic rationale breakdown
  let rationale = '';
  if (isRegimeEvidenceInsufficient) {
    rationale = `[REGIME EVIDENCE GUARD]: ยังไม่อนุญาตให้กฎออก BUY/SELL เพราะมีแท่งปิด ${regime.evidence.closedBarCount}/${regime.evidence.requiredClosedBars || 50} แท่ง ระบบจะรอหลักฐานครบก่อนประเมินสภาวะตลาด`;
  } else if (isSpreadRiskVetoed) {
    rationale = `⚠️ [CRO RISK VETO]: หัวหน้าฝ่ายบริหารความเสี่ยง (CRO) สั่งระงับการเข้าเปิดสถานะชั่วคราว เนื่องจากค่า Spread ของโบรกเกอร์เกิดการถ่างออกผิดปกติ (High Volatility Spurt) แนะนำรอให้สเปรดบีบตัวกลับสู่ระดับปกติก่อนเข้าออเดอร์`;
  } else {
    rationale = `ชุดกฎวิเคราะห์ประเมินมติ ${consensusType} สภาวะตลาดอยู่ในช่วง "${regime.label}" ` +
      `ฝ่ายเทคนิคพบสัญญาณ ${smcHighlight} สอดคล้องกับค่า RSI (${curRSI.toFixed(1)}) ` +
      `คะแนนความสอดคล้องของกฎสำหรับ TP1 อยู่ที่ ${targetScore.scorePercent}% (ยังไม่ใช่ค่าความน่าจะเป็นที่ผ่านการสอบเทียบ) ` +
      (isExplorationProbe ? `[🧪 ALPHA PROBE EXPLORATION]: ส่งไม้หยั่งเชิงขนาดเล็กเพื่อสำรวจโครงสร้างราคาใหม่และเก็บเกี่ยวข้อมูลการเรียนรู้` : `[🎯 HIGH CONVICTION]: อัตราส่วน Risk/Reward คุ้มค่าที่ 1:${rrRatio}`) +
      newsImpactText;
  }

  return {
    action,
    badgeClass,
    ruleScore: Math.min(99, Math.round(50 + Math.abs(score) / 2)),
    entry,
    tp1,
    tp2,
    sl,
    curRSI: Number(curRSI.toFixed(1)),
    rrRatio: `1:${rrRatio}`,
    rationale,
    activeNews,
    decisionNewsPolicy: Object.freeze({ accepted: decisionNewsPolicy.accepted, reason: decisionNewsPolicy.reason }),
    decisionMemoryPolicy,
    patternEvidence: Object.freeze([...decisionPatterns]),
    regime,
    targetScore,
    // Temporary compatibility field for older callers. New UI must use targetScore.
    monteCarlo: {
      tpProbabilityPercent: targetScore.scorePercent,
      slRiskPercent: targetScore.cautionScorePercent,
      confidenceRating: targetScore.rating,
      method: targetScore.method,
      calibrated: false,
      deprecated: true
    },
    ruleCountercheck: countercheckCore,
    adversarialDebate: debate,
    optimalTiming,
    isExplorationProbe,
    quantDesk,
    cotNodes,
    appliedMemoryInsight,
    mt5Intel,
    factors
  };
}

/**
 * AI Trading Terminal Controller
 */
export class AITradingEngine {
  constructor(options = {}) {
    this.app = options.app || null;
    this.sound = options.sound || null;
    this.toasts = options.toasts || null;
    this.capabilities = resolveRuntimeCapabilities(options.capabilities);
    this.liveTradingEnabled = this.capabilities.liveTradingEnabled === true;
    this.lastLiveError = null;

    // DOM Elements
    this.canvas = options.canvas || null;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.subCanvas = options.subCanvas || null;
    this.subCtx = this.subCanvas ? this.subCanvas.getContext('2d') : null;

    // Active State
    this.activeAsset = TRADING_ASSETS[0];
    this.activeTimeframe = TIMEFRAMES[1]; // 5m default
    this.candles = [];
    this.patterns = [];
    this.signal = null;
    this.isRealFeed = false;
    this.marketPacket = null;
    this.lastDataSourceStateKey = null;
    this.marketDataFetch = options.marketDataFetch || fetchBinanceCandles;
    this.marketDataTimer = null;
    this.marketDataRefreshEnabled = false;
    this.marketDataRefreshWasEnabledBeforeReplay = false;
    this.marketDataStreamGeneration = 0;
    this.marketDataRequestSequence = 0;
    this.marketPacketSequence = 0;
    this.marketDataActiveRequest = null;
    this.marketDataEvidence = [];
    this.marketDataHealth = createMarketDataHealth({
      symbol: this.activeAsset.id,
      timeframe: this.activeTimeframe.id,
      adapterSupported: hasVerifiedMarketDataAdapter(this.activeAsset.id)
    });

    // Real-Time News Stream
    this.newsList = LIVE_MARKET_NEWS_FEED.map(item => ({ ...item, provenance: 'SIMULATED_SCENARIO' }));
    this.newsIndex = 0;
    this.activeNews = this.newsList[0];
    this.newsInterval = null;

    // Chart Settings
    this.showEMA = true;
    this.showBollinger = true;
    this.showPatterns = true;
    this.showVolume = true;
    this.subChartMode = 'RSI'; // 'RSI' | 'MACD'

    // Mouse Interaction
    this.mouseX = -1;
    this.mouseY = -1;
    this.isHovering = false;

    // Live Tick Loop
    this.tickInterval = null;

    // Paper Trading Positions (Manual Operator)
    this.positions = [];
    this.tradeHistory = [];
    this.executionAudit = [];
    this.paperAuditSequence = 0;
    this.paperBalanceUSD = 100000.00; // $100,000 Paper Capital
    this.leverage = 10;
    this.paperRiskConfig = Object.freeze({ maxPositions: 3, maxUsedMarginPercent: 50, minimumRiskReward: 1.5 });
    this.verifiedPaperBotState = createVerifiedPaperBotState(this.paperBalanceUSD);

    // AI Continuous Learning Gym & Auto-Trader Sandbox
    this.isAutoTrading = false;
    this.aiPositions = [];
    this.aiJournal = [];
    this.aiStats = createZeroPaperGymStats();

    // Live Global Knowledge Stream & Real-Time Internet Ingestion
    this.knowledgeFeed = LIVE_INTERNET_KNOWLEDGE_FEED.map(item => ({ ...item, provenance: 'SIMULATED_REFERENCE' }));
    this.knowledgeLogs = this.knowledgeFeed.map(item => ({ ...item }));
    this.knowledgeIndex = 0;
    this.knowledgeStreamInterval = null;

    // Advanced Money Management & Dynamic Lot Calculator
    this.riskPercent = 2; // Default 2% Risk Rule
    this.accountCapital = 100000;

    // Time-Machine Strategy Replay & Backtest Engine
    this.isReplayMode = false;
    this.replayIndex = 0;
    this.replaySpeed = 1;
    this.replayInterval = null;
    this.fullHistoricalCandles = [];

    // Infinite Distilled Knowledge Weights Matrix
    this.strategyWeights = JSON.parse(JSON.stringify(DEFAULT_STRATEGY_WEIGHTS));

    // Headless MT5 Silent Ingestion Pipeline
    // Live MT5 / XM Execution Gateway & Risk Guardian Shield
    this.isLiveExecutionActive = false;
    this.liveGuardianConfig = { targetProfitUSD: 500, maxDrawdownUSD: 150, maxPositions: 2, magicNumber: 99001 };
    this.liveAccountState = { connected: false, mode: 'DISABLED', balance: null, equity: null, dailyProfit: null, dailyDrawdown: null, positions: [] };
    this.livePollingInterval = null;
    this.mt5Data = null;
    this.mt5Status = { status: 'DISCONNECTED', mt5_connected: false, decisionInfluence: false };
    this.lastMT5SessionId = null;
    this.lastMT5Sequence = 0;
    this.mt5StreamGeneration = 0;
    this.lastReconciledMT5Packet = null;
    this.mt5Reconciliation = null;
    this.mt5DemoReadiness = assessMT5DemoReadiness({});
    this.mlShadowModel = null;
    this.mlShadowReport = null;
    this.mlShadowPrediction = null;
    this.patternResearchDataset = null;
    this.patternResearchGeneration = 0;
    this.patternMemoryPromotionReport = null;
    this.aiReaderReport = null;
    this.aiReaderGeneration = 0;

    // Callbacks
    this.onSignalUpdate = options.onSignalUpdate || null;
    this.onPositionUpdate = options.onPositionUpdate || options.onPositionsUpdate || null;
    this.onPositionsUpdate = this.onPositionUpdate;
    this.onAIStatsUpdate = options.onAIStatsUpdate || null;
    this.onAIJournalUpdate = options.onAIJournalUpdate || null;
    this.onAIProfileUpdate = options.onAIProfileUpdate || null;
    this.onKnowledgeStreamUpdate = options.onKnowledgeStreamUpdate || null;
    this.onMoneyManagementUpdate = options.onMoneyManagementUpdate || null;
    this.onReplayUpdate = options.onReplayUpdate || null;
    this.onMT5DataUpdate = options.onMT5DataUpdate || null;
    this.onMT5ReadinessUpdate = options.onMT5ReadinessUpdate || null;
    this.onDataSourceUpdate = options.onDataSourceUpdate || null;
    this.onLiveExecutionUpdate = options.onLiveExecutionUpdate || null;
    this.onMLShadowUpdate = options.onMLShadowUpdate || null;
    this.onPatternResearchUpdate = options.onPatternResearchUpdate || null;
    this.onAIReaderUpdate = options.onAIReaderUpdate || null;
    this.onVerifiedPaperBotUpdate = options.onVerifiedPaperBotUpdate || null;

    // Load only persisted operator data. New profiles start at a truthful zero baseline.
    this.loadGymState();

    // Auto-save on Alt+F4 or sudden tab closure
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('beforeunload', () => this.saveGymState());
      window.addEventListener('pagehide', () => this.saveGymState());
    }
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') this.saveGymState();
      });
    }
  }

  startLiveAutoExecution(config = {}) {
    this.isLiveExecutionActive = false;
    this.lastLiveError = this.liveTradingEnabled
      ? 'LIVE_EXECUTION_COMPONENT_NOT_INSTALLED'
      : 'LIVE_TRADING_DISABLED_PAPER_ONLY';
    if (this.onLiveExecutionUpdate) {
      this.onLiveExecutionUpdate({
        active: false,
        mode: 'PAPER_ONLY',
        error: this.lastLiveError,
        config: this.liveGuardianConfig,
        state: this.liveAccountState
      });
    }
    return { success: false, reason: this.lastLiveError };
  }

  pauseLiveAutoExecution() {
    this.isLiveExecutionActive = false;
    if (this.livePollingInterval) clearInterval(this.livePollingInterval);
    if (this.onLiveExecutionUpdate) {
      this.onLiveExecutionUpdate({ active: false, config: this.liveGuardianConfig, state: this.liveAccountState });
    }
  }

  async emergencyKillAll() {
    this.pauseLiveAutoExecution();
    this.lastLiveError = this.liveTradingEnabled
      ? 'LIVE_EXECUTION_COMPONENT_NOT_INSTALLED'
      : 'LIVE_TRADING_DISABLED_PAPER_ONLY';
    if (this.onLiveExecutionUpdate) {
      this.onLiveExecutionUpdate({
        active: false,
        config: this.liveGuardianConfig,
        state: this.liveAccountState,
        emergency: true,
        verified: false,
        error: this.lastLiveError
      });
    }
    return { success: false, closed_positions: 0, reason: this.lastLiveError };
  }

  startLiveAccountPolling() {
    if (this.livePollingInterval) clearInterval(this.livePollingInterval);
    this.livePollingInterval = null;
    return false;
  }

  async executeLiveOrder(action = 'BUY', lots = 0.1, sl = 0, tp = 0) {
    this.lastLiveError = this.liveTradingEnabled
      ? 'LIVE_EXECUTION_COMPONENT_NOT_INSTALLED'
      : 'LIVE_TRADING_DISABLED_PAPER_ONLY';
    return { success: false, reason: this.lastLiveError };
  }

  startMT5BackgroundStream() {
    if (this.mt5PollingInterval) clearInterval(this.mt5PollingInterval);
    this.mt5PollingInterval = null;
    const streamGeneration = (Number(this.mt5StreamGeneration) || 0) + 1;
    this.mt5StreamGeneration = streamGeneration;
    this.lastMT5SessionId = null;
    this.lastMT5Sequence = 0;
    this.lastReconciledMT5Packet = null;
    this.mt5Reconciliation = null;

    const trustedSnapshot = typeof window !== 'undefined'
      ? window.cyberSystemAPI?.getMT5DemoSnapshot
      : null;
    if (typeof trustedSnapshot !== 'function') {
      this.mt5Data = null;
      this.mt5Status = { status: 'DEMO_GATEWAY_DISABLED', mt5_connected: false, decisionInfluence: false };
      if (this.onMT5DataUpdate) this.onMT5DataUpdate(this.mt5Status);
      return false;
    }

    // The renderer never receives the bearer token. Electron main authenticates
    // the read-only observer, then this layer validates freshness/schema/account.
    this.mt5Data = null;
    this.mt5Status = { status: 'DISCONNECTED', mt5_connected: false, decisionInfluence: false };

    const fetchMT5Stream = async () => {
      try {
        const response = await trustedSnapshot();
        if (streamGeneration !== this.mt5StreamGeneration) return false;
        if (!response?.success) {
          const isDisabled = response?.error === 'MT5_DEMO_GATEWAY_DISABLED';
          this.mt5Data = null;
          this.mt5Status = {
            status: isDisabled ? 'DEMO_GATEWAY_DISABLED' : 'DISCONNECTED',
            mt5_connected: false,
            decisionInfluence: false,
            reason: response?.error || 'MT5_DEMO_GATEWAY_UNAVAILABLE'
          };
          if (this.onMT5DataUpdate) this.onMT5DataUpdate(this.mt5Status);
          return !isDisabled;
        }

        const validation = validateMT5DemoPacket(response.packet, {
          now: Date.now(),
          lastSequence: this.lastMT5Sequence,
          expectedSessionId: this.lastMT5SessionId,
          transportAuthenticated: response.transportAuthenticated === true
        });
        const reconciliation = validation.accepted
          ? reconcileMT5DemoAccount(this.lastReconciledMT5Packet, validation.packet, {
              expectedMagic: this.liveGuardianConfig.magicNumber,
              expectedOpenTickets: []
            })
          : null;
        if (validation.accepted && reconciliation.reconciled) {
          this.mt5Data = validation.packet;
          this.lastMT5SessionId = validation.packet.sessionId;
          this.lastMT5Sequence = validation.packet.sequence;
          this.lastReconciledMT5Packet = validation.packet;
          this.mt5Reconciliation = reconciliation;
          this.mt5Status = validation.packet;
        } else {
          this.mt5Data = null;
          this.mt5Reconciliation = reconciliation;
          this.mt5Status = {
            status: validation.accepted ? 'REJECTED_RECONCILIATION_FAILED' : 'REJECTED_UNTRUSTED_MT5_PACKET',
            mt5_connected: false,
            decisionInfluence: false,
            reason: validation.accepted ? reconciliation.reasons.join('|') : validation.reason
          };
        }
        if (this.onMT5DataUpdate) this.onMT5DataUpdate(this.mt5Status);
        return true;
      } catch (e) {
        if (streamGeneration !== this.mt5StreamGeneration) return false;
        this.mt5Data = null;
        this.mt5Status = { status: 'DISCONNECTED', mt5_connected: false, decisionInfluence: false };
        if (this.onMT5DataUpdate) this.onMT5DataUpdate(this.mt5Status);
        return true;
      }
    };

    fetchMT5Stream().then(shouldContinue => {
      if (shouldContinue && streamGeneration === this.mt5StreamGeneration && !this.mt5PollingInterval) {
        this.mt5PollingInterval = setInterval(fetchMT5Stream, 3000);
      }
    });
    return true;
  }

  async inspectMT5DemoReadiness() {
    const readinessReader = typeof window !== 'undefined'
      ? window.cyberSystemAPI?.getMT5DemoReadiness
      : null;
    if (typeof readinessReader !== 'function') {
      this.mt5DemoReadiness = assessMT5DemoReadiness({});
      if (this.onMT5ReadinessUpdate) this.onMT5ReadinessUpdate(this.mt5DemoReadiness);
      return this.mt5DemoReadiness;
    }
    try {
      const raw = await readinessReader();
      this.mt5DemoReadiness = assessMT5DemoReadiness(raw);
    } catch (error) {
      this.mt5DemoReadiness = assessMT5DemoReadiness({});
    }
    if (this.onMT5ReadinessUpdate) this.onMT5ReadinessUpdate(this.mt5DemoReadiness);
    return this.mt5DemoReadiness;
  }

  saveGymState() {
    try {
      const operatorUsername = this.getOperatorUsername();
      const samples = this.aiStats.samplesStudied || 0;
      this.aiStats.adaptationLevel = Math.min(10, Math.floor(samples / 700) + 1);

      const state = {
        stats: this.aiStats,
        journal: this.aiJournal ? this.aiJournal.slice(0, 50) : [],
        weights: this.strategyWeights,
        paperBalanceUSD: this.paperBalanceUSD,
        paperAccountModel: PAPER_ACCOUNT_MODEL,
        positions: this.positions.slice(0, 50),
        tradeHistory: this.tradeHistory.slice(0, 100),
        executionAudit: this.executionAudit.slice(0, 250),
        mlShadow: {
          model: this.mlShadowModel,
          report: this.mlShadowReport
        },
        patternResearch: this.patternResearchDataset,
        aiReader: this.aiReaderReport,
        verifiedPaperBot: this.verifiedPaperBotState,
        riskAppetite: this.riskAppetite,
        riskPercent: this.riskPercent,
        savedAt: new Date().toISOString()
      };

      // 1. Synchronous Web Storage Layer
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.getGymStorageKey(operatorUsername), JSON.stringify(state));
      }

      // 2. Real System Hard-Disk Storage (cyber_db.json via Electron IPC)
      if (profileStore && typeof profileStore.saveTradingGymState === 'function') {
        profileStore.saveTradingGymState(operatorUsername, state);
      }
    } catch (e) {}
  }

  getOperatorUsername() {
    const username = String(this.app?.username || 'Anan').trim();
    return username || 'Anan';
  }

  getGymStorageKey(username = this.getOperatorUsername()) {
    return `cyber_ai_trading_gym_state:${encodeURIComponent(String(username).trim().toLowerCase())}`;
  }

  getMarketDecisionState(now = Date.now()) {
    const packetDecision = evaluateMarketPacketDecisionEligibility(this.marketPacket, { now });
    if (!this.isReplayMode) return packetDecision;
    return Object.freeze({
      ...packetDecision,
      eligible: false,
      reasons: Object.freeze([...new Set([...packetDecision.reasons, 'REPLAY_MODE_NO_EXECUTION'])])
    });
  }

  getDecisionCandles() {
    return Array.isArray(this.marketPacket?.decisionCandles)
      ? this.marketPacket.decisionCandles
      : [];
  }

  publishDataSourceState(now = Date.now()) {
    const packetSummary = summarizeMarketPacket(this.marketPacket, { now });
    const decision = this.getMarketDecisionState(now);
    const health = this.marketDataHealth || null;
    const latestEvidence = Array.isArray(this.marketDataEvidence) ? this.marketDataEvidence[0] || null : null;
    const state = Object.freeze({
      ...packetSummary,
      decisionEligible: decision.eligible,
      decisionReasons: decision.reasons,
      dataAgeMs: decision.dataAgeMs,
      health,
      healthStatus: health?.status || 'NOT_STARTED',
      consecutiveFailures: health?.consecutiveFailures || 0,
      nextRefreshAtMs: health?.nextRefreshAtMs ?? null,
      latestEvidence
    });
    const stateKey = JSON.stringify([
      state.source,
      state.packetSequence,
      state.quality,
      state.decisionEligible,
      state.decisionReasons,
      state.closedBars,
      state.formingBars,
      state.healthStatus,
      state.health?.inFlight,
      state.consecutiveFailures,
      state.nextRefreshAtMs,
      state.latestEvidence?.requestId,
      state.latestEvidence?.outcome
    ]);
    const changed = stateKey !== this.lastDataSourceStateKey;
    this.lastDataSourceStateKey = stateKey;
    if (changed && this.onDataSourceUpdate) this.onDataSourceUpdate(state);
    return changed;
  }

  recordMarketDataEvidence(evidence) {
    if (!evidence) return null;
    if (!Array.isArray(this.marketDataEvidence)) this.marketDataEvidence = [];
    this.marketDataEvidence.unshift(evidence);
    if (this.marketDataEvidence.length > 100) this.marketDataEvidence.length = 100;
    return evidence;
  }

  applyMarketPacket(packet) {
    if (!packet || !Array.isArray(packet.candles)) return false;
    this.marketPacket = packet;
    this.candles = packet.candles.map(candle => ({ ...candle }));
    this.fullHistoricalCandles = packet.decisionCandles.map(candle => ({ ...candle }));
    this.isRealFeed = packet.provenance?.verified === true && packet.provenance?.simulation !== true;
    const quoteCandle = this.candles.at(-1);
    if (quoteCandle) {
      this.currentSpreadInfo = calculateDynamicSpread(this.activeAsset, quoteCandle.close, quoteCandle, this.activeNews);
      if (this.onSpreadUpdate) this.onSpreadUpdate(this.currentSpreadInfo);
    }
    return true;
  }

  clearMarketDataRefreshTimer() {
    if (this.marketDataTimer) clearTimeout(this.marketDataTimer);
    this.marketDataTimer = null;
  }

  scheduleMarketDataRefresh(delayOverrideMs = null) {
    this.clearMarketDataRefreshTimer();
    if (!this.marketDataRefreshEnabled || this.isReplayMode || this.marketDataHealth?.adapterSupported !== true) return false;
    const now = Date.now();
    const calculatedDelay = calculateMarketDataRefreshDelay({
      timeframeSeconds: this.activeTimeframe.seconds,
      consecutiveFailures: this.marketDataHealth?.consecutiveFailures || 0,
      adapterSupported: true
    });
    const healthDelay = Number.isFinite(this.marketDataHealth?.nextRefreshAtMs)
      ? Math.max(0, this.marketDataHealth.nextRefreshAtMs - now)
      : calculatedDelay;
    const hasDelayOverride = delayOverrideMs !== null && delayOverrideMs !== undefined && Number.isFinite(Number(delayOverrideMs));
    const delayMs = hasDelayOverride
      ? Math.max(0, Number(delayOverrideMs))
      : healthDelay;
    if (!Number.isFinite(delayMs)) return false;
    const generation = this.marketDataStreamGeneration;
    this.marketDataTimer = setTimeout(() => {
      this.marketDataTimer = null;
      void this.refreshMarketDataSnapshot({ generation, allowSimulationFallback: false });
    }, delayMs);
    return true;
  }

  startMarketDataRefreshLoop({ immediate = false } = {}) {
    this.marketDataRefreshEnabled = true;
    return this.scheduleMarketDataRefresh(immediate ? 0 : null);
  }

  stopMarketDataRefreshLoop({ invalidate = true } = {}) {
    this.marketDataRefreshEnabled = false;
    this.clearMarketDataRefreshTimer();
    if (invalidate) this.marketDataStreamGeneration += 1;
  }

  async refreshMarketDataSnapshot({
    generation = this.marketDataStreamGeneration,
    allowSimulationFallback = false
  } = {}) {
    if (generation !== this.marketDataStreamGeneration) {
      return Object.freeze({ success: false, reason: 'SUPERSEDED_MARKET_REQUEST' });
    }
    if (this.marketDataActiveRequest?.generation === generation) {
      return Object.freeze({ success: false, reason: 'REFRESH_ALREADY_IN_FLIGHT' });
    }

    const asset = this.activeAsset;
    const timeframe = this.activeTimeframe;
    const adapterSupported = hasVerifiedMarketDataAdapter(asset.id);
    const startedAt = Date.now();
    const requestId = `MKT_${generation}_${++this.marketDataRequestSequence}_${startedAt.toString(36)}`;
    this.marketDataActiveRequest = Object.freeze({ requestId, generation, symbol: asset.id, timeframe: timeframe.id });
    this.marketDataHealth = beginMarketDataAttempt(this.marketDataHealth, { requestId, at: startedAt });
    this.publishDataSourceState(startedAt);

    let realData = null;
    let fetchReason = null;
    try {
      if (adapterSupported) {
        realData = await this.marketDataFetch(asset.id, timeframe.id, 80);
      } else {
        fetchReason = MARKET_DATA_ATTEMPT_OUTCOME.NO_VERIFIED_ADAPTER;
      }
    } catch (error) {
      fetchReason = `FETCH_EXCEPTION_${String(error?.name || 'ERROR').toUpperCase().slice(0, 40)}`;
    }
    const finishedAt = Date.now();

    if (generation !== this.marketDataStreamGeneration
      || this.activeAsset.id !== asset.id
      || this.activeTimeframe.id !== timeframe.id) {
      this.recordMarketDataEvidence(createMarketDataEvidence({
        requestId,
        generation,
        source: adapterSupported ? MARKET_PACKET_SOURCES.BINANCE_KLINES_REST : 'NO_VERIFIED_ADAPTER',
        symbol: asset.id,
        timeframe: timeframe.id,
        startedAt,
        finishedAt,
        outcome: MARKET_DATA_ATTEMPT_OUTCOME.SUPERSEDED,
        reason: 'TARGET_CHANGED_BEFORE_RESPONSE',
        rawCandleCount: Array.isArray(realData) ? realData.length : null
      }));
      if (this.marketDataActiveRequest?.requestId === requestId) this.marketDataActiveRequest = null;
      return Object.freeze({ success: false, reason: 'SUPERSEDED_MARKET_REQUEST' });
    }

    let outcome = MARKET_DATA_ATTEMPT_OUTCOME.NO_DATA;
    let reason = fetchReason || 'NO_DATA_FROM_ADAPTER';
    let candidatePacket = null;
    let adoptedPacket = null;
    if (Array.isArray(realData) && realData.length > 0) {
      candidatePacket = createMarketPacket({
        source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
        adapter: getMarketDataDisclosure(asset.id),
        sequence: ++this.marketPacketSequence,
        requestId,
        symbol: asset.id,
        timeframe: timeframe.id,
        timeframeSeconds: timeframe.seconds,
        observedAt: finishedAt,
        candles: realData
      });
      const candidateDecision = evaluateMarketPacketDecisionEligibility(candidatePacket, { now: finishedAt });
      if (candidatePacket.quality.status === 'VALID' && candidateDecision.eligible) {
        outcome = MARKET_DATA_ATTEMPT_OUTCOME.SUCCESS;
        reason = null;
        adoptedPacket = candidatePacket;
        this.applyMarketPacket(adoptedPacket);
      } else {
        outcome = MARKET_DATA_ATTEMPT_OUTCOME.QUALITY_REJECTED;
        reason = candidateDecision.reasons.join('|') || `QUALITY_${candidatePacket.quality.status}`;
      }
    } else if (!adapterSupported) {
      outcome = MARKET_DATA_ATTEMPT_OUTCOME.NO_VERIFIED_ADAPTER;
      reason = MARKET_DATA_ATTEMPT_OUTCOME.NO_VERIFIED_ADAPTER;
    }

    if (!adoptedPacket && allowSimulationFallback && !this.marketPacket) {
      this.generateHistoricalCandles();
      adoptedPacket = createMarketPacket({
        source: MARKET_PACKET_SOURCES.SIMULATED_FALLBACK,
        adapter: 'LOCAL_RANDOM_WALK_SIMULATION',
        sequence: ++this.marketPacketSequence,
        requestId,
        symbol: asset.id,
        timeframe: timeframe.id,
        timeframeSeconds: timeframe.seconds,
        observedAt: finishedAt,
        candles: this.candles
      });
      this.applyMarketPacket(adoptedPacket);
    }

    this.marketDataHealth = settleMarketDataAttempt(this.marketDataHealth, {
      outcome,
      reason,
      at: finishedAt,
      packetSequence: adoptedPacket?.sequence || this.marketPacket?.sequence || this.marketDataHealth?.packetSequence,
      timeframeSeconds: timeframe.seconds
    });
    this.recordMarketDataEvidence(createMarketDataEvidence({
      requestId,
      generation,
      source: adapterSupported ? MARKET_PACKET_SOURCES.BINANCE_KLINES_REST : 'NO_VERIFIED_ADAPTER',
      symbol: asset.id,
      timeframe: timeframe.id,
      startedAt,
      finishedAt,
      outcome,
      reason,
      packet: candidatePacket,
      rawCandleCount: Array.isArray(realData) ? realData.length : null
    }));
    if (this.marketDataActiveRequest?.requestId === requestId) this.marketDataActiveRequest = null;
    this.publishDataSourceState(finishedAt);
    if (this.candles.length > 0) this.analyzeMarket();
    if (typeof requestAnimationFrame === 'function') this.requestRender();
    if (this.marketDataRefreshEnabled) this.scheduleMarketDataRefresh();
    return Object.freeze({
      success: outcome === MARKET_DATA_ATTEMPT_OUTCOME.SUCCESS,
      outcome,
      reason,
      requestId,
      packetSequence: adoptedPacket?.sequence || this.marketPacket?.sequence || 0
    });
  }

  loadGymState() {
    try {
      let state = null;
      const operatorUsername = this.getOperatorUsername();
      const storageKey = this.getGymStorageKey(operatorUsername);

      // 1. Try loading from ProfileStore / Real Disk first
      if (profileStore && typeof profileStore.getTradingGymState === 'function') {
        const diskState = profileStore.getTradingGymState(operatorUsername);
        if (diskState && typeof diskState === 'object') state = diskState;
      }

      // 2. Cross-reference with LocalStorage and pick the most advanced state
      if (typeof localStorage !== 'undefined') {
        let raw = localStorage.getItem(storageKey);
        if (!raw && operatorUsername.toLowerCase() === 'anan') {
          raw = localStorage.getItem('cyber_ai_trading_gym_state');
          if (raw) {
            localStorage.setItem(storageKey, raw);
            localStorage.removeItem('cyber_ai_trading_gym_state');
          }
        }
        if (raw) {
          const localState = JSON.parse(raw);
          if (localState && localState.stats) state = selectLatestPaperState(state, localState);
        }
      }

      const legacyMigration = migrateLegacyDemoSeed(state);
      state = legacyMigration.state;

      if (state && state.stats) {
        this.aiStats = { ...this.aiStats, ...state.stats };
        const samples = this.aiStats.samplesStudied || 0;
        this.aiStats.adaptationLevel = Math.min(10, Math.floor(samples / 700) + 1);

        this.aiJournal = Array.isArray(state.journal) ? state.journal : [];
        if (state.weights && typeof state.weights === 'object') {
          this.strategyWeights = { ...DEFAULT_STRATEGY_WEIGHTS, ...state.weights };
        }
        if (typeof state.paperBalanceUSD === 'number') {
          this.paperBalanceUSD = state.paperBalanceUSD;
        }
        if (state.paperAccountModel === PAPER_ACCOUNT_MODEL) {
          this.positions = restorePaperPositions(state.positions, 50);
          this.tradeHistory = restorePaperTradeHistory(state.tradeHistory, 100);
          this.executionAudit = restorePaperExecutionAudit(state.executionAudit, 250);
          this.mlShadowModel = restoreMLShadowModel(state.mlShadow?.model);
          this.mlShadowReport = restoreMLShadowReport(state.mlShadow?.report);
          this.patternResearchDataset = restorePatternOutcomeResearchDataset(state.patternResearch);
          this.aiReaderReport = restoreAIReaderReport(state.aiReader);
          this.verifiedPaperBotState = restoreVerifiedPaperBotState(state.verifiedPaperBot, { balanceUSD: this.paperBalanceUSD });
        }
        this.rebuildValidatedPatternMemory();
        if (state.riskAppetite) {
          this.riskAppetite = state.riskAppetite;
        }
        if (typeof state.riskPercent === 'number') {
          this.riskPercent = state.riskPercent;
        }
        if (legacyMigration.migrated) this.saveGymState();
        return true;
      }
    } catch (e) {}
    return false;
  }

  setRiskPercent(risk) {
    this.riskPercent = normalizeRiskPercent(risk);
    this.saveGymState();
    if (this.onMoneyManagementUpdate) {
      this.onMoneyManagementUpdate(this.getMoneyManagementDetails());
    }
  }

  setAccountCapital(cap) {
    const nextCapital = Number(cap);
    if (this.positions.length > 0 || !Number.isFinite(nextCapital) || nextCapital <= 0) {
      if (this.toasts) this.toasts.show('ERROR', 'CLOSE PAPER POSITIONS BEFORE RESETTING CAPITAL', 2500);
      return false;
    }
    this.paperBalanceUSD = nextCapital;
    this.accountCapital = this.paperBalanceUSD;
    this.saveGymState();
    if (this.onMoneyManagementUpdate) {
      this.onMoneyManagementUpdate(this.getMoneyManagementDetails());
    }
    return true;
  }

  getMoneyManagementDetails() {
    const curPrice = this.candles.length > 0 ? this.candles[this.candles.length - 1].close : this.activeAsset.basePrice;
    const sl = this.signal ? this.signal.sl : curPrice * 0.99;
    const slDistance = Math.max(curPrice * 0.002, Math.abs(curPrice - sl));
    const account = summarizePaperAccount(this.paperBalanceUSD, this.positions);
    const sizing = calculatePaperPositionSize({
      asset: this.activeAsset,
      entryPrice: curPrice,
      stopPrice: curPrice > slDistance ? sl : curPrice - slDistance,
      equityUSD: Math.max(0, account.equity),
      freeMarginUSD: Math.max(0, account.freeMargin),
      riskPercent: this.riskPercent,
      leverage: this.leverage
    });

    return {
      capital: account.balance,
      riskPercent: this.riskPercent,
      riskUSD: sizing?.riskBudgetUSD || 0,
      actualRiskUSD: sizing?.actualRiskUSD || 0,
      calculatedLots: sizing?.sizeUnit === 'LOTS' ? sizing.sizeValue : null,
      sizeValue: sizing?.sizeValue || 0,
      sizeUnit: sizing?.sizeUnit || 'UNITS',
      requiredMarginUSD: sizing?.requiredMarginUSD || 0,
      limitedByMargin: sizing?.limitedByMargin === true,
      equity: account.equity,
      usedMargin: account.usedMargin,
      freeMargin: account.freeMargin,
      marginLevel: account.marginLevel,
      marginStatus: account.marginStatus,
      leverage: sizing?.effectiveLeverage || this.leverage,
      accountModel: account.accountModel
    };
  }

  // Time-Machine Strategy Replay Methods
  async runMLShadowEvaluation(options = {}) {
    const asset = this.activeAsset;
    const timeframe = this.activeTimeframe;
    const sourceDisclosure = getMarketDataDisclosure(asset.id);
    if (sourceDisclosure === 'NO VERIFIED ADAPTER') {
      return { success: false, reason: 'VERIFIED_MARKET_DATA_ADAPTER_REQUIRED' };
    }

    const fetchedCandles = await fetchBinanceHistory(asset.id, timeframe.id, 2000, options.fetchOptions || {});
    if (!Array.isArray(fetchedCandles) || fetchedCandles.length < 121) {
      return { success: false, reason: 'REAL_MARKET_HISTORY_UNAVAILABLE' };
    }
    // Binance may include the currently forming bar. Train/evaluate on closed bars only.
    const closedCandles = fetchedCandles.slice(0, -1);
    const result = trainAndEvaluateMLShadow(closedCandles, {
      assetId: asset.id,
      timeframe: timeframe.id,
      source: sourceDisclosure,
      horizonBars: options.horizonBars || 3,
      roundTripCostBps: options.roundTripCostBps ?? (asset.market === MARKET_TYPES.BINANCE ? 12 : 20),
      now: options.now || Date.now()
    });
    if (!result.success) return result;
    this.mlShadowModel = result.model;
    this.mlShadowReport = result.report;
    this.mlShadowPrediction = null;
    this.saveGymState();
    if (this.onMLShadowUpdate) {
      this.onMLShadowUpdate({ model: this.mlShadowModel, report: this.mlShadowReport, prediction: null });
    }
    return result;
  }

  async runPatternResearchEvaluation(options = {}) {
    const asset = this.activeAsset;
    const timeframe = this.activeTimeframe;
    const researchGeneration = ++this.patternResearchGeneration;
    const sourceDisclosure = getMarketDataDisclosure(asset.id);
    if (sourceDisclosure === 'NO VERIFIED ADAPTER') {
      return { success: false, reason: 'VERIFIED_MARKET_DATA_ADAPTER_REQUIRED' };
    }

    const requestedBars = Math.min(5000, Math.max(120, Math.floor(Number(options.totalBars) || 2000)));
    const now = Number(options.now) || Date.now();
    const fetchedCandles = await fetchBinanceHistory(asset.id, timeframe.id, requestedBars, options.fetchOptions || {});
    if (researchGeneration !== this.patternResearchGeneration
      || this.activeAsset?.id !== asset.id
      || this.activeTimeframe?.id !== timeframe.id) {
      return { success: false, reason: 'PATTERN_RESEARCH_SUPERSEDED' };
    }
    if (!Array.isArray(fetchedCandles) || fetchedCandles.length < 120) {
      return { success: false, reason: 'REAL_MARKET_HISTORY_UNAVAILABLE' };
    }
    const timeframeMs = timeframe.seconds * 1000;
    const closedCandles = fetchedCandles.filter(candle => {
      const openTimeMs = Number(candle?.openTimeMs) || Number(candle?.time) * 1000;
      const closeTimeMs = Number(candle?.closeTimeMs) || (openTimeMs + timeframeMs - 1);
      return Number.isFinite(closeTimeMs) && closeTimeMs <= now;
    });
    if (closedCandles.length < 51) {
      return { success: false, reason: 'INSUFFICIENT_VERIFIED_CLOSED_HISTORY' };
    }

    const dataset = buildPatternOutcomeResearchDataset(closedCandles, {
      source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
      adapter: sourceDisclosure,
      assetId: asset.id,
      timeframe: timeframe.id,
      timeframeSeconds: timeframe.seconds,
      collectedAt: now,
      verified: true,
      simulation: false
    }, {
      horizonBars: options.horizonBars ?? 12,
      analysisWindowBars: options.analysisWindowBars ?? 80,
      targetR: options.targetR ?? 2,
      roundTripCostBps: options.roundTripCostBps ?? (asset.market === MARKET_TYPES.BINANCE ? 12 : 20),
      slippageBps: options.slippageBps ?? 2,
      minimumCompletedSamples: options.minimumCompletedSamples ?? 30,
      maxSamples: options.maxSamples ?? 250
    });
    if (!dataset.success) return { success: false, reason: dataset.reason, dataset };

    this.patternResearchDataset = dataset;
    this.rebuildValidatedPatternMemory();
    this.saveGymState();
    if (this.onPatternResearchUpdate) this.onPatternResearchUpdate({ dataset, promotion: this.patternMemoryPromotionReport });
    return { success: true, dataset, promotion: this.patternMemoryPromotionReport };
  }

  rebuildValidatedPatternMemory() {
    const preserved = {};
    for (const [key, value] of Object.entries(this.strategyWeights || {})) {
      if (value?.provenance === 'WALK_FORWARD_OUT_OF_SAMPLE_VALIDATED') continue;
      preserved[key] = value;
    }
    this.patternMemoryPromotionReport = promotePatternStrategyMemory(this.patternResearchDataset);
    this.strategyWeights = {
      ...DEFAULT_STRATEGY_WEIGHTS,
      ...preserved,
      ...(this.patternMemoryPromotionReport.success ? this.patternMemoryPromotionReport.memories : {})
    };
    return this.patternMemoryPromotionReport;
  }

  async getLocalAIReaderStatus() {
    const statusReader = typeof window !== 'undefined'
      ? window.cyberSystemAPI?.getLocalAIReaderStatus
      : null;
    if (typeof statusReader !== 'function') {
      return { success: false, provider: 'LOCAL_OLLAMA', error: 'LOCAL_AI_BRIDGE_UNAVAILABLE', apiKeyRequired: false };
    }
    try {
      return await statusReader();
    } catch (error) {
      return { success: false, provider: 'LOCAL_OLLAMA', error: 'LOCAL_AI_STATUS_FAILED', apiKeyRequired: false };
    }
  }

  async runLocalAIReaderInterpretation(options = {}) {
    const generation = ++this.aiReaderGeneration;
    const marketDecision = this.getMarketDecisionState(options.now || Date.now());
    if (!marketDecision.eligible) {
      return { success: false, reason: marketDecision.reasons.join('|') || 'VERIFIED_MARKET_DATA_REQUIRED' };
    }
    const contract = createAIReaderInput({
      marketPacket: this.marketPacket,
      asset: this.activeAsset,
      timeframe: this.activeTimeframe,
      signal: this.signal,
      patterns: this.patterns,
      patternResearch: this.patternResearchDataset,
      now: options.now || Date.now()
    });
    if (!contract.success) return contract;
    const runReader = typeof window !== 'undefined'
      ? window.cyberSystemAPI?.runLocalAIReader
      : null;
    if (typeof runReader !== 'function') return { success: false, reason: 'LOCAL_AI_BRIDGE_UNAVAILABLE' };
    let response = null;
    try {
      response = await runReader(contract.input);
    } catch (error) {
      return { success: false, reason: 'LOCAL_AI_READER_FAILED_CLOSED' };
    }
    if (generation !== this.aiReaderGeneration
      || this.activeAsset?.id !== contract.input.market.assetId
      || this.activeTimeframe?.id !== contract.input.market.timeframe
      || this.marketPacket?.sequence !== contract.input.market.packetSequence) {
      return { success: false, reason: 'AI_READER_RESULT_SUPERSEDED' };
    }
    if (!response?.success) {
      return { success: false, reason: response?.error || 'LOCAL_AI_READER_UNAVAILABLE', status: response?.status || null };
    }
    const validation = validateAIReaderOutput(response.output, contract.input, response.provider);
    if (!validation.accepted) return { success: false, reason: validation.reason };
    this.aiReaderReport = validation.report;
    this.saveGymState();
    if (this.onAIReaderUpdate) this.onAIReaderUpdate({ report: this.aiReaderReport });
    return { success: true, report: this.aiReaderReport };
  }

  toggleVerifiedPaperBot(enabled) {
    this.verifiedPaperBotState = setVerifiedPaperBotEnabled(this.verifiedPaperBotState, enabled, {
      balanceUSD: this.paperBalanceUSD,
      now: Date.now()
    });
    this.saveGymState();
    if (this.onVerifiedPaperBotUpdate) this.onVerifiedPaperBotUpdate({ state: this.verifiedPaperBotState });
    if (enabled && !this.verifiedPaperBotState.enabled && this.toasts) {
      this.toasts.show('ERROR', 'VERIFIED PAPER BOT BLOCKED: RESET KILL SWITCH FIRST', 2600);
    }
    if (this.verifiedPaperBotState.enabled) this.evaluateVerifiedPaperBot();
    return this.verifiedPaperBotState.enabled;
  }

  triggerVerifiedPaperBotKillSwitch({ closeBotPositions = true } = {}) {
    this.verifiedPaperBotState = armVerifiedPaperBotKillSwitch(this.verifiedPaperBotState, {
      balanceUSD: this.paperBalanceUSD,
      now: Date.now()
    });
    let closed = 0;
    if (closeBotPositions) {
      const ids = this.positions.filter(position => position.executionSource === 'VERIFIED_PAPER_BOT').map(position => position.id);
      ids.forEach(id => {
        if (this.closePosition(id, 'VERIFIED_PAPER_BOT_KILL_SWITCH').success) closed += 1;
      });
    }
    this.saveGymState();
    if (this.onVerifiedPaperBotUpdate) this.onVerifiedPaperBotUpdate({ state: this.verifiedPaperBotState, killed: true, closed });
    return { success: true, killed: true, closed };
  }

  resetVerifiedPaperBotSafety() {
    this.verifiedPaperBotState = resetVerifiedPaperBotKillSwitch(this.verifiedPaperBotState, {
      balanceUSD: this.paperBalanceUSD,
      now: Date.now()
    });
    this.saveGymState();
    if (this.onVerifiedPaperBotUpdate) this.onVerifiedPaperBotUpdate({ state: this.verifiedPaperBotState });
    return this.verifiedPaperBotState;
  }

  evaluateVerifiedPaperBot(now = Date.now()) {
    const account = summarizePaperAccount(this.paperBalanceUSD, this.positions);
    const result = evaluateVerifiedPaperBotDecision({
      state: this.verifiedPaperBotState,
      marketPacket: this.marketPacket,
      marketDecision: this.getMarketDecisionState(now),
      signal: this.signal,
      positions: this.positions,
      paperAccount: account,
      patternResearch: this.patternResearchDataset,
      aiReaderReport: this.aiReaderReport,
      now
    });
    if (['MAX_DAILY_LOSS_REACHED', 'MAX_DRAWDOWN_REACHED'].includes(result.reason)) {
      this.triggerVerifiedPaperBotKillSwitch({ closeBotPositions: true });
      return result;
    }
    if (!result.execute) {
      this.verifiedPaperBotState = recordVerifiedPaperBotDecision(this.verifiedPaperBotState, result, {
        balanceUSD: this.paperBalanceUSD,
        equityUSD: account.equity,
        now
      });
      if (this.onVerifiedPaperBotUpdate) this.onVerifiedPaperBotUpdate({ state: this.verifiedPaperBotState, result });
      return result;
    }

    const currentPrice = this.candles.at(-1)?.close;
    const spreadInfo = this.currentSpreadInfo || calculateDynamicSpread(this.activeAsset, currentPrice, this.candles.at(-1), this.activeNews);
    const executionPrice = result.decision.side === 'LONG' ? spreadInfo.askPrice : spreadInfo.bidPrice;
    const sizing = calculatePaperPositionSize({
      asset: this.activeAsset,
      entryPrice: executionPrice,
      stopPrice: this.signal.sl,
      equityUSD: Math.max(0, account.equity),
      freeMarginUSD: Math.max(0, account.freeMargin),
      riskPercent: result.decision.requestedRiskPercent,
      leverage: this.leverage
    });
    const opened = sizing?.requiredMarginUSD > 0
      ? this.openPosition(result.decision.side, sizing.requiredMarginUSD, 'VERIFIED_PAPER_BOT', result.decision)
      : { success: false, reason: 'VERIFIED_BOT_POSITION_SIZE_REJECTED' };
    this.verifiedPaperBotState = recordVerifiedPaperBotDecision(this.verifiedPaperBotState, result, {
      executed: opened.success === true,
      balanceUSD: this.paperBalanceUSD,
      equityUSD: summarizePaperAccount(this.paperBalanceUSD, this.positions).equity,
      now
    });
    this.saveGymState();
    if (this.onVerifiedPaperBotUpdate) this.onVerifiedPaperBotUpdate({ state: this.verifiedPaperBotState, result, opened });
    return { ...result, opened };
  }

  runRuleBacktest(options = {}) {
    const sourceCandles = this.fullHistoricalCandles?.length
      ? this.fullHistoricalCandles
      : this.getDecisionCandles().length
        ? this.getDecisionCandles()
        : this.candles;
    const asset = this.activeAsset;
    const packetSummary = summarizeMarketPacket(this.marketPacket, { now: options.now || Date.now() });
    const result = runBarCloseBacktest(sourceCandles, history => {
      const patterns = detectChartPatterns(history);
      const lastCandle = history.at(-1);
      const deterministicSpread = calculateSpreadFromCore(asset, lastCandle.close, lastCandle, null, () => 0.5);
      const signal = generateAISignal(
        history,
        asset,
        patterns,
        null,
        null,
        deterministicSpread,
        null,
        this.riskAppetite || 'balanced'
      );
      return {
        action: signal.action,
        sl: signal.sl,
        tp1: signal.tp1,
        reason: signal.rationale,
        signalId: `${asset.id}:${lastCandle.time}`
      };
    }, {
      warmupCandles: 50,
      initialCapital: 100000,
      riskPerTradePercent: 1,
      maxDrawdownPercent: 10,
      feeBps: asset.market === MARKET_TYPES.BINANCE ? 10 : 0,
      slippageBps: 2,
      maximumLeverage: Math.min(3, asset.leverageMax || 1),
      minimumRiskReward: 1.2,
      ...options
    });

    return Object.freeze({
      ...result,
      strategy: Object.freeze({
        id: 'CYBERDECK_DETERMINISTIC_RULE_SIGNAL_V1',
        modelType: 'RULE_BASED_NOT_ML',
        newsIncluded: false,
        mt5Included: false,
        strategyMemoryIncluded: false,
        spreadMode: 'DETERMINISTIC_MEDIAN_SIMULATION'
      }),
      dataProvenance: Object.freeze({
        marketPacketSchema: packetSummary.schemaVersion,
        marketPacketSequence: packetSummary.packetSequence,
        marketRequestId: packetSummary.requestId,
        source: packetSummary.source,
        sourceLabel: packetSummary.sourceLabel,
        quality: packetSummary.quality,
        marketHealthStatus: this.marketDataHealth?.status || 'NOT_STARTED',
        latestEvidenceOutcome: this.marketDataEvidence?.[0]?.outcome || null,
        simulation: packetSummary.isSimulation,
        decisionEligibleAtRun: packetSummary.decisionEligible,
        decisionReasons: Object.freeze([...packetSummary.decisionReasons]),
        assetId: asset.id,
        catalogMode: asset.dataMode,
        feedWasRealAtRuntime: packetSummary.isRealFeed || this.isRealFeed === true,
        candleCount: Array.isArray(sourceCandles) ? sourceCandles.length : 0
      })
    });
  }

  startReplay() {
    if (this.candles.length < 20) return;
    this.marketDataRefreshWasEnabledBeforeReplay = this.marketDataRefreshEnabled;
    this.stopMarketDataRefreshLoop({ invalidate: true });
    this.stopReplayPlayback();
    this.isReplayMode = true;
    if (!this.fullHistoricalCandles || this.fullHistoricalCandles.length === 0) {
      this.fullHistoricalCandles = [...this.candles];
    }
    this.replayIndex = Math.floor(this.fullHistoricalCandles.length / 2);
    this.candles = this.fullHistoricalCandles.slice(0, this.replayIndex);
    this.publishDataSourceState(Date.now());
    this.analyzeMarket();
    this.requestRender();
    if (this.onReplayUpdate) {
      this.onReplayUpdate({ isReplay: true, isPlaying: false, index: this.replayIndex, total: this.fullHistoricalCandles.length });
    }
  }

  stepReplay(step = 1) {
    if (!this.isReplayMode || !this.fullHistoricalCandles || this.fullHistoricalCandles.length === 0) return;
    const newIdx = Math.min(this.fullHistoricalCandles.length, Math.max(15, this.replayIndex + step));
    this.replayIndex = newIdx;
    this.candles = this.fullHistoricalCandles.slice(0, this.replayIndex);
    this.analyzeMarket();
    this.requestRender();
    if (this.replayIndex >= this.fullHistoricalCandles.length) this.stopReplayPlayback();
    if (this.onReplayUpdate) {
      this.onReplayUpdate({ isReplay: true, isPlaying: Boolean(this.replayInterval), index: this.replayIndex, total: this.fullHistoricalCandles.length });
    }
  }

  seekReplay(index) {
    if (!this.isReplayMode || !this.fullHistoricalCandles || this.fullHistoricalCandles.length === 0) return;
    this.replayIndex = Math.min(this.fullHistoricalCandles.length, Math.max(15, Number(index)));
    this.candles = this.fullHistoricalCandles.slice(0, this.replayIndex);
    this.analyzeMarket();
    this.requestRender();
    if (this.onReplayUpdate) {
      this.onReplayUpdate({ isReplay: true, isPlaying: Boolean(this.replayInterval), index: this.replayIndex, total: this.fullHistoricalCandles.length });
    }
  }

  toggleReplayPlayback() {
    if (!this.isReplayMode) this.startReplay();
    if (!this.isReplayMode) return false;
    if (this.replayInterval) {
      this.stopReplayPlayback();
      return false;
    }
    this.replayInterval = setInterval(() => this.stepReplay(1), Math.max(100, 750 / this.replaySpeed));
    if (this.onReplayUpdate) {
      this.onReplayUpdate({ isReplay: true, isPlaying: true, index: this.replayIndex, total: this.fullHistoricalCandles.length });
    }
    return true;
  }

  stopReplayPlayback() {
    if (this.replayInterval) clearInterval(this.replayInterval);
    this.replayInterval = null;
  }

  exitReplay() {
    this.isReplayMode = false;
    this.stopReplayPlayback();
    if (this.fullHistoricalCandles && this.fullHistoricalCandles.length > 0) {
      this.candles = [...this.fullHistoricalCandles];
    }
    this.publishDataSourceState(Date.now());
    this.analyzeMarket();
    this.requestRender();
    if (this.marketDataRefreshWasEnabledBeforeReplay) {
      this.marketDataRefreshWasEnabledBeforeReplay = false;
      this.startMarketDataRefreshLoop({ immediate: true });
    }
    if (this.onReplayUpdate) {
      this.onReplayUpdate({ isReplay: false, isPlaying: false, index: this.candles.length, total: this.candles.length });
    }
  }

  getAIProfileDetails() {
    const samples = this.aiStats.samplesStudied || 0;
    const level = Math.min(10, Math.floor(samples / 700) + 1);
    this.aiStats.adaptationLevel = level;
    const wins = this.aiStats.wins || 0;
    const losses = this.aiStats.losses || 0;

    const rankTitles = {
      1: 'LEVEL 1 // HEURISTIC ROOKIE',
      2: 'LEVEL 2 // SMC PATTERN APPRENTICE',
      3: 'LEVEL 3 // SMC ORDERFLOW OPERATOR',
      4: 'LEVEL 4 // QUANTUM CONFLUENCE SPECIALIST',
      5: 'LEVEL 5 // MASTER QUANT SMC ARCHITECT',
      6: 'LEVEL 6 // INSTITUTIONAL LIQUIDITY SNIPER',
      7: 'LEVEL 7 // ALPHA RULE OPERATOR',
      8: 'LEVEL 8 // MULTI-ASSET PORTFOLIO STRATEGIST',
      9: 'LEVEL 9 // HIGH-FREQUENCY SMC ENGINE',
      10: 'LEVEL 10 // APEX PAPER-QUANT RULE ENGINE'
    };

    const rankTitle = rankTitles[level] || `LEVEL ${level} // ADAPTIVE QUANT RULE ENGINE`;
    const xpPerLevel = 700;
    const xpCurrent = samples % xpPerLevel;
    const xpPercent = Math.min(100, Math.round((xpCurrent / xpPerLevel) * 100));

    const grossProfit = this.aiJournal.reduce((sum, trade) => sum + Math.max(0, Number(trade?.pnlUSD) || 0), 0);
    const grossLoss = this.aiJournal.reduce((sum, trade) => sum + Math.abs(Math.min(0, Number(trade?.pnlUSD) || 0)), 0);
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : 'N/A';
    const strategyEntries = Object.values(this.strategyWeights);
    const observedStrategies = strategyEntries.filter(data => (Number(data?.wins) || 0) + (Number(data?.losses) || 0) > 0).length;
    const strategyCoverage = strategyEntries.length > 0 ? `${((observedStrategies / strategyEntries.length) * 100).toFixed(1)}%` : '0.0%';
    const journalText = JSON.stringify(this.aiJournal);
    const journalBytes = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(journalText).length : journalText.length;
    const journalSize = `${(journalBytes / 1024).toFixed(1)} KB`;

    const skills = Object.entries(this.strategyWeights).map(([name, data]) => {
      const observations = (Number(data?.wins) || 0) + (Number(data?.losses) || 0);
      const isObserved = observations > 0;
      const isHigh = isObserved && data.winRate >= 75;
      const isLow = isObserved && data.winRate < 50;
      return {
        name,
        observations,
        winRate: isObserved ? data.winRate : null,
        weight: data.weightMultiplier,
        status: !isObserved ? 'UNOBSERVED' : isHigh ? 'PAPER LEADING' : isLow ? 'PAPER CAUTION' : 'PAPER OBSERVED',
        statusClass: !isObserved ? 'skill-unobserved' : isHigh ? 'skill-mastered' : isLow ? 'skill-caution' : 'skill-active'
      };
    });

    return {
      level,
      rankTitle,
      xpCurrent,
      xpNext: xpPerLevel,
      xpPercent,
      samplesStudied: samples,
      profitFactor,
      strategyCoverage,
      journalSize,
      skills,
      riskAppetite: this.riskAppetite,
      goldenRules: this.getGoldenRules(),
      setupMastery: this.getSetupMastery(),
      winRate: this.aiStats.winRate,
      totalTrades: this.aiStats.totalTrades,
      netPnlUSD: this.aiStats.netPnlUSD
    };
  }

  setRiskAppetite(mode = 'balanced') {
    if (['conservative', 'balanced', 'alpha_hunter'].includes(mode)) {
      this.riskAppetite = mode;
      this.saveGymState();
      this.analyzeMarket();
      if (this.onAIProfileUpdate) this.onAIProfileUpdate(this.getAIProfileDetails());
    }
  }

  getGoldenRules() {
    return extractGoldenRulesFromJournal(this.aiJournal);
  }

  getSetupMastery() {
    return Object.entries(this.strategyWeights || {}).map(([name, data]) => {
      const count = (Number(data?.wins) || 0) + (Number(data?.losses) || 0);
      return Object.freeze({
        name,
        mastery: null,
        count,
        winRate: count > 0 ? Number(data?.winRate) || 0 : null,
        calibrated: false,
        status: count > 0 ? 'PAPER OBSERVED / UNVALIDATED' : 'UNOBSERVED'
      });
    });
  }

  startKnowledgeStreamLoop() {
    if (this.knowledgeStreamInterval) clearInterval(this.knowledgeStreamInterval);
    this.knowledgeLogs = this.knowledgeFeed.map(item => ({ ...item }));
    this.knowledgeIndex = 0;

    this.knowledgeStreamInterval = setInterval(() => {
      this.cycleKnowledgeStream();
    }, 4000);

    if (this.onKnowledgeStreamUpdate) {
      this.onKnowledgeStreamUpdate(this.knowledgeLogs, this.knowledgeLogs[0]);
    }
  }

  cycleKnowledgeStream() {
    this.knowledgeIndex = (this.knowledgeIndex + 1) % this.knowledgeFeed.length;
    const currentIntel = this.knowledgeFeed[this.knowledgeIndex];
    
    const liveLog = {
      id: 'intel_' + Date.now().toString(36),
      category: currentIntel.category,
      badge: currentIntel.badge,
      source: currentIntel.source,
      text: currentIntel.text,
      impactFactor: currentIntel.impactFactor,
      timestamp: new Date().toLocaleTimeString(),
      provenance: 'SIMULATED_REFERENCE'
    };

    this.knowledgeLogs.unshift(liveLog);
    if (this.knowledgeLogs.length > 20) this.knowledgeLogs.length = 20;

    if (this.onKnowledgeStreamUpdate) {
      this.onKnowledgeStreamUpdate(this.knowledgeLogs, liveLog);
    }
  }

  seedInitialAIJournal() {
    // Fabricated starter trades are intentionally disabled. Evidence begins at zero.
    return false;
  }

  async init() {
    await this.loadCandles();
    this.setupCanvasInteractions();
    this.setupResizeObserver();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.startLiveTickStream();
    this.startNewsStream();
    this.startKnowledgeStreamLoop();
    this.startMT5BackgroundStream();
    this.startMarketDataRefreshLoop({ immediate: false });
    if (this.onAIProfileUpdate) this.onAIProfileUpdate(this.getAIProfileDetails());
  }

  destroy() {
    this.pauseStreams();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.resizeObserver = null;
  }

  pauseStreams() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.newsInterval) clearInterval(this.newsInterval);
    if (this.knowledgeStreamInterval) clearInterval(this.knowledgeStreamInterval);
    if (this.mt5PollingInterval) clearInterval(this.mt5PollingInterval);
    this.mt5StreamGeneration += 1;
    this.patternResearchGeneration += 1;
    if (this.replayInterval) clearInterval(this.replayInterval);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.stopMarketDataRefreshLoop({ invalidate: true });
    this.pauseLiveAutoExecution();
    this.tickInterval = null;
    this.newsInterval = null;
    this.knowledgeStreamInterval = null;
    this.mt5PollingInterval = null;
    this.replayInterval = null;
    this.animFrameId = null;
  }

  resumeStreams() {
    this.startLiveTickStream();
    this.startNewsStream();
    this.startKnowledgeStreamLoop();
    this.startMT5BackgroundStream();
    this.startMarketDataRefreshLoop({ immediate: true });
  }

  async setMarket(marketType) {
    if (marketType !== MARKET_TYPES.BINANCE && marketType !== MARKET_TYPES.XM) return;
    this.activeMarket = marketType;
    const firstAssetOfMarket = TRADING_ASSETS.find(a => a.market === marketType) || TRADING_ASSETS[0];
    await this.setAsset(firstAssetOfMarket.id);
  }

  async setAsset(assetId) {
    const asset = TRADING_ASSETS.find(a => a.id === assetId || a.id.toLowerCase() === assetId.toLowerCase() || (a.id.includes('XAU') && (assetId.toLowerCase().includes('gold') || assetId.toLowerCase().includes('xau'))));
    if (!asset) return;
    this.activeAsset = asset;
    this.activeMarket = asset.market || MARKET_TYPES.BINANCE;
    await this.loadCandles();
    this.requestRender();
  }

  async setTimeframe(tfId) {
    const tf = TIMEFRAMES.find(t => t.id === tfId);
    if (!tf) return;
    this.activeTimeframe = tf;
    await this.loadCandles();
    this.requestRender();
  }

  async loadCandles() {
    this.clearMarketDataRefreshTimer();
    const generation = ++this.marketDataStreamGeneration;
    const adapterSupported = hasVerifiedMarketDataAdapter(this.activeAsset.id);
    this.marketPacket = null;
    this.candles = [];
    this.fullHistoricalCandles = [];
    this.isRealFeed = false;
    this.marketDataActiveRequest = null;
    this.marketDataHealth = createMarketDataHealth({
      symbol: this.activeAsset.id,
      timeframe: this.activeTimeframe.id,
      adapterSupported,
      now: Date.now()
    });
    this.lastDataSourceStateKey = null;
    this.publishDataSourceState(Date.now());
    return this.refreshMarketDataSnapshot({ generation, allowSimulationFallback: true });
  }

  startNewsStream() {
    if (this.newsInterval) clearInterval(this.newsInterval);
    this.newsInterval = setInterval(() => {
      this.rotateNextNews();
    }, 12000);
  }

  rotateNextNews() {
    this.newsIndex = (this.newsIndex + 1) % this.newsList.length;
    this.activeNews = this.newsList[this.newsIndex];
    this.analyzeMarket();
    if (this.onNewsUpdate) {
      this.onNewsUpdate(this.activeNews);
    }
  }

  generateHistoricalCandles() {
    this.candles = [];
    let price = this.activeAsset.basePrice;
    const count = this.activeTimeframe.candleCount;
    const now = Math.floor(Date.now() / 1000);
    const stepSecs = this.activeTimeframe.seconds;

    // Generate smooth realistic random walk with trend & momentum
    let trend = (Math.random() - 0.45) * 0.002;
    const volatility = 0.008;

    for (let i = count; i >= 0; i--) {
      const time = now - i * stepSecs;
      trend += (Math.random() - 0.5) * 0.001;
      const changePercent = trend + (Math.random() - 0.5) * volatility;

      const open = price;
      const close = Number((open * (1 + changePercent)).toFixed(this.activeAsset.digits));
      const high = Number((Math.max(open, close) + Math.random() * open * 0.005).toFixed(this.activeAsset.digits));
      const low = Number((Math.min(open, close) - Math.random() * open * 0.005).toFixed(this.activeAsset.digits));
      const volume = Math.round(500 + Math.random() * 4500);

      this.candles.push({ time, open, high, low, close, volume });
      price = close;
    }
  }

  startLiveTickStream() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      this.simulateLiveTick();
    }, 1200);
  }

  simulateLiveTick() {
    if (this.isReplayMode || this.candles.length === 0) return;
    if (this.marketPacket?.provenance?.simulation !== true) {
      const eligibilityChanged = this.publishDataSourceState(Date.now());
      if (eligibilityChanged) this.analyzeMarket();
      this.updatePositionPnL();
      this.requestRender();
      return;
    }
    const last = this.candles[this.candles.length - 1];
    const delta = (Math.random() - 0.49) * (last.close * 0.0018);
    const newClose = Number((last.close + delta).toFixed(this.activeAsset.digits));

    last.close = newClose;
    last.high = Math.max(last.high, newClose);
    last.low = Math.min(last.low, newClose);
    // Calculate real-time dynamic spread
    this.currentSpreadInfo = calculateDynamicSpread(this.activeAsset, newClose, last, this.activeNews);
    if (this.onSpreadUpdate) {
      this.onSpreadUpdate(this.currentSpreadInfo);
    }

    // 1. Update Manual Paper Trading Positions
    this.updatePositionPnL();

    // Legacy automatic scenarios are display-only and have no decision authority.
    // Recompute a blocked simulation signal for chart exploration only.
    this.analyzeMarket();
    this.requestRender();
  }

  analyzeMarket() {
    const marketDecisionState = this.getMarketDecisionState(Date.now());
    const canonicalClosedCandles = this.getDecisionCandles();
    const analysisCandles = this.isReplayMode
      ? this.candles
      : canonicalClosedCandles.length > 0
        ? canonicalClosedCandles
        : this.candles;
    this.patterns = detectChartPatterns(analysisCandles);
    const rawSignal = generateAISignal(analysisCandles, this.activeAsset, this.patterns, this.activeNews, this.strategyWeights, this.currentSpreadInfo, this.mt5Data, this.riskAppetite);
    this.signal = Object.freeze({
      ...rawSignal,
      action: marketDecisionState.eligible ? rawSignal.action : 'DATA BLOCKED / NO TRADE',
      badgeClass: marketDecisionState.eligible ? rawSignal.badgeClass : 'signal-veto',
      rationale: marketDecisionState.eligible
        ? rawSignal.rationale
        : `[MARKET SOURCE GUARD]: ไม่มีอำนาจตัดสินใจ (${marketDecisionState.reasons.join(', ') || 'UNVERIFIED_DATA'}) ข้อมูลนี้แสดงเพื่อ Simulation/Inspection เท่านั้น`,
      patterns: Object.freeze(this.patterns.map(pattern => Object.freeze({ ...pattern }))),
      marketRegime: rawSignal.regime?.label || 'UNKNOWN',
      marketDataState: marketDecisionState
    });
    const modelMatchesActiveMarket = this.mlShadowModel?.dataProvenance?.assetId === this.activeAsset.id
      && this.mlShadowModel?.dataProvenance?.timeframe === this.activeTimeframe.id;
    this.mlShadowPrediction = modelMatchesActiveMarket
      ? predictMLDirection(this.mlShadowModel, canonicalClosedCandles)
      : null;
    if (this.onMLShadowUpdate) {
      this.onMLShadowUpdate({ model: this.mlShadowModel, report: this.mlShadowReport, prediction: this.mlShadowPrediction });
    }
    if (this.onSignalUpdate) {
      this.onSignalUpdate(this.signal);
    }
    if (this.onRegimeUpdate && this.signal.regime) {
      this.onRegimeUpdate(this.signal.regime);
    }
    if (this.onDebateUpdate && this.signal.ruleCountercheck) {
      this.onDebateUpdate(this.signal.ruleCountercheck);
    }
    if (this.verifiedPaperBotState?.enabled) this.evaluateVerifiedPaperBot();
  }

  // =========================================================================
  // AI AUTONOMOUS TRADING & POST-MORTEM ROOT CAUSE LEARNING SYSTEM
  // =========================================================================

  toggleAutoTrading(enabled) {
    this.isAutoTrading = false;
    if (enabled && this.toasts) {
      this.toasts.show('INFO', 'LEGACY AUTO SCENARIO HAS ZERO DECISION AUTHORITY — WAIT FOR VERIFIED PAPER BOT', 3200);
    }
    return false;
  }

  checkAutoTradeExecution() {
    return { success: false, reason: 'LEGACY_AUTO_SCENARIO_DECISION_AUTHORITY_DISABLED' };
  }

  evaluateAIPositions() {
    if (this.candles.length === 0 || this.aiPositions.length === 0) return;
    const curPrice = this.candles[this.candles.length - 1].close;

    for (let i = this.aiPositions.length - 1; i >= 0; i--) {
      const pos = this.aiPositions[i];
      pos.currentPrice = curPrice;

      let shouldClose = false;
      let exitReason = '';
      let isWin = false;

      if (pos.side === 'LONG') {
        if (curPrice >= pos.tp) {
          shouldClose = true;
          exitReason = 'TAKE_PROFIT_HIT';
          isWin = true;
        } else if (curPrice <= pos.sl) {
          shouldClose = true;
          exitReason = 'STOP_LOSS_HIT';
          isWin = false;
        }
      } else { // SHORT
        if (curPrice <= pos.tp) {
          shouldClose = true;
          exitReason = 'TAKE_PROFIT_HIT';
          isWin = true;
        } else if (curPrice >= pos.sl) {
          shouldClose = true;
          exitReason = 'STOP_LOSS_HIT';
          isWin = false;
        }
      }

      if (shouldClose) {
        const priceDiff = pos.side === 'LONG' ? curPrice - pos.entryPrice : pos.entryPrice - curPrice;
        const pnlPercent = (priceDiff / pos.entryPrice) * 100 * pos.leverage;
        const pnlUSD = (pos.amountUSD * pnlPercent) / 100;

        const tradeRecord = {
          id: pos.id,
          assetId: pos.assetId,
          side: pos.side,
          entryPrice: pos.entryPrice,
          exitPrice: curPrice,
          pnlUSD: Number(pnlUSD.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2)),
          isWin: isWin,
          setupName: pos.setupName,
          exitReason: exitReason,
          closeTime: new Date().toLocaleTimeString(),
          postMortem: isWin
            ? `รูปแบบ ${pos.setupName} ทำงานได้อย่างแม่นยำร่วมกับค่า RSI (${pos.entryRSI}) ราคาแตะเป้าหมาย Take Profit ($${pos.tp}) ได้สำเร็จตามที่ระบบคำนวณ`
            : `ราคาไม่สามารถผ่านแนวต้านจิตวิทยาได้ เกิดสัญญาณ False Breakout และมีแรงเทขายสวนทางจนหลุดแนวรับ Stop Loss ($${pos.sl})`,
          learningLesson: isWin
            ? `✅ ปรับเพิ่มค่าน้ำหนักโมเดล (Reward Weight +15%): บันทึกความสัมพันธ์ของ ${pos.setupName} ในสภาวะตลาดแบบ Trend Following`
            : `❌ ถอดบทเรียนความผิดพลาด (Penalty Applied): ห้ามเข้าออเดอร์ในแท่งที่อยู่ห่างเส้น EMA มากเกินไป และต้องรอแท่งเทียนยืนยันปิดเหนือแนวรับ-ต้านก่อนเสมอ`
        };

        // Update AI Overall Stats
        this.aiStats.totalTrades++;
        if (isWin) this.aiStats.wins++;
        else this.aiStats.losses++;
        this.aiStats.winRate = Number(((this.aiStats.wins / this.aiStats.totalTrades) * 100).toFixed(1));
        this.aiStats.netPnlUSD += tradeRecord.pnlUSD;
        this.aiStats.samplesStudied += 25;
        this.aiStats.adaptationLevel = Math.min(10, Math.floor(this.aiStats.samplesStudied / 700) + 1);

        this.aiJournal.unshift(tradeRecord);
        if (this.aiJournal.length > 50) this.aiJournal.pop();

        this.aiPositions.splice(i, 1);
        this.saveGymState();

        if (this.onAIStatsUpdate) this.onAIStatsUpdate(this.aiStats);
        if (this.onAIJournalUpdate) this.onAIJournalUpdate(this.aiJournal);
        if (this.onAIProfileUpdate) this.onAIProfileUpdate(this.getAIProfileDetails());
      }
    }
  }

  // Fast-Training Simulation Drill (Runs 25 accelerated training runs)
  runFastTrainingDrill() {
    if (this.toasts) {
      this.toasts.show('INFO', 'SYNTHETIC FAST-TRAIN DISABLED — RANDOM RESULTS CANNOT UPDATE TRADE KNOWLEDGE', 3200);
    }
    return { success: false, reason: 'SYNTHETIC_LEARNING_AUTHORITY_DISABLED' };
  }

  updateStrategyWeight(setupName, isWin, lesson) {
    if (!setupName) return;
    const matchKey = Object.keys(this.strategyWeights).find(k => setupName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(setupName.toLowerCase()));
    const key = matchKey || setupName;

    if (!this.strategyWeights[key]) {
      this.strategyWeights[key] = { wins: 0, losses: 0, winRate: 50.0, weightMultiplier: 1.0, lastLesson: lesson || '' };
    }

    const item = this.strategyWeights[key];
    if (isWin) item.wins++;
    else item.losses++;

    const total = item.wins + item.losses;
    item.winRate = Number(((item.wins / total) * 100).toFixed(1));
    item.weightMultiplier = Number(Math.max(0.4, Math.min(1.6, item.winRate / 60)).toFixed(2));
    if (lesson) item.lastLesson = lesson;

    this.saveGymState();
  }

  resetAIMemory() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.getGymStorageKey());
      }
    } catch (e) {}

    this.strategyWeights = JSON.parse(JSON.stringify(DEFAULT_STRATEGY_WEIGHTS));
    this.aiStats = createZeroPaperGymStats();
    this.aiJournal = [];
    this.aiPositions = [];
    this.saveGymState();

    if (this.toasts) {
      this.toasts.show('INFO', '🔄 HEURISTIC WEIGHTS & PAPER JOURNAL RESET TO BASELINE', 2500);
    }

    if (this.onAIStatsUpdate) this.onAIStatsUpdate(this.aiStats);
    if (this.onAIJournalUpdate) this.onAIJournalUpdate(this.aiJournal);
    if (this.onAIProfileUpdate) this.onAIProfileUpdate(this.getAIProfileDetails());
  }

  setupCanvasInteractions() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      this.isHovering = true;
      this.requestRender();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isHovering = false;
      this.requestRender();
    });
  }

  setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined' && this.canvas && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 50 && entry.contentRect.height > 50) {
            this.resizeCanvas();
          }
        }
      });
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  requestRender() {
    if (this.animFrameId) return;
    this.animFrameId = requestAnimationFrame(() => {
      this.animFrameId = null;
      this.render();
    });
  }

  resizeCanvas() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    this.dpr = dpr;

    if (this.canvas && this.canvas.parentElement) {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const cssW = Math.max(100, Math.floor(rect.width));
      const cssH = Math.max(100, Math.floor(rect.height));

      this.canvas.width = Math.floor(cssW * dpr);
      this.canvas.height = Math.floor(cssH * dpr);
      this.canvas.style.width = `${cssW}px`;
      this.canvas.style.height = `${cssH}px`;
      this.cssWidth = cssW;
      this.cssHeight = cssH;
    }

    if (this.subCanvas && this.subCanvas.parentElement) {
      const subRect = this.subCanvas.parentElement.getBoundingClientRect();
      const subCssW = Math.max(100, Math.floor(subRect.width));
      const subCssH = Math.max(40, Math.floor(subRect.height - 20));

      this.subCanvas.width = Math.floor(subCssW * dpr);
      this.subCanvas.height = Math.floor(subCssH * dpr);
      this.subCanvas.style.width = `${subCssW}px`;
      this.subCanvas.style.height = `${subCssH}px`;
      this.subCssWidth = subCssW;
      this.subCssHeight = subCssH;
    }

    this.requestRender();
  }

  render() {
    if (!this.canvas || !this.ctx || this.candles.length === 0) return;

    const ctx = this.ctx;
    const dpr = this.dpr || 1;
    const width = this.cssWidth || (this.canvas.width / dpr);
    const height = this.cssHeight || (this.canvas.height / dpr);

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const candles = this.candles;
    const candleCount = candles.length;
    const paddingRight = 75;
    const paddingBottom = 22;
    const paddingTop = 26;
    const chartWidth = width - paddingRight;
    const chartHeight = height - paddingBottom - paddingTop;

    // Calculate Price Min & Max with generous padding
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVol = 0;

    candles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    const pMargin = (maxPrice - minPrice) * 0.08 || 1;
    minPrice -= pMargin;
    maxPrice += pMargin;

    const priceRange = maxPrice - minPrice || 1;
    const candleSpacing = chartWidth / candleCount;
    const candleWidth = Math.max(3, candleSpacing * 0.72);

    const getY = (price) => paddingTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    const getX = (index) => index * candleSpacing + candleSpacing / 2;

    // 0. Watermark Asset Identifier
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.font = '900 42px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.activeAsset.id} • ${this.activeTimeframe.label}`, chartWidth / 2, height / 2);

    // 1. Grid Lines & Price Axis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';

    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const p = minPrice + (priceRange / steps) * i;
      const y = Math.round(getY(p)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();
      ctx.fillText(p.toFixed(this.activeAsset.digits), chartWidth + 6, y + 3.5);
    }

    // 2. Volume Bars with clear contrast
    if (this.showVolume) {
      const volHeightMax = chartHeight * 0.22;
      candles.forEach((c, idx) => {
        const x = getX(idx);
        const vH = (c.volume / (maxVol || 1)) * volHeightMax;
        const y = height - paddingBottom - vH;
        ctx.fillStyle = c.close >= c.open ? 'rgba(0, 255, 136, 0.25)' : 'rgba(255, 51, 85, 0.25)';
        ctx.fillRect(Math.round(x - candleWidth / 2), Math.round(y), Math.round(candleWidth), Math.round(vH));
      });
    }

    // 3. Bollinger Bands (Cached or Calculated)
    if (this.showBollinger) {
      const bb = calculateBollingerBands(candles, 20, 2);
      ctx.beginPath();
      let hasStarted = false;
      for (let i = 0; i < candleCount; i++) {
        if (bb.upper[i] !== null) {
          const x = getX(i);
          const y = getY(bb.upper[i]);
          if (!hasStarted) { ctx.moveTo(x, y); hasStarted = true; }
          else ctx.lineTo(x, y);
        }
      }
      for (let i = candleCount - 1; i >= 0; i--) {
        if (bb.lower[i] !== null) {
          const x = getX(i);
          const y = getY(bb.lower[i]);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.04)';
      ctx.fill();

      // Band Outline Strokes
      ['upper', 'lower'].forEach(band => {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        let started = false;
        for (let i = 0; i < candleCount; i++) {
          if (bb[band][i] !== null) {
            const x = getX(i);
            const y = getY(bb[band][i]);
            if (!started) { ctx.moveTo(x, y); started = true; }
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // 4. EMA Ribbon Curves (EMA 20 & EMA 50)
    if (this.showEMA) {
      const ema20 = calculateEMA(candles, 20);
      const ema50 = calculateEMA(candles, 50);

      // EMA 20 (Cyan Neon)
      ctx.beginPath();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.6;
      let start20 = false;
      for (let i = 0; i < candleCount; i++) {
        if (ema20[i] !== null) {
          const x = getX(i);
          const y = getY(ema20[i]);
          if (!start20) { ctx.moveTo(x, y); start20 = true; }
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // EMA 50 (Gold Amber)
      ctx.beginPath();
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 1.6;
      let start50 = false;
      for (let i = 0; i < candleCount; i++) {
        if (ema50[i] !== null) {
          const x = getX(i);
          const y = getY(ema50[i]);
          if (!start50) { ctx.moveTo(x, y); start50 = true; }
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // 5. Candlesticks (Vibrant & Sharp)
    candles.forEach((c, idx) => {
      const x = Math.round(getX(idx));
      const isGreen = c.close >= c.open;
      const bodyColor = isGreen ? '#00ff88' : '#ff3355';

      // Wick (Crisp 1.5px line)
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, Math.round(getY(c.high)));
      ctx.lineTo(x + 0.5, Math.round(getY(c.low)));
      ctx.stroke();

      // Body (Crisp solid rect)
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const topY = Math.round(Math.min(openY, closeY));
      const bodyH = Math.max(2, Math.round(Math.abs(closeY - openY)));

      ctx.fillStyle = bodyColor;
      ctx.fillRect(Math.round(x - candleWidth / 2), topY, Math.round(candleWidth), bodyH);
    });

    // 6. Current Live Price Horizontal Tracking Line & Badge
    const lastCandle = candles[candleCount - 1];
    const currentPrice = lastCandle.close;
    const currentY = Math.round(getY(currentPrice)) + 0.5;
    const isLiveUp = lastCandle.close >= lastCandle.open;
    const liveColor = isLiveUp ? '#00ff88' : '#ff3355';

    ctx.strokeStyle = liveColor;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(chartWidth, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live Price Pill on Axis
    ctx.fillStyle = liveColor;
    ctx.fillRect(chartWidth + 2, currentY - 9, paddingRight - 4, 18);
    ctx.fillStyle = '#000000';
    ctx.font = '900 10.5px "JetBrains Mono", monospace';
    ctx.fillText(currentPrice.toFixed(this.activeAsset.digits), chartWidth + 6, currentY + 3.5);

    // 7. Top Banner OHLCV Stats
    const activeCandle = (this.isHovering && this.mouseX >= 0 && this.mouseX <= chartWidth)
      ? candles[Math.min(candleCount - 1, Math.max(0, Math.floor(this.mouseX / candleSpacing)))]
      : lastCandle;

    if (activeCandle) {
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      const isUp = activeCandle.close >= activeCandle.open;
      const cColor = isUp ? '#00ff88' : '#ff3355';

      ctx.fillStyle = '#64748b';
      ctx.fillText('O:', 14, 15);
      ctx.fillStyle = cColor;
      ctx.fillText(activeCandle.open.toFixed(this.activeAsset.digits), 28, 15);

      ctx.fillStyle = '#64748b';
      ctx.fillText('H:', 95, 15);
      ctx.fillStyle = cColor;
      ctx.fillText(activeCandle.high.toFixed(this.activeAsset.digits), 108, 15);

      ctx.fillStyle = '#64748b';
      ctx.fillText('L:', 175, 15);
      ctx.fillStyle = cColor;
      ctx.fillText(activeCandle.low.toFixed(this.activeAsset.digits), 188, 15);

      ctx.fillStyle = '#64748b';
      ctx.fillText('C:', 255, 15);
      ctx.fillStyle = cColor;
      ctx.fillText(activeCandle.close.toFixed(this.activeAsset.digits), 268, 15);

      ctx.fillStyle = '#64748b';
      ctx.fillText('Vol:', 335, 15);
      ctx.fillStyle = '#00e5ff';
      ctx.fillText(activeCandle.volume.toString(), 362, 15);
    }

    // 8. Interactive Crosshair & Tooltip
    if (this.isHovering && this.mouseX >= 0 && this.mouseX <= chartWidth) {
      // Vertical & Horizontal Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(Math.round(this.mouseX) + 0.5, 0);
      ctx.lineTo(Math.round(this.mouseX) + 0.5, height - paddingBottom);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, Math.round(this.mouseY) + 0.5);
      ctx.lineTo(chartWidth, Math.round(this.mouseY) + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      // Hover Price Tag on Right Axis
      const hoverPrice = minPrice + ((chartHeight - (this.mouseY - paddingTop)) / chartHeight) * priceRange;
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(chartWidth + 2, this.mouseY - 9, paddingRight - 4, 18);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(hoverPrice.toFixed(this.activeAsset.digits), chartWidth + 6, this.mouseY + 3.5);
    }

    ctx.restore();

    // Render Sub-Chart (RSI)
    this.renderSubChart();
  }

  renderSubChart() {
    if (!this.subCanvas || !this.subCtx || this.candles.length === 0) return;
    const ctx = this.subCtx;
    const dpr = this.dpr || 1;
    const width = this.subCssWidth || (this.subCanvas.width / dpr);
    const height = this.subCssHeight || (this.subCanvas.height / dpr);

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const candleCount = this.candles.length;
    const paddingRight = 75;
    const chartWidth = width - paddingRight;
    const candleSpacing = chartWidth / candleCount;
    const getX = (index) => index * candleSpacing + candleSpacing / 2;

    if (this.subChartMode === 'RSI') {
      const rsi = calculateRSI(this.candles, 14);
      const getY = (val) => height - 10 - (val / 100) * (height - 20);

      // Shaded Oversold / Overbought Zone (30 to 70)
      ctx.fillStyle = 'rgba(192, 132, 252, 0.05)';
      ctx.fillRect(0, getY(70), chartWidth, getY(30) - getY(70));

      // Grid Levels
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      [70, 50, 30].forEach(level => {
        const y = Math.round(getY(level)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();
        ctx.fillStyle = '#64748b';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(level.toString(), chartWidth + 6, y + 3);
      });
      ctx.setLineDash([]);

      // RSI Curve
      ctx.beginPath();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.8;
      let rsiStarted = false;
      for (let i = 0; i < candleCount; i++) {
        if (rsi[i] !== null) {
          const x = getX(i);
          const y = getY(rsi[i]);
          if (!rsiStarted) { ctx.moveTo(x, y); rsiStarted = true; }
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Legend & Current Value Badge
      const curRsi = rsi[rsi.length - 1] || 50;
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`RSI (14): ${curRsi}`, 10, 14);
    }

    ctx.restore();
  }

  // Paper Trading Operations
  createPaperDecisionSnapshot() {
    const lastCandle = this.getDecisionCandles().at(-1) || null;
    const marketState = summarizeMarketPacket(this.marketPacket, { now: Date.now() });
    const marketDecision = this.getMarketDecisionState(Date.now());
    return {
      action: this.signal?.action || 'MANUAL_ORDER_NO_SIGNAL',
      ruleScore: this.signal?.ruleScore ?? null,
      targetScoreMethod: this.signal?.targetScore?.method || null,
      newsAccepted: this.signal?.decisionNewsPolicy?.accepted === true,
      memoryAccepted: this.signal?.decisionMemoryPolicy?.accepted === true,
      feedMode: marketState.isRealFeed ? 'REAL_MARKET_FEED' : (this.activeAsset?.dataMode || 'SIMULATED_OR_UNKNOWN_FEED'),
      marketPacketSchema: marketState.schemaVersion,
      marketPacketSequence: marketState.packetSequence,
      marketRequestId: marketState.requestId,
      marketSource: marketState.source,
      marketQuality: marketState.quality,
      marketHealthStatus: this.marketDataHealth?.status || 'NOT_STARTED',
      marketDecisionEligible: marketDecision.eligible,
      marketDecisionReasons: marketDecision.reasons.join('|'),
      dataAgeMs: marketDecision.dataAgeMs,
      candleTime: lastCandle?.time ?? null
    };
  }

  recordPaperExecutionAudit(rawEvent) {
    if (!Array.isArray(this.executionAudit)) this.executionAudit = [];
    const nextSequence = (Number(this.paperAuditSequence) || 0) + 1;
    this.paperAuditSequence = nextSequence;
    const event = createPaperExecutionAuditEvent({
      ...rawEvent,
      eventId: rawEvent?.eventId || `PAPER_AUD_${Date.now().toString(36)}_${nextSequence}`,
      at: rawEvent?.at || new Date().toISOString(),
      decision: rawEvent?.decision || this.createPaperDecisionSnapshot()
    });
    if (!event) return null;
    this.executionAudit.unshift(event);
    if (this.executionAudit.length > 250) this.executionAudit.length = 250;
    return event;
  }

  rejectPaperOpen(reason, context = {}) {
    this.recordPaperExecutionAudit({
      eventType: 'OPEN_REJECTED',
      reason,
      riskGateReason: context.riskGateReason || reason,
      executionSource: context.executionSource,
      assetId: this.activeAsset?.id,
      side: context.side,
      marginUSD: context.marginUSD,
      decision: context.decision || null
    });
    this.saveGymState();
    return { success: false, reason };
  }

  openPosition(side = 'LONG', amountUSD = 1000, executionSource = 'MANUAL_PAPER', decisionContext = null) {
    const normalizedExecutionSource = ['RULE_AUTO_PAPER', 'VERIFIED_PAPER_BOT'].includes(executionSource)
      ? executionSource
      : 'MANUAL_PAPER';
    const marketDecisionState = this.getMarketDecisionState(Date.now());
    if (!marketDecisionState.eligible) {
      const guardReason = marketDecisionState.reasons.join('|') || 'MARKET_DATA_NOT_DECISION_ELIGIBLE';
      if (this.toasts) this.toasts.show('ERROR', `PAPER DATA GUARD: ${guardReason}`, 2800);
      return this.rejectPaperOpen('MARKET_DATA_NOT_DECISION_ELIGIBLE', {
        side,
        marginUSD: amountUSD,
        executionSource: normalizedExecutionSource,
        riskGateReason: guardReason,
        decision: decisionContext
      });
    }
    if (this.candles.length === 0) return this.rejectPaperOpen('NO_MARKET_DATA', { side, marginUSD: amountUSD, executionSource: normalizedExecutionSource, decision: decisionContext });
    const currentPrice = this.candles[this.candles.length - 1].close;
    const spreadInfo = this.currentSpreadInfo || calculateDynamicSpread(this.activeAsset, currentPrice, this.candles[this.candles.length - 1], this.activeNews);

    const marginUSD = Number(amountUSD);
    const riskConfig = this.paperRiskConfig || { maxPositions: 3, maxUsedMarginPercent: 50, minimumRiskReward: 1.5 };
    const riskGate = evaluatePaperOpenRisk({
      balanceUSD: this.paperBalanceUSD,
      positions: this.positions,
      requestedMarginUSD: marginUSD,
      maxPositions: riskConfig.maxPositions,
      maxUsedMarginPercent: riskConfig.maxUsedMarginPercent
    });
    if (!riskGate.allowed) {
      if (this.toasts) this.toasts.show('ERROR', `PAPER RISK GATE: ${riskGate.reason}`, 2200);
      return this.rejectPaperOpen(riskGate.reason, { side, marginUSD, executionSource: normalizedExecutionSource, riskGateReason: riskGate.reason, decision: decisionContext });
    }

    const isLong = side.toUpperCase() === 'LONG';
    const executionPrice = isLong ? spreadInfo.askPrice : spreadInfo.bidPrice;
    const protectiveOrders = deriveProtectiveOrders({
      side,
      entryPrice: executionPrice,
      signal: this.signal ? { ...this.signal, digits: this.activeAsset.digits } : null,
      spreadValue: spreadInfo.spreadValue,
      minimumRiskReward: riskConfig.minimumRiskReward
    });
    if (!protectiveOrders) {
      if (this.toasts) this.toasts.show('ERROR', 'PAPER RISK GATE: INVALID PROTECTIVE ORDERS', 2200);
      return this.rejectPaperOpen('INVALID_PROTECTIVE_ORDERS', { side, marginUSD, executionSource: normalizedExecutionSource, decision: decisionContext });
    }

    const basePosition = createPaperPosition({
      id: 'POS_' + Date.now().toString(36),
      assetId: this.activeAsset.id,
      side,
      entryPrice: executionPrice,
      marginUSD,
      leverage: Math.min(this.leverage, this.activeAsset.leverageMax || this.leverage),
      openedAt: new Date().toISOString(),
      spreadAtOpen: spreadInfo.spreadFormatted,
      sl: protectiveOrders.stopPrice,
      tp: protectiveOrders.targetPrice
    });
    const immediateExitPrice = isLong ? spreadInfo.bidPrice : spreadInfo.askPrice;
    const markedPosition = markPaperPosition(basePosition, immediateExitPrice);
    if (!markedPosition) return this.rejectPaperOpen('POSITION_MARK_FAILED', { side, marginUSD, executionSource: normalizedExecutionSource, decision: decisionContext });
    const pos = {
      ...markedPosition,
      executionSource: normalizedExecutionSource,
      protectiveOrderSource: protectiveOrders.source,
      riskRewardRatio: protectiveOrders.riskRewardRatio
    };
    this.positions.unshift(pos);
    const auditEvent = this.recordPaperExecutionAudit({
      eventType: 'OPEN_ACCEPTED',
      reason: 'RISK_GATE_CLEARED',
      riskGateReason: riskGate.reason,
      executionSource: normalizedExecutionSource,
      orderId: pos.id,
      assetId: pos.assetId,
      side: pos.side,
      marginUSD: pos.marginUSD,
      entryPrice: pos.entryPrice,
      exitPrice: pos.currentPrice,
      stopPrice: pos.sl,
      targetPrice: pos.tp,
      pnlUSD: pos.pnlUSD,
      balanceAfterUSD: this.paperBalanceUSD,
      decision: decisionContext
    });
    if (auditEvent) pos.decisionAuditId = auditEvent.eventId;
    this.saveGymState();

    if (this.sound && this.sound.playSuccessFanfare) this.sound.playSuccessFanfare();
    if (this.toasts) {
      this.toasts.show('INFO', `⚡ EXECUTED ${side} ${this.activeAsset.id} @ $${executionPrice} [Spread: ${spreadInfo.spreadFormatted}]`, 2800);
    }

    if (this.onPositionUpdate) this.onPositionUpdate(this.positions);
    if (this.onMoneyManagementUpdate) this.onMoneyManagementUpdate(this.getMoneyManagementDetails());
    return { success: true, position: pos, auditEvent };
  }

  closePosition(posId, exitReason = 'MANUAL_CLOSE') {
    const idx = this.positions.findIndex(p => p.id === posId);
    if (idx === -1) return { success: false, reason: 'POSITION_NOT_FOUND' };

    const pos = this.positions[idx];
    const settledBalance = settlePaperPosition(this.paperBalanceUSD, pos);
    if (settledBalance === null) return { success: false, reason: 'SETTLEMENT_FAILED' };
    this.paperBalanceUSD = settledBalance;

    pos.closedAt = new Date().toISOString();
    pos.closeTime = new Date(pos.closedAt).toLocaleTimeString();
    pos.exitReason = exitReason;
    this.tradeHistory.unshift({ ...pos });
    if (this.tradeHistory.length > 100) this.tradeHistory.length = 100;
    this.positions.splice(idx, 1);
    const auditEvent = this.recordPaperExecutionAudit({
      eventType: 'POSITION_CLOSED',
      reason: exitReason,
      executionSource: pos.executionSource,
      orderId: pos.id,
      assetId: pos.assetId,
      side: pos.side,
      marginUSD: pos.marginUSD,
      entryPrice: pos.entryPrice,
      exitPrice: pos.currentPrice,
      stopPrice: pos.sl,
      targetPrice: pos.tp,
      pnlUSD: pos.pnlUSD,
      balanceAfterUSD: this.paperBalanceUSD
    });
    this.saveGymState();

    if (this.sound && this.sound.playKey) this.sound.playKey(false);
    if (this.toasts) {
      this.toasts.show(pos.pnlUSD >= 0 ? 'SUCCESS' : 'ERROR', `POSITION CLOSED [${exitReason}]: PnL $${pos.pnlUSD.toFixed(2)} (${pos.pnlPercent.toFixed(2)}%)`, 2500);
    }

    if (this.onPositionUpdate) this.onPositionUpdate(this.positions);
    if (this.onMoneyManagementUpdate) this.onMoneyManagementUpdate(this.getMoneyManagementDetails());
    return { success: true, position: pos, balance: this.paperBalanceUSD, auditEvent };
  }

  updatePositionPnL() {
    if (this.candles.length === 0 || this.positions.length === 0) return;
    const lastCandle = this.candles[this.candles.length - 1];
    const spreadInfo = this.currentSpreadInfo || calculateDynamicSpread(this.activeAsset, lastCandle.close, lastCandle, this.activeNews);

    const automaticExits = [];
    this.positions = this.positions.map(pos => {
      if (pos.assetId !== this.activeAsset.id) return pos;
      // Long positions close at Bid; Short positions close at Ask
      const exitPrice = pos.side === 'LONG' ? spreadInfo.bidPrice : spreadInfo.askPrice;
      const marked = markPaperPosition(pos, exitPrice) || pos;
      const exitReason = evaluatePaperExit(marked);
      if (exitReason) automaticExits.push({ id: marked.id, reason: exitReason });
      return marked;
    });

    if (automaticExits.length > 0) {
      automaticExits.forEach(exit => this.closePosition(exit.id, exit.reason));
    } else {
      if (this.onPositionUpdate) this.onPositionUpdate(this.positions);
      if (this.onMoneyManagementUpdate) this.onMoneyManagementUpdate(this.getMoneyManagementDetails());
    }
  }
}

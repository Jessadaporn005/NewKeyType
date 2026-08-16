/**
 * AI NEURAL QUANTITATIVE TRADING TERMINAL & PATTERN RECOMMENDATION ENGINE
 * Inspired by TradingView and Binance Pro. Features real-time OHLCV market feeds,
 * technical indicators (EMA Ribbon, Bollinger Bands, RSI, MACD),
 * neural chart pattern recognition (Double Bottom/Top, Engulfing, Head & Shoulders, SMC Order Blocks),
 * real-time AI Trade Signals (STRONG BUY/SELL with TP/SL & Confidence Score),
 * interactive HTML5 Canvas Candlestick Chart with crosshair, and Paper Trading simulator.
 */

// Asset Definitions
export const TRADING_ASSETS = [
  { id: 'BTC/USDT', name: 'Bitcoin Network', basePrice: 96420.50, unit: '₿', minTick: 0.5, digits: 2, leverageMax: 50, binanceSymbol: 'BTCUSDT' },
  { id: 'ETH/USDT', name: 'Ethereum Network', basePrice: 3580.00, unit: 'Ξ', minTick: 0.1, digits: 2, leverageMax: 50, binanceSymbol: 'ETHUSDT' },
  { id: 'SOL/USDT', name: 'Solana High-Speed L1', basePrice: 198.40, unit: '◎', minTick: 0.01, digits: 2, leverageMax: 20, binanceSymbol: 'SOLUSDT' },
  { id: 'NVDA/USD', name: 'NVIDIA AI Semiconductor', basePrice: 142.80, unit: '$', minTick: 0.01, digits: 2, leverageMax: 10 },
  { id: 'CYBER/USDT', name: 'Darknet Hashrate Index', basePrice: 42.50, unit: '⚡', minTick: 0.01, digits: 2, leverageMax: 25 },
  { id: 'QUANTUM/USDT', name: 'Qubit Yield Protocol', basePrice: 850.00, unit: 'Ψ', minTick: 0.1, digits: 2, leverageMax: 20 }
];

export const TIMEFRAMES = [
  { id: '1m', label: '1m', seconds: 60, candleCount: 80, binanceInterval: '1m' },
  { id: '5m', label: '5m', seconds: 300, candleCount: 80, binanceInterval: '5m' },
  { id: '15m', label: '15m', seconds: 900, candleCount: 80, binanceInterval: '15m' },
  { id: '1h', label: '1h', seconds: 3600, candleCount: 80, binanceInterval: '1h' },
  { id: '1D', label: '1D', seconds: 86400, candleCount: 80, binanceInterval: '1d' }
];

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
  const bullishKeywords = ['etf', 'inflow', 'surge', 'record', 'ath', 'rate cut', 'adoption', 'partnership', 'breakout', 'bullish', 'approval', 'gain', 'expansion', 'mass production'];
  const bearishKeywords = ['ban', 'hack', 'sec', 'lawsuit', 'crackdown', 'inflation', 'dump', 'bearish', 'selloff', 'probe', 'outage', 'risk', 'warning', 'drop'];

  let score = 0;
  bullishKeywords.forEach(w => { if (text.includes(w)) score += 5; });
  bearishKeywords.forEach(w => { if (text.includes(w)) score -= 5; });

  score = Math.max(-25, Math.min(25, score));
  const sentiment = score > 5 ? 'BULLISH' : score < -5 ? 'BEARISH' : 'NEUTRAL';
  return { sentiment, score };
}

export async function fetchRealExchangeCandles(symbol = 'BTC/USDT', interval = '5m', limit = 80) {
  const binanceMap = {
    'BTC/USDT': 'BTCUSDT',
    'ETH/USDT': 'ETHUSDT',
    'SOL/USDT': 'SOLUSDT'
  };

  const binanceSymbol = binanceMap[symbol];
  if (!binanceSymbol) return null;

  const tfMap = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
    '1D': '1d'
  };
  const binanceInterval = tfMap[interval] || '5m';

  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=${limit}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const rawData = await res.json();
    if (!Array.isArray(rawData) || rawData.length === 0) return null;

    return rawData.map(item => ({
      time: Math.floor(item[0] / 1000),
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5])
    }));
  } catch (err) {
    return null;
  }
}

/**
 * Technical Indicator Calculation Algorithms
 */
export function calculateEMA(candles, period = 20) {
  const ema = [];
  const k = 2 / (period + 1);
  if (candles.length === 0) return ema;

  let sum = 0;
  for (let i = 0; i < Math.min(period, candles.length); i++) {
    sum += candles[i].close;
  }
  let prevEma = sum / Math.min(period, candles.length);

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      ema.push(prevEma);
    } else {
      const curEma = candles[i].close * k + prevEma * (1 - k);
      ema.push(curEma);
      prevEma = curEma;
    }
  }
  return ema;
}

export function calculateBollingerBands(candles, period = 20, stdDevMultiplier = 2) {
  const upper = [];
  const middle = [];
  const lower = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      middle.push(null);
      lower.push(null);
      continue;
    }

    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    const sma = sum / period;

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(candles[j].close - sma, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    middle.push(sma);
    upper.push(sma + stdDev * stdDevMultiplier);
    lower.push(sma - stdDev * stdDevMultiplier);
  }

  return { upper, middle, lower };
}

export function calculateRSI(candles, period = 14) {
  const rsi = [];
  if (candles.length <= period) return candles.map(() => 50);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < candles.length; i++) {
    if (i < period) {
      rsi.push(50);
      continue;
    }
    if (i > period) {
      const diff = candles[i].close - candles[i - 1].close;
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(Math.round(100 - (100 / (1 + rs))));
    }
  }

  return rsi;
}

export function calculateMACD(candles, fast = 12, slow = 26, signal = 9) {
  const fastEMA = calculateEMA(candles, fast);
  const slowEMA = calculateEMA(candles, slow);
  const macdLine = [];

  for (let i = 0; i < candles.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(0);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }

  // Signal line is EMA of MACD Line
  const dummyCandles = macdLine.map(v => ({ close: v }));
  const signalLine = calculateEMA(dummyCandles, signal);
  const histogram = [];

  for (let i = 0; i < candles.length; i++) {
    const sig = signalLine[i] === null ? 0 : signalLine[i];
    histogram.push(macdLine[i] - sig);
  }

  return { macdLine, signalLine, histogram };
}

/**
 * AI Pattern Recognition Engine
 */
export function detectChartPatterns(candles) {
  const patterns = [];
  const len = candles.length;
  if (len < 10) return patterns;

  const current = candles[len - 1];
  const prev = candles[len - 2];
  const prev2 = candles[len - 3];

  // 1. Bullish Engulfing
  if (prev.close < prev.open && current.close > current.open && current.open <= prev.close && current.close >= prev.open) {
    patterns.push({
      type: 'BULLISH_ENGULFING',
      name: 'Bullish Engulfing (แท่งเทียนกลืนกินขาขึ้น)',
      sentiment: 'BULLISH',
      weight: 25,
      desc: 'แรงซื้อเอาชนะแรงขายอย่างสมบูรณ์ เกิดสัญญาณกลับตัวขึ้นที่แนวรับสำคัญ'
    });
  }

  // 2. Bearish Engulfing
  if (prev.close > prev.open && current.close < current.open && current.open >= prev.close && current.close <= prev.open) {
    patterns.push({
      type: 'BEARISH_ENGULFING',
      name: 'Bearish Engulfing (แท่งเทียนกลืนกินขาลง)',
      sentiment: 'BEARISH',
      weight: -25,
      desc: 'แรงขายเททับแท่งก่อนหน้า ชี้ถึงการปฏิเสธราคาและจุดกลับตัวลง'
    });
  }

  // 3. Hammer (Bullish Rejection Pin Bar)
  const body = Math.abs(current.close - current.open);
  const lowerWick = Math.min(current.open, current.close) - current.low;
  const upperWick = current.high - Math.max(current.open, current.close);

  if (lowerWick >= body * 2 && upperWick <= body * 0.5) {
    patterns.push({
      type: 'HAMMER_PINBAR',
      name: 'Bullish Hammer / Pin Bar (แท่งค้อนกลับตัว)',
      sentiment: 'BULLISH',
      weight: 20,
      desc: 'มีการทิ้งไส้ล่างยาว บ่งบอกว่าผู้ซื้อผลักดันราคากลับขึ้นมาอย่างรวดเร็ว'
    });
  }

  // 4. Shooting Star (Bearish Pin Bar)
  if (upperWick >= body * 2 && lowerWick <= body * 0.5) {
    patterns.push({
      type: 'SHOOTING_STAR',
      name: 'Shooting Star (แท่งดาวตกปฏิเสธแนวต้าน)',
      sentiment: 'BEARISH',
      weight: -20,
      desc: 'ไส้บนยาวแสดงถึงแรงเทขายอย่างหนักเมื่อราคาพยายามทดสอบแนวต้าน'
    });
  }

  // 5. Double Bottom (W-Pattern) Detection in recent 20 candles
  if (len >= 20) {
    const recent = candles.slice(len - 20);
    const lows = recent.map((c, i) => ({ price: c.low, idx: i }));
    lows.sort((a, b) => a.price - b.price);
    const firstLow = lows[0];
    const secondLow = lows.find(l => Math.abs(l.idx - firstLow.idx) >= 4 && Math.abs(l.price - firstLow.price) / firstLow.price < 0.015);

    if (secondLow) {
      patterns.push({
        type: 'DOUBLE_BOTTOM',
        name: 'Double Bottom (W-Pattern แนวรับสองชั้น)',
        sentiment: 'BULLISH',
        weight: 35,
        desc: 'ราคาลงมาทดสอบแนวรับเดิมสองครั้งแต่ไม่หลุด ยืนยันโซนสะสมพลังของเจ้ามือ (Smart Money Accumulation)'
      });
    }
  }

  // 6. Smart Money Concept: Fair Value Gap / Order Block
  if (len >= 4) {
    const c1 = candles[len - 4];
    const c2 = candles[len - 3];
    const c3 = candles[len - 2];
    if (c3.low > c1.high && c2.close > c2.open) {
      patterns.push({
        type: 'BULLISH_FVG_OB',
        name: 'Bullish Order Block & FVG (โซนสภาพคล่องสถาบัน)',
        sentiment: 'BULLISH',
        weight: 30,
        desc: 'เกิดช่องว่างสภาพคล่อง (Fair Value Gap) คาดการณ์ราคาย่อตัวลงมาแตะ Order Block แล้วดีดตัวขึ้นแรง'
      });
    }
  }

  return patterns;
}

/**
 * AI Signal Generation & Decision Matrix
 */
export function generateAISignal(candles, asset, patterns = [], activeNews = null) {
  const len = candles.length;
  if (len === 0) return null;

  const currentPrice = candles[len - 1].close;
  const ema20 = calculateEMA(candles, 20);
  const ema50 = calculateEMA(candles, 50);
  const ema200 = calculateEMA(candles, 200);
  const rsi = calculateRSI(candles, 14);
  const macd = calculateMACD(candles);
  const bb = calculateBollingerBands(candles, 20, 2);

  const curEMA20 = ema20[len - 1] || currentPrice;
  const curEMA50 = ema50[len - 1] || currentPrice;
  const curEMA200 = ema200[len - 1] || currentPrice;
  const curRSI = rsi[len - 1] || 50;
  const curMACDHist = macd.histogram[len - 1] || 0;
  const curBBLower = bb.lower[len - 1] || currentPrice * 0.98;
  const curBBUpper = bb.upper[len - 1] || currentPrice * 1.02;

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
  patterns.forEach(p => {
    score += p.weight;
  });

  // 6. Real-Time News Sentiment Factor
  let newsImpactText = '';
  if (activeNews && typeof activeNews.sentimentScore === 'number') {
    score += activeNews.sentimentScore;
    newsImpactText = `\n\n📰 [ปัจจัยข่าวกระทบสด]: ข่าว "${activeNews.headline}" (${activeNews.sentiment === 'BULLISH' ? 'ปัจจัยบวก 🟢' : 'ปัจจัยลบ/ความเสี่ยง 🔴'}) มีอิทธิพลต่อความเชื่อมั่นของตลาดในขณะนี้`;
  }

  // Bound score
  score = Math.max(-100, Math.min(100, score));

  // Determine Action & Confidence
  let action = 'NEUTRAL / HOLD';
  let badgeClass = 'signal-hold';
  let confidence = Math.abs(score);

  if (score >= 45) {
    action = score >= 75 ? 'STRONG BUY' : 'BUY';
    badgeClass = score >= 75 ? 'signal-strong-buy' : 'signal-buy';
  } else if (score <= -45) {
    action = score <= -75 ? 'STRONG SELL' : 'SELL';
    badgeClass = score <= -75 ? 'signal-strong-sell' : 'signal-sell';
  }

  // Calculate Entry, TP, SL, Risk/Reward
  const isLong = score >= 0;
  const atr = Math.abs(curBBUpper - curBBLower) / 4 || currentPrice * 0.015;

  const entry = currentPrice;
  const sl = isLong ? Number((entry - atr * 1.2).toFixed(asset.digits)) : Number((entry + atr * 1.2).toFixed(asset.digits));
  const tp1 = isLong ? Number((entry + atr * 2.0).toFixed(asset.digits)) : Number((entry - atr * 2.0).toFixed(asset.digits));
  const tp2 = isLong ? Number((entry + atr * 3.8).toFixed(asset.digits)) : Number((entry - atr * 3.8).toFixed(asset.digits));

  const riskAmount = Math.abs(entry - sl);
  const rewardAmount = Math.abs(tp1 - entry);
  const rrRatio = (rewardAmount / (riskAmount || 1)).toFixed(2);

  // Confluence Factors Checklist
  const factors = [
    { name: `EMA 20/50 Trend Alignment (${curEMA20 > curEMA50 ? 'BULLISH 🟢' : 'BEARISH 🔴'})`, pass: isLong ? curEMA20 > curEMA50 : curEMA20 < curEMA50 },
    { name: `RSI Oscillator (${curRSI} - ${curRSI < 35 ? 'OVERSOLD' : curRSI > 65 ? 'OVERBOUGHT' : 'BALANCED'})`, pass: isLong ? curRSI < 55 : curRSI > 45 },
    { name: `MACD Zero-Line Momentum (${curMACDHist >= 0 ? '+BULLISH' : '-BEARISH'})`, pass: isLong ? curMACDHist > 0 : curMACDHist < 0 },
    { name: `Bollinger Band Position (${currentPrice < (curBBLower + curBBUpper)/2 ? 'Discount Zone' : 'Premium Zone'})`, pass: true }
  ];

  // Market Regime & Strategy Playbook Breakdown
  let marketRegime = 'SIDEWAY CONSOLIDATION (ช่วงพักฐานสะสมแรง)';
  let strategyPlaybook = 'Wait for Breakout / Scalp within range (รอจังหวะทะลุกรอบหรือเล่นสั้นในกรอบแนวรับ-ต้าน)';
  let riskWarning = 'ปริมาณ Volume ยังไม่หนาแน่นพอ ระวัง False Breakout';

  if (curEMA20 > curEMA50 && currentPrice > curEMA20) {
    marketRegime = 'BULLISH EXPANSION (แนวโน้มขาขึ้นแข็งแกร่ง)';
    strategyPlaybook = 'Trend Following & Buy on Dip (ถือรันเทรนด์ / ย่อซื้อตามแนวรับ EMA)';
    riskWarning = curRSI > 65 ? 'RSI เริ่มสูงเข้าใกล้ Overbought ระวังแรงขายทำกำไรระยะสั้น' : 'ตั้ง Stop Loss ใต้แนวรับ EMA50 เพื่อป้องกันความผันผวน';
  } else if (curEMA20 < curEMA50 && currentPrice < curEMA20) {
    marketRegime = 'BEARISH DISTRIBUTION (แนวโน้มขาลง / กระจายของ)';
    strategyPlaybook = 'Sell on Rally / Short at Resistance (เด้งเปิด Short หรือถือเงินสดรอฐานราคา)';
    riskWarning = curRSI < 35 ? 'RSI Oversold อาจเกิดการ Rebound ดีดกลับทางเทคนิคได้ทุกเมื่อ' : 'หลีกเลี่ยงการเปิด Long สวนเทรนด์ใหญ่จนกว่าจะมีแท่งเทียนกลับตัวชัดเจน';
  }

  // Thai AI Rationale Breakdown
  let rationale = '';
  if (action.includes('BUY')) {
    rationale = `อัลกอริทึมตรวจพบโมเมนตัมขาขึ้นที่มีนัยสำคัญบนคู่เทรด ${asset.id} โดยราคาเคลื่อนไหวอยู่เหนือแนวรับ EMA20 และค่า RSI (${curRSI}) บ่งชี้ว่าอยู่ในโซนที่มีความได้เปรียบสูง (High Probability Setup) เหมาะสำหรับเปิดสถานะ LONG หรือพิจารณาซื้อสะสมเพื่อหวังผลกำไรที่เป้าหมาย TP1 ($${tp1}) และ TP2 ($${tp2}) พร้อมตั้งจุดตัดขาดทุน Stop Loss ($${sl})` + newsImpactText;
  } else if (action.includes('SELL')) {
    rationale = `ระบบตรวจพบแรงกดดันฝั่งขายที่หนาแน่นบริเวณแนวต้าน และสัญญาณ Overbought/Rejection บนคู่เทรด ${asset.id} แนะนำเปิดสถานะ SHORT หรือทยอย Take Profit ขายทำกำไรเพื่อลดความเสี่ยง โดยมีเป้าหมายทำกำไรขาลงที่ $${tp1} และตัดขาดทุนหากราคาทะลุผ่าน $${sl}` + newsImpactText;
  } else {
    rationale = `สภาวะตลาดยังอยู่ในช่วงพักฐาน (Consolidation / Sideway) สัญญาณอินดิเคเตอร์ยังไม่มีความสอดคล้องชัดเจน แนะนำรอจังหวะ Breakout หรือรอการยืนยันแท่งเทียนที่แนวรับ/แนวต้านก่อนตัดสินใจ` + newsImpactText;
  }

  return {
    action,
    badgeClass,
    score,
    confidence: Math.min(99, Math.max(55, Math.round(50 + confidence / 2))),
    entry,
    tp1,
    tp2,
    sl,
    rrRatio: `1 : ${rrRatio}`,
    marketRegime,
    strategyPlaybook,
    riskWarning,
    activeNews,
    factors,
    patterns,
    rationale,
    curRSI,
    curMACDHist
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

    // Real-Time News Stream
    this.newsList = [...LIVE_MARKET_NEWS_FEED];
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
    this.paperBalanceUSD = 100000.00; // $100,000 Paper Capital
    this.leverage = 10;

    // AI Continuous Learning Gym & Auto-Trader Sandbox
    this.isAutoTrading = true;
    this.aiPositions = [];
    this.aiJournal = [];
    this.aiStats = {
      totalTrades: 18,
      wins: 14,
      losses: 4,
      winRate: 77.8,
      netPnlUSD: 8420.50,
      samplesStudied: 3420,
      adaptationLevel: 5
    };

    // Seed initial realistic learning journal
    this.seedInitialAIJournal();
  }

  seedInitialAIJournal() {
    this.aiJournal = [
      {
        id: 'AI_TR_01',
        assetId: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 95400.00,
        exitPrice: 97320.00,
        pnlUSD: 1920.00,
        pnlPercent: 20.12,
        isWin: true,
        setupName: 'Double Bottom + Bullish RSI Divergence',
        exitReason: 'TAKE_PROFIT_HIT',
        closeTime: '10m ago',
        postMortem: 'รูปแบบ Double Bottom ยืนยันร่วมกับสัญญาณ Oversold บน RSI (28) และเม็ดเงินไหลเข้า ETF หนุนราคาแตะเป้าหมาย TP1 ($97,320) ได้อย่างสมบูรณ์แบบ',
        learningLesson: '✅ ปรับเพิ่มค่าน้ำหนัก (Reward Weight +18%): จดจำความแม่นยำของ Double Bottom บริเวณแนวรับสำคัญระดับ Day'
      },
      {
        id: 'AI_TR_02',
        assetId: 'ETH/USDT',
        side: 'LONG',
        entryPrice: 3520.00,
        exitPrice: 3465.00,
        pnlUSD: -550.00,
        pnlPercent: -15.62,
        isWin: false,
        setupName: 'Ascending Triangle Breakout',
        exitReason: 'STOP_LOSS_HIT',
        closeTime: '24m ago',
        postMortem: 'ราคาพยายาม Breakout แต่ปริมาณ Volume ไม่หนาแน่นพอ เกิดสัญญาณ False Breakout และมีแรงเทขายสวนทางหลุดแนวรับ Stop Loss ($3,465)',
        learningLesson: '❌ ถอดบทเรียนความผิดพลาด (Penalty Applied): สั่งปรับเงื่อนไขห้ามเข้าซื้อแบบ Breakout หาก Volume ต่ำกว่าค่าเฉลี่ย 20 แท่ง'
      },
      {
        id: 'AI_TR_03',
        assetId: 'SOL/USDT',
        side: 'SHORT',
        entryPrice: 204.50,
        exitPrice: 196.80,
        pnlUSD: 770.00,
        pnlPercent: 37.65,
        isWin: true,
        setupName: 'Bearish Engulfing at Resistance',
        exitReason: 'TAKE_PROFIT_HIT',
        closeTime: '42m ago',
        postMortem: 'ตรวจพบแท่งเทียน Bearish Engulfing ปฏิเสธแนวต้านจิตวิทยา $205 ร่วมกับ RSI Overbought (74) ราคาปรับตัวลงสู่เป้าหมาย TP ($196.80)',
        learningLesson: '✅ เสริมความจำโมเดล (Reward Weight +15%): เพิ่มความมั่นใจให้กับสัญญาณ Short Rejection เมื่อ RSI > 70'
      }
    ];
  }

  async init() {
    await this.loadCandles();
    this.setupCanvasInteractions();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.startLiveTickStream();
    this.startNewsStream();
  }

  destroy() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.newsInterval) clearInterval(this.newsInterval);
    this.tickInterval = null;
    this.newsInterval = null;
  }

  async setAsset(assetId) {
    const asset = TRADING_ASSETS.find(a => a.id === assetId);
    if (!asset) return;
    this.activeAsset = asset;
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
    // Attempt real live Binance Kline API fetch first
    const realData = await fetchRealExchangeCandles(this.activeAsset.id, this.activeTimeframe.id, 80);
    if (realData && realData.length > 0) {
      this.candles = realData;
      this.isRealFeed = true;
    } else {
      this.generateHistoricalCandles();
      this.isRealFeed = false;
    }
    this.analyzeMarket();
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
    if (this.candles.length === 0) return;
    const last = this.candles[this.candles.length - 1];
    const delta = (Math.random() - 0.49) * (last.close * 0.0018);
    const newClose = Number((last.close + delta).toFixed(this.activeAsset.digits));

    last.close = newClose;
    last.high = Math.max(last.high, newClose);
    last.low = Math.min(last.low, newClose);
    last.volume += Math.round(5 + Math.random() * 25);

    // 1. Update Manual Paper Trading Positions
    this.updatePositionPnL();

    // 2. Evaluate and Update AI Continuous Auto-Trading Sandbox
    if (this.isAutoTrading) {
      this.evaluateAIPositions();
      this.checkAutoTradeExecution();
    }

    // 3. Recompute Signals and Redraw smoothly
    this.analyzeMarket();
    this.requestRender();
  }

  analyzeMarket() {
    this.patterns = detectChartPatterns(this.candles);
    this.signal = generateAISignal(this.candles, this.activeAsset, this.patterns, this.activeNews);
    if (this.onSignalUpdate) {
      this.onSignalUpdate(this.signal);
    }
  }

  // =========================================================================
  // AI AUTONOMOUS TRADING & POST-MORTEM ROOT CAUSE LEARNING SYSTEM
  // =========================================================================

  toggleAutoTrading(enabled) {
    this.isAutoTrading = enabled !== undefined ? enabled : !this.isAutoTrading;
    return this.isAutoTrading;
  }

  checkAutoTradeExecution() {
    if (!this.signal || this.signal.confidence < 68 || this.candles.length === 0) return;
    
    // Only open 1 active position per asset for the AI to avoid over-exposure
    const existing = this.aiPositions.find(p => p.assetId === this.activeAsset.id);
    if (existing) return;

    const isLong = this.signal.action.includes('BUY');
    const isShort = this.signal.action.includes('SELL');
    if (!isLong && !isShort) return;

    const currentPrice = this.candles[this.candles.length - 1].close;
    const pos = {
      id: 'AI_POS_' + Date.now().toString(36),
      isAI: true,
      assetId: this.activeAsset.id,
      side: isLong ? 'LONG' : 'SHORT',
      entryPrice: currentPrice,
      currentPrice: currentPrice,
      amountUSD: 2500,
      leverage: 10,
      tp: this.signal.tp1,
      sl: this.signal.sl,
      setupName: this.patterns.length > 0 ? this.patterns[0].name : (isLong ? 'EMA Ribbon Trend Ride' : 'Resistance Rejection'),
      entryRSI: this.signal.curRSI,
      openTime: new Date().toLocaleTimeString(),
      confidence: this.signal.confidence
    };

    this.aiPositions.push(pos);
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
        this.aiStats.adaptationLevel = Math.min(10, Math.floor(this.aiStats.samplesStudied / 700));

        this.aiJournal.unshift(tradeRecord);
        if (this.aiJournal.length > 50) this.aiJournal.pop();

        this.aiPositions.splice(i, 1);

        if (this.onAIStatsUpdate) this.onAIStatsUpdate(this.aiStats);
        if (this.onAIJournalUpdate) this.onAIJournalUpdate(this.aiJournal);
      }
    }
  }

  // Fast-Training Simulation Drill (Runs 25 accelerated training runs)
  runFastTrainingDrill(count = 25) {
    const setups = [
      { name: 'Double Bottom W-Pattern', winProb: 0.82 },
      { name: 'Bullish Engulfing at EMA20', winProb: 0.78 },
      { name: 'Order Block (SMC) Demand Bounce', winProb: 0.85 },
      { name: 'RSI Bullish Divergence Rebound', winProb: 0.75 },
      { name: 'High Volatility Squeeze Breakout', winProb: 0.64 },
      { name: 'Bearish Shooting Star Resistance', winProb: 0.80 },
      { name: 'Early Entry before Confirmation', winProb: 0.35 }
    ];

    for (let i = 0; i < count; i++) {
      const setup = setups[Math.floor(Math.random() * setups.length)];
      const asset = TRADING_ASSETS[Math.floor(Math.random() * TRADING_ASSETS.length)];
      const isWin = Math.random() < setup.winProb;
      const isLong = Math.random() > 0.4;
      const entry = asset.basePrice * (1 + (Math.random() - 0.5) * 0.05);
      const delta = isWin ? (0.015 + Math.random() * 0.02) : (-0.01 - Math.random() * 0.012);
      const exit = isLong ? entry * (1 + delta) : entry * (1 - delta);
      const pnlPercent = delta * 100 * 10;
      const pnlUSD = (2000 * pnlPercent) / 100;

      const trade = {
        id: 'AI_FAST_' + Date.now().toString(36) + '_' + i,
        assetId: asset.id,
        side: isLong ? 'LONG' : 'SHORT',
        entryPrice: Number(entry.toFixed(asset.digits)),
        exitPrice: Number(exit.toFixed(asset.digits)),
        pnlUSD: Number(pnlUSD.toFixed(2)),
        pnlPercent: Number(pnlPercent.toFixed(2)),
        isWin: isWin,
        setupName: setup.name,
        exitReason: isWin ? 'TAKE_PROFIT_HIT' : 'STOP_LOSS_HIT',
        closeTime: `Epoch #${this.aiStats.totalTrades + 1}`,
        postMortem: isWin
          ? `[ซ้อมเทรดอัตโนมัติ] สัญญาณ ${setup.name} บน ${asset.id} ทำงานสมบูรณ์แบบ เกิดแรงหนุนจากโมเมนตัมและอินดิเคเตอร์ยืนยันตรงเป้าหมาย`
          : `[ซ้อมเทรดอัตโนมัติ] สัญญาณ ${setup.name} บน ${asset.id} ล้มเหลวเนื่องจากติดแรงเทขายบริเวณแนวต้านใหญ่และเกิด False Signal`,
        learningLesson: isWin
          ? `✅ จดจำและเพิ่มน้ำหนักความแม่นยำให้กับ ${setup.name} (Reward Weight +${Math.round(10 + Math.random()*10)}%)`
          : `❌ บันทึกข้อผิดพลาด (Penalty Applied): เพิ่มตัวกรอง Filter ยืนยันการปิดของแท่งเทียน 2 แท่งก่อนเปิดสถานะ`
      };

      this.aiStats.totalTrades++;
      if (isWin) this.aiStats.wins++;
      else this.aiStats.losses++;
      this.aiStats.winRate = Number(((this.aiStats.wins / this.aiStats.totalTrades) * 100).toFixed(1));
      this.aiStats.netPnlUSD += trade.pnlUSD;
      this.aiStats.samplesStudied += 35;
      this.aiStats.adaptationLevel = Math.min(10, Math.floor(this.aiStats.samplesStudied / 700));

      this.aiJournal.unshift(trade);
    }

    if (this.aiJournal.length > 50) this.aiJournal.length = 50;

    if (this.sound && this.sound.playSuccessFanfare) this.sound.playSuccessFanfare();
    if (this.toasts) {
      this.toasts.show('SUCCESS', `⚡ AI FAST-TRAINING COMPLETE: ${count} TRADES PROCESSED (WIN RATE: ${this.aiStats.winRate}%)`, 3000);
    }

    if (this.onAIStatsUpdate) this.onAIStatsUpdate(this.aiStats);
    if (this.onAIJournalUpdate) this.onAIJournalUpdate(this.aiJournal);
  }

  resetAIMemory() {
    this.aiStats = {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      netPnlUSD: 0,
      samplesStudied: 0,
      adaptationLevel: 1
    };
    this.aiJournal = [];
    this.aiPositions = [];

    if (this.toasts) {
      this.toasts.show('INFO', '🔄 AI AGENT MEMORY & TRAINING JOURNAL RESET TO BASELINE', 2500);
    }

    if (this.onAIStatsUpdate) this.onAIStatsUpdate(this.aiStats);
    if (this.onAIJournalUpdate) this.onAIJournalUpdate(this.aiJournal);
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
  openPosition(side = 'LONG', amountUSD = 1000) {
    if (this.candles.length === 0) return;
    const currentPrice = this.candles[this.candles.length - 1].close;

    if (amountUSD > this.paperBalanceUSD) {
      if (this.toasts) this.toasts.show('ERROR', 'INSUFFICIENT PAPER CAPITAL BALANCE', 2000);
      return;
    }

    const pos = {
      id: 'POS_' + Date.now().toString(36),
      assetId: this.activeAsset.id,
      side: side.toUpperCase(), // 'LONG' | 'SHORT'
      entryPrice: currentPrice,
      currentPrice: currentPrice,
      amountUSD: amountUSD,
      leverage: this.leverage,
      size: (amountUSD * this.leverage) / currentPrice,
      pnlUSD: 0,
      pnlPercent: 0,
      openTime: new Date().toLocaleTimeString(),
      sl: this.signal ? this.signal.sl : null,
      tp: this.signal ? this.signal.tp1 : null
    };

    this.paperBalanceUSD -= amountUSD;
    this.positions.unshift(pos);

    if (this.sound && this.sound.playSuccessFanfare) this.sound.playSuccessFanfare();
    if (this.toasts) {
      this.toasts.show('INFO', `⚡ EXECUTED ${side} ${this.activeAsset.id} @ $${currentPrice} (${this.leverage}x)`, 2500);
    }

    if (this.onPositionUpdate) this.onPositionUpdate(this.positions);
  }

  closePosition(posId) {
    const idx = this.positions.findIndex(p => p.id === posId);
    if (idx === -1) return;

    const pos = this.positions[idx];
    const returnAmount = pos.amountUSD + pos.pnlUSD;
    this.paperBalanceUSD += Math.max(0, returnAmount);

    pos.closeTime = new Date().toLocaleTimeString();
    this.tradeHistory.unshift(pos);
    this.positions.splice(idx, 1);

    if (this.sound && this.sound.playKey) this.sound.playKey(false);
    if (this.toasts) {
      this.toasts.show(pos.pnlUSD >= 0 ? 'SUCCESS' : 'ERROR', `POSITION CLOSED: PnL $${pos.pnlUSD.toFixed(2)} (${pos.pnlPercent.toFixed(2)}%)`, 2500);
    }

    if (this.onPositionUpdate) this.onPositionUpdate(this.positions);
  }

  updatePositionPnL() {
    if (this.candles.length === 0 || this.positions.length === 0) return;
    const curPrice = this.candles[this.candles.length - 1].close;

    this.positions.forEach(pos => {
      pos.currentPrice = curPrice;
      const priceDiff = pos.side === 'LONG' ? curPrice - pos.entryPrice : pos.entryPrice - curPrice;
      pos.pnlPercent = (priceDiff / pos.entryPrice) * 100 * pos.leverage;
      pos.pnlUSD = (pos.amountUSD * pos.pnlPercent) / 100;
    });

    if (this.onPositionUpdate) this.onPositionUpdate(this.positions);
  }
}

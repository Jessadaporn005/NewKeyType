export const RULE_COUNTERCHECK_METHOD = 'DETERMINISTIC_BULL_BEAR_RULE_COUNTERCHECK_V1';

export function evaluateRuleCountercheck(patterns = [], marketRegime = null, orderBookData = null, rsi = 50, currentPrice = 0) {
  const safePatterns = Array.isArray(patterns) ? patterns : [];
  const safeRsi = Number.isFinite(Number(rsi)) ? Number(rsi) : 50;
  const safePrice = Number.isFinite(Number(currentPrice)) ? Number(currentPrice) : 0;
  const bullishFactors = [];
  const riskFactors = [];

  if (safeRsi < 45) bullishFactors.push(`RSI (${safeRsi.toFixed(1)}) อยู่ในโซนสะสมราคา มีพื้นที่ให้ราคาฟื้นตัว`);
  const bullishPattern = safePatterns.find(pattern => pattern?.sentiment === 'BULLISH');
  if (bullishPattern) bullishFactors.push(`ตรวจพบรูปแบบฝั่งบวก: ${bullishPattern.name}`);
  if (marketRegime?.type === 'TRENDING_MOMENTUM') bullishFactors.push('กฎ Market Regime ระบุว่าเป็น Momentum Trend');
  if (bullishFactors.length === 0) bullishFactors.push('ยังไม่มีปัจจัยฝั่งบวกที่เด่นชัด');

  if (safeRsi > 65) riskFactors.push(`RSI (${safeRsi.toFixed(1)}) เข้าใกล้ Overbought เสี่ยงเกิดแรงขายทำกำไร`);
  const bearishPattern = safePatterns.find(pattern => pattern?.sentiment === 'BEARISH');
  if (bearishPattern) riskFactors.push(`ตรวจพบรูปแบบฝั่งลบ: ${bearishPattern.name}`);
  if (marketRegime?.type === 'LIQUIDITY_HUNT') riskFactors.push('กฎ Market Regime เตือนความเสี่ยงจาก Liquidity Hunt / Bull Trap');
  if (riskFactors.length === 0) riskFactors.push('ยังไม่พบปัจจัยลบรุนแรง แต่ยังต้องใช้ Stop Loss');

  const walls = Array.isArray(orderBookData?.whale_walls) ? orderBookData.whale_walls : [];
  const wall = walls[0];
  let orderBookVerdict = 'NO VERIFIED ORDER-BOOK DATA';
  let orderBookDescription = 'ไม่มีข้อมูล Order Book ที่ผ่านการยืนยัน จึงไม่นำมาสร้างข้อสรุป';
  let orderBookSource = 'NO_VERIFIED_DATA';
  if (wall && Number.isFinite(Number(wall.price)) && Number.isFinite(Number(wall.volume_lots))) {
    const wallPrice = Number(wall.price);
    orderBookVerdict = wallPrice <= safePrice ? 'BID WALL REPORTED' : 'ASK WALL REPORTED';
    orderBookDescription = `แพ็กเก็ตรายงานระดับ $${wallPrice} ปริมาณ ${Number(wall.volume_lots)} lots (ยังไม่ยืนยันแหล่งที่มา)`;
    orderBookSource = 'UNVERIFIED_EXTERNAL_PACKET';
  }

  const bullishDominant = bullishFactors.length >= riskFactors.length && safeRsi < 62;
  const stronglyAligned = bullishDominant && riskFactors.length <= 1;
  return {
    method: RULE_COUNTERCHECK_METHOD,
    independentAgents: false,
    bullishFactors,
    riskFactors,
    outcome: stronglyAligned ? 'BULL RULES ALIGNED' : bullishDominant ? 'BULL RULES LEAD' : 'MIXED / RISK RULES LEAD',
    outcomeColor: stronglyAligned ? '#00ff88' : bullishDominant ? '#00e5ff' : '#ffaa00',
    orderBook: {
      verdict: orderBookVerdict,
      description: orderBookDescription,
      source: orderBookSource
    }
  };
}

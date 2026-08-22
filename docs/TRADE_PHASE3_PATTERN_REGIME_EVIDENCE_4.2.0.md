# CyberDeck Trade Phase 3 — Pattern & Market Regime Evidence

วันที่เสร็จ: 2026-08-20 (Asia/Bangkok)
ฐานรุ่น: 4.2.0
สถานะ: Source code เสร็จและผ่าน targeted tests; ยังไม่ Build/ติดตั้ง/Commit/Push เป็นรุ่นใหม่

## 1. เป้าหมายของ Phase 3

เปลี่ยน Pattern และ Market Regime จากคำอธิบายเชิงสาธิตให้เป็นสัญญาหลักฐานที่ตรวจสอบย้อนหลังได้ โดยใช้เฉพาะแท่งปิด มีเงื่อนไขยืนยัน มีจุดยกเลิกสมมติฐาน และล้มเหลวแบบปิดเมื่อข้อมูลไม่พอหรือผิดรูปแบบ

```text
verified closed bars
        ↓
validate order + OHLC + forming-bar position
        ↓
confirmed pattern evidence ──→ deterministic ID + confirmation + invalidation
        ↓
market regime evidence ─────→ EMA20/50 + slope + BB width + True Range
        ↓
signal recomputes evidence itself
        ↓
BUY/SELL only when regime has at least 50 valid closed bars
```

## 2. Pattern contract ใหม่

ทุก Pattern ที่มีอำนาจต่อคะแนนต้องมี `PATTERN_EVIDENCE_V1`, deterministic ID, evidence window, anchor indices, confirmation bar/method, invalidation condition และ `decisionEligible=true`

Pattern ที่รองรับในรอบนี้:

- Bullish/Bearish Engulfing พร้อมแท่งถัดไปยืนยัน
- Bullish Hammer และ Bearish Shooting Star พร้อมบริบทและแท่งยืนยัน
- Double Bottom breakout และ Double Top breakdown ผ่าน neckline
- Bullish/Bearish Fair Value Gap continuation ที่มี displacement และ confirmation
- Bullish/Bearish Liquidity Sweep ที่ reclaim/reject reference level แล้วมีแท่งถัดไปยืนยัน

ชื่อ FVG ไม่อ้างว่าเป็น Order Block เพราะข้อมูล OHLC อย่างเดียวพิสูจน์คำกล่าวนั้นไม่ได้ และทุกผลลัพธ์ระบุ `calibrated=false`; น้ำหนักเป็นกฎที่ยังไม่ใช่ความน่าจะเป็นหรือความแม่นยำที่พิสูจน์แล้ว

## 3. Market Regime contract ใหม่

Regime ใช้ `MARKET_REGIME_EVIDENCE_V1` และจัดประเภทจากข้อมูลราคาเท่านั้น:

| ประเภท | หลักฐานขั้นต่ำ |
|---|---|
| `TRENDING_MOMENTUM` | EMA20/50 separation, EMA20 slope, Bollinger width และราคาปิดอยู่ฝั่งเดียวกันอย่างน้อย 4/5 แท่ง |
| `VOLATILITY_EXPANSION` | True Range เฉลี่ย 10 แท่งขยายจาก baseline พร้อม ATR/price ขั้นต่ำ |
| `RANGE_COMPRESSION` | Bollinger width บีบเทียบ baseline หรือ EMA separation/slope ต่ำ |
| `TRANSITION` | มีข้อมูลครบ แต่ยังไม่ผ่านเงื่อนไขสามประเภทข้างต้น |
| `INSUFFICIENT_EVIDENCE` | มีแท่งปิดน้อยกว่า 50 แท่ง |
| `INVALID_EVIDENCE` | OHLC ผิดรูปแบบ หรือมี forming bar แทรกกลางลำดับ |

ข่าวและ spread ไม่สามารถเปลี่ยนประเภท Regime ได้อีก Spread ถูกบันทึกเป็น execution evidence เท่านั้นและยังคงทำงานใน Risk Gate แยกต่างหาก

## 4. จุดป้องกันการบิดเบือน

1. Signal ไม่เชื่อ Pattern ที่ caller ส่งมา แต่ตรวจจับใหม่จากแท่งปิดทุกครั้ง
2. Pattern แบบ legacy หรือ object ปลอมที่ใส่ schema/weight มหาศาลมีอิทธิพลเป็นศูนย์
3. Still-forming bar ไม่สามารถยืนยัน Pattern หรือเปลี่ยน Regime
4. แท่งผิดรูปแบบไม่ถูกลบทิ้งเงียบ ๆ เพื่อเชื่อมแท่งก่อน/หลังให้เกิด Pattern ปลอม
5. Regime ต่ำกว่า 50 แท่งทำให้ Signal เป็น `INSUFFICIENT REGIME DATA / HOLD` และ Target Score เป็น invalid
6. Bearish Trend ถูกส่งเข้าฝั่ง Risk; แก้บั๊กเดิมที่ Momentum Trend ทุกทิศถูกนับเป็นปัจจัย Bullish
7. หน้าจอแสดงเฉพาะ `✓` Pattern ที่ยืนยันแล้ว และ tooltip แสดง evidence ID, confirmation และ invalidation

## 5. ลบค่าความเก่งที่แต่งไว้

- ตาราง Pattern profile ไม่แสดง mastery/win rate ปลอมอีกต่อไป
- โปรไฟล์ใหม่แสดง `UNOBSERVED (0 obs)`
- `seedInitialAIJournal()` ถูกปิด ไม่สามารถเติมประวัติชนะ/แพ้ตัวอย่างลงเป็นประสบการณ์จริง
- หากมีผล Paper ในอนาคต จะแสดงเป็น `PAPER OBSERVED / UNVALIDATED` จนกว่าจะผ่านนโยบาย out-of-sample แยกต่างหาก

## 6. การทดสอบที่รัน

- Trade core + Phase 3 integration: 149 ผ่าน, 0 ล้มเหลว
- Runtime lifecycle: 18 ผ่าน, 0 ล้มเหลว
- Application flow: 16 ผ่าน, 0 ล้มเหลว
- Syntax check ของ Pattern, Regime, Signal, Rule Countercheck, Target Score, UI และ test file: ผ่าน

กรณีสำคัญที่ทดสอบ: unconfirmed setup, forming-bar repaint, neckline false positive, deterministic ID, malformed OHLC, bullish/bearish regime direction, spread/regime separation, counterfeit Pattern injection และ fail-closed ที่ 49 แท่ง

รอบนี้ตั้งใจไม่รัน full test suite, ไม่ Build installer และไม่ทดสอบเครือข่ายซ้ำ เพราะ Phase 2 ครอบคลุม data pipeline แล้วและต้องประหยัด Limit

## 7. ข้อจำกัดที่ยังเหลือ

1. Pattern thresholds และ weights ยังเป็นกฎตั้งต้นที่ยังไม่ผ่าน calibration/out-of-sample validation
2. ยังไม่มี persistent pattern dataset สำหรับวัด precision, recall, expectancy แยก asset/timeframe/regime
3. Pattern engine อ่าน OHLCV เท่านั้น ยังไม่มี verified order book, broker tick หรือ fundamental/news reader
4. Signal ยังเป็น deterministic rule engine; ML เป็น Shadow และไม่มีอำนาจส่งคำสั่ง
5. Verified Paper Bot และ MT5 XDemo execution ยังไม่ถูกเปิด

## 8. จุดเริ่ม Phase ถัดไป

Phase 4 ควรทำ Research Dataset + Labeling/Outcome Engine ให้ทุก Pattern evidence ถูกติดตามผลแบบไม่มองอนาคต เก็บ MAE/MFE, TP/SL outcome และต้นทุนจำลอง เพื่อวัดว่ากฎใดมี edge จริงก่อนอนุญาตให้ระบบเรียกว่าเรียนรู้หรือปรับน้ำหนักอัตโนมัติ

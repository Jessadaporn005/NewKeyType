# CyberDeck Trade Phase 4 — Pattern Outcome Research Dataset

วันที่เสร็จ: 2026-08-21 (Asia/Bangkok)
ฐานรุ่น: 4.2.0
สถานะ: Source code เสร็จและผ่าน targeted tests; ยังไม่ Build/ติดตั้ง/Commit/Push เป็นรุ่นใหม่

## 1. เป้าหมาย

Phase 4 สร้างชั้นวิจัยที่ตอบคำถามว่า Pattern ที่ Phase 3 ตรวจพบมีผลลัพธ์อย่างไรในข้อมูลอนาคตจริง โดยไม่อนุญาตให้ผลวิจัยปรับ Rule Score, strategy weight, Paper order หรือ Bot

```text
verified historical closed bars
               ↓
history through confirmation bar only
               ↓
confirmed Pattern + Regime snapshot
               ↓
entry at next bar open + adverse slippage
               ↓
first future TP/SL barrier or fixed horizon close
               ↓
immutable outcome: MAE, MFE, return after cost, provenance
               ↓
descriptive summaries only — zero trade influence
```

## 2. Dataset contract

- Dataset schema: `PATTERN_RESEARCH_DATASET_SCHEMA = 1`
- Sample schema: `PATTERN_OUTCOME_SAMPLE_V1`
- Method: `CONFIRM_CLOSE_NEXT_OPEN_FIRST_BARRIER_CONSERVATIVE_V1`
- Stage: `RESEARCH_SHADOW_ZERO_TRADE_INFLUENCE`
- วิเคราะห์ด้วย rolling window เริ่มต้น 80 แท่ง เพื่อจำลองบริบทเดียวกับหน้าจอ Trade โดยไม่ให้เวลาประมวลผลโตแบบกำลังสอง
- เก็บสูงสุด 250 samples ต่อ Dataset เพื่อจำกัดขนาดไฟล์โปรไฟล์
- รับเฉพาะ source ที่ระบุ `verified=true` และ `simulation=false`
- ตรวจ OHLCV, ลำดับเวลา, duplicate, gap, forming/future bar และ timeframe ก่อนเริ่ม Label
- Dataset, samples, outcome, summary และหลักฐานทุกชั้นเป็น immutable

ทุก Dataset และ Sample บังคับค่าต่อไปนี้:

```text
researchOnly = true
decisionEligible = false
weightInfluence = false
calibrated = false
promotionEligible = false
```

## 3. กติกา Label แบบไม่มองอนาคต

1. Pattern ถูกตรวจจาก history ที่จบตรงแท่งยืนยันเท่านั้น
2. เวลา Signal คือแท่งยืนยันปิด และ Entry เริ่มแท่งถัดไปเท่านั้น
3. Stop ใช้ invalidation price ที่ Pattern ระบุ หากเกิด gap จน geometry ใช้ไม่ได้ Sample จะถูก `REJECTED`
4. Target เริ่มต้น 2R และ Horizon เริ่มต้น 12 แท่ง ปรับได้ใน Research config
5. Entry/Exit ใช้ adverse slippage และหัก round-trip cost
6. ถ้า TP/SL ชนในแท่งเดียวกันและไม่รู้ลำดับ tick ให้ Label เป็น Stop แบบอนุรักษนิยม
7. ถ้ายังไม่ชน barrier และอนาคตไม่ครบ Horizon ให้เป็น `PENDING` ห้ามคาดเดาผล
8. ถ้าครบ Horizon ให้ปิดที่ราคาปิดของแท่ง Horizon และแยกกำไร/ขาดทุนหลังต้นทุน
9. แก้ข้อมูลหลังเวลา Label ไม่สามารถเปลี่ยน Outcome ที่ถูกตัดสินก่อนหน้านั้น

## 4. ค่าที่บันทึกต่อ Sample

- Pattern ID/type/direction, anchor times, confirmation และ invalidation
- Regime ID/type/direction และ evidence snapshot ณ เวลา Signal
- Asset, timeframe, verified source และ adapter
- Signal/Entry/Exit indices และ timestamps
- Entry, Stop, Target, Exit และ Risk ต่อหน่วย
- Target hit, Stop hit หรือ Horizon outcome
- Gross return, net return หลังต้นทุน และผลตอบแทนหน่วย R
- Maximum Favorable Excursion (MFE-R)
- Maximum Adverse Excursion (MAE-R)
- Leakage audit ว่า history จบก่อน Entry และอ่านอนาคตถึงจุดใด

## 5. Summary ที่สร้างได้

ระบบสรุปแยกตาม:

- Pattern type
- Market Regime + direction
- Asset + timeframe

Metric ประกอบด้วยจำนวน detected/completed/pending/rejected, Target/Stop hit rate, positive-after-cost rate, Expectancy-R, Profit-Factor-R, Average MFE/MAE และ Average Net Return bps

Metric เหล่านี้เป็น descriptive statistics ไม่ใช่ probability และไม่ผ่าน calibration แม้จำนวนตัวอย่างจะเกิน threshold 30 ตัวอย่างก็ตาม Threshold หมายถึงเพียง “พอแสดงสถิติเบื้องต้น” ไม่ใช่สิทธิ์เลื่อนขั้นโมเดล

## 6. Pattern ID ที่แก้เพิ่ม

Phase 3 เดิมใช้ anchor indices เป็นส่วนหนึ่งของ Pattern ID ทำให้เหตุการณ์เดียวกันอาจมี ID ต่างกันเมื่อ prepend ประวัติเก่า Phase 4 เปลี่ยน ID ให้ใช้ anchor exchange times ทำให้ Pattern เดิมมี ID คงที่แม้จุดเริ่มต้นของ historical window เปลี่ยน

## 7. การใช้งานในโปรแกรม

ในหน้า Trade → Simulation Gym เพิ่มการ์ด `PATTERN OUTCOME RESEARCH DATASET` และปุ่ม:

`BUILD DATASET ~2,000 REAL BARS`

เมื่อกด ระบบจะ:

1. ดึงประวัติจาก Binance public endpoint โดยไม่ใช้ API key
2. ตัดแท่งที่ยังไม่ปิดออก
3. สร้าง Dataset จาก asset/timeframe ปัจจุบัน
4. แสดง completed/pending/rejected, Target hit rate และ Expectancy หลังต้นทุน
5. บันทึก Dataset ลงโปรไฟล์ผ่าน schema migration รุ่น 7

การโหลด Dataset จากดิสก์จะตรวจ schema, source, sample timeline และ outcome ใหม่ พร้อมบังคับสิทธิ์ Trade เป็น false แม้ข้อมูลที่บันทึกถูกแก้ให้เป็น true

## 8. การทดสอบ

- Trade core + Phase 4 integration: 163 ผ่าน, 0 ล้มเหลว
- Persistence/migration: 16 ผ่าน, 0 ล้มเหลว
- Runtime lifecycle: 18 ผ่าน, 0 ล้มเหลว
- Application flow: 16 ผ่าน, 0 ล้มเหลว
- Syntax check ของ Research core, Pattern engine, Trade engine, ProfileStore และ UI: ผ่าน

กรณีสำคัญที่ผ่าน:

- Pattern ID คงที่เมื่อ prepend history
- Next-bar entry และ first-barrier label
- Signal/Entry/Label timeline ไม่มองอนาคต
- MAE/MFE และต้นทุน
- Prefix dataset ให้ Outcome เดียวกับ full dataset เมื่อ Label จบแล้ว
- แก้แท่งหลัง Label แล้ว Outcome เดิมไม่เปลี่ยน
- right-edge sample เป็น Pending
- same-bar TP/SL ใช้ conservative stop
- unverified/simulation source ถูกปฏิเสธ
- persisted authority forgery ถูกล้าง
- engine ดึง history, สร้าง Dataset และ publish callback ได้จริงผ่าน mocked verified adapter path
- research request เก่าที่ถูก supersede ไม่สามารถทับ Dataset ของตลาดปัจจุบัน

รอบนี้ไม่รัน full application suite, ไม่ Build installer และไม่ทดสอบเครือข่ายจริงซ้ำ เพื่อประหยัด Limit; Phase 2 ได้ยืนยัน Binance public endpoint บนเครื่องนี้แล้ว

## 9. ข้อจำกัดที่ยังเหลือ

1. Dataset ปัจจุบันเป็น single asset/timeframe ต่อการรัน ยังไม่มี portfolio research registry รวมหลายตลาด
2. ตัวอย่าง Pattern อาจ overlap กัน จึงห้ามตีความ Summary เป็นผล Backtest ของ portfolio
3. ยังไม่มี chronological train/validation/test split สำหรับเลือก Pattern threshold หรือ weight
4. ยังไม่มี multiple-testing correction, bootstrap confidence interval หรือ regime stability test
5. Research Dataset ไม่มีอำนาจเรียนรู้ ปรับกฎ ส่ง Paper order หรือเชื่อม MT5 XDemo

## 10. จุดเริ่ม Phase 5

Phase 5 ควรสร้าง AI Reader input/output contract แบบ Shadow-only ให้ AI อ่าน MarketPacket, Pattern evidence, Regime และ Research summary ผ่าน schema จำกัด พร้อมบังคับ source citation, uncertainty, no-secret policy และ zero execution authority ก่อนส่งผลตีความไปยัง Verified Paper Bot ใน Phase 6

# CyberDeck Trade Phase 1 — Market Data Contract & Source Guard

วันที่เสร็จ: 2026-08-20 (Asia/Bangkok)
ฐานรุ่น: 4.2.0
สถานะ: Source code เสร็จและผ่าน targeted tests; ยังไม่ Build/ติดตั้งเป็นรุ่นใหม่

## 1. ผลลัพธ์ของ Phase 1

Phase นี้ยังไม่สร้าง AI Reader หรือ Bot ตัวใหม่ จุดประสงค์คือทำให้ระบบแยกข้อมูลจริง ข้อมูลจำลอง ข้อมูลเก่า และแท่งที่ยังไม่ปิดได้ก่อน เพื่อไม่ให้ส่วนใดอ้างว่ากำลังตัดสินใจจากข้อมูลจริงโดยไม่ผ่านหลักฐาน

เส้นทางใหม่:

```text
Binance REST / Simulation fallback
                 ↓
        immutable MarketPacketV1
                 ↓
 source + OHLCV + chronology + duplicate/gap/future/stale guard
                 ↓
      closed decision candles only
          ┌──────┴─────────┐
          ↓                ↓
 deterministic rules   ML Shadow / backtest
          ↓                ↓
 verified-data gate    no execution authority
          ↓
 manual Paper risk/account/audit
```

## 2. สิ่งที่เปลี่ยนแล้ว

| ส่วน | พฤติกรรมหลัง Phase 1 |
|---|---|
| Market data contract | เพิ่ม `MarketPacketV1` แบบ immutable พร้อม source, adapter, symbol, timeframe, observed time, quality, simulation flag และ decision eligibility |
| Candle validation | ตรวจ OHLCV, metadata, ลำดับเวลา, duplicate, gap, future candle, stale snapshot และจำนวนแท่งปิดขั้นต่ำ |
| Closed-bar rule | แยก `decisionCandles` ออกจาก `formingCandles`; signal และ ML Shadow ใช้ชุดแท่งปิดมาตรฐาน |
| Real chart tick | หยุดสุ่มแก้ close/high/low ของ snapshot จาก Binance; snapshot เดิมไม่เปลี่ยนเองเมื่อไม่มีข้อมูล source ใหม่ |
| Simulation fallback | ยังแสดงกราฟได้ใน Simulation Lab แต่ signal ถูกเปลี่ยนเป็น `DATA BLOCKED / NO TRADE` |
| Manual Paper | เปิด position ได้เฉพาะเมื่อ MarketPacket ผ่าน source/quality/freshness guard; Simulation, stale data และ Replay ถูกปฏิเสธ |
| Replay | วิเคราะห์ข้อมูลย้อนหลังเพื่อดูกราฟได้ แต่ไม่มี execution authority และไม่ revalue position ปัจจุบันด้วยราคาในอดีต |
| Legacy auto scenario | ปิดเส้นทางสร้าง `aiPositions`; toggle คืนค่า disabled เสมอ |
| Synthetic Fast-Train | ปิดการสุ่มสร้างผลเทรดและสถิติเรียนรู้ เพราะไม่มีหลักฐานจากตลาดจริง |
| Paper audit | บันทึก packet schema, market source, quality, eligibility, rejection reasons, data age และเวลาแท่งที่ใช้ตัดสินใจ |
| Backtest | เพิ่ม immutable data provenance ว่ามาจาก source ใด, quality อะไร, เป็น simulation หรือไม่ และ eligible ตอนเริ่มรันหรือไม่ |
| UI source badge | อ่านสถานะจาก MarketPacket โดยตรง: verified closed bars, Simulation Lab/no trade หรือ blocked พร้อมเหตุผล |
| UI legacy controls | ปุ่ม Synthetic Fast-Train และ Legacy Auto Scenario ถูกปิด พร้อมข้อความที่ไม่อ้างว่าเป็น Bot จริง |

## 3. กฎสิทธิ์ตัดสินใจปัจจุบัน

| สถานะข้อมูล | วิเคราะห์/แสดงกราฟ | Backtest | เปิด Manual Paper | Auto Bot |
|---|---:|---:|---:|---:|
| Binance + quality valid + fresh + แท่งปิดพอ | ได้ | ได้ | ได้ | ยังไม่มี |
| Binance แต่ stale/future/gap/duplicate/malformed | แสดงพร้อม `DATA BLOCKED` | ได้พร้อม provenance ที่บอกข้อบกพร่อง | ไม่ได้ | ไม่ได้ |
| Simulation fallback | ได้ใน Simulation Lab | ได้พร้อมป้าย simulation | ไม่ได้ | ไม่ได้ |
| Replay | ได้ | เป็นเครื่องมือวิเคราะห์เท่านั้น | ไม่ได้ | ไม่ได้ |
| MT5 Demo | Shadow/read-only ตามเดิม | ไม่เป็น input ใน rule backtest | ไม่มีอำนาจ | ไม่มีอำนาจ |

## 4. Acceptance Gate

| Gate | ผล |
|---|---|
| Snapshot จริงไม่ถูก random tick แก้เอง | ผ่าน |
| แท่งกำลังก่อตัวไม่เข้า decision/training dataset | ผ่าน |
| Synthetic/fallback มี `decisionEligible=false` | ผ่าน |
| Asset ไม่มี verified adapter ไม่แสดง Exchange Verified | ผ่าน |
| Legacy auto ข้าม core Paper risk/audit ไม่ได้ | ผ่าน — ปิดอำนาจทั้งหมด |
| Source failure/simulation แสดงใน UI และ Paper rejection audit | ผ่าน |
| real/stale/future/malformed/out-of-order/duplicate/gap/forming/synthetic tests | ผ่าน |

## 5. การทดสอบที่รัน

- Trade core: 108 ผ่าน, 0 ล้มเหลว
- Persistence/migration: 15 ผ่าน, 0 ล้มเหลว
- Syntax check ของ Trade engine, UI app, MarketPacket, audit และ Binance adapter: ผ่าน

ไม่ได้รันชุดทดสอบทุกโหมดหรือ Build installer ใน Phase นี้ ตามข้อกำหนดให้ประหยัด Limit และทดสอบเฉพาะส่วนที่เปลี่ยนโดยตรง

## 6. ข้อจำกัดที่ยังตั้งใจคงไว้

1. ข้อมูล Binance ตอนนี้เป็น REST snapshot ยังไม่มี refresh scheduler ที่ทนต่อ network failure เมื่อ snapshot เก่าเกินกำหนด ระบบจะ fail closed และต้อง reload/switch asset หรือ timeframe เพื่อขอข้อมูลใหม่ จุดนี้เป็นงาน Data Pipeline รอบถัดไป
2. Spread ยังเป็นโมเดลจำลอง จึงเป็นเพียงสมมติฐานค่าใช้จ่ายของ Paper ไม่ใช่ราคา executable จาก broker
3. Signal ปัจจุบันยังเป็น deterministic rules ไม่ใช่ AI ที่อ่านตลาดและเรียนรู้ได้จริง
4. Pattern scanner และ hard-coded mastery UI ยังไม่ใช่หลักฐานความชำนาญ ต้องเขียน evidence/confirmation และลบคำกล่าวอ้างเกินจริงใน Phase ของ Strategy/Learning
5. Local ML ยังเป็น Shadow และไม่มี decision authority
6. MT5 Demo ยังไม่ได้ติดตั้ง/เชื่อมต่อ และ Live execution ยัง hard-disabled
7. Phase นี้ยังไม่เปลี่ยนเลขรุ่น ไม่ Build และไม่ทับโปรแกรม 4.2.0 ที่ติดตั้งอยู่

## 7. จุดเริ่มรอบถัดไป

Phase ถัดไปควรทำ Data Pipeline ให้ snapshot refresh ได้อย่างควบคุม มี retry/backoff, source health, packet sequence และเก็บ raw evidence ก่อนเริ่มเพิ่ม Pattern หรือสร้าง AI Reader/Bot เพื่อให้ข้อมูลที่ป้อนเข้าระบบเชื่อถือและตรวจย้อนหลังได้

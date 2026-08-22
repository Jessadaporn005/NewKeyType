# CyberDeck Trade Phase 2 — Resilient Market Data Pipeline

วันที่เสร็จ: 2026-08-20 (Asia/Bangkok)
ฐานรุ่น: 4.2.0
สถานะ: Source code เสร็จและผ่าน targeted tests; ยังไม่ Build/ติดตั้งเป็นรุ่นใหม่

## 1. เป้าหมายของ Phase 2

Phase นี้แก้ข้อจำกัดสำคัญจาก Phase 1 ที่ Binance เป็น snapshot ครั้งเดียว โดยเพิ่มวงจร refresh ที่ควบคุมได้ ตรวจสุขภาพแหล่งข้อมูล เก็บหลักฐานทุกคำขอ และกู้คืนหลัง network failure โดยไม่ลด source guard หรือให้ข้อมูลจำลองมีอำนาจเทรด

```text
verified adapter registry
          ↓
single-flight request + generation guard
          ↓
Binance REST snapshot (public endpoint, no API key)
          ↓
MarketPacket validation + monotonic packet sequence
          ↓
   ┌──── success ────┐
   ↓                 ↓
adopt packet     health + evidence
   ↓
schedule healthy refresh (15–60s)

failure → preserve last verified packet → 5/10/20/40/60s retry
                         ↓
              stale guard blocks Paper automatically
```

## 2. พฤติกรรมที่เพิ่มแล้ว

| ส่วน | พฤติกรรมหลัง Phase 2 |
|---|---|
| Automatic refresh | Active Trade view ขอ snapshot ใหม่อัตโนมัติตาม timeframe; จำกัดช่วงปกติไว้ 15–60 วินาที |
| Retry/backoff | ความล้มเหลวต่อเนื่อง retry ที่ 5, 10, 20, 40 และสูงสุด 60 วินาที |
| Single-flight | ไม่อนุญาตให้มีคำขอซ้อนกันสำหรับ asset/timeframe generation เดียวกัน |
| UI request routing | การเปิด Trade/สลับ market เลือก asset เป้าหมายครั้งเดียว ไม่เรียก `setMarket` และ `setAsset` ซ้ำเพื่อโหลดคู่เดียวกันหลายรอบ |
| Race guard | คำตอบเก่าที่กลับมาหลังสลับ asset/timeframe มี outcome `SUPERSEDED` และห้ามทับ packet ปัจจุบัน |
| Adapter registry | เฉพาะ BTC/USDT, ETH/USDT, SOL/USDT และ XAU/USD ผ่าน PAXG proxy ที่เรียก Binance; asset อื่นไม่ยิง request ปลอม |
| Failure recovery | หากเคยมี verified packet แล้ว network ล้มเหลว ระบบเก็บ packet เดิมแบบ immutable ไม่แทนด้วย random data; เมื่อเก่าเกิน guard จะถูกบล็อกเอง |
| Initial failure | ถ้ายังไม่เคยได้ข้อมูลจริง จะแสดง Simulation Lab พร้อม `decisionEligible=false` และ retry เฉพาะ asset ที่มี adapter |
| Source health | มี `STARTING`, `HEALTHY`, `DEGRADED`, `OFFLINE`, `SIMULATION`, failure count, last success/failure และ next refresh |
| Request evidence | เก็บหลักฐาน immutable สูงสุด 100 รายการในหน่วยความจำ: request id, generation, source, target, duration, outcome, quality, จำนวนแท่ง และขอบเขตเวลา |
| Packet lineage | MarketPacket มี monotonic `sequence` และ `requestId`; UI, Paper audit และ Backtest provenance อ้าง lineage เดียวกัน |
| View lifecycle | ออกจาก Trade จะยกเลิก timer และ invalidate request generation; กลับเข้า Trade จะ refresh ทันที |
| UI badge | แสดง verifying, refreshing, healthy, degraded/retrying, offline หรือ Simulation Lab จาก health จริง |

## 3. กฎ fail-closed

1. Network failure ไม่ทำให้ random fallback ทับ verified snapshot ที่มีอยู่
2. Verified snapshot ที่ health degraded ยังใช้ Paper ได้เฉพาะช่วงที่ freshness guard ยังผ่าน
3. เมื่อ snapshot stale, malformed, gapped, duplicate, future หรือ insufficient ระบบเปลี่ยนเป็น `DATA BLOCKED / NO TRADE`
4. Asset ที่ไม่มี adapter อยู่ Simulation Lab และไม่มี automatic polling
5. คำตอบที่ถูก supersede ไม่มีสิทธิ์เปลี่ยน packet, signal หรือ Paper price
6. Evidence ไม่มี API key, credential, raw response header หรือ broker secret

## 4. การทดสอบ

- Trade core/pipeline: 127 ผ่าน, 0 ล้มเหลว
- Runtime lifecycle: 18 ผ่าน, 0 ล้มเหลว
- Persistence/migration: 15 ผ่าน, 0 ล้มเหลว
- Security: 48 ผ่าน, 0 ล้มเหลว
- Application flow: 16 ผ่าน, 0 ล้มเหลว
- Syntax check ของ engine, pipeline core, MarketPacket, UI และ Binance adapter: ผ่าน
- One-shot network test บนเครื่องนี้: Binance public BTC/USDT 5m ได้ 80 แท่ง, มี close time และลำดับเวลาถูกต้อง

ทดสอบเฉพาะส่วนที่เกี่ยวข้องกับ Phase 2 เพื่อประหยัด Limit; ไม่รัน full application suite และไม่ Build installer

## 5. บั๊กเดิมที่พบและแก้ระหว่าง Phase

`loadCandles()` เคยเรียกชื่อฟังก์ชัน Binance ที่ไม่ได้ import ทำให้ runtime มีโอกาสเกิด `ReferenceError` แม้ mock tests เดิมไม่เรียกเส้นทางนี้ Phase 2 เปลี่ยนเป็น injected `marketDataFetch` ที่มี default เป็น adapter ที่ import ถูกต้อง และเพิ่ม integration test ของ initial load จริงใน engine

## 6. ข้อจำกัดที่ยังเหลือ

1. ยังเป็น REST polling ไม่ใช่ WebSocket streaming; เหมาะกับ closed-bar strategy แต่ไม่ใช่ระบบ tick/HFT
2. Request evidence เก็บแบบ bounded in-memory และยังไม่ persist ข้ามการปิดโปรแกรม การทำ persistent research dataset ต้องออกแบบ schema/retention เพิ่ม
3. Binance เป็น market-data source ไม่ใช่ broker execution quote; spread และ fill ของ Paper ยังเป็นแบบจำลอง
4. XAU/USD ยังเป็น PAXG/USDT proxy ไม่ใช่ราคา XAU/USD ของ XM
5. Signal ยังเป็น deterministic rules, ML ยัง Shadow และยังไม่มี Verified Paper Bot
6. Phase นี้ยังไม่เปลี่ยนเลขรุ่น ไม่ Build ไม่ติดตั้งทับ และยังไม่ได้ Commit/Push เพิ่มจาก Phase 1

## 7. จุดเริ่ม Phase ถัดไป

Phase 3 ควรเขียน Pattern/Market Regime contract ใหม่ให้ทุก pattern มี confirmation bar, invalidation, evidence window, deterministic identifier และทดสอบ false-positive บน closed bars ก่อนอนุญาตให้ Pattern มีน้ำหนักใน signal

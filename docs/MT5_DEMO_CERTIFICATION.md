# MT5 Demo telemetry certification

เครื่องมือนี้รับรองเฉพาะ read-only Demo telemetry Shadow และไม่ให้ decision authority หรือ Live authority รุ่น 4.5.0 ใช้ผลนี้เป็นหนึ่งในหลาย Gate สำหรับ canary 0.01 lot แต่ผล telemetry เพียงอย่างเดียวไม่สามารถเปิดหรือส่ง order ได้

## เงื่อนไข

- MetaTrader 5 ต้องล็อกอินบัญชี Demo จริง
- ตั้ง `CYBERDECK_MT5_DEMO_TOKEN` ค่าเดียวกันและยาวอย่างน้อย 32 ตัวอักษรใน observer/capture process
- Request ใช้ HMAC-SHA256 + timestamp + one-time nonce; token ไม่ถูกส่งผ่าน HTTP
- Response body มี HMAC ป้องกันการปลอม/แก้ข้อมูลระหว่าง observer กับ capture process

## ขั้นตอนสำหรับนักพัฒนา

1. เริ่ม `scripts/mt5_silent_bridge.py` โดยตั้ง token ใน environment
2. เก็บอย่างน้อย 31 packet ลงไฟล์ JSONL:

   ```powershell
   node scripts/capture_mt5_demo_trace.mjs --packets=31 > mt5-demo-trace.jsonl
   ```

3. ปิดหรือเก็บ trace ไว้เฉพาะเครื่อง เพราะมี account metadata
4. ตรวจ session:

   ```powershell
   node scripts/certify_mt5_demo_trace.mjs mt5-demo-trace.jsonl
   ```

## Gate

- อย่างน้อย 31 packet และระยะเวลา 30 วินาที
- capture gap ไม่เกิน 2.5 วินาที
- sequence ต่อเนื่อง ไม่มี replay หรือขาดช่วง
- session, account identity และ symbol ต้องไม่เปลี่ยน
- free-margin identity และตำแหน่งทั้งหมดต้อง reconcile
- system-owned position ที่ไม่คาดหมายหรือไม่มี SL/TP ถูกปฏิเสธ
- ทุก packet ต้องมี `decisionEligible=false`

JSONL เป็นหลักฐานในเครื่องและไม่มี hardware attestation จึงยังแก้ไขได้ภายหลัง รายงานจะแสดง SHA-256 ของ trace เพื่อใช้เทียบไฟล์เดิม แต่ไม่ควรนำมาใช้เปิด Live โดยลำพัง

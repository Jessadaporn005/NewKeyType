# Trade Phase 8 — MT5 XDemo Execution Gate

สถานะซอร์ส: Integration gate พร้อมทดสอบ แต่ Broker execution ยังล็อกใน release

## สิ่งที่ทำจริง

- เพิ่ม state ที่เริ่มต้น `enabled=false`, `killSwitch=true`
- ปลดล็อกได้เมื่อ runtime Demo capability เปิด, ผู้ใช้ยืนยัน Demo, readiness ครบ, telemetry certification ผ่าน และบัญชีเป็น Demo
- สร้าง intent อายุ 5 วินาทีจาก Verified Paper Bot decision เท่านั้น
- broker symbol ต้องอยู่ใน explicit asset-to-symbol allowlist
- จำกัด volume สูงสุด 0.5, magic `99001`, ตรวจ Bid/Ask และ SL/TP geometry
- ห้าม simulated fallback และตรึง `liveEligible=false`
- acknowledgement ต้องผ่าน authenticated transport, echo intent/nonce, ตรง symbol/side/volume/SL/TP/magic และยังไม่หมดอายุ
- ticket ที่ยอมรับแล้วต้องปรากฏใน telemetry ถัดไปและผ่าน account reconciliation
- Kill Switch ล้างสิทธิ์ session ก่อนสร้างคำขอ broker ใดๆ

## สถานะ release ปัจจุบัน

`demoTradingEnabled=false` จึงไม่มีคำสั่งถูกส่งออกจากโปรแกรมที่ติดตั้ง Phase นี้ไม่ถูกนับว่าผ่าน real MT5 XDemo execution เพราะเครื่องยังไม่มี Terminal/บัญชี Demo/certification จริง

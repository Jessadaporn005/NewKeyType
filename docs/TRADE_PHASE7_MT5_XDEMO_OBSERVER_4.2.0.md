# Trade Phase 7 — MT5 XDemo Observer Readiness

สถานะซอร์ส: พัฒนาบนฐาน 4.2.0 ก่อนออกรุ่นใหม่

## สิ่งที่ทำจริง

- แก้ authenticated MT5 Demo observer ให้ใช้ได้ในโปรแกรมที่ Build/ติดตั้งแล้ว โดยยังต้องเปิดผ่าน `CYBERDECK_MT5_DEMO_ENABLED=1` และ token อย่างน้อย 32 ตัวอักษร
- token อยู่ใน Electron main process และไม่ถูกส่งให้หน้าโปรแกรม การร้องขอและผลตอบกลับตรวจ HMAC
- เพิ่มการตรวจ Terminal, process, Python `MetaTrader5`, bridge script, gateway/token, Demo account และผล continuous telemetry certification
- แสดงสถานะ readiness ใน Paper/MT5 cockpit
- ยังคง `decisionInfluence=false`, `executionInfluence=false`, `liveEligible=false`
- เกณฑ์รับรองเดิมยังบังคับอย่างน้อย 31 packet/30 วินาที, sequence ต่อเนื่อง, HMAC และ reconciliation

## ผลตรวจเครื่องวันที่ 22 สิงหาคม 2026

- ไม่พบ MT5/MT5 XDemo ในตำแหน่งติดตั้งมาตรฐาน
- ไม่พบ process `terminal64.exe`
- Python ยังไม่มีแพ็กเกจ `MetaTrader5`
- จึงยังไม่สามารถทำ real Demo telemetry certification ได้ และไม่มีการสร้างผลผ่านปลอม

## ขั้นตอนภายนอกที่ยังต้องทำ

1. ติดตั้ง MT5 ของโบรกเกอร์และเข้าสู่บัญชี Demo จริง
2. ติดตั้ง Python bridge dependency
3. ตั้ง token เดียวกันให้ bridge และ CyberDeck
4. เก็บ trace จริงและรัน `scripts/certify_mt5_demo_trace.mjs`
5. ตรวจบัญชี, symbol, sequence, margin identity และ system magic ก่อนเปิด Phase 8 broker command gate

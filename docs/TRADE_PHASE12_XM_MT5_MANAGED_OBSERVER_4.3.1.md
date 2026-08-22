# Phase 12 — XM MT5 Managed Demo Observer (4.3.1)

## เป้าหมาย

เปลี่ยน MT5 Demo observer จากเครื่องมือนักพัฒนาที่ต้องเปิดเอง ให้เป็นส่วนประกอบแบบอ่านอย่างเดียวที่ CyberDeck จัดการ lifecycle ได้ โดยไม่ขอรหัสผ่าน XM และไม่เพิ่ม broker execution authority

## เส้นทางข้อมูล

1. ผู้ใช้ล็อกอิน XM Global Demo ใน MT5 Terminal
2. CyberDeck ตรวจว่า process ที่เปิดอยู่ตรงกับ XM Terminal ที่อนุญาต
3. Electron main ตรวจ hash ของ Observer และสร้าง HMAC token ชั่วคราว
4. Python Observer อ่าน account, quote, depth และ positions ผ่านแพ็กเกจ MetaTrader5
5. Observer ปฏิเสธบัญชีที่ไม่ใช่ Demo, บริษัทอื่น และ Server ที่ไม่ใช่ XMGlobal
6. Electron main ยืนยัน request/response HMAC และเก็บลำดับ telemetry ในหน่วยความจำ
7. Core certification ตรวจ 31 packet, ระยะเวลา 30 วินาที, freshness, sequence, identity และ reconciliation
8. Renderer รับเฉพาะ packet ที่ตรวจแล้วเพื่อแสดงสถานะ Shadow; decision/execution influence เท่ากับศูนย์

## การควบคุม

- ค่าเริ่มต้นในซอร์สเป็น OFF และผู้ใช้เปิดผ่านปุ่ม `CONNECT XM DEMO OBSERVER`
- การตั้งค่า ON/OFF บันทึกแยกจากรหัสผ่านและ HMAC token
- ปิด Observer เมื่อผู้ใช้สั่ง, เมื่อ CyberDeck ปิด หรือเมื่อ XM Terminal ไม่ทำงาน
- HMAC token ไม่ถูกบันทึกลงดิสก์และเปลี่ยนทุกครั้งที่เริ่ม process

## ผลทดสอบจริง

- XM Terminal path: `C:\Program Files\XM Global MT5\terminal64.exe`
- Broker: XM Global Limited
- Server: XMGlobal MT5 Demo ที่ตรวจจาก Terminal จริง
- Symbols: EURUSD, USDJPY, GBPUSD, GOLD และ BTCUSD พร้อมใช้งาน
- Managed smoke: certified 31/31 packet, 30,036 ms, maximum gap 1,032 ms
- Packaged smoke: certified 31/31 packet, 30,035 ms, maximum gap 1,033 ms
- Installed smoke: certified 31/31 packet, 30,039 ms, maximum gap 1,029 ms

## สิ่งที่ยังล็อก

Observer นี้ไม่มีโค้ดส่งคำสั่งและไม่สามารถเปิด ปิด หรือแก้ไขออเดอร์ Demo/Live การเปิด Demo execution ต้องเป็นงานแยกหลังผ่าน Paper burn-in, symbol-contract validation, volume sizing และ explicit operator confirmation

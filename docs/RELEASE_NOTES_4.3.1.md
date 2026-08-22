# CyberDeck 4.3.1

## XM Global MT5 Demo Observer

- เพิ่ม Managed Observer แบบอ่านอย่างเดียว ซึ่งเปิดและหยุดจากหน้า Trade ได้
- CyberDeck ใช้ MT5 Terminal ที่ผู้ใช้ล็อกอินไว้แล้ว และไม่รับหรือเก็บรหัสผ่าน XM
- จำกัด Terminal ไปยัง XM Global, บัญชี Demo และ Server ชื่อขึ้นต้นด้วย `XMGlobal-`
- รองรับสัญลักษณ์ทองของ XM โดยเลือกจาก `GOLD`, `XAUUSD`, `GOLD#` ตามข้อมูลจริงใน Terminal
- สุ่ม HMAC token ขนาด 256 บิตใหม่ทุกครั้งที่เริ่ม Observer และไม่ส่ง token ไปยัง Renderer
- ตรวจ SHA-256 ของ Python Observer ก่อนเปิดใช้งาน และปฏิเสธไฟล์ที่ถูกแก้ไข
- ตัว Observer รับเฉพาะ authenticated GET บน `127.0.0.1`; POST ถูกปฏิเสธและไม่มี `order_send`
- เก็บและรับรอง telemetry ในหน่วยความจำต่อเนื่องอย่างน้อย 31 packet / 30 วินาที โดยไม่บันทึกเลขบัญชีเต็มลงไฟล์
- เพิ่มสถานะ Terminal, Connector, Demo account และ certification ในหน้า Trade

## การรับรองกับเครื่องจริง

- เชื่อม XM Global MT5 Demo ผ่าน Python `MetaTrader5 5.0.6090` สำเร็จ
- Managed Observer ผ่าน 31 packet ต่อเนื่องใน 30,036 ms
- ช่องว่างสูงสุดระหว่าง packet 1,032 ms และไม่พบ sequence gap หรือ HMAC failure
- Packaged artifact ผ่าน 31 packet ใน 30,035 ms และ Installed app ผ่าน 31 packet ใน 30,039 ms

## ขอบเขตความปลอดภัย

- Demo broker execution และ Live trading ยังคงปิด
- AI Reader และ MT5 telemetry ไม่มีอำนาจส่งคำสั่งซื้อขาย
- ไม่มี simulated broker-success fallback

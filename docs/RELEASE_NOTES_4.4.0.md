# CyberDeck 4.4.0

## XM closed-bar market data

- เปลี่ยน Gold จาก Binance PAXG proxy เป็นข้อมูล `GOLD` จาก XM Global MT5 Demo โดยตรง
- เพิ่มข้อมูล XM สำหรับ `EURUSD`, `GBPUSD` และ `OILCash`
- ใช้เฉพาะแท่งที่ปิดแล้วจาก MT5 และตรวจ quote freshness เพื่อบล็อกการตัดสินใจเมื่อตลาดปิด
- อ่าน Contract Spec จริงของแต่ละสัญญา เช่น tick value, contract size, lot min/max/step และ stop level
- ใช้ exact allowlist; symbol ที่คล้ายกันแต่ไม่ตรงจะถูกปฏิเสธ
- Renderer ไม่เห็น HMAC token และข้อมูลบัญชีใน market snapshot เหลือเพียงเลขท้าย 4 หลัก

## Risk and Demo preflight

- เพิ่มการคำนวณล็อตแบบ conservative ที่จำกัด risk สูงสุด 0.5% และ volume สูงสุด 0.5 lot
- เพิ่มปุ่ม `CHECK CURRENT SIGNAL • NO ORDER` ใน XM/MT5 Cockpit
- ตรวจ profit/loss, margin และกฎ order กับ XM Demo ผ่าน broker-side preflight
- Preflight ไม่ส่งคำสั่ง และผลลัพธ์ทุกชุดระบุ `executionAttempted: false`

## Safety boundary

- Demo execution ยังล็อก
- Live trading ยังล็อก
- ไม่มี simulated broker-success fallback
- AI Reader, Pattern Research และ ML Shadow ไม่มีสิทธิ์ส่งคำสั่ง

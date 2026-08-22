# CyberDeck / NewKeyType

CyberDeck เป็น Electron desktop app สำหรับฝึกพิมพ์, โหมดจำลองแนว cyber terminal และห้องทดลอง Trade ที่ใช้ **Paper เป็นค่าเริ่มต้น** พร้อมเส้นทางรับรอง XM Demo แบบ one-shot 0.01 lot

## สถานะสำคัญ

- การทำงานอัตโนมัติทั้งหมดยังเป็น Paper; รุ่น 4.5.0 เปิดเฉพาะ Demo canary ที่ต้องกด Preflight → พิมพ์ `XM DEMO 0.01` → Arm → Send ด้วยตนเอง จำกัดหนึ่งครั้งต่อการเปิดโปรแกรม และ Live ยังปิดถาวร
- สัญญาณ Trade หลักเป็นอินดิเคเตอร์และกฎ deterministic ไม่ใช่ AI หลายตัว; มี Local ML แบบ logistic-direction ที่ฝึกจากแท่งปิดจริง แต่ถูกจำกัดไว้ใน Shadow และไม่มีน้ำหนักต่อการตัดสินใจจนกว่าจะผ่านหลักฐาน
- Binance ใช้เป็นแหล่ง OHLCV สำหรับสินทรัพย์ที่รองรับ ส่วนข้อมูลที่หาไม่ได้จะติดป้าย simulated อย่างชัดเจน
- ไม่มี Auto Update ที่ใช้งานจริง รุ่นติดตั้งปัจจุบันเป็น manual unsigned release
- ข้อมูลผู้ใช้ถูกเก็บแยกจากตัวโปรแกรมใน Electron `userData` พร้อม atomic write และ backup recovery

## เริ่มในโหมดพัฒนา

```powershell
npm install
npm start
```

## การทดสอบแบบ checkpoint

```powershell
npm run test:trade
npm run test:persistence
npm run test:security
```

หลีกเลี่ยงการรันชุดใหญ่ทุกครั้งระหว่างแก้จุดย่อย ใช้ `npm test` เฉพาะ checkpoint ใหญ่หรือก่อนออกรุ่น

## สร้างโปรแกรม Windows

```powershell
npm run build:unpacked
npm run build:installer
npm run build:portable
```

ผลลัพธ์อยู่ใน `release/` รายละเอียดข้อกำหนดการออกรุ่นอยู่ที่ [docs/RELEASE.md](docs/RELEASE.md)

Installer บรรจุเฉพาะ MT5 observer, preflight และ Demo canary executor ที่ตรวจ hash แล้วเป็น external resources; ไม่บรรจุ legacy live executor และไม่ลบฐานข้อมูลผู้ใช้เมื่อถอนการติดตั้ง

## สถานะ MT5 สำหรับนักพัฒนา

- `scripts/mt5_live_executor.py` ถูกยกเลิกและไม่สามารถส่งคำสั่งได้ เพราะต้นแบบเดิมไม่มีการยืนยันตัวตน
- `scripts/mt5_silent_bridge.py` เป็นตัวสังเกตบัญชี Demo แบบอ่านอย่างเดียว ไม่มี simulated fallback และใช้ HMAC challenge/response ด้วย secret อย่างน้อย 32 ตัวอักษร โดยไม่ส่ง secret ผ่าน HTTP
- ข้อมูลแท่งปิดจาก XM Demo ที่ผ่านการตรวจใช้กับ Pattern/Rule/Paper Bot ได้ แต่ Observer ไม่มีสิทธิ์ส่งคำสั่ง
- `scripts/mt5_demo_canary_executor.py` เป็นจุดเดียวที่มี `order_send`; จำกัด 0.01 lot, XM Demo, zero-open-position, SL/TP, one-shot และต้อง reconcile Position ก่อนนับว่าผ่าน
- โปรแกรมไม่ขอหรือเก็บรหัสผ่าน XM; ใช้ session ที่ล็อกอินอยู่ใน XM MT5 เท่านั้น
- ขั้นตอนเก็บและตรวจ session อยู่ใน [docs/MT5_DEMO_CERTIFICATION.md](docs/MT5_DEMO_CERTIFICATION.md)

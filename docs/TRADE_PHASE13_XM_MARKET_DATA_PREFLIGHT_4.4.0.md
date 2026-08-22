# Trade Phase 13 — XM MT5 Demo Market Data and Preflight

## เป้าหมาย

เชื่อมข้อมูลแท่งราคาและกฎสัญญาจริงจาก XM Global MT5 Demo เข้าสู่ Trade pipeline โดยยังไม่ส่งคำสั่งซื้อขาย และไม่ขอหรือเก็บรหัสผ่าน XM

## ข้อมูลตลาดที่อนุญาต

| สินทรัพย์ใน CyberDeck | สัญลักษณ์ XM ที่ยอมรับ | Timeframe |
| --- | --- | --- |
| XAU/USD | GOLD | 1m, 5m, 15m, 1h, 1D |
| EUR/USD | EURUSD | 1m, 5m, 15m, 1h, 1D |
| GBP/USD | GBPUSD | 1m, 5m, 15m, 1h, 1D |
| USOIL | OILCash | 1m, 5m, 15m, 1h, 1D |

ไม่มี fuzzy symbol matching และไม่มี PAXG proxy สำหรับ XAU/USD อีกต่อไป

## เส้นทางข้อมูล

1. Electron Main สร้าง HMAC token ชั่วคราวและเปิด Observer แบบอ่านอย่างเดียว
2. Renderer ขอข้อมูลผ่าน sender-validated IPC โดยไม่เห็น token
3. Main ลงลายเซ็น HMAC ให้ path และ query ที่อนุญาตแบบตรงตัว
4. Observer ตรวจ XM Global, Server `XMGlobal-*` และบัญชี Demo
5. Observer ใช้ MT5 bar position `1` เพื่อไม่นำแท่ง position `0` ที่กำลังก่อตัวเข้าระบบ
6. Gateway ตรวจ OHLC, เวลา,ลำดับ, Contract Spec, quote freshness และ account reference แบบเลขท้าย 4 หลัก
7. Market Packet จึงอนุญาตให้ข้อมูลมีผลกับ Pattern/Rule/Paper Bot ได้

เมื่อตลาดปิดหรือ quote ไม่อัปเดตเกิน 120 วินาที Decision จะถูกบล็อกด้วย `BROKER_MARKET_NOT_FRESH` แม้ประวัติแท่งจะยังอ่านได้

## Contract Spec ที่อ่านจาก XM

- digits, point และ tick size
- tick value ฝั่งกำไรและขาดทุน
- contract size
- lot ขั้นต่ำ/สูงสุด/step
- stop/freeze level
- trade, execution, filling และ order mode
- base/profit/margin currency

ค่าดังกล่าวติดไปกับ Market Packet และใช้แทนค่าคงที่เดิมของหน้าจอ

## Demo order preflight

Preflight เป็น Python process แยกแบบ one-shot และทำเฉพาะ:

- คำนวณผลขาดทุนที่ SL และกำไรที่ TP ผ่าน MT5
- คำนวณ Margin ผ่าน MT5
- เรียก broker-side `order_check`
- จำกัดความเสี่ยง 0.1–0.5% และ volume ไม่เกิน 0.5 lot
- ปฏิเสธบัญชีที่ไม่ใช่ Demo, broker/server ผิด, symbol นอก allowlist หรือ SL/TP geometry ผิด

Preflight ไม่มี execution primitive, ระบุ `executionAttempted: false` ทุกผลลัพธ์ และไม่สามารถส่งคำสั่งได้ ปุ่มใน Cockpit ระบุชัดว่า `NO ORDER`.

## ผลตรวจบนเครื่อง XM Demo จริง

- อ่าน `GOLD` 5m closed bars ได้ 80 แท่งโดยตัด forming bar ออก
- Contract ที่ตรวจพบ: 2 digits, tick size 0.01, contract size 100, min lot 0.01, max lot 50, lot step 0.01
- Broker preflight ตัวอย่าง 0.01 lot ผ่านด้วย retcode 0 โดยประเมิน Stop Loss $5, Target Profit $10 และ Margin $4.60
- การทดสอบดังกล่าวเป็น calculation/check เท่านั้น ไม่มี order หรือ position ถูกสร้าง

## ขอบเขตที่ยังล็อก

- `demoTradingEnabled` ยังเป็น `false`
- `liveTradingEnabled` ยังเป็น `false`
- ไม่มีการส่ง แก้ หรือปิด order
- AI Reader ยังเป็น Shadow-only และไม่มี execution influence
- ขั้นถัดไปคือ Demo executor แบบ session-bound พร้อม operator confirmation และ reconciliation หลังส่งคำสั่ง

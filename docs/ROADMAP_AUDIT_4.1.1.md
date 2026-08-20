# CyberDeck roadmap audit — 4.1.1

วันที่ตรวจ: 2026-08-20

## หลักฐานที่ผ่านแล้ว

| ขอบเขต | หลักฐานปัจจุบัน | สถานะ |
| --- | --- | --- |
| Baseline | Git tag `codex-baseline-20260820` | ผ่าน |
| User-data backup | `cyber_db.pre-codex-20260820.json` และ `cyber_db.pre-credential-migration-20260820.json` ใน Electron user-data backups | ผ่าน |
| Paper-only | `demoTradingEnabled=false`, `liveTradingEnabled=false`, `allowSimulatedBrokerFallback=false` และ renderer override เปิดไม่ได้ | ผ่าน |
| Lifecycle | `test:stability` 18/18 รวม CLI trace, intel polling, modal timers, ทุก engine ที่มี background resources และ Trade streams | ผ่าน |
| Persistence | `test:persistence` 15/15: versioned envelope, atomic write, known-good recovery, migration, Paper/Live isolation และ ML Shadow restore | ผ่าน |
| Security | `test:security` 44/44: sandbox, IPC sender validation, canonical paths, CSP, credential hashing, media/webview restrictions และ MT5 transport policy | ผ่าน |
| App flow | `test:flow` 16/16 | ผ่าน |
| Trade Core | `test:trade` 84/84: account math, risk gates, audit, backtest, provenance, MT5 packet/reconciliation และ ML Shadow | ผ่าน |
| Architecture | Trade core อยู่ใน `js/core/trading`, external adapter อยู่ใน `js/services/trading`, UI orchestration อยู่ใน engine/app | ผ่าน |
| Build gate | release config และ packaged-artifact verifier ผ่าน | ผ่าน |
| Windows artifact | `CyberDeck-4.1.1-x64-win.exe`, packaged smoke exit 0 | ผ่าน |
| Artifact integrity | SHA-256 ใน `release-manifest.json` ตรงกับ installer และ blockmap | ผ่าน |

## สิ่งที่ยังไม่ผ่านการรับรอง

- ยังไม่ได้ติดตั้ง 4.1.1 ทับโปรแกรมที่ใช้งานอยู่; การติดตั้งต้องเป็นการตัดสินใจของผู้ใช้
- MT5 Demo gateway เป็น authenticated read-only Shadow infrastructure และ fail-closed แต่ยังไม่มีการรับรองกับบัญชี MT5 Demo จริงของผู้ใช้
- Local ML เรียนค่าน้ำหนักจริง แต่ผล holdout ล่าสุดมี balanced accuracy 50% จึงไม่ผ่าน evidence gate และไม่มีอำนาจต่อ Rule Score หรือคำสั่งเทรด
- Live execution ปิดและไม่มี live order route
- Release ยัง unsigned และไม่มี auto-update channel

## กฎสำหรับระยะถัดไป

1. ห้ามเปิด Demo decision influence จนกว่าโมเดลจะผ่าน repeated walk-forward, calibration, cost/slippage และ stability gate
2. ห้ามเปิด Live จากผล Demo ระยะสั้นหรือจากคะแนนจำลอง
3. การรับรอง MT5 ต้องใช้บัญชี Demo, authenticated main-process transport, reconciliation และ audit ที่ตรวจซ้ำได้
4. ทดสอบเฉพาะส่วนที่เปลี่ยนระหว่างพัฒนา และรัน checkpoint กว้างเฉพาะก่อนออกรุ่น

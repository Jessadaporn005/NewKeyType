# CyberDeck roadmap audit — 4.2.0

วันที่ตรวจ: 2026-08-20

## ผ่านแล้ว

- Baseline tag: `codex-baseline-20260820`
- User-data backups: pre-Codex และ pre-credential-migration
- Runtime: Paper-only; Demo/Live/fake broker fallback ปิดและ renderer เปิดเองไม่ได้
- Lifecycle: 18/18
- Persistence: 15/15
- Security: 48/48 รวม MT5 HMAC cross-language vector และ response tamper detection
- Trade Core: 93/93 รวม continuous MT5 Demo telemetry certification และ ML repeated walk-forward
- App Flow: 16/16
- Release configuration: ผ่าน
- Packaged artifact: ผ่าน; MT5 developer scripts ไม่เข้า ASAR
- Windows installer: `CyberDeck-4.2.0-x64-win.exe`
- Packaged smoke: exit 0
- Installer SHA-256: `e16aafe91bf6181a0bf6b48c011bb6d95a57c50f1e2c19bf324fccce8a6e4510`
- Blockmap SHA-256: `946278ad0cebf6ee2e5ebe1e78a81757e88c9a3c5a6bf7e60a197b8a656c470b`

## ยังไม่ผ่านการรับรอง

- ยังไม่ได้ติดตั้ง 4.2.0 ทับโปรแกรมที่ใช้อยู่
- ยังไม่มี continuous trace จากบัญชี MT5 Demo จริงของผู้ใช้
- MT5 certification ปัจจุบันรับรองได้เฉพาะ read-only telemetry Shadow ไม่ใช่ order execution
- ML Experiment 001/002 ไม่ผ่าน evidence gate; `promotionCandidate=false` และ `decisionInfluence=false`
- Live route ไม่มีอยู่และ Live capability ปิด
- Release unsigned และไม่มี auto-update

## กฎคงที่

- ห้ามใช้ trace ที่แก้ไขภายหลังเปิด Demo/Live; SHA-256 เป็นเพียง integrity reference ไม่ใช่ hardware attestation
- ห้ามลด ML gate หรือประเมิน dataset เดิมซ้ำเพื่อทำให้ผ่าน
- การทดสอบ MT5 จริงต้องเริ่มจากบัญชี Demo, HMAC transport, continuous session certification และ read-only Shadow เท่านั้น

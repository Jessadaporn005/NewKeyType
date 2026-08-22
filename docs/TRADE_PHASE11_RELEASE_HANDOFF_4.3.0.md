# Trade Phase 11 — Release, Install-over & Handoff 4.3.0

วันที่: 22 สิงหาคม 2026

## ผลตรวจ

- Trade core: 182/182 ผ่าน
- Persistence: 18/18 ผ่าน
- Security: 49/49 ผ่าน
- Runtime stability: 18/18 ผ่าน
- App flow: 16/16 ผ่าน
- Master features รวมโหมดเล่น: 244/244 ผ่าน
- Bounded Trade soak/fault injection: 5/5 กลุ่มผ่าน
- Release configuration: ผ่าน
- Packaged artifact allowlist/forbidden-file audit: ผ่าน
- Source Electron smoke: exit 0
- Packaged unpacked smoke: exit 0
- Installed 4.3.0 smoke: exit 0

## บั๊กที่พบระหว่าง Release QA

Smoke test รอบแรกค้างเพราะ Electron ถูกปฏิเสธ `realpath` ของ optional host root แล้ว exception เกิดก่อนเข้าสู่หน้าต่างหลัก แก้โดยตัด root ที่ canonicalize ไม่ได้ออกจาก allowlist แทนการยอมรับ path ที่ยังไม่ตรวจ ทำให้โปรแกรมเริ่มได้และไม่ลดการป้องกัน junction traversal

Master feature tests เดิมบางข้อยังคาดหวังข้อมูลความเก่ง/ประวัติสุ่มและ mock MT5 แบบเก่า จึงปรับ test ให้ตรวจความจริงของรุ่นปัจจุบัน: ค่าเริ่มต้นศูนย์, simulated news ไม่มีอิทธิพล, Fast-Train ถูกปิด, mock MT5 ไม่ผ่าน และ mastery ไม่มีเปอร์เซ็นต์ปลอม

## Artifact

- `release/CyberDeck-4.3.0-x64-win.exe`
  - 112,942,642 bytes
  - SHA-256 `6960e58f1064c13ed73c1758e3b012ae381a88728107cc317a4f753101afc35b`
- `release/CyberDeck-4.3.0-x64-portable.exe`
  - 112,654,654 bytes
  - SHA-256 `c3f9e2e19c68cbebff7dc4972bb8abfc51d67a90ccbb39d509f08dd48e21e978`
- Release channel เป็น manual unsigned, ไม่มี auto-update

## Install-over

- ติดตั้ง Silent ทับ `C:\Users\asus\AppData\Local\Programs\CyberDeck\CyberDeck.exe` สำเร็จ (exit 0)
- ตรวจ `app.asar` หลังติดตั้ง: version `4.3.0`
- ตรวจ runtime หลังติดตั้ง: `demoTradingEnabled=false`, `liveTradingEnabled=false`
- ฐานข้อมูลก่อนติดตั้งสำรองที่ `C:\Users\asus\AppData\Roaming\cyberdeck\backups\cyber_db.pre-4.3.0-25690822-174533.json`
- SHA-256 ฐานข้อมูล/backup เท่ากัน: `70EBF60DBE8FA37406651B2144DC980E33DF03D129ADEE7F3A007D253EE0BDB7`
- การติดตั้งไม่เปลี่ยนฐานข้อมูลผู้ใช้ (`PreservedByInstall=true`)

## External gates ที่ยังไม่ผ่าน

- ไม่พบ Ollama/Local model จึงยังไม่มี real LLM inference บนเครื่อง
- ไม่พบ MT5 XDemo, `terminal64.exe` หรือ Python `MetaTrader5`
- ยังไม่มี authenticated 30-second Demo telemetry trace และ real Demo order/reconciliation result
- ด้วยเหตุนี้ MT5 Demo execution และ Live execution ยังถูกล็อกอย่างตั้งใจ

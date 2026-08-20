# CyberDeck 4.1.0

รุ่นนี้เป็น manual unsigned Windows release และคงการทำงานแบบ Paper-only

## สิ่งที่เปลี่ยนหลัก

- แก้ lifecycle และการคืนทรัพยากรของโหมดต่าง ๆ
- เพิ่ม atomic profile persistence, backup recovery และการตรวจข้อมูลก่อน restore
- เพิ่ม Electron/IPC sender validation และลดสิทธิ์ renderer
- แยก Trade Core, market-data adapter, risk gate, backtest และ immutable Paper audit
- เพิ่ม authenticated read-only MT5 Demo Shadow gateway พร้อม reconciliation; ไม่มีคำสั่งซื้อขาย
- เพิ่ม Local ML Shadow ที่ฝึกจากข้อมูลแท่งปิดจริงและประเมินแบบ chronological holdout
- ML, Simulation Gym, ข่าวจำลอง และ MT5 Demo telemetry ไม่มีอำนาจต่อคำสั่งเทรด

## ข้อจำกัด

- Demo และ Live broker execution ปิดอยู่
- โมเดล ML ล่าสุดยังไม่ผ่าน evidence gate และคงสถานะ Shadow
- ไม่มี auto-update และยังไม่มี Authenticode code signing
- การติดตั้งรุ่นนี้ไม่ลบข้อมูลผู้ใช้ใน Electron `userData`

# Trade Phase 6 — Verified Paper Bot

สถานะซอร์ส: พัฒนาบนฐาน 4.2.0 ก่อนออกรุ่นใหม่

## สิ่งที่ทำจริง

- เพิ่ม `CLOSED_BAR_RULE_BOT_PAPER_ONLY_V1` และเปิด/ปิดจาก Simulation Gym ได้
- Bot เริ่มต้นเป็น OFF และไม่มีสิทธิ์ Live หรือ MT5 Demo broker
- เข้าได้เฉพาะ MarketPacket จริงที่ยืนยันแล้ว, แท่งปิดใหม่, BUY/SELL ที่ Rule Score ถึงเกณฑ์, Regime ผ่าน และมี Pattern ยืนยันในทิศเดียวกัน
- ป้องกันตัดสินใจซ้ำในแท่งเดิม และจำกัดหนึ่งสถานะต่อสินทรัพย์/สูงสุดสองสถานะของ Bot
- ความเสี่ยงเริ่มที่ 0.25% สำหรับ Paper สำรวจ และเพิ่มได้สูงสุด 0.5% เมื่อ Pattern มี forward outcomes ถึงเกณฑ์และ expectancy หลังต้นทุนเป็นบวก
- ตัดวงจรเมื่อขาดทุนรายวัน 2% หรือ drawdown 4%
- Kill Switch ปิด Bot และปิดเฉพาะสถานะ Paper ที่ Bot เป็นผู้เปิด
- AI Reader ถูกบันทึกประกอบการตรวจสอบเท่านั้น โดย `influence=false`
- ทุกการเปิด/ปฏิเสธ/ปิดถูกบันทึกใน Paper execution audit พร้อมแหล่ง `VERIFIED_PAPER_BOT`

## ข้อจำกัดที่ตั้งใจไว้

Bot นี้เป็นระบบ Paper จริงในโปรแกรม ไม่ใช่บัญชีเงินจริงและไม่ใช่ออเดอร์บน MT5 XDemo การเชื่อม Demo broker ต้องผ่าน Phase 7–8 และการรับรองกับโปรแกรม MT5 จริงก่อน

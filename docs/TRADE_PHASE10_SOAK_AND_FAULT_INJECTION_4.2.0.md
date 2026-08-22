# Trade Phase 10 — Bounded Soak & Fault Injection

คำสั่ง: `npm run test:trade-soak`

## ชุดทดสอบที่เพิ่ม

- 500 generation ของ market refresh ต้องแยกข้อมูลจริงกับ Simulation โดยไม่รั่วอำนาจ
- 300 ผลลัพธ์ AI ที่ผิด schema, อ้าง evidence ปลอม หรือใส่คำสั่งออเดอร์ ต้องถูกปฏิเสธทั้งหมด
- ประเมิน Bot ซ้ำ 1,000 ครั้งบนแท่งปิดเดิม ต้องไม่เปิดซ้ำ และ Kill Switch ต้องคงอำนาจ
- MT5 Demo packet 500 ชุดต้องต่อ sequence/reconcile ได้ และ packet replay ที่ฉีดเข้ามาต้องถูกปฏิเสธ
- ผลชนะ 200 ตัวอย่างที่ label overlap กันมากต้องไม่ทำให้ Pattern memory ผ่าน promotion

## ผลรอบตรวจวันที่ 22 สิงหาคม 2026

- 5/5 กลุ่มผ่าน
- ใช้เวลาประมาณ 43 ms
- heap เพิ่มประมาณ 0.44 MB ใน process ทดสอบ

นี่เป็น bounded deterministic soak ที่เน้นจุดเสียหายสูง ไม่ใช่การอ้างว่าได้ทดสอบ uptime หลายวันหรือ broker จริง

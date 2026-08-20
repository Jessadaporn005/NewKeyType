# CyberDeck 4.1.1

รุ่นแก้ไขต่อจาก 4.1.0 โดยคง manual unsigned และ Paper-only policy เดิม

## Lifecycle fix

- หยุด Virtual Network trace เมื่อออกจาก CLI
- พัก Cyber Intel market/news polling และ clock เมื่อ CLI ไม่ได้แสดง
- หยุด Threat Globe animation และ spawn timer เมื่อเปลี่ยนโหมด
- ยกเลิก Breach Protocol timer โดยไม่ให้รางวัลจากผลที่ยังไม่จบ
- ปิด CLI transient modal, camera stream และ packet timers เมื่อออกจาก CLI

Trade Core, MT5 Demo Shadow, Local ML Shadow และข้อจำกัดอื่นเหมือนรายละเอียดใน `RELEASE_NOTES_4.1.0.md`

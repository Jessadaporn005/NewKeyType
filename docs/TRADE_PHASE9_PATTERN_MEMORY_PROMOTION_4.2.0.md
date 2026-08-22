# Trade Phase 9 — Walk-forward Pattern Memory Promotion

สถานะซอร์ส: ทำงานอัตโนมัติหลังสร้าง Pattern Outcome Research Dataset

## เกณฑ์การมีอิทธิพลจริง

- ใช้เฉพาะ dataset ที่มาจากแหล่งยืนยันและไม่ใช่ Simulation
- ลบตัวอย่างที่ช่วง signal-to-label ซ้อนกันก่อนนับ observation
- ต้องเหลือตัวอย่างอิสระอย่างน้อย 60 รายการ
- แบ่งตามเวลาเป็น 4 fold และแต่ละ fold ต้องมีอย่างน้อย 10 รายการ
- อย่างน้อย 3/4 fold ต้องมี expectancy เป็นบวก
- expectancy รวมอย่างน้อย `+0.05R`, profit factor อย่างน้อย `1.1`
- Wilson lower bound ของ win rate อย่างน้อย 45%
- worst fold ต้องไม่ต่ำกว่า `-0.15R` และช่วง expectancy ระหว่าง fold ไม่เกิน `1R`
- ผ่าน lookahead audit และ next-bar entry audit

## การป้องกันข้อมูลบันทึกปลอม

- ข้อความ provenance เพียงอย่างเดียวไม่สามารถเปิดอิทธิพลได้อีกต่อไป
- ตอนเปิดโปรแกรม ระบบลบ memory ที่อ้างว่า validated ออกจากไฟล์บันทึก แล้วคำนวณใหม่จาก Pattern Dataset ที่ผ่านการ restore/validation
- memory ที่ผ่านมีผลต่อ Rule Score ได้ไม่เกินช่วงเดิม ±10 คะแนน และไม่ได้ให้สิทธิ์ Live/MT5
- หน้าจอ Pattern Research แสดงจำนวน memory ที่ผ่าน promotion จริง

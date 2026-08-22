# CyberDeck 4.5.0

## XM Demo Execution Certification

- เพิ่มเส้นทาง Demo canary แบบ one-shot สำหรับ XM Global MT5
- จำกัดคำสั่งที่ `0.01 lot` และหนึ่งครั้งต่อการเปิดโปรแกรม
- ต้องผ่าน verified closed-bar signal, Verified Paper Bot decision, telemetry certification และ broker preflight ก่อน
- ผู้ใช้ต้องพิมพ์ `XM DEMO 0.01`, กด Arm และกด Send แยกกัน
- Arm หมดอายุภายใน 30 วินาที; preflight receipt หมดอายุภายใน 90 วินาที
- โปรแกรมหลักถือ receipt/token และส่งข้อมูลที่ผ่าน allowlist ไปยัง executor; Renderer ไม่มี direct broker route

## Broker-side safety

- ยืนยัน XM Global, server `XMGlobal-*`, account login เดิม และ Demo trade mode อีกครั้งก่อนส่ง
- ต้องเปิด Algo Trading ใน MT5 และต้องไม่มี Position ค้างอยู่
- ตรวจ lot min/step, quote, SL/TP geometry, stop distance และ `order_check` ซ้ำก่อน `order_send`
- ไม่มี retry หลังเรียก `order_send`; ผลที่ไม่ชัดเจนจะล็อกระบบและให้ตรวจ MT5
- นับว่าผ่านเมื่อพบ Position ของ CyberDeck พร้อม SL/TP ตรงกันเท่านั้น
- Kill switch ล็อกเฉพาะคำสั่งใหม่ ไม่ปิด Position ที่มีอยู่โดยอัตโนมัติ

## Authority boundary

- มี `order_send` เพียงจุดเดียวใน packaged Demo executor
- Live execution และ simulated-success fallback ยังปิด
- AI Reader ยังเป็น Shadow-only; ผู้ตัดสินใจเข้า canary คือกฎ deterministic/Verified Paper Bot
- ยังไม่เปิด autonomous Demo trading จนกว่าจะส่ง canary จริงและเก็บ forward evidence ได้เพียงพอ

## Certification status

- Static, Trade core, Security และ mocked Arm/Send/reconciliation ผ่าน
- ยังไม่ได้ส่ง order จริงในรุ่นที่ build ขณะตลาด XM ปิด
- ขั้นรับรองสุดท้ายต้องทำตอนตลาดเปิด โดยผู้ใช้กด Send ด้วยตนเองและตรวจ ticket/SL/TP ใน XM MT5

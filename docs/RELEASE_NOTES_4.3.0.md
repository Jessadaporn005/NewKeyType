# CyberDeck 4.3.0

วันที่: 22 สิงหาคม 2026

## Trade foundation Phase 2–10

- ตรวจสุขภาพ market source, refresh อัตโนมัติ, retry/backoff, stale/race protection และหลักฐานต่อ request
- Pattern และ Market Regime ใช้หลักฐานแท่งปิดแบบยืนยัน พร้อม confirmation/invalidation ที่ตรวจย้อนกลับได้
- สร้าง Pattern Outcome Research Dataset แบบ next-bar entry, forward-only labels, MAE/MFE, costs และ conservative same-bar collision
- เพิ่ม Real Local AI Reader ผ่าน Ollama บน loopback ไม่ใช้ API key; คำตอบเป็น Shadow และไม่มีสิทธิ์ออเดอร์
- เพิ่ม Verified Paper Bot ที่เริ่มต้น OFF, ใช้ข้อมูลจริง/Pattern ยืนยัน, เสี่ยง 0.25–0.5%, จำกัด daily loss/drawdown และมี Kill Switch
- เพิ่ม MT5 XDemo readiness/certification UI และทำ observer แบบ HMAC ให้ใช้ได้กับ packaged app เมื่อเปิดด้วย environment ที่ชัดเจน
- เพิ่ม MT5 XDemo order-intent/ack/reconciliation gate แต่ release ยังปิด `demoTradingEnabled=false` จนกว่าจะรับรองกับ Terminal จริง
- Pattern memory จะมีผลได้หลังลบผลลัพธ์ซ้อน, ผ่านอย่างน้อย 60 ตัวอย่างและ 4 chronological folds; คำนวณใหม่จาก dataset เมื่อเปิดโปรแกรม
- เพิ่ม bounded soak/fault injection สำหรับ source authority, AI output, duplicate Bot decisions, MT5 replay และ overlapping labels

## ความจริงของระบบในรุ่นนี้

- Verified Paper Bot ใช้งานจริงภายใน Paper account ของโปรแกรม
- Local AI Reader ต้องติดตั้ง Ollama และโมเดลจริงก่อน จึงจะไม่มี fallback ที่แอบอ้างว่าเป็น AI
- เครื่องที่ Build รุ่นนี้ยังไม่มี Ollama และ MT5 XDemo จึงยังไม่มีผล real AI inference หรือ Demo broker execution certificate
- Live trading และ Demo broker execution ยังคงปิดใน runtime; ไม่มี simulated broker success fallback

# Trade Phase 14 — XM Demo One-shot Canary

## เป้าหมาย

พิสูจน์เส้นทาง `Verified Market → Rule/Paper Bot → Broker Preflight → XM Demo → ACK/Reconciliation` ด้วย Position ขนาดต่ำสุด โดยยังไม่อนุญาต Auto Trade หรือ Live Trade

## ลำดับที่ผู้ใช้เห็น

1. เปิด XM Global MT5 และล็อกอินบัญชี Demo โดยไม่ส่งรหัสให้ CyberDeck
2. เปิด `Algo Trading` ใน MT5 และตรวจว่าไม่มี Position ค้าง
3. เปิด Trade/XM Cockpit และรอ `XM DEMO OBSERVER CERTIFIED`
4. เปิด Verified Paper Bot และรอสัญญาณ BUY/SELL ที่ผ่านกฎ
5. กด `CHECK 0.01 CANARY • NO ORDER`
6. พิมพ์ `XM DEMO 0.01` และกด `ARM XM DEMO CANARY`
7. ตรวจ side, SL/TP และความเสี่ยงในหน้าจอ แล้วกด Send ภายใน 30 วินาที
8. ตรวจ ticket, volume 0.01, Magic 99001 และ SL/TP ใน XM MT5

## Gates ที่บังคับใช้

- exact broker/company/server/account/session binding
- exact symbol allowlist: GOLD, EURUSD, GBPUSD, OILCash
- fresh authenticated telemetry และ quote
- exact 0.01 lot และต้องเท่ากับ broker minimum volume
- zero open positions ก่อน canary
- short-lived random preflight receipt และ Arm token
- one canary per application session
- final `order_check` ก่อน one-shot `order_send`
- post-send Position + Protection reconciliation
- no retry on ambiguity และ Live authority เป็น false ทุกชั้น

## สิ่งที่ Kill switch ทำ

Kill switch ล้าง receipt/Arm token และบล็อกคำสั่งใหม่ทันที แต่ไม่ปิด Position เดิม เพราะการปิด Position เป็นการเปลี่ยนสถานะบัญชีอีกแบบหนึ่งที่ต้องออกแบบและรับรองแยกต่างหาก ผู้ใช้ยังควบคุม Position ใน XM MT5 ได้ตามปกติ

## เกณฑ์ผ่าน Phase

- ผู้ใช้เป็นคนกด Send ในตลาดเปิด
- XM ตอบ retcode สำเร็จ
- CyberDeck ได้ ticket และพบ Position 0.01 lot พร้อม SL/TP
- observer รับ Position เดิมกลับมาโดยไม่พบ unexpected ticket
- หลัง Position ปิด ต้องไม่มี order ซ้ำและระบบคงสถานะล็อก

หากข้อใดไม่ผ่าน ให้หยุดที่ Demo, ตรวจ Journal/Trade tab ใน MT5 และห้าม retry อัตโนมัติ

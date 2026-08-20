# CyberDeck 4.2.0

รุ่นนี้เป็น manual unsigned Windows release และยังคง Paper-only โดยสมบูรณ์

## Trade / ML Shadow

- เพิ่ม repeated purged expanding-window walk-forward 4 folds
- เพิ่ม class-balanced logistic objective ที่คำนวณน้ำหนักจาก training window เท่านั้น
- เพิ่ม sensitivity, specificity, predicted-side rate และ one-sided model-collapse gate
- persisted ML report ตรวจ training weights/boundaries และคำนวณ evidence gate ใหม่
- ผล BTC/ETH research ยังไม่ผ่าน promotion; ML ไม่มีน้ำหนักต่อ Rule Score หรือ order

## MT5 Demo Shadow

- เปลี่ยน localhost authentication จาก Bearer เป็น HMAC-SHA256 challenge/response
- request ใช้ timestamp + one-time nonce และไม่ส่ง shared secret ผ่าน HTTP
- main process ตรวจ HMAC ของ response body ก่อนส่งผ่าน IPC
- เพิ่ม continuous session certification: 31 packets/30 seconds, exact sequence, capture gap, account/session/symbol continuity และ reconciliation
- capture/certification scripts เป็น read-only developer toolsและไม่รวมใน installer

## Safety policy

- `demoTradingEnabled=false`
- `liveTradingEnabled=false`
- `allowSimulatedBrokerFallback=false`
- ไม่มี MT5 live executor, auto-update หรือ Authenticode signing
- ข้อมูลผู้ใช้อยู่ใน Electron user-data และไม่ถูกลบโดย installer/uninstaller

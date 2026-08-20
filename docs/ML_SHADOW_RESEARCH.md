# ML Shadow research log

สถานะ source tree: `4.2.0`

Local ML เป็น online logistic-direction model ที่ใช้เฉพาะ closed OHLCV bars และไม่มีอำนาจต่อ Rule Score, Paper order, MT5 Demo หรือ Live order

## วิธีประเมินปัจจุบัน

- Chronological 60/20/20 train-validation-test
- Purged embargo ตาม prediction horizon ระหว่างแต่ละช่วง
- Repeated expanding-window walk-forward 4 folds
- สร้าง model ใหม่ในแต่ละ fold
- เทียบ Brier score และ log loss กับ class-rate baseline
- ตรวจ balanced accuracy, sensitivity, specificity และ predicted-positive rate เพื่อจับ one-sided collapse
- Persisted report ต้องผ่าน schema/boundary validation และคำนวณ promotion gate ใหม่เสมอ

## ผล BTC/USDT 5m วันที่ 2026-08-20

ข้อมูล Binance closed bars ประมาณ 2,000 แท่ง, horizon 3 bars, round-trip cost threshold 12 bps

| Metric | ผล |
| --- | ---: |
| Holdout balanced accuracy | 50.0% |
| Holdout Brier | 0.247057 |
| Holdout baseline Brier | 0.248270 |
| Walk-forward folds | 4 |
| Walk-forward test examples | 214 |
| Walk-forward balanced accuracy | 50.0% |
| Walk-forward Brier | 0.245936 |
| Walk-forward baseline Brier | 0.245474 |
| Folds beating baseline Brier by required margin | 0/4 |
| Folds beating baseline log loss | 1/4 |
| Worst / best fold balanced accuracy | 50.0% / 50.0% |

Accuracy แบบทั่วไปอยู่ที่ 59.3% แต่ balanced accuracy 50% ทุก fold แสดงว่า model collapse ไปยังคำตอบฝั่งเดียวตาม class imbalance ไม่ใช่ predictive edge

## ข้อสรุป

- `promotionCandidate=false`
- `decisionInfluence=false`
- ห้ามแก้ threshold เพื่อทำให้ผลชุดนี้ผ่าน
- ขั้นวิจัยต่อไปต้องปรับ training objective เพื่อจัดการ class imbalance แล้วประเมินกับช่วงเวลาและสินทรัพย์ที่ถูกล็อกไว้ล่วงหน้า ไม่ใช้ชุดนี้ไล่จูนซ้ำ

งาน repeated walk-forward และ collapse gate ถูกรวมใน release `4.2.0` โดยยังคง Shadow-only

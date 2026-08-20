# ML experiment 002 — preregistration

บันทึกก่อนแก้ model และก่อนดึง evaluation dataset

## Hypothesis

Inverse-frequency class weighting ที่คำนวณจาก training examples เท่านั้นจะลด one-sided prediction collapse โดยไม่ใช้ข้อมูล validation/test คำนวณน้ำหนัก

## Locked implementation

- Model: logistic direction classifier
- Features: `RETURNS_TREND_RANGE_VOLUME_V1` เดิม
- Loss: train-only inverse-frequency weighted binary log loss
- Weight clamp: ใช้ขอบเขต model เดิม
- Horizon: 3 bars
- Round-trip cost threshold: 12 bps
- Holdout: chronological 60/20/20 พร้อม purge
- Repeated walk-forward: expanding-window 4 folds พร้อม purge

## Locked unseen evaluation dataset

- Source: Binance klines
- Asset: ETH/USDT
- Timeframe: 5m
- Requested bars: 2,000; ตัดแท่งล่าสุดที่อาจยังไม่ปิด
- ดึงและประเมินหนึ่งครั้งหลัง implementation/test ผ่าน

## Gate เดิมที่ห้ามลด

- Test balanced accuracy >= 52%
- Test Brier ดีกว่า baseline อย่างน้อย 0.005
- Walk-forward aggregate balanced accuracy >= 52%
- อย่างน้อย 3/4 folds ชนะ baseline Brier และ log loss ตามเกณฑ์เดิม
- ทุก fold ต้องมี predicted-positive rate 10%-90%
- Worst-fold balanced accuracy >= 48%
- Balanced-accuracy range <= 12 percentage points

ไม่ว่าผลเป็นอย่างไร Experiment 002 จะไม่ถูกจูนแล้วประเมินซ้ำกับ ETH dataset เดิม และ `decisionInfluence` ต้องคงเป็น `false`

## Locked result

ประเมินหนึ่งครั้งตามแผนด้วย Binance ETH/USDT 5m จำนวน 2,000 bars

| Metric | Result |
| --- | ---: |
| Holdout balanced accuracy | 54.63% |
| Holdout sensitivity / specificity | 36.92% / 72.34% |
| Holdout predicted UP rate | 33.04% |
| Holdout Brier / baseline | 0.251297 / 0.249760 |
| Holdout log loss / baseline | 0.695750 / 0.692666 |
| Walk-forward balanced accuracy | 53.00% |
| Walk-forward sensitivity / specificity | 69.63% / 36.38% |
| Walk-forward predicted UP rate | 66.67% |
| Worst / best fold balanced accuracy | 46.66% / 62.95% |
| Balanced-accuracy range | 16.29 percentage points |
| Non-degenerate folds | 3/4 |
| Folds beating baseline Brier | 1/4 |
| Folds beating baseline log loss | 2/4 |

Fold 4 predicted UP 100% จึงยังเกิด one-sided collapse ในบาง regime แม้ class-balanced loss ช่วยให้ holdout และ 3 folds แรกไม่ล้มเป็นคำตอบเดียว

ผลสรุป: `promotionCandidate=false`, `decisionInfluence=false` และ Experiment 002 ปิดโดยไม่ปรับ threshold หรือประเมิน ETH dataset นี้ซ้ำ

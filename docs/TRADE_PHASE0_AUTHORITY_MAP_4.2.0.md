# CyberDeck Trade Phase 0 — Freeze & Decision-Authority Map

วันที่ตรวจ: 2026-08-20 (Asia/Bangkok)
รุ่นที่ตรึง: 4.2.0
ขอบเขต: อ่าน ตรวจ สำรอง และจัดทำแผนที่เท่านั้น ไม่มีการเปลี่ยนพฤติกรรม runtime ของ Trade

## 1. จุดย้อนกลับที่ตรวจสอบแล้ว

| รายการ | ตำแหน่ง | SHA-256 |
|---|---|---|
| ฐานข้อมูลผู้ใช้ก่อน Phase 0 | `C:\Users\asus\AppData\Roaming\cyberdeck\backups\cyber_db.phase0-4.2.0-20260820-144026.json` | `55398D9944B4958CED3A2E2588E996AE95D685BD25E0CCA15FBA97101BD4B9E1` |
| ซอร์ส 4.2.0 ก่อน Phase 1 | `C:\Users\asus\AppData\Roaming\cyberdeck\backups\CyberDeck-source-4.2.0-phase0-20260820-144026.zip` | `0CF6D862A1D837F51728250D58D7EFA55D0B144327D332AC76D12AFFD42DF55E` |
| ตัวติดตั้ง 4.2.0 | `release\CyberDeck-4.2.0-x64-win.exe` | `E16AAFE91BF6181A0BF6B48C011BB6D95A57C50F1E2C19BF324FCCCE8A6E4510` |

ฐานข้อมูลและสำเนามีแฮชตรงกันก่อนเริ่มตรวจ ซอร์ส snapshot แยกอยู่นอก workspace เพื่อไม่ให้การพัฒนา Phase ถัดไปทับจุดย้อนกลับ

## 2. สถานะข้อมูลที่ตรึง

| ฟิลด์ | ค่า ณ จุด Freeze |
|---|---|
| Database format | `CYBERDECK_ATOMIC_JSON` schema 2 revision 73 |
| Profile schema | 6 |
| Paper domain | `PAPER_SIMULATION` |
| Paper account model | `BALANCE_MARGIN_SEPARATE_V1` |
| Paper balance | 100,000 USD |
| Manual positions / history / execution audit | 0 / 0 / 0 |
| Simulation Gym | 1,278 trades, 62,108 scenario observations, journal 50 |
| Strategy-weight entries | 9 observed, 0 ผ่าน provenance แบบ out-of-sample |
| Local ML Shadow | ยังไม่มี model/report ในฐานข้อมูล |
| ML decision authority | false |
| Live domain | `LIVE_BROKER` / `UNVERIFIED` / ไม่มี source |

ตัวเลข Simulation Gym ไม่ใช่หลักฐานว่าโมเดลเรียนจากตลาดจริง และห้ามนำไปใช้เป็นเกณฑ์ความเก่งของ Bot

## 3. เส้นทางอำนาจปัจจุบัน

```text
Binance REST snapshot หรือ random-walk fallback
                    ↓
       random simulated tick mutation (1.2s)
                    ↓
 indicators + simple chart-pattern rules + simulated spread
                    ↓
 deterministic rule score
          ┌─────────┴─────────┐
          ↓                   ↓
 legacy AI scenario       manual Paper account
 aiPositions              core risk + audit

ML Shadow ──────────────── zero decision influence
MT5 Demo observer ──────── zero decision influence
Simulated news ─────────── zero decision influence
Unvalidated memory ─────── zero decision influence
Live execution ─────────── hard disabled
```

## 4. แผนที่แหล่งข้อมูลและอำนาจ

| องค์ประกอบ | สิ่งที่ทำจริงใน 4.2.0 | Provenance | อำนาจปัจจุบัน | คำตัดสิน Phase 0 |
|---|---|---|---|---|
| Binance klines | ดึง OHLCV ผ่าน REST สำหรับ BTC, ETH, SOL และ PAXG proxy | Exchange snapshot แต่รวมแท่งที่อาจยังไม่ปิด | ใช้กับชุดกฎ, chart และ Paper | ใช้ต่อหลังมี closed-bar/source guard |
| XAU/USD | ใช้ PAXG/USDT เป็น proxy | ไม่ใช่ XAU/USD spot หรือราคา XM | ใช้กับชุดกฎและ Paper | ต้องแสดง proxy ชัดและห้ามเรียก XM feed |
| EUR/USD, GBP/USD, USOIL, NVDA, CYBER, QUANTUM | ไม่มี verified adapter | Random simulated fallback | ใช้กับชุดกฎและ Paper ได้ | กักไว้ Simulation Lab เท่านั้น |
| Random historical fallback | สร้าง random walk | `SIMULATED_FALLBACK` | ชุดกฎ, manual Paper และ legacy auto ใช้ได้ | ห้ามเข้า production decision path |
| Tick loop | สุ่มแก้ close/high/low ของแท่งล่าสุดทุก 1.2 วินาที | Synthetic แต่ `isRealFeed` ไม่ถูกลดสถานะ | มีผลต่อ signal, PnL และ auto scenario | ต้องแยก/ปิดใน Phase 1 |
| Spread | โมเดลสุ่มจาก base spread, candle range และข่าวที่ผ่าน policy | `SIMULATED_SPREAD_MODEL` | ราคาเข้า/ออก Paper และ risk veto | ใช้ได้เฉพาะสมมติฐาน Paper พร้อมป้ายชัด |
| News ticker | รายการข้อความ hard-coded หมุนทุก 12 วินาที | `SIMULATED_SCENARIO` | Policy ให้ score adjustment = 0 | คงได้ใน Simulation Lab; ไม่ใช่ข่าวสด |
| Knowledge stream | รายการ hard-coded ที่สร้าง timestamp ใหม่ | `SIMULATED_REFERENCE` | ไม่มี decision influence | ย้าย/กักใน Simulation Lab |
| Chart-pattern rules | Engulfing, pin bars, loose double bottom และ FVG heuristic | Deterministic rules | เพิ่ม/ลด rule score โดยตรง | เขียนใหม่พร้อม confirmation/evidence |
| Market regime | EMA/BB/spread heuristic | Deterministic rules | มีผลต่อคำแนะนำและ score | ใช้เป็น baseline หลังตรวจ closed bars |
| Strategy weights | มีค่าจากประวัติเดิมแต่ไม่มี provenance/OOS validation | Unverified/synthetic | `strategyMemoryPolicy` ปฏิเสธ จึงมีผล = 0 | เก็บเพื่อแสดงอดีตเท่านั้น แล้วแยกจาก Bot |
| Local ML Shadow | Logistic model ฝึกจาก real closed bars เมื่อผู้ใช้สั่ง evaluate | Real-history shadow | `decisionEligible=false` เสมอ | ฐานสำหรับ Challenger ใน Phase 5 |
| Rule backtest | Signal ตอน bar close, เข้า next bar, fees/slippage และ stop-first | ขึ้นกับ candle input | รายงานเท่านั้น | ใช้ต่อ แต่ต้องตรึง data provenance |
| Manual Paper | ใช้ core balance/margin/risk/protective orders/audit | Paper simulation | เปิด/ปิด Paper position จริงในฐานข้อมูล | ใช้ต่อหลัง source guard |
| Legacy automatic scenario | ใช้ `aiPositions` แยกจาก core Paper account | Synthetic/heuristic | เปิด/ปิด scenario positions อัตโนมัติ | ปิดอำนาจและย้ายไป Simulation Lab |
| MT5 Demo observer | HMAC authenticated, schema/freshness/session/reconciliation | ยังไม่มี MT5 บนเครื่อง | Shadow/read-only, influence = 0 | คง fail-closed จนถึง Phase 9 |
| Live execution | เมธอดคืน error และ runtime flags ปิด | ไม่มี broker session | ไม่มีอำนาจ | คงปิด |

## 5. ข้อค้นพบที่ต้องแก้ก่อนสร้าง AI Reader

### P0-01 — Verified feed ถูกเปลี่ยนด้วยข้อมูลสุ่มภายหลัง

`loadCandles()` ตั้ง `isRealFeed=true` หลังได้ Binance snapshot แต่ `simulateLiveTick()` แก้แท่งล่าสุดด้วย `Math.random()` ทุก 1.2 วินาทีโดยไม่เปลี่ยน provenance ป้ายจึงยังแสดง `DATA: EXCHANGE VERIFIED` ทั้งที่ข้อมูลตัดสินใจกลายเป็นแบบผสม

ผลกระทบ: signal, pattern, Paper PnL และ legacy auto scenario ไม่สามารถอ้างว่าใช้ exchange data ล้วน

### P0-02 — Legacy Auto Paper ข้าม Paper core

`checkAutoTradeExecution()` สร้าง `aiPositions` ด้วย fixed amount/leverage และไม่เรียก `openPosition(..., 'RULE_AUTO_PAPER')` จึงไม่ผ่าน core account, position sizing, paper risk gate หรือ immutable execution audit

ผลกระทบ: Auto mode ปัจจุบันเป็น scenario runner ไม่ใช่ autonomous Paper bot ที่ตรวจสอบได้

### P0-03 — ตัวเลขการเรียนรู้เพิ่มจากเวลาและผลสุ่ม

เมื่อ Auto scenario เปิด `samplesStudied` เพิ่มทุก synthetic tick ส่วน `runFastTrainingDrill()` ใช้ win probability ที่กำหนดไว้และสุ่มผลลัพธ์ `getSetupMastery()` คืนค่าความชำนาญแบบ hard-coded

ผลกระทบ: Level, Samples, Mastery และบางสถิติไม่ใช่หลักฐานการเรียนรู้ของโมเดล

### P0-04 — Pattern scanner ยังไม่มี confirmation geometry

Double Bottom ใช้เพียง low สองจุดที่ราคาใกล้กัน ไม่มี neckline breakout, ordering, intervening peak, invalidation หรือ closed-bar confirmation ส่วน FVG ถูกเรียกรวมกับ Order Block โดยยังไม่ได้พิสูจน์ Order Block

ผลกระทบ: false positive สูงและยังไม่เหมาะเป็นฐานความรู้ Bot

### P0-05 — UI บางช่องไม่รับค่าที่ engine ส่งจริง

UI อ่าน `signal.patterns`, `signal.marketRegime`, `signal.strategyPlaybook` และ `signal.riskWarning` แต่ signal ปัจจุบันส่ง `regime` และไม่ได้ส่งอีกสามฟิลด์ ทำให้บางช่องแสดง placeholder/fallback แม้ engine คำนวณข้อมูลอื่นแล้ว

### P0-06 — Manual Paper ยังรับ feed ที่เป็น simulation ได้

Manual Paper core มีคณิตศาสตร์และ audit ที่ดี แต่ไม่มี source eligibility guard การเลือก asset ที่ไม่มี adapter หรือการที่ Binance fetch ล้มเหลวจึงยังเปิด Paper order ได้

### P0-07 — Backtest provenance ยังไม่พอ

Backtest engine ป้องกัน lookahead ที่ระดับ execution แล้ว แต่ caller รายงานเพียงว่า runtime เคยได้ real feed หรือไม่ และอาจใช้แท่งที่ถูก synthetic tick mutation แล้ว

## 6. สิ่งที่ทำงานถูกทิศทางและควรรักษา

- Live และ Demo execution ถูกปิดแบบ fail-closed
- MT5 Demo packet ต้อง authenticated, fresh, ordered และ reconciled และยังไม่มี decision authority
- ข่าวจำลองไม่มีน้ำหนักต่อ signal เพราะ provenance policy
- Strategy memory ที่ไม่ผ่าน OOS validation ไม่มีน้ำหนักต่อ signal
- Local ML Shadow ฝึกบน closed bars แบ่ง chronological holdout และ purged walk-forward และยังไม่มี decision authority
- Paper account core แยก balance/margin/equity/free margin มี protective orders, automatic exits และ execution audit
- Backtest เข้า next-bar และคิด fees/slippage/drawdown แบบ conservative
- Persistence แยก Paper/Live และกู้คืนข้อมูลแบบตรวจ schema

## 7. ขอบเขตที่อนุมัติไว้สำหรับ Phase 1

Phase 1 ต้องไม่สร้าง Bot หรือเพิ่ม Pattern ใหม่ก่อนปิดช่องข้อมูลดังนี้:

1. สร้าง `MarketPacketV1` ที่มี source, symbol, timeframe, observedAt, barClosed, dataAge, quality, simulation flag และ decision eligibility
2. ตรวจ OHLCV, ลำดับเวลา, duplicate/gap และแท่งที่กำลังก่อตัว
3. ห้าม random fallback และ synthetic tick เข้าสู่ production decision path
4. แยก chart animation/simulation ออกจาก canonical decision candles
5. ปิด legacy automatic scenario จาก decision authority และห้ามสร้าง `aiPositions` ในเส้นทาง Bot ใหม่
6. ให้ manual Paper รู้ชัดว่าเป็น verified-data Paper หรือ Simulation Lab
7. ให้ backtest บันทึก provenance แบบ immutable ต่อชุดข้อมูล
8. ทำ UI source badge จาก canonical packet แทน boolean `isRealFeed`

## 8. Acceptance Gate สำหรับ Phase 1

- Snapshot เดิมต้องไม่เปลี่ยนเมื่อเวลาผ่านไปโดยไม่มีข้อมูลจาก source ใหม่
- แท่งที่ยังไม่ปิดต้องถูกระบุและไม่มีสิทธิ์เป็น training label
- Synthetic/fallback packet ต้องมี `decisionEligible=false`
- Asset ที่ไม่มี verified adapter ต้องไม่แสดง `EXCHANGE VERIFIED`
- Auto Bot path ต้องไม่สามารถสร้าง position โดยข้าม core Paper risk/audit
- การสลับ source หรือ source ล้มเหลวต้องปรากฏใน UI และ audit
- ชุดทดสอบต้องครอบคลุม real, stale, future, malformed, out-of-order, duplicate, forming-bar และ synthetic packet

## 9. สถานะ Phase 0

- จุดย้อนกลับ: ผ่าน
- ฐานข้อมูลสำรอง: ผ่านและ hash ตรง
- Source snapshot: ผ่าน
- Decision-authority inventory: เสร็จ
- Runtime Trade changes: ไม่มี
- ชุดทดสอบ runtime: ไม่รัน เพราะ Phase 0 ไม่มี code-path change
- พร้อมเริ่ม Phase 1: พร้อม

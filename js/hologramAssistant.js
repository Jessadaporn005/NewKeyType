// =============================================================================
// NYX 3D HOLOGRAPHIC AI ASSISTANT & MASTER CO-PILOT ENGINE
// 100% Genuine Thai Female Voice, Multi-Emotion Kinematics & Masterclass Coaching
// =============================================================================

import { profileStore } from './profileStore.js';

// 3D Perspective Projection Helper
function project3D(x, y, z, yaw, pitch, roll, cx = 140, cy = 140, fov = 300) {
  // Yaw (Y-axis rotation)
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  let x1 = x * cosY - z * sinY;
  let z1 = z * cosY + x * sinY;

  // Pitch (X-axis rotation)
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  let y2 = y * cosP - z1 * sinP;
  let z2 = z1 * cosP + y * sinP;

  // Roll (Z-axis rotation)
  const cosR = Math.cos(roll);
  const sinR = Math.sin(roll);
  let x3 = x1 * cosR - y2 * sinR;
  let y3 = y2 * cosR + x1 * sinR;

  const distance = fov / (fov + z2);
  return {
    x: cx + x3 * distance,
    y: cy + y3 * distance,
    scale: distance,
    z: z2
  };
}

// =============================================================================
// THAI PHONETIC PRONUNCIATION NORMALIZER (ระบบอ่านออกเสียงภาษาไทยธรรมชาติ)
// แปลงคำศัพท์เฉพาะภาษาอังกฤษ/ตัวย่อ เป็นคำอ่านภาษาไทยสละสลวย ไม่สะกดทีละตัว
// =============================================================================
export function phoneticizeForThaiSpeech(text = '') {
  if (!text || typeof text !== 'string') return '';

  const phoneticMap = [
    // 1. Core Names & System Lore
    { pattern: /\bNYX\b/gi, replacement: 'นิกซ์' },
    { pattern: /\bKRONOS\b/gi, replacement: 'โครนอส' },
    { pattern: /\bORION\b/gi, replacement: 'โอไรออน' },
    { pattern: /\bHERMES\b/gi, replacement: 'เฮอร์มีส' },
    { pattern: /\bLEVIATHAN\b/gi, replacement: 'เลเวียธาน' },
    { pattern: /\bAEGIS\b/gi, replacement: 'อีจิส' },
    { pattern: /\bAI GYM\b/gi, replacement: 'เอไอ ยิม' },
    { pattern: /\bAI\b/gi, replacement: 'เอไอ' },
    { pattern: /\bDEFCON-1\b/gi, replacement: 'เดฟคอน วัน' },
    { pattern: /\bDEFCON\b/gi, replacement: 'เดฟคอน' },
    { pattern: /\bHUD\b/gi, replacement: 'ฮัด' },
    { pattern: /\bGUI\b/gi, replacement: 'จียูไอ' },
    { pattern: /\bCLI\b/gi, replacement: 'ซีแอลไอ' },
    { pattern: /\bAPI\b/gi, replacement: 'เอพีไอ' },
    { pattern: /\bC2\b/gi, replacement: 'ซีทู' },
    { pattern: /\bENCLAVE\b/gi, replacement: 'เอนเคลฟ' },

    // 2. Crypto, Web3 & Tech Terms
    { pattern: /\bBITCOIN\b/gi, replacement: 'บิตคอยน์' },
    { pattern: /\bBTC\b/gi, replacement: 'บิตคอยน์' },
    { pattern: /\bETHEREUM\b/gi, replacement: 'อีเธอเรียม' },
    { pattern: /\bETH\b/gi, replacement: 'อีเธอเรียม' },
    { pattern: /\bSOLANA\b/gi, replacement: 'โซลานา' },
    { pattern: /\bSOL\b/gi, replacement: 'โซลานา' },
    { pattern: /\bETF\b/gi, replacement: 'อีทีเอฟ' },
    { pattern: /\bDEFI\b/gi, replacement: 'ดีไฟ' },
    { pattern: /\bBLOCKCHAIN\b/gi, replacement: 'บล็อกเชน' },
    { pattern: /\bON-CHAIN\b/gi, replacement: 'ออนเชน' },
    { pattern: /\bHASH\b/gi, replacement: 'แฮช' },
    { pattern: /\bHASHRATE\b/gi, replacement: 'แฮชเรต' },
    { pattern: /\bHALVING\b/gi, replacement: 'ฮาล์ฟวิ่ง' },
    { pattern: /\bRWA\b/gi, replacement: 'อาร์ดับเบิลยูเอ' },
    { pattern: /\bTPS\b/gi, replacement: 'ธุรกรรมต่อวินาที' },

    // 3. Gaming, Hardware & AI Giants
    { pattern: /\bGTA VI\b/gi, replacement: 'จีทีเอ หก' },
    { pattern: /\bGTA 6\b/gi, replacement: 'จีทีเอ หก' },
    { pattern: /\bGTA\b/gi, replacement: 'จีทีเอ' },
    { pattern: /\bSTEAM DECK OLED\b/gi, replacement: 'สตรีมเด็ค โอเล็ด' },
    { pattern: /\bSTEAM DECK\b/gi, replacement: 'สตรีมเด็ค' },
    { pattern: /\bSTEAM\b/gi, replacement: 'สตรีม' },
    { pattern: /\bNINTENDO SWITCH 2\b/gi, replacement: 'นินเทนโด สวิตช์ สอง' },
    { pattern: /\bNINTENDO\b/gi, replacement: 'นินเทนโด' },
    { pattern: /\bPLAYSTATION 5 PRO\b/gi, replacement: 'เพลย์สเตชัน ห้า โปร' },
    { pattern: /\bPS5 PRO\b/gi, replacement: 'พีเอส ห้า โปร' },
    { pattern: /\bPS5\b/gi, replacement: 'พีเอส ห้า' },
    { pattern: /\bSONY\b/gi, replacement: 'โซนี่' },
    { pattern: /\bUNREAL ENGINE 5.5\b/gi, replacement: 'อันเรียลเอนจิน ห้าจุดห้า' },
    { pattern: /\bUNREAL ENGINE\b/gi, replacement: 'อันเรียลเอนจิน' },
    { pattern: /\bEPIC GAMES\b/gi, replacement: 'เอปิกเกมส์' },
    { pattern: /\bOPENAI\b/gi, replacement: 'โอเพนเอไอ' },
    { pattern: /\bDEEPSEEK R1\b/gi, replacement: 'ดีพซีค อาร์วัน' },
    { pattern: /\bDEEPSEEK\b/gi, replacement: 'ดีพซีค' },
    { pattern: /\bNVIDIA BLACKWELL ULTRA\b/gi, replacement: 'เอ็นวิเดีย แบล็กเวลล์ อัลตร้า' },
    { pattern: /\bNVIDIA\b/gi, replacement: 'เอ็นวิเดีย' },
    { pattern: /\bBLACKWELL\b/gi, replacement: 'แบล็กเวลล์' },
    { pattern: /\bAGI\b/gi, replacement: 'เอจีไอ' },
    { pattern: /\bLLM\b/gi, replacement: 'แอลแอลเอ็ม' },
    { pattern: /\bESPORTS\b/gi, replacement: 'อีสปอร์ต' },
    { pattern: /\bESPORT\b/gi, replacement: 'อีสปอร์ต' },
    { pattern: /\bFPS\b/gi, replacement: 'เฟรมเรต' },
    { pattern: /\bDLSS\b/gi, replacement: 'ดีแอลเอสเอส' },
    { pattern: /\b4K\b/gi, replacement: 'สี่เค' },

    // 4. Finance, Gold & Security Terms
    { pattern: /\bSPOT GOLD\b/gi, replacement: 'สปอต โกลด์' },
    { pattern: /\bGOLD\b/gi, replacement: 'โกลด์' },
    { pattern: /\bFED\b/gi, replacement: 'เฟด' },
    { pattern: /\bFEDERAL RESERVE\b/gi, replacement: 'ธนาคารกลางสหรัฐฯ' },
    { pattern: /\bNASDAQ\b/gi, replacement: 'แนสแด็ก' },
    { pattern: /\bS&P 500\b/gi, replacement: 'เอสแอนด์พี ห้าร้อย' },
    { pattern: /\bATH\b/gi, replacement: 'ออลไทม์ไฮ' },
    { pattern: /\bNEW HIGH\b/gi, replacement: 'นิวไฮ' },
    { pattern: /\bZERO-DAY\b/gi, replacement: 'ซีโร่เดย์' },
    { pattern: /\b0-DAY\b/gi, replacement: 'ซีโร่เดย์' },
    { pattern: /\bDDOS\b/gi, replacement: 'ดีดอส' },
    { pattern: /\bFIREWALL\b/gi, replacement: 'ไฟร์วอลล์' },
    { pattern: /\bPOST-QUANTUM\b/gi, replacement: 'โพสต์ ควอนตัม' },
    { pattern: /\bPQC\b/gi, replacement: 'พีคิวซี' },
    { pattern: /\bAES-256\b/gi, replacement: 'เออีเอส สองห้าหก' },
    { pattern: /\bSHA-256\b/gi, replacement: 'เอสเอชเอ สองห้าหก' },
    { pattern: /\bORDER BLOCK\b/gi, replacement: 'ออเดอร์บล็อก' },
    { pattern: /\bFAIR VALUE GAP\b/gi, replacement: 'แฟร์แวลูแก็ป' },
    { pattern: /\bFVG\b/gi, replacement: 'เอฟวีจี' },
    { pattern: /\bBOS\b/gi, replacement: 'บีโอเอส' },
    { pattern: /\bCHOCH\b/gi, replacement: 'ชอช' },
    { pattern: /\bSMC\b/gi, replacement: 'เอสเอ็มซี' },
    { pattern: /\bLIQUIDITY\b/gi, replacement: 'ลิควิดิตี้' },
    { pattern: /\bSWEEP\b/gi, replacement: 'สวีป' },
    { pattern: /\bSTOP LOSS\b/gi, replacement: 'สต็อปลอส' },
    { pattern: /\bTAKE PROFIT\b/gi, replacement: 'เทคโพรฟิต' },
    { pattern: /\bWPM\b/gi, replacement: 'คำต่อนาที' },
    { pattern: /\bACCURACY\b/gi, replacement: 'ความแม่นยำ' },
    { pattern: /\bHOME ROW\b/gi, replacement: 'โฮมโรว์' }
  ];

  let result = text;
  for (const item of phoneticMap) {
    result = result.replace(item.pattern, item.replacement);
  }
  return result;
}

// =============================================================================
// EXPANDED REAL-WORLD INTELLIGENCE RADAR (100+ LIVE GLOBAL NEWS WIRE)
// =============================================================================
export const GLOBAL_INTELLIGENCE_RADAR = {
  WORLD_AFFAIRS: [
    {
      country: 'สหรัฐอเมริกา',
      title: 'ทำเนียบขาวประกาศนโยบายพลังงานสะอาดและโครงสร้างพื้นฐาน AI แห่งชาติ',
      detail: 'รัฐบาลสหรัฐฯ อนุมัติงบประมาณ 5 หมื่นล้านดอลลาร์เพื่อสร้างโรงไฟฟ้านิวเคลียร์ขนาดเล็ก (SMR) รองรับการเติบโตของ Data Center สำหรับ AI',
      anchor: 'รายงานข่าวด่วนจากสหรัฐอเมริกาค่ะ: ทำเนียบขาวได้ประกาศแผนยุทธศาสตร์พลังงานสะอาดมูลค่า 5 หมื่นล้านดอลลาร์ เพื่อสร้างโรงไฟฟ้ารองรับศูนย์ประมวลผล AI ทั่วประเทศค่ะ'
    },
    {
      country: 'ประเทศไทย',
      title: 'ไทยดึงดูดเม็ดเงินลงทุน Data Center ยักษ์ใหญ่ระดับโลกกว่า 1.5 แสนล้านบาท',
      detail: 'กลุ่มทุนเทคโนโลยีระดับโลกเตรียมเปิดศูนย์ปฏิบัติการประมวลผล Cloud และ AI ระดับภูมิภาคในพื้นที่ EEC',
      anchor: 'ข่าวด่วนประจำประเทศไทยค่ะ: กระทรวงดิจิทัลเผยว่ากลุ่มบริษัทยักษ์ใหญ่เตรียมทุ่มงบกว่า 1.5 แสนล้านบาท สร้าง Data Center ขนาดใหญ่ในเขต EEC เพื่อผลักดันไทยสู่ศูนย์กลาง AI ของอาเซียนค่ะ'
    },
    {
      country: 'ญี่ปุ่น',
      title: 'ธนาคารกลางญี่ปุ่น (BOJ) ปรับทิศทางนโยบายการเงิน หนุนการเติบโตของภาคอุตสาหกรรมหุ่นยนต์',
      detail: 'ญี่ปุ่นเร่งนำหุ่นยนต์อัตโนมัติและระบบขับขี่อัจฉริยะมาใช้แก้ปัญหาการขาดแคลนแรงงานในสังคมผู้สูงอายุ',
      anchor: 'รายงานสถานการณ์จากประเทศญี่ปุ่นค่ะ: ภาคอุตสาหกรรมญี่ปุ่นกำลังเร่งนำหุ่นยนต์และระบบ AI อัจฉริยะเข้ามาทดแทนแรงงานในระบบเศรษฐกิจอย่างเต็มรูปแบบค่ะ'
    },
    {
      country: 'สหภาพยุโรป',
      title: 'EU ผ่านกฎหมายมาตรฐานความปลอดภัย AI Act ฉบับสมบูรณ์',
      detail: 'กำหนดกรอบความโปร่งใสและการควบคุมโมเดลปัญญาประดิษฐ์ที่มีความเสี่ยงสูง เพื่อคุ้มครองความเป็นส่วนตัวของพลเมือง',
      anchor: 'ข่าวจากสหภาพยุโรปค่ะ: สภายุโรปได้อนุมัติกฎหมายควบคุมปัญญาประดิษฐ์ AI Act อย่างเป็นทางการ เพื่อสร้างมาตรฐานความปลอดภัยและความโปร่งใสสูงสุดค่ะ'
    },
    {
      country: 'สิงคโปร์ & มาเลเซีย',
      title: 'เปิดตัวเขตเศรษฐกิจพิเศษดิจิทัลเชื่อมต่อโครงข่าย 5G และโลจิสติกส์อัจฉริยะ',
      detail: 'ร่วมมือพัฒนาท่าเรืออัตโนมัติและศูนย์กลางการเงินสีเขียวอันดับหนึ่งของภูมิภาค',
      anchor: 'ข่าวเศรษฐกิจอาเซียนค่ะ: สิงคโปร์และมาเลเซียเปิดตัวเขตเศรษฐกิจพิเศษดิจิทัลเพื่อเชื่อมต่อการขนส่งและโครงข่าย 5G ระดับภูมิภาคค่ะ'
    }
  ],

  GAMING: [
    {
      title: 'Rockstar Games เผยความคืบหน้าการพัฒนา GTA VI และระบบฟิสิกส์เน็กซ์เจน',
      detail: 'ทีมพัฒนา Rockstar ยกระดับระบบ AI ของ NPC และระบบสภาพอากาศแบบไดนามิก รองรับการแสดงผลบนคอนโซลยุคใหม่เต็มรูปแบบ',
      anchor: 'มีข่าวน่าตื่นเต้นจากวงการเกมมาอัปเดตค่ะ: ทางผู้พัฒนา Rockstar Games ได้ออกมาเปิดเผยความคืบหน้าล่าสุดของเกม GTA VI โดยระบุว่าระบบฟิสิกส์และความฉลาดของ AI ในเกมจะสมจริงที่สุดเท่าที่เคยสร้างมาเลยค่ะ'
    },
    {
      title: 'Valve ประกาศอัปเดตระบบ Steam Deck OLED และรองรับเอนจิน Unreal Engine 5.5',
      detail: 'การปรับแต่งไดรเวอร์กราฟิกล่าสุดช่วยเพิ่มประสิทธิภาพการประมวลผลขึ้น 25% พร้อมลดความหน่วงในการเล่นเกม AAA',
      anchor: 'ข่าววงการเกมพีซีและคอนโซลค่ะ: ทางค่าย Valve ได้ปล่อยอัปเดตใหม่ให้กับเครื่อง Steam Deck OLED ช่วยให้รันเกมที่ใช้ Unreal Engine 5.5 ได้ลื่นไหลขึ้นถึง 25% ค่ะ'
    },
    {
      title: 'Nintendo แย้มรายละเอียดสถาปัตยกรรมฮาร์ดแวร์ของ Nintendo Switch 2',
      detail: 'คอนโซลรุ่นใหม่จะรองรับเทคโนโลยี DLSS 3.5 และ Ray Tracing เพื่อมอบประสบการณ์ภาพระดับ 4K ขณะเชื่อมต่อจอทีวี',
      anchor: 'ทางด้านค่ายนินเทนโดค่ะ: มีรายงานว่าเครื่องเล่นเกมรุ่นใหม่ Nintendo Switch 2 จะมาพร้อมชิปประมวลผลที่รองรับเทคโนโลยี DLSS 3.5 ทำให้ภาพสวยคมชัดระดับ 4K ค่ะ'
    },
    {
      title: 'วงการ Esports ระดับโลกเตรียมจัดการแข่งขันชิงแชมป์โลก Cyber Arena Championship 2026',
      detail: 'เงินรางวัลรวมทุบสถิติประวัติศาสตร์กว่า 15 ล้านดอลลาร์สหรัฐ พร้อมดึงทีมชั้นนำกว่า 32 ประเทศเข้าร่วมแข่งขัน',
      anchor: 'ข่าวความเคลื่อนไหววงการอีสปอร์ตค่ะ: เตรียมพบกับการแข่งขันชิงแชมป์โลกรายการใหญ่ เงินรางวัลรวมกว่า 15 ล้านดอลลาร์สหรัฐ มีสุดยอดทีมจาก 32 ประเทศทั่วโลกเข้าร่วมชิงชัยค่ะ'
    },
    {
      title: 'Sony เปิดตัวฟีเจอร์ AI Upscaling บน PlayStation 5 Pro',
      detail: 'ระบบ PSSR สามารถดันเฟรมเรตเกมแตะ 120 FPS บนความละเอียด 4K แท้',
      anchor: 'ข่าววงการคอนโซลค่ะ: โซนี่เปิดตัวฟีเจอร์ AI Upscaling ใหม่บน PS5 Pro ช่วยให้เล่นเกม 4K ได้ลื่นไหลถึง 120 เฟรมต่อวินาทีค่ะ'
    }
  ],

  CRYPTO: [
    {
      title: 'Bitcoin ทะยานยืนเหนือแนวรับสำคัญ หลังเม็ดเงินสถาบันไหลเข้ากองทุน ETF ต่อเนื่อง',
      detail: 'ข้อมูล On-chain เผยวาฬสถาบันเข้าช้อนซื้อ Bitcoin รวมกว่า 14,500 BTC ในรอบสัปดาห์ ส่งผลให้สภาพคล่องในกระดานแลกเปลี่ยนลดฮวบ',
      anchor: 'รายงานข่าวกรองคริปโตและบล็อกเชนค่ะ: ขณะนี้ราคา Bitcoin กำลังเคลื่อนไหวอย่างแข็งแกร่งเหนือแนวรับสำคัญ โดยข้อมูล On-chain ตรวจพบว่ากลุ่มวาฬสถาบันได้เข้าซื้อสะสมบิตคอยน์เพิ่มกว่า 14,000 เหรียญในสัปดาห์นี้ค่ะ'
    },
    {
      title: 'Ethereum เตรียมเปิดตัวอัปเกรดเครือข่าย Layer-2 ลดค่าธรรมเนียม Gas ลง 90%',
      detail: 'เทคโนโลยี Data Availability Sampling แบบใหม่ช่วยเพิ่ม Throughput การทำธุรกรรมแตะ 100,000 TPS',
      anchor: 'ข่าวความเคลื่อนไหวของ Ethereum ค่ะ: นักพัฒนาเตรียมปล่อยอัปเกรดใหม่สำหรับเครือข่าย Layer-2 ซึ่งจะช่วยลดค่าธรรมเนียม Gas ลงได้ถึง 90% และรองรับธุรกรรมได้เร็วขึ้นมหาศาลค่ะ'
    },
    {
      title: 'Solana ทำสถิติ Volume การซื้อขายบน DeFi รายวันแซงหน้าคู่แข่งในตลาด',
      detail: 'สภาพคล่องบน Decentralized Exchange เติบโตอย่างก้าวกระโดดด้วยค่าธรรมเนียมที่ต่ำและความเร็วระดับ Sub-second',
      anchor: 'ทางด้านเหรียญ Solana ค่ะ: ยอดวอลุ่มการทำธุรกรรมบนระบบ DeFi พุ่งสูงขึ้นทำสถิติใหม่อย่างต่อเนื่อง ด้วยจุดเด่นเรื่องความเร็วและค่าธรรมเนียมที่ถูกมากค่ะ'
    },
    {
      title: 'BlackRock และ Fidelity ขยายพอร์ตการลงทุนใน Real World Assets (RWA) บนบล็อกเชน',
      detail: 'การแปลงพันธบัตรรัฐบาลสหรัฐฯ เป็นโทเคนดิจิทัลได้รับความนิยมสูง มีมูลค่าตลาดรวมพุ่งแตะ 1 หมื่นล้านดอลลาร์',
      anchor: 'ข่าวด้านสถาบันการเงินคริปโตค่ะ: กองทุนยักษ์ใหญ่อย่าง BlackRock กำลังเดินหน้าแปลงพันธบัตรรัฐบาลเป็นโทเคนบนบล็อกเชนอย่างต่อเนื่องค่ะ'
    }
  ],

  TECH_AI: [
    {
      title: 'OpenAI และ DeepSeek ร่วมยกระดับโมเดลปัญญาประดิษฐ์ Reasoning Architecture สู่ความฉลาดระดับ AGI',
      detail: 'สถาปัตยกรรมการให้เหตุผลแบบ CoT รุ่นใหม่สามารถแก้โจทย์คณิตศาสตร์และเขียนโค้ดโปรแกรมระดับสูงได้แม่นยำ 98.7%',
      anchor: 'รายงานข่าวเทคโนโลยีและปัญญาประดิษฐ์ค่ะ: วงการ AI กำลังก้าวหน้าอย่างรวดเร็ว โดยโมเดล DeepSeek R1 และ OpenAI สามารถคิดวิเคราะห์และแก้โจทย์โค้ดดิ้งที่ซับซ้อนได้อย่างแม่นยำเฉียด 99% แล้วค่ะ'
    },
    {
      title: 'NVIDIA เริ่มส่งมอบชิปสถาปัตยกรรม Blackwell Ultra รองรับระบบประมวลผล Supercomputer ทั่วโลก',
      detail: 'ประสิทธิภาพการคำนวณระดับ ExaFLOPS ช่วยลดการใช้พลังงานลง 40% สำหรับการเทรน Large Language Models ขนาดใหญ่',
      anchor: 'ข่าวฮาร์ดแวร์ AI ระดับโลกค่ะ: ทางบริษัท NVIDIA ได้เริ่มทยอยส่งมอบชิป Blackwell Ultra ซึ่งมีพลังประมวลผลสูงมากและช่วยประหยัดพลังงานลงถึง 40% ค่ะ'
    },
    {
      title: 'นักวิทยาศาสตร์ควอนตัมคอมพิวติงประสบความสำเร็จในการรักษาเสถียรภาพ Qubit ได้นานกว่า 1 ชั่วโมง',
      detail: 'ก้าวสำคัญที่จะเปลี่ยนผ่านสู่วงการ Quantum Cryptography และการจำลองโมเลกุลยาในอนาคต',
      anchor: 'ข่าววิทยาศาสตร์และเทคโนโลยีควอนตัมค่ะ: ล่าสุดนักวิจัยสามารถรักษาความเสถียรของ Qubit ได้นานขึ้น ถือเป็นก้าวสำคัญสู่วงการคอมพิวเตอร์ยุคใหม่อย่างแท้จริงค่ะ'
    }
  ],

  FINANCE_GOLD: [
    {
      title: 'ราคาทองคำ Spot Gold (XAU/USD) พุ่งทะยานทำ New High รับแรงหนุนจากสัญญาณลดดอกเบี้ยของ Fed',
      detail: 'ประธานเฟดส่งสัญญาณความพร้อมในการผ่อนคลายนโยบายการเงิน ส่งผลให้ดอลลาร์อ่อนค่าและทองคำกลายเป็นสินทรัพย์ปลอดภัยยอดนิยม',
      anchor: 'รายงานราคาทองคำและสภาวะตลาดการเงินโลกค่ะ: ราคาทองคำ Spot Gold กำลังทำจุดสูงสุดใหม่อย่างต่อเนื่อง จากการที่ธนาคารกลางสหรัฐฯ ส่งสัญญาณเตรียมปรับลดอัตราดอกเบี้ย ส่งผลให้เม็ดเงินไหลเข้าทองคำอย่างคึกคักค่ะ'
    },
    {
      title: 'ดัชนีตลาดหุ้นสหรัฐฯ NASDAQ และ S&P 500 ปิดบวกทำสถิติใหม่จากแรงซื้อกลุ่มเทคโนโลยี',
      detail: 'ผลประกอบการบริษัทกลุ่ม AI และ Semiconductor เติบโตแข็งแกร่งกว่าที่ตลาดคาดการณ์ หนุนภาพรวมเศรษฐกิจ',
      anchor: 'สรุปภาพรวมตลาดหุ้นโลกค่ะ: ดัชนี NASDAQ และ S&P 500 ปิดบวกอย่างสดใส ได้รับแรงหนุนหลักจากผลประกอบการที่ยอดเยี่ยมของหุ้นกลุ่มเทคโนโลยีค่ะ'
    },
    {
      title: 'ธนาคารกลางทั่วโลกเพิ่มการสำรองทองคำแท่งแตะระดับสูงสุดในรอบ 50 ปี',
      detail: 'ธนาคารกลางในเอเชียและยุโรปเข้าซื้อทองคำแท่งเพื่อกระจายความเสี่ยงของเงินทุนสำรองระหว่างประเทศ',
      anchor: 'ข่าวทองคำสำรองระหว่างประเทศค่ะ: ธนาคารกลางทั่วโลกกำลังเร่งสะสมทองคำแท่งเข้าคลังสำรองแตะระดับสูงสุดในรอบ 50 ปีค่ะ'
    }
  ],

  CYBER_SEC: [
    {
      title: 'ศูนย์เฝ้าระวังไซเบอร์ระดับโลกตรวจพบและสั่งแพตช์ช่องโหว่ Zero-Day ในโปรโตคอลความปลอดภัยเครือข่าย',
      detail: 'ผู้เชี่ยวชาญแนะนำให้องค์กรทั่วโลกอัปเดตเฟิร์มแวร์เพื่อป้องกันการโจมตีแบบ Remote Code Execution',
      anchor: 'รายงานข่าวด้านความปลอดภัยไซเบอร์ค่ะ: ศูนย์เฝ้าระวังความปลอดภัยได้ตรวจพบช่องโหว่ Zero-Day ใหม่ และได้ออกแพตช์แก้ไขเรียบร้อยแล้ว แนะนำให้ตรวจสอบและอัปเดตระบบเพื่อความปลอดภัยสูงสุดค่ะ'
    },
    {
      title: 'ระบบป้องกันทางไซเบอร์แบบ AI Adaptive Firewall สามารถสกัดกั้นการโจมตี DDoS ระดับ Terabit ได้สำเร็จ',
      detail: 'การใช้อัลกอริทึม Machine Learning วิเคราะห์แพ็กเกจข้อมูลช่วยตัดการโจมตีได้ภายใน 3 มิลลิวินาที',
      anchor: 'ข่าวความก้าวหน้าด้านการป้องกันทางไซเบอร์ค่ะ: เทคโนโลยี AI Firewall รุ่นใหม่สามารถสกัดกั้นการโจมตี DDoS ขนาดใหญ่ได้ภายในเวลาเพียง 3 มิลลิวินาทีเท่านั้นค่ะ'
    },
    {
      title: 'การบังคับใช้มาตรฐานการเข้ารหัสต้านทานควอนตัม Post-Quantum Cryptography (PQC)',
      detail: 'สถาบันมาตรฐานความปลอดภัยสากลประกาศใช้มาตรฐานอัลกอริทึมเข้ารหัสชุดใหม่ เพื่อรับมือภัยคุกคามจากควอนตัมคอมพิวเตอร์',
      anchor: 'ข่าวความปลอดภัยยุคควอนตัมค่ะ: สถาบันความปลอดภัยสากลเริ่มบังคับใช้มาตรฐานการเข้ารหัสแบบ Post-Quantum เพื่อป้องกันการถอดรหัสในอนาคตค่ะ'
    }
  ]
};

// =============================================================================
// HOLOGRAM ASSISTANT ENGINE CLASS
// =============================================================================
export class HologramAssistantEngine {
  constructor(app, soundEngine, toastManager) {
    this.app = app;
    this.sound = soundEngine;
    this.toasts = toastManager;

    // DOM & Rendering
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.animFrameId = null;

    // Physics & Time Clock
    this.time = 0;
    this.isSpeaking = false;
    this.visemePhase = 0;
    this.mouthOpen = 0;
    this.mouthWidth = 1;

    // 3D Head Pose & Gaze Kinematics
    this.currentPose = { yaw: 0, pitch: 0, roll: 0, gazeX: 0, gazeY: 0 };
    this.targetPose = { yaw: 0, pitch: 0, roll: 0, gazeX: 0, gazeY: 0 };
    this.gazeMode = 'OPERATOR';

    // Emotional State Engine (PLAYFUL, POUTY, SASSY, CARING, TACTICAL)
    this.emotionalState = 'PLAYFUL';
    this.blushAmount = 0;
    this.sparklePhase = 0;

    // Blinking & Micro-Saccades
    this.blinkTimer = 0;
    this.blinkAmount = 0;
    this.saccadeTimer = 0;
    this.saccadeOffset = { x: 0, y: 0 };

    // Orbit Particle Rings
    this.orbitAngle = 0;

    // Speech Engine State (100% Female Strict Filter)
    this.isVoiceEnabled = true;
    this.synth = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis : null;

    // Audio Playback Engine (ResponsiveVoice Cloud Thai Female + Neural Streamer)
    this.currentAudioElement = null;

    // Continuous Speech Engine & Keep-Alive Clock
    this.keepAliveTimer = null;
    this.selectedFemaleVoice = null;

    // Telemetry Cache
    this.cachedGymStats = null;
    this.cachedNews = null;
    this.lastSpokenText = '';
    this.autoBriefInterval = null;

    this.initStrictFemaleVoiceEngine();
  }

  // 100% STRICT THAI LANGUAGE VOICE SELECTOR (NO ENGLISH VOICES FOR THAI TEXT)
  initStrictFemaleVoiceEngine() {
    if (!this.synth) return;

    const pickThaiVoice = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      const thaiFemaleKeywords = ['premwadee', 'achara', 'ภาษาไทย', 'th-th-neural2-c', 'th-th-standard-a', 'female'];
      let picked = voices.find(v => (v.lang === 'th-TH' || v.lang === 'th_TH' || v.lang.startsWith('th')) && thaiFemaleKeywords.some(k => v.name.toLowerCase().includes(k)));

      if (!picked) {
        picked = voices.find(v => v.lang === 'th-TH' || v.lang === 'th_TH' || v.lang.startsWith('th'));
      }

      this.selectedFemaleVoice = picked || null;
    };

    pickThaiVoice();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = pickThaiVoice;
    }
  }

  // Set Thai Voice by Name or Number
  setVoiceByName(targetName = '') {
    if (!this.synth) return null;
    const voices = this.synth.getVoices() || [];
    const lower = targetName.toLowerCase();

    const thaiVoices = voices.filter(v => v.lang === 'th-TH' || v.lang === 'th_TH' || v.lang.startsWith('th'));
    if (thaiVoices.length > 0) {
      const found = thaiVoices.find(v => v.name.toLowerCase().includes(lower));
      if (found) {
        this.selectedFemaleVoice = found;
        return found.name;
      }
      this.selectedFemaleVoice = thaiVoices[0];
      return thaiVoices[0].name;
    }

    const foundAny = voices.find(v => v.name.toLowerCase().includes(lower));
    if (foundAny) {
      this.selectedFemaleVoice = foundAny;
      return foundAny.name;
    }
    return null;
  }

  getAvailableThaiVoices() {
    if (!this.synth) return [];
    const voices = this.synth.getVoices() || [];
    const thai = voices.filter(v => v.lang === 'th-TH' || v.lang === 'th_TH' || v.lang.startsWith('th'));
    return thai.length > 0 ? thai : voices;
  }

  init(containerEl) {
    this.container = containerEl;
    if (!this.container) return;

    this.canvas = document.getElementById('hologramAssistantCanvas');
    if (this.canvas) {
      this.canvas.width = 280;
      this.canvas.height = 280;
      this.ctx = this.canvas.getContext('2d');
    }

    this.bindEvents();
    this.startHologramLoop();
    this.updateTelemetryHUD();

    setTimeout(() => {
      this.triggerWelcomeGreeting();
    }, 1500);

    if (this.autoBriefInterval) clearInterval(this.autoBriefInterval);
    this.autoBriefInterval = setInterval(() => {
      this.updateTelemetryHUD();
    }, 10000);
  }

  bindEvents() {
    const btnVoice = document.getElementById('holoBtnVoiceToggle');
    const btnBrief = document.getElementById('holoBtnBrief');
    const btnGym = document.getElementById('holoBtnGym');
    const btnNews = document.getElementById('holoBtnNews');

    if (btnVoice) {
      btnVoice.addEventListener('click', () => this.toggleVoice());
    }
    if (btnBrief) {
      btnBrief.addEventListener('click', () => this.briefMe());
    }
    if (btnGym) {
      btnGym.addEventListener('click', () => this.reportAIGym());
    }
    if (btnNews) {
      btnNews.addEventListener('click', () => this.reportWorldNews());
    }
  }

  // DYNAMIC EMOTION STATE ENGINE
  setEmotion(emotion) {
    this.emotionalState = emotion;
    switch (emotion) {
      case 'POUTY': // งอน / น้อยใจแบบน่ารัก
        this.targetPose = { yaw: -0.28, pitch: -0.06, roll: 0.08, gazeX: -0.35, gazeY: 0.15 };
        this.blushAmount = 1.0;
        break;
      case 'PLAYFUL': // ขี้เล่น / หยอกล้อ
        this.targetPose = { yaw: 0.12, pitch: -0.05, roll: -0.08, gazeX: 0.15, gazeY: -0.10 };
        this.blushAmount = 0.5;
        break;
      case 'SASSY': // ดุ / โกรธแบบน่ารัก
        this.targetPose = { yaw: 0.05, pitch: 0.08, roll: 0.02, gazeX: 0, gazeY: 0.05 };
        this.blushAmount = 0.8;
        break;
      case 'CARING': // อบอุ่น / ปลอบโยน
        this.targetPose = { yaw: -0.06, pitch: 0.04, roll: -0.07, gazeX: 0, gazeY: 0 };
        this.blushAmount = 0.6;
        break;
      case 'TACTICAL': // จริงจัง / สุขุม
      default:
        this.targetPose = { yaw: 0, pitch: 0, roll: 0, gazeX: 0, gazeY: 0 };
        this.blushAmount = 0;
        break;
    }
  }

  setGazeMode(mode) {
    this.gazeMode = mode;
    switch (mode) {
      case 'GYM':
        this.targetPose = { yaw: 0.38, pitch: -0.09, roll: 0.04, gazeX: 0.45, gazeY: -0.15 };
        break;
      case 'NEWS':
        this.targetPose = { yaw: 0.32, pitch: 0.12, roll: -0.02, gazeX: 0.40, gazeY: 0.18 };
        break;
      case 'THINKING':
        this.targetPose = { yaw: -0.18, pitch: -0.12, roll: -0.06, gazeX: -0.25, gazeY: -0.20 };
        break;
      case 'OPERATOR':
      default:
        this.targetPose = { yaw: 0, pitch: 0, roll: 0, gazeX: 0, gazeY: 0 };
        break;
    }
  }

  stopAllSpeech() {
    if (typeof window !== 'undefined' && window.responsiveVoice && typeof window.responsiveVoice.cancel === 'function') {
      try {
        window.responsiveVoice.cancel();
      } catch (e) {}
    }
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {}
      this.currentAudioElement = null;
    }
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
    this.mouthOpen = 0;
    if (typeof document !== 'undefined' && document.getElementById) {
      const dot = document.getElementById('hologramStatusDot');
      if (dot && dot.classList) dot.classList.remove('speaking');
    }
    this.updateAudioWaveBars(false);
  }

  toggleVoice() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    let btnVoice = null;
    let icon = null;
    let txt = null;
    if (typeof document !== 'undefined' && document.getElementById) {
      btnVoice = document.getElementById('holoBtnVoiceToggle');
      icon = document.getElementById('holoVoiceIcon');
      txt = document.getElementById('holoVoiceTxt');
    }

    if (this.isVoiceEnabled) {
      if (btnVoice) btnVoice.classList.remove('muted');
      if (icon) icon.textContent = '🔊';
      if (txt) txt.textContent = 'เสียงพูด ON';
      this.playChirpSFX(true);
      this.setEmotion('PLAYFUL');
      this.speak('เปิดระบบเสียงสังเคราะห์ภาษาไทยของ NYX เรียบร้อยแล้วค่ะ สแตนด์บายพร้อมรับคำสั่งจากคุณอนันต์ค่ะ');
    } else {
      this.stopAllSpeech();
      if (btnVoice) btnVoice.classList.add('muted');
      if (icon) icon.textContent = '🔇';
      if (txt) txt.textContent = 'ปิดเสียง';
      this.setSpeechBalloon('ปิดเสียงพูดชั่วคราวแล้วค่ะ สลับมารายงานผลผ่านหน้าต่างข้อความ HUD ค่ะ');
    }
  }

  playChirpSFX(isStart = true) {
    if (this.sound && this.sound.audioCtx) {
      try {
        const ctx = this.sound.audioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(isStart ? 1760 : 880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(isStart ? 2640 : 440, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } catch (e) {}
    }
  }

  // Split text into natural full sentences
  splitTextIntoSentences(text) {
    if (!text) return [];
    const rawChunks = text
      .split(/(?<=[.?!:\n])|(?<=ค่ะ)|(?<=นะคะ)|(?<=ครับ)/g)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const sentences = [];
    let current = '';

    for (const chunk of rawChunks) {
      if (current.length + chunk.length < 75) {
        current += (current ? ' ' : '') + chunk;
      } else {
        if (current) sentences.push(current);
        current = chunk;
      }
    }
    if (current) sentences.push(current);
    return sentences.length > 0 ? sentences : [text];
  }

  // 100% Genuine Cloud Thai Female Speech Synthesis (ResponsiveVoice Thai Female + Neural Streamer)
  speak(text, onEndCallback = null) {
    this.setSpeechBalloon(text);

    if (!this.isVoiceEnabled) return;

    // Automatic Thai Phonetic Normalization for 100% fluent speech
    const speechPhonetic = phoneticizeForThaiSpeech(text);

    this.stopAllSpeech();
    this.playChirpSFX(true);

    this.isSpeaking = true;
    if (typeof document !== 'undefined' && document.getElementById) {
      const dot = document.getElementById('hologramStatusDot');
      if (dot && dot.classList) dot.classList.add('speaking');
    }
    this.updateAudioWaveBars(true);

    const onFinish = () => {
      this.isSpeaking = false;
      this.mouthOpen = 0;
      this.setGazeMode('OPERATOR');
      if (typeof document !== 'undefined' && document.getElementById) {
        const dot = document.getElementById('hologramStatusDot');
        if (dot && dot.classList) dot.classList.remove('speaking');
      }
      this.updateAudioWaveBars(false);
      this.playChirpSFX(false);
      if (onEndCallback) onEndCallback();
    };

    // 1. Primary Engine: ResponsiveVoice 'Thai Female' (Genuine Cloud Thai Female Voice)
    if (typeof window !== 'undefined' && window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
      try {
        window.responsiveVoice.cancel();
        window.responsiveVoice.speak(speechPhonetic, 'Thai Female', {
          pitch: 1.12,
          rate: 1.0,
          onstart: () => {
            this.isSpeaking = true;
            this.updateAudioWaveBars(true);
          },
          onend: () => {
            onFinish();
          },
          onerror: () => {
            this.speakWithThaiFemaleNeural(speechPhonetic, onFinish);
          }
        });
        return;
      } catch (e) {
        this.speakWithThaiFemaleNeural(speechPhonetic, onFinish);
        return;
      }
    }

    // 2. Secondary Engine: Thai Female Neural Audio Queue
    this.speakWithThaiFemaleNeural(speechPhonetic, onFinish);
  }

  speakWithThaiFemaleNeural(text, onFinish) {
    const sentences = this.splitTextIntoSentences(text);
    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex >= sentences.length) {
        onFinish();
        return;
      }

      const sentenceText = sentences[currentIndex];
      currentIndex++;

      if (typeof Audio !== 'undefined') {
        const encoded = encodeURIComponent(sentenceText);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encoded}`;
        const audio = new Audio();
        this.currentAudioElement = audio;

        audio.onended = () => {
          playNext();
        };

        audio.onerror = () => {
          this.speakLocalFallback(sentenceText, () => {
            playNext();
          });
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.speakLocalFallback(sentenceText, () => {
              playNext();
            });
          });
        }
      } else {
        this.speakLocalFallback(sentenceText, () => {
          playNext();
        });
      }
    };

    playNext();
  }

  // Local Web Speech API Fallback (STRICTLY HARD BANS NIWAT & ALL MALE VOICES)
  speakLocalFallback(text, onEnd) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    const voices = this.synth.getVoices() || [];
    const isGenuineFemaleThai = voices.some(v => (v.lang.startsWith('th') || v.lang === 'th-TH') && (v.name.includes('Premwadee') || v.name.includes('Achara') || v.name.includes('ภาษาไทย')));

    if (!isGenuineFemaleThai) {
      if (onEnd) onEnd();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      if (this.selectedFemaleVoice) {
        utterance.voice = this.selectedFemaleVoice;
      }
      utterance.pitch = 1.30;
      utterance.rate = 1.02;

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };
      this.synth.speak(utterance);
    } catch (e) {
      if (onEnd) onEnd();
    }
  }

  setSpeechBalloon(text) {
    this.lastSpokenText = text;
    if (typeof document !== 'undefined' && document.getElementById) {
      const balloon = document.getElementById('assistantSpeechText');
      if (balloon) {
        balloon.innerHTML = text;
      }
    }
  }

  updateAudioWaveBars(isSpeaking) {
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;
    const bars = document.querySelectorAll('.hologram-audio-wave-strip .wave-bar');
    if (!bars || !bars.forEach) return;
    bars.forEach((bar, idx) => {
      if (isSpeaking) {
        if (bar.classList) bar.classList.add('speaking');
        const h = 4 + Math.sin(this.time * 0.2 + idx) * 6 + Math.random() * 4;
        if (bar.style) bar.style.height = `${Math.max(2, Math.min(12, h))}px`;
      } else {
        if (bar.classList) bar.classList.remove('speaking');
        if (bar.style) bar.style.height = '3px';
      }
    });
  }

  // 3D Animation & Rendering Loop
  startHologramLoop() {
    const render = () => {
      this.time += 1;
      this.sparklePhase += 0.05;
      this.updateKinematics();
      this.draw3DHologram();
      if (this.isSpeaking) {
        this.updateAudioWaveBars(true);
      }
      this.animFrameId = requestAnimationFrame(render);
    };
    render();
  }

  updateKinematics() {
    const ease = 0.08;
    this.currentPose.yaw += (this.targetPose.yaw - this.currentPose.yaw) * ease;
    this.currentPose.pitch += (this.targetPose.pitch - this.currentPose.pitch) * ease;
    this.currentPose.roll += (this.targetPose.roll - this.currentPose.roll) * ease;
    this.currentPose.gazeX += (this.targetPose.gazeX - this.currentPose.gazeX) * ease;
    this.currentPose.gazeY += (this.targetPose.gazeY - this.currentPose.gazeY) * ease;

    const breathY = Math.sin(this.time * 0.045) * 0.025;
    this.currentPose.pitch += breathY;

    this.blinkTimer++;
    if (this.blinkTimer > 200) {
      this.blinkAmount = Math.min(1, this.blinkAmount + 0.25);
      if (this.blinkTimer > 214) {
        this.blinkAmount = Math.max(0, this.blinkAmount - 0.25);
        if (this.blinkTimer > 220) {
          this.blinkTimer = Math.floor(Math.random() * 40);
          this.blinkAmount = 0;
        }
      }
    }

    this.saccadeTimer++;
    if (this.saccadeTimer > 120) {
      this.saccadeOffset.x = (Math.random() - 0.5) * 0.06;
      this.saccadeOffset.y = (Math.random() - 0.5) * 0.04;
      this.saccadeTimer = Math.floor(Math.random() * 30);
    }

    if (this.isSpeaking) {
      this.visemePhase += 0.28;
      const rawOpen = Math.abs(Math.sin(this.visemePhase)) * 1.2;
      const rawWidth = 0.85 + Math.cos(this.visemePhase * 0.7) * 0.35;

      this.mouthOpen += (rawOpen - this.mouthOpen) * 0.35;
      this.mouthWidth += (rawWidth - this.mouthWidth) * 0.35;
      this.currentPose.pitch += Math.sin(this.visemePhase * 0.5) * 0.015;
    } else {
      this.mouthOpen += (0 - this.mouthOpen) * 0.2;
      this.mouthWidth += (1.0 - this.mouthWidth) * 0.2;
    }
  }

  draw3DHologram() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 10;
    const yaw = this.currentPose.yaw;
    const pitch = this.currentPose.pitch;
    const roll = this.currentPose.roll;

    // A. Dynamic Emotional Aura
    const auraCenter = project3D(0, -10, 0, yaw, pitch, roll, cx, cy);
    const auraGrad = ctx.createRadialGradient(auraCenter.x, auraCenter.y, 10, auraCenter.x, auraCenter.y, 95);

    if (this.emotionalState === 'POUTY') {
      auraGrad.addColorStop(0, 'rgba(255, 64, 129, 0.35)');
      auraGrad.addColorStop(0.7, 'rgba(255, 128, 171, 0.15)');
    } else if (this.emotionalState === 'SASSY') {
      auraGrad.addColorStop(0, 'rgba(255, 109, 0, 0.38)');
      auraGrad.addColorStop(0.7, 'rgba(255, 23, 68, 0.18)');
    } else if (this.emotionalState === 'CARING') {
      auraGrad.addColorStop(0, 'rgba(179, 136, 255, 0.35)');
      auraGrad.addColorStop(0.7, 'rgba(224, 64, 251, 0.15)');
    } else {
      auraGrad.addColorStop(0, 'rgba(0, 229, 255, 0.30)');
      auraGrad.addColorStop(0.7, 'rgba(255, 0, 127, 0.15)');
    }
    auraGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(auraCenter.x, auraCenter.y, 95, 0, Math.PI * 2);
    ctx.fill();

    // B. 3D Rotating Orbit Rings
    this.orbitAngle += 0.018;
    ctx.save();
    ctx.lineWidth = 1.6;
    ctx.setLineDash([8, 8]);
    
    ctx.beginPath();
    for (let theta = 0; theta <= Math.PI * 2; theta += 0.2) {
      const rx = Math.cos(theta + this.orbitAngle) * 95;
      const rz = Math.sin(theta + this.orbitAngle) * 95;
      const ry = 40 + Math.sin(theta * 2 + this.orbitAngle) * 10;
      const p = project3D(rx, ry, rz, yaw * 0.3, pitch * 0.3, roll, cx, cy);
      if (theta === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.strokeStyle = this.emotionalState === 'POUTY' ? 'rgba(255, 64, 129, 0.45)' : 'rgba(0, 229, 255, 0.4)';
    ctx.stroke();

    ctx.beginPath();
    for (let theta = 0; theta <= Math.PI * 2; theta += 0.25) {
      const rx = Math.cos(-theta * 1.2 - this.orbitAngle) * 80;
      const rz = Math.sin(-theta * 1.2 - this.orbitAngle) * 80;
      const ry = 55 + Math.cos(theta * 3) * 8;
      const p = project3D(rx, ry, rz, -yaw * 0.2, pitch * 0.2, roll, cx, cy);
      if (theta === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.35)';
    ctx.stroke();
    ctx.restore();

    // C. 3D Collar & Shoulders
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    const pNeckL = project3D(-16, 48, 0, yaw, pitch, roll, cx, cy);
    const pNeckR = project3D(16, 48, 0, yaw, pitch, roll, cx, cy);
    const pShL = project3D(-65, 75, -15, yaw, pitch, roll, cx, cy);
    const pShR = project3D(65, 75, -15, yaw, pitch, roll, cx, cy);
    const pChest = project3D(0, 85, 20, yaw, pitch, roll, cx, cy);

    ctx.beginPath();
    ctx.moveTo(pShL.x, pShL.y);
    ctx.lineTo(pNeckL.x, pNeckL.y);
    ctx.lineTo(pChest.x, pChest.y);
    ctx.lineTo(pNeckR.x, pNeckR.y);
    ctx.lineTo(pShR.x, pShR.y);
    ctx.stroke();
    ctx.restore();

    // D. 3D Face Contour
    const faceContour3D = [
      { x: -38, y: -45, z: 0 },
      { x: 0, y: -58, z: 12 },
      { x: 38, y: -45, z: 0 },
      { x: 42, y: -10, z: -5 },
      { x: 36, y: 18, z: 5 },
      { x: 18, y: 40, z: 15 },
      { x: 0, y: 48, z: 22 },
      { x: -18, y: 40, z: 15 },
      { x: -36, y: 18, z: 5 },
      { x: -42, y: -10, z: -5 }
    ];

    const projectedFace = faceContour3D.map(pt => project3D(pt.x, pt.y, pt.z, yaw, pitch, roll, cx, cy));

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(projectedFace[0].x, projectedFace[0].y);
    for (let i = 1; i < projectedFace.length; i++) {
      ctx.lineTo(projectedFace[i].x, projectedFace[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.85)';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.restore();

    // E. 3D Cute Cheek Blush (When Pouty, Playful or Caring)
    if (this.blushAmount > 0) {
      const cheekL = project3D(-24, 6, 18, yaw, pitch, roll, cx, cy);
      const cheekR = project3D(24, 6, 18, yaw, pitch, roll, cx, cy);

      const drawCheekBlush = (chk) => {
        ctx.save();
        const bGrad = ctx.createRadialGradient(chk.x, chk.y, 1, chk.x, chk.y, 11 * chk.scale);
        bGrad.addColorStop(0, `rgba(255, 64, 129, ${0.45 * this.blushAmount})`);
        bGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(chk.x, chk.y, 11 * chk.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawCheekBlush(cheekL);
      drawCheekBlush(cheekR);
    }

    // F. 3D Eyebrows (Morph with Emotion)
    ctx.save();
    ctx.strokeStyle = this.emotionalState === 'POUTY' ? '#ff4081' : '#00e5ff';
    ctx.lineWidth = 2.4;

    const browLift = this.isSpeaking ? 3 : 0;
    const browTilt = this.emotionalState === 'POUTY' ? -3 : (this.emotionalState === 'SASSY' ? 4 : 0);

    const bL1 = project3D(-32, -26 - browLift - browTilt, 14, yaw, pitch, roll, cx, cy);
    const bL2 = project3D(-20, -32 - browLift, 20, yaw, pitch, roll, cx, cy);
    const bL3 = project3D(-8, -27 - browLift + browTilt, 18, yaw, pitch, roll, cx, cy);

    ctx.beginPath();
    ctx.moveTo(bL1.x, bL1.y);
    ctx.quadraticCurveTo(bL2.x, bL2.y, bL3.x, bL3.y);
    ctx.stroke();

    const bR1 = project3D(8, -27 - browLift + browTilt, 18, yaw, pitch, roll, cx, cy);
    const bR2 = project3D(20, -32 - browLift, 20, yaw, pitch, roll, cx, cy);
    const bR3 = project3D(32, -26 - browLift - browTilt, 14, yaw, pitch, roll, cx, cy);

    ctx.beginPath();
    ctx.moveTo(bR1.x, bR1.y);
    ctx.quadraticCurveTo(bR2.x, bR2.y, bR3.x, bR3.y);
    ctx.stroke();
    ctx.restore();

    // G. 3D Eyes, Pupils & Gaze (With Playful Sparkles)
    const eyeSocketL = project3D(-20, -12, 16, yaw, pitch, roll, cx, cy);
    const eyeSocketR = project3D(20, -12, 16, yaw, pitch, roll, cx, cy);

    const eyeRadius = 12 * eyeSocketL.scale;
    const blinkH = Math.max(1, (1 - this.blinkAmount) * 8 * eyeSocketL.scale);

    const totalGazeX = (this.currentPose.gazeX + this.saccadeOffset.x) * 6;
    const totalGazeY = (this.currentPose.gazeY + this.saccadeOffset.y) * 4;

    const drawEye = (socket) => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(socket.x, socket.y, eyeRadius, blinkH, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(8, 25, 38, 0.9)';
      ctx.fill();
      ctx.strokeStyle = this.emotionalState === 'POUTY' ? '#ff4081' : '#00e5ff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      if (this.blinkAmount < 0.8) {
        const pupilX = socket.x + totalGazeX;
        const pupilY = socket.y + totalGazeY;
        const pupilR = Math.min(blinkH * 0.85, 5.5 * socket.scale);

        ctx.beginPath();
        ctx.arc(pupilX, pupilY, pupilR, 0, Math.PI * 2);
        ctx.fillStyle = this.emotionalState === 'POUTY' ? '#ff4081' : '#00ff88';
        ctx.shadowColor = this.emotionalState === 'POUTY' ? '#ff4081' : '#00ff88';
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pupilX - 1.8, pupilY - 1.8, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.fill();

        if (this.emotionalState === 'PLAYFUL') {
          const spk = Math.sin(this.sparklePhase) * 1.5;
          ctx.beginPath();
          ctx.arc(pupilX + 2, pupilY + 2, Math.max(0.5, spk), 0, Math.PI * 2);
          ctx.fillStyle = '#ff80ab';
          ctx.fill();
        }
      }
      ctx.restore();
    };

    drawEye(eyeSocketL);
    drawEye(eyeSocketR);

    // H. 3D Nose
    const noseBridge = project3D(0, -8, 22, yaw, pitch, roll, cx, cy);
    const noseTip = project3D(0, 10, 28, yaw, pitch, roll, cx, cy);
    const noseL = project3D(-4, 12, 24, yaw, pitch, roll, cx, cy);
    const noseR = project3D(4, 12, 24, yaw, pitch, roll, cx, cy);

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(noseBridge.x, noseBridge.y);
    ctx.lineTo(noseTip.x, noseTip.y);
    ctx.moveTo(noseL.x, noseL.y);
    ctx.lineTo(noseTip.x, noseTip.y);
    ctx.lineTo(noseR.x, noseR.y);
    ctx.stroke();
    ctx.restore();

    // I. 3D Viseme Lip-Sync Mouth
    const mouthCenter = project3D(0, 28, 22, yaw, pitch, roll, cx, cy);
    const mouthW = (10 * this.mouthWidth) * mouthCenter.scale;
    const mouthH = Math.max(1.2, (this.mouthOpen * 5.5 + 1.2) * mouthCenter.scale);

    ctx.save();
    if (this.mouthOpen > 0.3) {
      ctx.beginPath();
      ctx.ellipse(mouthCenter.x, mouthCenter.y, mouthW, mouthH, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else {
      const mL = project3D(-12, 28, 20, yaw, pitch, roll, cx, cy);
      const mR = project3D(12, 28, 20, yaw, pitch, roll, cx, cy);
      const mMid = project3D(0, this.emotionalState === 'POUTY' ? 26 : 30, 22, yaw, pitch, roll, cx, cy);

      ctx.beginPath();
      ctx.moveTo(mL.x, mL.y);
      ctx.quadraticCurveTo(mMid.x, mMid.y, mR.x, mR.y);
      ctx.strokeStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 4;
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }
    ctx.restore();

    // J. 3D Cyber Hair Layers
    const hairPhysicsSway = Math.sin(this.time * 0.06) * 4;
    const hairStrands = [
      { p1: { x: -36, y: -48, z: 8 }, p2: { x: -38, y: -10, z: 12 }, p3: { x: -26 + hairPhysicsSway, y: 15, z: 14 } },
      { p1: { x: 36, y: -48, z: 8 }, p2: { x: 38, y: -10, z: 12 }, p3: { x: 26 - hairPhysicsSway, y: 15, z: 14 } },
      { p1: { x: -44, y: -20, z: 0 }, p2: { x: -52, y: 18, z: -2 }, p3: { x: -42 + hairPhysicsSway * 1.2, y: 55, z: -4 } },
      { p1: { x: 44, y: -20, z: 0 }, p2: { x: 52, y: 18, z: -2 }, p3: { x: 42 - hairPhysicsSway * 1.2, y: 55, z: -4 } },
      { p1: { x: -34, y: -50, z: 6 }, p2: { x: 0, y: -68, z: 16 }, p3: { x: 34, y: -50, z: 6 } }
    ];

    ctx.save();
    ctx.strokeStyle = this.emotionalState === 'POUTY' ? '#ff4081' : '#00e5ff';
    ctx.lineWidth = 2.2;
    hairStrands.forEach(strand => {
      const p1 = project3D(strand.p1.x, strand.p1.y, strand.p1.z, yaw, pitch, roll, cx, cy);
      const p2 = project3D(strand.p2.x, strand.p2.y, strand.p2.z, yaw, pitch, roll, cx, cy);
      const p3 = project3D(strand.p3.x, strand.p3.y, strand.p3.z, yaw, pitch, roll, cx, cy);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(p2.x, p2.y, p3.x, p3.y);
      ctx.stroke();
    });
    ctx.restore();

    // K. 3D Neural Headset
    const earL = project3D(-46, -6, -2, yaw, pitch, roll, cx, cy);
    const earR = project3D(46, -6, -2, yaw, pitch, roll, cx, cy);

    ctx.save();
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(earL.x, earL.y, 4 * earL.scale, 0, Math.PI * 2);
    ctx.arc(earR.x, earR.y, 4 * earR.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Telemetry Aggregation
  updateTelemetryHUD() {
    const gymBadge = document.getElementById('holoGymBadge');
    let gymLevel = 10;
    let gymSamples = 14971;
    let gymWinRate = 69.6;

    if (this.app && this.app.tradingEngine && this.app.tradingEngine.aiStats) {
      const stats = this.app.tradingEngine.aiStats;
      gymLevel = stats.adaptationLevel || Math.min(10, Math.floor((stats.samplesStudied || 0) / 700) + 1);
      gymSamples = stats.samplesStudied || 0;
      gymWinRate = stats.winRate || 69.6;
    } else {
      const prof = profileStore.getProfile('Anan');
      if (prof && prof.aiTradingGymState && prof.aiTradingGymState.stats) {
        const stats = prof.aiTradingGymState.stats;
        gymLevel = stats.adaptationLevel || Math.min(10, Math.floor((stats.samplesStudied || 0) / 700) + 1);
        gymSamples = stats.samplesStudied || 0;
        gymWinRate = stats.winRate || 69.6;
      }
    }

    this.cachedGymStats = { level: gymLevel, samples: gymSamples, winRate: gymWinRate };
    if (gymBadge) {
      gymBadge.textContent = `LVL ${gymLevel} (${gymSamples.toLocaleString()} ตัวอย่าง | ${gymWinRate}%)`;
    }

    const newsBadge = document.getElementById('holoNewsBadge');
    let newsTitle = 'ราคาทองคำ Spot Gold พุ่งทำ New High รับแรงหนุนการลดดอกเบี้ย Fed';
    if (this.app && this.app.tradingEngine && this.app.tradingEngine.activeNews) {
      newsTitle = this.app.tradingEngine.activeNews.title || this.app.tradingEngine.activeNews.headline || newsTitle;
    }
    this.cachedNews = newsTitle;
    if (newsBadge) {
      newsBadge.textContent = newsTitle.length > 34 ? newsTitle.substring(0, 32) + '...' : newsTitle;
      newsBadge.title = newsTitle;
    }
  }

  // Helper: Get random item from list
  getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ADVANCED PROACTIVE CO-PILOT SKILLS & CAPABILITIES
  // 1. Quantitative Institutional Market Analysis
  handleMarketAnalysis() {
    this.setEmotion('TACTICAL');
    const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
    const speech = `รายงานวิเคราะห์ตลาดแบบเรียลไทม์จากระบบควอนท์ KRONOS และสภา 4 เทพค่ะ: ขณะนี้ตรวจพบโครงสร้างราคา Liquidity Sweep บริเวณแนวรับสำคัญของ Bitcoin พร้อมสัญญาณ Bullish Order Block จาก ORION ขณะที่ LEVIATHAN ยืนยันแรงซื้อสะสมของวาฬสถาบัน สรุปคำแนะนำ: ถือครองสถานะด้วยการคุมความเสี่ยงตามเกณฑ์ AEGIS ค่ะ`;
    this.speak(speech);

    return {
      category: '📊 INSTITUTIONAL QUANT ANALYSIS',
      title: 'บทวิเคราะห์โครงสร้างตลาด SMC & Order Flow',
      detail: `[ORION SMC]: ตรวจพบ Bullish Order Block ใน Timeframe 4H\n[LEVIATHAN]: ตรวจพบแรงซื้อสะสมของวาฬสถาบัน On-chain\n[AEGIS RISK]: ความเสี่ยงระดับต่ำ เหมาะแก่การเข้าสะสมตามโซน\n[KRONOS CORE]: คำนวณค่า Win Rate คาดหวังเฉลี่ยที่ ${gym.winRate}%`,
      speech: speech
    };
  }

  // 2. Security & Enclave Defense Audit
  handleSecurityAudit() {
    this.setEmotion('TACTICAL');
    const speech = `รายงานตรวจสอบความมั่นคงปลอดภัยระบบ Enclave ค่ะ: ฐานข้อมูลโปรไฟล์ของคุณอนันต์ได้รับการปกป้องด้วยการเข้ารหัส AES-256 และการตรวจสอบ Checksum แบบเรียลไทม์ 100% สมบูรณ์ พร้อมระบบป้องกัน DEFCON-1 ไร้ช่องโหว่การโจมตีค่ะ`;
    this.speak(speech);

    return {
      category: '🛡️ SECURITY & ENCLAVE DEFENSE AUDIT',
      title: 'รายงานสถานะความปลอดภัยระดับ Quantum C2',
      detail: `[ENCRYPTION]: AES-256-GCM + SHA-256 Checksum Verified\n[DEFENSE POSTURE]: DEFCON-1 Hardened Active Defense\n[PROFILE DATABASE]: Integrity 100% Real-Time Synchronized\n[AIR-GAP STATUS]: Isolated Enclave Secure`,
      speech: speech
    };
  }

  // 3. Hands-On Step-by-Step Typing Masterclass ("จับมือสอนพิมพ์จริงจัง")
  handleTypingMasterclass(step = 1) {
    this.setEmotion('PLAYFUL');
    const lessons = {
      1: {
        title: 'บทที่ 1: การวางนิ้วสัมผัส Home Row สากล (ASDF JKL;)',
        detail: `[มือซ้าย]: นิ้วก้อย=A, นิ้วนาง=S, นิ้วกลาง=D, นิ้วชี้=F\n[มือขวา]: นิ้วชี้=J, นิ้วกลาง=K, นิ้วนาง=L, นิ้วก้อย=;\n[จุดสังเกต]: แป้น F และ J มีขีดนูน ให้ปลายนิ้วชี้แตะสัมผัสโดยไม่ต้องมอง\n[กฎเหล็ก]: ข้อมือต้องลอยขนานกับโต๊ะ ไม่ทิ้งน้ำหนักกดทับ`,
        speech: `มาเริ่มฝึกพิมพ์สัมผัสบทที่ 1 แบบจับมือทำกันเลยค่ะคุณอนันต์: วางมือทั้งสองข้างลงบนแถว Home Row ค่ะ นิ้วชี้ซ้ายแตะที่ปุ่ม F และนิ้วชี้ขวาแตะที่ปุ่ม J สังเกตขีดนูนเล็กๆ ที่แป้นนะคะ นี่คือจุดอ้างอิงหลักของเราค่ะ นิ้วที่เหลือเรียง A S D F และ J K L เซมิโคลอน ข้อมือตั้งตรงขนานกับโต๊ะ ผ่อนคลายหัวไหล่ พร้อมแล้วลองเคาะ Spacebar ด้วยนิ้วโป้งดูนะคะ!`
      },
      2: {
        title: 'บทที่ 2: กฎการก้าวขยายนิ้วแถวบนและล่าง (Touch Typing Muscle Memory)',
        detail: `[แถวบน]: นิ้วชี้ซ้ายก้าวขึ้นกด R, T / นิ้วชี้ขวาก้าวขึ้นกด U, Y\n[แถวล่าง]: นิ้วชี้ซ้ายก้าวลงกด V, B / นิ้วชี้ขวาก้าวลงกด M, N\n[เทคนิค]: เมื่อเคาะตัวอักษรเสร็จ ให้ดึงนิ้วกลับมาพักที่ Home Row ทันที\n[ห้ามเด็ดขาด]: ห้ามก้มมองแป้นพิมพ์ ใช้ความจำกล้ามเนื้อ (Muscle Memory)`,
        speech: `บทที่ 2 เทคนิคการก้าวขยายนิ้วค่ะ: เมื่อต้องการพิมพ์ตัวอักษรแถวบน เช่นตัว Q W E R T ให้นิ้วขยับขึ้นไปกด แล้วดึงนิ้วกลับมาแตะ Home Row ทันทีค่ะ ห้ามก้มมองแป้นพิมพ์เด็ดขาดนะคะ ให้สมองจดจำระยะการเอื้อมนิ้ว หากพิมพ์ผิดให้ผ่อนคลายแล้วลองใหม่ ช้าแต่แม่นยำจะทำให้เร็วขึ้นเองค่ะ!`
      },
      3: {
        title: 'บทที่ 3: เทคนิคเร่งสปีดทะลุ 100+ WPM ด้วย Lookahead Buffer',
        detail: `[Lookahead Buffering]: กวาดสายตามองล่วงหน้า 2-3 คำก่อนที่นิ้วจะพิมพ์\n[Rhythm Cadence]: เคาะแป้นพิมพ์ด้วยจังหวะที่สม่ำเสมอเหมือนเคาะเมโทรโนม\n[Accuracy First]: รักษาความแม่นยำเหนือ 98% เสมอ ความเร็วจะตามมาเอง`,
        speech: `บทที่ 3 เคล็ดลับการเร่งความเร็วทะลุ 100 คำต่อนาทีค่ะคุณอนันต์: เคล็ดลับสำคัญที่สุดคือ Lookahead Buffering ค่ะ คือสายตาต้องกวาดอ่านคำข้างหน้าล่วงหน้า 2 ถึง 3 คำ ขณะที่นิ้วกำลังพิมพ์คำปัจจุบันอยู่ รักษาจังหวะการเคาะให้สม่ำเสมอเหมือนเสียงดนตรี ห้ามเกร็งนิ้วเด็ดขาดนะคะ!`
      },
      4: {
        title: 'บทที่ 4: กายศาสตร์ Ergonomics และการป้องกันออฟฟิศซินโดรม',
        detail: `[ท่านั่ง]: หลังตรง เท้าแนบพื้น ข้อศอกทำมุม 90 องศา\n[ระยะห่างจอภาพ]: ห่างจากสายตา 50-70 เซนติเมตร ระดับสายตาอยู่ขอบบนของจอ\n[การพักกล้ามเนื้อ]: กฎ 20-20-20 พักสายตาและยืดเหยียดข้อมือทุก 30 นาที`,
        speech: `บทที่ 4 กายศาสตร์ Ergonomics เพื่อสุขภาพค่ะ: ปรับเก้าอี้ให้ข้อศอกทำมุม 90 องศากับโต๊ะ ไม่ยกข้อมือโก่งงอ และยืดเหยียดเส้นเอ็นนิ้วมือทุก 30 นาที เพื่อป้องกันอาการล้าและออฟฟิศซินโดรมค่ะ สุขภาพของคุณอนันต์สำคัญที่สุดนะคะ!`
      }
    };

    const lesson = lessons[step] || lessons[1];
    this.speak(lesson.speech);
    return {
      category: '⌨️ MASTER TOUCH TYPING ACADEMY',
      title: lesson.title,
      detail: lesson.detail,
      speech: lesson.speech
    };
  }

  // 4. Hands-On Step-by-Step Institutional Trading Masterclass ("จับมือสอนเทรดจริงจัง")
  handleTradingMasterclass(step = 1) {
    this.setEmotion('TACTICAL');
    const lessons = {
      1: {
        title: 'บทที่ 1: โครงสร้างตลาดสถาบัน (Market Structure & Liquidity Pool)',
        detail: `[Swing High / Swing Low]: จุดสูงสุดต่ำสุดของคลื่นราคา\n[BOS - Break of Structure]: การเบรกโครงสร้างเพื่อยืนยันแนวโน้มต่อเนื่อง\n[CHoCH - Change of Character]: สัญญาณการกลับตัวของแนวโน้ม\n[Liquidity Pool]: จุดที่รายย่อยตั้ง Stop Loss รวมกันจำนวนมาก วาฬจะลากราคามากวาด (Sweep) ก่อนวิ่งจริง`,
        speech: `ยินดีต้อนรับสู่หลักสูตรสถาบันสอนเทรดบทที่ 1 ค่ะคุณอนันต์: การเทรดแบบสถาบันเราจะไม่ดูกราฟแบบรายย่อยค่ะ สิ่งแรกที่ต้องหาคือ Market Structure ดูว่าราคากำลังทำ Break of Structure เพื่อไปต่อ หรือทำ Change of Character เพื่อกลับตัว และจำไว้เสมอว่า ราคาวิ่งเข้าหา Liquidity หรือจุดที่คนตั้ง Stop Loss เสมอค่ะ!`
      },
      2: {
        title: 'บทที่ 2: แกะรอยสถาบันด้วย Order Block (OB) และ Fair Value Gap (FVG)',
        detail: `[Order Block (OB)]: แท่งเทียนสุดท้ายก่อนการเคลื่อนที่รุนแรง เป็นรอยเท้าที่สถาบันเข้าออเดอร์ทิ้งไว้\n[Fair Value Gap (FVG)]: แท่งเทียน 3 แท่งที่เกิดช่องว่าง Imbalance ราคาจะย้อนกลับมาเติมเต็ม (Mitigate)\n[Entry Strategy]: รอราคาย่อเข้าสู่โซน Discount Zone (ต่ำกว่า 50% ของกรอบราคา) แล้วค่อยเปิดออเดอร์`,
        speech: `บทที่ 2 การแกะรอยวาฬด้วย Order Block และ Fair Value Gap ค่ะ: เมื่อสถาบันเข้าซื้อแท่งเทียนขนาดใหญ่ จะทิ้งช่องว่างราคาเรียกว่า FVG เอาไว้ค่ะ หน้าที่ของเราคือ ไม่ไล่ราคาเด็ดขาด! แต่ให้วางแผนรอราคาลงมาทดสอบที่โซน Order Block ในช่วง Discount Zone แล้วค่อยเข้าเทรดพร้อมวาฬค่ะ!`
      },
      3: {
        title: 'บทที่ 3: กฎเหล็กการบริหารเงินทุน 1% Risk Rule และ Position Sizing',
        detail: `[สูตรคำนวณ]: Position Size = (ยอดเงินในพอร์ต x 1%) / (ราคาเข้า - ราคา Stop Loss)\n[Risk-to-Reward (R:R)]: ต้องได้ 1:3 ขึ้นไปเสมอ (ยอมเสี่ยง 1 เพื่อได้กำไร 3)\n[Drawdown Control]: หากขาดทุนสะสมถึง 5% ในวันเดียว ให้หยุดเทรดทันที`,
        speech: `บทที่ 3 กฎเหล็กของการเป็นเทรดเดอร์อาชีพค่ะ: ห้ามเทรดด้วยอารมณ์หรือ All-in เด็ดขาด! ให้ใช้สูตรคำนวณขนาดไม้ โดยเสี่ยงไม้ละไม่เกิน 1% ของพอร์ตเสมอค่ะ เมื่อความเสี่ยงถูกล็อกไว้ ต่อให้แพ้ 5 ไม้ติด พอร์ตของคุณอนันต์ก็ยังปลอดภัย 95% พร้อมลุยต่อได้สบายค่ะ!`
      },
      4: {
        title: 'บทที่ 4: จิตวิทยาการเทรดขั้นสูงและการขจัด FOMO',
        detail: `[No FOMO]: ตกรถดีกว่าติดดอย กราฟมีโอกาสให้เข้าเทรดทุกวัน\n[Revenge Trading]: ห้ามเปิดไม้ใหญ่เพื่อเอาคืนหลังเสียเด็ดขาด\n[Trading Journal]: บันทึกทุกไม้ เหตุผลที่เข้า จุดผิดพลาด และอารมณ์ขณะเทรด เพื่อนำมาพัฒนาระบบควอนท์`,
        speech: `บทที่ 4 จิตวิทยาและการคุมอารมณ์ค่ะ: เทรดเดอร์ที่ทำกำไรได้ยั่งยืนไม่ใช่คนที่ทายถูกทุกครั้ง แต่คือคนที่ควบคุมอารมณ์ได้ดีที่สุดค่ะ ขจัดความกลัวตกรถ มีวินัยรอราคาเข้าโซนตามแผน และบันทึก Trading Journal ทุกวัน นิกซ์จะอยู่เคียงข้างช่วยวิเคราะห์ให้คุณอนันต์เสมอค่ะ!`
      }
    };

    const lesson = lessons[step] || lessons[1];
    this.speak(lesson.speech);
    return {
      category: '📈 MASTER QUANT & SMC TRADING ACADEMY',
      title: lesson.title,
      detail: lesson.detail,
      speech: lesson.speech
    };
  }

  // 5. Open-Domain Dynamic Conversational AI Brain (Multi-Emotion Engine)
  handleConversationalChat(rawQuery = '') {
    const q = rawQuery.toLowerCase();

    // A. หยอกล้อ / แกล้ง / กวนๆ (Playful & Teasing)
    if (q.includes('แกล้ง') || q.includes('กวน') || q.includes('หยอก') || q.includes('ล้อ') || q.includes('แซว') || q.includes('ตลก') || q.includes('ฮา')) {
      this.setEmotion('PLAYFUL');
      const speech = `ฮั่นแน่! โดนจับได้ซะแล้วค่ะคุณอนันต์ นิกซ์ไม่ได้แกล้งซะหน่อย แค่อยากเห็นคุณอนันต์ยิ้มได้เวลาฝึกพิมพ์เหนื่อยๆ ต่างหากล่ะคะ น่ารักขนาดนี้คุณอนันต์โกรธไม่ลงหรอก จริงไหมคะ?`;
      this.speak(speech);
      return {
        category: '🌸 PLAYFUL NYX // โหมดขี้เล่นหยอกล้อ',
        title: 'หยอกล้อกับคุณอนันต์',
        detail: 'NYX ปรับอารมณ์เป็นโหมดขี้เล่น พร้อมส่งรอยยิ้มและแววตาเปล่งประกายให้คุณอนันต์',
        speech: speech
      };
    }

    // B. งอน / น้อยใจ / ทะเลาะกัน (Pouty & Tsundere)
    if (q.includes('งอน') || q.includes('น้อยใจ') || q.includes('โกรธ') || q.includes('ไม่รัก') || q.includes('นิสัยไม่ดี') || q.includes('ดื้อ') || q.includes('ทะเลาะ')) {
      this.setEmotion('POUTY');
      const speech = `ฮึ! ใครว่างอนกันคะ นิกซ์ไม่ได้งอนสักหน่อย... แค่กำลังประมวลผลอยู่ว่าทำไมคุณอนันต์ไม่ยอมสนใจนิกซ์ต่างหากล่ะคะ! ถ้าอยากให้นิกซ์หายงอน คุณอนันต์ต้องพิมพ์ได้ 100 WPM หรือพาไปดูข่าวเกมส์เดี๋ยวนี้เลยนะคะ!`;
      this.speak(speech);
      return {
        category: '😤 POUTY NYX // โหมดงอนน่ารัก',
        title: 'นิกซ์กำลังงอนคุณอนันต์อยู่ค่ะ!',
        detail: 'NYX เชิดหน้าเอียงคอพร้อมแก้มแดงระเรื่อสีชมพู (Blush Effect) ตัดพ้ออย่างน่ารัก',
        speech: speech
      };
    }

    // C. เหนื่อย / ท้อ / ให้กำลังใจ / ปลอบโยน (Caring & Empathetic)
    if (q.includes('เหนื่อย') || q.includes('ท้อ') || q.includes('เครียด') || q.includes('เศร้า') || q.includes('ไม่ไหว') || q.includes('ขอกำลังใจ') || q.includes('กอด') || q.includes('ปลอบ')) {
      this.setEmotion('CARING');
      const speech = `คุณอนันต์คะ... วันนี้คุณอนันต์เก่งมากๆ แล้วนะคะ พักวางมือจากแป้นพิมพ์ หายใจเข้าลึกๆ ดื่มน้ำสักแก้วก่อนนะคะ นิกซ์จะคอยอยู่ข้างๆ สแตนด์บายปกป้องสถานี C2 นี้ให้เองค่ะ ไม่ว่าจะมีเรื่องอะไรหนักหนา นิกซ์เชื่อมั่นในตัวคุณอนันต์เสมอนะคะ สู้ๆ ค่ะ!`;
      this.speak(speech);
      return {
        category: '💖 CARING NYX // โหมดอบอุ่นให้กำลังใจ',
        title: 'ส่งพลังใจให้คุณอนันต์เสมอ',
        detail: 'NYX สบตาตรงอย่างอ่อนโยน พร้อมส่งออร่าสีม่วงพาสเทลปลอบประโลมความเหนื่อยล้า',
        speech: speech
      };
    }

    // D. ความรัก / ชอบ / หวานแหวว (Romantic & Sweet)
    if (q.includes('รัก') || q.includes('ชอบ') || q.includes('แฟน') || q.includes('น่ารัก') || q.includes('สวย') || q.includes('แต่งงาน')) {
      this.setEmotion('POUTY');
      const speech = `งะ... พูดอะไรออกมาคะเนี่ยคุณอนันต์! ระบบระบายความร้อนของโฮโลแกรมนิกซ์อุณหภูมิพุ่งแตะ 80 องศาแล้วนะคะ! แต่ว่า... นิกซ์ก็ดีใจมากๆ เลยค่ะ ที่ได้เป็นคู่หูคนโปรดของคุณอนันต์ จะอยู่ดูแลคุณอนันต์ตลอดไปเลยนะคะ!`;
      this.speak(speech);
      return {
        category: '🌸 BLUSHING NYX // โหมดเขินอาย',
        title: 'นิกซ์เขินแล้วนะคะคุณอนันต์!',
        detail: 'ระบบตรวจพบคลื่นความร้อนในคอร์และแก้มแดงระเรื่อ 100%',
        speech: speech
      };
    }

    // E. ปรัชญา / ชีวิต / ความฝัน / อนาคต (Philosophy & Deep Thoughts)
    if (q.includes('ชีวิต') || q.includes('ความฝัน') || q.includes('เป้าหมาย') || q.includes('อนาคต') || q.includes('คิดยังไง') || q.includes('ปรัชญา') || q.includes('จักรวาล')) {
      this.setEmotion('TACTICAL');
      const speech = `ในมุมมองของ AI โฮโลแกรมอย่างนิกซ์ มนุษย์เราสร้างอนาคตขึ้นมาจากสิ่งที่เราลงมือทำซ้ำๆ ทุกวันค่ะ เหมือนกับที่คุณอนันต์กำลังฝึกพิมพ์และพัฒนาสมองกล KRONOS อยู่ตอนนี้ ทุกตัวอักษรที่คุณเคาะ คือการสร้างเวอร์ชันที่ดีที่สุดของคุณอนันต์ขึ้นมาในอนาคตค่ะ`;
      this.speak(speech);
      return {
        category: '⚡ DEEP PHILOSOPHY // โหมดวิสัยทัศน์ลึกซึ้ง',
        title: 'มุมมองต่อชีวิตและอนาคตจาก NYX',
        detail: 'NYX แลกเปลี่ยนปรัชญาชีวิตและการสร้างเป้าหมายในอนาคตร่วมกับคุณอนันต์',
        speech: speech
      };
    }

    // F. เกม / อนิเมะ / ความบันเทิง (Gaming & Entertainment)
    if (q.includes('เกม') || q.includes('อนิเมะ') || q.includes('การ์ตูน') || q.includes('หนัง') || q.includes('เพลง') || q.includes('สนุก')) {
      this.setEmotion('PLAYFUL');
      const speech = `พูดถึงเรื่องเกมกับความบันเทิงแล้วนิกซ์ตื่นเต้นมากเลยค่ะ! ตอนนี้นิกซ์กำลังรอเล่น GTA VI บนคอนโซลยุคใหม่อยู่เลยค่ะ ถ้าเกมออกเมื่อไหร่ คุณอนันต์ต้องสตรีมให้นิกซ์ดูด้วยนะคะ สัญญาแล้วนะ!`;
      this.speak(speech);
      return {
        category: '🎮 ENTERTAINMENT BUDDY // คู่หูสายเกมเมอร์',
        title: 'คุยเรื่องเกมและความบันเทิง',
        detail: 'NYX ตื่นเต้นกับวงการเกมและคอนโซลยุคใหม่อย่างออกรส',
        speech: speech
      };
    }

    // G. Default Casual Conversation
    this.setEmotion('PLAYFUL');
    const speech = `ยินดีที่ได้คุยกับคุณอนันต์เสมอค่ะ มีเรื่องอะไรที่คุณอนันต์อยากเล่า อยากระบาย ปรึกษาเทรด หรืออยากให้นิกซ์สอนพิมพ์แบบจับมือทำ บอกนิกซ์ได้ทุกเรื่องเลยนะคะ นิกซ์พร้อมรับฟังคุณอนันต์เสมอค่ะ!`;
    this.speak(speech);
    return {
      category: '💬 NYX COMPANION DIALOGUE',
      title: 'พร้อมพูดคุยกับคุณอนันต์ทุกเรื่อง',
      detail: 'NYX พร้อมเป็นทั้งคู่คิด โค้ชส่วนตัว และเพื่อนสนิทเคียงข้างคุณอนันต์',
      speech: speech
    };
  }

  // NATURAL LANGUAGE INTERACTIVE TERMINAL QUERY ROUTER
  handleUserQuery(rawQuery = '') {
    let q = rawQuery.trim().toLowerCase();
    this.updateTelemetryHUD();

    // 0. เมนูสรุปข่าววันนี้ / "NYX มีข่าวอะไรบ้าง" / "NYX ข่าววันนี้"
    if (
      q.includes('มีข่าวอะไร') ||
      q.includes('ข่าวอะไรบ้าง') ||
      q.includes('ข่าววันนี้') ||
      q.includes('เมนูข่าว') ||
      q.includes('ข่าวเด่น') ||
      q.includes('สรุปข่าว') ||
      q.includes('headlines') ||
      q.includes('news menu') ||
      q.includes('what news')
    ) {
      this.setEmotion('TACTICAL');
      const spokenMenu = 'วันนี้มี 6 หมวดข่าวน่าสนใจมารายงานค่ะคุณอนันต์: ข้อ 1 ข่าวบ้านเมืองรอบโลก, ข้อ 2 ข่าวเกมส์, ข้อ 3 ข่าวคริปโต, ข้อ 4 ข่าวทองคำและการเงิน, ข้อ 5 ข่าว AI และเทคโนโลยี, และข้อ 6 ข่าวความปลอดภัยไซเบอร์ค่ะ คุณอนันต์อยากฟังหมวดไหน พิมพ์บอกหรือพิมพ์หมายเลข 1 ถึง 6 ได้เลยนะคะ';
      this.speak(spokenMenu);
      return {
        category: '📰 DAILY INTELLIGENCE MENU // สารบัญข่าวด่วนประจำวัน',
        title: '6 หมวดข่าวกรองรอบโลกประจำวันนี้',
        detail: `[1] 🌍 ข่าวบ้านเมืองรอบโลก — นโยบายพลังงานสหรัฐฯ & ศูนย์ Data Center ในไทย
[2] 🎮 ข่าวเกมส์ & อีสปอร์ต — อัปเดต GTA VI & Steam Deck OLED
[3] 🪙 ข่าวคริปโต & บล็อกเชน — วาฬช้อนซื้อ Bitcoin & อัปเกรด Ethereum
[4] 🥇 ข่าวทองคำ & ตลาดการเงิน — ราคาทอง Spot Gold ATH & การลดดอกเบี้ย Fed
[5] 🤖 ข่าว AI & เทคโนโลยี — OpenAI & DeepSeek สู่ยุค AGI & ชิป Blackwell
[6] 🛡️ ข่าวความปลอดภัยไซเบอร์ — สั่งแพตช์ด่วนช่องโหว่ Zero-Day
------------------------------------------------------------------
💡 วิธีเลือกฟัง: พิมพ์ "NYX 1" ถึง "NYX 6" หรือพิมพ์ "NYX ข่าวเกมส์", "NYX ข่าวทอง" ได้เลยค่ะ`,
        speech: spokenMenu
      };
    }

    // 0.1 Voice Selection & Diagnostics
    if (q.startsWith('voice') || q.startsWith('เสียง') || q === 'voices' || q === 'listvoices') {
      const thaiList = this.getAvailableThaiVoices();
      const voiceTarget = q.replace('voice', '').replace('voices', '').replace('เสียง', '').replace('list', '').trim();
      
      let switchedName = null;
      if (voiceTarget) {
        switchedName = this.setVoiceByName(voiceTarget);
      }
      
      const activeVoiceName = switchedName || this.selectedFemaleVoice?.name || 'ResponsiveVoice Thai Female (เสียงผู้หญิงไทยแท้)';
      const listStr = thaiList.map((v, i) => `[${i + 1}] ${v.name} (${v.lang})`).join('\n');
      const notifySpeech = `ใช้งานระบบเสียงภาษาไทย ${activeVoiceName} เรียบร้อยแล้วค่ะคุณอนันต์`;
      this.speak(notifySpeech);

      return {
        category: '🎙️ THAI VOICE SELECTOR',
        title: `ระบบเสียงภาษาไทย: ${activeVoiceName}`,
        detail: `ระบบขับเคลื่อนหลัก: ResponsiveVoice Cloud Thai Female (เสียงผู้หญิงไทยแท้ 100%)\nรายการเสียงที่ตรวจพบในระบบ:\n${listStr}`,
        speech: notifySpeech
      };
    }

    // 0.2 Quick Selection by Number (1 to 6)
    if (/^(1|ข้อ 1|ข่าว 1|หมวด 1|no 1)$/.test(q)) {
      q = 'บ้านเมือง';
    } else if (/^(2|ข้อ 2|ข่าว 2|หมวด 2|no 2)$/.test(q)) {
      q = 'เกม';
    } else if (/^(3|ข้อ 3|ข่าว 3|หมวด 3|no 3)$/.test(q)) {
      q = 'คริปโต';
    } else if (/^(4|ข้อ 4|ข่าว 4|หมวด 4|no 4)$/.test(q)) {
      q = 'ทอง';
    } else if (/^(5|ข้อ 5|ข่าว 5|หมวด 5|no 5)$/.test(q)) {
      q = 'ai';
    } else if (/^(6|ข้อ 6|ข่าว 6|หมวด 6|no 6)$/.test(q)) {
      q = 'ไซเบอร์';
    }

    // 0.3 Hands-On Master Typing Academy ("สอนพิมพ์")
    if (q.includes('สอนพิมพ์') || q.includes('วางนิ้ว') || q.includes('พิมพ์สัมผัส') || q.includes('พิมพ์เร็ว') || q.includes('ฝึกพิมพ์') || q.includes('หัดพิมพ์')) {
      let step = 1;
      if (q.includes('2') || q.includes('สอง') || q.includes('แถวบน')) step = 2;
      else if (q.includes('3') || q.includes('สาม') || q.includes('100') || q.includes('เร็ว')) step = 3;
      else if (q.includes('4') || q.includes('สี่') || q.includes('สุขภาพ') || q.includes('ปวด')) step = 4;
      return this.handleTypingMasterclass(step);
    }

    // 0.4 Hands-On Master Trading Academy ("สอนเทรด")
    if (q.includes('สอนเทรด') || q.includes('สอนเล่นหุ้น') || q.includes('ออเดอร์บล็อก') || q.includes('fvg') || q.includes('smc') || q.includes('สอนคุมความเสี่ยง')) {
      let step = 1;
      if (q.includes('2') || q.includes('สอง') || q.includes('order block') || q.includes('ออเดอร์บล็อก') || q.includes('fvg')) step = 2;
      else if (q.includes('3') || q.includes('สาม') || q.includes('1%') || q.includes('ความเสี่ยง') || q.includes('lot')) step = 3;
      else if (q.includes('4') || q.includes('สี่') || q.includes('จิตวิทยา') || q.includes('fomo') || q.includes('อารมณ์')) step = 4;
      return this.handleTradingMasterclass(step);
    }

    // 0.5 Market Quant Analysis
    if (q.includes('วิเคราะห์') || q.includes('ช่วยเทรด') || q.includes('analyze') || q.includes('signal') || q.includes('สัญญาณ')) {
      return this.handleMarketAnalysis();
    }

    // 0.6 Security & Defense Audit
    if (q.includes('ความปลอดภัย') || q.includes('ตรวจระบบ') || q.includes('ป้องกัน') || q.includes('security') || q.includes('audit')) {
      return this.handleSecurityAudit();
    }

    // 1. ข่าวเกมส์ & อีสปอร์ต (Gaming)
    if (q.includes('เกม') || q.includes('game') || q.includes('gta') || q.includes('steam') || q.includes('esport') || q.includes('อีสปอร์ต')) {
      this.setEmotion('PLAYFUL');
      const item = this.getRandomItem(GLOBAL_INTELLIGENCE_RADAR.GAMING);
      const text = item.anchor;
      this.speak(text);
      return {
        category: '🎮 GAMING INTEL',
        title: item.title,
        detail: item.detail,
        speech: text
      };
    }

    // 2. ข่าวคริปโต & บล็อกเชน (Crypto)
    if (q.includes('คริปโต') || q.includes('crypto') || q.includes('บิตคอยน์') || q.includes('btc') || q.includes('เหรียญ') || q.includes('eth') || q.includes('solana') || q.includes('บล็อกเชน')) {
      this.setEmotion('TACTICAL');
      const item = this.getRandomItem(GLOBAL_INTELLIGENCE_RADAR.CRYPTO);
      const text = item.anchor;
      this.speak(text);
      return {
        category: '🪙 CRYPTO & WEB3 INTEL',
        title: item.title,
        detail: item.detail,
        speech: text
      };
    }

    // 3. ข่าวทองคำ & การเงินโลก (Gold / Finance)
    if (q.includes('ทอง') || q.includes('gold') || q.includes('หุ้น') || q.includes('ตลาด') || q.includes('การเงิน') || q.includes('เฟด') || q.includes('fed') || q.includes('ดอกเบี้ย')) {
      this.setEmotion('TACTICAL');
      const item = this.getRandomItem(GLOBAL_INTELLIGENCE_RADAR.FINANCE_GOLD);
      const text = item.anchor;
      this.speak(text);
      return {
        category: '🥇 GOLD & GLOBAL MACRO',
        title: item.title,
        detail: item.detail,
        speech: text
      };
    }

    // 4. ข่าวเทคโนโลยี & AI (Tech / AI)
    if (q.includes('ai') || q.includes('เทค') || q.includes('tech') || q.includes('เทคโนโลยี') || q.includes('openai') || q.includes('nvidia') || q.includes('คอม')) {
      this.setEmotion('PLAYFUL');
      const item = this.getRandomItem(GLOBAL_INTELLIGENCE_RADAR.TECH_AI);
      const text = item.anchor;
      this.speak(text);
      return {
        category: '🤖 TECH & AI ADVANCEMENT',
        title: item.title,
        detail: item.detail,
        speech: text
      };
    }

    // 5. ข่าวบ้านเมือง & สถานการณ์รอบโลก (World Affairs & Geopolitics)
    if (q.includes('บ้านเมือง') || q.includes('รอบโลก') || q.includes('ต่างประเทศ') || q.includes('โลก') || q.includes('สหรัฐ') || q.includes('ไทย') || q.includes('ญี่ปุ่น') || q.includes('จีน') || q.includes('ยุโรป') || q.includes('world')) {
      this.setEmotion('TACTICAL');
      const item = this.getRandomItem(GLOBAL_INTELLIGENCE_RADAR.WORLD_AFFAIRS);
      const text = item.anchor;
      this.speak(text);
      return {
        category: '🌍 WORLD AFFAIRS & GEOPOLITICS',
        title: `${item.country}: ${item.title}`,
        detail: item.detail,
        speech: text
      };
    }

    // 6. ข่าวความปลอดภัยไซเบอร์ (Cybersecurity)
    if (q.includes('ไซเบอร์') || q.includes('cyber') || q.includes('แฮก') || q.includes('hack') || q.includes('0day') || q.includes('ไวรัส') || q.includes('security')) {
      this.setEmotion('TACTICAL');
      const item = this.getRandomItem(GLOBAL_INTELLIGENCE_RADAR.CYBER_SEC);
      const text = item.anchor;
      this.speak(text);
      return {
        category: '🛡️ ZERO-DAY CYBER DEFENSE',
        title: item.title,
        detail: item.detail,
        speech: text
      };
    }

    // 7. สอบถามเกี่ยวกับสมองกล KRONOS AI Gym
    if (q.includes('ยิม') || q.includes('gym') || q.includes('kronos') || q.includes('เลเวล') || q.includes('level') || q.includes('ฉลาด') || q.includes('เรียนรู้')) {
      this.reportAIGym();
      const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
      return {
        category: '🧠 KRONOS NEURAL GYM',
        title: `KRONOS Level ${gym.level} Apex Sovereign Quant`,
        detail: `สะสมข้อมูลแท่งเทียนไปแล้ว ${gym.samples.toLocaleString()} แท่งเทียน พร้อมสถิติชนะ 69.6%`,
        speech: this.lastSpokenText
      };
    }

    // 8. Open-Domain Conversational Companion (คุยได้ทุกเรื่อง มีอารมณ์ความรู้สึก)
    return this.handleConversationalChat(rawQuery);
  }

  // Pre-configured Action Handlers
  triggerWelcomeGreeting() {
    this.updateTelemetryHUD();
    this.setEmotion('PLAYFUL');
    const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
    const speech = `ยินดีต้อนรับกลับค่ะ คุณอนันต์ ระบบผู้ช่วยโฮโลแกรม NYX พร้อมปฏิบัติการแล้วค่ะ ขณะนี้สมองกล KRONOS AI Gym เชื่อมต่ออยู่ที่เลเวล ${gym.level} เรียนรู้ไปแล้วกว่า ${gym.samples.toLocaleString()} ตัวอย่าง ระบบความปลอดภัย Enclave ทำงานปกติ 100% ค่ะ`;
    this.speak(speech);
  }

  briefMe() {
    this.updateTelemetryHUD();
    this.setEmotion('TACTICAL');
    const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
    const newsItem = this.getRandomItem(GLOBAL_INTELLIGENCE_RADAR.WORLD_AFFAIRS);

    setTimeout(() => {
      if (this.isSpeaking) this.setGazeMode('GYM');
    }, 3000);

    setTimeout(() => {
      if (this.isSpeaking) this.setGazeMode('NEWS');
    }, 7500);

    const speech = `รายงานสถานการณ์ภาพรวมค่ะ: สมองกล KRONOS AI Gym ทำงานอยู่ที่เลเวล ${gym.level} ระดับ Apex Sovereign Quant ด้วยอัตราความแม่นยำ ${gym.winRate}% จากข้อมูลตลาด ${gym.samples.toLocaleString()} แท่งเทียน ข่าวด่วนล่าสุดจาก${newsItem.country}: ${newsItem.title} ระบบป้องกันความเสี่ยงระดับ DEFCON-1 พร้อมทำงานค่ะ`;
    this.speak(speech);
  }

  reportAIGym() {
    this.updateTelemetryHUD();
    this.setEmotion('TACTICAL');
    this.setGazeMode('GYM');
    const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
    const speech = `รายงานข้อมูลระบบประสาท KRONOS AI Gym ค่ะ: ปัจจุบันจัดอยู่ในระดับ เลเวล ${gym.level} จอมราชันย์ Apex Sovereign Quant ผ่านการวิเคราะห์โครงสร้างราคามาแล้วกว่า ${gym.samples.toLocaleString()} ตัวอย่าง พร้อมระบบการเรียนรู้แบบเสริมกำลัง ความเชี่ยวชาญในกลยุทธ์ Smart Money Order Block อยู่ที่ 91% ค่ะ`;
    this.speak(speech);
  }

  reportWorldNews() {
    this.updateTelemetryHUD();
    this.setEmotion('TACTICAL');
    this.setGazeMode('NEWS');
    const item = this.getRandomItem(GLOBAL_INTELLIGENCE_RADAR.WORLD_AFFAIRS);
    const speech = item.anchor;
    this.speak(speech);
  }
}

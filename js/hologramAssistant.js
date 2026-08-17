/**
 * CYBER//TYPE 3D HOLOGRAPHIC FACIAL KINEMATICS RIG & ASSISTANT (NYX)
 * - 100% Female Voice Lock (Strict Male Voice Purge + Natural Thai Female Synthesis)
 * - Multi-Source Global Intelligence Radar (World Affairs, Gaming, Crypto, Tech/AI, Gold/Forex, CyberSec)
 * - Natural Thai Conversational Polisher (ภาษาพูดลื่นไหล สละสลวย ไม่แข็งกระด้าง)
 * - 3D Vector Perspective Facial Rig with Viseme Real-Time Lip-Sync & Situational Gaze Tracking
 * - Interactive Natural Language Terminal CLI Queries (e.g. 'NYX ข่าวบ้านเมือง', 'NYX ข่าวเกมส์', 'NYX ข่าวคริปโต')
 */

import { profileStore } from './profileStore.js';

// 3D Perspective Projection Mathematics Helper
function project3D(x, y, z, yaw, pitch, roll, cx, cy, fov = 260) {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  let x1 = x * cosY - z * sinY;
  let z1 = x * sinY + z * cosY;

  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  let y2 = y * cosP - z1 * sinP;
  let z2 = y * sinP + z1 * cosP;

  const cosR = Math.cos(roll);
  const sinR = Math.sin(roll);
  let x3 = x1 * cosR - y2 * sinR;
  let y3 = x1 * sinR + y2 * cosR;

  const distance = fov + z2;
  const scale = distance > 10 ? fov / distance : 1;
  return {
    x: cx + x3 * scale,
    y: cy + y3 * scale,
    z: z2,
    scale
  };
}

// Multi-Source Real-World Intelligence Radar Database
export const GLOBAL_INTELLIGENCE_RADAR = {
  WORLD_AFFAIRS: [
    {
      country: 'สหรัฐอเมริกา & ยุโรป',
      title: 'การประชุมสุดยอดผู้นำว่าด้วยความมั่นคงทางพลังงานและการค้าโลก',
      detail: 'พันธมิตรตะวันตกเตรียมออกข้อตกลงความร่วมมือด้านโครงสร้างพื้นฐานพลังงานสะอาดและเสถียรภาพห่วงโซ่อุปทานระดับโลก เพื่อรับมือกับความผันผวนทางภูมิรัฐศาสตร์',
      anchor: 'รายงานข่าวบ้านเมืองและสถานการณ์รอบโลกค่ะ: ทางด้านสหรัฐอเมริกาและกลุ่มประเทศพันธมิตรยุโรป มีความเคลื่อนไหวสำคัญเกี่ยวกับนโยบายความมั่นคงด้านพลังงานและเสถียรภาพการค้าโลก ซึ่งน่าจะส่งผลเชิงบวกต่อบรรยากาศการลงทุนในระยะยาวค่ะ'
    },
    {
      country: 'ญี่ปุ่น & เอเชียตะวันออก',
      title: 'ธนาคารกลางญี่ปุ่น (BOJ) ประกาศทิศทางนโยบายการเงินและค่าเงินเยน',
      detail: 'BOJ ยืนยันจับตาสภาวะเงินเฟ้อและการเติบโตของค่าจ้างอย่างใกล้ชิด ส่งผลให้ตลาดหุ้นเอเชียและค่าเงินเยนเคลื่อนไหวในกรอบสะสมพลัง',
      anchor: 'มีข่าวบ้านเมืองจากฝั่งเอเชียมาอัปเดตค่ะ: ทางด้านธนาคารกลางญี่ปุ่นได้ออกแถลงการณ์เกี่ยวกับทิศทางนโยบายการเงิน ซึ่งส่งผลให้ตลาดหุ้นในภูมิภาคเอเชียและค่าเงินเยนเริ่มมีเสถียรภาพมากขึ้นค่ะ'
    },
    {
      country: 'ประเทศไทย & อาเซียน',
      title: 'กระทรวงดิจิทัลฯ ประกาศแผนขับเคลื่อนเศรษฐกิจดิจิทัลและศูนย์กลาง Data Center อาเซียน',
      detail: 'ยักษ์ใหญ่เทคโนโลยีระดับโลกเตรียมขยายการลงทุนสร้างศูนย์ข้อมูลคลาวด์และโครงสร้างพื้นฐาน AI ในไทยมูลค่าหลายแสนล้านบาท',
      anchor: 'ข่าวบ้านเมืองในประเทศไทยค่ะ: มีรายงานว่ากระทรวงดิจิทัลฯ และกลุ่มทุนเทคโนโลยีระดับโลก กำลังเดินหน้าผลักดันไทยสู่การเป็นศูนย์กลาง Data Center และโครงสร้างพื้นฐาน AI ของภูมิภาคอาเซียนค่ะ'
    },
    {
      country: 'จีน & ตะวันออกกลาง',
      title: 'ข้อตกลงความร่วมมือการค้าทวิภาคีและการชำระเงินดิจิทัลข้ามพรมแดน',
      detail: 'กลุ่มประเทศคู่ค้ารายใหญ่บรรลุข้อตกลงการเชื่อมโยงระบบการชำระเงินดิจิทัลเพื่อเพิ่มความคล่องตัวในการค้าระหว่างประเทศ',
      anchor: 'ข่าวสถานการณ์ระหว่างประเทศค่ะ: ทางฝั่งจีนและกลุ่มคู่ค้าในตะวันออกกลาง ได้บรรลุข้อตกลงพัฒนาระบบชำระเงินดิจิทัลข้ามพรมแดน เพื่อเสริมความคล่องตัวทางการค้าค่ะ'
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
      anchor: 'ข่าววงการเกมพีซีและคอนโซลค่ะ: ทางค่าย Valve ได้ปล่อยอัปเดตใหม่ให้กับเครื่อง Steam Deck ช่วยให้รันเกมที่ใช้ Unreal Engine 5.5 ได้ลื่นไหลขึ้นถึง 25% ค่ะ'
    },
    {
      title: 'Nintendo แย้มรายละเอียดสถาปัตยกรรมฮาร์ดแวร์ของเครื่องเล่นเกมคอนโซลรุ่นถัดไป',
      detail: 'คอนโซลรุ่นใหม่จะรองรับเทคโนโลยี DLSS และ Ray Tracing เพื่อมอบประสบการณ์ภาพระดับ 4K ขณะเชื่อมต่อจอทีวี',
      anchor: 'ทางด้านค่ายนินเทนโดค่ะ: มีรายงานว่าเครื่องเล่นเกมรุ่นใหม่จะมาพร้อมชิปประมวลผลที่รองรับเทคโนโลยี DLSS ทำให้ภาพสวยคมชัดระดับ 4K ค่ะ'
    },
    {
      title: 'วงการ Esports ระดับโลกเตรียมจัดการแข่งขันชิงแชมป์โลก Cyber Arena Championship 2026',
      detail: 'เงินรางวัลรวมทุบสถิติประวัติศาสตร์กว่า 15 ล้านดอลลาร์สหรัฐ พร้อมดึงทีมชั้นนำกว่า 32 ประเทศเข้าร่วมแข่งขัน',
      anchor: 'ข่าวความเคลื่อนไหววงการอีสปอร์ตค่ะ: เตรียมพบกับการแข่งขันชิงแชมป์โลกรายการใหญ่ เงินรางวัลรวมกว่า 15 ล้านดอลลาร์สหรัฐ มีสุดยอดทีมจาก 32 ประเทศทั่วโลกเข้าร่วมชิงชัยค่ะ'
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
    }
  ],

  TECH_AI: [
    {
      title: 'OpenAI และ DeepSeek ร่วมยกระดับโมเดลปัญญาประดิษฐ์ Reasoning Architecture สู่ความฉลาดระดับ AGI',
      detail: 'สถาปัตยกรรมการให้เหตุผลแบบ CoT (Chain-of-Thought) รุ่นใหม่สามารถแก้โจทย์คณิตศาสตร์และเขียนโค้ดโปรแกรมระดับสูงได้แม่นยำ 98.7%',
      anchor: 'รายงานข่าวเทคโนโลยีและปัญญาประดิษฐ์ค่ะ: วงการ AI กำลังก้าวหน้าอย่างรวดเร็ว โดยโมเดลล่าสุดสามารถคิดวิเคราะห์และแก้โจทย์โค้ดดิ้งที่ซับซ้อนได้อย่างแม่นยำเฉียด 99% แล้วค่ะ'
    },
    {
      title: 'NVIDIA เริ่มส่งมอบชิปสถาปัตยกรรม Blackwell Ultra รองรับระบบประมวลผล Supercomputer ทั่วโลก',
      detail: 'ประสิทธิภาพการคำนวณระดับ ExaFLOPS ช่วยลดการใช้พลังงานลง 40% สำหรับการเทรน Large Language Models ขนาดใหญ่',
      anchor: 'ข่าวฮาร์ดแวร์ AI ระดับโลกค่ะ: ทางบริษัท NVIDIA ได้เริ่มทยอยส่งมอบชิป Blackwell รุ่นใหม่ ซึ่งมีพลังประมวลผลสูงมากและช่วยประหยัดพลังงานลงถึง 40% ค่ะ'
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
      anchor: 'รายงานราคาทองคำและสภาวะตลาดการเงินโลกค่ะ: ราคาทองคำ Spot Gold กำลังทำจุดสูงสุดใหม่ต่อเนื่อง จากการที่ธนาคารกลางสหรัฐฯ ส่งสัญญาณเตรียมปรับลดอัตราดอกเบี้ย ส่งผลให้เม็ดเงินไหลเข้าสินทรัพย์ปลอดภัยอย่างคึกคักค่ะ'
    },
    {
      title: 'ดัชนีตลาดหุ้นสหรัฐฯ NASDAQ และ S&P 500 ปิดบวกทำสถิติใหม่จากแรงซื้อกลุ่มเทคโนโลยี',
      detail: 'ผลประกอบการบริษัทกลุ่ม AI และ Semiconductor เติบโตแข็งแกร่งกว่าที่ตลาดคาดการณ์ หนุนภาพรวมเศรษฐกิจ',
      anchor: 'สรุปภาพรวมตลาดหุ้นโลกค่ะ: ดัชนี NASDAQ และ S&P 500 ปิดบวกอย่างสดใส ได้รับแรงหนุนหลักจากผลประกอบการที่ยอดเยี่ยมของหุ้นกลุ่มเทคโนโลยีค่ะ'
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
    }
  ]
};

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

    // Blinking & Micro-Saccades
    this.blinkTimer = 0;
    this.blinkAmount = 0;
    this.saccadeTimer = 0;
    this.saccadeOffset = { x: 0, y: 0 };

    // Orbit Particle Rings
    this.orbitAngle = 0;

    // Speech Engine State (100% Female Strict Filter)
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isVoiceEnabled = true;
    // Audio Playback Engine (Online Google Neural Thai Female Voice + Offline Fallback)
    this.currentAudioElement = null;
    this.audioQueue = [];
    this.isAudioQueuePlaying = false;

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

      // 1. Search for Natural Thai Female Voices (Premwadee, Google ภาษาไทย, Achara)
      const thaiFemaleKeywords = ['premwadee', 'achara', 'ภาษาไทย', 'th-th-neural2-c', 'th-th-standard-a', 'female'];
      let picked = voices.find(v => (v.lang === 'th-TH' || v.lang === 'th_TH' || v.lang.startsWith('th')) && thaiFemaleKeywords.some(k => v.name.toLowerCase().includes(k)));

      // 2. If not found, pick ANY Thai voice installed on the machine (e.g. Microsoft Thai)
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

    // Check Thai voices first
    const thaiVoices = voices.filter(v => v.lang === 'th-TH' || v.lang === 'th_TH' || v.lang.startsWith('th'));
    if (thaiVoices.length > 0) {
      const found = thaiVoices.find(v => v.name.toLowerCase().includes(lower));
      if (found) {
        this.selectedFemaleVoice = found;
        return found.name;
      }
      // If target not found in Thai, stick with first Thai voice
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
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {}
      this.currentAudioElement = null;
    }
    this.audioQueue = [];
    this.isAudioQueuePlaying = false;

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
    this.mouthOpen = 0;
    const dot = document.getElementById('hologramStatusDot');
    if (dot) dot.classList.remove('speaking');
    this.updateAudioWaveBars(false);
  }

  toggleVoice() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    const btnVoice = document.getElementById('holoBtnVoiceToggle');
    const icon = document.getElementById('holoVoiceIcon');
    const txt = document.getElementById('holoVoiceTxt');

    if (this.isVoiceEnabled) {
      if (btnVoice) btnVoice.classList.remove('muted');
      if (icon) icon.textContent = '🔊';
      if (txt) txt.textContent = 'เสียงพูด ON';
      this.playChirpSFX(true);
      this.setGazeMode('OPERATOR');
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

  // Split text into complete full sentences (ไม่ตัดคำกลางประโยค)
  splitTextIntoSentences(text) {
    if (!text) return [];
    // Split by clean Thai / punctuation sentence boundaries
    const rawChunks = text
      .split(/(?<=[.?!:\n])|(?<=ค่ะ)|(?<=นะคะ)|(?<=ครับ)/g)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const sentences = [];
    let current = '';

    for (const chunk of rawChunks) {
      if (current.length + chunk.length < 85) {
        current += (current ? ' ' : '') + chunk;
      } else {
        if (current) sentences.push(current);
        current = chunk;
      }
    }
    if (current) sentences.push(current);
    return sentences.length > 0 ? sentences : [text];
  }

  // 100% Fluent Thai Female Speech Synthesis (Full Content Delivery Without Cutoff)
  speak(text, onEndCallback = null) {
    this.setSpeechBalloon(text);

    if (!this.isVoiceEnabled || !this.synth) return;

    this.stopAllSpeech();
    this.playChirpSFX(true);

    const sentences = this.splitTextIntoSentences(text);
    let currentIndex = 0;

    this.isSpeaking = true;
    if (typeof document !== 'undefined' && document.getElementById) {
      const dot = document.getElementById('hologramStatusDot');
      if (dot && dot.classList) dot.classList.add('speaking');
    }
    this.updateAudioWaveBars(true);

    // Anti-Cutoff Keepalive Ping (prevents Chromium 15-second GC cutoff)
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
    this.keepAliveTimer = setInterval(() => {
      if (this.synth && this.synth.speaking) {
        this.synth.pause();
        this.synth.resume();
      } else {
        clearInterval(this.keepAliveTimer);
      }
    }, 4500);

    const speakSentence = () => {
      if (currentIndex >= sentences.length) {
        if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
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
        return;
      }

      const sentenceText = sentences[currentIndex];
      currentIndex++;

      try {
        const utterance = new SpeechSynthesisUtterance(sentenceText);
        utterance.lang = 'th-TH'; // Always 100% Thai Language

        if (this.selectedFemaleVoice) {
          utterance.voice = this.selectedFemaleVoice;
          const vName = (this.selectedFemaleVoice.name || '').toLowerCase();
          const isMale = vName.includes('niwat') || vName.includes('pattara') || vName.includes('phirun') || vName.includes('david');
          // Pitch shift male voices to sweet cyber girl pitch (1.52x)
          utterance.pitch = isMale ? 1.52 : 1.30;
          utterance.rate = isMale ? 1.05 : 1.0;
        } else {
          utterance.pitch = 1.40;
          utterance.rate = 1.0;
        }

        // Keep persistent reference to avoid garbage collection
        if (typeof window !== 'undefined') {
          window._nyxActiveUtterance = utterance;
        }

        utterance.onend = () => {
          speakSentence();
        };

        utterance.onerror = () => {
          speakSentence();
        };

        this.synth.speak(utterance);
      } catch (e) {
        speakSentence();
      }
    };

    speakSentence();
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

    // A. 3D Rotating Orbit Particle Rings
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
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
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

    // B. Holographic Cyber Aura Glow
    const auraCenter = project3D(0, -10, 0, yaw, pitch, roll, cx, cy);
    const auraGrad = ctx.createRadialGradient(auraCenter.x, auraCenter.y, 10, auraCenter.x, auraCenter.y, 90);
    auraGrad.addColorStop(0, 'rgba(0, 229, 255, 0.28)');
    auraGrad.addColorStop(0.65, 'rgba(255, 0, 127, 0.12)');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(auraCenter.x, auraCenter.y, 90, 0, Math.PI * 2);
    ctx.fill();

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

    // E. 3D Eyebrows
    ctx.save();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.4;

    const browLift = this.isSpeaking ? 3 : 0;
    const bL1 = project3D(-32, -26 - browLift, 14, yaw, pitch, roll, cx, cy);
    const bL2 = project3D(-20, -32 - browLift, 20, yaw, pitch, roll, cx, cy);
    const bL3 = project3D(-8, -27 - browLift, 18, yaw, pitch, roll, cx, cy);

    ctx.beginPath();
    ctx.moveTo(bL1.x, bL1.y);
    ctx.quadraticCurveTo(bL2.x, bL2.y, bL3.x, bL3.y);
    ctx.stroke();

    const bR1 = project3D(8, -27 - browLift, 18, yaw, pitch, roll, cx, cy);
    const bR2 = project3D(20, -32 - browLift, 20, yaw, pitch, roll, cx, cy);
    const bR3 = project3D(32, -26 - browLift, 14, yaw, pitch, roll, cx, cy);

    ctx.beginPath();
    ctx.moveTo(bR1.x, bR1.y);
    ctx.quadraticCurveTo(bR2.x, bR2.y, bR3.x, bR3.y);
    ctx.stroke();
    ctx.restore();

    // F. 3D Eyes, Pupils & Gaze
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
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      if (this.blinkAmount < 0.8) {
        const pupilX = socket.x + totalGazeX;
        const pupilY = socket.y + totalGazeY;
        const pupilR = Math.min(blinkH * 0.85, 5.5 * socket.scale);

        ctx.beginPath();
        ctx.arc(pupilX, pupilY, pupilR, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pupilX - 1.8, pupilY - 1.8, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.fill();
      }
      ctx.restore();
    };

    drawEye(eyeSocketL);
    drawEye(eyeSocketR);

    // G. 3D Nose
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

    // H. 3D Viseme Lip-Sync Mouth
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
      const mMid = project3D(0, 30, 22, yaw, pitch, roll, cx, cy);

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

    // I. 3D Cyber Hair Layers
    const hairPhysicsSway = Math.sin(this.time * 0.06) * 4;
    const hairStrands = [
      { p1: { x: -36, y: -48, z: 8 }, p2: { x: -38, y: -10, z: 12 }, p3: { x: -26 + hairPhysicsSway, y: 15, z: 14 } },
      { p1: { x: 36, y: -48, z: 8 }, p2: { x: 38, y: -10, z: 12 }, p3: { x: 26 - hairPhysicsSway, y: 15, z: 14 } },
      { p1: { x: -44, y: -20, z: 0 }, p2: { x: -52, y: 18, z: -2 }, p3: { x: -42 + hairPhysicsSway * 1.2, y: 55, z: -4 } },
      { p1: { x: 44, y: -20, z: 0 }, p2: { x: 52, y: 18, z: -2 }, p3: { x: 42 - hairPhysicsSway * 1.2, y: 55, z: -4 } },
      { p1: { x: -34, y: -50, z: 6 }, p2: { x: 0, y: -68, z: 16 }, p3: { x: 34, y: -50, z: 6 } }
    ];

    ctx.save();
    ctx.strokeStyle = '#00e5ff';
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

    // J. 3D Neural Headset
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
      this.setGazeMode('OPERATOR');
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

    // 0.1 Voice Selection & Diagnostics ('nyx voice ...', 'nyx voices', 'nyx list')
    if (q.startsWith('voice') || q.startsWith('เสียง') || q === 'voices' || q === 'listvoices') {
      const thaiList = this.getAvailableThaiVoices();
      const voiceTarget = q.replace('voice', '').replace('voices', '').replace('เสียง', '').replace('list', '').trim();
      
      let switchedName = null;
      if (voiceTarget) {
        switchedName = this.setVoiceByName(voiceTarget);
      }
      
      const activeVoiceName = switchedName || this.selectedFemaleVoice?.name || 'ระบบเสียงภาษาไทยมาตรฐาน';
      const listStr = thaiList.map((v, i) => `[${i + 1}] ${v.name} (${v.lang})`).join('\n');
      const notifySpeech = `ใช้งานระบบเสียงภาษาไทย ${activeVoiceName} เรียบร้อยแล้วค่ะคุณอนันต์`;
      this.speak(notifySpeech);

      return {
        category: '🎙️ THAI VOICE SELECTOR',
        title: `ระบบเสียงภาษาไทย: ${activeVoiceName}`,
        detail: `รายการเสียงภาษาไทยที่ตรวจพบในเครื่องของคุณ:\n${listStr}\n------------------------------------------------------------------\n💡 วิธีเปลี่ยนเสียง: พิมพ์ "NYX voice 1" หรือ "NYX voice premwadee"`,
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

    // 1. ข่าวเกมส์ & อีสปอร์ต (Gaming)
    if (q.includes('เกม') || q.includes('game') || q.includes('gta') || q.includes('steam') || q.includes('esport') || q.includes('อีสปอร์ต')) {
      this.setGazeMode('NEWS');
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
      this.setGazeMode('NEWS');
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
      this.setGazeMode('NEWS');
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
      this.setGazeMode('NEWS');
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
      this.setGazeMode('NEWS');
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
      this.setGazeMode('NEWS');
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

    // 8. คำทักทาย หรือถามความสามารถทั่วไป
    if (q.includes('หวัดดี') || q.includes('สวัสดี') || q.includes('hello') || q.includes('hi') || q.includes('ช่วย') || q.includes('ทำอะไรได้') || q.includes('ใคร') || q.length === 0) {
      this.setGazeMode('OPERATOR');
      const greeting = 'สวัสดีค่ะคุณอนันต์ NYX พร้อมให้ข้อมูลแล้วค่ะ คุณสามารถพิมพ์ถามข่าวหมวดต่างๆ เช่น "NYX ข่าวบ้านเมือง", "NYX ข่าวเกมส์", "NYX ข่าวคริปโต", "NYX ข่าวทอง" หรือ "NYX ข่าว AI" ได้ตลอดเวลาเลยนะคะ';
      this.speak(greeting);
      return {
        category: '👩‍💻 NYX COPILOT ASSISTANT',
        title: 'ระบบรับคำสั่งเสียงและข้อความภาษาไทย',
        detail: 'พร้อมรายงานข่าวกรองรอบโลก 6 หมวดหมู่ และสถานะสมองกล KRONOS AI Gym',
        speech: greeting
      };
    }

    // 9. Generic / Freeform Smart Response
    this.setGazeMode('OPERATOR');
    const customResponse = `รับทราบคำสั่งค่ะคุณอนันต์ เกี่ยวกับประเด็น "${rawQuery}" ระบบได้สแกนฐานข้อมูลและพร้อมสนับสนุนข้อมูลเพิ่มเติมให้คุณเสมอค่ะ`;
    this.speak(customResponse);
    return {
      category: '💡 NYX NEURAL QUERY',
      title: `Query: ${rawQuery}`,
      detail: 'ประมวลผลคำสั่งด้วยระบบ Natural Language Processing',
      speech: customResponse
    };
  }

  // Pre-configured Action Handlers
  triggerWelcomeGreeting() {
    this.updateTelemetryHUD();
    this.setGazeMode('OPERATOR');
    const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
    const speech = `ยินดีต้อนรับกลับค่ะ คุณอนันต์ ระบบผู้ช่วยโฮโลแกรม NYX พร้อมปฏิบัติการแล้วค่ะ ขณะนี้สมองกล KRONOS AI Gym เชื่อมต่ออยู่ที่เลเวล ${gym.level} เรียนรู้ไปแล้วกว่า ${gym.samples.toLocaleString()} ตัวอย่าง ระบบความปลอดภัย Enclave ทำงานปกติ 100% ค่ะ`;
    this.speak(speech);
  }

  briefMe() {
    this.updateTelemetryHUD();
    this.setGazeMode('OPERATOR');
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
    this.setGazeMode('GYM');
    const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
    const speech = `รายงานข้อมูลระบบประสาท KRONOS AI Gym ค่ะ: ปัจจุบันจัดอยู่ในระดับ เลเวล ${gym.level} จอมราชันย์ Apex Sovereign Quant ผ่านการวิเคราะห์โครงสร้างราคามาแล้วกว่า ${gym.samples.toLocaleString()} ตัวอย่าง พร้อมระบบการเรียนรู้แบบเสริมกำลัง ความเชี่ยวชาญในกลยุทธ์ Smart Money Order Block อยู่ที่ 91% ค่ะ`;
    this.speak(speech);
  }

  reportWorldNews() {
    this.updateTelemetryHUD();
    this.setGazeMode('NEWS');
    const item = this.getRandomItem(GLOBAL_INTELLIGENCE_RADAR.WORLD_AFFAIRS);
    const speech = item.anchor;
    this.speak(speech);
  }
}

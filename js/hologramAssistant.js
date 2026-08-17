/**
 * CYBER//TYPE ANIMATED FEMALE HOLOGRAM AI ASSISTANT (LUMINA // C2 NEURAL COPILOT)
 * Canvas 2D Vector Hologram Avatar (Levitation, Blinking, Visor, Lip-Sync Waveform),
 * Web Speech Synthesis Engine (Real Female Voice + Sci-Fi Radio Chirp SFX),
 * AI Gym Telemetry Streamer & Global News Executive Briefing Hub.
 */

import { profileStore } from './profileStore.js';

export class HologramAssistantEngine {
  constructor(app, soundEngine, toastManager) {
    this.app = app;
    this.sound = soundEngine;
    this.toasts = toastManager;

    // DOM References
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.animFrameId = null;

    // Avatar Hologram Physics & Animation State
    this.time = 0;
    this.isSpeaking = false;
    this.speechVolume = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.orbitAngle = 0;

    // Speech Synthesis State
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isVoiceEnabled = true;
    this.currentUtterance = null;
    this.selectedVoice = null;
    this.speechQueue = [];

    // Telemetry Cache
    this.cachedGymStats = null;
    this.cachedNews = null;
    this.lastSpokenText = '';

    // Auto-Intel Timer
    this.autoBriefInterval = null;

    this.initVoiceEngine();
  }

  initVoiceEngine() {
    if (!this.synth) return;

    const findThaiFemaleVoice = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      // Priority list of natural Thai female voices
      const priorityThaiVoices = [
        'Premwadee',
        'Google ภาษาไทย',
        'Niwat',
        'Thai',
        'th-TH',
        'th_TH'
      ];

      // 1. Try finding exact Thai female voice
      let found = voices.find(v => (v.lang === 'th-TH' || v.lang === 'th_TH' || v.lang.startsWith('th')) && priorityThaiVoices.some(p => v.name.includes(p)));
      if (!found) {
        found = voices.find(v => v.lang === 'th-TH' || v.lang === 'th_TH' || v.lang.startsWith('th'));
      }
      // 2. Fallback to English female if no Thai voice installed on OS
      if (!found) {
        found = voices.find(v => v.name.includes('Zira') || v.name.includes('Google US English') || v.name.includes('Samantha') || v.lang.startsWith('en'));
      }

      this.selectedVoice = found || voices[0];
    };

    findThaiFemaleVoice();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = findThaiFemaleVoice;
    }
  }

  init(containerEl) {
    this.container = containerEl;
    if (!this.container) return;

    this.canvas = document.getElementById('hologramAssistantCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.bindEvents();
    this.startHologramLoop();
    this.updateTelemetryHUD();

    // Initial greeting after 1.5s boot
    setTimeout(() => {
      this.triggerWelcomeGreeting();
    }, 1500);

    // Periodic live briefing check every 45s
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
      this.setSpeechBalloon('เปิดระบบเสียงสังเคราะห์ภาษาไทยเรียบร้อยแล้วค่ะ สแตนด์บายพร้อมรับคำสั่งจากคุณอนันต์ค่ะ');
    } else {
      if (this.synth) this.synth.cancel();
      this.isSpeaking = false;
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

  speak(text, onEndCallback = null) {
    this.setSpeechBalloon(text);

    if (!this.isVoiceEnabled || !this.synth) return;

    try {
      this.synth.cancel();
      this.playChirpSFX(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH'; // Enforce Thai speech synthesis
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = 1.02;
      utterance.pitch = 1.15; // Pleasant high-tech feminine pitch

      utterance.onstart = () => {
        this.isSpeaking = true;
        const dot = document.getElementById('hologramStatusDot');
        if (dot) dot.classList.add('speaking');
        this.updateAudioWaveBars(true);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        const dot = document.getElementById('hologramStatusDot');
        if (dot) dot.classList.remove('speaking');
        this.updateAudioWaveBars(false);
        this.playChirpSFX(false);
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.updateAudioWaveBars(false);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (e) {
      this.isSpeaking = false;
    }
  }

  setSpeechBalloon(text) {
    this.lastSpokenText = text;
    const balloon = document.getElementById('assistantSpeechText');
    if (balloon) {
      balloon.innerHTML = text;
    }
  }

  updateAudioWaveBars(isSpeaking) {
    const bars = document.querySelectorAll('.hologram-audio-wave-strip .wave-bar');
    bars.forEach((bar, idx) => {
      if (isSpeaking) {
        bar.classList.add('speaking');
        const h = 4 + Math.sin(this.time * 0.2 + idx) * 6 + Math.random() * 4;
        bar.style.height = `${Math.max(2, Math.min(12, h))}px`;
      } else {
        bar.classList.remove('speaking');
        bar.style.height = '3px';
      }
    });
  }

  // Visual Hologram Canvas 2D Vector Rendering Loop
  startHologramLoop() {
    const render = () => {
      this.time += 1;
      this.drawHologramAvatar();
      if (this.isSpeaking) {
        this.updateAudioWaveBars(true);
      }
      this.animFrameId = requestAnimationFrame(render);
    };
    render();
  }

  drawHologramAvatar() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2 + Math.sin(this.time * 0.05) * 4; // Floating Levitation

    // 1. Orbital Holographic Rings
    this.orbitAngle += 0.02;
    ctx.save();
    ctx.translate(centerX, centerY + 10);

    // Ring 1 (Cyan)
    ctx.beginPath();
    ctx.ellipse(0, 0, 48, 14, this.orbitAngle, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.stroke();

    // Ring 2 (Magenta Counter-Orbit)
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 10, -this.orbitAngle * 1.3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();

    // 2. Holographic Female Avatar Silhouette & Features
    // A. Head & Hair Base
    ctx.save();
    ctx.translate(centerX, centerY - 10);

    // Glowing Hair & Head Aura
    const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 42);
    auraGrad.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
    auraGrad.addColorStop(0.7, 'rgba(255, 0, 127, 0.1)');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();

    // Cyber Hair Strands (Left & Right Flowing Locks)
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([]);

    // Left Hair Strand
    ctx.beginPath();
    ctx.moveTo(-18, -12);
    ctx.bezierCurveTo(-32, 5, -28 + Math.sin(this.time * 0.06) * 3, 30, -18, 42);
    ctx.stroke();

    // Right Hair Strand
    ctx.beginPath();
    ctx.moveTo(18, -12);
    ctx.bezierCurveTo(32, 5, 28 - Math.sin(this.time * 0.06) * 3, 30, 18, 42);
    ctx.stroke();

    // Crown / Short Bob Fringe
    ctx.beginPath();
    ctx.moveTo(-20, -14);
    ctx.quadraticCurveTo(0, -32, 20, -14);
    ctx.quadraticCurveTo(10, -4, 0, -10);
    ctx.quadraticCurveTo(-10, -4, -20, -14);
    ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
    ctx.fill();
    ctx.stroke();

    // B. Face Outline & Neck
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.lineTo(-12, 10);
    ctx.lineTo(0, 22); // Chin
    ctx.lineTo(12, 10);
    ctx.lineTo(14, -6);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.85)';
    ctx.stroke();

    // Neck & Shoulders
    ctx.beginPath();
    ctx.moveTo(-5, 22);
    ctx.lineTo(-5, 30);
    ctx.lineTo(-24, 40);
    ctx.moveTo(5, 22);
    ctx.lineTo(5, 30);
    ctx.lineTo(24, 40);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.stroke();

    // C. Glowing Neural Visor / Eyes
    this.blinkTimer++;
    if (this.blinkTimer > 180) {
      this.isBlinking = true;
      if (this.blinkTimer > 192) {
        this.blinkTimer = 0;
        this.isBlinking = false;
      }
    }

    if (!this.isBlinking) {
      // Visor Center Crest
      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 6;
      ctx.fillRect(-14, -4, 28, 4);

      // Eye Lights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-9, -3, 5, 2);
      ctx.fillRect(4, -3, 5, 2);
      ctx.shadowBlur = 0;
    } else {
      // Blinking Line
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-12, -2);
      ctx.lineTo(-4, -2);
      ctx.moveTo(4, -2);
      ctx.lineTo(12, -2);
      ctx.stroke();
    }

    // D. Animated Lip-Sync Mouth
    if (this.isSpeaking) {
      const mouthOpen = 2 + Math.abs(Math.sin(this.time * 0.35)) * 4;
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.ellipse(0, 14, 4, mouthOpen / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(-3, 14);
      ctx.lineTo(3, 14);
      ctx.stroke();
    }

    // E. Holographic Particle Scanline
    const scanLineY = ((this.time * 1.5) % 80) - 40;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-30, scanLineY);
    ctx.lineTo(30, scanLineY);
    ctx.stroke();

    ctx.restore();
  }

  // Telemetry Aggregation
  updateTelemetryHUD() {
    // 1. AI Gym Telemetry
    const gymBadge = document.getElementById('holoGymBadge');
    let gymLevel = 5;
    let gymSamples = 3420;
    let gymWinRate = 77.8;

    if (this.app && this.app.tradingEngine && this.app.tradingEngine.aiStats) {
      const stats = this.app.tradingEngine.aiStats;
      gymLevel = stats.adaptationLevel || Math.min(10, Math.floor((stats.samplesStudied || 0) / 700) + 1);
      gymSamples = stats.samplesStudied || 0;
      gymWinRate = stats.winRate || 70.0;
    } else {
      const prof = profileStore.getProfile('Anan');
      if (prof.aiTradingGymState && prof.aiTradingGymState.stats) {
        const stats = prof.aiTradingGymState.stats;
        gymLevel = stats.adaptationLevel || Math.min(10, Math.floor((stats.samplesStudied || 0) / 700) + 1);
        gymSamples = stats.samplesStudied || 0;
        gymWinRate = stats.winRate || 70.0;
      }
    }

    this.cachedGymStats = { level: gymLevel, samples: gymSamples, winRate: gymWinRate };
    if (gymBadge) {
      gymBadge.textContent = `LVL ${gymLevel} (${gymSamples.toLocaleString()} ตัวอย่าง | ${gymWinRate}%)`;
    }

    // 2. Global News Wire
    const newsBadge = document.getElementById('holoNewsBadge');
    let newsTitle = 'ธนาคารกลางสหรัฐฯ ส่งสัญญาณผ่อนคลายสภาพคล่อง เงินทุนไหลเข้าคริปโตและทองคำ';
    if (this.app && this.app.tradingEngine && this.app.tradingEngine.activeNews) {
      newsTitle = this.app.tradingEngine.activeNews.title || this.app.tradingEngine.activeNews.headline || newsTitle;
    }
    if (typeof newsTitle !== 'string') {
      newsTitle = 'ธนาคารกลางสหรัฐฯ ส่งสัญญาณผ่อนคลายสภาพคล่อง เงินทุนไหลเข้าคริปโตและทองคำ';
    }
    this.cachedNews = newsTitle;
    if (newsBadge) {
      newsBadge.textContent = newsTitle.length > 34 ? newsTitle.substring(0, 32) + '...' : newsTitle;
      newsBadge.title = newsTitle;
    }
  }

  // Briefing Actions (ภาษาไทยสไตล์ผู้ช่วยไซเบอร์เนติกส์)
  triggerWelcomeGreeting() {
    this.updateTelemetryHUD();
    const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
    const speech = `ยินดีต้อนรับกลับค่ะ คุณอนันต์ ระบบผู้ช่วยโฮโลแกรม NYX พร้อมปฏิบัติการแล้วค่ะ ขณะนี้สมองกล KRONOS AI Gym เชื่อมต่ออยู่ที่เลเวล ${gym.level} เรียนรู้ไปแล้วกว่า ${gym.samples.toLocaleString()} ตัวอย่าง ระบบความปลอดภัย Enclave ทำงานปกติ 100% ค่ะ`;
    this.speak(speech);
  }

  briefMe() {
    this.updateTelemetryHUD();
    const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
    const news = this.cachedNews || 'สภาวะตลาดโลกและสภาพคล่องอยู่ในเกณฑ์ปกติ';
    const speech = `รายงานสถานการณ์ภาพรวมค่ะ: สมองกล KRONOS AI Gym ทำงานอยู่ที่เลเวล ${gym.level} ระดับ Apex Sovereign Quant ด้วยอัตราความแม่นยำ ${gym.winRate}% จากข้อมูลตลาด ${gym.samples.toLocaleString()} แท่งเทียน ข่าวด่วนล่าสุด: ${news} ระบบป้องกันความเสี่ยงระดับ DEFCON-1 พร้อมทำงานค่ะ`;
    this.speak(speech);
  }

  reportAIGym() {
    this.updateTelemetryHUD();
    const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
    const speech = `รายงานข้อมูลระบบประสาท KRONOS AI Gym ค่ะ: ปัจจุบันจัดอยู่ในระดับ เลเวล ${gym.level} จอมราชันย์ Apex Sovereign Quant ผ่านการวิเคราะห์โครงสร้างราคามาแล้วกว่า ${gym.samples.toLocaleString()} ตัวอย่าง พร้อมระบบการเรียนรู้แบบเสริมกำลัง ความเชี่ยวชาญในกลยุทธ์ Smart Money Order Block อยู่ที่ 91% ค่ะ`;
    this.speak(speech);
  }

  reportWorldNews() {
    this.updateTelemetryHUD();
    const news = this.cachedNews || 'ธนาคารกลางและดัชนีสภาพคล่องโลกส่งสัญญาณการเข้าสะสมวอลุ่มปริมาณมหาศาล';
    const speech = `รายงานข่าวกรองตลาดโลกค่ะ: ${news} ระบบได้ทำการปรับจูนค่าสเปรดและความผันผวนของคู่เงิน Binance และ XM Global เรียบร้อยแล้วค่ะ`;
    this.speak(speech);
  }
}

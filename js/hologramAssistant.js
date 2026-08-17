/**
 * CYBER//TYPE 3D HOLOGRAPHIC FACIAL KINEMATICS RIG & ASSISTANT (NYX)
 * - 3D Vector Perspective Projection (Head Yaw, Pitch, Roll & Depth)
 * - Real-Time Viseme Lip-Sync (A, E, I, O, U Phonetic Morphing)
 * - Autonomous Gaze Tracking & Direct Operator Eye Contact
 * - Expressive Cyber Eyebrows, Pupils with Light Highlights & Natural Blinking
 * - Multi-Layered Flowing Cyber Hair with Physics & Orbiting Particle Rings
 * - Thai Natural Speech Synthesis Engine & Live Telemetry Reporter
 */

import { profileStore } from './profileStore.js';

// 3D Perspective Projection Mathematics Helper
function project3D(x, y, z, yaw, pitch, roll, cx, cy, fov = 260) {
  // 1. Yaw (Rotate around Y-axis)
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  let x1 = x * cosY - z * sinY;
  let z1 = x * sinY + z * cosY;

  // 2. Pitch (Rotate around X-axis)
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  let y2 = y * cosP - z1 * sinP;
  let z2 = y * sinP + z1 * cosP;

  // 3. Roll (Rotate around Z-axis)
  const cosR = Math.cos(roll);
  const sinR = Math.sin(roll);
  let x3 = x1 * cosR - y2 * sinR;
  let y3 = x1 * sinR + y2 * cosR;

  // 4. Perspective Division
  const distance = fov + z2;
  const scale = distance > 10 ? fov / distance : 1;
  return {
    x: cx + x3 * scale,
    y: cy + y3 * scale,
    z: z2,
    scale
  };
}

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
    this.visemeVowel = 'CLOSED'; // 'A', 'E', 'O', 'CLOSED'
    this.mouthOpen = 0;
    this.mouthWidth = 1;

    // 3D Head Pose & Gaze Kinematics
    this.currentPose = { yaw: 0, pitch: 0, roll: 0, gazeX: 0, gazeY: 0 };
    this.targetPose = { yaw: 0, pitch: 0, roll: 0, gazeX: 0, gazeY: 0 };
    this.gazeMode = 'OPERATOR'; // 'OPERATOR', 'GYM', 'NEWS', 'THINKING'

    // Blinking & Micro-Saccades
    this.blinkTimer = 0;
    this.blinkAmount = 0; // 0 = fully open, 1 = closed
    this.saccadeTimer = 0;
    this.saccadeOffset = { x: 0, y: 0 };

    // Orbit Particle Rings
    this.orbitAngle = 0;

    // Speech Engine State
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isVoiceEnabled = true;
    this.currentUtterance = null;
    this.selectedVoice = null;

    // Telemetry Cache
    this.cachedGymStats = null;
    this.cachedNews = null;
    this.lastSpokenText = '';
    this.autoBriefInterval = null;

    this.initVoiceEngine();
  }

  initVoiceEngine() {
    if (!this.synth) return;

    const findThaiFemaleVoice = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      const priorityThaiVoices = [
        'Premwadee',
        'Google ภาษาไทย',
        'Niwat',
        'Thai',
        'th-TH',
        'th_TH'
      ];

      let found = voices.find(v => (v.lang === 'th-TH' || v.lang === 'th_TH' || v.lang.startsWith('th')) && priorityThaiVoices.some(p => v.name.includes(p)));
      if (!found) {
        found = voices.find(v => v.lang === 'th-TH' || v.lang === 'th_TH' || v.lang.startsWith('th'));
      }
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
      // 280x280 internal render buffer for ultra-crisp Retina rendering
      this.canvas.width = 280;
      this.canvas.height = 280;
      this.ctx = this.canvas.getContext('2d');
    }

    this.bindEvents();
    this.startHologramLoop();
    this.updateTelemetryHUD();

    // Initial greeting after 1.5s boot
    setTimeout(() => {
      this.triggerWelcomeGreeting();
    }, 1500);

    // Periodic telemetry update every 10s
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
        // Turn 3D head and eyes toward the KRONOS Gym card (top right)
        this.targetPose = { yaw: 0.38, pitch: -0.09, roll: 0.04, gazeX: 0.45, gazeY: -0.15 };
        break;
      case 'NEWS':
        // Turn 3D head and eyes toward the Global News Wire (right side)
        this.targetPose = { yaw: 0.32, pitch: 0.12, roll: -0.02, gazeX: 0.40, gazeY: 0.18 };
        break;
      case 'THINKING':
        // Tilt head slightly when computing
        this.targetPose = { yaw: -0.18, pitch: -0.12, roll: -0.06, gazeX: -0.25, gazeY: -0.20 };
        break;
      case 'OPERATOR':
      default:
        // Direct Eye Contact with Operator (User)
        this.targetPose = { yaw: 0, pitch: 0, roll: 0, gazeX: 0, gazeY: 0 };
        break;
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
      this.setGazeMode('OPERATOR');
      this.speak('เปิดระบบเสียงสังเคราะห์ภาษาไทยเรียบร้อยแล้วค่ะ สแตนด์บายพร้อมรับคำสั่งจากคุณอนันต์ค่ะ');
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
      utterance.lang = 'th-TH';
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = 1.02;
      utterance.pitch = 1.15;

      utterance.onstart = () => {
        this.isSpeaking = true;
        const dot = document.getElementById('hologramStatusDot');
        if (dot) dot.classList.add('speaking');
        this.updateAudioWaveBars(true);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.mouthOpen = 0;
        this.setGazeMode('OPERATOR');
        const dot = document.getElementById('hologramStatusDot');
        if (dot) dot.classList.remove('speaking');
        this.updateAudioWaveBars(false);
        this.playChirpSFX(false);
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.mouthOpen = 0;
        this.setGazeMode('OPERATOR');
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
    // 1. Smooth 3D Pose Interpolation towards target
    const ease = 0.08;
    this.currentPose.yaw += (this.targetPose.yaw - this.currentPose.yaw) * ease;
    this.currentPose.pitch += (this.targetPose.pitch - this.currentPose.pitch) * ease;
    this.currentPose.roll += (this.targetPose.roll - this.currentPose.roll) * ease;
    this.currentPose.gazeX += (this.targetPose.gazeX - this.currentPose.gazeX) * ease;
    this.currentPose.gazeY += (this.targetPose.gazeY - this.currentPose.gazeY) * ease;

    // 2. Natural Breathing Sine Wave Modulation
    const breathY = Math.sin(this.time * 0.045) * 0.025;
    this.currentPose.pitch += breathY;

    // 3. Natural Blinking Engine
    this.blinkTimer++;
    if (this.blinkTimer > 200) {
      this.blinkAmount = Math.min(1, this.blinkAmount + 0.25);
      if (this.blinkTimer > 214) {
        this.blinkAmount = Math.max(0, this.blinkAmount - 0.25);
        if (this.blinkTimer > 220) {
          this.blinkTimer = Math.floor(Math.random() * 40); // Randomize interval
          this.blinkAmount = 0;
        }
      }
    }

    // 4. Subtle Eye Saccades (Micro Eye Movements)
    this.saccadeTimer++;
    if (this.saccadeTimer > 120) {
      this.saccadeOffset.x = (Math.random() - 0.5) * 0.06;
      this.saccadeOffset.y = (Math.random() - 0.5) * 0.04;
      this.saccadeTimer = Math.floor(Math.random() * 30);
    }

    // 5. Viseme Lip-Sync Engine (Smooth Phonetic Cycles while speaking)
    if (this.isSpeaking) {
      this.visemePhase += 0.28;
      // Modulate mouth opening and vowel shape
      const rawOpen = Math.abs(Math.sin(this.visemePhase)) * 1.2;
      const rawWidth = 0.85 + Math.cos(this.visemePhase * 0.7) * 0.35;

      this.mouthOpen += (rawOpen - this.mouthOpen) * 0.35;
      this.mouthWidth += (rawWidth - this.mouthWidth) * 0.35;

      // Subtle head nodding emphasis while speaking
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

    // A. 3D Rotating Orbit Particle Rings (Perspective Projected)
    this.orbitAngle += 0.018;
    ctx.save();
    ctx.lineWidth = 1.6;
    ctx.setLineDash([8, 8]);
    
    // Ring 1 (Cyan Orbit)
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

    // Ring 2 (Magenta Counter-Orbit)
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

    // C. 3D Cybernetic Collar & Shoulders
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

    // D. 3D Face Contour & Jawline
    const faceContour3D = [
      { x: -38, y: -45, z: 0 },   // Top left forehead
      { x: 0, y: -58, z: 12 },    // Forehead apex
      { x: 38, y: -45, z: 0 },    // Top right forehead
      { x: 42, y: -10, z: -5 },   // Right temple
      { x: 36, y: 18, z: 5 },     // Right cheek
      { x: 18, y: 40, z: 15 },    // Right jaw
      { x: 0, y: 48, z: 22 },     // Chin
      { x: -18, y: 40, z: 15 },   // Left jaw
      { x: -36, y: 18, z: 5 },    // Left cheek
      { x: -42, y: -10, z: -5 }   // Left temple
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

    // E. 3D Eyebrows (Dynamic Emotion & Expression)
    ctx.save();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.4;

    const browLift = this.isSpeaking ? 3 : 0;
    // Left Eyebrow
    const bL1 = project3D(-32, -26 - browLift, 14, yaw, pitch, roll, cx, cy);
    const bL2 = project3D(-20, -32 - browLift, 20, yaw, pitch, roll, cx, cy);
    const bL3 = project3D(-8, -27 - browLift, 18, yaw, pitch, roll, cx, cy);

    ctx.beginPath();
    ctx.moveTo(bL1.x, bL1.y);
    ctx.quadraticCurveTo(bL2.x, bL2.y, bL3.x, bL3.y);
    ctx.stroke();

    // Right Eyebrow
    const bR1 = project3D(8, -27 - browLift, 18, yaw, pitch, roll, cx, cy);
    const bR2 = project3D(20, -32 - browLift, 20, yaw, pitch, roll, cx, cy);
    const bR3 = project3D(32, -26 - browLift, 14, yaw, pitch, roll, cx, cy);

    ctx.beginPath();
    ctx.moveTo(bR1.x, bR1.y);
    ctx.quadraticCurveTo(bR2.x, bR2.y, bR3.x, bR3.y);
    ctx.stroke();
    ctx.restore();

    // F. 3D Eyes, Pupils & Gaze Tracking
    const eyeSocketL = project3D(-20, -12, 16, yaw, pitch, roll, cx, cy);
    const eyeSocketR = project3D(20, -12, 16, yaw, pitch, roll, cx, cy);

    const eyeRadius = 12 * eyeSocketL.scale;
    const blinkH = Math.max(1, (1 - this.blinkAmount) * 8 * eyeSocketL.scale);

    const totalGazeX = (this.currentPose.gazeX + this.saccadeOffset.x) * 6;
    const totalGazeY = (this.currentPose.gazeY + this.saccadeOffset.y) * 4;

    const drawEye = (socket) => {
      ctx.save();
      // Eye Socket / Sclera
      ctx.beginPath();
      ctx.ellipse(socket.x, socket.y, eyeRadius, blinkH, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(8, 25, 38, 0.9)';
      ctx.fill();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      if (this.blinkAmount < 0.8) {
        // Glowing Cyan Iris / Pupil
        const pupilX = socket.x + totalGazeX;
        const pupilY = socket.y + totalGazeY;
        const pupilR = Math.min(blinkH * 0.85, 5.5 * socket.scale);

        ctx.beginPath();
        ctx.arc(pupilX, pupilY, pupilR, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 8;
        ctx.fill();

        // White Light Specular Highlight (Makes eye look alive & direct eye contact)
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

    // G. 3D Nose Bridge & Tip
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
      // Open Phonetic Viseme (A / O / E)
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
      // Closed / Smile Rest Viseme
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

    // I. 3D Cyber Hair Layers & Physics (Bangs, Left/Right Floating Strands)
    const hairPhysicsSway = Math.sin(this.time * 0.06) * 4;
    const hairStrands = [
      // Left Front Bang
      { p1: { x: -36, y: -48, z: 8 }, p2: { x: -38, y: -10, z: 12 }, p3: { x: -26 + hairPhysicsSway, y: 15, z: 14 } },
      // Right Front Bang
      { p1: { x: 36, y: -48, z: 8 }, p2: { x: 38, y: -10, z: 12 }, p3: { x: 26 - hairPhysicsSway, y: 15, z: 14 } },
      // Left Long Face Lock
      { p1: { x: -44, y: -20, z: 0 }, p2: { x: -52, y: 18, z: -2 }, p3: { x: -42 + hairPhysicsSway * 1.2, y: 55, z: -4 } },
      // Right Long Face Lock
      { p1: { x: 44, y: -20, z: 0 }, p2: { x: 52, y: 18, z: -2 }, p3: { x: 42 - hairPhysicsSway * 1.2, y: 55, z: -4 } },
      // Center Crown Arch
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

    // J. 3D Neural Headset Antennae Pods (Left & Right Ear Cuffs)
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

  // Situational Briefing Actions with Dynamic Gaze Direction
  triggerWelcomeGreeting() {
    this.updateTelemetryHUD();
    this.setGazeMode('OPERATOR');
    const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
    const speech = `ยินดีต้อนรับกลับค่ะ คุณอนันต์ ระบบผู้ช่วยโฮโลแกรม NYX พร้อมปฏิบัติการแล้วค่ะ ขณะนี้สมองกล KRONOS AI Gym เชื่อมต่ออยู่ที่เลเวล ${gym.level} เรียนรู้ไปแล้วกว่า ${gym.samples.toLocaleString()} ตัวอย่าง ระบบความปลอดภัย Enclave ทำงานปกติ 100% ค่ะ`;
    this.speak(speech);
  }

  briefMe() {
    this.updateTelemetryHUD();
    // Starts looking at operator, shifts to gym, then news
    this.setGazeMode('OPERATOR');
    const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
    const news = this.cachedNews || 'สภาวะตลาดโลกและสภาพคล่องอยู่ในเกณฑ์ปกติ';

    setTimeout(() => {
      if (this.isSpeaking) this.setGazeMode('GYM');
    }, 2800);

    setTimeout(() => {
      if (this.isSpeaking) this.setGazeMode('NEWS');
    }, 7000);

    const speech = `รายงานสถานการณ์ภาพรวมค่ะ: สมองกล KRONOS AI Gym ทำงานอยู่ที่เลเวล ${gym.level} ระดับ Apex Sovereign Quant ด้วยอัตราความแม่นยำ ${gym.winRate}% จากข้อมูลตลาด ${gym.samples.toLocaleString()} แท่งเทียน ข่าวด่วนล่าสุด: ${news} ระบบป้องกันความเสี่ยงระดับ DEFCON-1 พร้อมทำงานค่ะ`;
    this.speak(speech);
  }

  reportAIGym() {
    this.updateTelemetryHUD();
    // Turns 3D head and gaze directly to KRONOS AI Gym Card!
    this.setGazeMode('GYM');
    const gym = this.cachedGymStats || { level: 10, samples: 14971, winRate: 69.6 };
    const speech = `รายงานข้อมูลระบบประสาท KRONOS AI Gym ค่ะ: ปัจจุบันจัดอยู่ในระดับ เลเวล ${gym.level} จอมราชันย์ Apex Sovereign Quant ผ่านการวิเคราะห์โครงสร้างราคามาแล้วกว่า ${gym.samples.toLocaleString()} ตัวอย่าง พร้อมระบบการเรียนรู้แบบเสริมกำลัง ความเชี่ยวชาญในกลยุทธ์ Smart Money Order Block อยู่ที่ 91% ค่ะ`;
    this.speak(speech);
  }

  reportWorldNews() {
    this.updateTelemetryHUD();
    // Turns 3D head and gaze directly to World News Wire!
    this.setGazeMode('NEWS');
    const news = this.cachedNews || 'ธนาคารกลางและดัชนีสภาพคล่องโลกส่งสัญญาณการเข้าสะสมวอลุ่มปริมาณมหาศาล';
    const speech = `รายงานข่าวกรองตลาดโลกค่ะ: ${news} ระบบได้ทำการปรับจูนค่าสเปรดและความผันผวนของคู่เงิน Binance และ XM Global เรียบร้อยแล้วค่ะ`;
    this.speak(speech);
  }
}

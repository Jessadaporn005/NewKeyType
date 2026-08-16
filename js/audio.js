/**
 * CYBER//TYPE HOLLYWOOD HACKER SOUND ENGINE & CYBERPUNK SYNTHWAVE GENERATOR (Web Audio API)
 * Studio-grade, cinema-authentic mechanical & hacker terminal sound effects.
 * Includes Hollywood cyber chirps, mechanical transients, log stream telemetry chitter,
 * procedural dark synthwave ambient BGM, alarm sirens, and level-up fanfares.
 */

class HackerAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.volume = 0.85;
    this.preset = 'hollywood'; // hollywood | mechanical | cyberterminal | quiet
    this.isMuted = false;
    this.initialized = false;
    
    // Pre-allocated noise buffers for zero-latency performance
    this.clickBuffer = null;
    this.thockBuffer = null;

    // Log streaming ambient processing drone
    this.streamDroneOsc = null;
    this.streamDroneGain = null;

    // Cyber Ambient BGM state
    this.bgmGain = null;
    this.isBgmPlaying = false;
    this.bgmInterval = null;
    this.bgmChordIndex = 0;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.generateNoiseBuffers();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API initialization failed:', e);
    }
  }

  generateNoiseBuffers() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    
    // 1. High-frequency crisp click buffer (12ms)
    const clickLen = Math.floor(sampleRate * 0.012);
    this.clickBuffer = this.ctx.createBuffer(1, clickLen, sampleRate);
    const clickData = this.clickBuffer.getChannelData(0);
    for (let i = 0; i < clickLen; i++) {
      const decay = Math.exp(-i / (clickLen * 0.2));
      clickData[i] = (Math.random() * 2 - 1) * decay;
    }

    // 2. Low-mid mechanical impact buffer (20ms)
    const thockLen = Math.floor(sampleRate * 0.02);
    this.thockBuffer = this.ctx.createBuffer(1, thockLen, sampleRate);
    const thockData = this.thockBuffer.getChannelData(0);
    for (let i = 0; i < thockLen; i++) {
      const decay = Math.exp(-i / (thockLen * 0.35));
      thockData[i] = (Math.random() * 2 - 1) * decay;
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setPreset(preset) {
    this.preset = preset;
    this.isMuted = (preset === 'silent' || preset === 'quiet');
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  /**
   * Main entry point to play key sound
   */
  playKey(isError = false) {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const pitchOffset = (Math.random() - 0.5) * 80;

    if (isError) {
      this.playErrorSound();
      return;
    }

    switch (this.preset) {
      case 'hollywood':
        this.synthHollywoodCinemaClick(t, pitchOffset);
        break;
      case 'mechanical':
      case 'stock_switches':
        this.synthMechanicalThock(t, pitchOffset);
        break;
      case 'holypanda':
      case 'holypanda_switches':
        this.synthHolyPanda(t, pitchOffset);
        break;
      case 'cherrymx':
      case 'cherry_switches':
        this.synthCherryMXBlue(t, pitchOffset);
        break;
      case 'cyberterminal':
        this.synthFastTerminalClick(t, pitchOffset);
        break;
      default:
        this.synthMechanicalThock(t, pitchOffset);
    }
  }

  /**
   * Ultra-clean, single-frequency static C2 Telemetry Tick for log streaming
   * (Pure single 3ms blip with ZERO pitch-glide, echo, or harmonic resonance)
   */
  playBootTelemetryTick() {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, t);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.linearRampToValueAtTime(0.0001, t + 0.003);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.004);
  }

  /**
   * 1. Hollywood Cinema Hacker Click
   */
  synthHollywoodCinemaClick(t, pitchOffset) {
    if (!this.ctx) return;

    // Layer 1: Movie Cyber Chirp Transient
    const chirp = this.ctx.createOscillator();
    const chirpGain = this.ctx.createGain();
    chirp.type = 'sine';
    chirp.frequency.setValueAtTime(2400 + pitchOffset * 8, t);
    chirp.frequency.exponentialRampToValueAtTime(750, t + 0.009);

    chirpGain.gain.setValueAtTime(0.25, t);
    chirpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.009);

    chirp.connect(chirpGain);
    chirpGain.connect(this.masterGain);
    chirp.start(t);
    chirp.stop(t + 0.01);

    // Layer 2: Tactile Noise Click
    if (this.clickBuffer) {
      const clickSource = this.ctx.createBufferSource();
      clickSource.buffer = this.clickBuffer;

      const clickFilter = this.ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(4500 + pitchOffset * 10, t);
      clickFilter.Q.setValueAtTime(3.0, t);

      const clickGain = this.ctx.createGain();
      clickGain.gain.setValueAtTime(0.4, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

      clickSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(this.masterGain);
      clickSource.start(t);
    }

    // Layer 3: Acoustic Mechanical Body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220 + pitchOffset, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.025);

    oscGain.gain.setValueAtTime(0.3, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.03);
  }

  synthMechanicalThock(t, pitchOffset) {
    if (!this.clickBuffer) return;

    const clickSource = this.ctx.createBufferSource();
    clickSource.buffer = this.clickBuffer;

    const clickFilter = this.ctx.createBiquadFilter();
    clickFilter.type = 'highpass';
    clickFilter.frequency.setValueAtTime(3200 + pitchOffset * 8, t);

    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.5, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

    clickSource.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickSource.start(t);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340 + pitchOffset, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.04);

    oscGain.gain.setValueAtTime(0.4, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  synthFastTerminalClick(t, pitchOffset) {
    if (!this.clickBuffer) return;

    const clickSource = this.ctx.createBufferSource();
    clickSource.buffer = this.clickBuffer;

    const clickFilter = this.ctx.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(2800 + pitchOffset * 6, t);
    clickFilter.Q.setValueAtTime(1.8, t);

    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.35, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.01);

    clickSource.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickSource.start(t);
  }

  /**
   * PROCEDURAL CYBER AMBIENT SYNTHWAVE BGM GENERATOR
   * Plays a smooth, atmospheric dark cyberpunk synthwave chord loop
   */
  startCyberBgm() {
    this.ensureContext();
    if (!this.ctx || this.isBgmPlaying) return;

    this.isBgmPlaying = true;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.bgmGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 2.0);
    this.bgmGain.connect(this.masterGain);

    const chords = [
      [65.41, 130.81, 196.00, 233.08, 311.13], // C minor 9
      [55.00, 110.00, 164.81, 207.65, 261.63], // Ab major 7
      [43.65, 87.31, 130.81, 155.56, 207.65],  // F minor 9
      [48.99, 97.99, 146.83, 196.00, 293.66]   // G sus4
    ];

    this.bgmChordIndex = 0;

    const playChordStep = () => {
      if (!this.isBgmPlaying || !this.ctx) return;

      const chord = chords[this.bgmChordIndex % chords.length];
      const t = this.ctx.currentTime;
      const dur = 4.8;

      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = idx === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320 + idx * 80, t);
        filter.frequency.exponentialRampToValueAtTime(650, t + dur * 0.5);
        filter.frequency.exponentialRampToValueAtTime(280, t + dur);

        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.25 / chord.length, t + 0.8);
        g.gain.linearRampToValueAtTime(0.001, t + dur);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.bgmGain);

        osc.start(t);
        osc.stop(t + dur + 0.1);
      });

      this.bgmChordIndex++;
    };

    playChordStep();
    this.bgmInterval = setInterval(playChordStep, 4600);
  }

  stopCyberBgm() {
    if (!this.isBgmPlaying) return;
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
      setTimeout(() => {
        if (this.bgmGain) {
          this.bgmGain.disconnect();
          this.bgmGain = null;
        }
      }, 1300);
    }
  }

  toggleCyberBgm() {
    if (this.isBgmPlaying) {
      this.stopCyberBgm();
      return false;
    } else {
      this.startCyberBgm();
      return true;
    }
  }

  startLogStreamDrone() {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx || this.streamDroneOsc) return;

    try {
      const t = this.ctx.currentTime;
      this.streamDroneOsc = this.ctx.createOscillator();
      this.streamDroneGain = this.ctx.createGain();

      this.streamDroneOsc.type = 'triangle';
      this.streamDroneOsc.frequency.setValueAtTime(65, t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, t);

      this.streamDroneGain.gain.setValueAtTime(0.001, t);
      this.streamDroneGain.gain.linearRampToValueAtTime(0.06, t + 0.4);

      this.streamDroneOsc.connect(filter);
      filter.connect(this.streamDroneGain);
      this.streamDroneGain.connect(this.masterGain);

      this.streamDroneOsc.start(t);
    } catch (e) {
      console.warn('Drone error:', e);
    }
  }

  stopLogStreamDrone() {
    if (!this.ctx || !this.streamDroneGain || !this.streamDroneOsc) return;
    try {
      const t = this.ctx.currentTime;
      this.streamDroneGain.gain.setValueAtTime(this.streamDroneGain.gain.value, t);
      this.streamDroneGain.gain.linearRampToValueAtTime(0.0001, t + 0.3);

      setTimeout(() => {
        if (this.streamDroneOsc) {
          try { this.streamDroneOsc.stop(); } catch(e){}
          this.streamDroneOsc.disconnect();
          this.streamDroneOsc = null;
        }
        if (this.streamDroneGain) {
          this.streamDroneGain.disconnect();
          this.streamDroneGain = null;
        }
      }, 350);
    } catch(e) {}
  }

  playLogLineAudio(index = 0, total = 100) {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = index % 3 === 0 ? 'sawtooth' : 'sine';

    const baseFreq = 1800 + ((index * 37) % 1600);
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, t + 0.016);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.016);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.018);

    if (index % 8 === 0) {
      const byteOsc = this.ctx.createOscillator();
      const byteGain = this.ctx.createGain();
      byteOsc.type = 'sine';
      byteOsc.frequency.setValueAtTime(2800 + (index % 5) * 200, t);

      byteGain.gain.setValueAtTime(0.08, t);
      byteGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

      byteOsc.connect(byteGain);
      byteGain.connect(this.masterGain);
      byteOsc.start(t);
      byteOsc.stop(t + 0.04);
    }
  }

  playStreamChirp() {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const freq = 1600 + (Math.random() - 0.5) * 600;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.012);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.015);
  }

  playErrorSound() {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  playEnterSound() {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    [739.99, 1108.73].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.04);

      gain.gain.setValueAtTime(0.22, t + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 0.26);
    });
  }

  playComboChime(streak) {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    const freq = notes[Math.min(notes.length - 1, Math.floor(streak / 15))];

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playPacketBurst() {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 8; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const freq = 1400 + Math.random() * 2200;
      osc.frequency.setValueAtTime(freq, t + i * 0.025);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + i * 0.025 + 0.02);

      gain.gain.setValueAtTime(0.1, t + i * 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.025 + 0.02);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + i * 0.025);
      osc.stop(t + i * 0.025 + 0.025);
    }
  }

  playLevelUpFanfare() {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + idx * 0.07);

      gain.gain.setValueAtTime(0.25, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.5);
    });
  }

  playSuccessFanfare() {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(80, t);
    subOsc.frequency.exponentialRampToValueAtTime(40, t + 0.4);

    subGain.gain.setValueAtTime(0.5, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.5);

    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0.2, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.36);
    });
  }

  playEmpBlast() {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Sub-bass heavy drop
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(140, t);
    sub.frequency.exponentialRampToValueAtTime(25, t + 0.8);

    subGain.gain.setValueAtTime(0.8, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(t);
    sub.stop(t + 0.9);

    // Lightning discharge noise
    if (this.clickBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.clickBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.7, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      noise.connect(filter);
      filter.connect(ng);
      ng.connect(this.masterGain);
      noise.start(t);
    }
  }

  playUsbMountSound() {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [880, 1320, 1760].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.18, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.16);
    });
  }

  synthHolyPanda(t, pitchOffset) {
    if (!this.ctx) return;
    // Deep poppy tactile thock
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + pitchOffset * 0.5, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.045);

    oscGain.gain.setValueAtTime(0.45, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  synthCherryMXBlue(t, pitchOffset) {
    if (!this.ctx) return;
    // Sharp high-pitch clicky click
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(3200 + pitchOffset * 10, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.015);

    oscGain.gain.setValueAtTime(0.3, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.02);
  }

  playAlarmSiren() {
    if (this.isMuted || this.preset === 'silent') return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.linearRampToValueAtTime(1150, t + 0.35);
    osc.frequency.linearRampToValueAtTime(650, t + 0.7);
    osc.frequency.linearRampToValueAtTime(1150, t + 1.05);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 1.25);
  }
}

export const soundEngine = new HackerAudioEngine();

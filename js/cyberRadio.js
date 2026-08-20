/**
 * CYBER//TYPE TRON 3D AUDIO VISUALIZER & PROCEDURAL SYNTH LAB
 * Web Audio oscillator plus decorative spectrum visualization; no radio stream.
 */

export const RADIO_STATIONS = [
  { id: 'synthwave', name: 'Night City Synthwave', genre: 'SYNTHWAVE // 128 BPM', color: '#ff007f', icon: '🌆' },
  { id: 'dark_techno', name: 'Darknet Infiltration Beat', genre: 'INDUSTRIAL // 140 BPM', color: '#00ff66', icon: '⚡' },
  { id: 'lofi_ambient', name: 'Cyberdeck Lofi Matrix', genre: 'AMBIENT CHILL // 85 BPM', color: '#00e5ff', icon: '☕' },
  { id: 'matrix_core', name: 'The Nebuchadnezzar Core', genre: 'NEURAL BASS // 110 BPM', color: '#ffaa00', icon: '🕶️' }
];

export class CyberRadioEngine {
  constructor(app, soundEngine) {
    this.app = app;
    this.sound = soundEngine;

    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.isPlaying = false;
    this.currentStation = RADIO_STATIONS[0];
    this.animFrameId = null;
    this.analyser = null;
    this.audioCtx = null;
    this.oscNode = null;
    this.gainNode = null;
  }

  init(containerEl) {
    this.container = containerEl;
    if (!this.container) return;

    this.renderLayout();
    this.initAudioContext();
    this.startVisualizer();
  }

  renderLayout() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="cyber-radio-window" id="cyberRadioWindow">
        <!-- 1. Top Header -->
        <div class="radio-header-bar">
          <div class="radio-title-group">
            <span class="radio-pulse"></span>
            <span class="radio-title">TRON 3D PROCEDURAL SYNTH LAB</span>
            <span class="radio-station-badge" id="radioActiveBadge">LOCAL OSCILLATOR // NIGHT CITY</span>
          </div>

          <button class="radio-exit-btn" id="radioBtnExit" title="Return to CLI">✕</button>
        </div>

        <!-- 2. 3D Neon Canvas Visualizer Stage -->
        <div class="radio-canvas-stage">
          <canvas id="radioVisualizerCanvas" width="900" height="260"></canvas>
        </div>

        <!-- 3. Channel Selector & Playback Controls -->
        <div class="radio-controls-bar">
          <div class="radio-main-actions">
            <button class="radio-btn-play" id="radioBtnPlay">▶ PLAY LOCAL SYNTH</button>
            <div class="radio-vol-box">
              <span>🔊 VOL:</span>
              <input type="range" class="radio-vol-slider" id="radioVolSlider" min="0" max="100" value="75" />
            </div>
          </div>

          <div class="radio-stations-list" id="radioStationsList">
            <!-- Stations rendered dynamically -->
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#radioVisualizerCanvas');
    if (this.canvas) this.ctx = this.canvas.getContext('2d');

    this.renderStations();
    this.bindEvents();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
      }
    } catch (e) {}
  }

  bindEvents() {
    if (!this.container) return;

    const btnPlay = this.container.querySelector('#radioBtnPlay');
    const btnExit = this.container.querySelector('#radioBtnExit');
    const volSlider = this.container.querySelector('#radioVolSlider');

    if (btnPlay) {
      btnPlay.addEventListener('click', () => this.togglePlayback());
    }

    if (btnExit) {
      btnExit.addEventListener('click', () => {
        this.pause();
        this.app.returnToCli();
      });
    }

    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const val = e.target.value / 100;
        if (this.gainNode) this.gainNode.gain.value = val;
      });
    }
  }

  renderStations() {
    const list = this.container.querySelector('#radioStationsList');
    if (!list) return;

    let html = '';
    RADIO_STATIONS.forEach(s => {
      const isActive = s.id === this.currentStation.id;
      html += `
        <div class="radio-station-card ${isActive ? 'active' : ''}" data-id="${s.id}" style="border-left-color: ${s.color};">
          <span class="st-icon">${s.icon}</span>
          <div class="st-info">
            <span class="st-name">${s.name}</span>
            <span class="st-genre">${s.genre}</span>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;

    list.querySelectorAll('.radio-station-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const station = RADIO_STATIONS.find(s => s.id === id);
        if (station) {
          this.switchStation(station);
        }
      });
    });
  }

  switchStation(station) {
    this.currentStation = station;
    if (this.container) {
      const badge = this.container.querySelector('#radioActiveBadge');
      if (badge) {
        badge.textContent = `LOCAL OSCILLATOR // ${station.name.toUpperCase()}`;
        badge.style.color = station.color;
        badge.style.borderColor = station.color;
      }
      this.renderStations();
    }
    if (this.isPlaying) {
      this.startSynthesizer();
    }
    if (this.sound) this.sound.playSuccessFanfare();
  }

  togglePlayback() {
    this.isPlaying = !this.isPlaying;
    if (this.container) {
      const btnPlay = this.container.querySelector('#radioBtnPlay');
      if (btnPlay) {
        btnPlay.textContent = this.isPlaying ? '⏸ PAUSE LOCAL SYNTH' : '▶ PLAY LOCAL SYNTH';
        btnPlay.classList.toggle('playing', this.isPlaying);
      }
    }

    if (this.isPlaying) {
      this.startSynthesizer();
    } else {
      this.pause();
    }
  }

  startSynthesizer() {
    if (!this.audioCtx) this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.stopSynthesizer();

    if (!this.audioCtx) return;

    try {
      this.oscNode = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();

      this.oscNode.type = this.currentStation.id === 'synthwave' ? 'sawtooth' : 'sine';
      this.oscNode.frequency.setValueAtTime(110, this.audioCtx.currentTime); // A2

      this.gainNode.gain.setValueAtTime(0.08, this.audioCtx.currentTime);

      this.oscNode.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      this.oscNode.start();
    } catch (e) {}
  }

  stopSynthesizer() {
    if (this.oscNode) {
      try { this.oscNode.stop(); this.oscNode.disconnect(); } catch (e) {}
      this.oscNode = null;
    }
  }

  pause() {
    this.isPlaying = false;
    this.stopSynthesizer();
    const btnPlay = this.container?.querySelector('#radioBtnPlay');
    if (btnPlay) {
      btnPlay.textContent = '▶ PLAY LOCAL SYNTH';
      btnPlay.classList.remove('playing');
    }
  }

  startVisualizer() {
    if (this.animFrameId) return;
    const draw = () => {
      this.animFrameId = requestAnimationFrame(draw);
      if (!this.canvas || !this.ctx) return;

      const w = this.canvas.width;
      const h = this.canvas.height;
      this.ctx.clearRect(0, 0, w, h);

      // Background grid
      this.ctx.strokeStyle = 'rgba(0, 255, 102, 0.06)';
      this.ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, h);
        this.ctx.stroke();
      }

      // Draw frequency spectrum
      const numBars = 48;
      const barWidth = (w / numBars) - 4;
      const primaryColor = this.currentStation.color || '#00ff66';

      for (let i = 0; i < numBars; i++) {
        let barHeight = 10;
        if (this.isPlaying) {
          barHeight = Math.sin((Date.now() / 150) + (i * 0.4)) * 60 + Math.random() * 40 + 35;
        }

        const x = i * (barWidth + 4) + 6;
        const y = h - barHeight - 15;

        // Gradient bar
        const grad = this.ctx.createLinearGradient(x, y, x, h);
        grad.addColorStop(0, primaryColor);
        grad.addColorStop(1, 'rgba(0, 255, 102, 0.05)');

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(x, y, barWidth, barHeight);

        // Top neon cap
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x, y - 2, barWidth, 3);
      }
    };

    draw();
  }

  stopVisualizer() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = null;
  }

  destroy() {
    this.pause();
    this.stopVisualizer();
  }
}

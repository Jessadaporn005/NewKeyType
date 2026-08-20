/**
 * CYBER//TYPE REAL-WORLD WI-FI RADAR & QUANTUM DECRYPTOR SUITE
 * Scans real local Wi-Fi networks via Windows netsh wlan, renders a 360° Sci-Fi radar,
 * and provides safe connection management along with an interactive Quantum Decryptor typing minigame.
 */

import { systemBridge } from './systemBridge.js';
import { profileStore } from './profileStore.js';

export class CyberWifiEngine {
  constructor(app, soundEngine, toastManager) {
    this.app = app;
    this.sound = soundEngine;
    this.toasts = toastManager;

    this.container = null;
    this.networks = [];
    this.activeTargetNetwork = null;
    this.radarCanvas = null;
    this.radarCtx = null;
    this.radarAngle = 0;
    this.radarAnimId = null;
    this.searchQuery = '';
    this.dataSource = 'VERIFYING';

    // Quantum Decryptor State
    this.isDecrypting = false;
    this.decryptTargetWord = '';
    this.decryptTyped = '';
    this.decryptProgress = 0;
    this.decryptListenerAttached = false;
    this.boundDecryptorKeyDown = this.handleDecryptorKeyDown.bind(this);
    this.decryptWordlist = [
      'P@ssw0rd994_QUANTUM_CORE',
      'ADMIN_OVERRIDE_ROOT_00',
      'NEBULA_DARKNET_KEY_42',
      'CIPHER_ROT13_MATRIX_99',
      'AIRCRACK_WPA2_SALT_77',
      'GHOST_IN_THE_SHELL_01',
      'ZERO_DAY_EXPLOIT_PAYLOAD',
      'DEFCON1_SATURN_UPLINK'
    ];
  }

  async init(containerEl) {
    this.container = containerEl;
    if (!this.container) return;

    this.renderLayout();
    this.initRadarCanvas();
    await this.scanNetworks();
  }

  renderLayout() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="cyber-wifi-window" id="cyberWifiWindow">
        <!-- 1. Header Bar -->
        <div class="wifi-header-bar">
          <div class="wifi-title-group">
            <span class="wifi-radar-icon">📡</span>
            <span class="wifi-header-title">CYBER//WIFI RADAR & NETWORK SPECTROMETER</span>
            <span class="wifi-status-badge" id="wifiScanBadge">STATUS: READY</span>
          </div>

          <div class="wifi-header-actions">
            <div class="wifi-search-box">
              <span class="search-icon">🔍</span>
              <input type="text" class="wifi-search-input" id="wifiSearchInput" placeholder="Filter SSID / Channel..." />
            </div>
            <button class="wifi-btn wifi-btn-scan" id="btnScanWifi">🔄 RESCAN AIRWAVES</button>
            <button class="wifi-btn wifi-btn-exit" id="btnExitWifi" title="Return to Terminal">✕</button>
          </div>
        </div>

        <!-- 2. Main Stage (Split Radar & Network Matrix) -->
        <div class="wifi-body-stage">
          <!-- Left: 360° Holographic Radar Canvas -->
          <div class="wifi-radar-pane">
            <div class="radar-hud-header">
              <span>360° AIRWAVE FREQUENCY RADAR</span>
              <span class="hud-freq-tag">2.4 / 5.0 GHz DUAL-BAND</span>
            </div>
            <div class="radar-canvas-box">
              <canvas id="wifiRadarCanvas" width="340" height="340"></canvas>
            </div>
            <div class="radar-telemetry-strip" id="radarTelemetryStrip">
              <span>ACTIVE APs: <strong id="radarApCount" style="color: #00ff66;">0</strong></span>
              <span>BAND: <strong>DUAL 802.11ax</strong></span>
              <span>SPECTROMETER: <strong style="color: #00e5ff;">ONLINE</strong></span>
            </div>
          </div>

          <!-- Right: Detected Access Points & Quantum Decryptor -->
          <div class="wifi-matrix-pane">
            <!-- Access Point Table Matrix -->
            <div class="wifi-networks-table-box">
              <div class="wifi-table-header">
                <div class="col-ssid">SSID / NETWORK NAME</div>
                <div class="col-signal">SIGNAL</div>
                <div class="col-channel">CH / BAND</div>
                <div class="col-auth">SECURITY</div>
                <div class="col-action">ACTION</div>
              </div>
              <div class="wifi-table-scroll" id="wifiNetworksList">
                <!-- Dynamically rendered -->
              </div>
            </div>

            <!-- Quantum Decryptor / Security Training Panel -->
            <div class="quantum-decryptor-panel" id="quantumDecryptorPanel">
              <div class="decryptor-header">
                <span class="dec-title">🧪 WPA TYPING TRAINER — SIMULATION ONLY</span>
                <span class="dec-target-badge" id="decTargetBadge">TARGET: NONE (SELECT AN AP)</span>
              </div>
              
              <div class="decryptor-body" id="decryptorBody">
                <div class="dec-instructions">
                  Select an access point and start a fictional typing drill. This mode does not capture handshakes, recover passwords, or bypass Wi-Fi security.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Bottom Status Bar -->
        <div class="wifi-status-bar">
          <span>OPERATOR: <strong>${this.escapeHtml(this.app.username || 'ANAN')} (LOCAL APP PROFILE)</strong></span>
          <span class="status-sep">|</span>
          <span id="wifiSelectedInfo">No access point selected</span>
          <span class="status-sep">|</span>
          <span class="status-glow">WLAN SOURCE: VERIFIED AFTER SCAN OR LABELED SIMULATION</span>
        </div>
      </div>

      <!-- Wi-Fi Connect Modal -->
      <div class="wifi-modal-overlay hidden" id="wifiConnectModal">
        <div class="wifi-modal-card">
          <div class="wifi-modal-header">
            <span id="wifiModalSsidTitle">CONNECT TO WI-FI</span>
            <button class="wifi-modal-close" id="wifiModalClose">✕</button>
          </div>
          <div class="wifi-modal-body">
            <div class="wifi-field-group">Uses an existing Wi-Fi profile already saved by Windows. This app does not collect, save, or transmit a Wi-Fi password.</div>
            <div class="wifi-modal-actions">
              <button class="wifi-btn wifi-btn-confirm" id="btnConfirmWifiConnect">⚡ CONNECT SAVED WINDOWS PROFILE</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    if (!this.container) return;

    const btnScan = this.container.querySelector('#btnScanWifi');
    const btnExit = this.container.querySelector('#btnExitWifi');
    const searchInput = this.container.querySelector('#wifiSearchInput');
    const modalClose = this.container.querySelector('#wifiModalClose');
    const btnConfirm = this.container.querySelector('#btnConfirmWifiConnect');

    if (btnScan) {
      btnScan.addEventListener('click', () => this.scanNetworks());
    }

    if (btnExit) {
      btnExit.addEventListener('click', () => this.app.returnToCli());
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderNetworksList();
      });
    }

    if (modalClose) {
      modalClose.addEventListener('click', () => {
        const modal = this.container.querySelector('#wifiConnectModal');
        if (modal) modal.classList.add('hidden');
      });
    }

    if (btnConfirm) {
      btnConfirm.addEventListener('click', async () => {
        const modal = this.container.querySelector('#wifiConnectModal');
        if (modal) modal.classList.add('hidden');

        if (this.activeTargetNetwork) {
          if (this.toasts) this.toasts.show('SUCCESS', `Authenticating with '${this.activeTargetNetwork.ssid}'...`, 2500);
          const res = await systemBridge.connectWifi(this.activeTargetNetwork.ssid);
          if (res.success) {
            if (this.sound) this.sound.playSuccessFanfare();
            if (this.toasts) this.toasts.show('ACHIEVEMENT', `Connected to Wi-Fi: ${this.activeTargetNetwork.ssid}!`, 3000);
          } else {
            alert(`Connection note: ${res.error || res.message || 'Done'}`);
          }
        }
      });
    }
  }

  // --- RADAR 360° CANVAS RENDERING ---
  initRadarCanvas() {
    if (!this.container) return;
    this.radarCanvas = this.container.querySelector('#wifiRadarCanvas');
    if (!this.radarCanvas) return;
    this.radarCtx = this.radarCanvas.getContext('2d');

    const animate = () => {
      this.drawRadar();
      this.radarAngle += 0.035;
      this.radarAnimId = requestAnimationFrame(animate);
    };

    if (this.radarAnimId) cancelAnimationFrame(this.radarAnimId);
    animate();
  }

  drawRadar() {
    if (!this.radarCtx || !this.radarCanvas) return;
    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = w / 2 - 12;

    ctx.clearRect(0, 0, w, h);

    // Dark Radar background
    ctx.fillStyle = 'rgba(2, 8, 4, 0.95)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Concentric Grid Rings
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1.0].forEach(factor => {
      ctx.strokeStyle = factor === 1.0 ? 'rgba(0, 255, 102, 0.6)' : 'rgba(0, 255, 102, 0.2)';
      ctx.beginPath();
      ctx.arc(cx, cy, r * factor, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.25)';
    ctx.beginPath();
    ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
    ctx.stroke();

    // Rotating Sweep Cone
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.radarAngle);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    grad.addColorStop(0, 'rgba(0, 255, 102, 0.4)');
    grad.addColorStop(0.8, 'rgba(0, 255, 102, 0.15)');
    grad.addColorStop(1, 'rgba(0, 255, 102, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, 0, Math.PI / 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Plot Access Point Blips
    this.networks.forEach((net, idx) => {
      const angle = (idx / Math.max(1, this.networks.length)) * (Math.PI * 2) + 0.4;
      const dist = (1 - (net.signal / 100)) * (r * 0.75) + (r * 0.2);
      const bx = cx + Math.cos(angle) * dist;
      const by = cy + Math.sin(angle) * dist;

      const isTarget = this.activeTargetNetwork && this.activeTargetNetwork.ssid === net.ssid;

      ctx.fillStyle = isTarget ? '#ff0055' : net.signal > 70 ? '#00ff66' : '#00e5ff';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = isTarget ? 15 : 8;

      ctx.beginPath();
      ctx.arc(bx, by, isTarget ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px Consolas, monospace';
      ctx.fillText(net.ssid.slice(0, 10), bx + 7, by + 3);
    });
  }

  // --- NETWORK SCANNING & TABLE RENDERING ---
  async scanNetworks() {
    const badge = this.container ? this.container.querySelector('#wifiScanBadge') : null;
    if (badge) {
      badge.textContent = 'SCANNING AIRWAVES...';
      badge.style.color = '#ffaa00';
    }
    if (this.sound) this.sound.playKey(false);

    const res = await systemBridge.scanWifi();
    if (res && res.networks) {
      this.networks = res.networks;
      this.dataSource = res.source || 'UNKNOWN';
    }

    if (badge) {
      const verified = this.dataSource === 'HOST_VERIFIED';
      badge.textContent = verified ? 'SOURCE: HOST VERIFIED' : 'SOURCE: SIMULATED TRAINING';
      badge.style.color = verified ? '#00ff66' : '#ffaa00';
    }

    const apCountEl = this.container ? this.container.querySelector('#radarApCount') : null;
    if (apCountEl) apCountEl.textContent = `${this.networks.length} APs LOCKED`;

    this.renderNetworksList();
    if (this.sound) this.sound.playSuccessFanfare();
  }

  renderNetworksList() {
    if (!this.container) return;
    const listEl = this.container.querySelector('#wifiNetworksList');
    if (!listEl) return;

    let displayNets = this.networks;
    if (this.searchQuery) {
      displayNets = displayNets.filter(n => n.ssid.toLowerCase().includes(this.searchQuery) || String(n.channel).includes(this.searchQuery));
    }

    if (displayNets.length === 0) {
      listEl.innerHTML = `<div class="wifi-empty-state">No Wi-Fi access points detected matching '${this.escapeHtml(this.searchQuery)}'</div>`;
      return;
    }

    let html = '';
    displayNets.forEach(net => {
      const isSelected = this.activeTargetNetwork && this.activeTargetNetwork.ssid === net.ssid;
      const signal = Math.max(0, Math.min(100, Number(net.signal) || 0));
      const isHigh = signal >= 75;
      const isWpa3 = (net.auth || '').includes('WPA3');
      const safeSsid = this.escapeHtml(net.ssid);

      html += `
        <div class="wifi-row ${isSelected ? 'selected' : ''}" data-ssid="${safeSsid}">
          <div class="col-ssid">
            <span class="wifi-icon">📶</span>
            <span class="wifi-ssid-name">${safeSsid}</span>
          </div>
          <div class="col-signal">
            <span class="signal-bar-wrap">
              <span class="signal-fill" style="width: ${signal}%; background: ${isHigh ? '#00ff66' : '#00e5ff'};"></span>
            </span>
            <span class="signal-pct">${signal}%</span>
          </div>
          <div class="col-channel">CH ${this.escapeHtml(net.channel)} (${this.escapeHtml(net.band)})</div>
          <div class="col-auth"><span class="auth-pill ${isWpa3 ? 'pill-wpa3' : 'pill-wpa2'}">${this.escapeHtml(net.auth)}</span></div>
          <div class="col-action">
            <button class="wifi-action-btn btn-connect-ap" data-ssid="${safeSsid}">⚡ CONNECT</button>
            <button class="wifi-action-btn btn-decrypt-ap" data-ssid="${safeSsid}">🔓 DECRYPT</button>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;

    listEl.querySelectorAll('.wifi-row').forEach(row => {
      const ssid = row.dataset.ssid;
      const netObj = this.networks.find(n => n.ssid === ssid);

      row.addEventListener('click', () => {
        this.activeTargetNetwork = netObj;
        listEl.querySelectorAll('.wifi-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        const selectedInfo = this.container.querySelector('#wifiSelectedInfo');
        if (selectedInfo) selectedInfo.textContent = `Target AP: ${ssid} (${netObj ? netObj.auth : ''})`;
        if (this.sound) this.sound.playKey(false);
      });
    });

    listEl.querySelectorAll('.btn-connect-ap').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ssid = btn.dataset.ssid;
        this.activeTargetNetwork = this.networks.find(n => n.ssid === ssid);
        this.openConnectModal(ssid);
      });
    });

    listEl.querySelectorAll('.btn-decrypt-ap').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ssid = btn.dataset.ssid;
        this.activeTargetNetwork = this.networks.find(n => n.ssid === ssid);
        this.startQuantumDecryptor(this.activeTargetNetwork);
      });
    });
  }

  openConnectModal(ssid) {
    if (!this.container) return;
    const modal = this.container.querySelector('#wifiConnectModal');
    const title = this.container.querySelector('#wifiModalSsidTitle');

    if (modal && title) {
      title.textContent = `CONNECT SAVED WINDOWS PROFILE: ${ssid.toUpperCase()}`;
      modal.classList.remove('hidden');
    }
  }

  // --- QUANTUM DECRYPTOR TYPING SECURITY MINIGAME ---
  startQuantumDecryptor(network) {
    if (!network || !this.container) return;
    this.isDecrypting = true;
    this.activeTargetNetwork = network;
    this.decryptProgress = 0;
    this.decryptTargetWord = this.decryptWordlist[Math.floor(Math.random() * this.decryptWordlist.length)];
    this.decryptTyped = '';

    const badge = this.container.querySelector('#decTargetBadge');
    if (badge) {
      badge.textContent = `TARGET: ${network.ssid.toUpperCase()} [${network.auth}]`;
      badge.style.color = '#00ff66';
    }

    this.renderDecryptorStage();
    if (this.sound) this.sound.playSuccessFanfare();
  }

  renderDecryptorStage() {
    const body = this.container ? this.container.querySelector('#decryptorBody') : null;
    if (!body) return;

    body.innerHTML = `
      <div class="decryptor-active-box">
        <div class="dec-telemetry-row">
          <span>TRAINING DATA: <strong style="color: #ffaa00;">[SIMULATED — NO PACKETS CAPTURED]</strong></span>
          <span>WORDLIST: <strong>fictional_training.lst</strong></span>
          <span>CRACK PROGRESS: <strong id="decProgressTxt">${this.decryptProgress}%</strong></span>
        </div>

        <div class="dec-progress-bar-bg">
          <div class="dec-progress-bar-fill" id="decProgressFill" style="width: ${this.decryptProgress}%;"></div>
        </div>

        <div class="dec-typing-challenge-stream" id="decTypingStream">
          <div class="dec-target-prompt">TYPE THIS FICTIONAL TRAINING STRING:</div>
          <div class="dec-target-word" id="decTargetWordDisplay">${this.formatTargetWordHtml()}</div>
        </div>

        <div class="dec-typing-hint">
          <span class="cursor-block">█</span> แบบฝึกพิมพ์จำลองเท่านั้น ไม่มีการดักจับแพ็กเก็ตหรือถอดรหัสเครือข่ายจริง
        </div>
      </div>
    `;

    if (!this.decryptListenerAttached) {
      window.addEventListener('keydown', this.boundDecryptorKeyDown);
      this.decryptListenerAttached = true;
    }
  }

  formatTargetWordHtml() {
    let html = '';
    for (let i = 0; i < this.decryptTargetWord.length; i++) {
      const char = this.decryptTargetWord[i];
      if (i < this.decryptTyped.length) {
        html += `<span class="dec-char-correct">${char}</span>`;
      } else if (i === this.decryptTyped.length) {
        html += `<span class="dec-char-current">${char}</span>`;
      } else {
        html += `<span class="dec-char-pending">${char}</span>`;
      }
    }
    return html;
  }

  handleDecryptorKeyDown(e) {
    if (!this.isDecrypting || !this.activeTargetNetwork) return;

    if (e.key === 'Escape') {
      this.isDecrypting = false;
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const targetChar = this.decryptTargetWord[this.decryptTyped.length];
      if (e.key === targetChar) {
        this.decryptTyped += e.key;
        if (this.sound) this.sound.playKey(false);

        // Check if finished current word
        if (this.decryptTyped.length === this.decryptTargetWord.length) {
          this.decryptProgress += 50;
          if (this.decryptProgress >= 100) {
            this.finishQuantumDecryptionSuccess();
            return;
          } else {
            // Next word
            this.decryptTargetWord = this.decryptWordlist[Math.floor(Math.random() * this.decryptWordlist.length)];
            this.decryptTyped = '';
            if (this.sound) this.sound.playSuccessFanfare();
          }
        }

        const wordDisplay = this.container.querySelector('#decTargetWordDisplay');
        const progTxt = this.container.querySelector('#decProgressTxt');
        const progFill = this.container.querySelector('#decProgressFill');

        if (wordDisplay) wordDisplay.innerHTML = this.formatTargetWordHtml();
        if (progTxt) progTxt.textContent = `${this.decryptProgress}%`;
        if (progFill) progFill.style.width = `${this.decryptProgress}%`;
      } else {
        if (this.sound) this.sound.playErrorSound();
      }
    }
  }

  finishQuantumDecryptionSuccess() {
    this.isDecrypting = false;
    this.detachDecryptorListener();
    const body = this.container.querySelector('#decryptorBody');
    if (!body) return;

    const crackedPassword = `Quantum_Override_${Math.floor(Math.random() * 8999 + 1000)}`;

    body.innerHTML = `
      <div class="dec-success-card">
        <div class="dec-success-headline">[✓] SIMULATED TYPING DRILL COMPLETE</div>
        <div class="dec-success-details">
          <span>TARGET SSID: <strong>${this.escapeHtml(this.activeTargetNetwork.ssid)}</strong></span>
          <span>TRAINING TOKEN (NOT A PASSWORD): <strong style="color: #ffaa00; font-size: 16px;">'${crackedPassword}'</strong></span>
          <span>REWARD: <strong style="color: #ffaa00;">+250 EXP | +100 BITCOIN</strong></span>
        </div>
        <button class="wifi-btn wifi-btn-confirm" id="btnDecAutoconnect">CLOSE TRAINING RESULT</button>
      </div>
    `;

    this.app.addExp(250, 'WPA2 Quantum Handshake Decryption');
    profileStore.addBitcoin(this.app.username, 100);
    if (this.sound) this.sound.playSuccessFanfare();

    const btnAuto = body.querySelector('#btnDecAutoconnect');
    if (btnAuto) {
      btnAuto.addEventListener('click', async () => {
        if (this.toasts) {
          this.toasts.show('WARNING', 'Training only — no Wi-Fi password was recovered or transmitted.', 3500);
        }
        this.isDecrypting = false;
      });
    }
  }

  escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  detachDecryptorListener() {
    if (!this.decryptListenerAttached) return;
    window.removeEventListener('keydown', this.boundDecryptorKeyDown);
    this.decryptListenerAttached = false;
  }

  stop() {
    if (this.radarAnimId) cancelAnimationFrame(this.radarAnimId);
    this.radarAnimId = null;
    this.isDecrypting = false;
    this.detachDecryptorListener();
  }

  resume() {
    this.initRadarCanvas();
  }
}

/**
 * CYBER//TYPE CONTROL CENTER & ANALYTICS SUITE
 * Contains:
 * 1. Command Palette (Ctrl+K / Ctrl+P)
 * 2. Settings Panel Modal (Ctrl+,)
 * 3. Analytics Dashboard & Achievements Modal (dashboard)
 */

import { profileStore, ACHIEVEMENTS_LIST } from './profileStore.js';

export class ControlCenter {
  constructor(app, soundEngine, toastManager) {
    this.app = app;
    this.sound = soundEngine;
    this.toasts = toastManager;

    this.paletteModal = null;
    this.settingsModal = null;
    this.dashboardModal = null;

    this.paletteIndex = 0;
    this.filteredCommands = [];

    this.commandsList = [
      { id: 'vscode', name: 'VS Code Multi-Language Playground', category: 'Game Modes', icon: '💻', cmd: 'code' },
      { id: 'browser', name: 'In-App Cyber Web Browser', category: 'Game Modes', icon: '🌐', cmd: 'browser' },
      { id: 'roguelite', name: 'Cyberspace Node Crawl (Roguelite)', category: 'Game Modes', icon: '🎮', cmd: 'roguelite' },
      { id: 'academy', name: 'Touch Typing Academy', category: 'Game Modes', icon: '⌨️', cmd: 'academy' },
      { id: 'speed', name: 'Speed Rush Benchmark (30s)', category: 'Game Modes', icon: '⚡', cmd: 'speed 30' },
      { id: 'speed_hardcore', name: 'Speed Rush Hardcore (45s)', category: 'Game Modes', icon: '💀', cmd: 'speed hardcore' },
      { id: 'hacker', name: 'Hollywood Hacker Infiltration', category: 'Game Modes', icon: '🕵️', cmd: 'hacker' },
      { id: 'breach', name: 'Breach Protocol Matrix', category: 'Mini-Games', icon: '🔐', cmd: 'breach' },
      { id: 'dashboard', name: 'Operator Analytics Dashboard', category: 'System', icon: '📊', cmd: 'dashboard' },
      { id: 'settings', name: 'Terminal Configuration Settings', category: 'System', icon: '⚙️', cmd: 'settings' },
      { id: 'records', name: 'Netrunner Personal Records', category: 'System', icon: '🏆', cmd: 'records' },
      { id: 'shop', name: 'Black Market Cyberware Shop', category: 'System', icon: '🛒', cmd: 'shop' },
      { id: 'heatmap', name: 'Weak Key Heatmap Visualizer', category: 'Visualizers', icon: '🔥', cmd: 'heatmap' },
      { id: 'nodegraph', name: 'Network Topology Node Graph', category: 'Visualizers', icon: '🌐', cmd: 'nodegraph' },
      { id: 'threat', name: 'Watch Dogs Cyber Threat Globe', category: 'Visualizers', icon: '🌍', cmd: 'threat' },
      { id: 'emp', name: 'Matrix EMP Shockwave Blast', category: 'Actions', icon: '💥', cmd: 'emp' },
      { id: 'crt', name: 'Toggle Retro CRT Phosphor Shader', category: 'Appearance', icon: '📺', cmd: 'crt' },
      { id: 'theme_matrix', name: 'Theme: Matrix Phosphor Green', category: 'Appearance', icon: '🟢', cmd: 'theme matrix' },
      { id: 'theme_neon', name: 'Theme: Neon Cyberpunk Cyan', category: 'Appearance', icon: '🔵', cmd: 'theme neon' },
      { id: 'theme_amber', name: 'Theme: Retro Amber Glow', category: 'Appearance', icon: '🟠', cmd: 'theme amber' },
      { id: 'theme_red', name: 'Theme: Crimson Defcon Red', category: 'Appearance', icon: '🔴', cmd: 'theme red' },
      { id: 'theme_stealth', name: 'Theme: Stealth Monochrome', category: 'Appearance', icon: '⚪', cmd: 'theme stealth' },
      { id: 'sound_mech', name: 'Audio Profile: Mechanical Keyboard', category: 'Audio', icon: '🔊', cmd: 'sound mechanical' },
      { id: 'sound_holly', name: 'Audio Profile: Hollywood Terminal', category: 'Audio', icon: '🔊', cmd: 'sound hollywood' },
      { id: 'bgm', name: 'Toggle Procedural Ambient BGM', category: 'Audio', icon: '🎵', cmd: 'bgm' },
      { id: 'clear', name: 'Clear Terminal Screen', category: 'Actions', icon: '🧹', cmd: 'clear' }
    ];

    this.initDOM();
    this.bindGlobalShortcuts();
  }

  initDOM() {
    // 1. Command Palette Modal Container
    let pEl = document.getElementById('cyberPaletteModal');
    if (!pEl) {
      pEl = document.createElement('div');
      pEl.id = 'cyberPaletteModal';
      pEl.className = 'cyber-modal-container hidden';
      pEl.innerHTML = `
        <div class="cyber-modal-backdrop" id="cyberPaletteBackdrop"></div>
        <div class="palette-dialog">
          <div class="palette-search-bar">
            <span class="palette-icon">🔍</span>
            <input type="text" id="paletteSearchInput" placeholder="Type a command or search feature (e.g. roguelite, theme, speed)..." autocomplete="off" />
            <span class="palette-hint">ESC to close</span>
          </div>
          <div class="palette-results" id="paletteResultsList"></div>
        </div>
      `;
      document.body.appendChild(pEl);
    }
    this.paletteModal = pEl;

    // 2. Settings Modal Container
    let sEl = document.getElementById('cyberSettingsModal');
    if (!sEl) {
      sEl = document.createElement('div');
      sEl.id = 'cyberSettingsModal';
      sEl.className = 'cyber-modal-container hidden';
      sEl.innerHTML = `
        <div class="cyber-modal-backdrop" id="cyberSettingsBackdrop"></div>
        <div class="settings-dialog" id="cyberSettingsDialog"></div>
      `;
      document.body.appendChild(sEl);
    }
    this.settingsModal = sEl;

    // 3. Analytics Dashboard Modal Container
    let dEl = document.getElementById('cyberDashboardModal');
    if (!dEl) {
      dEl = document.createElement('div');
      dEl.id = 'cyberDashboardModal';
      dEl.className = 'cyber-modal-container hidden';
      dEl.innerHTML = `
        <div class="cyber-modal-backdrop" id="cyberDashboardBackdrop"></div>
        <div class="dashboard-dialog" id="cyberDashboardDialog"></div>
      `;
      document.body.appendChild(dEl);
    }
    this.dashboardModal = dEl;

    this.bindModalEvents();
  }

  bindGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl + K or Ctrl + P for Command Palette
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        this.toggleCommandPalette();
        return;
      }

      // Ctrl + , for Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        this.toggleSettingsModal();
        return;
      }

      // Palette Navigation
      if (!this.paletteModal.classList.contains('hidden')) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.paletteIndex = Math.min(this.filteredCommands.length - 1, this.paletteIndex + 1);
          this.renderPaletteResults();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.paletteIndex = Math.max(0, this.paletteIndex - 1);
          this.renderPaletteResults();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const target = this.filteredCommands[this.paletteIndex];
          if (target) {
            this.executePaletteCommand(target.cmd);
          }
        } else if (e.key === 'Escape') {
          this.closeCommandPalette();
        }
      }
    });
  }

  bindModalEvents() {
    // Backdrop clicks
    const pBackdrop = document.getElementById('cyberPaletteBackdrop');
    if (pBackdrop) pBackdrop.addEventListener('click', () => this.closeCommandPalette());

    const sBackdrop = document.getElementById('cyberSettingsBackdrop');
    if (sBackdrop) sBackdrop.addEventListener('click', () => this.closeSettingsModal());

    const dBackdrop = document.getElementById('cyberDashboardBackdrop');
    if (dBackdrop) dBackdrop.addEventListener('click', () => this.closeDashboardModal());

    // Search input typing
    const searchInput = document.getElementById('paletteSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        this.filterPaletteCommands(query);
      });
    }
  }

  // =========================================================================
  // 1. COMMAND PALETTE
  // =========================================================================

  toggleCommandPalette() {
    if (this.paletteModal.classList.contains('hidden')) {
      this.openCommandPalette();
    } else {
      this.closeCommandPalette();
    }
  }

  openCommandPalette() {
    this.paletteModal.classList.remove('hidden');
    const input = document.getElementById('paletteSearchInput');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.paletteIndex = 0;
    this.filterPaletteCommands('');
    if (this.sound && this.sound.playKey) this.sound.playKey(false);
  }

  closeCommandPalette() {
    this.paletteModal.classList.add('hidden');
    if (this.app && this.app.focusCliInput) this.app.focusCliInput();
  }

  filterPaletteCommands(query) {
    if (!query) {
      this.filteredCommands = [...this.commandsList];
    } else {
      this.filteredCommands = this.commandsList.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.cmd.toLowerCase().includes(query)
      );
    }
    this.paletteIndex = 0;
    this.renderPaletteResults();
  }

  renderPaletteResults() {
    const list = document.getElementById('paletteResultsList');
    if (!list) return;
    list.innerHTML = '';

    if (this.filteredCommands.length === 0) {
      list.innerHTML = `<div class="palette-empty">No matching commands found.</div>`;
      return;
    }

    this.filteredCommands.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `palette-item ${idx === this.paletteIndex ? 'active' : ''}`;
      item.innerHTML = `
        <span class="p-item-icon">${cmd.icon}</span>
        <div class="p-item-info">
          <span class="p-item-name">${cmd.name}</span>
          <span class="p-item-cat">${cmd.category}</span>
        </div>
        <span class="p-item-cmd">${cmd.cmd}</span>
      `;

      item.addEventListener('click', () => {
        this.executePaletteCommand(cmd.cmd);
      });

      list.appendChild(item);
    });

    const activeEl = list.children ? list.children[this.paletteIndex] : null;
    if (activeEl && activeEl.scrollIntoView) activeEl.scrollIntoView({ block: 'nearest' });
  }

  executePaletteCommand(cmdStr) {
    this.closeCommandPalette();
    if (cmdStr === 'settings') {
      this.openSettingsModal();
    } else if (cmdStr === 'dashboard') {
      this.openDashboardModal();
    } else if (this.app && this.app.executeCliCommand) {
      this.app.executeCliCommand(cmdStr);
    }
  }

  // =========================================================================
  // 2. SETTINGS PANEL MODAL
  // =========================================================================

  toggleSettingsModal() {
    if (this.settingsModal.classList.contains('hidden')) {
      this.openSettingsModal();
    } else {
      this.closeSettingsModal();
    }
  }

  openSettingsModal() {
    this.settingsModal.classList.remove('hidden');
    const dialog = document.getElementById('cyberSettingsDialog');
    if (!dialog) return;

    const currentTheme = this.app.currentTheme || 'matrix';
    const currentSound = (this.app.currentSound || 'MECHANICAL').toLowerCase();
    const currentLayout = this.app.currentLayout || 'en';
    const isCrt = document.body.classList.contains('crt-mode');

    dialog.innerHTML = `
      <div class="cyber-settings-card">
        <div class="settings-header">
          <span>⚙️ CONTROL CENTER // TERMINAL CONFIGURATION</span>
          <button class="settings-close-btn" id="settingsCloseBtn">✖</button>
        </div>

        <div class="settings-body">
          <!-- Theme Selection -->
          <div class="setting-group">
            <div class="setting-title">🎨 Visual Color Theme</div>
            <div class="setting-themes-grid">
              <button class="theme-btn ${currentTheme === 'matrix' ? 'active' : ''}" data-theme="matrix">
                <span class="theme-swatch" style="background:#00ff66;"></span> Matrix Phosphor
              </button>
              <button class="theme-btn ${currentTheme === 'neon' ? 'active' : ''}" data-theme="neon">
                <span class="theme-swatch" style="background:#00f0ff;"></span> Neon Cyberpunk
              </button>
              <button class="theme-btn ${currentTheme === 'amber' ? 'active' : ''}" data-theme="amber">
                <span class="theme-swatch" style="background:#ffaa00;"></span> Amber CRT
              </button>
              <button class="theme-btn ${currentTheme === 'red' ? 'active' : ''}" data-theme="red">
                <span class="theme-swatch" style="background:#ff2244;"></span> Defcon Red
              </button>
              <button class="theme-btn ${currentTheme === 'stealth' ? 'active' : ''}" data-theme="stealth">
                <span class="theme-swatch" style="background:#ffffff;"></span> Monochrome Stealth
              </button>
            </div>
          </div>

          <!-- Audio Profile Selection -->
          <div class="setting-group">
            <div class="setting-title">🔊 Mechanical Audio Profile</div>
            <div class="setting-sounds-grid">
              <button class="sound-btn ${currentSound.includes('mech') ? 'active' : ''}" data-sound="mechanical">
                🔊 Mechanical Switch
              </button>
              <button class="sound-btn ${currentSound.includes('hollywood') ? 'active' : ''}" data-sound="hollywood">
                🎬 Hollywood Chirp
              </button>
              <button class="sound-btn ${currentSound.includes('holypanda') ? 'active' : ''}" data-sound="holypanda_switches">
                🐼 Holy Panda Tactile
              </button>
              <button class="sound-btn ${currentSound.includes('cherry') ? 'active' : ''}" data-sound="cherry_switches">
                🍒 Cherry MX Blue
              </button>
              <button class="sound-btn ${currentSound.includes('mute') || currentSound.includes('silent') ? 'active' : ''}" data-sound="mute">
                🔇 Silent Mute
              </button>
            </div>
          </div>

          <!-- Keyboard Layout & Visual Toggles -->
          <div class="setting-group">
            <div class="setting-title">⌨️ Keyboard & Display Features</div>
            <div class="setting-toggles-grid">
              <div class="toggle-item">
                <span>Layout Mapping:</span>
                <button class="toggle-btn" id="btnToggleLayout">${currentLayout.toUpperCase()} [${currentLayout === 'en' ? 'QWERTY' : 'เกษมณี'}]</button>
              </div>
              <div class="toggle-item">
                <span>90s CRT Scanline Shader:</span>
                <button class="toggle-btn ${isCrt ? 'active' : ''}" id="btnToggleCrt">${isCrt ? 'ENABLED' : 'DISABLED'}</button>
              </div>
              <div class="toggle-item">
                <span>Finger Kinematics Guide:</span>
                <button class="toggle-btn active" id="btnToggleFingers">VISIBLE</button>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-footer">
          <button class="btn-save-settings" id="btnSaveSettings">DONE [ESC]</button>
        </div>
      </div>
    `;

    // Bind Theme Buttons
    dialog.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        if (this.app.setTheme) this.app.setTheme(theme);
        this.openSettingsModal(); // Refresh UI
        if (this.sound && this.sound.playKey) this.sound.playKey(false);
      });
    });

    // Bind Sound Buttons
    dialog.querySelectorAll('.sound-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = btn.dataset.sound;
        if (this.app.setSoundSwitch) {
          this.app.setSoundSwitch(s);
        } else if (this.sound && this.sound.setPreset) {
          this.sound.setPreset(s);
          this.app.currentSound = s.toUpperCase();
        }
        if (this.sound && this.sound.playKey) this.sound.playKey(false);
        this.openSettingsModal(); // Refresh UI
      });
    });

    // Layout Toggle
    const layoutBtn = dialog.querySelector('#btnToggleLayout');
    if (layoutBtn) {
      layoutBtn.addEventListener('click', () => {
        const next = this.app.currentLayout === 'en' ? 'th' : 'en';
        if (this.app.setLayout) {
          this.app.setLayout(next);
        } else {
          this.app.currentLayout = next;
          if (this.app.kb) this.app.kb.setLayout(next);
          if (this.app.dom.currentLayoutDisplay) {
            this.app.dom.currentLayoutDisplay.textContent = next.toUpperCase() + (next === 'en' ? ' [QWERTY]' : ' [เกษมณี]');
          }
        }
        this.openSettingsModal();
      });
    }

    // CRT Toggle
    const crtBtn = dialog.querySelector('#btnToggleCrt');
    if (crtBtn) {
      crtBtn.addEventListener('click', () => {
        if (this.app.toggleCrtEffect) {
          this.app.toggleCrtEffect();
        } else {
          document.body.classList.toggle('crt-mode');
        }
        this.openSettingsModal();
      });
    }

    // Close buttons
    dialog.querySelector('#settingsCloseBtn').addEventListener('click', () => this.closeSettingsModal());
    dialog.querySelector('#btnSaveSettings').addEventListener('click', () => this.closeSettingsModal());
  }

  closeSettingsModal() {
    this.settingsModal.classList.add('hidden');
    if (this.app && this.app.focusCliInput) this.app.focusCliInput();
  }

  // =========================================================================
  // 3. ANALYTICS DASHBOARD & ACHIEVEMENTS MODAL
  // =========================================================================

  openDashboardModal() {
    this.dashboardModal.classList.remove('hidden');
    const dialog = document.getElementById('cyberDashboardDialog');
    if (!dialog) return;

    const username = this.app.username || 'Anan';
    const prof = profileStore.getProfile(username);
    const weakKeys = profileStore.getWeakKeys(username);
    const sessions = prof.wpmSessions || [];
    const unlockedAchs = prof.achievements || [];

    const ranks = ['INITIATE', 'SCRIPT RUNNER', 'NETRUNNER', 'ZERO-DAY HUNTER', 'QUANTUM DEITY'];
    const rankTitle = ranks[Math.min(ranks.length - 1, prof.level - 1)];

    dialog.innerHTML = `
      <div class="cyber-dashboard-card">
        <div class="dashboard-header">
          <div class="dash-title">📊 OPERATOR DOSSIER // ANALYTICS SUITE</div>
          <button class="settings-close-btn" id="dashCloseBtn">✖</button>
        </div>

        <div class="dash-grid-top">
          <div class="dash-profile-card">
            <div class="prof-avatar">👤</div>
            <div class="prof-meta">
              <div class="prof-name">${prof.username.toUpperCase()} (LVL ${prof.level} [${rankTitle}])</div>
              <div class="prof-exp">EXP: ${prof.exp} / ${prof.expNext}</div>
              <div class="prof-balance">
                <span>💰 CREDITS: <strong>${prof.credits || 0} CC</strong></span>
                <span>₿ BITCOIN: <strong style="color:#ffaa00;">₿ ${prof.bitcoin || 0}</strong></span>
              </div>
            </div>
          </div>

          <div class="dash-stat-row">
            <div class="dash-stat-card">
              <span class="dsc-label">PEAK SPEED</span>
              <span class="dsc-val">${prof.peakWpm || 0} <small>WPM</small></span>
            </div>
            <div class="dash-stat-card">
              <span class="dsc-label">KEYSTROKES</span>
              <span class="dsc-val">${prof.totalKeystrokes || 0}</span>
            </div>
            <div class="dash-stat-card">
              <span class="dsc-label">CYBERSCRAWL BEST</span>
              <span class="dsc-val">DEPTH ${prof.rogueliteStats?.highestDepth || 0}/6</span>
            </div>
          </div>
        </div>

        <!-- WPM Progression Graph -->
        <div class="dash-chart-section">
          <div class="dash-section-title">📈 WPM PROGRESSION TIMELINE (RECENT SESSIONS)</div>
          <div class="dash-chart-wrapper">
            <svg id="dashSvgChart" class="dash-svg-chart" viewBox="0 0 600 130"></svg>
          </div>
        </div>

        <!-- Real Weak Keys Frequency Heatmap -->
        <div class="dash-weak-section">
          <div class="dash-section-title">🔥 ERROR FREQUENCY WEAK KEYS (PRACTICE RECOMMENDATION)</div>
          <div class="dash-weak-chips">
            ${weakKeys.length > 0
              ? weakKeys.slice(0, 10).map(k => `<span class="weak-chip">[ ${k.toUpperCase()} ]</span>`).join('')
              : '<span style="color:#00ff66;">Flawless Key Precision. No weak key hotspots detected!</span>'
            }
          </div>
        </div>

        <!-- Achievements Grid -->
        <div class="dash-achievements-section">
          <div class="dash-section-title">🏆 DEPLOYED ACHIEVEMENTS (${unlockedAchs.length}/${ACHIEVEMENTS_LIST.length})</div>
          <div class="dash-ach-grid">
            ${ACHIEVEMENTS_LIST.map(ach => {
              const isUnlocked = unlockedAchs.includes(ach.id);
              return `
                <div class="ach-card ${isUnlocked ? 'unlocked' : 'locked'}">
                  <span class="ach-icon">${ach.icon}</span>
                  <div class="ach-info">
                    <div class="ach-name">${ach.title}</div>
                    <div class="ach-desc">${ach.desc}</div>
                  </div>
                  <span class="ach-badge">${isUnlocked ? '✓ UNLOCKED' : '+₿ ' + ach.rewardBtc}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="dashboard-footer">
          <button class="btn-save-settings" id="dashCloseBtn2">CLOSE DOSSIER [ESC]</button>
        </div>
      </div>
    `;

    this.renderSvgChart(sessions);

    dialog.querySelector('#dashCloseBtn').addEventListener('click', () => this.closeDashboardModal());
    dialog.querySelector('#dashCloseBtn2').addEventListener('click', () => this.closeDashboardModal());
  }

  renderSvgChart(sessions) {
    const svg = document.getElementById('dashSvgChart');
    if (!svg) return;
    svg.innerHTML = '';

    if (!sessions || sessions.length < 2) {
      // Mock progression if empty
      sessions = [
        { wpm: 25, accuracy: 92 },
        { wpm: 38, accuracy: 95 },
        { wpm: 52, accuracy: 98 },
        { wpm: 68, accuracy: 99 }
      ];
    }

    const data = sessions.slice(-15); // Last 15 sessions
    const w = 600;
    const h = 130;
    const pad = 20;

    const maxWpm = Math.max(80, ...data.map(d => d.wpm + 10));

    // Grid lines
    for (let r = 0; r <= 3; r++) {
      const y = pad + (r / 3) * (h - pad * 2);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', pad);
      line.setAttribute('y1', y);
      line.setAttribute('x2', w - pad);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(255,255,255,0.08)');
      line.setAttribute('stroke-dasharray', '4,4');
      svg.appendChild(line);
    }

    // Points
    const points = data.map((d, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - (d.wpm / maxWpm) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    // Area Fill
    const area = `${pad},${h - pad} ` + points.join(' ') + ` ${w - pad},${h - pad}`;
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', area);
    poly.setAttribute('fill', 'rgba(0,255,102,0.15)');
    svg.appendChild(poly);

    // Line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line.setAttribute('points', points.join(' '));
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#00ff66');
    line.setAttribute('stroke-width', '2.5');
    svg.appendChild(line);

    // Circles
    data.forEach((d, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - (d.wpm / maxWpm) * (h - pad * 2);
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', x);
      c.setAttribute('cy', y);
      c.setAttribute('r', '4');
      c.setAttribute('fill', '#00e5ff');
      svg.appendChild(c);
    });
  }

  closeDashboardModal() {
    this.dashboardModal.classList.add('hidden');
    if (this.app && this.app.focusCliInput) this.app.focusCliInput();
  }
}

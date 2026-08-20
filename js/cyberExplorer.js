/**
 * CYBER//TYPE REAL-WORLD FILE EXPLORER & DESKTOP MIRROR MATRIX ENGINE
 * Connects directly to host Windows/Linux Desktop & Filesystem.
 * Features:
 *   - [🖥️ LIVE DESKTOP MATRIX]: Live reflection of real desktop shortcuts, games, tools, and files with 1-click launch.
 *   - [💽 STORAGE BROWSER]: Deep drive and folder browser for C:\, D:\, Documents, Downloads.
 *   - Interactive actions: Launch .exe/.lnk apps, preview hologram images, stream audio, edit code in VS Code Studio.
 *   - File management: Create folder, delete, encrypt file (AES-256), search filter.
 */

import { systemBridge } from './systemBridge.js';

export class CyberExplorerEngine {
  constructor(app, soundEngine, toastManager) {
    this.app = app;
    this.sound = soundEngine;
    this.toasts = toastManager;

    this.container = null;
    this.viewMode = 'desktop_matrix'; // 'desktop_matrix' | 'storage_browser'
    this.currentPath = 'C:\\Users\\asus';
    this.history = ['C:\\Users\\asus'];
    this.historyIdx = 0;
    this.files = [];
    this.desktopItems = [];
    this.drives = [];
    this.searchQuery = '';
    this.selectedFile = null;
    this.previewAudio = null;
    this.desktopSource = 'VERIFYING';
    this.storageSource = 'VERIFYING';
  }

  async init(containerEl) {
    this.container = containerEl;
    if (!this.container) return;

    try {
      const sysInfo = await systemBridge.getSysInfo();
      if (sysInfo && sysInfo.userHome) {
        this.currentPath = sysInfo.userHome;
        this.history = [this.currentPath];
      }
    } catch (e) {}

    this.renderLayout();
    await this.loadDrives();
    await this.loadDesktopMatrix();
    await this.navigateTo(this.currentPath, false);
  }

  renderLayout() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="cyber-explorer-window" id="cyberExplorerWindow">
        <!-- 1. Top Navigation & View Switcher Bar -->
        <div class="explorer-header-bar">
          <!-- View Mode Toggle -->
          <div class="exp-mode-toggle-group">
            <button class="exp-view-mode-btn ${this.viewMode === 'desktop_matrix' ? 'active' : ''}" id="expModeDesktop" title="Live reflection of your Windows Desktop apps">🖥️ DESKTOP MATRIX</button>
            <button class="exp-view-mode-btn ${this.viewMode === 'storage_browser' ? 'active' : ''}" id="expModeStorage" title="Deep file and storage drive browser">💽 STORAGE BROWSER</button>
          </div>

          <!-- Storage Nav Controls (Visible in Storage Browser mode) -->
          <div class="explorer-nav-controls ${this.viewMode === 'desktop_matrix' ? 'hidden' : ''}" id="expStorageNavControls">
            <button class="exp-nav-btn" id="expBtnBack" title="Back (Alt+Left)">◀</button>
            <button class="exp-nav-btn" id="expBtnForward" title="Forward (Alt+Right)">▶</button>
            <button class="exp-nav-btn" id="expBtnUp" title="Up to Parent Directory">▲</button>
            <button class="exp-nav-btn" id="expBtnRefresh" title="Refresh Directory">🔄</button>
          </div>

          <!-- Breadcrumbs (Visible in Storage Browser mode) -->
          <div class="explorer-breadcrumbs ${this.viewMode === 'desktop_matrix' ? 'hidden' : ''}" id="expBreadcrumbs"></div>

          <!-- Desktop Telemetry Pill (Visible in Desktop Matrix mode) -->
          <div class="desktop-telemetry-pill ${this.viewMode === 'storage_browser' ? 'hidden' : ''}" id="expDesktopPill">
            <span class="pulse-green-dot"></span>
            <span>DESKTOP SOURCE: <strong id="desktopItemCounter">VERIFYING</strong></span>
          </div>

          <div class="explorer-search-box">
            <span class="search-icon">🔍</span>
            <input type="text" class="exp-search-input" id="expSearchInput" placeholder="Filter apps & files..." />
          </div>

          <button class="exp-nav-btn exp-btn-exit" id="expBtnExit" title="Return to CLI Terminal">✕</button>
        </div>

        <!-- 2. MODE A: LIVE CYBER DESKTOP MATRIX (Flagship Hologram View) -->
        <div class="desktop-matrix-stage ${this.viewMode === 'desktop_matrix' ? '' : 'hidden'}" id="expDesktopMatrixStage">
          <!-- Desktop Telemetry Banner -->
          <div class="desktop-hud-banner">
            <div class="hud-left">
              <span class="hud-tag" id="desktopSourceTag">[ SOURCE: VERIFYING ]</span>
              <span class="hud-sub">HOST ITEMS WHEN VERIFIED; LAB DATA WHEN SIMULATED</span>
            </div>
            <div class="hud-right">
              <button class="btn-desktop-refresh" id="btnRefreshDesktop">🔄 RESCAN DESKTOP</button>
            </div>
          </div>

          <!-- Categorized Hologram Grid Sections -->
          <div class="desktop-categories-scroll" id="desktopCategoriesScroll">
            <!-- Categories rendered dynamically -->
          </div>
        </div>

        <!-- 3. MODE B: DEEP STORAGE BROWSER (Dual-Pane File Matrix View) -->
        <div class="explorer-body-split ${this.viewMode === 'storage_browser' ? '' : 'hidden'}" id="expStorageBodySplit">
          <!-- Sidebar: Quick Access & Drives -->
          <div class="explorer-sidebar">
            <div class="sidebar-section-title">⚡ QUICK ACCESS</div>
            <div class="sidebar-links-list" id="expQuickDrives">
              <!-- Drive chips rendered dynamically -->
            </div>

            <div class="sidebar-section-title" style="margin-top: 14px;">🛠️ FILE ACTIONS</div>
            <div class="sidebar-actions-list">
              <button class="exp-action-btn" id="expBtnNewFolder">📁 New Folder</button>
              <button class="exp-action-btn" id="expBtnEncrypt">🔒 Encrypt File</button>
              <button class="exp-action-btn exp-btn-danger" id="expBtnDelete">🗑️ Delete File</button>
            </div>
          </div>

          <!-- Main File Matrix Grid/Table -->
          <div class="explorer-file-matrix" id="expFileMatrix">
            <div class="file-matrix-header">
              <div class="col-name">NAME</div>
              <div class="col-size">SIZE</div>
              <div class="col-type">TYPE</div>
              <div class="col-date">DATE MODIFIED</div>
            </div>
            <div class="file-matrix-scroll" id="expFilesList">
              <!-- File rows rendered dynamically -->
            </div>
          </div>
        </div>

        <!-- 4. Bottom Status Bar -->
        <div class="explorer-status-bar">
          <span id="expItemCount">0 items</span>
          <span class="status-sep">|</span>
          <span id="expSelectedInfo">Ready</span>
          <span class="status-sep">|</span>
          <span class="status-glow" id="explorerSourceStatus">DESKTOP BRIDGE [VERIFYING]</span>
        </div>
      </div>

      <!-- Hologram Image Zoom Modal -->
      <div class="hologram-preview-modal hidden" id="expImageModal">
        <div class="holo-preview-card">
          <div class="holo-header">
            <span id="holoModalTitle">HOLOGRAM IMAGE PREVIEW</span>
            <div class="holo-header-controls">
              <button class="holo-tool-btn" id="holoBtnZoomIn" title="Zoom In">🔍 +</button>
              <button class="holo-tool-btn" id="holoBtnZoomOut" title="Zoom Out">🔎 -</button>
              <button class="holo-tool-btn" id="holoBtnRotate" title="Rotate 90°">🔄 90°</button>
              <button class="holo-tool-btn" id="holoBtnMatrix" title="Matrix Filter">💚 Matrix</button>
              <button class="holo-tool-btn" id="holoBtnReset" title="Reset View">⟲ Reset</button>
            </div>
            <button class="holo-close-btn" id="holoModalClose">✕</button>
          </div>
          <div class="holo-image-stage" id="holoImageStage">
            <img id="holoModalImg" src="" alt="Preview" />
          </div>
          <div class="holo-footer-meta" id="holoFooterMeta">
            <span>ZOOM: <strong id="holoZoomVal">100%</strong></span>
            <span>ROTATION: <strong id="holoRotVal">0°</strong></span>
            <span>FILTER: <strong id="holoFilterVal">NORMAL</strong></span>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    if (!this.container) return;

    // View Mode Switcher
    const btnModeDesktop = this.container.querySelector('#expModeDesktop');
    const btnModeStorage = this.container.querySelector('#expModeStorage');

    if (btnModeDesktop) {
      btnModeDesktop.addEventListener('click', () => this.switchViewMode('desktop_matrix'));
    }
    if (btnModeStorage) {
      btnModeStorage.addEventListener('click', () => this.switchViewMode('storage_browser'));
    }

    const btnRefreshDesktop = this.container.querySelector('#btnRefreshDesktop');
    if (btnRefreshDesktop) {
      btnRefreshDesktop.addEventListener('click', () => {
        this.loadDesktopMatrix();
        if (this.sound) this.sound.playSuccessFanfare();
      });
    }

    const btnBack = this.container.querySelector('#expBtnBack');
    const btnFwd = this.container.querySelector('#expBtnForward');
    const btnUp = this.container.querySelector('#expBtnUp');
    const btnRefresh = this.container.querySelector('#expBtnRefresh');
    const btnExit = this.container.querySelector('#expBtnExit');
    const searchInput = this.container.querySelector('#expSearchInput');

    const btnNewFolder = this.container.querySelector('#expBtnNewFolder');
    const btnEncrypt = this.container.querySelector('#expBtnEncrypt');
    const btnDelete = this.container.querySelector('#expBtnDelete');

    const modalClose = this.container.querySelector('#holoModalClose');

    if (btnBack) btnBack.addEventListener('click', () => this.goBack());
    if (btnFwd) btnFwd.addEventListener('click', () => this.goForward());
    if (btnUp) btnUp.addEventListener('click', () => this.goUp());
    if (btnRefresh) btnRefresh.addEventListener('click', () => this.navigateTo(this.currentPath, false));
    if (btnExit) btnExit.addEventListener('click', () => this.app.returnToCli());

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (this.viewMode === 'desktop_matrix') {
          this.renderDesktopMatrix();
        } else {
          this.renderFilesList();
        }
      });
    }

    if (modalClose) {
      modalClose.addEventListener('click', () => {
        const modal = this.container.querySelector('#expImageModal');
        if (modal) modal.classList.add('hidden');
      });
    }

    const btnZoomIn = this.container.querySelector('#holoBtnZoomIn');
    const btnZoomOut = this.container.querySelector('#holoBtnZoomOut');
    const btnRotate = this.container.querySelector('#holoBtnRotate');
    const btnMatrix = this.container.querySelector('#holoBtnMatrix');
    const btnReset = this.container.querySelector('#holoBtnReset');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        this.imageZoom = Math.min(3, this.imageZoom + 0.25);
        this.updateImageTransform();
        if (this.sound) this.sound.playKey(false);
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        this.imageZoom = Math.max(0.5, this.imageZoom - 0.25);
        this.updateImageTransform();
        if (this.sound) this.sound.playKey(false);
      });
    }

    if (btnRotate) {
      btnRotate.addEventListener('click', () => {
        this.imageRot = (this.imageRot + 90) % 360;
        this.updateImageTransform();
        if (this.sound) this.sound.playKey(false);
      });
    }

    if (btnMatrix) {
      btnMatrix.addEventListener('click', () => {
        this.isMatrixFilter = !this.isMatrixFilter;
        this.updateImageTransform();
        if (this.sound) this.sound.playKey(false);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.imageZoom = 1;
        this.imageRot = 0;
        this.isMatrixFilter = false;
        this.updateImageTransform();
        if (this.sound) this.sound.playKey(false);
      });
    }

    if (btnNewFolder) {
      btnNewFolder.addEventListener('click', async () => {
        const folderName = prompt('Enter new folder name:');
        if (folderName && folderName.trim()) {
          const sep = this.currentPath.includes('/') ? '/' : '\\';
          const target = `${this.currentPath}${sep}${folderName.trim()}`;
          const res = await systemBridge.makeDir(target);
          if (res.success) {
            if (this.toasts) this.toasts.show('SUCCESS', `Created folder '${folderName}'`, 2000);
            await this.navigateTo(this.currentPath, false);
          }
        }
      });
    }

    if (btnDelete) {
      btnDelete.addEventListener('click', async () => {
        if (!this.selectedFile) {
          alert('Please select a file to delete.');
          return;
        }
        if (confirm(`Are you sure you want to delete '${this.selectedFile.name}'?`)) {
          const sep = this.currentPath.includes('/') ? '/' : '\\';
          const target = `${this.currentPath}${sep}${this.selectedFile.name}`;
          const res = await systemBridge.deleteFile(target);
          if (res.success) {
            if (this.toasts) this.toasts.show('SUCCESS', `Deleted '${this.selectedFile.name}'`, 2000);
            this.selectedFile = null;
            await this.navigateTo(this.currentPath, false);
          }
        }
      });
    }

    if (btnEncrypt) {
      btnEncrypt.addEventListener('click', async () => {
        if (!this.selectedFile || this.selectedFile.isDir) {
          alert('Please select a file (not a directory) to encrypt.');
          return;
        }
        const pass = prompt(`Enter encryption key for '${this.selectedFile.name}':`);
        if (pass && pass.trim()) {
          const sep = this.currentPath.includes('/') ? '/' : '\\';
          const target = `${this.currentPath}${sep}${this.selectedFile.name}`;
          const res = await systemBridge.encryptFile(target, pass);
          if (res.success) {
            if (this.toasts) this.toasts.show('ACHIEVEMENT', `File Encrypted with AES-256 [${this.selectedFile.name}]`, 2500);
            await this.navigateTo(this.currentPath, false);
          } else {
            alert(`Encryption note: ${res.error || 'Done.'}`);
          }
        }
      });
    }
  }

  switchViewMode(mode) {
    this.viewMode = mode;

    const btnDesktop = this.container.querySelector('#expModeDesktop');
    const btnStorage = this.container.querySelector('#expModeStorage');
    const desktopStage = this.container.querySelector('#expDesktopMatrixStage');
    const storageSplit = this.container.querySelector('#expStorageBodySplit');
    const storageNav = this.container.querySelector('#expStorageNavControls');
    const breadcrumbs = this.container.querySelector('#expBreadcrumbs');
    const desktopPill = this.container.querySelector('#expDesktopPill');

    if (btnDesktop) btnDesktop.classList.toggle('active', mode === 'desktop_matrix');
    if (btnStorage) btnStorage.classList.toggle('active', mode === 'storage_browser');

    if (desktopStage) desktopStage.classList.toggle('hidden', mode !== 'desktop_matrix');
    if (storageSplit) storageSplit.classList.toggle('hidden', mode !== 'storage_browser');

    if (storageNav) storageNav.classList.toggle('hidden', mode === 'desktop_matrix');
    if (breadcrumbs) breadcrumbs.classList.toggle('hidden', mode === 'desktop_matrix');
    if (desktopPill) desktopPill.classList.toggle('hidden', mode === 'storage_browser');

    if (this.sound) this.sound.playKey(false);
    this.updateSourceStatus();
    if (mode === 'desktop_matrix') {
      this.renderDesktopMatrix();
    } else {
      this.renderFilesList();
    }
  }

  // --- LIVE DESKTOP MATRIX LOADING & RENDERING ---
  async loadDesktopMatrix() {
    const res = await systemBridge.getDesktopShortcuts();
    if (res && res.items) {
      this.desktopItems = res.items;
      this.desktopSource = res.source || 'UNKNOWN';
    }

    if (this.container) {
      const counter = this.container.querySelector('#desktopItemCounter');
      const sourceTag = this.container.querySelector('#desktopSourceTag');
      const verified = this.desktopSource === 'HOST_VERIFIED';
      if (counter) {
        counter.textContent = `${verified ? 'HOST VERIFIED' : 'SIMULATED'} // ${this.desktopItems.length} ITEMS`;
      }
      if (sourceTag) sourceTag.textContent = verified ? '[ SOURCE: HOST VERIFIED ]' : '[ SOURCE: SIMULATED FALLBACK ]';
      this.updateSourceStatus();
      this.renderDesktopMatrix();
    }
  }

  renderDesktopMatrix() {
    if (!this.container) return;
    const scrollContainer = this.container.querySelector('#desktopCategoriesScroll');
    if (!scrollContainer) return;

    let items = this.desktopItems;
    if (this.searchQuery) {
      items = items.filter(i => i.name.toLowerCase().includes(this.searchQuery) || (i.path && i.path.toLowerCase().includes(this.searchQuery)));
    }

    // Categorization logic
    const categories = {
      gaming: { title: '🎮 GAMING & ENTERTAINMENT DECK', color: '#ff007f', items: [] },
      dev: { title: '💻 DEV & PROFESSIONAL CODE TOOLS', color: '#00ff66', items: [] },
      browsers: { title: '🌐 BROWSERS & MEDIA COMMUNICATIONS', color: '#00e5ff', items: [] },
      folders: { title: '📁 DESKTOP FOLDERS & DATA FILES', color: '#ffaa00', items: [] }
    };

    items.forEach(item => {
      const name = item.name.toLowerCase();
      if (item.category === 'gaming' || name.includes('steam') || name.includes('league') || name.includes('riot') || name.includes('tft') || name.includes('bleach') || name.includes('ragnarok') || name.includes('game')) {
        categories.gaming.items.push(item);
      } else if (item.category === 'dev' || name.includes('code') || name.includes('visual studio') || name.includes('antigravity') || name.includes('cyberdeck') || name.includes('rapidminer') || name.includes('ltk') || name.includes('python') || name.includes('node') || name.includes('git')) {
        categories.dev.items.push(item);
      } else if (item.category === 'browsers' || name.includes('chrome') || name.includes('spotify') || name.includes('vlc') || name.includes('teamviewer') || name.includes('winrar') || name.includes('browser') || name.includes('discord') || name.includes('edge')) {
        categories.browsers.items.push(item);
      } else {
        categories.folders.items.push(item);
      }
    });

    let html = '';
    Object.keys(categories).forEach(catKey => {
      const cat = categories[catKey];
      if (cat.items.length === 0) return;

      html += `
        <div class="desktop-category-section">
          <div class="desktop-category-header" style="border-left-color: ${cat.color};">
            <span class="cat-title" style="color: ${cat.color};">${cat.title}</span>
            <span class="cat-badge">${cat.items.length} Shortcuts</span>
          </div>
          <div class="desktop-apps-grid">
            ${cat.items.map(item => this.renderAppCardHtml(item, cat.color)).join('')}
          </div>
        </div>
      `;
    });

    if (!html) {
      html = `<div class="desktop-empty-state">No desktop shortcuts matching query: '${this.escapeHtml(this.searchQuery)}'</div>`;
    }

    scrollContainer.innerHTML = html;

    // Click and Double-click bindings for app cards
    scrollContainer.querySelectorAll('.desktop-app-card').forEach(card => {
      const path = card.dataset.path;
      const isDir = card.dataset.isdir === 'true';
      const name = card.dataset.name;
      const itemObj = this.desktopItems.find(i => i.path === path || i.name === name);

      const launchBtn = card.querySelector('.btn-hologram-launch');
      if (launchBtn) {
        launchBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.executeDesktopLaunch(itemObj || { name, path, isDir });
        });
      }

      card.addEventListener('dblclick', () => {
        this.executeDesktopLaunch(itemObj || { name, path, isDir });
      });

      card.addEventListener('click', () => {
        scrollContainer.querySelectorAll('.desktop-app-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const selectedInfo = this.container.querySelector('#expSelectedInfo');
        if (selectedInfo) selectedInfo.textContent = `Selected: ${name}`;
        if (this.sound) this.sound.playKey(false);
      });
    });
  }

  renderAppCardHtml(item, glowColor) {
    const icon = this.getDesktopAppIcon(item);
    const cleanName = item.name.replace(/\.(lnk|exe|url)$/i, '');
    const safeName = this.escapeHtml(item.name);
    const safePath = this.escapeHtml(item.path || '');
    const safeCleanName = this.escapeHtml(cleanName);

    return `
      <div class="desktop-app-card" data-name="${safeName}" data-path="${safePath}" data-isdir="${item.isDir}" style="--card-glow: ${glowColor};">
        <div class="app-card-top">
          <span class="app-card-icon">${icon}</span>
          <span class="app-card-badge">${item.isDir ? 'FOLDER' : 'EXE / LNK'}</span>
        </div>
        <div class="app-card-info">
          <div class="app-card-name" title="${safeName}">${safeCleanName}</div>
          <div class="app-card-path" title="${safePath}">${item.path ? this.escapeHtml(item.path.slice(0, 32)) + '...' : 'Physical Desktop'}</div>
        </div>
        <div class="app-card-actions">
          <button class="btn-hologram-launch" title="Launch ${safeCleanName} on PC">
            <span class="btn-icon">⚡</span> ${item.isDir ? 'EXPLORE' : 'LAUNCH APP'}
          </button>
        </div>
      </div>
    `;
  }

  getDesktopAppIcon(item) {
    if (item.isDir) return '📁';
    const n = item.name.toLowerCase();
    if (n.includes('steam')) return '🎮';
    if (n.includes('league') || n.includes('riot') || n.includes('tft')) return '⚔️';
    if (n.includes('bleach') || n.includes('ragnarok')) return '🗡️';
    if (n.includes('chrome') || n.includes('browser')) return '🌐';
    if (n.includes('spotify')) return '🎵';
    if (n.includes('vlc')) return '🎬';
    if (n.includes('code') || n.includes('visual studio')) return '⚡';
    if (n.includes('antigravity') || n.includes('cyberdeck')) return '🌌';
    if (n.includes('rapidminer') || n.includes('ltk')) return '🛠️';
    if (n.includes('teamviewer')) return '📡';
    if (n.includes('winrar') || n.includes('zip')) return '📦';
    if (n.endsWith('.jpg') || n.endsWith('.png') || n.endsWith('.jpeg')) return '🖼️';
    if (n.endsWith('.docx') || n.endsWith('.pdf')) return '📄';
    return '⚡';
  }

  async executeDesktopLaunch(item) {
    if (!item) return;

    if (item.isDir) {
      // Enter directory in storage browser mode
      if (item.path) {
        this.switchViewMode('storage_browser');
        await this.navigateTo(item.path, true);
        if (this.toasts) this.toasts.show('SUCCESS', `Opened Desktop Folder: ${item.name}`, 2000);
      }
      return;
    }

    const n = item.name.toLowerCase();

    // Check image preview
    if (n.endsWith('.jpg') || n.endsWith('.png') || n.endsWith('.jpeg') || n.endsWith('.svg')) {
      if (item.path) {
        const media = await systemBridge.readMediaDataUrl(item.path);
        if (media.success) this.showHologramImage(item.name, media.dataUrl);
        else if (this.toasts) this.toasts.show('ERROR', `Image preview unavailable: ${media.error}`, 2500);
        return;
      }
    }

    // Launch application via Windows System Bridge
    if (this.toasts) {
      this.toasts.show('SUCCESS', `Executing Desktop Target: ${item.name}...`, 2500);
    }
    if (this.sound) this.sound.playSuccessFanfare();

    const targetPath = item.path || item.name;
    await systemBridge.launch(targetPath);
  }

  // --- STORAGE BROWSER OPERATIONS ---
  async loadDrives() {
    const res = await systemBridge.getDrives();
    if (res && res.drives) {
      this.drives = res.drives;
      this.storageSource = res.source || 'UNKNOWN';
    }
    this.updateSourceStatus();

    const container = this.container.querySelector('#expQuickDrives');
    if (!container) return;

    let html = '';
    this.drives.forEach(d => {
      let icon = '💽';
      if (d.name.includes('Desktop')) icon = '🖥️';
      else if (d.name.includes('Documents')) icon = '📁';
      else if (d.name.includes('Downloads')) icon = '📥';

      html += `
        <div class="sidebar-drive-item" data-path="${this.escapeHtml(d.path)}">
          <span class="drive-icon">${icon}</span>
          <div class="drive-meta">
            <span class="drive-name">${this.escapeHtml(d.name)}</span>
            <span class="drive-space">${d.freeGB} GB Free</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.sidebar-drive-item').forEach(item => {
      item.addEventListener('click', () => {
        const path = item.dataset.path;
        if (path) this.navigateTo(path, true);
        if (this.sound) this.sound.playKey(false);
      });
    });
  }

  async navigateTo(dirPath, pushHistory = true) {
    this.currentPath = dirPath;
    this.selectedFile = null;

    if (pushHistory) {
      if (this.historyIdx < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIdx + 1);
      }
      this.history.push(dirPath);
      this.historyIdx = this.history.length - 1;
    }

    this.renderBreadcrumbs();

    // Fetch real file list from systemBridge
    const res = await systemBridge.listFiles(dirPath);
    if (res && res.files) {
      this.files = res.files;
      this.storageSource = res.source || this.storageSource;
    } else {
      this.files = [];
    }

    this.updateSourceStatus();
    this.renderFilesList();
  }

  updateSourceStatus() {
    if (!this.container) return;
    const status = this.container.querySelector('#explorerSourceStatus');
    if (!status) return;
    const source = this.viewMode === 'desktop_matrix' ? this.desktopSource : this.storageSource;
    const verified = source === 'HOST_VERIFIED';
    const label = this.viewMode === 'desktop_matrix' ? 'DESKTOP' : 'STORAGE';
    status.textContent = `${label} SOURCE [${verified ? 'HOST VERIFIED' : 'SIMULATED FALLBACK'}]`;
    status.style.color = verified ? '#00ff66' : '#ffaa00';
  }

  renderBreadcrumbs() {
    if (!this.container) return;
    const breadcrumbs = this.container.querySelector('#expBreadcrumbs');
    if (!breadcrumbs) return;

    const sep = this.currentPath.includes('/') ? '/' : '\\';
    const parts = this.currentPath.split(/[/\\]/).filter(Boolean);

    let html = '';
    let accumulated = '';

    parts.forEach((p, idx) => {
      if (idx === 0 && this.currentPath.startsWith('\\\\')) {
        accumulated = `\\\\${p}`;
      } else if (idx === 0 && p.includes(':')) {
        accumulated = `${p}\\`;
      } else {
        accumulated = accumulated ? `${accumulated}${sep}${p}` : p;
      }

      html += `
        <span class="crumb-item" data-path="${this.escapeHtml(accumulated)}">${this.escapeHtml(p)}</span>
        ${idx < parts.length - 1 ? `<span class="crumb-sep">›</span>` : ''}
      `;
    });

    breadcrumbs.innerHTML = html;

    breadcrumbs.querySelectorAll('.crumb-item').forEach(item => {
      item.addEventListener('click', () => {
        const target = item.dataset.path;
        if (target) this.navigateTo(target, true);
      });
    });
  }

  renderFilesList() {
    if (!this.container) return;
    const listEl = this.container.querySelector('#expFilesList');
    const countEl = this.container.querySelector('#expItemCount');
    const selectedInfo = this.container.querySelector('#expSelectedInfo');
    if (!listEl) return;

    let displayFiles = this.files;
    if (this.searchQuery) {
      displayFiles = this.files.filter(f => f.name.toLowerCase().includes(this.searchQuery));
    }

    // Sort: directories first, then alphabetically
    displayFiles.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });

    if (countEl) countEl.textContent = `${displayFiles.length} item(s)`;
    if (selectedInfo) selectedInfo.textContent = this.selectedFile ? `Selected: ${this.selectedFile.name}` : 'No file selected';

    let html = '';
    displayFiles.forEach(f => {
      const isSelected = this.selectedFile && this.selectedFile.name === f.name;
      const icon = this.getFileIcon(f);
      const sizeStr = f.isDir ? '<DIR>' : this.formatSize(f.size);
      const typeStr = this.getFileTypeDesc(f);
      const dateStr = f.mtime ? new Date(f.mtime).toLocaleDateString() : '--';

      html += `
        <div class="file-row ${f.isDir ? 'is-dir' : 'is-file'} ${isSelected ? 'selected' : ''}" data-name="${this.escapeHtml(f.name)}" data-isdir="${f.isDir}">
          <div class="col-name"><span class="f-icon">${icon}</span> <span class="f-name">${this.escapeHtml(f.name)}</span></div>
          <div class="col-size">${sizeStr}</div>
          <div class="col-type">${this.escapeHtml(typeStr)}</div>
          <div class="col-date">${this.escapeHtml(dateStr)}</div>
        </div>
      `;
    });

    listEl.innerHTML = html;

    listEl.querySelectorAll('.file-row').forEach(row => {
      const name = row.dataset.name;
      const isDir = row.dataset.isdir === 'true';
      const fileObj = this.files.find(f => f.name === name);

      row.addEventListener('click', () => {
        this.selectedFile = fileObj;
        listEl.querySelectorAll('.file-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        if (selectedInfo) selectedInfo.textContent = `Selected: ${name} (${isDir ? 'Folder' : this.formatSize(fileObj ? fileObj.size : 0)})`;
        if (this.sound) this.sound.playKey(false);
      });

      row.addEventListener('dblclick', () => {
        this.handleFileOpen(fileObj);
      });
    });
  }

  async handleFileOpen(fileObj) {
    if (!fileObj) return;

    const sep = this.currentPath.includes('/') ? '/' : '\\';
    const fullPath = `${this.currentPath}${sep}${fileObj.name}`;

    if (fileObj.isDir) {
      this.navigateTo(fullPath, true);
      if (this.sound) this.sound.playSuccessFanfare();
      return;
    }

    const nameLower = fileObj.name.toLowerCase();

    if (nameLower.endsWith('.exe') || nameLower.endsWith('.bat') || nameLower.endsWith('.cmd') || nameLower.endsWith('.lnk')) {
      const launchResult = await systemBridge.launch(fullPath);
      if (launchResult.success) {
        if (this.toasts) this.toasts.show('SUCCESS', `Opened local target: ${fileObj.name}`, 2000);
        if (this.sound) this.sound.playSuccessFanfare();
      } else if (this.toasts) {
        this.toasts.show('ERROR', `Open failed: ${launchResult.error || 'Unknown error'}`, 3000);
      }
      return;
    }

    if (nameLower.endsWith('.png') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.gif') || nameLower.endsWith('.webp')) {
      const media = await systemBridge.readMediaDataUrl(fullPath);
      if (media.success) this.showHologramImage(fileObj.name, media.dataUrl);
      else if (this.toasts) this.toasts.show('ERROR', `Image preview unavailable: ${media.error}`, 2500);
      return;
    }

    if (nameLower.endsWith('.mp3') || nameLower.endsWith('.wav') || nameLower.endsWith('.ogg')) {
      const media = await systemBridge.readMediaDataUrl(fullPath);
      if (!media.success) {
        if (this.toasts) this.toasts.show('ERROR', `Audio preview unavailable: ${media.error}`, 2500);
        return;
      }
      this.stopMedia();
      this.previewAudio = new Audio(media.dataUrl);
      this.previewAudio.addEventListener('ended', () => { this.previewAudio = null; }, { once: true });
      try {
        await this.previewAudio.play();
        if (this.toasts) this.toasts.show('SUCCESS', `Playing local audio preview: ${fileObj.name}`, 2500);
      } catch (error) {
        this.stopMedia();
        if (this.toasts) this.toasts.show('ERROR', `Audio playback failed: ${error.message}`, 2500);
      }
      return;
    }

    if (nameLower.endsWith('.py') || nameLower.endsWith('.js') || nameLower.endsWith('.html') || nameLower.endsWith('.css') || nameLower.endsWith('.json') || nameLower.endsWith('.cpp') || nameLower.endsWith('.rs') || nameLower.endsWith('.sql') || nameLower.endsWith('.txt')) {
      const res = await systemBridge.readFile(fullPath);
      if (!res?.success || res.content === undefined) {
        if (this.toasts) this.toasts.show('ERROR', `File read failed: ${res?.error || 'Unknown error'}`, 3000);
        return;
      }
      if (this.app.launchVscodeMode) {
        let lang = 'python';
        if (nameLower.endsWith('.html') || nameLower.endsWith('.css') || nameLower.endsWith('.js')) lang = 'html';
        else if (nameLower.endsWith('.cpp')) lang = 'cpp';
        else if (nameLower.endsWith('.rs')) lang = 'rust';
        else if (nameLower.endsWith('.sql')) lang = 'sql';
        else if (nameLower.endsWith('.txt') || nameLower.endsWith('.json')) lang = 'bash';

        this.app.launchVscodeMode(lang);
        setTimeout(() => {
          if (this.app.vscodeEngine && this.app.vscodeEngine.editorTextarea) {
            this.app.vscodeEngine.editorTextarea.value = res.content;
            this.app.vscodeEngine.updateLineNumbers();
          }
        }, 300);
      }
      return;
    }

    const openResult = await systemBridge.launch(fullPath);
    if (this.toasts) {
      this.toasts.show(openResult.success ? 'SUCCESS' : 'ERROR', openResult.success
        ? `Opened with OS default: ${fileObj.name}`
        : `Open failed: ${openResult.error || 'Unknown error'}`, 2500);
    }
  }

  showHologramImage(title, src) {
    this.imageZoom = 1;
    this.imageRot = 0;
    this.isMatrixFilter = false;

    if (this.container) {
      const modal = this.container.querySelector('#expImageModal');
      const titleEl = this.container.querySelector('#holoModalTitle');
      const imgEl = this.container.querySelector('#holoModalImg');

      if (modal && titleEl && imgEl) {
        titleEl.textContent = `HOLOGRAM IMAGE: ${title.toUpperCase()}`;
        imgEl.src = src;
        this.updateImageTransform();
        modal.classList.remove('hidden');
      }
    }
    if (this.sound) this.sound.playSuccessFanfare();
  }

  updateImageTransform() {
    if (!this.container) return;
    const imgEl = this.container.querySelector('#holoModalImg');
    const zoomVal = this.container.querySelector('#holoZoomVal');
    const rotVal = this.container.querySelector('#holoRotVal');
    const filterVal = this.container.querySelector('#holoFilterVal');

    if (imgEl) {
      imgEl.style.transform = `scale(${this.imageZoom}) rotate(${this.imageRot}deg)`;
      imgEl.style.filter = this.isMatrixFilter
        ? 'sepia(100%) hue-rotate(85deg) saturate(350%) drop-shadow(0 0 15px #00ff66)'
        : 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.8))';
    }

    if (zoomVal) zoomVal.textContent = `${Math.round(this.imageZoom * 100)}%`;
    if (rotVal) rotVal.textContent = `${this.imageRot}°`;
    if (filterVal) filterVal.textContent = this.isMatrixFilter ? 'MATRIX NEON' : 'NORMAL';
  }

  stopMedia() {
    if (this.previewAudio) {
      try {
        this.previewAudio.pause();
        this.previewAudio.src = '';
      } catch (error) {}
      this.previewAudio = null;
    }
  }

  destroy() {
    this.stopMedia();
  }

  goBack() {
    if (this.historyIdx > 0) {
      this.historyIdx--;
      this.navigateTo(this.history[this.historyIdx], false);
      if (this.sound) this.sound.playKey(false);
    }
  }

  goForward() {
    if (this.historyIdx < this.history.length - 1) {
      this.historyIdx++;
      this.navigateTo(this.history[this.historyIdx], false);
      if (this.sound) this.sound.playKey(false);
    }
  }

  goUp() {
    const sep = this.currentPath.includes('/') ? '/' : '\\';
    const parts = this.currentPath.split(/[/\\]/).filter(Boolean);
    if (parts.length > 1) {
      parts.pop();
      let parent = parts.join(sep);
      if (parts.length === 1 && parts[0].includes(':')) parent = `${parts[0]}\\`;
      this.navigateTo(parent, true);
      if (this.sound) this.sound.playKey(false);
    }
  }

  getFileIcon(f) {
    if (f.isDir) return '📁';
    const ext = f.name.split('.').pop().toLowerCase();
    switch (ext) {
      case 'exe': case 'bat': case 'cmd': case 'lnk': return '⚡';
      case 'png': case 'jpg': case 'jpeg': case 'svg': case 'gif': return '🖼️';
      case 'mp3': case 'wav': case 'ogg': return '🎵';
      case 'py': return '🐍';
      case 'js': case 'ts': return '📜';
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'json': return '📋';
      case 'cpp': case 'c': return '⚙️';
      case 'rs': return '🦀';
      case 'sql': return '🗄️';
      case 'enc': return '🔒';
      case 'pdf': return '📕';
      case 'zip': case 'rar': case '7z': return '📦';
      default: return '📄';
    }
  }

  getFileTypeDesc(f) {
    if (f.isDir) return 'File Folder';
    const ext = f.name.split('.').pop().toUpperCase();
    return `${ext} Document`;
  }

  formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}

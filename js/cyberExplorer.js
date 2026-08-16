/**
 * CYBER//TYPE REAL-WORLD FILE EXPLORER & STORAGE MATRIX ENGINE
 * Connects directly to host Windows/Linux filesystem.
 * Features:
 *   - Browse real drives (C:\, D:\, Desktop, Documents, Downloads).
 *   - Breadcrumb directory navigation with path history.
 *   - Interactive actions: Launch .exe programs, preview hologram images, stream audio, edit code in VS Code Studio.
 *   - File management: Create folder, delete, encrypt file (AES-256), search filter.
 */

import { systemBridge } from './systemBridge.js';

export class CyberExplorerEngine {
  constructor(app, soundEngine, toastManager) {
    this.app = app;
    this.sound = soundEngine;
    this.toasts = toastManager;

    this.container = null;
    this.currentPath = 'C:\\Users\\asus';
    this.history = ['C:\\Users\\asus'];
    this.historyIdx = 0;
    this.files = [];
    this.drives = [];
    this.searchQuery = '';
    this.selectedFile = null;
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
    await this.navigateTo(this.currentPath, false);
  }

  renderLayout() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="cyber-explorer-window" id="cyberExplorerWindow">
        <!-- 1. Top Navigation Bar -->
        <div class="explorer-header-bar">
          <div class="explorer-nav-controls">
            <button class="exp-nav-btn" id="expBtnBack" title="Back (Alt+Left)">◀</button>
            <button class="exp-nav-btn" id="expBtnForward" title="Forward (Alt+Right)">▶</button>
            <button class="exp-nav-btn" id="expBtnUp" title="Up to Parent Directory">▲</button>
            <button class="exp-nav-btn" id="expBtnRefresh" title="Refresh Directory">🔄</button>
          </div>

          <div class="explorer-breadcrumbs" id="expBreadcrumbs">
            <!-- Breadcrumbs path items rendered dynamically -->
          </div>

          <div class="explorer-search-box">
            <span class="search-icon">🔍</span>
            <input type="text" class="exp-search-input" id="expSearchInput" placeholder="Filter files..." />
          </div>

          <button class="exp-nav-btn exp-btn-exit" id="expBtnExit" title="Return to CLI Terminal">✕</button>
        </div>

        <!-- 2. Main Dual-Pane Explorer Body -->
        <div class="explorer-body-split">
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

        <!-- 3. Bottom Status Bar -->
        <div class="explorer-status-bar">
          <span id="expItemCount">0 items</span>
          <span class="status-sep">|</span>
          <span id="expSelectedInfo">No file selected</span>
          <span class="status-sep">|</span>
          <span class="status-glow">CYBER//FS DRIVER [ACTIVE]</span>
        </div>
      </div>

      <!-- Hologram Image Zoom Modal -->
      <div class="hologram-preview-modal hidden" id="expImageModal">
        <div class="holo-preview-card">
          <div class="holo-header">
            <span id="holoModalTitle">HOLOGRAM IMAGE PREVIEW</span>
            <button class="holo-close-btn" id="holoModalClose">✕</button>
          </div>
          <div class="holo-image-stage">
            <img id="holoModalImg" src="" alt="Preview" />
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    if (!this.container) return;

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
        this.renderFilesList();
      });
    }

    if (modalClose) {
      modalClose.addEventListener('click', () => {
        const modal = this.container.querySelector('#expImageModal');
        if (modal) modal.classList.add('hidden');
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

  async loadDrives() {
    const res = await systemBridge.getDrives();
    if (res && res.drives) {
      this.drives = res.drives;
    }

    const container = this.container.querySelector('#expQuickDrives');
    if (!container) return;

    let html = '';
    this.drives.forEach(d => {
      let icon = '💽';
      if (d.name.includes('Desktop')) icon = '🖥️';
      else if (d.name.includes('Documents')) icon = '📁';
      else if (d.name.includes('Downloads')) icon = '📥';

      html += `
        <div class="sidebar-drive-item" data-path="${d.path}">
          <span class="drive-icon">${icon}</span>
          <div class="drive-meta">
            <span class="drive-name">${d.name}</span>
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
    } else {
      this.files = [];
    }

    this.renderFilesList();
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
        <span class="crumb-item" data-path="${accumulated}">${p}</span>
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
        <div class="file-row ${f.isDir ? 'is-dir' : 'is-file'} ${isSelected ? 'selected' : ''}" data-name="${f.name}" data-isdir="${f.isDir}">
          <div class="col-name"><span class="f-icon">${icon}</span> <span class="f-name">${f.name}</span></div>
          <div class="col-size">${sizeStr}</div>
          <div class="col-type">${typeStr}</div>
          <div class="col-date">${dateStr}</div>
        </div>
      `;
    });

    listEl.innerHTML = html;

    // Click and Double Click Bindings
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

  handleFileOpen(fileObj) {
    if (!fileObj) return;

    const sep = this.currentPath.includes('/') ? '/' : '\\';
    const fullPath = `${this.currentPath}${sep}${fileObj.name}`;

    if (fileObj.isDir) {
      // Enter directory
      this.navigateTo(fullPath, true);
      if (this.sound) this.sound.playSuccessFanfare();
      return;
    }

    const nameLower = fileObj.name.toLowerCase();

    // 1. Executable / App ➔ Launch via Windows System Bridge
    if (nameLower.endsWith('.exe') || nameLower.endsWith('.bat') || nameLower.endsWith('.cmd') || nameLower.endsWith('.lnk')) {
      if (this.toasts) this.toasts.show('SUCCESS', `Executing binary: ${fileObj.name}...`, 2000);
      systemBridge.launch(fullPath);
      if (this.sound) this.sound.playSuccessFanfare();
      return;
    }

    // 2. Images ➔ Hologram Zoom Preview Modal
    if (nameLower.endsWith('.png') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.svg') || nameLower.endsWith('.gif')) {
      this.showHologramImage(fileObj.name, `file:///${fullPath.replace(/\\/g, '/')}`);
      return;
    }

    // 3. Audio ➔ Stream into CyberBrowser / Player
    if (nameLower.endsWith('.mp3') || nameLower.endsWith('.wav') || nameLower.endsWith('.ogg')) {
      if (this.toasts) this.toasts.show('SUCCESS', `Streaming Cyber Audio: ${fileObj.name}`, 2500);
      if (this.app.launchBrowserMode) {
        this.app.launchBrowserMode(`file:///${fullPath.replace(/\\/g, '/')}`);
      }
      return;
    }

    // 4. Code & Scripts ➔ Open in built-in VS Code Studio
    if (nameLower.endsWith('.py') || nameLower.endsWith('.js') || nameLower.endsWith('.html') || nameLower.endsWith('.css') || nameLower.endsWith('.json') || nameLower.endsWith('.cpp') || nameLower.endsWith('.rs') || nameLower.endsWith('.sql') || nameLower.endsWith('.txt')) {
      systemBridge.readFile(fullPath).then(res => {
        if (res && res.content !== undefined) {
          if (this.app.launchVscodeMode) {
            let lang = 'python';
            if (nameLower.endsWith('.html')) lang = 'html';
            else if (nameLower.endsWith('.cpp')) lang = 'cpp';
            else if (nameLower.endsWith('.rs')) lang = 'rust';
            else if (nameLower.endsWith('.sql')) lang = 'sql';
            else if (nameLower.endsWith('.js')) lang = 'bash';

            this.app.launchVscodeMode(lang);
            setTimeout(() => {
              if (this.app.vscodeEngine && this.app.vscodeEngine.editorTextarea) {
                this.app.vscodeEngine.editorTextarea.value = res.content;
                this.app.vscodeEngine.updateLineNumbers();
              }
            }, 300);
          }
        }
      });
      return;
    }

    // 5. Default Fallback ➔ Launch with OS default
    systemBridge.launch(fullPath);
    if (this.toasts) this.toasts.show('SUCCESS', `Opened with OS default: ${fileObj.name}`, 2000);
  }

  showHologramImage(title, src) {
    const modal = this.container.querySelector('#expImageModal');
    const titleEl = this.container.querySelector('#holoModalTitle');
    const imgEl = this.container.querySelector('#holoModalImg');

    if (modal && titleEl && imgEl) {
      titleEl.textContent = `HOLOGRAM IMAGE: ${title.toUpperCase()}`;
      imgEl.src = src;
      modal.classList.remove('hidden');
      if (this.sound) this.sound.playSuccessFanfare();
    }
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
      case 'exe': case 'bat': case 'cmd': return '⚡';
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
}

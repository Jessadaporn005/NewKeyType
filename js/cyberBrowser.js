/**
 * CYBER//TYPE IN-APP CYBER BROWSER ENGINE
 * Embedded Chromium Webview & Sandbox Browser for in-application web surfing (YouTube, Google, FB, IG, GitHub).
 * Includes Address Bar, Cyber Bookmarks, Navigation Controls & Picture-in-Picture (PIP) Floating Mode.
 */

export const BROWSER_BOOKMARKS = [
  { id: 'yt', name: 'YouTube', icon: '🎬', url: 'https://www.youtube.com', color: '#ff0000' },
  { id: 'google', name: 'Google', icon: '🔍', url: 'https://www.google.com', color: '#4285f4' },
  { id: 'github', name: 'GitHub', icon: '🐙', url: 'https://github.com', color: '#ffffff' },
  { id: 'chatgpt', name: 'ChatGPT', icon: '💬', url: 'https://chatgpt.com', color: '#10a37f' },
  { id: 'fb', name: 'Facebook', icon: '📘', url: 'https://www.facebook.com', color: '#1877f2' },
  { id: 'ig', name: 'Instagram', icon: '📸', url: 'https://www.instagram.com', color: '#e4405f' },
  { id: 'reddit', name: 'Reddit', icon: '🤖', url: 'https://www.reddit.com', color: '#ff4500' },
  { id: 'wiki', name: 'Wikipedia', icon: '📖', url: 'https://www.wikipedia.org', color: '#a0a0a0' }
];

export class CyberBrowserEngine {
  constructor(app, soundEngine) {
    this.app = app;
    this.sound = soundEngine;

    this.container = null;
    this.currentUrl = 'https://www.google.com';
    this.history = [];
    this.historyIndex = -1;
    this.isPipMode = false;

    this.webviewEl = null;
    this.urlInput = null;
    this.statusIndicator = null;
  }

  init(containerEl) {
    this.container = containerEl;
    this.renderLayout();
  }

  renderLayout() {
    if (!this.container) return;

    let bookmarkPillsHtml = '';
    BROWSER_BOOKMARKS.forEach(bm => {
      bookmarkPillsHtml += `
        <button class="cyber-bm-pill" data-url="${bm.url}">
          <span class="bm-icon">${bm.icon}</span>
          <span class="bm-name">${bm.name}</span>
        </button>
      `;
    });

    this.container.innerHTML = `
      <div class="cyber-browser-window" id="cyberBrowserWindow">
        <!-- Top Browser Navigation Bar -->
        <div class="browser-chrome-bar">
          <div class="browser-nav-btns">
            <button class="b-btn" id="bBtnBack" title="Back">◀</button>
            <button class="b-btn" id="bBtnForward" title="Forward">▶</button>
            <button class="b-btn" id="bBtnReload" title="Reload">🔄</button>
            <button class="b-btn" id="bBtnHome" title="Home">🏠</button>
          </div>

          <!-- Smart Cyber Address Bar -->
          <div class="browser-address-container">
            <span class="addr-lock-icon">🔒</span>
            <input type="text" class="browser-address-input" id="browserAddressInput" placeholder="Enter URL or search Google / YouTube..." value="${this.currentUrl}" />
            <button class="b-btn-go" id="bBtnGo">GO ➔</button>
          </div>

          <!-- Window & Mode Controls -->
          <div class="browser-window-controls">
            <button class="b-btn b-btn-pip" id="bBtnPip" title="Picture-in-Picture Floating Mode">🗗 PIP</button>
            <button class="b-btn b-btn-close" id="bBtnClose" title="Close Browser [ESC]">✖</button>
          </div>
        </div>

        <!-- Cyber Speed-Dial Bookmarks Bar -->
        <div class="browser-bookmarks-bar">
          <span class="bm-label">⚡ SPEED-DIAL:</span>
          ${bookmarkPillsHtml}
        </div>

        <!-- Main Web Content Viewport -->
        <div class="browser-viewport" id="browserViewport">
          <div class="browser-loading-bar hidden" id="browserLoadingBar"></div>
          <!-- Webview / Iframe inserted dynamically -->
        </div>

        <!-- Bottom Browser Status Bar -->
        <div class="browser-status-bar">
          <span class="b-status-txt" id="bStatusTxt">READY // SECURE CHROMIUM SSL ENCRYPTED</span>
          <span class="b-security-badge">DEFCON-1 CYBER BROWSER</span>
        </div>
      </div>
    `;

    this.urlInput = this.container.querySelector('#browserAddressInput');
    this.statusIndicator = this.container.querySelector('#bStatusTxt');

    this.bindEvents();
    this.createWebView(this.currentUrl);
  }

  createWebView(url) {
    if (!this.container) return;
    const viewport = this.container.querySelector('#browserViewport');
    if (!viewport) return;

    viewport.innerHTML = `
      <div class="browser-loading-bar" id="browserLoadingBar"></div>
    `;

    const isElectron = this.app.sys && this.app.sys.isElectron;

    if (isElectron) {
      // Electron native <webview> tag (Full Chromium video/audio support)
      const webview = document.createElement('webview');
      webview.className = 'cyber-webview-frame';
      webview.src = url;
      webview.setAttribute('allowpopups', 'true');
      webview.setAttribute('webpreferences', 'contextIsolation=false');

      webview.addEventListener('did-start-loading', () => {
        const bar = this.container.querySelector('#browserLoadingBar');
        if (bar) bar.classList.remove('hidden');
        if (this.statusIndicator) this.statusIndicator.textContent = `CONNECTING: ${url}...`;
      });

      webview.addEventListener('did-stop-loading', () => {
        const bar = this.container.querySelector('#browserLoadingBar');
        if (bar) bar.classList.add('hidden');
        this.currentUrl = webview.getURL() || url;
        if (this.urlInput) this.urlInput.value = this.currentUrl;
        if (this.statusIndicator) this.statusIndicator.textContent = `ONLINE: ${this.currentUrl}`;
      });

      viewport.appendChild(webview);
      this.webviewEl = webview;
    } else {
      // Browser fallback <iframe>
      const iframe = document.createElement('iframe');
      iframe.className = 'cyber-webview-frame';
      iframe.src = url;
      iframe.setAttribute('allow', 'autoplay; camera; microphone; encrypted-media; fullscreen');
      iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';

      iframe.onload = () => {
        const bar = this.container.querySelector('#browserLoadingBar');
        if (bar) bar.classList.add('hidden');
        if (this.statusIndicator) this.statusIndicator.textContent = `CONNECTED: ${url}`;
      };

      viewport.appendChild(iframe);
      this.webviewEl = iframe;
    }
  }

  bindEvents() {
    // Navigation Buttons
    const btnBack = this.container.querySelector('#bBtnBack');
    const btnFwd = this.container.querySelector('#bBtnForward');
    const btnReload = this.container.querySelector('#bBtnReload');
    const btnHome = this.container.querySelector('#bBtnHome');
    const btnGo = this.container.querySelector('#bBtnGo');
    const btnPip = this.container.querySelector('#bBtnPip');
    const btnClose = this.container.querySelector('#bBtnClose');

    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (this.webviewEl && this.webviewEl.canGoBack && this.webviewEl.canGoBack()) {
          this.webviewEl.goBack();
        }
      });
    }

    if (btnFwd) {
      btnFwd.addEventListener('click', () => {
        if (this.webviewEl && this.webviewEl.canGoForward && this.webviewEl.canGoForward()) {
          this.webviewEl.goForward();
        }
      });
    }

    if (btnReload) {
      btnReload.addEventListener('click', () => {
        if (this.webviewEl && this.webviewEl.reload) {
          this.webviewEl.reload();
        } else if (this.webviewEl) {
          this.webviewEl.src = this.currentUrl;
        }
        if (this.sound) this.sound.playKey(false);
      });
    }

    if (btnHome) {
      btnHome.addEventListener('click', () => {
        this.navigate('https://www.google.com');
      });
    }

    if (btnGo && this.urlInput) {
      btnGo.addEventListener('click', () => {
        this.navigate(this.urlInput.value);
      });
    }

    if (this.urlInput) {
      this.urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.navigate(this.urlInput.value);
        }
      });
    }

    if (btnPip) {
      btnPip.addEventListener('click', () => {
        this.togglePipMode();
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        this.closeBrowser();
      });
    }

    // Bookmark pills click
    const pills = this.container.querySelectorAll('.cyber-bm-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const url = pill.dataset.url;
        this.navigate(url);
        if (this.sound) this.sound.playKey(false);
      });
    });
  }

  navigate(rawInput) {
    if (!rawInput) return;
    let target = rawInput.trim();

    // Smart URL parsing
    if (target.startsWith('yt ') || target.startsWith('youtube ')) {
      const q = target.replace(/^(yt|youtube)\s+/, '');
      target = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
    } else if (target.startsWith('google ') || target.startsWith('g ')) {
      const q = target.replace(/^(google|g)\s+/, '');
      target = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    } else if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      }
    }

    this.currentUrl = target;
    if (this.urlInput) this.urlInput.value = target;

    if (this.webviewEl) {
      this.webviewEl.src = target;
    } else {
      this.createWebView(target);
    }

    if (this.sound) this.sound.playSuccessFanfare();
  }

  togglePipMode() {
    const win = this.container.querySelector('#cyberBrowserWindow');
    if (!win) return;

    this.isPipMode = !this.isPipMode;
    if (this.isPipMode) {
      win.classList.add('pip-floating-mode');
    } else {
      win.classList.remove('pip-floating-mode');
    }

    if (this.sound) this.sound.playKey(false);
  }

  openBrowser(initialUrl = 'https://www.google.com') {
    if (!this.container) return;
    this.container.classList.remove('hidden');
    this.navigate(initialUrl);
  }

  closeBrowser() {
    if (!this.container) return;
    this.container.classList.add('hidden');
    this.isPipMode = false;
    const win = this.container.querySelector('#cyberBrowserWindow');
    if (win) win.classList.remove('pip-floating-mode');
    this.app.returnToCli();
  }
}

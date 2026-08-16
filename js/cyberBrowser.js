/**
 * CYBER//TYPE IN-APP CYBER BROWSER ENGINE (PERSISTENT & BACKGROUND MEDIA READY)
 * Embedded Chromium Webview & Sandbox Browser for in-application web surfing (YouTube, Google, FB, IG, GitHub).
 * Supports 3 Display Modes:
 *   1. FULL: Full workspace browser.
 *   2. PIP: Floating Picture-in-Picture window (440x275px) that persists across all game modes.
 *   3. MARQUEE: Floating compact audio ticker pill (280x44px) with animated Equalizer waves for background music.
 * Clean Audio Stream Lifecycle Termination on Close & Mute/Unmute toggle.
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

export const BROWSER_STATES = {
  CLOSED: 'CLOSED',
  FULL: 'FULL',
  PIP: 'PIP',
  MARQUEE: 'MARQUEE'
};

export class CyberBrowserEngine {
  constructor(app, soundEngine) {
    this.app = app;
    this.sound = soundEngine;

    this.container = null;
    this.currentUrl = 'https://www.google.com';
    this.state = BROWSER_STATES.CLOSED;
    this.isMuted = false;

    this.webviewEl = null;
    this.urlInput = null;
    this.statusIndicator = null;
    this.marqueeTitle = null;
    this.btnMute = null;
    this.mBtnMute = null;
  }

  init(containerEl) {
    // Mount to top-level #cyberBrowserHost on body so it stays persistent across all view switches
    let host = document.getElementById('cyberBrowserHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'cyberBrowserHost';
      host.className = 'cyber-browser-host hidden';
      document.body.appendChild(host);
    }
    this.container = host;
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
      <div class="cyber-browser-window state-full" id="cyberBrowserWindow">
        <!-- 1. Top Browser Navigation Bar (Full & PIP Modes) -->
        <div class="browser-chrome-bar" id="browserChromeBar">
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

          <!-- Window Mode Controls -->
          <div class="browser-window-controls">
            <button class="b-btn b-btn-mute" id="bBtnMute" title="Toggle Audio Mute">🔊 MUTE</button>
            <button class="b-btn b-btn-marquee" id="bBtnMarquee" title="Minimize to Audio Marquee Bar">➖ BAR</button>
            <button class="b-btn b-btn-pip" id="bBtnPip" title="Picture-in-Picture Floating Mode">🗗 PIP</button>
            <button class="b-btn b-btn-full" id="bBtnFull" title="Expand Fullscreen">🗖 FULL</button>
            <button class="b-btn b-btn-close" id="bBtnClose" title="Close Browser & Stop Audio [ESC]">✖</button>
          </div>
        </div>

        <!-- 2. Cyber Speed-Dial Bookmarks Bar (Full Mode) -->
        <div class="browser-bookmarks-bar" id="browserBookmarksBar">
          <span class="bm-label">⚡ SPEED-DIAL:</span>
          ${bookmarkPillsHtml}
        </div>

        <!-- 3. Main Web Content Viewport (Persistent Chromium Frame) -->
        <div class="browser-viewport" id="browserViewport">
          <div class="browser-loading-bar hidden" id="browserLoadingBar"></div>
          <!-- Webview / Iframe stays permanently mounted here -->
        </div>

        <!-- 4. Bottom Browser Status Bar (Full Mode) -->
        <div class="browser-status-bar" id="browserStatusBar">
          <span class="b-status-txt" id="bStatusTxt">READY // SECURE CHROMIUM SSL ENCRYPTED</span>
          <span class="b-security-badge">DEFCON-1 CYBER BROWSER</span>
        </div>

        <!-- 5. Compact Floating Audio Marquee Ticker (Marquee Mode) -->
        <div class="browser-marquee-ticker" id="browserMarqueeTicker">
          <div class="marquee-audio-wave">
            <span class="eq-bar bar-1"></span>
            <span class="eq-bar bar-2"></span>
            <span class="eq-bar bar-3"></span>
            <span class="eq-bar bar-4"></span>
          </div>
          <div class="marquee-info">
            <span class="marquee-tag">NOW STREAMING:</span>
            <span class="marquee-title" id="marqueeMediaTitle">YouTube / CyberDeck Media</span>
          </div>
          <div class="marquee-actions">
            <button class="m-btn m-btn-mute" id="mBtnMute" title="Toggle Audio Mute">🔊</button>
            <button class="m-btn" id="mBtnPip" title="Expand to Floating PIP Window">🗗 PIP</button>
            <button class="m-btn" id="mBtnFull" title="Expand to Fullscreen Browser">🗖 FULL</button>
            <button class="m-btn m-btn-close" id="mBtnClose" title="Close Media Player & Stop Audio">✖</button>
          </div>
        </div>
      </div>
    `;

    this.urlInput = this.container.querySelector('#browserAddressInput');
    this.statusIndicator = this.container.querySelector('#bStatusTxt');
    this.marqueeTitle = this.container.querySelector('#marqueeMediaTitle');
    this.btnMute = this.container.querySelector('#bBtnMute');
    this.mBtnMute = this.container.querySelector('#mBtnMute');

    this.bindEvents();
    // WebView will only be instantiated when openBrowser() is invoked by user
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
        if (this.marqueeTitle) {
          const title = webview.getTitle ? webview.getTitle() : this.currentUrl;
          this.marqueeTitle.textContent = title || this.currentUrl;
        }
      });

      webview.addEventListener('page-title-updated', (e) => {
        if (this.marqueeTitle && e.title) {
          this.marqueeTitle.textContent = e.title;
        }
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
        if (this.marqueeTitle) this.marqueeTitle.textContent = url;
      };

      viewport.appendChild(iframe);
      this.webviewEl = iframe;
    }
  }

  bindEvents() {
    const btnBack = this.container.querySelector('#bBtnBack');
    const btnFwd = this.container.querySelector('#bBtnForward');
    const btnReload = this.container.querySelector('#bBtnReload');
    const btnHome = this.container.querySelector('#bBtnHome');
    const btnGo = this.container.querySelector('#bBtnGo');
    const btnMute = this.container.querySelector('#bBtnMute');
    const btnMarquee = this.container.querySelector('#bBtnMarquee');
    const btnPip = this.container.querySelector('#bBtnPip');
    const btnFull = this.container.querySelector('#bBtnFull');
    const btnClose = this.container.querySelector('#bBtnClose');

    const mBtnMute = this.container.querySelector('#mBtnMute');
    const mBtnPip = this.container.querySelector('#mBtnPip');
    const mBtnFull = this.container.querySelector('#mBtnFull');
    const mBtnClose = this.container.querySelector('#mBtnClose');

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

    // Audio Mute Toggle
    if (btnMute) btnMute.addEventListener('click', () => this.toggleMute());
    if (mBtnMute) mBtnMute.addEventListener('click', () => this.toggleMute());

    // State Transitions
    if (btnMarquee) btnMarquee.addEventListener('click', () => this.setState(BROWSER_STATES.MARQUEE));
    if (btnPip) btnPip.addEventListener('click', () => this.setState(BROWSER_STATES.PIP));
    if (btnFull) btnFull.addEventListener('click', () => this.setState(BROWSER_STATES.FULL));
    if (btnClose) btnClose.addEventListener('click', () => this.closeBrowser());

    if (mBtnPip) mBtnPip.addEventListener('click', () => this.setState(BROWSER_STATES.PIP));
    if (mBtnFull) mBtnFull.addEventListener('click', () => this.setState(BROWSER_STATES.FULL));
    if (mBtnClose) mBtnClose.addEventListener('click', () => this.closeBrowser());

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

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.webviewEl && this.webviewEl.setAudioMuted) {
      this.webviewEl.setAudioMuted(this.isMuted);
    }

    if (this.container) {
      const btnMute = this.container.querySelector('#bBtnMute');
      const mBtnMute = this.container.querySelector('#mBtnMute');

      if (btnMute) {
        btnMute.textContent = this.isMuted ? '🔇 UNMUTE' : '🔊 MUTE';
        btnMute.classList.toggle('muted-active', this.isMuted);
      }
      if (mBtnMute) {
        mBtnMute.textContent = this.isMuted ? '🔇' : '🔊';
        mBtnMute.classList.toggle('muted-active', this.isMuted);
      }
    }

    if (this.sound) this.sound.playKey(false);
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
    if (this.marqueeTitle) this.marqueeTitle.textContent = target;

    if (this.webviewEl) {
      this.webviewEl.src = target;
    } else {
      this.createWebView(target);
    }

    if (this.sound) this.sound.playKey(false);
  }

  terminateMediaStream() {
    if (this.webviewEl) {
      if (this.webviewEl.stop) {
        try { this.webviewEl.stop(); } catch(e) {}
      }
      this.webviewEl.src = 'about:blank';
    }
    this.currentUrl = 'about:blank';
    if (this.urlInput) this.urlInput.value = '';
    if (this.marqueeTitle) this.marqueeTitle.textContent = 'Media Terminated';
    if (this.statusIndicator) this.statusIndicator.textContent = 'DISCONNECTED // AUDIO TERMINATED';
  }

  setState(newState) {
    this.state = newState;

    if (newState === BROWSER_STATES.CLOSED) {
      this.terminateMediaStream(); // 100% kill all audio and video playback

      if (this.container) {
        this.container.classList.add('hidden');
      }
      if (this.app.state === 'MODE_BROWSER') {
        this.app.state = 'CLI_PROMPT';
      }
      if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      if (typeof window !== 'undefined' && typeof window.focus === 'function') {
        window.focus();
      }
      if (this.app.focusCliInput) this.app.focusCliInput();
      return;
    }

    if (!this.container) return;

    const win = this.container.querySelector('#cyberBrowserWindow');
    if (!win) return;

    this.container.classList.remove('hidden');
    win.classList.remove('state-full', 'state-pip', 'state-marquee');

    if (newState === BROWSER_STATES.FULL) {
      win.classList.add('state-full');
      this.app.state = 'MODE_BROWSER';
      if (this.sound) this.sound.playKey(false);
    } else if (newState === BROWSER_STATES.PIP || newState === BROWSER_STATES.MARQUEE) {
      if (newState === BROWSER_STATES.PIP) {
        win.classList.add('state-pip');
      } else {
        win.classList.add('state-marquee');
      }
      if (this.sound) this.sound.playKey(false);

      // Return application state to CLI or background mode so keyboard input is not trapped
      if (this.app.state === 'MODE_BROWSER') {
        this.app.state = 'CLI_PROMPT';
      }

      if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      if (typeof window !== 'undefined' && typeof window.focus === 'function') {
        window.focus();
      }

      if (this.app.state === 'CLI_PROMPT') {
        this.app.focusCliInput();
      }
    }
  }

  openBrowser(initialUrl = 'https://www.google.com', targetState = BROWSER_STATES.FULL) {
    if (!this.container) return;
    this.setState(targetState);
    const destination = (initialUrl && initialUrl !== 'about:blank') ? initialUrl : 'https://www.google.com';
    this.navigate(destination);
  }

  closeBrowser() {
    this.setState(BROWSER_STATES.CLOSED);
    if (this.app.tabManager) {
      const activeTab = this.app.tabManager.tabs.find(t => t.id === this.app.tabManager.activeTabId);
      if (activeTab && activeTab.type === 'browser') {
        this.app.tabManager.closeTab(activeTab.id);
        return;
      }
    }

    if (this.app.state === 'MODE_BROWSER') {
      this.app.returnToCli();
    } else {
      if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      if (typeof window !== 'undefined' && typeof window.focus === 'function') {
        window.focus();
      }
      if (this.app.focusCliInput) this.app.focusCliInput();
    }
  }
}

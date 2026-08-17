/**
 * CYBER//TYPE TITLE BAR MULTI-TAB SESSION MANAGER
 * Manages multiple dynamic tabs in the Windows 11 title bar.
 * Supports:
 *   - Creating new terminal or subsystem sessions (+ button / Ctrl+T)
 *   - Shell Profile Dropdown menu (⌄ button) for spawning Browser, VS Code, Roguelite, Academy, Speed
 *   - Switching between active tabs with correct view state routing ('cli', 'vscode', 'browser', etc.)
 *   - Closing tabs (✕ button / Ctrl+W)
 *   - Session state persistence (Command history & input buffers)
 */

export const TAB_TYPES = {
  CLI: { id: 'cli', name: 'CyberDeck', icon: '>_', mode: 'CLI_PROMPT' },
  TRADING: { id: 'trading', name: 'AI Trading Terminal', icon: '📈', mode: 'MODE_TRADING' },
  WIFI: { id: 'wifi', name: 'Cyber Wi-Fi Radar', icon: '📡', mode: 'MODE_WIFI' },
  EXPLORER: { id: 'explorer', name: 'Cyber Explorer', icon: '📂', mode: 'MODE_EXPLORER' },
  TASKMGR: { id: 'taskmgr', name: 'Task Manager', icon: '📊', mode: 'MODE_TASKMGR' },
  RADIO: { id: 'radio', name: 'Cyber Radio', icon: '🎵', mode: 'MODE_RADIO' },
  BROWSER: { id: 'browser', name: 'In-App Browser', icon: '🌐', mode: 'MODE_BROWSER' },
  VSCODE: { id: 'vscode', name: 'VS Code Studio', icon: '⚡', mode: 'MODE_VSCODE' },
  ROGUELITE: { id: 'roguelite', name: 'Cyberspace Matrix', icon: '🎮', mode: 'MODE_ROGUELITE' },
  ACADEMY: { id: 'academy', name: 'Touch Academy', icon: '🎓', mode: 'MODE_ACADEMY' },
  SPEED: { id: 'speed', name: 'Speed Benchmark', icon: '⚡', mode: 'MODE_SPEED' },
  HACKER: { id: 'hacker', name: 'Hacker Sim', icon: '💻', mode: 'MODE_HACKER' }
};

export class TabManager {
  constructor(app, soundEngine) {
    this.app = app;
    this.sound = soundEngine;

    this.tabs = [];
    this.activeTabId = null;
    this.tabCounter = 1;

    this.tabStripEl = null;
    this.addBtnEl = null;
    this.dropdownBtnEl = null;
    this.dropdownMenuEl = null;
  }

  init() {
    this.tabStripEl = document.getElementById('tabStrip');
    this.addBtnEl = document.getElementById('tabAddBtn');
    this.dropdownBtnEl = document.getElementById('tabDropdownBtn');

    // Create the default initial tab
    this.createTab(TAB_TYPES.CLI, 'CyberDeck', true);

    this.bindEvents();
  }

  bindEvents() {
    if (this.addBtnEl) {
      this.addBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.tabCounter++;
        this.createTab(TAB_TYPES.CLI, `CyberDeck (${this.tabCounter})`, true);
        if (this.sound && typeof this.sound.playKey === 'function') this.sound.playKey(false);
      });
    }

    if (this.dropdownBtnEl) {
      this.dropdownBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdownMenu();
        if (this.sound && typeof this.sound.playKey === 'function') this.sound.playKey(false);
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (this.dropdownMenuEl && !this.dropdownMenuEl.contains(e.target) && e.target !== this.dropdownBtnEl) {
        this.closeDropdownMenu();
      }
    });
  }

  createTab(tabType = TAB_TYPES.CLI, title = null, activateImmediately = true) {
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const tabName = title || tabType.name;

    const newTab = {
      id: tabId,
      type: tabType.id,
      title: tabName,
      icon: tabType.icon,
      mode: tabType.mode,
      historyHtml: '',
      inputBuffer: '',
      asset: tabType.id === 'trading' ? 'BTC/USDT' : null,
      url: tabType.id === 'browser' ? 'https://www.google.com' : null,
      createdAt: Date.now()
    };

    this.tabs.push(newTab);
    this.renderTabs();

    if (activateImmediately) {
      this.switchTab(tabId);
    }

    return newTab;
  }

  switchTab(tabId) {
    const targetTab = this.tabs.find(t => t.id === tabId);
    if (!targetTab) return;

    // 1. Save current active tab's specific state before leaving
    const currentTab = this.tabs.find(t => t.id === this.activeTabId);
    if (currentTab) {
      if (currentTab.type === 'cli' && this.app.dom && this.app.dom.cliHistory) {
        currentTab.historyHtml = this.app.dom.cliHistory.innerHTML;
        currentTab.inputBuffer = this.app.cliInputBuffer || '';
      } else if (currentTab.type === 'trading' && this.app.tradingEngine) {
        currentTab.asset = this.app.tradingEngine.currentAsset || 'BTC/USDT';
      } else if (currentTab.type === 'browser' && this.app.browserEngine) {
        currentTab.url = this.app.browserEngine.currentUrl;
      }
    }

    this.activeTabId = tabId;
    this.renderTabs();

    // 2. Hide browser overlay if leaving browser mode
    if (targetTab.type !== 'browser' && this.app.browserEngine && this.app.browserEngine.container) {
      this.app.browserEngine.container.classList.add('hidden');
    }

    // 3. Switch view state and activate target tab's engine seamlessly
    if (targetTab.type === 'cli') {
      this.app.state = 'CLI_PROMPT';
      if (typeof this.app.switchViewState === 'function') {
        this.app.switchViewState('cli');
      }
      if (this.app.dom && this.app.dom.cliHistory) {
        this.app.dom.cliHistory.innerHTML = targetTab.historyHtml !== undefined ? targetTab.historyHtml : '';
      }
      this.app.cliInputBuffer = targetTab.inputBuffer || '';
      this.app.cliCursorPos = (targetTab.inputBuffer || '').length;
      if (typeof this.app.renderCliPrompt === 'function') this.app.renderCliPrompt();
      if (typeof this.app.focusCliInput === 'function') this.app.focusCliInput();
    } else if (targetTab.type === 'trading') {
      this.app.state = 'MODE_TRADING';
      if (typeof this.app.switchViewState === 'function') {
        this.app.switchViewState('trading');
      }
      if (this.app.tradingEngine) {
        if (targetTab.asset) this.app.tradingEngine.setAsset(targetTab.asset);
        this.app.tradingEngine.resizeCanvas();
      }
    } else if (targetTab.type === 'browser') {
      this.app.state = 'MODE_BROWSER';
      if (typeof this.app.switchViewState === 'function') {
        this.app.switchViewState('browser');
      }
      if (this.app.browserEngine) {
        if (this.app.browserEngine.container) {
          this.app.browserEngine.container.classList.remove('hidden');
        }
        if (this.app.browserEngine.state === 'CLOSED') {
          this.app.browserEngine.openBrowser(targetTab.url || 'https://www.google.com', 'FULL');
        } else {
          this.app.browserEngine.setState('FULL');
          if (targetTab.url && this.app.browserEngine.currentUrl !== targetTab.url) {
            this.app.browserEngine.navigate(targetTab.url);
          }
        }
      }
    } else if (targetTab.type === 'wifi') {
      this.app.state = 'MODE_WIFI';
      if (typeof this.app.switchViewState === 'function') this.app.switchViewState('wifi');
      if (this.app.wifiEngine && this.app.dom && this.app.dom.views && this.app.dom.views.wifi) {
        this.app.wifiEngine.init(this.app.dom.views.wifi);
      }
    } else if (targetTab.type === 'explorer') {
      this.app.state = 'MODE_EXPLORER';
      if (typeof this.app.switchViewState === 'function') this.app.switchViewState('explorer');
      if (this.app.explorer && this.app.dom && this.app.dom.views && this.app.dom.views.explorer) {
        this.app.explorer.init(this.app.dom.views.explorer);
      }
    } else if (targetTab.type === 'taskmgr') {
      this.app.state = 'MODE_TASKMGR';
      if (typeof this.app.switchViewState === 'function') this.app.switchViewState('taskmgr');
      if (this.app.taskManager && this.app.dom && this.app.dom.views && this.app.dom.views.taskmgr) {
        this.app.taskManager.init(this.app.dom.views.taskmgr);
      }
    } else if (targetTab.type === 'radio') {
      this.app.state = 'MODE_RADIO';
      if (typeof this.app.switchViewState === 'function') this.app.switchViewState('radio');
      if (this.app.radioEngine && this.app.dom && this.app.dom.views && this.app.dom.views.radio) {
        this.app.radioEngine.init(this.app.dom.views.radio);
      }
    } else if (targetTab.type === 'vscode') {
      this.app.state = 'MODE_VSCODE';
      if (typeof this.app.switchViewState === 'function') this.app.switchViewState('vscode');
      if (this.app.vscodeEngine && this.app.dom && this.app.dom.views && this.app.dom.views.vscode) {
        this.app.vscodeEngine.init(this.app.dom.views.vscode);
      }
    } else if (targetTab.type === 'roguelite') {
      this.app.state = 'MODE_ROGUELITE';
      if (typeof this.app.switchViewState === 'function') this.app.switchViewState('roguelite');
      if (this.app.rogueliteEngine && this.app.dom && this.app.dom.views && this.app.dom.views.roguelite) {
        this.app.rogueliteEngine.init(this.app.dom.views.roguelite);
      }
    } else if (targetTab.type === 'academy') {
      this.app.state = 'MODE_ACADEMY';
      if (typeof this.app.switchViewState === 'function') this.app.switchViewState('academy');
    } else if (targetTab.type === 'speed') {
      this.app.state = 'MODE_SPEED';
      if (typeof this.app.switchViewState === 'function') this.app.switchViewState('speed');
    } else if (targetTab.type === 'hacker') {
      this.app.state = 'MODE_HACKER';
      if (typeof this.app.switchViewState === 'function') this.app.switchViewState('hacker');
    }

    if (this.sound && typeof this.sound.playKey === 'function') this.sound.playKey(false);
  }

  syncActiveTabFromMode(targetMode, details = null) {
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    if (!activeTab) return;

    const tabType = Object.values(TAB_TYPES).find(t => t.id === targetMode || t.mode === targetMode) || TAB_TYPES.CLI;
    activeTab.type = tabType.id;
    activeTab.mode = tabType.mode;
    activeTab.icon = tabType.icon;

    if (tabType.id === 'trading') {
      const asset = details || (this.app.tradingEngine ? this.app.tradingEngine.currentAsset : 'BTC/USDT');
      activeTab.title = `Trade (${asset})`;
      activeTab.asset = asset;
    } else if (tabType.id === 'browser') {
      activeTab.title = details || 'In-App Browser';
      activeTab.url = details || 'https://www.google.com';
    } else if (tabType.id === 'vscode') {
      activeTab.title = details ? `Code (${details})` : 'VS Code Studio';
    } else if (tabType.id === 'speed') {
      activeTab.title = details ? `Speed (${details}s)` : 'Speed Rush';
    } else if (tabType.id === 'academy') {
      activeTab.title = details ? `Academy (Lvl ${details})` : 'Touch Academy';
    } else if (tabType.id === 'cli') {
      activeTab.title = activeTab.title.includes('CyberDeck') ? activeTab.title : 'CyberDeck';
    } else {
      activeTab.title = tabType.name;
    }

    this.renderTabs();
  }

  updateActiveTabInfo(typeId, title = null, icon = null) {
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    if (!activeTab) return;

    activeTab.type = typeId;
    if (title) activeTab.title = title;
    if (icon) activeTab.icon = icon;
    this.renderTabs();
  }

  closeTab(tabId, e) {
    if (e) e.stopPropagation();

    if (this.tabs.length <= 1) {
      // If only 1 tab left, reset to clean terminal instead of closing window
      const tab = this.tabs[0];
      tab.title = 'CyberDeck';
      tab.type = 'cli';
      tab.icon = '>_';
      tab.mode = 'CLI_PROMPT';
      tab.historyHtml = '';
      tab.inputBuffer = '';
      if (this.app.dom && this.app.dom.cliHistory) this.app.dom.cliHistory.innerHTML = '';
      this.switchTab(tab.id);
      if (this.sound && typeof this.sound.playSuccessFanfare === 'function') this.sound.playSuccessFanfare();
      return;
    }

    const idx = this.tabs.findIndex(t => t.id === tabId);
    if (idx === -1) return;

    const closingTab = this.tabs[idx];
    if (closingTab && closingTab.type === 'browser' && this.app.browserEngine) {
      this.app.browserEngine.terminateMediaStream();
      if (this.app.browserEngine.container) {
        this.app.browserEngine.container.classList.add('hidden');
      }
    }

    this.tabs.splice(idx, 1);

    // If active tab was closed, switch to adjacent tab
    if (this.activeTabId === tabId) {
      const nextTab = this.tabs[Math.max(0, idx - 1)];
      if (nextTab) {
        this.switchTab(nextTab.id);
      }
    } else {
      this.renderTabs();
    }

    if (this.sound && typeof this.sound.playKey === 'function') this.sound.playKey(false);
  }

  renderTabs() {
    if (!this.tabStripEl) return;

    this.tabStripEl.innerHTML = '';

    this.tabs.forEach(tab => {
      const isActive = tab.id === this.activeTabId;
      const tabEl = document.createElement('div');
      tabEl.className = `terminal-tab ${isActive ? 'active' : ''}`;
      tabEl.dataset.tabId = tab.id;

      tabEl.innerHTML = `
        <span class="tab-icon">${tab.icon}</span>
        <span class="tab-title">${tab.title}</span>
        <button class="tab-close-btn" title="Close Tab [Ctrl+W]">✕</button>
      `;

      tabEl.addEventListener('click', () => this.switchTab(tab.id));

      const closeBtn = tabEl.querySelector('.tab-close-btn');
      closeBtn.addEventListener('click', (e) => this.closeTab(tab.id, e));

      this.tabStripEl.appendChild(tabEl);
    });

    // Re-append add and dropdown buttons
    if (this.addBtnEl) this.tabStripEl.appendChild(this.addBtnEl);
    if (this.dropdownBtnEl) this.tabStripEl.appendChild(this.dropdownBtnEl);
  }

  toggleDropdownMenu() {
    if (this.dropdownMenuEl) {
      this.closeDropdownMenu();
      return;
    }

    const menu = document.createElement('div');
    menu.className = 'cyber-tab-dropdown-menu';
    menu.id = 'cyberTabDropdownMenu';

    menu.innerHTML = `
      <div class="dropdown-header">⚡ SPAWN NEW SUBSYSTEM SESSION</div>
      <div class="dropdown-item" data-type="cli">
        <span class="d-icon">>_</span>
        <div class="d-info">
          <span class="d-title">New CyberDeck Terminal</span>
          <span class="d-sub">PowerShell & Real CLI Prompt [Ctrl+T]</span>
        </div>
      </div>
      <div class="dropdown-item" data-type="trading">
        <span class="d-icon">📈</span>
        <div class="d-info">
          <span class="d-title">AI Quantum Trading Terminal</span>
          <span class="d-sub">Binance Live Candlesticks & AI Gym Copilot</span>
        </div>
      </div>
      <div class="dropdown-item" data-type="wifi">
        <span class="d-icon">📡</span>
        <div class="d-info">
          <span class="d-title">Cyber Wi-Fi Radar & Quantum Decryptor</span>
          <span class="d-sub">Scan Local Airwaves & WPA Handshake Cracking</span>
        </div>
      </div>
      <div class="dropdown-item" data-type="explorer">
        <span class="d-icon">📂</span>
        <div class="d-info">
          <span class="d-title">Cyber Desktop Mirror & File Explorer</span>
          <span class="d-sub">Live Reflection of Desktop Shortcuts & Drives</span>
        </div>
      </div>
      <div class="dropdown-item" data-type="taskmgr">
        <span class="d-icon">📊</span>
        <div class="d-info">
          <span class="d-title">Real Task Manager (htop)</span>
          <span class="d-sub">Live Windows Processes & Task Killer</span>
        </div>
      </div>
      <div class="dropdown-item" data-type="radio">
        <span class="d-icon">🎵</span>
        <div class="d-info">
          <span class="d-title">Tron 3D Cyber Radio</span>
          <span class="d-sub">Synthwave, Lofi & 3D Audio Visualizer</span>
        </div>
      </div>
      <div class="dropdown-item" data-type="browser">
        <span class="d-icon">🌐</span>
        <div class="d-info">
          <span class="d-title">In-App Cyber Browser</span>
          <span class="d-sub">Chromium Web & Background YouTube Media</span>
        </div>
      </div>
      <div class="dropdown-item" data-type="vscode">
        <span class="d-icon">⚡</span>
        <div class="d-info">
          <span class="d-title">VS Code Interactive Studio</span>
          <span class="d-sub">Dual-Pane Code Editor & AI Cyber Tutor</span>
        </div>
      </div>
      <div class="dropdown-item" data-type="roguelite">
        <span class="d-icon">🎮</span>
        <div class="d-info">
          <span class="d-title">Cyberspace Roguelite Matrix</span>
          <span class="d-sub">Node-Crawl Infiltration & Darknet Shop</span>
        </div>
      </div>
      <div class="dropdown-item" data-type="academy">
        <span class="d-icon">🎓</span>
        <div class="d-info">
          <span class="d-title">Touch Typing Academy</span>
          <span class="d-sub">10-Finger Kinesthetic Key Drills</span>
        </div>
      </div>
      <div class="dropdown-item" data-type="speed">
        <span class="d-icon">⚡</span>
        <div class="d-info">
          <span class="d-title">Speed Rush WPM Benchmark</span>
          <span class="d-sub">High-Intensity Speed & Accuracy Rush</span>
        </div>
      </div>
    `;

    // Position menu under dropdown button
    if (this.dropdownBtnEl) {
      const rect = this.dropdownBtnEl.getBoundingClientRect();
      menu.style.position = 'fixed';
      menu.style.top = `${rect.bottom + 4}px`;
      menu.style.left = `${Math.min(window.innerWidth - 300, rect.left)}px`;
      menu.style.zIndex = '9999';
    }

    menu.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const typeKey = item.dataset.type;
        this.closeDropdownMenu();

        if (typeKey === 'trading') {
          this.createTab(TAB_TYPES.TRADING, 'Trade (BTC/USDT)', true);
        } else if (typeKey === 'wifi') {
          this.createTab(TAB_TYPES.WIFI, 'Cyber Wi-Fi Radar', true);
        } else if (typeKey === 'explorer') {
          this.createTab(TAB_TYPES.EXPLORER, 'Cyber Explorer', true);
        } else if (typeKey === 'taskmgr') {
          this.createTab(TAB_TYPES.TASKMGR, 'Task Manager', true);
        } else if (typeKey === 'radio') {
          this.createTab(TAB_TYPES.RADIO, 'Cyber Radio', true);
        } else if (typeKey === 'browser') {
          this.createTab(TAB_TYPES.BROWSER, 'In-App Browser', true);
        } else if (typeKey === 'vscode') {
          this.createTab(TAB_TYPES.VSCODE, 'VS Code Studio', true);
        } else if (typeKey === 'roguelite') {
          this.createTab(TAB_TYPES.ROGUELITE, 'Cyberspace Matrix', true);
        } else if (typeKey === 'academy') {
          this.createTab(TAB_TYPES.ACADEMY, 'Touch Academy', true);
        } else if (typeKey === 'speed') {
          this.createTab(TAB_TYPES.SPEED, 'Speed Rush', true);
        } else {
          this.tabCounter++;
          this.createTab(TAB_TYPES.CLI, `CyberDeck (${this.tabCounter})`, true);
        }
        if (this.sound && typeof this.sound.playSuccessFanfare === 'function') this.sound.playSuccessFanfare();
      });
    });

    document.body.appendChild(menu);
    this.dropdownMenuEl = menu;
  }

  closeDropdownMenu() {
    if (this.dropdownMenuEl) {
      this.dropdownMenuEl.remove();
      this.dropdownMenuEl = null;
    }
  }

  nextTab() {
    if (this.tabs.length <= 1) return;
    const curIdx = this.tabs.findIndex(t => t.id === this.activeTabId);
    const nextIdx = (curIdx + 1) % this.tabs.length;
    this.switchTab(this.tabs[nextIdx].id);
  }

  prevTab() {
    if (this.tabs.length <= 1) return;
    const curIdx = this.tabs.findIndex(t => t.id === this.activeTabId);
    const prevIdx = (curIdx - 1 + this.tabs.length) % this.tabs.length;
    this.switchTab(this.tabs[prevIdx].id);
  }

  switchToTabIndex(index) {
    if (index >= 0 && index < this.tabs.length) {
      this.switchTab(this.tabs[index].id);
    }
  }
}

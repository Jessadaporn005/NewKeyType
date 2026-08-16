/**
 * CYBER//TYPE ROGUELITE CYBERSPACE ENGINE (Hacky-Inspired)
 * Procedural Cyberspace Network Node-Crawling, Real-Time Trace Management,
 * 6 Minigame Dispatchers, Bitcoin (₿) Economy & Darknet Shop.
 */

import { profileStore } from './profileStore.js';
import {
  PortCrackGame,
  FirewallBypassGame,
  PasswordCrackGame,
  MemoryDumpGame,
  PacketInjectGame,
  DataExtractGame
} from './hackingMinigames.js';

export const NODE_TYPES = {
  STANDARD: { id: 'standard', name: 'Port Subnet', icon: '🔒', game: 'port_crack', traceAdd: 10, btcMin: 50, btcMax: 120 },
  FIREWALL: { id: 'firewall', name: 'Firewall Array', icon: '🛡️', game: 'firewall_bypass', traceAdd: 15, btcMin: 80, btcMax: 180 },
  ENCRYPTED: { id: 'encrypted', name: 'Cipher Enclave', icon: '🔐', game: 'password_crack', traceAdd: 12, btcMin: 120, btcMax: 250 },
  DATA_CACHE: { id: 'data_cache', name: 'Data Repository', icon: '💾', game: 'data_extract', traceAdd: 8, btcMin: 150, btcMax: 300 },
  VAULT: { id: 'vault', name: 'Quantum Vault', icon: '💰', game: 'memory_dump', traceAdd: 18, btcMin: 250, btcMax: 500 },
  HONEYPOT: { id: 'honeypot', name: 'NetWatch Honeypot', icon: '🕳️', game: null, traceAdd: 30, btcMin: 0, btcMax: 0 },
  RELAY: { id: 'relay', name: 'Encrypted Relay Node', icon: '📡', game: null, traceAdd: -20, btcMin: 20, btcMax: 50 },
  BOSS: { id: 'boss', name: 'CORE MAINFRAME', icon: '👑', game: 'boss_rush', traceAdd: 20, btcMin: 800, btcMax: 1500 }
};

export class RogueliteEngine {
  constructor(app, soundEngine, toastManager) {
    this.app = app;
    this.sound = soundEngine;
    this.toasts = toastManager;

    this.container = null;
    this.mapContainer = null;
    this.minigameModal = null;
    this.minigameContent = null;
    this.shopModal = null;
    this.resultModal = null;

    // Run State
    this.activeRun = null;
    this.activeMinigame = null;
    this.maxDepth = 6;

    // Minigame instances
    this.games = {
      port_crack: new PortCrackGame(this.sound),
      firewall_bypass: new FirewallBypassGame(this.sound),
      password_crack: new PasswordCrackGame(this.sound),
      memory_dump: new MemoryDumpGame(this.sound),
      packet_inject: new PacketInjectGame(this.sound),
      data_extract: new DataExtractGame(this.sound)
    };
  }

  init(containerEl) {
    this.container = containerEl;
    this.renderLayout();
  }

  renderLayout() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="roguelite-wrapper">
        <!-- HUD Header -->
        <div class="rl-hud">
          <div class="rl-hud-left">
            <div class="rl-hud-badge">CYBER//CRAWL v4.0</div>
            <div class="rl-hud-item">DEPTH: <span id="rlDepthDisplay" class="rl-val">1/6</span></div>
            <div class="rl-hud-item">SHIELDS: <span id="rlShieldsDisplay" class="rl-val-shields">♥♥♥♥♥</span></div>
          </div>
          <div class="rl-hud-center">
            <div class="rl-trace-label">NETWATCH SENTINEL TRACE: <span id="rlTracePct">0%</span></div>
            <div class="rl-trace-bar-track">
              <div class="rl-trace-bar-fill" id="rlTraceBarFill"></div>
            </div>
          </div>
          <div class="rl-hud-right">
            <div class="rl-hud-item">BITCOIN: <span id="rlBtcDisplay" class="rl-val-btc">₿ 0</span></div>
            <button class="rl-btn-shop" id="rlBtnOpenShop">🛒 DARKNET SHOP</button>
            <button class="rl-btn-exit" id="rlBtnExitRun">✖ ABORT [ESC]</button>
          </div>
        </div>

        <!-- Cyberspace Map View -->
        <div class="rl-map-area" id="rlMapArea"></div>

        <!-- Mini-Game Overlay Modal -->
        <div class="rl-minigame-modal hidden" id="rlMinigameModal">
          <div class="rl-minigame-backdrop"></div>
          <div class="rl-minigame-dialog" id="rlMinigameDialog"></div>
        </div>

        <!-- Darknet Upgrade Shop Modal -->
        <div class="rl-shop-modal hidden" id="rlShopModal">
          <div class="rl-shop-backdrop"></div>
          <div class="rl-shop-dialog" id="rlShopDialog"></div>
        </div>

        <!-- Run Result Modal (Extraction / Busted / Crash) -->
        <div class="rl-result-modal hidden" id="rlResultModal">
          <div class="rl-result-backdrop"></div>
          <div class="rl-result-dialog" id="rlResultDialog"></div>
        </div>
      </div>
    `;

    this.mapContainer = this.container.querySelector('#rlMapArea');
    this.minigameModal = this.container.querySelector('#rlMinigameModal');
    this.minigameContent = this.container.querySelector('#rlMinigameDialog');
    this.shopModal = this.container.querySelector('#rlShopModal');
    this.resultModal = this.container.querySelector('#rlResultModal');

    this.bindEvents();
  }

  bindEvents() {
    const shopBtn = this.container.querySelector('#rlBtnOpenShop');
    if (shopBtn) {
      shopBtn.addEventListener('click', () => this.openShop());
    }

    const exitBtn = this.container.querySelector('#rlBtnExitRun');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        if (confirm('Abort this Cyberspace run? (You will salvage 50% of earned Bitcoin).')) {
          this.endRun(false, 'ABORTED');
        }
      });
    }
  }

  startNewRun() {
    const username = this.app.username || 'Anan';
    const prof = profileStore.getProfile(username);
    const upgrades = prof.rogueliteUpgrades || {};

    const maxShields = 5 + (upgrades.extraShields || 0);

    this.activeRun = {
      depth: 1,
      shields: maxShields,
      maxShields,
      trace: 0,
      bitcoinLoot: 0,
      nodesHackedCount: 0,
      map: this.generateProceduralMap(this.maxDepth),
      activeNode: null,
      isFinished: false
    };

    if (prof.rogueliteStats) {
      prof.rogueliteStats.runsAttempted = (prof.rogueliteStats.runsAttempted || 0) + 1;
      profileStore.saveProfile(prof);
    }

    this.updateHud();
    this.renderMap();
    if (this.sound && this.sound.playSuccessFanfare) this.sound.playSuccessFanfare();
  }

  generateProceduralMap(depthCount = 6) {
    const map = [];
    const nodeTypesPool = [
      NODE_TYPES.STANDARD,
      NODE_TYPES.STANDARD,
      NODE_TYPES.FIREWALL,
      NODE_TYPES.FIREWALL,
      NODE_TYPES.ENCRYPTED,
      NODE_TYPES.DATA_CACHE,
      NODE_TYPES.VAULT,
      NODE_TYPES.HONEYPOT,
      NODE_TYPES.RELAY
    ];

    for (let d = 1; d <= depthCount; d++) {
      const layer = [];
      if (d === depthCount) {
        // Final Core Boss Node
        layer.push({
          id: `node_${d}_0`,
          depth: d,
          col: 0,
          type: NODE_TYPES.BOSS,
          name: 'CORE MAINFRAME ENCLAVE',
          status: 'locked', // locked | available | hacked
          connections: []
        });
      } else {
        // 2 to 3 nodes per layer
        const nodeCount = d === 1 ? 2 : 2 + Math.floor(Math.random() * 2);
        for (let c = 0; c < nodeCount; c++) {
          let nType = nodeTypesPool[Math.floor(Math.random() * nodeTypesPool.length)];
          // Ensure first layer is never a Honeypot
          if (d === 1 && nType.id === 'honeypot') nType = NODE_TYPES.STANDARD;

          layer.push({
            id: `node_${d}_${c}`,
            depth: d,
            col: c,
            type: nType,
            name: `${nType.name} 0x${Math.floor(Math.random() * 899 + 100).toString(16).toUpperCase()}`,
            status: d === 1 ? 'available' : 'locked',
            connections: []
          });
        }
      }
      map.push(layer);
    }

    // Connect layers
    for (let d = 0; d < map.length - 1; d++) {
      const currentLayer = map[d];
      const nextLayer = map[d + 1];

      currentLayer.forEach((curNode, cIdx) => {
        nextLayer.forEach((nxtNode, nIdx) => {
          // Connect adjacent or all to boss
          if (d + 1 === map.length - 1 || Math.abs(cIdx - nIdx) <= 1 || Math.random() > 0.4) {
            curNode.connections.push(nxtNode.id);
          }
        });
        if (curNode.connections.length === 0) {
          curNode.connections.push(nextLayer[0].id);
        }
      });
    }

    return map;
  }

  renderMap() {
    if (!this.mapContainer || !this.activeRun) return;
    this.mapContainer.innerHTML = '';

    const gridEl = document.createElement('div');
    gridEl.className = 'rl-node-grid';

    this.activeRun.map.forEach((layer, depthIdx) => {
      const layerEl = document.createElement('div');
      layerEl.className = `rl-grid-layer layer-depth-${depthIdx + 1}`;

      const depthTag = document.createElement('div');
      depthTag.className = 'rl-layer-tag';
      depthTag.textContent = depthIdx === this.maxDepth - 1 ? '👑 CORE ENCLAVE' : `LAYER 0${depthIdx + 1}`;
      layerEl.appendChild(depthTag);

      const nodesRow = document.createElement('div');
      nodesRow.className = 'rl-layer-nodes';

      layer.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = `rl-node-card node-status-${node.status} node-type-${node.type.id}`;
        nodeEl.dataset.nodeId = node.id;

        nodeEl.innerHTML = `
          <div class="rl-node-icon">${node.type.icon}</div>
          <div class="rl-node-info">
            <div class="rl-node-name">${node.name}</div>
            <div class="rl-node-type-label">${node.type.name.toUpperCase()}</div>
          </div>
          <div class="rl-node-badge">${node.status.toUpperCase()}</div>
        `;

        if (node.status === 'available') {
          nodeEl.addEventListener('click', () => this.selectNode(node));
        }

        nodesRow.appendChild(nodeEl);
      });

      layerEl.appendChild(nodesRow);
      gridEl.appendChild(layerEl);
    });

    this.mapContainer.appendChild(gridEl);
  }

  updateHud() {
    if (!this.container || !this.activeRun) return;
    const depthEl = this.container.querySelector('#rlDepthDisplay');
    const shieldsEl = this.container.querySelector('#rlShieldsDisplay');
    const tracePctEl = this.container.querySelector('#rlTracePct');
    const traceBarEl = this.container.querySelector('#rlTraceBarFill');
    const btcEl = this.container.querySelector('#rlBtcDisplay');

    if (depthEl) depthEl.textContent = `${this.activeRun.depth}/${this.maxDepth}`;

    if (shieldsEl) {
      const filled = Math.max(0, this.activeRun.shields);
      const empty = Math.max(0, this.activeRun.maxShields - filled);
      shieldsEl.innerHTML = `<span style="color:#00ff66;">${'♥'.repeat(filled)}</span><span style="color:#555;">${'♡'.repeat(empty)}</span>`;
    }

    const t = Math.min(100, Math.max(0, Math.round(this.activeRun.trace)));
    if (tracePctEl) tracePctEl.textContent = `${t}%`;
    if (traceBarEl) {
      traceBarEl.style.width = `${t}%`;
      traceBarEl.className = `rl-trace-bar-fill ${t >= 80 ? 'danger' : t >= 50 ? 'warning' : ''}`;
    }

    if (btcEl) btcEl.textContent = `₿ ${this.activeRun.bitcoinLoot}`;
  }

  selectNode(node) {
    if (node.status !== 'available') return;
    this.activeRun.activeNode = node;

    // Honeypot trap
    if (node.type.id === 'honeypot') {
      this.activeRun.trace += node.type.traceAdd;
      node.status = 'hacked';
      this.updateHud();
      if (this.sound && this.sound.playAlarmSiren) this.sound.playAlarmSiren();
      if (this.toasts) this.toasts.show({ title: '🚨 HONEYPOT DETECTED', message: 'Trace increased by +30%!', type: 'danger', icon: '🕳️' });
      this.advanceMap(node);
      this.checkRunConditions();
      return;
    }

    // Relay node (Rest)
    if (node.type.id === 'relay') {
      this.activeRun.trace = Math.max(0, this.activeRun.trace + node.type.traceAdd);
      if (this.activeRun.shields < this.activeRun.maxShields) this.activeRun.shields++;
      node.status = 'hacked';
      this.activeRun.bitcoinLoot += 40;
      this.updateHud();
      if (this.sound && this.sound.playSuccessFanfare) this.sound.playSuccessFanfare();
      if (this.toasts) this.toasts.show({ title: '📡 RELAY PURGED', message: 'Trace reduced -20%, Shield repaired!', type: 'success', icon: '📡' });
      this.advanceMap(node);
      this.checkRunConditions();
      return;
    }

    // Launch Mini-Game for this node
    this.launchNodeMinigame(node);
  }

  launchNodeMinigame(node) {
    let gameKey = node.type.game;
    if (gameKey === 'boss_rush') {
      // Pick random hardest minigame
      const pool = ['port_crack', 'firewall_bypass', 'password_crack', 'memory_dump'];
      gameKey = pool[Math.floor(Math.random() * pool.length)];
    }

    const game = this.games[gameKey] || this.games.port_crack;
    this.activeMinigame = game;

    if (this.minigameModal && this.minigameContent) {
      this.minigameModal.classList.remove('hidden');
      const username = this.app.username || 'Anan';
      const prof = profileStore.getProfile(username);

      game.start(this.minigameContent, node, prof.rogueliteUpgrades || {}, (success, stats) => {
        this.onMinigameComplete(success, stats, node);
      });
    }
  }

  onMinigameComplete(success, stats, node) {
    if (this.minigameModal) this.minigameModal.classList.add('hidden');
    this.activeMinigame = null;

    const username = this.app.username || 'Anan';
    const prof = profileStore.getProfile(username);
    const upgrades = prof.rogueliteUpgrades || {};
    const overclockMult = 1 + (upgrades.typingOverclock || 0) * 0.1;

    if (success) {
      // Reward
      const btcEarned = Math.round((node.type.btcMin + Math.random() * (node.type.btcMax - node.type.btcMin)) * overclockMult);
      this.activeRun.bitcoinLoot += btcEarned;
      this.activeRun.nodesHackedCount++;

      // Trace penalty
      const traceMod = 1 - (upgrades.traceReduction || 0) * 0.05;
      this.activeRun.trace += (node.type.traceAdd || 10) * traceMod;

      node.status = 'hacked';
      this.updateHud();

      if (this.toasts) {
        this.toasts.show({
          title: `✓ ${node.name} BREACHED`,
          message: `Infiltrated successfully! +₿ ${btcEarned}`,
          type: 'success',
          icon: '🔓',
          reward: `₿ ${btcEarned}`
        });
      }

      profileStore.unlockAchievement(username, 'roguelite_first_node');

      // Check Boss victory
      if (node.type.id === 'boss') {
        profileStore.unlockAchievement(username, 'roguelite_boss_down');
        this.endRun(true, 'EXTRACTION_SUCCESS');
        return;
      }

      this.advanceMap(node);
      this.checkRunConditions();
    } else {
      // Failure penalty
      this.activeRun.shields--;
      this.activeRun.trace += 20;
      this.updateHud();

      if (this.sound && this.sound.playErrorSound) this.sound.playErrorSound();
      if (this.toasts) {
        this.toasts.show({
          title: '✗ NODE BREACH FAILED',
          message: 'Shield damaged! Sentinel trace increased +20%',
          type: 'danger',
          icon: '💥'
        });
      }

      this.checkRunConditions();
    }
  }

  advanceMap(completedNode) {
    this.activeRun.depth = Math.min(this.maxDepth, completedNode.depth + 1);

    // Lock all in current layer, unlock connected in next layer
    this.activeRun.map.forEach(layer => {
      layer.forEach(n => {
        if (n.status === 'available') n.status = 'locked';
        if (completedNode.connections.includes(n.id)) {
          n.status = 'available';
        }
      });
    });

    this.renderMap();
    this.updateHud();
  }

  checkRunConditions() {
    if (this.activeRun.shields <= 0) {
      this.endRun(false, 'SHIELDS_DEPLETED');
    } else if (this.activeRun.trace >= 100) {
      this.endRun(false, 'TRACE_INTERCEPTED');
    }
  }

  endRun(isVictory, reason) {
    if (!this.activeRun || this.activeRun.isFinished) return;
    this.activeRun.isFinished = true;

    const username = this.app.username || 'Anan';
    const prof = profileStore.getProfile(username);

    let finalBtc = this.activeRun.bitcoinLoot;
    if (!isVictory) {
      finalBtc = Math.floor(this.activeRun.bitcoinLoot * 0.5); // Salvage 50%
    }

    profileStore.addBitcoin(username, finalBtc);
    profileStore.addExp(username, isVictory ? 500 : 150);

    if (prof.rogueliteStats) {
      if (isVictory) prof.rogueliteStats.runsCompleted = (prof.rogueliteStats.runsCompleted || 0) + 1;
      if (this.activeRun.depth > (prof.rogueliteStats.highestDepth || 0)) {
        prof.rogueliteStats.highestDepth = this.activeRun.depth;
      }
      prof.rogueliteStats.nodesHacked = (prof.rogueliteStats.nodesHacked || 0) + this.activeRun.nodesHackedCount;
      profileStore.saveProfile(prof);
    }

    this.renderResultModal(isVictory, reason, finalBtc);
  }

  renderResultModal(isVictory, reason, finalBtc) {
    if (!this.resultModal) return;
    this.resultModal.classList.remove('hidden');

    const dialog = this.container.querySelector('#rlResultDialog');
    if (!dialog) return;

    let title = isVictory ? '🏆 CORE EXFILTRATION SUCCESSFUL' : '💀 SYSTEM BREACH TERMINATED';
    let msg = isVictory
      ? 'You successfully compromised the Core Mainframe and exfiltrated classified archives!'
      : reason === 'TRACE_INTERCEPTED'
      ? 'NetWatch Sentinel Trace reached 100%. Emergency disconnect triggered.'
      : reason === 'SHIELDS_DEPLETED'
      ? 'All defensive shields depleted. Kernel fault initiated.'
      : 'Operation aborted by operator.';

    dialog.innerHTML = `
      <div class="rl-result-card ${isVictory ? 'victory' : 'defeat'}">
        <div class="rl-result-header">${title}</div>
        <div class="rl-result-msg">${msg}</div>
        <div class="rl-result-stats">
          <div class="stat-box">
            <span class="stat-lbl">DEPTH REACHED:</span>
            <span class="stat-val">${this.activeRun.depth}/${this.maxDepth}</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">NODES HACKED:</span>
            <span class="stat-val">${this.activeRun.nodesHackedCount}</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">BITCOIN SECURED:</span>
            <span class="stat-val" style="color: #ffaa00;">+₿ ${finalBtc}</span>
          </div>
        </div>
        <div class="rl-result-actions">
          <button class="rl-res-btn btn-shop" id="rlResShopBtn">🛒 VISIT DARKNET SHOP</button>
          <button class="rl-res-btn btn-retry" id="rlResRetryBtn">🔄 DIVE AGAIN</button>
          <button class="rl-res-btn btn-cli" id="rlResCliBtn">💻 RETURN TO TERMINAL</button>
        </div>
      </div>
    `;

    dialog.querySelector('#rlResShopBtn').addEventListener('click', () => {
      this.resultModal.classList.add('hidden');
      this.openShop();
    });

    dialog.querySelector('#rlResRetryBtn').addEventListener('click', () => {
      this.resultModal.classList.add('hidden');
      this.startNewRun();
    });

    dialog.querySelector('#rlResCliBtn').addEventListener('click', () => {
      this.resultModal.classList.add('hidden');
      this.app.returnToCli();
    });
  }

  openShop() {
    if (!this.shopModal) return;
    this.shopModal.classList.remove('hidden');

    const dialog = this.container.querySelector('#rlShopDialog');
    if (!dialog) return;

    const username = this.app.username || 'Anan';
    const prof = profileStore.getProfile(username);
    const up = prof.rogueliteUpgrades || {};
    const btc = prof.bitcoin || 0;

    dialog.innerHTML = `
      <div class="rl-shop-card">
        <div class="rl-shop-header">
          <span>🛒 THE VOID // DARKNET UPGRADE MATRIX</span>
          <span class="rl-shop-balance">BALANCE: <strong style="color:#ffaa00;">₿ ${btc}</strong></span>
        </div>
        <div class="rl-shop-items">
          <div class="shop-item">
            <div class="item-info">
              <div class="item-name">🛡️ EXTRA SHIELDS (LVL ${up.extraShields || 0}/3)</div>
              <div class="item-desc">+1 starting shield defense for every Cyberspace run.</div>
            </div>
            <button class="btn-buy" data-upgrade="extraShields" data-cost="500" ${(up.extraShields || 0) >= 3 ? 'disabled' : ''}>
              ${(up.extraShields || 0) >= 3 ? 'MAXED' : 'BUY [₿ 500]'}
            </button>
          </div>

          <div class="shop-item">
            <div class="item-info">
              <div class="item-name">⏱️ TRACE JAMMER PRO (LVL ${up.traceReduction || 0}/5)</div>
              <div class="item-desc">Reduces base trace accumulated from hacking by -5% per level.</div>
            </div>
            <button class="btn-buy" data-upgrade="traceReduction" data-cost="600" ${(up.traceReduction || 0) >= 5 ? 'disabled' : ''}>
              ${(up.traceReduction || 0) >= 5 ? 'MAXED' : 'BUY [₿ 600]'}
            </button>
          </div>

          <div class="shop-item">
            <div class="item-info">
              <div class="item-name">⚡ TYPING OVERCLOCK (LVL ${up.typingOverclock || 0}/5)</div>
              <div class="item-desc">+10% bonus Bitcoin loot and EXP earned per node.</div>
            </div>
            <button class="btn-buy" data-upgrade="typingOverclock" data-cost="800" ${(up.typingOverclock || 0) >= 5 ? 'disabled' : ''}>
              ${(up.typingOverclock || 0) >= 5 ? 'MAXED' : 'BUY [₿ 800]'}
            </button>
          </div>

          <div class="shop-item">
            <div class="item-info">
              <div class="item-name">🔓 SSHCRACK V2 SCRIPT</div>
              <div class="item-desc">Gives +4 extra seconds during Port Crack typing races.</div>
            </div>
            <button class="btn-buy" data-upgrade="sshCrackV2" data-cost="400" ${up.sshCrackV2 ? 'disabled' : ''}>
              ${up.sshCrackV2 ? 'OWNED' : 'BUY [₿ 400]'}
            </button>
          </div>

          <div class="shop-item">
            <div class="item-info">
              <div class="item-name">💉 SQL INJECTOR OVERRIDE</div>
              <div class="item-desc">Automatically skips 1 layer in Firewall Arrow pattern arrays.</div>
            </div>
            <button class="btn-buy" data-upgrade="sqlInjector" data-cost="750" ${up.sqlInjector ? 'disabled' : ''}>
              ${up.sqlInjector ? 'OWNED' : 'BUY [₿ 750]'}
            </button>
          </div>

          <div class="shop-item">
            <div class="item-info">
              <div class="item-name">🔐 INSTANT CIPHER DECRYPTOR</div>
              <div class="item-desc">Grants +1 extra guess attempt in Brute-Force Password Cracking.</div>
            </div>
            <button class="btn-buy" data-upgrade="instantDecryptor" data-cost="650" ${up.instantDecryptor ? 'disabled' : ''}>
              ${up.instantDecryptor ? 'OWNED' : 'BUY [₿ 650]'}
            </button>
          </div>
        </div>
        <div class="rl-shop-footer">
          <button class="btn-close-shop" id="rlBtnCloseShop">CLOSE SHOP</button>
        </div>
      </div>
    `;

    dialog.querySelectorAll('.btn-buy').forEach(btn => {
      btn.addEventListener('click', () => {
        const uId = btn.dataset.upgrade;
        const cost = parseInt(btn.dataset.cost, 10);
        const res = profileStore.buyRogueliteUpgrade(username, uId, cost);
        if (res.success) {
          if (this.sound && this.sound.playSuccessFanfare) this.sound.playSuccessFanfare();
          if (this.toasts) this.toasts.show({ title: '✓ UPGRADE INSTALLED', message: `Upgraded ${uId}!`, type: 'success', icon: '💎' });
          this.openShop();
          this.updateHud();
        } else {
          if (this.sound && this.sound.playErrorSound) this.sound.playErrorSound();
          alert('Insufficient Bitcoin (₿). Clear more cyberspace runs to earn Bitcoin!');
        }
      });
    });

    dialog.querySelector('#rlBtnCloseShop').addEventListener('click', () => {
      this.shopModal.classList.add('hidden');
    });
  }

  handleKeyDown(e) {
    if (this.activeMinigame) {
      this.activeMinigame.handleKeyDown(e);
      return;
    }

    if (e.key === 'Escape') {
      if (this.shopModal && !this.shopModal.classList.contains('hidden')) {
        this.shopModal.classList.add('hidden');
        return;
      }
      if (this.resultModal && !this.resultModal.classList.contains('hidden')) {
        this.resultModal.classList.add('hidden');
        this.app.returnToCli();
        return;
      }
      this.app.returnToCli();
    }
  }
}

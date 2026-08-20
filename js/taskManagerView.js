/**
 * CYBER//TYPE REAL-WORLD TASK MANAGER & PROCESS MATRIX ENGINE (htop)
 * Connects directly to host Windows/Linux processes via PowerShell / SystemBridge.
 * Features:
 *   - Real-time CPU, RAM & Process count telemetry HUD.
 *   - Live process table (PID, Name, Memory MB, CPU %, Status).
 *   - Process search filter.
 *   - Interactive Process Termination [💀 KILL PROCESS].
 */

import { systemBridge } from './systemBridge.js';

export class TaskManagerViewEngine {
  constructor(app, soundEngine, toastManager) {
    this.app = app;
    this.sound = soundEngine;
    this.toasts = toastManager;

    this.container = null;
    this.processes = [];
    this.searchQuery = '';
    this.sortBy = 'memMB'; // 'memMB', 'cpu', 'name', 'pid'
    this.sortAsc = false;
    this.isPaused = false;
    this.pollInterval = null;
    this.dataSource = 'VERIFYING';

    this.cpuHistory = [];
    this.memHistory = [];
  }

  init(containerEl) {
    this.container = containerEl;
    if (!this.container) return;

    this.renderLayout();
    this.fetchProcesses();
    this.startPolling();
  }

  renderLayout() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="cyber-taskmgr-window" id="cyberTaskmgrWindow">
        <!-- 1. Header Toolbar -->
        <div class="taskmgr-header-bar">
          <div class="taskmgr-title-group">
            <span class="pulse-indicator"></span>
            <span class="taskmgr-title">CYBER//PROCESS MONITOR (htop)</span>
            <span class="taskmgr-sub" id="taskmgrSourceBadge">SOURCE: VERIFYING</span>
          </div>

          <div class="taskmgr-header-actions">
            <div class="taskmgr-search-box">
              <span>🔍</span>
              <input type="text" class="taskmgr-search-input" id="taskmgrSearchInput" placeholder="Filter processes (e.g. chrome, code)..." />
            </div>
            <button class="taskmgr-ctrl-btn" id="taskmgrBtnRefresh" title="Force Refresh">🔄 SYNC</button>
            <button class="taskmgr-ctrl-btn" id="taskmgrBtnPause" title="Pause/Resume Polling">⏸</button>
            <button class="taskmgr-ctrl-btn taskmgr-btn-exit" id="taskmgrBtnExit" title="Return to CLI">✕</button>
          </div>
        </div>

        <!-- 2. System Resource Telemetry HUD -->
        <div class="taskmgr-telemetry-hud">
          <!-- CPU Card -->
          <div class="telemetry-card">
            <div class="tel-card-top">
              <span class="tel-label">⚡ CPU UTILIZATION</span>
              <strong class="tel-val" id="telCpuVal">VERIFYING</strong>
            </div>
            <div class="tel-graph-box" id="telCpuGraphBox">
              <!-- SVG Wave drawn dynamically -->
            </div>
          </div>

          <!-- Memory Card -->
          <div class="telemetry-card">
            <div class="tel-card-top">
              <span class="tel-label">💾 RAM USAGE</span>
              <strong class="tel-val" id="telMemVal">VERIFYING</strong>
            </div>
            <div class="tel-graph-box" id="telMemGraphBox">
              <!-- SVG Wave drawn dynamically -->
            </div>
          </div>

          <!-- Tasks Metric Card -->
          <div class="telemetry-card tel-tasks-card">
            <div class="tel-card-top">
              <span class="tel-label">🗂️ ACTIVE PROCESSES</span>
              <strong class="tel-val" id="telTasksCount">0</strong>
            </div>
            <div class="tel-tasks-meta">
              <span>THREADS: <strong id="telThreadsCount">N/A</strong></span>
              <span>HANDLES: <strong id="telHandlesCount">N/A</strong></span>
            </div>
          </div>
        </div>

        <!-- 3. Process Table Matrix -->
        <div class="taskmgr-table-container">
          <div class="taskmgr-table-header">
            <div class="t-col t-pid" data-sort="pid">PID</div>
            <div class="t-col t-name" data-sort="name">PROCESS NAME</div>
            <div class="t-col t-mem active-sort" data-sort="memMB">MEMORY (MB) ▼</div>
            <div class="t-col t-cpu" data-sort="cpu">CPU TIME (s)</div>
            <div class="t-col t-status">STATUS</div>
            <div class="t-col t-action">ACTION</div>
          </div>

          <div class="taskmgr-table-scroll" id="taskmgrRowsList">
            <!-- Process rows rendered dynamically -->
          </div>
        </div>

        <!-- 4. Bottom Status Dock -->
        <div class="taskmgr-status-dock">
          <span id="taskmgrSummaryTxt">Showing 0 processes</span>
          <span class="dock-sep">|</span>
          <span>POLL RATE: <strong>3000ms</strong></span>
          <span class="dock-sep">|</span>
          <span class="dock-glow" id="taskmgrHostStatus">SYSTEM SOURCE: VERIFYING</span>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    if (!this.container) return;

    const btnRefresh = this.container.querySelector('#taskmgrBtnRefresh');
    const btnPause = this.container.querySelector('#taskmgrBtnPause');
    const btnExit = this.container.querySelector('#taskmgrBtnExit');
    const searchInput = this.container.querySelector('#taskmgrSearchInput');
    const headers = this.container.querySelectorAll('.taskmgr-table-header .t-col[data-sort]');

    if (btnRefresh) btnRefresh.addEventListener('click', () => this.fetchProcesses());
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        this.isPaused = !this.isPaused;
        btnPause.textContent = this.isPaused ? '▶' : '⏸';
        btnPause.classList.toggle('paused', this.isPaused);
        if (this.sound) this.sound.playKey(false);
      });
    }
    if (btnExit) btnExit.addEventListener('click', () => this.app.returnToCli());

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderProcessTable();
      });
    }

    headers.forEach(h => {
      h.addEventListener('click', () => {
        const sortKey = h.dataset.sort;
        if (this.sortBy === sortKey) {
          this.sortAsc = !this.sortAsc;
        } else {
          this.sortBy = sortKey;
          this.sortAsc = false;
        }

        headers.forEach(el => {
          el.classList.remove('active-sort');
          el.textContent = el.textContent.replace(/[▲▼]/g, '').trim();
        });
        h.classList.add('active-sort');
        h.textContent = `${h.textContent} ${this.sortAsc ? '▲' : '▼'}`;

        this.renderProcessTable();
        if (this.sound) this.sound.playKey(false);
      });
    });
  }

  async fetchProcesses() {
    try {
      const res = await systemBridge.getProcesses();
      if (res && res.processes) {
        this.processes = res.processes;
        this.dataSource = res.source || 'UNKNOWN';
      }

      // Update CPU / Mem metrics
      const sysInfo = await systemBridge.getSysInfo();
      if (sysInfo) {
        const cpuVal = this.container.querySelector('#telCpuVal');
        const memVal = this.container.querySelector('#telMemVal');
        const tasksCount = this.container.querySelector('#telTasksCount');
        const sourceBadge = this.container.querySelector('#taskmgrSourceBadge');

        const cpuPercent = Number(sysInfo.cpuPercent);
        const hasCpuPercent = Number.isFinite(cpuPercent);
        if (cpuVal) cpuVal.textContent = hasCpuPercent ? `${cpuPercent.toFixed(1)}%` : 'N/A';
        if (memVal) memVal.textContent = `${sysInfo.usedMemGB ?? 'N/A'} GB (${sysInfo.memPercent ?? 'N/A'}%)`;
        if (tasksCount) tasksCount.textContent = this.processes.length;
        if (sourceBadge) {
          const verified = this.dataSource === 'HOST_VERIFIED' && sysInfo.source === 'HOST_VERIFIED';
          sourceBadge.textContent = verified ? 'SOURCE: HOST VERIFIED' : 'SOURCE: SIMULATED FALLBACK';
          sourceBadge.style.color = verified ? '#00ff66' : '#ffaa00';
          const hostStatus = this.container.querySelector('#taskmgrHostStatus');
          if (hostStatus) hostStatus.textContent = verified ? 'SYSTEM SOURCE: HOST VERIFIED' : 'SYSTEM SOURCE: SIMULATED FALLBACK';
        }

        if (hasCpuPercent) this.cpuHistory.push(cpuPercent);
        if (this.cpuHistory.length > 12) this.cpuHistory.shift();

        if (Number.isFinite(Number(sysInfo.memPercent))) this.memHistory.push(Number(sysInfo.memPercent));
        if (this.memHistory.length > 12) this.memHistory.shift();

        this.renderTelemetryGraphs();
      }

      this.renderProcessTable();
    } catch (e) {}
  }

  renderTelemetryGraphs() {
    const cpuBox = this.container.querySelector('#telCpuGraphBox');
    const memBox = this.container.querySelector('#telMemGraphBox');

    if (cpuBox) cpuBox.innerHTML = this.generateWaveSvg(this.cpuHistory, '#00ff66', 100);
    if (memBox) memBox.innerHTML = this.generateWaveSvg(this.memHistory, '#00e5ff', 100);
  }

  generateWaveSvg(history, color, maxVal) {
    if (!history || history.length < 2) return '';
    const width = 240;
    const height = 36;

    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - (Math.min(val, maxVal) / maxVal) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return `
      <svg class="tel-wave-svg" viewBox="0 0 ${width} ${height}">
        <polygon points="0,${height} ${points} ${width},${height}" fill="${color}22" />
        <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  }

  renderProcessTable() {
    if (!this.container) return;
    const listEl = this.container.querySelector('#taskmgrRowsList');
    const summaryEl = this.container.querySelector('#taskmgrSummaryTxt');
    if (!listEl) return;

    let displayList = this.processes;
    if (this.searchQuery) {
      displayList = this.processes.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery) || String(p.pid).includes(this.searchQuery)
      );
    }

    // Sort
    displayList.sort((a, b) => {
      let valA = a[this.sortBy];
      let valB = b[this.sortBy];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.sortAsc ? -1 : 1;
      if (valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });

    if (summaryEl) summaryEl.textContent = `Showing ${displayList.length} of ${this.processes.length} active process(es)`;

    let html = '';
    displayList.forEach(p => {
      const cpuNum = parseFloat(p.cpu) || 0;
      const cpuColor = cpuNum > 120 ? '#ff2255' : cpuNum > 30 ? '#ffaa00' : '#00ff66';
      const safeName = this.escapeHtml(p.name);

      html += `
        <div class="task-row" data-pid="${p.pid}">
          <div class="t-col t-pid">${p.pid}</div>
          <div class="t-col t-name"><strong>${safeName}</strong></div>
          <div class="t-col t-mem">${p.memMB.toLocaleString()} MB</div>
          <div class="t-col t-cpu" style="color: ${cpuColor}; font-weight: bold;">${p.cpu}s</div>
          <div class="t-col t-status"><span class="status-badge live">${this.escapeHtml(p.status)}</span></div>
          <div class="t-col t-action">
            <button class="btn-kill-proc" data-pid="${p.pid}" title="Terminate Process">💀 KILL</button>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;

    // Bind Kill Buttons
    listEl.querySelectorAll('.btn-kill-proc').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const pid = btn.dataset.pid;
        const process = this.processes.find(item => String(item.pid) === String(pid));
        const name = process?.name || `PID ${pid}`;

        if (confirm(`Terminate process '${name}' (PID: ${pid})?`)) {
          const res = await systemBridge.killProcess(pid);
          if (res.success) {
            if (this.toasts) this.toasts.show('SUCCESS', `Terminated '${name}' [PID: ${pid}]`, 2500);
            await this.fetchProcesses();
          } else {
            alert(`Process termination note: ${res.error || 'Done.'}`);
          }
        }
      });
    });
  }

  escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  startPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      if (!this.isPaused) {
        this.fetchProcesses();
      }
    }, 3000);
  }

  stopPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = null;
  }

  destroy() {
    this.stopPolling();
  }
}

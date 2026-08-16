/**
 * CYBER//TYPE REAL-TIME CYBER INTELLIGENCE & TELEMETRY MATRIX
 * Live Crypto/Stock Market Fluctuations, AI Frontier Wire, Cyber Defcon Alerts, Developer Tech Radar & World Clocks.
 * Interactive category filters, real-time SVG sparklines, and auto-refresh stream.
 */

export const INITIAL_MARKETS = [
  { id: 'btc', symbol: 'BTC/USD', name: 'Bitcoin Network', price: 96420.50, delta: 5.82, unit: '₿', history: [92000, 93100, 92800, 94500, 95200, 96420] },
  { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA AI Chips', price: 142.80, delta: 4.31, unit: '$', history: [134, 136, 135, 139, 141, 142.8] },
  { id: 'hack', symbol: 'HACK:ETF', name: 'NASDAQ Cyber Index', price: 428.15, delta: 2.14, unit: '$', history: [418, 420, 422, 421, 425, 428.15] },
  { id: 'eth', symbol: 'ETH/USD', name: 'Ethereum Gas: 14Gwei', price: 3580.00, delta: -0.85, unit: 'Ξ', history: [3620, 3600, 3590, 3610, 3570, 3580] }
];

export const INTEL_STREAM_DATA = [
  {
    id: 'intel_01',
    category: 'ai',
    tag: 'AI/NEURAL',
    level: 'DEFCON-2',
    color: '#00e5ff',
    title: 'OpenAI & DeepSeek Deploy 100M Context Window Lattice',
    desc: 'โมเดล Large Reasoning Model รุ่นใหม่รองรับการประมวลผล Multi-modal 10 ล้านโทเคนแบบ Zero-latency พร้อมระบบตรวจสอบความถูกต้องทางคณิตศาสตร์ 99.4%'
  },
  {
    id: 'intel_02',
    category: 'security',
    tag: '0-DAY ALERT',
    level: 'DEFCON-1',
    color: '#ff2255',
    title: 'Critical RCE Vulnerability Patched in Global OpenSSL Core',
    desc: 'พบช่องโหว่ Buffer Overflow ระดับวิกฤต (CVE-2026-9041) กระทบเซิร์ฟเวอร์ Cloud ทั่วโลก ทีมพัฒนาเร่งปล่อยแพตช์อุดช่องโหว่เร่งด่วน'
  },
  {
    id: 'intel_03',
    category: 'tech',
    tag: 'HARDWARE/AI',
    level: 'NOMINAL',
    color: '#00ff66',
    title: 'NVIDIA Blackwell Ultra B300 Sets 1.2 ExaFLOPS Benchmark',
    desc: 'คลัสเตอร์ซูเปอร์คอมพิวเตอร์สถาปัตยกรรม NVLink 5.0 ทำลายสถิติการเทรน AI ข้ามดาต้าเซ็นเตอร์ด้วยแบนด์วิดท์ 1.8 TB/s'
  },
  {
    id: 'intel_04',
    category: 'code',
    tag: 'DEV/RUNTIME',
    level: 'INFO',
    color: '#ffaa00',
    title: 'Python 3.13 Free-Threaded GIL-less Mode Delivers 45% Speedup',
    desc: 'นักพัฒนาทั่วโลกเริ่ม Migrate สู่ Python ไร้ GIL ช่วยให้ Multithreading รันได้เต็มประสิทธิภาพบน CPU Multi-core อย่างแท้จริง'
  },
  {
    id: 'intel_05',
    category: 'security',
    tag: 'DEFCON-2',
    level: 'DARKNET',
    color: '#b000ff',
    title: 'Satellite Uplink Infiltration Intercepted by NetWatch',
    desc: 'หน่วยต่อต้านอาชญากรรมไซเบอร์สกัดกั้นการแฮกสถานีส่งสัญญาณดาวเทียมวงโคจรต่ำ ยึด Payload ขนาด 2.4 TB สำเร็จ'
  },
  {
    id: 'intel_06',
    category: 'tech',
    tag: 'QUANTUM/QPU',
    level: 'BREAKTHROUGH',
    color: '#00e5ff',
    title: '5,000-Qubit Quantum Processor Achieves Fault-Tolerant Lattice',
    desc: 'ห้องแล็บ Quantum เผยความสำเร็จในการแก้ไข Quantum Error Correction (QEC) แบบเรียลไทม์เป็นครั้งแรกของโลก'
  }
];

export class CyberIntelFeed {
  constructor(app, soundEngine) {
    this.app = app;
    this.sound = soundEngine;

    this.container = null;
    this.markets = JSON.parse(JSON.stringify(INITIAL_MARKETS));
    this.activeFilter = 'all';
    this.isPaused = false;
    this.isCollapsed = false;

    this.marketInterval = null;
    this.clockInterval = null;
  }

  init(containerEl) {
    this.container = containerEl;
    if (!this.container) return;

    this.renderLayout();
    this.startTimers();
  }

  renderLayout() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="cyber-intel-panel ${this.isCollapsed ? 'collapsed' : ''}" id="cyberIntelPanel">
        <!-- 1. Header Toolbar -->
        <div class="intel-header-bar">
          <div class="intel-title-group">
            <span class="radar-pulse-dot"></span>
            <span class="intel-title">CYBER//INTEL RADAR</span>
            <span class="intel-live-badge">2.4 GHz LIVE</span>
          </div>

          <div class="intel-header-controls">
            <button class="intel-ctrl-btn" id="intelBtnRefresh" title="Force Refresh Feed">🔄</button>
            <button class="intel-ctrl-btn" id="intelBtnPause" title="Pause / Resume Live Updates">⏸</button>
            <button class="intel-ctrl-btn intel-btn-toggle" id="intelBtnToggle" title="Collapse / Expand Radar">◀</button>
          </div>
        </div>

        <div class="intel-body-scroll">
          <!-- 2. Global Clocks HUD -->
          <div class="intel-clocks-bar">
            <div class="clock-item"><span>BKK</span> <strong id="clockBkk">--:--:--</strong></div>
            <div class="clock-item"><span>UTC</span> <strong id="clockUtc">--:--:--</strong></div>
            <div class="clock-item"><span>NYC</span> <strong id="clockNyc">--:--:--</strong></div>
            <div class="clock-item"><span>TYO</span> <strong id="clockTyo">--:--:--</strong></div>
          </div>

          <!-- 3. Real-Time Markets & Crypto Telemetry Grid -->
          <div class="intel-section-title">
            <span>📈 QUANTUM MARKETS & TECH STOCKS</span>
            <span class="market-status-tag">NASDAQ // CRYPTO</span>
          </div>

          <div class="markets-grid" id="marketsGrid">
            <!-- Market Cards rendered dynamically -->
          </div>

          <!-- 4. Category Filter Chips -->
          <div class="intel-filter-tabs">
            <button class="intel-tab active" data-filter="all">🌐 ALL WIRE</button>
            <button class="intel-tab" data-filter="markets">📈 MARKETS</button>
            <button class="intel-tab" data-filter="ai">🤖 AI / TECH</button>
            <button class="intel-tab" data-filter="security">🛡️ SECURITY</button>
          </div>

          <!-- 5. Live Cyber Intelligence Stream Feed -->
          <div class="intel-stream-container" id="intelStreamContainer">
            <!-- News items rendered dynamically -->
          </div>

          <!-- 6. Developer Tech Stack Radar Tags -->
          <div class="dev-radar-box">
            <div class="dev-radar-title">⚡ TRENDING DEV STACK:</div>
            <div class="dev-radar-tags">
              <span class="d-tag">Rust 2024</span>
              <span class="d-tag">Python 3.13</span>
              <span class="d-tag">WebGPU</span>
              <span class="d-tag">TypeScript 5.6</span>
              <span class="d-tag">CUDA 13</span>
              <span class="d-tag">Next.js 15</span>
              <span class="d-tag">Tailwind v4</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderMarkets();
    this.renderNewsFeed();
    this.bindEvents();
    this.updateClocks();
  }

  bindEvents() {
    const btnRefresh = this.container.querySelector('#intelBtnRefresh');
    const btnPause = this.container.querySelector('#intelBtnPause');
    const btnToggle = this.container.querySelector('#intelBtnToggle');
    const tabs = this.container.querySelectorAll('.intel-tab');

    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        this.randomizeMarkets();
        this.renderNewsFeed();
        if (this.sound) this.sound.playSuccessFanfare();
      });
    }

    if (btnPause) {
      btnPause.addEventListener('click', () => {
        this.isPaused = !this.isPaused;
        btnPause.textContent = this.isPaused ? '▶' : '⏸';
        btnPause.classList.toggle('paused', this.isPaused);
        if (this.sound) this.sound.playKey(false);
      });
    }

    if (btnToggle) {
      btnToggle.addEventListener('click', () => this.toggleCollapse());
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeFilter = tab.dataset.filter;
        this.renderNewsFeed();
        if (this.sound) this.sound.playKey(false);
      });
    });
  }

  renderMarkets() {
    if (!this.container) return;
    const grid = this.container.querySelector('#marketsGrid');
    if (!grid) return;

    let html = '';
    this.markets.forEach(m => {
      const isPositive = m.delta >= 0;
      const deltaClass = isPositive ? 'pos' : 'neg';
      const arrow = isPositive ? '▲' : '▼';
      const sparklineSvg = this.generateSparkline(m.history, isPositive);

      html += `
        <div class="market-card ${deltaClass}">
          <div class="m-card-top">
            <span class="m-symbol">${m.symbol}</span>
            <span class="m-delta ${deltaClass}">${arrow} ${Math.abs(m.delta).toFixed(2)}%</span>
          </div>
          <div class="m-card-mid">
            <span class="m-price">${m.unit} ${m.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span class="m-name">${m.name}</span>
          </div>
          <div class="m-sparkline-box">
            ${sparklineSvg}
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;
  }

  generateSparkline(history, isPositive) {
    if (!history || history.length < 2) return '';
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = (max - min) || 1;
    const width = 120;
    const height = 28;

    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const strokeColor = isPositive ? '#00ff66' : '#ff3366';
    const fillColor = isPositive ? 'rgba(0, 255, 102, 0.12)' : 'rgba(255, 51, 102, 0.12)';

    return `
      <svg class="sparkline-svg" viewBox="0 0 ${width} ${height}">
        <polygon points="0,${height} ${points} ${width},${height}" fill="${fillColor}" />
        <polyline points="${points}" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  }

  renderNewsFeed() {
    const container = this.container.querySelector('#intelStreamContainer');
    if (!container) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let filtered = INTEL_STREAM_DATA;
    if (this.activeFilter === 'markets') {
      filtered = INTEL_STREAM_DATA.filter(item => item.category === 'markets' || item.category === 'tech');
    } else if (this.activeFilter === 'ai') {
      filtered = INTEL_STREAM_DATA.filter(item => item.category === 'ai' || item.category === 'tech' || item.category === 'code');
    } else if (this.activeFilter === 'security') {
      filtered = INTEL_STREAM_DATA.filter(item => item.category === 'security');
    }

    let html = '';
    filtered.forEach((item, idx) => {
      const minAgo = idx * 4 + 1;
      html += `
        <div class="intel-news-card" style="border-left-color: ${item.color};">
          <div class="news-card-header">
            <span class="news-tag" style="background: ${item.color}22; color: ${item.color}; border: 1px solid ${item.color}66;">${item.tag}</span>
            <span class="news-level">${item.level}</span>
            <span class="news-time">${minAgo}m ago // ${timeStr}</span>
          </div>
          <div class="news-card-title">${item.title}</div>
          <div class="news-card-desc">${item.desc}</div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  startTimers() {
    // 1. Markets fluctuation timer (every 4 seconds)
    if (this.marketInterval) clearInterval(this.marketInterval);
    this.marketInterval = setInterval(() => {
      if (!this.isPaused) {
        this.randomizeMarkets();
      }
    }, 4000);

    // 2. World Clocks timer (every 1 second)
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.clockInterval = setInterval(() => {
      this.updateClocks();
    }, 1000);
  }

  randomizeMarkets() {
    this.markets.forEach(m => {
      const changePct = (Math.random() * 1.8 - 0.85); // -0.85% to +0.95%
      const newPrice = Math.max(1, m.price * (1 + changePct / 100));
      m.price = newPrice;
      m.delta = ((newPrice - m.history[0]) / m.history[0]) * 100;
      m.history.push(newPrice);
      if (m.history.length > 8) m.history.shift();
    });

    this.renderMarkets();
  }

  updateClocks() {
    if (!this.container) return;
    const now = new Date();

    const formatTz = (offsetHours) => {
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const target = new Date(utc + (3600000 * offsetHours));
      return target.toTimeString().split(' ')[0];
    };

    const bkkEl = this.container.querySelector('#clockBkk');
    const utcEl = this.container.querySelector('#clockUtc');
    const nycEl = this.container.querySelector('#clockNyc');
    const tyoEl = this.container.querySelector('#clockTyo');

    if (bkkEl) bkkEl.textContent = formatTz(7);
    if (utcEl) utcEl.textContent = formatTz(0);
    if (nycEl) nycEl.textContent = formatTz(-4);
    if (tyoEl) tyoEl.textContent = formatTz(9);
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    const panel = this.container.querySelector('#cyberIntelPanel');
    const btnToggle = this.container.querySelector('#intelBtnToggle');

    if (panel) panel.classList.toggle('collapsed', this.isCollapsed);
    if (btnToggle) {
      btnToggle.textContent = this.isCollapsed ? '▶' : '◀';
    }
    if (this.sound) this.sound.playKey(false);
  }

  destroy() {
    if (this.marketInterval) clearInterval(this.marketInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
  }
}

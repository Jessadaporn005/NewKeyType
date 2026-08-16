/**
 * WATCH DOGS & NORSE LIVE CYBER THREAT WAR GLOBE
 * Renders real-time 2.5D cyber attack missile arcs shooting between global cities
 */

export class CyberThreatGlobeEngine {
  constructor(canvasEl, tickerEl) {
    this.canvas = canvasEl;
    this.ticker = tickerEl;
    this.ctx = canvasEl ? canvasEl.getContext('2d') : null;
    this.animId = null;

    this.cities = [
      { name: 'WASHINGTON', x: 220, y: 140, color: '#00e5ff' },
      { name: 'FRANKFURT',  x: 480, y: 120, color: '#00ff66' },
      { name: 'MOSCOW',     x: 580, y: 100, color: '#ff2255' },
      { name: 'BANGKOK',    x: 690, y: 220, color: '#ffaa00' },
      { name: 'TOKYO',      x: 820, y: 160, color: '#00e5ff' },
      { name: 'SINGAPORE',  x: 710, y: 260, color: '#00ff66' }
    ];

    this.missiles = [];
    this.attackTypes = ['0-DAY EXPLOIT', 'DDOS SYN FLOOD', 'RANSOMWARE PAYLOAD', 'KERNEL INTRUSION', 'SATELLITE HIJACK'];
  }

  start() {
    if (!this.canvas || !this.ctx) return;
    this.resize();
    this.spawnMissileLoop();
    this.render();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.offsetWidth || 860;
    this.canvas.height = this.canvas.offsetHeight || 320;
  }

  spawnMissileLoop() {
    this.spawnInterval = setInterval(() => {
      const src = this.cities[Math.floor(Math.random() * this.cities.length)];
      let dst = this.cities[Math.floor(Math.random() * this.cities.length)];
      while (dst === src) {
        dst = this.cities[Math.floor(Math.random() * this.cities.length)];
      }

      const atkType = this.attackTypes[Math.floor(Math.random() * this.attackTypes.length)];
      this.missiles.push({
        src, dst,
        progress: 0,
        speed: 0.015 + Math.random() * 0.02,
        color: src.color,
        type: atkType
      });

      if (this.ticker) {
        const item = document.createElement('div');
        item.className = 'threat-ticker-item';
        item.innerHTML = `<span style="color:${src.color}">[${src.name} ➔ ${dst.name}]</span> <strong>${atkType}</strong> - ${Math.floor(100 + Math.random()*900)} Gbps`;
        this.ticker.appendChild(item);
        if (this.ticker.children.length > 6) {
          this.ticker.removeChild(this.ticker.firstChild);
        }
        this.ticker.scrollTop = this.ticker.scrollHeight;
      }
    }, 800);
  }

  render() {
    if (!this.ctx) return;
    this.ctx.fillStyle = 'rgba(2, 6, 4, 0.25)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Grid & World Dots
    this.ctx.strokeStyle = 'rgba(0, 255, 102, 0.08)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // Draw Cities
    this.cities.forEach(c => {
      this.ctx.fillStyle = c.color;
      this.ctx.shadowColor = c.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      this.ctx.fillStyle = '#889988';
      this.ctx.font = '10px monospace';
      this.ctx.fillText(c.name, c.x + 8, c.y + 4);
    });

    // Draw Missile Arcs
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.progress += m.speed;

      const sx = m.src.x;
      const sy = m.src.y;
      const dx = m.dst.x;
      const dy = m.dst.y;

      const mx = (sx + dx) / 2;
      const my = Math.min(sy, dy) - 60; // Curved arc height

      // Current head position on quadratic curve
      const t = m.progress;
      const curX = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * mx + t * t * dx;
      const curY = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * my + t * t * dy;

      this.ctx.strokeStyle = m.color;
      this.ctx.shadowColor = m.color;
      this.ctx.shadowBlur = 8;
      this.ctx.lineWidth = 2;

      this.ctx.beginPath();
      this.ctx.arc(curX, curY, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();

      if (m.progress >= 1) {
        this.missiles.splice(i, 1);
      }
    }

    this.animId = requestAnimationFrame(() => this.render());
  }

  stop() {
    if (this.spawnInterval) clearInterval(this.spawnInterval);
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

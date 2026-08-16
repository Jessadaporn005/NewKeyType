/**
 * CYBER//TYPE PARTICLE & GLITCH FX ENGINE
 * Renders high-performance typing sparks, combos, and screen glitch pulses.
 */

export class ParticleEffectEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animFrame = null;
    this.themeColor = '#00ff66';
    this.initCanvas();
  }

  initCanvas() {
    let el = document.getElementById('cyberParticleCanvas');
    if (!el) {
      el = document.createElement('canvas');
      el.id = 'cyberParticleCanvas';
      el.className = 'cyber-particle-canvas';
      document.body.appendChild(el);
    }
    this.canvas = el;
    this.ctx = el.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setThemeColor(hex) {
    this.themeColor = hex || '#00ff66';
  }

  emit(x, y, count = 8, color = null) {
    const c = color || this.themeColor;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      this.particles.push({
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02,
        size: Math.random() * 3 + 1.5,
        color: c
      });
    }
  }

  emitAtElement(element, count = 6, color = null) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    this.emit(x, y, count, color);
  }

  triggerGlitchShake(intensity = 6) {
    const root = document.getElementById('windowsTerminalRoot') || document.body;
    root.classList.add('screen-glitch-shake');
    setTimeout(() => {
      root.classList.remove('screen-glitch-shake');
    }, 180);
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    this.animFrame = requestAnimationFrame(() => this.loop());
  }
}

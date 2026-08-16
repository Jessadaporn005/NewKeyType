/**
 * CINEMATIC MATRIX DIGITAL RAIN & PARTICLE PHYSICS ENGINE
 * Authentic Hollywood movie rain with multi-speed layers, glowing white heads,
 * mutating Katakana/Hex glyphs, and keypress spark explosions.
 */

export class MatrixVisualEngine {
  constructor(matrixCanvasId, particleCanvasId) {
    this.mCanvas = document.getElementById(matrixCanvasId);
    this.mCtx = this.mCanvas.getContext('2d');
    this.pCanvas = document.getElementById(particleCanvasId);
    this.pCtx = this.pCanvas.getContext('2d');

    this.fontSize = 16;
    this.columns = 0;
    this.drops = [];
    this.speeds = [];
    this.particles = [];
    this.enabled = true;
    this.particlesEnabled = true;

    this.themeColor = '#00ff66';
    this.themeColorDim = 'rgba(0, 255, 102, 0.25)';

    // Rich matrix characters: Japanese Half-width Katakana + Hex + Cyber symbols
    this.characters = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789ABCDEF!@#$%&*+-/<>~{}[]=';

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mCanvas.width = this.width;
    this.mCanvas.height = this.height;
    this.pCanvas.width = this.width;
    this.pCanvas.height = this.height;

    this.columns = Math.floor(this.width / this.fontSize);
    this.drops = [];
    this.speeds = [];

    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.floor(Math.random() * -60);
      // Multi-layer speed for 3D depth illusion
      this.speeds[i] = 0.8 + Math.random() * 0.9;
    }
  }

  setTheme(colorHex, colorDimRgba) {
    this.themeColor = colorHex;
    this.themeColorDim = colorDimRgba;
  }

  /**
   * Emit cyber sparks from a pressed key element
   */
  emitKeySparks(x, y, count = 12) {
    if (!this.particlesEnabled) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 5.0;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 2.0 + Math.random() * 3.5,
        alpha: 1.0,
        decay: 0.025 + Math.random() * 0.035,
        color: this.themeColor
      });
    }
  }

  emitFromElement(el) {
    if (!el || !this.particlesEnabled) return;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    this.emitKeySparks(x, y, 10);
  }

  animate() {
    // 1. Draw Cinematic Matrix Rain
    if (this.enabled) {
      // Semi-transparent fade background creating smooth trailing streams
      this.mCtx.fillStyle = 'rgba(6, 10, 8, 0.12)';
      this.mCtx.fillRect(0, 0, this.width, this.height);

      this.mCtx.font = `bold ${this.fontSize}px 'Cascadia Mono', 'Share Tech Mono', monospace`;

      for (let i = 0; i < this.columns; i++) {
        const text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
        const x = i * this.fontSize;
        const y = this.drops[i] * this.fontSize;

        // Draw leading character with bright glowing white/cyan
        if (Math.random() > 0.88) {
          this.mCtx.fillStyle = '#ffffff';
          this.mCtx.shadowBlur = 10;
          this.mCtx.shadowColor = '#ffffff';
        } else {
          this.mCtx.fillStyle = this.themeColor;
          this.mCtx.shadowBlur = 6;
          this.mCtx.shadowColor = this.themeColor;
        }

        if (y > 0 && y < this.height + 50) {
          this.mCtx.fillText(text, x, y);
        }

        // Reset shadow
        this.mCtx.shadowBlur = 0;

        // Reset column to top randomly when it goes off screen
        if (y > this.height && Math.random() > 0.975) {
          this.drops[i] = 0;
        }

        this.drops[i] += this.speeds[i];
      }
    } else {
      this.mCtx.clearRect(0, 0, this.width, this.height);
    }

    // 2. Draw Key Particles
    this.pCtx.clearRect(0, 0, this.width, this.height);
    if (this.particlesEnabled && this.particles.length > 0) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.pCtx.save();
        this.pCtx.globalAlpha = p.alpha;
        this.pCtx.fillStyle = p.color;
        this.pCtx.shadowBlur = 10;
        this.pCtx.shadowColor = p.color;
        this.pCtx.beginPath();
        this.pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.pCtx.fill();
        this.pCtx.restore();
      }
    }

    requestAnimationFrame(this.animate);
  }
}

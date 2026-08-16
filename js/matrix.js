/**
 * CINEMATIC MATRIX DIGITAL RAIN & LOG STREAM ENGINE
 * Authentic Hollywood movie rain with multi-speed layers, glowing white heads,
 * mutating Katakana/Hex glyphs, streaming kernel logs & memory offsets, and keypress spark explosions.
 */

export const MATRIX_LOG_SNIPPETS = [
  '0x7FFF0042', 'SYSCALL_ENTER', 'AES_256_GCM', 'TCP_SYN_ACK', 'ROOT_AUTH_OK',
  'MEM_PFN_ALLOC', 'PAGE_TABLE_MAP', 'CPU_RING_0', 'TLS_v1.3', 'DMESG_BOOT_OK',
  'QUANTUM_CORE', '01001100', '0xDEADBEEF', 'STACK_POINTER', 'CALL_VECTOR',
  'IP_PACKET_FWD', 'DEFCON_1', 'SHA256_HASH', 'RSA_8192', 'INODE_SYNC',
  'EPOLL_WAIT', 'MUTEX_LOCKED', 'VIRT_MEM_MAP', 'KERNEL_EXEC', 'NET_SOCKET_443',
  'RING_BUFFER', 'SIGINT_TRAP', 'OVERCLOCK_14G', 'NEURAL_SYNAPSE', 'AIRWAVE_SCAN'
];

export class MatrixVisualEngine {
  constructor(matrixCanvasId, particleCanvasId) {
    this.mCanvas = document.getElementById(matrixCanvasId);
    this.mCtx = this.mCanvas ? this.mCanvas.getContext('2d') : null;
    this.pCanvas = document.getElementById(particleCanvasId);
    this.pCtx = this.pCanvas ? this.pCanvas.getContext('2d') : null;

    this.fontSize = 15;
    this.columns = 0;
    this.drops = [];
    this.columnTypes = []; // 'glyph' | 'log_stream' | 'hex_stream'
    this.columnWords = [];
    this.speeds = [];
    this.particles = [];
    this.enabled = true;
    this.particlesEnabled = true;

    this.themeColor = '#00ff66';
    this.themeColorDim = 'rgba(0, 255, 102, 0.35)';

    // Rich matrix characters: Japanese Half-width Katakana + Hex + Cyber symbols
    this.characters = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789ABCDEF!@#$%&*+-/<>~{}[]=';

    if (this.mCanvas) {
      this.init();
    }
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    if (!this.mCanvas || !this.pCanvas) return;
    this.width = window.innerWidth || 1920;
    this.height = window.innerHeight || 1080;
    this.mCanvas.width = this.width;
    this.mCanvas.height = this.height;
    this.pCanvas.width = this.width;
    this.pCanvas.height = this.height;

    this.columns = Math.max(1, Math.floor(this.width / this.fontSize));
    this.drops = [];
    this.speeds = [];
    this.columnTypes = [];
    this.columnWords = [];

    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.floor(Math.random() * -80);
      // Multi-layer speed for 3D depth illusion
      this.speeds[i] = 0.75 + Math.random() * 0.95;
      
      // 30% log snippet streams, 70% glyph rain
      const isLog = (i % 3 === 0);
      this.columnTypes[i] = isLog ? 'log_stream' : 'glyph';
      this.columnWords[i] = MATRIX_LOG_SNIPPETS[Math.floor(Math.random() * MATRIX_LOG_SNIPPETS.length)];
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
    if (!this.particlesEnabled || !this.pCtx) return;

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
    if (!this.mCtx || !this.pCtx) {
      requestAnimationFrame(this.animate);
      return;
    }

    // 1. Draw Cinematic Matrix Rain & Log Stream
    if (this.enabled) {
      // Semi-transparent fade background creating smooth trailing streams
      this.mCtx.fillStyle = 'rgba(3, 7, 5, 0.14)';
      this.mCtx.fillRect(0, 0, this.width, this.height);

      this.mCtx.font = `bold ${this.fontSize}px 'Cascadia Mono', 'Share Tech Mono', monospace`;

      for (let i = 0; i < this.columns; i++) {
        const type = this.columnTypes[i];
        let text = '';
        
        if (type === 'log_stream') {
          const word = this.columnWords[i];
          const charIdx = Math.abs(Math.floor(this.drops[i])) % word.length;
          text = word.charAt(charIdx);
        } else {
          text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
        }

        const x = i * this.fontSize;
        const y = this.drops[i] * this.fontSize;

        // Draw leading character with bright glowing white/cyan
        const isLeading = (Math.random() > 0.82);
        if (isLeading) {
          this.mCtx.fillStyle = '#ffffff';
          this.mCtx.shadowBlur = 12;
          this.mCtx.shadowColor = '#00e5ff';
        } else {
          this.mCtx.fillStyle = (i % 4 === 0) ? '#00e5ff' : this.themeColor;
          this.mCtx.shadowBlur = 8;
          this.mCtx.shadowColor = this.themeColor;
        }

        if (y > 0 && y < this.height + 50) {
          this.mCtx.fillText(text, x, y);
        }

        // Reset shadow
        this.mCtx.shadowBlur = 0;

        // Reset column to top randomly when it goes off screen
        if (y > this.height && Math.random() > 0.972) {
          this.drops[i] = 0;
          this.columnWords[i] = MATRIX_LOG_SNIPPETS[Math.floor(Math.random() * MATRIX_LOG_SNIPPETS.length)];
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

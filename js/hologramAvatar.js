/**
 * CYBER//TYPE DIGITAL HOLOGRAM AVATAR RENDERER
 * Renders an animated Cyberpunk Matrix-Code Silhouette Avatar
 * with falling code streams, neural nodes, scanlines, and holographic glitch pulses.
 */

export class HologramAvatar {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animFrame = null;
    this.chars = '0123456789ABCDEF0x#*%$&@+=-:<>[]{}QUANTUMNETRUNNER';
    this.columns = [];
    this.fontSize = 11;
    this.scanY = 0;
    this.glitchTimer = 0;
  }

  start(canvasEl) {
    if (!canvasEl) return;
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.resize();

    // Initialize code columns
    const colCount = Math.floor(this.canvas.width / this.fontSize);
    this.columns = [];
    for (let c = 0; c < colCount; c++) {
      this.columns.push({
        y: Math.random() * this.canvas.height,
        speed: 1.5 + Math.random() * 2.5,
        char: this.getRandomChar()
      });
    }

    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.loop();
  }

  stop() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    } else {
      this.canvas.width = 280;
      this.canvas.height = 150;
    }
  }

  getRandomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  loop() {
    if (!this.canvas || !this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.clearRect(0, 0, w, h);

    // 1. Draw Silhouette Path to define clip region
    this.ctx.save();
    this.defineSilhouettePath(w, h);
    this.ctx.clip();

    // 2. Dark silhouette background fill
    this.ctx.fillStyle = 'rgba(0, 20, 10, 0.75)';
    this.ctx.fillRect(0, 0, w, h);

    // 3. Falling Matrix Log-Code streams inside the silhouette
    this.ctx.font = `${this.fontSize}px monospace`;
    this.columns.forEach((col, idx) => {
      const x = idx * this.fontSize;
      col.y += col.speed;
      if (col.y > h) {
        col.y = -this.fontSize;
        col.char = this.getRandomChar();
      }

      // Trailing characters
      for (let trail = 0; trail < 7; trail++) {
        const ty = col.y - trail * this.fontSize;
        if (ty >= 0 && ty <= h) {
          const alpha = 1.0 - (trail / 7);
          if (trail === 0) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowColor = '#00ff66';
            this.ctx.shadowBlur = 6;
          } else if (trail === 1) {
            this.ctx.fillStyle = '#00f0ff';
            this.ctx.shadowBlur = 3;
          } else {
            this.ctx.fillStyle = `rgba(0, 255, 102, ${alpha * 0.75})`;
            this.ctx.shadowBlur = 0;
          }
          const charToDraw = (trail === 0 || Math.random() > 0.8) ? this.getRandomChar() : col.char;
          this.ctx.fillText(charToDraw, x, ty);
        }
      }
    });

    this.ctx.restore();

    // 4. Draw Glowing Silhouette Outline & Visor
    this.ctx.save();
    this.ctx.strokeStyle = '#00ff66';
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowColor = '#00ff66';
    this.ctx.shadowBlur = 8;
    this.defineSilhouettePath(w, h);
    this.ctx.stroke();

    // Neural Nodes & Cyber Visor Lines
    this.drawCyberneticOverlays(w, h);
    this.ctx.restore();

    // 5. Holographic Scanline
    this.scanY = (this.scanY + 1.8) % h;
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    this.ctx.fillRect(0, this.scanY, w, 2);
    this.ctx.restore();

    this.animFrame = requestAnimationFrame(() => this.loop());
  }

  defineSilhouettePath(w, h) {
    const cx = w / 2;
    const cy = h * 0.42;

    this.ctx.beginPath();
    
    // Head Top
    this.ctx.arc(cx, cy, h * 0.24, Math.PI * 0.85, Math.PI * 0.15, false);

    // Jaw / Chin
    this.ctx.lineTo(cx + w * 0.09, cy + h * 0.26);
    this.ctx.lineTo(cx + w * 0.04, cy + h * 0.32);
    this.ctx.lineTo(cx - w * 0.04, cy + h * 0.32);
    this.ctx.lineTo(cx - w * 0.09, cy + h * 0.26);

    // Neck Left
    this.ctx.lineTo(cx - w * 0.08, cy + h * 0.40);
    // Shoulder Left
    this.ctx.lineTo(cx - w * 0.36, h);
    // Base Bottom
    this.ctx.lineTo(cx + w * 0.36, h);
    // Shoulder Right
    this.ctx.lineTo(cx + w * 0.08, cy + h * 0.40);
    // Neck Right
    this.ctx.closePath();
  }

  drawCyberneticOverlays(w, h) {
    const cx = w / 2;
    const cy = h * 0.42;

    // Cyber Visor / HUD Glasses
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(cx - w * 0.11, cy - h * 0.04, w * 0.22, h * 0.08, 3);
    this.ctx.fill();
    this.ctx.stroke();

    // Visor Center Reticle
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(cx - 5, cy);
    this.ctx.lineTo(cx + 5, cy);
    this.ctx.stroke();

    // Neural Nodes (Temple / Neck connection points)
    const nodes = [
      { x: cx - w * 0.16, y: cy - h * 0.02 },
      { x: cx + w * 0.16, y: cy - h * 0.02 },
      { x: cx - w * 0.20, y: cy + h * 0.35 },
      { x: cx + w * 0.20, y: cy + h * 0.35 }
    ];

    nodes.forEach(n => {
      this.ctx.fillStyle = '#00f0ff';
      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Small beacon ring
      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
      this.ctx.stroke();
    });
  }
}

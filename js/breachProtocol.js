/**
 * CYBERPUNK 2077: BREACH PROTOCOL MINI-GAME ENGINE
 * Authentic hex code matrix buffer infiltration puzzle game
 */

const HEX_POOL = ['1C', 'BD', 'E9', '55', '7A', 'FF'];

export class BreachProtocolEngine {
  constructor(containerEl, soundEngine, onComplete) {
    this.container = containerEl;
    this.sound = soundEngine;
    this.onComplete = onComplete;

    this.gridSize = 5;
    this.matrix = [];
    this.bufferSize = 5;
    this.buffer = [];
    this.daemons = [];
    this.activeAxis = 'row'; // 'row' | 'col'
    this.selectedRow = 0;
    this.selectedCol = 0;
    this.usedCoords = new Set();
    
    // Configurable Difficulty Settings
    this.baseTimeLeft = 30;
    this.gridSize = 5;
    this.bufferSize = 5;
    
    this.timeLeft = 30;
    this.timerInterval = null;
    this.isActive = false;
  }

  start() {
    this.isActive = true;
    this.buffer = [];
    this.usedCoords.clear();
    this.activeAxis = 'row';
    this.selectedRow = 0;
    this.selectedCol = 0;
    this.timeLeft = this.baseTimeLeft;

    // 1. Generate Matrix
    this.matrix = [];
    for (let r = 0; r < this.gridSize; r++) {
      const row = [];
      for (let c = 0; c < this.gridSize; c++) {
        row.push(HEX_POOL[Math.floor(Math.random() * HEX_POOL.length)]);
      }
      this.matrix.push(row);
    }

    // 2. Generate Daemons
    this.daemons = [
      { name: 'DATAMINE_V1 [CREDITS]', seq: [HEX_POOL[0], HEX_POOL[1]], solved: false },
      { name: 'ICEPICK_V2 [FIREWALL]', seq: [HEX_POOL[2], HEX_POOL[3], HEX_POOL[0]], solved: false },
      { name: 'TURRET_SHUTDOWN_V3', seq: [HEX_POOL[1], HEX_POOL[4], HEX_POOL[5]], solved: false }
    ];

    this.render();
    this.startTimer();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const timerEl = this.container.querySelector('#breachTimerVal');
    if (timerEl) timerEl.textContent = `${this.timeLeft}s`;

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (timerEl) timerEl.textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.finish(false);
      }
    }, 1000);
  }

  render() {
    // 1. Render Matrix Grid
    const gridEl = this.container.querySelector('#breachMatrixGrid');
    if (gridEl) {
      gridEl.innerHTML = '';
      for (let r = 0; r < this.gridSize; r++) {
        const rowEl = document.createElement('div');
        rowEl.className = 'breach-matrix-row';
        for (let c = 0; c < this.gridSize; c++) {
          const cell = document.createElement('div');
          const isUsed = this.usedCoords.has(`${r},${c}`);
          cell.className = 'breach-cell' + (isUsed ? ' used' : '');

          // Active row/col highlighter
          if (this.activeAxis === 'row' && r === this.selectedRow && !isUsed) {
            cell.classList.add('selectable');
          } else if (this.activeAxis === 'col' && c === this.selectedCol && !isUsed) {
            cell.classList.add('selectable');
          }

          cell.textContent = isUsed ? '--' : this.matrix[r][c];
          cell.addEventListener('click', () => this.selectCell(r, c));
          rowEl.appendChild(cell);
        }
        gridEl.appendChild(rowEl);
      }
    }

    // 2. Render Buffer
    const bufferEl = this.container.querySelector('#breachBufferSlots');
    if (bufferEl) {
      bufferEl.innerHTML = '';
      for (let i = 0; i < this.bufferSize; i++) {
        const slot = document.createElement('div');
        slot.className = 'breach-buffer-slot' + (this.buffer[i] ? ' filled' : '');
        slot.textContent = this.buffer[i] || '__';
        bufferEl.appendChild(slot);
      }
    }

    // 3. Render Daemons
    const daemonsEl = this.container.querySelector('#breachDaemonList');
    if (daemonsEl) {
      daemonsEl.innerHTML = '';
      this.daemons.forEach(d => {
        const dEl = document.createElement('div');
        dEl.className = 'breach-daemon-item' + (d.solved ? ' solved' : '');
        dEl.innerHTML = `
          <div class="daemon-name">${d.name} ${d.solved ? '✓ [UPLOADED]' : ''}</div>
          <div class="daemon-seq">${d.seq.join(' > ')}</div>
        `;
        daemonsEl.appendChild(dEl);
      });
    }
  }

  selectCell(r, c) {
    if (!this.isActive) return;
    if (this.usedCoords.has(`${r},${c}`)) return;

    // Validate selectable axis
    if (this.activeAxis === 'row' && r !== this.selectedRow) return;
    if (this.activeAxis === 'col' && c !== this.selectedCol) return;

    // Pick Hex
    const val = this.matrix[r][c];
    this.buffer.push(val);
    this.usedCoords.add(`${r},${c}`);
    this.selectedRow = r;
    this.selectedCol = c;
    this.activeAxis = this.activeAxis === 'row' ? 'col' : 'row';

    this.sound.playKey(false);
    this.checkDaemons();
    this.render();

    // Check completion
    if (this.buffer.length >= this.bufferSize || this.daemons.every(d => d.solved)) {
      this.finish(true);
    }
  }

  checkDaemons() {
    const bufStr = this.buffer.join('');
    this.daemons.forEach(d => {
      const seqStr = d.seq.join('');
      if (bufStr.includes(seqStr)) {
        d.solved = true;
      }
    });
  }

  finish(success) {
    this.isActive = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;

    const solvedCount = this.daemons.filter(d => d.solved).length;
    if (solvedCount > 0 || success) {
      this.sound.playSuccessFanfare();
    }

    if (this.onComplete) {
      this.onComplete({
        solvedCount,
        totalDaemons: this.daemons.length,
        daemons: this.daemons
      });
    }
  }

  cancel() {
    this.isActive = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.buffer = [];
  }
}

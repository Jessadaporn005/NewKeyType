/**
 * CYBER//TYPE HACKING MINIGAMES COLLECTION (Hacky-Inspired)
 * Contains 6 Interactive Hacking Minigames:
 * 1. PortCrackGame (Typing Race)
 * 2. FirewallBypassGame (Arrow Key Sequence)
 * 3. PasswordCrackGame (Wordle Brute-Force)
 * 4. MemoryDumpGame (Hex Sequence Memory)
 * 5. PacketInjectGame (Timing Rhythm Sweet-Spot)
 * 6. DataExtractGame (Speed Burst Extraction)
 */

export class PortCrackGame {
  constructor(soundEngine) {
    this.sound = soundEngine;
    this.timerInterval = null;
  }

  start(container, node, upgrades, onComplete) {
    this.onComplete = onComplete;
    this.container = container;
    this.node = node;

    const exploits = [
      'nmap -sS -A -T4 192.168.1.105',
      'ssh_exploit --target 10.0.4.99 --port 22',
      'hydra -l admin -P /usr/share/wordlists/rockyou.txt',
      'msfconsole -x "use exploit/windows/smb/ms17_010"',
      'sqlmap -u "https://target.corp/api?id=1" --dbs',
      'aircrack-ng -w wordlist.txt -b 00:14:6C:7E:40:80',
      'curl -X POST -d "payload=eval(base64_decode)"',
      'openssl s_client -connect quantum.node:443 -tls1_3'
    ];

    this.targetText = exploits[Math.floor(Math.random() * exploits.length)];
    this.typedIndex = 0;
    this.errors = 0;

    const baseTime = Math.max(8, 18 - (node.depth || 1) * 1.5 + (upgrades.sshCrackV2 ? 4 : 0));
    this.timeLeft = baseTime;
    this.maxTime = baseTime;

    this.render();
    this.startTimer();
  }

  render() {
    this.container.innerHTML = `
      <div class="minigame-card port-crack-card">
        <div class="minigame-header">
          <span class="mg-badge">⚡ PORT CRACK [TIER ${this.node.depth}]</span>
          <span class="mg-target">${this.node.name}</span>
          <span class="mg-timer" id="mgPortTimer">${this.timeLeft.toFixed(1)}s</span>
        </div>
        <div class="mg-progress-track">
          <div class="mg-progress-bar" id="mgPortBar" style="width: 100%;"></div>
        </div>
        <div class="mg-prompt-label">TYPE THE INFILTRATION COMMAND TO EXPLOIT THIS PORT:</div>
        <div class="mg-type-display" id="mgPortDisplay"></div>
        <div class="mg-hints">Press keys to inject exploit payload. Watch the countdown!</div>
      </div>
    `;

    this.renderText();
  }

  renderText() {
    const disp = this.container.querySelector('#mgPortDisplay');
    if (!disp) return;
    disp.innerHTML = '';

    for (let i = 0; i < this.targetText.length; i++) {
      const span = document.createElement('span');
      span.className = 'mg-char';
      span.textContent = this.targetText[i] === ' ' ? ' ' : this.targetText[i];
      if (this.targetText[i] === ' ') span.classList.add('space-char');

      if (i < this.typedIndex) span.classList.add('correct');
      else if (i === this.typedIndex) span.classList.add('current');
      disp.appendChild(span);
    }
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft -= 0.1;
      const bar = this.container.querySelector('#mgPortBar');
      const timer = this.container.querySelector('#mgPortTimer');
      if (bar) bar.style.width = `${Math.max(0, (this.timeLeft / this.maxTime) * 100)}%`;
      if (timer) timer.textContent = `${Math.max(0, this.timeLeft).toFixed(1)}s`;

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.finish(false, 'TIME_OUT');
      }
    }, 100);
  }

  handleKeyDown(e) {
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
    if (e.key === ' ' || e.code === 'Space') e.preventDefault();

    const expected = this.targetText[this.typedIndex];
    if (e.key === expected) {
      this.typedIndex++;
      if (this.sound && this.sound.playKey) this.sound.playKey(false);
      this.renderText();

      if (this.typedIndex >= this.targetText.length) {
        clearInterval(this.timerInterval);
        this.finish(true);
      }
    } else {
      this.errors++;
      if (this.sound && this.sound.playKey) this.sound.playKey(true);
      const cur = this.container.querySelector('.mg-char.current');
      if (cur) {
        cur.classList.add('error-flash');
        setTimeout(() => cur.classList.remove('error-flash'), 150);
      }
    }
  }

  finish(success, reason = null) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.onComplete) this.onComplete(success, { errors: this.errors, reason });
  }
}

export class FirewallBypassGame {
  constructor(soundEngine) {
    this.sound = soundEngine;
  }

  start(container, node, upgrades, onComplete) {
    this.onComplete = onComplete;
    this.container = container;
    this.node = node;

    // Pattern length based on depth: 4 to 8 arrows
    const length = Math.min(8, 3 + (node.depth || 1));
    const directions = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
    const icons = { ArrowUp: '↑', ArrowRight: '→', ArrowDown: '↓', ArrowLeft: '←' };

    this.layersTotal = upgrades.sqlInjector ? 1 : Math.min(3, 1 + Math.floor(node.depth / 3));
    this.currentLayer = 1;
    this.pattern = [];
    this.userStep = 0;

    this.generatePattern(length);
    this.render();
  }

  generatePattern(len) {
    const directions = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
    this.pattern = [];
    for (let i = 0; i < len; i++) {
      this.pattern.push(directions[Math.floor(Math.random() * directions.length)]);
    }
    this.userStep = 0;
  }

  render() {
    const icons = { ArrowUp: '↑', ArrowRight: '→', ArrowDown: '↓', ArrowLeft: '←' };
    this.container.innerHTML = `
      <div class="minigame-card firewall-card">
        <div class="minigame-header">
          <span class="mg-badge">🛡️ FIREWALL BYPASS</span>
          <span class="mg-target">${this.node.name}</span>
          <span class="mg-layer">LAYER ${this.currentLayer}/${this.layersTotal}</span>
        </div>
        <div class="mg-prompt-label">INPUT ARROW KEY SEQUENCE TO ROUTE THROUGH FIREWALL MATRIX:</div>
        <div class="mg-arrow-pattern" id="mgArrowPattern">
          ${this.pattern.map((dir, idx) => `
            <div class="arrow-box ${idx < this.userStep ? 'passed' : idx === this.userStep ? 'active' : ''}">
              ${icons[dir]}
            </div>
          `).join('')}
        </div>
        <div class="mg-hints">Press ↑ (Up), → (Right), ↓ (Down), ← (Left) in exact sequence.</div>
      </div>
    `;
  }

  handleKeyDown(e) {
    if (!['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(e.key)) return;
    e.preventDefault();

    if (e.key === this.pattern[this.userStep]) {
      this.userStep++;
      if (this.sound && this.sound.playKey) this.sound.playKey(false);
      this.render();

      if (this.userStep >= this.pattern.length) {
        if (this.currentLayer < this.layersTotal) {
          this.currentLayer++;
          this.generatePattern(this.pattern.length + 1);
          if (this.sound && this.sound.playSuccessFanfare) this.sound.playSuccessFanfare();
          this.render();
        } else {
          this.finish(true);
        }
      }
    } else {
      // Failed step -> reset layer
      this.userStep = 0;
      if (this.sound && this.sound.playErrorSound) this.sound.playErrorSound();
      const pEl = this.container.querySelector('#mgArrowPattern');
      if (pEl) {
        pEl.classList.add('shake-error');
        setTimeout(() => pEl.classList.remove('shake-error'), 200);
      }
      this.render();
    }
  }

  finish(success) {
    if (this.onComplete) this.onComplete(success, {});
  }
}

export class PasswordCrackGame {
  constructor(soundEngine) {
    this.sound = soundEngine;
  }

  start(container, node, upgrades, onComplete) {
    this.onComplete = onComplete;
    this.container = container;
    this.node = node;

    const words = [
      'CYBER', 'TOKEN', 'GHOST', 'ADMIN', 'PROXY',
      'CIPHER', 'ROOTS', 'SHRED', 'CLOAK', 'STEAL',
      'VAULT', 'TRACE', 'LOGIN', 'PATCH', 'DECOY',
      'DRAIN', 'VIRUS', 'MODEM', 'PULSE', 'RELAY'
    ];

    // Pick 5-letter word
    const fWords = words.filter(w => w.length === 5);
    this.targetWord = fWords[Math.floor(Math.random() * fWords.length)];
    this.maxAttempts = upgrades.instantDecryptor ? 6 : 5;
    this.history = [];
    this.currentGuess = '';

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="minigame-card password-card">
        <div class="minigame-header">
          <span class="mg-badge">🔐 BRUTE-FORCE PASSWORD CRACK</span>
          <span class="mg-target">${this.node.name}</span>
          <span class="mg-attempts">ATTEMPTS: ${this.history.length}/${this.maxAttempts}</span>
        </div>
        <div class="mg-wordle-grid" id="mgWordleGrid">
          ${this.renderWordleRows()}
        </div>
        <div class="mg-wordle-input-area">
          <span class="mg-input-label">GUESS 5-LETTER CIPHER: </span>
          <span class="mg-input-buffer" id="mgWordleBuffer">${this.currentGuess.padEnd(5, '_')}</span>
        </div>
        <div class="mg-hints">🟩 Correct Spot | 🟨 Wrong Spot | ⬛ Not in Word. Press ENTER to submit.</div>
      </div>
    `;
  }

  renderWordleRows() {
    let rowsHtml = '';
    for (let r = 0; r < this.maxAttempts; r++) {
      if (r < this.history.length) {
        const item = this.history[r];
        rowsHtml += `
          <div class="wordle-row">
            ${item.guess.split('').map((char, i) => `
              <div class="wordle-box ${item.feedback[i]}">${char}</div>
            `).join('')}
          </div>
        `;
      } else if (r === this.history.length) {
        rowsHtml += `
          <div class="wordle-row current-row">
            ${Array.from({ length: 5 }).map((_, i) => `
              <div class="wordle-box active">${this.currentGuess[i] || ''}</div>
            `).join('')}
          </div>
        `;
      } else {
        rowsHtml += `
          <div class="wordle-row empty-row">
            ${Array.from({ length: 5 }).map(() => `
              <div class="wordle-box empty"></div>
            `).join('')}
          </div>
        `;
      }
    }
    return rowsHtml;
  }

  handleKeyDown(e) {
    if (e.key === 'Backspace') {
      if (this.currentGuess.length > 0) {
        this.currentGuess = this.currentGuess.slice(0, -1);
        if (this.sound && this.sound.playKey) this.sound.playKey(false);
        this.render();
      }
      return;
    }

    if (e.key === 'Enter') {
      if (this.currentGuess.length === 5) {
        this.submitGuess();
      }
      return;
    }

    if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
      if (this.currentGuess.length < 5) {
        this.currentGuess += e.key.toUpperCase();
        if (this.sound && this.sound.playKey) this.sound.playKey(false);
        this.render();
      }
    }
  }

  submitGuess() {
    const guess = this.currentGuess;
    const target = this.targetWord;
    const feedback = Array(5).fill('gray');
    const targetChars = target.split('');

    // First pass: correct spot (green)
    for (let i = 0; i < 5; i++) {
      if (guess[i] === target[i]) {
        feedback[i] = 'green';
        targetChars[i] = null;
      }
    }

    // Second pass: wrong spot (yellow)
    for (let i = 0; i < 5; i++) {
      if (feedback[i] !== 'green' && targetChars.includes(guess[i])) {
        feedback[i] = 'yellow';
        targetChars[targetChars.indexOf(guess[i])] = null;
      }
    }

    this.history.push({ guess, feedback });
    this.currentGuess = '';

    if (guess === target) {
      if (this.sound && this.sound.playSuccessFanfare) this.sound.playSuccessFanfare();
      this.render();
      setTimeout(() => this.finish(true, { attempts: this.history.length }), 400);
      return;
    }

    if (this.history.length >= this.maxAttempts) {
      if (this.sound && this.sound.playErrorSound) this.sound.playErrorSound();
      this.render();
      setTimeout(() => this.finish(false, { word: target }), 500);
      return;
    }

    this.render();
  }

  finish(success, data = {}) {
    if (this.onComplete) this.onComplete(success, data);
  }
}

export class MemoryDumpGame {
  constructor(soundEngine) {
    this.sound = soundEngine;
  }

  start(container, node, upgrades, onComplete) {
    this.onComplete = onComplete;
    this.container = container;
    this.node = node;

    const hexPool = ['4A', '7F', 'B2', '0C', 'E5', '99', '1D', 'F0', '3B', '8A', '6E', 'D4'];
    const seqLen = Math.min(6, 3 + Math.floor((node.depth || 1) / 2));
    
    // Pick random sequence
    this.targetSeq = [];
    for (let i = 0; i < seqLen; i++) {
      this.targetSeq.push(hexPool[Math.floor(Math.random() * hexPool.length)]);
    }

    // Create 3x4 grid of tiles containing the sequence
    this.gridTiles = [...this.targetSeq];
    while (this.gridTiles.length < 12) {
      const r = hexPool[Math.floor(Math.random() * hexPool.length)];
      this.gridTiles.push(r);
    }
    // Shuffle
    this.gridTiles.sort(() => Math.random() - 0.5);

    this.stepIndex = 0;
    this.showMemorize = true;
    this.render();

    // Give 3 seconds to memorize
    setTimeout(() => {
      this.showMemorize = false;
      this.render();
    }, 2800);
  }

  render() {
    this.container.innerHTML = `
      <div class="minigame-card memory-dump-card">
        <div class="minigame-header">
          <span class="mg-badge">💾 HEX MEMORY FORENSICS</span>
          <span class="mg-target">${this.node.name}</span>
          <span class="mg-step">PROGRESS: ${this.stepIndex}/${this.targetSeq.length}</span>
        </div>
        <div class="mg-target-sequence">
          ${this.showMemorize ? `
            <div class="memo-title">MEMORIZE HEX SEQUENCE:</div>
            <div class="memo-seq">
              ${this.targetSeq.map(h => `<span class="hex-pill">${h}</span>`).join(' ')}
            </div>
          ` : `
            <div class="memo-title">TARGET SEQUENCE (SOLVING...):</div>
            <div class="memo-seq">
              ${this.targetSeq.map((h, i) => `
                <span class="hex-pill ${i < this.stepIndex ? 'matched' : i === this.stepIndex ? 'current' : 'hidden-hex'}">
                  ${i < this.stepIndex ? h : i === this.stepIndex ? '?' : '•'}
                </span>
              `).join(' ')}
            </div>
          `}
        </div>
        <div class="mg-hex-grid">
          ${this.gridTiles.map((hex, idx) => `
            <button class="hex-grid-btn" data-hex="${hex}" data-idx="${idx}" ${this.showMemorize ? 'disabled' : ''}>
              ${hex}
            </button>
          `).join('')}
        </div>
        <div class="mg-hints">Click the matching hex values in the memorized order!</div>
      </div>
    `;

    this.bindClicks();
  }

  bindClicks() {
    const btns = this.container.querySelectorAll('.hex-grid-btn');
    btns.forEach(b => {
      b.addEventListener('click', () => {
        const h = b.dataset.hex;
        if (h === this.targetSeq[this.stepIndex]) {
          this.stepIndex++;
          b.classList.add('correct-click');
          if (this.sound && this.sound.playKey) this.sound.playKey(false);
          this.render();

          if (this.stepIndex >= this.targetSeq.length) {
            if (this.sound && this.sound.playSuccessFanfare) this.sound.playSuccessFanfare();
            setTimeout(() => this.finish(true), 300);
          }
        } else {
          b.classList.add('error-click');
          if (this.sound && this.sound.playErrorSound) this.sound.playErrorSound();
          setTimeout(() => {
            this.stepIndex = 0;
            this.render();
          }, 300);
        }
      });
    });
  }

  handleKeyDown(e) {
    // Allows keyboard numbers 1-9 to click tiles
    const num = parseInt(e.key, 10);
    if (!isNaN(num) && num >= 1 && num <= 9) {
      const btns = this.container.querySelectorAll('.hex-grid-btn');
      if (btns[num - 1]) btns[num - 1].click();
    }
  }

  finish(success) {
    if (this.onComplete) this.onComplete(success, {});
  }
}

export class PacketInjectGame {
  constructor(soundEngine) {
    this.sound = soundEngine;
    this.animFrame = null;
  }

  start(container, node, upgrades, onComplete) {
    this.onComplete = onComplete;
    this.container = container;
    this.node = node;

    this.requiredSuccesses = 3;
    this.currentSuccesses = 0;
    this.barPos = 0;
    this.direction = 1;
    this.speed = 1.2 + (node.depth || 1) * 0.2;
    this.zoneStart = 40 + Math.random() * 20; // 40% - 60%
    this.zoneWidth = Math.max(14, 25 - (node.depth || 1) * 2);

    this.render();
    this.animate();
  }

  render() {
    this.container.innerHTML = `
      <div class="minigame-card packet-card">
        <div class="minigame-header">
          <span class="mg-badge">📡 PACKET INJECTION RHYTHM</span>
          <span class="mg-target">${this.node.name}</span>
          <span class="mg-success">SYNC: ${this.currentSuccesses}/${this.requiredSuccesses}</span>
        </div>
        <div class="mg-prompt-label">TIMING CALIBRATION: PRESS SPACE WHEN CURSOR ENTERS THE INJECTION ZONE:</div>
        <div class="packet-track">
          <div class="packet-zone" id="mgPacketZone" style="left: ${this.zoneStart}%; width: ${this.zoneWidth}%;"></div>
          <div class="packet-cursor" id="mgPacketCursor" style="left: 0%;"></div>
        </div>
        <div class="mg-hints">Press <strong>SPACEBAR</strong> at the exact sweet spot!</div>
      </div>
    `;
  }

  animate() {
    this.barPos += this.speed * this.direction;
    if (this.barPos >= 98) {
      this.barPos = 98;
      this.direction = -1;
    } else if (this.barPos <= 0) {
      this.barPos = 0;
      this.direction = 1;
    }

    const cursor = this.container.querySelector('#mgPacketCursor');
    if (cursor) cursor.style.left = `${this.barPos}%`;

    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  handleKeyDown(e) {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      const inZone = this.barPos >= this.zoneStart && this.barPos <= (this.zoneStart + this.zoneWidth);

      if (inZone) {
        this.currentSuccesses++;
        if (this.sound && this.sound.playKey) this.sound.playKey(false);
        // Move zone for next hit
        this.zoneStart = 15 + Math.random() * 65;
        const zone = this.container.querySelector('#mgPacketZone');
        if (zone) zone.style.left = `${this.zoneStart}%`;

        const sEl = this.container.querySelector('.mg-success');
        if (sEl) sEl.textContent = `SYNC: ${this.currentSuccesses}/${this.requiredSuccesses}`;

        if (this.currentSuccesses >= this.requiredSuccesses) {
          if (this.sound && this.sound.playSuccessFanfare) this.sound.playSuccessFanfare();
          cancelAnimationFrame(this.animFrame);
          setTimeout(() => this.finish(true), 250);
        }
      } else {
        if (this.sound && this.sound.playErrorSound) this.sound.playErrorSound();
        const tr = this.container.querySelector('.packet-track');
        if (tr) {
          tr.classList.add('shake-error');
          setTimeout(() => tr.classList.remove('shake-error'), 180);
        }
      }
    }
  }

  finish(success) {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.onComplete) this.onComplete(success, {});
  }
}

export class DataExtractGame {
  constructor(soundEngine) {
    this.sound = soundEngine;
    this.timerInterval = null;
  }

  start(container, node, upgrades, onComplete) {
    this.onComplete = onComplete;
    this.container = container;
    this.node = node;

    const queries = [
      'SELECT * FROM classified_vault WHERE status = "UNRESTRICTED";',
      'rsync -avzP root@saturn.orbital.mil:/var/secret_keys /local/stash',
      'tar -czvf quantum_core_dump.tar.gz /etc/shadow /root/.ssh/id_rsa',
      'gpg --export-secret-keys --armor operator_quantum_key_0x99A'
    ];

    this.targetText = queries[Math.floor(Math.random() * queries.length)];
    this.typedIndex = 0;
    this.timeLeft = Math.max(6, 12 - (node.depth || 1) * 0.8);
    this.maxTime = this.timeLeft;

    this.render();
    this.startTimer();
  }

  render() {
    this.container.innerHTML = `
      <div class="minigame-card data-extract-card">
        <div class="minigame-header">
          <span class="mg-badge">💰 DATA EXFILTRATION</span>
          <span class="mg-target">${this.node.name}</span>
          <span class="mg-timer" id="mgExtractTimer">${this.timeLeft.toFixed(1)}s</span>
        </div>
        <div class="mg-progress-track">
          <div class="mg-progress-bar extract-bar" id="mgExtractBar" style="width: 0%;"></div>
        </div>
        <div class="mg-prompt-label">HIGH-SPEED EXFILTRATION STREAM:</div>
        <div class="mg-type-display" id="mgExtractDisplay"></div>
        <div class="mg-hints">Type the entire query as fast as possible before transmission closes!</div>
      </div>
    `;

    this.renderText();
  }

  renderText() {
    const disp = this.container.querySelector('#mgExtractDisplay');
    if (!disp) return;
    disp.innerHTML = '';

    for (let i = 0; i < this.targetText.length; i++) {
      const span = document.createElement('span');
      span.className = 'mg-char';
      span.textContent = this.targetText[i];
      if (i < this.typedIndex) span.classList.add('correct');
      else if (i === this.typedIndex) span.classList.add('current');
      disp.appendChild(span);
    }
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft -= 0.1;
      const timer = this.container.querySelector('#mgExtractTimer');
      if (timer) timer.textContent = `${Math.max(0, this.timeLeft).toFixed(1)}s`;

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.finish(false);
      }
    }, 100);
  }

  handleKeyDown(e) {
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
    if (e.key === ' ' || e.code === 'Space') e.preventDefault();

    if (e.key === this.targetText[this.typedIndex]) {
      this.typedIndex++;
      if (this.sound && this.sound.playKey) this.sound.playKey(false);
      this.renderText();

      const pct = (this.typedIndex / this.targetText.length) * 100;
      const bar = this.container.querySelector('#mgExtractBar');
      if (bar) bar.style.width = `${pct}%`;

      if (this.typedIndex >= this.targetText.length) {
        clearInterval(this.timerInterval);
        if (this.sound && this.sound.playSuccessFanfare) this.sound.playSuccessFanfare();
        setTimeout(() => this.finish(true), 250);
      }
    } else {
      if (this.sound && this.sound.playKey) this.sound.playKey(true);
    }
  }

  finish(success) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.onComplete) this.onComplete(success, {});
  }
}

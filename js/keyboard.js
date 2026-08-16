/**
 * CYBER//TYPE KEYBOARD ENGINE & LAYOUT DEFINITIONS
 * Complete ANSI layout, Dual English (QWERTY) & Thai (Kedmanee) mappings,
 * and 10-Finger touch typing assignment.
 */

export const FINGER_NAMES = {
  lp: 'LEFT PINKY (นิ้วก้อยซ้าย)',
  lr: 'LEFT RING (นิ้วนางซ้าย)',
  lm: 'LEFT MIDDLE (นิ้วกลางซ้าย)',
  li: 'LEFT INDEX (นิ้วชี้ซ้าย)',
  lt: 'LEFT THUMB (นิ้วโป้งซ้าย)',
  rt: 'RIGHT THUMB (นิ้วโป้งขวา)',
  th: 'THUMB (นิ้วโป้ง - Spacebar)',
  ri: 'RIGHT INDEX (นิ้วชี้ขวา)',
  rm: 'RIGHT MIDDLE (นิ้วกลางขวา)',
  rr: 'RIGHT RING (นิ้วนางขวา)',
  rp: 'RIGHT PINKY (นิ้วก้อยขวา)'
};

/**
 * Standard ANSI Keyboard Rows with Dual Layout (EN & TH) and Finger Assignments
 */
export const KEYBOARD_LAYOUT = [
  // Row 1 (Number Row)
  [
    { code: 'Backquote', en: '`', enShift: '~', th: '_', thShift: '%', finger: 'lp', class: 'key-grave' },
    { code: 'Digit1', en: '1', enShift: '!', th: 'ๅ', thShift: '+', finger: 'lp' },
    { code: 'Digit2', en: '2', enShift: '@', th: '/', thShift: '๑', finger: 'lr' },
    { code: 'Digit3', en: '3', enShift: '#', th: '-', thShift: '๒', finger: 'lm' },
    { code: 'Digit4', en: '4', enShift: '$', th: 'ภ', thShift: '๓', finger: 'li' },
    { code: 'Digit5', en: '5', enShift: '%', th: 'ถ', thShift: '๔', finger: 'li' },
    { code: 'Digit6', en: '6', enShift: '^', th: 'ุ', thShift: 'ู', finger: 'ri' },
    { code: 'Digit7', en: '7', enShift: '&', th: 'ึ', thShift: '฿', finger: 'ri' },
    { code: 'Digit8', en: '8', enShift: '*', th: 'ค', thShift: '๕', finger: 'rm' },
    { code: 'Digit9', en: '9', enShift: '(', th: 'ต', thShift: '๖', finger: 'rr' },
    { code: 'Digit0', en: '0', enShift: ')', th: 'จ', thShift: '๗', finger: 'rp' },
    { code: 'Minus', en: '-', enShift: '_', th: 'ข', thShift: '๘', finger: 'rp' },
    { code: 'Equal', en: '=', enShift: '+', th: 'ช', thShift: '๙', finger: 'rp' },
    { code: 'Backspace', en: 'BACK', enShift: 'BACK', th: 'ลบ', thShift: 'ลบ', finger: 'rp', class: 'key-backspace key-mod' }
  ],
  // Row 2 (Top Row)
  [
    { code: 'Tab', en: 'TAB', enShift: 'TAB', th: 'TAB', thShift: 'TAB', finger: 'lp', class: 'key-tab key-mod' },
    { code: 'KeyQ', en: 'Q', enShift: 'Q', th: 'ๆ', thShift: '๐', finger: 'lp' },
    { code: 'KeyW', en: 'W', enShift: 'W', th: 'ไ', thShift: '"', finger: 'lr' },
    { code: 'KeyE', en: 'E', enShift: 'E', th: 'ำ', thShift: 'ฎ', finger: 'lm' },
    { code: 'KeyR', en: 'R', enShift: 'R', th: 'พ', thShift: 'ฑ', finger: 'li' },
    { code: 'KeyT', en: 'T', enShift: 'T', th: 'ะ', thShift: 'ธ', finger: 'li' },
    { code: 'KeyY', en: 'Y', enShift: 'Y', th: 'ั', thShift: 'ํ', finger: 'ri' },
    { code: 'KeyU', en: 'U', enShift: 'U', th: 'ี', thShift: '๊', finger: 'ri' },
    { code: 'KeyI', en: 'I', enShift: 'I', th: 'ร', thShift: 'ณ', finger: 'rm' },
    { code: 'KeyO', en: 'O', enShift: 'O', th: 'น', thShift: 'ฯ', finger: 'rr' },
    { code: 'KeyP', en: 'P', enShift: 'P', th: 'ย', thShift: 'ญ', finger: 'rp' },
    { code: 'BracketLeft', en: '[', enShift: '{', th: 'บ', thShift: 'ฐ', finger: 'rp' },
    { code: 'BracketRight', en: ']', enShift: '}', th: 'ล', thShift: ',', finger: 'rp' },
    { code: 'Backslash', en: '\\', enShift: '|', th: 'ฃ', thShift: 'ฅ', finger: 'rp', class: 'key-mod' }
  ],
  // Row 3 (Home Row)
  [
    { code: 'CapsLock', en: 'CAPS', enShift: 'CAPS', th: 'CAPS', thShift: 'CAPS', finger: 'lp', class: 'key-caps key-mod' },
    { code: 'KeyA', en: 'A', enShift: 'A', th: 'ฟ', thShift: 'ฤ', finger: 'lp' },
    { code: 'KeyS', en: 'S', enShift: 'S', th: 'ห', thShift: 'ฆ', finger: 'lr' },
    { code: 'KeyD', en: 'D', enShift: 'D', th: 'ก', thShift: 'ฏ', finger: 'lm' },
    { code: 'KeyF', en: 'F', enShift: 'F', th: 'ด', thShift: 'โ', finger: 'li', class: 'key-homing' },
    { code: 'KeyG', en: 'G', enShift: 'G', th: 'เ', thShift: 'ฌ', finger: 'li' },
    { code: 'KeyH', en: 'H', enShift: 'H', th: '้', thShift: '็', finger: 'ri' },
    { code: 'KeyJ', en: 'J', enShift: 'J', th: '่', thShift: '๋', finger: 'ri', class: 'key-homing' },
    { code: 'KeyK', en: 'K', enShift: 'K', th: 'า', thShift: 'ษ', finger: 'rm' },
    { code: 'KeyL', en: 'L', enShift: 'L', th: 'ส', thShift: 'ศ', finger: 'rr' },
    { code: 'Semicolon', en: ';', enShift: ':', th: 'ว', thShift: 'ซ', finger: 'rp' },
    { code: 'Quote', en: "'", enShift: '"', th: 'ง', thShift: '.', finger: 'rp' },
    { code: 'Enter', en: 'ENTER ⏎', enShift: 'ENTER ⏎', th: 'ENTER ⏎', thShift: 'ENTER ⏎', finger: 'rp', class: 'key-enter key-mod' }
  ],
  // Row 4 (Bottom Row)
  [
    { code: 'ShiftLeft', en: 'SHIFT ⇧', enShift: 'SHIFT ⇧', th: 'SHIFT ⇧', thShift: 'SHIFT ⇧', finger: 'lp', class: 'key-shift-l key-mod' },
    { code: 'KeyZ', en: 'Z', enShift: 'Z', th: 'ผ', thShift: '(', finger: 'lp' },
    { code: 'KeyX', en: 'X', enShift: 'X', th: 'ป', thShift: ')', finger: 'lr' },
    { code: 'KeyC', en: 'C', enShift: 'C', th: 'แ', thShift: 'ฉ', finger: 'lm' },
    { code: 'KeyV', en: 'V', enShift: 'V', th: 'อ', thShift: 'ฮ', finger: 'li' },
    { code: 'KeyB', en: 'B', enShift: 'B', th: 'ิ', thShift: 'ฺ', finger: 'li' },
    { code: 'KeyN', en: 'N', enShift: 'N', th: 'ื', thShift: '์', finger: 'ri' },
    { code: 'KeyM', en: 'M', enShift: 'M', th: 'ท', thShift: '?', finger: 'ri' },
    { code: 'Comma', en: ',', enShift: '<', th: 'ม', thShift: 'ฒ', finger: 'rm' },
    { code: 'Period', en: '.', enShift: '>', th: 'ใ', thShift: 'ฬ', finger: 'rr' },
    { code: 'Slash', en: '/', enShift: '?', th: 'ฝ', thShift: 'ฦ', finger: 'rp' },
    { code: 'ShiftRight', en: 'SHIFT ⇧', enShift: 'SHIFT ⇧', th: 'SHIFT ⇧', thShift: 'SHIFT ⇧', finger: 'rp', class: 'key-shift-r key-mod' }
  ],
  // Row 5 (Space / Modifiers)
  [
    { code: 'ControlLeft', en: 'CTRL', enShift: 'CTRL', th: 'CTRL', thShift: 'CTRL', finger: 'lp', class: 'key-ctrl key-mod' },
    { code: 'MetaLeft', en: 'WIN', enShift: 'WIN', th: 'WIN', thShift: 'WIN', finger: 'lp', class: 'key-meta key-mod' },
    { code: 'AltLeft', en: 'ALT', enShift: 'ALT', th: 'ALT', thShift: 'ALT', finger: 'lt', class: 'key-alt key-mod' },
    { code: 'Space', en: 'SPACEBAR', enShift: 'SPACEBAR', th: 'วรรค', thShift: 'วรรค', finger: 'th', class: 'key-space' },
    { code: 'AltRight', en: 'ALT', enShift: 'ALT', th: 'ALT', thShift: 'ALT', finger: 'rt', class: 'key-alt key-mod' },
    { code: 'MetaRight', en: 'WIN', enShift: 'WIN', th: 'WIN', thShift: 'WIN', finger: 'rp', class: 'key-meta key-mod' },
    { code: 'ControlRight', en: 'CTRL', enShift: 'CTRL', th: 'CTRL', thShift: 'CTRL', finger: 'rp', class: 'key-ctrl key-mod' }
  ]
];

export class KeyboardVisualizer {
  constructor(containerEl) {
    this.container = containerEl;
    this.currentLayout = 'en'; // 'en' | 'th'
    this.showFingerColors = true;
    this.keyElementsMap = new Map(); // code -> DOM Element
    this.charToCodeMap = new Map();  // char -> { code, shiftRequired, finger }
    this.buildCharacterMap();
  }

  buildCharacterMap() {
    this.charToCodeMap.clear();
    KEYBOARD_LAYOUT.forEach(row => {
      row.forEach(k => {
        // Map EN standard & shifted
        if (k.en) this.charToCodeMap.set(k.en.toLowerCase(), { code: k.code, shift: false, finger: k.finger });
        if (k.en) this.charToCodeMap.set(k.en.toUpperCase(), { code: k.code, shift: k.en.toLowerCase() !== k.en.toUpperCase(), finger: k.finger });
        if (k.enShift) this.charToCodeMap.set(k.enShift, { code: k.code, shift: true, finger: k.finger });

        // Map TH standard & shifted
        if (k.th) this.charToCodeMap.set(k.th, { code: k.code, shift: false, finger: k.finger });
        if (k.thShift) this.charToCodeMap.set(k.thShift, { code: k.code, shift: true, finger: k.finger });
      });
    });

    // Special Space mapping
    this.charToCodeMap.set(' ', { code: 'Space', shift: false, finger: 'th' });
    this.charToCodeMap.set('\n', { code: 'Enter', shift: false, finger: 'rp' });
  }

  render() {
    this.container.innerHTML = '';
    this.keyElementsMap.clear();

    if (this.showFingerColors) {
      this.container.classList.add('show-finger-colors');
    } else {
      this.container.classList.remove('show-finger-colors');
    }

    KEYBOARD_LAYOUT.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';

      row.forEach(keyData => {
        const keyEl = document.createElement('div');
        const fingerClass = `key-${keyData.finger}`;
        const extraClass = keyData.class || '';
        keyEl.className = `key ${fingerClass} ${extraClass}`.trim();
        keyEl.dataset.code = keyData.code;
        keyEl.dataset.finger = keyData.finger;

        const topLabel = document.createElement('span');
        topLabel.className = 'key-top-label';
        topLabel.textContent = this.currentLayout === 'en' ? (keyData.en || '') : (keyData.th || keyData.en);

        const subLabel = document.createElement('span');
        subLabel.className = 'key-sub-label';
        subLabel.textContent = this.currentLayout === 'en' ? (keyData.th || '') : (keyData.en || '');

        keyEl.appendChild(topLabel);
        keyEl.appendChild(subLabel);
        rowEl.appendChild(keyEl);

        this.keyElementsMap.set(keyData.code, keyEl);
      });

      this.container.appendChild(rowEl);
    });
  }

  setLayout(layout) {
    if (layout === this.currentLayout) return;
    this.currentLayout = layout;
    this.render();
  }

  setShowFingerColors(show) {
    this.showFingerColors = show;
    if (show) {
      this.container.classList.add('show-finger-colors');
    } else {
      this.container.classList.remove('show-finger-colors');
    }
  }

  /**
   * Set key active (pressed down)
   */
  setKeyActive(code, isActive = true) {
    const keyEl = this.keyElementsMap.get(code);
    if (!keyEl) return;

    if (isActive) {
      keyEl.classList.add('active');
    } else {
      keyEl.classList.remove('active');
    }
  }

  /**
   * Flash error key red when wrong key is typed
   */
  flashKeyError(code) {
    const keyEl = this.keyElementsMap.get(code);
    if (!keyEl) return;
    keyEl.classList.add('error-flash');
    setTimeout(() => {
      keyEl.classList.remove('error-flash');
    }, 200);
  }

  /**
   * Highlight next target key for touch typing lesson
   */
  setTargetKey(char) {
    this.clearTargetKeys();
    if (!char) return null;

    const keyInfo = this.charToCodeMap.get(char);
    if (!keyInfo) return null;

    const keyEl = this.keyElementsMap.get(keyInfo.code);
    if (keyEl) {
      keyEl.classList.add('target-next');
    }

    // If shift is required, highlight shift key too
    if (keyInfo.shift) {
      const shiftCode = ['lp', 'lr', 'lm', 'li'].includes(keyInfo.finger) ? 'ShiftRight' : 'ShiftLeft';
      const shiftEl = this.keyElementsMap.get(shiftCode);
      if (shiftEl) shiftEl.classList.add('target-next');
    }

    return keyInfo;
  }

  clearTargetKeys() {
    this.keyElementsMap.forEach(el => {
      el.classList.remove('target-next');
    });
  }

  getFingerForChar(char) {
    const info = this.charToCodeMap.get(char);
    return info ? info.finger : null;
  }

  getFingerForCode(code) {
    const keyEl = this.keyElementsMap.get(code);
    return keyEl ? keyEl.dataset.finger : null;
  }

  // --- MATRIX BIOMETRIC THERMAL KEYSTROKE HEATMAP ---
  recordKeyHit(code) {
    if (!this.keyHitCounts) this.keyHitCounts = new Map();
    const current = this.keyHitCounts.get(code) || 0;
    this.keyHitCounts.set(code, current + 1);

    if (this.isHeatmapActive) {
      this.updateHeatmapVisuals();
    }
  }

  toggleHeatmap(enable = null) {
    this.isHeatmapActive = enable !== null ? enable : !this.isHeatmapActive;
    if (this.container) {
      this.container.classList.toggle('heatmap-mode', this.isHeatmapActive);
    }
    if (this.isHeatmapActive) {
      this.updateHeatmapVisuals();
    } else {
      this.clearHeatmapVisuals();
    }
    return this.isHeatmapActive;
  }

  updateHeatmapVisuals() {
    if (!this.keyHitCounts || this.keyHitCounts.size === 0) return;

    let maxHits = 1;
    this.keyHitCounts.forEach(val => {
      if (val > maxHits) maxHits = val;
    });

    this.keyElementsMap.forEach((el, code) => {
      const hits = this.keyHitCounts.get(code) || 0;
      const ratio = Math.min(1, hits / maxHits);

      if (hits > 0) {
        // Dynamic Neon Thermal Gradient: Cool Cyan (low) -> Yellow (med) -> Blazing Infrared Red (high)
        let glowColor = 'rgba(0, 229, 255, 0.4)';
        let borderGlow = 'rgba(0, 229, 255, 0.6)';
        if (ratio > 0.65) {
          glowColor = 'rgba(255, 34, 68, 0.65)';
          borderGlow = 'rgba(255, 34, 68, 0.9)';
        } else if (ratio > 0.35) {
          glowColor = 'rgba(255, 200, 0, 0.55)';
          borderGlow = 'rgba(255, 200, 0, 0.8)';
        }

        el.style.background = glowColor;
        el.style.borderColor = borderGlow;
        el.style.boxShadow = `0 0 ${Math.round(ratio * 16 + 4)}px ${borderGlow}`;
      }
    });
  }

  clearHeatmapVisuals() {
    this.keyElementsMap.forEach((el) => {
      el.style.background = '';
      el.style.borderColor = '';
      el.style.boxShadow = '';
    });
  }

  getHeatmapStats() {
    let totalHits = 0;
    let leftHandHits = 0;
    let rightHandHits = 0;

    if (this.keyHitCounts) {
      this.keyHitCounts.forEach((hits, code) => {
        totalHits += hits;
        const finger = this.getFingerForCode(code);
        if (['lp', 'lr', 'lm', 'li', 'lt'].includes(finger)) {
          leftHandHits += hits;
        } else if (['rp', 'rr', 'rm', 'ri', 'rt', 'th'].includes(finger)) {
          rightHandHits += hits;
        }
      });
    }

    const leftPct = totalHits > 0 ? Math.round((leftHandHits / totalHits) * 100) : 50;
    const rightPct = totalHits > 0 ? Math.round((rightHandHits / totalHits) * 100) : 50;
    const fatigueIndex = Math.min(100, Math.round(totalHits * 0.12));

    return {
      totalHits,
      leftPct,
      rightPct,
      fatigueIndex,
      topKeys: Array.from(this.keyHitCounts ? this.keyHitCounts.entries() : [])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    };
  }
}

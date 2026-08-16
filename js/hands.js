/**
 * CYBER//TYPE PIXEL-PERFECT FINGER KINEMATICS & HAND RIG
 * Dynamically tracks real DOM key positions, ensuring 100% accurate alignment
 * with the Home Row (A, S, D, F / J, K, L, ;) and direct physical key-press plunges.
 */

import { FINGER_NAMES } from './keyboard.js';

export const HOME_ROW_MAP = {
  lp: 'KeyA',
  lr: 'KeyS',
  lm: 'KeyD',
  li: 'KeyF',
  lt: 'Space',
  rt: 'Space',
  ri: 'KeyJ',
  rm: 'KeyK',
  rr: 'KeyL',
  rp: 'Semicolon'
};

export class CyberHandsController {
  constructor(stageContainerEl, keyboardVisualizer, guideKeyEl, guideFingerEl) {
    this.stage = stageContainerEl;
    this.kb = keyboardVisualizer;
    this.guideKeyEl = guideKeyEl;
    this.guideFingerEl = guideFingerEl;

    this.fingerNodes = new Map(); // fingerKey -> DOM element
    this.visible = true;
    this.showGuidanceAura = true;
    this.currentTargetFinger = null;
    this.activePresses = new Map(); // fingerKey -> timeout / state

    this.initRig();
  }

  initRig() {
    this.stage.innerHTML = '';
    this.stage.className = 'cyber-finger-rig-stage';

    // Create Left & Right Palm/Wrist HUD graphics
    const leftPalm = document.createElement('div');
    leftPalm.className = 'hand-palm-deck left-palm-deck';
    leftPalm.innerHTML = `
      <div class="palm-label">LEFT HAND [มือซ้าย]</div>
      <div class="wrist-cyber-bar"></div>
    `;

    const rightPalm = document.createElement('div');
    rightPalm.className = 'hand-palm-deck right-palm-deck';
    rightPalm.innerHTML = `
      <div class="palm-label">RIGHT HAND [มือขวา]</div>
      <div class="wrist-cyber-bar"></div>
    `;

    this.stage.appendChild(leftPalm);
    this.stage.appendChild(rightPalm);

    // Create 10 Finger Tip Pins
    const fingers = ['lp', 'lr', 'lm', 'li', 'lt', 'rt', 'ri', 'rm', 'rr', 'rp'];
    fingers.forEach(f => {
      const pin = document.createElement('div');
      pin.className = `finger-pin finger-${f}`;
      pin.dataset.finger = f;
      pin.innerHTML = `
        <div class="pin-ring"></div>
        <div class="pin-core">${f.toUpperCase()}</div>
        <div class="pin-tether"></div>
      `;
      this.stage.appendChild(pin);
      this.fingerNodes.set(f, pin);
    });

    // Update positions on resize and initial render
    window.addEventListener('resize', () => this.updatePositions());
    setTimeout(() => this.updatePositions(), 50);
  }

  /**
   * Calculate exact pixel coordinates of keys and position fingertips at Home Row
   */
  updatePositions() {
    if (!this.kb || !this.stage) return;
    const stageRect = this.stage.getBoundingClientRect();
    if (stageRect.width === 0) return;

    this.fingerNodes.forEach((pin, fingerKey) => {
      const homeCode = HOME_ROW_MAP[fingerKey];
      const keyEl = this.kb.keyElementsMap.get(homeCode);
      if (!keyEl) return;

      const keyRect = keyEl.getBoundingClientRect();
      let targetX = keyRect.left + keyRect.width / 2 - stageRect.left;
      const targetY = keyRect.top + keyRect.height / 2 - stageRect.top;

      // For Spacebar, offset left thumb and right thumb
      if (fingerKey === 'lt') {
        targetX = keyRect.left + keyRect.width * 0.35 - stageRect.left;
      } else if (fingerKey === 'rt') {
        targetX = keyRect.left + keyRect.width * 0.65 - stageRect.left;
      }

      pin.dataset.homeX = targetX;
      pin.dataset.homeY = targetY;

      // Position pin at home row if not actively pressing another key
      if (!pin.classList.contains('pressing')) {
        pin.style.left = `${targetX}px`;
        pin.style.top = `${targetY}px`;
        pin.style.transform = 'translate(-50%, -50%)';
      }
    });
  }

  /**
   * Move finger to key and perform direct downward plunge animation
   */
  pressKeyWithFinger(code, fingerKey) {
    if (!fingerKey) return;
    const actualFinger = fingerKey === 'th' ? 'lt' : fingerKey;
    const pin = this.fingerNodes.get(actualFinger);
    if (!pin) return;

    const stageRect = this.stage.getBoundingClientRect();
    let targetX = parseFloat(pin.dataset.homeX);
    let targetY = parseFloat(pin.dataset.homeY);

    if (code && this.kb.keyElementsMap.has(code)) {
      const keyEl = this.kb.keyElementsMap.get(code);
      const keyRect = keyEl.getBoundingClientRect();
      targetX = keyRect.left + keyRect.width / 2 - stageRect.left;
      targetY = keyRect.top + keyRect.height / 2 - stageRect.top;
      if (code === 'Space') {
        targetX = keyRect.left + (actualFinger === 'lt' ? keyRect.width * 0.35 : keyRect.width * 0.65) - stageRect.left;
      }
    }

    pin.style.left = `${targetX}px`;
    pin.style.top = `${targetY}px`;
    pin.style.transform = 'translate(-50%, -50%) scale(0.88)';
    pin.classList.add('pressing');

    // Auto-release after keyup or timeout
    if (this.activePresses.has(actualFinger)) {
      clearTimeout(this.activePresses.get(actualFinger));
    }
    const timeout = setTimeout(() => {
      this.releaseFinger(actualFinger);
    }, 180);
    this.activePresses.set(actualFinger, timeout);
  }

  /**
   * Release finger and return smoothly to Home Row
   */
  releaseFinger(fingerKey) {
    if (!fingerKey) return;
    const actualFinger = fingerKey === 'th' ? 'lt' : fingerKey;
    const pin = this.fingerNodes.get(actualFinger);
    if (!pin) return;

    pin.classList.remove('pressing');
    const homeX = parseFloat(pin.dataset.homeX);
    const homeY = parseFloat(pin.dataset.homeY);

    if (!isNaN(homeX) && !isNaN(homeY)) {
      pin.style.left = `${homeX}px`;
      pin.style.top = `${homeY}px`;
      pin.style.transform = 'translate(-50%, -50%)';
    }
  }

  /**
   * Set target guidance aura on the exact required finger
   */
  setTargetGuide(char, fingerKey) {
    this.clearTargetGuide();
    if (!fingerKey) return;

    this.currentTargetFinger = fingerKey;
    const actualFinger = fingerKey === 'th' ? 'lt' : fingerKey;
    const pin = this.fingerNodes.get(actualFinger);

    if (pin && this.showGuidanceAura) {
      pin.classList.add('target-guide');
    }

    if (this.guideKeyEl) {
      this.guideKeyEl.textContent = char === ' ' ? 'SPACEBAR' : char;
    }

    if (this.guideFingerEl) {
      this.guideFingerEl.textContent = FINGER_NAMES[fingerKey] || 'THUMB (นิ้วโป้ง)';
      this.guideFingerEl.className = `guide-finger-badge finger-${fingerKey}`;
    }
  }

  clearTargetGuide() {
    this.fingerNodes.forEach(pin => {
      pin.classList.remove('target-guide');
    });
    this.currentTargetFinger = null;
  }

  setVisible(isVisible) {
    this.visible = isVisible;
    if (isVisible) {
      this.stage.classList.remove('hidden-hands');
      this.updatePositions();
    } else {
      this.stage.classList.add('hidden-hands');
    }
  }

  setGuidanceAura(enabled) {
    this.showGuidanceAura = enabled;
    if (!enabled) {
      this.clearTargetGuide();
    } else if (this.currentTargetFinger) {
      const actualFinger = this.currentTargetFinger === 'th' ? 'lt' : this.currentTargetFinger;
      const pin = this.fingerNodes.get(actualFinger);
      if (pin) pin.classList.add('target-guide');
    }
  }
}

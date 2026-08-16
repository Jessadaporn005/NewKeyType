/**
 * CYBER//TYPE AI COMPANION ENGINE (EVA)
 * 3D Holographic Cyber Companion that reacts in real-time to keystrokes, WPM, streaks, and errors.
 */

export class AICompanionEngine {
  constructor(app, soundEngine) {
    this.app = app;
    this.sound = soundEngine;
    this.container = null;
    this.sphereEl = null;
    this.speechEl = null;
    this.state = 'IDLE'; // 'IDLE' | 'OVERCLOCK' | 'ALERT' | 'VICTORY'
    this.lastSpeechTime = 0;
    this.talkTimeout = null;

    this.quotes = {
      IDLE: [
        '"SYSTEMS ONLINE. READY FOR INFILTRATION."',
        '"NEURAL LINK STABLE AT 14.25 GHz."',
        '"AWAITING OPERATOR INPUT ON TERMINAL."',
        '"OBSERVING AIRWAVE & FREQUENCY MATRIX."'
      ],
      OVERCLOCK: [
        '"🔥 OVERCLOCK DETECTED! VELOCITY SURGING!"',
        '"⚡ SENSATIONAL KEYSTROKE VELOCITY, NETRUNNER!"',
        '"💥 KINETIC OVERLOAD! PENETRATING SUBNETS!"',
        '"🚀 FULL POWER! MAINFRAME CANNOT WITHSTAND THIS!"'
      ],
      ALERT: [
        '"⚠️ BUFFER PARITY ERROR DETECTED! RE-CALIBRATING."',
        '"⚡ SYNTAX MISMATCH! MAINTAIN RHYTHM."',
        '"🔍 ACTIVE TRACE DETECTED! STABILIZE ACCURACY."'
      ],
      VICTORY: [
        '"👑 ROOT ACCESS ACQUIRED! EXTRACTION COMPLETE."',
        '"💎 +EXP & BITCOIN TRANSFERRED TO SECURE VAULT."',
        '"🏆 OBJECTIVE CRUSHED! ADVANCING TO NEXT TARGET."'
      ]
    };
  }

  init(containerEl) {
    this.container = containerEl || document.getElementById('aiCompanionWidget');
    if (!this.container) return;

    this.sphereEl = this.container.querySelector('#aiCoreSphere');
    this.speechEl = this.container.querySelector('#aiCompanionSpeech');

    // Click to cycle speech or trigger AI greeting
    this.container.addEventListener('click', () => {
      this.sayRandom(this.state, true);
      if (this.sound && typeof this.sound.playKey === 'function') this.sound.playKey(false);
    });
  }

  setState(newState, speech = null) {
    if (this.state === newState && !speech) return;
    this.state = newState;

    if (this.sphereEl) {
      this.sphereEl.classList.remove('state-idle', 'state-overclock', 'state-alert', 'state-victory');
      this.sphereEl.classList.add(`state-${newState.toLowerCase()}`);
    }

    if (speech) {
      this.speak(speech);
    } else {
      this.sayRandom(newState);
    }
  }

  speak(text) {
    if (!this.speechEl) return;
    this.speechEl.textContent = text;
    this.speechEl.classList.remove('speech-pop');
    void this.speechEl.offsetWidth; // Trigger reflow
    this.speechEl.classList.add('speech-pop');
  }

  sayRandom(category, force = false) {
    const now = Date.now();
    if (!force && now - this.lastSpeechTime < 4000) return; // Debounce talk
    this.lastSpeechTime = now;

    const list = this.quotes[category] || this.quotes.IDLE;
    const randomQuote = list[Math.floor(Math.random() * list.length)];
    this.speak(randomQuote);
  }

  onKeystroke(wpm, accuracy, streak, isError) {
    if (isError) {
      this.setState('ALERT');
      return;
    }

    if (wpm >= 70 || streak >= 15) {
      this.setState('OVERCLOCK');
    } else {
      if (this.state !== 'IDLE' && streak < 5) {
        this.setState('IDLE');
      }
    }
  }

  onVictory(expGained = 0, title = 'Mission Accomplished') {
    this.setState('VICTORY', `"🏆 ${title.toUpperCase()}! +${expGained} EXP ACQUIRED!"`);
  }
}

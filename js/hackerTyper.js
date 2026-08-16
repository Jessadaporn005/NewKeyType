/**
 * CYBER//TYPE HOLLYWOOD HACKER SIMULATOR & REAL-TIME EXPLOIT INTRUSION ENGINE
 * Features:
 * - Interactive Guided Cyber Infiltration Missions with Real Exploit Payloads
 * - Massive Cascading Code Streamer (100+ lines of real assembly, hex dumps, socket telemetry, kernel overrides)
 * - Target Server Defense Health Bar and Live Stage Objectives
 * - Real-time Hollywood audio chirps and packet bursts
 */

import { HACKER_MISSIONS, HACKER_CODE_SNIPPETS } from './lessons.js';
import { generateHackerExploitLogs } from './cyberLogGenerator.js';

export class HackerTyperEngine {
  constructor(terminalScreenEl, streamCodeEl, breachModalEl, keyboardVisualizer, handsController, soundEngine) {
    this.terminal = terminalScreenEl;
    this.streamCode = streamCodeEl;
    this.breachModal = breachModalEl;
    this.kb = keyboardVisualizer;
    this.hands = handsController;
    this.sound = soundEngine;

    this.mode = 'mission'; // 'mission' (interactive guided hacking) | 'stream' (fast Hollywood mash)
    this.currentMissionIndex = 0;
    this.currentStageIndex = 0;
    this.targetText = '';
    this.charIndex = 0;
    this.charSpans = [];
    this.isInjecting = false;

    // Hollywood Streamer fallback state
    this.streamCodeSource = HACKER_CODE_SNIPPETS.join('\n\n');
    this.streamCharIndex = 0;
    this.streamChunkSize = 4;
    this.streamTotalTyped = 0;

    this.isBreachOpen = false;
    this.onMissionComplete = null;
    this.onTraceDetected = null;

    // Active Trace Alarm & IDS Defense System
    this.tracePercent = 0;
    this.traceInterval = null;
    this.isTraceActive = false;
    this.traceSpeedMultiplier = 1.0;
  }

  reset(missionNum = 1, traceSpeedMod = 1.0) {
    this.isBreachOpen = false;
    this.isInjecting = false;
    this.traceSpeedMultiplier = traceSpeedMod || 1.0;
    this.stopTraceTimer();
    this.hideBreach();

    const history = this.terminal.querySelector('.terminal-history');
    if (history) {
      history.innerHTML = '<div class="terminal-line">[*] QUANTUM INFILTRATION TUNNEL INITIALIZED...</div>';
    }

    this.currentMissionIndex = Math.max(0, Math.min(HACKER_MISSIONS.length - 1, missionNum - 1));
    this.currentStageIndex = 0;

    this.loadCurrentMissionStage();
  }

  startTraceTimer() {
    this.stopTraceTimer();
    this.tracePercent = 0;
    this.isTraceActive = true;
    this.updateTraceUI();

    const mission = HACKER_MISSIONS[this.currentMissionIndex];
    // Level 1 = 45s, Level 2 = 35s, Level 3 = 28s, Level 4 = 22s, Level 5/6 = 18s
    const baseSeconds = Math.max(16, 50 - (mission ? mission.id * 6 : 10));
    const stepIncrement = (100 / (baseSeconds * 5)) * this.traceSpeedMultiplier;

    this.traceInterval = setInterval(() => {
      if (!this.isTraceActive || this.isInjecting || this.isBreachOpen) return;
      this.tracePercent += stepIncrement;
      this.updateTraceUI();

      if (this.tracePercent >= 100) {
        this.tracePercent = 100;
        this.updateTraceUI();
        this.triggerTraceDetected();
      }
    }, 200);
  }

  stopTraceTimer() {
    if (this.traceInterval) {
      clearInterval(this.traceInterval);
      this.traceInterval = null;
    }
    this.isTraceActive = false;
  }

  updateTraceUI() {
    const bar = document.getElementById('hackerTraceBar');
    const val = document.getElementById('hackerTraceVal');
    const container = document.getElementById('hackerTracePanel');
    const rounded = Math.min(100, Math.round(this.tracePercent));

    if (bar) bar.style.width = `${rounded}%`;
    if (val) val.textContent = `${rounded}%`;
    if (container) {
      container.classList.toggle('trace-warning', rounded >= 65 && rounded < 90);
      container.classList.toggle('trace-danger', rounded >= 90);
    }
  }

  triggerTraceDetected() {
    this.stopTraceTimer();
    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();

    if (this.sound.playAlarmSiren) {
      this.sound.playAlarmSiren();
    }

    const history = this.terminal.querySelector('.terminal-history');
    if (history) {
      const alertEl = document.createElement('div');
      alertEl.className = 'terminal-line banner-danger';
      alertEl.style.color = '#ff0055';
      alertEl.style.fontWeight = 'bold';
      alertEl.style.padding = '8px';
      alertEl.style.border = '1px solid #ff0055';
      alertEl.style.margin = '10px 0';
      alertEl.innerHTML = `
        [!] EMERGENCY ALARM: SENTINEL IDS TRACE REACHED 100%!<br>
        [!] TRACE ROUTE: ENCLAVE LOCKDOWN INITIATED. INTRUSION FAILED.<br>
        [*] Press <strong>ENTER</strong> or type <strong>hacker</strong> to retry payload injection.
      `;
      history.appendChild(alertEl);
      this.scrollToBottom();
    }

    if (this.onTraceDetected) {
      this.onTraceDetected(HACKER_MISSIONS[this.currentMissionIndex]);
    }
  }

  loadCurrentMissionStage() {
    const mission = HACKER_MISSIONS[this.currentMissionIndex];
    if (!mission) return;

    const stage = mission.stages[this.currentStageIndex];
    if (!stage) {
      this.showMissionBreach();
      return;
    }

    this.targetText = stage.code;
    this.charIndex = 0;

    // Update Terminal History & Mission HUD
    const history = this.terminal.querySelector('.terminal-history');
    if (history) {
      const defensePercent = Math.round(((mission.stages.length - this.currentStageIndex) / mission.stages.length) * 100);
      const filledBars = Math.round(defensePercent / 5);
      const emptyBars = 20 - filledBars;
      const barVisual = '█'.repeat(filledBars) + '░'.repeat(emptyBars);

      const headerBlock = document.createElement('div');
      headerBlock.className = 'mission-header-block';
      headerBlock.innerHTML = `
        <div class="terminal-line highlight-mission-title">========================================================================================</div>
        <div class="terminal-line highlight-mission-title">[+] ${mission.title} | ${mission.difficulty}</div>
        <div class="terminal-line banner-dim">TARGET NODE: <span class="glow-cyan">${mission.target}</span></div>
        <div class="terminal-line banner-dim">FIREWALL INTEGRITY: <span class="glow-danger" id="defenseMeter">[${barVisual}] ${defensePercent}%</span></div>
        <div class="terminal-line banner-dim">STAGE ${this.currentStageIndex + 1}/${mission.stages.length}: <strong style="color: #ffffff;">${stage.prompt}</strong></div>
        <div class="terminal-line highlight-mission-title">========================================================================================</div>
      `;
      history.appendChild(headerBlock);
      this.scrollToBottom();
    }

    // Render interactive typing target line
    if (this.streamCode) {
      this.streamCode.innerHTML = '';
      this.charSpans = [];

      for (let i = 0; i < this.targetText.length; i++) {
        const char = this.targetText[i];
        const span = document.createElement('span');
        span.className = 'char';
        if (char === ' ') {
          span.classList.add('space-char');
          span.textContent = ' ';
        } else {
          span.textContent = char;
        }
        if (i === 0) span.classList.add('current');
        this.streamCode.appendChild(span);
        this.charSpans.push(span);
      }
    }

    this.updateTargetGuidance();
    this.startTraceTimer();
  }

  updateTargetGuidance() {
    if (this.charIndex < this.targetText.length) {
      const nextChar = this.targetText[this.charIndex];
      const finger = this.kb.getFingerForChar(nextChar);
      this.kb.setTargetKey(nextChar);
      this.hands.setTargetGuide(nextChar, finger);
    } else {
      this.kb.clearTargetKeys();
      this.hands.clearTargetGuide();
    }
  }

  handleKeyDown(event) {
    if (this.isBreachOpen) {
      this.hideBreach();
      return;
    }

    if (this.isInjecting) return;

    if (['Escape'].includes(event.key)) {
      this.hideBreach();
      return;
    }

    // Toggle Streamer Mode with Tab
    if (event.key === 'Tab') {
      event.preventDefault();
      this.mode = this.mode === 'mission' ? 'stream' : 'mission';
      const history = this.terminal.querySelector('.terminal-history');
      if (history) {
        const msg = document.createElement('div');
        msg.className = 'terminal-line highlight-line';
        msg.textContent = `[*] HACKER MODE SWITCHED TO: ${this.mode.toUpperCase()}`;
        history.appendChild(msg);
        this.scrollToBottom();
      }
      return;
    }

    // 1. Mission Mode (Interactive Guided Exploit Infiltration)
    if (this.mode === 'mission') {
      const expectedChar = this.targetText[this.charIndex];
      const key = event.key;

      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(key)) return;
      if (event.code === 'Space') event.preventDefault();

      if (key === 'Backspace') {
        event.preventDefault();
        if (this.charIndex > 0) {
          this.charIndex--;
          const prevSpan = this.charSpans[this.charIndex];
          prevSpan.className = 'char current' + (this.targetText[this.charIndex] === ' ' ? ' space-char' : '');
          if (this.charSpans[this.charIndex + 1]) {
            this.charSpans[this.charIndex + 1].classList.remove('current');
          }
          this.sound.playKey(false);
          this.updateTargetGuidance();
        }
        return;
      }

      const expectedKeyInfo = this.kb.charToCodeMap.get(expectedChar);
      let isCorrect = (key === expectedChar);
      if (!isCorrect && expectedKeyInfo) {
        const shiftMatches = expectedKeyInfo.shift ? event.shiftKey : !event.shiftKey;
        if (event.code === expectedKeyInfo.code && shiftMatches) {
          isCorrect = true;
        }
      }

      const currentSpan = this.charSpans[this.charIndex];

      if (isCorrect) {
        currentSpan.classList.remove('current', 'incorrect');
        currentSpan.classList.add('correct');
        this.sound.playKey(false);

        this.charIndex++;

        // Stage Complete Check -> TRIGGER MASSIVE CASCADING CODE INJECTION
        if (this.charIndex >= this.targetText.length) {
          this.triggerPayloadInjection();
          return;
        }

        const nextSpan = this.charSpans[this.charIndex];
        if (nextSpan) nextSpan.classList.add('current');
        this.updateTargetGuidance();
      } else {
        currentSpan.classList.add('incorrect');
        this.sound.playKey(true);
        this.kb.flashKeyError(event.code);
      }
      return;
    }

    // 2. Hollywood Fast Streamer Mode
    this.sound.playKey(false);
    const chunk = this.streamCodeSource.substring(this.streamCharIndex, this.streamCharIndex + this.streamChunkSize);
    this.streamCharIndex = (this.streamCharIndex + this.streamChunkSize) % this.streamCodeSource.length;
    this.streamTotalTyped += this.streamChunkSize;

    const history = this.terminal.querySelector('.terminal-history');
    if (history) {
      const lineEl = document.createElement('div');
      lineEl.className = 'terminal-line';
      lineEl.textContent = 'root@quantum-core:~# ' + chunk;
      history.appendChild(lineEl);
      this.scrollToBottom();
    }

    if (this.streamTotalTyped > 0 && this.streamTotalTyped % 160 === 0) {
      this.showMissionBreach();
    }
  }

  triggerPayloadInjection() {
    this.stopTraceTimer();
    this.isInjecting = true;
    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();

    if (this.sound.playPacketBurst) {
      this.sound.playPacketBurst();
    }

    if (this.sound.startLogStreamDrone) {
      this.sound.startLogStreamDrone();
    }

    const mission = HACKER_MISSIONS[this.currentMissionIndex];
    const stage = mission.stages[this.currentStageIndex];
    const history = this.terminal.querySelector('.terminal-history');

    // Generate massive cascading hacker logs
    const cascadingLines = generateHackerExploitLogs(mission, stage);

    let lineIndex = 0;
    const streamInterval = setInterval(() => {
      if (lineIndex < cascadingLines.length) {
        if (history) {
          const lEl = document.createElement('div');
          const txt = cascadingLines[lineIndex];

          if (lineIndex === 0 || txt.includes('[⚡') || txt.includes('[✓]')) {
            lEl.className = 'terminal-line highlight-success';
            lEl.style.color = '#00ff66';
            lEl.style.fontWeight = 'bold';
          } else if (txt.includes('================')) {
            lEl.className = 'terminal-line highlight-mission-title';
            lEl.style.color = '#00ff66';
          } else if (txt.startsWith('>>') || txt.startsWith('   ')) {
            lEl.className = 'terminal-line';
            lEl.style.color = txt.includes('ROOT') || txt.includes('SUCCESS') || txt.includes('ACQUIRED') ? '#00ff66' : '#00e5ff';
            lEl.style.fontFamily = 'monospace';
            lEl.style.fontSize = '12px';
          } else {
            lEl.className = 'terminal-line';
          }

          lEl.textContent = txt;
          history.appendChild(lEl);
          this.scrollToBottom();
        }

        if (this.sound.playLogLineAudio) {
          this.sound.playLogLineAudio(lineIndex, cascadingLines.length);
        }
        lineIndex++;
      } else {
        clearInterval(streamInterval);
        if (this.sound.stopLogStreamDrone) {
          this.sound.stopLogStreamDrone();
        }
        this.sound.playSuccessFanfare();

        setTimeout(() => {
          this.isInjecting = false;
          this.currentStageIndex++;

          if (this.currentStageIndex < mission.stages.length) {
            this.loadCurrentMissionStage();
          } else {
            this.showMissionBreach();
          }
        }, 500);
      }
    }, 45);
  }

  scrollToBottom() {
    if (this.terminal) {
      const hist = this.terminal.querySelector('.terminal-history');
      if (hist) {
        hist.scrollTop = hist.scrollHeight;
      }
      this.terminal.scrollTop = this.terminal.scrollHeight;
    }
    const wrapper = document.getElementById('terminalScreenWrapper');
    if (wrapper) {
      wrapper.scrollTop = wrapper.scrollHeight;
    }
  }

  showMissionBreach() {
    this.isBreachOpen = true;
    this.sound.playSuccessFanfare();

    const mission = HACKER_MISSIONS[this.currentMissionIndex];
    if (this.breachModal) {
      const grid = this.breachModal.querySelector('.breach-grid');
      if (grid && mission) {
        grid.innerHTML = `
          <div>TARGET: ${mission.target}</div>
          <div>FIREWALL: FULLY PENETRATED (100%)</div>
          <div>PRIVILEGE: UID 0 [ROOT ACCESS]</div>
          <div>MISSION STATUS: OBJECTIVE ACCOMPLISHED</div>
        `;
      }
      this.breachModal.classList.remove('hidden');
    }

    if (this.onMissionComplete) {
      this.onMissionComplete(mission);
    }
  }

  hideBreach() {
    this.isBreachOpen = false;
    if (this.breachModal) {
      this.breachModal.classList.add('hidden');
    }
    // Advance to next mission
    this.currentMissionIndex = (this.currentMissionIndex + 1) % HACKER_MISSIONS.length;
    this.currentStageIndex = 0;
    this.loadCurrentMissionStage();
  }
}

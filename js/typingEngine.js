/**
 * CYBER//TYPE REAL-TIME TYPING ENGINE
 * Features:
 * - Dynamic Target Character Guidance & Real-Time Bi-directional Layout Matching
 * - Endless Marathon Mode (`speed 0`) with Continuous Paragraph Cycles
 * - Batch Payload Injection & Script Execution Animations
 * - Live WPM, CPM, Accuracy, and Multiplier Streak Tracking
 */

export class TypingEngine {
  constructor(targetContainerEl, keyboardVisualizer, handsController, soundEngine) {
    this.container = targetContainerEl;
    this.kb = keyboardVisualizer;
    this.hands = handsController;
    this.sound = soundEngine;

    this.targetText = '';
    this.currentIndex = 0;
    this.charSpans = [];

    this.startTime = null;
    this.endTime = null;
    this.timerInterval = null;

    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.errorCount = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;

    // Live WPM & Accuracy Telemetry Curve (Monkeytype style)
    this.wpmHistory = [];
    this.isHardcore = false;

    // Endless Marathon State (speed 0)
    this.isEndless = false;
    this.batchesCleared = 0;
    this.cumulativeCorrectKeystrokes = 0;
    this.cumulativeTotalKeystrokes = 0;
    this.cumulativeErrors = 0;
    this.isBatchTransitioning = false;

    this.isActive = false;
    this.isCompleted = false;

    // Callbacks
    this.onUpdateMetrics = null;
    this.onCompleted = null;
    this.onBatchCompleted = null;
    this.onHardcoreFailed = null;
    this.onErrorKey = null;
    this.onCorrectKey = null;
    this.onErrorTrigger = null;
  }

  loadText(text, isEndless = false) {
    if (!this.isEndless || !isEndless) {
      this.reset();
    }
    this.isEndless = isEndless;
    this.targetText = text.trim();
    this.currentIndex = 0;
    this.isBatchTransitioning = false;
    this.renderText();
    this.updateTargetGuidance();
  }

  reset() {
    this.currentIndex = 0;
    this.startTime = null;
    this.endTime = null;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;

    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.errorCount = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.wpmHistory = [];

    this.batchesCleared = 0;
    this.cumulativeCorrectKeystrokes = 0;
    this.cumulativeTotalKeystrokes = 0;
    this.cumulativeErrors = 0;
    this.isBatchTransitioning = false;

    this.isActive = false;
    this.isCompleted = false;

    this.dispatchMetrics();
  }

  renderText() {
    this.container.innerHTML = '';
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

      if (i === 0) {
        span.classList.add('current');
      }

      this.container.appendChild(span);
      this.charSpans.push(span);
    }
  }

  updateTargetGuidance() {
    if (this.currentIndex < this.targetText.length && !this.isBatchTransitioning) {
      const nextChar = this.targetText[this.currentIndex];
      const finger = this.kb.getFingerForChar(nextChar);
      this.kb.setTargetKey(nextChar);
      this.hands.setTargetGuide(nextChar, finger);
    } else {
      this.kb.clearTargetKeys();
      this.hands.clearTargetGuide();
    }
  }

  handleKeyDown(event) {
    if (this.isCompleted || this.isBatchTransitioning) return;

    // Start timer on first valid keypress
    if (!this.isActive && !['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(event.key)) {
      this.start();
    }

    const expectedChar = this.targetText[this.currentIndex];
    const key = event.key;

    // Ignore standalone modifier keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(key)) {
      return;
    }

    // Prevent default scrolling for Space
    if (event.code === 'Space') {
      event.preventDefault();
    }

    // Handle Backspace (optional undo)
    if (key === 'Backspace') {
      event.preventDefault();
      if (this.currentIndex > 0) {
        this.currentIndex--;
        const prevSpan = this.charSpans[this.currentIndex];
        prevSpan.className = 'char current' + (this.targetText[this.currentIndex] === ' ' ? ' space-char' : '');
        if (this.charSpans[this.currentIndex + 1]) {
          this.charSpans[this.currentIndex + 1].classList.remove('current');
        }
        this.sound.playKey(false);
        this.updateTargetGuidance();
        this.scrollToCurrentChar();
      }
      return;
    }

    // Check key match
    this.totalKeystrokes++;
    const currentSpan = this.charSpans[this.currentIndex];
    const expectedKeyInfo = this.kb.charToCodeMap.get(expectedChar);

    let isCorrect = (key === expectedChar);
    if (!isCorrect && expectedKeyInfo) {
      const shiftMatches = expectedKeyInfo.shift ? event.shiftKey : !event.shiftKey;
      if (event.code === expectedKeyInfo.code && shiftMatches) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      this.correctKeystrokes++;
      this.currentStreak++;
      if (this.currentStreak > this.maxStreak) {
        this.maxStreak = this.currentStreak;
      }

      currentSpan.classList.remove('current', 'incorrect');
      currentSpan.classList.add('correct');

      if (this.onCorrectKey) {
        this.onCorrectKey(currentSpan);
      }

      // Combo milestone chime
      if (this.currentStreak % 15 === 0) {
        this.sound.playComboChime(this.currentStreak);
      } else {
        this.sound.playKey(false);
      }

      this.currentIndex++;

      // Complete or Batch Transition Check
      if (this.currentIndex >= this.targetText.length) {
        if (this.isEndless) {
          this.triggerBatchCycle();
        } else {
          this.complete();
        }
        return;
      }

      // Move cursor to next char
      const nextSpan = this.charSpans[this.currentIndex];
      if (nextSpan) {
        nextSpan.classList.add('current');
      }

      this.updateTargetGuidance();
      this.scrollToCurrentChar();
    } else {
      // Wrong keystroke
      this.errorCount++;
      this.currentStreak = 0;
      currentSpan.classList.add('incorrect');
      this.sound.playKey(true);
      this.kb.flashKeyError(event.code);

      if (this.onErrorTrigger) {
        this.onErrorTrigger();
      }

      // Weak Key & Hardcore Sudden Death triggers
      if (this.onErrorKey && expectedChar) {
        this.onErrorKey(expectedChar);
      }

      if (this.isHardcore && this.errorCount >= 3) {
        this.failHardcore();
        return;
      }
    }

    this.dispatchMetrics();
  }

  failHardcore() {
    this.isActive = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.onHardcoreFailed) {
      this.onHardcoreFailed(this.getStats());
    }
  }

  triggerBatchCycle() {
    this.isBatchTransitioning = true;
    this.batchesCleared++;
    this.cumulativeCorrectKeystrokes += this.correctKeystrokes;
    this.cumulativeTotalKeystrokes += this.totalKeystrokes;
    this.cumulativeErrors += this.errorCount;

    this.sound.playSuccessFanfare();
    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();

    if (this.onBatchCompleted) {
      this.onBatchCompleted(this.getStats());
    }
  }

  scrollToCurrentChar() {
    const currentSpan = this.charSpans[this.currentIndex];
    if (currentSpan) {
      const containerRect = this.container.getBoundingClientRect();
      const spanRect = currentSpan.getBoundingClientRect();

      if (spanRect.bottom > containerRect.bottom - 20 || spanRect.top < containerRect.top + 20) {
        currentSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  start() {
    this.isActive = true;
    if (!this.startTime) {
      this.startTime = Date.now();
    }
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.dispatchMetrics();
    }, 250);
  }

  complete() {
    this.isCompleted = true;
    this.isActive = false;
    this.endTime = Date.now();
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();
    this.sound.playSuccessFanfare();

    const stats = this.getStats();
    if (this.onCompleted) {
      this.onCompleted(stats);
    }
  }

  getStats() {
    const elapsedSeconds = this.startTime ? ((this.endTime || Date.now()) - this.startTime) / 1000 : 0;
    const elapsedMinutes = elapsedSeconds / 60;

    const totalCorrect = this.isEndless ? (this.cumulativeCorrectKeystrokes + this.correctKeystrokes) : this.correctKeystrokes;
    const totalKeys = this.isEndless ? (this.cumulativeTotalKeystrokes + this.totalKeystrokes) : this.totalKeystrokes;
    const totalErrors = this.isEndless ? (this.cumulativeErrors + this.errorCount) : this.errorCount;

    // Standard WPM: (all characters typed / 5) / minutes
    const wpm = elapsedMinutes > 0 ? Math.round((totalCorrect / 5) / elapsedMinutes) : 0;
    const cpm = elapsedMinutes > 0 ? Math.round(totalCorrect / elapsedMinutes) : 0;
    const accuracy = totalKeys > 0 ? Math.max(0, Math.round((totalCorrect / totalKeys) * 1000) / 10) : 100;
    const progress = this.targetText.length > 0 ? Math.round((this.currentIndex / this.targetText.length) * 100) : 0;

    return {
      wpm: isNaN(wpm) ? 0 : wpm,
      cpm: isNaN(cpm) ? 0 : cpm,
      accuracy: isNaN(accuracy) ? 100 : accuracy,
      errors: totalErrors,
      streak: this.currentStreak,
      maxStreak: this.maxStreak,
      progress: progress,
      batchesCleared: this.batchesCleared,
      isEndless: this.isEndless,
      isHardcore: this.isHardcore,
      wpmHistory: this.wpmHistory,
      elapsedSeconds: Math.round(elapsedSeconds * 10) / 10
    };
  }

  dispatchMetrics() {
    const stats = this.getStats();
    if (this.isActive && stats.elapsedSeconds > 0) {
      // Record time series datapoint every 500ms
      const lastPoint = this.wpmHistory[this.wpmHistory.length - 1];
      if (!lastPoint || (stats.elapsedSeconds - lastPoint.time) >= 0.5) {
        this.wpmHistory.push({
          time: stats.elapsedSeconds,
          wpm: stats.wpm,
          acc: stats.accuracy
        });
      }
    }
    if (this.onUpdateMetrics) {
      this.onUpdateMetrics(stats);
    }
  }
}

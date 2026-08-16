/**
 * MONKEYTYPE CYBER SPEED BENCHMARK ENGINE
 * Full-featured MonkeyType-inspired typing benchmark engine with 3-line rolling word display,
 * smooth gliding caret, live telemetry, interactive graphs, and procedural word generators.
 */

import { generateSpeedWords } from './speedWordlists.js';

export class MonkeySpeedEngine {
  constructor(options = {}) {
    this.wordsContainer = options.wordsContainer || null;
    this.caretEl = options.caretEl || null;
    this.hudEl = options.hudEl || null;
    this.kb = options.kb || null;
    this.hands = options.hands || null;
    this.sound = options.sound || null;
    this.toasts = options.toasts || null;

    // Active Configuration
    this.config = {
      mode: 'time', // 'time' | 'words' | 'quote' | 'zen'
      timeLimit: 30, // 15 | 30 | 60 | 120
      wordCount: 25, // 10 | 25 | 50 | 100
      dictionary: 'english200', // 'english200' | 'english1k' | 'code' | 'thai200' | 'cyber'
      hasPunctuation: false,
      hasNumbers: false,
      isHardcore: false
    };

    // Test State
    this.words = [];
    this.quoteAuthor = null;
    this.wordIndex = 0;
    this.charIndex = 0;
    this.wordElements = [];
    this.charElements = []; // array of arrays of char span elements

    // Typing Trackers
    this.isActive = false;
    this.isCompleted = false;
    this.startTime = null;
    this.endTime = null;
    this.timerInterval = null;
    this.telemetryInterval = null;
    this.elapsedSeconds = 0;
    this.remainingSeconds = 30;

    // Metrics
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.incorrectKeystrokes = 0;
    this.extraKeystrokes = 0;
    this.missedKeystrokes = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.wpmHistory = []; // { time, wpm, rawWpm, acc, errors }

    // Scroll & Line Carousel
    this.currentLineOffset = 0;
    this.lineHeight = 44;

    // Callbacks
    this.onCompleted = null;
    this.onUpdateMetrics = null;
    this.onErrorKey = null;
    this.onCorrectKey = null;
    this.onHardcoreFail = null;
  }

  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.resetTest();
  }

  resetTest() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.telemetryInterval) clearInterval(this.telemetryInterval);
    this.timerInterval = null;
    this.telemetryInterval = null;

    this.isActive = false;
    this.isCompleted = false;
    this.startTime = null;
    this.endTime = null;
    this.elapsedSeconds = 0;
    this.remainingSeconds = this.config.timeLimit || 30;

    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.incorrectKeystrokes = 0;
    this.extraKeystrokes = 0;
    this.missedKeystrokes = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.wpmHistory = [];
    this.currentLineOffset = 0;

    this.wordIndex = 0;
    this.charIndex = 0;

    // Generate fresh random word list
    const gen = generateSpeedWords(this.config);
    this.words = gen.words;
    this.quoteAuthor = gen.quoteAuthor || null;

    this.renderWords();
    this.updateCaret();
    this.updateTargetGuidance();
    this.dispatchMetrics();
  }

  renderWords() {
    if (!this.wordsContainer) return;
    this.wordsContainer.innerHTML = '';
    this.wordsContainer.style.transform = 'translateY(0px)';
    this.wordElements = [];
    this.charElements = [];

    const fragment = document.createDocumentFragment();

    this.words.forEach((wordText, wIdx) => {
      const wordDiv = document.createElement('div');
      wordDiv.className = 'monkey-word' + (wIdx === 0 ? ' active' : '');
      wordDiv.dataset.wordIndex = wIdx;

      const charSpans = [];
      for (let cIdx = 0; cIdx < wordText.length; cIdx++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'monkey-char' + (wIdx === 0 && cIdx === 0 ? ' current' : '');
        charSpan.textContent = wordText[cIdx];
        wordDiv.appendChild(charSpan);
        charSpans.push(charSpan);
      }

      fragment.appendChild(wordDiv);
      this.wordElements.push(wordDiv);
      this.charElements.push(charSpans);
    });

    this.wordsContainer.appendChild(fragment);

    // Initial caret position after DOM paint
    requestAnimationFrame(() => {
      this.updateCaret();
    });
  }

  updateCaret() {
    if (!this.caretEl || !this.wordsContainer) return;

    const currentWordEl = this.wordElements[this.wordIndex];
    if (!currentWordEl) return;

    const charSpans = this.charElements[this.wordIndex];
    let targetEl = null;

    const wrapper = this.wordsContainer.parentElement || this.wordsContainer;
    if (typeof wrapper.getBoundingClientRect !== 'function') return;
    const wrapperRect = wrapper.getBoundingClientRect();

    const caretHeight = this.caretEl.offsetHeight || 36;

    if (charSpans && this.charIndex < charSpans.length) {
      targetEl = charSpans[this.charIndex];
    } else if (charSpans && charSpans.length > 0) {
      // Past last character, align caret immediately after the last character
      const lastChar = charSpans[charSpans.length - 1];
      if (lastChar && typeof lastChar.getBoundingClientRect === 'function') {
        const rect = lastChar.getBoundingClientRect();
        const topY = rect.top - wrapperRect.top + Math.max(0, (rect.height - caretHeight) / 2);
        this.caretEl.style.transform = `translate(${rect.right - wrapperRect.left}px, ${topY}px)`;
      }
      return;
    }

    if (targetEl && typeof targetEl.getBoundingClientRect === 'function') {
      const rect = targetEl.getBoundingClientRect();
      const topY = rect.top - wrapperRect.top + Math.max(0, (rect.height - caretHeight) / 2);
      this.caretEl.style.transform = `translate(${rect.left - wrapperRect.left}px, ${topY}px)`;
    }
  }

  updateTargetGuidance() {
    if (this.isCompleted) {
      if (this.kb) this.kb.clearTargetKeys();
      if (this.hands) this.hands.clearTargetGuide();
      return;
    }

    const currentWord = this.words[this.wordIndex] || '';
    if (this.charIndex < currentWord.length) {
      const nextChar = currentWord[this.charIndex];
      if (this.kb) {
        this.kb.setTargetKey(nextChar);
        const finger = this.kb.getFingerForChar(nextChar);
        if (this.hands) this.hands.setTargetGuide(nextChar, finger);
      }
    } else {
      // Next is Space
      if (this.kb) this.kb.setTargetKey(' ');
      if (this.hands) this.hands.setTargetGuide(' ', 'rt');
    }
  }

  startTimer() {
    if (this.isActive) return;
    this.isActive = true;
    this.startTime = Date.now();

    // 1. Second Clock Ticker
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;

      if (this.config.mode === 'time') {
        this.remainingSeconds = Math.max(0, this.config.timeLimit - this.elapsedSeconds);
        if (this.remainingSeconds <= 0) {
          this.finishTest();
        }
      }

      this.dispatchMetrics();
    }, 1000);

    // 2. High-Frequency Telemetry Record (1 record per second for Graph)
    this.telemetryInterval = setInterval(() => {
      const curWpm = this.calculateLiveWpm();
      const rawWpm = this.calculateRawWpm();
      const acc = this.calculateAccuracy();
      this.wpmHistory.push({
        time: this.elapsedSeconds,
        wpm: curWpm,
        rawWpm: rawWpm,
        acc: acc,
        errors: this.incorrectKeystrokes
      });
    }, 1000);
  }

  calculateLiveWpm() {
    const elapsedMinutes = Math.max(1 / 60, (Date.now() - (this.startTime || Date.now())) / 60000);
    return Math.round((this.correctKeystrokes / 5) / elapsedMinutes);
  }

  calculateRawWpm() {
    const elapsedMinutes = Math.max(1 / 60, (Date.now() - (this.startTime || Date.now())) / 60000);
    return Math.round((this.totalKeystrokes / 5) / elapsedMinutes);
  }

  calculateAccuracy() {
    if (this.totalKeystrokes === 0) return 100;
    return Math.max(0, Math.min(100, Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)));
  }

  dispatchMetrics() {
    const liveWpm = this.calculateLiveWpm();
    const rawWpm = this.calculateRawWpm();
    const acc = this.calculateAccuracy();

    let displayCounter = '';
    if (this.config.mode === 'time') {
      displayCounter = `${this.remainingSeconds}s`;
    } else if (this.config.mode === 'words') {
      displayCounter = `${this.wordIndex} / ${this.words.length}`;
    } else if (this.config.mode === 'quote') {
      displayCounter = `QUOTE (${this.wordIndex}/${this.words.length})`;
    } else {
      const mins = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
      const secs = String(this.elapsedSeconds % 60).padStart(2, '0');
      displayCounter = `ZEN ${mins}:${secs}`;
    }

    if (this.onUpdateMetrics) {
      this.onUpdateMetrics({
        wpm: liveWpm,
        rawWpm: rawWpm,
        accuracy: acc,
        streak: this.currentStreak,
        maxStreak: this.maxStreak,
        counterText: displayCounter,
        elapsedSeconds: this.elapsedSeconds
      });
    }
  }

  handleKeyDown(e) {
    if (this.isCompleted) return;

    // 1. Quick Restart Key Shortcut (Tab or Tab+Enter)
    if (e.key === 'Tab') {
      e.preventDefault();
      this.resetTest();
      if (this.toasts) this.toasts.show('INFO', '⚡ TEST RESTARTED: FRESH WORD BATCH', 1200);
      return;
    }

    // 2. Standalone modifier keys ignore
    if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
      return;
    }

    // 3. Start timer on first valid character
    if (!this.isActive) {
      this.startTimer();
    }

    const currentWord = this.words[this.wordIndex] || '';
    const charSpans = this.charElements[this.wordIndex] || [];
    const wordDiv = this.wordElements[this.wordIndex];

    // 4. Handle Backspace (Delete character / word)
    if (e.key === 'Backspace') {
      e.preventDefault();

      if (e.ctrlKey) {
        // Ctrl+Backspace: Wipe active word input
        while (this.charIndex > 0) {
          this.charIndex--;
          const span = charSpans[this.charIndex];
          if (span) {
            if (span.classList.contains('extra')) {
              span.remove();
              charSpans.splice(this.charIndex, 1);
            } else {
              span.className = 'monkey-char';
            }
          }
        }
      } else if (this.charIndex > 0) {
        this.charIndex--;
        const span = charSpans[this.charIndex];
        if (span) {
          if (span.classList.contains('extra')) {
            span.remove();
            charSpans.splice(this.charIndex, 1);
          } else {
            span.className = 'monkey-char';
          }
        }
      }
      
      this.updateCaret();
      this.updateTargetGuidance();
      return;
    }

    // 5. Handle Spacebar (Advance to Next Word)
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();

      if (this.charIndex === 0) return; // Don't advance if word not started

      this.totalKeystrokes++;

      // Check if current word had untyped missing characters
      let wordHadErrors = false;
      for (let i = 0; i < currentWord.length; i++) {
        const span = charSpans[i];
        if (!span || !span.classList || (typeof span.classList.contains === 'function' && !span.classList.contains('correct'))) {
          wordHadErrors = true;
          if (span && span.classList) {
            if (typeof span.classList.contains !== 'function' || !span.classList.contains('incorrect')) {
              if (typeof span.classList.add === 'function') span.classList.add('missed');
              this.missedKeystrokes++;
            }
          }
        }
      }

      if (wordHadErrors) {
        if (wordDiv && wordDiv.classList && typeof wordDiv.classList.add === 'function') {
          wordDiv.classList.add('has-error');
        }
        this.currentStreak = 0;
      } else {
        if (wordDiv && wordDiv.classList && typeof wordDiv.classList.add === 'function') {
          wordDiv.classList.add('word-correct');
        }
        this.correctKeystrokes++;
        this.currentStreak++;
        if (this.currentStreak > this.maxStreak) this.maxStreak = this.currentStreak;
        if (this.sound && this.sound.playComboChime && this.currentStreak % 10 === 0) {
          this.sound.playComboChime(this.currentStreak);
        }
      }

      wordDiv.classList.remove('active');

      this.wordIndex++;
      this.charIndex = 0;

      // Check for test completion in Word / Quote mode
      if (this.wordIndex >= this.words.length) {
        if (this.config.mode === 'words' || this.config.mode === 'quote') {
          this.finishTest();
          return;
        } else {
          // Zen / Time mode: dynamically append more words
          const nextBatch = generateSpeedWords(this.config);
          this.appendMoreWords(nextBatch.words);
        }
      }

      // Activate new word
      const nextWordDiv = this.wordElements[this.wordIndex];
      if (nextWordDiv) {
        nextWordDiv.classList.add('active');
        this.checkSmoothLineRoll(nextWordDiv);
      }

      if (this.sound && this.sound.playEnterSound) {
        this.sound.playEnterSound();
      }

      this.updateCaret();
      this.updateTargetGuidance();
      this.dispatchMetrics();
      return;
    }

    // 6. Handle Printable Characters
    if (e.key.length === 1) {
      e.preventDefault();
      this.totalKeystrokes++;

      const typedChar = e.key;
      const expectedChar = currentWord[this.charIndex];

      if (this.charIndex < currentWord.length) {
        const span = charSpans[this.charIndex];
        if (typedChar === expectedChar) {
          span.className = 'monkey-char correct';
          this.correctKeystrokes++;
          this.currentStreak++;
          if (this.currentStreak > this.maxStreak) this.maxStreak = this.currentStreak;

          if (this.sound && this.sound.playKey) this.sound.playKey(false);
          if (this.onCorrectKey) this.onCorrectKey(span);
        } else {
          span.className = 'monkey-char incorrect';
          this.incorrectKeystrokes++;
          this.currentStreak = 0;

          if (this.sound && this.sound.playErrorSound) this.sound.playErrorSound();
          if (this.onErrorKey) this.onErrorKey(expectedChar);

          // Hardcore Sudden Death Check
          if (this.config.isHardcore) {
            this.finishTest(true);
            return;
          }
        }
        this.charIndex++;
      } else {
        // Extra characters typed past word length
        const extraSpan = document.createElement('span');
        extraSpan.className = 'monkey-char extra';
        extraSpan.textContent = typedChar;
        wordDiv.appendChild(extraSpan);
        charSpans.push(extraSpan);
        this.extraKeystrokes++;
        this.incorrectKeystrokes++;
        this.currentStreak = 0;
        this.charIndex++;

        if (this.sound && this.sound.playErrorSound) this.sound.playErrorSound();
      }

      this.updateCaret();
      this.updateTargetGuidance();
      this.dispatchMetrics();
    }
  }

  checkSmoothLineRoll(activeWordDiv) {
    if (!this.wordsContainer || !activeWordDiv) return;

    const wordTop = activeWordDiv.offsetTop;
    const lineHeight = activeWordDiv.offsetHeight || this.lineHeight || 52;
    this.lineHeight = lineHeight;

    const relativeWordTop = wordTop - this.currentLineOffset;

    // Roll up when active word progresses past line 2
    if (relativeWordTop >= lineHeight * 2) {
      this.currentLineOffset = wordTop - lineHeight;
      this.wordsContainer.style.transform = `translateY(-${this.currentLineOffset}px)`;
    } else if (wordTop < this.currentLineOffset) {
      // Roll down if user backspaced to a previous line
      this.currentLineOffset = Math.max(0, wordTop);
      this.wordsContainer.style.transform = `translateY(-${this.currentLineOffset}px)`;
    }
  }

  appendMoreWords(newWords) {
    if (!this.wordsContainer) return;
    const fragment = document.createDocumentFragment();

    newWords.forEach((wordText) => {
      const wIdx = this.words.length;
      this.words.push(wordText);

      const wordDiv = document.createElement('div');
      wordDiv.className = 'monkey-word';
      wordDiv.dataset.wordIndex = wIdx;

      const charSpans = [];
      for (let cIdx = 0; cIdx < wordText.length; cIdx++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'monkey-char';
        charSpan.textContent = wordText[cIdx];
        wordDiv.appendChild(charSpan);
        charSpans.push(charSpan);
      }

      fragment.appendChild(wordDiv);
      this.wordElements.push(wordDiv);
      this.charElements.push(charSpans);
    });

    this.wordsContainer.appendChild(fragment);
  }

  finishTest(hardcoreFailed = false) {
    if (this.isCompleted) return;
    this.isCompleted = true;
    this.isActive = false;
    this.endTime = Date.now();

    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.telemetryInterval) clearInterval(this.telemetryInterval);
    this.timerInterval = null;
    this.telemetryInterval = null;

    const totalSeconds = Math.max(1, this.elapsedSeconds);
    const finalWpm = this.calculateLiveWpm();
    const rawWpm = this.calculateRawWpm();
    const finalAcc = this.calculateAccuracy();

    // Calculate Consistency % (standard deviation of WPM curve)
    let consistency = 100;
    if (this.wpmHistory.length > 2) {
      const wpms = this.wpmHistory.map(h => h.wpm);
      const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      const variance = wpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpms.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(0, Math.min(100, Math.round(100 - (stdDev / (mean || 1)) * 100)));
    }

    const testSummary = {
      wpm: finalWpm,
      rawWpm: rawWpm,
      accuracy: finalAcc,
      consistency: consistency,
      elapsedSeconds: totalSeconds,
      totalKeystrokes: this.totalKeystrokes,
      correctKeystrokes: this.correctKeystrokes,
      incorrectKeystrokes: this.incorrectKeystrokes,
      extraKeystrokes: this.extraKeystrokes,
      missedKeystrokes: this.missedKeystrokes,
      maxStreak: this.maxStreak,
      wpmHistory: this.wpmHistory,
      config: { ...this.config },
      quoteAuthor: this.quoteAuthor,
      hardcoreFailed: hardcoreFailed
    };

    if (hardcoreFailed && this.onHardcoreFail) {
      this.onHardcoreFail(testSummary);
    } else if (this.onCompleted) {
      this.onCompleted(testSummary);
    }
  }
}

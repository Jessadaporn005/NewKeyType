/**
 * CYBER//TYPE TOAST NOTIFICATION SYSTEM
 * Handles cyber-styled floating notifications for Achievements, Level-ups, Bitcoin, and System Alerts.
 */

export class ToastManager {
  constructor(soundEngine = null) {
    this.sound = soundEngine;
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    let el = document.getElementById('cyberToastContainer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cyberToastContainer';
      el.className = 'cyber-toast-container';
      document.body.appendChild(el);
    }
    this.container = el;
  }

  show(options, messageArg = '', durationArg = 4000) {
    if (!this.container) this.initContainer();

    let title = 'SYSTEM NOTIFICATION';
    let message = '';
    let type = 'info';
    let icon = '⚡';
    let duration = 4000;
    let reward = null;

    if (typeof options === 'string') {
      type = options.toLowerCase();
      title = options.toUpperCase();
      message = messageArg || '';
      duration = durationArg || 4000;
      icon = type === 'achievement' ? '🏆' : type === 'danger' ? '🚨' : type === 'success' ? '✓' : '⚡';
    } else if (options && typeof options === 'object') {
      title = options.title || 'SYSTEM NOTIFICATION';
      message = options.message || '';
      type = options.type || 'info';
      icon = options.icon || (type === 'achievement' ? '🏆' : type === 'danger' ? '🚨' : type === 'success' ? '✓' : '⚡');
      duration = options.duration || 4000;
      reward = options.reward || null;
    }

    const toast = document.createElement('div');
    toast.className = `cyber-toast toast-${type}`;

    const iconEl = document.createElement('div');
    iconEl.className = 'toast-icon';
    iconEl.textContent = String(icon ?? '⚡');

    const contentEl = document.createElement('div');
    contentEl.className = 'toast-content';
    const titleEl = document.createElement('div');
    titleEl.className = 'toast-title';
    titleEl.textContent = String(title ?? 'SYSTEM NOTIFICATION');
    const messageEl = document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.textContent = String(message ?? '');
    contentEl.append(titleEl, messageEl);

    toast.append(iconEl, contentEl);
    if (reward) {
      const rewardEl = document.createElement('div');
      rewardEl.className = 'toast-reward';
      rewardEl.textContent = `+${String(reward)}`;
      toast.appendChild(rewardEl);
    }
    const barEl = document.createElement('div');
    barEl.className = 'toast-bar';
    toast.appendChild(barEl);

    toast.addEventListener('click', () => {
      this.dismiss(toast);
    });

    this.container.appendChild(toast);

    // Audio cue (Strictly muted if boot audio is locked)
    if (this.sound && !this.sound.isBootLocked) {
      if (type === 'achievement' || type === 'level_up') {
        if (this.sound.playSuccessFanfare) this.sound.playSuccessFanfare();
      } else if (type === 'danger') {
        if (this.sound.playErrorSound) this.sound.playErrorSound();
      } else {
        if (this.sound.playKey) this.sound.playKey(false);
      }
    }

    // Auto dismiss
    setTimeout(() => {
      this.dismiss(toast);
    }, duration);
  }

  dismiss(toast) {
    if (!toast || toast.classList.contains('dismissing')) return;
    toast.classList.add('dismissing');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }

  achievement(ach) {
    this.show({
      title: '★ ACHIEVEMENT UNLOCKED',
      message: `${ach.title}: ${ach.desc}`,
      type: 'achievement',
      icon: ach.icon || '🏆',
      reward: ach.rewardBtc ? `₿ ${ach.rewardBtc}` : null,
      duration: 5000
    });
  }

  levelUp(level, title = 'NETRUNNER') {
    this.show({
      title: '▲ OPERATOR LEVEL UP',
      message: `Reached LEVEL ${level} [${title}]`,
      type: 'level_up',
      icon: '⚡',
      duration: 4500
    });
  }

  bitcoin(amount, reason = 'Data Exfiltration') {
    this.show({
      title: '₿ BITCOIN TRANSFERRED',
      message: `${reason}`,
      type: 'bitcoin',
      icon: '💰',
      reward: `₿ ${amount}`,
      duration: 3500
    });
  }
}

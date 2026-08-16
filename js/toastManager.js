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

  show({ title = 'SYSTEM NOTIFICATION', message = '', type = 'info', icon = '⚡', duration = 4000, reward = null }) {
    if (!this.container) this.initContainer();

    const toast = document.createElement('div');
    toast.className = `cyber-toast toast-${type}`;

    let rewardHtml = '';
    if (reward) {
      rewardHtml = `<div class="toast-reward">+${reward}</div>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      ${rewardHtml}
      <div class="toast-bar"></div>
    `;

    toast.addEventListener('click', () => {
      this.dismiss(toast);
    });

    this.container.appendChild(toast);

    // Audio cue
    if (this.sound) {
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
      message: `<strong>${ach.title}</strong>: ${ach.desc}`,
      type: 'achievement',
      icon: ach.icon || '🏆',
      reward: ach.rewardBtc ? `₿ ${ach.rewardBtc}` : null,
      duration: 5000
    });
  }

  levelUp(level, title = 'NETRUNNER') {
    this.show({
      title: '▲ OPERATOR LEVEL UP',
      message: `Reached <strong>LEVEL ${level}</strong> [${title}]`,
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

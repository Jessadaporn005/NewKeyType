/**
 * CYBER//TYPE MR. ROBOT WORKSPACE AUTOMATOR & PROFILES LAUNCHER
 * Automates real desktop workspace configurations in 1-click.
 */

import { systemBridge } from './systemBridge.js';

export const WORKSPACE_PROFILES = [
  {
    id: 'dev_mode',
    name: 'FULLSTACK DEV ENVIRONMENT',
    tag: '💻 DEV MODE',
    desc: 'Spawns VS Code Studio IDE, Local Git Repo Explorer, and PowerShell Terminal.',
    icon: '⚡',
    color: '#00ff66',
    apps: ['code', 'explorer', 'powershell'],
    theme: 'matrix'
  },
  {
    id: 'gaming_rig',
    name: 'CYBERPUNK GAMING BATTLESTATION',
    tag: '🎮 GAMING RIG',
    desc: 'Launches Steam & Discord, sets CRT Phosphor shader and maximizes CPU priority.',
    icon: '🎮',
    color: '#ff2255',
    apps: ['steam', 'discord'],
    theme: 'cyberpunk'
  },
  {
    id: 'chill_lofi',
    name: 'CYBERWAVE RADIO & CHILL WORKSPACE',
    tag: '☕ CHILL / LOFI',
    desc: 'Launches Cyber Radio Synthwave stream, In-App Browser Lofi, and relaxes telemetry.',
    icon: '🎵',
    color: '#00e5ff',
    apps: ['radio', 'spotify'],
    theme: 'neon'
  },
  {
    id: 'netrunner_sec',
    name: 'NETRUNNER THREAT INFILTRATION DECK',
    tag: '🛡️ NETRUNNER SEC',
    desc: 'Opens Cyber Threat Globe, Port Scanner, Breach Protocol Daemons, and Virtual Net.',
    icon: '🛡️',
    color: '#b000ff',
    apps: ['threat', 'scan', 'breach'],
    theme: 'matrix'
  }
];

export class WorkspaceLauncherEngine {
  constructor(app, soundEngine, toastManager) {
    this.app = app;
    this.sound = soundEngine;
    this.toasts = toastManager;
  }

  async launchProfile(profileId) {
    const profile = WORKSPACE_PROFILES.find(p => p.id === profileId) || WORKSPACE_PROFILES[0];

    if (this.toasts) {
      this.toasts.show('SUCCESS', `Engaging Workspace Profile: ${profile.name}`, 3000);
    }
    if (this.sound) this.sound.playSuccessFanfare();

    // Set Theme
    if (profile.theme && this.app.setTheme) {
      this.app.setTheme(profile.theme);
    }

    // Launch each app sequentially
    for (const app of profile.apps) {
      if (app === 'code') {
        if (this.app.launchVscodeMode) this.app.launchVscodeMode('python');
      } else if (app === 'radio') {
        if (this.app.launchRadioMode) this.app.launchRadioMode();
      } else if (app === 'threat') {
        if (this.app.dom.cyberThreatModal && this.app.threatEngine) {
          this.app.dom.cyberThreatModal.classList.remove('hidden');
          this.app.threatEngine.start();
        }
      } else {
        await systemBridge.launch(app);
      }
    }

    return { success: true, profile: profile.name };
  }
}

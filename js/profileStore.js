/**
 * CYBER//TYPE PERMANENT ACCOUNT & PROFILE PERSISTENCE STORE
 * Stores persistent levels, EXP, high scores, mission progress, credentials,
 * Bitcoin (₿), Roguelite upgrades, and Achievements.
 */

const STORAGE_KEY = 'CYBERTYPE_OPERATOR_PROFILES_V1';

export const ACHIEVEMENTS_LIST = [
  { id: 'first_blood', title: 'SEC-AUDIT: Initial Physical Handshake', desc: 'Verify and calibrate initial keystroke actuation matrix', icon: '⚡', rewardBtc: 100 },
  { id: 'speed_demon_60', title: 'VELOCITY: 60+ WPM Kinematic Actuation', desc: 'Attain 60+ WPM continuous keystroke throughput', icon: '⚡', rewardBtc: 250 },
  { id: 'speed_demon_100', title: 'OVERCLOCK: 100+ WPM Synaptic Vector', desc: 'Surpass 100+ WPM high-bandwidth keystroke transfer', icon: '⚡', rewardBtc: 1000 },
  { id: 'flawless_run', title: 'INTEGRITY: 100% Zero-Fault Parity', desc: 'Achieve 100% accuracy with at least 50 WPM throughput', icon: '🛡️', rewardBtc: 500 },
  { id: 'hacker_initiate', title: 'SIGINT: Full Satellite Protocol Cleared', desc: 'Complete all 6 SIGINT Electronic Warfare missions', icon: '📡', rewardBtc: 600 },
  { id: 'roguelite_first_node', title: 'ROUTING: AS Node Ingress Verified', desc: 'Infiltrate first Autonomous System network node', icon: '🔓', rewardBtc: 150 },
  { id: 'roguelite_boss_down', title: 'ROOT-BREACH: Core Mainframe Compromised', desc: 'Successfully bypass Core Mainframe and extract payload', icon: '👑', rewardBtc: 1500 },
  { id: 'wordle_cracker', title: 'CRYPTANALYSIS: Sub-3 Hash Collision', desc: 'Resolve encrypted cipher in under 3 brute-force rounds', icon: '🔐', rewardBtc: 300 },
  { id: 'memory_dump_ace', title: 'FORENSICS: Zero-Mistake Memory Dump', desc: 'Audit and stream raw memory buffer with 0 parity errors', icon: '💾', rewardBtc: 350 },
  { id: 'cyberware_collector', title: 'SYS-UPGRADE: Multi-Module Hardening', desc: 'Deploy 3 or more kernel hardware acceleration modules', icon: '💎', rewardBtc: 500 },
  { id: 'marathon_runner', title: 'STABILITY: 3+ Min High-G Marathon', desc: 'Maintain unbroken typing throughput for over 180 seconds', icon: '⏱️', rewardBtc: 400 },
  { id: 'level_10_master', title: 'ACCREDITATION: Level 10 Principal Architect', desc: 'Attain Level 10 Root Clearance in the Security Enclave', icon: '🌟', rewardBtc: 2000 }
];

const DEFAULT_PROFILE = {
  username: 'Anan',
  password: 'Infinity',
  level: 1,
  exp: 0,
  expNext: 300,
  credits: 500,
  bitcoin: 200, // ₿ Starting Darknet balance
  peakWpm: 0,
  avgAccuracy: 100,
  totalKeystrokes: 0,
  batchesCleared: 0,
  missionsCleared: 0,
  daemonsUnlocked: ['ICEPICK_V1'],
  badges: ['INITIATE_OPERATOR', 'DEFCON_CERTIFIED'],
  achievements: [],
  inventory: ['stock_switches'],
  equippedSwitch: 'stock_switches',
  weakKeys: {},
  records: { speed15: 0, speed30: 0, speed60: 0, marathon: 0 },
  lessonStars: {},
  rogueliteStats: {
    runsAttempted: 0,
    runsCompleted: 0,
    highestDepth: 0,
    nodesHacked: 0,
    bitcoinEarnedTotal: 0
  },
  rogueliteUpgrades: {
    extraShields: 0,     // Max +3 (Starts with 5 + N shields)
    traceReduction: 0,   // Level 0-5 (-5% base trace per level)
    typingOverclock: 0,  // Level 0-5 (+10% EXP/BTC per level)
    sshCrackV2: false,   // Faster typing timer
    sqlInjector: false,  // Skip 1 firewall layer
    proxyBouncer: false, // Slows active traces by 30%
    instantDecryptor: false // Extra hints in Wordle pass crack
  },
  settings: {
    theme: 'matrix',
    sound: 'mechanical',
    layout: 'en',
    crt: true,
    prompt: 'default',
    customAliases: {}
  },
  wpmSessions: [],
  lastLogin: new Date().toISOString()
};

class ProfileStore {
  constructor() {
    this.profiles = {};
    this.isElectron = typeof window !== 'undefined' && window.cyberSystemAPI && window.cyberSystemAPI.isElectron;
    this.onAchievementUnlocked = null;
    this.initStore();
  }

  async initStore() {
    this.profiles = await this.loadAllAsync();
    if (!this.profiles['anan']) {
      this.profiles['anan'] = { ...DEFAULT_PROFILE };
      this.saveAllAsync();
    } else {
      // Ensure all schema fields exist on old saved profile
      this.profiles['anan'] = {
        ...DEFAULT_PROFILE,
        ...this.profiles['anan'],
        settings: { ...DEFAULT_PROFILE.settings, ...(this.profiles['anan'].settings || {}) },
        rogueliteStats: { ...DEFAULT_PROFILE.rogueliteStats, ...(this.profiles['anan'].rogueliteStats || {}) },
        rogueliteUpgrades: { ...DEFAULT_PROFILE.rogueliteUpgrades, ...(this.profiles['anan'].rogueliteUpgrades || {}) },
        achievements: this.profiles['anan'].achievements || [],
        wpmSessions: this.profiles['anan'].wpmSessions || []
      };
      this.saveAllAsync();
    }
  }

  async loadAllAsync() {
    try {
      if (this.isElectron && window.cyberSystemAPI.dbRead) {
        const res = await window.cyberSystemAPI.dbRead();
        if (res.success) return res.data || {};
      }
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      }
      return {};
    } catch (e) {
      return {};
    }
  }

  async saveAllAsync() {
    try {
      if (this.isElectron && window.cyberSystemAPI.dbWrite) {
        await window.cyberSystemAPI.dbWrite(this.profiles);
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profiles));
      }
    } catch (e) {
      // ignore
    }
  }

  getProfile(username = 'Anan') {
    const key = (username || 'Anan').toLowerCase().trim();
    if (!this.profiles[key]) {
      this.profiles[key] = {
        ...DEFAULT_PROFILE,
        username: username || 'Anan',
        password: (username || 'Anan') === 'Anan' ? 'Infinity' : 'password'
      };
      this.saveAllAsync();
    }
    return this.profiles[key];
  }

  verifyCredentials(username, password) {
    const key = (username || '').toLowerCase().trim();
    const profile = this.profiles[key];
    if (!profile) return false;
    return profile.password === password;
  }

  verifySecretGatePasscode(passcode) {
    if (!passcode) return false;
    const clean = passcode.trim().toLowerCase();
    return clean === 'infinity' || clean === 'anan';
  }

  saveProfile(profile) {
    if (!profile || !profile.username) return;
    const key = profile.username.toLowerCase().trim();
    this.profiles[key] = profile;
    this.saveAllAsync();
  }

  addExp(username, points) {
    const profile = this.getProfile(username);
    profile.exp += points;

    let leveledUp = false;
    while (profile.exp >= profile.expNext) {
      profile.exp -= profile.expNext;
      profile.level++;
      profile.expNext = Math.round(profile.expNext * 1.5);
      leveledUp = true;
      if (profile.level >= 10) {
        this.unlockAchievement(username, 'level_10_master');
      }
    }

    this.saveProfile(profile);
    return { profile, leveledUp };
  }

  addCredits(username, amount) {
    const profile = this.getProfile(username);
    profile.credits = (profile.credits || 0) + amount;
    this.saveProfile(profile);
    return profile.credits;
  }

  spendCredits(username, amount) {
    const profile = this.getProfile(username);
    if ((profile.credits || 0) < amount) return false;
    profile.credits -= amount;
    this.saveProfile(profile);
    return true;
  }

  addBitcoin(username, amount) {
    const profile = this.getProfile(username);
    profile.bitcoin = (profile.bitcoin || 0) + amount;
    if (!profile.rogueliteStats) profile.rogueliteStats = { ...DEFAULT_PROFILE.rogueliteStats };
    profile.rogueliteStats.bitcoinEarnedTotal = (profile.rogueliteStats.bitcoinEarnedTotal || 0) + amount;
    this.saveProfile(profile);
    return profile.bitcoin;
  }

  spendBitcoin(username, amount) {
    const profile = this.getProfile(username);
    if ((profile.bitcoin || 0) < amount) return false;
    profile.bitcoin -= amount;
    this.saveProfile(profile);
    return true;
  }

  buyRogueliteUpgrade(username, upgradeId, cost) {
    const profile = this.getProfile(username);
    if ((profile.bitcoin || 0) < cost) return { success: false, reason: 'INSUFFICIENT_BTC' };
    
    if (!profile.rogueliteUpgrades) profile.rogueliteUpgrades = { ...DEFAULT_PROFILE.rogueliteUpgrades };
    
    if (typeof profile.rogueliteUpgrades[upgradeId] === 'number') {
      profile.rogueliteUpgrades[upgradeId]++;
    } else {
      if (profile.rogueliteUpgrades[upgradeId]) return { success: false, reason: 'ALREADY_MAXED' };
      profile.rogueliteUpgrades[upgradeId] = true;
    }

    profile.bitcoin -= cost;
    this.saveProfile(profile);
    return { success: true, balance: profile.bitcoin, currentLevel: profile.rogueliteUpgrades[upgradeId] };
  }

  unlockAchievement(username, achievementId) {
    const profile = this.getProfile(username);
    if (!profile.achievements) profile.achievements = [];
    if (profile.achievements.includes(achievementId)) return false;

    const achDef = ACHIEVEMENTS_LIST.find(a => a.id === achievementId);
    if (!achDef) return false;

    profile.achievements.push(achievementId);
    if (achDef.rewardBtc) {
      profile.bitcoin = (profile.bitcoin || 0) + achDef.rewardBtc;
    }
    this.saveProfile(profile);

    if (this.onAchievementUnlocked) {
      this.onAchievementUnlocked(achDef);
    }
    return achDef;
  }

  hasItem(username, itemId) {
    const profile = this.getProfile(username);
    return Array.isArray(profile.inventory) && profile.inventory.includes(itemId);
  }

  buyItem(username, itemId, cost) {
    const profile = this.getProfile(username);
    if (this.hasItem(username, itemId)) return { success: false, reason: 'ALREADY_OWNED' };
    if ((profile.credits || 0) < cost) return { success: false, reason: 'INSUFFICIENT_FUNDS' };
    profile.credits -= cost;
    if (!Array.isArray(profile.inventory)) profile.inventory = ['stock_switches'];
    profile.inventory.push(itemId);

    if (profile.inventory.length >= 4) {
      this.unlockAchievement(username, 'cyberware_collector');
    }

    this.saveProfile(profile);
    return { success: true, credits: profile.credits };
  }

  equipSwitch(username, switchId) {
    const profile = this.getProfile(username);
    if (!this.hasItem(username, switchId) && switchId !== 'stock_switches') return false;
    profile.equippedSwitch = switchId;
    this.saveProfile(profile);
    return true;
  }

  recordWeakKey(username, char) {
    if (!char || typeof char !== 'string') return;
    const clean = char.toLowerCase();
    const profile = this.getProfile(username);
    if (!profile.weakKeys) profile.weakKeys = {};
    profile.weakKeys[clean] = (profile.weakKeys[clean] || 0) + 1;
    this.saveProfile(profile);
  }

  getWeakKeys(username) {
    const profile = this.getProfile(username);
    if (!profile.weakKeys) return [];
    return Object.entries(profile.weakKeys)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
  }

  recordSpeedBest(username, mode, wpm) {
    const profile = this.getProfile(username);
    if (!profile.records) profile.records = { speed15: 0, speed30: 0, speed60: 0, marathon: 0 };
    if (wpm >= 60) this.unlockAchievement(username, 'speed_demon_60');
    if (wpm >= 100) this.unlockAchievement(username, 'speed_demon_100');

    if (wpm > (profile.records[mode] || 0)) {
      profile.records[mode] = wpm;
      this.saveProfile(profile);
      return true; // new record!
    }
    return false;
  }

  recordLessonStars(username, lessonId, stars) {
    const profile = this.getProfile(username);
    if (!profile.lessonStars) profile.lessonStars = {};
    const current = profile.lessonStars[lessonId] || 0;
    if (stars > current) {
      profile.lessonStars[lessonId] = stars;
      this.saveProfile(profile);
    }
    this.unlockAchievement(username, 'first_blood');
    return profile.lessonStars[lessonId];
  }

  recordSessionStats(username, { wpm = 0, accuracy = 100, keystrokes = 0, batches = 0, missions = 0, duration = 30, mode = 'Speed Benchmark' }) {
    const profile = this.getProfile(username);
    if (wpm > profile.peakWpm) profile.peakWpm = wpm;
    profile.totalKeystrokes += keystrokes;
    profile.batchesCleared += batches;
    profile.missionsCleared += missions;
    profile.lastLogin = new Date().toISOString();

    if (accuracy === 100 && wpm >= 50) {
      this.unlockAchievement(username, 'flawless_run');
    }

    if (!profile.wpmSessions) profile.wpmSessions = [];
    profile.wpmSessions.push({
      date: new Date().toISOString(),
      mode,
      wpm,
      accuracy,
      duration
    });
    // Keep last 100 sessions
    if (profile.wpmSessions.length > 100) {
      profile.wpmSessions = profile.wpmSessions.slice(-100);
    }

    this.saveProfile(profile);
    return profile;
  }

  getUserSettings(username) {
    const profile = this.getProfile(username);
    return profile.settings || { ...DEFAULT_PROFILE.settings };
  }

  updateUserSettings(username, newSettings) {
    const profile = this.getProfile(username);
    profile.settings = {
      ...(profile.settings || DEFAULT_PROFILE.settings),
      ...newSettings
    };
    this.saveProfile(profile);
    return profile.settings;
  }
}

export const profileStore = new ProfileStore();

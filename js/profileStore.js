/**
 * CYBER//TYPE PERMANENT ACCOUNT & PROFILE PERSISTENCE STORE
 * Stores persistent levels, EXP, high scores, mission progress, credentials,
 * Bitcoin (₿), Roguelite upgrades, and Achievements.
 */

import { createZeroPaperGymStats, migrateLegacyDemoSeed } from './core/trading/gymState.js';
import { PAPER_ACCOUNT_MODEL, normalizeRiskPercent, restorePaperPositions, restorePaperTradeHistory } from './core/trading/paperAccount.js';
import { restorePaperExecutionAudit } from './core/trading/paperExecutionAudit.js';
import { restoreMLShadowModel, restoreMLShadowReport } from './core/trading/mlShadowModel.js';

const STORAGE_KEY = 'CYBERTYPE_OPERATOR_PROFILES_V1';
export const PROFILE_SCHEMA_VERSION = 6;
const CREDENTIAL_KDF = 'PBKDF2-SHA256';
const CREDENTIAL_ITERATIONS = 210000;

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
  profileSchemaVersion: PROFILE_SCHEMA_VERSION,
  username: 'Anan',
  credentials: null,
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
  tradingData: {
    paper: {
      domain: 'PAPER_SIMULATION',
      stats: createZeroPaperGymStats(),
      journal: [],
      weights: null,
      paperBalanceUSD: 100000.00,
      paperAccountModel: PAPER_ACCOUNT_MODEL,
      positions: [],
      tradeHistory: [],
      executionAudit: [],
      mlShadow: { model: null, report: null },
      riskAppetite: 'balanced',
      riskPercent: 2
    },
    live: {
      domain: 'LIVE_BROKER',
      status: 'UNVERIFIED',
      source: null,
      accountSnapshot: null,
      lastVerifiedAt: null
    },
  },
  vscodeFiles: {},
  browserData: {
    bookmarks: [],
    history: []
  },
  wpmSessions: [],
  lastLogin: new Date().toISOString()
};

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function finiteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function isValidCredential(value) {
  return isRecord(value)
    && value.kdf === CREDENTIAL_KDF
    && Number.isSafeInteger(value.iterations)
    && value.iterations >= 100000
    && typeof value.salt === 'string'
    && typeof value.hash === 'string';
}

async function derivePasswordHash(password, salt, iterations = CREDENTIAL_ITERATIONS) {
  if (!globalThis.crypto?.subtle) throw new Error('SECURE_CREDENTIAL_CRYPTO_UNAVAILABLE');
  const encoder = new TextEncoder();
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    256
  );
  return new Uint8Array(bits);
}

async function createCredential(password) {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt);
  return {
    version: 1,
    kdf: CREDENTIAL_KDF,
    iterations: CREDENTIAL_ITERATIONS,
    salt: bytesToBase64(salt),
    hash: bytesToBase64(hash)
  };
}

async function verifyCredential(credential, password) {
  if (!isValidCredential(credential) || typeof password !== 'string') return false;
  try {
    const expected = base64ToBytes(credential.hash);
    const actual = await derivePasswordHash(password, base64ToBytes(credential.salt), credential.iterations);
    if (expected.length !== actual.length) return false;
    let mismatch = 0;
    for (let i = 0; i < expected.length; i++) mismatch |= expected[i] ^ actual[i];
    return mismatch === 0;
  } catch (error) {
    return false;
  }
}

export function migrateProfile(rawProfile = {}, username = 'Anan') {
  const source = isRecord(rawProfile) ? rawProfile : {};
  const { aiTradingGymState: legacyPaperState, password: _legacyPassword, ...sourceWithoutLegacyGym } = source;
  const defaults = clone(DEFAULT_PROFILE);
  const sourcePaperCandidate = isRecord(source.tradingData?.paper)
    ? source.tradingData.paper
    : (isRecord(legacyPaperState) ? legacyPaperState : {});
  const paperMigration = migrateLegacyDemoSeed(sourcePaperCandidate);
  const sourcePaper = isRecord(paperMigration.state) ? paperMigration.state : {};
  const sourceLive = isRecord(source.tradingData?.live) ? source.tradingData.live : {};

  const sessions = Array.isArray(source.wpmSessions)
    ? source.wpmSessions.filter(session => isRecord(session)).slice(-100)
    : [];
  const accuracySessions = sessions.filter(session => Number.isFinite(Number(session.accuracy)));
  const avgAccuracy = accuracySessions.length
    ? Math.round((accuracySessions.reduce((sum, session) => sum + Number(session.accuracy), 0) / accuracySessions.length) * 10) / 10
    : finiteNumber(source.avgAccuracy, 100);

  return {
    ...defaults,
    ...sourceWithoutLegacyGym,
    profileSchemaVersion: PROFILE_SCHEMA_VERSION,
    username: String(source.username || username || 'Anan'),
    level: finiteNumber(source.level, defaults.level),
    exp: finiteNumber(source.exp, defaults.exp),
    expNext: finiteNumber(source.expNext, defaults.expNext),
    credits: finiteNumber(source.credits, defaults.credits),
    bitcoin: finiteNumber(source.bitcoin, defaults.bitcoin),
    peakWpm: finiteNumber(source.peakWpm, defaults.peakWpm),
    avgAccuracy,
    totalKeystrokes: finiteNumber(source.totalKeystrokes, defaults.totalKeystrokes),
    batchesCleared: finiteNumber(source.batchesCleared, defaults.batchesCleared),
    missionsCleared: finiteNumber(source.missionsCleared, defaults.missionsCleared),
    daemonsUnlocked: Array.isArray(source.daemonsUnlocked) ? [...source.daemonsUnlocked] : defaults.daemonsUnlocked,
    badges: Array.isArray(source.badges) ? [...source.badges] : defaults.badges,
    achievements: Array.isArray(source.achievements) ? [...source.achievements] : [],
    inventory: Array.isArray(source.inventory) ? [...source.inventory] : defaults.inventory,
    weakKeys: isRecord(source.weakKeys) ? { ...source.weakKeys } : {},
    records: { ...defaults.records, ...(isRecord(source.records) ? source.records : {}) },
    lessonStars: isRecord(source.lessonStars) ? { ...source.lessonStars } : {},
    rogueliteStats: { ...defaults.rogueliteStats, ...(isRecord(source.rogueliteStats) ? source.rogueliteStats : {}) },
    rogueliteUpgrades: { ...defaults.rogueliteUpgrades, ...(isRecord(source.rogueliteUpgrades) ? source.rogueliteUpgrades : {}) },
    settings: {
      ...defaults.settings,
      ...(isRecord(source.settings) ? source.settings : {}),
      customAliases: isRecord(source.settings?.customAliases) ? { ...source.settings.customAliases } : {}
    },
    tradingData: {
      paper: {
        ...defaults.tradingData.paper,
        ...sourcePaper,
        domain: 'PAPER_SIMULATION',
        stats: {
          ...defaults.tradingData.paper.stats,
          ...(isRecord(sourcePaper.stats) ? sourcePaper.stats : {})
        },
        journal: Array.isArray(sourcePaper.journal) ? sourcePaper.journal.slice(0, 50) : [],
        paperAccountModel: PAPER_ACCOUNT_MODEL,
        positions: sourcePaper.paperAccountModel === PAPER_ACCOUNT_MODEL
          ? restorePaperPositions(sourcePaper.positions, 50)
          : [],
        tradeHistory: sourcePaper.paperAccountModel === PAPER_ACCOUNT_MODEL
          ? restorePaperTradeHistory(sourcePaper.tradeHistory, 100)
          : [],
        executionAudit: sourcePaper.paperAccountModel === PAPER_ACCOUNT_MODEL
          ? restorePaperExecutionAudit(sourcePaper.executionAudit, 250)
          : [],
        mlShadow: {
          model: restoreMLShadowModel(sourcePaper.mlShadow?.model),
          report: restoreMLShadowReport(sourcePaper.mlShadow?.report)
        }
      },
      live: {
        ...defaults.tradingData.live,
        ...sourceLive,
        domain: 'LIVE_BROKER',
        status: sourceLive.status === 'VERIFIED' ? 'VERIFIED' : 'UNVERIFIED',
        accountSnapshot: sourceLive.status === 'VERIFIED' && isRecord(sourceLive.accountSnapshot)
          ? sourceLive.accountSnapshot
          : null
      }
    },
    vscodeFiles: isRecord(source.vscodeFiles) ? { ...source.vscodeFiles } : {},
    browserData: {
      bookmarks: Array.isArray(source.browserData?.bookmarks) ? [...source.browserData.bookmarks] : [],
      history: Array.isArray(source.browserData?.history) ? [...source.browserData.history] : []
    },
    wpmSessions: sessions
  };
}

class ProfileStore {
  constructor() {
    this.profiles = {};
    this.autoSaveInterval = null;
    this.lastPersistenceError = null;
    this.lastLoadMeta = null;
    this.isElectron = typeof window !== 'undefined' && window.cyberSystemAPI && window.cyberSystemAPI.isElectron;
    this.onAchievementUnlocked = null;
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('beforeunload', () => this.saveAllAsync());
      window.addEventListener('pagehide', () => this.saveAllAsync());
    }
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') this.saveAllAsync();
      });
    }
    if (typeof window !== 'undefined' && typeof setInterval !== 'undefined') {
      this.autoSaveInterval = setInterval(() => this.saveAllAsync(), 10000);
    }
    this.ready = this.initStore();
  }

  async initStore() {
    const loadedProfiles = await this.loadAllAsync();
    this.profiles = {};
    for (const [key, profile] of Object.entries(isRecord(loadedProfiles) ? loadedProfiles : {})) {
      const migrated = migrateProfile(profile, profile?.username || key);
      if (!isValidCredential(migrated.credentials) && typeof profile?.password === 'string' && profile.password.length >= 8) {
        migrated.credentials = await createCredential(profile.password);
      }
      this.profiles[key.toLowerCase()] = migrated;
    }
    if (!this.profiles['anan']) {
      this.profiles['anan'] = migrateProfile({}, 'Anan');
      this.profiles['anan'].credentials = await createCredential('Infinity');
    } else if (!isValidCredential(this.profiles['anan'].credentials)) {
      this.profiles['anan'].credentials = await createCredential('Infinity');
    }
    await this.saveAllAsync();
  }

  async loadAllAsync() {
    try {
      if (this.isElectron && window.cyberSystemAPI.dbRead) {
        const res = await window.cyberSystemAPI.dbRead();
        this.lastLoadMeta = res || null;
        if (res && res.success && isRecord(res.data) && Object.keys(res.data).length > 0) return res.data;
        if (res && !res.success) this.lastPersistenceError = res.error || 'DATABASE_READ_FAILED';
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
        const result = await window.cyberSystemAPI.dbWrite(this.profiles);
        if (!result?.success) throw new Error(result?.error || 'DATABASE_WRITE_FAILED');
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profiles));
      }
      this.lastPersistenceError = null;
      return { success: true };
    } catch (e) {
      this.lastPersistenceError = e?.message || 'DATABASE_WRITE_FAILED';
      return { success: false, error: this.lastPersistenceError };
    }
  }

  getTradingGymState(username = 'Anan') {
    const prof = this.getProfile(username);
    if (!prof.tradingData?.paper) {
      prof.tradingData = prof.tradingData || {};
      prof.tradingData.paper = clone(DEFAULT_PROFILE.tradingData.paper);
      this.saveAllAsync();
    }
    return clone(prof.tradingData.paper);
  }

  saveTradingGymState(username = 'Anan', state) {
    const prof = this.getProfile(username);
    prof.tradingData = prof.tradingData || clone(DEFAULT_PROFILE.tradingData);
    const currentPaper = isRecord(prof.tradingData.paper) ? prof.tradingData.paper : clone(DEFAULT_PROFILE.tradingData.paper);
    const incoming = isRecord(state) ? state : {};
    const acceptsAccountState = incoming.paperAccountModel === PAPER_ACCOUNT_MODEL;
    const balance = Number(incoming.paperBalanceUSD);
    prof.tradingData.paper = {
      ...currentPaper,
      ...incoming,
      domain: 'PAPER_SIMULATION',
      paperAccountModel: PAPER_ACCOUNT_MODEL,
      paperBalanceUSD: Number.isFinite(balance) && balance >= 0 ? balance : currentPaper.paperBalanceUSD,
      riskPercent: normalizeRiskPercent(incoming.riskPercent, currentPaper.riskPercent || 2),
      positions: acceptsAccountState
        ? restorePaperPositions(incoming.positions, 50)
        : restorePaperPositions(currentPaper.positions, 50),
      tradeHistory: acceptsAccountState
        ? restorePaperTradeHistory(incoming.tradeHistory, 100)
        : restorePaperTradeHistory(currentPaper.tradeHistory, 100),
      executionAudit: acceptsAccountState
        ? restorePaperExecutionAudit(incoming.executionAudit, 250)
        : restorePaperExecutionAudit(currentPaper.executionAudit, 250),
      mlShadow: {
        model: restoreMLShadowModel(incoming.mlShadow?.model) || restoreMLShadowModel(currentPaper.mlShadow?.model),
        report: restoreMLShadowReport(incoming.mlShadow?.report) || restoreMLShadowReport(currentPaper.mlShadow?.report)
      }
    };
    return this.saveAllAsync();
  }

  getVSCodeFiles(username = 'Anan') {
    const prof = this.getProfile(username);
    return prof.vscodeFiles || {};
  }

  saveVSCodeFiles(username = 'Anan', files) {
    const prof = this.getProfile(username);
    prof.vscodeFiles = { ...(prof.vscodeFiles || {}), ...files };
    this.saveAllAsync();
  }

  getBrowserData(username = 'Anan') {
    const prof = this.getProfile(username);
    return prof.browserData || { bookmarks: [], history: [] };
  }

  saveBrowserData(username = 'Anan', data) {
    const prof = this.getProfile(username);
    prof.browserData = { ...(prof.browserData || {}), ...data };
    this.saveAllAsync();
  }

  getProfile(username = 'Anan') {
    const key = (username || 'Anan').toLowerCase().trim();
    if (!this.profiles[key]) {
      this.profiles[key] = migrateProfile({ username: username || 'Anan' }, username);
      this.saveAllAsync();
    }
    return this.profiles[key];
  }

  async verifyCredentials(username, password) {
    const key = (username || '').toLowerCase().trim();
    if (!key || !password) return false;
    const profile = this.profiles[key];
    return profile ? verifyCredential(profile.credentials, password) : false;
  }

  async verifySecretGatePasscode(passcode) {
    if (!passcode) return false;
    const clean = passcode.trim();
    for (const profile of Object.values(this.profiles)) {
      if (await verifyCredential(profile?.credentials, clean)) return true;
    }
    return false;
  }

  async updatePassword(username, newPassword) {
    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 1024) return false;
    const key = (username || 'Anan').toLowerCase().trim();
    const profile = this.getProfile(username);
    profile.credentials = await createCredential(newPassword);
    delete profile.password;
    this.profiles[key] = profile;
    const saved = await this.saveAllAsync();
    return saved.success;
  }

  async updateUsername(oldUsername, newUsername) {
    const oldKey = (oldUsername || 'Anan').toLowerCase().trim();
    const newKey = (newUsername || '').toLowerCase().trim();
    if (!isValidUsername(newUsername) || !newKey || (newKey !== oldKey && this.profiles[newKey])) return false;

    const profile = this.getProfile(oldUsername);
    const previousUsername = profile.username;
    profile.username = newUsername.trim();

    delete this.profiles[oldKey];
    this.profiles[newKey] = profile;
    const saved = await this.saveAllAsync();
    if (!saved.success) {
      delete this.profiles[newKey];
      profile.username = previousUsername;
      this.profiles[oldKey] = profile;
      return false;
    }
    return true;
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
    const accuracySessions = profile.wpmSessions.filter(session => Number.isFinite(Number(session?.accuracy)));
    profile.avgAccuracy = accuracySessions.length
      ? Math.round((accuracySessions.reduce((sum, session) => sum + Number(session.accuracy), 0) / accuracySessions.length) * 10) / 10
      : 100;

    this.saveProfile(profile);
    return profile;
  }

  destroy() {
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    this.autoSaveInterval = null;
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
export function isValidUsername(value) {
  return typeof value === 'string'
    && /^[\p{L}\p{N}_-]{1,32}$/u.test(value.trim());
}

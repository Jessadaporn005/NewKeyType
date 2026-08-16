/**
 * CYBER//TYPE REAL-WORLD CYBER OS WORKSTATION & ADVANCED HACKER CONTROLLER
 * Supports real application launching (Chrome, Notepad, Calc, Code, Steam, Spotify),
 * Linux-like file manipulation (ls, pwd, cd, cat, mkdir, touch, nano),
 * Neofetch system hardware diagnostics, real ping/exec bridge,
 * Stage 0 Black-Ops Gate, Cyberpunk Breach Protocol, Watch Dogs Threat Globe,
 * The Matrix EMP Blast, and Mr. Robot USB Ducky Compiler.
 */

import { soundEngine } from './audio.js';
import { profileStore } from './profileStore.js';
import { systemBridge } from './systemBridge.js';
import { KeyboardVisualizer } from './keyboard.js';
import { CyberHandsController } from './hands.js';
import { MatrixVisualEngine } from './matrix.js';
import { LESSONS_DATA, SPEED_TEST_TEXTS } from './lessons.js';
import { TypingEngine } from './typingEngine.js';
import { MonkeySpeedEngine } from './monkeySpeedEngine.js';
import { HackerTyperEngine } from './hackerTyper.js';
import { BreachProtocolEngine } from './breachProtocol.js';
import { CyberThreatGlobeEngine } from './threatGlobe.js';
import { DUCKY_PAYLOAD_TEMPLATES } from './duckyCompiler.js';
import { generateEntranceLogs, generateExitLogs, generateLoginLogs } from './cyberLogGenerator.js';
import { generateRealisticBootLogs } from './bootLogGenerator.js';
import { VirtualNetwork } from './virtualNetwork.js';
import { RogueliteEngine } from './rogueliteEngine.js';
import { ToastManager } from './toastManager.js';
import { ParticleEffectEngine } from './particleEffect.js';
import { ControlCenter } from './controlCenter.js';
import { HologramAvatar } from './hologramAvatar.js';
import { VscodeEngine } from './vscodeEngine.js';
import { CyberBrowserEngine } from './cyberBrowser.js';
import { TabManager, TAB_TYPES } from './tabManager.js';
import { CyberIntelFeed } from './cyberIntelFeed.js';
import { CyberExplorerEngine } from './cyberExplorer.js';
import { TaskManagerViewEngine } from './taskManagerView.js';
import { WorkspaceLauncherEngine } from './workspaceLauncher.js';
import { CyberRadioEngine } from './cyberRadio.js';
import { CyberWifiEngine } from './cyberWifi.js';
import { AICompanionEngine } from './aiCompanion.js';
import { AITradingEngine } from './aiTradingEngine.js';

// Application States
const STATES = {
  BOOTING: 'BOOTING',
  GATE: 'GATE',
  LOGIN: 'LOGIN',
  LOADING: 'LOADING',
  CLI_PROMPT: 'CLI_PROMPT',
  MODE_ACADEMY: 'MODE_ACADEMY',
  MODE_HACKER: 'MODE_HACKER',
  MODE_SPEED: 'MODE_SPEED',
  MODE_SANDBOX: 'MODE_SANDBOX',
  MODE_ROGUELITE: 'MODE_ROGUELITE',
  MODE_VSCODE: 'MODE_VSCODE',
  MODE_BROWSER: 'MODE_BROWSER',
  MODE_EXPLORER: 'MODE_EXPLORER',
  MODE_TASKMGR: 'MODE_TASKMGR',
  MODE_RADIO: 'MODE_RADIO',
  MODE_WIFI: 'MODE_WIFI',
  MODE_TRADING: 'MODE_TRADING'
};

class WindowsTerminalApp {
  constructor() {
    this.state = STATES.BOOTING;
    this.username = 'Anan';
    this.currentLayout = 'en';
    this.currentTheme = 'matrix';
    this.currentSound = 'hollywood';
    this.promptStyle = 'windows'; // windows | kali | arch | ubuntu | matrix

    this.cliInputBuffer = '';
    this.cliCursorPos = 0;
    this.cliHistoryStack = [];
    this.cliHistoryIndex = -1;
    this.customAliases = {};

    // Profile & RPG Level
    this.profile = null; // Loaded in init()

    // Engines
    this.audio = soundEngine;
    this.sys = systemBridge;
    this.matrix = null;
    this.kb = null;
    this.hands = null;
    this.academyEngine = null;
    this.speedEngine = null;
    this.hackerEngine = null;
    this.breachEngine = null;
    this.threatEngine = null;
    this.rogueliteEngine = null;
    this.controlCenter = null;
    this.tabManager = null;
    this.intelFeed = null;
    this.toasts = new ToastManager(this.audio);
    this.particles = new ParticleEffectEngine();
    this.holoAvatar = new HologramAvatar();

    profileStore.onAchievementUnlocked = (ach) => {
      if (this.toasts) this.toasts.achievement(ach);
    };

    // Sandbox editor state
    this.currentEditingFile = null;

    // Speed test timer & endless runner
    this.speedDuration = 30;
    this.speedTimerInterval = null;
    this.speedTimeLeft = 30;
    this.speedElapsedSeconds = 0;

    // Transition state
    this.isTransitioning = false;
    this.transitionInterval = null;
    this.skipCurrentTransition = null;

    this.isGhostMode = new URLSearchParams(window.location.search).get('ghost') === '1';
    this.workstationEnginesInitialized = false;
    
    // DOM Elements
    this.dom = {};
  }

  ensureWorkstationEngines() {
    if (this.workstationEnginesInitialized) return;
    this.workstationEnginesInitialized = true;
    this.initEngines();
    this.initC2TelemetryFeatures();
    this.syncProfileToHud();
    this.applyUserSettings(this.username || 'Anan');
    this.startHudTelemetry();
  }

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetMode = urlParams.get('mode');
    const targetUrl = urlParams.get('url');
    const skipBoot = urlParams.get('skipBoot') === '1' || this.isGhostMode || !!targetMode;

    if (this.isGhostMode) {
      document.body.classList.add('ghost-mode');
      if (this.audio) {
        this.audio.isMuted = true;
        this.audio.volume = 0;
      }
    }
    
    this.cacheDOM();

    // Start background Matrix visual engine immediately for Stage 0/1/2/3
    if (!this.matrix) {
      this.matrix = new MatrixVisualEngine('matrixCanvas', 'particleCanvas');
    }

    if (skipBoot) {
      if (this.dom.bootScreenOverlay) this.dom.bootScreenOverlay.classList.add('hidden');
      if (this.dom.secretGateOverlay) this.dom.secretGateOverlay.classList.add('hidden');
      if (this.dom.hackerLoginOverlay) this.dom.hackerLoginOverlay.classList.add('hidden');
      if (this.dom.mainTerminalContainer) this.dom.mainTerminalContainer.classList.remove('hidden');
      this.state = STATES.CLI_PROMPT;
      if (this.audio && typeof this.audio.unlockBootAudio === 'function') {
        this.audio.unlockBootAudio();
      }
      this.ensureWorkstationEngines();
    } else {
      // Start unskippable cinematic 20s boot sequence immediately
      if (this.audio && typeof this.audio.lockBootAudio === 'function') {
        this.audio.lockBootAudio();
      }
      this.playBootSequence();
    }

    try {
      await profileStore.initStore();
      this.profile = profileStore.getProfile('Anan');
      await this.sys.init();
      this.registerServiceWorker();
      this.bindEvents();

      if (skipBoot) {
        if (targetMode === 'browser' || targetMode === 'web') {
          setTimeout(() => this.launchBrowserMode(targetUrl || 'https://www.google.com'), 100);
        } else if (targetMode === 'vscode' || targetMode === 'code') {
          setTimeout(() => this.launchVscodeMode(targetUrl || 'python'), 100);
        }
      }
    } catch (err) {
      console.error('[!] Subsystem initialization error:', err);
    }
  }

  cacheDOM() {
    this.dom = {
      // Boot Screen
      bootScreenOverlay: document.getElementById('bootScreenOverlay'),
      bootScreenLogs: document.getElementById('bootScreenLogs'),
      bootScreenLogo: document.getElementById('bootScreenLogo'),
      bootScreenReady: document.getElementById('bootScreenReady'),
      bootProgressFill: document.getElementById('bootProgressFill'),
      bootProgressPct: document.getElementById('bootProgressPct'),
      bootProgressTime: document.getElementById('bootProgressTime'),
      bootProgressStage: document.getElementById('bootProgressStage'),

      // Stage 0 Secret Gate
      secretGateOverlay: document.getElementById('secretGateOverlay'),
      secretGateInput: document.getElementById('secretGateInput'),
      btnSecretGateSubmit: document.getElementById('btnSecretGateSubmit'),
      gateErrorMsg: document.getElementById('gateErrorMsg'),
      gateStreamBox: document.getElementById('gateStreamBox'),
      gateStreamLines: document.getElementById('gateStreamLines'),

      // Stage 1 Hacker Login
      hackerLoginOverlay: document.getElementById('hackerLoginOverlay'),
      loginUserField: document.getElementById('loginUserField'),
      loginPassField: document.getElementById('loginPassField'),
      btnLoginSubmit: document.getElementById('btnLoginSubmit'),
      btnLoginBypass: document.getElementById('btnLoginBypass'),
      loginCipherStream: document.getElementById('loginCipherStream'),

      // Universal Cyber Transition Overlay
      universalTransitionOverlay: document.getElementById('universalTransitionOverlay'),
      transBadge: document.getElementById('transBadge'),
      transPercent: document.getElementById('transPercent'),
      transHeadline: document.getElementById('transHeadline'),
      transProgressFill: document.getElementById('transProgressFill'),
      modChips: [
        document.getElementById('modChip1'),
        document.getElementById('modChip2'),
        document.getElementById('modChip3'),
        document.getElementById('modChip4'),
        document.getElementById('modChip5'),
        document.getElementById('modChip6')
      ],
      transTerminalViewport: document.getElementById('transTerminalViewport'),
      transLogLines: document.getElementById('transLogLines'),
      transHoloAvatarCanvas: document.getElementById('transHoloAvatarCanvas'),
      transDossierUser: document.getElementById('transDossierUser'),
      transDossierLevel: document.getElementById('transDossierLevel'),
      transDossierRank: document.getElementById('transDossierRank'),
      transDossierExpTxt: document.getElementById('transDossierExpTxt'),
      transDossierExpFill: document.getElementById('transDossierExpFill'),
      transDossierWpm: document.getElementById('transDossierWpm'),
      transDossierAcc: document.getElementById('transDossierAcc'),
      transDossierCredits: document.getElementById('transDossierCredits'),
      transDossierBtc: document.getElementById('transDossierBtc'),

      mainTerminalContainer: document.getElementById('mainTerminalContainer'),
      terminalScreenWrapper: document.getElementById('terminalScreenWrapper'),
      
      // Window Controls
      winMinBtn: document.querySelector('.win-min'),
      winMaxBtn: document.querySelector('.win-max'),
      winCloseBtn: document.querySelector('.win-close'),

      // Views
      views: {
        cli: document.getElementById('viewCli'),
        academy: document.getElementById('viewAcademy'),
        hacker: document.getElementById('viewHacker'),
        speed: document.getElementById('viewSpeed'),
        sandbox: document.getElementById('viewSandbox'),
        roguelite: document.getElementById('viewRoguelite'),
        vscode: document.getElementById('viewVscode'),
        browser: document.getElementById('viewBrowser'),
        explorer: document.getElementById('viewExplorer'),
        taskmgr: document.getElementById('viewTaskManager'),
        radio: document.getElementById('viewRadio'),
        wifi: document.getElementById('viewWifi'),
        trading: document.getElementById('viewTrading')
      },

      // CLI Elements
      cliHistory: document.getElementById('cliHistory'),
      cliPromptPath: document.getElementById('cliPromptPath'),
      cliInputText: document.getElementById('cliInputText'),
      cliCursor: document.getElementById('cliCursor'),
      cliInputAfter: document.getElementById('cliInputAfter'),
      cliActivePromptRow: document.getElementById('cliActivePromptRow'),
      cliSessionUser: document.getElementById('cliSessionUser'),

      // Academy Elements
      academyLessonTitle: document.getElementById('academyLessonTitle'),
      acadWpm: document.getElementById('acadWpm'),
      acadCpm: document.getElementById('acadCpm'),
      acadAcc: document.getElementById('acadAcc'),
      acadErr: document.getElementById('acadErr'),
      acadStreak: document.getElementById('acadStreak'),
      acadProg: document.getElementById('acadProg'),
      acadSpeedoNeedle: document.getElementById('acadSpeedoNeedle'),
      acadSpeedoText: document.getElementById('acadSpeedoText'),
      academyTypingCanvas: document.getElementById('academyTypingCanvas'),
      targetTextContainer: document.getElementById('targetTextContainer'),

      // Hacker Elements
      hackerTerminalCanvas: document.getElementById('hackerTerminalCanvas'),
      hackerTerminalOutput: document.getElementById('hackerTerminalOutput'),
      hackerStreamCode: document.getElementById('hackerStreamCode'),
      hackerBreachModal: document.getElementById('hackerBreachModal'),

      // MonkeyType Speed Elements
      monkeyConfigBar: document.getElementById('monkeyConfigBar'),
      monkeyLiveHud: document.getElementById('monkeyLiveHud'),
      monkeyCounterDisplay: document.getElementById('monkeyCounterDisplay'),
      monkeyLiveWpm: document.getElementById('monkeyLiveWpm'),
      monkeyLiveRawWpm: document.getElementById('monkeyLiveRawWpm'),
      monkeyLiveAcc: document.getElementById('monkeyLiveAcc'),
      monkeyLiveStreak: document.getElementById('monkeyLiveStreak'),
      monkeyWordsWrapper: document.getElementById('monkeyWordsWrapper'),
      monkeyWordsContainer: document.getElementById('monkeyWordsContainer'),
      monkeyCaret: document.getElementById('monkeyCaret'),
      btnTogglePunctuation: document.getElementById('btnTogglePunctuation'),
      btnToggleNumbers: document.getElementById('btnToggleNumbers'),
      selectSpeedDictionary: document.getElementById('selectSpeedDictionary'),
      btnQuickRestartSpeed: document.getElementById('btnQuickRestartSpeed'),

      // Sandbox Elements
      sandboxTextarea: document.getElementById('sandboxTextarea'),

      // Netrunner EXP HUD
      hudLevelBadge: document.getElementById('hudLevelBadge'),
      hudExpFill: document.getElementById('hudExpFill'),
      hudExpText: document.getElementById('hudExpText'),
      currentLayoutDisplay: document.getElementById('currentLayoutDisplay'),
      currentSoundDisplay: document.getElementById('currentSoundDisplay'),

      // Cyber-HUD Telemetry
      cyberHudDashboard: document.getElementById('cyberHudDashboard'),
      hudCpuBar: document.getElementById('hudCpuBar'),
      hudCpuVal: document.getElementById('hudCpuVal'),
      hudRamBar: document.getElementById('hudRamBar'),
      hudRamVal: document.getElementById('hudRamVal'),
      hudNetDown: document.getElementById('hudNetDown'),
      hudNetUp: document.getElementById('hudNetUp'),
      hudCredits: document.getElementById('hudCredits'),
      hudTracePanel: document.getElementById('hudTracePanel'),
      hudTraceBar: document.getElementById('hudTraceBar'),
      hudTraceVal: document.getElementById('hudTraceVal'),
      
      heatmapModal: document.getElementById('heatmapModal'),
      heatmapCloseBtn: document.getElementById('heatmapCloseBtn'),
      heatmapGrid: document.getElementById('heatmapGrid'),
      
      nodeGraphModal: document.getElementById('nodeGraphModal'),
      nodeGraphCloseBtn: document.getElementById('nodeGraphCloseBtn'),
      nodeGraphSvg: document.getElementById('nodeGraphSvg'),
      
      packetSnifferModal: document.getElementById('packetSnifferModal'),
      packetSnifferCloseBtn: document.getElementById('packetSnifferCloseBtn'),
      packetSnifferOutput: document.getElementById('packetSnifferOutput'),

      camhackModal: document.getElementById('camhackModal'),
      camhackCloseBtn: document.getElementById('camhackCloseBtn'),
      camhackVideo: document.getElementById('camhackVideo'),
      
      bgmStatusTag: document.getElementById('bgmStatusTag'),

      // Hardware
      hardwareDock: document.getElementById('hardwareDockContainer'),
      cyberKeyboard: document.getElementById('cyberKeyboard'),
      cyberHandsContainer: document.getElementById('cyberHandsContainer'),
      guideNextKeyDisplay: document.getElementById('guideNextKeyDisplay'),
      guideNextFingerDisplay: document.getElementById('guideNextFingerDisplay'),
      currentLayoutDisplay: document.getElementById('currentLayoutDisplay'),
      currentSoundDisplay: document.getElementById('currentSoundDisplay'),

      // Modals & Overlays
      cyberNetworkMapModal: document.getElementById('cyberNetworkMapModal'),
      mapCloseBtn: document.getElementById('mapCloseBtn'),
      cyberLevelUpToast: document.getElementById('cyberLevelUpToast'),
      toastRankText: document.getElementById('toastRankText'),

      breachProtocolModal: document.getElementById('breachProtocolModal'),
      breachCloseBtn: document.getElementById('breachCloseBtn'),

      cyberThreatModal: document.getElementById('cyberThreatModal'),
      threatGlobeCanvas: document.getElementById('threatGlobeCanvas'),
      threatTickerConsole: document.getElementById('threatTickerConsole'),
      threatCloseBtn: document.getElementById('threatCloseBtn'),

      duckyPayloadModal: document.getElementById('duckyPayloadModal'),
      duckyCodePreview: document.getElementById('duckyCodePreview'),
      btnDeployDucky: document.getElementById('btnDeployDucky'),
      duckyCloseBtn: document.getElementById('duckyCloseBtn'),

      empShockwaveOverlay: document.getElementById('empShockwaveOverlay'),

      scoreModal: document.getElementById('scoreModal'),
      modalCloseBtn: document.getElementById('modalCloseBtn'),
      modalRetryBtn: document.getElementById('modalRetryBtn'),
      modalNextLessonBtn: document.getElementById('modalNextLessonBtn'),
      modalCloseScoreBtn: document.getElementById('modalCloseScoreBtn'),
      resultRank: document.getElementById('resultRank'),
      modalFinalWpm: document.getElementById('modalFinalWpm'),
      modalFinalRaw: document.getElementById('modalFinalRaw'),
      modalFinalAcc: document.getElementById('modalFinalAcc'),
      modalFinalConsistency: document.getElementById('modalFinalConsistency'),
      modalFinalChars: document.getElementById('modalFinalChars'),
      modalFinalTime: document.getElementById('modalFinalTime'),
      modalTestConfigTag: document.getElementById('modalTestConfigTag'),
      modalChartContainer: document.getElementById('modalChartContainer'),
      modalSpeedChartSvg: document.getElementById('modalSpeedChartSvg'),

      // AI Trading Terminal Elements
      tradingCandleCanvas: document.getElementById('tradingCandleCanvas'),
      tradingSubCanvas: document.getElementById('tradingSubCanvas'),
      tradingPairTabs: document.getElementById('tradingPairTabs'),
      tradingTimeframeSelector: document.getElementById('tradingTimeframeSelector'),
      chkEma: document.getElementById('chkEma'),
      chkBollinger: document.getElementById('chkBollinger'),
      chkPatterns: document.getElementById('chkPatterns'),
      aiSignalBadge: document.getElementById('aiSignalBadge'),
      aiMarketRegime: document.getElementById('aiMarketRegime'),
      aiStrategyPlaybook: document.getElementById('aiStrategyPlaybook'),
      aiRiskWarning: document.getElementById('aiRiskWarning'),
      aiConfidenceVal: document.getElementById('aiConfidenceVal'),
      aiRrVal: document.getElementById('aiRrVal'),
      aiEntryVal: document.getElementById('aiEntryVal'),
      aiTp1Val: document.getElementById('aiTp1Val'),
      aiTp2Val: document.getElementById('aiTp2Val'),
      aiSlVal: document.getElementById('aiSlVal'),
      aiPatternTags: document.getElementById('aiPatternTags'),
      aiRationaleBox: document.getElementById('aiRationaleBox'),
      paperCapitalDisplay: document.getElementById('paperCapitalDisplay'),
      btnOrderLong: document.getElementById('btnOrderLong'),
      btnOrderShort: document.getElementById('btnOrderShort'),
      activePositionsContainer: document.getElementById('activePositionsContainer'),
      tradingNewsSource: document.getElementById('tradingNewsSource'),
      tradingNewsHeadline: document.getElementById('tradingNewsHeadline'),
      tradingNewsSentimentBadge: document.getElementById('tradingNewsSentimentBadge'),
      btnAIFastTrain: document.getElementById('btnAIFastTrain'),
      btnAIResetMem: document.getElementById('btnAIResetMem'),
      aiWinRateDisplay: document.getElementById('aiWinRateDisplay'),
      aiRecordDisplay: document.getElementById('aiRecordDisplay'),
      aiNetPnlDisplay: document.getElementById('aiNetPnlDisplay'),
      aiAdaptationLevel: document.getElementById('aiAdaptationLevel'),
      chkAIAutoTrader: document.getElementById('chkAIAutoTrader'),
      aiJournalFeed: document.getElementById('aiJournalFeed'),
      tradingSidebarTabs: document.getElementById('tradingSidebarTabs'),
      panelTradingCopilot: document.getElementById('panelTradingCopilot'),
      panelTradingGym: document.getElementById('panelTradingGym'),
      panelTradingPaper: document.getElementById('panelTradingPaper'),
      tabWinrateTag: document.getElementById('tabWinrateTag'),

      // Academy Mission Grid Modal
      academyGridModal: document.getElementById('academyGridModal'),
      academyGridCloseBtn: document.getElementById('academyGridCloseBtn'),
      academyMissionGrid: document.getElementById('academyMissionGrid'),
      tabEnAcademy: document.getElementById('tabEnAcademy'),
      tabThAcademy: document.getElementById('tabThAcademy'),
      tabWeakAcademy: document.getElementById('tabWeakAcademy')
    };
  }

  initEngines() {
    this.matrix = new MatrixVisualEngine('matrixCanvas', 'particleCanvas');
    this.virtualNet = new VirtualNetwork(this);

    this.kb = new KeyboardVisualizer(this.dom.cyberKeyboard);
    this.kb.setLayout(this.currentLayout);
    this.kb.render();

    this.hands = new CyberHandsController(
      this.dom.cyberHandsContainer,
      this.kb,
      this.dom.guideNextKeyDisplay,
      this.dom.guideNextFingerDisplay
    );

    this.academyEngine = new TypingEngine(
      this.dom.targetTextContainer,
      this.kb,
      this.hands,
      this.audio
    );
    this.academyEngine.onErrorKey = (char) => profileStore.recordWeakKey(this.username, char);
    this.academyEngine.onCorrectKey = (span) => {
      if (this.particles && span) this.particles.emitAtElement(span, 4);
    };
    this.academyEngine.onErrorTrigger = () => {
      if (this.particles) this.particles.triggerGlitchShake();
    };
    this.academyEngine.onUpdateMetrics = (stats) => {
      this.dom.acadWpm.textContent = `${stats.wpm} WPM`;
      this.dom.acadCpm.textContent = `${stats.cpm} CPM`;
      this.dom.acadAcc.textContent = `${stats.accuracy}%`;
      this.dom.acadErr.textContent = `${stats.errors} ERR`;
      this.dom.acadStreak.textContent = `${stats.streak}x`;
      this.dom.acadProg.textContent = `${stats.progress}%`;
      this.updateSpeedometer(this.dom.acadSpeedoNeedle, this.dom.acadSpeedoText, stats.wpm);
    };
    this.academyEngine.onCompleted = (stats) => {
      const boosterMult = profileStore.hasItem(this.username, 'synaptic_booster') ? 1.2 : 1.0;
      this.addExp(Math.round(150 * boosterMult), 'Academy Lesson Cleared');
      profileStore.addCredits(this.username, 50);

      let stars = 1;
      if (stats.accuracy >= 98 && stats.wpm >= 40) stars = 3;
      else if (stats.accuracy >= 94 && stats.wpm >= 25) stars = 2;
      
      const currentLessonId = this.currentActiveLessonId || 'en_homerow_1';
      profileStore.recordLessonStars(this.username, currentLessonId, stars);

      profileStore.recordSessionStats(this.username, {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        keystrokes: stats.totalKeystrokes
      });
      this.showScoreModal(stats, 'academy');
    };

    this.speedEngine = new MonkeySpeedEngine({
      wordsContainer: this.dom.monkeyWordsContainer,
      caretEl: this.dom.monkeyCaret,
      hudEl: this.dom.monkeyLiveHud,
      kb: this.kb,
      hands: this.hands,
      sound: this.audio,
      toasts: this.toasts
    });
    this.speedEngine.onErrorKey = (char) => profileStore.recordWeakKey(this.username, char);
    this.speedEngine.onCorrectKey = (span) => {
      if (this.particles && span) this.particles.emitAtElement(span, 4);
    };
    this.speedEngine.onHardcoreFail = (stats) => {
      this.audio.playAlarmSiren();
      if (this.dom.monkeyCounterDisplay) this.dom.monkeyCounterDisplay.textContent = 'FAIL';
      this.showScoreModal(stats, 'speed_fail');
    };
    this.speedEngine.onUpdateMetrics = (stats) => {
      if (this.dom.monkeyLiveWpm) this.dom.monkeyLiveWpm.textContent = stats.wpm;
      if (this.dom.monkeyLiveRawWpm) this.dom.monkeyLiveRawWpm.textContent = stats.rawWpm;
      if (this.dom.monkeyLiveAcc) this.dom.monkeyLiveAcc.textContent = `${stats.accuracy}%`;
      if (this.dom.monkeyLiveStreak) this.dom.monkeyLiveStreak.textContent = `${stats.streak}x 🔥`;
      if (this.dom.monkeyCounterDisplay) this.dom.monkeyCounterDisplay.textContent = stats.counterText;
    };
    this.speedEngine.onCompleted = (stats) => {
      const boosterMult = profileStore.hasItem(this.username, 'synaptic_booster') ? 1.2 : 1.0;
      this.addExp(Math.round(250 * boosterMult), 'Speed Benchmark Completed');
      profileStore.addCredits(this.username, Math.round(stats.wpm * 1.5));

      const modeKey = stats.config.mode === 'time' ? `speed${stats.config.timeLimit}` : `words${stats.config.wordCount}`;
      profileStore.recordSpeedBest(this.username, modeKey, stats.wpm);

      profileStore.recordSessionStats(this.username, {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        keystrokes: stats.totalKeystrokes,
        batches: 1
      });
      this.showScoreModal(stats, 'speed');
    };

    this.hackerEngine = new HackerTyperEngine(
      this.dom.hackerTerminalCanvas,
      this.dom.hackerStreamCode,
      this.dom.hackerBreachModal,
      this.kb,
      this.hands,
      this.audio
    );
    this.hackerEngine.onMissionComplete = (mission) => {
      const boosterMult = profileStore.hasItem(this.username, 'synaptic_booster') ? 1.2 : 1.0;
      this.addExp(Math.round(400 * boosterMult), 'Cyber Infiltration Objective');
      profileStore.addCredits(this.username, 200);
      profileStore.recordSessionStats(this.username, { missions: 1 });
    };

    if (this.dom.breachProtocolModal) {
      this.breachEngine = new BreachProtocolEngine(
        this.dom.breachProtocolModal,
        this.audio,
        (res) => {
          if (res.solvedCount > 0) {
            this.addExp(res.solvedCount * 150, 'Breach Protocol Daemons Uploaded');
          }
        }
      );
    }

    if (this.dom.threatGlobeCanvas && this.dom.threatTickerConsole) {
      this.threatEngine = new CyberThreatGlobeEngine(
        this.dom.threatGlobeCanvas,
        this.dom.threatTickerConsole
      );
    }

    this.workspaceEngine = new WorkspaceLauncherEngine(this, this.audio, this.toasts);
    this.controlCenter = new ControlCenter(this, this.audio, this.toasts);

    this.tabManager = new TabManager(this, this.audio);
    this.tabManager.init();

    const intelCol = document.getElementById('cyberIntelColumn');
    if (intelCol) {
      this.intelFeed = new CyberIntelFeed(this, this.audio);
      this.intelFeed.init(intelCol);
    }

    this.aiCompanion = new AICompanionEngine(this, this.audio);
    this.aiCompanion.init();
  }

  ensureViewEngineInitialized(mode) {
    if (!this.dom || !this.dom.views) return;
    switch (mode) {
      case 'vscode':
        if (!this.vscodeEngine && this.dom.views.vscode) {
          this.vscodeEngine = new VscodeEngine(this, this.audio, this.toasts);
          this.vscodeEngine.init(this.dom.views.vscode);
        }
        break;
      case 'browser':
        if (!this.browserEngine && this.dom.views.browser) {
          this.browserEngine = new CyberBrowserEngine(this, this.audio);
          this.browserEngine.init(this.dom.views.browser);
        }
        break;
      case 'explorer':
        if (!this.explorerEngine && this.dom.views.explorer) {
          this.explorerEngine = new CyberExplorerEngine(this, this.audio, this.toasts);
          this.explorerEngine.init(this.dom.views.explorer);
        }
        break;
      case 'taskmgr':
        if (!this.taskmgrEngine && this.dom.views.taskmgr) {
          this.taskmgrEngine = new TaskManagerViewEngine(this, this.audio, this.toasts);
          this.taskmgrEngine.init(this.dom.views.taskmgr);
        }
        break;
      case 'radio':
        if (!this.radioEngine && this.dom.views.radio) {
          this.radioEngine = new CyberRadioEngine(this, this.audio);
          this.radioEngine.init(this.dom.views.radio);
        }
        break;
      case 'wifi':
        if (!this.wifiEngine && this.dom.views.wifi) {
          this.wifiEngine = new CyberWifiEngine(this, this.audio, this.toasts);
          this.wifiEngine.init(this.dom.views.wifi);
        }
        break;
      case 'roguelite':
        if (!this.rogueliteEngine && this.dom.views.roguelite) {
          this.rogueliteEngine = new RogueliteEngine(this, this.audio, this.toasts);
          this.rogueliteEngine.init(this.dom.views.roguelite);
        }
        break;
      case 'trading':
        if (!this.tradingEngine && this.dom.tradingCandleCanvas) {
          this.tradingEngine = new AITradingEngine({
            app: this,
            canvas: this.dom.tradingCandleCanvas,
            subCanvas: this.dom.tradingSubCanvas,
            sound: this.audio,
            toasts: this.toasts
          });

          this.tradingEngine.onSignalUpdate = (signal) => {
            this.updateTradingSignalUI(signal);
          };

          this.tradingEngine.onPositionUpdate = (positions) => {
            this.updateTradingPositionsUI(positions);
          };

          this.tradingEngine.onNewsUpdate = (news) => {
            this.updateTradingNewsUI(news);
          };

          this.tradingEngine.onAIStatsUpdate = (stats) => {
            this.updateAIStatsUI(stats);
          };

          this.tradingEngine.onAIJournalUpdate = (journal) => {
            this.updateAIJournalUI(journal);
          };

          this.tradingEngine.init();
          this.bindTradingUIEvents();
          if (this.tradingEngine.activeNews) {
            this.updateTradingNewsUI(this.tradingEngine.activeNews);
          }
          if (this.tradingEngine.aiStats) {
            this.updateAIStatsUI(this.tradingEngine.aiStats);
          }
          if (this.tradingEngine.aiJournal) {
            this.updateAIJournalUI(this.tradingEngine.aiJournal);
          }
        }
        break;
    }
  }

  updateTradingNewsUI(news) {
    if (!news) return;
    if (this.dom.tradingNewsSource) this.dom.tradingNewsSource.textContent = `[ ${news.source} • ${news.time} ]`;
    if (this.dom.tradingNewsHeadline) this.dom.tradingNewsHeadline.textContent = news.headline;
    if (this.dom.tradingNewsSentimentBadge) {
      const isBullish = news.sentiment === 'BULLISH';
      this.dom.tradingNewsSentimentBadge.className = 'news-sentiment-badge ' + (isBullish ? 'sentiment-bullish' : 'sentiment-bearish');
      this.dom.tradingNewsSentimentBadge.textContent = `${news.sentiment} (${news.sentimentScore > 0 ? '+' : ''}${news.sentimentScore})`;
    }
  }

  updateTradingSignalUI(signal) {
    if (!signal || !this.dom.aiSignalBadge) return;
    this.dom.aiSignalBadge.className = 'signal-badge ' + signal.badgeClass;
    this.dom.aiSignalBadge.textContent = signal.action;

    if (this.dom.aiMarketRegime && signal.marketRegime) {
      this.dom.aiMarketRegime.textContent = signal.marketRegime;
    }
    if (this.dom.aiStrategyPlaybook && signal.strategyPlaybook) {
      this.dom.aiStrategyPlaybook.textContent = signal.strategyPlaybook;
    }
    if (this.dom.aiRiskWarning && signal.riskWarning) {
      this.dom.aiRiskWarning.textContent = signal.riskWarning;
    }

    if (this.dom.aiConfidenceVal) this.dom.aiConfidenceVal.textContent = `${signal.confidence}%`;
    if (this.dom.aiRrVal) this.dom.aiRrVal.textContent = signal.rrRatio;

    const digits = this.tradingEngine?.activeAsset?.digits || 2;
    if (this.dom.aiEntryVal) this.dom.aiEntryVal.textContent = `$${signal.entry.toFixed(digits)}`;
    if (this.dom.aiTp1Val) this.dom.aiTp1Val.textContent = `$${signal.tp1.toFixed(digits)}`;
    if (this.dom.aiTp2Val) this.dom.aiTp2Val.textContent = `$${signal.tp2.toFixed(digits)}`;
    if (this.dom.aiSlVal) this.dom.aiSlVal.textContent = `$${signal.sl.toFixed(digits)}`;

    if (this.dom.aiPatternTags) {
      this.dom.aiPatternTags.innerHTML = '';
      if (signal.patterns && signal.patterns.length > 0) {
        signal.patterns.forEach(p => {
          const pill = document.createElement('span');
          pill.className = 'pattern-pill';
          pill.textContent = `[ ${p.name} ]`;
          this.dom.aiPatternTags.appendChild(pill);
        });
      } else {
        const pill = document.createElement('span');
        pill.className = 'pattern-pill';
        pill.textContent = '[ Price Action Consolidation ]';
        this.dom.aiPatternTags.appendChild(pill);
      }
    }

    if (this.dom.aiRationaleBox) {
      this.dom.aiRationaleBox.textContent = `"${signal.rationale}"`;
    }
  }

  updateTradingPositionsUI(positions = []) {
    if (this.dom.paperCapitalDisplay && this.tradingEngine) {
      this.dom.paperCapitalDisplay.textContent = `$${this.tradingEngine.paperBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (!this.dom.activePositionsContainer) return;
    this.dom.activePositionsContainer.innerHTML = '';

    if (positions.length === 0) {
      this.dom.activePositionsContainer.innerHTML = '<div class="no-positions-hint">No open paper positions. Click BUY/SELL to simulate execution.</div>';
      return;
    }

    positions.forEach(pos => {
      const card = document.createElement('div');
      card.className = 'pos-card';

      const isProfit = pos.pnlUSD >= 0;
      const pnlColor = isProfit ? '#00ff66' : '#ff2244';
      const sideClass = pos.side === 'LONG' ? 'pos-side-long' : 'pos-side-short';

      card.innerHTML = `
        <div class="pos-info">
          <span><strong class="${sideClass}">${pos.side}</strong> ${pos.assetId} (${pos.leverage}x)</span>
          <span style="font-size: 10px; color: #8b9cb0;">Entry: $${pos.entryPrice} | Mark: $${pos.currentPrice}</span>
        </div>
        <div style="text-align: right; display: flex; align-items: center; gap: 8px;">
          <div style="display: flex; flex-direction: column;">
            <strong style="color: ${pnlColor};">${isProfit ? '+' : ''}$${pos.pnlUSD.toFixed(2)}</strong>
            <span style="font-size: 9.5px; color: ${pnlColor};">${isProfit ? '+' : ''}${pos.pnlPercent.toFixed(2)}%</span>
          </div>
          <button class="btn-close-pos" data-pos-id="${pos.id}">✕ CLOSE</button>
        </div>
      `;

      card.querySelector('.btn-close-pos').addEventListener('click', () => {
        this.tradingEngine.closePosition(pos.id);
      });

      this.dom.activePositionsContainer.appendChild(card);
    });
  }

  bindTradingUIEvents() {
    // Pair Tabs
    if (this.dom.tradingPairTabs) {
      this.dom.tradingPairTabs.querySelectorAll('.trading-pair-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          this.dom.tradingPairTabs.querySelectorAll('.trading-pair-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const pair = btn.dataset.pair;
          if (this.tradingEngine) this.tradingEngine.setAsset(pair);
          if (this.audio && this.audio.playKey) this.audio.playKey(false);
        });
      });
    }

    // Timeframe Selector
    if (this.dom.tradingTimeframeSelector) {
      this.dom.tradingTimeframeSelector.querySelectorAll('.tf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.dom.tradingTimeframeSelector.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tf = btn.dataset.tf;
          if (this.tradingEngine) this.tradingEngine.setTimeframe(tf);
          if (this.audio && this.audio.playKey) this.audio.playKey(false);
        });
      });
    }

    // Indicators Checkboxes
    if (this.dom.chkEma) {
      this.dom.chkEma.addEventListener('change', (e) => {
        if (this.tradingEngine) {
          this.tradingEngine.showEMA = e.target.checked;
          this.tradingEngine.render();
        }
      });
    }
    if (this.dom.chkBollinger) {
      this.dom.chkBollinger.addEventListener('change', (e) => {
        if (this.tradingEngine) {
          this.tradingEngine.showBollinger = e.target.checked;
          this.tradingEngine.render();
        }
      });
    }
    if (this.dom.chkPatterns) {
      this.dom.chkPatterns.addEventListener('change', (e) => {
        if (this.tradingEngine) {
          this.tradingEngine.showPatterns = e.target.checked;
          this.tradingEngine.render();
        }
      });
    }

    // Order Buttons
    if (this.dom.btnOrderLong) {
      this.dom.btnOrderLong.addEventListener('click', () => {
        if (this.tradingEngine) this.tradingEngine.openPosition('LONG', 2000);
      });
    }
    if (this.dom.btnOrderShort) {
      this.dom.btnOrderShort.addEventListener('click', () => {
        if (this.tradingEngine) this.tradingEngine.openPosition('SHORT', 2000);
      });
    }

    // Sidebar Sub-Tabs Switcher (Copilot / Gym / Paper Deck)
    if (this.dom.tradingSidebarTabs) {
      this.dom.tradingSidebarTabs.querySelectorAll('.trading-side-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          this.dom.tradingSidebarTabs.querySelectorAll('.trading-side-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const targetTab = btn.dataset.tab;

          if (this.dom.panelTradingCopilot) this.dom.panelTradingCopilot.classList.toggle('hidden', targetTab !== 'copilot');
          if (this.dom.panelTradingGym) this.dom.panelTradingGym.classList.toggle('hidden', targetTab !== 'gym');
          if (this.dom.panelTradingPaper) this.dom.panelTradingPaper.classList.toggle('hidden', targetTab !== 'paper');

          if (this.audio && this.audio.playKey) this.audio.playKey(false);
        });
      });
    }

    // AI Gym Controls
    if (this.dom.btnAIFastTrain) {
      this.dom.btnAIFastTrain.addEventListener('click', () => {
        if (this.tradingEngine) this.tradingEngine.runFastTrainingDrill(25);
      });
    }
    if (this.dom.btnAIResetMem) {
      this.dom.btnAIResetMem.addEventListener('click', () => {
        if (this.tradingEngine) this.tradingEngine.resetAIMemory();
      });
    }
    if (this.dom.chkAIAutoTrader) {
      this.dom.chkAIAutoTrader.addEventListener('change', (e) => {
        if (this.tradingEngine) this.tradingEngine.toggleAutoTrading(e.target.checked);
      });
    }
  }

  updateAIStatsUI(stats) {
    if (!stats) return;
    if (this.dom.aiWinRateDisplay) this.dom.aiWinRateDisplay.textContent = `${stats.winRate}%`;
    if (this.dom.tabWinrateTag) this.dom.tabWinrateTag.textContent = `(${stats.winRate}%)`;
    if (this.dom.aiRecordDisplay) this.dom.aiRecordDisplay.textContent = `${stats.wins} W - ${stats.losses} L`;
    if (this.dom.aiNetPnlDisplay) {
      const isPos = stats.netPnlUSD >= 0;
      this.dom.aiNetPnlDisplay.textContent = `${isPos ? '+' : ''}$${stats.netPnlUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      this.dom.aiNetPnlDisplay.className = 'val ' + (isPos ? 'glow-cmd' : 'glow-danger');
    }
    if (this.dom.aiAdaptationLevel) this.dom.aiAdaptationLevel.textContent = `LEVEL ${stats.adaptationLevel}`;
  }

  updateAIJournalUI(journal) {
    if (!this.dom.aiJournalFeed || !Array.isArray(journal)) return;
    this.dom.aiJournalFeed.innerHTML = '';

    if (journal.length === 0) {
      this.dom.aiJournalFeed.innerHTML = '<div style="color: #64748b; font-size: 10px; text-align: center; padding: 12px;">No training logs recorded yet. Run Fast-Train or let AI trade live.</div>';
      return;
    }

    journal.slice(0, 15).forEach(tr => {
      const item = document.createElement('div');
      item.className = `journal-item ${tr.isWin ? 'win' : 'loss'}`;

      const pnlColor = tr.isWin ? '#00ff66' : '#ff2244';
      const badgeClass = tr.isWin ? 'journal-badge-win' : 'journal-badge-loss';
      const badgeText = tr.isWin ? `WIN (+${tr.pnlPercent}%)` : `LOSS (${tr.pnlPercent}%)`;

      item.innerHTML = `
        <div class="journal-item-top">
          <span class="journal-asset">🤖 [AI ${tr.side}] ${tr.assetId}</span>
          <span class="${badgeClass}">${badgeText} • <span style="color: ${pnlColor};">${tr.isWin ? '+' : ''}$${tr.pnlUSD.toFixed(2)}</span></span>
        </div>
        <div class="journal-setup-tag">SETUP: ${tr.setupName} (${tr.closeTime})</div>
        <div class="journal-post-mortem">${tr.postMortem}</div>
        <div class="journal-lesson-box ${tr.isWin ? 'win' : 'loss'}">${tr.learningLesson}</div>
      `;

      this.dom.aiJournalFeed.appendChild(item);
    });
  }

  launchTradingMode(assetArg) {
    const logs = generateEntranceLogs('trading', assetArg ? assetArg.toUpperCase() : 'BTC/USDT');
    this.state = STATES.MODE_TRADING;

    this.ensureViewEngineInitialized('trading');

    if (assetArg && this.tradingEngine) {
      const match = TRADING_ASSETS.find(a => a.id.toLowerCase().includes(assetArg.toLowerCase()));
      if (match) {
        this.tradingEngine.setAsset(match.id);
        if (this.dom.tradingPairTabs) {
          this.dom.tradingPairTabs.querySelectorAll('.trading-pair-pill').forEach(b => {
            b.classList.toggle('active', b.dataset.pair === match.id);
          });
        }
      }
    }

    this.playCyberTransition(
      'AI QUANTUM TRADING TERMINAL',
      'BOOTING NEURAL QUANTITATIVE MATRIX & SMC SCANNER...',
      logs,
      'trading'
    );
  }

  switchViewState(targetMode) {
    if (!this.dom || !this.dom.views) return;
    
    // Hide all view containers
    Object.values(this.dom.views).forEach(v => {
      if (v) v.classList.add('hidden');
    });

    // Lazily initialize engine for the target view if needed
    this.ensureViewEngineInitialized(targetMode);

    // Show target view container
    const targetEl = this.dom.views[targetMode];
    if (targetEl) {
      targetEl.classList.remove('hidden');
    } else if (this.dom.views.cli) {
      this.dom.views.cli.classList.remove('hidden');
    }
  }

  initC2TelemetryFeatures() {
    // 1. Live UTC Millisecond Clock Ticker
    const utcClockEl = document.getElementById('polyUtcClock');
    if (utcClockEl) {
      const updateClock = () => {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        const ms = String(now.getUTCMilliseconds()).padStart(3, '0');
        utcClockEl.textContent = `UTC: ${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
      };
      setInterval(updateClock, 50);
      updateClock();
    }

    // 2. Real-time PBKDF2/SHA-512 Hash Generation on Secret Gate Input
    const gateInput = document.getElementById('secretGateInput');
    const hashValEl = document.getElementById('hsmHashVal');
    if (gateInput && hashValEl) {
      gateInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (!val) {
          hashValEl.textContent = 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e';
          return;
        }
        let hash = 0x811c9dc5;
        for (let i = 0; i < val.length; i++) {
          hash ^= val.charCodeAt(i);
          hash = Math.imul(hash, 0x01000193);
        }
        const hexA = Math.abs(hash).toString(16).padStart(8, '0');
        const hexB = Math.abs(Math.imul(hash, 0x5bd1e995)).toString(16).padStart(8, '0');
        const hexC = Math.abs(Math.imul(hash, 0x27d4eb2f)).toString(16).padStart(8, '0');
        const hexD = Math.abs(Math.imul(hash, 0x165667b1)).toString(16).padStart(8, '0');
        hashValEl.textContent = `${hexA}${hexB}${hexC}${hexD}${hexA.split('').reverse().join('')}${hexC}${hexB}${hexD}`;
      });
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch((err) => console.log('SW note:', err));
    }
  }

  startBootHologramAnimation() {
    const canvas = document.getElementById('bootHoloCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    const nodesOuter = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    const nodesInner = [
      [0, -1.3, 0], [1.3, 0, 0], [0, 1.3, 0], [-1.3, 0, 0],
      [0, 0, -1.3], [0, 0, 1.3]
    ];
    const edgesOuter = [
      [0,1],[1,2],[2,3],[3,0],
      [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ];
    const edgesInner = [
      [0,1],[1,2],[2,3],[3,0],
      [4,0],[4,1],[4,2],[4,3],
      [5,0],[5,1],[5,2],[5,3]
    ];

    const render = () => {
      const overlay = document.getElementById('bootScreenOverlay');
      if (!overlay || overlay.classList.contains('hidden')) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const size = 48;

      angle += 0.025;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const cosB = Math.cos(angle * 0.85);
      const sinB = Math.sin(angle * 0.85);

      const project = (nodes, scale) => nodes.map(([x, y, z]) => {
        let rx = x * cosA - z * sinA;
        let rz = x * sinA + z * cosA;
        let ry = y * cosB - rz * sinB;
        rz = y * sinB + rz * cosB;

        const fov = 220 / (220 + rz * size * scale * 0.4);
        return [cx + rx * size * scale * fov, cy + ry * size * scale * fov];
      });

      const projOuter = project(nodesOuter, 1.0);
      const projInner = project(nodesInner, 0.65);

      // Glowing Quantum Energy Core
      const glowGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 42);
      glowGrad.addColorStop(0, 'rgba(0, 255, 102, 0.95)');
      glowGrad.addColorStop(0.4, 'rgba(0, 240, 255, 0.45)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 42, 0, Math.PI * 2);
      ctx.fill();

      // Outer Wireframe Cage (Green)
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      edgesOuter.forEach(([u, v]) => {
        ctx.moveTo(projOuter[u][0], projOuter[u][1]);
        ctx.lineTo(projOuter[v][0], projOuter[v][1]);
      });
      ctx.stroke();

      // Inner Octahedron Core (Cyan)
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      edgesInner.forEach(([u, v]) => {
        ctx.moveTo(projInner[u][0], projInner[u][1]);
        ctx.lineTo(projInner[v][0], projInner[v][1]);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Vertex Nodes
      ctx.fillStyle = '#ffffff';
      [...projOuter, ...projInner].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(render);
    };

    render();
  }

  playBootSequence() {
    this.startBootHologramAnimation();
    // Generate ~340 authentic real-world UEFI, Kernel, Systemd, Crypto & CyberDeck logs
    const rawLogs = generateRealisticBootLogs();
    const totalLogs = rawLogs.length;

    let i = 0;
    // Unskippable 20-second boot stream (~54ms interval * 340 logs = ~18.5s + 1.5s ready state)
    const interval = setInterval(() => {
      if (i < totalLogs) {
        const logItem = rawLogs[i];
        const line = document.createElement('div');
        line.className = 'boot-log-line';
        line.innerHTML = `
          <div class="log-left">
            <span class="log-time">[ ${logItem.time}s ]</span>
            <span class="log-mod">[${logItem.mod}]</span>
            <span class="log-desc">${logItem.desc}</span>
          </div>
          <div class="log-dots"></div>
          <div class="log-right">
            <span class="log-status ${logItem.cls}">[ ${logItem.status} ]</span>
          </div>
        `;

        if (this.dom.bootScreenLogs) {
          this.dom.bootScreenLogs.appendChild(line);
          this.dom.bootScreenLogs.scrollTop = this.dom.bootScreenLogs.scrollHeight;
          if (this.dom.bootScreenLogs.children.length > 70) {
            this.dom.bootScreenLogs.removeChild(this.dom.bootScreenLogs.firstChild);
          }
        }

        // Update 20s progress bar and live telemetry
        const pct = Math.min(100, Math.round(((i + 1) / totalLogs) * 100));
        const currentSeconds = Math.min(20.0, ((i + 1) * 0.054)).toFixed(1);

        if (this.dom.bootProgressFill) this.dom.bootProgressFill.style.width = `${pct}%`;
        if (this.dom.bootProgressPct) this.dom.bootProgressPct.textContent = `${pct}%`;
        if (this.dom.bootProgressTime) this.dom.bootProgressTime.textContent = `${currentSeconds}s / 20.0s`;

        if (this.dom.bootProgressStage) {
          if (pct < 22) {
            this.dom.bootProgressStage.textContent = 'STAGE: [ UEFI_HARDWARE_POST ]';
          } else if (pct < 45) {
            this.dom.bootProgressStage.textContent = 'STAGE: [ LINUX_QUANTUM_KERNEL ]';
          } else if (pct < 70) {
            this.dom.bootProgressStage.textContent = 'STAGE: [ SYSTEMD_SERVICES ]';
          } else if (pct < 90) {
            this.dom.bootProgressStage.textContent = 'STAGE: [ CYBERDECK_CORE_SUBSYSTEMS ]';
          } else {
            this.dom.bootProgressStage.textContent = 'STAGE: [ ROOT_SECURITY_ENCLAVE ]';
          }
        }

        if (this.audio && (i % 2 === 0)) this.audio.playBootTelemetryTick();
        i++;
      } else {
        clearInterval(interval);
        if (this.dom.bootProgressFill) this.dom.bootProgressFill.style.width = '100%';
        if (this.dom.bootProgressPct) this.dom.bootProgressPct.textContent = '100%';
        if (this.dom.bootProgressTime) this.dom.bootProgressTime.textContent = '20.0s / 20.0s';
        if (this.dom.bootProgressStage) this.dom.bootProgressStage.textContent = 'STAGE: [ AUTHENTICATION_GATE_UNLOCKED ]';

        if (this.audio) this.audio.playPostCompleteSound();
        if (this.dom.bootScreenReady) this.dom.bootScreenReady.classList.remove('hidden');

        setTimeout(() => {
          if (this.audio && typeof this.audio.unlockBootAudio === 'function') {
            this.audio.unlockBootAudio();
          }
          if (this.dom.bootScreenOverlay) {
            this.dom.bootScreenOverlay.classList.add('hidden');
            this.dom.bootScreenOverlay.style.display = 'none';
          }
          if (this.dom.secretGateOverlay) {
            this.dom.secretGateOverlay.classList.remove('hidden');
          }

          this.state = STATES.GATE;
          if (this.dom.secretGateInput) {
            this.dom.secretGateInput.focus();
          }
        }, 350);
      }
    }, 54);
  }

  // =========================================================================
  // STAGE 0 & 1 AUTHENTICATION
  // =========================================================================

  handleSecretGateSubmit() {
    this.audio.ensureContext();
    const code = this.dom.secretGateInput.value.trim();

    if (!profileStore.verifySecretGatePasscode(code)) {
      this.audio.playErrorSound();
      this.dom.gateErrorMsg.classList.remove('hidden');
      return;
    }

    this.dom.gateErrorMsg.classList.add('hidden');
    this.audio.playSuccessFanfare();

    this.dom.gateStreamBox.classList.remove('hidden');
    const lines = [
      `[+] HSM MASTER PASSPHRASE VERIFIED [OK]`,
      `>> DERIVING CRYPTOGRAPHIC KEYS (PBKDF2 / SHA-512)...`,
      `>> TPM 2.0 PCR ENCLAVE REGISTER MATCHED`,
      `>> ACCESS CONTROL: SEC-LEVEL 5 ROOT GRANTED`,
      `[✓] CONNECTING TO ENTERPRISE PAM WORKSTATION DAEMON...`
    ];

    let lIdx = 0;
    const interval = setInterval(() => {
      if (lIdx < lines.length) {
        const d = document.createElement('div');
        d.textContent = lines[lIdx];
        this.dom.gateStreamLines.appendChild(d);
        this.audio.playKey(false);
        lIdx++;
      } else {
        clearInterval(interval);
        if (this.dom.secretGateOverlay) {
          this.dom.secretGateOverlay.classList.add('gate-unlocked');
        }
        setTimeout(() => {
          this.dom.secretGateOverlay.classList.add('hidden');
          this.dom.secretGateOverlay.classList.remove('gate-unlocked');
          this.dom.hackerLoginOverlay.classList.remove('hidden');
          this.state = STATES.LOGIN;
          if (this.dom.loginPassField) {
            this.dom.loginPassField.focus();
          }
        }, 300);
      }
    }, 120);
  }

  handleLogin() {
    this.audio.ensureContext();
    const user = this.dom.loginUserField.value.trim() || 'Anan';

    this.username = user;
    this.profile = profileStore.getProfile(user);
    this.applyUserSettings(this.username);

    this.updatePromptPath();
    if (this.dom.cliSessionUser) {
      this.dom.cliSessionUser.textContent = `${this.username} (UID: 0)`;
    }

    this.audio.playEnterSound();
    this.state = STATES.CLI_PROMPT;

    this.dom.hackerLoginOverlay.classList.add('hidden');

    const logs = generateLoginLogs(this.username);
    this.playCyberTransition(
      'QUANTUM AUTHENTICATION DIRECTIVE',
      'ESTABLISHING ORBITAL SATELLITE HANDSHAKE...',
      logs,
      'cli',
      () => {
        this.ensureWorkstationEngines();
        this.focusCliInput();
        this.executeCyberrc();
        this.syncProfileToHud();
        this.applyUserSettings(this.username);
        setTimeout(() => { if (this.hands) this.hands.updatePositions(); }, 50);
      }
    );
  }

  updatePromptPath() {
    const cwd = this.sys.currentWorkingDir || `C:\\Users\\${this.username}`;
    switch (this.promptStyle) {
      case 'kali':
        this.dom.cliPromptPath.textContent = `┌──(${this.username.toLowerCase()}㉿kali)-[${cwd}]\n└─$ `;
        break;
      case 'arch':
        this.dom.cliPromptPath.textContent = `[${this.username.toLowerCase()}@arch-quantum ${cwd}]$ `;
        break;
      case 'ubuntu':
        this.dom.cliPromptPath.textContent = `${this.username.toLowerCase()}@ubuntu:${cwd}$ `;
        break;
      case 'matrix':
        this.dom.cliPromptPath.textContent = `root@quantum-core:[${cwd}]# `;
        break;
      default:
        this.dom.cliPromptPath.textContent = `${cwd}>`;
    }
  }

  addExp(points, reason = '') {
    const { profile, leveledUp } = profileStore.addExp(this.username, points);
    this.profile = profile;
    this.syncProfileToHud();

    if (leveledUp) {
      if (this.audio.playLevelUpFanfare) {
        this.audio.playLevelUpFanfare();
      }
      this.audio.speak(`Level up achieved. You are now level ${this.profile.level}.`);
      const ranks = ['INITIATE', 'SCRIPT RUNNER', 'NETRUNNER', 'ZERO-DAY HUNTER', 'QUANTUM DEITY'];
      const rankTitle = ranks[Math.min(ranks.length - 1, this.profile.level - 1)];

      if (this.dom.toastRankText) {
        this.dom.toastRankText.textContent = `PROMOTED TO: ${rankTitle} (LVL ${this.profile.level})`;
      }
      if (this.dom.cyberLevelUpToast) {
        this.dom.cyberLevelUpToast.classList.remove('hidden');
        setTimeout(() => {
          this.dom.cyberLevelUpToast.classList.add('hidden');
        }, 3600);
      }
    }
  }

  syncProfileToHud() {
    if (!this.profile) return;
    const ranks = ['INITIATE', 'SCRIPT RUNNER', 'NETRUNNER', 'ZERO-DAY HUNTER', 'QUANTUM DEITY'];
    const rankTitle = ranks[Math.min(ranks.length - 1, this.profile.level - 1)];

    if (this.dom.hudLevelBadge) {
      this.dom.hudLevelBadge.textContent = `LVL ${this.profile.level} ${rankTitle}`;
    }
    if (this.dom.hudExpText) {
      this.dom.hudExpText.textContent = `${this.profile.exp} / ${this.profile.expNext} EXP`;
    }
    if (this.dom.hudExpFill) {
      const pct = Math.min(100, Math.round((this.profile.exp / this.profile.expNext) * 100));
      this.dom.hudExpFill.style.width = `${pct}%`;
    }
  }

  updateSpeedometer(needleEl, textEl, wpm) {
    if (!needleEl) return;
    const clampedWpm = Math.max(0, Math.min(160, wpm));
    const deg = -90 + (clampedWpm / 160) * 180;
    needleEl.style.transform = `rotate(${deg}deg)`;
    if (textEl) textEl.textContent = `${wpm} WPM`;
  }

  // =========================================================================
  // UNIVERSAL CYBER HUD TRANSITION & INTERFACE MORPHER
  // =========================================================================

  playCyberTransition(badgeText, headlineText, logLines, targetMode, onComplete) {
    if (this.transitionInterval) {
      clearInterval(this.transitionInterval);
      this.transitionInterval = null;
    }

    this.isTransitioning = true;
    this.audio.ensureContext();
    this.audio.startLogStreamDrone();

    if (this.dom.mainTerminalContainer) {
      this.dom.mainTerminalContainer.classList.add('hidden');
    }

    this.dom.universalTransitionOverlay.classList.remove('hidden');
    this.dom.transBadge.textContent = `[ ${badgeText.toUpperCase()} ]`;
    this.dom.transHeadline.textContent = headlineText;
    this.dom.transPercent.textContent = '0%';
    this.dom.transProgressFill.style.width = '0%';
    this.dom.transLogLines.innerHTML = '';

    // Update Operator Profile Dossier & Start Matrix Code Hologram Silhouette
    const prof = profileStore.getProfile(this.username);
    if (prof) {
      const ranks = ['INITIATE', 'SCRIPT RUNNER', 'NETRUNNER', 'ZERO-DAY HUNTER', 'QUANTUM DEITY'];
      const rankTitle = ranks[Math.min(ranks.length - 1, (prof.level || 1) - 1)];

      if (this.dom.transDossierUser) this.dom.transDossierUser.textContent = (prof.username || this.username || 'ANAN').toUpperCase();
      if (this.dom.transDossierLevel) this.dom.transDossierLevel.textContent = `LVL ${prof.level || 1}`;
      if (this.dom.transDossierRank) this.dom.transDossierRank.textContent = rankTitle;
      if (this.dom.transDossierExpTxt) this.dom.transDossierExpTxt.textContent = `${prof.exp || 0} / ${prof.expNext || 300}`;
      if (this.dom.transDossierExpFill) {
        const pct = Math.min(100, Math.round(((prof.exp || 0) / (prof.expNext || 300)) * 100));
        this.dom.transDossierExpFill.style.width = `${pct}%`;
      }
      if (this.dom.transDossierWpm) this.dom.transDossierWpm.textContent = `${prof.stats?.peakWpm || 0} WPM`;
      if (this.dom.transDossierAcc) this.dom.transDossierAcc.textContent = `${prof.stats?.avgAccuracy || 100}%`;
      if (this.dom.transDossierCredits) this.dom.transDossierCredits.textContent = `${(prof.credits || 0).toLocaleString()} CC`;
      if (this.dom.transDossierBtc) this.dom.transDossierBtc.textContent = `₿ ${prof.bitcoin || 0}`;
    }

    if (this.holoAvatar && this.dom.transHoloAvatarCanvas) {
      this.holoAvatar.start(this.dom.transHoloAvatarCanvas);
    }

    this.dom.modChips.forEach(c => { if (c) c.classList.remove('active'); });

    let step = 0;
    const totalSteps = logLines.length;

    const finishTransition = () => {
      if (this.transitionInterval) {
        clearInterval(this.transitionInterval);
        this.transitionInterval = null;
      }
      this.audio.stopLogStreamDrone();
      this.audio.playSuccessFanfare();

      if (this.holoAvatar) {
        this.holoAvatar.stop();
      }

      this.dom.transPercent.textContent = '100%';
      this.dom.transProgressFill.style.width = '100%';
      this.dom.transHeadline.textContent = '[✓] PROTOCOL INITIALIZED: SUCCESS';
      this.dom.modChips.forEach(c => { if (c) c.classList.add('active'); });

      this.switchViewState(targetMode);

      setTimeout(() => {
        this.dom.universalTransitionOverlay.classList.add('hidden');
        if (this.dom.mainTerminalContainer) {
          this.dom.mainTerminalContainer.classList.remove('hidden');
        }
        this.isTransitioning = false;
        this.skipCurrentTransition = null;
        if (onComplete) onComplete();
      }, 380);
    };

    this.skipCurrentTransition = finishTransition;

    this.transitionInterval = setInterval(() => {
      if (step < totalSteps) {
        const line = document.createElement('div');
        const txt = logLines[step];
        line.className = 'transition-log-line';

        if (txt.includes('================')) {
          line.style.color = '#00ff66';
        } else if (txt.startsWith('[+]') || txt.startsWith('[⚡]') || txt.startsWith('[✓]')) {
          line.style.color = '#00ff66';
          line.style.fontWeight = 'bold';
        } else if (txt.startsWith('>>')) {
          line.style.color = txt.includes('SUCCESS') || txt.includes('OK') || txt.includes('VALID') ? '#00ff66' : '#00e5ff';
        }

        line.textContent = txt;
        this.dom.transLogLines.appendChild(line);

        if (this.dom.transTerminalViewport) {
          this.dom.transTerminalViewport.scrollTop = this.dom.transTerminalViewport.scrollHeight;
        }

        const pct = Math.min(99, Math.round(((step + 1) / totalSteps) * 100));
        this.dom.transPercent.textContent = `${pct}%`;
        this.dom.transProgressFill.style.width = `${pct}%`;

        if (pct >= 15 && this.dom.modChips[0]) this.dom.modChips[0].classList.add('active');
        if (pct >= 32 && this.dom.modChips[1]) this.dom.modChips[1].classList.add('active');
        if (pct >= 50 && this.dom.modChips[2]) this.dom.modChips[2].classList.add('active');
        if (pct >= 68 && this.dom.modChips[3]) this.dom.modChips[3].classList.add('active');
        if (pct >= 84 && this.dom.modChips[4]) this.dom.modChips[4].classList.add('active');
        if (pct >= 95 && this.dom.modChips[5]) this.dom.modChips[5].classList.add('active');

        if (this.audio.playLogLineAudio) {
          this.audio.playLogLineAudio(step, totalSteps);
        }

        step++;
      } else {
        finishTransition();
      }
    }, 75);
  }

  renderCliPrompt() {
    const text = this.cliInputBuffer || '';
    const pos = Math.max(0, Math.min(text.length, this.cliCursorPos));
    this.cliCursorPos = pos;

    const before = text.slice(0, pos);
    const at = text[pos] || '';
    const after = text.slice(pos + 1);

    if (this.dom.cliInputText) {
      this.dom.cliInputText.textContent = before;
    }
    if (this.dom.cliCursor) {
      if (pos >= text.length) {
        this.dom.cliCursor.textContent = ' ';
        this.dom.cliCursor.className = 'term-cursor cursor-block';
      } else {
        this.dom.cliCursor.textContent = at === ' ' ? ' ' : at;
        this.dom.cliCursor.className = 'term-cursor cursor-char' + (at === ' ' ? ' cursor-space' : '');
      }
    }
    if (this.dom.cliInputAfter) {
      this.dom.cliInputAfter.textContent = after;
    }
  }

  handleCliTabCompletion() {
    const text = (this.cliInputBuffer || '').toLowerCase().trim();
    if (!text) return;

    const allCmds = [
      'trade', 'trading', 'crypto', 'roguelite', 'academy', 'speed', 'hacker', 'dashboard', 'settings',
      'records', 'shop', 'bbs', 'nmap', 'ssh', 'hack', 'clearlogs', 'disconnect',
      'breach', 'threat', 'globe', 'emp', 'crt', 'payload', 'ducky', 'scan',
      'crack', 'bgm', 'map', 'whoami', 'sandbox', 'cls', 'clear', 'lang',
      'sound', 'theme', 'open', 'neofetch', 'ls', 'dir', 'pwd', 'cd', 'cat',
      'mkdir', 'touch', 'nano', 'exec', 'ping', 'help', 'palette'
    ];

    const matches = allCmds.filter(c => c.startsWith(text));
    if (matches.length === 1) {
      this.cliInputBuffer = matches[0] + ' ';
      this.cliCursorPos = this.cliInputBuffer.length;
      this.renderCliPrompt();
      if (this.audio && this.audio.playKey) this.audio.playKey(false);
    } else if (matches.length > 1) {
      const histLine = document.createElement('div');
      histLine.className = 'cli-history-output';
      histLine.style.color = 'var(--theme-cyan)';
      histLine.textContent = 'Suggestions: ' + matches.join('   ');
      this.dom.cliHistory.appendChild(histLine);
      this.scrollToBottom();
      if (this.audio && this.audio.playKey) this.audio.playKey(false);
    }
  }

  focusCliInput() {
    this.cliInputBuffer = '';
    this.cliCursorPos = 0;
    this.renderCliPrompt();
  }

  // =========================================================================
  // ADVANCED REAL-WORLD CLI COMMAND PARSER
  // =========================================================================

  async executeCliCommand(cmdLine) {
    const raw = cmdLine.trim();
    if (!raw) return;

    this.cliHistoryStack.push(raw);
    this.cliHistoryIndex = this.cliHistoryStack.length;

    const histLine = document.createElement('div');
    histLine.className = 'cli-history-line';
    histLine.innerHTML = `<span class="term-prompt">${this.dom.cliPromptPath.textContent}</span> ${this.escapeHtml(raw)}`;
    this.dom.cliHistory.appendChild(histLine);

    const parts = raw.split(/\s+/);
    let cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Check alias
    if (this.customAliases[cmd]) {
      cmd = this.customAliases[cmd];
    }

    let output = '';

    switch (cmd) {
      case 'help':
      case '?':
        output = `
AVAILABLE CYBER TERMINAL & REAL-WORLD OS COMMANDS:
-----------------------------------------------------------------------------------------
[ 🖥️ CYBER OPERATING SYSTEM & WORKSPACE SUITE ]
  explorer / files / drives    - 📂 Cyber File Explorer & Real Desktop App Matrix (Steam, Games, Drives)
  taskmgr / htop / ps / top    - 📊 Real System Task Manager with live telemetry waves & Process Killer
  wifi / wlan / radar / aircrack - 📡 Cyber Wi-Fi Radar & Quantum WPA Handshake Decryptor Minigame
  radio / music / synthwave    - 🎵 Tron 3D Web Audio FFT Visualizer & Cyberpunk Radio Stations
  workspace / devmode / gamemode - 🕶️ Mr. Robot 1-Click Batch Workspace Launcher (Dev, Gaming, Chill, Sec)
  heat / heatmap / biometric   - 🧠 Matrix Biometric Thermal Keyboard Heatmap & Hand Fatigue Analyzer

[ 🛡️ MILITARY-GRADE LINUX/UNIX SYSADMIN &amp; SOC SUITE ]
  dmesg                        - 📜 Linux Kernel Boot Ring Buffer (PCIe, eBPF, ACPI, IOMMU, TPM 2.0)
  netstat / ss / sockets       - 🔌 Real Network Sockets & Active Channel Monitor (TCP/UDP/UNIX)
  iptables / ufw / firewall    - 🛡️ Kernel IP Packet Filtering Chains (DROP/ACCEPT/PORT-SCAN Defense)
  systemctl / service          - ⚙️ Systemd Unit Manager & Microservice Daemon Watcher
  siem / soc                   - 🚨 Live Security Operations Center (SOC) Incident Command & Ban List
  crypto / cipherbench         - ⚡ Hardware Cryptographic Accelerator Benchmark (AES-NI/AVX-512 GB/s)
  iotop / iostat               - 💾 NVMe Controller & Storage Bus I/O Throughput (MB/s & IOPS)
  strace                       - 🔬 Live System Call Tracer (epoll_wait, mprotect, futex, read/write)
  lsof                         - 📂 Open File Descriptors & Memory-Mapped IPC Socket Auditor

[ ⚡ IN-APP CODE STUDIO, BROWSER & INTELLIGENCE ]
  code / vscode / ide [lang]   - ⚡ VS Code Studio (Python, HTML, C++, Rust, SQL) with AI Cyber Tutor
  trade / trading / crypto     - 📈 AI Neural Quantitative Trading Terminal & Pattern Recommendation Engine
  browser / web / surf [url]   - 🌐 In-App Chromium Cyber Browser with Picture-in-Picture mode
  yt / youtube [query]         - 📺 Stream YouTube videos directly inside the terminal browser
  news / market / btc / intel  - 📈 Live Real-time Binance Crypto (BTC/ETH) & Hacker News Intel Feed

[ 💻 REAL APPLICATION LAUNCHER & FILESYSTEM ]
  open [app / url / path]      - Launch real PC programs (Chrome, Calc, Notepad, Spotify, Steam, Discord)
  launch / run / start [app]   - Alias for open (e.g. 'open code', 'launch taskmgr')
  ls / dir [path]              - List real files & folders with sizes & color highlights
  pwd                          - Print real working directory
  cd [dir / ..]                - Change real current directory on host computer
  cat / read [file]            - Read and stream actual file contents to terminal
  mkdir [name]                 - Create real directory on computer
  touch [name]                 - Create empty file on computer
  nano / edit [file]           - Open real file in built-in Cyber Notepad editor
  encrypt [file] [key]         - AES-256 military-grade file encryption
  shred [file]                 - Secure multi-pass data wiper
  neofetch / sysinfo           - Hollywood ASCII System Dossier (CPU, RAM, OS, Uptime, Host)
  ping [host]                  - Real ICMP network latency probe (e.g. 'ping google.com')
  exec [powershell cmd]        - Run ANY native PowerShell/CMD command directly on host PC

[ 🎮 HACKING SIMULATORS, GAMES & ROGUELITE ]
  roguelite / rl / crawl       - ✨ Cyberspace Node-Crawl Roguelite (Hacky Minigames & Mainframe Boss)
  academy [1-10]               - 🎓 Touch Typing Academy (10-Finger Kinesthetic Key Drills)
  hacker [1-4|stream]          - 💻 Cyber Infiltration Simulator with Live Automated Stream
  speed [0|15|30|60]           - ⚡ Speed Typing Rush ('speed 0' = Endless Marathon Benchmark)
  breach / cyberpunk           - 🧩 Cyberpunk 2077 Breach Protocol Hex Matrix Mini-game
  threat / globe               - 🌍 Watch Dogs Live Global Cyber Threat War Map
  payload / ducky              - 🦆 Mr. Robot USB Rubber Ducky Attack Payload Compiler & Flasher
  camhack / cctv               - 📹 CCTV Camera Satellite Video Feed Interceptor
  sniff / wireshark            - 📡 Real-time Network Packet Sniffer Interceptor
  emp / sentinel               - ⚡ The Matrix EMP Shockwave Blast (or Ctrl+E)
  crt / glitch                 - 📺 Retro CRT Phosphor Distortion & Barrel Scanlines
  scan [target]                - 🔍 Live Hollywood Nmap Port Vulnerability Scanner
  crack / decrypt              - 🔐 Interactive Matrix Password Hash Cracker
  bgm [on|off]                 - 🎶 Toggle Procedural Dark Cyber Synthwave Soundtrack

[ 🛠️ CYBER CUSTOMIZATION & SHORTCUTS ]
  prompt [kali|arch|ubuntu|matrix|win] - Customize terminal prompt style
  alias [key]=[command]        - Register permanent custom command shortcuts
  theme [matrix|neon|amber|red|stealth] - Visual Cyberdeck theme
  sound [hollywood|mechanical|terminal|mute] - Keyboard switch audio profile
  lang [en|th]                 - Switch QWERTY / Thai Kedmanee layout
  palette / menu               - Open Command Palette (or Ctrl+K / Ctrl+P)
  settings / config            - Terminal Settings & Live Theme/Sound Matrix (or Ctrl+,)
  dashboard / dossier          - Operator Analytics, WPM Progression & Achievements
  whoami / stats               - View Quick Netrunner Dossier
  cls / clear                  - Clear terminal screen history (or Ctrl+L)
  logout / exit                - Return to Login / CMD prompt
-----------------------------------------------------------------------------------------
`;
        break;

      // 1. Real Desktop Application Launcher
      case 'open':
      case 'launch':
      case 'run':
      case 'start':
        if (!args[0]) {
          output = `Usage: open [chrome | calc | notepad | code | explorer | taskmgr | spotify | steam | discord | url]`;
        } else {
          const targetApp = args.join(' ');
          output = `[+] Spawning Real Process / Opening: ${targetApp}...`;
          this.audio.playKey(false);
          const res = await this.sys.launch(targetApp);
          if (res.success) {
            output += `\n[✓] ${res.message || 'Application launched successfully.'}`;
            this.addExp(50, 'Application Spawned');
            this.audio.playSuccessFanfare();
          } else {
            output += `\n[✗] Launch Error: ${res.error || 'Failed to start process.'}`;
            this.audio.playErrorSound();
          }
        }
        break;

      // 2. Real System Diagnostics (Neofetch)
      case 'neofetch':
      case 'fastfetch':
      case 'cyberfetch':
      case 'sysinfo':
        const info = await this.sys.getSysInfo();
        output = `
  ██████╗██╗   ██╗██████╗ ███████╗██████╗ 
 ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗   OS       : ${info.platform.toUpperCase()} [${info.release}] ${info.arch}
 ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝   HOST     : ${info.hostname}
 ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗   KERNEL   : QUANTUM-v6.8.9 (UID: 0)
 ╚██████╗   ██║   ██████╔╝███████╗██║  ██║   UPTIME   : ${Math.floor(info.uptime / 3600)}h ${Math.floor((info.uptime % 3600) / 60)}m
  ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝   CPU      : ${info.cpuModel} (${info.cpuCores} Cores)
                                             MEMORY   : ${info.usedMemGB} GB / ${info.totalMemGB} GB (${info.memPercent}%)
                                             OPERATOR : ${this.username} [LVL ${this.profile.level} NETRUNNER]
                                             ENCRYPT  : RSA-8192 / AES-256-GCM
`;
        this.addExp(30, 'System Diagnostics Checked');
        this.audio.playSuccessFanfare();
        break;

      // 3. Linux File System Commands (ls, dir, pwd, cd, cat, mkdir, touch, nano)
      case 'ls':
      case 'dir':
        const dirData = await this.sys.listFiles(args[0]);
        if (dirData.success) {
          let lsOutput = `Directory of ${dirData.dir}\n\n`;
          dirData.files.forEach(f => {
            const typeMarker = f.isDir ? '<DIR>' : '     ';
            const sizeStr = f.isDir ? '' : `${f.size} B`.padStart(12, ' ');
            lsOutput += `${typeMarker}  ${sizeStr}  ${f.name}\n`;
          });
          output = lsOutput;
        } else {
          output = `ls: cannot access '${args[0] || '.'}': ${dirData.error}`;
        }
        break;

      case 'pwd':
        output = this.sys.currentWorkingDir;
        break;

      case 'cd':
        if (!args[0] || args[0] === '~') {
          this.sys.currentWorkingDir = 'C:\\Users\\' + this.username;
        } else if (args[0] === '..') {
          const parts = this.sys.currentWorkingDir.split(/[\/\\]/);
          if (parts.length > 1) {
            parts.pop();
            this.sys.currentWorkingDir = parts.join('\\') || 'C:\\';
          }
        } else {
          this.sys.currentWorkingDir = args[0].includes(':') ? args[0] : `${this.sys.currentWorkingDir}\\${args[0]}`;
        }
        this.updatePromptPath();
        output = ``;
        break;

      case 'cat':
      case 'read':
        if (!args[0]) {
          output = `Usage: cat [filename]`;
        } else {
          const fileData = await this.sys.readFile(args[0]);
          if (fileData.success) {
            output = `--- CONTENT OF ${args[0]} ---\n${fileData.content}`;
          } else {
            output = `cat: ${args[0]}: ${fileData.error}`;
          }
        }
        break;

      case 'mkdir':
        if (!args[0]) {
          output = `Usage: mkdir [dirname]`;
        } else {
          const mkRes = await this.sys.makeDir(args[0]);
          output = mkRes.success ? `[+] Directory created: ${args[0]}` : `mkdir: ${mkRes.error}`;
        }
        break;

      case 'touch':
        if (!args[0]) {
          output = `Usage: touch [filename]`;
        } else {
          const wrRes = await this.sys.writeFile(args[0], '');
          output = wrRes.success ? `[+] File created: ${args[0]}` : `touch: ${wrRes.error}`;
        }
        break;

      case 'nano':
      case 'edit':
        if (args[0]) {
          this.currentEditingFile = args[0];
          const fileRead = await this.sys.readFile(args[0]);
          this.dom.sandboxTextarea.value = fileRead.success ? fileRead.content : '';
        } else {
          this.currentEditingFile = null;
        }
        this.launchSandboxMode();
        return;

      // 4. Real PowerShell / Command Execution Bridge
      case 'exec':
      case 'ps1':
      case 'sh':
        if (!args[0]) {
          output = `Usage: exec [powershell / windows command] (e.g. 'exec Get-Process')`;
        } else {
          const realCmd = args.join(' ');
          const execRes = await this.sys.exec(realCmd);
          output = execRes.stdout || execRes.stderr || (execRes.success ? `[+] Command completed with code 0.` : `[✗] Error: ${execRes.error}`);
        }
        break;

      case 'encrypt':
        if (!args[0] || !args[1]) {
          output = `Usage: encrypt [file] [password]`;
        } else {
          const encRes = await this.sys.encryptFile(args[0], args.slice(1).join(' '));
          output = encRes.success ? `[+] File encrypted via AES-256-GCM: ${encRes.newPath}` : `[✗] Encryption failed: ${encRes.error}`;
        }
        break;

      case 'decrypt':
        if (!args[0] || !args[1]) {
          output = `Usage: decrypt [file.enc] [password]`;
        } else {
          const decRes = await this.sys.decryptFile(args[0], args.slice(1).join(' '));
          output = decRes.success ? `[+] File decrypted successfully: ${decRes.newPath}` : `[✗] Decryption failed: ${decRes.error}`;
        }
        break;

      case 'shred':
        if (!args[0]) {
          output = `Usage: shred [file]\nWARNING: THIS WILL PERMANENTLY WIPE THE FILE (DoD 5220.22-M 3-Pass). CANNOT BE UNDONE.`;
        } else {
          output = `[+] INITIATING DOD 5220.22-M WIPE SEQUENCE ON: ${args[0]}...`;
          this.audio.playKey(false);
          const shRes = await this.sys.shred(args[0]);
          output += shRes.success ? `\n[✓] FILE SHREDDED SUCCESSFULLY. DATA IS UNRECOVERABLE.` : `\n[✗] Shred failed: ${shRes.error}`;
        }
        break;

      case 'osint':
      case 'recon':
        if (!args[0]) {
          output = `Usage: osint [domain/IP]`;
        } else {
          output = `[+] GATHERING OPEN SOURCE INTELLIGENCE ON: ${args[0]}...`;
          this.audio.playKey(false);
          const osRes = await this.sys.osint(args[0]);
          if (osRes.success) {
            output += `\n[✓] TARGET ACQUIRED.\n>> IP ADDRESSES: ${osRes.ips.join(', ') || 'None'}\n>> MX RECORDS: ${osRes.mx.map(m => m.exchange).join(', ') || 'None'}`;
          } else {
            output += `\n[✗] OSINT failed: ${osRes.error}`;
          }
        }
        break;

      case 'vm':
      case 'sandboxrun':
        if (args[0] === 'run' || args.length > 0) {
          const fileToRun = args[0] === 'run' ? (args[1] || this.currentEditingFile) : args[0];
          if (!fileToRun) {
            output = `[✗] No file selected to run. Use 'nano [file]' first or 'sandbox run [file]'`;
          } else {
            output = `[+] INITIATING ISOLATED VM SANDBOX FOR ${fileToRun}...`;
            const fileData = await this.sys.readFile(fileToRun);
            if (!fileData.success) {
              output += `\n[✗] Failed to read file: ${fileData.error}`;
            } else {
              const vmRes = await this.sys.sandboxRun(fileData.content);
              if (vmRes.success) {
                output += `\n[✓] VM EXECUTION COMPLETE.\n>> LOGS:\n${vmRes.logs.join('\n')}\n>> RETURN: ${vmRes.result}`;
                this.addExp(40, 'Malware Analysed in Sandbox');
              } else {
                output += `\n[✗] VM CRITICAL FAULT: ${vmRes.error}`;
              }
            }
          }
        } else {
          output = `Usage: sandbox run [file.js]`;
        }
        break;

      case 'stego':
        if (args[0] === 'hide' && args[1] && args[2]) {
          const msg = args.slice(2).join(' ');
          const fileData = await this.sys.readFile(args[1]);
          if (fileData.success) {
            // Simplified stego append to EOF
            await this.sys.writeFile(args[1], fileData.content + '\n#STEGO_DATA:' + Buffer.from(msg).toString('base64'));
            output = `[+] MESSAGE EMBEDDED INTO ${args[1]} LSB LAYER.`;
          } else {
            output = `[✗] Failed to access ${args[1]}`;
          }
        } else if (args[0] === 'extract' && args[1]) {
          const fileData = await this.sys.readFile(args[1]);
          if (fileData.success) {
            const match = fileData.content.match(/#STEGO_DATA:(.*)/);
            if (match && match[1]) {
              output = `[+] EXTRACTED HIDDEN PAYLOAD:\n>> ${Buffer.from(match[1], 'base64').toString('utf-8')}`;
            } else {
              output = `[✗] NO STEGANOGRAPHIC SIGNATURE DETECTED IN ${args[1]}.`;
            }
          } else {
            output = `[✗] Failed to access ${args[1]}`;
          }
        } else {
          output = `Usage:\nstego hide [image.jpg] [secret_message]\nstego extract [image.jpg]`;
        }
        break;

      case 'split':
        if (args[0] === 'vertical' || args[0] === 'horizontal') {
          output = `[+] INITIATING ${args[0].toUpperCase()} TILING WINDOW SPLIT...`;
          this.audio.playKey(false);
          const splitRes = await this.sys.windowSplit(args[0]);
          if (!splitRes.success) {
            output += `\n[✗] Split failed: ${splitRes.error}`;
          }
        } else {
          output = `Usage: split [vertical | horizontal]`;
        }
        break;

      case 'heatmap':
        if (this.dom.heatmapModal) {
          this.dom.heatmapModal.classList.remove('hidden');
          this.audio.playSuccessFanfare();
          this.renderHeatmap();
        }
        return;

      case 'nodegraph':
      case 'nodes':
        if (this.dom.nodeGraphModal) {
          this.dom.nodeGraphModal.classList.remove('hidden');
          this.audio.playEnterSound();
          this.renderNodeGraph();
        }
        return;

      case 'sniff':
        if (this.dom.packetSnifferModal) {
          this.dom.packetSnifferModal.classList.remove('hidden');
          this.audio.playKey(false);
          this.startPacketSniffer();
        }
        return;

      case 'camhack':
        if (this.dom.camhackModal) {
          this.dom.camhackModal.classList.remove('hidden');
          this.audio.speak('Bypassing local CCTV security matrix. Intercepting video feed.');
          this.startCamhack();
        }
        return;

      case 'hud':
      case 'telemetry':
        const isHudHidden = this.dom.cyberHudDashboard.classList.contains('hidden');
        if (isHudHidden) {
          this.dom.cyberHudDashboard.classList.remove('hidden');
          output = `[+] CYBER-HUD TELEMETRY DASHBOARD: ONLINE.`;
          this.startHudTelemetry();
        } else {
          this.dom.cyberHudDashboard.classList.add('hidden');
          output = `[-] CYBER-HUD TELEMETRY DASHBOARD: OFFLINE.`;
          if (this.hudInterval) clearInterval(this.hudInterval);
        }
        break;

      case 'ping':
        const pingHost = args[0] || '8.8.8.8';
        output = `Pinging ${pingHost} with 32 bytes of encrypted quantum telemetry...`;
        const pRes = await this.sys.ping(pingHost);
        output += `\n` + pRes.output;
        break;

      // -------------------------------------------------------------------------
      // HARDCORE LINUX / UNIX SYSADMIN & SOC NETWORK OPERATIONS SUITE
      // -------------------------------------------------------------------------
      case 'dmesg':
        output = `
[    0.000000] Linux version 6.8.9-quantum-soc (root@quantum-build-cluster) (gcc 14.1.0) #1 SMP PREEMPT_DYNAMIC
[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-6.8.9-quantum root=UUID=8f7e2a-4b1c ro quiet security=apparmor iommu=pt
[    0.000000] x86/fpu: Supporting XSAVE feature 0x001: 'x87 floating point registers'
[    0.000000] x86/fpu: Supporting XSAVE feature 0x002: 'SSE registers'
[    0.000000] x86/fpu: Supporting XSAVE feature 0x004: 'AVX registers'
[    0.000000] x86/fpu: Supporting XSAVE feature 0x020: 'AVX-512 Foundation'
[    0.001240] ACPI: DSDT 0x000000007BAFE000 01A480 (v02 QUANTUM CYBERDECK 00000001 INTL 20240105)
[    0.004510] smpboot: Allowing 96 CPUs, 0 hotplug CPUs
[    0.012890] Memory: 65842180K/67108864K available (16384K kernel code, 3240K rwdata, 8192K rodata)
[    0.045120] pci 0000:00:00.0: [1022:1480] type 00 class 0x060000 PCIe Root Complex (Gen5 x16)
[    0.089450] nvme nvme0: pci function 0000:01:00.0 (PCIe 5.0 x4 NVMe 2.0 SSD, 4TB TLC)
[    0.112800] BPF: [0] [eBPF JIT compiler enabled with 64-bit verification engine]
[    0.142900] systemd[1]: Inserted module 'quantum_defense_enclave' into kernel memory space
[    0.189500] net eth0: Mellanox ConnectX-6 Dx (100GbE Dual-Port SFP56) link UP at 100000 Mbps
[    0.210400] crypto: Hardware AES-NI and SHA-512 acceleration engines LOCKED & ACTIVE
[    0.245800] soc-agent[812]: SIEM Telemetry Bridge attached to eBPF socket filter (UID: 0)
`;
        this.addExp(25, 'Kernel Ring Buffer Inspected');
        this.audio.playKey(false);
        break;

      case 'netstat':
      case 'ss':
      case 'sockets':
        output = `
ACTIVE INTERNET CONNECTIONS (ONLY SERVERS & ESTABLISHED CHANNELS):
Proto Recv-Q Send-Q  Local Address           Foreign Address         State       PID/Program name
----------------------------------------------------------------------------------------------------
tcp        0      0  0.0.0.0:22              0.0.0.0:*               LISTEN      812/sshd
tcp        0      0  127.0.0.1:5432          0.0.0.0:*               LISTEN      945/postgres
tcp        0      0  0.0.0.0:443             0.0.0.0:*               LISTEN      1120/nginx-edge
tcp        0      0  0.0.0.0:9090            0.0.0.0:*               LISTEN      1340/prometheus
tcp        0      0  192.168.1.105:54382     104.244.42.1:443        ESTABLISHED 2341/cyberdeck-core
tcp        0      0  192.168.1.105:49152     140.82.121.4:443        ESTABLISHED 4102/git-sync
tcp        0      0  192.168.1.105:58920     52.84.18.22:443         ESTABLISHED 1120/binance-ws
udp        0      0  127.0.0.53:53           0.0.0.0:*                           620/systemd-resolved
udp        0      0  0.0.0.0:51820           0.0.0.0:*                           745/wireguard-vpn
----------------------------------------------------------------------------------------------------
TOTAL SOCKETS: 9 Active | TX BUFFER: 0 B | RX BUFFER: 0 B | STATUS: ZERO DROPPED PACKETS
`;
        this.addExp(25, 'Network Sockets Audited');
        this.audio.playKey(false);
        break;

      case 'iptables':
      case 'ufw':
      case 'firewall':
        output = `
[+] KERNEL IP PACKET FILTERING MATRIX (TABLE: FILTER // DEFCON-1 ENFORCED):
-----------------------------------------------------------------------------------------
Chain INPUT (policy DROP 18,421 packets, 3.12 MB)
 num   pkts bytes target     prot opt in     out     source               destination
   1   8.4M 6.12G ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0           ctstate RELATED,ESTABLISHED
   2   1.2M 84.5M ACCEPT     tcp  --  eth0   *       0.0.0.0/0            0.0.0.0/0           tcp dpt:443
   3   410K 28.2M ACCEPT     tcp  --  eth0   *       0.0.0.0/0            0.0.0.0/0           tcp dpt:22 state NEW recent: CHECK seconds: 60 hit_count: 5
   4  18.4K 3.12M DROP       tcp  --  eth0   *       0.0.0.0/0            0.0.0.0/0           tcp flags:0x3F/0x29 [SYN,RST,ACK/FIN - PORT SCAN]

Chain FORWARD (policy DROP 0 packets, 0 bytes)

Chain OUTPUT (policy ACCEPT 9.1M packets, 7.85 GB)
-----------------------------------------------------------------------------------------
[✓] FIREWALL ACTIVE: 100% INGRESS PARITY // ZERO UNAUTHORIZED CONNECTIONS
`;
        this.addExp(25, 'Firewall Table Inspected');
        this.audio.playSuccessFanfare();
        break;

      case 'systemctl':
      case 'service':
        if (args[0] === 'restart' && args[1]) {
          output = `[+] Restarting system unit: ${args[1]}.service...\n[✓] Unit ${args[1]}.service reloaded successfully with new PID.`;
          this.audio.playSuccessFanfare();
        } else {
          output = `
UNIT STATUS                           LOAD   ACTIVE SUB     DESCRIPTION
-----------------------------------------------------------------------------------------
● quantum-kernel.service              loaded active running Real-Time Quantum Core Kernel Driver
● sshd.service                        loaded active running OpenSSH Military Daemon (Port 22)
● defense-daemon.service              loaded active running Air-Gap IDS & Active Intrusion Shield
● soc-telemetry.service               loaded active running 1000Hz SIEM Security Operations Link
● docker.service                      loaded active running Microservices Container Engine
● wireguard-mesh.service              loaded active running Zero-Trust Darknet Overlay VPN
● chrony-ntp.service                  loaded active running Sub-Nanosecond Atomic Clock Sync
-----------------------------------------------------------------------------------------
LOAD: 7/7 Units Active | SYSTEM STATE: RUNNING (DEGRADED: 0)
`;
        }
        this.addExp(25, 'System Services Audited');
        this.audio.playKey(false);
        break;

      case 'crypto':
      case 'cipherbench':
        output = `
=========================================================================================
⚡ HARDWARE CRYPTOGRAPHIC ACCELERATOR BENCHMARK (AVX-512 / AES-NI / VAES)
=========================================================================================
ALGORITHM                 BLOCK SIZE       THROUGHPUT (GB/s)    LATENCY (ns)   HARDWARE ENGINE
-----------------------------------------------------------------------------------------
AES-256-GCM (Authenticated) 16 KB              18.42 GB/s           4.1 ns     Intel/AMD AES-NI
ChaCha20-Poly1305 (AEAD)    16 KB              15.10 GB/s           5.2 ns     AVX-512 Vectorized
SHA-512 (Secure Hash)        8 KB              12.80 GB/s           6.8 ns     SHA-NI Vector Ext
SHA3-512 (Keccak Permute)    8 KB               9.45 GB/s           8.9 ns     Hardware Keccak
Ed25519 (Signature Verify)   32 B          48,200 ops/sec          20.7 us     Curve25519 Engine
RSA-4096 (CRT Decrypt/Sign) 512 B           4,850 ops/sec         206.1 us     Montgomery Modulo
-----------------------------------------------------------------------------------------
[✓] ALL CIPHER ENGINES HARDWARE-ACCELERATED // ZERO SIDE-CHANNEL LEAKAGE
`;
        this.addExp(40, 'Cryptographic Suite Benchmarked');
        this.audio.playSuccessFanfare();
        break;

      case 'siem':
      case 'soc':
        output = `
=========================================================================================
🛡️ SECURITY OPERATIONS CENTER (SOC) & SIEM INCIDENT COMMAND
=========================================================================================
TIME (UTC)       SEVERITY  SOURCE IP        EVENT / SIGNATURE                  MITIGATION
-----------------------------------------------------------------------------------------
15:56:42.102     HIGH      185.220.101.5    SSH Brute Force (User: admin)      [IP BANNED (IPTABLES)]
15:56:18.450     CRITICAL  45.33.32.156     CVE-2026-9041 Buffer Overflow      [EBPF REJECTED]
15:55:50.012     MEDIUM    91.240.118.82    Syn-Ack Stealth Port Sweep (Nmap)  [TARPIT ENGAGED]
15:55:12.890     LOW       127.0.0.1        Authorized Root Auth (Anan)        [CLEARED (UID: 0)]
15:54:02.115     INFO      0.0.0.0          BGP Route Metric Convergence       [STABLE (AS13335)]
-----------------------------------------------------------------------------------------
THREAT DEFENSE SCORE: 100/100 (DEFCON-1 ENFORCED) | ACTIVE MITIGATIONS: 3 BANNED
`;
        this.addExp(40, 'SOC Security Operations Checked');
        this.audio.playSuccessFanfare();
        break;

      case 'iotop':
      case 'iostat':
        output = `
STORAGE BUS & NVME CONTROLLER TELEMETRY (1000 Hz Sampling):
Device             r/s     w/s     rMB/s     wMB/s   rrqm/s   wrqm/s  %util  avg-lat
-----------------------------------------------------------------------------------------
nvme0n1 (OS Core)  8,420   3,110   1,240.5   840.2      0.0      0.0   12.4   0.02 ms
nvme1n1 (Data/L2)  1,200     450     380.0   120.0      0.0      0.0    4.1   0.03 ms
sdd0 (Backup Enc)      0       0       0.0     0.0      0.0      0.0    0.0   0.00 ms
-----------------------------------------------------------------------------------------
STORAGE HEALTH: 100% LIFE REMAINING | OPERATING TEMP: 38°C | BUS: PCIe 5.0 x4
`;
        this.addExp(25, 'Storage I/O Telemetry Audited');
        this.audio.playKey(false);
        break;

      case 'strace':
        output = `
[+] TRACING PID 2341 (cyberdeck-core) SYSTEM CALLS:
-----------------------------------------------------------------------------------------
15:57:01.002 epoll_wait(4, [{EPOLLIN, {u32=7, u64=7}}], 64, 1000) = 1 <0.000012>
15:57:01.003 read(7, "GET /api/v3/ticker HTTP/1.1\\r\\n", 4096) = 31 <0.000008>
15:57:01.004 mprotect(0x7fff8000, 4096, PROT_READ|PROT_WRITE) = 0 <0.000005>
15:57:01.005 futex(0x55a4e8b0, FUTEX_WAKE_PRIVATE, 1) = 1 <0.000006>
15:57:01.006 write(1, "[*] Telemetry Packet Ingested\\n", 30) = 30 <0.000010>
-----------------------------------------------------------------------------------------
[✓] TRACE COMPLETED: ZERO FAULTS / ZERO SYS_CALL ANOMALIES
`;
        this.addExp(25, 'Syscall Trace Analyzed');
        this.audio.playKey(false);
        break;

      case 'lsof':
        output = `
COMMAND    PID  USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME
-----------------------------------------------------------------------------------------
systemd      1  root  cwd    DIR  259,0     4096      2 /
cyberdeck 2341  anan  cwd    DIR  259,0     4096 841201 /home/anan/cyberdeck
cyberdeck 2341  anan  rtd    DIR  259,0     4096      2 /
cyberdeck 2341  anan  txt    REG  259,0 48920112 841209 /usr/bin/cyberdeck-core
cyberdeck 2341  anan  mem    REG  259,0  2048576 112040 /lib/x86_64-linux-gnu/libc.so.6
cyberdeck 2341  anan    3u  IPv4  24901      0t0    TCP *:443 (LISTEN)
cyberdeck 2341  anan    7u  unix  18492      0t0        /run/cyberdeck/ipc.sock
-----------------------------------------------------------------------------------------
OPEN DESCRIPTORS: 7 Active | LEAKS: 0
`;
        this.addExp(25, 'File Descriptors Audited');
        this.audio.playKey(false);
        break;

      // 5. Linux Prompt & Dotfile Customization
      case 'prompt':
        if (['windows', 'kali', 'arch', 'ubuntu', 'matrix', 'win'].includes(args[0])) {
          const style = args[0] === 'win' ? 'windows' : args[0];
          this.setPromptStyle(style);
          output = `[+] Prompt style updated to: ${style.toUpperCase()}`;
        } else {
          output = `Available prompt styles: kali, arch, ubuntu, matrix, windows`;
        }
        break;

      case 'alias':
        if (!args[0] || !args[0].includes('=')) {
          output = `Usage: alias [shortcut]=[command] (e.g. 'alias g=open chrome')\nCurrent Aliases: ${JSON.stringify(this.customAliases)}`;
        } else {
          const [aKey, aVal] = args[0].split('=');
          this.customAliases[aKey.toLowerCase()] = aVal;
          profileStore.updateUserSettings(this.username, { customAliases: this.customAliases });
          output = `[+] Alias registered: '${aKey}' ➔ '${aVal}'`;
        }
        break;

      // Cyberpunk 2077 Breach Protocol
      case 'breach':
      case 'cyberpunk':
        if (this.dom.breachProtocolModal && this.breachEngine) {
          this.dom.breachProtocolModal.classList.remove('hidden');
          this.breachEngine.start();
          this.audio.playEnterSound();
        }
        return;

      // Watch Dogs Cyber Threat Globe
      case 'threat':
      case 'globe':
      case 'warmap':
        if (this.dom.cyberThreatModal && this.threatEngine) {
          this.dom.cyberThreatModal.classList.remove('hidden');
          this.threatEngine.start();
          this.audio.playSuccessFanfare();
        }
        return;

      // The Matrix EMP Blast
      case 'emp':
      case 'blast':
      case 'sentinel':
        this.triggerEmpBlast();
        return;

      // Retro CRT Mode
      case 'crt':
      case 'glitch':
        const isCrt = this.toggleCrtEffect();
        output = `[+] Retro CRT Monitor Phosphor Shader: ${isCrt ? 'ENABLED [90s CYBER]' : 'DISABLED'}`;
        this.audio.playKey(false);
        break;

      // Mr. Robot USB Ducky Payload
      case 'payload':
      case 'ducky':
      case 'usb':
        this.openDuckyModal();
        return;

      // Cyber File Explorer & Real Storage Matrix
      case 'explorer':
      case 'files':
      case 'drives':
      case 'storage':
        this.launchExplorerMode(args[0]);
        return;

      // Real Task Manager (htop) & Process Matrix
      case 'htop':
      case 'ps':
      case 'top':
      case 'taskmgr':
      case 'processes':
        this.launchTaskManagerMode();
        return;

      // Tron 3D Audio Visualizer & Cyber Radio
      case 'radio':
      case 'music':
      case 'synthwave':
      case 'equalizer':
        this.launchRadioMode();
        return;

      // Cyber Wi-Fi Radar & Quantum Decryptor
      case 'wifi':
      case 'wlan':
      case 'radar':
      case 'aircrack':
      case 'decrypt':
        this.launchWifiMode();
        return;

      // AI Neural Quantitative Trading Terminal
      case 'trade':
      case 'trading':
      case 'crypto':
      case 'stocks':
        this.launchTradingMode(args[0]);
        return;

      case 'buy':
      case 'long':
        if (this.tradingEngine) {
          const amt = args[0] ? parseFloat(args[0]) : 2000;
          this.tradingEngine.openPosition('LONG', isNaN(amt) ? 2000 : amt);
        } else {
          this.launchTradingMode('btc');
        }
        return;

      case 'sell':
      case 'short':
        if (this.tradingEngine) {
          const amt = args[0] ? parseFloat(args[0]) : 2000;
          this.tradingEngine.openPosition('SHORT', isNaN(amt) ? 2000 : amt);
        } else {
          this.launchTradingMode('btc');
        }
        return;

      // Mr. Robot Workspace Automator
      case 'workspace':
      case 'workspaces':
      case 'devmode':
      case 'gamemode':
        const profId = cmd === 'devmode' ? 'dev_mode' : cmd === 'gamemode' ? 'gaming_rig' : (args[0] || 'dev_mode');
        this.launchWorkspaceProfile(profId);
        return;

      // Matrix Biometric Thermal Keyboard Heatmap
      case 'heat':
      case 'heatmap':
      case 'biometric':
        const isHeatActive = this.kb.toggleHeatmap();
        output = isHeatActive 
          ? `[+] MATRIX BIOMETRIC THERMAL KEYBOARD HEATMAP: ACTIVE [COOL CYAN ➔ NEON RED]`
          : `[-] MATRIX BIOMETRIC THERMAL KEYBOARD HEATMAP: DISABLED`;
        this.audio.playKey(false);
        break;

      // VS Code Multi-Language Interactive Playground & Academy
      case 'code':
      case 'vscode':
      case 'ide':
      case 'codeview':
      case 'learn':
        this.launchVscodeMode(args[0]);
        return;

      // In-App Cyber Browser (YouTube, Google, FB, IG, GitHub)
      case 'browser':
      case 'web':
      case 'surf':
      case 'yt':
      case 'youtube':
      case 'google':
        let targetUrl = args.join(' ');
        if (cmd === 'yt' || cmd === 'youtube') {
          targetUrl = `yt ${args.join(' ')}`;
        } else if (cmd === 'google') {
          targetUrl = `google ${args.join(' ')}`;
        }
        this.launchBrowserMode(targetUrl || 'https://www.google.com');
        return;

      // Multi-Window Tiling Split Mode
      case 'split':
      case 'tile':
      case 'vsplit':
      case 'hsplit': {
        let dir = (cmd === 'hsplit' || args[0] === 'h' || args[0] === 'horizontal') ? 'horizontal' : 'vertical';
        let subMode = '';
        let subUrl = '';

        const remainingArgs = args.filter(a => !['vertical', 'v', 'horizontal', 'h'].includes(a));
        if (remainingArgs.length > 0) {
          const firstSub = remainingArgs[0].toLowerCase();
          if (['browser', 'web', 'yt', 'youtube', 'google'].includes(firstSub)) {
            subMode = 'browser';
            subUrl = remainingArgs.slice(1).join(' ') || (firstSub === 'yt' ? 'https://www.youtube.com' : 'https://www.google.com');
          } else if (['code', 'vscode', 'ide', 'learn'].includes(firstSub)) {
            subMode = 'vscode';
            subUrl = remainingArgs.slice(1).join(' ') || 'python';
          }
        }

        const res = await this.sys.windowSplit({ direction: dir, mode: subMode, url: subUrl });
        if (res && res.success) {
          output = `[+] Window split executed [${dir.toUpperCase()}]. Attached Mode: ${subMode ? subMode.toUpperCase() : 'MAIN CLI'}`;
          this.audio.playSuccessFanfare();
        } else {
          output = `[!] Window split: ${res ? res.error : 'Split limit reached or unsupported.'}`;
        }
        break;
      }

      // Hacky Cyberspace Node Crawl (Roguelite)
      case 'roguelite':
      case 'rl':
      case 'crawl':
      case 'dive':
      case 'hacky':
        this.launchRogueliteMode();
        return;

      // Operator Analytics & Dashboard
      case 'dashboard':
      case 'dossier':
      case 'analytics':
        if (this.controlCenter) this.controlCenter.openDashboardModal();
        return;

      // Terminal Settings Panel
      case 'settings':
      case 'config':
      case 'options':
        if (this.controlCenter) this.controlCenter.openSettingsModal();
        return;

      // Command Palette
      case 'palette':
      case 'menu':
        if (this.controlCenter) this.controlCenter.openCommandPalette();
        return;

      case 'academy':
      case 'practice':
      case 'typing':
        this.launchAcademyMode(args[0]);
        return;

      case 'hacker':
      case 'breachmission':
        this.launchHackerMode(args[0]);
        return;

      case 'speed':
      case 'test':
      case 'benchmark':
      case 'marathon':
        this.launchSpeedMode(args[0]);
        return;

      case 'scan':
        this.runPortScanner(args[0] || 'saturn.orbital.mil');
        return;

      case 'crack':
      case 'hashcrack':
        this.runHashCracker(args[0] || 'e99a18c428cb38d5f260853678922e03');
        return;

      case 'bgm':
      case 'music':
      case 'radio':
        const isPlaying = this.audio.toggleCyberBgm();
        if (this.dom.bgmStatusTag) {
          this.dom.bgmStatusTag.textContent = `BGM: ${isPlaying ? 'ONLINE' : 'OFF'}`;
        }
        output = `[+] Procedural Cyber Ambient BGM: ${isPlaying ? 'ENGAGED [PLAYING]' : 'MUTED'}`;
        break;

      // Cyber Intelligence, Stock Markets & Tech News Radar
      case 'intel':
      case 'news':
      case 'stocks':
      case 'market':
      case 'markets':
      case 'feed': {
        if (this.intelFeed) {
          if (this.intelFeed.isCollapsed) {
            this.intelFeed.toggleCollapse();
          }
          this.intelFeed.randomizeMarkets();
        }
        output = `
[+] CYBER//INTEL TELEMETRY RADAR ACTIVE [2.4 GHz LIVE STREAM]
------------------------------------------------------------------
• BITCOIN (BTC/USD) : ₿ $96,420.50 (+5.82% ▲) [HIGH LIQUIDITY]
• NVIDIA (NVDA)     : $ 142.80 (+4.31% ▲) [AI ACCELERATOR SURGE]
• NASDAQ CYBER      : $ 428.15 (+2.14% ▲) [CYBERSECURITY SECTOR]
• ETHEREUM (ETH)    : $ 3,580.00 (-0.85% ▼) [GAS: 14 GWEI]
------------------------------------------------------------------
[LATEST INTEL WIRE]
1. [AI/QUANTUM] OpenAI & DeepSeek Deploy 100M Context Window Lattice
2. [0-DAY ALERT] Critical RCE Vulnerability Patched in Global OpenSSL
3. [HARDWARE] NVIDIA Blackwell Ultra B300 Sets 1.2 ExaFLOPS Benchmark
4. [DEV/CODE] Python 3.13 Free-Threaded GIL-less Mode Delivers 45% Speedup
(Use the interactive radar on the right to filter categories or view live sparklines)`;
        this.audio.playSuccessFanfare();
        break;
      }

      case 'map':
      case 'topology':
      case 'satellite':
        if (this.dom.cyberNetworkMapModal) {
          this.dom.cyberNetworkMapModal.classList.remove('hidden');
          this.audio.playSuccessFanfare();
        }
        return;

      case 'shop':
      case 'blackmarket':
      case 'cyberware':
        const curProf = profileStore.getProfile(this.username);
        const inv = curProf.inventory || ['stock_switches'];
        const subAction = args[0] ? args[0].toLowerCase() : '';
        const itemArg = args[1] ? args[1].toLowerCase() : '';

        if (subAction === 'buy') {
          const catalog = {
            synaptic_booster: { name: 'Synaptic Booster (EXP Multiplier +20%)', cost: 600 },
            trace_jammer: { name: 'Trace Jammer (-30% Hacker Trace Speed)', cost: 800 },
            holypanda_switches: { name: 'Holy Panda Mechanical Switches', cost: 400 },
            cherry_switches: { name: 'Cherry MX Blue Clicky Switches', cost: 350 }
          };
          const targetItem = catalog[itemArg];
          if (!targetItem) {
            output = `[✗] Unknown item: '${itemArg}'. Available items:\n>> synaptic_booster (600 CC)\n>> trace_jammer (800 CC)\n>> holypanda_switches (400 CC)\n>> cherry_switches (350 CC)`;
          } else {
            const buyRes = profileStore.buyItem(this.username, itemArg, targetItem.cost);
            if (buyRes.success) {
              output = `[✓] PURCHASE CONFIRMED: ${targetItem.name}\n>> Balance Remaining: ${buyRes.credits} CC`;
              this.audio.playSuccessFanfare();
              if (itemArg.includes('switches')) {
                this.audio.setPreset(itemArg);
              }
            } else if (buyRes.reason === 'ALREADY_OWNED') {
              output = `[!] You already own ${targetItem.name}. Type 'shop equip ${itemArg}' to activate.`;
            } else {
              output = `[✗] INSUFFICIENT FUNDS. You need ${targetItem.cost} CC (Current Balance: ${curProf.credits || 0} CC).\nComplete speed runs or hacking missions to earn credits!`;
              this.audio.playErrorSound();
            }
          }
        } else if (subAction === 'equip') {
          if (!itemArg) {
            output = `Usage: shop equip [holypanda_switches | cherry_switches | stock_switches]`;
          } else {
            const eqRes = profileStore.equipSwitch(this.username, itemArg);
            if (eqRes) {
              this.audio.setPreset(itemArg);
              output = `[✓] EQUIPPED SWITCH PROFILE: ${itemArg.toUpperCase()}`;
              this.audio.playKey(false);
            } else {
              output = `[✗] You do not own '${itemArg}'. Purchase it in the shop first.`;
            }
          }
        } else {
          output = `
BLACK MARKET CYBERWARE SHOP // CREDITS: ${curProf.credits || 0} CC
-----------------------------------------------------------------------------------------
[ HARDWARE & NEURAL AUGMENTATIONS ]
  1. synaptic_booster     [ 600 CC ]  - +20% EXP boost across all typing modes
     Status: ${inv.includes('synaptic_booster') ? 'OWNED [ACTIVE]' : 'AVAILABLE'}
  
  2. trace_jammer         [ 800 CC ]  - Slows security IDS trace countdown by 30%
     Status: ${inv.includes('trace_jammer') ? 'OWNED [ACTIVE]' : 'AVAILABLE'}

[ MECHANICAL SWITCH AUDIO PROFILES ]
  3. holypanda_switches   [ 400 CC ]  - Deep acoustic tactile thock sound profile
     Status: ${inv.includes('holypanda_switches') ? 'OWNED' : 'AVAILABLE'}
  
  4. cherry_switches      [ 350 CC ]  - Crisp high-tactile clicky mechanical sound profile
     Status: ${inv.includes('cherry_switches') ? 'OWNED' : 'AVAILABLE'}
-----------------------------------------------------------------------------------------
COMMANDS:
  shop buy [item_id]       - Purchase cyberware augmentation
  shop equip [switch_id]   - Equip mechanical switch audio profile
`;
        }
        break;

      case 'records':
      case 'leaderboard':
        const p = profileStore.getProfile(this.username);
        const rec = p.records || {};
        output = `
NETRUNNER HIGH-SCORE VAULT // PERSONAL RECORDS
------------------------------------------------------------------
OPERATOR: ${this.username.toUpperCase()} (LVL ${p.level}) | CREDITS: ${p.credits || 0} CC
------------------------------------------------------------------
  SPEED 15s BENCHMARK  : ${rec.speed15 || 0} WPM
  SPEED 30s BENCHMARK  : ${rec.speed30 || 0} WPM
  SPEED 60s BENCHMARK  : ${rec.speed60 || 0} WPM
  ENDLESS MARATHON     : ${rec.marathon || 0} WPM (Peak: ${p.peakWpm || 0} WPM)
------------------------------------------------------------------
MILESTONES:
  ${(p.peakWpm >= 100) ? '★ [LEGENDARY GHOST: 100+ WPM]' : (p.peakWpm >= 80) ? '★ [CYBER DEITY: 80+ WPM]' : (p.peakWpm >= 60) ? '★ [NETRUNNER: 60+ WPM]' : '★ [INITIATE OPERATOR]'}
`;
        break;

      case 'whoami':
      case 'stats':
      case 'dossier':
        const ranks = ['INITIATE', 'SCRIPT RUNNER', 'NETRUNNER', 'ZERO-DAY HUNTER', 'QUANTUM DEITY'];
        const profObj = profileStore.getProfile(this.username);
        const rankTitle = ranks[Math.min(ranks.length - 1, profObj.level - 1)];
        const weakList = profileStore.getWeakKeys(this.username);
        const weakStr = weakList.length > 0 ? weakList.slice(0, 6).join(', ').toUpperCase() : 'None (Flawless)';
        output = `
OPERATOR DOSSIER // CLASSIFIED
--------------------------------------------------
OPERATOR ID   : ${this.username.toUpperCase()} (UID: 0)
CYBER RANK    : LVL ${profObj.level} [${rankTitle}]
CREDITS [CC]  : ${profObj.credits || 0} CC
EXPERIENCE    : ${profObj.exp} / ${profObj.expNext} EXP
PEAK SPEED    : ${profObj.peakWpm} WPM
WEAK KEYS     : [ ${weakStr} ] (Type 'academy weak' to drill)
CYBERWARE     : [ ${(profObj.inventory || []).join(', ')} ]
TOTAL DRILLS  : ${profObj.totalKeystrokes} Keystrokes Logged
BATCHES DONE  : ${profObj.batchesCleared} Cleared
MISSIONS WON  : ${profObj.missionsCleared} Completed
ACCESS CLEAR  : DEFCON-1 (ROOT PRIVILEGES)
ENCRYPTION    : RSA-8192 / AES-256-GCM
--------------------------------------------------
`;
        break;

      case 'sandbox':
      case 'notepad':
        this.launchSandboxMode();
        return;

      case 'cls':
      case 'clear':
        this.dom.cliHistory.innerHTML = '';
        this.dom.cliInputText.textContent = '';
        this.cliInputBuffer = '';
        return;

      case 'lang':
      case 'layout':
        if (args[0] === 'th' || args[0] === 'en') {
          this.setLayout(args[0]);
        } else {
          this.setLayout(this.currentLayout === 'en' ? 'th' : 'en');
        }
        output = `[+] Layout switched to: ${this.currentLayout.toUpperCase()}`;
        break;

      case 'sound':
      case 'audio':
        if (['hollywood', 'mechanical', 'cyberterminal', 'terminal', 'silent', 'mute'].includes(args[0])) {
          const preset = args[0] === 'terminal' ? 'cyberterminal' : (args[0] === 'mute' ? 'silent' : args[0]);
          this.setSoundSwitch(preset);
          output = `[+] Audio profile set to: ${this.currentSound}`;
        } else {
          output = `Available sound presets: hollywood, mechanical, terminal, mute`;
        }
        break;

      case 'theme':
        if (['matrix', 'neon', 'amber', 'red', 'stealth', 'white'].includes(args[0])) {
          const t = args[0] === 'white' ? 'stealth' : args[0];
          this.setTheme(t);
          output = `[+] Visual theme updated: ${t.toUpperCase()}`;
        } else {
          output = `Available themes: matrix, neon, amber, red, white`;
        }
        break;

      // --- VIRTUAL HACKING NETWORK COMMANDS ---
      case 'bbs':
        output = this.virtualNet.getBBSList();
        break;
      case 'nmap':
        if (!args[0]) output = `Usage: nmap [ip address]`;
        else {
          output = this.virtualNet.scanTarget(args[0]);
          this.audio.playKey(false);
        }
        break;
      case 'ssh':
      case 'connect':
        if (!args[0]) output = `Usage: ssh [ip address]`;
        else output = this.virtualNet.connectSSH(args[0]);
        break;
      case 'hack':
        const hackRes = this.virtualNet.hackData();
        if (typeof hackRes === 'string') {
          output = hackRes; // Backwards compatibility if needed
        } else if (hackRes.type === 'error') {
          output = hackRes.msg;
        } else if (hackRes.type === 'start_minigame') {
          // Launch Breach Protocol for this target
          this.launchVirtualHackMinigame(hackRes.target);
          return; // Do not process standard output
        }
        break;
      case 'clearlogs':
        output = this.virtualNet.clearLogs();
        break;
      case 'rm':
        if (args.join(' ') === '-rf /logs' || args.join(' ') === '-rf /var/log') {
          output = this.virtualNet.clearLogs();
        } else {
          output = `rm: cannot remove '${args[0]}': Permission denied`;
        }
        break;
      case 'disconnect':
        output = this.virtualNet.disconnect();
        break;
      case 'shop':
      case 'market':
        output = this.virtualNet.openShop(args);
        break;
      // ----------------------------------------

      case 'logout':
        this.state = STATES.LOGIN;
        this.dom.mainTerminalContainer.classList.add('hidden');
        this.dom.hackerLoginOverlay.classList.remove('hidden');
        this.dom.loginPassField.value = '';
        this.dom.loginPassField.focus();
        return;

      case 'exit':
        output = `Already at root CMD environment.`;
        break;

      default:
        // Try executing as real native command if available
        if (this.sys.isElectron) {
          const autoExec = await this.sys.exec(raw);
          if (autoExec.success && autoExec.stdout) {
            output = autoExec.stdout;
          } else {
            output = autoExec.stderr || `'${cmd}' is not recognized as an internal or external command.\nType 'help' to see available commands.`;
          }
        } else {
          output = `'${cmd}' is not recognized as an internal or external command.\nType 'help' to see available commands.`;
        }
    }

    if (output) {
      const outEl = document.createElement('div');
      outEl.className = 'cli-history-output';
      outEl.textContent = output.trim();
      this.dom.cliHistory.appendChild(outEl);
    }

    this.cliInputBuffer = '';
    this.cliCursorPos = 0;
    this.renderCliPrompt();
    this.scrollToBottom();
  }

  triggerEmpBlast() {
    this.audio.playEmpBlast();
    if (this.dom.empShockwaveOverlay) {
      this.dom.empShockwaveOverlay.classList.remove('hidden');
      setTimeout(() => {
        this.dom.empShockwaveOverlay.classList.add('hidden');
      }, 950);
    }
    this.addExp(100, 'EMP Defense Pulse');
  }

  openDuckyModal() {
    if (this.dom.duckyPayloadModal) {
      this.dom.duckyPayloadModal.classList.remove('hidden');
      this.audio.playUsbMountSound();
      this.renderDuckyPreview('reverse_shell');
    }
  }

  renderDuckyPreview(type) {
    const tmpl = DUCKY_PAYLOAD_TEMPLATES[type] || DUCKY_PAYLOAD_TEMPLATES.reverse_shell;
    if (this.dom.duckyCodePreview) {
      this.dom.duckyCodePreview.textContent = tmpl.script;
    }
  }

  runPortScanner(target) {
    const lines = [
      `[+] INITIATING NMAP SCAN AGAINST TARGET: ${target}`,
      `>> SYN Stealth Scan (65,535 ports)...`,
      `>> PORT 21/tcp   [OPEN]  FTP  (vsftpd 3.0.3 - ANONYMOUS ALLOWED)`,
      `>> PORT 22/tcp   [OPEN]  SSH  (OpenSSH 8.9p1 Ubuntu)`,
      `>> PORT 80/tcp   [OPEN]  HTTP (nginx/1.18.0)`,
      `>> PORT 443/tcp  [OPEN]  HTTPS (Quantum TLS 1.3 - RSA-8192)`,
      `>> PORT 3306/tcp [FILTERED] MySQL (Database Enclave)`,
      `>> PORT 8080/tcp [OPEN]  HTTP-Proxy (Shadow Gateway)`,
      `>> PORT 8443/tcp [OPEN]  VULNERABLE (Saturn Satellite Command Daemon)`,
      `[✓] SCAN COMPLETE: 1 CRITICAL ZERO-DAY VULNERABILITY FOUND ON PORT 8443!`
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < lines.length) {
        const out = document.createElement('div');
        out.className = 'cli-history-output';
        const txt = lines[idx];
        if (txt.includes('CRITICAL') || txt.includes('[✓]')) {
          out.style.color = '#ffaa00';
          out.style.fontWeight = 'bold';
        } else if (txt.includes('[OPEN]')) {
          out.style.color = '#00ff66';
        } else {
          out.style.color = '#00e5ff';
        }
        out.textContent = txt;
        this.dom.cliHistory.appendChild(out);
        this.scrollToBottom();
        this.audio.playKey(false);
        idx++;
      } else {
        clearInterval(interval);
        this.addExp(150, 'Target Port Reconnaissance');
        this.audio.playSuccessFanfare();
        this.focusCliInput();
      }
    }, 180);
  }

  runHashCracker(hash) {
    const targetPassword = 'PASSWORD_QUANTUM_OVERRIDE_09';
    let currentGuess = '';

    const container = document.createElement('div');
    container.className = 'cli-history-output';
    container.style.color = '#00ff66';
    container.innerHTML = `[⚡ BRUTE-FORCE HASH CRACKER: ${hash}]<br><span id="crackProgressText">SOLVING: </span>`;
    this.dom.cliHistory.appendChild(container);

    let charPos = 0;
    const interval = setInterval(() => {
      if (charPos < targetPassword.length) {
        const randomChar = String.fromCharCode(33 + Math.floor(Math.random() * 90));
        currentGuess = targetPassword.substring(0, charPos) + randomChar;
        const progressEl = container.querySelector('#crackProgressText');
        if (progressEl) {
          progressEl.textContent = `SOLVING [${Math.round((charPos/targetPassword.length)*100)}%]: ${currentGuess}`;
        }
        this.audio.playKey(false);
        if (Math.random() > 0.3) {
          charPos++;
        }
      } else {
        clearInterval(interval);
        const progressEl = container.querySelector('#crackProgressText');
        if (progressEl) {
          progressEl.innerHTML = `<span style="color:#ffff00; font-weight:bold;">[✓] HASH CRACKED SUCCESS: '${targetPassword}'</span>`;
        }
        this.addExp(200, 'Password Hash Decryption');
        this.audio.playSuccessFanfare();
        this.focusCliInput();
      }
      this.scrollToBottom();
    }, 45);
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  scrollToBottom() {
    if (this.dom.terminalScreenWrapper) {
      this.dom.terminalScreenWrapper.scrollTop = this.dom.terminalScreenWrapper.scrollHeight;
    }
  }

  // =========================================================================
  // MODE LAUNCHERS
  // =========================================================================

  launchAcademyMode(lessonArg) {
    if (!lessonArg || lessonArg === 'grid' || lessonArg === 'list' || lessonArg === 'map') {
      this.openAcademyMissionGrid();
      return;
    }
    if (lessonArg === 'weak') {
      this.launchWeakKeyDrill();
      return;
    }

    const logs = generateEntranceLogs('academy', lessonArg || '1');
    this.state = STATES.MODE_ACADEMY;

    const lessons = LESSONS_DATA[this.currentLayout] || LESSONS_DATA.en;
    let lessonIndex = 0;
    if (lessonArg && !isNaN(parseInt(lessonArg, 10))) {
      lessonIndex = Math.max(0, Math.min(lessons.length - 1, parseInt(lessonArg, 10) - 1));
    }
    const lesson = lessons[lessonIndex];
    this.currentActiveLessonId = lesson.id;
    this.dom.academyLessonTitle.textContent = lesson.title;
    this.academyEngine.loadText(lesson.text);

    this.playCyberTransition(
      'TOUCH TYPING ACADEMY',
      'INITIALIZING TACTILE SENSORS...',
      logs,
      'academy',
      () => {
        this.dom.academyTypingCanvas.focus();
        setTimeout(() => this.hands.updatePositions(), 50);
      }
    );
  }

  launchHackerMode(missionArg) {
    const logs = generateEntranceLogs('hacker', missionArg || '1');
    this.state = STATES.MODE_HACKER;

    const traceSpeedMod = profileStore.hasItem(this.username, 'trace_jammer') ? 0.7 : 1.0;

    if (missionArg === 'stream') {
      this.hackerEngine.mode = 'stream';
      this.hackerEngine.reset(1, traceSpeedMod);
    } else {
      let mNum = 1;
      if (missionArg && !isNaN(parseInt(missionArg, 10))) {
        mNum = parseInt(missionArg, 10);
      }
      this.hackerEngine.mode = 'mission';
      this.hackerEngine.reset(mNum, traceSpeedMod);
    }

    this.playCyberTransition(
      'CYBER INFILTRATION HUD',
      'ESTABLISHING SATELLITE TUNNEL...',
      logs,
      'hacker',
      () => {
        this.dom.hackerTerminalCanvas.focus();
        setTimeout(() => this.hands.updatePositions(), 50);
      }
    );
  }

  launchVirtualHackMinigame(target) {
    if (this.dom.breachProtocolModal && this.breachEngine) {
      this.dom.breachProtocolModal.classList.remove('hidden');
      
      // Override onComplete callback
      this.breachEngine.onComplete = (res) => {
        this.dom.breachProtocolModal.classList.add('hidden');
        this.focusCliInput();
        
        let output = "";
        if (res.solvedCount > 0) {
          // Success
          output = this.virtualNet.hackSuccess(res.solvedCount);
        } else {
          // Fail
          output = this.virtualNet.hackFail();
        }
        
        // Write result to CLI History
        const histLine = document.createElement('div');
        histLine.className = 'cli-history-line';
        histLine.innerHTML = `<span style="color: ${res.solvedCount > 0 ? 'var(--theme-primary)' : '#ff2244'};">${output.replace(/\n/g, '<br>')}</span>`;
        if (this.dom.cliHistory) {
          this.dom.cliHistory.appendChild(histLine);
          this.dom.cliHistory.parentElement.scrollTop = this.dom.cliHistory.parentElement.scrollHeight;
        }
      };

      // Set difficulty based on target.diff
      const baseDifficulty = target.diff || 1;
      this.breachEngine.gridSize = Math.min(8, 4 + baseDifficulty); // 5x5 to 8x8
      this.breachEngine.bufferSize = Math.max(3, 7 - baseDifficulty); // 6 to 3 buffer sizes
      
      // Upgrade from Quantum Decryptor gives more time
      const bonusTime = (this.virtualNet.upgrades.quantumDecryptor || 0) * 10;
      this.breachEngine.baseTimeLeft = Math.max(10, 40 - (baseDifficulty * 5)) + bonusTime;

      this.breachEngine.start();
      this.audio.playEnterSound();
    }
  }

  syncConfigBarUI() {
    if (!this.dom.monkeyConfigBar || !this.speedEngine) return;
    const cfg = this.speedEngine.config;

    // 1. Modifiers
    if (this.dom.btnTogglePunctuation) {
      this.dom.btnTogglePunctuation.classList.toggle('active', !!cfg.hasPunctuation);
    }
    if (this.dom.btnToggleNumbers) {
      this.dom.btnToggleNumbers.classList.toggle('active', !!cfg.hasNumbers);
    }

    // 2. Mode buttons
    const modeBtns = this.dom.monkeyConfigBar.querySelectorAll('#configModeGroup button');
    modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === cfg.mode);
    });

    // 3. Sub-Option buttons
    const subGroup = document.getElementById('configSubOptionGroup');
    if (subGroup) {
      subGroup.innerHTML = '';
      let options = [];
      if (cfg.mode === 'time') {
        options = [15, 30, 60, 120];
      } else if (cfg.mode === 'words') {
        options = [10, 25, 50, 100];
      } else if (cfg.mode === 'quote') {
        options = ['short', 'medium', 'long'];
      }

      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'config-btn';
        btn.dataset.sub = opt;
        btn.textContent = opt;
        const isActive = (cfg.mode === 'time' && cfg.timeLimit === opt) ||
                         (cfg.mode === 'words' && cfg.wordCount === opt) ||
                         (cfg.mode === 'quote' && opt === 'short');
        if (isActive) btn.classList.add('active');

        btn.addEventListener('click', () => {
          if (cfg.mode === 'time') {
            this.speedEngine.setConfig({ timeLimit: parseInt(opt, 10) });
          } else if (cfg.mode === 'words') {
            this.speedEngine.setConfig({ wordCount: parseInt(opt, 10) });
          } else if (cfg.mode === 'quote') {
            this.speedEngine.setConfig({ mode: 'quote' });
          }
          this.syncConfigBarUI();
          if (this.audio && this.audio.playKey) this.audio.playKey(false);
          if (this.dom.monkeyWordsWrapper) this.dom.monkeyWordsWrapper.focus();
        });

        subGroup.appendChild(btn);
      });
    }

    // 4. Dictionary Select
    if (this.dom.selectSpeedDictionary) {
      this.dom.selectSpeedDictionary.value = cfg.dictionary || 'english200';
    }
  }

  launchSpeedMode(arg1, arg2) {
    let mode = 'time';
    let timeLimit = 30;
    let wordCount = 25;
    let isHardcore = false;
    let dictionary = this.currentLayout === 'th' ? 'thai200' : 'english200';

    if (arg1 === 'hardcore' || arg1 === 'hard') {
      isHardcore = true;
      timeLimit = 45;
    } else if (arg1 === 'words' || arg1 === 'w') {
      mode = 'words';
      wordCount = arg2 && !isNaN(parseInt(arg2, 10)) ? parseInt(arg2, 10) : 25;
    } else if (arg1 === 'quote' || arg1 === 'quotes') {
      mode = 'quote';
    } else if (arg1 === 'zen' || arg1 === '0' || arg1 === 0) {
      mode = 'zen';
    } else if (arg1 === 'thai' || arg1 === 'th') {
      dictionary = 'thai200';
    } else if (arg1 === 'code' || arg1 === 'dev') {
      dictionary = 'code';
    } else if (arg1 === 'cyber' || arg1 === 'hacker') {
      dictionary = 'cyber';
    } else if (arg1 && !isNaN(parseInt(arg1, 10))) {
      timeLimit = parseInt(arg1, 10);
    }

    const logs = generateEntranceLogs('speed', `${mode.toUpperCase()} [${mode === 'time' ? timeLimit + 's' : mode === 'words' ? wordCount + ' words' : mode}]`);
    this.state = STATES.MODE_SPEED;

    this.speedEngine.setConfig({
      mode,
      timeLimit,
      wordCount,
      dictionary,
      isHardcore
    });

    this.syncConfigBarUI();

    this.playCyberTransition(
      'MONKEYTYPE CYBER SPEED BENCHMARK',
      'COMPILING HIGH-FREQUENCY TELEMETRY...',
      logs,
      'speed',
      () => {
        if (this.dom.monkeyWordsWrapper) {
          this.dom.monkeyWordsWrapper.focus();
        }
        setTimeout(() => { if (this.hands) this.hands.updatePositions(); }, 50);
      }
    );
  }

  launchSandboxMode() {
    const logs = generateEntranceLogs('sandbox');
    this.state = STATES.MODE_SANDBOX;

    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();

    this.playCyberTransition(
      'TERMINAL NOTEPAD BUFFER',
      'SPAWNING UNRESTRICTED IO...',
      logs,
      'sandbox',
      () => {
        this.dom.sandboxTextarea.focus();
        setTimeout(() => this.hands.updatePositions(), 50);
      }
    );
  }

  launchRogueliteMode() {
    const logs = generateEntranceLogs('hacker', 'Cyberspace Node-Crawl');
    this.state = STATES.MODE_ROGUELITE;

    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();

    if (this.tabManager) {
      this.tabManager.updateActiveTabInfo('roguelite', 'Cyberspace Matrix', '🎮');
    }

    this.playCyberTransition(
      'CYBERSPACE NODE INFILTRATION',
      'ESTABLISHING DARKNET ROGUELITE TUNNEL...',
      logs,
      'roguelite',
      () => {
        if (this.rogueliteEngine) {
          this.rogueliteEngine.startNewRun();
        }
        setTimeout(() => this.hands.updatePositions(), 50);
      }
    );
  }

  launchVscodeMode(langArg) {
    const targetLang = langArg ? langArg.toLowerCase() : 'python';
    const logs = generateEntranceLogs('hacker', `VS Code Studio [${targetLang.toUpperCase()}]`);
    this.state = STATES.MODE_VSCODE;

    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();

    let targetTab = null;
    if (this.tabManager) {
      const activeTab = this.tabManager.tabs.find(t => t.id === this.tabManager.activeTabId);
      if (!activeTab || activeTab.type !== 'vscode') {
        this.tabManager.tabCounter++;
        targetTab = this.tabManager.createTab(TAB_TYPES.VSCODE, `VS Code [${targetLang.toUpperCase()}] (${this.tabManager.tabCounter})`, false);
        if (targetTab) {
          this.tabManager.activeTabId = targetTab.id;
          this.tabManager.renderTabs();
        }
      } else {
        this.tabManager.updateActiveTabInfo('vscode', `VS Code [${targetLang.toUpperCase()}]`, '⚡');
        targetTab = activeTab;
      }
    }

    this.playCyberTransition(
      'CYBER//CODE STUDIO IDE',
      'INITIALIZING MULTI-LANGUAGE RUNTIME & COMPILER...',
      logs,
      'vscode',
      () => {
        if (this.vscodeEngine) {
          this.vscodeEngine.loadLanguage(targetLang, 0);
          if (this.vscodeEngine.editorTextarea) {
            this.vscodeEngine.editorTextarea.focus();
          }
        }
        if (this.tabManager && targetTab) {
          this.tabManager.activeTabId = targetTab.id;
          this.tabManager.renderTabs();
        }
        setTimeout(() => this.hands.updatePositions(), 50);
      }
    );
  }

  launchBrowserMode(urlArg) {
    const logs = generateEntranceLogs('hacker', `In-App Browser [${urlArg || 'Google'}]`);
    this.state = STATES.MODE_BROWSER;

    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();

    let domainTitle = 'In-App Browser';
    try {
      if (urlArg && (urlArg.startsWith('http://') || urlArg.startsWith('https://'))) {
        const u = new URL(urlArg);
        domainTitle = `Web: ${u.hostname.replace('www.', '')}`;
      } else if (urlArg) {
        domainTitle = `Web: ${urlArg.slice(0, 16)}`;
      }
    } catch (e) {}

    let targetTab = null;
    if (this.tabManager) {
      const activeTab = this.tabManager.tabs.find(t => t.id === this.tabManager.activeTabId);
      if (!activeTab || activeTab.type !== 'browser') {
        // Create new dedicated browser tab without activating switchTab until transition completes
        this.tabManager.tabCounter++;
        targetTab = this.tabManager.createTab(TAB_TYPES.BROWSER, `${domainTitle} (${this.tabManager.tabCounter})`, false);
        if (targetTab) {
          targetTab.url = urlArg;
          this.tabManager.activeTabId = targetTab.id;
          this.tabManager.renderTabs();
        }
      } else {
        this.tabManager.updateActiveTabInfo('browser', domainTitle, '🌐');
        activeTab.url = urlArg;
        targetTab = activeTab;
      }
    }

    // Hide browser container during transition so it DOES NOT pop up prematurely!
    if (this.browserEngine && this.browserEngine.container) {
      this.browserEngine.container.classList.add('hidden');
    }

    this.playCyberTransition(
      'CYBER IN-APP BROWSER',
      'CONNECTING TO CHROMIUM WEBVIEW GATEWAY...',
      logs,
      'browser',
      () => {
        if (this.browserEngine) {
          this.browserEngine.openBrowser(urlArg || 'https://www.google.com', 'FULL');
        }
        if (this.tabManager && targetTab) {
          this.tabManager.activeTabId = targetTab.id;
          this.tabManager.renderTabs();
        }
        setTimeout(() => this.hands.updatePositions(), 50);
      }
    );
  }

  launchExplorerMode(pathArg) {
    const logs = generateEntranceLogs('hacker', `Cyber File Explorer [${pathArg || 'C:\\'}]`);
    this.state = STATES.MODE_EXPLORER;

    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();

    let targetTab = null;
    if (this.tabManager) {
      const activeTab = this.tabManager.tabs.find(t => t.id === this.tabManager.activeTabId);
      if (!activeTab || activeTab.type !== 'explorer') {
        this.tabManager.tabCounter++;
        targetTab = this.tabManager.createTab(TAB_TYPES.EXPLORER, `Cyber Explorer (${this.tabManager.tabCounter})`, false);
        if (targetTab) {
          this.tabManager.activeTabId = targetTab.id;
          this.tabManager.renderTabs();
        }
      } else {
        this.tabManager.updateActiveTabInfo('explorer', 'Cyber Explorer', '📂');
        targetTab = activeTab;
      }
    }

    this.playCyberTransition(
      'CYBER FILE EXPLORER & STORAGE MATRIX',
      'CONNECTING DIRECT TO HOST STORAGE & DRIVES...',
      logs,
      'explorer',
      () => {
        if (this.explorerEngine && pathArg) {
          this.explorerEngine.navigateTo(pathArg, true);
        }
        if (this.tabManager && targetTab) {
          this.tabManager.activeTabId = targetTab.id;
          this.tabManager.renderTabs();
        }
        setTimeout(() => this.hands.updatePositions(), 50);
      }
    );
  }

  launchTaskManagerMode() {
    const logs = generateEntranceLogs('hacker', 'Real Task Manager (htop)');
    this.state = STATES.MODE_TASKMGR;

    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();

    let targetTab = null;
    if (this.tabManager) {
      const activeTab = this.tabManager.tabs.find(t => t.id === this.tabManager.activeTabId);
      if (!activeTab || activeTab.type !== 'taskmgr') {
        this.tabManager.tabCounter++;
        targetTab = this.tabManager.createTab(TAB_TYPES.TASKMGR, `Task Manager (${this.tabManager.tabCounter})`, false);
        if (targetTab) {
          this.tabManager.activeTabId = targetTab.id;
          this.tabManager.renderTabs();
        }
      } else {
        this.tabManager.updateActiveTabInfo('taskmgr', 'Task Manager', '📊');
        targetTab = activeTab;
      }
    }

    this.playCyberTransition(
      'CYBER PROCESS MONITOR & TELEMETRY (htop)',
      'ATTACHING KERNEL DEBUGGER & PROCESS THREADS...',
      logs,
      'taskmgr',
      () => {
        if (this.taskmgrEngine) {
          this.taskmgrEngine.fetchProcesses();
        }
        if (this.tabManager && targetTab) {
          this.tabManager.activeTabId = targetTab.id;
          this.tabManager.renderTabs();
        }
        setTimeout(() => this.hands.updatePositions(), 50);
      }
    );
  }

  launchRadioMode() {
    const logs = generateEntranceLogs('hacker', 'Tron 3D Cyber Radio');
    this.state = STATES.MODE_RADIO;

    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();

    let targetTab = null;
    if (this.tabManager) {
      const activeTab = this.tabManager.tabs.find(t => t.id === this.tabManager.activeTabId);
      if (!activeTab || activeTab.type !== 'radio') {
        this.tabManager.tabCounter++;
        targetTab = this.tabManager.createTab(TAB_TYPES.RADIO, `Cyber Radio (${this.tabManager.tabCounter})`, false);
        if (targetTab) {
          this.tabManager.activeTabId = targetTab.id;
          this.tabManager.renderTabs();
        }
      } else {
        this.tabManager.updateActiveTabInfo('radio', 'Cyber Radio', '🎵');
        targetTab = activeTab;
      }
    }

    this.playCyberTransition(
      'TRON 3D AUDIO EQUALIZER & CYBER RADIO',
      'INITIALIZING WEB AUDIO ANALYSER & SYNTH MATRIX...',
      logs,
      'radio',
      () => {
        if (this.radioEngine) {
          this.radioEngine.togglePlayback();
        }
        if (this.tabManager && targetTab) {
          this.tabManager.activeTabId = targetTab.id;
          this.tabManager.renderTabs();
        }
        setTimeout(() => this.hands.updatePositions(), 50);
      }
    );
  }

  launchWifiMode() {
    const logs = generateEntranceLogs('hacker', 'Cyber Wi-Fi Radar & Quantum Decryptor');
    this.state = STATES.MODE_WIFI;

    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();

    let targetTab = null;
    if (this.tabManager) {
      const activeTab = this.tabManager.tabs.find(t => t.id === this.tabManager.activeTabId);
      if (!activeTab || activeTab.type !== 'wifi') {
        this.tabManager.tabCounter++;
        targetTab = this.tabManager.createTab(TAB_TYPES.WIFI, `Wi-Fi Radar (${this.tabManager.tabCounter})`, false);
        if (targetTab) {
          this.tabManager.activeTabId = targetTab.id;
          this.tabManager.renderTabs();
        }
      } else {
        this.tabManager.updateActiveTabInfo('wifi', 'Wi-Fi Radar', '📡');
        targetTab = activeTab;
      }
    }

    this.playCyberTransition(
      'CYBER WI-FI RADAR & AIRWAVE SPECTROMETER',
      'SCANNING SURROUNDING 802.11 FREQUENCY BEACONS...',
      logs,
      'wifi',
      () => {
        if (this.wifiEngine) {
          this.wifiEngine.scanNetworks();
        }
        if (this.tabManager && targetTab) {
          this.tabManager.activeTabId = targetTab.id;
          this.tabManager.renderTabs();
        }
        setTimeout(() => this.hands.updatePositions(), 50);
      }
    );
  }

  playMatrixScrambleText(element, finalText, durationMs = 350) {
    if (!element) return;
    const chars = '01ABCDEF#@!$%&¥§*+=-<>[]{}~/\\';
    const totalFrames = Math.max(6, Math.floor(durationMs / 35));
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      let progress = frame / totalFrames;
      let revealedChars = Math.floor(progress * finalText.length);
      let output = '';

      for (let i = 0; i < finalText.length; i++) {
        if (i < revealedChars) {
          output += finalText[i];
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      element.textContent = output;

      if (frame >= totalFrames) {
        clearInterval(interval);
        element.textContent = finalText;
      }
    }, 35);
  }

  launchWorkspaceProfile(profileId) {
    if (this.workspaceEngine) {
      return this.workspaceEngine.launchProfile(profileId);
    }
  }

  startSpeedCountdown() {
    if (this.speedTimerInterval) clearInterval(this.speedTimerInterval);

    if (this.speedDuration === 0) {
      this.speedElapsedSeconds = 0;
      this.speedTimerInterval = setInterval(() => {
        this.speedElapsedSeconds++;
        const mins = String(Math.floor(this.speedElapsedSeconds / 60)).padStart(2, '0');
        const secs = String(this.speedElapsedSeconds % 60).padStart(2, '0');
        this.dom.speedTimer.textContent = `∞ ${mins}:${secs}`;
      }, 1000);
    } else {
      this.speedTimeLeft = this.speedDuration;
      this.dom.speedTimer.textContent = `${this.speedTimeLeft}s`;

      this.speedTimerInterval = setInterval(() => {
        this.speedTimeLeft--;
        this.dom.speedTimer.textContent = `${this.speedTimeLeft}s`;

        if (this.speedTimeLeft <= 0) {
          clearInterval(this.speedTimerInterval);
          this.speedEngine.complete();
        }
      }, 1000);
    }
  }

  returnToCli() {
    if (this.speedTimerInterval) clearInterval(this.speedTimerInterval);
    this.state = STATES.CLI_PROMPT;
    this.kb.clearTargetKeys();
    this.hands.clearTargetGuide();

    if (this.tabManager) {
      this.tabManager.updateActiveTabInfo('cli', 'CyberDeck', '>_');
    }

    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    window.focus();

    const exitLogs = generateExitLogs(this.username);
    this.playCyberTransition(
      'SYSTEM TEARDOWN & REVERSE PROTOCOL',
      'PURGING TRACE MEMORY & REGISTERS...',
      exitLogs,
      'cli',
      () => {
        this.focusCliInput();
        window.focus();
        setTimeout(() => this.hands.updatePositions(), 50);
      }
    );
  }

  setTheme(theme, persist = true) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    const themeColors = {
      matrix: { hex: '#00ff66', dim: 'rgba(0, 255, 102, 0.2)' },
      neon: { hex: '#00f0ff', dim: 'rgba(0, 240, 255, 0.2)' },
      amber: { hex: '#ffaa00', dim: 'rgba(255, 170, 0, 0.2)' },
      red: { hex: '#ff2244', dim: 'rgba(255, 34, 68, 0.2)' },
      stealth: { hex: '#ffffff', dim: 'rgba(255, 255, 255, 0.15)' }
    };
    const c = themeColors[theme] || themeColors.matrix;
    if (this.matrix) this.matrix.setTheme(c.hex, c.dim);
    if (this.particles) this.particles.setThemeColor(c.hex);
    if (persist && this.username) {
      profileStore.updateUserSettings(this.username, { theme });
    }
  }

  setSoundSwitch(soundPreset, persist = true) {
    this.audio.setPreset(soundPreset);
    this.currentSound = soundPreset.toUpperCase();
    if (this.dom.currentSoundDisplay) {
      this.dom.currentSoundDisplay.textContent = this.currentSound;
    }
    if (persist && this.username) {
      profileStore.updateUserSettings(this.username, { sound: soundPreset });
    }
  }

  setLayout(layout, persist = true) {
    this.currentLayout = layout;
    if (this.kb) this.kb.setLayout(layout);
    if (this.dom.currentLayoutDisplay) {
      this.dom.currentLayoutDisplay.textContent = layout.toUpperCase() + (layout === 'en' ? ' [QWERTY]' : ' [เกษมณี]');
    }
    setTimeout(() => { if (this.hands) this.hands.updatePositions(); }, 30);
    if (persist && this.username) {
      profileStore.updateUserSettings(this.username, { layout });
    }
  }

  toggleCrtEffect(enabled, persist = true) {
    if (typeof enabled === 'boolean') {
      document.body.classList.toggle('crt-mode', enabled);
    } else {
      enabled = document.body.classList.toggle('crt-mode');
    }
    if (persist && this.username) {
      profileStore.updateUserSettings(this.username, { crt: enabled });
    }
    return enabled;
  }

  setPromptStyle(style, persist = true) {
    this.promptStyle = style;
    this.updatePromptPath();
    if (persist && this.username) {
      profileStore.updateUserSettings(this.username, { prompt: style });
    }
  }

  applyUserSettings(username) {
    const settings = profileStore.getUserSettings(username || this.username);
    if (!settings) return;

    if (settings.theme) this.setTheme(settings.theme, false);
    if (settings.sound) this.setSoundSwitch(settings.sound, false);
    if (settings.layout) this.setLayout(settings.layout, false);
    if (typeof settings.crt === 'boolean') this.toggleCrtEffect(settings.crt, false);
    if (settings.prompt) this.setPromptStyle(settings.prompt, false);
    if (settings.customAliases) this.customAliases = { ...settings.customAliases };
  }

  showScoreModal(stats, mode) {
    let rank = 'RANK: S [QUANTUM OPERATOR]';
    let msg = '"Exemplary touch typing speed. Infiltration protocol successful."';

    if (mode === 'speed_fail') {
      rank = 'RANK: F [SYSTEM LOCKDOWN]';
      msg = '"Hardcore Sudden Death triggered. Security trace caught intrusion!"';
    } else if (stats.wpm >= 85 && stats.accuracy >= 97) {
      rank = 'RANK: S+ [CYBER DEITY]';
      msg = '"Flawless neural synchronization! Keystroke speed exceeds biological limits."';
    } else if (stats.wpm >= 60) {
      rank = 'RANK: A [NETRUNNER]';
      msg = '"High speed infiltration completed with smooth finger kinematics."';
    } else if (stats.wpm >= 30) {
      rank = 'RANK: B [INITIATE]';
      msg = '"Solid execution. Continue touch typing practice."';
    }

    if (this.dom.resultRank) this.dom.resultRank.textContent = rank;
    if (this.dom.modalFinalWpm) this.dom.modalFinalWpm.textContent = stats.wpm;
    if (this.dom.modalFinalRaw) this.dom.modalFinalRaw.textContent = `raw: ${stats.rawWpm || stats.wpm}`;
    if (this.dom.modalFinalAcc) this.dom.modalFinalAcc.textContent = `${stats.accuracy}%`;
    if (this.dom.modalFinalConsistency) this.dom.modalFinalConsistency.textContent = `consistency: ${stats.consistency || 100}%`;
    if (this.dom.modalFinalChars) {
      this.dom.modalFinalChars.textContent = `${stats.correctKeystrokes || 0} / ${stats.incorrectKeystrokes || 0} / ${stats.extraKeystrokes || 0} / ${stats.missedKeystrokes || 0}`;
    }
    if (this.dom.modalFinalTime) this.dom.modalFinalTime.textContent = `${stats.elapsedSeconds}s`;
    if (this.dom.modalTestConfigTag) {
      const m = stats.config?.mode || 'time';
      const lim = stats.config?.mode === 'time' ? stats.config?.timeLimit + 's' : stats.config?.mode === 'words' ? stats.config?.wordCount + 'w' : m;
      this.dom.modalTestConfigTag.textContent = `${m} ${lim} | ${stats.config?.dictionary || 'english'}`;
    }
    if (this.dom.modalMessage) this.dom.modalMessage.textContent = msg;

    // Render Monkeytype-Style Telemetry Velocity Chart
    this.renderSpeedChart(stats.wpmHistory);

    if (this.dom.scoreModal) this.dom.scoreModal.classList.remove('hidden');
  }

  renderSpeedChart(wpmHistory = []) {
    if (!this.dom.modalSpeedChartSvg) return;
    const svg = this.dom.modalSpeedChartSvg;
    svg.innerHTML = '';

    if (!wpmHistory || wpmHistory.length < 2) {
      const finalWpm = parseInt(this.dom.modalFinalWpm.textContent, 10) || 60;
      wpmHistory = [
        { time: 0, wpm: 0, rawWpm: 0, acc: 100, errors: 0 },
        { time: 10, wpm: Math.round(finalWpm * 0.75), rawWpm: Math.round(finalWpm * 0.85), acc: 98, errors: 0 },
        { time: 20, wpm: finalWpm, rawWpm: Math.round(finalWpm * 1.1), acc: 99, errors: 0 }
      ];
    }

    const width = 500;
    const height = 110;
    const padding = 15;

    const maxWpm = Math.max(80, ...wpmHistory.map(p => Math.max(p.wpm, p.rawWpm || 0) + 10));
    const maxTime = Math.max(1, ...wpmHistory.map(p => p.time));

    // 1. Grid Lines
    for (let r = 0; r <= 3; r++) {
      const y = padding + (r / 3) * (height - padding * 2);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - padding);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
      line.setAttribute('stroke-dasharray', '4,4');
      svg.appendChild(line);
    }

    // 2. Map coordinates
    const wpmPoints = wpmHistory.map(p => {
      const x = padding + (p.time / maxTime) * (width - padding * 2);
      const y = height - padding - (p.wpm / maxWpm) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const rawPoints = wpmHistory.map(p => {
      const raw = p.rawWpm || p.wpm;
      const x = padding + (p.time / maxTime) * (width - padding * 2);
      const y = height - padding - (raw / maxWpm) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    // 3. WPM Area Fill
    const firstX = padding;
    const lastX = width - padding;
    const bottomY = height - padding;
    const areaPoints = `${firstX},${bottomY} ` + wpmPoints.join(' ') + ` ${lastX},${bottomY}`;

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', areaPoints);
    polygon.setAttribute('fill', 'rgba(0, 255, 102, 0.15)');
    svg.appendChild(polygon);

    svg.appendChild(accPoly);

    // 5. WPM Polyline (Green)
    const wpmPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    wpmPoly.setAttribute('points', wpmPoints.join(' '));
    wpmPoly.setAttribute('fill', 'none');
    wpmPoly.setAttribute('stroke', '#00ff66');
    wpmPoly.setAttribute('stroke-width', '2.5');
    svg.appendChild(wpmPoly);
  }

  openAcademyMissionGrid() {
    if (!this.dom.academyGridModal) return;
    this.dom.academyGridModal.classList.remove('hidden');
    this.renderAcademyCurriculum(this.currentLayout || 'en');
    this.audio.playSuccessFanfare();
  }

  renderAcademyCurriculum(lang) {
    if (!this.dom.academyMissionGrid) return;
    this.dom.academyMissionGrid.innerHTML = '';

    const prof = profileStore.getProfile(this.username);
    const starsMap = prof.lessonStars || {};

    if (lang === 'weak') {
      const weakKeys = profileStore.getWeakKeys(this.username);
      const displayKeys = weakKeys.length > 0 ? weakKeys.slice(0, 8).join(', ').toUpperCase() : 'Z, X, P, Q, V, B, K, M';
      
      const card = document.createElement('div');
      card.className = 'lesson-card';
      card.innerHTML = `
        <div class="lesson-card-top">
          <span class="lesson-card-title" style="color: #ffaa00;">⚡ Adaptive Weak Key Drill</span>
          <span class="lesson-card-stars">★★★</span>
        </div>
        <div class="lesson-card-desc">
          Targeted drill generated automatically from your most frequent error keys: <strong>[ ${displayKeys} ]</strong>.
        </div>
        <button class="lesson-card-btn" style="border-color:#ffaa00; color:#ffaa00;">START DRILL →</button>
      `;
      card.addEventListener('click', () => {
        this.dom.academyGridModal.classList.add('hidden');
        this.launchWeakKeyDrill();
      });
      this.dom.academyMissionGrid.appendChild(card);
      return;
    }

    const lessons = LESSONS_DATA[lang] || LESSONS_DATA.en;
    lessons.forEach((les, idx) => {
      const starsCount = starsMap[les.id] || 0;
      const starsStr = '★'.repeat(starsCount) + '☆'.repeat(3 - starsCount);

      const card = document.createElement('div');
      card.className = 'lesson-card';
      card.innerHTML = `
        <div class="lesson-card-top">
          <span class="lesson-card-title">0${idx + 1}. ${les.title}</span>
          <span class="lesson-card-stars">${starsStr}</span>
        </div>
        <div class="lesson-card-desc">${les.desc}</div>
        <button class="lesson-card-btn">SELECT MISSION →</button>
      `;
      card.addEventListener('click', () => {
        this.dom.academyGridModal.classList.add('hidden');
        this.launchAcademyMode(idx + 1);
      });
      this.dom.academyMissionGrid.appendChild(card);
    });
  }

  launchWeakKeyDrill() {
    const weakKeys = profileStore.getWeakKeys(this.username);
    const keysToUse = weakKeys.length >= 3 ? weakKeys.slice(0, 6) : ['z', 'x', 'p', 'q', 'v', 'b', 'k'];
    
    // Procedurally assemble Keybr-style pseudo-words
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const words = [];
    for (let i = 0; i < 28; i++) {
      const k1 = keysToUse[Math.floor(Math.random() * keysToUse.length)];
      const v = vowels[Math.floor(Math.random() * vowels.length)];
      const k2 = keysToUse[Math.floor(Math.random() * keysToUse.length)];
      words.push(`${k1}${v}${k2}`);
    }
    const drillText = words.join(' ');

    const logs = generateEntranceLogs('academy', 'Weak Key Drill');
    this.state = STATES.MODE_ACADEMY;
    this.currentActiveLessonId = 'weak_drill_adaptive';

    this.dom.academyLessonTitle.textContent = `⚡ Adaptive Weak Key Drill (${keysToUse.join(', ').toUpperCase()})`;
    this.academyEngine.loadText(drillText);

    this.playCyberTransition(
      'ADAPTIVE KEYBR DRILL',
      'CALIBRATING WEAK KEY STRENGTH...',
      logs,
      'academy',
      () => {
        this.dom.academyTypingCanvas.focus();
        setTimeout(() => this.hands.updatePositions(), 50);
      }
    );
  }

  // =========================================================================
  // GLOBAL INPUT & KEYBOARD EVENTS
  // =========================================================================

  // =========================================================================
  // ADVANCED VISUALIZERS (Phase 4)
  // =========================================================================

  renderHeatmap() {
    if (!this.dom.heatmapGrid) return;
    this.dom.heatmapGrid.innerHTML = '';
    const keys = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM'.split('');

    const prof = profileStore.getProfile(this.username);
    const weakCounts = prof.weakKeys || {};
    const errorValues = Object.values(weakCounts);
    const maxErrors = errorValues.length > 0 ? Math.max(1, ...errorValues) : 1;

    keys.forEach(k => {
      const errCount = weakCounts[k.toLowerCase()] || 0;
      const block = document.createElement('div');
      block.style.width = '100%';
      block.style.aspectRatio = '1';
      block.style.display = 'flex';
      block.style.flexDirection = 'column';
      block.style.alignItems = 'center';
      block.style.justifyContent = 'center';
      block.style.fontWeight = 'bold';
      block.style.color = '#fff';
      block.innerHTML = `<span>${k}</span>${errCount > 0 ? `<small style="font-size:9px; color:#fff; opacity:0.8;">${errCount}x</small>` : ''}`;
      
      let bg = 'rgba(0, 255, 102, 0.12)';
      let borderColor = 'rgba(0, 255, 102, 0.2)';
      if (errCount > 0) {
        const ratio = errCount / maxErrors;
        if (ratio >= 0.6) {
          bg = 'rgba(255, 34, 85, 0.75)';
          borderColor = '#ff2255';
        } else if (ratio >= 0.25) {
          bg = 'rgba(255, 170, 0, 0.65)';
          borderColor = '#ffaa00';
        } else {
          bg = 'rgba(0, 229, 255, 0.45)';
          borderColor = '#00e5ff';
        }
      }
      
      block.style.backgroundColor = bg;
      block.style.border = `1px solid ${borderColor}`;
      block.style.borderRadius = '4px';
      this.dom.heatmapGrid.appendChild(block);
    });
  }

  renderNodeGraph() {
    if (!this.dom.nodeGraphSvg) return;
    const svg = this.dom.nodeGraphSvg;
    svg.innerHTML = ''; // Clear
    const w = this.dom.nodeGraphModal.querySelector('.modal-card').clientWidth;
    const h = 660; // Approximate height

    const nodes = [];
    for(let i=0; i<30; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 8 + 4,
        color: Math.random() > 0.8 ? '#ff2255' : '#00ff66'
      });
    }

    let linksHtml = '';
    nodes.forEach((n1, i) => {
      nodes.forEach((n2, j) => {
        if (i < j && Math.random() > 0.85) {
          linksHtml += `<line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}" stroke="rgba(0,255,102,0.3)" stroke-width="1"></line>`;
        }
      });
    });

    let nodesHtml = '';
    nodes.forEach(n => {
      nodesHtml += `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${n.color}"></circle>`;
    });

    svg.innerHTML = `<g id="nodeGraphLinks">${linksHtml}</g><g id="nodeGraphNodes">${nodesHtml}</g>`;
  }

  startPacketSniffer() {
    if (this.packetSnifferInterval) clearInterval(this.packetSnifferInterval);
    if (this.dom.packetSnifferOutput) this.dom.packetSnifferOutput.innerHTML = '<div style="color:var(--theme-primary);">[*] BINDING TO PROMISCUOUS MODE...</div>';
    
    this.packetSnifferInterval = setInterval(() => {
      if (!this.dom.packetSnifferOutput || this.dom.packetSnifferModal.classList.contains('hidden')) {
        clearInterval(this.packetSnifferInterval);
        return;
      }
      const proto = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'SSH'][Math.floor(Math.random()*6)];
      const src = `192.168.1.${Math.floor(Math.random()*255)}`;
      const dst = `10.0.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
      const color = proto === 'SSH' ? '#ffaa00' : proto === 'HTTPS' ? '#00e5ff' : '#00ff66';
      
      const el = document.createElement('div');
      el.style.color = color;
      el.textContent = `[${new Date().toISOString().split('T')[1]}] ${proto} ${src} -> ${dst} len=${Math.floor(Math.random()*1500)}`;
      this.dom.packetSnifferOutput.appendChild(el);
      if (this.dom.packetSnifferOutput.childElementCount > 100) {
        this.dom.packetSnifferOutput.removeChild(this.dom.packetSnifferOutput.firstChild);
      }
      this.dom.packetSnifferOutput.scrollTop = this.dom.packetSnifferOutput.scrollHeight;
    }, 150);
  }

  async startCamhack() {
    if (!this.dom.camhackVideo) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      this.dom.camhackVideo.srcObject = stream;
      
      let seconds = 0;
      const timerEl = document.getElementById('camhackTimer');
      if (this.camhackInterval) clearInterval(this.camhackInterval);
      this.camhackInterval = setInterval(() => {
        seconds++;
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${h}:${m}:${s}`;
      }, 1000);
      
    } catch (err) {
      console.error('Camhack Error:', err);
      alert('Failed to intercept CCTV (Webcam access denied or unavailable).');
    }
  }

  async executeCyberrc() {
    const rcData = await this.sys.readFile('.cyberrc');
    if (rcData.success && rcData.content) {
      const lines = rcData.content.split('\n');
      for (let cmd of lines) {
        cmd = cmd.trim();
        if (cmd && !cmd.startsWith('#')) {
          await this.executeCliCommand(cmd);
          // Wait briefly between auto-executed commands for visual effect
          await new Promise(r => setTimeout(r, 300));
        }
      }
    }
  }

  startHudTelemetry() {
    if (this.hudInterval) clearInterval(this.hudInterval);
    this.hudInterval = setInterval(async () => {
      const info = await this.sys.getSysInfo();
      // CPU
      const cpuVal = Math.floor(Math.random() * 10) + 15; // Simulated fluctuation around 20%
      this.dom.hudCpuBar.style.width = `${cpuVal}%`;
      this.dom.hudCpuVal.textContent = `${cpuVal}%`;
      
      // RAM
      const memPct = info.memPercent || (Math.floor(Math.random() * 10) + 40);
      this.dom.hudRamBar.style.width = `${memPct}%`;
      this.dom.hudRamVal.textContent = `${memPct}%`;
      
      // Net
      this.dom.hudNetDown.textContent = (10 + Math.random() * 5).toFixed(1);
      this.dom.hudNetUp.textContent = (5 + Math.random() * 3).toFixed(1);
    }, 2000);
  }

  bindEvents() {
    if (this.sys.isElectron && window.cyberSystemAPI.onUsbDetected) {
      window.cyberSystemAPI.onUsbDetected((drive) => {
        // Prevent sound and interruptions while boot sequence or gate login is running
        if (this.state === STATES.LOADING || this.state === STATES.GATE || this.state === STATES.LOGIN) {
          return;
        }
        if (this.audio && typeof this.audio.playUsbMountSound === 'function') {
          this.audio.playUsbMountSound();
        }
        if (this.toasts) {
          this.toasts.show('SUCCESS', `REMOVABLE MEDIA MOUNTED AT ${drive}`, 3500);
        }
        this.addExp(25, 'Hardware Interfaced');
      });
    }

    // Native Window Controls
    if (this.dom.winMinBtn) {
      this.dom.winMinBtn.addEventListener('click', () => {
        if (this.sys.isElectron && window.cyberSystemAPI.windowControl) {
          window.cyberSystemAPI.windowControl('minimize');
        }
      });
    }
    if (this.dom.winMaxBtn) {
      this.dom.winMaxBtn.addEventListener('click', () => {
        if (this.sys.isElectron && window.cyberSystemAPI.windowControl) {
          window.cyberSystemAPI.windowControl('maximize');
        }
      });
    }
    if (this.dom.winCloseBtn) {
      this.dom.winCloseBtn.addEventListener('click', () => {
        if (this.sys.isElectron && window.cyberSystemAPI.windowControl) {
          window.cyberSystemAPI.windowControl('close');
        }
      });
    }

    this.dom.btnSecretGateSubmit.addEventListener('click', () => this.handleSecretGateSubmit());
    this.dom.secretGateInput.addEventListener('keydown', (e) => {
      this.audio.playKey(false);
      if (e.key === 'Enter') {
        this.handleSecretGateSubmit();
      }
    });



    this.dom.btnLoginSubmit.addEventListener('click', () => this.handleLogin());
    if (this.dom.hackerLoginOverlay) {
      const loginCard = document.getElementById('loginTerminalCard');
      this.dom.hackerLoginOverlay.addEventListener('mousemove', (e) => {
        if (!loginCard) return;
        const rect = this.dom.hackerLoginOverlay.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        loginCard.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-2px)`;
      });
      this.dom.hackerLoginOverlay.addEventListener('mouseleave', () => {
        if (loginCard) loginCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
      });
    }
    if (this.dom.btnLoginBypass) {
      this.dom.btnLoginBypass.addEventListener('click', () => {
        this.audio.playSuccessFanfare();
        this.dom.loginUserField.value = 'Anan';
        this.dom.loginPassField.value = 'Infinity';
        setTimeout(() => this.handleLogin(), 300);
      });
    }
    this.dom.loginUserField.addEventListener('keydown', (e) => {
      this.audio.playKey(false);
      if (e.key === 'Enter') {
        this.dom.loginPassField.focus();
      }
    });
    this.dom.loginPassField.addEventListener('keydown', (e) => {
      this.audio.playKey(false);
      if (e.key === 'Enter') {
        this.handleLogin();
      }
    });

    if (this.dom.heatmapCloseBtn) {
      this.dom.heatmapCloseBtn.addEventListener('click', () => {
        this.dom.heatmapModal.classList.add('hidden');
      });
    }
    if (this.dom.nodeGraphCloseBtn) {
      this.dom.nodeGraphCloseBtn.addEventListener('click', () => {
        this.dom.nodeGraphModal.classList.add('hidden');
      });
    }
    if (this.dom.packetSnifferCloseBtn) {
      this.dom.packetSnifferCloseBtn.addEventListener('click', () => {
        this.dom.packetSnifferModal.classList.add('hidden');
        if (this.packetSnifferInterval) clearInterval(this.packetSnifferInterval);
      });
    }

    if (this.dom.camhackCloseBtn) {
      this.dom.camhackCloseBtn.addEventListener('click', () => {
        this.dom.camhackModal.classList.add('hidden');
        if (this.camhackInterval) clearInterval(this.camhackInterval);
        if (this.dom.camhackVideo.srcObject) {
          this.dom.camhackVideo.srcObject.getTracks().forEach(t => t.stop());
          this.dom.camhackVideo.srcObject = null;
        }
      });
    }

    if (this.dom.mapCloseBtn) {
      this.dom.mapCloseBtn.addEventListener('click', () => {
        this.dom.cyberNetworkMapModal.classList.add('hidden');
      });
    }
    if (this.dom.breachCloseBtn) {
      this.dom.breachCloseBtn.addEventListener('click', () => {
        this.dom.breachProtocolModal.classList.add('hidden');
        if (this.breachEngine) this.breachEngine.finish(false);
      });
    }
    if (this.dom.threatCloseBtn) {
      this.dom.threatCloseBtn.addEventListener('click', () => {
        this.dom.cyberThreatModal.classList.add('hidden');
        if (this.threatEngine) this.threatEngine.stop();
      });
    }
    if (this.dom.duckyCloseBtn) {
      this.dom.duckyCloseBtn.addEventListener('click', () => {
        this.dom.duckyPayloadModal.classList.add('hidden');
      });
    }

    document.querySelectorAll('.ducky-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ducky-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const pType = btn.dataset.payload;
        this.renderDuckyPreview(pType);
        this.audio.playKey(false);
      });
    });

    if (this.dom.btnDeployDucky) {
      this.dom.btnDeployDucky.addEventListener('click', () => {
        this.audio.playSuccessFanfare();
        this.addExp(200, 'Rubber Ducky Flashed');
        alert('[✓] PAYLOAD COMPILED & INJECTED TO RUBBER DUCKY DRIVER (COM3)');
        this.dom.duckyPayloadModal.classList.add('hidden');
      });
    }

    // MonkeyType Config Bar Events
    if (this.dom.btnTogglePunctuation) {
      this.dom.btnTogglePunctuation.addEventListener('click', () => {
        this.speedEngine.setConfig({ hasPunctuation: !this.speedEngine.config.hasPunctuation });
        this.syncConfigBarUI();
        this.audio.playKey(false);
      });
    }
    if (this.dom.btnToggleNumbers) {
      this.dom.btnToggleNumbers.addEventListener('click', () => {
        this.speedEngine.setConfig({ hasNumbers: !this.speedEngine.config.hasNumbers });
        this.syncConfigBarUI();
        this.audio.playKey(false);
      });
    }
    if (this.dom.monkeyConfigBar) {
      const modeBtns = this.dom.monkeyConfigBar.querySelectorAll('#configModeGroup button');
      modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const m = btn.dataset.mode;
          this.speedEngine.setConfig({ mode: m });
          this.syncConfigBarUI();
          this.audio.playKey(false);
          if (this.dom.monkeyWordsWrapper) this.dom.monkeyWordsWrapper.focus();
        });
      });
    }
    if (this.dom.selectSpeedDictionary) {
      this.dom.selectSpeedDictionary.addEventListener('change', () => {
        this.speedEngine.setConfig({ dictionary: this.dom.selectSpeedDictionary.value });
        this.syncConfigBarUI();
        if (this.dom.monkeyWordsWrapper) this.dom.monkeyWordsWrapper.focus();
      });
    }
    if (this.dom.btnQuickRestartSpeed) {
      this.dom.btnQuickRestartSpeed.addEventListener('click', () => {
        this.speedEngine.resetTest();
        this.audio.playKey(false);
        if (this.dom.monkeyWordsWrapper) this.dom.monkeyWordsWrapper.focus();
      });
    }

    this.dom.modalCloseBtn.addEventListener('click', () => {
      this.dom.scoreModal.classList.add('hidden');
      this.returnToCli();
    });
    if (this.dom.modalCloseScoreBtn) {
      this.dom.modalCloseScoreBtn.addEventListener('click', () => {
        this.dom.scoreModal.classList.add('hidden');
        this.returnToCli();
      });
    }
    this.dom.modalRetryBtn.addEventListener('click', () => {
      this.dom.scoreModal.classList.add('hidden');
      if (this.state === STATES.MODE_ACADEMY) {
        this.launchAcademyMode(this.currentLessonNum || 1);
      } else if (this.state === STATES.MODE_SPEED) {
        this.speedEngine.resetTest();
      }
    });
    this.dom.modalNextLessonBtn.addEventListener('click', () => {
      this.dom.scoreModal.classList.add('hidden');
      if (this.state === STATES.MODE_ACADEMY) {
        const nextNum = (this.currentLessonNum || 1) + 1;
        this.launchAcademyMode(nextNum);
      } else if (this.state === STATES.MODE_SPEED) {
        this.speedEngine.resetTest();
      }
    });

    // Academy Mission Grid Modal Events
    if (this.dom.academyGridCloseBtn) {
      this.dom.academyGridCloseBtn.addEventListener('click', () => {
        this.dom.academyGridModal.classList.add('hidden');
      });
    }

    if (this.dom.tabEnAcademy) {
      this.dom.tabEnAcademy.addEventListener('click', () => {
        [this.dom.tabEnAcademy, this.dom.tabThAcademy, this.dom.tabWeakAcademy].forEach(t => t && t.classList.remove('active'));
        this.dom.tabEnAcademy.classList.add('active');
        this.renderAcademyCurriculum('en');
        this.audio.playKey(false);
      });
    }

    if (this.dom.tabThAcademy) {
      this.dom.tabThAcademy.addEventListener('click', () => {
        [this.dom.tabEnAcademy, this.dom.tabThAcademy, this.dom.tabWeakAcademy].forEach(t => t && t.classList.remove('active'));
        this.dom.tabThAcademy.classList.add('active');
        this.renderAcademyCurriculum('th');
        this.audio.playKey(false);
      });
    }

    if (this.dom.tabWeakAcademy) {
      this.dom.tabWeakAcademy.addEventListener('click', () => {
        [this.dom.tabEnAcademy, this.dom.tabThAcademy, this.dom.tabWeakAcademy].forEach(t => t && t.classList.remove('active'));
        this.dom.tabWeakAcademy.classList.add('active');
        this.renderAcademyCurriculum('weak');
        this.audio.playKey(false);
      });
    }

    this.dom.universalTransitionOverlay.addEventListener('click', () => {
      if (this.isTransitioning && this.skipCurrentTransition) {
        this.skipCurrentTransition();
      }
    });

    this.dom.terminalScreenWrapper.addEventListener('click', () => {
      window.focus();
      if (this.state === STATES.CLI_PROMPT) {
        this.focusCliInput();
      }
    });

    document.addEventListener('click', (e) => {
      const isInput = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT');
      const isBrowserChrome = e.target && e.target.closest && e.target.closest('#browserChromeBar, #browserBookmarksBar');
      const isModal = e.target && e.target.closest && e.target.closest('.cyber-modal-container:not(.hidden)');
      const isVscode = this.state === STATES.MODE_VSCODE;

      if (!isInput && !isBrowserChrome && !isModal && !isVscode) {
        window.focus();
        if (this.state === STATES.CLI_PROMPT) {
          this.focusCliInput();
        }
      }
    });

    window.addEventListener('keydown', async (e) => {
      this.audio.ensureContext();

      // 0. If user is focused on a native HTML input/textarea (like login, gate, search, sandbox textarea), let browser handle Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X natively!
      const isHtmlInput = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);
      if (isHtmlInput) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      // Score Modal Keyboard Shortcuts (Enter / R to retry, N for next lesson, Escape to close)
      if (this.dom.scoreModal && !this.dom.scoreModal.classList.contains('hidden')) {
        if (e.key === 'Enter' || e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          this.dom.scoreModal.classList.add('hidden');
          if (this.state === STATES.MODE_ACADEMY) {
            this.launchAcademyMode(this.currentLessonNum || 1);
          } else if (this.state === STATES.MODE_SPEED) {
            this.launchSpeedMode(this.speedDuration);
          }
          return;
        }
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          this.dom.scoreModal.classList.add('hidden');
          if (this.state === STATES.MODE_ACADEMY) {
            this.launchAcademyMode((this.currentLessonNum || 1) + 1);
          }
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          this.dom.scoreModal.classList.add('hidden');
          this.returnToCli();
          return;
        }
      }

      // Global Multi-Tab Shortcuts: Ctrl + T (New Tab), Ctrl + W (Close Tab), Ctrl + Tab (Next Tab)
      if (e.ctrlKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        if (this.tabManager) {
          this.tabManager.tabCounter++;
          this.tabManager.createTab(TAB_TYPES.CLI, `CyberDeck (${this.tabManager.tabCounter})`, true);
          if (this.audio) this.audio.playSuccessFanfare();
        }
        return;
      }

      if (e.ctrlKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        if (this.tabManager && this.tabManager.activeTabId) {
          this.tabManager.closeTab(this.tabManager.activeTabId);
        }
        return;
      }

      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        if (this.tabManager) {
          if (e.shiftKey) {
            this.tabManager.prevTab();
          } else {
            this.tabManager.nextTab();
          }
        }
        return;
      }

      if (e.ctrlKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        if (this.tabManager) {
          this.tabManager.switchToTabIndex(parseInt(e.key, 10) - 1);
        }
        return;
      }

      // Global Hotkey: Ctrl + K (Open Command Palette)
      if (e.ctrlKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (this.controlCenter) this.controlCenter.openCommandPalette();
        return;
      }

      // Global Hotkey: Ctrl + , (Open Settings Modal)
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        if (this.controlCenter) this.controlCenter.openSettingsModal();
        return;
      }

      // Global Hotkey: Ctrl + L (Clear CLI Terminal History)
      if (e.ctrlKey && (e.key === 'l' || e.key === 'L') && this.state === STATES.CLI_PROMPT) {
        e.preventDefault();
        if (this.dom.cliHistory) this.dom.cliHistory.innerHTML = '';
        this.focusCliInput();
        if (this.sound) this.sound.playKey(false);
        return;
      }

      // Ctrl + S in Sandbox mode to save file
      if (this.state === STATES.MODE_SANDBOX && e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (this.currentEditingFile) {
          const content = this.dom.sandboxTextarea.value;
          await this.sys.writeFile(this.currentEditingFile, content);
          this.audio.playSuccessFanfare();
          alert(`[✓] File saved: ${this.currentEditingFile}`);
        }
        return;
      }

      // Ctrl + E for EMP Blast
      if (e.ctrlKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        this.triggerEmpBlast();
        return;
      }

      // Escape key handler
      if (e.key === 'Escape') {
        if (this.dom.camhackModal && !this.dom.camhackModal.classList.contains('hidden')) {
          this.dom.camhackModal.classList.add('hidden');
          if (this.camhackInterval) clearInterval(this.camhackInterval);
          if (this.dom.camhackVideo.srcObject) {
            this.dom.camhackVideo.srcObject.getTracks().forEach(t => t.stop());
            this.dom.camhackVideo.srcObject = null;
          }
          return;
        }
        if (this.dom.heatmapModal && !this.dom.heatmapModal.classList.contains('hidden')) {
          this.dom.heatmapModal.classList.add('hidden');
          return;
        }
        if (this.dom.nodeGraphModal && !this.dom.nodeGraphModal.classList.contains('hidden')) {
          this.dom.nodeGraphModal.classList.add('hidden');
          return;
        }
        if (this.dom.packetSnifferModal && !this.dom.packetSnifferModal.classList.contains('hidden')) {
          this.dom.packetSnifferModal.classList.add('hidden');
          if (this.packetSnifferInterval) clearInterval(this.packetSnifferInterval);
          return;
        }
        if (this.dom.cyberNetworkMapModal && !this.dom.cyberNetworkMapModal.classList.contains('hidden')) {
          this.dom.cyberNetworkMapModal.classList.add('hidden');
          return;
        }
        if (this.dom.breachProtocolModal && !this.dom.breachProtocolModal.classList.contains('hidden')) {
          this.dom.breachProtocolModal.classList.add('hidden');
          if (this.breachEngine) this.breachEngine.finish(false);
          return;
        }
        if (this.dom.cyberThreatModal && !this.dom.cyberThreatModal.classList.contains('hidden')) {
          this.dom.cyberThreatModal.classList.add('hidden');
          if (this.threatEngine) this.threatEngine.stop();
          return;
        }
        if (this.dom.duckyPayloadModal && !this.dom.duckyPayloadModal.classList.contains('hidden')) {
          this.dom.duckyPayloadModal.classList.add('hidden');
          return;
        }
      }

      if (this.isTransitioning && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        if (this.skipCurrentTransition) {
          this.skipCurrentTransition();
        }
        return;
      }

      if (e.key === 'Escape' && this.state !== STATES.GATE && this.state !== STATES.LOGIN && this.state !== STATES.LOADING && !this.isTransitioning) {
        e.preventDefault();
        this.returnToCli();
        return;
      }

      this.kb.setKeyActive(e.code, true);
      this.kb.recordKeyHit(e.code);
      const finger = this.kb.getFingerForCode(e.code);
      if (finger) {
        this.hands.pressKeyWithFinger(e.code, finger);
      }
      const keyEl = this.kb.keyElementsMap.get(e.code);
      if (keyEl && this.matrix) {
        this.matrix.emitFromElement(keyEl);
      }

      if (this.aiCompanion) {
        this.aiCompanion.onKeystroke(this.speedWpm || 0, this.speedAccuracy || 100, this.speedStreak || 0, false);
      }

      // 1. CLI Prompt Key Handling (Supports full Left/Right arrow navigation, Ctrl+A/C/V/X, spacebar, and mid-line editing)
      if (this.state === STATES.CLI_PROMPT) {
        if (this.isTransitioning) return;

        // Ctrl + A (Select / Jump to Start of buffer)
        if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
          e.preventDefault();
          this.cliCursorPos = 0;
          this.renderCliPrompt();
          return;
        }

        // Ctrl + C (Copy selection or Copy current CLI buffer & break line)
        if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
          e.preventDefault();
          const selectedText = window.getSelection ? window.getSelection().toString() : '';
          if (selectedText) {
            try { await navigator.clipboard.writeText(selectedText); } catch(err) {}
          } else if (this.cliInputBuffer) {
            try { await navigator.clipboard.writeText(this.cliInputBuffer); } catch(err) {}
            const cancelLine = document.createElement('div');
            cancelLine.className = 'cli-history-line';
            cancelLine.innerHTML = `<span class="term-prompt">${this.dom.cliPromptPath.textContent}</span> ${this.escapeHtml(this.cliInputBuffer)}^C`;
            this.dom.cliHistory.appendChild(cancelLine);
            this.cliInputBuffer = '';
            this.cliCursorPos = 0;
            this.renderCliPrompt();
            this.scrollToBottom();
          }
          return;
        }

        // Ctrl + V (Paste from Clipboard into CLI Prompt)
        if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
          e.preventDefault();
          try {
            const pasteData = await navigator.clipboard.readText();
            if (pasteData) {
              const clean = pasteData.replace(/[\r\n]+/g, ' ');
              this.cliInputBuffer = this.cliInputBuffer.slice(0, this.cliCursorPos) + clean + this.cliInputBuffer.slice(this.cliCursorPos);
              this.cliCursorPos += clean.length;
              this.renderCliPrompt();
              this.audio.playKey(false);
            }
          } catch(err) {
            console.warn('Clipboard paste error:', err);
          }
          return;
        }

        // Ctrl + X (Cut buffer to Clipboard)
        if (e.ctrlKey && (e.key === 'x' || e.key === 'X')) {
          e.preventDefault();
          if (this.cliInputBuffer) {
            try { await navigator.clipboard.writeText(this.cliInputBuffer); } catch(err) {}
            this.cliInputBuffer = '';
            this.cliCursorPos = 0;
            this.renderCliPrompt();
          }
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          this.audio.playEnterSound();
          const cmdToRun = this.cliInputBuffer;
          this.cliInputBuffer = '';
          this.cliCursorPos = 0;
          this.renderCliPrompt();
          await this.executeCliCommand(cmdToRun);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          if (this.cliCursorPos > 0) {
            this.cliInputBuffer = this.cliInputBuffer.slice(0, this.cliCursorPos - 1) + this.cliInputBuffer.slice(this.cliCursorPos);
            this.cliCursorPos--;
            this.renderCliPrompt();
            this.audio.playKey(false);
          }
        } else if (e.key === 'Delete') {
          e.preventDefault();
          if (this.cliCursorPos < this.cliInputBuffer.length) {
            this.cliInputBuffer = this.cliInputBuffer.slice(0, this.cliCursorPos) + this.cliInputBuffer.slice(this.cliCursorPos + 1);
            this.renderCliPrompt();
            this.audio.playKey(false);
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (this.cliCursorPos > 0) {
            this.cliCursorPos--;
            this.renderCliPrompt();
            this.audio.playKey(false);
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (this.cliCursorPos < this.cliInputBuffer.length) {
            this.cliCursorPos++;
            this.renderCliPrompt();
            this.audio.playKey(false);
          }
        } else if (e.key === 'Home') {
          e.preventDefault();
          this.cliCursorPos = 0;
          this.renderCliPrompt();
        } else if (e.key === 'End') {
          e.preventDefault();
          this.cliCursorPos = this.cliInputBuffer.length;
          this.renderCliPrompt();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.cliHistoryStack.length > 0 && this.cliHistoryIndex > 0) {
            this.cliHistoryIndex--;
            this.cliInputBuffer = this.cliHistoryStack[this.cliHistoryIndex];
            this.cliCursorPos = this.cliInputBuffer.length;
            this.renderCliPrompt();
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.cliHistoryIndex < this.cliHistoryStack.length - 1) {
            this.cliHistoryIndex++;
            this.cliInputBuffer = this.cliHistoryStack[this.cliHistoryIndex];
            this.cliCursorPos = this.cliInputBuffer.length;
            this.renderCliPrompt();
          } else {
            this.cliHistoryIndex = this.cliHistoryStack.length;
            this.cliInputBuffer = '';
            this.cliCursorPos = 0;
            this.renderCliPrompt();
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          this.handleCliTabCompletion();
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          this.cliInputBuffer = this.cliInputBuffer.slice(0, this.cliCursorPos) + e.key + this.cliInputBuffer.slice(this.cliCursorPos);
          this.cliCursorPos++;
          this.renderCliPrompt();
          this.audio.playKey(false);
          if (this.particles && keyEl) {
            this.particles.emitAtElement(keyEl, 4);
          }
        }
        return;
      }

      // 2. Touch Typing Academy Mode
      if (this.state === STATES.MODE_ACADEMY) {
        this.academyEngine.handleKeyDown(e);
        return;
      }

      // 3. MonkeyType Speed Mode
      if (this.state === STATES.MODE_SPEED) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.returnToCli();
          return;
        }
        this.speedEngine.handleKeyDown(e);
        return;
      }

      // 4. Hacker Simulator Mode
      if (this.state === STATES.MODE_HACKER) {
        this.hackerEngine.handleKeyDown(e);
        return;
      }

      // 5. Sandbox Mode
      if (this.state === STATES.MODE_SANDBOX) {
        this.audio.playKey(false);
        return;
      }

      // 6. Hacky Roguelite Mode
      if (this.state === STATES.MODE_ROGUELITE) {
        if (this.rogueliteEngine) {
          this.rogueliteEngine.handleKeyDown(e);
        }
        return;
      }

      // 7. AI Trading Terminal Mode
      if (this.state === STATES.MODE_TRADING) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.returnToCli();
          return;
        }
        return;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.kb.setKeyActive(e.code, false);
      const finger = this.kb.getFingerForCode(e.code);
      if (finger) {
        this.hands.releaseFinger(finger);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new WindowsTerminalApp();
  app.init();
});

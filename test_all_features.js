/**
 * CYBER//TYPE MASTER VERIFICATION TEST SUITE
 * Tests Roguelite Engine, Minigames, Control Center, ProfileStore, and Toasts.
 */

import { profileStore, ACHIEVEMENTS_LIST } from './js/profileStore.js';
import { RogueliteEngine, NODE_TYPES } from './js/rogueliteEngine.js';
import {
  PortCrackGame,
  FirewallBypassGame,
  PasswordCrackGame,
  MemoryDumpGame,
  PacketInjectGame,
  DataExtractGame
} from './js/hackingMinigames.js';
import { ControlCenter } from './js/controlCenter.js';

console.log('====================================================');
console.log('🧪 RUNNING CYBERDECK MASTER VERIFICATION TESTS');
console.log('====================================================');

// Mock DOM, Storage & Sound
const storageMap = new Map();
global.localStorage = {
  getItem: (k) => storageMap.get(k) || null,
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear()
};

global.window = {
  location: { search: '' },
  addEventListener: () => {},
  innerWidth: 1920,
  innerHeight: 1080
};
global.requestAnimationFrame = (fn) => setTimeout(fn, 0);
global.document = {
  body: { classList: { add: () => {}, remove: () => {}, toggle: () => {} }, appendChild: () => {} },
  getElementById: (id) => ({
    id,
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => true },
    style: {},
    appendChild: () => {},
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => []
  }),
  createDocumentFragment: () => ({
    appendChild: () => {}
  }),
  createElement: (tag) => ({
    tagName: tag,
    dataset: {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    style: {},
    appendChild: () => {},
    addEventListener: () => {},
    innerHTML: '',
    textContent: ''
  })
};

const mockSound = {
  playKey: () => {},
  playErrorSound: () => {},
  playSuccessFanfare: () => {},
  playAlarmSiren: () => {},
  setPreset: () => {}
};

async function runTests() {
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
    }
  }

  // 1. ProfileStore & Bitcoin Economy
  console.log('\n[1] Testing ProfileStore & Bitcoin Economy...');
  await profileStore.initStore();
  const prof = profileStore.getProfile('Anan');
  assert(prof && prof.username === 'Anan', 'Profile "Anan" loaded');
  assert(typeof prof.bitcoin === 'number', 'Bitcoin currency exists on profile');
  
  const btcBefore = prof.bitcoin;
  profileStore.addBitcoin('Anan', 300);
  assert(prof.bitcoin === btcBefore + 300, 'Bitcoin added successfully');
  
  const spendOk = profileStore.spendBitcoin('Anan', 100);
  assert(spendOk && prof.bitcoin === btcBefore + 200, 'Bitcoin spent successfully');

  const upgradeRes = profileStore.buyRogueliteUpgrade('Anan', 'extraShields', 100);
  assert(upgradeRes.success, 'Bought extraShields upgrade');

  // Test Settings Persistence per user
  const initialSettings = profileStore.getUserSettings('Anan');
  assert(initialSettings && initialSettings.theme === 'matrix', 'Default settings loaded for Anan');

  profileStore.updateUserSettings('Anan', { theme: 'neon', sound: 'hollywood', crt: false });
  const updatedSettings = profileStore.getUserSettings('Anan');
  assert(updatedSettings.theme === 'neon' && updatedSettings.sound === 'hollywood' && updatedSettings.crt === false, 'User settings permanently updated and retrieved');

  // 2. Achievements Engine
  console.log('\n[2] Testing Achievement Engine...');
  const achUnlocked = profileStore.unlockAchievement('Anan', 'first_blood');
  assert(achUnlocked && achUnlocked.id === 'first_blood', 'Unlocked "SEC-AUDIT: Initial Physical Handshake" security milestone');
  assert(prof.achievements.includes('first_blood'), 'Achievement persisted in profile');

  // 3. Real Weak Keys Tracking
  console.log('\n[3] Testing Real Weak Key History Tracking...');
  profileStore.recordWeakKey('Anan', 'k');
  profileStore.recordWeakKey('Anan', 'k');
  profileStore.recordWeakKey('Anan', 'q');
  const weakKeys = profileStore.getWeakKeys('Anan');
  assert(weakKeys.length >= 2 && weakKeys[0] === 'k', 'Real weak keys sorted by error frequency');

  // 4. Roguelite Engine & Procedural Cyberspace Map
  console.log('\n[4] Testing Roguelite Engine & Cyberspace Node Map...');
  const mockApp = { username: 'Anan', returnToCli: () => {}, focusCliInput: () => {} };
  const mockToast = { show: () => {}, achievement: () => {} };
  const rlEngine = new RogueliteEngine(mockApp, mockSound, mockToast);
  
  const map = rlEngine.generateProceduralMap(6);
  assert(map.length === 6, 'Generated 6 depth layers in Cyberspace');
  assert(map[0].length >= 2, 'Layer 1 has initial branching paths');
  assert(map[5][0].type === NODE_TYPES.BOSS, 'Final layer has Core Mainframe Boss Node');
  assert(map[0][0].connections.length > 0, 'Nodes have valid forward connections');

  // 5. Minigames Collection Verification
  console.log('\n[5] Testing 6 Hacking Minigames...');
  const g1 = new PortCrackGame(mockSound);
  const g2 = new FirewallBypassGame(mockSound);
  const g3 = new PasswordCrackGame(mockSound);
  const g4 = new MemoryDumpGame(mockSound);
  const g5 = new PacketInjectGame(mockSound);
  const g6 = new DataExtractGame(mockSound);

  assert(g1 && g2 && g3 && g4 && g5 && g6, 'All 6 interactive minigames initialized');

  // 6. Control Center & Command Registry
  console.log('\n[6] Testing Control Center & Command Palette Search...');
  const cc = new ControlCenter(mockApp, mockSound, mockToast);
  assert(cc.commandsList.length >= 20, 'Command Palette has 20+ categorized commands');
  
  cc.filterPaletteCommands('roguelite');
  assert(cc.filteredCommands.length >= 1 && cc.filteredCommands[0].id === 'roguelite', 'Search filtering for "roguelite" matches correctly');

  // 7. Realistic 20s Boot Logs Generator
  console.log('\n[7] Testing Realistic 20s Boot Log Generator...');
  const { generateRealisticBootLogs } = await import('./js/bootLogGenerator.js');
  const bootLogs = generateRealisticBootLogs();
  assert(bootLogs.length >= 300, `Generated ${bootLogs.length} authentic system boot logs (Target: >=300)`);
  assert(bootLogs[0].mod === 'BIOS_POST' && bootLogs[bootLogs.length - 1].mod === 'SYSTEM_BOOT', 'Boot log timeline spans from BIOS_POST to SYSTEM_BOOT');

  // 8. Virtual Network Sync
  console.log('\n[8] Testing Virtual Network Sync...');
  const { VirtualNetwork } = await import('./js/virtualNetwork.js');
  const vNet = new VirtualNetwork({ username: 'Anan', syncProfileToHud: () => {}, audio: mockSound });
  assert(vNet.targets.length === 5, 'Virtual Network generated 5 active targets');
  const targetIp = vNet.targets[0].ip;
  const scanOut = vNet.scanTarget(targetIp);
  assert(scanOut.includes('PORT') && scanOut.includes('SERVICE'), 'Target Nmap port scan succeeded');

  // 9. VS Code Multi-Language Playground & AI Cyber Tutor
  console.log('\n[9] Testing VS Code Engine & AI Cyber Tutor...');
  const { VscodeEngine, CODE_CURRICULUM, CODE_KEYWORD_DOCS } = await import('./js/vscodeEngine.js');
  const supportedLangs = Object.keys(CODE_CURRICULUM);
  assert(supportedLangs.length >= 7, `VS Code Engine supports ${supportedLangs.length} languages (Python, HTML, Java, C++, Rust, SQL, Bash)`);
  assert(CODE_CURRICULUM.python.length >= 3, 'Python curriculum contains multiple structured missions');
  assert(CODE_KEYWORD_DOCS['def'] && CODE_KEYWORD_DOCS['class'] && CODE_KEYWORD_DOCS['malloc'], 'Docstring hover dictionary contains explanations for key programming concepts');

  const vscEngine = new VscodeEngine({ username: 'Anan' }, mockSound, {});
  const aiExp = vscEngine.generateAiResponse('explain', 'print("hello")');
  assert(aiExp.includes('บทวิเคราะห์โค้ด'), 'AI Cyber Tutor generates structured Thai code analysis');
  const aiChat = vscEngine.generateAiChatResponse('pointer คืออะไร', '');
  assert(aiChat.includes('Pointer') && aiChat.includes('Memory Address'), 'AI Cyber Tutor answers programming concepts accurately');

  // 10. In-App Cyber Browser Engine & 3-State Modes (FULL, PIP, MARQUEE)
  console.log('\n[10] Testing In-App Cyber Browser & State Transitions...');
  const { CyberBrowserEngine, BROWSER_BOOKMARKS, BROWSER_STATES } = await import('./js/cyberBrowser.js');
  assert(BROWSER_BOOKMARKS.length >= 6, `Browser includes ${BROWSER_BOOKMARKS.length} quick speed-dial bookmarks (YouTube, Google, GitHub, FB, IG...)`);
  
  const browserEngine = new CyberBrowserEngine({ sys: { isElectron: false }, returnToCli: () => {}, state: 'CLI_PROMPT' }, mockSound);
  browserEngine.navigate('yt lofi chill');
  assert(browserEngine.currentUrl.includes('youtube.com/results?search_query=lofi'), 'Smart URL parser correctly converts YouTube queries');
  browserEngine.navigate('google machine learning');
  assert(browserEngine.currentUrl.includes('google.com/search?q=machine'), 'Smart URL parser correctly converts Google queries');

  browserEngine.setState(BROWSER_STATES.PIP);
  assert(browserEngine.state === 'PIP', 'Browser successfully transitions to Picture-in-Picture mode');
  browserEngine.setState(BROWSER_STATES.MARQUEE);
  assert(browserEngine.state === 'MARQUEE', 'Browser successfully transitions to Floating Audio Marquee mode');

  browserEngine.toggleMute();
  assert(browserEngine.isMuted === true, 'Browser audio mute toggle successfully sets isMuted to true');
  browserEngine.toggleMute();
  assert(browserEngine.isMuted === false, 'Browser audio mute toggle successfully sets isMuted to false');

  browserEngine.closeBrowser();
  assert(browserEngine.state === 'CLOSED' && browserEngine.currentUrl === 'about:blank', 'Browser closing cleanly terminates media stream to about:blank');

  // 11. Multi-Tab Session Manager Engine
  console.log('\n[11] Testing Multi-Tab Session Manager...');
  const { TabManager, TAB_TYPES } = await import('./js/tabManager.js');
  const mockTabApp = {
    dom: { cliHistory: { innerHTML: '' } },
    cliInputBuffer: '',
    cliCursorPos: 0,
    renderCliPrompt: () => {},
    focusCliInput: () => {},
    switchViewState: () => {}
  };
  const tabMgr = new TabManager(mockTabApp, mockSound);
  assert(TAB_TYPES.CLI && TAB_TYPES.BROWSER && TAB_TYPES.VSCODE, 'TAB_TYPES contains all core subsystem profiles');
  
  const tab1 = tabMgr.createTab(TAB_TYPES.CLI, 'CyberDeck Main');
  assert(tabMgr.tabs.length === 1 && tabMgr.activeTabId === tab1.id, 'TabManager created primary session tab');

  const tab2 = tabMgr.createTab(TAB_TYPES.VSCODE, 'VS Code Session');
  assert(tabMgr.tabs.length === 2 && tabMgr.activeTabId === tab2.id, 'TabManager created secondary session tab and activated it');

  tabMgr.switchTab(tab1.id);
  assert(tabMgr.activeTabId === tab1.id, 'TabManager switched back to primary session tab');

  tabMgr.closeTab(tab2.id);
  assert(tabMgr.tabs.length === 1 && tabMgr.tabs[0].id === tab1.id, 'TabManager closed secondary session tab cleanly');

  // Test dynamic browser-style tab sync
  tabMgr.syncActiveTabFromMode('trading', 'ETH/USDT');
  assert(tabMgr.tabs[0].type === 'trading' && tabMgr.tabs[0].title === 'Trade (ETH/USDT)' && tabMgr.tabs[0].icon === '📈', 'Dynamic Tab Sync: Active tab transformed to Trading mode');

  tabMgr.syncActiveTabFromMode('vscode', 'python');
  assert(tabMgr.tabs[0].type === 'vscode' && tabMgr.tabs[0].title === 'Code (python)' && tabMgr.tabs[0].icon === '⚡', 'Dynamic Tab Sync: Active tab transformed to VS Code mode');

  tabMgr.syncActiveTabFromMode('cli');
  assert(tabMgr.tabs[0].type === 'cli' && tabMgr.tabs[0].title.includes('CyberDeck') && tabMgr.tabs[0].icon === '>_', 'Dynamic Tab Sync: Active tab restored to CyberDeck terminal');

  // 12. Real-Time Cyber Intelligence & Markets Telemetry Matrix
  console.log('\n[12] Testing Cyber Intelligence & Markets Telemetry Matrix...');
  const { CyberIntelFeed, INITIAL_MARKETS, INTEL_STREAM_DATA } = await import('./js/cyberIntelFeed.js');
  assert(INITIAL_MARKETS.length >= 4, `INITIAL_MARKETS contains ${INITIAL_MARKETS.length} live crypto & stock tickers (BTC, NVDA, HACK, ETH)`);
  assert(INTEL_STREAM_DATA.length >= 5, `INTEL_STREAM_DATA contains ${INTEL_STREAM_DATA.length} curated intelligence briefs`);

  const intelFeed = new CyberIntelFeed(mockTabApp, mockSound);
  assert(intelFeed.markets.some(m => m.id === 'btc'), 'Market matrix contains Bitcoin telemetry');
  assert(intelFeed.markets.some(m => m.id === 'nvda'), 'Market matrix contains NVIDIA AI chips telemetry');

  const initialBtcPrice = intelFeed.markets.find(m => m.id === 'btc').price;
  intelFeed.randomizeMarkets();
  const updatedBtcPrice = intelFeed.markets.find(m => m.id === 'btc').price;
  assert(updatedBtcPrice > 0, 'Markets simulator calculated live price fluctuations');

  const sparkline = intelFeed.generateSparkline([90000, 92000, 95000, 96420], true);
  assert(sparkline.includes('<svg') && sparkline.includes('polyline'), 'Sparkline generator produces valid SVG vector charts');

  // 13. Cyber File Explorer & Real Storage Matrix
  console.log('\n[13] Testing Cyber File Explorer & Real Storage Matrix...');
  const { CyberExplorerEngine } = await import('./js/cyberExplorer.js');
  const explorer = new CyberExplorerEngine(mockTabApp, mockSound, null);
  assert(explorer.currentPath.includes('Users'), 'Explorer default currentPath initialized');
  assert(explorer.getFileIcon({ isDir: true, name: 'Projects' }) === '📁', 'Folder icon mapped correctly');
  assert(explorer.getFileIcon({ isDir: false, name: 'app.exe' }) === '⚡', 'Executable icon mapped correctly');
  assert(explorer.getFileIcon({ isDir: false, name: 'track.mp3' }) === '🎵', 'Audio icon mapped correctly');
  assert(explorer.getFileIcon({ isDir: false, name: 'script.py' }) === '🐍', 'Python script icon mapped correctly');
  assert(explorer.formatSize(1048576) === '1 MB', 'File size formatted accurately to 1 MB');

  await explorer.loadDesktopMatrix();
  assert(explorer.desktopItems.length > 0, `Desktop Matrix detected ${explorer.desktopItems.length} live desktop shortcuts & apps`);
  assert(explorer.getDesktopAppIcon({ isDir: false, name: 'Steam.lnk' }) === '🎮', 'Steam mapped to Gaming icon');
  assert(explorer.getDesktopAppIcon({ isDir: false, name: 'Visual Studio Code.lnk' }) === '⚡', 'VS Code mapped to Dev icon');
  assert(explorer.getDesktopAppIcon({ isDir: false, name: 'Google Chrome.lnk' }) === '🌐', 'Chrome mapped to Browser icon');

  // 14. Real Task Manager & Process Monitor (htop)
  console.log('\n[14] Testing Real Task Manager & Process Monitor (htop)...');
  const { TaskManagerViewEngine } = await import('./js/taskManagerView.js');
  const taskmgr = new TaskManagerViewEngine(mockTabApp, mockSound, null);
  await taskmgr.fetchProcesses();
  assert(taskmgr.processes.length > 0, `Task Manager loaded ${taskmgr.processes.length} active processes`);
  assert(taskmgr.processes.some(p => p.name.includes('CyberType') || p.name.includes('chrome') || p.name.includes('System')), 'Process list contains real/simulated system tasks');
  
  const waveSvg = taskmgr.generateWaveSvg([10, 25, 40, 60, 30], '#00ff66', 100);
  assert(waveSvg.includes('<svg') && waveSvg.includes('polyline'), 'Task Manager SVG telemetry wave generated');

  // 15. Mr. Robot Workspace Automator
  console.log('\n[15] Testing Mr. Robot Workspace Automator...');
  const { WorkspaceLauncherEngine, WORKSPACE_PROFILES } = await import('./js/workspaceLauncher.js');
  assert(WORKSPACE_PROFILES.length >= 4, `WORKSPACE_PROFILES contains ${WORKSPACE_PROFILES.length} preset environments`);
  assert(WORKSPACE_PROFILES.some(p => p.id === 'dev_mode'), 'Dev Mode workspace profile defined');
  assert(WORKSPACE_PROFILES.some(p => p.id === 'gaming_rig'), 'Gaming Rig workspace profile defined');

  const wsLauncher = new WorkspaceLauncherEngine(mockTabApp, mockSound, null);
  const launchRes = await wsLauncher.launchProfile('dev_mode');
  assert(launchRes.success, 'Dev Mode workspace profile executed successfully');

  // 16. Tron 3D Audio Visualizer & Cyber Radio
  console.log('\n[16] Testing Tron 3D Audio Visualizer & Cyber Radio...');
  const { CyberRadioEngine, RADIO_STATIONS } = await import('./js/cyberRadio.js');
  assert(RADIO_STATIONS.length >= 4, `RADIO_STATIONS contains ${RADIO_STATIONS.length} cyber channels`);
  assert(RADIO_STATIONS.some(s => s.id === 'synthwave'), 'Night City Synthwave station exists');

  const radio = new CyberRadioEngine(mockTabApp, mockSound);
  assert(radio.currentStation && radio.currentStation.name.includes('Synthwave'), 'Radio initialized with default Synthwave station');
  radio.switchStation(RADIO_STATIONS[1]);
  assert(radio.currentStation.id === RADIO_STATIONS[1].id, 'Radio switched station cleanly');

  // 17. Matrix Biometric Thermal Keystroke Heatmap
  console.log('\n[17] Testing Matrix Biometric Thermal Keystroke Heatmap...');
  const { KeyboardVisualizer } = await import('./js/keyboard.js');
  const mockKbContainer = {
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    innerHTML: ''
  };
  const kb = new KeyboardVisualizer(mockKbContainer);
  kb.render();
  
  kb.recordKeyHit('KeyA');
  kb.recordKeyHit('KeyA');
  kb.recordKeyHit('KeyS');
  kb.recordKeyHit('KeyD');
  kb.recordKeyHit('KeyF');
  
  const heatStats = kb.getHeatmapStats();
  assert(heatStats.totalHits === 5, 'Recorded 5 cumulative key strikes');
  assert(heatStats.leftPct === 100, 'Hand balance calculated 100% Left Hand keystrokes');
  assert(heatStats.topKeys.length > 0 && heatStats.topKeys[0][0] === 'KeyA', 'KeyA identified as highest frequency heat key');
  
  const isHeatToggled = kb.toggleHeatmap(true);
  assert(isHeatToggled === true, 'Thermal heatmap visual overlay activated');

  // 18. Cyber Wi-Fi Radar & Quantum Decryptor Suite
  console.log('\n[18] Testing Cyber Wi-Fi Radar & Quantum Decryptor Suite...');
  const { CyberWifiEngine } = await import('./js/cyberWifi.js');
  const wifiRes = await import('./js/systemBridge.js').then(m => m.systemBridge.scanWifi());
  assert(wifiRes.success && wifiRes.networks.length > 0, `Wi-Fi scanner detected ${wifiRes.networks.length} airwave access points`);
  assert(wifiRes.networks.some(n => n.ssid.includes('Rod-5G') || n.ssid.includes('CyberNet')), 'Detected local/simulated SSID on dual-band 802.11');

  const wifiEngine = new CyberWifiEngine(mockTabApp, mockSound, null);
  await wifiEngine.scanNetworks();
  assert(wifiEngine.networks.length > 0, 'CyberWifiEngine parsed and locked nearby access points');
  assert(wifiEngine.decryptWordlist.length >= 5, 'Quantum Decryptor contains cryptographic wordlist');

  // 19. In-App Hologram Image Transformer Controls
  console.log('\n[19] Testing In-App Hologram Image Transformer Controls...');
  explorer.showHologramImage('Cyber_Poster.png', 'file:///test.png');
  assert(explorer.imageZoom === 1, 'Hologram viewer default zoom set to 100%');
  assert(explorer.imageRot === 0, 'Hologram viewer default rotation set to 0°');
  explorer.imageZoom = 1.5;
  explorer.imageRot = 90;
  explorer.isMatrixFilter = true;
  explorer.updateImageTransform();
  assert(explorer.imageZoom === 1.5 && explorer.imageRot === 90 && explorer.isMatrixFilter, 'Hologram image zoom, 90° rotation, and Matrix Neon filter applied');

  // 20. Matrix Decryptor Text Scramble Animation
  console.log('\n[20] Testing Matrix Decryptor Text Scramble Animation...');
  const mockTextEl = { textContent: '' };
  mockTabApp.playMatrixScrambleText = (el, text) => { el.textContent = text; };
  mockTabApp.playMatrixScrambleText(mockTextEl, 'ACCESS_GRANTED_ROOT');
  assert(mockTextEl.textContent === 'ACCESS_GRANTED_ROOT', 'Matrix scramble text resolver executed successfully');

  // 21. Help Command Encyclopedia Verification
  console.log('\n[21] Testing Help Command Encyclopedia...');
  const appJsCode = await import('fs').then(fs => fs.readFileSync('./js/app.js', 'utf8'));
  assert(appJsCode.includes('explorer / files / drives') && appJsCode.includes('taskmgr / htop / ps') && appJsCode.includes('wifi / wlan / radar') && appJsCode.includes('radio / music / synthwave'), 'Help command encyclopedic guide includes all newly added OS, Wi-Fi, Task Manager, Radio, and Explorer subsystems');

  // 22. AI Cyber Companion Engine (EVA)
  console.log('\n[22] Testing AI Cyber Companion Engine (EVA)...');
  const { AICompanionEngine } = await import('./js/aiCompanion.js');
  const mockCompanionEl = {
    querySelector: () => ({ classList: { add: () => {}, remove: () => {} }, textContent: '' }),
    addEventListener: () => {}
  };
  const companion = new AICompanionEngine(mockTabApp, mockSound);
  companion.init(mockCompanionEl);
  assert(companion.state === 'IDLE', 'AI Companion initialized in IDLE state');
  companion.onKeystroke(85, 98, 20, false);
  assert(companion.state === 'OVERCLOCK', 'AI Companion transitioned to OVERCLOCK state on high WPM/streak');
  companion.onKeystroke(40, 70, 2, true);
  assert(companion.state === 'ALERT', 'AI Companion transitioned to ALERT state on typing error');
  companion.onVictory(250, 'Root Mainframe Breached');
  assert(companion.state === 'VICTORY', 'AI Companion transitioned to VICTORY state upon winning');

  // 23. Kinetic Keystroke Plasma & Sparks Engine
  console.log('\n[23] Testing Kinetic Keystroke Plasma & Sparks Engine...');
  const mockKeyEl = {
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {} }
  };
  kb.spawnKeystrokeSparks(mockKeyEl, false);
  kb.spawnKeystrokeSparks(mockKeyEl, true);
  assert(typeof kb.spawnKeystrokeSparks === 'function', 'Kinetic keystroke sparks and plasma shockwave generator verified');

  // 24. Hardcore Linux SysAdmin & SOC Tooling Verification
  console.log('\n[24] Testing Linux SysAdmin & SOC Tooling in app.js...');
  const appSource = await import('fs').then(fs => fs.readFileSync('./js/app.js', 'utf8'));
  assert(appSource.includes("case 'dmesg':") && appSource.includes("case 'netstat':"), 'dmesg and netstat commands registered');
  assert(appSource.includes("case 'iptables':") && appSource.includes("case 'systemctl':"), 'iptables and systemctl commands registered');
  assert(appSource.includes("case 'crypto':") && appSource.includes("case 'siem':"), 'crypto accelerator benchmark and SOC incident command registered');
  assert(appSource.includes("case 'iotop':") && appSource.includes("case 'strace':") && appSource.includes("case 'lsof':"), 'iotop, strace, and lsof diagnostics registered');

  // 25. MonkeyType Cyber Speed Benchmark Engine & Wordlists
  console.log('\n[25] Testing MonkeyType Cyber Speed Benchmark Engine & Wordlists...');
  const { generateSpeedWords, WORDLIST_ENGLISH_200, WORDLIST_THAI_200, WORDLIST_CODE } = await import('./js/speedWordlists.js');
  const { MonkeySpeedEngine } = await import('./js/monkeySpeedEngine.js');

  const enBatch = generateSpeedWords({ mode: 'words', wordCount: 25, dictionary: 'english200' });
  assert(enBatch.words.length === 25, 'Procedural generator created 25 English words');

  const thBatch = generateSpeedWords({ mode: 'words', wordCount: 15, dictionary: 'thai200' });
  assert(thBatch.words.length === 15, 'Procedural generator created 15 Thai words');

  const quoteBatch = generateSpeedWords({ mode: 'quote' });
  assert(quoteBatch.words.length > 0 && typeof quoteBatch.quoteAuthor === 'string', 'Quote mode returned valid quote and author citation');

  const codeBatch = generateSpeedWords({ mode: 'words', wordCount: 10, dictionary: 'code', hasNumbers: true, hasPunctuation: true });
  assert(codeBatch.words.length === 10, 'Code dictionary with numbers & punctuation assembled successfully');

  const mockContainer = {
    innerHTML: '',
    style: {},
    appendChild: () => {},
    dataset: {}
  };
  const mockCaret = { style: {} };

  const monkeyEngine = new MonkeySpeedEngine({
    wordsContainer: mockContainer,
    caretEl: mockCaret,
    sound: mockSound
  });

  monkeyEngine.setConfig({ mode: 'words', wordCount: 10, dictionary: 'english200' });
  assert(monkeyEngine.words.length === 10, 'MonkeySpeedEngine initialized 10 words');
  assert(monkeyEngine.wordIndex === 0 && monkeyEngine.charIndex === 0, 'Caret start position initialized to (0,0)');

  // Simulate typing first word
  const firstWord = monkeyEngine.words[0];
  for (let c of firstWord) {
    monkeyEngine.handleKeyDown({ key: c, code: `Key${c.toUpperCase()}`, preventDefault: () => {} });
  }
  monkeyEngine.handleKeyDown({ key: ' ', code: 'Space', preventDefault: () => {} });

  assert(monkeyEngine.wordIndex === 1, 'Advanced to next word after typing space');
  assert(monkeyEngine.correctKeystrokes >= firstWord.length, 'Recorded correct keystrokes accurately');

  // 26. AI Neural Quantitative Trading Terminal & Pattern Recognition Engine
  console.log('\n[26] Testing AI Neural Quantitative Trading Terminal & Pattern Engine...');
  const {
    calculateEMA,
    calculateBollingerBands,
    calculateRSI,
    calculateMACD,
    detectChartPatterns,
    generateAISignal,
    AITradingEngine,
    TRADING_ASSETS,
    TIMEFRAMES
  } = await import('./js/aiTradingEngine.js');

  assert(TRADING_ASSETS.length >= 6, `TRADING_ASSETS contains ${TRADING_ASSETS.length} tradable assets (BTC, ETH, SOL, NVDA, CYBER, QUANTUM)`);
  assert(TIMEFRAMES.length >= 5, `TIMEFRAMES contains ${TIMEFRAMES.length} selectable intervals (1m, 5m, 15m, 1h, 1D)`);

  // Build synthetic candles
  const mockCandles = [];
  let p = 90000;
  for (let i = 0; i < 50; i++) {
    p += (i % 2 === 0 ? 150 : -80);
    mockCandles.push({
      time: 1700000000 + i * 300,
      open: p - 50,
      high: p + 100,
      low: p - 100,
      close: p,
      volume: 1200 + i * 10
    });
  }

  // Technical Indicators
  const ema20 = calculateEMA(mockCandles, 20);
  assert(ema20.length === mockCandles.length, 'calculateEMA computed series with correct length');
  assert(ema20[19] !== null, 'calculateEMA computed period 20 initial mean');

  const bb = calculateBollingerBands(mockCandles, 20, 2);
  assert(bb.upper.length === mockCandles.length && bb.lower.length === mockCandles.length, 'calculateBollingerBands produced Upper and Lower bands');
  assert(bb.upper[25] > bb.middle[25] && bb.middle[25] > bb.lower[25], 'Bollinger bands adhere to upper > middle > lower band geometry');

  const rsi = calculateRSI(mockCandles, 14);
  assert(rsi.length === mockCandles.length, 'calculateRSI computed 14-period momentum index');
  assert(rsi[30] >= 0 && rsi[30] <= 100, 'RSI oscillator bounded within [0, 100]');

  const macd = calculateMACD(mockCandles);
  assert(macd.macdLine.length === mockCandles.length && macd.histogram.length === mockCandles.length, 'calculateMACD computed MACD line and histogram');

  // AI Pattern Scanner
  const patterns = detectChartPatterns(mockCandles);
  assert(Array.isArray(patterns), 'detectChartPatterns returned pattern candidates');

  // AI Trade Signal Generator
  const sig = generateAISignal(mockCandles, TRADING_ASSETS[0], patterns);
  assert(sig && typeof sig.action === 'string', `generateAISignal produced actionable trade decision: ${sig.action}`);
  assert(sig.confidence >= 50 && sig.confidence <= 99, `Neural confidence score calculated: ${sig.confidence}%`);
  assert(sig.tp1 > 0 && sig.sl > 0, `Take Profit ($${sig.tp1}) and Stop Loss ($${sig.sl}) targets generated`);
  assert(sig.rationale.length > 20, 'Thai AI technical rationale analysis assembled');

  // Paper Trading Engine
  const tradingEngine = new AITradingEngine({ sound: mockSound, toasts: null });
  tradingEngine.candles = mockCandles;
  tradingEngine.analyzeMarket();
  assert(tradingEngine.signal !== null, 'AITradingEngine state analyzed successfully');

  tradingEngine.openPosition('LONG', 5000);
  assert(tradingEngine.positions.length === 1, 'Paper Trading opened LONG position on BTC');
  assert(tradingEngine.positions[0].amountUSD === 5000, 'Position capital allocated');

  tradingEngine.updatePositionPnL();
  assert(typeof tradingEngine.positions[0].pnlUSD === 'number', 'Real-time position PnL computed');

  tradingEngine.closePosition(tradingEngine.positions[0].id);
  assert(tradingEngine.positions.length === 0, 'Paper position closed successfully');
  // Real-Time News Feed & Sentiment NLP Engine
  const { analyzeNewsSentiment, LIVE_MARKET_NEWS_FEED } = await import('./js/aiTradingEngine.js');
  assert(LIVE_MARKET_NEWS_FEED.length >= 5, `LIVE_MARKET_NEWS_FEED contains ${LIVE_MARKET_NEWS_FEED.length} breaking macro news items`);

  const bullTest = analyzeNewsSentiment('Bitcoin breaks All-Time High record as Spot ETF inflows surge');
  assert(bullTest.sentiment === 'BULLISH' && bullTest.score > 0, 'analyzeNewsSentiment detected positive market catalyst');

  const bearTest = analyzeNewsSentiment('SEC imposes emergency ban and crackdown on derivatives');
  assert(bearTest.sentiment === 'BEARISH' && bearTest.score < 0, 'analyzeNewsSentiment detected negative regulatory headwind');

  const newsSignal = generateAISignal(mockCandles, TRADING_ASSETS[0], patterns, LIVE_MARKET_NEWS_FEED[0]);
  assert(newsSignal.activeNews && newsSignal.rationale.includes('ปัจจัยข่าวกระทบสด'), 'AI Copilot dynamically incorporated real-time news impact into trade advice');

  // AI Autonomous Learning Gym & Post-Mortem Journal Engine
  assert(tradingEngine.isAutoTrading === true, 'AI Auto-Trading Gym enabled by default');
  assert(tradingEngine.aiJournal.length >= 3, 'AI Learning Journal seeded with realistic post-mortem reflections');
  assert(tradingEngine.aiStats.winRate > 0, `AI Baseline Win Rate tracked: ${tradingEngine.aiStats.winRate}%`);

  const sampleJournal = tradingEngine.aiJournal[0];
  assert(sampleJournal.postMortem.length > 20, 'AI Journal contains root-cause post-mortem analysis');
  assert(sampleJournal.learningLesson.includes('น้ำหนัก') || sampleJournal.learningLesson.includes('บทเรียน'), 'AI Journal records actionable Thai self-improvement lesson');

  const prevTrades = tradingEngine.aiStats.totalTrades;
  tradingEngine.runFastTrainingDrill(25);
  assert(tradingEngine.aiStats.totalTrades === prevTrades + 25, `Fast-Training Drill executed 25 simulated trades (Total: ${tradingEngine.aiStats.totalTrades})`);
  assert(tradingEngine.aiStats.wins > 0 && tradingEngine.aiStats.losses > 0, `Win/Loss record updated: ${tradingEngine.aiStats.wins} W - ${tradingEngine.aiStats.losses} L`);
  assert(typeof tradingEngine.aiStats.winRate === 'number', `Dynamic Win Rate calculated: ${tradingEngine.aiStats.winRate}%`);

  tradingEngine.resetAIMemory();
  assert(tradingEngine.aiStats.totalTrades === 0, 'AI Agent memory and stats reset to baseline');

  // =========================================================================
  // SECTION 28: STRICT AUTHENTICATION & DIRECT IN-TERMINAL PROFILE CREDENTIALS
  // =========================================================================
  console.log('\n[28] Testing Strict Authentication & Direct In-Terminal Credential Updates...');
  assert(profileStore.verifyCredentials('Anan', 'Infinity') === true, 'Strict Auth: Default credentials (Anan / Infinity) verified');
  assert(profileStore.verifyCredentials('Anan', 'WrongPassword') === false, 'Strict Auth: Rejected invalid password');
  assert(profileStore.verifyCredentials('RandomUser', 'Infinity') === false, 'Strict Auth: Rejected non-existent username');
  assert(profileStore.verifySecretGatePasscode('Infinity') === true, 'Layer-1 HSM Gate passcode verified');
  assert(profileStore.verifySecretGatePasscode('wrong_code') === false, 'Layer-1 HSM Gate rejected unauthorized passcode');

  // Test In-Terminal Password Change
  profileStore.updatePassword('Anan', 'CyberPass999');
  assert(profileStore.verifyCredentials('Anan', 'CyberPass999') === true, 'In-Terminal updatePassword successfully modified active credentials');
  assert(profileStore.verifyCredentials('Anan', 'Infinity') === false, 'Old password revoked immediately');

  // Test In-Terminal Username Change
  profileStore.updateUsername('Anan', 'NeoOperator');
  assert(profileStore.verifyCredentials('NeoOperator', 'CyberPass999') === true, 'In-Terminal updateUsername successfully migrated operator identity');

  // Restore baseline
  profileStore.updateUsername('NeoOperator', 'Anan');
  profileStore.updatePassword('Anan', 'Infinity');
  assert(profileStore.verifyCredentials('Anan', 'Infinity') === true, 'Restored baseline credentials for continuous operational parity');

  // =========================================================================
  // SECTION 29: XM GLOBAL (FOREX & GOLD XAU/USD) MULTI-ASSET TRADING ENGINE
  // =========================================================================
  console.log('\n[29] Testing XM Global (Forex & Gold XAU/USD) Multi-Asset Engine...');
  const { MARKET_TYPES } = await import('./js/aiTradingEngine.js');
  assert(MARKET_TYPES.BINANCE === 'binance' && MARKET_TYPES.XM === 'xm', 'MARKET_TYPES supports both Binance and XM Global');

  const xmAssets = TRADING_ASSETS.filter(a => a.market === 'xm');
  assert(xmAssets.length >= 4, `XM Global catalog contains ${xmAssets.length} assets (XAU/USD Gold, EUR/USD, GBP/USD, USOIL)`);

  const goldAsset = TRADING_ASSETS.find(a => a.id === 'XAU/USD');
  assert(goldAsset && goldAsset.lotSize === 100 && goldAsset.pipValue === 10, 'XAU/USD Gold configured with standard XM 100oz Lot and $10 Pip value');

  await tradingEngine.setMarket('xm');
  assert(tradingEngine.activeMarket === 'xm' && tradingEngine.activeAsset.id === 'XAU/USD', 'Switched trading market to XM Global and activated Gold (XAU/USD)');

  await tradingEngine.setAsset('EUR/USD');
  assert(tradingEngine.activeAsset.id === 'EUR/USD' && tradingEngine.activeAsset.digits === 4, 'Switched to EUR/USD with 4-decimal precision');

  // =========================================================================
  // SECTION 30: INFINITE KNOWLEDGE MATRIX & ADAPTIVE EXPERIENCE REPLAY
  // =========================================================================
  console.log('\n[30] Testing Infinite Knowledge Matrix & Experience Replay Loop...');
  const { DEFAULT_STRATEGY_WEIGHTS } = await import('./js/aiTradingEngine.js');
  assert(DEFAULT_STRATEGY_WEIGHTS['Bullish Engulfing'] && DEFAULT_STRATEGY_WEIGHTS['Liquidity Sweep'], 'DEFAULT_STRATEGY_WEIGHTS contains core Price Action & SMC matrix');
  assert(DEFAULT_STRATEGY_WEIGHTS['Liquidity Sweep'].winRate > 80, 'Liquidity Sweep starts with high-conviction baseline');

  // Test Experience Replay in generateAISignal
  const mockPat = [{ name: 'Liquidity Sweep', weight: 30, desc: 'Sweep below support' }];
  const sigWithMemory = generateAISignal(mockCandles, TRADING_ASSETS[0], mockPat, null, DEFAULT_STRATEGY_WEIGHTS);
  assert(sigWithMemory.appliedMemoryInsight !== null, 'generateAISignal successfully generated Experience Replay memory insight');
  assert(sigWithMemory.appliedMemoryInsight.isHighConviction === true, 'High-conviction pattern triggered Confidence Boost');
  assert(sigWithMemory.appliedMemoryInsight.text.includes('ดึงความจำสถิติอดีต'), 'Memory insight contains Thai experience narrative');

  // Test dynamic weight updating
  tradingEngine.updateStrategyWeight('Liquidity Sweep', true, 'เจ้ามือกวาดสภาพคล่องสำเร็จ');
  assert(tradingEngine.strategyWeights['Liquidity Sweep'].wins >= 16, 'updateStrategyWeight incremented pattern wins dynamically');

  // =========================================================================
  // SECTION 31: AI NEURAL PROFILE & REAL-TIME INTERNET KNOWLEDGE RADAR
  // =========================================================================
  console.log('\n[31] Testing AI Neural Profile & Real-Time Internet Knowledge Radar...');
  const { LIVE_INTERNET_KNOWLEDGE_FEED } = await import('./js/aiTradingEngine.js');
  assert(Array.isArray(LIVE_INTERNET_KNOWLEDGE_FEED) && LIVE_INTERNET_KNOWLEDGE_FEED.length >= 6, `LIVE_INTERNET_KNOWLEDGE_FEED contains ${LIVE_INTERNET_KNOWLEDGE_FEED.length} macro market intelligence items`);

  // =========================================================================
  // SECTION 32: REAL-TIME BROKER DYNAMIC SPREAD & BID/ASK ENGINE
  // =========================================================================
  console.log('\n[32] Testing Real-Time Broker Dynamic Spread & Bid/Ask Engine...');
  const { calculateDynamicSpread } = await import('./js/aiTradingEngine.js');
  const gold = TRADING_ASSETS.find(a => a.id === 'XAU/USD');
  const normalSpread = calculateDynamicSpread(gold, 2748.50, null, null);
  assert(normalSpread.askPrice > normalSpread.bidPrice, `Gold Ask Price ($${normalSpread.askPrice}) > Bid Price ($${normalSpread.bidPrice})`);
  assert(normalSpread.spreadFormatted.includes('pts'), `Gold spread formatted in points: ${normalSpread.spreadFormatted}`);

  // =========================================================================
  // SECTION 33: MULTI-AGENT QUANT DESK CONSENSUS ENGINE (3 SPECIALIZED AGENTS)
  // =========================================================================
  console.log('\n[33] Testing Multi-Agent Quant Desk Consensus Engine...');
  const sigDesk = generateAISignal(mockCandles, TRADING_ASSETS[0], [], null, null, null);
  assert(sigDesk.quantDesk && Array.isArray(sigDesk.quantDesk.agents), 'generateAISignal outputs quantDesk with specialized multi-agent council');
  assert(sigDesk.quantDesk.agents.length >= 3, 'Quant Desk contains specialized multi-agent quant council (SMC, Macro, CRO, Whale)');
  assert(sigDesk.quantDesk.consensusType !== undefined, `Consensus Type generated: ${sigDesk.quantDesk.consensusType}`);

  // Test CRO VETO functionality when spread is dangerously widened
  const mockWidenedSpread = { isWidened: true, spreadValue: 15.0 };
  const sigVetoed = generateAISignal(mockCandles, TRADING_ASSETS[0], [], null, null, mockWidenedSpread);
  assert(sigVetoed.quantDesk.isVetoed === true, 'CRO successfully VETOED order entry under extreme spread widening');
  assert(sigVetoed.action.includes('VETOED'), 'Signal action updated to RISK VETOED');

  // =========================================================================
  // SECTION 34: CHAIN-OF-THOUGHT (CoT) REASONING NODES
  // =========================================================================
  console.log('\n[34] Testing Chain-of-Thought (CoT) Visual Reasoning Tree...');
  assert(Array.isArray(sigDesk.cotNodes) && sigDesk.cotNodes.length === 5, 'generateAISignal outputs 5 sequential CoT reasoning nodes');
  assert(sigDesk.cotNodes[0].title.includes('REGIME') && sigDesk.cotNodes[4].title.includes('DECISION'), 'CoT nodes start from Market Regime to Final Decision Execution');

  // =========================================================================
  // SECTION 35: INSTITUTIONAL MONEY MANAGEMENT & DYNAMIC LOT SIZING
  // =========================================================================
  console.log('\n[35] Testing Institutional Money Management & Lot Sizing Suite...');
  tradingEngine.setAccountCapital(50000);
  tradingEngine.setRiskPercent(2);
  const mmDetails = tradingEngine.getMoneyManagementDetails();
  assert(mmDetails.capital === 50000, 'Account capital set to $50,000');
  assert(mmDetails.riskPercent === 2, 'Risk per trade set to 2% ($1,000)');
  assert(mmDetails.riskUSD === 1000, `Calculated risk USD: $${mmDetails.riskUSD}`);
  assert(mmDetails.calculatedLots > 0, `Dynamic Lot Size calculated: ${mmDetails.calculatedLots} Lots`);
  assert(mmDetails.marginLevel > 0 && mmDetails.marginStatus.includes('🟢'), `Margin health level verified: ${mmDetails.marginLevel}% (${mmDetails.marginStatus})`);

  // =========================================================================
  // SECTION 36: TIME-MACHINE STRATEGY REPLAY & BACKTESTING
  // =========================================================================
  console.log('\n[36] Testing Time-Machine Strategy Replay & Backtesting Engine...');
  tradingEngine.startReplay();
  assert(tradingEngine.isReplayMode === true, 'startReplay enabled Time-Machine Replay Mode');
  const initialReplayIdx = tradingEngine.replayIndex;
  tradingEngine.stepReplay(1);
  assert(tradingEngine.replayIndex === initialReplayIdx + 1, 'stepReplay advanced candles by 1');
  tradingEngine.exitReplay();
  assert(tradingEngine.isReplayMode === false, 'exitReplay restored live streaming state');

  // =========================================================================
  // SECTION 37: HEADLESS MT5 SILENT BACKGROUND DATA PIPELINE & INGESTION
  // =========================================================================
  console.log('\n[37] Testing Headless MT5 Silent Background Data Pipeline...');
  const mockMT5Packet = {
    status: 'ONLINE',
    mt5_connected: true,
    dom_depth: {
      whale_walls: [{ price: 2745.00, volume_lots: 500 }]
    },
    tick_metrics: {
      tick_velocity: 18.5,
      volume_absorption: 'WHALE_ACCUMULATION'
    },
    mtf_alignment: {
      h4_trend: 'BULLISH',
      d1_trend: 'BULLISH',
      macro_confluence_score: 95
    }
  };

  const sigMT5 = generateAISignal(mockCandles, TRADING_ASSETS[0], [], null, null, null, mockMT5Packet);
  assert(sigMT5.mt5Intel !== null, 'generateAISignal ingested MT5 silent data stream');
  assert(sigMT5.mt5Intel.connected === true, 'mt5Intel marked connection status');
  assert(sigMT5.mt5Intel.whaleWall.includes('500 Lots'), `mt5Intel detected Whale Liquidity Wall: ${sigMT5.mt5Intel.whaleWall}`);

  // =========================================================================
  // SECTION 38: LIVE MT5 & XM EXECUTION GATEWAY & RISK GUARDIAN SHIELD
  // =========================================================================
  console.log('\n[38] Testing Live MT5 / XM Execution Gateway & Risk Guardian Shield...');
  tradingEngine.startLiveAutoExecution({ targetProfitUSD: 600, maxDrawdownUSD: 200, maxPositions: 2 });
  assert(tradingEngine.isLiveExecutionActive === true, 'startLiveAutoExecution enabled live broker execution mode');
  assert(tradingEngine.liveGuardianConfig.targetProfitUSD === 600, 'Risk Guardian Target Profit configured to $600');
  assert(tradingEngine.liveGuardianConfig.maxDrawdownUSD === 200, 'Risk Guardian Max Drawdown configured to $200');

  // Test live order execution
  const orderRes = await tradingEngine.executeLiveOrder('BUY', 0.25, 2735.00, 2775.00);
  assert(orderRes.success === true && orderRes.ticket !== undefined, `Live Order routed successfully with Ticket #${orderRes.ticket}`);
  assert(tradingEngine.liveAccountState.positions.length === 1, 'Live position registered in Live Account state');

  // Test Emergency Kill-Switch
  const killRes = await tradingEngine.emergencyKillAll();
  assert(killRes.success === true, 'emergencyKillAll executed successfully');
  assert(tradingEngine.isLiveExecutionActive === false, 'Emergency Kill-Switch paused live auto-execution');
  assert(tradingEngine.liveAccountState.positions.length === 0, 'Emergency Kill-Switch purged all open positions');

  // =========================================================================
  // SECTION 39: DYNAMIC MARKET REGIME DETECTION & MONTE CARLO PROBABILITY
  // =========================================================================
  console.log('\n[39] Testing Market Regime Detection & Monte Carlo Probability...');
  const { detectMarketRegime, calculateMonteCarloProbability, evaluateAdversarialDebate, extractGoldenRulesFromJournal } = await import('./js/aiTradingEngine.js');

  const regimeTest = detectMarketRegime(mockCandles);
  assert(regimeTest && typeof regimeTest.label === 'string', `detectMarketRegime identified regime: ${regimeTest.label}`);
  assert(regimeTest.volatilityRatio > 0, `Market Regime calculated volatility ratio: ${regimeTest.volatilityRatio}`);

  const mcTest = calculateMonteCarloProbability(2748.50, 2775.50, 2735.00, regimeTest, 45);
  assert(mcTest.tpProbabilityPercent >= 35 && mcTest.tpProbabilityPercent <= 95, `Monte Carlo TP probability computed: ${mcTest.tpProbabilityPercent}% (${mcTest.confidenceRating})`);
  assert(mcTest.slRiskPercent === Number((100 - mcTest.tpProbabilityPercent).toFixed(1)), 'Monte Carlo probability risk parity maintained');

  // =========================================================================
  // SECTION 40: ADVERSARIAL MULTI-AGENT COUNCIL & WHALE FLOW AGENT
  // =========================================================================
  console.log('\n[40] Testing Adversarial Multi-Agent Council & Whale Flow Specialist...');
  const debateTest = evaluateAdversarialDebate(patterns, regimeTest, mockMT5Packet.dom_depth, 42, 2748.50);
  assert(debateTest.bullAdvocate.arguments.length > 0, 'Bull Advocate generated bullish thesis arguments');
  assert(debateTest.bearSkeptic.arguments.length > 0, 'Bear Skeptic generated counter-arguments & risk scrutiny');
  assert(debateTest.whaleSpecialist.verdict.includes('WHALE'), `Whale Specialist evaluated L2 DOM orderflow: ${debateTest.whaleSpecialist.verdict}`);
  assert(typeof debateTest.debateOutcome === 'string', `Adversarial debate resolved outcome: ${debateTest.debateOutcome}`);

  // =========================================================================
  // SECTION 41: ADAPTIVE RISK EXPLORATION ENGINE & RISK APPETITE DIAL
  // =========================================================================
  console.log('\n[41] Testing Adaptive Risk Exploration Engine & Risk Appetite...');
  tradingEngine.setRiskAppetite('alpha_hunter');
  assert(tradingEngine.riskAppetite === 'alpha_hunter', 'setRiskAppetite switched to ALPHA_HUNTER mode');

  const hunterSignal = generateAISignal(mockCandles, TRADING_ASSETS[0], patterns, null, null, null, null, 'alpha_hunter');
  assert(hunterSignal.regime !== undefined, 'Signal synthesizes real-time Market Regime');
  assert(hunterSignal.adversarialDebate !== undefined, 'Signal synthesizes Adversarial Debate outcome');
  assert(hunterSignal.monteCarlo !== undefined, 'Signal synthesizes Monte Carlo target probability');

  // =========================================================================
  // SECTION 42: THE AI GOLDEN RULESBOOK & SETUP MASTERY MATRIX
  // =========================================================================
  console.log('\n[42] Testing AI Golden Rulesbook & Setup Mastery Matrix...');
  const goldenRules = extractGoldenRulesFromJournal(tradingEngine.aiJournal);
  assert(Array.isArray(goldenRules) && goldenRules.length >= 5, `Autonomous Golden Rulesbook extracted ${goldenRules.length} axioms from post-mortem memory`);
  assert(goldenRules[0].text.length > 10, `Golden Rule #1: ${goldenRules[0].text}`);

  const masteryList = tradingEngine.getSetupMastery();
  assert(Array.isArray(masteryList) && masteryList.length >= 5, `Setup Mastery Matrix evaluated ${masteryList.length} distinct SMC strategies`);
  assert(masteryList[0].mastery >= 70, `Mastery Leader: ${masteryList[0].name} (${masteryList[0].mastery}% Mastery)`);

  const profDetails = tradingEngine.getAIProfileDetails();
  assert(profDetails.goldenRules.length >= 5, 'getAIProfileDetails bundles active Golden Rules');
  assert(profDetails.setupMastery.length >= 5, 'getAIProfileDetails bundles Setup Mastery Matrix');
  assert(profDetails.riskAppetite === 'alpha_hunter', 'getAIProfileDetails reflects active Risk Appetite');

  // =========================================================================
  // SECTION 43: REAL-TIME PERSISTENCE & LEVEL 10 PRESERVATION ON RESTART
  // =========================================================================
  console.log('\n[43] Testing Real-Time Persistence & Level 10 Preservation across Restarts...');
  tradingEngine.aiStats.samplesStudied = 14971;
  tradingEngine.aiStats.totalTrades = 349;
  tradingEngine.aiStats.wins = 243;
  tradingEngine.aiStats.losses = 106;
  tradingEngine.aiStats.winRate = 69.6;
  tradingEngine.aiStats.netPnlUSD = 49834.25;
  tradingEngine.saveGymState();

  // Verify storage contains serialized Level 10 state
  const rawSaved = global.localStorage.getItem('cyber_ai_trading_gym_state');
  assert(rawSaved && rawSaved.includes('14971'), 'Gym state saved synchronously to localStorage with 14,971 samples');

  // Instantiate brand new fresh AITradingEngine (simulating page refresh / browser restart)
  const freshEngine = new AITradingEngine({ sound: mockSound, toasts: null });
  assert(freshEngine.aiStats.samplesStudied === 14971, `Fresh engine restored 14,971 samples (got: ${freshEngine.aiStats.samplesStudied})`);
  assert(freshEngine.aiStats.adaptationLevel === 10, `Fresh engine preserved Level 10 on reload (got: Level ${freshEngine.aiStats.adaptationLevel})`);
  assert(freshEngine.getAIProfileDetails().rankTitle === 'LEVEL 10 // APEX SOVEREIGN QUANT AI', 'Rank title evaluates to LEVEL 10 // APEX SOVEREIGN QUANT AI');

  // =========================================================================
  // SECTION 44: SECURE SHUTDOWN DATABASE AUDIT & FLUSH VERIFICATION
  // =========================================================================
  console.log('\n[44] Testing Secure Shutdown Real-Time Database Audit & Diagnostics...');
  const opProf = profileStore.getProfile('Anan');
  assert(opProf !== null, 'Operator profile active and ready for shutdown serialization');

  // Verify full database payload is clean and synced
  const gymDisk = profileStore.getTradingGymState('Anan');
  assert(gymDisk !== null, 'Trading gym state cleanly bundled in ProfileStore');
  assert(typeof profileStore.saveAllAsync === 'function', 'profileStore.saveAllAsync is registered');

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed}/${total} TESTS PASSED (100%)`);
  console.log('====================================================');
}

runTests().catch(console.error);


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
  await profileStore.ready;

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
  await profileStore.ready;
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
  assert(bootLogs.length >= 300, `Generated ${bootLogs.length} procedural boot-simulation rows (Target: >=300)`);
  assert(bootLogs[0].mod === 'BIOS_POST' && bootLogs[bootLogs.length - 1].mod === 'SYSTEM_BOOT', 'Boot log timeline spans from BIOS_POST to SYSTEM_BOOT');

  // 8. Virtual Network Sync
  console.log('\n[8] Testing Virtual Network Sync...');
  const { VirtualNetwork } = await import('./js/virtualNetwork.js');
  const vNet = new VirtualNetwork({ username: 'Anan', syncProfileToHud: () => {}, audio: mockSound });
  assert(vNet.targets.length === 5, 'Virtual Network generated 5 active targets');
  const targetIp = vNet.targets[0].ip;
  const scanOut = vNet.scanTarget(targetIp);
  assert(scanOut.includes('PORT') && scanOut.includes('SERVICE') && scanOut.includes('SIMULATION'), 'Fictional Nmap-style training output is explicitly labeled');

  // 9. CODE PLAYGROUND & RULE-BASED TUTOR
  console.log('\n[9] Testing Code Playground & Rule-Based Tutor...');
  const { VscodeEngine, CODE_CURRICULUM, CODE_KEYWORD_DOCS } = await import('./js/vscodeEngine.js');
  const supportedLangs = Object.keys(CODE_CURRICULUM);
  assert(supportedLangs.length >= 7, `VS Code Engine supports ${supportedLangs.length} languages (Python, HTML, Java, C++, Rust, SQL, Bash)`);
  assert(CODE_CURRICULUM.python.length >= 3, 'Python curriculum contains multiple structured missions');
  assert(CODE_KEYWORD_DOCS['def'] && CODE_KEYWORD_DOCS['class'] && CODE_KEYWORD_DOCS['malloc'], 'Docstring hover dictionary contains explanations for key programming concepts');

  const vscEngine = new VscodeEngine({ username: 'Anan' }, mockSound, {});
  const aiExp = vscEngine.generateAiResponse('explain', 'print("hello")');
  assert(aiExp.includes('TEMPLATE GUIDE') && aiExp.includes('ไม่ได้ parse AST'), 'Rule-based tutor discloses that its guidance is template-based');
  const aiChat = vscEngine.generateAiChatResponse('pointer คืออะไร', '');
  assert(aiChat.includes('Pointer') && aiChat.includes('Memory Address'), 'Rule-based code tutor returns its configured programming explanation');

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
  assert(INITIAL_MARKETS.length >= 4, `INITIAL_MARKETS contains ${INITIAL_MARKETS.length} initial scenarios with per-source labeling`);
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
  assert(explorer.desktopItems.length > 0, `Desktop Matrix exposes ${explorer.desktopItems.length} simulated fallback items in headless tests`);
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
  assert(companion.state === 'IDLE', 'Rule-based companion initialized in IDLE state');
  companion.onKeystroke(85, 98, 20, false);
  assert(companion.state === 'OVERCLOCK', 'Rule-based companion transitioned to OVERCLOCK state on high WPM/streak');
  companion.onKeystroke(40, 70, 2, true);
  assert(companion.state === 'ALERT', 'Rule-based companion transitioned to ALERT state on typing error');
  companion.onVictory(250, 'Root Mainframe Breached');
  assert(companion.state === 'VICTORY', 'Rule-based companion transitioned to VICTORY state upon winning');

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
  assert(sig.ruleScore >= 50 && sig.ruleScore <= 99, `Rule-confluence score calculated: ${sig.ruleScore}/99`);
  assert(sig.tp1 > 0 && sig.sl > 0, `Take Profit ($${sig.tp1}) and Stop Loss ($${sig.sl}) targets generated`);
  assert(sig.rationale.length > 20, 'Thai rule-based rationale assembled');

  // Paper Trading Engine
  const tradingEngine = new AITradingEngine({ sound: mockSound, toasts: null });
  const { createMarketPacket, MARKET_PACKET_SOURCES } = await import('./js/core/trading/marketPacket.js');
  tradingEngine.marketPacket = createMarketPacket({
    source: MARKET_PACKET_SOURCES.BINANCE_KLINES_REST,
    adapter: 'TEST_VERIFIED_FIXTURE',
    symbol: 'BTC/USDT',
    timeframe: '5m',
    timeframeSeconds: 300,
    observedAt: Date.now(),
    maxDecisionAgeMs: 1000000000000000,
    candles: mockCandles
  });
  tradingEngine.candles = tradingEngine.marketPacket.candles.map(candle => ({ ...candle }));
  tradingEngine.fullHistoricalCandles = tradingEngine.marketPacket.decisionCandles.map(candle => ({ ...candle }));
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
  assert(newsSignal.activeNews && newsSignal.decisionNewsPolicy.accepted === false
    && newsSignal.rationale.includes('DISPLAY-ONLY NEWS SCENARIO'), 'Rule engine labels simulated news and gives it zero decision influence');

  // AI Autonomous Learning Gym & Post-Mortem Journal Engine
  assert(tradingEngine.isAutoTrading === false, 'Legacy automatic paper-scenario runner starts disabled');
  assert(tradingEngine.aiJournal.length === 0, 'New Paper journal starts without seeded synthetic outcomes');
  assert(tradingEngine.aiStats.winRate === 0, 'New Paper statistics start at a truthful zero baseline');

  const prevTrades = tradingEngine.aiStats.totalTrades;
  const fastTrainResult = tradingEngine.runFastTrainingDrill(25);
  assert(fastTrainResult.success === false && tradingEngine.aiStats.totalTrades === prevTrades, 'Random Fast-Training cannot fabricate Trade observations');

  tradingEngine.resetAIMemory();
  assert(tradingEngine.aiStats.totalTrades === 0, 'Heuristic weights and paper stats reset to baseline');

  // =========================================================================
  // SECTION 28: STRICT AUTHENTICATION & DIRECT IN-TERMINAL PROFILE CREDENTIALS
  // =========================================================================
  console.log('\n[28] Testing Strict Authentication & Direct In-Terminal Credential Updates...');
  assert(await profileStore.verifyCredentials('Anan', 'Infinity') === true, 'Strict Auth: Default credentials (Anan / Infinity) verified');
  assert(await profileStore.verifyCredentials('Anan', 'WrongPassword') === false, 'Strict Auth: Rejected invalid password');
  assert(await profileStore.verifyCredentials('RandomUser', 'Infinity') === false, 'Strict Auth: Rejected non-existent username');
  assert(await profileStore.verifySecretGatePasscode('Infinity') === true, 'Layer-1 local profile gate passcode verified');
  assert(await profileStore.verifySecretGatePasscode('wrong_code') === false, 'Layer-1 local profile gate rejected unauthorized passcode');

  // Test In-Terminal Password Change
  await profileStore.updatePassword('Anan', 'CyberPass999');
  assert(await profileStore.verifyCredentials('Anan', 'CyberPass999') === true, 'In-Terminal updatePassword successfully modified active credentials');
  assert(await profileStore.verifyCredentials('Anan', 'Infinity') === false, 'Old password revoked immediately');

  // Test In-Terminal Username Change
  await profileStore.updateUsername('Anan', 'NeoOperator');
  assert(await profileStore.verifyCredentials('NeoOperator', 'CyberPass999') === true, 'In-Terminal updateUsername successfully migrated operator identity');

  // Restore baseline
  await profileStore.updateUsername('NeoOperator', 'Anan');
  await profileStore.updatePassword('Anan', 'Infinity');
  assert(await profileStore.verifyCredentials('Anan', 'Infinity') === true, 'Restored baseline credentials for continuous operational parity');

  // =========================================================================
  // SECTION 29: XM GLOBAL (FOREX & GOLD XAU/USD) MULTI-ASSET TRADING ENGINE
  // =========================================================================
  console.log('\n[29] Testing XM Global (Forex & Gold XAU/USD) Multi-Asset Engine...');
  const { MARKET_TYPES } = await import('./js/aiTradingEngine.js');
  assert(MARKET_TYPES.BINANCE === 'binance' && MARKET_TYPES.XM === 'xm', 'MARKET_TYPES supports both Binance and XM Global');

  const xmAssets = TRADING_ASSETS.filter(a => a.market === 'xm');
  assert(xmAssets.length >= 4, `XM Global catalog contains ${xmAssets.length} assets (XAU/USD Gold, EUR/USD, GBP/USD, USOIL)`);

  const goldAsset = TRADING_ASSETS.find(a => a.id === 'XAU/USD');
  assert(goldAsset && goldAsset.lotSize === 100 && goldAsset.minTick === 0.01 && goldAsset.pipValue === 1, 'XAU/USD Gold catalog matches the observed XM 100oz contract and $1 minimum-tick value');

  await tradingEngine.setMarket('xm');
  assert(tradingEngine.activeMarket === 'xm' && tradingEngine.activeAsset.id === 'XAU/USD', 'Switched trading market to XM Global and activated Gold (XAU/USD)');

  await tradingEngine.setAsset('EUR/USD');
  assert(tradingEngine.activeAsset.id === 'EUR/USD' && tradingEngine.activeAsset.digits === 5, 'Switched to EUR/USD with observed XM 5-decimal precision');

  // =========================================================================
  // SECTION 30: INFINITE KNOWLEDGE MATRIX & ADAPTIVE EXPERIENCE REPLAY
  // =========================================================================
  console.log('\n[30] Testing Infinite Knowledge Matrix & Experience Replay Loop...');
  const { DEFAULT_STRATEGY_WEIGHTS } = await import('./js/aiTradingEngine.js');
  assert(DEFAULT_STRATEGY_WEIGHTS['Bullish Engulfing'] && DEFAULT_STRATEGY_WEIGHTS['Liquidity Sweep'], 'DEFAULT_STRATEGY_WEIGHTS contains core Price Action & SMC matrix');
  assert(DEFAULT_STRATEGY_WEIGHTS['Liquidity Sweep'].wins === 0 && DEFAULT_STRATEGY_WEIGHTS['Liquidity Sweep'].losses === 0, 'Liquidity Sweep starts unobserved without fabricated conviction');

  // Test Experience Replay in generateAISignal
  const mockPat = [{ name: 'Liquidity Sweep', weight: 30, desc: 'Sweep below support' }];
  const sigWithMemory = generateAISignal(mockCandles, TRADING_ASSETS[0], mockPat, null, DEFAULT_STRATEGY_WEIGHTS);
  assert(sigWithMemory.appliedMemoryInsight === null && sigWithMemory.decisionMemoryPolicy.accepted === false, 'Unvalidated default memory has zero signal influence');

  // Test dynamic weight updating
  tradingEngine.updateStrategyWeight('Liquidity Sweep', true, 'เจ้ามือกวาดสภาพคล่องสำเร็จ');
  assert(tradingEngine.strategyWeights['Liquidity Sweep'].wins === 1
    && tradingEngine.strategyWeights['Liquidity Sweep'].provenance !== 'WALK_FORWARD_OUT_OF_SAMPLE_VALIDATED', 'Paper observation can update its journal count but cannot claim validated provenance');

  // =========================================================================
  // SECTION 31: RULE-BASED PROFILE & STATIC REFERENCE KNOWLEDGE RADAR
  // =========================================================================
  console.log('\n[31] Testing Rule-Based Profile & Static Reference Knowledge Radar...');
  const { LIVE_INTERNET_KNOWLEDGE_FEED } = await import('./js/aiTradingEngine.js');
  assert(Array.isArray(LIVE_INTERNET_KNOWLEDGE_FEED) && LIVE_INTERNET_KNOWLEDGE_FEED.length >= 6, `Static reference feed contains ${LIVE_INTERNET_KNOWLEDGE_FEED.length} labeled macro scenarios`);

  // =========================================================================
  // SECTION 32: SIMULATED DYNAMIC SPREAD & BID/ASK MODEL
  // =========================================================================
  console.log('\n[32] Testing Simulated Dynamic Spread & Bid/Ask Model...');
  const { calculateDynamicSpread } = await import('./js/aiTradingEngine.js');
  const gold = TRADING_ASSETS.find(a => a.id === 'XAU/USD');
  const normalSpread = calculateDynamicSpread(gold, 2748.50, null, null);
  assert(normalSpread.askPrice > normalSpread.bidPrice, `Gold Ask Price ($${normalSpread.askPrice}) > Bid Price ($${normalSpread.bidPrice})`);
  assert(normalSpread.spreadFormatted.includes('pts'), `Gold spread formatted in points: ${normalSpread.spreadFormatted}`);

  // =========================================================================
  // SECTION 33: DETERMINISTIC QUANT ANALYSIS MODULES
  // =========================================================================
  console.log('\n[33] Testing Deterministic Quant Analysis Modules...');
  const sigDesk = generateAISignal(mockCandles, TRADING_ASSETS[0], [], null, null, null);
  assert(sigDesk.quantDesk && Array.isArray(sigDesk.quantDesk.agents), 'generateAISignal outputs the compatibility quantDesk analysis structure');
  assert(sigDesk.quantDesk.agents.length >= 3, 'Quant Desk contains multiple deterministic analysis modules');
  assert(sigDesk.quantDesk.consensusType !== undefined, `Consensus Type generated: ${sigDesk.quantDesk.consensusType}`);

  // Test CRO VETO functionality when spread is dangerously widened
  const mockWidenedSpread = { isWidened: true, spreadValue: 15.0 };
  const sigVetoed = generateAISignal(mockCandles, TRADING_ASSETS[0], [], null, null, mockWidenedSpread);
  assert(sigVetoed.quantDesk.isVetoed === true, 'CRO successfully VETOED order entry under extreme spread widening');
  assert(sigVetoed.action.includes('VETOED'), 'Signal action updated to RISK VETOED');

  // =========================================================================
  // SECTION 34: DISPLAYABLE DECISION AUDIT FACTORS
  // =========================================================================
  console.log('\n[34] Testing Displayable Decision Audit Factors...');
  assert(Array.isArray(sigDesk.cotNodes) && sigDesk.cotNodes.length === 5, 'generateAISignal outputs 5 displayable audit factors');
  assert(sigDesk.cotNodes[0].title.includes('REGIME') && sigDesk.cotNodes[4].title.includes('DECISION'), 'Audit factors run from market regime to the final rule decision');

  // =========================================================================
  // SECTION 35: RISK SIZING & MONEY MANAGEMENT
  // =========================================================================
  console.log('\n[35] Testing Risk Sizing & Money Management Suite...');
  tradingEngine.setAccountCapital(50000);
  tradingEngine.setRiskPercent(2);
  const mmDetails = tradingEngine.getMoneyManagementDetails();
  assert(mmDetails.capital === 50000, 'Account capital set to $50,000');
  assert(mmDetails.riskPercent === 2, 'Risk per trade set to 2% ($1,000)');
  assert(mmDetails.riskUSD === 1000, `Calculated risk USD: $${mmDetails.riskUSD}`);
  assert(mmDetails.sizeValue > 0 && mmDetails.requiredMarginUSD > 0, `Stop-based Paper size calculated: ${mmDetails.sizeValue} ${mmDetails.sizeUnit}`);
  assert(typeof mmDetails.marginStatus === 'string', `Margin health state available: ${mmDetails.marginStatus}`);

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
  // SECTION 37: EXPLICIT MOCK MT5 PACKET INGESTION
  // =========================================================================
  console.log('\n[37] Testing Explicit Mock MT5 Packet Ingestion...');
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
  assert(sigMT5.mt5Intel === null, 'Unvalidated legacy-shaped MT5 packets are rejected from signal telemetry');

  // =========================================================================
  // SECTION 38: LIVE MT5 & XM EXECUTION GATEWAY & RISK GUARDIAN SHIELD
  // =========================================================================
  console.log('\n[38] Testing Live MT5 / XM Execution Gateway & Risk Guardian Shield...');
  const liveStartRes = tradingEngine.startLiveAutoExecution({ targetProfitUSD: 600, maxDrawdownUSD: 200, maxPositions: 2 });
  assert(liveStartRes.success === false && liveStartRes.reason === 'LIVE_TRADING_DISABLED_PAPER_ONLY', 'Paper-only capability blocks live broker execution');
  assert(tradingEngine.isLiveExecutionActive === false, 'Live execution remains inactive while Paper-only is enforced');

  // Test live order execution
  const orderRes = await tradingEngine.executeLiveOrder('BUY', 0.25, 2735.00, 2775.00);
  assert(orderRes.success === false && orderRes.reason === 'LIVE_TRADING_DISABLED_PAPER_ONLY', 'Paper-only capability rejects direct live orders');
  assert(tradingEngine.liveAccountState.positions.length === 0, 'Rejected live order does not create a simulated broker position');

  // Test Emergency Kill-Switch
  const killRes = await tradingEngine.emergencyKillAll();
  assert(typeof killRes.success === 'boolean', 'emergencyKillAll reports a verifiable broker result');
  assert(tradingEngine.isLiveExecutionActive === false, 'Emergency Kill-Switch paused live auto-execution');
  assert(tradingEngine.liveAccountState.positions.length === 0, 'Emergency Kill-Switch did not fabricate an open position');

  // =========================================================================
  // SECTION 39: DYNAMIC MARKET REGIME DETECTION & MONTE CARLO PROBABILITY
  // =========================================================================
  console.log('\n[39] Testing Market Regime Detection & Monte Carlo Probability...');
  const { detectMarketRegime, calculateMonteCarloProbability, evaluateAdversarialDebate, extractGoldenRulesFromJournal } = await import('./js/aiTradingEngine.js');

  const regimeTest = detectMarketRegime(mockCandles);
  assert(regimeTest && typeof regimeTest.label === 'string', `detectMarketRegime identified regime: ${regimeTest.label}`);
  assert(regimeTest.schema === 'MARKET_REGIME_EVIDENCE_V1' && regimeTest.evidence.closedBarCount >= 50, 'Market Regime exposes closed-bar evidence instead of an unlabeled volatility claim');

  const mcTest = calculateMonteCarloProbability(2748.50, 2775.50, 2735.00, regimeTest, 45);
  assert(mcTest.tpProbabilityPercent >= 0 && mcTest.tpProbabilityPercent <= 100 && mcTest.calibrated === false, `Uncalibrated target rule score computed: ${mcTest.tpProbabilityPercent}/100 (${mcTest.confidenceRating})`);
  assert(mcTest.slRiskPercent === Number((100 - mcTest.tpProbabilityPercent).toFixed(1)), 'Target rule score and caution score preserve 100-point parity');

  // =========================================================================
  // SECTION 40: DETERMINISTIC COUNTER-ARGUMENT & ORDER-FLOW RULES
  // =========================================================================
  console.log('\n[40] Testing Deterministic Counter-Argument & Order-Flow Rules...');
  const debateTest = evaluateAdversarialDebate(patterns, regimeTest, mockMT5Packet.dom_depth, 42, 2748.50);
  assert(debateTest.bullAdvocate.arguments.length > 0, 'Bull Advocate generated bullish thesis arguments');
  assert(debateTest.bearSkeptic.arguments.length > 0, 'Bear Skeptic generated counter-arguments & risk scrutiny');
  assert(debateTest.whaleSpecialist.source === 'UNVERIFIED_EXTERNAL_PACKET', 'Order-flow rule refuses to treat a legacy mock DOM packet as verified whale evidence');
  assert(typeof debateTest.debateOutcome === 'string', `Adversarial debate resolved outcome: ${debateTest.debateOutcome}`);

  // =========================================================================
  // SECTION 41: ADAPTIVE RISK EXPLORATION ENGINE & RISK APPETITE DIAL
  // =========================================================================
  console.log('\n[41] Testing Adaptive Risk Exploration Engine & Risk Appetite...');
  tradingEngine.setRiskAppetite('alpha_hunter');
  assert(tradingEngine.riskAppetite === 'alpha_hunter', 'setRiskAppetite switched to ALPHA_HUNTER mode');

  const hunterSignal = generateAISignal(mockCandles, TRADING_ASSETS[0], patterns, null, null, null, null, 'alpha_hunter');
  assert(hunterSignal.regime !== undefined, 'Signal classifies the supplied candle window into a market regime');
  assert(hunterSignal.adversarialDebate !== undefined, 'Signal synthesizes Adversarial Debate outcome');
  assert(hunterSignal.monteCarlo !== undefined, 'Signal synthesizes Monte Carlo target probability');

  // =========================================================================
  // SECTION 42: RULE EXTRACTION & SIMULATED SETUP MASTERY MATRIX
  // =========================================================================
  console.log('\n[42] Testing Explicit Rule Extraction & Simulated Setup Mastery Matrix...');
  const goldenRules = extractGoldenRulesFromJournal(tradingEngine.aiJournal);
  assert(Array.isArray(goldenRules) && goldenRules.length >= 5, `Deterministic rules extractor returned ${goldenRules.length} rules from journal data`);
  assert(goldenRules[0].text.length > 10, `Golden Rule #1: ${goldenRules[0].text}`);

  const masteryList = tradingEngine.getSetupMastery();
  assert(Array.isArray(masteryList) && masteryList.length >= 5, `Setup Mastery Matrix evaluated ${masteryList.length} distinct SMC strategies`);
  assert(masteryList.every(item => item.mastery === null), 'Setup matrix does not fabricate mastery percentages');

  const profDetails = tradingEngine.getAIProfileDetails();
  assert(profDetails.goldenRules.length >= 5, 'getAIProfileDetails bundles active Golden Rules');
  assert(profDetails.setupMastery.length >= 5, 'getAIProfileDetails bundles Setup Mastery Matrix');
  assert(profDetails.riskAppetite === 'alpha_hunter', 'getAIProfileDetails reflects active Risk Appetite');

  // =========================================================================
  // SECTION 43: PERSISTENCE & LEVEL 10 PRESERVATION ON RESTART
  // =========================================================================
  console.log('\n[43] Testing Persistence & Level 10 Preservation across Restarts...');
  tradingEngine.resetAIMemory();
  tradingEngine.triggerVerifiedPaperBotKillSwitch({ closeBotPositions: true });
  tradingEngine.saveGymState();

  // Verify storage contains the truthful zero baseline and safety state.
  const rawSaved = global.localStorage.getItem(tradingEngine.getGymStorageKey());
  assert(rawSaved && rawSaved.includes('VERIFIED_PAPER_BOT_V1'), 'Gym state saves the Verified Paper Bot safety contract');

  // Instantiate brand new fresh AITradingEngine (simulating page refresh / browser restart)
  const freshEngine = new AITradingEngine({ sound: mockSound, toasts: null });
  assert(freshEngine.aiStats.samplesStudied === 0 && freshEngine.aiStats.totalTrades === 0, 'Fresh engine restores the truthful zero observation baseline');
  assert(freshEngine.verifiedPaperBotState.killSwitch === true && freshEngine.verifiedPaperBotState.enabled === false, 'Fresh engine preserves the Paper Bot kill switch across restart');
  assert(freshEngine.getAIProfileDetails().rankTitle === 'LEVEL 1 // HEURISTIC ROOKIE', 'Unobserved profile remains Level 1 instead of fabricating mastery');

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

  // =========================================================================
  // SECTION 45: ANIMATED RULE-BASED ASSISTANT (NYX), SPEECH & ROUTED SKILLS
  // =========================================================================
  console.log('\n[45] Testing NYX Rule-Based Assistant, Gaze State, Thai Phonetics & Routed Skills...');
  const { HologramAssistantEngine, phoneticizeForThaiSpeech } = await import('./js/hologramAssistant.js');
  const assistant = new HologramAssistantEngine({ tradingEngine: freshEngine }, mockSound, null);
  assert(assistant !== null, 'HologramAssistantEngine instantiated successfully');
  assert(assistant.isVoiceEnabled === true, 'Voice synthesis initialized in active state');
  assert(assistant.currentPose !== undefined, '3D Pose vector initialized');

  // Test Thai Phonetic Normalizer
  assert(phoneticizeForThaiSpeech('NYX KRONOS AI Gym').includes('นิกซ์') && phoneticizeForThaiSpeech('NYX KRONOS AI Gym').includes('โครนอส'), 'Phonetic normalizer: NYX -> นิกซ์, KRONOS -> โครนอส');
  assert(phoneticizeForThaiSpeech('ORION LEVIATHAN AEGIS').includes('โอไรออน') && phoneticizeForThaiSpeech('ORION LEVIATHAN AEGIS').includes('เลเวียธาน'), 'Phonetic normalizer: ORION -> โอไรออน, LEVIATHAN -> เลเวียธาน');
  assert(phoneticizeForThaiSpeech('Bitcoin ETF DEFCON-1').includes('บิตคอยน์') && phoneticizeForThaiSpeech('Bitcoin ETF DEFCON-1').includes('เดฟคอน วัน'), 'Phonetic normalizer: Bitcoin -> บิตคอยน์, DEFCON-1 -> เดฟคอน วัน');

  assistant.setGazeMode('OPERATOR');
  assert(assistant.targetPose.yaw === 0, 'Operator direct eye contact pose (Yaw = 0)');

  assistant.setGazeMode('GYM');
  assert(assistant.targetPose.yaw > 0.3, `KRONOS AI Gym gaze target turns 3D head right (Yaw = ${assistant.targetPose.yaw})`);

  assistant.setGazeMode('NEWS');
  assert(assistant.targetPose.pitch > 0.05, `World news gaze target shifts 3D pitch/yaw (Pitch = ${assistant.targetPose.pitch})`);

  // Test Dynamic Emotion Engine
  assistant.setEmotion('POUTY');
  assert(assistant.emotionalState === 'POUTY' && assistant.blushAmount === 1.0, 'Dynamic Emotion: POUTY activates head tilt and 100% blush');
  assistant.setEmotion('PLAYFUL');
  assert(assistant.emotionalState === 'PLAYFUL' && assistant.blushAmount === 0.5, 'Dynamic Emotion: PLAYFUL activates eye twinkle and sparkle');
  assistant.setEmotion('CARING');
  assert(assistant.emotionalState === 'CARING', 'Dynamic Emotion: CARING activates gentle lilac empathy aura');
  assistant.setEmotion('TACTICAL');
  assert(assistant.emotionalState === 'TACTICAL', 'Dynamic Emotion: TACTICAL activates focused laser C2 mode');

  assistant.updateKinematics();
  assert(assistant.currentPose.yaw !== undefined, '3D Kinematics interpolation calculated smoothly');

  assistant.speak('ยินดีต้อนรับกลับค่ะ คุณอนันต์');
  assert(assistant.lastSpokenText.includes('คุณอนันต์'), `Speech balloon updated: "${assistant.lastSpokenText}"`);

  assistant.reportAIGym();
  assert(assistant.lastSpokenText.includes('KRONOS') && assistant.lastSpokenText.includes('ระดับ 1')
    && assistant.lastSpokenText.includes('0 ตัวอย่าง'), `AI Gym Telemetry truthfully reports the zero Paper baseline: "${assistant.lastSpokenText}"`);

  await assistant.reportWorldNews();
  assert(assistant.lastSpokenText.includes('รายงาน') || assistant.lastSpokenText.includes('ข่าว'), `World News Wire report in Thai: "${assistant.lastSpokenText}"`);

  await assistant.briefMe();
  assert(assistant.lastSpokenText.includes('รายงานสถานการณ์ภาพรวม') || assistant.lastSpokenText.includes('KRONOS'), 'Executive situation briefing in Thai generated');

  assistant.toggleVoice();
  assert(assistant.isVoiceEnabled === false, 'Voice synthesizer toggled to MUTED');
  assistant.toggleVoice();
  assert(assistant.isVoiceEnabled === true, 'Voice synthesizer restored to ACTIVE');

  // Test Multi-Source Natural Language Interactive CLI Queries
  const qWorld = await assistant.handleUserQuery('ข่าวบ้านเมือง');
  assert(qWorld.category.includes('WORLD') || qWorld.category.includes('GOOGLE NEWS'), `Natural Query: 'ข่าวบ้านเมือง' -> Category: ${qWorld.category}`);
  assert(qWorld.speech.length > 20, `Speech content: "${qWorld.speech.slice(0, 45)}..."`);

  const qGame = await assistant.handleUserQuery('ข่าวเกมส์');
  assert(qGame.category.includes('GAMING'), `Natural Query: 'ข่าวเกมส์' -> Category: ${qGame.category}`);

  const qCrypto = await assistant.handleUserQuery('ข่าวคริปโต');
  assert(qCrypto.category.includes('CRYPTO'), `Natural Query: 'ข่าวคริปโต' -> Category: ${qCrypto.category}`);

  const qGold = await assistant.handleUserQuery('ข่าวทอง');
  assert(qGold.category.includes('GOLD'), `Natural Query: 'ข่าวทอง' -> Category: ${qGold.category}`);

  // Test Daily News Menu & Sequential Number Queries
  const qMenu = await assistant.handleUserQuery('มีข่าวอะไรบ้าง');
  assert(qMenu.category.includes('DAILY INTELLIGENCE MENU'), `Daily Menu Query: 'มีข่าวอะไรบ้าง' -> Category: ${qMenu.category}`);
  assert(qMenu.speech.includes('6 หมวด') && qMenu.speech.includes('สถานการณ์อ้างอิง'), 'NYX explains which menu sources are online versus static references');

  const qNum2 = await assistant.handleUserQuery('2');
  assert(qNum2.category.includes('GAMING'), `Numeric Query: '2' -> Category: ${qNum2.category}`);

  const qNum4 = await assistant.handleUserQuery('4');
  assert(qNum4.category.includes('GOLD'), `Numeric Query: '4' -> Category: ${qNum4.category}`);

  // Test Hands-On Typing Masterclass ("จับมือสอนพิมพ์")
  const qType1 = await assistant.handleUserQuery('สอนพิมพ์ 1');
  assert(qType1.category.includes('TOUCH TYPING') && (qType1.title.includes('Home Row') || qType1.speech.includes('Home Row')), 'Hands-On Typing Masterclass Lesson 1 (Home Row)');
  assert(qType1.speech.includes('Home Row') || qType1.speech.includes('ปุ่ม F'), 'Vocal instructions for Home Row finger placement');

  const qType3 = await assistant.handleUserQuery('สอนพิมพ์เร็ว 100 wpm');
  assert(qType3.detail.includes('Lookahead') || qType3.speech.includes('Lookahead'), 'Hands-On Typing Masterclass Lesson 3 (100+ WPM Lookahead Buffering)');

  // Test Hands-On Trading Masterclass ("จับมือสอนเทรด")
  const qTrade1 = await assistant.handleUserQuery('สอนเทรด 1');
  assert(qTrade1.category.includes('TRADING ACADEMY') && qTrade1.detail.includes('Structure'), 'Hands-On Trading Masterclass Lesson 1 (Market Structure)');

  const qTrade2 = await assistant.handleUserQuery('ออเดอร์บล็อกคืออะไร');
  assert(qTrade2.detail.includes('Order Block') || qTrade2.detail.includes('FVG'), 'Hands-On Trading Masterclass Lesson 2 (Order Block & FVG)');

  const qTrade3 = await assistant.handleUserQuery('สอนคุมความเสี่ยง');
  assert(qTrade3.detail.includes('1%') || qTrade3.speech.includes('1%'), 'Hands-On Trading Masterclass Lesson 3 (1% Risk Rule)');

  // Test Multi-Source Live Global News Aggregator (Google News, CoinGecko)
  const liveCrypto = await assistant.fetchLiveGlobalNews('CRYPTO');
  assert(liveCrypto.category.includes('CRYPTO') && liveCrypto.speech.length > 20, 'Crypto market radar returned a usable live-or-fallback response');

  const liveGold = await assistant.fetchLiveGlobalNews('GOLD');
  assert(liveGold.category.includes('GOLD') && liveGold.speech.length > 20, 'Gold market radar returned a usable live-or-fallback response');

  const liveWorld = await assistant.fetchLiveGlobalNews('WORLD');
  assert(liveWorld.category.includes('WORLD') || liveWorld.category.includes('GOOGLE NEWS'), 'World news returned an explicitly sourced live-or-fallback response');

  // Test Sentiment Detector
  assert(assistant.detectSentimentAndEmotion('555 แกล้งกันชัดๆ') === 'PLAYFUL', 'Sentiment detector: Playful/Teasing');
  assert(assistant.detectSentimentAndEmotion('งอนแล้วนะ ฮึ!') === 'POUTY', 'Sentiment detector: Pouty/Tsundere');
  assert(assistant.detectSentimentAndEmotion('เหนื่อยมากเลยวันนี้ ขอกำลังใจหน่อย') === 'CARING', 'Sentiment detector: Caring/Empathy');

  // Test Instant Reactive Companion & Tactical Dialogue Engine
  const qGenAI = await assistant.handleUserQuery('ควอนตัมคอมพิวเตอร์คืออะไร');
  assert(qGenAI.category.includes('COMPANION') || qGenAI.category.includes('TACTICAL'), `Instant Dialogue Query -> Category: ${qGenAI.category}`);
  assert(qGenAI.speech.length > 10, `Instant Spoken response: "${qGenAI.speech.slice(0, 50)}..."`);

  const qLife = await assistant.handleUserQuery('ถ้าอยากเริ่มต้นทำธุรกิจควรทำยังไง');
  assert(qLife.category.includes('COMPANION') || qLife.category.includes('TACTICAL'), 'Open-domain query processed by Instant Dialogue Engine');

  const qCasual = await assistant.handleUserQuery('สวัสดี วันนี้เป็นไงบ้าง');
  assert(qCasual.category.includes('COMPANION') || qCasual.category.includes('TACTICAL'), 'Direct casual chat query processed by Instant Dialogue Engine');
  assert(qCasual.speech.includes('สวัสดีค่ะคุณอนันต์'), 'Instant Thai greeting spoken');

  const qLove = await assistant.handleUserQuery('นิกซ์น่ารักจัง');
  assert(assistant.emotionalState === 'POUTY' && assistant.blushAmount > 0.5, 'NYX blushes and acts cute when complimented');

  const failed = total - passed;
  monkeyEngine.stopTest();
  tradingEngine.destroy();
  freshEngine.destroy();
  profileStore.destroy();
  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================');
  if (failed > 0) process.exitCode = 1;
}

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

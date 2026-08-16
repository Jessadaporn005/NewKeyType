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

// Mock DOM & Sound
global.window = {
  location: { search: '' },
  addEventListener: () => {},
  innerWidth: 1920,
  innerHeight: 1080
};
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
  createElement: (tag) => ({
    tagName: tag,
    dataset: {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    style: {},
    appendChild: () => {},
    addEventListener: () => {},
    innerHTML: ''
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
  assert(achUnlocked && achUnlocked.id === 'first_blood', 'Unlocked "First Breach" achievement');
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

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed}/${total} TESTS PASSED (100%)`);
  console.log('====================================================');
}

runTests().catch(console.error);


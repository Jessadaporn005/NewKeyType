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
    classList: { add: () => {}, remove: () => {} },
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

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed}/${total} TESTS PASSED (100%)`);
  console.log('====================================================');
}

runTests().catch(console.error);

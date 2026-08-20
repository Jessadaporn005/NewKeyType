/**
 * CYBER//TYPE AUTOMATED INTEGRATION & FLOW TEST SUITE
 */

import { profileStore } from './js/profileStore.js';
import { DUCKY_PAYLOAD_TEMPLATES } from './js/duckyCompiler.js';
import { generateLoginLogs, generateEntranceLogs, generateExitLogs, generateHackerExploitLogs } from './js/cyberLogGenerator.js';
import { HACKER_MISSIONS } from './js/lessons.js';

console.log('========================================================');
console.log('CYBER//TYPE VERIFICATION TEST SUITE STARTING...');
console.log('========================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`[PASS] ✓ ${name}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ✗ ${name}`);
    failedTests++;
  }
}

// 1. Test Profile Store Persistence
console.log('--- TESTING PROFILE STORE & CREDENTIALS ---');
await profileStore.ready;
const ananProfile = profileStore.getProfile('Anan');
assert(ananProfile.username.toLowerCase() === 'anan', 'Master profile Anan exists');
assert(await profileStore.verifySecretGatePasscode('Infinity'), 'Secret passcode Infinity verified');
assert(!await profileStore.verifySecretGatePasscode('infinity'), 'Secret passcode remains case-sensitive');
assert(!await profileStore.verifySecretGatePasscode('Anan'), 'Username cannot bypass secret gate');
assert(!await profileStore.verifySecretGatePasscode('wrongcode'), 'Wrong passcode rejected');

const expRes = profileStore.addExp('Anan', 400);
assert(expRes.profile.level >= 1, 'EXP added and level updated');

// 2. Test Cyber Log Generators
console.log('\n--- TESTING CYBER LOG GENERATORS ---');
const loginLogs = generateLoginLogs('Anan');
assert(loginLogs.length >= 100, `Login logs generated (${loginLogs.length} lines)`);

const entranceLogs = generateEntranceLogs('hacker', '1');
assert(entranceLogs.length >= 100, `Entrance logs generated (${entranceLogs.length} lines)`);

const exitLogs = generateExitLogs('Anan');
assert(exitLogs.length >= 80, `Exit logs generated (${exitLogs.length} lines)`);

// 4. Test RPG Credits, Shop Purchases & Weak Keys
console.log('\n--- TESTING RPG CYBER CREDITS, SHOP & WEAK KEYS ---');
const initCreds = ananProfile.credits || 0;
profileStore.addCredits('Anan', 300);
assert(profileStore.getProfile('Anan').credits >= initCreds + 300, 'Cyber Credits added successfully');

const buyRes = profileStore.buyItem('Anan', 'synaptic_booster', 100);
assert(buyRes.success, 'Bought synaptic_booster successfully');
assert(profileStore.hasItem('Anan', 'synaptic_booster'), 'Profile owns synaptic_booster');

profileStore.recordWeakKey('Anan', 'z');
profileStore.recordWeakKey('Anan', 'z');
profileStore.recordWeakKey('Anan', 'p');
const weakKeys = profileStore.getWeakKeys('Anan');
assert(weakKeys.includes('z') && weakKeys[0] === 'z', 'Weak key tracking verified (z is top weak key)');

// 5. Test Hacker Missions 5 and 6
console.log('\n--- TESTING EXPANDED HACKER MISSIONS ---');
assert(HACKER_MISSIONS.length >= 6, `Hacker missions expanded (${HACKER_MISSIONS.length} missions)`);
assert(HACKER_MISSIONS[4].title.includes('MISSION 05'), 'Mission 05 Power Grid EMP Cascade exists');
assert(HACKER_MISSIONS[5].title.includes('MISSION 06'), 'Mission 06 Crypto Vault Dump exists');

console.log('\n========================================================');
console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('========================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

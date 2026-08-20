import { ModeLifecycleManager } from './js/modeManager.js';
import { TypingEngine } from './js/typingEngine.js';
import { MonkeySpeedEngine } from './js/monkeySpeedEngine.js';
import { HackerTyperEngine } from './js/hackerTyper.js';
import { CyberRadioEngine } from './js/cyberRadio.js';
import { TaskManagerViewEngine } from './js/taskManagerView.js';
import { CyberWifiEngine } from './js/cyberWifi.js';
import { CyberBrowserEngine, BROWSER_STATES } from './js/cyberBrowser.js';
import { RogueliteEngine } from './js/rogueliteEngine.js';
import { AITradingEngine } from './js/aiTradingEngine.js';
import { profileStore } from './js/profileStore.js';
import { CyberIntelFeed } from './js/cyberIntelFeed.js';
import { CyberThreatGlobeEngine } from './js/threatGlobe.js';
import { BreachProtocolEngine } from './js/breachProtocol.js';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    failed++;
    console.error(`[FAIL] ${name}`);
  }
}

const noopClassList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
const keyGuide = { clearTargetKeys() {}, clearTargetGuide() {} };
const silentSound = { stopLogStreamDrone() {}, playKey() {}, playSuccessFanfare() {} };

globalThis.cancelAnimationFrame = globalThis.cancelAnimationFrame || clearTimeout;
globalThis.requestAnimationFrame = globalThis.requestAnimationFrame || (callback => setTimeout(callback, 0));
globalThis.window = globalThis.window || {
  addEventListener() {},
  removeEventListener() {},
  focus() {}
};

const { VirtualNetwork } = await import('./js/virtualNetwork.js');

await profileStore.ready;

const lifecycleEvents = [];
const manager = new ModeLifecycleManager();
manager.register('alpha', {
  enter: () => lifecycleEvents.push('alpha:enter'),
  exit: () => lifecycleEvents.push('alpha:exit')
});
manager.register('beta', {
  enter: () => lifecycleEvents.push('beta:enter'),
  exit: () => lifecycleEvents.push('beta:exit')
});
manager.enter('alpha');
manager.enter('beta');
manager.exitActive();
assert(lifecycleEvents.join(',') === 'alpha:enter,alpha:exit,beta:enter,beta:exit', 'Mode manager exits the old view before entering the new view');
assert(manager.activeMode === null, 'Mode manager clears the active view on exit');

const virtualNetwork = new VirtualNetwork({
  dom: { hudTracePanel: { classList: noopClassList } }
});
virtualNetwork.activeTarget = { ip: '203.0.113.10' };
virtualNetwork.traceProgress = 42;
virtualNetwork.traceInterval = setInterval(() => {}, 1000);
virtualNetwork.stop();
assert(virtualNetwork.traceInterval === null && virtualNetwork.activeTarget === null && virtualNetwork.traceProgress === 0, 'CLI virtual-network trace stops when leaving the CLI view');

const intelFeed = new CyberIntelFeed({}, silentSound);
intelFeed.container = { querySelector: () => null };
intelFeed.resume();
const intelTimersStarted = Boolean(intelFeed.marketInterval && intelFeed.clockInterval && intelFeed.newsFetchInterval);
intelFeed.suspend();
assert(intelTimersStarted && !intelFeed.marketInterval && !intelFeed.clockInterval && !intelFeed.newsFetchInterval, 'CLI intelligence polling suspends outside the CLI view');

const threatGlobe = new CyberThreatGlobeEngine(null, null);
threatGlobe.spawnInterval = setInterval(() => {}, 1000);
threatGlobe.animId = setTimeout(() => {}, 1000);
threatGlobe.missiles = [{ progress: 0 }];
threatGlobe.stop();
assert(!threatGlobe.spawnInterval && !threatGlobe.animId && threatGlobe.missiles.length === 0, 'CLI threat visualization stops all background resources');

let breachCompletionCalled = false;
const breach = new BreachProtocolEngine({ querySelector: () => null }, silentSound, () => { breachCompletionCalled = true; });
breach.timerInterval = setInterval(() => {}, 1000);
breach.isActive = true;
breach.buffer = ['1C'];
breach.cancel();
assert(!breach.timerInterval && !breach.isActive && breach.buffer.length === 0 && !breachCompletionCalled, 'CLI breach puzzle cancels without awarding a partial result');

const typing = new TypingEngine(null, keyGuide, keyGuide, silentSound);
typing.timerInterval = setInterval(() => {}, 1000);
typing.isActive = true;
typing.stop();
assert(typing.timerInterval === null && typing.isActive === false, 'Academy timer stops without completing a lesson');

const speed = new MonkeySpeedEngine({ kb: keyGuide, hands: keyGuide });
speed.timerInterval = setInterval(() => {}, 1000);
speed.telemetryInterval = setInterval(() => {}, 1000);
speed.isActive = true;
speed.stopTest();
assert(speed.timerInterval === null && speed.telemetryInterval === null && speed.isActive === false, 'Speed timers and telemetry stop on view exit');

const hacker = new HackerTyperEngine(
  { querySelector: () => null },
  null,
  { classList: noopClassList },
  keyGuide,
  keyGuide,
  silentSound
);
hacker.traceInterval = setInterval(() => {}, 1000);
hacker.streamInterval = setInterval(() => {}, 1000);
hacker.injectionTimeout = setTimeout(() => {}, 1000);
hacker.isInjecting = true;
hacker.stop();
assert(!hacker.traceInterval && !hacker.streamInterval && !hacker.injectionTimeout && !hacker.isInjecting, 'Hacker trace and payload injection stop together');

const radio = new CyberRadioEngine({}, silentSound);
radio.animFrameId = setTimeout(() => {}, 1000);
radio.isPlaying = true;
radio.stopVisualizer();
radio.pause();
assert(radio.animFrameId === null && radio.isPlaying === false, 'Radio audio and visualizer stop on exit');

const taskManager = new TaskManagerViewEngine({}, silentSound, null);
taskManager.startPolling();
taskManager.stopPolling();
assert(taskManager.pollInterval === null, 'Task Manager polling stops on exit');

let removedDecryptListener = false;
const previousRemoveListener = globalThis.window.removeEventListener;
globalThis.window.removeEventListener = () => { removedDecryptListener = true; };
const wifi = new CyberWifiEngine({}, silentSound, null);
wifi.radarAnimId = setTimeout(() => {}, 1000);
wifi.decryptListenerAttached = true;
wifi.isDecrypting = true;
wifi.stop();
assert(wifi.radarAnimId === null && !wifi.isDecrypting && removedDecryptListener, 'Wi-Fi radar and decryptor listener stop on exit');
globalThis.window.removeEventListener = previousRemoveListener;

let mediaStopped = false;
const browser = new CyberBrowserEngine({}, silentSound);
browser.webviewEl = { stop: () => { mediaStopped = true; }, src: 'https://example.com' };
browser.suspend();
assert(mediaStopped && browser.currentUrl === 'about:blank' && browser.state === BROWSER_STATES.CLOSED, 'Browser media is terminated when leaving the view');

const roguelite = new RogueliteEngine({}, silentSound, null);
const minigame = {
  timerInterval: setInterval(() => {}, 1000),
  animFrame: setTimeout(() => {}, 1000),
  onComplete: () => {}
};
roguelite.activeMinigame = minigame;
roguelite.minigameModal = { classList: noopClassList };
roguelite.stop();
assert(roguelite.activeMinigame === null && minigame.timerInterval === null && minigame.animFrame === null && minigame.onComplete === null, 'Roguelite minigame resources stop without awarding a result');

const trading = new AITradingEngine({
  capabilities: { liveTradingEnabled: false, allowSimulatedBrokerFallback: false }
});
const liveStart = trading.startLiveAutoExecution();
const liveOrder = await trading.executeLiveOrder('BUY', 0.1);
assert(liveStart.success === false && trading.isLiveExecutionActive === false, 'Trade Live mode is fail-closed in Paper-only runtime');
assert(liveOrder.success === false && liveOrder.reason === 'LIVE_TRADING_DISABLED_PAPER_ONLY', 'Trade engine cannot create a fake live order ticket');
globalThis.window.cyberSystemAPI = {
  getMT5DemoSnapshot: async () => ({ success: false, error: 'MT5_DEMO_GATEWAY_DISABLED' })
};
trading.startMT5BackgroundStream();
await new Promise(resolve => setTimeout(resolve, 0));
assert(trading.mt5Status.status === 'DEMO_GATEWAY_DISABLED' && trading.mt5PollingInterval === null, 'Disabled MT5 Demo gateway does not leave a polling loop running');
delete globalThis.window.cyberSystemAPI;
trading.pauseStreams();
assert(!trading.tickInterval && !trading.newsInterval && !trading.knowledgeStreamInterval && !trading.mt5PollingInterval, 'Trade background streams stop on view exit');

profileStore.destroy();
console.log(`RUNTIME STABILITY: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;

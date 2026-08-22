const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const requiredRuntimeFiles = [
  'index.html', 'main.cjs', 'preload.cjs', 'manifest.json', 'sw.js',
  'icon.ico', 'js/app.js', 'js/runtimeConfig.js', 'js/aiTradingEngine.js',
  'js/core/trading/aiReaderContract.js', 'js/core/trading/verifiedPaperBot.js',
  'js/core/trading/mt5DemoReadiness.js', 'js/core/trading/mt5DemoExecutionGate.js',
  'js/core/trading/patternEvidence.js', 'js/core/trading/patternOutcomeResearch.js',
  'js/core/trading/patternMemoryPromotion.js', 'js/core/trading/marketDataHealth.js',
  'lib/atomicJsonStore.cjs', 'lib/mt5DemoAuth.cjs'
];
for (const relativePath of requiredRuntimeFiles) {
  check(fs.existsSync(path.join(root, relativePath)), `Missing runtime file: ${relativePath}`);
}

const buildFiles = Array.isArray(pkg.build?.files) ? pkg.build.files : [];
const extraResources = Array.isArray(pkg.build?.extraResources) ? pkg.build.extraResources : [];
check(pkg.main === 'main.cjs', 'Electron main entry must remain main.cjs');
check(pkg.build?.appId === 'com.newkeytype.cyberdeck', 'Stable Windows appId is required');
check(pkg.build?.asar === true, 'Runtime source must be packaged in ASAR');
check(pkg.build?.win?.forceCodeSigning === false, 'Unsigned local build policy must be explicit');
check(!pkg.build?.publish, 'Publishing must remain disabled until a signed update channel is configured');
check(Object.keys(pkg.dependencies || {}).length === 0, 'No production npm dependencies are expected');
check(pkg.devDependencies?.electron === '43.4.1', 'Electron version must be exact and security-reviewed');
check(pkg.devDependencies?.['electron-builder'] === '26.15.7', 'electron-builder version must be exact');
check(buildFiles.includes('js/**/*') && buildFiles.includes('css/**/*'), 'Runtime JS/CSS allowlist is incomplete');
check(!buildFiles.some(pattern => pattern.startsWith('scripts/')), 'MT5/developer scripts must not ship in Paper-only builds');
check(extraResources.some(resource => resource?.from === 'scripts/mt5_silent_bridge.py'
  && resource?.to === 'mt5-observer/mt5_silent_bridge.py'), 'Read-only MT5 observer must ship as an explicit external resource');
check(!buildFiles.some(pattern => /test|README|\.git/i.test(pattern)), 'Tests and repository metadata must not ship');

const runtimeConfig = fs.readFileSync(path.join(root, 'js/runtimeConfig.js'), 'utf8');
const mainProcess = fs.readFileSync(path.join(root, 'main.cjs'), 'utf8');
const tradingEngine = fs.readFileSync(path.join(root, 'js/aiTradingEngine.js'), 'utf8');
const retiredLiveExecutor = fs.readFileSync(path.join(root, 'scripts/mt5_live_executor.py'), 'utf8');
const readOnlyObserver = fs.readFileSync(path.join(root, 'scripts/mt5_silent_bridge.py'), 'utf8');
check(/demoTradingEnabled:\s*false/.test(runtimeConfig), 'Release gate requires demoTradingEnabled=false until real MT5 XDemo certification passes');
check(/liveTradingEnabled:\s*false/.test(runtimeConfig), 'Release gate requires liveTradingEnabled=false');
check(/allowSimulatedBrokerFallback:\s*false/.test(runtimeConfig), 'Release gate forbids simulated broker fallback');
check(/MT5 LIVE EXECUTOR DISABLED/.test(retiredLiveExecutor) && !/order_send\s*\(/.test(retiredLiveExecutor), 'Legacy MT5 live executor must remain non-operational');
check(!/order_send\s*\(|TRADE_ACTION_|do_POST[^]*order/i.test(readOnlyObserver), 'Packaged MT5 observer must remain read-only');
const observerHash = require('node:crypto').createHash('sha256').update(readOnlyObserver).digest('hex');
check(mainProcess.includes(`MT5_DEMO_OBSERVER_SCRIPT_SHA256 = '${observerHash}'`), 'Electron host must pin the packaged observer SHA-256');
check(/crypto\.randomBytes\(32\)\.toString\('hex'\)/.test(mainProcess), 'Managed observer must use an ephemeral 256-bit HMAC token');
check(!/127\.0\.0\.1:5056|\/api\/live\//.test(tradingEngine), 'Renderer must not retain a direct legacy live-broker route');
check(!/electron-updater|\bautoUpdater\b/.test(mainProcess), 'Auto-update code is forbidden until a signed release channel exists');

if (failures.length > 0) {
  console.error('RELEASE CONFIG: FAILED');
  failures.forEach(message => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log('RELEASE CONFIG: PASS (Paper-only, managed read-only MT5 observer, manual unsigned release)');
}

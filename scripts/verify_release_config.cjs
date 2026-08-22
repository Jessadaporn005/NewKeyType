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
  'js/core/trading/xmMarketDataGateway.js', 'js/services/trading/xmMT5MarketData.js',
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
check(extraResources.some(resource => resource?.from === 'scripts/mt5_demo_preflight.py'
  && resource?.to === 'mt5-observer/mt5_demo_preflight.py'), 'Read-only MT5 Demo preflight must ship as an explicit external resource');
check(extraResources.some(resource => resource?.from === 'scripts/mt5_demo_canary_executor.py'
  && resource?.to === 'mt5-observer/mt5_demo_canary_executor.py'), 'Reviewed one-shot MT5 Demo canary executor must ship as an explicit external resource');
check(!buildFiles.some(pattern => /test|README|\.git/i.test(pattern)), 'Tests and repository metadata must not ship');

const runtimeConfig = fs.readFileSync(path.join(root, 'js/runtimeConfig.js'), 'utf8');
const mainProcess = fs.readFileSync(path.join(root, 'main.cjs'), 'utf8');
const tradingEngine = fs.readFileSync(path.join(root, 'js/aiTradingEngine.js'), 'utf8');
const retiredLiveExecutor = fs.readFileSync(path.join(root, 'scripts/mt5_live_executor.py'), 'utf8');
const readOnlyObserver = fs.readFileSync(path.join(root, 'scripts/mt5_silent_bridge.py'), 'utf8');
const readOnlyPreflight = fs.readFileSync(path.join(root, 'scripts/mt5_demo_preflight.py'), 'utf8');
const demoCanaryExecutor = fs.readFileSync(path.join(root, 'scripts/mt5_demo_canary_executor.py'), 'utf8');
check(/demoTradingEnabled:\s*true/.test(runtimeConfig), 'Release gate requires the narrowly scoped Demo canary capability');
check(/liveTradingEnabled:\s*false/.test(runtimeConfig), 'Release gate requires liveTradingEnabled=false');
check(/allowSimulatedBrokerFallback:\s*false/.test(runtimeConfig), 'Release gate forbids simulated broker fallback');
check(/MT5 LIVE EXECUTOR DISABLED/.test(retiredLiveExecutor) && !/order_send\s*\(/.test(retiredLiveExecutor), 'Legacy MT5 live executor must remain non-operational');
check(!/order_send\s*\(|TRADE_ACTION_|do_POST[^]*order/i.test(readOnlyObserver), 'Packaged MT5 observer must remain read-only');
check(/order_check\s*\(/.test(readOnlyPreflight) && /order_calc_profit\s*\(/.test(readOnlyPreflight)
  && !/order_send\s*\(/.test(readOnlyPreflight) && /"executionAttempted": False/.test(readOnlyPreflight), 'Packaged Demo preflight may check and calculate but must contain no execution primitive');
check((demoCanaryExecutor.match(/order_send\s*\(/g) || []).length === 1
  && /CANARY_VOLUME\s*=\s*0\.01/.test(demoCanaryExecutor)
  && /ACCOUNT_TRADE_MODE_DEMO/.test(demoCanaryExecutor)
  && /CANARY_REQUIRES_ZERO_OPEN_POSITIONS/.test(demoCanaryExecutor)
  && /FINAL_BROKER_ORDER_CHECK_REJECTED/.test(demoCanaryExecutor)
  && /FILLED_ORDER_NOT_RECONCILED_LOCKED/.test(demoCanaryExecutor)
  && !/CYBERDECK_MT5_PASSWORD/.test(demoCanaryExecutor), 'Demo executor must remain a one-shot 0.01-lot, Demo-only, protected and reconciled canary');
const observerHash = require('node:crypto').createHash('sha256').update(readOnlyObserver).digest('hex');
const preflightHash = require('node:crypto').createHash('sha256').update(readOnlyPreflight).digest('hex');
const canaryExecutorHash = require('node:crypto').createHash('sha256').update(demoCanaryExecutor).digest('hex');
check(mainProcess.includes(`MT5_DEMO_OBSERVER_SCRIPT_SHA256 = '${observerHash}'`), 'Electron host must pin the packaged observer SHA-256');
check(mainProcess.includes(`MT5_DEMO_PREFLIGHT_SCRIPT_SHA256 = '${preflightHash}'`), 'Electron host must pin the packaged Demo preflight SHA-256');
check(mainProcess.includes(`MT5_DEMO_CANARY_EXECUTOR_SCRIPT_SHA256 = '${canaryExecutorHash}'`), 'Electron host must pin the packaged Demo canary executor SHA-256');
check(mainProcess.includes("MT5_DEMO_OPERATOR_CONFIRMATION = 'XM DEMO 0.01'")
  && mainProcess.includes("handleTrusted('cyber:mt5-demo-canary-arm'")
  && mainProcess.includes("handleTrusted('cyber:mt5-demo-canary-send'")
  && mainProcess.includes('mt5DemoCanaryUsedThisSession = true'), 'Electron host must enforce explicit confirmation and one canary per application session');
check(/crypto\.randomBytes\(32\)\.toString\('hex'\)/.test(mainProcess), 'Managed observer must use an ephemeral 256-bit HMAC token');
check(!/127\.0\.0\.1:5056|\/api\/live\//.test(tradingEngine), 'Renderer must not retain a direct legacy live-broker route');
check(!/electron-updater|\bautoUpdater\b/.test(mainProcess), 'Auto-update code is forbidden until a signed release channel exists');

if (failures.length > 0) {
  console.error('RELEASE CONFIG: FAILED');
  failures.forEach(message => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log('RELEASE CONFIG: PASS (one-shot 0.01 XM Demo canary, Live disabled, manual unsigned release)');
}

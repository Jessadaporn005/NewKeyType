const fs = require('node:fs');
const path = require('node:path');
const asar = require('@electron/asar');

const root = path.resolve(__dirname, '..');
const appDirectory = path.resolve(root, process.argv[2] || 'release/win-unpacked');
const executablePath = path.join(appDirectory, 'CyberDeck.exe');
const asarPath = path.join(appDirectory, 'resources', 'app.asar');
const observerPath = path.join(appDirectory, 'resources', 'mt5-observer', 'mt5_silent_bridge.py');
const preflightPath = path.join(appDirectory, 'resources', 'mt5-observer', 'mt5_demo_preflight.py');
const canaryExecutorPath = path.join(appDirectory, 'resources', 'mt5-observer', 'mt5_demo_canary_executor.py');
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

check(fs.existsSync(executablePath), 'CyberDeck.exe is missing');
check(fs.existsSync(asarPath), 'resources/app.asar is missing');
check(fs.existsSync(observerPath), 'Packaged read-only MT5 observer is missing');
check(fs.existsSync(preflightPath), 'Packaged non-executing MT5 Demo preflight is missing');
check(fs.existsSync(canaryExecutorPath), 'Packaged one-shot MT5 Demo canary executor is missing');

if (fs.existsSync(observerPath)) {
  const observer = fs.readFileSync(observerPath);
  const observerText = observer.toString('utf8');
  const sourceObserverPath = path.join(root, 'scripts', 'mt5_silent_bridge.py');
  const sourceObserver = fs.readFileSync(sourceObserverPath);
  check(observer.equals(sourceObserver), 'Packaged MT5 observer differs from the reviewed source');
  check(!/order_send\s*\(|TRADE_ACTION_/i.test(observerText), 'Packaged MT5 observer contains execution primitives');
}

if (fs.existsSync(canaryExecutorPath)) {
  const canaryExecutor = fs.readFileSync(canaryExecutorPath);
  const canaryExecutorText = canaryExecutor.toString('utf8');
  const sourceCanaryExecutor = fs.readFileSync(path.join(root, 'scripts', 'mt5_demo_canary_executor.py'));
  check(canaryExecutor.equals(sourceCanaryExecutor), 'Packaged MT5 Demo canary executor differs from the reviewed source');
  check((canaryExecutorText.match(/order_send\s*\(/g) || []).length === 1
    && /CANARY_VOLUME\s*=\s*0\.01/.test(canaryExecutorText)
    && /ACCOUNT_TRADE_MODE_DEMO/.test(canaryExecutorText)
    && /FILLED_ORDER_NOT_RECONCILED_LOCKED/.test(canaryExecutorText), 'Packaged Demo canary executor exceeds its one-shot certified authority');
}

if (fs.existsSync(preflightPath)) {
  const preflight = fs.readFileSync(preflightPath);
  const preflightText = preflight.toString('utf8');
  const sourcePreflight = fs.readFileSync(path.join(root, 'scripts', 'mt5_demo_preflight.py'));
  check(preflight.equals(sourcePreflight), 'Packaged MT5 Demo preflight differs from the reviewed source');
  check(/order_check\s*\(/.test(preflightText) && !/order_send\s*\(/.test(preflightText), 'Packaged MT5 Demo preflight is not calculation-only');
}

if (fs.existsSync(asarPath)) {
  const files = asar.listPackage(asarPath).map(file => file.replaceAll('\\', '/').toLowerCase());
  const required = [
    '/index.html', '/main.cjs', '/preload.cjs', '/js/app.js',
    '/js/runtimeconfig.js', '/js/aitradingengine.js',
    '/js/core/trading/mlshadowmodel.js', '/js/core/trading/mt5demogateway.js', '/js/core/trading/mt5democertification.js',
    '/js/core/trading/mt5demoreadiness.js', '/js/core/trading/mt5demoexecutiongate.js',
    '/js/core/trading/xmmarketdatagateway.js', '/js/services/trading/xmmt5marketdata.js',
    '/js/core/trading/aireadercontract.js', '/js/core/trading/verifiedpaperbot.js',
    '/js/core/trading/patternevidence.js', '/js/core/trading/patternoutcomeresearch.js', '/js/core/trading/patternmemorypromotion.js',
    '/js/core/trading/marketdatahealth.js', '/js/core/trading/marketregime.js',
    '/js/core/trading/paperaccount.js', '/js/services/trading/binancemarketdata.js',
    '/lib/atomicjsonstore.cjs', '/lib/mt5demoauth.cjs'
  ];
  required.forEach(file => check(files.includes(file), `Packaged runtime file missing: ${file}`));

  const forbidden = files.filter(file =>
    file.startsWith('/scripts/')
    || file.startsWith('/test_')
    || file === '/readme.md'
    || file.includes('mt5_live_executor')
    || file.includes('live-updater')
  );
  check(forbidden.length === 0, `Forbidden files entered ASAR: ${forbidden.join(', ')}`);
  check(fs.statSync(asarPath).size < 10 * 1024 * 1024, 'ASAR is unexpectedly larger than 10 MB');

  const runtimeConfig = asar.extractFile(asarPath, 'js/runtimeConfig.js').toString('utf8');
  check(/demoTradingEnabled:\s*true/.test(runtimeConfig), 'Packaged runtime is missing the scoped Demo canary capability');
  check(/liveTradingEnabled:\s*false/.test(runtimeConfig), 'Packaged runtime does not enforce Paper-only');
  check(/allowSimulatedBrokerFallback:\s*false/.test(runtimeConfig), 'Packaged runtime allows fake broker fallback');
}

if (failures.length > 0) {
  console.error('PACKAGED ARTIFACT: FAILED');
  failures.forEach(message => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log('PACKAGED ARTIFACT: PASS (runtime complete, reviewed 0.01 XM Demo canary, Live disabled)');
}

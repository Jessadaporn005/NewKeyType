const fs = require('node:fs');
const path = require('node:path');
const asar = require('@electron/asar');

const root = path.resolve(__dirname, '..');
const appDirectory = path.resolve(root, process.argv[2] || 'release/win-unpacked');
const executablePath = path.join(appDirectory, 'CyberDeck.exe');
const asarPath = path.join(appDirectory, 'resources', 'app.asar');
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

check(fs.existsSync(executablePath), 'CyberDeck.exe is missing');
check(fs.existsSync(asarPath), 'resources/app.asar is missing');

if (fs.existsSync(asarPath)) {
  const files = asar.listPackage(asarPath).map(file => file.replaceAll('\\', '/').toLowerCase());
  const required = [
    '/index.html', '/main.cjs', '/preload.cjs', '/js/app.js',
    '/js/runtimeconfig.js', '/js/aitradingengine.js',
    '/js/core/trading/mlshadowmodel.js', '/js/core/trading/mt5demogateway.js', '/js/core/trading/mt5democertification.js',
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
  check(/liveTradingEnabled:\s*false/.test(runtimeConfig), 'Packaged runtime does not enforce Paper-only');
  check(/allowSimulatedBrokerFallback:\s*false/.test(runtimeConfig), 'Packaged runtime allows fake broker fallback');
}

if (failures.length > 0) {
  console.error('PACKAGED ARTIFACT: FAILED');
  failures.forEach(message => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log('PACKAGED ARTIFACT: PASS (runtime complete, Paper-only, MT5 scripts absent)');
}

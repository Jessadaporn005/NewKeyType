import fs from 'node:fs';
import { createRequire } from 'node:module';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.cjs');
const preload = read('./preload.cjs');
const browser = read('./js/cyberBrowser.js');
const profile = read('./js/profileStore.js');
const systemBridge = read('./js/systemBridge.js');
const wifi = read('./js/cyberWifi.js');
const toast = read('./js/toastManager.js');
const liveExecutor = read('./scripts/mt5_live_executor.py');
const mt5Observer = read('./scripts/mt5_silent_bridge.py');
const tradingEngine = read('./js/aiTradingEngine.js');
const intel = read('./js/cyberIntelFeed.js');
const hologram = read('./js/hologramAssistant.js');
const vscode = read('./js/vscodeEngine.js');
const html = read('./index.html');
const mt5CaptureScript = read('./scripts/capture_mt5_demo_trace.mjs');
const require = createRequire(import.meta.url);
const { createMT5DemoRequestAuth, createMT5DemoResponseSignature, verifyMT5DemoResponseSignature } = require('./lib/mt5DemoAuth.cjs');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed += 1;
    console.log(`[PASS] ${name}`);
  } else {
    failed += 1;
    console.error(`[FAIL] ${name}`);
  }
}

assert(!main.includes('webSecurity: false'), 'Electron web security is never disabled');
assert((main.match(/sandbox:\s*true/g) || []).length >= 3, 'Every app BrowserWindow enables sandboxing');
assert(main.includes("contents.on('will-attach-webview'"), 'Webview preferences are sanitized before attachment');
assert(main.includes("delete webPreferences.preload"), 'Untrusted webviews cannot inherit a preload bridge');
assert((main.match(/ipcMain\.handle\(/g) || []).length === 1, 'IPC registration is centralized behind sender validation');
assert(main.includes("CYBERDECK_HOST_MUTATIONS === '1'"), 'Host mutations are opt-in and fail closed');
assert(main.includes('canonicalizePathWithExistingParent') && main.includes('realpathSync.native'), 'File roots are checked through canonical paths to block junction traversal');
assert(main.includes('canonicalFilePath') && main.includes('canonicalStaticRoot'), 'Static server rejects symlink traversal outside the app root');
assert(main.includes("handleTrusted('cyber:fs-read-data-url'"), 'Media preview uses a constrained IPC data channel instead of file URLs');
assert(main.includes("handleTrusted('cyber:mt5-demo-snapshot'") && preload.includes('getMT5DemoSnapshot'), 'MT5 Demo snapshots cross the sender-validated preload bridge');
assert(!main.includes('!app.isPackaged') && main.includes("handleTrusted('cyber:mt5-demo-observer-control'")
  && main.includes("crypto.randomBytes(32).toString('hex')") && main.includes('createMT5DemoRequestAuth')
  && preload.includes('setMT5DemoObserverEnabled') && !preload.includes('CYBERDECK_MT5_DEMO_TOKEN')
  && !main.includes('Authorization: `Bearer'), 'Packaged MT5 Demo observer is user-controlled and uses an ephemeral HMAC secret hidden from the renderer');
assert(main.includes('hostname: OLLAMA_HOST') && main.includes("OLLAMA_HOST = '127.0.0.1'")
  && preload.includes('runLocalAIReader') && !main.includes('api.openai.com'), 'Local AI Reader stays on loopback and exposes no paid cloud/API-key route');
const mt5TestToken = '0123456789abcdef0123456789abcdef';
const mt5RequestAuth = createMT5DemoRequestAuth(mt5TestToken, { timestamp: 1787200000000, nonce: '00112233445566778899aabbccddeeff' });
const mt5ResponseBody = Buffer.from('{"ok":true}');
const mt5ResponseSignature = createMT5DemoResponseSignature(mt5TestToken, mt5RequestAuth.nonce, mt5ResponseBody);
assert(mt5RequestAuth.authorization.startsWith('CyberDeck-HMAC ') && !mt5RequestAuth.authorization.includes(mt5TestToken), 'MT5 request authentication does not disclose its shared secret');
assert(mt5RequestAuth.signature === '0971ec641a11e9652880eb5032b438c9f4097eb85f6c2c8424751f3569ebdb2d', 'MT5 request HMAC matches the cross-language protocol vector');
assert(verifyMT5DemoResponseSignature(mt5TestToken, mt5RequestAuth.nonce, mt5ResponseBody, mt5ResponseSignature)
  && !verifyMT5DemoResponseSignature(mt5TestToken, mt5RequestAuth.nonce, Buffer.from('{"ok":false}'), mt5ResponseSignature), 'MT5 response authentication detects body tampering');
assert(mt5CaptureScript.includes('verifyMT5DemoResponseSignature')
  && !mt5CaptureScript.includes('Bearer ')
  && !mt5CaptureScript.includes('order_send'), 'MT5 Demo trace capture verifies HMAC and remains read-only');
assert(mt5Observer.includes('READ_ONLY_DEMO_OBSERVER') && mt5Observer.includes('EXPECTED_COMPANY')
  && mt5Observer.includes('TERMINAL_PATH') && !mt5Observer.includes('order_send(')
  && !mt5Observer.includes('CYBERDECK_MT5_PASSWORD'), 'Packaged MT5 observer is bound to the selected broker terminal and contains no password or order route');
assert(!main.includes("connect-src 'self' https: http://127.0.0.1:5055") && !main.includes('http://127.0.0.1:5056'), 'Renderer CSP cannot call legacy broker localhost ports directly');
assert(liveExecutor.includes('MT5 LIVE EXECUTOR DISABLED') && !liveExecutor.includes('order_send('), 'Legacy unauthenticated MT5 live executor is non-operational');
assert(!tradingEngine.includes('127.0.0.1:5056') && !tradingEngine.includes('/api/live/'), 'Renderer has no direct legacy live-broker network route');
assert(!main.includes("'.svg', '.webp', '.mp3'"), 'Untrusted SVG files are excluded from the media preview channel');
assert(main.includes("UNTRUSTED_CODE_RUNTIME_DISABLED_FOR_SECURITY"), 'Node vm is not exposed as an untrusted-code sandbox');
assert(!main.includes('exec(`start'), 'Local targets are not launched through a command-string shell');
assert(main.includes("Buffer.from('CYBERENC1'"), 'New encrypted files use a versioned format');
assert(main.includes('const salt = crypto.randomBytes(16)'), 'File encryption uses a random per-file salt');
assert(main.includes('sourcePreserved: true'), 'Encryption preserves its source file by default');
assert(main.includes("'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()'"), 'HTTP policy only permits the local camera capability');
assert(main.includes("mediaTypes.includes('video')") && main.includes("!mediaTypes.includes('audio')"), 'Electron grants only video-only media requests from the local app');

assert(!browser.includes("allowpopups', 'true'"), 'Embedded browser popup permission is not granted');
assert(!browser.includes('contextIsolation=false'), 'Embedded browser keeps context isolation enabled');
assert(!browser.includes('camera; microphone'), 'Browser fallback does not request camera or microphone access');
assert(browser.includes("parsed.protocol !== 'https:'"), 'Typed browser destinations are restricted to HTTPS');

assert(profile.includes("const CREDENTIAL_KDF = 'PBKDF2-SHA256'"), 'Profile credentials use PBKDF2-SHA256');
assert(!profile.includes("password: 'Infinity'"), 'Default profile does not persist a plaintext password');
assert(!profile.includes("lower === 'infinity' || lower === 'anan'"), 'Username and hard-coded tokens cannot bypass authentication');
assert(profile.includes('isValidUsername') && profile.includes('/^[\\p{L}\\p{N}_-]{1,32}$/u'), 'Usernames are constrained before becoming profile keys or UI content');
assert(!html.includes('responsivevoice'), 'Renderer does not load the unkeyed third-party voice script');
assert(!hologram.includes('translate.google.com/translate_tts'), 'Companion speech does not send text to an undocumented remote TTS endpoint');
assert(hologram.includes("balloon.textContent = String(text ?? '')"), 'Fetched companion text is rendered as text rather than executable HTML');
assert(html.includes('NOT A HARDWARE SECURITY MODULE'), 'Local app lock is not presented as hardware authentication');

assert(systemBridge.includes("HOST_COMMAND_EXECUTION_UNAVAILABLE"), 'Browser fallback does not fabricate command execution');
assert(systemBridge.includes("HOST_OSINT_UNAVAILABLE"), 'Browser fallback does not fabricate OSINT results');
assert(wifi.includes('SIMULATION ONLY'), 'Wi-Fi training is visibly labeled as simulation');
assert(wifi.includes('this.escapeHtml(net.ssid)') && wifi.includes('this.escapeHtml(this.searchQuery)'), 'Host Wi-Fi names and searches are escaped before HTML rendering');
assert(!wifi.includes('wifiPassInput') && wifi.includes('existing Wi-Fi profile already saved by Windows'), 'Wi-Fi mode does not collect a password it cannot use');
assert(!toast.includes('toast.innerHTML'), 'Toast messages are built with text nodes rather than executable HTML');
assert(vscode.includes('sandbox=""') && !vscode.includes('sandbox="allow-scripts'), 'Code preview blocks scripts and forms from imported HTML');
assert(vscode.includes('SIMULATED RUNNER — CODE WAS NOT EXECUTED'), 'Code runner labels fallback output as simulated');
assert(!intel.includes('LIVE 100% ONLINE'), 'Intel feed does not claim all sources are live when only one succeeds');
assert(intel.includes('HACKER NEWS VERIFIED') && intel.includes('SIMULATED SCENARIO'), 'News cards carry explicit provenance labels');

console.log(`SECURITY: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;

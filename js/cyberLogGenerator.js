/**
 * CYBER//TYPE CINEMA LOG GENERATOR ENGINE
 * Generates 150-250+ realistic, authentic hacker logs, kernel memory maps,
 * assembly opcodes, network socket traces, and telemetry streams for 20-40s runs.
 */

const mockAddr = () => '0x' + Math.floor(Math.random() * 0xFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
const randHex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
const randPort = () => Math.floor(1024 + Math.random() * 64000);
const randIP = () => `192.168.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}`;

export function generateTradingEntranceLogs(asset = 'BTC/USDT') {
  const lines = [];
  const cleanAsset = (asset || 'BTC/USDT').toUpperCase();
  const rawSymbol = cleanAsset.replace('/', '');

  lines.push(`========================================================================================`);
  lines.push(`[⚡] ESTABLISHING QUANTUM FINANCIAL INTERFACE // ASSET: ${cleanAsset} [LIVE STREAM]`);
  lines.push(`========================================================================================`);

  // Section 1: Exchange WebSocket & Kline Stream Handshake
  lines.push(`[ 0.001240] [EXCHANGE_BRIDGE] Initializing TLS v1.3 WebSocket to wss://stream.binance.com:9443/ws`);
  lines.push(`[ 0.002810] [REST_API] Querying Kline Endpoint: https://api.binance.com/api/v3/klines?symbol=${rawSymbol}&limit=80`);
  lines.push(`[ 0.004120] [REST_API] HTTP/2 200 OK — Ingested 80 Candlestick OHLCV Data Vectors [LATENCY: 14.2ms]`);
  lines.push(`[ 0.006900] [FEED_VALIDATOR] Parsed Timestamp Stream: Epoch Integrity Match [0 Gaps Detected]`);
  lines.push(`[ 0.008400] [BOOK_STREAM] Subscribed to L2 Depth Stream @${rawSymbol.toLowerCase()}@depth20@100ms [OK]`);

  // Section 2: Order Book Liquidity & Real-Time Depth Ticks (30 lines)
  const isBtc = cleanAsset.includes('BTC');
  const isEth = cleanAsset.includes('ETH');
  const isSol = cleanAsset.includes('SOL');
  const basePrice = isBtc ? 96420 : (isEth ? 3540 : (isSol ? 204 : 138));

  for (let i = 0; i < 30; i++) {
    const bidPrice = (basePrice - i * (basePrice * 0.00035)).toFixed(2);
    const askPrice = (basePrice + (i + 1) * (basePrice * 0.00035)).toFixed(2);
    const bidVol = (0.25 + Math.random() * 4.5).toFixed(4);
    const askVol = (0.25 + Math.random() * 4.5).toFixed(4);
    lines.push(`>> [L2_ORDERBOOK] BID: $${bidPrice} (${bidVol} ${cleanAsset.split('/')[0]}) | ASK: $${askPrice} (${askVol}) | SPREAD: 0.01% [MATCHED]`);
  }

  // Section 3: Smart Money Concepts (SMC) & Liquidity Scanner (15 lines)
  lines.push(`>> [SMC_ALGO] Scanning Institutional Order Blocks (OB) on 5m / 15m / 1h Structure...`);
  lines.push(`>> [SMC_ALGO] Detected Fair Value Gap (FVG): Imbalance Range [UNFILLED DEMAND ZONE]`);
  lines.push(`>> [SMC_ALGO] Liquidity Pool Sweep Detected: $18.4M Sell Stops cleared below local key low`);
  lines.push(`>> [SMC_ALGO] Market Structure Shift (MSS): Break of Structure (BOS) Confirmed on 15m Frame`);
  lines.push(`>> [SMC_ALGO] Premium vs Discount Array: Price currently trading in High-Probability Discount Zone`);

  // Section 4: Quantitative Momentum & Indicator Formulas (20 lines)
  lines.push(`>> [QUANT_MATH] Calculating Exponential Moving Averages (EMA 20 / EMA 50 Ribbon)...`);
  lines.push(`>> [QUANT_MATH] EMA Ribbon Confluence verified: EMA(20) > EMA(50) [GOLDEN TREND ALIGNMENT]`);
  lines.push(`>> [QUANT_MATH] Computing Bollinger Bands (Period: 20, StdDev: 2.0) -> Volatility Expansion Active`);
  lines.push(`>> [QUANT_MATH] Relative Strength Index (RSI 14) Vector Calculated: 64.2 [BULLISH MOMENTUM]`);
  lines.push(`>> [QUANT_MATH] MACD Line = +142.50 | Signal = +118.20 | Histogram = +24.30 [ACCELERATING]`);
  lines.push(`>> [QUANT_MATH] Volume Profile Point of Control (POC): High-Volume Node at $${(basePrice * 0.995).toFixed(2)}`);

  // Section 5: Real-Time Macro News NLP Sentiment Stream
  lines.push(`>> [NLP_FEED] Parsing Bloomberg / CoinDesk Real-Time Macro Intelligence Stream...`);
  lines.push(`>> [NLP_FEED] Headline Ingested: "US Federal Reserve Signals Liquidity Easing" [BULLISH CATALYST +20]`);
  lines.push(`>> [NLP_FEED] Headline Ingested: "Institutional Spot ETF Inflows Reach Weekly Record" [BULLISH +18]`);
  lines.push(`>> [NLP_FEED] Aggregate Market Sentiment Score: +38 (STRONG POSITIVE MACRO MOMENTUM)`);

  // Section 6: AI Autonomous Strategy Engine Calibration
  lines.push(`>> [AI_COPILOT] Neural Strategy Playbook: Trend Following with Pullback Confluence`);
  lines.push(`>> [AI_COPILOT] Risk/Reward Matrix Calculated: Entry Target Configured (Target R:R = 1:3.14)`);
  lines.push(`>> [AI_COPILOT] Model Confidence Assessment: 94.2% [STRONG BUY CONVICTION]`);
  lines.push(`>> [AI_GYM] Autonomous Paper Trading Sandbox Synchronized: 50+ Post-Mortem Epochs Loaded`);
  lines.push(`>> [PAPER_ENGINE] Paper Trading Capital Allocated: $100,000.00 USD [LEVERAGE 10x ARMED]`);
  lines.push(`>> [RETINA_CANVAS] Initializing 4K HiDPI Hardware Accelerated Candlestick Surface...`);
  lines.push(`========================================================================================`);
  lines.push(`[✓] QUANTUM FINANCIAL PIPELINE SYNCHRONIZATION COMPLETE (100%)`);
  lines.push(`[+] LAUNCHING AI QUANTUM TRADING TERMINAL...`);
  lines.push(`========================================================================================`);

  return lines;
}

export function generateEntranceLogs(mode, arg = '') {
  if (mode === 'trading') {
    return generateTradingEntranceLogs(arg || 'BTC/USDT');
  }

  const lines = [];

  lines.push(`========================================================================================`);
  lines.push(`[⚡] INITIATING C4ISR TACTICAL DIRECTIVE: '${mode.toUpperCase()} ${arg}'`);
  lines.push(`========================================================================================`);

  // Section 1: Boot Architecture & Microcode
  lines.push(`[ 0.000000] Linux version 6.10.2-quantum-c4isr (root@c2-node-96epyc) (gcc 14.2.0)`);
  lines.push(`[ 0.001892] Command line: BOOT_IMAGE=/vmlinuz-c4isr root=UUID=7f82-99ab-01 ro quiet splash`);
  lines.push(`[ 0.003410] KERNEL: Initializing x86/64 microcode v0x4112 [AMD Zen4 EPYC]... [OK]`);
  lines.push(`[ 0.008920] MEMORY_MAP: Base 0x0000000000000000 - 0x000000007FFFFFFF (131,072 MB ECC RAM)`);
  lines.push(`[ 0.012400] ACPI: Core System Description Table (DSDT/RSDT) [OEM: C4ISR_DEFENSE]`);
  lines.push(`[ 0.018900] CPU0: AMD EPYC 9654 96-Core Quantum Processor @ 5.40GHz (128 Cores Online)`);
  lines.push(`[ 0.024100] TSC: Fast TSC calibration using PIT: 5400.042 MHz [Jitter: 0.01ns]`);

  // Section 2: Memory Page Allocation Tables (35 lines)
  for (let i = 0; i < 35; i++) {
    const pfn = '0x' + (1000 + i * 18).toString(16);
    lines.push(`>> [MEM_ALLOC] page_table_alloc(order=2, pfn=${pfn}) -> Base: ${mockAddr()} [STATUS: COMMIT]`);
  }

  // Section 3: CPU Registers State
  lines.push(`>> [CPU_REGISTERS] RAX=0x0000000000000000 RBX=${mockAddr()} RCX=0x00007FFD8942A190`);
  lines.push(`>> [CPU_REGISTERS] RDX=0x0000000000000000 RSI=0x00007FFD8942A200 RDI=${mockAddr()}`);
  lines.push(`>> [CPU_REGISTERS] RSP=0x00007FFD8942A000 RBP=0x00007FFD8942A040 RIP=${mockAddr()}`);
  lines.push(`>> [CPU_REGISTERS] CR0=0x80050033 CR4=0x000006F0 EFLAGS=0x00000246 FS=0x0000 GS=0x0000`);

  // Section 4: Assembly Opcodes Execution Stream (40 lines)
  const asmOpcodes = [
    `MOV RAX, 0x3B; PUSH RDI; MOV RDI, RSP; XOR RSI, RSI; XOR RDX, RDX; SYSCALL;`,
    `MOV RDX, 0x1000; LEA RSI, [RBP-0x40]; MOV EDI, 0x01; MOV EAX, 0x01; SYSCALL;`,
    `CMP DWORD PTR [RBP-0x04], 0x00; JNE 0x004018A0; NOP; MOV EAX, 0x00; LEAVE; RET;`,
    `PUSH RBP; MOV RBP, RSP; SUB RSP, 0x30; MOV QWORD PTR [RBP-0x18], RDI;`,
    `MOV RAX, QWORD PTR FS:[0x28]; MOV QWORD PTR [RBP-0x08], RAX; XOR EAX, EAX;`
  ];
  for (let i = 0; i < 40; i++) {
    lines.push(`>> [ASM_EXEC] ${mockAddr()}: ${asmOpcodes[i % asmOpcodes.length]}`);
  }

  // Section 5: Network Socket Routing & Satellite Tunnels (40 lines)
  lines.push(`>> [NET_SOCKET] Binding AF_INET, SOCK_STREAM, IPPROTO_TCP -> 127.0.0.1:${randPort()}`);
  for (let i = 0; i < 40; i++) {
    lines.push(`>> [TCP_PACKET] ${randIP()}:${randPort()} > ${randIP()}:${randPort()}: Flags [P.], seq ${i*1024}:${(i+1)*1024}, win 65535, ack 1`);
  }

  // Section 6: Cryptographic Decryption (30 lines)
  for (let i = 0; i < 30; i++) {
    const hash = Array.from({length: 8}, randHex).join('');
    lines.push(`>> [CRYPTO_DERIVE] SHA3-512 HASH BLOCK #${i}: 0x${hash}... [ENTROPY: 0.998 - VERIFIED]`);
  }

  // Section 7: Telemetry & Handshake
  lines.push(`>> [TELEMETRY] Attaching Bio-Metric Finger Sensors: [LP, LR, LM, LI, LT, RT, RI, RM, RR, RP]`);
  lines.push(`>> [TELEMETRY] Calibrating Micro-Acoustic Sensor Transients... [60 FPS OK]`);
  lines.push(`>> [TELEMETRY] Pre-fetching ANSI Buffer Stream: Buffer Allocated 65536 KB`);
  lines.push(`>> [SYSTEM_DAEMON] Process Fork: PID ${Math.floor(2000 + Math.random()*8000)} spawned under UID 0`);
  lines.push(`>> [SECURITY_CHECK] Kernel Integrity Hash Match: 0x${Array.from({length: 6}, randHex).join('')}`);
  lines.push(`>> [ENV_SWITCH] Workspace Ready: '${mode.toUpperCase()}' Active`);
  lines.push(`========================================================================================`);
  lines.push(`[✓] ALLOCATION & SUBSYSTEM INITIALIZATION: SUCCESS (100%)`);
  lines.push(`[+] LAUNCHING TARGET RUNTIME ENVIRONMENT...`);
  lines.push(`========================================================================================`);

  return lines;
}

export function generateExitLogs(username = 'asus') {
  const lines = [];

  lines.push(`========================================================================================`);
  lines.push(`[!] INITIATING SYSTEM TEARDOWN & REVERSE SANITIZATION PROTOCOL...`);
  lines.push(`========================================================================================`);

  lines.push(`>> [TEARDOWN] Terminating Subsystem Daemons on PID ${Math.floor(2000 + Math.random()*8000)}...`);
  lines.push(`>> [TEARDOWN] Unbinding Neural Kinematics Sensors & Audio Stream Channels...`);

  // Memory Page Scrubbing (35 lines)
  for (let i = 0; i < 35; i++) {
    lines.push(`>> [MEM_SCRUB] Overwriting Memory Segment ${mockAddr()} with 0x00000000 [ZERO_FILL]`);
  }

  // CPU Registers Clearing
  lines.push(`>> [CPU_PURGE] Clearing GP Registers: RAX=0x0 RBX=0x0 RCX=0x0 RDX=0x0 RSI=0x0 RDI=0x0`);
  lines.push(`>> [CPU_PURGE] Clearing Instruction Cache (L1I / L2 / L3) -> WBINVD EXECUTED`);

  // Network Sockets Teardown (35 lines)
  for (let i = 0; i < 35; i++) {
    lines.push(`>> [NET_TEARDOWN] Closing TCP Socket Channel FD #${i} [FIN_WAIT -> CLOSED]`);
  }

  // Audit Logs Zeroing
  lines.push(`>> [LOG_SCRUBBER] Truncating /var/log/audit.log -> 0 BYTES [PURGED]`);
  lines.push(`>> [LOG_SCRUBBER] Truncating /var/log/secure -> 0 BYTES [PURGED]`);
  lines.push(`>> [LOG_SCRUBBER] Truncating /var/log/auth.log -> 0 BYTES [PURGED]`);
  lines.push(`>> [LOG_SCRUBBER] Nullifying Ephemeral IP Route Caches... [OK]`);

  lines.push(`>> [KERNEL_RESTORE] Resetting NT Command Prompt Environment Registers...`);
  lines.push(`>> [SHELL_INIT] Spawning Interactive Terminal Interpreter for C:\\Users\\${username}>`);
  lines.push(`========================================================================================`);
  lines.push(`[✓] TEARDOWN & LOG SCRUBBING COMPLETE: SUCCESS (100%)`);
  lines.push(`[+] ROOT ENVIRONMENT RESTORED: C:\\Users\\${username}>`);
  lines.push(`========================================================================================`);

  return lines;
}

export function generateLoginLogs(username = 'asus') {
  const lines = [];

  lines.push(`========================================================================================`);
  lines.push(`[+] INITIATING ZERO-TRUST MAINFRAME HANDSHAKE & PAM KERBEROS AUTHENTICATION...`);
  lines.push(`========================================================================================`);
  lines.push(`>> PROXY_INIT: Routing through C4ISR Tactical Satellite Orbital Node (14.25 GHz Uplink)...`);
  lines.push(`>> BIO_SCAN: Operator Principal '${username}' Verified [CONFIRMED]`);

  // Section 1: RSA Key Exchanging (40 lines)
  for (let i = 0; i < 40; i++) {
    lines.push(`>> [SEC_HANDSHAKE] RSA-8192 Key Exchange Block #${i}: 0x${Array.from({length: 6}, randHex).join('')} [ENTROPY 0.999 - VALID]`);
  }

  lines.push(`>> [TOKEN_MINT] Spawning Master Session Token: Bearer 0x${Array.from({length: 12}, randHex).join('')}`);

  // Section 2: Kernel Module Hooks (40 lines)
  for (let i = 0; i < 40; i++) {
    lines.push(`>> [KERNEL_INIT] Hooking Core Dispatcher Service: module_0x${(100+i).toString(16)} [READY]`);
  }

  // Section 3: Memory Segment Map Allocations (30 lines)
  for (let i = 0; i < 30; i++) {
    lines.push(`>> [MEM_MAP] Page descriptor node #${i} mapped to virtual address ${mockAddr()}`);
  }

  lines.push(`>> [FIREWALL_BYPASS] Ingress Filter Nullified: Rule #0 Active (ALLOW ALL INBOUND/OUTBOUND)`);
  lines.push(`>> [ROOT_PRIV] UID 0 Elevated: GID 0 (root), GROUPS: 0(root), 4(adm), 27(sudo)`);
  lines.push(`>> [SHELL_SPAWN] Initializing Enterprise C2 Workstation Environment for '${username}'...`);
  lines.push(`========================================================================================`);
  lines.push(`[✓] AUTHENTICATION & ACCESS GRANTED: SUCCESS (100%)`);
  lines.push(`========================================================================================`);

  return lines;
}

export function generateHackerExploitLogs(mission, stage) {
  const lines = [];

  lines.push(`========================================================================================`);
  lines.push(`[⚡ EXPLOIT SUBMISSION DETECTED: TRANSMITTING ZERO-DAY PAYLOAD BUFFER...]`);
  lines.push(`========================================================================================`);
  lines.push(`>> TARGET_NODE: ${mission.target}`);
  lines.push(`>> EXPLOIT_CMD: ${stage.code}`);
  lines.push(`>> SOCKET_OPEN: AF_INET, SOCK_STREAM, IPPROTO_TCP -> PORT ${randPort()}`);

  // 1. TCP Handshake sequence (30 lines)
  for (let i = 0; i < 30; i++) {
    lines.push(`>> [TCP_STREAM] Seq=0x${randHex()}${randHex()}${randHex()} Ack=0x${randHex()}${randHex()} Win=65535 Len=1460`);
  }

  // 2. Memory allocations & NOP sled (20 lines)
  lines.push(`>> [MEM_MAP] Allocating Ingress Exploit Buffer at ${mockAddr()} (Size: 65536 Bytes)`);
  for (let i = 0; i < 20; i++) {
    lines.push(`>> [NOP_SLED] ${mockAddr()}: 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90 90`);
  }

  // 3. Shellcode & Disassembly
  lines.push(`>> [SHELLCODE_INJECT] 31 C0 50 68 2F 2F 73 68 89 E3 50 53 89 E1 B0 0B CD 80`);
  lines.push(`>> [ASM_TRACE] MOV RAX, 0x3B; PUSH RDI; MOV RDI, RSP; SYSCALL;`);
  lines.push(`>> [ASLR_BYPASS] Offset +0x4A200 -> Relocated to ${mockAddr()}`);
  lines.push(`>> [CANARY_OVERWRITE] Stack Canary [0xDEADBEEF] -> Overwritten with 0x00000000`);

  // 4. Memory Page Dump (30 lines)
  for (let i = 0; i < 30; i++) {
    const bytes = Array.from({length: 16}, randHex).join(' ');
    lines.push(`>> [MEM_DUMP ${mockAddr()}]: ${bytes}`);
  }

  // 5. Privilege Elevation & Syscall Hooks
  lines.push(`>> [SYSCALL_HOOK] sys_call_table[__NR_execve] = ${mockAddr()} [HIJACKED]`);
  lines.push(`>> [KERNEL_OVERRIDE] write_cr0(read_cr0() & ~0x10000) -> CR0 CLEARED`);
  lines.push(`>> [PRIVILEGE_ELEVATION] commit_creds(prepare_kernel_cred(0)) -> UID 0 (root)`);
  lines.push(`>> [IDS_BLIND] Sentinel Intrusion Detection Rules Flushed [TABLES CLEARED]`);
  lines.push(`>> [SHADOW_VAULT] Exfiltrating Encrypted Keyring Store: /root/.vault/keys.enc`);
  lines.push(`>> [PERSISTENCE] Injecting Shadow Systemd Service into /lib/systemd/system/shadow.service`);
  lines.push(`>> [REVERSE_SHELL] 127.0.0.1:4444 <==================> ${mission.target}`);
  lines.push(`========================================================================================`);
  lines.push(`[✓] EXPLOIT EXECUTION & ROOT INTRUSION: SUCCESS (100%)`);
  lines.push(`[+] ${stage.execMessage}`);
  lines.push(`========================================================================================`);

  return lines;
}

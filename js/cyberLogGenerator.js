/**
 * CYBER//TYPE CINEMA LOG GENERATOR ENGINE
 * Generates 150-250+ realistic, authentic hacker logs, kernel memory maps,
 * assembly opcodes, network socket traces, and telemetry streams for 20-40s runs.
 */

const mockAddr = () => '0x' + Math.floor(Math.random() * 0xFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
const randHex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
const randPort = () => Math.floor(1024 + Math.random() * 64000);
const randIP = () => `192.168.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}`;

export function generateEntranceLogs(mode, arg = '') {
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

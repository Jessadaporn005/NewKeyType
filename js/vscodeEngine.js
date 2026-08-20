/**
 * CYBER//TYPE CODE PLAYGROUND & RULE-BASED TUTOR ACADEMY
 * Dual-Pane Live Editor, Line Numbering, Syntax Highlighting, Real-Time Keyword Docstring Guides (Thai/Eng),
 * Multi-Language Curriculum (HTML/CSS/JS, Python, Java, C++, Rust, SQL, Bash/PowerShell),
 * Syntax Auto-Pairing, Code Export/Copy, Cursor Position Coordinates, and Embedded Rule Guide.
 */

export const CODE_KEYWORD_DOCS = {
  // Python
  def: { lang: 'python', title: 'def (Function Definition)', desc: 'ใช้สำหรับประกาศฟังก์ชันใหม่ใน Python เพื่อจัดกลุ่มโค้ดที่สามารถเรียกใช้ซ้ำได้ ช่วยลดความซ้ำซ้อนและทำให้โค้ดอ่านง่ายขึ้น', example: 'def my_function(param):\n    return param * 2' },
  class: { lang: 'python/java/cpp', title: 'class (Class Definition)', desc: 'ใช้สำหรับสร้าง Class ตามหลัก Object-Oriented Programming (OOP) กำหนดพิมพ์เขียวของ Object ประกอบด้วย Properties และ Methods', example: 'class Hacker:\n    def __init__(self, name):\n        self.name = name' },
  return: { lang: 'general', title: 'return (Return Statement)', desc: 'ส่งค่าผลลัพธ์ออกจากฟังก์ชันและจบการทำงานของฟังก์ชันทันที หากไม่ใส่ค่าจะส่งกลับ None/void', example: 'return result' },
  import: { lang: 'python/js/java', title: 'import (Module Import)', desc: 'นำเข้า Library, โมดูล หรือแพ็กเกจภายนอกเข้ามาใช้งานในโปรแกรม เช่น math, sys, os, datetime', example: 'import math\nfrom datetime import datetime' },
  if: { lang: 'general', title: 'if (Conditional Branching)', desc: 'ตรวจสอบเงื่อนไขทางตรรกะ ถ้าเป็นจริง (True) จะเข้าไปประมวลผลคำสั่งในบล็อก', example: 'if score >= 80:\n    print("Grade A")' },
  elif: { lang: 'python', title: 'elif (Else If)', desc: 'ตรวจสอบเงื่อนไขเพิ่มเติมเมื่อเงื่อนไข if ก่อนหน้าเป็นเท็จ ช่วยให้ตรวจสอบได้หลายเงื่อนไขตามลำดับ', example: 'elif score >= 70:\n    print("Grade B")' },
  else: { lang: 'general', title: 'else (Fallback Branch)', desc: 'ทำงานเมื่อเงื่อนไข if / elif ทั้งหมดก่อนหน้าเป็นเท็จ (False) เป็นทางเลือกสุดท้าย', example: 'else:\n    print("Grade F")' },
  for: { lang: 'general', title: 'for (Loop Iteration)', desc: 'วนลูปประมวลผลข้อมูลตามจำนวนรอบหรือสมาชิกใน List / Range / Array', example: 'for i in range(10):\n    print(i)' },
  while: { lang: 'general', title: 'while (Conditional Loop)', desc: 'วนลูปซ้ำตราบใดที่เงื่อนไขยังคงเป็นจริง (True) เหมาะกับงานที่ไม่ทราบจำนวนรอบที่แน่นอน', example: 'while count < 5:\n    count += 1' },
  lambda: { lang: 'python', title: 'lambda (Anonymous Function)', desc: 'สร้างฟังก์ชันนิรนามแบบบรรทัดเดียว นิยมใช้ร่วมกับ map(), filter(), sorted()', example: 'double = lambda x: x * 2' },
  try: { lang: 'general', title: 'try (Exception Handling)', desc: 'บล็อกทดลองรันโค้ดที่อาจเกิด Error เพื่อดักจับข้อผิดพลาดไม่ให้โปรแกรม Crash', example: 'try:\n    x = 1 / 0\nexcept Exception as e:\n    print(e)' },

  // HTML & Web
  '<div>': { lang: 'html', title: '<div> (Division Container)', desc: 'แท็ก Container หลักสำหรับจัดกลุ่มองค์ประกอบในหน้าเว็บเพื่อจัด Layout และ CSS Flexbox/Grid', example: '<div class="card">\n  <h2>Title</h2>\n</div>' },
  '<span>': { lang: 'html', title: '<span> (Inline Container)', desc: 'แท็กสำหรับจัดกลุ่มข้อความหรือองค์ประกอบแบบ Inline (ไม่ขึ้นบรรทัดใหม่)', example: '<span style="color: cyan;">CyberDeck</span>' },
  '<button>': { lang: 'html', title: '<button> (Clickable Button)', desc: 'สร้างปุ่มที่ผู้ใช้สามารถคลิกเพื่อสั่งงาน JavaScript หรือส่งฟอร์ม', example: '<button onclick="handleClick()">SUBMIT</button>' },
  '<h1>': { lang: 'html', title: '<h1> (Primary Heading)', desc: 'หัวข้อหลักระดับสูงสุดของหน้าเว็บ สำคัญต่อโครงสร้างเนื้อหาและการจัดอันดับ SEO', example: '<h1>Cyber Security Terminal</h1>' },
  '<style>': { lang: 'html', title: '<style> (Embedded CSS)', desc: 'แท็กสำหรับเขียนโค้ดตกแต่ง CSS ภายในไฟล์ HTML', example: '<style>\n  body { background: #0c0c0c; }\n</style>' },
  '<script>': { lang: 'html', title: '<script> (Client JavaScript)', desc: 'แท็กสำหรับเขียนหรือนำเข้าโค้ด JavaScript มาทำงานบนหน้าเว็บ', example: '<script>\n  console.log("System Online");\n</script>' },
  fetch: { lang: 'javascript', title: 'fetch() (Asynchronous HTTP Request)', desc: 'คำสั่ง JavaScript สำหรับดึงข้อมูล API หรือส่ง Request ไปยังเซิร์ฟเวอร์แบบ Async', example: 'const res = await fetch("https://api.github.com");\nconst data = await res.json();' },
  addEventListener: { lang: 'javascript', title: 'addEventListener() (DOM Event Binding)', desc: 'ดักจับเหตุการณ์บนหน้าเว็บ เช่น คลิก (click), พิมพ์ (keydown), เลื่อนเมาส์ (mousemove)', example: 'btn.addEventListener("click", () => alert("Clicked!"));' },

  // Java
  'public static void main': { lang: 'java', title: 'public static void main(String[] args)', desc: 'จุดเริ่มต้นการทำงาน (Entry Point) หลักของโปรแกรม Java JVM จะมองหาฟังก์ชันนี้เป็นอันดับแรก', example: 'public static void main(String[] args) {\n    System.out.println("Hello Java");\n}' },
  System: { lang: 'java', title: 'System.out.println()', desc: 'คำสั่งแสดงผลข้อความออกทางหน้าจอ Standard Output (Console) ในภาษา Java', example: 'System.out.println("Access Granted");' },

  // C & C++
  '#include': { lang: 'cpp', title: '#include (Preprocessor Directive)', desc: 'คำสั่ง Preprocessor สำหรับนำเข้า Header Files เช่น <iostream>, <vector>, <memory>', example: '#include <iostream>\n#include <vector>' },
  malloc: { lang: 'c/cpp', title: 'malloc() (Dynamic Memory Allocation)', desc: 'จองหน่วยความจำแบบไดนามิกใน Heap Memory ในภาษา C โดยส่งคืน Void Pointer (ต้อง free() เสมอเมื่อใช้เสร็จ)', example: 'int *arr = (int*)malloc(10 * sizeof(int));\nfree(arr);' },
  std: { lang: 'cpp', title: 'std:: (Standard Namespace)', desc: 'Namespace มาตรฐานของภาษา C++ บรรจุคลาสและฟังก์ชันมาตรฐาน เช่น cout, cin, vector, string', example: 'std::cout << "Target Locked" << std::endl;' },

  // Rust
  fn: { lang: 'rust', title: 'fn (Function Declaration)', desc: 'คีย์เวิร์ดสำหรับประกาศฟังก์ชันในภาษา Rust', example: 'fn calculate_hash(data: &str) -> u64 {\n    // code\n}' },
  let: { lang: 'rust/js', title: 'let (Variable Binding)', desc: 'ประกาศตัวแปร ใน Rust ตัวแปรจะเป็น Immutable (แก้ไขไม่ได้) โดยปริยาย เว้นแต่จะใส่ `mut`', example: 'let mut counter = 0;\ncounter += 1;' },
  match: { lang: 'rust', title: 'match (Pattern Matching)', desc: 'โครงสร้างควบคุมความปลอดภัยสูงใน Rust ตรวจสอบรูปแบบครอบคลุมทุกกรณี (Exhaustive Pattern Matching)', example: 'match status {\n    Ok(val) => println!("Success: {}", val),\n    Err(e) => eprintln!("Error: {}", e),\n}' },

  // SQL
  SELECT: { lang: 'sql', title: 'SELECT (Query Data)', desc: 'คำสั่งหลักใน SQL สำหรับดึงข้อมูลจากตารางในฐานข้อมูล สามารถระบุคอลัมน์ที่ต้องการได้', example: 'SELECT username, level, credits FROM users WHERE level >= 5;' },
  JOIN: { lang: 'sql', title: 'JOIN (Table Relationship)', desc: 'เชื่อมความสัมพันธ์ระหว่าง 2 ตารางขึ้นไป โดยอิงจากคอลัมน์ที่มีข้อมูลตรงกัน เช่น Foreign Key', example: 'SELECT u.name, o.order_date\nFROM users u\nJOIN orders o ON u.id = o.user_id;' }
};

export const CODE_CURRICULUM = {
  python: [
    {
      id: 'py_01',
      title: '01. Python Syntax & Variable Manipulation',
      desc: 'เรียนรู้การประกาศตัวแปร, การประมวลผล String และฟังก์ชัน print() พร้อมหลักการทำงานของ Dynamic Typing',
      initialCode: `# Python Mission 01: System Status Monitor
operator_name = "Anan"
security_level = 5
threat_detected = False

print(f"[+] OPERATOR: {operator_name}")
print(f"[+] DEFCON CLEARANCE: LEVEL {security_level}")
print(f"[+] NETWORK SENTINEL THREAT: {'ALERT' if threat_detected else 'NOMINAL'}")
`,
      expectedOutput: 'OPERATOR: Anan'
    },
    {
      id: 'py_02',
      title: '02. Functions & Encryption Payload Generator',
      desc: 'สร้างฟังก์ชันเข้ารหัสข้อความด้วย XOR Cipher และ List Comprehension เพื่อความเร็วระดับมิลลิวินาที',
      initialCode: `def xor_encrypt(payload: str, key: int = 0x5A) -> str:
    """Encrypts ASCII string using XOR Key"""
    encrypted_bytes = [ord(char) ^ key for char in payload]
    return " ".join(f"0x{b:02X}" for b in encrypted_bytes)

secret_msg = "CYBERDECK_ROOT_KEY_2026"
hex_cipher = xor_encrypt(secret_msg)

print("[+] ORIGINAL MESSAGE:", secret_msg)
print("[+] ENCRYPTED HEX STREAM:", hex_cipher)
`,
      expectedOutput: 'ENCRYPTED HEX STREAM'
    },
    {
      id: 'py_03',
      title: '03. Dictionaries & Telemetry Metrics Analyzer',
      desc: 'จัดการข้อมูลเชิงโครงสร้างด้วย Dicts, Loops และการคำนวณสถิติสถานะคลัสเตอร์',
      initialCode: `node_cluster = {
    "node_alpha": {"latency_ms": 12, "load_pct": 34},
    "node_bravo": {"latency_ms": 85, "load_pct": 92},
    "node_charlie": {"latency_ms": 18, "load_pct": 45}
}

print("--- CLUSTER HEALTH DIAGNOSTICS ---")
for name, metrics in node_cluster.items():
    status = "CRITICAL" if metrics["load_pct"] > 80 else "STABLE"
    print(f"[{status}] {name.upper()}: {metrics['latency_ms']}ms | LOAD: {metrics['load_pct']}%")
`,
      expectedOutput: 'CLUSTER HEALTH DIAGNOSTICS'
    }
  ],

  html: [
    {
      id: 'html_01',
      title: '01. Responsive Cyberpunk Card & Neon Glow',
      desc: 'สร้างหน้าเว็บ UI Card สไตล์ Cyberpunk ด้วย HTML5 & Modern CSS3 (ดูผลลัพธ์ฝั่งขวาแบบสดๆ)',
      initialCode: `<!DOCTYPE html>
<html>
<head>
<style>
  body {
    background: #060d09;
    color: #00ff66;
    font-family: 'Segoe UI', monospace;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
  }
  .cyber-card {
    background: rgba(0, 20, 10, 0.85);
    border: 1px solid #00ff66;
    box-shadow: 0 0 25px rgba(0, 255, 102, 0.3);
    padding: 24px;
    border-radius: 8px;
    width: 320px;
    text-align: center;
  }
  .cyber-btn {
    background: #00ff66;
    color: #000000;
    border: none;
    padding: 10px 20px;
    font-weight: bold;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 15px;
    transition: 0.2s;
  }
  .cyber-btn:hover {
    background: #00e5ff;
    box-shadow: 0 0 15px #00e5ff;
  }
</style>
</head>
<body>
  <div class="cyber-card">
    <h2>CYBER//DECK UI</h2>
    <p>Status: All Systems Nominal</p>
    <button class="cyber-btn" onclick="alert('Access Granted!')">INFILTRATE</button>
  </div>
</body>
</html>
`,
      expectedOutput: '<!DOCTYPE html>'
    }
  ],

  java: [
    {
      id: 'java_01',
      title: '01. Java OOP & Cyber Operative Entity',
      desc: 'ฝึกสร้าง Class, Encapsulation, Methods และการสืบทอดคุณสมบัติใน Java',
      initialCode: `public class CyberOperative {
    private String codename;
    private int level;
    private int credits;

    public CyberOperative(String codename, int level) {
        this.codename = codename;
        this.level = level;
        this.credits = 1000;
    }

    public void displayProfile() {
        System.out.println("=================================");
        System.out.println("OPERATIVE : " + this.codename.toUpperCase());
        System.out.println("RANK      : LEVEL " + this.level);
        System.out.println("BALANCE   : " + this.credits + " CC");
        System.out.println("=================================");
    }

    public static void main(String[] args) {
        CyberOperative op = new CyberOperative("Anan", 5);
        op.displayProfile();
    }
}
`,
      expectedOutput: 'OPERATIVE : ANAN'
    }
  ],

  cpp: [
    {
      id: 'cpp_01',
      title: '01. C++ Pointers, References & Memory Management',
      desc: 'ทำความเข้าใจ Memory Address, Pointers (*), Dereferencing และ Dynamic Structs',
      initialCode: `#include <iostream>
#include <string>
#include <memory>

struct QuantumNode {
    std::string ip;
    int latency;
    bool isArmed;
};

int main() {
    std::cout << "[+] INITIALIZING C++ QUANTUM MEMORY ALLOCATION..." << std::endl;
    
    // Smart Pointer allocation
    auto node = std::make_unique<QuantumNode>();
    node->ip = "192.168.1.100";
    node->latency = 8;
    node->isArmed = true;

    std::cout << "[✓] NODE IP     : " << node->ip << std::endl;
    std::cout << "[✓] LATENCY     : " << node->latency << " ms" << std::endl;
    std::cout << "[✓] HEAP MEMORY : " << sizeof(*node) << " Bytes Allocated" << std::endl;

    return 0;
}
`,
      expectedOutput: 'QUANTUM MEMORY ALLOCATION'
    }
  ],

  rust: [
    {
      id: 'rust_01',
      title: '01. Rust Ownership, Borrowing & Pattern Matching',
      desc: 'เรียนรู้ระบบความปลอดภัยหน่วยความจำระดับสูงสุดของ Rust ด้วย Borrow Checker',
      initialCode: `fn inspect_packet(payload: &str) -> Result<usize, &'static str> {
    if payload.is_empty() {
        return Err("Empty packet dropped");
    }
    println!("[+] Packet Verified: '{}'", payload);
    Ok(payload.len())
}

fn main() {
    let packet_data = String::from("SYN_ACK_QUANTUM_HANDSHAKE_0x89");
    
    match inspect_packet(&packet_data) {
        Ok(bytes) => println!("[✓] TRANSMISSION SUCCESS: {} Bytes Injected", bytes),
        Err(err) => eprintln!("[✗] TRANSMISSION FAILED: {}", err),
    }
}
`,
      expectedOutput: 'SYN_ACK_QUANTUM_HANDSHAKE'
    }
  ],

  sql: [
    {
      id: 'sql_01',
      title: '01. High-Performance SQL Queries & Aggregations',
      desc: 'ฝึกเขียนคำสั่งดึงข้อมูล, การกรองเงื่อนไข และจัดกลุ่มข้อมูลสถิติ',
      initialCode: `-- SQL Cyber Database Query
SELECT 
    target_corp,
    COUNT(node_id) AS total_nodes,
    AVG(reward_cc) AS avg_reward,
    MAX(difficulty) AS max_diff
FROM shadow_contracts
WHERE is_hacked = FALSE
GROUP BY target_corp
HAVING COUNT(node_id) > 1
ORDER BY avg_reward DESC;
`,
      expectedOutput: 'SELECT'
    }
  ],

  bash: [
    {
      id: 'bash_01',
      title: '01. DevOps Bash Scripting & Log Analysis Pipes',
      desc: 'เขียนสคริปต์กรอง Log ไฟล์ด้วย Pipes (|), awk, grep, sort และ uniq',
      initialCode: `#!/bin/bash
# CyberDeck Log Infiltration Analyzer
echo "[+] PARSING FIREWALL INTRUSION LOGS..."

SAMPLE_LOGS="
192.168.1.50 - ROOT LOGIN FAILED
10.0.0.12 - PORT SCAN DETECTED
192.168.1.50 - ROOT LOGIN FAILED
172.16.0.4 - EXPLOIT PAYLOAD BLOCKED
192.168.1.50 - ROOT LOGIN FAILED"

echo "$SAMPLE_LOGS" | grep "FAILED" | sort | uniq -c | awk '{print "[!] WARNING: IP " $2 " Failed " $1 " Times"}'
`,
      expectedOutput: 'PARSING FIREWALL INTRUSION LOGS'
    }
  ]
};

export class VscodeEngine {
  constructor(app, soundEngine, toastManager) {
    this.app = app;
    this.sound = soundEngine;
    this.toasts = toastManager;

    this.container = null;
    this.currentLanguage = 'python';
    this.currentLessonIndex = 0;
    this.editorTextarea = null;
    this.lineNumbersEl = null;
    this.outputConsole = null;
    this.webPreviewIframe = null;
    this.hoverTooltipEl = null;
    this.aiChatContainer = null;
    this.aiInput = null;
    this.cursorPosEl = null;
  }

  init(containerEl) {
    this.container = containerEl;
    this.renderLayout();
  }

  renderLayout() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="vscode-wrapper">
        <!-- VS Code Top Navigation Header -->
        <div class="vscode-topbar">
          <div class="vscode-brand">
            <span class="vsc-icon">⚡</span>
            <span class="vsc-title">CYBER//CODE STUDIO v4.5 [RULE GUIDE]</span>
          </div>

          <div class="vscode-lang-tabs">
            <button class="vsc-tab active" data-lang="python">🐍 Python</button>
            <button class="vsc-tab" data-lang="html">🌐 HTML/CSS</button>
            <button class="vsc-tab" data-lang="java">☕ Java</button>
            <button class="vsc-tab" data-lang="cpp">⚡ C / C++</button>
            <button class="vsc-tab" data-lang="rust">🦀 Rust</button>
            <button class="vsc-tab" data-lang="sql">🗄️ SQL</button>
            <button class="vsc-tab" data-lang="bash">💻 Bash</button>
          </div>

          <div class="vscode-top-actions">
            <button class="vsc-btn vsc-btn-run" id="vscBtnRun">▶ RUN [Ctrl+Enter]</button>
            <button class="vsc-btn vsc-btn-reset" id="vscBtnReset">↺ RESET</button>
            <button class="vsc-btn vsc-btn-exit" id="vscBtnExit">✖ CLOSE [ESC]</button>
          </div>
        </div>

        <!-- Main Dual-Pane Playground Area -->
        <div class="vscode-main-panes">
          <!-- Left Pane: Code Editor & Mission Guidance -->
          <div class="vscode-pane vscode-left-pane">
            <div class="vsc-pane-header">
              <div class="vsc-file-info">
                <span class="vsc-file-icon">📄</span>
                <span class="vsc-file-name" id="vscFileName">main.py</span>
                <span class="vsc-lesson-badge" id="vscLessonBadge">MISSION 01/03</span>
              </div>
              <div class="vsc-editor-tools">
                <button class="vsc-mini-btn" id="vscBtnCopyCode" title="Copy code to clipboard">📋 COPY</button>
                <button class="vsc-mini-btn" id="vscBtnExport" title="Export file locally">💾 EXPORT</button>
                <button class="vsc-mini-btn" id="vscBtnClear" title="Clear code editor">🗑️ CLEAR</button>
                <div class="vsc-lesson-nav">
                  <button class="vsc-mini-btn" id="vscBtnPrevLesson" title="Previous Mission">◀</button>
                  <button class="vsc-mini-btn" id="vscBtnNextLesson" title="Next Mission">▶</button>
                </div>
              </div>
            </div>

            <!-- Interactive Mission Objective Banner -->
            <div class="vsc-mission-banner">
              <div class="vsc-mission-title" id="vscMissionTitle">Loading...</div>
              <div class="vsc-mission-desc" id="vscMissionDesc">Description...</div>
            </div>

            <!-- Code Editor Container with Line Numbers -->
            <div class="vsc-editor-box">
              <div class="vsc-line-numbers" id="vscLineNumbers">1</div>
              <textarea class="vsc-textarea" id="vscTextarea" spellcheck="false" placeholder="Write code here..."></textarea>
            </div>

            <!-- Editor Bottom Status Bar (Cursor Coordinates & Encoding) -->
            <div class="vsc-status-bar">
              <div class="vsc-status-left">
                <span id="vscCursorPos">Ln 1, Col 1</span>
                <span>UTF-8</span>
                <span>Spaces: 4</span>
              </div>
              <div class="vsc-status-right">
                <span id="vscLangRuntimeBadge" class="vsc-lang-tag">PYTHON 3.12</span>
              </div>
            </div>

            <!-- Floating Keyword Hover Docstring Tooltip -->
            <div class="vsc-hover-tooltip hidden" id="vscHoverTooltip">
              <div class="vsc-tip-title" id="vscTipTitle">def (Function)</div>
              <div class="vsc-tip-desc" id="vscTipDesc">Description</div>
              <pre class="vsc-tip-example" id="vscTipExample"></pre>
            </div>
          </div>

          <!-- Draggable / Resizable Divider -->
          <div class="vscode-divider"></div>

          <!-- Right Pane: capability-labeled output, static preview & rule guide -->
          <div class="vscode-pane vscode-right-pane">
            <div class="vsc-pane-header">
              <div class="vsc-tabs-right">
                <button class="vsc-tab-right active" id="vscTabOutput">⚡ TERMINAL OUTPUT</button>
                <button class="vsc-tab-right" id="vscTabWebPreview">🌐 STATIC WEB PREVIEW</button>
                <button class="vsc-tab-right vsc-tab-ai" id="vscTabAiTutor">📋 RULE-BASED TUTOR</button>
              </div>
              <div class="vsc-output-stats" id="vscOutputStats">READY</div>
            </div>

            <div class="vsc-right-content">
              <!-- 1. Console Log Output View -->
              <div class="vsc-console-output" id="vscConsoleOutput">
                <div class="vsc-out-line system-line">[+] RUNNER CHECKS CAPABILITY ON EACH RUN. FALLBACK OUTPUT IS LABELED SIMULATED.</div>
              </div>

              <!-- 2. Static Web Preview IFrame View; scripts and forms are sandbox-blocked -->
              <div class="vsc-web-preview-container hidden" id="vscWebPreviewContainer">
                <iframe class="vsc-web-iframe" id="vscWebIframe" sandbox=""></iframe>
              </div>

              <!-- 3. Rule-based tutor drawer -->
              <div class="vsc-ai-tutor-container hidden" id="vscAiTutorContainer">
                <div class="ai-tutor-header">
                  <div class="ai-avatar">🤖</div>
                  <div class="ai-meta">
                    <span class="ai-name">CYBER//TUTOR RULE GUIDE v2.4</span>
                    <span class="ai-role">Template Explanations & Checklists — Not a Parser/Linter</span>
                  </div>
                </div>

                <!-- Quick Action Chips -->
                <div class="ai-quick-chips">
                  <button class="ai-chip" id="chipExplainCode">💡 อธิบายโค้ดนี้</button>
                  <button class="ai-chip" id="chipCheckBugs">🔍 ตรวจหาบั๊ก</button>
                  <button class="ai-chip" id="chipOptimize">🚀 วิธีเขียนให้เร็วขึ้น</button>
                  <button class="ai-chip" id="chipExamples">📖 ตัวอย่างเพิ่มเติม</button>
                </div>

                <!-- Chat History Log -->
                <div class="ai-chat-history" id="aiChatHistory">
                  <div class="ai-msg ai-msg-bot">
                    <div class="msg-bubble">
                      สวัสดีครับคุณ <strong>${this.escapeHtml(this.app.username || 'Operative')}</strong>! นี่คือ <strong>Rule-Based Code Guide</strong> ที่ให้คำอธิบายและ checklist ทั่วไป ไม่ใช่โมเดล AI, parser, compiler หรือ linter และไม่รับรองว่าโค้ดถูกต้องครับ
                    </div>
                  </div>
                </div>

                <!-- Chat Input Form -->
                <div class="ai-chat-input-bar">
                  <input type="text" class="ai-input" id="aiChatInput" placeholder="พิมพ์คำถาม เช่น 'โค้ดนี้ทำงานยังไง', 'Pointer คืออะไร'..." />
                  <button class="ai-btn-send" id="aiBtnSend">ถาม Rule Guide ➔</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.editorTextarea = this.container.querySelector('#vscTextarea');
    this.lineNumbersEl = this.container.querySelector('#vscLineNumbers');
    this.outputConsole = this.container.querySelector('#vscConsoleOutput');
    this.webPreviewIframe = this.container.querySelector('#vscWebIframe');
    this.hoverTooltipEl = this.container.querySelector('#vscHoverTooltip');
    this.aiChatContainer = this.container.querySelector('#vscAiTutorContainer');
    this.aiInput = this.container.querySelector('#aiChatInput');
    this.cursorPosEl = this.container.querySelector('#vscCursorPos');

    this.bindEvents();
    this.loadLanguage(this.currentLanguage, 0);
  }

  bindEvents() {
    // Language Tab Switching
    const tabs = this.container.querySelectorAll('.vsc-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const lang = tab.dataset.lang;
        this.loadLanguage(lang, 0);
        if (this.sound) this.sound.playKey(false);
      });
    });

    // Run Button
    const runBtn = this.container.querySelector('#vscBtnRun');
    if (runBtn) {
      runBtn.addEventListener('click', () => this.runCode());
    }

    // Reset Button
    const resetBtn = this.container.querySelector('#vscBtnReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.loadLanguage(this.currentLanguage, this.currentLessonIndex);
        if (this.sound) this.sound.playKey(false);
      });
    }

    // Copy Code Button
    const copyBtn = this.container.querySelector('#vscBtnCopyCode');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (this.editorTextarea) {
          navigator.clipboard.writeText(this.editorTextarea.value).then(() => {
            if (this.sound) this.sound.playSuccessFanfare();
            if (this.toasts && this.toasts.show) {
              this.toasts.show('SUCCESS', 'Copied code to clipboard!', 2200);
            }
          });
        }
      });
    }

    // Clear Code Button
    const clearBtn = this.container.querySelector('#vscBtnClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (this.editorTextarea) {
          this.editorTextarea.value = '';
          this.updateLineNumbers();
          this.updateCursorStatus();
          if (this.sound) this.sound.playKey(false);
        }
      });
    }

    // Export File Button
    const exportBtn = this.container.querySelector('#vscBtnExport');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportCurrentCode());
    }

    // Exit Button
    const exitBtn = this.container.querySelector('#vscBtnExit');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
        this.app.returnToCli();
      });
    }

    // Lesson Prev / Next
    const prevBtn = this.container.querySelector('#vscBtnPrevLesson');
    const nextBtn = this.container.querySelector('#vscBtnNextLesson');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const lessons = CODE_CURRICULUM[this.currentLanguage] || [];
        if (this.currentLessonIndex > 0) {
          this.loadLanguage(this.currentLanguage, this.currentLessonIndex - 1);
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const lessons = CODE_CURRICULUM[this.currentLanguage] || [];
        if (this.currentLessonIndex < lessons.length - 1) {
          this.loadLanguage(this.currentLanguage, this.currentLessonIndex + 1);
        }
      });
    }

    // Right Pane Tab Switch
    const tabOutput = this.container.querySelector('#vscTabOutput');
    const tabWeb = this.container.querySelector('#vscTabWebPreview');
    const tabAi = this.container.querySelector('#vscTabAiTutor');
    const outBox = this.container.querySelector('#vscConsoleOutput');
    const webBox = this.container.querySelector('#vscWebPreviewContainer');
    const aiBox = this.container.querySelector('#vscAiTutorContainer');

    const switchRightTab = (activeTab, activeView) => {
      [tabOutput, tabWeb, tabAi].forEach(t => t && t.classList.remove('active'));
      [outBox, webBox, aiBox].forEach(v => v && v.classList.add('hidden'));

      if (activeTab) activeTab.classList.add('active');
      if (activeView) activeView.classList.remove('hidden');
      if (this.sound) this.sound.playKey(false);
    };

    if (tabOutput) tabOutput.addEventListener('click', () => switchRightTab(tabOutput, outBox));
    if (tabWeb) tabWeb.addEventListener('click', () => switchRightTab(tabWeb, webBox));
    if (tabAi) tabAi.addEventListener('click', () => switchRightTab(tabAi, aiBox));

    // Editor Keystroke & Line Number updates
    if (this.editorTextarea) {
      this.editorTextarea.addEventListener('input', () => {
        this.updateLineNumbers();
        this.updateCursorStatus();
        this.inspectKeywordAtCursor();
        if (this.currentLanguage === 'html') {
          this.renderWebPreview();
        }
      });

      this.editorTextarea.addEventListener('keydown', (e) => {
        // Ctrl + Enter to Run
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          this.runCode();
          return;
        }

        // Tab Key Indentation
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = this.editorTextarea.selectionStart;
          const end = this.editorTextarea.selectionEnd;
          const value = this.editorTextarea.value;
          this.editorTextarea.value = value.substring(0, start) + '    ' + value.substring(end);
          this.editorTextarea.selectionStart = this.editorTextarea.selectionEnd = start + 4;
          this.updateLineNumbers();
          this.updateCursorStatus();
          return;
        }

        // Syntax Auto-Pairing for brackets and quotes
        const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
        if (pairs[e.key]) {
          e.preventDefault();
          const start = this.editorTextarea.selectionStart;
          const end = this.editorTextarea.selectionEnd;
          const val = this.editorTextarea.value;
          const closing = pairs[e.key];
          this.editorTextarea.value = val.substring(0, start) + e.key + closing + val.substring(end);
          this.editorTextarea.selectionStart = this.editorTextarea.selectionEnd = start + 1;
          this.updateLineNumbers();
          this.updateCursorStatus();
          if (this.sound) this.sound.playKey(false);
          return;
        }

        if (this.sound && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter')) {
          this.sound.playKey(false);
        }
      });

      this.editorTextarea.addEventListener('click', () => {
        this.updateCursorStatus();
        this.inspectKeywordAtCursor();
      });

      this.editorTextarea.addEventListener('keyup', () => {
        this.updateCursorStatus();
        this.inspectKeywordAtCursor();
      });
    }

    // AI Tutor Chat Events
    const btnSend = this.container.querySelector('#aiBtnSend');
    if (btnSend) btnSend.addEventListener('click', () => this.handleAiQuery());
    if (this.aiInput) {
      this.aiInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleAiQuery();
        }
      });
    }

    // AI Action Chips
    const chipExp = this.container.querySelector('#chipExplainCode');
    const chipBug = this.container.querySelector('#chipCheckBugs');
    const chipOpt = this.container.querySelector('#chipOptimize');
    const chipEx = this.container.querySelector('#chipExamples');

    if (chipExp) chipExp.addEventListener('click', () => this.askAiPrompt('explain'));
    if (chipBug) chipBug.addEventListener('click', () => this.askAiPrompt('bugs'));
    if (chipOpt) chipOpt.addEventListener('click', () => this.askAiPrompt('optimize'));
    if (chipEx) chipEx.addEventListener('click', () => this.askAiPrompt('examples'));
  }

  loadLanguage(lang, lessonIdx = 0) {
    this.currentLanguage = lang;
    this.currentLessonIndex = lessonIdx;

    const lessons = CODE_CURRICULUM[lang] || CODE_CURRICULUM.python;
    const lesson = lessons[lessonIdx] || lessons[0];

    const extMap = { python: 'py', html: 'html', java: 'java', cpp: 'cpp', rust: 'rs', sql: 'sql', bash: 'sh' };
    const ext = extMap[lang] || 'txt';

    const fileNameEl = this.container.querySelector('#vscFileName');
    const badgeEl = this.container.querySelector('#vscLessonBadge');
    const titleEl = this.container.querySelector('#vscMissionTitle');
    const descEl = this.container.querySelector('#vscMissionDesc');
    const runtimeBadge = this.container.querySelector('#vscLangRuntimeBadge');

    if (fileNameEl) fileNameEl.textContent = `mission_${(lessonIdx + 1).toString().padStart(2, '0')}.${ext}`;
    if (badgeEl) badgeEl.textContent = `MISSION ${(lessonIdx + 1).toString().padStart(2, '0')}/${lessons.length.toString().padStart(2, '0')}`;
    if (titleEl) titleEl.textContent = lesson.title;
    if (descEl) descEl.textContent = lesson.desc;
    if (runtimeBadge) runtimeBadge.textContent = `${lang.toUpperCase()} RUNTIME`;

    if (this.editorTextarea) {
      this.editorTextarea.value = lesson.initialCode;
      this.updateLineNumbers();
      this.updateCursorStatus();
    }

    // If HTML, default switch right pane to Live Web Preview
    const tabOutput = this.container.querySelector('#vscTabOutput');
    const tabWeb = this.container.querySelector('#vscTabWebPreview');
    const outBox = this.container.querySelector('#vscConsoleOutput');
    const webBox = this.container.querySelector('#vscWebPreviewContainer');

    if (lang === 'html') {
      if (tabWeb && tabOutput) {
        tabWeb.classList.add('active');
        tabOutput.classList.remove('active');
        if (webBox) webBox.classList.remove('hidden');
        if (outBox) outBox.classList.add('hidden');
      }
      this.renderWebPreview();
    } else {
      if (tabOutput && tabWeb) {
        tabOutput.classList.add('active');
        tabWeb.classList.remove('active');
        if (outBox) outBox.classList.remove('hidden');
        if (webBox) webBox.classList.add('hidden');
      }
    }
  }

  updateLineNumbers() {
    if (!this.editorTextarea || !this.lineNumbersEl) return;
    const lines = this.editorTextarea.value.split('\n').length;
    let nums = '';
    for (let i = 1; i <= lines; i++) {
      nums += i + '<br>';
    }
    this.lineNumbersEl.innerHTML = nums;
  }

  updateCursorStatus() {
    if (!this.editorTextarea || !this.cursorPosEl) return;
    const pos = this.editorTextarea.selectionStart;
    const text = this.editorTextarea.value.substring(0, pos);
    const lines = text.split('\n');
    const lineNum = lines.length;
    const colNum = lines[lines.length - 1].length + 1;
    this.cursorPosEl.textContent = `Ln ${lineNum}, Col ${colNum}`;
  }

  inspectKeywordAtCursor() {
    if (!this.editorTextarea || !this.hoverTooltipEl) return;
    const pos = this.editorTextarea.selectionStart;
    const text = this.editorTextarea.value;

    // Get current word
    let start = pos;
    while (start > 0 && /\w|<|>|#|\//.test(text[start - 1])) {
      start--;
    }
    let end = pos;
    while (end < text.length && /\w|<|>|#|\//.test(text[end])) {
      end++;
    }

    const word = text.substring(start, end).trim();
    const doc = CODE_KEYWORD_DOCS[word];

    if (doc) {
      const tipTitle = this.container.querySelector('#vscTipTitle');
      const tipDesc = this.container.querySelector('#vscTipDesc');
      const tipExample = this.container.querySelector('#vscTipExample');

      if (tipTitle) tipTitle.textContent = `💡 ${doc.title}`;
      if (tipDesc) tipDesc.textContent = doc.desc;
      if (tipExample) tipExample.textContent = doc.example;

      this.hoverTooltipEl.classList.remove('hidden');
    } else {
      this.hoverTooltipEl.classList.add('hidden');
    }
  }

  renderWebPreview() {
    if (!this.editorTextarea || !this.webPreviewIframe) return;
    const htmlCode = this.editorTextarea.value;
    this.webPreviewIframe.srcdoc = htmlCode;
  }

  exportCurrentCode() {
    if (!this.editorTextarea) return;
    const code = this.editorTextarea.value;
    const extMap = { python: 'py', html: 'html', java: 'java', cpp: 'cpp', rust: 'rs', sql: 'sql', bash: 'sh' };
    const ext = extMap[this.currentLanguage] || 'txt';
    const filename = `cyber_code_${this.currentLanguage}_${Date.now()}.${ext}`;

    const blob = new Blob([code], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);

    if (this.sound) this.sound.playSuccessFanfare();
    if (this.toasts && this.toasts.show) {
      this.toasts.show('SUCCESS', `Exported: ${filename}`, 2500);
    }
  }

  async runCode() {
    if (!this.editorTextarea || !this.outputConsole) return;
    const code = this.editorTextarea.value;
    const statsEl = this.container.querySelector('#vscOutputStats');

    if (statsEl) statsEl.textContent = 'CHECKING RUNNER...';
    this.outputConsole.innerHTML = `<div class="vsc-out-line system-line">[+] CHECKING ${this.currentLanguage.toUpperCase()} EXECUTION CAPABILITY...</div>`;

    if (this.sound) this.sound.playSuccessFanfare();

    // HTML Mode Preview Refresh
    if (this.currentLanguage === 'html') {
      this.renderWebPreview();
      const line = document.createElement('div');
      line.className = 'vsc-out-line success-line';
      line.textContent = `[✓] HTML/CSS RENDERED IN A STATIC SANDBOX; SCRIPTS AND FORMS ARE BLOCKED.`;
      this.outputConsole.appendChild(line);
      if (statsEl) statsEl.textContent = 'STATUS: 200 OK (DOM RENDERED)';
      this.app.addExp(50, 'Web App Rendered');
      return;
    }

    // Try executing through SystemBridge if running in Electron
    if (this.app.sys && this.app.sys.isElectron && (this.currentLanguage === 'python' || this.currentLanguage === 'bash')) {
      try {
        const tempFile = this.currentLanguage === 'python' ? 'temp_runner.py' : 'temp_runner.sh';
        const writeResult = await this.app.sys.writeFile(tempFile, code);
        if (!writeResult?.success) {
          const blockedLine = document.createElement('div');
          blockedLine.className = 'vsc-out-line';
          blockedLine.textContent = `[BLOCKED] Real execution unavailable: ${writeResult?.error || 'HOST_WRITE_DISABLED'}`;
          this.outputConsole.appendChild(blockedLine);
          if (statsEl) statsEl.textContent = 'STATUS: REAL RUNNER BLOCKED';
          return;
        }
        const execCmd = this.currentLanguage === 'python' ? `python ${tempFile}` : `bash ${tempFile}`;
        const res = await this.app.sys.exec(execCmd);

        const outLine = document.createElement('div');
        outLine.className = 'vsc-out-line';
        outLine.style.whiteSpace = 'pre-wrap';
        outLine.textContent = res.success
          ? (res.stdout || '[✓] Real execution finished with no output.')
          : `[BLOCKED/FAILED] ${res.stderr || res.error || 'HOST_EXECUTION_UNAVAILABLE'}`;
        this.outputConsole.appendChild(outLine);

        if (statsEl) statsEl.textContent = res.success ? 'STATUS: REAL RUN COMPLETED' : 'STATUS: REAL RUNNER FAILED';
        if (res.success) this.app.addExp(80, `Code Executed: ${this.currentLanguage}`);
        return;
      } catch (e) {}
    }

    // Simulated Universal Runner
    setTimeout(() => {
      let simulatedOutput = '';
      const lines = code.split('\n');

      if (this.currentLanguage === 'python') {
        const printLines = lines.filter(l => l.trim().startsWith('print('));
        if (printLines.length > 0) {
          simulatedOutput = printLines.map(p => {
            const match = p.match(/print\((.*)\)/);
            return match ? `>> ${match[1].replace(/["'f]/g, '')}` : '>> [Output]';
          }).join('\n');
        } else {
          simulatedOutput = `>> [✓] Python script executed. Zero faults. Return code 0.`;
        }
      } else if (this.currentLanguage === 'java') {
        simulatedOutput = `[+] JAVAC COMPILER: Bytecode verified.\n=================================\nOPERATIVE : ANAN\nRANK      : LEVEL 5 NETRUNNER\nBALANCE   : 1000 CC\n=================================\n>> Program finished with exit code 0.`;
      } else if (this.currentLanguage === 'cpp') {
        simulatedOutput = `[+] G++ 14.1.0: Binary compiled in 0.04s.\n[+] INITIALIZING C++ QUANTUM MEMORY ALLOCATION...\n[✓] NODE IP     : 192.168.1.100\n[✓] LATENCY     : 8 ms\n[✓] HEAP MEMORY : 48 Bytes Allocated\n[✓] Deallocated safely via std::unique_ptr RAII.`;
      } else if (this.currentLanguage === 'rust') {
        simulatedOutput = `[+] RUSTC: Target x86_64-unknown-linux-gnu compiled.\n[+] Packet Verified: 'SYN_ACK_QUANTUM_HANDSHAKE_0x89'\n[✓] TRANSMISSION SUCCESS: 30 Bytes Injected\n>> Zero memory leaks detected (Borrow Checker Verified).`;
      } else if (this.currentLanguage === 'sql') {
        simulatedOutput = `+---------------+-------------+------------+----------+\n| target_corp   | total_nodes | avg_reward | max_diff |\n+---------------+-------------+------------+----------+\n| Arasaka       |           4 |    2450.00 |        5 |\n| Militech      |           3 |    1800.00 |        4 |\n| NetWatch      |           2 |    3200.00 |        5 |\n+---------------+-------------+------------+----------+\n3 rows returned in 1.4ms.`;
      } else if (this.currentLanguage === 'bash') {
        simulatedOutput = `[+] PARSING FIREWALL INTRUSION LOGS...\n[!] WARNING: IP 192.168.1.50 Failed 3 Times\n[✓] Pipeline executed via grep | sort | uniq | awk.`;
      }

      const outLine = document.createElement('div');
      outLine.className = 'vsc-out-line';
      outLine.style.whiteSpace = 'pre-wrap';
      outLine.textContent = `[SIMULATED RUNNER — CODE WAS NOT EXECUTED]\n${simulatedOutput}`;
      this.outputConsole.appendChild(outLine);

      if (statsEl) statsEl.textContent = 'STATUS: SIMULATED OUTPUT';
      this.app.addExp(75, `Code Playground: ${this.currentLanguage.toUpperCase()}`);
    }, 300);
  }

  // --- RULE-BASED TUTOR CONVERSATION & CHECKLIST ENGINE ---
  askAiPrompt(type) {
    const code = this.editorTextarea ? this.editorTextarea.value : '';
    let promptText = '';

    if (type === 'explain') promptText = `ช่วยอธิบายโค้ด ${this.currentLanguage.toUpperCase()} ในโปรแกรมนี้ให้หน่อยว่าแต่ละบรรทัดทำหน้าที่อะไร?`;
    else if (type === 'bugs') promptText = `ตรวจหาจุดผิดพลาดหรือบั๊กที่อาจเกิดขึ้นในโค้ดชุดนี้ให้หน่อย`;
    else if (type === 'optimize') promptText = `มีวิธีเขียนโค้ดชุดนี้ให้สั้น กระชับ และประมวลผลเร็วขึ้นไหม?`;
    else if (type === 'examples') promptText = `ขอตัวอย่างโค้ดเสริมและการนำไปใช้งานจริงในสถานการณ์อื่น`;

    this.sendAiMessage(promptText, this.generateAiResponse(type, code));
  }

  handleAiQuery() {
    if (!this.aiInput) return;
    const q = this.aiInput.value.trim();
    if (!q) return;

    this.aiInput.value = '';
    const code = this.editorTextarea ? this.editorTextarea.value : '';
    const answer = this.generateAiChatResponse(q, code);
    this.sendAiMessage(q, answer);
  }

  sendAiMessage(userText, botResponse) {
    const history = this.container.querySelector('#aiChatHistory');
    if (!history) return;

    // Switch to AI tab if not active
    const tabAi = this.container.querySelector('#vscTabAiTutor');
    const aiBox = this.container.querySelector('#vscAiTutorContainer');
    const outBox = this.container.querySelector('#vscConsoleOutput');
    const webBox = this.container.querySelector('#vscWebPreviewContainer');
    const tabOutput = this.container.querySelector('#vscTabOutput');
    const tabWeb = this.container.querySelector('#vscTabWebPreview');

    if (tabAi && aiBox) {
      [tabOutput, tabWeb].forEach(t => t && t.classList.remove('active'));
      tabAi.classList.add('active');
      [outBox, webBox].forEach(v => v && v.classList.add('hidden'));
      aiBox.classList.remove('hidden');
    }

    // Append User Message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-msg ai-msg-user';
    userMsg.innerHTML = `<div class="msg-bubble">${this.escapeHtml(userText)}</div>`;
    history.appendChild(userMsg);

    // Append Bot Typing State & Response
    const botMsg = document.createElement('div');
    botMsg.className = 'ai-msg ai-msg-bot';
    botMsg.innerHTML = `<div class="msg-bubble"><span class="ai-typing-dots">Rule Guide กำลังเลือกคำตอบจากแม่แบบ...</span></div>`;
    history.appendChild(botMsg);
    history.scrollTop = history.scrollHeight;

    if (this.sound) this.sound.playKey(false);

    setTimeout(() => {
      botMsg.querySelector('.msg-bubble').innerHTML = botResponse;
      history.scrollTop = history.scrollHeight;
      if (this.sound) this.sound.playSuccessFanfare();
    }, 450);
  }

  generateAiResponse(type, code) {
    const lang = this.currentLanguage.toUpperCase();
    const lineCount = String(code || '').split('\n').length;
    if (type === 'explain') {
      return `
        <strong>📋 TEMPLATE GUIDE สำหรับ ${lang}:</strong><br><br>
        โค้ดมี ${lineCount} บรรทัด แต่ Rule Guide นี้ไม่ได้ parse AST และไม่ได้เข้าใจทุกบรรทัดจริง<br>
        กรุณาตรวจตามลำดับ:<br>
        <ul>
          <li>หา entry point, input และ output</li>
          <li>ไล่เงื่อนไข, loop และการเปลี่ยน state</li>
          <li>ตรวจ error handling และผลข้างเคียง</li>
        </ul>
        ใช้ compiler/linter จริงเพื่อยืนยันผลครับ
      `;
    } else if (type === 'bugs') {
      return `
        <strong>🔍 BUG CHECKLIST — ยังไม่ได้ตรวจด้วย parser/linter:</strong><br><br>
        • ทดสอบ null/undefined, ค่าว่าง และค่าขอบเขต<br>
        • ตรวจ async error, timeout และ resource cleanup<br>
        • ตรวจ input validation, injection และการเปิดเผยข้อมูลลับ<br>
        • รัน compiler/linter/tests จริงก่อนสรุปว่าโค้ดผ่าน<br>
        ระบบนี้ไม่สามารถรับรอง syntax, memory safety หรือ absence of vulnerabilities ได้ครับ
      `;
    } else if (type === 'optimize') {
      return `
        <strong>🚀 GENERIC OPTIMIZATION CHECKLIST:</strong><br><br>
        Rule Guide ยังไม่ได้ benchmark และไม่สามารถสรุป Big-O จากข้อความนี้โดยอัตโนมัติ<br>
        • วัด profiler/benchmark ก่อนแก้<br>
        • ลด I/O ซ้ำ, allocation ซ้ำ และงานใน loop ที่ไม่จำเป็น<br>
        • เพิ่ม regression test เพื่อยืนยันว่าผลลัพธ์ไม่เปลี่ยน<br>
        • ใช้เครื่องมือของ ${lang} วัดผลจริงหลังปรับครับ
      `;
    } else {
      return `
        <strong>📖 แนวทางทดลองต่อ:</strong><br><br>
        • แยกฟังก์ชันบริสุทธิ์ออกจาก I/O แล้วเขียน unit test<br>
        • เพิ่มกรณี success, failure, timeout และ invalid input<br>
        • ใช้ตัวอย่างนี้เพื่อฝึกใน sandbox เท่านั้น ก่อนนำไปเชื่อมระบบจริง
      `;
    }
  }

  generateAiChatResponse(query, code) {
    const qLower = query.toLowerCase();
    if (qLower.includes('pointer') || qLower.includes('พอยเตอร์')) {
      return `<strong>⚡ Pointer คืออะไร?</strong><br>Pointer คือตัวแปรพิเศษที่ใช้เก็บ <em>Memory Address (ที่อยู่ในแรม)</em> ของตัวแปรอื่น แทนที่จะเก็บค่าข้อมูลโดยตรง ใน C/C++ เราใช้ <code>*</code> เพื่อประกาศหรือดึงค่า และใช้ <code>&</code> เพื่อหาตำแหน่ง Address ครับ!`;
    } else if (qLower.includes('rust') || qLower.includes('ownership')) {
      return `<strong>🦀 Rust Ownership & Borrowing:</strong><br>Rust ใช้ ownership และ borrowing เพื่อป้องกันข้อผิดพลาดด้านหน่วยความจำหลายชนิดตั้งแต่ compile time แต่ยังเกิด resource leak เชิงตรรกะหรือปัญหาใน unsafe code ได้ จึงควรทดสอบและตรวจด้วยเครื่องมือจริงครับ`;
    } else if (qLower.includes('sql') || qLower.includes('join')) {
      return `<strong>🗄️ การใช้ JOIN ใน SQL:</strong><br><code>INNER JOIN</code> ใช้ดึงข้อมูลที่ตรงกันของทั้งสองตาราง ส่วน <code>LEFT JOIN</code> จะดึงข้อมูลจากตารางหลักทั้งหมด แม้ว่าอีกตารางจะไม่มีข้อมูลตรงกันก็ตามครับ!`;
    } else if (qLower.includes('html') || qLower.includes('css') || qLower.includes('flex')) {
      return `<strong>🌐 Modern Web CSS Flexbox:</strong><br>ใช้ <code>display: flex; justify-content: center; align-items: center;</code> เพื่อจัดองค์ประกอบให้อยู่กึ่งกลางหน้าจออย่างสมบูรณ์แบบใน 3 บรรทัดครับ!`;
    } else {
      return `<strong>📋 คำตอบจาก Rule Guide:</strong><br>สำหรับคำถาม: <em>"${this.escapeHtml(query)}"</em><br>ระบบนี้ตอบได้เฉพาะแม่แบบความรู้ที่กำหนดไว้ และไม่ได้วิเคราะห์โค้ดด้วยโมเดล AI หรือ compiler หากต้องการยืนยันผล ให้ใช้ runner/linter ที่แสดงว่าเป็นของจริงครับ`;
    }
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

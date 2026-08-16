/**
 * CYBER//TYPE REAL-WORLD SYSTEM BRIDGE & UNIX UTILITIES
 * Connects the Hollywood cyber terminal directly to Windows 11 host system via Electron IPC
 */

class SystemBridge {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.cyberSystemAPI && window.cyberSystemAPI.isElectron;
    this.currentWorkingDir = 'C:\\Users\\asus';
  }

  async init() {
    if (this.isElectron) {
      try {
        const pwdData = await window.cyberSystemAPI.getPwd();
        if (pwdData && pwdData.pwd) {
          this.currentWorkingDir = pwdData.pwd;
        }
      } catch (e) {}
    }
  }

  async launch(target) {
    if (this.isElectron) {
      return await window.cyberSystemAPI.launch(target);
    } else {
      // Browser fallback simulation
      window.open(target.startsWith('http') ? target : `https://www.google.com/search?q=${encodeURIComponent(target)}`, '_blank');
      return { success: true, message: `[Simulated Launch] Target: ${target}` };
    }
  }

  async exec(cmd) {
    if (this.isElectron) {
      return await window.cyberSystemAPI.exec(cmd);
    } else {
      return { success: true, stdout: `[Simulation Mode] Command executed: ${cmd}\nOutput: 0 errors.` };
    }
  }

  async getSysInfo() {
    if (this.isElectron) {
      return await window.cyberSystemAPI.getSysInfo();
    } else {
      return {
        hostname: 'CYBER-MAINFRAME-01',
        platform: 'win32',
        release: '10.0.26200',
        arch: 'x64',
        uptime: 86400,
        cpuModel: 'AMD EPYC 9654 96-Core Processor',
        cpuCores: 96,
        totalMemGB: '128.00',
        usedMemGB: '38.45',
        freeMemGB: '89.55',
        memPercent: 30,
        userHome: 'C:\\Users\\Anan',
        username: 'Anan'
      };
    }
  }

  async listFiles(dirPath) {
    if (this.isElectron) {
      return await window.cyberSystemAPI.listFiles(dirPath || this.currentWorkingDir);
    } else {
      return {
        success: true,
        dir: this.currentWorkingDir,
        files: [
          { name: 'Desktop', isDir: true, size: 4096, mtime: new Date().toISOString() },
          { name: 'Documents', isDir: true, size: 4096, mtime: new Date().toISOString() },
          { name: 'Downloads', isDir: true, size: 4096, mtime: new Date().toISOString() },
          { name: 'CyberType.exe', isDir: false, size: 142857140, mtime: new Date().toISOString() },
          { name: 'secret_keys.enc', isDir: false, size: 8192, mtime: new Date().toISOString() },
          { name: 'payload.ps1', isDir: false, size: 2048, mtime: new Date().toISOString() }
        ]
      };
    }
  }

  async readFile(filePath) {
    if (this.isElectron) {
      return await window.cyberSystemAPI.readFile(filePath);
    } else {
      return { success: true, content: `// Classified File Content for: ${filePath}\n// UID: 0 [ROOT ACCESS GRANTED]\n// All systems nominal.` };
    }
  }

  async writeFile(filePath, content) {
    if (this.isElectron) {
      return await window.cyberSystemAPI.writeFile(filePath, content);
    } else {
      return { success: true };
    }
  }

  async makeDir(dirPath) {
    if (this.isElectron) {
      return await window.cyberSystemAPI.makeDir(dirPath);
    } else {
      return { success: true };
    }
  }

  async ping(host) {
    if (this.isElectron) {
      return await window.cyberSystemAPI.ping(host);
    } else {
      return { success: true, output: `Pinging ${host} [142.250.190.46] with 32 bytes of data:\nReply from 142.250.190.46: bytes=32 time=12ms TTL=117\nReply from 142.250.190.46: bytes=32 time=14ms TTL=117\nReply from 142.250.190.46: bytes=32 time=11ms TTL=117\nPing statistics for ${host}: Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)` };
    }
  }

  async shred(filePath) {
    if (this.isElectron && window.cyberSystemAPI.shred) {
      return await window.cyberSystemAPI.shred(filePath);
    } else {
      return { success: false, error: 'Simulation mode does not support file shredding.' };
    }
  }

  async encryptFile(filePath, password) {
    if (this.isElectron && window.cyberSystemAPI.encryptFile) {
      return await window.cyberSystemAPI.encryptFile(filePath, password);
    } else {
      return { success: false, error: 'Simulation mode does not support encryption.' };
    }
  }

  async decryptFile(filePath, password) {
    if (this.isElectron && window.cyberSystemAPI.decryptFile) {
      return await window.cyberSystemAPI.decryptFile(filePath, password);
    } else {
      return { success: false, error: 'Simulation mode does not support decryption.' };
    }
  }

  async osint(target) {
    if (this.isElectron && window.cyberSystemAPI.osint) {
      return await window.cyberSystemAPI.osint(target);
    } else {
      return { success: true, ips: ['104.21.33.5', '172.67.13.12'], mx: [{ exchange: 'mail.protonmail.ch', priority: 10 }] };
    }
  }

  async sandboxRun(code) {
    if (this.isElectron && window.cyberSystemAPI.sandboxRun) {
      return await window.cyberSystemAPI.sandboxRun(code);
    } else {
      try {
        let logs = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));
        const fn = new Function(code);
        const res = fn();
        console.log = originalLog;
        return { success: true, logs, result: String(res) };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
  }

  async windowSplit(opts) {
    if (this.isElectron && window.cyberSystemAPI.windowSplit) {
      return await window.cyberSystemAPI.windowSplit(opts);
    } else {
      return { success: false, error: 'Simulation mode does not support window tiling.' };
    }
  }
}

export const systemBridge = new SystemBridge();

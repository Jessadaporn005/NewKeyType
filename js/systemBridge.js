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
      if (typeof window !== 'undefined' && typeof window.open === 'function') {
        window.open(target.startsWith('http') ? target : `https://www.google.com/search?q=${encodeURIComponent(target)}`, '_blank');
      }
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

  // --- Real-World Windows/Linux Process Management ---
  async getProcesses() {
    if (this.isElectron) {
      try {
        const psRes = await this.exec('powershell -NoProfile -Command "Get-Process | Select-Object -First 35 Id, ProcessName, WorkingSet64, CPU | ConvertTo-Json"');
        if (psRes && psRes.success && psRes.stdout) {
          const list = JSON.parse(psRes.stdout);
          const raw = Array.isArray(list) ? list : [list];
          return {
            success: true,
            processes: raw.map(p => ({
              pid: p.Id,
              name: p.ProcessName,
              memMB: Math.round((p.WorkingSet64 || 0) / (1024 * 1024)),
              cpu: p.CPU ? p.CPU.toFixed(1) : '0.0',
              status: 'RUNNING'
            }))
          };
        }
      } catch (e) {}
    }

    // Fallback simulation processes
    return {
      success: true,
      processes: [
        { pid: 4892, name: 'System Idle Process', memMB: 16, cpu: '0.0', status: 'RUNNING' },
        { pid: 1420, name: 'chrome.exe', memMB: 1420, cpu: '3.4', status: 'RUNNING' },
        { pid: 8912, name: 'Code.exe (VS Code)', memMB: 840, cpu: '2.1', status: 'RUNNING' },
        { pid: 6540, name: 'Discord.exe', memMB: 390, cpu: '0.8', status: 'RUNNING' },
        { pid: 7280, name: 'Spotify.exe', memMB: 280, cpu: '0.5', status: 'RUNNING' },
        { pid: 9140, name: 'steam.exe', memMB: 460, cpu: '1.2', status: 'RUNNING' },
        { pid: 3120, name: 'explorer.exe', memMB: 210, cpu: '0.3', status: 'RUNNING' },
        { pid: 5540, name: 'CyberType.exe', memMB: 185, cpu: '1.8', status: 'RUNNING' },
        { pid: 2190, name: 'powershell.exe', memMB: 95, cpu: '0.1', status: 'RUNNING' },
        { pid: 7810, name: 'node.exe', memMB: 320, cpu: '1.5', status: 'RUNNING' }
      ]
    };
  }

  async killProcess(pid) {
    if (this.isElectron) {
      try {
        const res = await this.exec(`powershell -NoProfile -Command "Stop-Process -Id ${pid} -Force"`);
        return { success: res.success, message: `Process PID [${pid}] terminated.` };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
    return { success: true, message: `[Simulated] Process PID [${pid}] terminated.` };
  }

  async getDrives() {
    if (this.isElectron) {
      try {
        const driveRes = await this.exec('powershell -NoProfile -Command "Get-PSDrive -PSProvider FileSystem | Select-Object Name, Root, Free, Used | ConvertTo-Json"');
        if (driveRes && driveRes.success && driveRes.stdout) {
          const list = JSON.parse(driveRes.stdout);
          const raw = Array.isArray(list) ? list : [list];
          return {
            success: true,
            drives: raw.map(d => ({
              name: `${d.Name}:\\`,
              path: d.Root || `${d.Name}:\\`,
              freeGB: d.Free ? Math.round(d.Free / (1024 * 1024 * 1024)) : 0,
              usedGB: d.Used ? Math.round(d.Used / (1024 * 1024 * 1024)) : 0
            }))
          };
        }
      } catch (e) {}
    }

    return {
      success: true,
      drives: [
        { name: 'C:\\ [System NVMe]', path: 'C:\\', freeGB: 420, usedGB: 580 },
        { name: 'D:\\ [Cyber Storage]', path: 'D:\\', freeGB: 890, usedGB: 1110 },
        { name: 'Desktop', path: 'C:\\Users\\asus\\Desktop', freeGB: 420, usedGB: 580 },
        { name: 'Documents', path: 'C:\\Users\\asus\\Documents', freeGB: 420, usedGB: 580 },
        { name: 'Downloads', path: 'C:\\Users\\asus\\Downloads', freeGB: 420, usedGB: 580 }
      ]
    };
  }

  async deleteFile(filePath) {
    if (this.isElectron) {
      try {
        const res = await this.exec(`powershell -NoProfile -Command "Remove-Item -Path '${filePath}' -Force -Recurse"`);
        return { success: res.success, message: `Removed '${filePath}'.` };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
    return { success: true, message: `[Simulated] Removed '${filePath}'.` };
  }
}

export const systemBridge = new SystemBridge();

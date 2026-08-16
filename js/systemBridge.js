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

  // --- Real-World Desktop Mirror & App Matrix ---
  async getDesktopShortcuts() {
    if (this.isElectron) {
      try {
        const psCmd = `powershell -NoProfile -Command "$paths = @('$env:USERPROFILE\\Desktop', '$env:USERPROFILE\\OneDrive\\Desktop', '$env:USERPROFILE\\OneDrive\\เดสก์ท็อป', '$env:PUBLIC\\Desktop'); Get-ChildItem -Path $paths -ErrorAction SilentlyContinue | Select-Object Name, FullName, Extension, Length, LastWriteTime | ConvertTo-Json"`;
        const res = await this.exec(psCmd);
        if (res && res.success && res.stdout) {
          const list = JSON.parse(res.stdout);
          const raw = Array.isArray(list) ? list : [list];
          return {
            success: true,
            items: raw.map(item => ({
              name: item.Name,
              path: item.FullName,
              ext: (item.Extension || '').toLowerCase(),
              isDir: !item.Extension,
              size: item.Length || 0,
              mtime: item.LastWriteTime || new Date().toISOString()
            }))
          };
        }
      } catch (e) {}
    }

    // Realistic default desktop reflection
    return {
      success: true,
      items: [
        // Gaming
        { name: 'Steam.lnk', path: 'C:\\Users\\Public\\Desktop\\Steam.lnk', ext: '.lnk', isDir: false, category: 'gaming' },
        { name: 'League of Legends.lnk', path: 'C:\\Users\\Public\\Desktop\\League of Legends.lnk', ext: '.lnk', isDir: false, category: 'gaming' },
        { name: 'Teamfight Tactics.lnk', path: 'C:\\Users\\Public\\Desktop\\Teamfight Tactics.lnk', ext: '.lnk', isDir: false, category: 'gaming' },
        { name: 'BLEACH Soul Resonance.lnk', path: 'C:\\Users\\asus\\Desktop\\BLEACH Soul Resonance.lnk', ext: '.lnk', isDir: false, category: 'gaming' },
        { name: 'Ragnarok The New World.lnk', path: 'C:\\Users\\asus\\Desktop\\Ragnarok The New World.lnk', ext: '.lnk', isDir: false, category: 'gaming' },
        { name: 'Riot Client.lnk', path: 'C:\\Users\\Public\\Desktop\\Riot Client.lnk', ext: '.lnk', isDir: false, category: 'gaming' },

        // Dev & Tools
        { name: 'Visual Studio Code.lnk', path: 'C:\\Users\\asus\\Desktop\\Visual Studio Code.lnk', ext: '.lnk', isDir: false, category: 'dev' },
        { name: 'Antigravity.lnk', path: 'C:\\Users\\asus\\Desktop\\Antigravity.lnk', ext: '.lnk', isDir: false, category: 'dev' },
        { name: 'CyberDeck OS.lnk', path: 'C:\\Users\\asus\\Desktop\\CyberDeck OS.lnk', ext: '.lnk', isDir: false, category: 'dev' },
        { name: 'RapidMiner Studio.lnk', path: 'C:\\Users\\Public\\Desktop\\RapidMiner Studio.lnk', ext: '.lnk', isDir: false, category: 'dev' },
        { name: 'LTK Manager.lnk', path: 'C:\\Users\\asus\\Desktop\\LTK Manager.lnk', ext: '.lnk', isDir: false, category: 'dev' },

        // Browsers & Media
        { name: 'Google Chrome.lnk', path: 'C:\\Users\\Public\\Desktop\\Google Chrome.lnk', ext: '.lnk', isDir: false, category: 'browsers' },
        { name: 'Spotify.lnk', path: 'C:\\Users\\asus\\Desktop\\Spotify.lnk', ext: '.lnk', isDir: false, category: 'browsers' },
        { name: 'VLC media player.lnk', path: 'C:\\Users\\Public\\Desktop\\VLC media player.lnk', ext: '.lnk', isDir: false, category: 'browsers' },
        { name: 'TeamViewer.lnk', path: 'C:\\Users\\Public\\Desktop\\TeamViewer.lnk', ext: '.lnk', isDir: false, category: 'browsers' },
        { name: 'WinRAR.lnk', path: 'C:\\Users\\Public\\Desktop\\WinRAR.lnk', ext: '.lnk', isDir: false, category: 'browsers' },

        // Folders & Data
        { name: 'Character Desing', path: 'C:\\Users\\asus\\Desktop\\Character Desing', ext: '', isDir: true, category: 'folders' },
        { name: 'Simplecomputer', path: 'C:\\Users\\asus\\Desktop\\Simplecomputer', ext: '', isDir: true, category: 'folders' },
        { name: 'Cyberpunk_Wallpaper.jpg', path: 'C:\\Users\\asus\\Desktop\\Cyberpunk_Wallpaper.jpg', ext: '.jpg', isDir: false, category: 'folders' },
        { name: 'Report_2026.docx', path: 'C:\\Users\\asus\\Desktop\\Report_2026.docx', ext: '.docx', isDir: false, category: 'folders' }
      ]
    };
  }

  // --- Real-World Cyber Wi-Fi Radar & Network Management ---
  async scanWifi() {
    if (this.isElectron) {
      try {
        const res = await this.exec('powershell -NoProfile -Command "netsh wlan show networks mode=bssid"');
        if (res && res.success && res.stdout) {
          const raw = res.stdout;
          const networks = [];
          const blocks = raw.split(/SSID\s+\d+\s+:\s+/i).slice(1);

          blocks.forEach(blk => {
            const lines = blk.split('\n').map(l => l.trim());
            const ssid = lines[0] || 'Hidden_SSID';
            let auth = 'WPA2-Personal';
            let encryption = 'CCMP';
            let signal = 75;
            let channel = 36;
            let bssid = '00:1A:2B:3C:4D:5E';

            lines.forEach(l => {
              if (l.startsWith('Authentication')) auth = l.split(':')[1]?.trim() || auth;
              if (l.startsWith('Encryption')) encryption = l.split(':')[1]?.trim() || encryption;
              if (l.startsWith('Signal')) signal = parseInt(l.split(':')[1]?.replace('%', '').trim() || '75', 10);
              if (l.startsWith('Channel')) channel = parseInt(l.split(':')[1]?.trim() || '36', 10);
              if (l.startsWith('BSSID')) bssid = l.split(':')[1]?.trim() || bssid;
            });

            networks.push({
              ssid,
              bssid,
              auth,
              encryption,
              signal: Math.min(100, Math.max(15, signal)),
              channel,
              band: channel > 14 ? '5.0 GHz' : '2.4 GHz'
            });
          });

          if (networks.length > 0) {
            return { success: true, networks };
          }
        }
      } catch (e) {}
    }

    // Default authentic simulation if offline or browser mode
    return {
      success: true,
      networks: [
        { ssid: 'Rod-5G', bssid: 'FA:89:2B:3C:90:12', auth: 'WPA2-Personal', encryption: 'CCMP', signal: 98, channel: 36, band: '5.0 GHz' },
        { ssid: 'CyberNet_Public_Guest', bssid: '00:1B:44:11:3A:B7', auth: 'Open', encryption: 'None', signal: 82, channel: 6, band: '2.4 GHz' },
        { ssid: 'Quantum_Defense_Enclave', bssid: 'DC:A6:32:8F:09:A1', auth: 'WPA3-Enterprise', encryption: 'GCMP-256', signal: 65, channel: 149, band: '5.0 GHz' },
        { ssid: 'ShadowCorp_Industrial_Mesh', bssid: '70:4F:57:12:33:EE', auth: 'WPA2-Personal', encryption: 'AES', signal: 48, channel: 1, band: '2.4 GHz' },
        { ssid: 'BlackOps_Satellite_Uplink', bssid: 'AA:FF:00:22:98:44', auth: 'WPA3-Personal', encryption: 'SAE-CCMP', signal: 34, channel: 44, band: '5.0 GHz' }
      ]
    };
  }

  async connectWifi(ssid, key = '') {
    if (this.isElectron) {
      try {
        const cmd = key
          ? `powershell -NoProfile -Command "netsh wlan connect name='${ssid}'"`
          : `powershell -NoProfile -Command "netsh wlan connect name='${ssid}'"`;
        const res = await this.exec(cmd);
        return { success: res.success, message: res.stdout || `Connected to '${ssid}'.` };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
    return { success: true, message: `[Simulated Network Handshake] Connected to '${ssid}'.` };
  }
}

export const systemBridge = new SystemBridge();

/**
 * CYBER//TYPE HOST-LABELED SYSTEM BRIDGE & TRAINING FALLBACKS
 * Connects allowlisted capabilities to Electron IPC and labels browser fallbacks.
 */

export const DATA_SOURCES = Object.freeze({
  HOST_VERIFIED: 'HOST_VERIFIED',
  SIMULATED: 'SIMULATED',
  HOST_BLOCKED: 'HOST_BLOCKED',
  HOST_UNAVAILABLE: 'HOST_UNAVAILABLE'
});

class SystemBridge {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.cyberSystemAPI && window.cyberSystemAPI.isElectron;
    this.currentWorkingDir = 'C:\\Users\\asus';
    this.homeDir = this.currentWorkingDir;
  }

  async init() {
    if (this.isElectron) {
      try {
        const pwdData = await window.cyberSystemAPI.getPwd();
        if (pwdData && pwdData.pwd) {
          this.currentWorkingDir = pwdData.pwd;
          this.homeDir = pwdData.home || pwdData.pwd;
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
      return { success: true, source: DATA_SOURCES.SIMULATED, simulated: true, message: `[Simulated Launch] Target: ${target}` };
    }
  }

  async exec(cmd) {
    if (this.isElectron) {
      return await window.cyberSystemAPI.exec(cmd);
    } else {
      return { success: false, source: DATA_SOURCES.SIMULATED, simulated: true, stdout: '', error: 'HOST_COMMAND_EXECUTION_UNAVAILABLE' };
    }
  }

  async getSysInfo() {
    if (this.isElectron) {
      return await window.cyberSystemAPI.getSysInfo();
    } else {
      return {
        source: DATA_SOURCES.SIMULATED,
        simulated: true,
        hostname: 'CYBER-MAINFRAME-01',
        platform: 'win32',
        release: '10.0.26200',
        arch: 'x64',
        uptime: 86400,
        cpuModel: 'AMD EPYC 9654 96-Core Processor',
        cpuCores: 96,
        cpuPercent: 24.5,
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
        source: DATA_SOURCES.SIMULATED,
        simulated: true,
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
      return { success: true, source: DATA_SOURCES.SIMULATED, simulated: true, content: `// Simulated file preview for: ${filePath}` };
    }
  }

  async readMediaDataUrl(filePath) {
    if (this.isElectron && window.cyberSystemAPI.readMediaDataUrl) {
      return await window.cyberSystemAPI.readMediaDataUrl(filePath);
    }
    return { success: false, source: DATA_SOURCES.SIMULATED, simulated: true, error: 'HOST_MEDIA_READ_UNAVAILABLE' };
  }

  async writeFile(filePath, content) {
    if (this.isElectron) {
      return await window.cyberSystemAPI.writeFile(filePath, content);
    } else {
      return { success: false, source: DATA_SOURCES.SIMULATED, simulated: true, error: 'HOST_FILE_WRITE_UNAVAILABLE' };
    }
  }

  async makeDir(dirPath) {
    if (this.isElectron) {
      return await window.cyberSystemAPI.makeDir(dirPath);
    } else {
      return { success: false, source: DATA_SOURCES.SIMULATED, simulated: true, error: 'HOST_DIRECTORY_WRITE_UNAVAILABLE' };
    }
  }

  async ping(host) {
    if (this.isElectron) {
      return await window.cyberSystemAPI.ping(host);
    } else {
      return { success: false, source: DATA_SOURCES.SIMULATED, simulated: true, output: '', error: 'HOST_PING_UNAVAILABLE' };
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
      return { success: false, source: DATA_SOURCES.SIMULATED, simulated: true, ips: [], mx: [], error: 'HOST_OSINT_UNAVAILABLE' };
    }
  }

  async sandboxRun(code) {
    if (this.isElectron && window.cyberSystemAPI.sandboxRun) {
      return await window.cyberSystemAPI.sandboxRun(code);
    } else {
      return { success: false, source: DATA_SOURCES.SIMULATED, error: 'SANDBOX_RUNTIME_UNAVAILABLE' };
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
        const hostResult = await window.cyberSystemAPI.getProcesses();
        if (hostResult?.success && hostResult.processes) {
          const raw = hostResult.processes;
          return {
            success: true,
            source: DATA_SOURCES.HOST_VERIFIED,
            processes: raw.map(p => ({
              pid: p.Id,
              name: p.ProcessName,
              memMB: Math.round((p.WorkingSet64 || 0) / (1024 * 1024)),
              cpu: p.CPU ? Number(p.CPU).toFixed(1) : '0.0',
              status: 'RUNNING'
            }))
          };
        }
      } catch (e) {}
    }

    // Fallback simulation processes
    return {
      success: true,
      source: DATA_SOURCES.SIMULATED,
      simulated: true,
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
        const res = await window.cyberSystemAPI.killProcess(pid);
        return { ...res, message: res.success ? `Process PID [${pid}] terminated.` : undefined };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
    return { success: false, source: DATA_SOURCES.SIMULATED, simulated: true, error: 'HOST_PROCESS_CONTROL_UNAVAILABLE' };
  }

  async getDrives() {
    if (this.isElectron) {
      try {
        const driveRes = await window.cyberSystemAPI.getDrives();
        if (driveRes?.success && driveRes.drives) {
          const raw = driveRes.drives;
          return {
            success: true,
            source: DATA_SOURCES.HOST_VERIFIED,
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
      source: DATA_SOURCES.SIMULATED,
      simulated: true,
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
        const res = await window.cyberSystemAPI.deleteFile(filePath);
        return { ...res, message: res.success ? `Removed '${filePath}'.` : undefined };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
    return { success: false, source: DATA_SOURCES.SIMULATED, simulated: true, error: 'HOST_DELETE_UNAVAILABLE' };
  }

  // --- Real-World Desktop Mirror & App Matrix ---
  async getDesktopShortcuts() {
    if (this.isElectron) {
      try {
        const res = await window.cyberSystemAPI.getDesktopShortcuts();
        if (res?.success && res.items) {
          const raw = res.items;
          return {
            success: true,
            source: DATA_SOURCES.HOST_VERIFIED,
            items: raw.map(item => ({
              name: item.name ?? item.Name,
              path: item.path ?? item.FullName,
              ext: String(item.ext ?? item.Extension ?? '').toLowerCase(),
              isDir: typeof item.isDir === 'boolean' ? item.isDir : !item.Extension,
              size: item.size ?? item.Length ?? 0,
              mtime: item.mtime ?? item.LastWriteTime ?? null
            }))
          };
        }
      } catch (e) {}
    }

    // Realistic default desktop reflection
    return {
      success: true,
      source: DATA_SOURCES.SIMULATED,
      simulated: true,
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
        const res = await window.cyberSystemAPI.scanWifi();
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
              if (l.startsWith('BSSID')) bssid = l.slice(l.indexOf(':') + 1).trim() || bssid;
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
            return { success: true, source: DATA_SOURCES.HOST_VERIFIED, networks };
          }
        }
      } catch (e) {}
    }

    // Default authentic simulation if offline or browser mode
    return {
      success: true,
      source: DATA_SOURCES.SIMULATED,
      simulated: true,
      fallbackReason: this.isElectron ? 'HOST_WIFI_SCAN_UNAVAILABLE' : 'BROWSER_MODE',
      networks: [
        { ssid: 'Rod-5G', bssid: 'FA:89:2B:3C:90:12', auth: 'WPA2-Personal', encryption: 'CCMP', signal: 98, channel: 36, band: '5.0 GHz' },
        { ssid: 'CyberNet_Public_Guest', bssid: '00:1B:44:11:3A:B7', auth: 'Open', encryption: 'None', signal: 82, channel: 6, band: '2.4 GHz' },
        { ssid: 'Quantum_Defense_Enclave', bssid: 'DC:A6:32:8F:09:A1', auth: 'WPA3-Enterprise', encryption: 'GCMP-256', signal: 65, channel: 149, band: '5.0 GHz' },
        { ssid: 'ShadowCorp_Industrial_Mesh', bssid: '70:4F:57:12:33:EE', auth: 'WPA2-Personal', encryption: 'AES', signal: 48, channel: 1, band: '2.4 GHz' },
        { ssid: 'BlackOps_Satellite_Uplink', bssid: 'AA:FF:00:22:98:44', auth: 'WPA3-Personal', encryption: 'SAE-CCMP', signal: 34, channel: 44, band: '5.0 GHz' }
      ]
    };
  }

  async connectWifi(ssid) {
    if (this.isElectron) {
      try {
        const res = await window.cyberSystemAPI.connectWifi(ssid);
        return { ...res, message: res.message || (res.success ? `Connected to saved Wi-Fi profile '${ssid}'.` : '') };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
    return { success: false, source: DATA_SOURCES.SIMULATED, simulated: true, error: 'HOST_WIFI_CONNECT_UNAVAILABLE' };
  }
}

export const systemBridge = new SystemBridge();

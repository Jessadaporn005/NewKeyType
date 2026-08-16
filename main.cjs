const { app, BrowserWindow, ipcMain, shell, Tray, Menu, globalShortcut, screen } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec, spawn } = require('child_process');
const crypto = require('crypto');
const dns = require('dns');
const net = require('net');

const DB_PATH = path.join(app.getPath('userData'), 'cyber_db.json');
let tray = null;
let ghostWindow = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

// Built-in In-Process Local Web Server (100% self-contained inside CyberType.exe)
const server = http.createServer((req, res) => {
  const safeUrl = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(__dirname, safeUrl === '/' ? 'index.html' : safeUrl);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File Not Found');
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
});

// Register Real System IPC Handlers
ipcMain.handle('cyber:exec', async (event, command) => {
  return new Promise((resolve) => {
    exec(command, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout || '',
        stderr: stderr || '',
        error: error ? error.message : null
      });
    });
  });
});

ipcMain.handle('cyber:launch', async (event, target) => {
  const t = target.trim();

  // Known Windows App Aliases
  const appMap = {
    chrome: 'chrome',
    google: 'https://google.com',
    youtube: 'https://youtube.com',
    calc: 'calc',
    calculator: 'calc',
    notepad: 'notepad',
    explorer: 'explorer',
    cmd: 'cmd',
    powershell: 'powershell',
    taskmgr: 'taskmgr',
    code: 'code',
    vscode: 'code',
    spotify: 'spotify:',
    steam: 'steam:',
    discord: 'discord:'
  };

  const resolved = appMap[t.toLowerCase()] || t;

  if (resolved.startsWith('http://') || resolved.startsWith('https://') || resolved.startsWith('steam:') || resolved.startsWith('spotify:') || resolved.startsWith('discord:')) {
    shell.openExternal(resolved);
    return { success: true, message: `Opened URL/Protocol: ${resolved}` };
  }

  return new Promise((resolve) => {
    exec(`start "" "${resolved}"`, (err) => {
      if (err) {
        // Fallback spawn
        try {
          spawn(resolved, [], { detached: true, stdio: 'ignore', shell: true }).unref();
          resolve({ success: true, message: `Spawned process: ${resolved}` });
        } catch (e) {
          resolve({ success: false, error: e.message });
        }
      } else {
        resolve({ success: true, message: `Launched application: ${resolved}` });
      }
    });
  });
});

ipcMain.handle('cyber:sysinfo', async () => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    uptime: os.uptime(),
    cpuModel: cpus.length > 0 ? cpus[0].model : 'Quantum Processor',
    cpuCores: cpus.length,
    totalMemGB: (totalMem / (1024 ** 3)).toFixed(2),
    usedMemGB: (usedMem / (1024 ** 3)).toFixed(2),
    freeMemGB: (freeMem / (1024 ** 3)).toFixed(2),
    memPercent: Math.round((usedMem / totalMem) * 100),
    userHome: os.homedir(),
    username: os.userInfo().username
  };
});

ipcMain.handle('cyber:fs-ls', async (event, dirPath) => {
  try {
    const targetDir = dirPath ? path.resolve(dirPath) : process.cwd();
    const files = await fs.promises.readdir(targetDir, { withFileTypes: true });

    const results = await Promise.all(
      files.map(async (file) => {
        const full = path.join(targetDir, file.name);
        let size = 0;
        let mtime = null;
        try {
          const st = await fs.promises.stat(full);
          size = st.size;
          mtime = st.mtime.toISOString();
        } catch (e) {}

        return {
          name: file.name,
          isDir: file.isDirectory(),
          size: size,
          mtime: mtime
        };
      })
    );

    return { success: true, dir: targetDir, files: results };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('cyber:fs-read', async (event, filePath) => {
  try {
    const content = await fs.promises.readFile(path.resolve(filePath), 'utf-8');
    return { success: true, content };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('cyber:fs-write', async (event, filePath, content) => {
  try {
    await fs.promises.writeFile(path.resolve(filePath), content, 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('cyber:fs-mkdir', async (event, dirPath) => {
  try {
    await fs.promises.mkdir(path.resolve(dirPath), { recursive: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('cyber:fs-pwd', async () => {
  return { pwd: process.cwd(), home: os.homedir() };
});

ipcMain.handle('cyber:ping', async (event, host) => {
  return new Promise((resolve) => {
    exec(`ping -n 3 ${host || '8.8.8.8'}`, (err, stdout) => {
      resolve({ success: !err, output: stdout || 'Host unreachable' });
    });
  });
});

// Real PRO Backend Database Handlers
ipcMain.handle('cyber:db-read', async () => {
  try {
    if (!fs.existsSync(DB_PATH)) return { success: true, data: {} };
    const raw = await fs.promises.readFile(DB_PATH, 'utf-8');
    return { success: true, data: JSON.parse(raw) };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('cyber:db-write', async (event, data) => {
  try {
    await fs.promises.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Real File Shredder (DoD 5220.22-M Style: 3 Passes)
ipcMain.handle('cyber:shred', async (event, filePath) => {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) return { success: false, error: 'File not found' };
    const stat = await fs.promises.stat(fullPath);
    if (stat.isDirectory()) return { success: false, error: 'Cannot shred directory' };

    // Pass 1: Zeros
    const zeros = Buffer.alloc(stat.size, 0x00);
    await fs.promises.writeFile(fullPath, zeros);
    // Pass 2: Ones
    const ones = Buffer.alloc(stat.size, 0xFF);
    await fs.promises.writeFile(fullPath, ones);
    // Pass 3: Random
    const random = crypto.randomBytes(stat.size);
    await fs.promises.writeFile(fullPath, random);

    // Finally delete
    await fs.promises.unlink(fullPath);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// AES-256-GCM File Encryption
ipcMain.handle('cyber:encrypt-file', async (event, filePath, password) => {
  try {
    const fullPath = path.resolve(filePath);
    const content = await fs.promises.readFile(fullPath);
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, 'cyber-salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    // Format: IV(16) + AuthTag(16) + EncryptedData
    const finalBuffer = Buffer.concat([iv, authTag, encrypted]);
    await fs.promises.writeFile(fullPath + '.enc', finalBuffer);
    await fs.promises.unlink(fullPath); // Delete original
    return { success: true, newPath: fullPath + '.enc' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('cyber:decrypt-file', async (event, filePath, password) => {
  try {
    const fullPath = path.resolve(filePath);
    const data = await fs.promises.readFile(fullPath);
    if (data.length < 33) return { success: false, error: 'Invalid encrypted file format' };

    const iv = data.subarray(0, 16);
    const authTag = data.subarray(16, 32);
    const encrypted = data.subarray(32);
    const key = crypto.scryptSync(password, 'cyber-salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const origPath = fullPath.replace(/\.enc$/, '');
    await fs.promises.writeFile(origPath, decrypted);
    await fs.promises.unlink(fullPath); // Delete .enc
    return { success: true, newPath: origPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// OSINT Recon (DNS & Net)
ipcMain.handle('cyber:osint', async (event, target) => {
  return new Promise((resolve) => {
    dns.lookup(target, { all: true }, (err, addresses) => {
      if (err) return resolve({ success: false, error: err.message });
      dns.resolveMx(target, (errMx, mx) => {
        resolve({
          success: true,
          target,
          ips: addresses.map(a => a.address),
          mx: mx || []
        });
      });
    });
  });
});

// Malware Sandbox VM
ipcMain.handle('cyber:sandbox-run', async (event, code) => {
  try {
    const vm = require('vm');
    const logs = [];
    const context = vm.createContext({
      console: { log: (...args) => logs.push(args.join(' ')) },
      Math, JSON, Date, setTimeout
    });
    
    // Create an isolated script with a timeout to prevent infinite loops
    const script = new vm.Script(code);
    const result = script.runInContext(context, { timeout: 1000 });
    
    return { success: true, logs, result: String(result) };
  } catch (err) {
    return { success: false, error: err.message };
  }
});


// Window Management (Tiling)
ipcMain.handle('cyber:window-split', async (event, opts) => {
  const allWins = BrowserWindow.getAllWindows().filter(w => w !== ghostWindow);
  if (allWins.length >= 4) {
    return { success: false, error: 'Maximum split limit reached (4 Windows)' };
  }
  
  let direction = 'vertical';
  let mode = '';
  let url = '';

  if (typeof opts === 'object' && opts !== null) {
    direction = opts.direction || 'vertical';
    mode = opts.mode || '';
    url = opts.url || '';
  } else if (typeof opts === 'string') {
    direction = opts;
  }
  
  const activeWin = BrowserWindow.getFocusedWindow() || allWins[0];
  const bounds = activeWin.getBounds();
  
  const newWin = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    backgroundColor: '#0c0c0c',
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: false,
      webviewTag: true
    }
  });

  const port = server.address().port;
  const targetQuery = `mode=${encodeURIComponent(mode)}&url=${encodeURIComponent(url)}&skipBoot=1`;
  newWin.loadURL(`http://127.0.0.1:${port}/index.html?${targetQuery}`);

  // Split Screen Sizing
  if (direction === 'vertical') {
    const halfWidth = Math.floor(bounds.width / 2);
    activeWin.setBounds({ x: bounds.x, y: bounds.y, width: halfWidth, height: bounds.height });
    newWin.setBounds({ x: bounds.x + halfWidth, y: bounds.y, width: halfWidth, height: bounds.height });
  } else {
    const halfHeight = Math.floor(bounds.height / 2);
    activeWin.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: halfHeight });
    newWin.setBounds({ x: bounds.x, y: bounds.y + halfHeight, width: bounds.width, height: halfHeight });
  }
  
  return { success: true };
});

// Window Controls
ipcMain.handle('cyber:window-control', (event, action) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { success: false };

  switch (action) {
    case 'minimize':
      win.minimize();
      break;
    case 'maximize':
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
      break;
    case 'close':
      win.close();
      break;
  }
  return { success: true };
});

// Bind to random available local port
server.listen(0, '127.0.0.1', () => {
  const port = server.address().port;

  function createGhostWindow() {
    const { width } = screen.getPrimaryDisplay().workAreaSize;
    
    ghostWindow = new BrowserWindow({
      width: width,
      height: 600,
      x: 0,
      y: -600,
      frame: false,
      transparent: true,
      hasShadow: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.cjs'),
        webSecurity: false,
        webviewTag: true
      }
    });
    
    ghostWindow.loadURL(`http://127.0.0.1:${port}/index.html?ghost=1`);
    
    let isVisible = false;
    globalShortcut.register('CommandOrControl+Shift+Space', () => {
      if (!ghostWindow) return;
      if (isVisible) {
        ghostWindow.setBounds({ x: 0, y: -600, width: width, height: 600 });
        ghostWindow.hide();
      } else {
        ghostWindow.show();
        ghostWindow.setBounds({ x: 0, y: 0, width: width, height: 600 });
        ghostWindow.focus();
      }
      isVisible = !isVisible;
    });
  }

  function startUsbDetection(win) {
    let knownDrives = null; // null indicates initial baseline scan not yet established

    const pollDrives = () => {
      exec('wmic logicaldisk get name,drivetype', (err, stdout) => {
        if (err) return;
        const lines = stdout.split('\n').map(l => l.trim()).filter(l => l);
        const currentRemovableDrives = [];

        // DriveType 2 = Removable Drive (USB flash drives, SD cards)
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(/\s+/);
          if (parts.length >= 2) {
            const driveType = parts[0];
            const name = parts[1] || parts[0];
            if (parts.includes('2')) {
              const driveLetter = parts.find(p => /^[A-Z]:$/i.test(p));
              if (driveLetter) currentRemovableDrives.push(driveLetter);
            }
          }
        }
        
        // If baseline is not established, set baseline silently with zero notifications
        if (knownDrives === null) {
          knownDrives = currentRemovableDrives;
          return;
        }

        const newDrives = currentRemovableDrives.filter(d => !knownDrives.includes(d));
        if (newDrives.length > 0 && win && !win.isDestroyed()) {
          newDrives.forEach(drive => {
            win.webContents.send('cyber:usb-detected', drive);
          });
        }
        knownDrives = currentRemovableDrives;
      });
    };

    // Run initial baseline immediately without alerting
    pollDrives();
    // Subsequent periodic checks every 6 seconds for actual physical USB hotplugs
    setInterval(pollDrives, 6000);
  }

  function createWindow() {
    const mainWindow = new BrowserWindow({
      width: 1280,
      height: 850,
      minWidth: 980,
      minHeight: 680,
      backgroundColor: '#0c0c0c',
      title: 'CYBER//TYPE OS PRO',
      frame: false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.cjs'),
        webSecurity: false,
        webviewTag: true
      }
    });

    mainWindow.loadURL(`http://127.0.0.1:${port}/index.html`);
    mainWindow.maximize();
    
    mainWindow.on('closed', () => {
      app.isQuitting = true;
      try { server.close(); } catch (e) {}
      app.exit(0);
    });
    
    startUsbDetection(mainWindow);
  }

  app.whenReady().then(() => {
    createWindow();
    createGhostWindow();

    const iconPath = path.join(__dirname, 'icon.ico');
    if (fs.existsSync(iconPath)) {
      try {
        tray = new Tray(iconPath);
        const contextMenu = Menu.buildFromTemplate([
          { label: 'Show Ghost Terminal (Ctrl+Shift+Space)', enabled: false },
          { type: 'separator' },
          { label: 'Exit CYBER//OS', click: () => { app.isQuitting = true; app.quit(); } }
        ]);
        tray.setToolTip('CYBER//TYPE OS BACKGROUND KERNEL');
        tray.setContextMenu(contextMenu);
      } catch (e) {
        console.log('Tray init note:', e.message);
      }
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      server.close();
      app.quit();
    }
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
});

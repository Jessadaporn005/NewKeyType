/**
 * CYBER//TYPE ELECTRON PRELOAD BRIDGE
 * Exposes real system capabilities securely to the renderer
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cyberSystemAPI', {
  isElectron: true,
  exec: (command) => ipcRenderer.invoke('cyber:exec', command),
  launch: (target) => ipcRenderer.invoke('cyber:launch', target),
  getSysInfo: () => ipcRenderer.invoke('cyber:sysinfo'),
  getProcesses: () => ipcRenderer.invoke('cyber:process-list'),
  killProcess: (pid) => ipcRenderer.invoke('cyber:process-kill', pid),
  getDrives: () => ipcRenderer.invoke('cyber:drive-list'),
  getDesktopShortcuts: () => ipcRenderer.invoke('cyber:desktop-list'),
  scanWifi: () => ipcRenderer.invoke('cyber:wifi-scan'),
  connectWifi: (ssid) => ipcRenderer.invoke('cyber:wifi-connect', ssid),
  listFiles: (dirPath) => ipcRenderer.invoke('cyber:fs-ls', dirPath),
  readFile: (filePath) => ipcRenderer.invoke('cyber:fs-read', filePath),
  readMediaDataUrl: (filePath) => ipcRenderer.invoke('cyber:fs-read-data-url', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('cyber:fs-write', filePath, content),
  makeDir: (dirPath) => ipcRenderer.invoke('cyber:fs-mkdir', dirPath),
  deleteFile: (filePath) => ipcRenderer.invoke('cyber:fs-delete', filePath),
  getPwd: () => ipcRenderer.invoke('cyber:fs-pwd'),
  ping: (host) => ipcRenderer.invoke('cyber:ping', host),
  
  // Real PRO Backend DB
  dbRead: () => ipcRenderer.invoke('cyber:db-read'),
  dbWrite: (data) => ipcRenderer.invoke('cyber:db-write', data),
  getMT5DemoSnapshot: () => ipcRenderer.invoke('cyber:mt5-demo-snapshot'),
  
  // Real Security & Cyber Tools
  shred: (filePath) => ipcRenderer.invoke('cyber:shred', filePath),
  encryptFile: (filePath, pass) => ipcRenderer.invoke('cyber:encrypt-file', filePath, pass),
  decryptFile: (filePath, pass) => ipcRenderer.invoke('cyber:decrypt-file', filePath, pass),
  osint: (target) => ipcRenderer.invoke('cyber:osint', target),
  sandboxRun: (code) => ipcRenderer.invoke('cyber:sandbox-run', code),
  windowSplit: (dir) => ipcRenderer.invoke('cyber:window-split', dir),
  windowControl: (action) => ipcRenderer.invoke('cyber:window-control', action),
  
  // Hardware Events
  onUsbDetected: (callback) => {
    const listener = (event, drive) => callback(drive);
    ipcRenderer.on('cyber:usb-detected', listener);
    return () => ipcRenderer.removeListener('cyber:usb-detected', listener);
  }
});

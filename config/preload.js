const { contextBridge, ipcRenderer } = require('electron');

// Expose specific Electron APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // App control
  exit: () => ipcRenderer.send('app-exit'),
  
  // Application information
  appInfo: {
    isElectron: true,
    platform: process.platform
  }
});

// Log when preload script has executed
console.log('Preload script loaded');
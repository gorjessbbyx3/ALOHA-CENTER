const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

// Keep a global reference of the window object to prevent it from being garbage collected
let mainWindow;
let serverProcess;

function startServer() {
  console.log('Starting Express server...');
  // Run the server in development mode
  serverProcess = spawn('node', ['--require', 'tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  serverProcess.on('error', (err) => {
    console.error('Failed to start server process:', err);
  });
  
  // Listen for server exit
  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Required for direct access to Node.js APIs
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'client/public/favicon.ico')
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:5000' // Development server
    : `file://${path.join(__dirname, 'dist/index.html')}`; // Production build

  mainWindow.loadURL(startUrl);

  // Open the DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window being closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize the app when Electron is ready
app.whenReady().then(() => {
  startServer();
  
  // Wait for server to start (could be improved with actual readiness check)
  setTimeout(() => {
    createWindow();
  }, 3000);
  
  // On macOS, recreate the window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up the server process when the app is quitting
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Handle IPC messages from renderer process
ipcMain.on('app-exit', () => {
  app.quit();
});
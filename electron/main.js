const { app, BrowserWindow, ipcMain, globalShortcut, dialog, shell, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const http = require('http');

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
let mainWindow = null;
let localServer = null;
let wasMaximizedBeforeLauncher = false;

async function startProductionServer() {
  const next = require('next');
  const appDir = path.join(__dirname, '..');
  const nextApp = next({ dev: false, dir: appDir });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'string' ? 3000 : address.port;
      console.log(`[RPGSA Electron] Production Next.js server running on port ${port}`);
      resolve({ server, port });
    });

    server.on('error', reject);
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: false,
    ...(process.platform === 'darwin' ? { titleBarStyle: 'hidden' } : {}),
    autoHideMenuBar: true,
    backgroundColor: '#0a0a0a',
    title: 'RPGSA — Sound & Vault Canvas',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  Menu.setApplicationMenu(null);
  if (typeof mainWindow.removeMenu === 'function') {
    mainWindow.removeMenu();
  }

  mainWindow.on('maximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window-maximized-change', true);
    }
  });

  mainWindow.on('unmaximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window-maximized-change', false);
    }
  });

  if (isDev) {
    const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
    await mainWindow.loadURL(devUrl);
    // mainWindow.webContents.openDevTools();
  } else {
    try {
      const { server, port } = await startProductionServer();
      localServer = server;
      await mainWindow.loadURL(`http://127.0.0.1:${port}`);
    } catch (err) {
      console.error('[RPGSA Electron] Failed to start local Next server:', err);
      // Fallback
      await mainWindow.loadURL('http://localhost:3000');
    }
  }

  // Register Global Hotkeys for Soundboard
  registerGlobalShortcuts();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerGlobalShortcuts() {
  // Ctrl+Shift+Space or Cmd+Shift+Space -> Mute/Pause all
  try {
    globalShortcut.register('CommandOrControl+Shift+Space', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('soundboard-mute-all');
      }
    });

    // Slots 1-9 -> Trigger Soundboard items 1-9
    for (let i = 1; i <= 9; i++) {
      globalShortcut.register(`CommandOrControl+Shift+${i}`, () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('soundboard-trigger', i);
        }
      });
    }
    console.log('[RPGSA Electron] Global Soundboard shortcuts registered successfully.');
  } catch (err) {
    console.warn('[RPGSA Electron] Failed to register some shortcuts:', err);
  }
}

// IPC Handlers
ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Selecione a pasta do Vault no Windows'
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

ipcMain.handle('open-folder-in-explorer', async (event, folderPath) => {
  if (folderPath) {
    await shell.openPath(folderPath);
    return true;
  }
  return false;
});

ipcMain.handle('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('is-maximized', () => {
  if (!mainWindow) return false;
  return mainWindow.isMaximized();
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('set-window-size', (event, width, height) => {
  if (!mainWindow) return false;
  try {
    const w = Math.round(Number(width));
    const h = Math.round(Number(height));
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    }
    mainWindow.setMinimumSize(Math.min(460, w), Math.min(580, h));
    mainWindow.setSize(w, h);
    mainWindow.center();
    return true;
  } catch (err) {
    console.error('[RPGSA Electron] Failed to set window size:', err);
    return false;
  }
});

ipcMain.handle('set-window-mode', (event, mode) => {
  if (!mainWindow) return false;
  try {
    if (mode === 'launcher') {
      // Preserva a janela ampla para o dashboard sem encolher para 500x680
      return true;
    } else if (mode === 'workspace') {
      mainWindow.setMinimumSize(1024, 700);
      if (wasMaximizedBeforeLauncher) {
        mainWindow.maximize();
        wasMaximizedBeforeLauncher = false;
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error('[RPGSA Electron] Failed to set window mode:', err);
    return false;
  }
});

// ==========================================
// Auto-Updater Configuration & Handlers
// ==========================================
function sendUpdateStatus(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', payload);
  }
}

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
  console.log('[RPGSA Updater] Checking for update...');
  sendUpdateStatus({ status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
  console.log('[RPGSA Updater] Update available:', info.version);
  sendUpdateStatus({ status: 'available', version: info.version });
});

autoUpdater.on('update-not-available', (info) => {
  console.log('[RPGSA Updater] Update not available. Current version is latest:', info && info.version);
  sendUpdateStatus({ status: 'not-available', version: info && info.version });
});

autoUpdater.on('download-progress', (progressObj) => {
  sendUpdateStatus({
    status: 'downloading',
    percent: Math.round(progressObj.percent),
    speed: Math.round(progressObj.bytesPerSecond || 0)
  });
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('[RPGSA Updater] Update downloaded:', info.version);
  sendUpdateStatus({ status: 'downloaded', version: info.version });
});

autoUpdater.on('error', (err) => {
  console.error('[RPGSA Updater] Update error:', err);
  sendUpdateStatus({ status: 'error', message: err ? err.message : 'Falha na atualização' });
});

ipcMain.handle('check-for-updates', async () => {
  if (!isDev) {
    try {
      return await autoUpdater.checkForUpdates();
    } catch (err) {
      console.error('[RPGSA Updater] Check failed:', err);
      sendUpdateStatus({ status: 'error', message: err.message });
    }
  } else {
    // In development mode, simulate verification
    sendUpdateStatus({ status: 'checking' });
    setTimeout(() => {
      sendUpdateStatus({ status: 'not-available', version: app.getVersion() });
    }, 1200);
  }
  return null;
});

ipcMain.handle('start-download-update', async () => {
  if (!isDev) {
    return await autoUpdater.downloadUpdate();
  }
  return null;
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall(false, true);
});

app.whenReady().then(async () => {
  await createWindow();

  if (!isDev) {
    // Check for updates 4 seconds after launch
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        console.log('[RPGSA Updater] Silent check error on launch:', err.message);
      });
    }, 4000);
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (localServer) {
    localServer.close();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

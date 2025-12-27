
import { app, BrowserWindow, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1240,
    height: 850,
    title: "Agha-Voxify Desktop Intelligence",
    // icon: path.join(__dirname, 'public/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  // CRITICAL: Load the dist/index.html after vite build
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  win.loadFile(indexPath).catch(() => {
    // If not found (development mode), try localhost
    win.loadURL('http://localhost:5173');
  });

  // Remove menu bar for clean look
  // win.setMenu(null);

  // Auto-grant Microphone Permission in Electron
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'media') return true;
    return false;
  });

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') return callback(true);
    callback(false);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

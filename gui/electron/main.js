const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#1a1a1a',
    title: 'Hytale Save Editor',
  });

  // In development, load from Vite dev server
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    win.loadURL('http://localhost:13337');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Handle F12 and other dev shortcuts
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      win.webContents.toggleDevTools();
    }
    if (input.key === 'r' && (input.control || input.meta) && input.type === 'keyDown') {
      win.reload();
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handler for Python Bridge
ipcMain.handle('hse-command', async (event, { command, args }) => {
  return new Promise((resolve, reject) => {
    const pythonPath = 'python'; // Assumes python is in PATH
    const scriptPath = path.join(__dirname, '../../hse.py');
    
    const cmdArgs = ['--headless', command, ...args];
    console.log(`Executing: ${pythonPath} ${scriptPath} ${cmdArgs.join(' ')}`);
    
    const pyProcess = spawn(pythonPath, [scriptPath, ...cmdArgs]);
    
    let stdout = '';
    let stderr = '';

    pyProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          resolve({ error: 'Failed to parse JSON response', raw: stdout });
        }
      } else {
        reject({ error: stderr || `Process exited with code ${code}`, code });
      }
    });
  });
});

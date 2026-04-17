const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  invokeHSE: (command, args = []) => ipcRenderer.invoke('hse-command', { command, args }),
});

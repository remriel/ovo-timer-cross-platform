const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ovoBridge", {
  notify: (details) => ipcRenderer.invoke("ovo:notify", details),
  setWindowTitle: (title) => ipcRenderer.send("ovo:set-window-title", title)
});

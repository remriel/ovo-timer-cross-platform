import { app, BrowserWindow, ipcMain, Notification, session } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;

function createWindow() {
  const options = {
    width: 1160,
    height: 790,
    minWidth: 760,
    minHeight: 620,
    show: false,
    backgroundColor: "#1650ff",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(here, "preload.cjs")
    }
  };

  if (process.platform === "win32") {
    options.titleBarStyle = "hidden";
    options.titleBarOverlay = {
      color: "#1650ff",
      symbolColor: "#fff8e8",
      height: 36
    };
  }

  mainWindow = new BrowserWindow(options);
  mainWindow.loadFile(path.join(here, "..", "www", "index.html"));
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId("com.remriel.ovotimer");
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(permission === "notifications");
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.on("ovo:set-window-title", (_event, title) => {
  if (mainWindow && typeof title === "string") {
    mainWindow.setTitle(title);
  }
});

ipcMain.handle("ovo:notify", (_event, details) => {
  const title = typeof details?.title === "string" ? details.title : "Ovo Timer";
  const body = typeof details?.body === "string" ? details.body : "Your countdown is complete.";

  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
    return true;
  }

  return false;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

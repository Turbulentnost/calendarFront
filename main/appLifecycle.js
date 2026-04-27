const { app, BrowserWindow } = require("electron");

/**
 * @param {() => import('electron').BrowserWindow} createWindow
 */
function registerAppLifecycle(createWindow) {
  app.whenReady().then(() => {
    createWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

module.exports = { registerAppLifecycle };

const { BrowserWindow } = require("electron");
const path = require("path");

/**
 * @returns {import('electron').BrowserWindow}
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 960,
    height: 640,
    minWidth: 640,
    minHeight: 480,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "..", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      /* иначе require(preload) + часть C API может вести себя нестабильно на Windows */
      sandbox: false,
    },
  });

  const htmlPath = path.join(__dirname, "..", "index.html");
  void win.loadFile(htmlPath).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("loadFile failed:", err);
  });

  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    // eslint-disable-next-line no-console
    console.error("did-fail-load", { code, desc, url });
  });

  return win;
}

module.exports = { createWindow };

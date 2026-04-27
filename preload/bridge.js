const path = require("path");
const { contextBridge } = require("electron");

/**
 * Main уже вызвал ensureEnvApiBase() — env есть.
 * Песочница preload плохо дружит с fs в resolve.cjs; читаем JSON через require.
 */
function readApiBase() {
  const fromEnv = process.env.DJANGO_API_BASE;
  if (fromEnv) {
    return String(fromEnv).replace(/\/+$/, "");
  }
  const cfg = require(path.join(__dirname, "..", "config", "backend.json"));
  return String(cfg.apiBase).replace(/\/+$/, "");
}

function exposeRendererApi() {
  contextBridge.exposeInMainWorld("electronAPI", {
    platform: process.platform,
    apiBase: readApiBase(),
  });
}

module.exports = { exposeRendererApi };
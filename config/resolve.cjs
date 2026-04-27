const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "backend.json");

function _readConfig() {
  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  return JSON.parse(raw);
}

let _cache;

function getBackendFileConfig() {
  if (!_cache) {
    _cache = _readConfig();
  }
  return _cache;
}

function normalizeBase(url) {
  return String(url || "")
    .trim()
    .replace(/\/+$/, "");
}

/**
 * Подставить URL из `backend.json` в окружение, если переменная не задана.
 * Переменная `DJANGO_API_BASE` перекрывает файл (удобно для CI и локальных запусков).
 */
function ensureEnvApiBase() {
  if (!process.env.DJANGO_API_BASE) {
    const { apiBase } = getBackendFileConfig();
    process.env.DJANGO_API_BASE = normalizeBase(apiBase);
  } else {
    process.env.DJANGO_API_BASE = normalizeBase(process.env.DJANGO_API_BASE);
  }
}

/**
 * Итоговый URL API (env или файл).
 */
function getApiBase() {
  ensureEnvApiBase();
  return normalizeBase(process.env.DJANGO_API_BASE);
}

module.exports = {
  getApiBase,
  ensureEnvApiBase,
  getBackendFileConfig,
  CONFIG_PATH,
};

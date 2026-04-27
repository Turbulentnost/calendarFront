/**
 * Запасной URL, если `electronAPI` ещё недоступен (синхронизируйте с `config/backend.json`).
 */
const FALLBACK_BASE = "http://192.168.1.157:8001";

/**
 * База URL API: `window.electronAPI` из preload (читает `config/backend.json` / env);
 * вне Electron — адрес из того же `backend.json`.
 */
function getApiBase() {
  if (typeof window !== "undefined" && window.electronAPI?.apiBase) {
    return String(window.electronAPI.apiBase).replace(/\/$/, "");
  }
  return FALLBACK_BASE;
}

export const API_BASE = getApiBase();
export const API_V1 = `${API_BASE}/api/v1`;

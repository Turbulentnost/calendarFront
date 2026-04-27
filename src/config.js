const FALLBACK = "http://192.168.1.157:8001";

function norm(u) {
  return String(u || "")
    .trim()
    .replace(/\/$/, "");
}

/**
 * В dev при пустом VITE_API_BASE — относительные URL /api/... (прокси Vite).
 * В production задайте VITE_API_BASE на URL бэкенда.
 */
export const API_BASE = (() => {
  const v = import.meta.env.VITE_API_BASE;
  if (import.meta.env.DEV && (v === undefined || v === "")) {
    return "";
  }
  return norm(v) || FALLBACK;
})();

export const API_V1 = API_BASE ? `${API_BASE}/api/v1` : "/api/v1";

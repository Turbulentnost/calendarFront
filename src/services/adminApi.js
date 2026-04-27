import { API_BASE } from "../config.js";
import { getToken } from "./auth.js";

function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      qs.set(key, String(value));
    }
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function extractErrorMessage(data) {
  if (!data || typeof data !== "object") {
    return "Ошибка запроса";
  }
  if (typeof data.detail === "string") {
    return data.detail;
  }
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value.length) {
      return String(value[0]);
    }
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return "Ошибка запроса";
}

const adminPrefix = () => (API_BASE ? `${API_BASE}/api/admin` : "/api/admin");

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  let body = options.body;
  if (options.json !== undefined) {
    body = JSON.stringify(options.json);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }
  if (body instanceof FormData) {
    headers.delete("Content-Type");
  }

  const res = await fetch(`${adminPrefix()}/${path}`, {
    method: options.method || "GET",
    headers,
    body,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail = extractErrorMessage(data);
    const err = new Error(detail);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function getUsers(params) {
  return request(`users/${buildQuery(params)}`);
}

export function createUser(payload) {
  return request("users/", { method: "POST", body: payload });
}

export function updateUser(id, payload) {
  return request(`users/${id}/`, { method: "PUT", body: payload });
}

export function deleteUser(id) {
  return request(`users/${id}/`, { method: "DELETE" });
}

export function resetPassword(id) {
  return request(`users/${id}/reset-password/`, { method: "POST" });
}

export function getStats() {
  return request("stats/");
}

export function getTasks(params) {
  return request(`tasks/${buildQuery(params)}`);
}

export function createTask(payload) {
  return request("tasks/", { method: "POST", json: payload });
}

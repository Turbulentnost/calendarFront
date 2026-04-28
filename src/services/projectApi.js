import { API_BASE } from "../config.js";
import { getToken } from "./auth.js";

const calendarPrefix = () =>
  API_BASE ? `${API_BASE}/api/calendar` : "/api/calendar";

function extractErrorMessage(data) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }
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

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  let body = options.body;
  if (options.json !== undefined) {
    body = JSON.stringify(options.json);
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${calendarPrefix()}/${path}`, {
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
    const err = new Error(extractErrorMessage(data));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function getProjects() {
  return request("projects/");
}

export function createProject(payload) {
  return request("projects/", { method: "POST", json: payload });
}

export function loginProject(payload) {
  return request("projects/login/", { method: "POST", json: payload });
}

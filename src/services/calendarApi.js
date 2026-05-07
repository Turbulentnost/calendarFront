import { API_BASE } from "../config.js";
import { getToken } from "./auth.js";

const calendarPrefix = () =>
  API_BASE ? `${API_BASE}/api/calendar` : "/api/calendar";

function extractErrorMessage(data) {
  if (!data || typeof data !== "object") {
    return "Ошибка запроса";
  }
  if (typeof data.detail === "string") {
    return data.detail;
  }
  return "Ошибка запроса";
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  const res = await fetch(`${calendarPrefix()}/${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body,
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

export function getAllProjects() {
  return request("projects/all/");
}

export function deleteProject(id) {
  return request(`projects/${id}/`, {
    method: "DELETE",
  });
}

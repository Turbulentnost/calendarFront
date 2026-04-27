import { API_V1 } from "../config.js";
import { getToken } from "./auth.js";

/**
 * @param {string} path
 * @param {RequestInit & { json?: object }} [options]
 */
export async function apiRequest(path, options = {}) {
  const url = path.startsWith("http")
    ? path
    : `${API_V1}${path.startsWith("/") ? path : `/${path}`}`;

  const { json, body, ...init } = options;
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  let finalBody = body;
  if (json !== undefined) {
    finalBody = JSON.stringify(json);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }
  if (finalBody instanceof FormData) {
    headers.delete("Content-Type");
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body: finalBody,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      data && typeof data === "object" && data.detail
        ? data.detail
        : res.statusText;
    const err = new Error(
      typeof message === "string" ? message : res.statusText
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function loginRequest(nickname, password) {
  return apiRequest("auth/login/", {
    method: "POST",
    json: { nickname, password },
  });
}

export function fetchMe() {
  return apiRequest("auth/me/", { method: "GET" });
}

const PROJECT_TOKEN_KEY = "calendar_project_token";
const PROJECT_KEY = "calendar_project";

export function getStoredProject() {
  try {
    const raw = sessionStorage.getItem(PROJECT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setProjectSession(token, project) {
  sessionStorage.setItem(PROJECT_TOKEN_KEY, token || "");
  sessionStorage.setItem(PROJECT_KEY, JSON.stringify(project || null));
}

export function clearProjectSession() {
  sessionStorage.removeItem(PROJECT_TOKEN_KEY);
  sessionStorage.removeItem(PROJECT_KEY);
}

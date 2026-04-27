import { mountAdminFooter } from "./components/AdminFooter.js";
import { onRouteHeaderUpdate } from "./components/Header.js";
import { mountAdmin } from "./pages/AdminView.js";
import { mountHome } from "./pages/HomeView.js";

function normalizeHash() {
  const h = window.location.hash.replace(/^#/, "") || "/";
  return h.startsWith("/") ? h : `/${h}`;
}

/**
 * @param {HTMLElement} outlet
 */
export function route(outlet) {
  const path = normalizeHash();
  outlet.innerHTML = "";

  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  outlet.className = isAdmin
    ? "app__outlet app__outlet--flush"
    : "app__outlet";

  if (isAdmin) {
    mountAdmin(outlet);
  } else {
    mountHome(outlet);
  }
  const footer = document.querySelector('[data-component="admin-footer"]');
  if (footer) {
    mountAdminFooter(footer);
  }
}

export function startRouter(outlet) {
  const onChange = () => {
    route(outlet);
    onRouteHeaderUpdate();
  };
  window.addEventListener("hashchange", onChange);
  onChange();
}

export function navigateTo(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}

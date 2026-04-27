import { mountHeader } from "./Header.js";
import { mountAdminFooter } from "./AdminFooter.js";
import { startRouter } from "../router.js";

/**
 * @param {HTMLElement} root
 */
export function mountAppShell(root) {
  root.innerHTML = `
    <header class="app__header" data-component="header"></header>
    <div class="app__outlet" data-component="outlet" id="app-outlet"></div>
    <footer class="app-footer" data-component="admin-footer"></footer>
  `;

  const header = root.querySelector('[data-component="header"]');
  const outlet = root.querySelector('[data-component="outlet"]');
  const footer = root.querySelector('[data-component="admin-footer"]');

  if (header) {
    mountHeader(header);
  }
  if (outlet) {
    startRouter(outlet);
  }
  if (footer) {
    mountAdminFooter(footer);
  }
}

/** После логина/логаута обновить футер и шапку. */
export function refreshAppChrome() {
  const header = document.querySelector('[data-component="header"]');
  const footer = document.querySelector('[data-component="admin-footer"]');
  if (header) {
    mountHeader(header);
  }
  if (footer) {
    mountAdminFooter(footer);
  }
}

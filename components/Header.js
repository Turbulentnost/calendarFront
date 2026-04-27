import { getToken, isStaff, getStoredUser } from "../services/auth.js";

/**
 * @param {HTMLElement} container
 */
export function mountHeader(container) {
  const path = window.location.hash || "#/";
  const onHome = !path.startsWith("#/admin");
  const onAdmin = path.startsWith("#/admin");
  const staff = isStaff();
  const u = getStoredUser();
  const hasSession = Boolean(getToken());

  container.innerHTML = `
    <div class="header__brand">
      <div class="header__mark" aria-hidden="true">TT</div>
      <div class="header__text">
        <h1 class="header__title">TurboTasks</h1>
        <p class="header__subtitle">Ставьте задачи, контролируйте выполнение</p>
      </div>
    </div>
    <nav class="header__nav" aria-label="Основная навигация">
      <a href="#/" class="header__link ${onHome ? "header__link--active" : ""}" data-nav="home">Главная</a>
      ${
        staff
          ? `<a href="#/admin" class="header__link ${onAdmin ? "header__link--active" : ""}" data-nav="admin">Панель</a>`
          : ""
      }
      <button type="button" class="header__link header__link--button ${hasSession ? "header__hidden" : ""}" data-action="to-admin">
        Войти
      </button>
      <span class="pill ${u ? "pill--ok" : ""}" data-user-pill style="display:${u ? "inline-flex" : "none"}">
        ${u ? (u.nickname || "user") : ""}
      </span>
    </nav>
  `;

  const loginBtn = container.querySelector('[data-action="to-admin"]');
  loginBtn?.addEventListener("click", () => {
    window.location.hash = "#/admin";
  });
}

/**
 * Синхронизирует навигацию (например после входа).
 * @param {HTMLElement} [root]
 */
export function refreshHeaderNav(root) {
  const h = root?.querySelector?.('[data-component="header"]') || document.querySelector('[data-component="header"]');
  if (h) {
    mountHeader(h);
  }
}

export function onRouteHeaderUpdate() {
  const h = document.querySelector('[data-component="header"]');
  if (h) {
    mountHeader(h);
  }
}

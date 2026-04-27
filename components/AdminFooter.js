import { isStaff } from "../services/auth.js";
import { API_BASE } from "../services/config.js";

/**
 * Футер с быстрыми ссылками для администраторов (Django admin + панель).
 * @param {HTMLElement} container
 */
export function mountAdminFooter(container) {
  const staff = isStaff();
  const adminUrl = `${API_BASE}/admin/`;

  if (!staff) {
    container.innerHTML = "";
    container.classList.add("app-footer--hidden");
    return;
  }
  container.classList.remove("app-footer--hidden");

  container.innerHTML = `
    <div class="app-footer__inner">
      <div class="app-footer__admin">
        <span class="app-footer__label">Администрирование</span>
        <div class="app-footer__links">
          <a href="${adminUrl}" target="_blank" rel="noopener noreferrer">Django Admin</a>
          <a href="#/admin">Панель пользователей</a>
          <a href="#/">Главная</a>
        </div>
      </div>
      <p class="app-footer__meta">
        Управление пользователями и ролями доступно в браузерной админке Django и в панели приложения.
        <span class="app-footer__note">API: ${API_BASE}/api/v1/</span>
      </p>
    </div>
  `;
}

export function refreshAdminFooter() {
  const el = document.querySelector('[data-component="admin-footer"]');
  if (el) {
    mountAdminFooter(el);
  }
}

import { onRouteHeaderUpdate } from "../components/Header.js";
import { refreshAppChrome } from "../components/AppShell.js";
import { clearSession, getToken, setSession } from "../services/auth.js";
import { apiRequest, createUser, fetchUsers, loginRequest } from "../services/api.js";

function renderLogin(outlet, error) {
  outlet.className = "app__outlet admin";
  outlet.innerHTML = `
    <section class="admin">
      <div class="auth-card" style="max-width:420px;margin:0 auto;">
        <h2 class="auth-card__title">Вход администратора</h2>
        <p class="auth-card__hint">Используйте никнейм и пароль (по умолчанию admin / admin).</p>
        ${error ? `<div class="error-banner" role="alert">${escapeHtml(error)}</div>` : ""}
        <form id="login-form" class="form-grid">
          <div class="form-field">
            <label for="ln">Никнейм</label>
            <input id="ln" name="nickname" type="text" required autocomplete="username" value="admin" />
          </div>
          <div class="form-field">
            <label for="lp">Пароль</label>
            <input id="lp" name="password" type="password" required autocomplete="current-password" value="admin" />
          </div>
          <div class="form-field form-field--full" style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn btn--primary" type="submit">Войти</button>
            <a class="btn btn--ghost" href="#/">На главную</a>
          </div>
        </form>
      </div>
    </section>
  `;
  const form = outlet.querySelector("#login-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const nickname = String(fd.get("nickname") || "");
    const password = String(fd.get("password") || "");
    try {
      const res = await loginRequest(nickname, password);
      if (res?.token && res.user) {
        setSession(res.token, res.user);
        refreshAppChrome();
        onRouteHeaderUpdate();
        mountAdmin(outlet);
      }
    } catch (err) {
      renderLogin(outlet, err?.message || "Ошибка входа");
    }
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function loadUsersState(outlet) {
  let list = [];
  let err = "";
  try {
    list = await fetchUsers();
  } catch (e) {
    err = e?.message || "Не удалось загрузить список";
  }
  renderPanel(outlet, list, err);
}

function renderPanel(outlet, users, loadError) {
  outlet.className = "app__outlet admin";
  const rows = (Array.isArray(users) ? users : [])
    .map(
      (u) => `
      <tr>
        <td>
          ${
            u.photo_url
              ? `<img class="avatar-sm" src="${escapeHtml(u.photo_url)}" alt="" />`
              : `<div class="avatar-sm"></div>`
          }
        </td>
        <td><strong>${escapeHtml(u.nickname || "")}</strong></td>
        <td>${escapeHtml([u.first_name, u.last_name].filter(Boolean).join(" "))}</td>
        <td>${u.role === 0 ? "0 (суперадмин)" : u.role === 1 ? "1 (админ)" : escapeHtml(String(u.role))}</td>
        <td>${escapeHtml(u.job_title || "—")}</td>
        <td>${u.is_staff ? "да" : "нет"}</td>
        <td>${u.is_active ? "да" : "нет"}</td>
      </tr>`
    )
    .join("");

  outlet.innerHTML = `
    <section class="admin">
      <div class="admin__head">
        <div>
          <h2 class="admin__h1">Пользователи TurboTasks</h2>
          <p class="admin__sub">Создавайте участников команды для постановки и контроля задач. Роли: 0 — суперадмин, 1 — админ.</p>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
          <button type="button" class="btn btn--ghost" id="btn-refresh">Обновить</button>
          <button type="button" class="btn btn--ghost" id="btn-logout">Выйти</button>
        </div>
      </div>
      ${loadError ? `<div class="error-banner">${escapeHtml(loadError)}</div>` : ""}
      <div class="split">
        <div>
          <h3 class="auth-card__title" style="margin:0 0 0.75rem;">Список</h3>
          <div class="table-wrap">
            <table class="admin-table" aria-label="Список пользователей">
              <thead>
                <tr>
                  <th>Фото</th>
                  <th>Ник</th>
                  <th>Имя</th>
                  <th>Роль</th>
                  <th>Должность</th>
                  <th>Staff</th>
                  <th>Активен</th>
                </tr>
              </thead>
              <tbody>
                ${rows || `<tr><td colspan="7" class="empty">Пока нет пользователей</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div class="admin-panel">
            <h3 class="auth-card__title" style="margin:0 0 0.25rem;">Новый пользователь</h3>
            <p class="auth-card__hint">Пароль передаётся на сервер один раз, храните его безопасно.</p>
            <form id="user-create-form">
              <div class="form-grid">
                <div class="form-field">
                  <label for="c-nick">Никнейм *</label>
                  <input id="c-nick" name="nickname" required minlength="1" />
                </div>
                <div class="form-field">
                  <label for="c-pass">Пароль *</label>
                  <input id="c-pass" name="password" type="password" required />
                </div>
                <div class="form-field">
                  <label for="c-fn">Имя</label>
                  <input id="c-fn" name="first_name" />
                </div>
                <div class="form-field">
                  <label for="c-ln">Фамилия</label>
                  <input id="c-ln" name="last_name" />
                </div>
                <div class="form-field">
                  <label for="c-role">Роль (число)</label>
                  <input id="c-role" name="role" type="number" step="0.1" value="1" />
                </div>
                <div class="form-field form-field--full">
                  <label for="c-job">Должность</label>
                  <input id="c-job" name="job_title" placeholder="Напр. Ведущий инженер" />
                </div>
                <div class="form-field form-field--full">
                  <label for="c-photo">Фото профиля</label>
                  <label for="c-photo" class="upload-box">
                    <span class="upload-box__icon" aria-hidden="true">+</span>
                    <span class="upload-box__text">
                      Нажмите, чтобы загрузить фото
                      <small>PNG, JPG, WEBP</small>
                    </span>
                    <span id="photo-file-name" class="upload-box__filename">Файл не выбран</span>
                  </label>
                  <input id="c-photo" class="upload-box__input" name="photo" type="file" accept="image/*" />
                </div>
                <div class="form-field form-field--full form-check">
                  <input id="c-staff" name="is_staff" type="checkbox" />
                  <label for="c-staff">Доступ в админку (staff)</label>
                </div>
                <div class="form-field form-field--full form-check">
                  <input id="c-active" name="is_active" type="checkbox" checked />
                  <label for="c-active">Аккаунт активен</label>
                </div>
                <div class="form-field form-field--full">
                  <button class="btn btn--primary" type="submit">Создать</button>
                </div>
              </div>
            </form>
            <p class="muted" id="user-create-msg" style="margin:0.5rem 0 0; font-size:0.9rem;"></p>
          </div>
        </div>
      </div>
    </section>
  `;

  outlet.querySelector("#btn-logout")?.addEventListener("click", () => {
    clearSession();
    refreshAppChrome();
    onRouteHeaderUpdate();
    renderLogin(outlet, "");
  });
  outlet.querySelector("#btn-refresh")?.addEventListener("click", () => {
    loadUsersState(outlet);
  });
  outlet.querySelector("#user-create-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = outlet.querySelector("#user-create-form");
    const msg = outlet.querySelector("#user-create-msg");
    const fileInput = form.querySelector('[name="photo"]');
    const file = fileInput?.files?.[0];
    const nickname = String(form.nickname.value || "").trim();
    const password = String(form.password.value || "");
    const first_name = String(form.first_name.value || "");
    const last_name = String(form.last_name.value || "");
    const job_title = String(form.job_title.value || "");
    const role = parseFloat(String(form.role.value || "1"), 10);
    const is_staff = form.querySelector('[name="is_staff"]').checked;
    const is_active = form.querySelector('[name="is_active"]').checked;
    if (!msg) {
      return;
    }
    msg.textContent = "";
    try {
      if (file && file.size > 0) {
        const fd = new FormData();
        fd.append("nickname", nickname);
        fd.append("password", password);
        fd.append("first_name", first_name);
        fd.append("last_name", last_name);
        fd.append("job_title", job_title);
        fd.append("role", String(role));
        fd.append("is_staff", is_staff ? "true" : "false");
        fd.append("is_active", is_active ? "true" : "false");
        fd.append("photo", file);
        await createUser(fd);
      } else {
        await apiRequest("users/", {
          method: "POST",
          json: {
            nickname,
            password,
            first_name,
            last_name,
            job_title,
            role: Number.isFinite(role) ? role : 1,
            is_staff,
            is_active,
          },
        });
      }
      msg.textContent = "Пользователь создан.";
      msg.style.color = "var(--success)";
      form.reset();
      form.querySelector('[name="is_active"]').checked = true;
      form.querySelector('[name="role"]').value = "1";
      await loadUsersState(outlet);
    } catch (err) {
      msg.textContent = err?.message || "Ошибка создания";
      msg.style.color = "var(--danger)";
    }
  });

  const photoInput = outlet.querySelector("#c-photo");
  const photoLabel = outlet.querySelector("#photo-file-name");
  photoInput?.addEventListener("change", () => {
    const file = photoInput.files?.[0];
    if (photoLabel) {
      photoLabel.textContent = file ? file.name : "Файл не выбран";
    }
  });
}

/**
 * @param {HTMLElement} outlet
 */
export function mountAdmin(outlet) {
  if (!getToken()) {
    renderLogin(outlet, "");
    return;
  }
  loadUsersState(outlet);
}

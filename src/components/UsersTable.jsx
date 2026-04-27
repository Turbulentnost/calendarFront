import { useState } from "react";

function avatarInitials(user) {
  const f = (user.first_name || "").trim();
  const l = (user.last_name || "").trim();
  if (f || l) {
    return `${f[0] || ""}${l[0] || ""}`.toUpperCase() || "U";
  }
  return (user.nickname || "U").slice(0, 2).toUpperCase();
}

export function UsersTable({
  rows,
  filters,
  pagination,
  stats,
  canManage,
  loading,
  onOpenCreate,
  onUpdateFilters,
  onApplyFilters,
  onEdit,
  onReset,
  onDelete,
  onChangePage,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const pages = pagination.pages || 1;

  function updateFilter(key, value) {
    onUpdateFilters({ ...filters, [key]: value });
  }

  return (
    <section className="tt-panel">
      <div className="tt-toolbar">
        <div className="tt-toolbar__left">
          <button
            className="tt-btn tt-btn--primary"
            type="button"
            onClick={onOpenCreate}
          >
            + Добавить пользователя
          </button>
          <button
            type="button"
            className={[
              "tt-btn",
              "tt-btn--filter",
              filtersOpen && "tt-btn--filter-active",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setFiltersOpen((o) => !o)}
          >
            Фильтры
            <span className="tt-btn__chevron">{filtersOpen ? "▲" : "▼"}</span>
          </button>
        </div>
        <div className="tt-search">
          <span className="tt-search__icon">🔍</span>
          <input
            type="text"
            value={filters.q}
            placeholder="Поиск: nickname / имя / фамилия"
            onChange={(e) => updateFilter("q", e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && onApplyFilters()}
          />
        </div>
      </div>

      {filtersOpen && (
        <div className="tt-filters">
          <select
            value={filters.role}
            onChange={(e) => updateFilter("role", e.target.value)}
          >
            <option value="">Все роли</option>
            <option value="0">Суперадмин</option>
            <option value="1">Админ</option>
          </select>
          <input
            type="text"
            value={filters.department}
            placeholder="Фильтр по отделу"
            onChange={(e) => updateFilter("department", e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && onApplyFilters()}
          />
          <input
            type="text"
            value={filters.job_title}
            placeholder="Фильтр по должности"
            onChange={(e) => updateFilter("job_title", e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && onApplyFilters()}
          />
          <button
            className="tt-btn tt-btn--apply"
            type="button"
            onClick={onApplyFilters}
          >
            Применить фильтры
          </button>
        </div>
      )}

      <div className="tt-table-wrap">
        <table className="tt-table">
          <thead>
            <tr>
              <th>Аватар</th>
              <th>Пользователь</th>
              <th>Имя и фамилия</th>
              <th>Роль</th>
              <th>Отдел</th>
              <th>Должность</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="tt-empty">
                  Загрузка...
                </td>
              </tr>
            )}
            {!loading && !rows.length && (
              <tr>
                <td colSpan={7} className="tt-empty">
                  Пользователи не найдены
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.photo_url ? (
                      <img
                        className="tt-avatar"
                        src={user.photo_url}
                        alt=""
                      />
                    ) : (
                      <div className="tt-avatar tt-avatar--placeholder">
                        {avatarInitials(user)}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="tt-user-main">{user.nickname}</div>
                    <div className="tt-user-sub">{user.job_title || "—"}</div>
                  </td>
                  <td>
                    {[user.first_name, user.last_name].filter(Boolean).join(" ") ||
                      "—"}
                  </td>
                  <td>
                    <span
                      className={[
                        "tt-badge",
                        user.role === 0 ? "tt-badge--danger" : "tt-badge--primary",
                      ].join(" ")}
                    >
                      {user.role === 0 ? "Суперадмин" : "Админ"}
                    </span>
                  </td>
                  <td>{user.department || "—"}</td>
                  <td>{user.job_title || "—"}</td>
                  <td>
                    <div className="tt-actions">
                      <button
                        type="button"
                        disabled={!canManage(user)}
                        onClick={() => onEdit(user)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        disabled={!canManage(user)}
                        onClick={() => onReset(user)}
                        title="Сбросить пароль"
                      >
                        🔑
                      </button>
                      <button
                        type="button"
                        disabled={!canManage(user)}
                        onClick={() => onDelete(user)}
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="tt-table-footer">
        <div className="tt-stats">
          Всего: <b>{stats.total_users || 0}</b>, админов:{" "}
          <b>{stats.admins || 0}</b>, суперадминов:{" "}
          <b>{stats.superadmins || 0}</b>
        </div>
        <div className="tt-pagination">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => onChangePage(pagination.page - 1)}
          >
            Назад
          </button>
          <span>
            Стр. {pagination.page} / {pages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pages}
            onClick={() => onChangePage(pagination.page + 1)}
          >
            Вперёд
          </button>
        </div>
      </div>
    </section>
  );
}

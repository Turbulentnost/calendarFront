import { useState, useMemo } from "react";

export function HeaderBar({ user, title, onLogout, onToggleSidebar }) {
  const [open, setOpen] = useState(false);
  const initials = useMemo(() => {
    const src = user?.nickname || "TT";
    return src.slice(0, 2).toUpperCase();
  }, [user?.nickname]);

  const roleLabel =
    user?.role === 0 || user?.is_superuser
      ? "Суперадмин"
      : user?.role === 1
        ? "Админ"
        : "Пользователь";

  function doLogout() {
    setOpen(false);
    onLogout();
  }

  return (
    <header className="tt-header">
      <div className="tt-header__left">
        <button
          className="tt-header__burger"
          type="button"
          onClick={onToggleSidebar}
        >
          ☰
        </button>
        <div className="tt-header__title">{title}</div>
      </div>
      <div className="tt-header__right">
        <button
          className="tt-quick-logout"
          type="button"
          onClick={doLogout}
        >
          Выйти
        </button>
        <div
          className="tt-user-menu"
          onClick={() => setOpen((o) => !o)}
          role="button"
          tabIndex={0}
        >
          <div className="tt-user-menu__avatar">{initials}</div>
          <div className="tt-user-menu__meta">
            <div className="tt-user-menu__name">
              {user?.nickname || "admin"}
            </div>
            <div className="tt-user-menu__role">{roleLabel}</div>
          </div>
          <div className="tt-user-menu__caret">▾</div>
          {open && (
            <div className="tt-user-menu__dropdown">
              <button type="button" onClick={(e) => e.stopPropagation()}>
                Мой профиль
              </button>
              <button
                type="button"
                className="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  doLogout();
                }}
              >
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

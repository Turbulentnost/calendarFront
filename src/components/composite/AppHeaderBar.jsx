import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../utils/paths.js";

export function AppHeaderBar({
  user,
  title,
  activeProject,
  onLogout,
  onToggleSidebar,
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
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

  function openProfile(e) {
    e.stopPropagation();
    setOpen(false);
    navigate(PATHS.PROFILE);
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
        <div className="tt-header__heading">
          <div className="tt-header__title">{title}</div>
          {activeProject && (
            <div className="tt-header__project">
              Активный проект: {activeProject.title || activeProject.login}
            </div>
          )}
        </div>
      </div>
      <div className="tt-header__right">
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
              <button type="button" onClick={openProfile}>
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

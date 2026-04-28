import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn.js";
import { PATHS } from "../../utils/paths.js";

const menuClass = ({ isActive }) =>
  cn("tt-menu-item", isActive && "tt-menu-item--active");

export function AppSidebar({ open, mobile, onClose }) {
  const handleNavigate = () => {
    if (mobile) {
      onClose();
    }
  };

  return (
    <>
      <aside
        className={cn(
          "tt-sidebar",
          mobile && "tt-sidebar--mobile",
          open && "tt-sidebar--open"
        )}
      >
        <div className="tt-sidebar__brand">
          <div className="tt-logo">TT</div>
          <div className="tt-brand-text">
            <h1>TurboTasks</h1>
            <p>Corporate Task Desk</p>
          </div>
          {mobile && (
            <button
              className="tt-sidebar__close"
              type="button"
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
        <nav className="tt-sidebar__menu">
          <NavLink
            className={menuClass}
            end
            onClick={handleNavigate}
            to={PATHS.USERS}
          >
            Пользователи
          </NavLink>
          <NavLink
            className={menuClass}
            end
            onClick={handleNavigate}
            to={PATHS.PROJECTS}
          >
            Проекты
          </NavLink>
          <NavLink
            className={menuClass}
            end
            onClick={handleNavigate}
            to={PATHS.TASKS}
          >
            Задачи
          </NavLink>
        </nav>
      </aside>
      {mobile && open && (
        <div
          className="tt-sidebar-backdrop"
          onClick={onClose}
          role="presentation"
        />
      )}
    </>
  );
}

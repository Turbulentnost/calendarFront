import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn.js";
import {
  canViewAllProjectsPage,
  canViewUsersPage,
} from "../../utils/access.js";
import { PATHS } from "../../utils/paths.js";

const menuClass = ({ isActive }) =>
  cn("tt-menu-item", isActive && "tt-menu-item--active");

export function AppSidebar({ user, open, mobile, onClose }) {
  const canViewUsers = canViewUsersPage(user);
  const canViewAllProjects = canViewAllProjectsPage(user);
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
          {canViewUsers && (
            <NavLink
              className={menuClass}
              end
              onClick={handleNavigate}
              to={PATHS.USERS}
            >
              Пользователи
            </NavLink>
          )}
          <NavLink
            className={menuClass}
            end
            onClick={handleNavigate}
            to={PATHS.TASKS}
          >
            Задачи
          </NavLink>
          <NavLink
            className={menuClass}
            end
            onClick={handleNavigate}
            to={PATHS.CREATE_TASK}
          >
            Создать задачу
          </NavLink>
          <NavLink
            className={menuClass}
            end
            onClick={handleNavigate}
            to={PATHS.PROJECTS}
          >
            Мои проекты
          </NavLink>
          {canViewAllProjects && (
            <NavLink
              className={menuClass}
              end
              onClick={handleNavigate}
              to={PATHS.ALL_PROJECTS}
            >
              Все проекты
            </NavLink>
          )}
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

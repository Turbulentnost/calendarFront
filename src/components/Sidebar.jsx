export function Sidebar({ open, mobile, onClose }) {
  return (
    <>
      <aside
        className={[
          "tt-sidebar",
          mobile && "tt-sidebar--mobile",
          open && "tt-sidebar--open",
        ]
          .filter(Boolean)
          .join(" ")}
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
          <a className="tt-menu-item tt-menu-item--active" href="#">
            Пользователи
          </a>
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

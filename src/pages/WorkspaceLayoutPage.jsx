import { Outlet } from "react-router-dom";

/**
 * Контент дочерних маршрутов /users, /projects, /tasks (см. appRouter).
 */
export function WorkspaceLayoutPage() {
  return (
    <section className="tt-content">
      <Outlet />
    </section>
  );
}

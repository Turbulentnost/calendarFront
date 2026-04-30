import { Outlet } from "react-router-dom";

/**
 * Контент дочерних маршрутов /users, /tasks (см. appRouter).
 */
export function WorkspaceLayoutPage() {
  return (
    <section className="tt-content">
      <Outlet />
    </section>
  );
}

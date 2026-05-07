import { MyProjectsPage } from "./MyProjectsPage.jsx";

export function AllProjectsPage({
  projects = [],
  loading = false,
  onCreate,
  onDelete,
}) {
  return (
    <MyProjectsPage
      projects={projects}
      loading={loading}
      onCreate={onCreate}
      onDelete={onDelete}
      title="Все проекты"
      subtitle="Все существующие проекты в системе."
      emptyText="Проекты не найдены"
    />
  );
}

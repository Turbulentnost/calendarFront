/**
 * Карточка задачи в ленте.
 */
export function TaskCard({ title, meta, sub }) {
  return (
    <div className="tt-task-card">
      <div className="tt-task-card__title">{title}</div>
      <div className="tt-task-card__meta">{meta}</div>
      <div className="tt-task-card__sub">{sub}</div>
    </div>
  );
}

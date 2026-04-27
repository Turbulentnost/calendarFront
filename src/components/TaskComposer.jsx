import { useState } from "react";

const emptyForm = {
  title: "",
  assignee: "",
  priority: "medium",
  deadline: "",
  description: "",
};

export function TaskComposer({
  users,
  currentUser,
  tasks,
  loading,
  onCreated,
}) {
  const [form, setForm] = useState(emptyForm);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    if (!form.title.trim() || !form.assignee) return;
    onCreated({
      title: form.title.trim(),
      assignee: form.assignee,
      priority: form.priority,
      deadline: form.deadline,
      description: form.description.trim(),
    });
    setForm(emptyForm);
  }

  const priorityLabel = (p) =>
    p === "high" ? "Высокий" : p === "low" ? "Низкий" : "Средний";

  return (
    <section className="tt-panel">
      <div className="tt-section-head">
        <div>
          <h2 className="tt-section-title">Постановка задачи</h2>
          <p className="tt-section-subtitle">
            Быстрый блок для назначения новой задачи сотруднику.
          </p>
        </div>
      </div>
      <div className="tt-task-layout">
        <div className="tt-task-grid">
          <label>
            Постановщик
            <input
              value={currentUser ? currentUser.nickname : ""}
              disabled
              readOnly
            />
          </label>
          <label>
            Исполнитель
            <select
              value={form.assignee}
              onChange={(e) => setField("assignee", e.target.value)}
            >
              <option value="">Выберите сотрудника</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nickname}
                  {u.department ? ` · ${u.department}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="tt-task-grid__full">
            Название задачи
            <input
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Например: Подготовить отчёт по спринту"
            />
          </label>
          <label>
            Приоритет
            <select
              value={form.priority}
              onChange={(e) => setField("priority", e.target.value)}
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </label>
          <label>
            Дедлайн
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setField("deadline", e.target.value)}
            />
          </label>
          <label className="tt-task-grid__full">
            Описание
            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Опишите задачу, критерии готовности и детали"
            />
          </label>
        </div>
        <div className="tt-task-feed">
          <div className="tt-task-feed__title">Последние задачи</div>
          {loading && (
            <div className="tt-task-feed__empty">Загрузка...</div>
          )}
          {!loading && !tasks.length && (
            <div className="tt-task-feed__empty">Пока нет созданных задач</div>
          )}
          {!loading &&
            tasks.map((task) => (
              <div key={task.id} className="tt-task-card">
                <div className="tt-task-card__title">{task.title}</div>
                <div className="tt-task-card__meta">
                  {task.assignee_nickname}
                  {task.assignee_department
                    ? ` · ${task.assignee_department}`
                    : ""}
                </div>
                <div className="tt-task-card__sub">
                  {priorityLabel(task.priority)}
                  {task.deadline ? ` · до ${task.deadline}` : null}
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="tt-modal-actions">
        <button
          className="tt-btn tt-btn--primary"
          type="button"
          disabled={!form.title.trim() || !form.assignee}
          onClick={submit}
        >
          Создать задачу
        </button>
      </div>
    </section>
  );
}

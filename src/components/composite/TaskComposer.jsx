import { useState } from "react";
import { Button } from "../ui/Button.jsx";
import { Field } from "../ui/Field.jsx";
import { Input } from "../ui/Input.jsx";
import { Select } from "../ui/Select.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Panel } from "../ui/Panel.jsx";
import { TaskCard } from "../ui/TaskCard.jsx";

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
    <Panel>
      <div className="tt-section-head">
        <div>
          <h2 className="tt-section-title">Задачи</h2>
          <p className="tt-section-subtitle">
            Создавайте и отслеживайте задачи активного проекта.
          </p>
        </div>
      </div>
      <div className="tt-task-layout">
        <div className="tt-task-grid">
          <Field label="Постановщик">
            <Input
              value={currentUser ? currentUser.nickname : ""}
              disabled
              readOnly
            />
          </Field>
          <Field label="Исполнитель">
            <Select
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
            </Select>
          </Field>
          <Field label="Название задачи" className="tt-task-grid__full">
            <Input
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Например: Подготовить отчёт по спринту"
            />
          </Field>
          <Field label="Приоритет">
            <Select
              value={form.priority}
              onChange={(e) => setField("priority", e.target.value)}
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </Select>
          </Field>
          <Field label="Дедлайн">
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setField("deadline", e.target.value)}
            />
          </Field>
          <Field label="Описание" className="tt-task-grid__full">
            <Textarea
              rows={6}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Опишите задачу, критерии готовности и детали"
            />
          </Field>
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
              <TaskCard
                key={task.id}
                title={task.title}
                meta={
                  task.assignee_nickname +
                  (task.assignee_department
                    ? ` · ${task.assignee_department}`
                    : "")
                }
                sub={
                  priorityLabel(task.priority) +
                  (task.deadline ? ` · до ${task.deadline}` : "")
                }
              />
            ))}
        </div>
      </div>
      <div className="tt-modal-actions">
        <Button
          variant="primary"
          type="button"
          disabled={!form.title.trim() || !form.assignee}
          onClick={submit}
        >
          Создать задачу
        </Button>
      </div>
    </Panel>
  );
}

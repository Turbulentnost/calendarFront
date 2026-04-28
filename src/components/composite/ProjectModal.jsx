import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/Button.jsx";
import { Field } from "../ui/Field.jsx";
import { Input } from "../ui/Input.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Modal } from "./Modal.jsx";

const emptyForm = {
  login: "",
  password: "",
  title: "",
  name: "",
  description: "",
};

export function ProjectModal({ open, saving, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
    }
  }, [open]);

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.login.trim() &&
          form.password &&
          form.title.trim() &&
          form.name.trim()
      ),
    [form]
  );

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e) {
    e.preventDefault();
    if (!canSubmit || saving) return;
    onSave({
      login: form.login.trim(),
      password: form.password,
      title: form.title.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
    });
  }

  function close() {
    if (!saving) {
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      className="tt-modal--project-glass"
      backdropClassName="tt-modal-backdrop--glass"
    >
      <form onSubmit={submit}>
        <div className="tt-modal-header">
          <div>
            <h3>Новый проект</h3>
            <p>Создайте рабочее пространство для задач команды.</p>
          </div>
          <button
            type="button"
            className="tt-modal-close"
            onClick={close}
            disabled={saving}
          >
            ×
          </button>
        </div>

        <div className="tt-modal-body">
          <div className="tt-modal-section">
            <div className="tt-modal-section__title">Доступ</div>
            <div className="tt-modal-grid">
              <Field label="Логин проекта">
                <Input
                  value={form.login}
                  onChange={(e) => setField("login", e.target.value)}
                  placeholder="main-office"
                  autoFocus
                  required
                />
              </Field>
              <Field label="Пароль проекта">
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="project-pass"
                  required
                />
              </Field>
            </div>
          </div>

          <div className="tt-modal-section">
            <div className="tt-modal-section__title">Описание проекта</div>
            <div className="tt-modal-grid">
              <Field label="Название">
                <Input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="Основной проект"
                  required
                />
              </Field>
              <Field label="Комната / пространство">
                <Input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Комната офиса"
                  required
                />
              </Field>
              <Field label="Описание" className="tt-modal-grid__full">
                <Textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Рабочие задачи отдела"
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="tt-modal-actions">
          <Button onClick={close} disabled={saving}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={!canSubmit || saving}>
            {saving ? "Создание..." : "Создать проект"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useState } from "react";
import { Button } from "../ui/Button.jsx";
import { Field } from "../ui/Field.jsx";
import { Input } from "../ui/Input.jsx";
import { Modal } from "./Modal.jsx";

export function ProjectLoginModal({ open, project, loading, onClose, onLogin }) {
  const [password, setPassword] = useState("");
  const login = project?.login || "";

  useEffect(() => {
    if (open) {
      setPassword("");
    }
  }, [open, project?.id, project?.login]);

  function close() {
    if (!loading) {
      onClose();
    }
  }

  function submit(e) {
    e.preventDefault();
    if (!login || !password || loading) return;
    onLogin({ login, password });
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      className="tt-modal--project-glass"
      backdropClassName="tt-modal-backdrop--glass"
    >
      <form onSubmit={submit}>
        <div className="tt-modal-header">
          <div>
            <h3>Вход в проект</h3>
            <p>{project?.title || "Введите пароль выбранного проекта"}</p>
          </div>
          <button
            type="button"
            className="tt-modal-close"
            onClick={close}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="tt-modal-body">
          <div className="tt-modal-section">
            <div className="tt-modal-section__title">Доступ к проекту</div>
            <div className="tt-modal-grid tt-modal-grid--single">
              <Field label="Логин проекта">
                <Input value={login} disabled readOnly />
              </Field>
              <Field label="Пароль проекта">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  autoFocus
                  required
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="tt-modal-actions">
          <Button onClick={close} disabled={loading}>
            Отмена
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!login || !password || loading}
          >
            {loading ? "Входим..." : "Войти в проект"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

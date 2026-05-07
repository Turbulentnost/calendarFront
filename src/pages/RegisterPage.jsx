import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "../components/composite/Modal.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { PATHS } from "../utils/paths.js";

const EMPTY = {
  nickname: "",
  password: "",
  password2: "",
  first_name: "",
  last_name: "",
};

function FloatingField({ label, className, ...inputProps }) {
  return (
    <label className={`tt-floating-field ${className || ""}`.trim()}>
      <Input placeholder=" " {...inputProps} />
      <span className="tt-floating-field__label">{label}</span>
    </label>
  );
}

export function RegisterPage({ onNotify, onRegister }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const canSubmit = Boolean(
    form.nickname.trim() &&
      form.password &&
      form.password2 &&
      form.first_name.trim() &&
      form.last_name.trim()
  );

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function close() {
    if (saving) return;
    navigate(PATHS.LOGIN);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || saving) return;
    if (form.password !== form.password2) {
      onNotify?.("Пароли не совпадают", "error");
      return;
    }

    setSaving(true);
    try {
      await onRegister?.({
        nickname: form.nickname.trim(),
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      });
    } catch (e) {
      if (!onRegister) {
        onNotify?.(`Ошибка регистрации: ${e.message}`, "error");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={close}
      className="tt-modal--glass tt-modal--register"
      backdropClassName="tt-modal-backdrop--glass"
    >
      <form onSubmit={handleSubmit}>
        <div className="tt-modal-header">
          <div>
            <h3>Регистрация</h3>
            <p>Создайте аккаунт для работы с задачами.</p>
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

        <div className="tt-modal-body tt-register-body">
          <div className="tt-register-grid">
            <FloatingField
              label="Имя"
              name="first_name"
              autoComplete="given-name"
              value={form.first_name}
              onChange={(e) => setField("first_name", e.target.value)}
              required
            />
            <FloatingField
              label="Фамилия"
              name="last_name"
              autoComplete="family-name"
              value={form.last_name}
              onChange={(e) => setField("last_name", e.target.value)}
              required
            />
            <FloatingField
              label="Логин (никнейм)"
              name="nickname"
              autoComplete="username"
              value={form.nickname}
              onChange={(e) => setField("nickname", e.target.value)}
              required
            />
            <FloatingField
              label="Пароль"
              type="password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              required
            />
            <FloatingField
              label="Повтор пароля"
              className="tt-register-grid__full"
              type="password"
              name="password2"
              autoComplete="new-password"
              value={form.password2}
              onChange={(e) => setField("password2", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="tt-modal-actions">
          <Button onClick={close} disabled={saving}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={!canSubmit || saving}>
            {saving ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        </div>

        <p className="tt-auth-switch tt-auth-switch--modal">
          Уже есть аккаунт? <Link to={PATHS.LOGIN}>Войти</Link>
        </p>
      </form>
    </Modal>
  );
}

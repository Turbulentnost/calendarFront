import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";

const EMPTY_FORM = {
  nickname: "",
  first_name: "",
  last_name: "",
  department: "",
  job_title: "",
  password: "",
  password2: "",
};

function FloatingField({ label, className, ...inputProps }) {
  return (
    <label className={`tt-floating-field ${className || ""}`.trim()}>
      <Input placeholder=" " {...inputProps} />
      <span className="tt-floating-field__label">{label}</span>
    </label>
  );
}

function getInitials(user) {
  const first = (user?.first_name || "").trim();
  const last = (user?.last_name || "").trim();
  if (first || last) {
    return `${first[0] || ""}${last[0] || ""}`.toUpperCase();
  }
  return (user?.nickname || "TT").slice(0, 2).toUpperCase();
}

function getRoleLabel(user) {
  if (user?.role === 0 || user?.is_superuser) return "Суперадмин";
  if (user?.role === 1) return "Админ";
  return "Пользователь";
}

export function ProfilePage({ user, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      nickname: user?.nickname || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      department: user?.department || "",
      job_title: user?.job_title || "",
      password: "",
      password2: "",
    });
    setError("");
  }, [user]);

  const fullName = useMemo(
    () =>
      [form.first_name, form.last_name].filter((part) => part.trim()).join(" "),
    [form.first_name, form.last_name]
  );

  const canSubmit = Boolean(form.nickname.trim()) && !saving;

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    if (form.password && form.password !== form.password2) {
      setError("Пароли не совпадают");
      return;
    }

    const payload = {
      nickname: form.nickname.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      department: form.department.trim(),
      job_title: form.job_title.trim(),
    };
    if (form.password) {
      payload.password = form.password;
    }

    setSaving(true);
    try {
      await onSave(payload);
      setForm((prev) => ({ ...prev, password: "", password2: "" }));
    } catch {
      // Тост с причиной показывает общий обработчик сохранения.
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="tt-profile-page">
      <div className="tt-profile-orb tt-profile-orb--left" />
      <div className="tt-profile-orb tt-profile-orb--top" />
      <div className="tt-profile-orb tt-profile-orb--right" />

      <div className="tt-profile-glass-scene">
        <div className="tt-profile-hero">
          <div className="tt-profile-hero__avatar">{getInitials(user)}</div>
          <div>
            <p className="tt-profile-hero__eyebrow">TurboTasks profile</p>
            <h2>{fullName || user?.nickname || "Мой профиль"}</h2>
            <p>
              Персональные настройки рабочего пространства и доступа к задачам.
            </p>
          </div>
          <div className="tt-profile-hero__role">{getRoleLabel(user)}</div>
        </div>

        <form className="tt-profile-card" onSubmit={submit}>
          <div className="tt-profile-card__head">
            <div>
              <h3>Настройка профиля</h3>
              <p>Данные обновятся в текущей сессии сразу после сохранения.</p>
            </div>
            <div className="tt-profile-card__dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="tt-profile-grid">
            <FloatingField
              label="Имя"
              name="first_name"
              autoComplete="given-name"
              value={form.first_name}
              onChange={(e) => setField("first_name", e.target.value)}
            />
            <FloatingField
              label="Фамилия"
              name="last_name"
              autoComplete="family-name"
              value={form.last_name}
              onChange={(e) => setField("last_name", e.target.value)}
            />
            <FloatingField
              label="Никнейм"
              name="nickname"
              autoComplete="username"
              value={form.nickname}
              onChange={(e) => setField("nickname", e.target.value)}
              required
            />
            <FloatingField
              label="Отдел"
              name="department"
              value={form.department}
              onChange={(e) => setField("department", e.target.value)}
            />
            <FloatingField
              label="Должность"
              className="tt-profile-grid__full"
              name="job_title"
              value={form.job_title}
              onChange={(e) => setField("job_title", e.target.value)}
            />
            <FloatingField
              label="Новый пароль"
              type="password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
            />
            <FloatingField
              label="Повтор пароля"
              type="password"
              name="password2"
              autoComplete="new-password"
              value={form.password2}
              onChange={(e) => setField("password2", e.target.value)}
            />
          </div>

          {error && <div className="tt-profile-error">{error}</div>}

          <div className="tt-profile-actions">
            <Button variant="primary" type="submit" disabled={!canSubmit}>
              {saving ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

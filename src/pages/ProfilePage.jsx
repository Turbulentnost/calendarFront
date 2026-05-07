import { useEffect, useMemo, useState } from "react";
import { Modal } from "../components/composite/Modal.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";

const EMPTY_FORM = {
  nickname: "",
  first_name: "",
  last_name: "",
  department: "",
  job_title: "",
  old_password: "",
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

function getPhotoUrl(user) {
  return user?.photo_url || user?.photo || user?.avatar_url || user?.avatar || "";
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M9 3 7.17 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.17L15 3H9Zm3 5.5A4.5 4.5 0 1 1 12 17a4.5 4.5 0 0 1 0-9Zm0 2A2.5 2.5 0 1 0 12 15a2.5 2.5 0 0 0 0-5Z" />
    </svg>
  );
}

function ProfilePhotoModal({
  open,
  previewUrl,
  hasPhoto,
  onClose,
  onPick,
  onRemove,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      className="tt-modal--glass tt-photo-modal"
      backdropClassName="tt-modal-backdrop--glass"
    >
      <div className="tt-modal-header">
        <div>
          <h3>Фото профиля</h3>
          <p>Минималистичный аватар для вашей рабочей карточки.</p>
        </div>
        <button className="tt-modal-close" type="button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="tt-photo-modal__body">
        <div className="tt-photo-modal__preview">
          {previewUrl ? (
            <img src={previewUrl} alt="" />
          ) : (
            <div className="tt-photo-modal__placeholder">
              <CameraIcon />
            </div>
          )}
        </div>
        <p className="tt-photo-modal__hint">
          Выберите изображение сейчас, а отправка на сервер произойдёт после
          кнопки «Сохранить изменения».
        </p>
        <div className="tt-photo-modal__actions">
          <label className="tt-photo-modal__upload">
            <input type="file" accept="image/*" onChange={onPick} />
            <span>{hasPhoto ? "Заменить фото" : "Загрузить фото"}</span>
          </label>
          {hasPhoto && (
            <button
              className="tt-photo-modal__ghost"
              type="button"
              onClick={onRemove}
            >
              Удалить фото
            </button>
          )}
          <Button variant="primary" type="button" onClick={onClose}>
            Готово
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ProfilePage({ user, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoDraft, setPhotoDraft] = useState({
    file: null,
    previewUrl: "",
    remove: false,
    dirty: false,
  });

  useEffect(() => {
    setForm({
      nickname: user?.nickname || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      department: user?.department || "",
      job_title: user?.job_title || "",
      old_password: "",
      password: "",
      password2: "",
    });
    setError("");
    setPhotoDraft((prev) => {
      if (prev.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return { file: null, previewUrl: "", remove: false, dirty: false };
    });
  }, [user]);

  useEffect(
    () => () => {
      if (photoDraft.previewUrl) {
        URL.revokeObjectURL(photoDraft.previewUrl);
      }
    },
    [photoDraft.previewUrl]
  );

  const fullName = useMemo(
    () =>
      [form.first_name, form.last_name].filter((part) => part.trim()).join(" "),
    [form.first_name, form.last_name]
  );

  const canSubmit = Boolean(form.nickname.trim()) && !saving;
  const storedPhotoUrl = getPhotoUrl(user);
  const avatarUrl = photoDraft.remove
    ? ""
    : photoDraft.previewUrl || storedPhotoUrl;
  const hasPhoto = Boolean(avatarUrl);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function pickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPhotoDraft((prev) => {
      if (prev.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return { file, previewUrl, remove: false, dirty: true };
    });
  }

  function removePhoto() {
    setPhotoDraft((prev) => {
      if (prev.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return storedPhotoUrl
        ? { file: null, previewUrl: "", remove: true, dirty: true }
        : { file: null, previewUrl: "", remove: false, dirty: false };
    });
  }

  function getPhotoChange() {
    if (!photoDraft.dirty) return null;
    if (photoDraft.remove) return { action: "delete" };
    if (!photoDraft.file) return null;
    return {
      action: "upload",
      file: photoDraft.file,
      method: storedPhotoUrl ? "PATCH" : "POST",
    };
  }

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const wantsPasswordChange = Boolean(
      form.old_password || form.password || form.password2
    );
    if (wantsPasswordChange && !form.old_password) {
      setError("Введите текущий пароль");
      return;
    }
    if (wantsPasswordChange && !form.password) {
      setError("Введите новый пароль");
      return;
    }
    if (wantsPasswordChange && !form.password2) {
      setError("Повторите новый пароль");
      return;
    }
    if (wantsPasswordChange && form.password !== form.password2) {
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
    const passwordChange = wantsPasswordChange
      ? {
          old_password: form.old_password,
          new_password: form.password,
        }
      : null;

    setSaving(true);
    try {
      await onSave(payload, getPhotoChange(), passwordChange);
      setForm((prev) => ({
        ...prev,
        old_password: "",
        password: "",
        password2: "",
      }));
      setPhotoDraft((prev) => {
        if (prev.previewUrl) {
          URL.revokeObjectURL(prev.previewUrl);
        }
        return { file: null, previewUrl: "", remove: false, dirty: false };
      });
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
          <button
            className="tt-profile-hero__avatar"
            type="button"
            onClick={() => setPhotoModalOpen(true)}
            aria-label={hasPhoto ? "Изменить фото профиля" : "Добавить фото профиля"}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              <span>{getInitials(user)}</span>
            )}
            <span className="tt-profile-hero__avatar-icon" aria-hidden="true">
              <CameraIcon />
            </span>
          </button>
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
              label="Текущий пароль"
              type="password"
              name="old_password"
              autoComplete="current-password"
              value={form.old_password}
              onChange={(e) => setField("old_password", e.target.value)}
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
      <ProfilePhotoModal
        open={photoModalOpen}
        previewUrl={avatarUrl}
        hasPhoto={hasPhoto}
        onClose={() => setPhotoModalOpen(false)}
        onPick={pickPhoto}
        onRemove={removePhoto}
      />
    </section>
  );
}

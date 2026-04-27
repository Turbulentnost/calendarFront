import { useEffect, useState } from "react";

const emptyForm = {
  nickname: "",
  password: "",
  first_name: "",
  last_name: "",
  role: "1",
  department: "",
  job_title: "",
  photo: null,
};

export function UserModal({ open, user, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;
    setForm({
      nickname: user?.nickname || "",
      password: "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      role: String(user?.role ?? 1),
      department: user?.department || "",
      job_title: user?.job_title || "",
      photo: null,
    });
  }, [open, user]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onFile(e) {
    setField("photo", e.target.files?.[0] || null);
  }

  function submit() {
    const fd = new FormData();
    fd.append("nickname", form.nickname.trim());
    if (form.password) {
      fd.append("password", form.password);
    }
    fd.append("first_name", form.first_name.trim());
    fd.append("last_name", form.last_name.trim());
    fd.append("role", form.role);
    fd.append("department", form.department.trim());
    fd.append("job_title", form.job_title.trim());
    fd.append("is_staff", "true");
    fd.append("is_active", "true");
    if (form.photo) {
      fd.append("photo", form.photo);
    }
    onSave(fd);
  }

  if (!open) return null;

  return (
    <div
      className="tt-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="tt-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="tt-modal-header">
          <div>
            <h3>
              {user ? "Редактировать пользователя" : "Добавить пользователя"}
            </h3>
            <p>
              {user
                ? "Обновите данные сотрудника и его роль"
                : "Заполните карточку нового сотрудника"}
            </p>
          </div>
          <button
            type="button"
            className="tt-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="tt-modal-body">
          <div className="tt-modal-section">
            <div className="tt-modal-section__title">Доступ</div>
            <div className="tt-modal-grid">
              <label>
                Никнейм
                <input
                  value={form.nickname}
                  onChange={(e) => setField("nickname", e.target.value)}
                  required
                  placeholder="Например: ivanov"
                />
              </label>
              <label>
                Пароль
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder={
                    user ? "Оставьте пустым, чтобы не менять" : "Введите пароль"
                  }
                />
              </label>
              <label>
                Роль
                <select
                  value={form.role}
                  onChange={(e) => setField("role", e.target.value)}
                >
                  <option value="0">Суперадмин</option>
                  <option value="1">Админ</option>
                </select>
              </label>
            </div>
          </div>

          <div className="tt-modal-section">
            <div className="tt-modal-section__title">Профиль</div>
            <div className="tt-modal-grid">
              <label>
                Имя
                <input
                  value={form.first_name}
                  onChange={(e) => setField("first_name", e.target.value)}
                  placeholder="Имя"
                />
              </label>
              <label>
                Фамилия
                <input
                  value={form.last_name}
                  onChange={(e) => setField("last_name", e.target.value)}
                  placeholder="Фамилия"
                />
              </label>
              <label>
                Отдел
                <input
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                  placeholder="Например: Разработка"
                />
              </label>
              <label>
                Должность
                <input
                  value={form.job_title}
                  onChange={(e) => setField("job_title", e.target.value)}
                  placeholder="Например: Backend developer"
                />
              </label>
            </div>
          </div>

          <div className="tt-modal-section">
            <div className="tt-modal-section__title">Фото профиля</div>
            <label className="tt-upload-field">
              <div className="tt-upload-tile">
                <span className="tt-upload-icon">＋</span>
                <span>
                  {form.photo?.name || "Нажмите, чтобы выбрать фото"}
                </span>
              </div>
              <input type="file" accept="image/*" onChange={onFile} />
            </label>
          </div>
        </div>

        <div className="tt-modal-actions">
          <button type="button" className="tt-btn" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="tt-btn tt-btn--primary"
            onClick={submit}
          >
            {user ? "Сохранить изменения" : "Добавить пользователя"}
          </button>
        </div>
      </div>
    </div>
  );
}

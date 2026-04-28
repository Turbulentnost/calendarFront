import { useEffect, useState } from "react";
import { Button } from "../ui/Button.jsx";
import { Field } from "../ui/Field.jsx";
import { Input } from "../ui/Input.jsx";
import { Select } from "../ui/Select.jsx";
import { Modal } from "./Modal.jsx";

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

  return (
    <Modal open={open} onClose={onClose}>
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
              <Field label="Никнейм">
                <Input
                  value={form.nickname}
                  onChange={(e) => setField("nickname", e.target.value)}
                  required
                  placeholder="Например: ivanov"
                />
              </Field>
              <Field label="Пароль">
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder={
                    user ? "Оставьте пустым, чтобы не менять" : "Введите пароль"
                  }
                />
              </Field>
              <Field label="Роль">
                <Select
                  value={form.role}
                  onChange={(e) => setField("role", e.target.value)}
                >
                  <option value="0">Суперадмин</option>
                  <option value="1">Админ</option>
                </Select>
              </Field>
            </div>
          </div>

          <div className="tt-modal-section">
            <div className="tt-modal-section__title">Профиль</div>
            <div className="tt-modal-grid">
              <Field label="Имя">
                <Input
                  value={form.first_name}
                  onChange={(e) => setField("first_name", e.target.value)}
                  placeholder="Имя"
                />
              </Field>
              <Field label="Фамилия">
                <Input
                  value={form.last_name}
                  onChange={(e) => setField("last_name", e.target.value)}
                  placeholder="Фамилия"
                />
              </Field>
              <Field label="Отдел">
                <Input
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                  placeholder="Например: Разработка"
                />
              </Field>
              <Field label="Должность">
                <Input
                  value={form.job_title}
                  onChange={(e) => setField("job_title", e.target.value)}
                  placeholder="Например: Backend developer"
                />
              </Field>
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
          <Button variant="default" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" onClick={submit}>
            {user ? "Сохранить изменения" : "Добавить пользователя"}
          </Button>
        </div>
    </Modal>
  );
}

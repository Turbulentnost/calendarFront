import { defineComponent, reactive, watch } from "../vue.js";

export const UserModal = defineComponent({
  name: "UserModal",
  props: {
    open: { type: Boolean, default: false },
    user: { type: Object, default: null },
  },
  emits: ["close", "save"],
  setup(props, { emit }) {
    const form = reactive({
      nickname: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "1",
      department: "",
      job_title: "",
      photo: null,
    });

    watch(
      () => props.user,
      (u) => {
        form.nickname = u?.nickname || "";
        form.password = "";
        form.first_name = u?.first_name || "";
        form.last_name = u?.last_name || "";
        form.role = String(u?.role ?? 1);
        form.department = u?.department || "";
        form.job_title = u?.job_title || "";
        form.photo = null;
      },
      { immediate: true }
    );

    function onFile(e) {
      form.photo = e.target.files?.[0] || null;
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
      emit("save", fd);
    }

    return { form, onFile, submit };
  },
  template: `
    <div v-if="open" class="tt-modal-backdrop" @click.self="$emit('close')">
      <div class="tt-modal">
        <div class="tt-modal-header">
          <div>
            <h3>{{ user ? 'Редактировать пользователя' : 'Добавить пользователя' }}</h3>
            <p>{{ user ? 'Обновите данные сотрудника и его роль' : 'Заполните карточку нового сотрудника' }}</p>
          </div>
          <button type="button" class="tt-modal-close" @click="$emit('close')">×</button>
        </div>

        <div class="tt-modal-body">
          <div class="tt-modal-section">
            <div class="tt-modal-section__title">Доступ</div>
            <div class="tt-modal-grid">
              <label>Никнейм
                <input v-model="form.nickname" required placeholder="Например: ivanov" />
              </label>
              <label>Пароль
                <input
                  v-model="form.password"
                  type="password"
                  :placeholder="user ? 'Оставьте пустым, чтобы не менять' : 'Введите пароль'"
                />
              </label>
              <label>Роль
                <select v-model="form.role">
                  <option value="0">Суперадмин</option>
                  <option value="1">Админ</option>
                </select>
              </label>
            </div>
          </div>

          <div class="tt-modal-section">
            <div class="tt-modal-section__title">Профиль</div>
            <div class="tt-modal-grid">
              <label>Имя
                <input v-model="form.first_name" placeholder="Имя" />
              </label>
              <label>Фамилия
                <input v-model="form.last_name" placeholder="Фамилия" />
              </label>
              <label>Отдел
                <input v-model="form.department" placeholder="Например: Разработка" />
              </label>
              <label>Должность
                <input v-model="form.job_title" placeholder="Например: Backend developer" />
              </label>
            </div>
          </div>

          <div class="tt-modal-section">
            <div class="tt-modal-section__title">Фото профиля</div>
            <label class="tt-upload-field">
              <div class="tt-upload-tile">
                <span class="tt-upload-icon">＋</span>
                <span>{{ form.photo?.name || 'Нажмите, чтобы выбрать фото' }}</span>
              </div>
              <input type="file" accept="image/*" @change="onFile" />
            </label>
          </div>
        </div>

        <div class="tt-modal-actions">
          <button type="button" class="tt-btn" @click="$emit('close')">Отмена</button>
          <button type="button" class="tt-btn tt-btn--primary" @click="submit">
            {{ user ? 'Сохранить изменения' : 'Добавить пользователя' }}
          </button>
        </div>
            </div>
    </div>
  `,
});

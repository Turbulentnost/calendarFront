import { computed, defineComponent, ref } from "../vue.js";

function initials(user) {
  const f = (user.first_name || "").trim();
  const l = (user.last_name || "").trim();
  if (f || l) {
    return `${f[0] || ""}${l[0] || ""}`.toUpperCase() || "U";
  }
  return (user.nickname || "U").slice(0, 2).toUpperCase();
}

export const UsersTable = defineComponent({
  name: "UsersTable",
  props: {
    rows: { type: Array, default: () => [] },
    filters: { type: Object, required: true },
    pagination: { type: Object, required: true },
    stats: { type: Object, required: true },
    canManage: { type: Function, required: true },
    loading: { type: Boolean, default: false },
  },
  emits: [
    "open-create",
    "apply-filters",
    "update:filters",
    "edit",
    "reset",
    "delete",
    "change-page",
  ],
  setup(props, { emit }) {
    const filtersOpen = ref(false);
    const pages = computed(() => props.pagination.pages || 1);
    function updateFilter(key, value) {
      emit("update:filters", { ...props.filters, [key]: value });
    }
    function toggleFilters() {
      filtersOpen.value = !filtersOpen.value;
    }
    return { filtersOpen, pages, updateFilter, toggleFilters, initials };
  },
  template: `
    <section class="tt-panel">
      <div class="tt-toolbar">
        <div class="tt-toolbar__left">
          <button class="tt-btn tt-btn--primary" type="button" @click="$emit('open-create')">+ Добавить пользователя</button>
          <button
            type="button"
            :class="['tt-btn', 'tt-btn--filter', { 'tt-btn--filter-active': filtersOpen }]"
            @click="toggleFilters"
          >
            Фильтры
            <span class="tt-btn__chevron">{{ filtersOpen ? '▲' : '▼' }}</span>
          </button>
        </div>
        <div class="tt-search">
          <span class="tt-search__icon">🔍</span>
          <input
            type="text"
            :value="filters.q"
            placeholder="Поиск: nickname / имя / фамилия"
            @input="updateFilter('q', $event.target.value)"
            @keyup.enter="$emit('apply-filters')"
          />
        </div>
      </div>

      <div v-if="filtersOpen" class="tt-filters">
        <select :value="filters.role" @change="updateFilter('role', $event.target.value)">
          <option value="">Все роли</option>
          <option value="0">Суперадмин</option>
          <option value="1">Админ</option>
        </select>
        <input
          type="text"
          :value="filters.department"
          placeholder="Фильтр по отделу"
          @input="updateFilter('department', $event.target.value)"
          @keyup.enter="$emit('apply-filters')"
        />
        <input
          type="text"
          :value="filters.job_title"
          placeholder="Фильтр по должности"
          @input="updateFilter('job_title', $event.target.value)"
          @keyup.enter="$emit('apply-filters')"
        />
        <button class="tt-btn tt-btn--apply" type="button" @click="$emit('apply-filters')">Применить фильтры</button>
      </div>

      <div class="tt-table-wrap">
        <table class="tt-table">
          <thead>
            <tr>
              <th>Аватар</th>
              <th>Пользователь</th>
              <th>Имя и фамилия</th>
              <th>Роль</th>
              <th>Отдел</th>
              <th>Должность</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="tt-empty">Загрузка...</td>
            </tr>
            <tr v-else-if="!rows.length">
              <td colspan="7" class="tt-empty">Пользователи не найдены</td>
            </tr>
            <tr v-for="user in rows" :key="user.id">
              <td>
                <img v-if="user.photo_url" class="tt-avatar" :src="user.photo_url" alt="" />
                <div v-else class="tt-avatar tt-avatar--placeholder">{{ initials(user) }}</div>
              </td>
              <td>
                <div class="tt-user-main">{{ user.nickname }}</div>
                <div class="tt-user-sub">{{ user.job_title || '—' }}</div>
              </td>
              <td>{{ [user.first_name, user.last_name].filter(Boolean).join(' ') || '—' }}</td>
              <td>
                <span :class="['tt-badge', user.role === 0 ? 'tt-badge--danger' : 'tt-badge--primary']">
                  {{ user.role === 0 ? 'Суперадмин' : 'Админ' }}
                </span>
              </td>
              <td>{{ user.department || '—' }}</td>
              <td>{{ user.job_title || '—' }}</td>
              <td>
                <div class="tt-actions">
                  <button type="button" :disabled="!canManage(user)" @click="$emit('edit', user)" title="Редактировать">✏️</button>
                  <button type="button" :disabled="!canManage(user)" @click="$emit('reset', user)" title="Сбросить пароль">🔑</button>
                  <button type="button" :disabled="!canManage(user)" @click="$emit('delete', user)" title="Удалить">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="tt-table-footer">
        <div class="tt-stats">
          Всего: <b>{{ stats.total_users || 0 }}</b>,
          админов: <b>{{ stats.admins || 0 }}</b>,
          суперадминов: <b>{{ stats.superadmins || 0 }}</b>
        </div>
        <div class="tt-pagination">
          <button type="button" :disabled="pagination.page <= 1" @click="$emit('change-page', pagination.page - 1)">Назад</button>
          <span>Стр. {{ pagination.page }} / {{ pages }}</span>
          <button type="button" :disabled="pagination.page >= pages" @click="$emit('change-page', pagination.page + 1)">Вперёд</button>
        </div>
      </div>
    </section>
  `,
});

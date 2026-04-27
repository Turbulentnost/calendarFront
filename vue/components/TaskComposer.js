import { defineComponent, reactive } from "../vue.js";

export const TaskComposer = defineComponent({
  name: "TaskComposer",
  props: {
    users: { type: Array, default: () => [] },
    currentUser: { type: Object, default: null },
    tasks: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  emits: ["created"],
  setup(props, { emit }) {
    const form = reactive({
      title: "",
      assignee: "",
      priority: "medium",
      deadline: "",
      description: "",
    });

    function submit() {
      if (!form.title.trim() || !form.assignee) {
        return;
      }
      emit("created", {
        title: form.title.trim(),
        assignee: form.assignee,
        priority: form.priority,
        deadline: form.deadline,
        description: form.description.trim(),
      });
      form.title = "";
      form.assignee = "";
      form.priority = "medium";
      form.deadline = "";
      form.description = "";
    }

    return { form, submit };
  },
  template: `
    <section class="tt-panel">
      <div class="tt-section-head">
        <div>
          <h2 class="tt-section-title">Постановка задачи</h2>
          <p class="tt-section-subtitle">Быстрый блок для назначения новой задачи сотруднику.</p>
        </div>
      </div>
      <div class="tt-task-layout">
        <div class="tt-task-grid">
        <label>Постановщик
          <input :value="currentUser ? currentUser.nickname : ''" disabled />
        </label>
        <label>Исполнитель
          <select v-model="form.assignee">
            <option value="">Выберите сотрудника</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.nickname }}{{ user.department ? ' · ' + user.department : '' }}
            </option>
          </select>
        </label>
        <label class="tt-task-grid__full">Название задачи
          <input v-model="form.title" placeholder="Например: Подготовить отчёт по спринту" />
        </label>
        <label>Приоритет
          <select v-model="form.priority">
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </label>
        <label>Дедлайн
          <input v-model="form.deadline" type="date" />
        </label>
        <label class="tt-task-grid__full">Описание
          <textarea v-model="form.description" rows="6" placeholder="Опишите задачу, критерии готовности и детали"></textarea>
        </label>
        </div>
        <div class="tt-task-feed">
          <div class="tt-task-feed__title">Последние задачи</div>
          <div v-if="loading" class="tt-task-feed__empty">Загрузка...</div>
          <div v-else-if="!tasks.length" class="tt-task-feed__empty">Пока нет созданных задач</div>
          <div v-for="task in tasks" :key="task.id" class="tt-task-card">
            <div class="tt-task-card__title">{{ task.title }}</div>
            <div class="tt-task-card__meta">
              {{ task.assignee_nickname }}{{ task.assignee_department ? ' · ' + task.assignee_department : '' }}
            </div>
            <div class="tt-task-card__sub">
              {{ task.priority === 'high' ? 'Высокий' : task.priority === 'low' ? 'Низкий' : 'Средний' }}
              <span v-if="task.deadline"> · до {{ task.deadline }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="tt-modal-actions">
        <button
          class="tt-btn tt-btn--primary"
          type="button"
          :disabled="!form.title.trim() || !form.assignee"
          @click="submit"
        >
          Создать задачу
        </button>
      </div>
    </section>
  `,
});

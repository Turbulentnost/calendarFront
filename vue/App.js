import { defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "./vue.js";
import { HeaderBar } from "./components/HeaderBar.js";
import { Sidebar } from "./components/Sidebar.js";
import { TaskComposer } from "./components/TaskComposer.js";
import { UsersTable } from "./components/UsersTable.js";
import { UserModal } from "./components/UserModal.js";
import { ConfirmDialog } from "./components/ConfirmDialog.js";
import { ToastStack } from "./components/ToastStack.js";
import {
  createTask,
  createUser,
  deleteUser,
  getStats,
  getTasks,
  getUsers,
  resetPassword,
  updateUser,
} from "./services/adminApi.js";
import { clearSession, getStoredUser, getToken, setSession } from "../services/auth.js";
import { fetchMe, loginRequest } from "../services/api.js";

export const App = defineComponent({
  name: "TurboTasksApp",
  components: {
    Sidebar,
    HeaderBar,
    TaskComposer,
    UsersTable,
    UserModal,
    ConfirmDialog,
    ToastStack,
  },
  setup() {
    const currentUser = ref(getStoredUser());
    const activeSection = ref("users");
    const loading = ref(false);
    const tasksLoading = ref(false);
    const users = ref([]);
    const tasks = ref([]);
    const filters = reactive({ q: "", role: "", job_title: "", department: "" });
    const pagination = reactive({ page: 1, page_size: 10, total: 0, pages: 1 });
    const stats = reactive({ total_users: 0, admins: 0, superadmins: 0 });

    const modalOpen = ref(false);
    const editingUser = ref(null);
    const confirm = reactive({
      open: false,
      title: "",
      message: "",
      confirmText: "Подтвердить",
      action: null,
    });
    const toasts = ref([]);

    const loginForm = reactive({ nickname: "admin", password: "admin", loading: false });
    const isMobile = ref(window.innerWidth <= 980);
    const sidebarOpen = ref(window.innerWidth > 980);

    function toast(text, type = "info") {
      const id = Date.now() + Math.random();
      toasts.value = [...toasts.value, { id, text, type }];
      setTimeout(() => {
        toasts.value = toasts.value.filter((t) => t.id !== id);
      }, 2600);
    }

    function canManage(target) {
      const actor = currentUser.value;
      if (!actor || !target) return false;
      if (actor.role === 0 || actor.is_superuser) return true;
      if (actor.role === 1) {
        if (target.id === actor.id) return true;
        return ![0, 1].includes(Number(target.role));
      }
      return false;
    }

    async function loadUsers(page = pagination.page) {
      loading.value = true;
      try {
        const data = await getUsers({
          q: filters.q,
          role: filters.role,
          job_title: filters.job_title,
          department: filters.department,
          page,
          page_size: pagination.page_size,
        });
        users.value = data.results || [];
        pagination.page = data.page || 1;
        pagination.total = data.total || 0;
        pagination.pages = data.pages || 1;
      } catch (e) {
        toast(`Ошибка: ${e.message}`, "error");
      } finally {
        loading.value = false;
      }
    }

    async function loadStats() {
      try {
        const data = await getStats();
        stats.total_users = data.total_users || 0;
        stats.admins = data.admins || 0;
        stats.superadmins = data.superadmins || 0;
      } catch (e) {
        toast(`Ошибка: ${e.message}`, "error");
      }
    }

    async function refreshAll(page = 1) {
      await Promise.all([loadUsers(page), loadStats(), loadTasks()]);
    }

    async function loadTasks() {
      tasksLoading.value = true;
      try {
        tasks.value = await getTasks();
      } catch (e) {
        toast(`Ошибка: ${e.message}`, "error");
      } finally {
        tasksLoading.value = false;
      }
    }

    function openCreate() {
      editingUser.value = null;
      modalOpen.value = true;
    }

    function openEdit(user) {
      if (!canManage(user)) return;
      editingUser.value = user;
      modalOpen.value = true;
    }

    async function saveUser(payload) {
      try {
        if (editingUser.value) {
          await updateUser(editingUser.value.id, payload);
          toast("Пользователь обновлён", "success");
        } else {
          await createUser(payload);
          toast("Пользователь добавлен", "success");
        }
        modalOpen.value = false;
        await refreshAll(pagination.page);
      } catch (e) {
        toast(`Ошибка: ${e.message}`, "error");
      }
    }

    function askDelete(user) {
      if (!canManage(user)) return;
      confirm.open = true;
      confirm.title = "Удаление пользователя";
      confirm.message = `Точно удалить пользователя ${user.nickname}?`;
      confirm.confirmText = "Удалить";
      confirm.action = async () => {
        try {
          await deleteUser(user.id);
          toast("Пользователь удалён", "success");
          await refreshAll(pagination.page);
        } catch (e) {
          toast(`Ошибка: ${e.message}`, "error");
        } finally {
          confirm.open = false;
        }
      };
    }

    function askReset(user) {
      if (!canManage(user)) return;
      confirm.open = true;
      confirm.title = "Сброс пароля";
      confirm.message = "Отправить временный пароль?";
      confirm.confirmText = "Сбросить";
      confirm.action = async () => {
        try {
          const data = await resetPassword(user.id);
          toast("Пароль сброшен", "success");
          if (data?.temp_password) {
            toast(`Временный пароль: ${data.temp_password}`, "info");
          }
        } catch (e) {
          toast(`Ошибка: ${e.message}`, "error");
        } finally {
          confirm.open = false;
        }
      };
    }

    async function doConfirm() {
      if (confirm.action) {
        await confirm.action();
      }
    }

    function closeConfirm() {
      confirm.open = false;
    }

    async function doLogout() {
      clearSession();
      currentUser.value = null;
      users.value = [];
      tasks.value = [];
      toast("Вы вышли из системы", "info");
    }

    async function doLogin() {
      loginForm.loading = true;
      try {
        const data = await loginRequest(loginForm.nickname, loginForm.password);
        setSession(data.token, data.user);
        const me = await fetchMe();
        setSession(data.token, me);
        currentUser.value = me;
        toast("Вход выполнен", "success");
        await refreshAll(1);
      } catch (e) {
        toast(`Ошибка входа: ${e.message}`, "error");
      } finally {
        loginForm.loading = false;
      }
    }

    function updateFilters(next) {
      Object.assign(filters, next);
    }

    async function createTaskDraft(payload) {
      try {
        const task = await createTask(payload);
        tasks.value = [task, ...tasks.value];
        toast(`Задача "${task.title}" создана`, "success");
      } catch (e) {
        toast(`Ошибка: ${e.message}`, "error");
      }
    }

    function handleViewport() {
      isMobile.value = window.innerWidth <= 980;
      if (!isMobile.value) {
        sidebarOpen.value = true;
      }
    }

    function toggleSidebar() {
      if (isMobile.value) {
        sidebarOpen.value = !sidebarOpen.value;
      }
    }

    onMounted(async () => {
      window.addEventListener("resize", handleViewport);
      handleViewport();
      if (currentUser.value) {
        try {
          const me = await fetchMe();
          setSession(getToken() || "", me);
          currentUser.value = me;
        } catch {
          // ignore stale token
        }
      }
      if (currentUser.value) {
        await refreshAll(1);
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", handleViewport);
    });

    return {
      users,
      tasks,
      activeSection,
      filters,
      pagination,
      stats,
      loading,
      modalOpen,
      editingUser,
      confirm,
      toasts,
      currentUser,
      loginForm,
      isMobile,
      sidebarOpen,
      tasksLoading,
      canManage,
      openCreate,
      openEdit,
      saveUser,
      askDelete,
      askReset,
      doConfirm,
      closeConfirm,
      doLogout,
      doLogin,
      updateFilters,
      loadUsers,
      toggleSidebar,
      createTaskDraft,
    };
  },
  template: `
    <div class="tt-layout">
      <Sidebar
        v-if="currentUser"
        :open="sidebarOpen"
        :mobile="isMobile"
        @close="sidebarOpen = false"
      />
      <main :class="['tt-main', { 'tt-main--auth': !currentUser }]">
        <HeaderBar
          v-if="currentUser"
          :user="currentUser"
          :title="activeSection === 'users' ? 'Управление пользователями' : 'Постановка задачи'"
          @logout="doLogout"
          @toggle-sidebar="toggleSidebar"
        />

        <section v-if="!currentUser" class="tt-login-wrap">
          <div class="tt-login-card">
            <h2>Вход в TurboTasks</h2>
            <label>Никнейм <input v-model="loginForm.nickname" /></label>
            <label>Пароль <input v-model="loginForm.password" type="password" /></label>
            <button class="tt-btn tt-btn--primary" :disabled="loginForm.loading" @click="doLogin">
              {{ loginForm.loading ? 'Вход...' : 'Войти' }}
            </button>
          </div>
        </section>

        <section v-else class="tt-content">
          <div class="tt-top-tabs">
            <button
              type="button"
              :class="['tt-top-tab', { 'tt-top-tab--active': activeSection === 'users' }]"
              @click="activeSection = 'users'"
            >
              Пользователи
            </button>
            <button
              type="button"
              :class="['tt-top-tab', { 'tt-top-tab--active': activeSection === 'tasks' }]"
              @click="activeSection = 'tasks'"
            >
              Постановка задачи
            </button>
          </div>

          <UsersTable
            v-if="activeSection === 'users'"
            :rows="users"
            :filters="filters"
            :pagination="pagination"
            :stats="stats"
            :can-manage="canManage"
            :loading="loading"
            @open-create="openCreate"
            @update:filters="updateFilters"
            @apply-filters="loadUsers(1)"
            @edit="openEdit"
            @reset="askReset"
            @delete="askDelete"
            @change-page="loadUsers"
          />
          <TaskComposer
            v-else
            :users="users"
            :current-user="currentUser"
            :tasks="tasks"
            :loading="tasksLoading"
            @created="createTaskDraft"
          />
        </section>
      </main>

      <UserModal
        :open="modalOpen"
        :user="editingUser"
        @close="modalOpen = false"
        @save="saveUser"
      />
      <ConfirmDialog
        :open="confirm.open"
        :title="confirm.title"
        :message="confirm.message"
        :confirm-text="confirm.confirmText"
        @close="closeConfirm"
        @confirm="doConfirm"
      />
      <ToastStack :items="toasts" />
    </div>
  `,
});

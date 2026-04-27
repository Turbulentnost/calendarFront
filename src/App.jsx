import { useCallback, useEffect, useMemo, useState } from "react";
import { clearSession, getStoredUser, getToken, setSession } from "./services/auth.js";
import { fetchMe, loginRequest } from "./services/api.js";
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
import { HeaderBar } from "./components/HeaderBar.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { TaskComposer } from "./components/TaskComposer.jsx";
import { UsersTable } from "./components/UsersTable.jsx";
import { UserModal } from "./components/UserModal.jsx";
import { ConfirmDialog } from "./components/ConfirmDialog.jsx";
import { ToastStack } from "./components/ToastStack.jsx";

const initialFilters = { q: "", role: "", job_title: "", department: "" };

export default function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [activeSection, setActiveSection] = useState("users");
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(() => ({ ...initialFilters }));
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0,
    pages: 1,
  });
  const [stats, setStats] = useState({
    total_users: 0,
    admins: 0,
    superadmins: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Подтвердить",
    action: null,
  });
  const [toasts, setToasts] = useState([]);

  const [loginForm, setLoginForm] = useState({
    nickname: "admin",
    password: "admin",
    loading: false,
  });
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= 980
  );
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth > 980
  );

  const toast = useCallback((text, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  const canManage = useCallback((target) => {
    const actor = currentUser;
    if (!actor || !target) return false;
    if (actor.role === 0 || actor.is_superuser) return true;
    if (actor.role === 1) {
      if (target.id === actor.id) return true;
      return ![0, 1].includes(Number(target.role));
    }
    return false;
  }, [currentUser]);

  const loadUsers = useCallback(
    async (page = pagination.page) => {
      setLoading(true);
      try {
        const data = await getUsers({
          q: filters.q,
          role: filters.role,
          job_title: filters.job_title,
          department: filters.department,
          page,
          page_size: pagination.page_size,
        });
        setUsers(data.results || []);
        setPagination((p) => ({
          ...p,
          page: data.page || 1,
          total: data.total || 0,
          pages: data.pages || 1,
        }));
      } catch (e) {
        toast(`Ошибка: ${e.message}`, "error");
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.page, pagination.page_size, toast]
  );

  const refreshAll = useCallback(
    async (page = 1) => {
      setLoading(true);
      setTasksLoading(true);
      try {
        const [uData, sData, tList] = await Promise.all([
          getUsers({
            q: filters.q,
            role: filters.role,
            job_title: filters.job_title,
            department: filters.department,
            page,
            page_size: pagination.page_size,
          }),
          getStats(),
          getTasks(),
        ]);
        setUsers(uData.results || []);
        setPagination((p) => ({
          ...p,
          page: uData.page || 1,
          total: uData.total || 0,
          pages: uData.pages || 1,
        }));
        setStats({
          total_users: sData.total_users || 0,
          admins: sData.admins || 0,
          superadmins: sData.superadmins || 0,
        });
        setTasks(tList);
      } catch (e) {
        toast(`Ошибка: ${e.message}`, "error");
      } finally {
        setLoading(false);
        setTasksLoading(false);
      }
    },
    [filters, pagination.page_size, toast]
  );

  useEffect(() => {
    function handleViewport() {
      const m = window.innerWidth <= 980;
      setIsMobile(m);
      if (!m) {
        setSidebarOpen(true);
      }
    }
    window.addEventListener("resize", handleViewport);
    handleViewport();
    return () => window.removeEventListener("resize", handleViewport);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getStoredUser()) return;
      try {
        const me = await fetchMe();
        if (cancelled) return;
        setSession(getToken() || "", me);
        setCurrentUser(me);
      } catch {
        // ignore stale token
      }
      if (cancelled) return;
      if (!getToken()) return;
      setLoading(true);
      setTasksLoading(true);
      try {
        const [uData, sData, tList] = await Promise.all([
          getUsers({
            q: initialFilters.q,
            role: initialFilters.role,
            job_title: initialFilters.job_title,
            department: initialFilters.department,
            page: 1,
            page_size: 10,
          }),
          getStats(),
          getTasks(),
        ]);
        if (cancelled) return;
        setUsers(uData.results || []);
        setPagination((p) => ({
          ...p,
          page: uData.page || 1,
          total: uData.total || 0,
          pages: uData.pages || 1,
        }));
        setStats({
          total_users: sData.total_users || 0,
          admins: sData.admins || 0,
          superadmins: sData.superadmins || 0,
        });
        setTasks(tList);
      } catch (e) {
        if (!cancelled) {
          toast(`Ошибка: ${e.message}`, "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setTasksLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const openCreate = useCallback(() => {
    setEditingUser(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback(
    (user) => {
      if (!canManage(user)) return;
      setEditingUser(user);
      setModalOpen(true);
    },
    [canManage]
  );

  const saveUser = useCallback(
    async (payload) => {
      try {
        if (editingUser) {
          await updateUser(editingUser.id, payload);
          toast("Пользователь обновлён", "success");
        } else {
          await createUser(payload);
          toast("Пользователь добавлен", "success");
        }
        setModalOpen(false);
        await refreshAll(pagination.page);
      } catch (e) {
        toast(`Ошибка: ${e.message}`, "error");
      }
    },
    [editingUser, toast, refreshAll, pagination.page]
  );

  const askDelete = useCallback(
    (user) => {
      if (!canManage(user)) return;
      setConfirm({
        open: true,
        title: "Удаление пользователя",
        message: `Точно удалить пользователя ${user.nickname}?`,
        confirmText: "Удалить",
        action: async () => {
          try {
            await deleteUser(user.id);
            toast("Пользователь удалён", "success");
            await refreshAll(pagination.page);
          } catch (e) {
            toast(`Ошибка: ${e.message}`, "error");
          } finally {
            setConfirm((c) => ({ ...c, open: false }));
          }
        },
      });
    },
    [canManage, toast, refreshAll, pagination.page]
  );

  const askReset = useCallback(
    (user) => {
      if (!canManage(user)) return;
      setConfirm({
        open: true,
        title: "Сброс пароля",
        message: "Отправить временный пароль?",
        confirmText: "Сбросить",
        action: async () => {
          try {
            const data = await resetPassword(user.id);
            toast("Пароль сброшен", "success");
            if (data?.temp_password) {
              toast(`Временный пароль: ${data.temp_password}`, "info");
            }
          } catch (e) {
            toast(`Ошибка: ${e.message}`, "error");
          } finally {
            setConfirm((c) => ({ ...c, open: false }));
          }
        },
      });
    },
    [canManage, toast]
  );

  async function doConfirm() {
    if (confirm.action) {
      await confirm.action();
    }
  }

  function closeConfirm() {
    setConfirm((c) => ({ ...c, open: false }));
  }

  const doLogout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setUsers([]);
    setTasks([]);
    toast("Вы вышли из системы", "info");
  }, [toast]);

  const doLogin = useCallback(async () => {
    setLoginForm((f) => ({ ...f, loading: true }));
    try {
      const data = await loginRequest(loginForm.nickname, loginForm.password);
      setSession(data.token, data.user);
      const me = await fetchMe();
      setSession(data.token, me);
      setCurrentUser(me);
      toast("Вход выполнен", "success");
      await refreshAll(1);
    } catch (e) {
      toast(`Ошибка входа: ${e.message}`, "error");
    } finally {
      setLoginForm((f) => ({ ...f, loading: false }));
    }
  }, [loginForm.nickname, loginForm.password, toast, refreshAll]);

  const updateFilters = useCallback((next) => {
    setFilters((f) => ({ ...f, ...next }));
  }, []);

  const createTaskDraft = useCallback(
    async (payload) => {
      try {
        const task = await createTask(payload);
        setTasks((prev) => [task, ...prev]);
        toast(`Задача "${task.title}" создана`, "success");
      } catch (e) {
        toast(`Ошибка: ${e.message}`, "error");
      }
    },
    [toast]
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen((o) => !o);
    }
  }, [isMobile]);

  const pageTitle = useMemo(
    () =>
      activeSection === "users"
        ? "Управление пользователями"
        : "Постановка задачи",
    [activeSection]
  );

  return (
    <div className="tt-layout">
      {currentUser && (
        <Sidebar
          open={sidebarOpen}
          mobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      <main
        className={["tt-main", !currentUser && "tt-main--auth"]
          .filter(Boolean)
          .join(" ")}
      >
        {currentUser && (
          <HeaderBar
            user={currentUser}
            title={pageTitle}
            onLogout={doLogout}
            onToggleSidebar={toggleSidebar}
          />
        )}

        {!currentUser && (
          <section className="tt-login-wrap">
            <div className="tt-login-card">
              <h2>Вход в TurboTasks</h2>
              <label>
                Никнейм{" "}
                <input
                  value={loginForm.nickname}
                  onChange={(e) =>
                    setLoginForm((f) => ({ ...f, nickname: e.target.value }))
                  }
                />
              </label>
              <label>
                Пароль{" "}
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </label>
              <button
                className="tt-btn tt-btn--primary"
                type="button"
                disabled={loginForm.loading}
                onClick={doLogin}
              >
                {loginForm.loading ? "Вход..." : "Войти"}
              </button>
            </div>
          </section>
        )}

        {currentUser && (
          <section className="tt-content">
            <div className="tt-top-tabs">
              <button
                type="button"
                className={[
                  "tt-top-tab",
                  activeSection === "users" && "tt-top-tab--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveSection("users")}
              >
                Пользователи
              </button>
              <button
                type="button"
                className={[
                  "tt-top-tab",
                  activeSection === "tasks" && "tt-top-tab--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveSection("tasks")}
              >
                Постановка задачи
              </button>
            </div>

            {activeSection === "users" && (
              <UsersTable
                rows={users}
                filters={filters}
                pagination={pagination}
                stats={stats}
                canManage={canManage}
                loading={loading}
                onOpenCreate={openCreate}
                onUpdateFilters={updateFilters}
                onApplyFilters={() => void loadUsers(1)}
                onEdit={openEdit}
                onReset={askReset}
                onDelete={askDelete}
                onChangePage={(p) => void loadUsers(p)}
              />
            )}
            {activeSection === "tasks" && (
              <TaskComposer
                users={users}
                currentUser={currentUser}
                tasks={tasks}
                loading={tasksLoading}
                onCreated={createTaskDraft}
              />
            )}
          </section>
        )}
      </main>

      <UserModal
        open={modalOpen}
        user={editingUser}
        onClose={() => setModalOpen(false)}
        onSave={saveUser}
      />
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        onClose={closeConfirm}
        onConfirm={doConfirm}
      />
      <ToastStack items={toasts} />
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  clearSession,
  getStoredUser,
  getToken,
  setSession,
} from "../services/auth.js";
import {
  clearProjectSession,
  getStoredProject,
  setProjectSession,
} from "../utils/projectSession.js";
import {
  fetchMe,
  loginRequest,
  updateProfileRequest,
} from "../services/api.js";
import {
  createTask,
  createUser,
  deleteUser,
  getStats,
  getTasks,
  getUsers,
  resetPassword,
  updateUser,
} from "../services/adminApi.js";
import { PATHS } from "../utils/paths.js";
import { buildUserListQuery } from "../utils/buildUserListQuery.js";

const initialFilters = { q: "", role: "", job_title: "", department: "" };
const INITIAL_PAGE_SIZE = 10;

function applyUserListResponse(data, setUsers, setPagination) {
  setUsers(data.results || []);
  setPagination((p) => ({
    ...p,
    page: data.page || 1,
    total: data.total || 0,
    pages: data.pages || 1,
  }));
}

/**
 * Состояние и сценарии админки (SRP: отделено от разметки AppShell).
 */
export function useTurboApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [activeProject, setActiveProject] = useState(getStoredProject);
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(() => ({ ...initialFilters }));
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: INITIAL_PAGE_SIZE,
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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 980);
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
        const data = await getUsers(
          buildUserListQuery(filters, page, pagination.page_size)
        );
        applyUserListResponse(data, setUsers, setPagination);
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
          getUsers(
            buildUserListQuery(filters, page, pagination.page_size)
          ),
          getStats(),
          getTasks(),
        ]);
        applyUserListResponse(uData, setUsers, setPagination);
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
          getUsers(
            buildUserListQuery(
              initialFilters,
              1,
              INITIAL_PAGE_SIZE
            )
          ),
          getStats(),
          getTasks(),
        ]);
        if (cancelled) return;
        applyUserListResponse(uData, setUsers, setPagination);
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

  const closeConfirm = useCallback(() => {
    setConfirm((c) => ({ ...c, open: false }));
  }, []);

  const doLogout = useCallback(() => {
    clearSession();
    clearProjectSession();
    setCurrentUser(null);
    setActiveProject(null);
    setUsers([]);
    setTasks([]);
    toast("Вы вышли из системы", "info");
    navigate(PATHS.LOGIN, { replace: true });
  }, [navigate, toast]);

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
      navigate(PATHS.USERS, { replace: true });
    } catch (e) {
      toast(`Ошибка входа: ${e.message}`, "error");
    } finally {
      setLoginForm((f) => ({ ...f, loading: false }));
    }
  }, [loginForm.nickname, loginForm.password, navigate, toast, refreshAll]);

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

  const saveProfile = useCallback(
    async (payload) => {
      try {
        const data = await updateProfileRequest(payload);
        const nextUser = data?.user || data || { ...currentUser, ...payload };
        setSession(getToken() || "", nextUser);
        setCurrentUser(nextUser);
        toast("Профиль обновлён", "success");
      } catch (e) {
        toast(`Ошибка обновления профиля: ${e.message}`, "error");
        throw e;
      }
    },
    [currentUser, toast]
  );

  const handleProjectLogin = useCallback(
    (data) => {
      const project = data?.project || null;
      setProjectSession(data?.project_token || "", project);
      setActiveProject(project);
      navigate(PATHS.TASKS);
    },
    [navigate]
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen((o) => !o);
    }
  }, [isMobile]);

  const pageTitle = useMemo(() => {
    if (location.pathname === PATHS.PROJECTS) {
      return "Проекты";
    }
    if (location.pathname === PATHS.TASKS) {
      return "Задачи";
    }
    if (location.pathname === PATHS.PROFILE) {
      return "Мой профиль";
    }
    return "Управление пользователями";
  }, [location.pathname]);

  return {
    currentUser,
    activeProject,
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    pageTitle,
    loginForm,
    setLoginForm,
    loading,
    tasksLoading,
    users,
    tasks,
    filters,
    pagination,
    stats,
    modalOpen,
    setModalOpen,
    editingUser,
    confirm,
    toasts,
    canManage,
    loadUsers,
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
    createTaskDraft,
    saveProfile,
    handleProjectLogin,
    toggleSidebar,
    toast,
  };
}

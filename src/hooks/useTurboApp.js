import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  clearSession,
  getStoredUser,
  getToken,
  setSession,
} from "../services/auth.js";
import {
  changePasswordRequest,
  deleteProfilePhotoRequest,
  fetchMe,
  loginRequest,
  registerRequest,
  uploadProfilePhotoRequest,
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
import {
  deleteProject,
  getAllProjects,
  getProjects,
} from "../services/calendarApi.js";
import {
  canViewAllProjectsPage,
  canViewUsersPage,
} from "../utils/access.js";
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
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [allProjectsLoading, setAllProjectsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
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

  const syncCurrentUser = useCallback(async () => {
    if (!getToken()) return null;
    const me = await fetchMe();
    setSession(getToken() || "", me);
    setCurrentUser(me);
    return me;
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
      if (!canViewUsersPage(currentUser)) return;
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
    [currentUser, filters, pagination.page, pagination.page_size, toast]
  );

  const refreshAll = useCallback(
    async (page = 1, actor = currentUser) => {
      const canLoadAdminData = canViewUsersPage(actor);
      if (canLoadAdminData) {
        setLoading(true);
      }
      setTasksLoading(true);
      setProjectsLoading(true);
      try {
        const pList = await getProjects();
        setProjects(Array.isArray(pList) ? pList : []);

        if (canLoadAdminData) {
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
        } else {
          setUsers([]);
          setTasks([]);
          setStats({ total_users: 0, admins: 0, superadmins: 0 });
        }
      } catch (e) {
        toast(`Ошибка: ${e.message}`, "error");
      } finally {
        if (canLoadAdminData) {
          setLoading(false);
        }
        setTasksLoading(false);
        setProjectsLoading(false);
      }
    },
    [currentUser, filters, pagination.page_size, toast]
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
      let actor = null;
      try {
        actor = await syncCurrentUser();
        if (cancelled) return;
      } catch {
        // ignore stale token
      }
      if (cancelled) return;
      if (!getToken()) return;
      const canLoadAdminData = canViewUsersPage(actor);
      if (canLoadAdminData) {
        setLoading(true);
      }
      setTasksLoading(true);
      setProjectsLoading(true);
      try {
        const pList = await getProjects();
        if (cancelled) return;
        setProjects(Array.isArray(pList) ? pList : []);

        if (canLoadAdminData) {
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
        } else {
          setUsers([]);
          setTasks([]);
          setStats({ total_users: 0, admins: 0, superadmins: 0 });
        }

        if (
          location.pathname === PATHS.ALL_PROJECTS &&
          canViewAllProjectsPage(actor)
        ) {
          setAllProjectsLoading(true);
          try {
            const allProjectList = await getAllProjects();
            if (cancelled) return;
            setAllProjects(Array.isArray(allProjectList) ? allProjectList : []);
          } finally {
            if (!cancelled) {
              setAllProjectsLoading(false);
            }
          }
        }
      } catch (e) {
        if (!cancelled) {
          toast(`Ошибка: ${e.message}`, "error");
        }
      } finally {
        if (!cancelled) {
          if (canLoadAdminData) {
            setLoading(false);
          }
          setTasksLoading(false);
          setProjectsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [syncCurrentUser, toast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken() || !currentUser) return;
      try {
        await syncCurrentUser();
      } catch {
        return;
      }
      if (cancelled) return;

      if (location.pathname === PATHS.USERS) {
        if (!canViewUsersPage(currentUser)) return;
        await loadUsers(pagination.page);
        return;
      }

      if (location.pathname === PATHS.PROJECTS) {
        setProjectsLoading(true);
        try {
          const pList = await getProjects();
          if (!cancelled) {
            setProjects(Array.isArray(pList) ? pList : []);
          }
        } catch {
          // Navigation sync should not interrupt the page.
        } finally {
          if (!cancelled) {
            setProjectsLoading(false);
          }
        }
      }

      if (location.pathname === PATHS.ALL_PROJECTS) {
        if (!canViewAllProjectsPage(currentUser)) return;
        setAllProjectsLoading(true);
        try {
          const pList = await getAllProjects();
          if (!cancelled) {
            setAllProjects(Array.isArray(pList) ? pList : []);
          }
        } catch (e) {
          if (!cancelled) {
            toast(`Ошибка: ${e.message}`, "error");
          }
        } finally {
          if (!cancelled) {
            setAllProjectsLoading(false);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

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

  const askDeleteProject = useCallback(
    (project) => {
      if (!project?.id) {
        toast("Не удалось определить проект для удаления", "error");
        return;
      }
      const projectTitle = project.title || project.name || "проект";
      setConfirm({
        open: true,
        title: "Удаление проекта",
        message: `Точно удалить проект "${projectTitle}"?`,
        confirmText: "Удалить",
        action: async () => {
          try {
            await deleteProject(project.id);
            setProjects((prev) => prev.filter((item) => item.id !== project.id));
            setAllProjects((prev) =>
              prev.filter((item) => item.id !== project.id)
            );
            toast("Проект удалён", "success");
          } catch (e) {
            toast(`Ошибка: ${e.message}`, "error");
          } finally {
            setConfirm((c) => ({ ...c, open: false }));
          }
        },
      });
    },
    [toast]
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
    setCurrentUser(null);
    setUsers([]);
    setTasks([]);
    setProjects([]);
    setAllProjects([]);
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
      await refreshAll(1, me);
      navigate(PATHS.TASKS, { replace: true });
    } catch (e) {
      toast(`Ошибка входа: ${e.message}`, "error");
    } finally {
      setLoginForm((f) => ({ ...f, loading: false }));
    }
  }, [loginForm.nickname, loginForm.password, navigate, toast, refreshAll]);

  const doRegister = useCallback(
    async (payload) => {
      try {
        await registerRequest(payload);
        const data = await loginRequest(payload.nickname, payload.password);
        setSession(data.token, data.user);
        const me = await fetchMe();
        setSession(data.token, me);
        setCurrentUser(me);
        toast("Регистрация выполнена", "success");
        await refreshAll(1, me);
        navigate(PATHS.TASKS, { replace: true });
      } catch (e) {
        toast(`Ошибка регистрации: ${e.message}`, "error");
        throw e;
      }
    },
    [navigate, refreshAll, toast]
  );

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

  const createProjectDraft = useCallback(() => {
    toast("Создание проекта будет добавлено после подключения API", "info");
  }, [toast]);

  const saveProfile = useCallback(
    async (payload, photoChange = null, passwordChange = null) => {
      try {
        let nextUser = currentUser;
        const data = await updateProfileRequest(payload);
        nextUser = data?.user || data || { ...nextUser, ...payload };

        if (photoChange?.action === "delete") {
          const photoData = await deleteProfilePhotoRequest();
          nextUser = photoData?.user || photoData || {
            ...nextUser,
            photo: null,
            photo_url: null,
          };
        }

        if (photoChange?.action === "upload" && photoChange.file) {
          const photoData = await uploadProfilePhotoRequest(
            photoChange.file,
            photoChange.method || "POST"
          );
          nextUser = photoData?.user || photoData || nextUser;
        }

        if (passwordChange) {
          const passwordData = await changePasswordRequest(passwordChange);
          if (passwordData?.token) {
            setSession(passwordData.token, nextUser);
          }
        }

        try {
          nextUser = await syncCurrentUser();
        } catch {
          setSession(getToken() || "", nextUser);
          setCurrentUser(nextUser);
        }
        await refreshAll(pagination.page, nextUser);
        toast("Изменения сохранены", "success");
      } catch (e) {
        toast(`Ошибка обновления профиля: ${e.message}`, "error");
        throw e;
      }
    },
    [currentUser, pagination.page, refreshAll, syncCurrentUser, toast]
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen((o) => !o);
    }
  }, [isMobile]);

  const pageTitle = useMemo(() => {
    if (location.pathname === PATHS.ALL_PROJECTS) {
      return "Все проекты";
    }
    if (location.pathname === PATHS.PROJECTS) {
      return "Мои проекты";
    }
    if (location.pathname === PATHS.CREATE_TASK) {
      return "Создать задачу";
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
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    pageTitle,
    loginForm,
    setLoginForm,
    loading,
    tasksLoading,
    projectsLoading,
    allProjectsLoading,
    users,
    tasks,
    projects,
    allProjects,
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
    askDeleteProject,
    askReset,
    doConfirm,
    closeConfirm,
    doLogout,
    doLogin,
    doRegister,
    updateFilters,
    createTaskDraft,
    createProjectDraft,
    saveProfile,
    toggleSidebar,
    toast,
  };
}

import { AppRoutes } from "../../appRouter.jsx";
import { AppHeaderBar } from "./AppHeaderBar.jsx";
import { AppSidebar } from "./AppSidebar.jsx";
import { ConfirmDialog } from "./ConfirmDialog.jsx";
import { ToastStack } from "./ToastStack.jsx";
import { UserModal } from "./UserModal.jsx";
import { cn } from "../../utils/cn.js";

/**
 * Составной «корень» UI: боковая панель, main, маршруты, глобальные оверлеи.
 */
export function AppShell({
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
}) {
  return (
    <div className="tt-layout">
      {currentUser && (
        <AppSidebar
          user={currentUser}
          open={sidebarOpen}
          mobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      <main
        className={cn("tt-main", !currentUser && "tt-main--auth")}
      >
        {currentUser && (
          <AppHeaderBar
            user={currentUser}
            title={pageTitle}
            onLogout={doLogout}
            onToggleSidebar={toggleSidebar}
          />
        )}

        <AppRoutes
          currentUser={currentUser}
          loginForm={loginForm}
          onNicknameChange={(e) =>
            setLoginForm((f) => ({ ...f, nickname: e.target.value }))
          }
          onPasswordChange={(e) =>
            setLoginForm((f) => ({ ...f, password: e.target.value }))
          }
          onLogin={doLogin}
          onRegister={doRegister}
          toast={toast}
          usersPageProps={{
            rows: users,
            filters,
            pagination,
            stats,
            canManage,
            loading,
            onOpenCreate: openCreate,
            onUpdateFilters: updateFilters,
            onApplyFilters: () => void loadUsers(1),
            onEdit: openEdit,
            onReset: askReset,
            onDelete: askDelete,
            onChangePage: (p) => void loadUsers(p),
          }}
          tasksPageProps={{
            tasks,
            loading: tasksLoading,
          }}
          createTaskPageProps={{
            users,
            projects,
            projectsLoading,
            currentUser,
            onCreated: createTaskDraft,
          }}
          projectsPageProps={{
            projects,
            loading: projectsLoading,
            onCreate: createProjectDraft,
            onDelete: askDeleteProject,
          }}
          allProjectsPageProps={{
            projects: allProjects,
            loading: allProjectsLoading,
            onCreate: createProjectDraft,
            onDelete: askDeleteProject,
          }}
          profilePageProps={{
            user: currentUser,
            onSave: saveProfile,
          }}
        />
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

import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { UsersPage } from "./pages/UsersPage.jsx";
import { TasksPage } from "./pages/TasksPage.jsx";
import { CreateTaskPage } from "./pages/CreateTaskPage.jsx";
import { MyProjectsPage } from "./pages/MyProjectsPage.jsx";
import { AllProjectsPage } from "./pages/AllProjectsPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { WorkspaceLayoutPage } from "./pages/WorkspaceLayoutPage.jsx";
import {
  canViewAllProjectsPage,
  canViewUsersPage,
} from "./utils/access.js";
import { PATHS } from "./utils/paths.js";

/**
 * Маршруты TurboTasks. Родительский layout доступен только при авторизации.
 */
export function AppRoutes({
  currentUser,
  loginForm,
  onNicknameChange,
  onPasswordChange,
  onLogin,
  onRegister,
  toast,
  usersPageProps,
  tasksPageProps,
  createTaskPageProps,
  projectsPageProps,
  allProjectsPageProps,
  profilePageProps,
}) {
  const canViewUsers = canViewUsersPage(currentUser);
  const canViewAllProjects = canViewAllProjectsPage(currentUser);

  return (
    <Routes>
      <Route
        path={PATHS.LOGIN}
        element={
          currentUser ? (
            <Navigate to={PATHS.TASKS} replace />
          ) : (
            <LoginPage
              loginForm={loginForm}
              onNicknameChange={onNicknameChange}
              onPasswordChange={onPasswordChange}
              onLogin={onLogin}
            />
          )
        }
      />

      <Route
        path={PATHS.REGISTER}
        element={
          currentUser ? (
            <Navigate to={PATHS.TASKS} replace />
          ) : (
            <RegisterPage onNotify={toast} onRegister={onRegister} />
          )
        }
      />

      <Route
        path={PATHS.ROOT}
        element={
          currentUser ? (
            <WorkspaceLayoutPage />
          ) : (
            <Navigate to={PATHS.LOGIN} replace />
          )
        }
      >
        <Route
          index
          element={<Navigate to={PATHS.TASKS} replace />}
        />
        <Route
          path="users"
          element={
            canViewUsers ? (
              <UsersPage {...usersPageProps} />
            ) : (
              <Navigate to={PATHS.TASKS} replace />
            )
          }
        />
        <Route
          path="tasks"
          element={<TasksPage {...tasksPageProps} />}
        />
        <Route
          path="tasks/create"
          element={<CreateTaskPage {...createTaskPageProps} />}
        />
        <Route
          path="projects"
          element={<MyProjectsPage {...projectsPageProps} />}
        />
        <Route
          path="projects/all"
          element={
            canViewAllProjects ? (
              <AllProjectsPage {...allProjectsPageProps} />
            ) : (
              <Navigate to={PATHS.TASKS} replace />
            )
          }
        />
        <Route
          path="profile"
          element={<ProfilePage {...profilePageProps} />}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={currentUser ? PATHS.TASKS : PATHS.LOGIN}
            replace
          />
        }
      />
    </Routes>
  );
}

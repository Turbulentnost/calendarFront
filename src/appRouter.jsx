import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { UsersPage } from "./pages/UsersPage.jsx";
import { TasksPage } from "./pages/TasksPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { WorkspaceLayoutPage } from "./pages/WorkspaceLayoutPage.jsx";
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
  toast,
  usersPageProps,
  tasksPageProps,
  profilePageProps,
}) {
  return (
    <Routes>
      <Route
        path={PATHS.LOGIN}
        element={
          currentUser ? (
            <Navigate to={PATHS.USERS} replace />
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
            <Navigate to={PATHS.USERS} replace />
          ) : (
            <RegisterPage onNotify={toast} />
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
          element={<Navigate to={PATHS.USERS} replace />}
        />
        <Route
          path="users"
          element={<UsersPage {...usersPageProps} />}
        />
        <Route
          path="tasks"
          element={<TasksPage {...tasksPageProps} />}
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
            to={currentUser ? PATHS.USERS : PATHS.LOGIN}
            replace
          />
        }
      />
    </Routes>
  );
}

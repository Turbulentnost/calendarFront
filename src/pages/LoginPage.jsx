import { Link } from "react-router-dom";
import { Modal } from "../components/composite/Modal.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { PATHS } from "../utils/paths.js";

function FloatingField({ label, className, ...inputProps }) {
  return (
    <label className={`tt-floating-field ${className || ""}`.trim()}>
      <Input placeholder=" " {...inputProps} />
      <span className="tt-floating-field__label">{label}</span>
    </label>
  );
}

export function LoginPage({
  loginForm,
  onNicknameChange,
  onPasswordChange,
  onLogin,
}) {
  function handleSubmit(e) {
    e.preventDefault();
    if (!loginForm.loading) {
      onLogin();
    }
  }

  return (
    <Modal
      open
      onClose={() => {}}
      className="tt-modal--glass tt-modal--login"
      backdropClassName="tt-modal-backdrop--glass"
    >
      <form onSubmit={handleSubmit}>
        <div className="tt-modal-header">
          <div>
            <h3>Вход в TurboTasks</h3>
            <p>Войдите, чтобы продолжить работу с задачами.</p>
          </div>
        </div>

        <div className="tt-modal-body tt-login-body">
          <div className="tt-login-grid">
            <FloatingField
              label="Никнейм"
              name="nickname"
              autoComplete="username"
              value={loginForm.nickname}
              onChange={onNicknameChange}
              required
            />
            <FloatingField
              label="Пароль"
              type="password"
              name="password"
              autoComplete="current-password"
              value={loginForm.password}
              onChange={onPasswordChange}
              required
            />
          </div>
        </div>

        <div className="tt-modal-actions">
          <Button variant="primary" type="submit" disabled={loginForm.loading}>
            {loginForm.loading ? "Вход..." : "Войти"}
          </Button>
        </div>

        <p className="tt-auth-switch tt-auth-switch--modal">
          Ещё нет аккаунта?{" "}
          <Link to={PATHS.REGISTER}>Зарегистрироваться</Link>
        </p>
      </form>
    </Modal>
  );
}

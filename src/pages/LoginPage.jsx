import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { Field } from "../components/ui/Field.jsx";
import { Input } from "../components/ui/Input.jsx";
import { PATHS } from "../utils/paths.js";

export function LoginPage({ loginForm, onNicknameChange, onPasswordChange, onLogin }) {
  return (
    <section className="tt-login-wrap">
      <div className="tt-login-card">
        <h2>Вход в TurboTasks</h2>
        <Field label="Никнейм">
          <Input
            value={loginForm.nickname}
            onChange={onNicknameChange}
          />
        </Field>
        <Field label="Пароль">
          <Input
            type="password"
            value={loginForm.password}
            onChange={onPasswordChange}
          />
        </Field>
        <Button
          variant="primary"
          type="button"
          disabled={loginForm.loading}
          onClick={onLogin}
        >
          {loginForm.loading ? "Вход..." : "Войти"}
        </Button>
        <p className="tt-auth-switch">
          Ещё нет аккаунта?{" "}
          <Link to={PATHS.REGISTER}>Зарегистрироваться</Link>
        </p>
      </div>
    </section>
  );
}

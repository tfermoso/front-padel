import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [ui, setUi] = useState({
    loading: false,
    error: "",
    showPassword: false,
  });

  const canSubmit = useMemo(() => {
    const emailOk = isEmail(form.email);
    const passOk = String(form.password).length >= 6;
    return emailOk && passOk && !ui.loading;
  }, [form.email, form.password, ui.loading]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setUi((s) => ({ ...s, error: "" }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setUi((s) => ({ ...s, loading: true, error: "" }));

    try {
      // TODO: conectar con padel-api
      // Ejemplo futuro:
      // const res = await api.post("/auth/login", form)
      // localStorage.setItem("token", res.token)

      // Simulación de login
      await new Promise((r) => setTimeout(r, 600));
      localStorage.setItem("token", "demo-token");

      navigate("/", { replace: true });
    } catch (err) {
      setUi((s) => ({
        ...s,
        error: "No se pudo iniciar sesión. Revisa tus credenciales.",
      }));
    } finally {
      setUi((s) => ({ ...s, loading: false }));
    }
  }

  return (
    <div className="container simple">
      <div className="auth">
        <div className="auth__header">
          <h2>Iniciar sesión</h2>
          <p className="muted">Accede a tu cuenta para gestionar tu pádel.</p>
        </div>

        {ui.error ? <div className="alert">{ui.error}</div> : null}

        <form className="auth__form" onSubmit={onSubmit}>
          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              required
            />
            {form.email && !isEmail(form.email) ? (
              <small className="field__hint">Introduce un email válido.</small>
            ) : null}
          </label>

          <label className="field">
            <span className="field__label">Contraseña</span>
            <div className="inputRow">
              <input
                className="input"
                type={ui.showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() =>
                  setUi((s) => ({ ...s, showPassword: !s.showPassword }))
                }
              >
                {ui.showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
            {form.password && form.password.length < 6 ? (
              <small className="field__hint">
                Mínimo 6 caracteres.
              </small>
            ) : null}
          </label>

          <button className="btn btn--primary btn--full" disabled={!canSubmit}>
            {ui.loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="auth__footer">
            <span className="muted">¿No tienes cuenta?</span>{" "}
            <Link className="link" to="/register">
              Crear cuenta
            </Link>
          </div>

          <div className="auth__back">
            <Link className="link" to="/">
              ← Volver a la landing
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

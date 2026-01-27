import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, setAccessToken } from "../lib/api";

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [ui, setUi] = useState({ loading: false, error: "", showPassword: false });

  const canSubmit = useMemo(() => {
    const emailOk = isEmail(form.email);
    // En tu ejemplo la password es "12345" => mínimo 5
    const passOk = String(form.password).length >= 5;
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
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { email: form.email, password: form.password },
      });

      if (!data?.access_token) {
        throw new Error("Respuesta inválida: falta access_token");
      }

      setAccessToken(data.access_token);
      navigate("/", { replace: true });
    } catch (err) {
      setUi((s) => ({
        ...s,
        error: err?.message || "No se pudo iniciar sesión.",
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
          <p className="muted">Accede a tu cuenta.</p>
        </div>

        {ui.error ? <div className="alert">{ui.error}</div> : null}

        <form className="auth__form" onSubmit={onSubmit}>
          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="pepe@gmail.com"
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
                placeholder="12345"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
                required
                minLength={5}
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
            {form.password && form.password.length < 5 ? (
              <small className="field__hint">Mínimo 5 caracteres.</small>
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
            <Link className="link" to="/">← Volver</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

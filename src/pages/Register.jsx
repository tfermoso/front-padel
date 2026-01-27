import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [ui, setUi] = useState({
    loading: false,
    error: "",
    showPassword: false,
    showConfirm: false,
  });

  const validations = useMemo(() => {
    const nameOk = form.name.trim().length >= 2;
    const emailOk = isEmail(form.email);
    const passOk = String(form.password).length >= 6;
    const matchOk = form.password === form.confirmPassword && form.confirmPassword.length > 0;
    const termsOk = form.acceptTerms === true;

    return { nameOk, emailOk, passOk, matchOk, termsOk };
  }, [form]);

  const canSubmit = useMemo(() => {
    const { nameOk, emailOk, passOk, matchOk, termsOk } = validations;
    return nameOk && emailOk && passOk && matchOk && termsOk && !ui.loading;
  }, [validations, ui.loading]);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
    setUi((s) => ({ ...s, error: "" }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setUi((s) => ({ ...s, loading: true, error: "" }));

    try {
      // TODO: conectar con padel-api
      // Ejemplo futuro:
      // await api.post("/auth/register", {
      //   name: form.name,
      //   email: form.email,
      //   password: form.password
      // })

      // Simulación de registro
      await new Promise((r) => setTimeout(r, 700));

      navigate("/login", { replace: true });
    } catch (err) {
      setUi((s) => ({
        ...s,
        error: "No se pudo crear la cuenta. Inténtalo de nuevo.",
      }));
    } finally {
      setUi((s) => ({ ...s, loading: false }));
    }
  }

  return (
    <div className="container simple">
      <div className="auth">
        <div className="auth__header">
          <h2>Crear cuenta</h2>
          <p className="muted">Regístrate para empezar a reservar y jugar.</p>
        </div>

        {ui.error ? <div className="alert">{ui.error}</div> : null}

        <form className="auth__form" onSubmit={onSubmit}>
          <label className="field">
            <span className="field__label">Nombre</span>
            <input
              className="input"
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={form.name}
              onChange={onChange}
              autoComplete="name"
              required
              minLength={2}
            />
            {form.name && !validations.nameOk ? (
              <small className="field__hint">
                Introduce al menos 2 caracteres.
              </small>
            ) : null}
          </label>

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
            {form.email && !validations.emailOk ? (
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
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={onChange}
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setUi((s) => ({ ...s, showPassword: !s.showPassword }))}
              >
                {ui.showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
            {form.password && !validations.passOk ? (
              <small className="field__hint">Mínimo 6 caracteres.</small>
            ) : null}
          </label>

          <label className="field">
            <span className="field__label">Repite la contraseña</span>
            <div className="inputRow">
              <input
                className="input"
                type={ui.showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Repite tu contraseña"
                value={form.confirmPassword}
                onChange={onChange}
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setUi((s) => ({ ...s, showConfirm: !s.showConfirm }))}
              >
                {ui.showConfirm ? "Ocultar" : "Ver"}
              </button>
            </div>
            {form.confirmPassword && !validations.matchOk ? (
              <small className="field__hint">Las contraseñas no coinciden.</small>
            ) : null}
          </label>

          <label className="check">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={form.acceptTerms}
              onChange={onChange}
            />
            <span>
              Acepto los <span className="muted">(demo)</span> términos y condiciones
            </span>
          </label>
          {!validations.termsOk ? (
            <small className="field__hint">Debes aceptar los términos.</small>
          ) : null}

          <button className="btn btn--primary btn--full" disabled={!canSubmit}>
            {ui.loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="auth__footer">
            <span className="muted">¿Ya tienes cuenta?</span>{" "}
            <Link className="link" to="/login">
              Iniciar sesión
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

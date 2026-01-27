// src/pages/Login.jsx
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="container simple">
      <h2>Login</h2>
      <p>Página de login (placeholder).</p>
      <Link className="btn btn--ghost" to="/">Volver a la landing</Link>
    </div>
  );
}

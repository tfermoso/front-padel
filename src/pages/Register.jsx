// src/pages/Register.jsx
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="container simple">
      <h2>Register</h2>
      <p>Página de registro (placeholder).</p>
      <Link className="btn btn--ghost" to="/">Volver a la landing</Link>
    </div>
  );
}

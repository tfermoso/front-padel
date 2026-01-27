import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="page">
      <header className="header">
        <div className="container header__inner">
          <div className="brand">
            <div className="brand__logo">🏓</div>
            <div className="brand__text">
              <div className="brand__name">Padel Company</div>
              <div className="brand__tag">Reserva, ranking y partidos</div>
            </div>
          </div>

          <nav className="nav">
            <Link className="link" to="/login">Login</Link>
            <Link className="btn btn--primary" to="/register">Crear cuenta</Link>
          </nav>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__content">
              <h1>Tu club de pádel, en una sola app</h1>
              <p>
                Gestiona reservas, organiza partidos, consulta rankings y mejora la experiencia
                de tus jugadores con un panel moderno conectado a vuestra API.
              </p>

              <div className="actions">
                <Link className="btn btn--primary" to="/register">Empezar ahora</Link>
                <Link className="btn btn--ghost" to="/login">Ya tengo cuenta</Link>
              </div>

              <div className="badges">
                <span className="badge">Reservas</span>
                <span className="badge">Ligas</span>
                <span className="badge">Ranking</span>
                <span className="badge">Notificaciones</span>
              </div>
            </div>

            <div className="hero__card">
              <div className="card">
                <h3>¿Qué ofrecemos?</h3>
                <ul>
                  <li>Gestión de pistas y horarios</li>
                  <li>Usuarios, roles y permisos</li>
                  <li>Partidos, torneos y ligas</li>
                  <li>Estadísticas y ranking</li>
                </ul>
                <div className="card__cta">
                  <Link className="btn btn--primary" to="/register">Crear cuenta</Link>
                  <Link className="btn btn--ghost" to="/login">Login</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container features">
            <div className="feature">
              <h4>Rápido</h4>
              <p>Flujos simples para reservar y jugar sin fricción.</p>
            </div>
            <div className="feature">
              <h4>Escalable</h4>
              <p>Preparado para crecer con tu club y tus competiciones.</p>
            </div>
            <div className="feature">
              <h4>Integrable</h4>
              <p>Front desacoplado consumiendo la API (padel-api).</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <span>© {new Date().getFullYear()} Padel Company</span>
          <span className="muted">Hecho con React</span>
        </div>
      </footer>
    </div>
  );
}

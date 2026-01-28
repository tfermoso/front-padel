import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { setAccessToken } from "../../lib/api";

function SidebarLink({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/app/reservas"}
      className={({ isActive }) =>
        `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
      }
      onClick={onClick}
    >
      {children}
    </NavLink>
  );
}

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cerrar sidebar al cambiar de ruta (especialmente útil en móvil)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const onLogout = () => {
    setAccessToken(null);
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="appShell">
      {/* Topbar */}
      <header className="appShell__topbar">
        <div className="topbar__left">
          {/* Botón móvil: flecha */}
          <button
            type="button"
            className="sidebarToggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? "❮" : "❯"}
          </button>

          <strong>Mi App</strong>
        </div>

        <div className="topbar__right">
          <span className="topbar__user">{user?.user ? `Hola, ${user.user}` : "Hola"}</span>
          <button className="btn btn--ghost btn--sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="appShell__body">
        {/* Overlay móvil */}
        <div
          className={`sidebarOverlay ${sidebarOpen ? "sidebarOverlay--open" : ""}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden={!sidebarOpen}
        />

        {/* Sidebar */}
        <aside className={`appShell__sidebar ${sidebarOpen ? "appShell__sidebar--open" : ""}`}>
          <div className="sidebar__title">Reservas</div>
          <nav className="sidebar__nav">
            <SidebarLink to="/app/reservas" onClick={() => setSidebarOpen(false)}>
              Ver mis reservas
            </SidebarLink>
            <SidebarLink to="/app/reservas/nueva" onClick={() => setSidebarOpen(false)}>
              Nueva reserva
            </SidebarLink>
          </nav>
        </aside>

        {/* Contenido */}
        <main className="appShell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

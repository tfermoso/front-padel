import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  // no logueado
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // sin permisos
  if (allowedRoles?.length && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}

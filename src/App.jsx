import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Forbidden from "./pages/Forbidden.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

import UserLayout from "./pages/app/UserLayout.jsx";
import UserDashboard from "./pages/app/UserDashboard.jsx";
import UserReservations from "./pages/app/UserReservations.jsx";
import NewReservation from "./pages/app/NewReservation.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forbidden" element={<Forbidden />} />

      {/* Zona USER */}
      <Route element={<ProtectedRoute allowedRoles={["usuario", "admin"]} />}>
        <Route path="/app" element={<UserLayout />}>
          <Route index element={<Navigate to="reservas" replace />} />
          <Route path="reservas" element={<UserReservations />} />
          <Route path="reservas/nueva" element={<NewReservation />} />
        </Route>
      </Route>

      {/* Zona ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

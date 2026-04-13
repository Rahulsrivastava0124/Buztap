import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasRoleAccess } from "../utils/access";

export default function ProtectedRoute({ minimumRole = "cashier" }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasRoleAccess(role, minimumRole)) {
    return <Navigate to="/dashboard/overview" replace />;
  }

  return <Outlet />;
}

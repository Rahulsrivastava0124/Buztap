import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDefaultAdminPathByRole, hasRoleAccess } from "../utils/access";

export default function ProtectedRoute({ minimumRole = "cashier" }) {
  const { isAuthenticated, role, subdomain } = useAuth();
  const { slug } = useParams();
  const fallbackPath = getDefaultAdminPathByRole(role);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If there's a slug in the URL that doesn't match the logged-in business, redirect to the correct one
  if (slug && subdomain && slug !== subdomain) {
    return <Navigate to={`/${subdomain}${fallbackPath}`} replace />;
  }

  if (!hasRoleAccess(role, minimumRole)) {
    const base = slug || subdomain;
    if (!base) {
      return <Navigate to="/auth" replace />;
    }
    return <Navigate to={`/${base}${fallbackPath}`} replace />;
  }

  return <Outlet />;
}

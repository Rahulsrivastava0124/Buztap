import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDefaultAdminPathByRole, hasPermissionAccess, hasRoleAccess } from "../utils/access";

export default function ProtectedRoute({ minimumRole, requiredPermission }) {
  const { isAuthenticated, role, permissions, subdomain } = useAuth();
  const { slug } = useParams();
  const fallbackPath = getDefaultAdminPathByRole(role);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If there's a slug in the URL that doesn't match the logged-in business, redirect to the correct one
  if (slug && subdomain && slug !== subdomain) {
    return <Navigate to={`/${subdomain}${fallbackPath}`} replace />;
  }

  if (requiredPermission) {
    if (!hasPermissionAccess(permissions, requiredPermission, role)) {
      const base = slug || subdomain;
      if (!base) return <Navigate to="/auth" replace />;
      return <Navigate to={`/${base}${fallbackPath}`} replace />;
    }
  } else if (minimumRole) {
    // Legacy support
    if (!hasRoleAccess(role, minimumRole)) {
      const base = slug || subdomain;
      if (!base) return <Navigate to="/auth" replace />;
      return <Navigate to={`/${base}${fallbackPath}`} replace />;
    }
  }

  return <Outlet />;
}

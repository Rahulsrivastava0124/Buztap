export const ROLE_RANK = {
  cashier: 1,
  manager: 2,
  admin: 3,
};

const DEFAULT_ADMIN_PATH_BY_ROLE = {
  cashier: "/dashboard/operations",
  manager: "/dashboard/overview",
  admin: "/dashboard/overview",
};

export function hasRoleAccess(role, minimumRole) {
  return (ROLE_RANK[role] ?? 0) >= (ROLE_RANK[minimumRole] ?? 99);
}

export function hasPermissionAccess(userPermissions, requiredPermission, userRole) {
  if (!userPermissions) return false;
  if (userPermissions.includes("all")) return true;
  if (userPermissions.includes(requiredPermission)) return true;

  // Fallback to legacy roles if permissions array is empty (for existing sessions)
  if (userPermissions.length === 0 && userRole) {
    if (userRole === "admin") return true;
    
    const roleMap = {
      manager: [
        "menu:read", "menu:write", "menu:manage",
        "staff:read", "staff:write",
        "reports:view", "inventory:read",
        "offers:manage"
      ],
      cashier: [
        "menu:read", "pos:access", "orders:read", "orders:write"
      ]
    };
    
    const fallbackPerms = roleMap[userRole] || [];
    return fallbackPerms.includes(requiredPermission);
  }

  return false;
}

export function getDefaultAdminPathByRole(role) {
  return DEFAULT_ADMIN_PATH_BY_ROLE[role] || DEFAULT_ADMIN_PATH_BY_ROLE.cashier;
}

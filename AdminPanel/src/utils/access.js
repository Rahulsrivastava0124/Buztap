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

export function getDefaultAdminPathByRole(role) {
  return DEFAULT_ADMIN_PATH_BY_ROLE[role] || DEFAULT_ADMIN_PATH_BY_ROLE.cashier;
}

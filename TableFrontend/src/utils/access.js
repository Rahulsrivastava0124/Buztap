export const ROLE_RANK = {
  cashier: 1,
  manager: 2,
  admin: 3,
};

export function hasRoleAccess(role, minimumRole) {
  return (ROLE_RANK[role] ?? 0) >= (ROLE_RANK[minimumRole] ?? 99);
}

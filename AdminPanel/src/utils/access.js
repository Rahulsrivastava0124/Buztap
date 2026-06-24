export const ROLE_RANK = {
  cashier: 1,
  manager: 2,
  admin: 3,
};

export const PERMISSIONS = {
  // Orders & POS
  POS_ACCESS: "pos.access",
  ORDERS_VIEW: "orders.view",
  ORDERS_MANAGE: "orders.manage",
  
  // Menu
  MENU_VIEW: "menu.view",
  MENU_MANAGE: "menu.manage",

  // Kitchen Display System
  KDS_ACCESS: "kds.access",

  // Tables & QR
  TABLES_MANAGE: "tables.manage",

  // Staff & Roles
  STAFF_VIEW: "staff.view",
  STAFF_MANAGE: "staff.manage",
  ROLES_MANAGE: "roles.manage",

  // Reports & Analytics
  REPORTS_VIEW: "reports.view",

  // Business Settings
  SETTINGS_MANAGE: "settings.manage",
  
  // Subscriptions & Billing
  BILLING_MANAGE: "billing.manage"
};

const DEFAULT_ADMIN_PATH_BY_ROLE = {
  cashier: "/dashboard/operations",
  manager: "/dashboard/overview",
  admin: "/dashboard/overview",
};

export function hasRoleAccess(role, minimumRole) {
  return (ROLE_RANK[role] ?? 0) >= (ROLE_RANK[minimumRole] ?? 99);
}

export function hasPermission(customRole, role, requiredPermission) {
  // 1. If no custom role exists, fallback to legacy role checks
  if (!customRole) {
    if (role === "admin") return true;
    if (role === "manager") {
      // Manager has almost all permissions except roles & billing
      return ![PERMISSIONS.ROLES_MANAGE, PERMISSIONS.BILLING_MANAGE].includes(requiredPermission);
    }
    if (role === "cashier") {
      // Cashier only gets basic operational permissions
      const cashierPerms = [
        PERMISSIONS.POS_ACCESS,
        PERMISSIONS.ORDERS_VIEW,
        PERMISSIONS.ORDERS_MANAGE,
        PERMISSIONS.MENU_VIEW,
        PERMISSIONS.TABLES_MANAGE,
      ];
      return cashierPerms.includes(requiredPermission);
    }
    return false;
  }

  // 2. If it's the system Admin role, they get everything
  if (customRole.name === "Admin" && customRole.isSystem) {
    return true;
  }

  // 3. Otherwise check the explicit permissions array
  return customRole.permissions?.includes(requiredPermission) || false;
}

export function getDefaultAdminPathByRole(role) {
  return DEFAULT_ADMIN_PATH_BY_ROLE[role] || DEFAULT_ADMIN_PATH_BY_ROLE.cashier;
}

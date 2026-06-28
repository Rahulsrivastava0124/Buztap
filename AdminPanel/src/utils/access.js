export const ROLE_RANK = {
  custom: 1, // Base rank for custom roles to pass minimum checks
  cashier: 1,
  manager: 2,
  admin: 3,
};

export const PERMISSIONS = {
  // Dashboard & Analytics
  DASHBOARD_OVERVIEW: "dashboard.overview",
  DASHBOARD_FINANCE: "dashboard.finance",
  DASHBOARD_OPERATIONS: "dashboard.operations",
  DASHBOARD_VISITORS: "dashboard.visitors",

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
  // 1. Admin (business owner) ALWAYS gets full access, regardless of custom role
  if (role === "admin") return true;

  // 2. If no custom role exists, fallback to legacy role checks
  if (!customRole) {
    if (role === "manager") {
      // Manager has almost all permissions except roles & billing
      return ![PERMISSIONS.ROLES_MANAGE, PERMISSIONS.BILLING_MANAGE].includes(requiredPermission);
    }
    if (role === "cashier") {
      // Cashier only gets basic operational permissions
      const cashierPerms = [
        PERMISSIONS.DASHBOARD_OPERATIONS,
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
  const perms = customRole.permissions || [];
  
  // Legacy support for older custom roles that still have reports.view
  if (perms.includes("reports.view")) {
    const legacyDashboardPerms = [
      PERMISSIONS.DASHBOARD_OVERVIEW,
      PERMISSIONS.DASHBOARD_FINANCE,
      PERMISSIONS.DASHBOARD_OPERATIONS,
      PERMISSIONS.DASHBOARD_VISITORS
    ];
    if (legacyDashboardPerms.includes(requiredPermission)) return true;
  }

  return perms.includes(requiredPermission);
}

export function getDefaultAdminPathByRole(role, customRole = null) {
  // Admin always goes to overview
  if (role === "admin") return "/dashboard/overview";

  if (customRole) {
    if (customRole.name === "Admin" && customRole.isSystem) return "/dashboard/overview";
    
    const perms = customRole.permissions || [];
    
    // Legacy support
    if (perms.includes("reports.view") || perms.includes(PERMISSIONS.DASHBOARD_OVERVIEW)) return "/dashboard/overview";
    
    if (perms.includes(PERMISSIONS.DASHBOARD_OPERATIONS)) return "/dashboard/operations";
    if (perms.includes(PERMISSIONS.DASHBOARD_FINANCE)) return "/dashboard/finance";
    if (perms.includes(PERMISSIONS.DASHBOARD_VISITORS)) return "/dashboard/visitors";
    if (perms.includes(PERMISSIONS.POS_ACCESS)) return "/pos";
    if (perms.includes(PERMISSIONS.ORDERS_VIEW)) return "/orders";
    if (perms.includes(PERMISSIONS.MENU_VIEW)) return "/menu";
    if (perms.includes(PERMISSIONS.TABLES_MANAGE)) return "/dashboard/operations";
    if (perms.includes(PERMISSIONS.STAFF_VIEW)) return "/staff";
    
    // If they have none of the above, fallback to operations anyway
    return "/dashboard/operations";
  }

  return DEFAULT_ADMIN_PATH_BY_ROLE[role] || DEFAULT_ADMIN_PATH_BY_ROLE.cashier;
}

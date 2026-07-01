const PERMISSIONS = {
  // Dashboard & Analytics
  DASHBOARD_OVERVIEW: "dashboard.overview",
  DASHBOARD_FINANCE: "dashboard.finance",
  DASHBOARD_OPERATIONS: "dashboard.operations",
  DASHBOARD_VISITORS: "dashboard.visitors",

  // Orders & POS
  POS_ACCESS: "pos.access",
  ORDERS_VIEW: "orders.view",
  ORDERS_MANAGE: "orders.manage", // Create, update status, cancel
  
  // Menu
  MENU_VIEW: "menu.view",
  MENU_MANAGE: "menu.manage", // Add, edit, delete items and categories

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

const DEFAULT_ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS), // Admin gets everything
  manager: [
    PERMISSIONS.DASHBOARD_OVERVIEW,
    PERMISSIONS.DASHBOARD_FINANCE,
    PERMISSIONS.DASHBOARD_OPERATIONS,
    PERMISSIONS.DASHBOARD_VISITORS,
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MENU_MANAGE,
    PERMISSIONS.KDS_ACCESS,
    PERMISSIONS.TABLES_MANAGE,
    PERMISSIONS.STAFF_VIEW,
  ],
  cashier: [
    PERMISSIONS.DASHBOARD_OPERATIONS,
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.TABLES_MANAGE,
  ]
};

module.exports = {
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
};


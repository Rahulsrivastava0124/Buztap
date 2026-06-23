/**
 * requirePermission("menu:manage") — rejects if the authenticated user
 * doesn't have the specified permission AND doesn't have the "all" permission.
 */
function requirePermission(requiredPerm) {
  return (req, res, next) => {
    // Legacy support for token payload without permissions array
    const userRole = req.user?.role;
    
    // Extract permissions from JWT payload (attached by auth middleware)
    const permissions = req.user?.permissions || [];
    
    // If the user's token has "all", they are super users/admins
    if (permissions.includes("all")) {
      return next();
    }
    
    // Check specific permission
    if (permissions.includes(requiredPerm)) {
      return next();
    }
    
    // Fallback logic for legacy tokens: Map old roles to permissions
    // "admin" = "all"
    // "manager" = menu:*, staff:*, reports:*, etc.
    // "cashier" = pos:*, orders:*
    if (!req.user?.permissions && userRole) {
      if (userRole === "admin") return next();
      
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
      if (fallbackPerms.includes(requiredPerm)) {
        return next();
      }
    }

    return res.status(403).json({
      error: `Access denied. Required permission: ${requiredPerm}`,
    });
  };
}

module.exports = requirePermission;

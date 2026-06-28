const Role = require("../models/Role");
const ROLE_LEVELS = { cashier: 1, manager: 2, admin: 3 };

function requireRole(minimumRole) {
  return async (req, res, next) => {
    try {
      let effectiveRole = req.user?.role;

      if (effectiveRole === "custom" && req.user?.customRole) {
        const roleDoc = await Role.findById(req.user.customRole).lean();
        if (roleDoc) {
          // If it's a system role, we can infer its level from its name
          if (roleDoc.isSystem && ROLE_LEVELS[roleDoc.name.toLowerCase()]) {
            effectiveRole = roleDoc.name.toLowerCase();
          } else {
            // For purely custom roles, we'll map them to "manager" if they have SETTINGS_MANAGE, else "cashier"
            // This is a temporary bridge until all routes use requirePermission
            if (roleDoc.permissions.includes("settings.manage")) {
              effectiveRole = "manager";
            } else {
              effectiveRole = "cashier";
            }
          }
        }
      }

      const userLevel = ROLE_LEVELS[effectiveRole] ?? 0;
      const requiredLevel = ROLE_LEVELS[minimumRole] ?? 0;
      
      if (userLevel < requiredLevel) {
        return res.status(403).json({
          error: `Access denied. Required role level: ${minimumRole}`,
        });
      }
      next();
    } catch (err) {
      console.error("requireRole error:", err);
      res.status(500).json({ error: "Server error checking roles" });
    }
  };
}

module.exports = requireRole;

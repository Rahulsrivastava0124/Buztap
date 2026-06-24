const Role = require("../models/Role");

function requirePermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // If user is Admin by legacy role, allow everything as a fallback
      if (req.user.role === "admin") {
        return next();
      }

      if (!req.user.customRole) {
        return res.status(403).json({ error: "Access denied. No role assigned." });
      }

      const role = await Role.findById(req.user.customRole).lean();
      
      if (!role) {
        return res.status(403).json({ error: "Role not found." });
      }

      // Admin role gets everything
      if (role.name === "Admin" && role.isSystem) {
        return next();
      }

      if (!role.permissions.includes(requiredPermission)) {
        return res.status(403).json({ error: "Access denied. Missing required permission." });
      }

      next();
    } catch (err) {
      console.error("requirePermission error:", err);
      res.status(500).json({ error: "Server error checking permissions" });
    }
  };
}

module.exports = requirePermission;

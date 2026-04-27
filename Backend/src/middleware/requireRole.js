const ROLE_LEVELS = { cashier: 1, manager: 2, admin: 3 };

/**
 * requireRole("manager") — rejects if the authenticated user's role level
 * is lower than the specified minimum role.
 */
function requireRole(minimumRole) {
  return (req, res, next) => {
    const userLevel = ROLE_LEVELS[req.user?.role] ?? 0;
    const requiredLevel = ROLE_LEVELS[minimumRole] ?? 0;
    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: `Access denied. Required role: ${minimumRole}`,
      });
    }
    next();
  };
}

module.exports = requireRole;

const jwt = require("jsonwebtoken");
const { isBlacklisted } = require("./tokenBlacklist");

/**
 * Like authenticate, but non-blocking: if no token is provided (or token is
 * invalid/expired), the request continues without req.user set.  Useful for
 * endpoints that are public but can be scoped when a valid token is present.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice(7);

  if (isBlacklisted(token)) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: payload.sub,
      businessId: payload.businessId,
      role: payload.role,
      businessType: payload.businessType,
    };
    req.token = token;
  } catch {
    // Invalid / expired — continue anonymously
  }

  next();
}

module.exports = optionalAuth;

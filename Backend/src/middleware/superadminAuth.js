const jwt = require("jsonwebtoken");
const { isBlacklisted } = require("./tokenBlacklist");

function superadminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.slice(7);

  if (isBlacklisted(token)) {
    return res.status(401).json({ error: "Token has been revoked" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "superadmin") {
      return res.status(403).json({ error: "Super Admin access required" });
    }
    req.superadmin = { role: "superadmin" };
    req.token = token;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = superadminAuth;

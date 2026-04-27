const jwt = require("jsonwebtoken");
const { isBlacklisted } = require("./tokenBlacklist");

function authenticate(req, res, next) {
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
    req.user = {
      userId: payload.sub,
      businessId: payload.businessId,
      role: payload.role,
      businessType: payload.businessType,
    };
    req.token = token;
    req.tokenExp = payload.exp * 1000; // ms
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authenticate;

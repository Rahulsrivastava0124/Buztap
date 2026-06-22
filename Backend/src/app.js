const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorHandler");
const apiAudit = require("./middleware/apiAudit");

const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const menuRoutes = require("./routes/menu.routes");
const tablesRoutes = require("./routes/tables.routes");
const ordersRoutes = require("./routes/orders.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const staffRoutes = require("./routes/staff.routes");
const reportsRoutes = require("./routes/reports.routes");
const paymentsRoutes = require("./routes/payments.routes");
const guestsRoutes = require("./routes/guests.routes");
const qrRoutes = require("./routes/qr.routes");
const uploadRoutes = require("./routes/upload.routes");
const businessRoutes = require("./routes/business.routes");
const offersRoutes = require("./routes/offers.routes");
const superadminRoutes = require("./routes/superadmin.routes");

const mongoose = require("mongoose");

const app = express();

// Respect reverse proxy headers (Render/Nginx/Cloudflare).
// Default to 1 proxy hop so rate-limit can safely use X-Forwarded-For.
const trustProxyRaw = String(process.env.TRUST_PROXY || "")
  .trim()
  .toLowerCase();
if (trustProxyRaw === "false" || trustProxyRaw === "0") {
  app.set("trust proxy", false);
} else if (trustProxyRaw === "true") {
  app.set("trust proxy", true);
} else if (/^\d+$/.test(trustProxyRaw)) {
  app.set("trust proxy", Number(trustProxyRaw));
} else {
  app.set("trust proxy", 1);
}

// ── Info route ────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  const dbState = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    name: "BuzTap API",
    version: "1.0.0",
    status: "running",
    database: {
      status: dbState[mongoose.connection.readyState] || "unknown",
      name: mongoose.connection.name || null,
      host: mongoose.connection.host || null,
    },
    environment: process.env.NODE_ENV || "development",
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Convert each entry to a matcher: exact string or wildcard regex (https://*.domain.com)
const originMatchers = allowedOrigins.map((o) => {
  if (o.includes("*")) {
    // e.g. https://*.buztap.com → match any single subdomain
    const escaped = o
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // escape regex special chars
      .replace("\\*", "[^.]+"); // turn \* back into wildcard
    return new RegExp(`^${escaped}$`);
  }
  return o; // exact match
});

function isOriginAllowed(origin) {
  return originMatchers.some((m) =>
    m instanceof RegExp ? m.test(origin) : m === origin,
  );
}

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, Postman).
      if (!origin) return cb(null, true);

      if (isOriginAllowed(origin)) {
        return cb(null, true);
      }

      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json());

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── API audit logs ───────────────────────────────────────────────────────────
app.use("/api", apiAudit);

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Login only: 10 attempts / 15 min per account+IP — brute-force guard
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const ipKey = rateLimit.ipKeyGenerator(req.ip || "");
    const identifier = String(
      req.body?.identifier || req.body?.email || req.body?.phone || "",
    )
      .trim()
      .toLowerCase();

    // Isolate attempts per account identifier on the same IP.
    return identifier ? `${ipKey}:${identifier}` : ipKey;
  },
  message: { error: "Too many login attempts, please try again in 15 minutes" },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/otp/request", authLimiter);
app.use("/api/auth/password/reset", authLimiter);
app.get("/api/health", (_req, res) => {
  const mongoose = require("mongoose");
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    version: require("../package.json").version,
    db: dbStates[mongoose.connection.readyState] ?? "unknown",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/tables", tablesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/guests", guestsRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/superadmin", superadminRoutes);

// 404
app.use((req, res) =>
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  }),
);

// Global error handler
app.use(errorHandler);

module.exports = app;

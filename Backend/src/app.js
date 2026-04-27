const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorHandler");

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

const mongoose = require("mongoose");

const app = express();

// ── Info route ────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  const dbState = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    name: "tableQR API",
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
const allowAllOrigins = allowedOrigins.length === 0;

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. curl, Postman).
      if (!origin) return cb(null, true);

      // If ALLOWED_ORIGINS is not configured, allow all origins for local dev.
      if (allowAllOrigins || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(express.json());

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── Rate limiting ─────────────────────────────────────────────────────────────
// General API: 200 req / 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// Auth (login/register): 10 attempts / 15 min per IP — brute-force guard
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again in 15 minutes" },
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

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

// 404
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use(errorHandler);

module.exports = app;

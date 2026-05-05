const mongoose = require("mongoose");
const { randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const AuditLog = require("../models/AuditLog");

const EXCLUDED_PATHS = new Set(["/api/health"]);
const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "authorization",
  "otp",
  "code",
  "secret",
]);

function getAuditLogFilePath() {
  const dir = process.env.API_AUDIT_LOG_DIR
    ? path.resolve(process.env.API_AUDIT_LOG_DIR)
    : path.resolve(process.cwd(), "logs");
  const date = new Date().toISOString().slice(0, 10);
  return path.join(dir, `api-audit-${date}.log`);
}

function toObjectIdOrNull(value) {
  if (!value) return null;
  return mongoose.Types.ObjectId.isValid(value) ? value : null;
}

function maskSensitive(value) {
  if (Array.isArray(value)) {
    return value.slice(0, 50).map(maskSensitive);
  }

  if (value && typeof value === "object") {
    const result = {};
    for (const [k, v] of Object.entries(value)) {
      const key = String(k).toLowerCase();
      result[k] = SENSITIVE_KEYS.has(key) ? "***" : maskSensitive(v);
    }
    return result;
  }

  if (typeof value === "string" && value.length > 1000) {
    return `${value.slice(0, 1000)}...`;
  }

  return value;
}

function buildBaseEntry(req, res, requestId, durationMs) {
  return {
    ts: new Date().toISOString(),
    requestId,
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl || req.url,
    statusCode: res.statusCode,
    durationMs: Number(durationMs.toFixed(2)),
    ip: req.ip || "",
    userAgent: String(req.headers["user-agent"] || ""),
    businessId: toObjectIdOrNull(req.user?.businessId),
    userId: toObjectIdOrNull(req.user?.userId),
    role: req.user?.role || "guest",
  };
}

function logHitToConsole(entry, errorInfo) {
  if (
    String(process.env.API_AUDIT_CONSOLE || "true").toLowerCase() === "false"
  ) {
    return;
  }

  const baseLine =
    `[API] ${entry.method} ${entry.originalUrl} ` +
    `status=${entry.statusCode} duration=${entry.durationMs}ms ` +
    `requestId=${entry.requestId}`;

  if (entry.statusCode >= 500) {
    console.error(
      `${baseLine}${errorInfo?.message ? ` error="${errorInfo.message}"` : ""}`,
    );
    return;
  }

  if (entry.statusCode >= 400) {
    console.warn(
      `${baseLine}${errorInfo?.message ? ` error="${errorInfo.message}"` : ""}`,
    );
    return;
  }

  console.info(baseLine);
}

async function writeAuditFile(entry) {
  const filePath = getAuditLogFilePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, `${JSON.stringify(entry)}\n`, "utf8");
}

function apiAudit(req, res, next) {
  if (
    String(process.env.API_AUDIT_ENABLED || "true").toLowerCase() === "false"
  ) {
    return next();
  }

  if (EXCLUDED_PATHS.has(req.path)) {
    return next();
  }

  const startedAt = process.hrtime.bigint();
  const requestId = req.headers["x-request-id"] || randomUUID();
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    // Fire-and-forget writes to avoid delaying API responses.
    const endedAt = process.hrtime.bigint();
    const durationMs = Number(endedAt - startedAt) / 1e6;

    const baseEntry = buildBaseEntry(req, res, requestId, durationMs);
    const errorInfo = res.locals?.apiError || null;

    logHitToConsole(baseEntry, errorInfo);

    const fileEntry = {
      ...baseEntry,
      query: maskSensitive(req.query || {}),
      params: maskSensitive(req.params || {}),
      body: maskSensitive(req.body || {}),
      error: errorInfo,
    };

    const dbEntry = {
      requestId: baseEntry.requestId,
      method: baseEntry.method,
      path: baseEntry.path,
      originalUrl: baseEntry.originalUrl,
      statusCode: baseEntry.statusCode,
      durationMs: baseEntry.durationMs,
      ip: baseEntry.ip,
      userAgent: baseEntry.userAgent,
      businessId: baseEntry.businessId,
      userId: baseEntry.userId,
      role: baseEntry.role,
    };

    Promise.allSettled([
      AuditLog.create(dbEntry),
      writeAuditFile(fileEntry),
    ]).then((results) => {
      if (process.env.NODE_ENV === "test") return;

      const dbResult = results[0];
      const fileResult = results[1];

      if (dbResult.status === "rejected") {
        console.error(
          "[api-audit] failed to write DB log",
          dbResult.reason?.message || dbResult.reason,
        );
      }

      if (fileResult.status === "rejected") {
        console.error(
          "[api-audit] failed to write file log",
          fileResult.reason?.message || fileResult.reason,
        );
      }
    });
  });

  next();
}

module.exports = apiAudit;

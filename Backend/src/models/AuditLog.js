const { Schema, model } = require("mongoose");

const auditLogSchema = new Schema(
  {
    requestId: { type: String, required: true, index: true },
    method: { type: String, required: true },
    path: { type: String, required: true, index: true },
    originalUrl: { type: String, required: true },
    statusCode: { type: Number, required: true, index: true },
    durationMs: { type: Number, required: true },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      default: null,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    role: { type: String, default: "guest", index: true },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ method: 1, path: 1, createdAt: -1 });

module.exports = model("AuditLog", auditLogSchema);

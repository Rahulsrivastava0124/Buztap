const { Schema, model } = require("mongoose");

const emailOtpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ["register", "login", "reset-password"],
      required: true,
      index: true,
    },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model("EmailOtp", emailOtpSchema);

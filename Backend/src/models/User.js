const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    username: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "manager", "cashier"], required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    shift: { type: String, enum: ["Morning", "Evening", "Night"], default: "Morning" },
    serviceScore: { type: Number, min: 0, max: 100, default: 80 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// username must be unique per business
userSchema.index({ businessId: 1, username: 1 }, { unique: true });

module.exports = model("User", userSchema);

const { Schema, model } = require("mongoose");

const guestSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      index: true,
      default: null,
    },
    phone: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: "" },
    visitCount: { type: Number, default: 1 },
    qrLoginCount: { type: Number, default: 0 },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now, index: true },
    lastTableId: { type: String, default: null },
    lastSource: { type: String, default: "QR" },
    totalSpent: { type: Number, default: 0 },
    lastOrderDate: { type: Date, default: null },
    orderHistory: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    preferences: {
      spiceLevelPreference: { type: Number, default: 3 },
      dietaryRestrictions: [{ type: String }],
    },
  },
  { timestamps: true },
);

guestSchema.index({ businessId: 1, lastSeenAt: 1 });

module.exports = model("Guest", guestSchema);

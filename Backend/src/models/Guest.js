const { Schema, model } = require("mongoose");

const guestSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: "" },
    visitCount: { type: Number, default: 1 },
    totalSpent: { type: Number, default: 0 },
    lastOrderDate: { type: Date, default: null },
    orderHistory: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    preferences: {
      spiceLevelPreference: { type: Number, default: 3 },
      dietaryRestrictions: [{ type: String }],
    },
  },
  { timestamps: true }
);

module.exports = model("Guest", guestSchema);

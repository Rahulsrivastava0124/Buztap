const { Schema, model } = require("mongoose");

const offerSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, trim: true, default: "" },
    offerType: {
      type: String,
      enum: ["coupon", "festival", "category", "item"],
      default: "coupon",
    },
    audience: {
      type: String,
      enum: ["all", "new", "returning"],
      default: "all",
    },
    discountPct: { type: Number, required: true, min: 1, max: 90 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    targetCategory: { type: String, trim: true, default: "" },
    targetItemIds: [{ type: String, trim: true }],
    expiresAt: { type: Date, default: null },
    isVisible: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

offerSchema.index({ businessId: 1, code: 1 }, { unique: true });

module.exports = model("Offer", offerSchema);

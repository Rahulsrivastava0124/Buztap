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
    discountPct: { type: Number, required: true, min: 1, max: 90 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    isVisible: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

offerSchema.index({ businessId: 1, code: 1 }, { unique: true });

module.exports = model("Offer", offerSchema);

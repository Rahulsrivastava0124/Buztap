const { Schema, model } = require("mongoose");

const analyticsSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    dailyRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    avgOrderValue: { type: Number, default: 0 },
    activeTableCount: { type: Number, default: 0 },
    totalTableCount: { type: Number, default: 0 },
    channelSplit: {
      posWalkIn: { type: Number, default: 0 },
      qrDineIn: { type: Number, default: 0 },
      qrRoom: { type: Number, default: 0 },
    },
    paymentBreakup: [
      {
        label: String,
        amount: Number,
        share: Number,
      },
    ],
    topProducts: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "MenuItem" },
        name: String,
        units: Number,
        revenue: Number,
        margin: Number,
      },
    ],
    hourlyRevenue: [
      {
        hour: Number,
        revenue: Number,
      },
    ],
  },
  { timestamps: true },
);

analyticsSchema.index({ businessId: 1, date: 1 }, { unique: true });

module.exports = model("Analytics", analyticsSchema);

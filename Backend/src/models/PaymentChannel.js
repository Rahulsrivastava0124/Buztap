const { Schema, model } = require("mongoose");

const paymentChannelSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    channel: { type: String, required: true, trim: true }, // e.g. "Razorpay UPI"
    isEnabled: { type: Boolean, default: true },
    gross: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    net: { type: Number, default: 0 },
    settleStatus: {
      type: String,
      enum: ["Settled", "Pending"],
      default: "Pending",
    },
    settledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = model("PaymentChannel", paymentChannelSchema);

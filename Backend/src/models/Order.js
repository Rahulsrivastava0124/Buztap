const { Schema, model } = require("mongoose");

const orderItemSchema = new Schema(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem" },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    notes: { type: String, default: "" },
    modifiers: [{ type: String }],
    total: { type: Number, required: true },
    preparationStatus: {
      type: String,
      enum: ["Pending", "Preparing", "Ready", "Served"],
      default: "Pending",
    },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    orderId: { type: String, required: true }, // e.g. "#2849"
    tableId: { type: String, default: null },
    roomId: { type: String, default: null },
    guestName: { type: String, default: "Guest" },
    guestPhone: { type: String, default: null },
    orderType: {
      type: String,
      enum: ["Dine-in", "Takeaway", "Delivery", "Room Service"],
      default: "Dine-in",
    },
    source: { type: String, enum: ["POS", "QR"], default: "POS" },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discountPct: { type: Number, default: 0 },
    discountReason: { type: String, default: null },
    taxableAmount: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card/UPI", "Room Charge", "Pending"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    transactionId: { type: String, default: null },
    status: {
      type: String,
      enum: ["Preparing", "Ready", "Served", "Cancelled"],
      default: "Preparing",
    },
    kitchenTicketId: { type: String, default: null },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    cancelReason: { type: String, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Auto-generate orderId before save if not provided
orderSchema.pre("validate", function (next) {
  if (!this.orderId) {
    this.orderId = `#${String(Date.now()).slice(-4)}`;
  }
  next();
});

module.exports = model("Order", orderSchema);

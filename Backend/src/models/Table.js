const { Schema, model } = require("mongoose");

const tableSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    tableId: { type: String, required: true, trim: true }, // e.g. "T-01"
    seats: { type: Number, required: true, min: 1 },
    area: { type: String, trim: true, default: "Main Floor" },
    status: {
      type: String,
      enum: ["Free", "Occupied", "Reserved", "Cleaning"],
      default: "Free",
    },
    guestName: { type: String, default: null },
    guestPhone: { type: String, default: null },
    qrCode: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tableSchema.index({ businessId: 1, tableId: 1 }, { unique: true });

module.exports = model("Table", tableSchema);

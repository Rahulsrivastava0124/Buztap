const { Schema, model } = require("mongoose");

const inventorySchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    itemName: { type: String, required: true, trim: true },
    unit: { type: String, enum: ["kg", "liters", "pieces", "grams", "ml"], default: "kg" },
    inStock: { type: Number, required: true, min: 0 },
    reorderAt: { type: Number, required: true, min: 0 },
    supplier: { type: String, default: "" },
    supplierPhone: { type: String, default: "" },
    costPerUnit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Healthy", "Low", "Out of Stock"],
      default: "Healthy",
    },
    lastRestocked: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-compute status before save
inventorySchema.pre("save", function (next) {
  if (this.inStock === 0) this.status = "Out of Stock";
  else if (this.inStock <= this.reorderAt) this.status = "Low";
  else this.status = "Healthy";
  next();
});

module.exports = model("Inventory", inventorySchema);

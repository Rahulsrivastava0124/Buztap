const { Schema, model } = require("mongoose");

const menuItemSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    priceOptions: [
      {
        label: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    cost: { type: Number, default: 0 }, // for margin calculation
    image: { type: String, default: "" },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number, default: 15 }, // minutes
    spiceLevel: { type: Number, min: 1, max: 5, default: 2 },
    allergens: [{ type: String }],
  },
  { timestamps: true },
);

module.exports = model("MenuItem", menuItemSchema);

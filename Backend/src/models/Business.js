const { Schema, model } = require("mongoose");

const businessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["restro", "hotel"], required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    socialLinks: {
      instagram: { type: String, trim: true, default: "" },
      facebook: { type: String, trim: true, default: "" },
      x: { type: String, trim: true, default: "" },
      googleReview: { type: String, trim: true, default: "" },
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    subdomain: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    branches: { type: Number, default: 1 },
    tableCount: { type: Number, default: 0 },
    gstPct: { type: Number, min: 0, max: 100, default: 5 },
    taxPct: { type: Number, min: 0, max: 100, default: 0 },
    gstNo: { type: String, trim: true, default: "" },
    restroUpi: { type: String, trim: true, default: "" },
    headerImage: { type: String, trim: true, default: "" },
    logoImage: { type: String, trim: true, default: "" },
    holidays: {
      type: [
        {
          date: { type: Date, required: true },
          name: { type: String, trim: true, default: "Holiday" },
        },
      ],
      default: [],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = model("Business", businessSchema);

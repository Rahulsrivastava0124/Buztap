const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    username: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "cashier"],
      required: true,
    },
    designation: {
      type: String,
      enum: [
        "Admin",
        "Manager",
        "Receptionist",
        "Kitchen",
        "Waiter",
        "Employee",
      ],
      default: "Employee",
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    shiftTiming: {
      name: {
        type: String,
        enum: ["Morning", "Evening", "Night", "Custom"],
        default: "Morning",
      },
      startTime: { type: String, default: "09:00" }, // HH:mm format
      endTime: { type: String, default: "17:00" }, // HH:mm format
    },
    salaryMonthly: { type: Number, min: 0, default: 0 },
    leaveAllowance: { type: Number, min: 0, default: 12 },
    leavesTaken: { type: Number, min: 0, default: 0 },
    joiningDate: { type: Date },
    attendanceRecords: {
      type: [
        {
          date: { type: Date, required: true },
          status: {
            type: String,
            enum: ["work", "absent", "holiday", "weekOff", "halfDay"],
            required: true,
          },
          note: { type: String, trim: true },
          punchIn: { type: Date },
          punchOut: { type: Date },
          isLate: { type: Boolean, default: false },
          lateMinutes: { type: Number, min: 0, default: 0 },
        },
      ],
      default: [],
    },
    serviceScore: { type: Number, min: 0, max: 100, default: 80 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// username must be unique per business
userSchema.index({ businessId: 1, username: 1 }, { unique: true });

module.exports = model("User", userSchema);

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
      type: String, // 'admin', 'manager', 'cashier', or 'custom'
      default: "custom",
    },
    customRole: {
      type: Schema.Types.ObjectId,
      ref: "Role",
    },
    designation: {
      type: String,
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
          punchInDeviceId: { type: String, default: null },
        },
      ],
      default: [],
    },
    leaveRequests: {
      type: [
        {
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
          leaveType: {
            type: String,
            enum: ["Casual", "Sick", "Paid", "Unpaid", "Other"],
            default: "Casual",
          },
          reason: { type: String, trim: true, required: true },
          status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled"],
            default: "pending",
          },
          requestedAt: { type: Date, default: Date.now },
          reviewedAt: { type: Date },
          reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
          managerNote: { type: String, trim: true },
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

const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");

// Designation → minimum permission role mapping
const DESIGNATION_ROLE_MAP = {
  Admin: "admin",
  Manager: "manager",
  Receptionist: "cashier",
  Kitchen: "cashier",
  Waiter: "cashier",
  Employee: "cashier",
};

const VALID_DESIGNATIONS = Object.keys(DESIGNATION_ROLE_MAP);
const ATTENDANCE_STATUSES = ["work", "absent", "holiday", "weekOff", "halfDay"];

const attendanceRecordSchema = z.object({
  date: z.coerce.date(),
  status: z.enum(ATTENDANCE_STATUSES),
  note: z.string().optional().or(z.literal("")),
});

const shiftTimingSchema = z.object({
  name: z.enum(["Morning", "Evening", "Night", "Custom"]).optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
});

const createSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  name: z.string().min(1),
  designation: z.enum(VALID_DESIGNATIONS),
  role: z.enum(["admin", "manager", "cashier"]).optional(),
  shiftTiming: shiftTimingSchema.optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  salaryMonthly: z.number().min(0).optional(),
  leaveAllowance: z.number().min(0).optional(),
  leavesTaken: z.number().min(0).optional(),
  joiningDate: z.coerce.date().optional(),
  attendanceRecords: z.array(attendanceRecordSchema).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  designation: z.enum(VALID_DESIGNATIONS).optional(),
  role: z.enum(["admin", "manager", "cashier"]).optional(),
  shiftTiming: shiftTimingSchema.optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  salaryMonthly: z.number().min(0).optional(),
  leaveAllowance: z.number().min(0).optional(),
  leavesTaken: z.number().min(0).optional(),
  joiningDate: z.coerce.date().optional(),
  attendanceRecords: z.array(attendanceRecordSchema).optional(),
  isActive: z.boolean().optional(),
  serviceScore: z.number().min(0).max(100).optional(),
  password: z.string().min(6).optional(),
});

function mapMember(member) {
  // Deduplicate attendance records by date
  const recordMap = {};
  const attendanceRecords = (member.attendanceRecords || []).reduce(
    (acc, record) => {
      const d = new Date(record.date);
      if (!Number.isNaN(d.getTime())) {
        // Convert to UTC date key to ensure consistency
        const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
        // Keep only the latest record for each date
        recordMap[dateKey] = {
          date: record.date,
          status: record.status,
          note: record.note || "",
          punchIn: record.punchIn || null,
          punchOut: record.punchOut || null,
        };
      }
      return acc;
    },
    {},
  );

  const deduplicatedRecords = Object.values(recordMap);

  return {
    _id: member._id,
    id: member._id,
    username: member.username,
    name: member.name,
    role: member.role,
    designation: member.designation || "Employee",
    shiftTiming: member.shiftTiming || {
      name: "Morning",
      startTime: "09:00",
      endTime: "17:00",
    },
    email: member.email || "",
    phone: member.phone || "",
    salaryMonthly: Number(member.salaryMonthly || 0),
    leaveAllowance: Number(member.leaveAllowance ?? 12),
    leavesTaken: Number(member.leavesTaken || 0),
    joiningDate: member.joiningDate || null,
    attendanceRecords: deduplicatedRecords,
    serviceScore: member.serviceScore ?? 80,
    isActive: member.isActive !== false,
    createdAt: member.createdAt,
  };
}

async function getAll(req, res, next) {
  try {
    const staff = await User.find({ businessId: req.user.businessId })
      .select("-passwordHash")
      .sort({ name: 1 })
      .lean();
    res.json(staff.map(mapMember));
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const member = await User.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    })
      .select("-passwordHash")
      .lean();
    if (!member)
      return res.status(404).json({ error: "Staff member not found" });
    res.json(mapMember(member));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = createSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);
    // Auto-derive role from designation unless explicitly provided
    const role =
      data.role || DESIGNATION_ROLE_MAP[data.designation] || "cashier";
    const member = await User.create({
      username: data.username,
      name: data.name,
      designation: data.designation,
      role,
      shiftTiming: data.shiftTiming || {
        name: "Morning",
        startTime: "09:00",
        endTime: "17:00",
      },
      email: data.email || undefined,
      phone: data.phone || undefined,
      salaryMonthly: data.salaryMonthly ?? 0,
      leaveAllowance: data.leaveAllowance ?? 12,
      leavesTaken: data.leavesTaken ?? 0,
      joiningDate: data.joiningDate || undefined,
      attendanceRecords: data.attendanceRecords || [],
      passwordHash,
      businessId: req.user.businessId,
    });
    res.status(201).json(mapMember(member.toObject()));
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Username already exists for this business." });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = updateSchema.parse(req.body);
    const updatePayload = { ...data };
    delete updatePayload.password;

    // If designation changed, auto-update role unless role is explicitly given
    if (data.designation && !data.role) {
      updatePayload.role = DESIGNATION_ROLE_MAP[data.designation] || "cashier";
    }

    if (data.password) {
      updatePayload.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const member = await User.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { $set: updatePayload },
      { new: true },
    ).select("-passwordHash");
    if (!member)
      return res.status(404).json({ error: "Staff member not found" });
    res.json(mapMember(member.toObject()));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    // Prevent deleting self
    if (String(req.params.id) === String(req.user.userId)) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own account." });
    }
    const member = await User.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user.businessId,
    });
    if (!member)
      return res.status(404).json({ error: "Staff member not found" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function punchIn(req, res, next) {
  try {
    const member = await User.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    });
    if (!member)
      return res.status(404).json({ error: "Staff member not found" });

    if (!Array.isArray(member.attendanceRecords)) {
      member.attendanceRecords = [];
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Find or create today's attendance record
    const existingIndex = member.attendanceRecords.findIndex((record) => {
      const recordDate = new Date(record.date);
      recordDate.setUTCHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    const now = new Date();
    if (existingIndex !== -1) {
      // Update existing record with punch in time
      member.attendanceRecords[existingIndex].punchIn = now;
      // Punch-in means this day is a working day even if it was holiday/week-off.
      member.attendanceRecords[existingIndex].status = "work";
    } else {
      // Create new record for today
      member.attendanceRecords.push({
        date: today,
        status: "work",
        punchIn: now,
      });
    }

    await member.save();
    res.json(mapMember(member.toObject()));
  } catch (err) {
    next(err);
  }
}

async function punchOut(req, res, next) {
  try {
    const member = await User.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    });
    if (!member)
      return res.status(404).json({ error: "Staff member not found" });

    if (!Array.isArray(member.attendanceRecords)) {
      member.attendanceRecords = [];
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Prefer today's attendance record
    const existingIndex = member.attendanceRecords.findIndex((record) => {
      const recordDate = new Date(record.date);
      recordDate.setUTCHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    // Fallback: latest open punch-in record (handles date boundary mismatches)
    const fallbackIndex = member.attendanceRecords.reduce(
      (bestIndex, record, index) => {
        if (!record?.punchIn || record?.punchOut) return bestIndex;

        if (bestIndex === -1) return index;

        const currentTime = new Date(record.punchIn).getTime();
        const bestTime = new Date(
          member.attendanceRecords[bestIndex].punchIn,
        ).getTime();

        return currentTime > bestTime ? index : bestIndex;
      },
      -1,
    );

    const targetIndex = existingIndex !== -1 ? existingIndex : fallbackIndex;

    if (targetIndex === -1) {
      return res.status(400).json({
        error: "No punch in record found for today. Please punch in first.",
      });
    }

    if (member.attendanceRecords[targetIndex].punchOut) {
      return res
        .status(400)
        .json({ error: "Punch out already recorded for this shift." });
    }

    const now = new Date();
    member.attendanceRecords[targetIndex].punchOut = now;
    // Punch-out confirms the shift was worked; keep status as work.
    member.attendanceRecords[targetIndex].status = "work";

    await member.save();
    res.json(mapMember(member.toObject()));
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove, punchIn, punchOut };

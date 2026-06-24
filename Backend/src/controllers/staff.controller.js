const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");
const Business = require("../models/Business");
const {
  applyBusinessHolidays,
  mergeAttendanceRecords,
  toUtcDateKey,
} = require("../utils/attendance");

// Designation → minimum permission role mapping
const DESIGNATION_ROLE_MAP = {
  Admin: "admin",
  Manager: "manager",
  Receptionist: "cashier",
  Kitchen: "cashier",
  Waiter: "cashier",
  Employee: "cashier",
};

const ATTENDANCE_STATUSES = ["work", "absent", "holiday", "weekOff", "halfDay"];
const LEAVE_TYPES = ["Casual", "Sick", "Paid", "Unpaid", "Other"];

const attendanceRecordSchema = z.object({
  date: z.coerce.date(),
  status: z.enum(ATTENDANCE_STATUSES),
  note: z.string().optional().or(z.literal("")),
  punchIn: z.coerce.date().optional(),
  punchOut: z.coerce.date().optional(),
  isLate: z.boolean().optional(),
  lateMinutes: z.number().min(0).optional(),
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

const createSchema = z
  .object({
    username: z.string().min(1),
    password: z.string().min(6),
    name: z.string().min(1),
    designation: z.string().min(1),
    role: z.enum(["admin", "manager", "cashier", "custom"]).optional(),
    customRole: z.string().nullable().optional(),
    shiftTiming: shiftTimingSchema.optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    salaryMonthly: z.number().min(0).optional(),
    leaveAllowance: z.number().min(0).optional(),
    leavesTaken: z.number().min(0).optional(),
    joiningDate: z.coerce.date().optional(),
    attendanceRecords: z.array(attendanceRecordSchema).optional(),
  })
  .transform((data) => ({
    ...data,
    // Auto-derive role from designation when not explicitly provided
    role: data.role || DESIGNATION_ROLE_MAP[data.designation] || "custom",
  }));

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  designation: z.string().min(1).optional(),
  role: z.enum(["admin", "manager", "cashier", "custom"]).optional(),
  customRole: z.string().nullable().optional(),
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

const leaveRequestSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    leaveType: z.enum(LEAVE_TYPES).default("Casual"),
    reason: z.string().trim().min(3),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be the same as or after start date.",
    path: ["endDate"],
  });

const reviewLeaveRequestSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  managerNote: z.string().trim().optional().or(z.literal("")),
});

function canManageStaff(user) {
  return user?.role === "manager" || user?.role === "admin";
}

function getLeaveDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((end.getTime() - start.getTime()) / 86400000);
  return Math.max(1, diffDays + 1);
}

function mapLeaveRequest(request) {
  return {
    id: request._id,
    startDate: request.startDate,
    endDate: request.endDate,
    leaveType: request.leaveType || "Casual",
    reason: request.reason || "",
    status: request.status || "pending",
    requestedAt: request.requestedAt,
    reviewedAt: request.reviewedAt || null,
    reviewedBy: request.reviewedBy || null,
    managerNote: request.managerNote || "",
  };
}

function mapMember(member, holidays = []) {
  // Deduplicate attendance records by date
  const deduplicatedRecords = applyBusinessHolidays(
    member.attendanceRecords || [],
    holidays,
  );

  return {
    _id: member._id,
    id: member._id,
    username: member.username,
    name: member.name,
    role: member.role,
    customRole: member.customRole,
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
    leaveRequests: (member.leaveRequests || [])
      .map(mapLeaveRequest)
      .sort(
        (a, b) =>
          new Date(b.requestedAt || b.startDate || 0).getTime() -
          new Date(a.requestedAt || a.startDate || 0).getTime(),
      ),
    serviceScore: member.serviceScore ?? 80,
    isActive: member.isActive !== false,
    createdAt: member.createdAt,
  };
}

async function getAll(req, res, next) {
  try {
    const [staff, business] = await Promise.all([
      User.find({ businessId: req.user.businessId })
        .populate("customRole", "name permissions")
        .select("-passwordHash")
        .sort({ name: 1 })
        .lean(),
      Business.findById(req.user.businessId).select("holidays").lean(),
    ]);
    res.json(
      staff.map((member) => mapMember(member, business?.holidays || [])),
    );
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const [member, business] = await Promise.all([
      User.findOne({
        _id: req.params.id,
        businessId: req.user.businessId,
      })
        .populate("customRole", "name permissions")
        .select("-passwordHash")
        .lean(),
      Business.findById(req.user.businessId).select("holidays").lean(),
    ]);
    if (!member)
      return res.status(404).json({ error: "Staff member not found" });
    res.json(mapMember(member, business?.holidays || []));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = createSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);
    // role is guaranteed by createSchema transform (auto-derived from designation if missing)
    const member = await User.create({
      username: data.username,
      name: data.name,
      designation: data.designation,
      role: data.role,
      customRole: data.customRole || undefined,
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
    const business = await Business.findById(req.user.businessId)
      .select("holidays")
      .lean();
    await member.populate("customRole", "name permissions");
    res
      .status(201)
      .json(mapMember(member.toObject(), business?.holidays || []));
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
    const parsedBody = { ...(req.body || {}) };
    if (typeof parsedBody.password === "string") {
      parsedBody.password = parsedBody.password.trim();
      if (!parsedBody.password) {
        delete parsedBody.password;
      }
    }

    const data = updateSchema.parse(parsedBody);
    const updatePayload = { ...data };
    delete updatePayload.password;

    // If designation changed, auto-update role unless role is explicitly given
    if (data.designation && !data.role && !data.customRole) {
      updatePayload.role = DESIGNATION_ROLE_MAP[data.designation] || "custom";
    }

    if (data.password) {
      updatePayload.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const member = await User.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    });
    if (!member)
      return res.status(404).json({ error: "Staff member not found" });

    if (Array.isArray(data.attendanceRecords)) {
      updatePayload.attendanceRecords = mergeAttendanceRecords(
        member.attendanceRecords || [],
        data.attendanceRecords,
      );
    }

    Object.assign(member, updatePayload);
    await member.save();
    await member.populate("customRole", "name permissions");

    const response = member.toObject();
    delete response.passwordHash;
    const business = await Business.findById(req.user.businessId)
      .select("holidays")
      .lean();
    res.json(mapMember(response, business?.holidays || []));
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
    const deviceId = String(req.body?.deviceId || "").trim();
    if (!deviceId) {
      return res.status(400).json({
        error:
          "Device identifier is required for punch in. Please enable device permissions and try again.",
        code: "DEVICE_ID_REQUIRED",
      });
    }

    const requestedDateKey = String(req.body?.dateKey || "").trim();
    const effectiveDateKey = /^\d{4}-\d{2}-\d{2}$/.test(requestedDateKey)
      ? requestedDateKey
      : toUtcDateKey(new Date());

    if (!effectiveDateKey) {
      return res.status(400).json({ error: "Invalid attendance date." });
    }

    const member = await User.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    });
    if (!member)
      return res.status(404).json({ error: "Staff member not found" });

    if (!Array.isArray(member.attendanceRecords)) {
      member.attendanceRecords = [];
    }

    const attendanceDate = new Date(`${effectiveDateKey}T00:00:00.000Z`);

    // Find or create today's attendance record
    const existingIndex = member.attendanceRecords.findIndex((record) => {
      return toUtcDateKey(record?.date) === effectiveDateKey;
    });

    const now = new Date();

    // Calculate late arrival based on shift start time
    const shiftStartTime = member.shiftTiming?.startTime || "09:00";
    const [shiftHour, shiftMinute] = shiftStartTime.split(":").map(Number);

    // Use local time so the shift hour matches the server/device local timezone
    const shiftStartDate = new Date(now);
    shiftStartDate.setHours(shiftHour, shiftMinute, 0, 0);

    const minutesLate = Math.floor((now - shiftStartDate) / (1000 * 60));
    const isLate = minutesLate > 0;
    const lateMinutes = Math.max(0, minutesLate);

    // If late by 30+ minutes, mark as half-day; otherwise mark as work
    const status = lateMinutes >= 30 ? "halfDay" : "work";

    if (existingIndex !== -1) {
      // Update existing record with punch in time
      member.attendanceRecords[existingIndex].punchIn = now;
      member.attendanceRecords[existingIndex].status = status;
      member.attendanceRecords[existingIndex].isLate = isLate;
      member.attendanceRecords[existingIndex].lateMinutes = lateMinutes;
      member.attendanceRecords[existingIndex].punchInDeviceId = deviceId;
    } else {
      // Create new record for today
      member.attendanceRecords.push({
        date: attendanceDate,
        status: status,
        punchIn: now,
        isLate: isLate,
        lateMinutes: lateMinutes,
        punchInDeviceId: deviceId,
      });
    }

    await member.save();
    const business = await Business.findById(req.user.businessId)
      .select("holidays")
      .lean();
    res.json(mapMember(member.toObject(), business?.holidays || []));
  } catch (err) {
    next(err);
  }
}

async function punchOut(req, res, next) {
  try {
    const punchOutDeviceId = String(req.body?.deviceId || "").trim();
    if (!punchOutDeviceId) {
      return res.status(400).json({
        error:
          "Device identifier is required for punch out. Please enable device permissions and try again.",
        code: "DEVICE_ID_REQUIRED",
      });
    }

    const requestedDateKey = String(req.body?.dateKey || "").trim();
    const effectiveDateKey = /^\d{4}-\d{2}-\d{2}$/.test(requestedDateKey)
      ? requestedDateKey
      : toUtcDateKey(new Date());

    if (!effectiveDateKey) {
      return res.status(400).json({ error: "Invalid attendance date." });
    }

    const member = await User.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    });
    if (!member)
      return res.status(404).json({ error: "Staff member not found" });

    if (!Array.isArray(member.attendanceRecords)) {
      member.attendanceRecords = [];
    }

    // Prefer selected local date attendance record
    const existingIndex = member.attendanceRecords.findIndex((record) => {
      return toUtcDateKey(record?.date) === effectiveDateKey;
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

    // ── Device security check ─────────────────────────────────────────────
    const punchInDeviceId = String(
      member.attendanceRecords[targetIndex].punchInDeviceId || "",
    ).trim();

    if (!punchInDeviceId) {
      return res.status(403).json({
        error:
          "Security check failed: missing punch-in device record. Please contact your manager.",
        code: "PUNCHIN_DEVICE_MISSING",
      });
    }

    if (punchInDeviceId !== punchOutDeviceId) {
      return res.status(403).json({
        error:
          "Device mismatch: you must punch out from the same device used to punch in.",
        code: "DEVICE_MISMATCH",
      });
    }

    const now = new Date();
    member.attendanceRecords[targetIndex].punchOut = now;
    // Punch-out confirms the shift was worked; keep status as work.
    member.attendanceRecords[targetIndex].status = "work";

    await member.save();
    const business = await Business.findById(req.user.businessId)
      .select("holidays")
      .lean();
    res.json(mapMember(member.toObject(), business?.holidays || []));
  } catch (err) {
    next(err);
  }
}

async function getLeaveRequests(req, res, next) {
  try {
    if (
      String(req.params.id) !== String(req.user.userId) &&
      !canManageStaff(req.user)
    ) {
      return res
        .status(403)
        .json({ error: "You can only view your own leave requests." });
    }

    const member = await User.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    })
      .select("leaveRequests")
      .lean();

    if (!member)
      return res.status(404).json({ error: "Staff member not found" });

    res.json({
      leaveRequests: (member.leaveRequests || [])
        .map(mapLeaveRequest)
        .sort(
          (a, b) =>
            new Date(b.requestedAt || b.startDate || 0).getTime() -
            new Date(a.requestedAt || a.startDate || 0).getTime(),
        ),
    });
  } catch (err) {
    next(err);
  }
}

async function getAllLeaveRequests(req, res, next) {
  try {
    const members = await User.find({ businessId: req.user.businessId })
      .select("name designation leaveRequests")
      .lean();

    const leaveRequests = members
      .flatMap((member) =>
        (member.leaveRequests || []).map((request) => ({
          ...mapLeaveRequest(request),
          staffId: member._id,
          staffName: member.name,
          staffDesignation: member.designation || "Employee",
        })),
      )
      .sort(
        (a, b) =>
          new Date(b.requestedAt || b.startDate || 0).getTime() -
          new Date(a.requestedAt || a.startDate || 0).getTime(),
      );

    res.json({ leaveRequests });
  } catch (err) {
    next(err);
  }
}

async function createLeaveRequest(req, res, next) {
  try {
    if (String(req.params.id) !== String(req.user.userId)) {
      return res
        .status(403)
        .json({ error: "You can only submit leave requests for yourself." });
    }

    const data = leaveRequestSchema.parse(req.body);
    const member = await User.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    });

    if (!member)
      return res.status(404).json({ error: "Staff member not found" });

    member.leaveRequests.push({
      startDate: data.startDate,
      endDate: data.endDate,
      leaveType: data.leaveType,
      reason: data.reason,
      status: "pending",
      requestedAt: new Date(),
    });

    await member.save();

    const created =
      member.leaveRequests[member.leaveRequests.length - 1]?.toObject?.() ||
      member.leaveRequests[member.leaveRequests.length - 1];

    res.status(201).json({
      leaveRequest: mapLeaveRequest(created),
      leaveRequests: member.leaveRequests
        .map(mapLeaveRequest)
        .sort(
          (a, b) =>
            new Date(b.requestedAt || b.startDate || 0).getTime() -
            new Date(a.requestedAt || a.startDate || 0).getTime(),
        ),
    });
  } catch (err) {
    next(err);
  }
}

async function reviewLeaveRequest(req, res, next) {
  try {
    const data = reviewLeaveRequestSchema.parse(req.body);
    const member = await User.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    });

    if (!member)
      return res.status(404).json({ error: "Staff member not found" });

    const leaveRequest = member.leaveRequests.id(req.params.requestId);
    if (!leaveRequest) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    const wasApproved = leaveRequest.status === "approved";
    const willApprove = data.status === "approved";

    leaveRequest.status = data.status;
    leaveRequest.managerNote = data.managerNote || "";
    leaveRequest.reviewedAt = new Date();
    leaveRequest.reviewedBy = req.user.userId;

    const leaveDays = getLeaveDays(
      leaveRequest.startDate,
      leaveRequest.endDate,
    );
    if (!wasApproved && willApprove) {
      member.leavesTaken = Number(member.leavesTaken || 0) + leaveDays;
    } else if (wasApproved && !willApprove) {
      member.leavesTaken = Math.max(
        0,
        Number(member.leavesTaken || 0) - leaveDays,
      );
    }

    await member.save();

    res.json({
      leaveRequest: mapLeaveRequest(leaveRequest),
      staff: mapMember(member.toObject()),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  punchIn,
  punchOut,
  getAllLeaveRequests,
  getLeaveRequests,
  createLeaveRequest,
  reviewLeaveRequest,
};

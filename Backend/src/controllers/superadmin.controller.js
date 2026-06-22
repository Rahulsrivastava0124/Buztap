const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Business = require("../models/Business");
const User = require("../models/User");
const Order = require("../models/Order");
const SuperAdmin = require("../models/SuperAdmin");
const EmailOtp = require("../models/EmailOtp");
const { sendOtpEmail } = require("../utils/mailer");

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── First-time setup (secret key → create profile) ───────────────────────
async function superadminSetup(req, res) {
  try {
    const { secretKey, name, email, password } = req.body;
    const expected = process.env.SUPER_ADMIN_KEY;

    if (!expected) {
      return res.status(500).json({ error: "SUPER_ADMIN_KEY not configured" });
    }
    if (!secretKey || secretKey !== expected) {
      return res.status(401).json({ error: "Invalid super admin key" });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Upsert: if a super admin already exists, overwrite. Otherwise create.
    const passwordHash = await bcrypt.hash(password, 10);
    const existing = await SuperAdmin.findOne();
    if (existing) {
      existing.name = name;
      existing.email = email.toLowerCase().trim();
      existing.passwordHash = passwordHash;
      await existing.save();
    } else {
      await SuperAdmin.create({ name, email: email.toLowerCase().trim(), passwordHash });
    }

    res.json({ success: true, message: "Super admin profile created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Check if profile exists ──────────────────────────────────────────────
async function superadminCheckProfile(req, res) {
  try {
    const admin = await SuperAdmin.findOne().select("name email").lean();
    res.json({ exists: !!admin, profile: admin || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Request OTP ──────────────────────────────────────────────────────────
async function superadminRequestOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await SuperAdmin.findOne({ email: normalizedEmail });
    if (!admin) {
      return res.status(404).json({ error: "No super admin account found with this email" });
    }

    const otp = generateOtpCode();
    const otpHash = await bcrypt.hash(otp, 6);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await EmailOtp.create({
      email: normalizedEmail,
      purpose: "login",
      otpHash,
      expiresAt,
    });

    // Send OTP email in background
    setImmediate(() => {
      sendOtpEmail({ to: normalizedEmail, otp, purpose: "login" }).catch((err) => {
        console.error(`Super admin OTP email failed for ${normalizedEmail}:`, err.message);
      });
    });

    res.json({ success: true, message: "OTP sent to your email", expiresInSeconds: OTP_EXPIRY_MINUTES * 60 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Verify OTP & Login ───────────────────────────────────────────────────
async function superadminVerifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    const normalizedEmail = email.toLowerCase().trim();

    // Verify super admin exists
    const admin = await SuperAdmin.findOne({ email: normalizedEmail });
    if (!admin) {
      return res.status(404).json({ error: "No super admin account found" });
    }

    // Find OTP
    const otpDoc = await EmailOtp.findOne({
      email: normalizedEmail,
      purpose: "login",
      usedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ error: "OTP expired or not found" });
    }
    if (otpDoc.attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(400).json({ error: "Too many attempts. Request a new OTP." });
    }

    const isValid = await bcrypt.compare(otp, otpDoc.otpHash);
    if (!isValid) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Mark OTP as used
    otpDoc.usedAt = new Date();
    await otpDoc.save();

    // Issue JWT
    const token = jwt.sign(
      { role: "superadmin", type: "superadmin", adminId: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    res.json({
      success: true,
      token,
      profile: { name: admin.name, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Legacy secret-key login (fallback) ───────────────────────────────────
async function superadminLogin(req, res) {
  try {
    const { secretKey } = req.body;
    const expected = process.env.SUPER_ADMIN_KEY;

    if (!expected) {
      return res.status(500).json({ error: "Super admin key not configured" });
    }
    if (!secretKey || secretKey !== expected) {
      return res.status(401).json({ error: "Invalid super admin key" });
    }

    const token = jwt.sign(
      { role: "superadmin", type: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Profile ──────────────────────────────────────────────────────────────
async function getProfile(req, res) {
  try {
    const admin = await SuperAdmin.findOne().select("name email createdAt updatedAt").lean();
    if (!admin) return res.status(404).json({ error: "No profile found. Complete setup first." });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const admin = await SuperAdmin.findOne();
    if (!admin) return res.status(404).json({ error: "No profile found" });

    if (name) admin.name = name.trim();
    if (email) admin.email = email.toLowerCase().trim();

    // Password change requires current password verification
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to set a new one" });
      }
      const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }
      admin.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();
    res.json({ success: true, profile: { name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Dashboard Stats ──────────────────────────────────────────────────────
async function superadminStats(req, res) {
  try {
    const totalBusinesses = await Business.countDocuments();
    const activeBusinesses = await Business.countDocuments({ isActive: true });
    const inactiveBusinesses = totalBusinesses - activeBusinesses;

    // Total orders & revenue across all businesses
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
        },
      },
    ]);

    const totalOrders = orderStats[0]?.totalOrders || 0;
    const totalRevenue = orderStats[0]?.totalRevenue || 0;

    // Total staff (all users)
    const totalStaff = await User.countDocuments();

    // Recent businesses (last 5)
    const recentBusinesses = await Business.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      totalBusinesses,
      activeBusinesses,
      inactiveBusinesses,
      totalOrders,
      totalRevenue,
      totalStaff,
      recentBusinesses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── List All Businesses ──────────────────────────────────────────────────
async function listBusinesses(req, res) {
  try {
    const { search, status, type } = req.query;

    const filter = {};
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;
    if (type === "restro" || type === "hotel") filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { subdomain: { $regex: search, $options: "i" } },
      ];
    }

    const businesses = await Business.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with owner info and counts
    const enriched = await Promise.all(
      businesses.map(async (biz) => {
        const admin = await User.findOne({
          businessId: biz._id,
          role: "admin",
        })
          .select("name email phone")
          .lean();

        const staffCount = await User.countDocuments({ businessId: biz._id });

        const orderAgg = await Order.aggregate([
          { $match: { businessId: biz._id } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: "$total" },
            },
          },
        ]);

        return {
          ...biz,
          owner: admin || null,
          staffCount,
          totalOrders: orderAgg[0]?.totalOrders || 0,
          totalRevenue: orderAgg[0]?.totalRevenue || 0,
        };
      }),
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Business Detail ──────────────────────────────────────────────────────
async function getBusinessDetail(req, res) {
  try {
    const { id } = req.params;
    const business = await Business.findById(id).lean();
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const staff = await User.find({ businessId: id })
      .select("name username role designation email phone isActive createdAt")
      .sort({ role: 1, name: 1 })
      .lean();

    const orderAgg = await Order.aggregate([
      { $match: { businessId: business._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
        },
      },
    ]);

    res.json({
      ...business,
      staff,
      totalOrders: orderAgg[0]?.totalOrders || 0,
      totalRevenue: orderAgg[0]?.totalRevenue || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Toggle Business Active ───────────────────────────────────────────────
async function toggleBusiness(req, res) {
  try {
    const { id } = req.params;
    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    business.isActive = !business.isActive;
    await business.save();

    res.json({
      success: true,
      isActive: business.isActive,
      message: business.isActive
        ? "Business activated"
        : "Business deactivated",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Advanced Features ────────────────────────────────────────────────────
const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");

async function getAnalyticsChart(req, res) {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const agg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(agg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTopRestaurants(req, res) {
  try {
    const top = await Order.aggregate([
      {
        $group: {
          _id: "$businessId",
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "businesses",
          localField: "_id",
          foreignField: "_id",
          as: "business",
        },
      },
      { $unwind: "$business" },
      {
        $project: {
          name: "$business.name",
          subdomain: "$business.subdomain",
          orders: 1,
          revenue: 1,
        },
      },
    ]);
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAuditLogs(req, res) {
  try {
    const { page = 1, limit = 50, method, status, search } = req.query;
    const filter = {};
    if (method) filter.method = method;
    if (status) filter.statusCode = Number(status);
    if (search) {
      filter.$or = [
        { path: { $regex: search, $options: "i" } },
        { ip: { $regex: search, $options: "i" } },
        { method: { $regex: search, $options: "i" } },
      ];
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("businessId", "name subdomain")
      .populate("userId", "name role")
      .lean();

    // Map fields to what frontend expects
    const mapped = logs.map((l) => ({
      _id: l._id,
      timestamp: l.createdAt,
      method: l.method,
      endpoint: l.path || l.originalUrl,
      ipAddress: l.ip,
      statusCode: l.statusCode,
      durationMs: l.durationMs,
      userId: l.userId?._id || l.userId,
      userName: l.userId?.name || null,
      businessId: l.businessId?._id || l.businessId,
      businessName: l.businessId?.name || null,
      role: l.role,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateBusinessDetails(req, res) {
  try {
    const { id } = req.params;
    const { plan, subdomain, email, phone } = req.body;

    const business = await Business.findById(id);
    if (!business) return res.status(404).json({ error: "Business not found" });

    // Validate subdomain uniqueness if changed
    if (subdomain && subdomain !== business.subdomain) {
      const existing = await Business.findOne({ subdomain });
      if (existing) return res.status(400).json({ error: "Subdomain already taken" });
      business.subdomain = subdomain;
    }

    if (plan) business.plan = plan;
    if (email) business.email = email;
    if (phone) business.phone = phone;

    await business.save();
    res.json({ success: true, business });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getSystemHealth(req, res) {
  try {
    const mem = process.memoryUsage();
    const dbState = ["disconnected", "connected", "connecting", "disconnecting"];
    
    res.json({
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rss: Math.round(mem.rss / 1024 / 1024), // MB
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      },
      database: {
        status: dbState[mongoose.connection.readyState] || "unknown",
        host: mongoose.connection.host,
      },
      nodeVersion: process.version,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  superadminSetup,
  superadminCheckProfile,
  superadminRequestOtp,
  superadminVerifyOtp,
  superadminLogin,
  getProfile,
  updateProfile,
  superadminStats,
  listBusinesses,
  getBusinessDetail,
  toggleBusiness,
  getAnalyticsChart,
  getTopRestaurants,
  getAuditLogs,
  updateBusinessDetails,
  getSystemHealth,
};

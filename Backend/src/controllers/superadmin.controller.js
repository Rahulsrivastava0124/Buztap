const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Business = require("../models/Business");
const User = require("../models/User");
const Order = require("../models/Order");
const SuperAdmin = require("../models/SuperAdmin");
const EmailOtp = require("../models/EmailOtp");
const { sendOtpEmail } = require("../utils/mailer");

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const OTP_EXPIRY_MINUTES = 10;
const OTP_HASH_ROUNDS = 12;

// ── Email/Password Login (via ENV) ─────────────────────────────────────────

async function requestSuperAdminOtp(req, res) {
  try {
    const { email, password } = req.body;
    const expectedEmail = process.env.SUPER_ADMIN_EMAIL;
    const expectedPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!expectedEmail || !expectedPassword) {
      return res.status(500).json({ error: "Super admin credentials not configured in ENV" });
    }
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (email.toLowerCase().trim() !== expectedEmail.toLowerCase().trim() || password !== expectedPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const normalizedEmail = expectedEmail.toLowerCase().trim();

    // Spam guard: 60-second cooldown
    const recentWindow = new Date(Date.now() - 60 * 1000);
    const recentOtp = await EmailOtp.findOne({
      email: normalizedEmail,
      purpose: "superadmin-login",
      createdAt: { $gte: recentWindow },
    }).lean();

    if (recentOtp) {
      const waitMs = 60000 - (Date.now() - new Date(recentOtp.createdAt).getTime());
      const retryAfterSeconds = Math.max(1, Math.ceil(waitMs / 1000));
      return res.status(429).json({
        error: "Please wait before requesting another OTP",
        retryAfterSeconds,
      });
    }

    const otp = generateOtpCode();
    const otpHash = await bcrypt.hash(otp, OTP_HASH_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await EmailOtp.create({
      email: normalizedEmail,
      purpose: "superadmin-login",
      otpHash,
      expiresAt,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`\n============================\n[DEV] OTP for ${normalizedEmail} (superadmin-login): ${otp}\n============================\n`);
    }

    setImmediate(() => {
      sendOtpEmail({ to: normalizedEmail, otp, purpose: "login" }).catch((err) => {
        console.error(`SuperAdmin OTP email send failed for ${normalizedEmail}:`, err.message);
      });
    });

    res.json({
      success: true,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function superadminLogin(req, res) {
  try {
    const { email, password, otp } = req.body;
    const expectedEmail = process.env.SUPER_ADMIN_EMAIL;
    const expectedPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!expectedEmail || !expectedPassword) {
      return res.status(500).json({ error: "Super admin credentials not configured in ENV" });
    }
    
    if (!email || !password || !otp) {
      return res.status(400).json({ error: "Email, password, and OTP are required" });
    }

    if (email.toLowerCase().trim() !== expectedEmail.toLowerCase().trim() || password !== expectedPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const normalizedEmail = expectedEmail.toLowerCase().trim();

    const otpDoc = await EmailOtp.findOne({
      email: normalizedEmail,
      purpose: "superadmin-login",
      usedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ error: "OTP expired or not found" });
    }

    if (otpDoc.attempts >= 5) {
      return res.status(400).json({ error: "OTP attempts exceeded" });
    }

    const isValid = await bcrypt.compare(otp, otpDoc.otpHash);
    if (!isValid) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    otpDoc.usedAt = new Date();
    await otpDoc.save();

    const token = jwt.sign(
      { role: "superadmin", type: "superadmin", adminId: "env-admin" },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      success: true,
      token,
      profile: { name: "Super Admin", email: expectedEmail },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Profile (Read-only from ENV) ─────────────────────────────────────────
async function getProfile(req, res) {
  try {
    const expectedEmail = process.env.SUPER_ADMIN_EMAIL || "admin@buztap.com";
    res.json({
      name: "Super Admin",
      email: expectedEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  return res.status(400).json({ error: "Profile updates are disabled. Managed via ENV variables." });
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

// ── Delete Business ──────────────────────────────────────────────────────
async function deleteBusiness(req, res) {
  try {
    const { id } = req.params;
    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Delete associated data (Optional but recommended)
    await User.deleteMany({ businessId: id });
    await Order.deleteMany({ businessId: id });
    
    await Business.findByIdAndDelete(id);

    res.json({ success: true, message: "Business deleted successfully" });
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
  superadminLogin,
  requestSuperAdminOtp,
  getProfile,
  updateProfile,
  superadminStats,
  listBusinesses,
  getBusinessDetail,
  toggleBusiness,
  deleteBusiness,
  getAnalyticsChart,
  getTopRestaurants,
  getAuditLogs,
  updateBusinessDetails,
  getSystemHealth,
};

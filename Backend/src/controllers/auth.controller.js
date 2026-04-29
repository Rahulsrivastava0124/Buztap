const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const Business = require("../models/Business");
const Table = require("../models/Table");
const EmailOtp = require("../models/EmailOtp");
const { addToBlacklist } = require("../middleware/tokenBlacklist");
const { sendOtpEmail } = require("../utils/mailer");

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function assertOtpVerifiedToken(token, expectedPurpose, expectedEmail) {
  if (!token) {
    throw new Error("Email OTP verification is required");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (
    decoded?.type !== "email-otp" ||
    decoded?.purpose !== expectedPurpose ||
    normalizeEmail(decoded?.email) !== normalizeEmail(expectedEmail)
  ) {
    throw new Error("Invalid OTP verification token");
  }
}

function slugifySubdomain(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function resolveBusinessSlug(business) {
  if (!business) return "";
  return business.subdomain || slugifySubdomain(business.name);
}

async function generateUniqueSubdomain(businessName) {
  const base = slugifySubdomain(businessName) || "buztap";
  let candidate = base;
  let suffix = 1;

  // Keep trying with numeric suffix until we find a free subdomain.
  while (await Business.exists({ subdomain: candidate })) {
    suffix += 1;
    candidate = `${base}-${suffix}`.slice(0, 48);
  }

  return candidate;
}

function buildInitialTables(businessId, tableCount) {
  return Array.from({ length: tableCount }, (_, index) => {
    const n = index + 1;
    const tableId = `T-${String(n).padStart(2, "0")}`;
    return {
      businessId,
      tableId,
      seats: 4,
      area: "Main Floor",
      status: "Free",
      guestName: null,
      guestPhone: null,
      isActive: true,
    };
  });
}

const otpRequestSchema = z.object({
  email: z.string().trim().email(),
  purpose: z.enum(["register", "login", "reset-password"]),
});

async function requestEmailOtp(req, res, next) {
  try {
    const { email, purpose } = otpRequestSchema.parse(req.body);
    const normalizedEmail = normalizeEmail(email);

    if (purpose === "reset-password") {
      const existingAccount = await User.findOne({
        email: normalizedEmail,
        role: "admin",
        isActive: true,
      })
        .select("_id")
        .lean();

      if (!existingAccount) {
        return res
          .status(404)
          .json({ error: "Account not found for this email" });
      }
    }

    // Basic spam guard for the same email+purpose.
    const recentWindow = new Date(Date.now() - 60 * 1000);
    const recentOtp = await EmailOtp.findOne({
      email: normalizedEmail,
      purpose,
      createdAt: { $gte: recentWindow },
    }).lean();

    if (recentOtp) {
      const waitMs =
        60000 - (Date.now() - new Date(recentOtp.createdAt).getTime());
      const retryAfterSeconds = Math.max(1, Math.ceil(waitMs / 1000));
      return res
        .status(429)
        .json({
          error: "Please wait before requesting another OTP",
          retryAfterSeconds,
        });
    }

    const otp = generateOtpCode();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await EmailOtp.create({
      email: normalizedEmail,
      purpose,
      otpHash,
      expiresAt,
    });

    await sendOtpEmail({
      to: normalizedEmail,
      otp,
      purpose,
    });

    res.json({
      success: true,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (err) {
    next(err);
  }
}

const otpVerifySchema = z.object({
  email: z.string().trim().email(),
  purpose: z.enum(["register", "login", "reset-password"]),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email(),
  otpToken: z.string().min(10),
  newPassword: z.string().min(6),
});

async function resetPassword(req, res, next) {
  try {
    const { email, otpToken, newPassword } = resetPasswordSchema.parse(
      req.body,
    );

    try {
      assertOtpVerifiedToken(otpToken, "reset-password", email);
    } catch {
      return res.status(400).json({ error: "Email OTP verification required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail, role: "admin" });
    if (!user) {
      return res
        .status(404)
        .json({ error: "Account not found for this email" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
}

async function verifyEmailOtp(req, res, next) {
  try {
    const { email, purpose, otp } = otpVerifySchema.parse(req.body);
    const normalizedEmail = normalizeEmail(email);

    const otpDoc = await EmailOtp.findOne({
      email: normalizedEmail,
      purpose,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ error: "OTP expired or not found" });
    }

    if (otpDoc.attempts >= OTP_MAX_ATTEMPTS) {
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

    const otpToken = jwt.sign(
      {
        type: "email-otp",
        purpose,
        email: normalizedEmail,
      },
      process.env.JWT_SECRET,
      { expiresIn: "20m" },
    );

    res.json({ success: true, otpToken });
  } catch (err) {
    next(err);
  }
}

const registerSchema = z.object({
  ownerName: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  password: z.string().min(6),
  businessName: z.string().trim().min(2).max(120),
  businessType: z.enum(["restro", "hotel"]).default("restro"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(240).optional().or(z.literal("")),
  tableCount: z.coerce.number().int().min(0).max(9999).default(0),
  otpToken: z.string().min(10),
});

async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    assertOtpVerifiedToken(data.otpToken, "register", data.email);

    // Check username uniqueness (across all businesses for simplicity)
    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const subdomain = await generateUniqueSubdomain(data.businessName);

    const business = await Business.create({
      name: data.businessName,
      type: data.businessType,
      email: data.email,
      phone: data.phone || "",
      address: data.address || "",
      subdomain,
      tableCount: data.tableCount,
      isActive: true,
    });

    if (data.tableCount > 0) {
      const initialTables = buildInitialTables(business._id, data.tableCount);
      await Table.insertMany(initialTables, { ordered: false });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      businessId: business._id,
      username: data.username,
      passwordHash,
      role: "admin",
      name: data.ownerName,
      email: data.email,
      isActive: true,
    });

    const token = jwt.sign(
      {
        sub: user._id,
        businessId: business._id,
        role: "admin",
        businessType: business.type,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    res.status(201).json({
      token,
      role: "admin",
      businessType: business.type,
      businessName: business.name,
      subdomain: business.subdomain || "",
      name: user.name,
      businessId: String(business._id),
    });
  } catch (err) {
    next(err);
  }
}

const loginSchema = z
  .object({
    identifier: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    phone: z.string().trim().min(1).optional(),
    password: z.string().min(1),
    businessId: z.string().optional(),
    otpToken: z.string().optional(),
  })
  .refine((data) => Boolean(data.identifier || data.email || data.phone), {
    message: "identifier/email/phone is required",
  });

const loginOtpRequestSchema = z
  .object({
    identifier: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    phone: z.string().trim().min(1).optional(),
    password: z.string().min(1),
    businessId: z.string().optional(),
  })
  .refine((data) => Boolean(data.identifier || data.email || data.phone), {
    message: "identifier/email/phone is required",
  });

async function requestLoginOtp(req, res, next) {
  try {
    const { identifier, email, phone, password, businessId } =
      loginOtpRequestSchema.parse(req.body);

    const cleanIdentifier = (identifier || email || phone || "").trim();
    const isEmail = /\S+@\S+\.\S+/.test(cleanIdentifier);
    const isPhone = /^[+\d][\d\s\-().]{4,}$/.test(cleanIdentifier);

    if (!isEmail && !isPhone) {
      return res.status(400).json({
        error: "Identifier must be a valid email or phone number",
      });
    }

    let user = null;

    if (isEmail) {
      const query = { email: cleanIdentifier.toLowerCase(), role: "admin" };
      if (businessId) query.businessId = businessId;
      user = await User.findOne(query).lean();
    } else {
      const normalizedInput = normalizePhone(cleanIdentifier);
      let business = await Business.findOne({ phone: cleanIdentifier }).lean();

      if (!business && normalizedInput) {
        const candidateQuery = { phone: { $exists: true, $ne: "" } };
        if (businessId) candidateQuery._id = businessId;

        const candidates = await Business.find(candidateQuery)
          .select("_id phone")
          .lean();

        business =
          candidates.find((row) => {
            const candidate = normalizePhone(row.phone);
            if (!candidate) return false;
            return (
              candidate === normalizedInput ||
              candidate.endsWith(normalizedInput) ||
              normalizedInput.endsWith(candidate)
            );
          }) || null;
      }

      if (
        businessId &&
        business &&
        String(business._id) !== String(businessId)
      ) {
        business = null;
      }

      if (business) {
        user = await User.findOne({
          businessId: business._id,
          role: "admin",
        }).lean();
      }
    }

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.isActive) {
      return res.status(403).json({ error: "Account disabled" });
    }

    const normalizedEmail = normalizeEmail(user.email);
    if (!normalizedEmail) {
      return res.status(400).json({ error: "No email found for this account" });
    }

    const recentWindow = new Date(Date.now() - 60 * 1000);
    const recentOtp = await EmailOtp.findOne({
      email: normalizedEmail,
      purpose: "login",
      createdAt: { $gte: recentWindow },
    }).lean();

    if (recentOtp) {
      const waitMs =
        60000 - (Date.now() - new Date(recentOtp.createdAt).getTime());
      const retryAfterSeconds = Math.max(1, Math.ceil(waitMs / 1000));
      return res
        .status(429)
        .json({
          error: "Please wait before requesting another OTP",
          retryAfterSeconds,
        });
    }

    const otp = generateOtpCode();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await EmailOtp.create({
      email: normalizedEmail,
      purpose: "login",
      otpHash,
      expiresAt,
    });

    await sendOtpEmail({
      to: normalizedEmail,
      otp,
      purpose: "login",
    });

    res.json({
      success: true,
      resolvedEmail: normalizedEmail,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, email, phone, password, businessId, otpToken } =
      loginSchema.parse(req.body);
    const cleanIdentifier = (identifier || email || phone || "").trim();

    // Allow login only with email or phone number
    const isEmail = /\S+@\S+\.\S+/.test(cleanIdentifier);
    const isPhone = /^[+\d][\d\s\-().]{4,}$/.test(cleanIdentifier);

    if (!isEmail && !isPhone) {
      return res.status(400).json({
        error: "Identifier must be a valid email or phone number",
      });
    }

    if (isEmail) {
      try {
        assertOtpVerifiedToken(otpToken, "login", cleanIdentifier);
      } catch {
        return res.status(400).json({
          error: "Email OTP verification required before login",
        });
      }
    }

    let user = null;
    let resolvedBusiness = null;

    if (isEmail) {
      const query = { email: cleanIdentifier.toLowerCase(), role: "admin" };
      if (businessId) query.businessId = businessId;
      user = await User.findOne(query).lean();
      if (user?.businessId) {
        resolvedBusiness = await Business.findById(user.businessId).lean();
      }
    } else {
      // Look up business by phone in a formatting-tolerant way
      const normalizedInput = normalizePhone(cleanIdentifier);
      let business = await Business.findOne({ phone: cleanIdentifier }).lean();

      if (!business && normalizedInput) {
        const candidateQuery = { phone: { $exists: true, $ne: "" } };
        if (businessId) candidateQuery._id = businessId;

        const candidates = await Business.find(candidateQuery)
          .select("_id phone")
          .lean();

        business =
          candidates.find((row) => {
            const candidate = normalizePhone(row.phone);
            if (!candidate) return false;
            return (
              candidate === normalizedInput ||
              candidate.endsWith(normalizedInput) ||
              normalizedInput.endsWith(candidate)
            );
          }) || null;
      }

      if (
        businessId &&
        business &&
        String(business._id) !== String(businessId)
      ) {
        business = null;
      }

      if (business) {
        resolvedBusiness = business;
        user = await User.findOne({
          businessId: business._id,
          role: "admin",
        }).lean();
      }
    }

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Require OTP for phone logins (verified against the user's registered email)
    if (isPhone) {
      try {
        assertOtpVerifiedToken(otpToken, "login", user.email);
      } catch {
        return res
          .status(400)
          .json({ error: "Email OTP verification required before login" });
      }
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.isActive)
      return res.status(403).json({ error: "Account disabled" });

    const business =
      resolvedBusiness || (await Business.findById(user.businessId).lean());

    const token = jwt.sign(
      {
        sub: user._id,
        businessId: user.businessId,
        role: user.role,
        businessType: business?.type ?? "restro",
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    res.json({
      token,
      role: user.role,
      businessType: business?.type ?? "restro",
      businessName: business?.name ?? "",
      subdomain: resolveBusinessSlug(business),
      name: user.name,
      businessId: String(user.businessId),
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  try {
    const business = await Business.findById(req.user.businessId).lean();
    const user = await User.findById(req.user.userId).select("name").lean();
    res.json({
      ...req.user,
      businessName: business?.name ?? "",
      subdomain: resolveBusinessSlug(business),
      name: user?.name ?? "",
    });
  } catch {
    res.json(req.user);
  }
}

const phoneOtpRequestSchema = z.object({
  phone: z.string().trim().min(5),
});

async function requestPhoneLoginOtp(req, res, next) {
  try {
    const { phone } = phoneOtpRequestSchema.parse(req.body);
    const normalizedInput = normalizePhone(phone);

    let business = await Business.findOne({ phone }).lean();
    if (!business && normalizedInput) {
      const candidates = await Business.find({
        phone: { $exists: true, $ne: "" },
      })
        .select("_id phone")
        .lean();
      business =
        candidates.find((row) => {
          const c = normalizePhone(row.phone);
          if (!c) return false;
          return (
            c === normalizedInput ||
            c.endsWith(normalizedInput) ||
            normalizedInput.endsWith(c)
          );
        }) || null;
    }

    if (!business) {
      return res
        .status(404)
        .json({ error: "No account found for this phone number" });
    }

    const user = await User.findOne({
      businessId: business._id,
      role: "admin",
    }).lean();
    if (!user?.email) {
      return res
        .status(404)
        .json({ error: "No account found for this phone number" });
    }

    const normalizedEmail = normalizeEmail(user.email);

    const recentWindow = new Date(Date.now() - 60 * 1000);
    const recentOtp = await EmailOtp.findOne({
      email: normalizedEmail,
      purpose: "login",
      createdAt: { $gte: recentWindow },
    }).lean();

    if (recentOtp) {
      const waitMs =
        60000 - (Date.now() - new Date(recentOtp.createdAt).getTime());
      const retryAfterSeconds = Math.max(1, Math.ceil(waitMs / 1000));
      return res
        .status(429)
        .json({
          error: "Please wait before requesting another OTP",
          retryAfterSeconds,
        });
    }

    const otp = generateOtpCode();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await EmailOtp.create({
      email: normalizedEmail,
      purpose: "login",
      otpHash,
      expiresAt,
    });
    await sendOtpEmail({ to: normalizedEmail, otp, purpose: "login" });

    res.json({
      success: true,
      resolvedEmail: normalizedEmail,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  if (req.token && req.tokenExp) {
    addToBlacklist(req.token, req.tokenExp);
  }
  res.json({ success: true });
}

module.exports = {
  requestEmailOtp,
  requestLoginOtp,
  requestPhoneLoginOtp,
  verifyEmailOtp,
  resetPassword,
  register,
  login,
  me,
  logout,
};

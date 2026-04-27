const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const Business = require("../models/Business");
const Table = require("../models/Table");
const { addToBlacklist } = require("../middleware/tokenBlacklist");

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
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
});

async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);

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
  })
  .refine((data) => Boolean(data.identifier || data.email || data.phone), {
    message: "identifier/email/phone is required",
  });

async function login(req, res, next) {
  try {
    const { identifier, email, phone, password, businessId } =
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

async function logout(req, res) {
  if (req.token && req.tokenExp) {
    addToBlacklist(req.token, req.tokenExp);
  }
  res.json({ success: true });
}

module.exports = { register, login, me, logout };

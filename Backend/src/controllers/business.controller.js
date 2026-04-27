const { z } = require("zod");
const Business = require("../models/Business");
const Table = require("../models/Table");

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const socialLinksSchema = z.object({
  instagram: z.string().trim().url().optional().or(z.literal("")),
  facebook: z.string().trim().url().optional().or(z.literal("")),
  x: z.string().trim().url().optional().or(z.literal("")),
  googleReview: z.string().trim().url().optional().or(z.literal("")),
});

const updateBusinessSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(240).optional().or(z.literal("")),
  subdomain: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .optional()
    .or(z.literal("")),
  branches: z.coerce.number().int().min(1).max(999).optional(),
  tableCount: z.coerce.number().int().min(0).max(9999).optional(),
  socialLinks: socialLinksSchema.optional(),
});

function mapBusinessProfile(business) {
  return {
    id: String(business._id),
    name: business.name || "",
    type: business.type || "restro",
    email: business.email || "",
    phone: business.phone || "",
    address: business.address || "",
    socialLinks: {
      instagram: business.socialLinks?.instagram || "",
      facebook: business.socialLinks?.facebook || "",
      x: business.socialLinks?.x || "",
      googleReview: business.socialLinks?.googleReview || "",
    },
    plan: business.plan || "free",
    subdomain: business.subdomain || slugify(business.name),
    branches: Number(business.branches || 1),
    tableCount: Number(business.tableCount ?? 0),
    isActive: Boolean(business.isActive),
  };
}

async function ensureTableRecords(businessId, targetCount) {
  if (targetCount <= 0) return;

  const allTables = await Table.find({ businessId })
    .select("tableId isActive")
    .lean();

  const activeCount = allTables.filter((row) => row.isActive !== false).length;
  const missing = targetCount - activeCount;
  if (missing <= 0) return;

  const usedIds = new Set(
    allTables
      .map((row) => Number(String(row.tableId || "").replace(/\D/g, "")))
      .filter((n) => Number.isFinite(n) && n > 0),
  );

  const newRows = [];
  let pointer = 1;
  while (newRows.length < missing) {
    if (!usedIds.has(pointer)) {
      usedIds.add(pointer);
      newRows.push({
        businessId,
        tableId: `T-${String(pointer).padStart(2, "0")}`,
        seats: 4,
        area: "Main Floor",
        status: "Free",
        guestName: null,
        guestPhone: null,
        isActive: true,
      });
    }
    pointer += 1;
  }

  if (newRows.length > 0) {
    await Table.insertMany(newRows, { ordered: false });
  }
}

async function getBusinessProfile(req, res, next) {
  try {
    const business = await Business.findById(req.user.businessId).lean();
    if (!business) {
      return res.status(404).json({ error: "Business profile not found" });
    }
    res.json(mapBusinessProfile(business));
  } catch (err) {
    next(err);
  }
}

async function updateBusinessProfile(req, res, next) {
  try {
    const payload = updateBusinessSchema.parse(req.body);
    const updated = await Business.findOneAndUpdate(
      { _id: req.user.businessId },
      {
        $set: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone || "",
          address: payload.address || "",
          ...(payload.socialLinks
            ? {
                socialLinks: {
                  instagram: payload.socialLinks.instagram || "",
                  facebook: payload.socialLinks.facebook || "",
                  x: payload.socialLinks.x || "",
                  googleReview: payload.socialLinks.googleReview || "",
                },
              }
            : {}),
          subdomain: payload.subdomain || slugify(payload.name),
          ...(payload.branches ? { branches: payload.branches } : {}),
          ...(payload.tableCount !== undefined
            ? { tableCount: payload.tableCount }
            : {}),
        },
      },
      { new: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: "Business profile not found" });
    }

    if (payload.tableCount !== undefined) {
      await ensureTableRecords(req.user.businessId, payload.tableCount);
    }

    res.json(mapBusinessProfile(updated));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBusinessProfile,
  updateBusinessProfile,
};

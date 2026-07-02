const { z } = require("zod");
const Business = require("../models/Business");
const Table = require("../models/Table");
const { normalizeHolidayList } = require("../utils/attendance");

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

const holidaySchema = z.object({
  date: z.coerce.date(),
  name: z.string().trim().max(120).optional().or(z.literal("")),
});

const updateBusinessSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().optional(),
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
    gstPct: z.coerce.number().min(0).max(100).optional(),
    taxPct: z.coerce.number().min(0).max(100).optional(),
    gstNo: z.string().trim().max(30).optional().or(z.literal("")),
    restroUpi: z.string().trim().max(120).optional().or(z.literal("")),
    socialLinks: socialLinksSchema.optional(),
    headerImage: z.string().trim().url().optional().or(z.literal("")),
    logoImage: z.string().trim().url().optional().or(z.literal("")),
    holidays: z.array(holidaySchema).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
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
    gstPct: Number(business.gstPct ?? 5),
    taxPct: Number(business.taxPct ?? 0),
    gstNo: business.gstNo || "",
    restroUpi: business.restroUpi || "",
    headerImage: business.headerImage || "",
    logoImage: business.logoImage || "",
    holidays: normalizeHolidayList(business.holidays || []),
    isActive: Boolean(business.isActive),
  };
}

async function ensureTableRecords(businessId, targetCount) {
  if (targetCount < 0) return;

  const allTables = await Table.find({ businessId })
    .select("_id tableId isActive")
    .lean();

  const tableNo = (tableId) => {
    const n = Number(String(tableId || "").replace(/\D/g, ""));
    return Number.isFinite(n) && n > 0 ? n : Number.MAX_SAFE_INTEGER;
  };

  const activeTables = allTables
    .filter((row) => row.isActive !== false)
    .sort((a, b) => tableNo(a.tableId) - tableNo(b.tableId));
  const inactiveTables = allTables
    .filter((row) => row.isActive === false)
    .sort((a, b) => tableNo(a.tableId) - tableNo(b.tableId));

  const activeCount = activeTables.length;

  if (activeCount > targetCount) {
    const toDeactivate = activeTables
      .slice(targetCount)
      .map((row) => row._id)
      .filter(Boolean);
    if (toDeactivate.length > 0) {
      await Table.updateMany(
        { _id: { $in: toDeactivate } },
        {
          $set: {
            isActive: false,
            status: "Free",
            guestName: null,
            guestPhone: null,
          },
        },
      );
    }
    return;
  }

  let missing = targetCount - activeCount;
  if (missing <= 0) return;

  const toReactivate = inactiveTables
    .slice(0, missing)
    .map((row) => row._id)
    .filter(Boolean);

  if (toReactivate.length > 0) {
    await Table.updateMany(
      { _id: { $in: toReactivate } },
      {
        $set: {
          isActive: true,
          status: "Free",
          guestName: null,
          guestPhone: null,
        },
      },
    );
    missing -= toReactivate.length;
  }

  if (missing <= 0) return;

  const usedIds = new Set(
    allTables
      .map((row) => tableNo(row.tableId))
      .filter((n) => n < Number.MAX_SAFE_INTEGER),
  );

  const newRows = [];
  let pointer = 1;
  while (newRows.length < missing) {
    if (!usedIds.has(pointer)) {
      usedIds.add(pointer);
      newRows.push({
        businessId,
        tableId: `Main Floor-${pointer}`,
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

async function getPublicHeaderImage(req, res, next) {
  try {
    const restro = String(req.query.restro || "").trim();
    const biz = String(req.query.biz || req.query.businessId || "").trim();

    let business = null;
    if (biz) {
      business = await Business.findById(biz)
        .select("_id name subdomain headerImage logoImage")
        .lean();
    } else if (restro) {
      business = await Business.findOne({ subdomain: restro })
        .select("_id name subdomain headerImage logoImage")
        .lean();
    }

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    res.set("Cache-Control", "public, max-age=30");
    res.json({
      businessId: String(business._id),
      name: business.name || "",
      subdomain: business.subdomain || "",
      headerImage: business.headerImage || "",
      logoImage: business.logoImage || "",
    });
  } catch (err) {
    next(err);
  }
}

async function updateBusinessProfile(req, res, next) {
  try {
    const payload = updateBusinessSchema.parse(req.body);
    const updateSet = {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.email !== undefined ? { email: payload.email } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone || "" } : {}),
      ...(payload.address !== undefined
        ? { address: payload.address || "" }
        : {}),
      ...(payload.branches !== undefined ? { branches: payload.branches } : {}),
      ...(payload.tableCount !== undefined
        ? { tableCount: payload.tableCount }
        : {}),
      ...(payload.gstPct !== undefined ? { gstPct: payload.gstPct } : {}),
      ...(payload.taxPct !== undefined ? { taxPct: payload.taxPct } : {}),
      ...(payload.gstNo !== undefined ? { gstNo: payload.gstNo || "" } : {}),
      ...(payload.restroUpi !== undefined
        ? { restroUpi: payload.restroUpi || "" }
        : {}),
      ...(payload.headerImage !== undefined
        ? { headerImage: payload.headerImage }
        : {}),
      ...(payload.logoImage !== undefined
        ? { logoImage: payload.logoImage }
        : {}),
      ...(payload.holidays !== undefined
        ? { holidays: normalizeHolidayList(payload.holidays) }
        : {}),
    };

    if (payload.socialLinks) {
      if (payload.socialLinks.instagram !== undefined) {
        updateSet["socialLinks.instagram"] =
          payload.socialLinks.instagram || "";
      }
      if (payload.socialLinks.facebook !== undefined) {
        updateSet["socialLinks.facebook"] = payload.socialLinks.facebook || "";
      }
      if (payload.socialLinks.x !== undefined) {
        updateSet["socialLinks.x"] = payload.socialLinks.x || "";
      }
      if (payload.socialLinks.googleReview !== undefined) {
        updateSet["socialLinks.googleReview"] =
          payload.socialLinks.googleReview || "";
      }
    }

    if (payload.subdomain !== undefined) {
      updateSet.subdomain = payload.subdomain || slugify(payload.name || "");
    } else if (payload.name !== undefined) {
      updateSet.subdomain = slugify(payload.name);
    }

    const updated = await Business.findOneAndUpdate(
      { _id: req.user.businessId },
      {
        $set: updateSet,
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
  getPublicHeaderImage,
  updateBusinessProfile,
};

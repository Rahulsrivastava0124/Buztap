const { z } = require("zod");
const Offer = require("../models/Offer");
const Business = require("../models/Business");

const OFFER_TYPES = ["coupon", "festival", "category", "item"];
const OFFER_AUDIENCES = ["all", "new", "returning"];

const optionalExpiryDate = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return new Date(value);
}, z.date().nullable().optional());

const createOfferSchema = z.object({
  title: z.string().trim().min(2).max(80),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,20}$/),
  description: z.string().trim().max(180).optional().or(z.literal("")),
  offerType: z.enum(OFFER_TYPES).optional(),
  audience: z.enum(OFFER_AUDIENCES).optional(),
  discountPct: z.coerce.number().min(1).max(90),
  minSubtotal: z.coerce.number().min(0).max(100000).optional(),
  targetCategory: z.string().trim().max(80).optional().or(z.literal("")),
  targetItemIds: z.array(z.string().trim().min(1).max(100)).optional(),
  expiresAt: optionalExpiryDate,
  isVisible: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const updateOfferSchema = z
  .object({
    title: z.string().trim().min(2).max(80).optional(),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,20}$/)
      .optional(),
    description: z.string().trim().max(180).optional().or(z.literal("")),
    offerType: z.enum(OFFER_TYPES).optional(),
    audience: z.enum(OFFER_AUDIENCES).optional(),
    discountPct: z.coerce.number().min(1).max(90).optional(),
    minSubtotal: z.coerce.number().min(0).max(100000).optional(),
    targetCategory: z.string().trim().max(80).optional().or(z.literal("")),
    targetItemIds: z.array(z.string().trim().min(1).max(100)).optional(),
    expiresAt: optionalExpiryDate,
    isVisible: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

function normalizeOfferPayload(payload, { partial = false } = {}) {
  const normalized = { ...payload };

  if (!partial || payload.offerType !== undefined) {
    normalized.offerType = payload.offerType || "coupon";
  }

  if (!partial || payload.audience !== undefined) {
    normalized.audience = payload.audience || "all";
  }

  if (!partial || payload.targetCategory !== undefined) {
    normalized.targetCategory = String(payload.targetCategory || "").trim();
  }

  if (!partial || payload.targetItemIds !== undefined) {
    const targetIds = Array.isArray(payload.targetItemIds)
      ? payload.targetItemIds
      : [];
    normalized.targetItemIds = Array.from(
      new Set(targetIds.map((id) => String(id || "").trim()).filter(Boolean)),
    );
  }

  if (!partial) {
    if (normalized.offerType !== "category") normalized.targetCategory = "";
    if (normalized.offerType !== "item") normalized.targetItemIds = [];
  } else if (payload.offerType !== undefined) {
    if (normalized.offerType !== "category") normalized.targetCategory = "";
    if (normalized.offerType !== "item") normalized.targetItemIds = [];
  }

  return normalized;
}

function validateOfferTargeting(payload) {
  const offerType = payload.offerType || "coupon";
  if (offerType === "category" && !payload.targetCategory) {
    const err = new Error("Category is required for category offers");
    err.status = 400;
    throw err;
  }
  if (
    offerType === "item" &&
    (!Array.isArray(payload.targetItemIds) ||
      payload.targetItemIds.length === 0)
  ) {
    const err = new Error("At least one menu item is required for item offers");
    err.status = 400;
    throw err;
  }
}

function mapOffer(offer) {
  return {
    id: String(offer._id),
    title: offer.title || "",
    code: offer.code || "",
    description: offer.description || "",
    offerType: offer.offerType || "coupon",
    audience: offer.audience || "all",
    discountPct: Number(offer.discountPct || 0),
    minSubtotal: Number(offer.minSubtotal || 0),
    targetCategory: offer.targetCategory || "",
    targetItemIds: Array.isArray(offer.targetItemIds)
      ? offer.targetItemIds.map((id) => String(id))
      : [],
    expiresAt: offer.expiresAt || null,
    isVisible: Boolean(offer.isVisible),
    isActive: Boolean(offer.isActive),
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
  };
}

async function getAll(req, res, next) {
  try {
    const offers = await Offer.find({ businessId: req.user.businessId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(offers.map(mapOffer));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const rawPayload = createOfferSchema.parse(req.body);
    const payload = normalizeOfferPayload(rawPayload);
    validateOfferTargeting(payload);

    const offer = await Offer.create({
      businessId: req.user.businessId,
      title: payload.title,
      code: payload.code,
      description: payload.description || "",
      offerType: payload.offerType || "coupon",
      audience: payload.audience || "all",
      discountPct: payload.discountPct,
      minSubtotal: payload.minSubtotal || 0,
      targetCategory: payload.targetCategory || "",
      targetItemIds: payload.targetItemIds || [],
      expiresAt: payload.expiresAt || null,
      isVisible: payload.isVisible !== false,
      isActive: payload.isActive !== false,
    });

    res.status(201).json(mapOffer(offer));
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const patchPayload = updateOfferSchema.parse(req.body);
    const existingOffer = await Offer.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    }).lean();

    if (!existingOffer)
      return res.status(404).json({ error: "Offer not found" });

    const normalizedPatch = normalizeOfferPayload(patchPayload, {
      partial: true,
    });
    const mergedOffer = normalizeOfferPayload({
      ...existingOffer,
      ...normalizedPatch,
    });
    validateOfferTargeting(mergedOffer);

    const updatedOffer = await Offer.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { $set: normalizedPatch },
      { new: true },
    ).lean();

    if (!updatedOffer)
      return res.status(404).json({ error: "Offer not found" });
    res.json(mapOffer(updatedOffer));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const offer = await Offer.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user.businessId,
    }).lean();

    if (!offer) return res.status(404).json({ error: "Offer not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function getPublicOffers(req, res, next) {
  try {
    const restro = String(req.query.restro || "").trim();
    const biz = String(req.query.biz || req.query.businessId || "").trim();

    let businessId = biz;
    if (!businessId && restro) {
      const business = await Business.findOne({ subdomain: restro })
        .select("_id")
        .lean();
      businessId = business?._id ? String(business._id) : "";
    }

    if (!businessId) return res.json([]);

    const offers = await Offer.find({
      businessId,
      isActive: true,
      isVisible: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    res.set("Cache-Control", "public, max-age=30");
    res.json(offers.map(mapOffer));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  create,
  update,
  remove,
  getPublicOffers,
};

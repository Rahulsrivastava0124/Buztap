const { z } = require("zod");
const Offer = require("../models/Offer");
const Business = require("../models/Business");

const createOfferSchema = z.object({
  title: z.string().trim().min(2).max(80),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,20}$/),
  description: z.string().trim().max(180).optional().or(z.literal("")),
  discountPct: z.coerce.number().min(1).max(90),
  minSubtotal: z.coerce.number().min(0).max(100000).optional(),
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
    discountPct: z.coerce.number().min(1).max(90).optional(),
    minSubtotal: z.coerce.number().min(0).max(100000).optional(),
    isVisible: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

function mapOffer(offer) {
  return {
    id: String(offer._id),
    title: offer.title || "",
    code: offer.code || "",
    description: offer.description || "",
    discountPct: Number(offer.discountPct || 0),
    minSubtotal: Number(offer.minSubtotal || 0),
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
    const payload = createOfferSchema.parse(req.body);
    const offer = await Offer.create({
      businessId: req.user.businessId,
      title: payload.title,
      code: payload.code,
      description: payload.description || "",
      discountPct: payload.discountPct,
      minSubtotal: payload.minSubtotal || 0,
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
    const payload = updateOfferSchema.parse(req.body);
    const offer = await Offer.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { $set: payload },
      { new: true },
    ).lean();

    if (!offer) return res.status(404).json({ error: "Offer not found" });
    res.json(mapOffer(offer));
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

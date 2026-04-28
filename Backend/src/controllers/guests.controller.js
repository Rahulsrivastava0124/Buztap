const { z } = require("zod");
const Guest = require("../models/Guest");
const Order = require("../models/Order");
const Table = require("../models/Table");
const Business = require("../models/Business");

const GST_RATE = 0.05;

function buildTableIdCandidates(rawTableId) {
  const value = String(rawTableId || "").trim();
  if (!value) return [];

  const set = new Set([value]);
  const digits = value.replace(/\D/g, "");
  if (digits) {
    const n = Number(digits);
    if (Number.isFinite(n) && n > 0) {
      const plain = String(n);
      const padded = String(n).padStart(2, "0");
      set.add(plain);
      set.add(padded);
      set.add(`T-${plain}`);
      set.add(`T-${padded}`);
    }
  }

  return Array.from(set);
}

const registerSchema = z.object({
  phone: z.string().min(10),
  name: z.string().min(1),
  email: z.string().email().optional(),
  businessId: z.string().min(1).optional(),
  tableId: z.string().min(1).optional(),
  source: z.enum(["QR", "POS"]).optional(),
});

const guestOrderSchema = z.object({
  businessId: z.string().min(1),
  tableId: z.string().optional(),
  guestName: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().optional(),
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
        notes: z.string().optional(),
      }),
    )
    .min(1),
  orderType: z.enum(["Dine-in", "Takeaway", "Delivery"]).optional(),
  paymentMethod: z.enum(["Cash", "Card/UPI", "Pending"]).optional(),
});

async function resolveScopedBusinessId(req, fallbackBusinessId = "") {
  const bizParam = String(
    req.query.biz || req.query.businessId || fallbackBusinessId || "",
  ).trim();
  if (bizParam) return bizParam;

  const restroParam = String(req.query.restro || req.query.slug || "").trim();
  if (!restroParam) return "";

  const business = await Business.findOne({ subdomain: restroParam })
    .select("_id")
    .lean();

  return business?._id ? String(business._id) : "";
}

async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const scopedBusinessId = await resolveScopedBusinessId(
      req,
      data.businessId || "",
    );
    const now = new Date();
    const guest = await Guest.findOneAndUpdate(
      { phone: data.phone },
      {
        $setOnInsert: {
          phone: data.phone,
          firstSeenAt: now,
          visitCount: 1,
        },
        $set: {
          name: data.name,
          ...(data.email ? { email: data.email } : {}),
          ...(scopedBusinessId ? { businessId: scopedBusinessId } : {}),
          ...(data.tableId ? { lastTableId: data.tableId } : {}),
          lastSource: data.source || "QR",
          lastSeenAt: now,
        },
        $inc: {
          qrLoginCount: data.source === "POS" ? 0 : 1,
        },
      },
      { upsert: true, new: true },
    );
    res.json({ guestId: guest._id, phone: guest.phone, name: guest.name });
  } catch (err) {
    next(err);
  }
}

async function getOrders(req, res, next) {
  try {
    const scopedBusinessId = await resolveScopedBusinessId(req);
    if (!scopedBusinessId) {
      return res
        .status(400)
        .json({ error: "biz or restro query parameter is required" });
    }

    const guest = await Guest.findOne({ phone: req.params.phone }).lean();
    if (!guest) return res.status(404).json({ error: "Guest not found" });

    const orders = await Order.find({
      guestPhone: req.params.phone,
      businessId: scopedBusinessId,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function placeOrder(req, res, next) {
  try {
    const data = guestOrderSchema.parse(req.body);
    const scopedBusinessId = await resolveScopedBusinessId(
      req,
      data.businessId,
    );
    if (!scopedBusinessId) {
      return res
        .status(400)
        .json({ error: "biz or restro query parameter is required" });
    }
    if (String(scopedBusinessId) !== String(data.businessId)) {
      return res
        .status(400)
        .json({ error: "business mismatch between URL and payload" });
    }

    const requestedGuestName = String(data.guestName || "").trim();

    let resolvedGuestName = requestedGuestName;
    if (!resolvedGuestName) {
      const guestProfile = await Guest.findOne({ phone: req.params.phone })
        .select("name")
        .lean();
      resolvedGuestName =
        String(guestProfile?.name || "Guest").trim() || "Guest";
    }

    const items = data.items.map((i) => ({
      ...i,
      total: i.price * i.quantity,
      preparationStatus: "Pending",
    }));
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const tax = Math.round(subtotal * GST_RATE);
    const total = subtotal + tax;

    const order = await Order.create({
      businessId: scopedBusinessId,
      tableId: data.tableId || null,
      guestName: resolvedGuestName,
      guestPhone: req.params.phone,
      orderType: data.orderType || "Dine-in",
      source: "QR",
      status: "Pending",
      items,
      subtotal,
      discount: 0,
      taxableAmount: subtotal,
      tax,
      total,
      paymentMethod: data.paymentMethod || "Pending",
      kitchenTicketId: `#K-${String(Date.now()).slice(-4)}`,
    });

    if (data.tableId) {
      const tableIdCandidates = buildTableIdCandidates(data.tableId);
      await Table.findOneAndUpdate(
        {
          businessId: scopedBusinessId,
          tableId: { $in: tableIdCandidates },
        },
        {
          $set: {
            status: "Occupied",
            guestName: resolvedGuestName,
            guestPhone: req.params.phone,
          },
        },
      );
    }

    // Update guest stats
    await Guest.findOneAndUpdate(
      { phone: req.params.phone },
      {
        $push: { orderHistory: order._id },
        $inc: { visitCount: 1, totalSpent: total },
        $set: { lastOrderDate: new Date() },
      },
    );

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, getOrders, placeOrder };

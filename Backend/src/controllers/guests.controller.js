const { z } = require("zod");
const Guest = require("../models/Guest");
const Order = require("../models/Order");
const Table = require("../models/Table");
const Business = require("../models/Business");

const GST_RATE = 0.05;

/**
 * Canonical phone format: +91XXXXXXXXXX
 * Accepts 10-digit, +91-prefixed, or 91-prefixed inputs.
 * Returns null for anything that doesn't resolve to 10 digits.
 */
function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const last10 = digits.slice(-10);
  if (last10.length !== 10) return null;
  return `+91${last10}`;
}

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
        portion: z.string().optional(),
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
    const phone = normalizePhone(data.phone);
    if (!phone) return res.status(400).json({ error: "Invalid phone number" });
    const scopedBusinessId = await resolveScopedBusinessId(
      req,
      data.businessId || "",
    );
    const now = new Date();
    const guest = await Guest.findOneAndUpdate(
      { phone },
      {
        $setOnInsert: {
          phone,
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

    const phone = normalizePhone(req.params.phone);
    if (!phone) return res.status(400).json({ error: "Invalid phone number" });

    const last10 = phone.slice(-10);
    const phoneRegex = new RegExp(`(?:\\+?91[\\s-]*)?${last10}$`);
    const phoneCandidates = [phone, `91${last10}`, last10];

    const orders = await Order.find({
      businessId: scopedBusinessId,
      $or: [
        { guestPhone: { $in: phoneCandidates } },
        { guestPhone: { $regex: phoneRegex } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function lookupGuest(req, res, next) {
  try {
    const rawPhone = String(req.query.phone || "").trim();
    if (!rawPhone) return res.status(400).json({ error: "phone is required" });

    const phone = normalizePhone(rawPhone);
    if (!phone) return res.status(400).json({ error: "Invalid phone number" });

    const last10 = phone.slice(-10);
    const phoneCandidates = [phone, `91${last10}`, last10];

    const guest = await Guest.findOne({ phone }).lean();

    // Determine if the stored name is a real name or a placeholder
    const isPlaceholder =
      !guest?.name || guest.name.trim().toLowerCase() === "guest";

    let resolvedName = isPlaceholder ? null : guest.name.trim();

    // Fall back to most recent order with a real name for this phone
    if (!resolvedName) {
      const recentOrder = await Order.findOne({
        guestPhone: { $in: phoneCandidates },
        guestName: { $exists: true, $ne: null, $nin: ["", "Guest", "guest"] },
      })
        .sort({ createdAt: -1 })
        .select("guestName")
        .lean();

      if (recentOrder?.guestName) {
        resolvedName = recentOrder.guestName.trim();

        // Repair the Guest record so future lookups return the real name directly
        if (guest) {
          await Guest.updateOne({ phone }, { $set: { name: resolvedName } });
        }
      }
    }

    if (!resolvedName) {
      return res.status(404).json({ error: "Guest not found" });
    }

    res.json({ name: resolvedName, phone });
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

    const guestPhone = normalizePhone(req.params.phone);
    if (!guestPhone) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    let resolvedGuestName = requestedGuestName;
    if (!resolvedGuestName) {
      const guestProfile = await Guest.findOne({ phone: guestPhone })
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
      guestPhone,
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
            guestPhone,
          },
        },
      );
    }

    // Update guest stats
    await Guest.findOneAndUpdate(
      { phone: guestPhone },
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

module.exports = { register, getOrders, placeOrder, lookupGuest };

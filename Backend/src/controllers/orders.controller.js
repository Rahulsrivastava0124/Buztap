const { z } = require("zod");
const Order = require("../models/Order");
const Table = require("../models/Table");
const Business = require("../models/Business");

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

/**
 * Sync table status after an order status change.
 * Called after Order.findOneAndUpdate completes.
 */
async function syncTableStatus(order, newStatus) {
  if (!order?.tableId || !order?.businessId) return;

  const { tableId, businessId, guestName, guestPhone } = order;
  const tableIdCandidates = buildTableIdCandidates(tableId);
  if (tableIdCandidates.length === 0) return;

  // If any active order exists on this table, table must stay occupied.
  const activeOrders = await Order.find({
    businessId,
    tableId: { $in: tableIdCandidates },
    status: { $in: ["Pending", "Preparing", "Ready"] },
  })
    .sort({ createdAt: -1 })
    .select("guestName guestPhone")
    .lean();

  if (activeOrders.length > 0) {
    const latestWithGuest =
      activeOrders.find((o) => o.guestName || o.guestPhone) || activeOrders[0];
    await Table.findOneAndUpdate(
      { tableId: { $in: tableIdCandidates }, businessId },
      {
        $set: {
          status: "Occupied",
          guestName: latestWithGuest?.guestName || guestName || null,
          guestPhone: latestWithGuest?.guestPhone || guestPhone || null,
        },
      },
    );
    return;
  }

  if (newStatus === "Served") {
    await Table.findOneAndUpdate(
      { tableId: { $in: tableIdCandidates }, businessId },
      { $set: { status: "Cleaning", guestName: null, guestPhone: null } },
    );
    return;
  }

  await Table.findOneAndUpdate(
    { tableId: { $in: tableIdCandidates }, businessId },
    { $set: { status: "Free", guestName: null, guestPhone: null } },
  );
}

const orderItemSchema = z.object({
  menuItemId: z.string().optional(),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  notes: z.string().optional(),
  modifiers: z.array(z.string()).optional(),
});

const createOrderSchema = z.object({
  tableId: z.string().optional(),
  roomId: z.string().optional(),
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
  orderType: z
    .enum(["Dine-in", "Takeaway", "Delivery", "Room Service"])
    .optional(),
  source: z.enum(["POS", "QR"]).optional(),
  items: z.array(orderItemSchema).min(1),
  discountPct: z.number().min(0).max(100).optional(),
  discountReason: z.string().optional(),
  paymentMethod: z
    .enum(["Cash", "Card/UPI", "Room Charge", "Pending"])
    .optional(),
});

function computeTotals(items, discountPct = 0, gstPct = 5, taxPct = 0) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = Math.round((subtotal * discountPct) / 100);
  const taxableAmount = subtotal - discount;
  const gstAmount = Math.round((taxableAmount * gstPct) / 100);
  const extraTaxAmount = Math.round((taxableAmount * taxPct) / 100);
  const tax = gstAmount + extraTaxAmount;
  const total = taxableAmount + tax;
  return {
    subtotal,
    discount,
    taxableAmount,
    gstAmount,
    extraTaxAmount,
    tax,
    total,
  };
}

async function getAll(req, res, next) {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const query = { businessId: req.user.businessId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean();

    const total = await Order.countDocuments(query);
    res.json({ orders, total });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    }).lean();
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = createOrderSchema.parse(req.body);
    const { discountPct = 0 } = data;

    const business = await Business.findById(req.user.businessId)
      .select("gstPct taxPct")
      .lean();
    const gstPct = Number(business?.gstPct ?? 5);
    const taxPct = Number(business?.taxPct ?? 0);

    const items = data.items.map((i) => ({
      ...i,
      total: i.price * i.quantity,
      preparationStatus: "Pending",
    }));

    const {
      subtotal,
      discount,
      taxableAmount,
      gstAmount,
      extraTaxAmount,
      tax,
      total,
    } = computeTotals(items, discountPct, gstPct, taxPct);

    const order = await Order.create({
      businessId: req.user.businessId,
      userId: req.user.userId,
      tableId: data.tableId || null,
      roomId: data.roomId || null,
      guestName: data.guestName || "Guest",
      guestPhone: data.guestPhone || null,
      orderType: data.orderType || "Dine-in",
      source: data.source || "POS",
      items,
      subtotal,
      discount,
      discountPct,
      discountReason: data.discountReason || null,
      taxableAmount,
      gstAmount,
      extraTaxAmount,
      tax,
      total,
      paymentMethod: data.paymentMethod || "Pending",
      kitchenTicketId: `#K-${String(Date.now()).slice(-4)}`,
    });

    // Ensure table status reflects this new order immediately.
    syncTableStatus(order, order.status).catch(() => {});

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = z
      .object({
        status: z.enum([
          "Preparing",
          "Ready",
          "Served",
          "Cancelled",
          "Pending",
        ]),
      })
      .parse(req.body);

    const update = { status };
    if (status === "Served") update.completedAt = new Date();
    if (status === "Cancelled") {
      update.cancelledAt = new Date();
      update.cancelReason = req.body.cancelReason || null;
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { $set: update },
      { new: true },
    );
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Sync table status — fire-and-forget (non-blocking)
    syncTableStatus(order, status).catch(() => {});

    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function updatePayment(req, res, next) {
  try {
    const schema = z.object({
      paymentMethod: z.enum(["Cash", "Card/UPI", "Room Charge"]),
      paymentStatus: z.enum(["Completed", "Failed"]),
      transactionId: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { $set: data },
      { new: true },
    );
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Start cleaning automatically once payment is completed for table orders.
    if (data.paymentStatus === "Completed" && order.tableId) {
      const tableIdCandidates = buildTableIdCandidates(order.tableId);
      if (tableIdCandidates.length > 0) {
        await Table.findOneAndUpdate(
          {
            tableId: { $in: tableIdCandidates },
            businessId: req.user.businessId,
          },
          { $set: { status: "Cleaning", guestName: null, guestPhone: null } },
        );
      }
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function getIncomingQr(req, res, next) {
  try {
    const orders = await Order.find({
      businessId: req.user.businessId,
      source: "QR",
      status: "Pending",
      paymentStatus: "Pending",
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const result = orders.map((o) => ({
      _id: o._id.toString(),
      id: o.orderId,
      source: o.tableId ? `Table ${o.tableId}` : `Room ${o.roomId}`,
      amount: o.total,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getOne,
  create,
  updateStatus,
  updatePayment,
  getIncomingQr,
};

const { z } = require("zod");
const Order = require("../models/Order");

const GST_RATE = 0.05;

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

function computeTotals(items, discountPct = 0) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = Math.round((subtotal * discountPct) / 100);
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * GST_RATE);
  const total = taxableAmount + tax;
  return { subtotal, discount, taxableAmount, tax, total };
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

    const items = data.items.map((i) => ({
      ...i,
      total: i.price * i.quantity,
      preparationStatus: "Pending",
    }));

    const { subtotal, discount, taxableAmount, tax, total } = computeTotals(
      items,
      discountPct,
    );

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
      tax,
      total,
      paymentMethod: data.paymentMethod || "Pending",
      kitchenTicketId: `#K-${String(Date.now()).slice(-4)}`,
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = z
      .object({ status: z.enum(["Preparing", "Ready", "Served", "Cancelled"]) })
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
      status: "Preparing",
      paymentStatus: "Pending",
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const result = orders.map((o) => ({
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

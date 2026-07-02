const { z } = require("zod");
const Table = require("../models/Table");
const Business = require("../models/Business");
const Order = require("../models/Order");

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

function buildOrderTableCandidates(order) {
  const tableId = String(order?.tableId || "").trim();
  const source = String(order?.source || "").trim();
  return Array.from(
    new Set([
      ...buildTableIdCandidates(tableId),
      ...buildTableIdCandidates(source),
    ]),
  );
}

async function reconcileTableOccupancy(businessId) {
  // Only consider orders from the last 24 hours as "active".
  // Stale orders older than 24h (never cancelled/paid) should not keep
  // a table permanently Occupied after cleaning.
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const activeOrders = await Order.find({
    businessId,
    tableId: { $ne: null },
    paymentStatus: { $ne: "Completed" },
    status: { $in: ["Pending", "Preparing", "Ready", "Served"] },
    createdAt: { $gte: since24h },
  })
    .sort({ createdAt: -1 })
    .select("tableId guestName guestPhone status paymentStatus")
    .lean();

  const latestByTableId = new Map();
  activeOrders.forEach((order) => {
    buildOrderTableCandidates(order).forEach((key) => {
      if (!key) return;
      if (!latestByTableId.has(key)) {
        latestByTableId.set(key, order);
      }
    });
  });

  // Safety-net: find paid orders from the last 24 hours.
  // If a table is Occupied but only has paid orders, move it to Cleaning.
  const paidOrders = await Order.find({
    businessId,
    tableId: { $ne: null },
    paymentStatus: "Completed",
    createdAt: { $gte: since24h },
  })
    .sort({ completedAt: -1 })
    .select("tableId source")
    .lean();

  const paidTableKeys = new Set();
  paidOrders.forEach((order) => {
    buildOrderTableCandidates(order).forEach((key) => {
      if (key) paidTableKeys.add(key);
    });
  });

  const tables = await Table.find({ businessId, isActive: true, deletedAt: null })
    .select("tableId status")
    .lean();

  const updates = [];
  for (const table of tables) {
    const candidates = buildTableIdCandidates(table.tableId);
    const matchedOrder = candidates
      .map((candidate) => latestByTableId.get(candidate))
      .find(Boolean);

    if (matchedOrder) {
      // Active unpaid order exists — table must be Occupied,
      // UNLESS it's already Cleaning or Free (payment was done, don't revert).
      if (table.status !== "Cleaning" && table.status !== "Free") {
        updates.push({
          updateOne: {
            filter: { businessId, tableId: table.tableId },
            update: {
              $set: {
                status: "Occupied",
                guestName: matchedOrder.guestName || null,
                guestPhone: matchedOrder.guestPhone || null,
              },
            },
          },
        });
      }
      continue;
    }

    if (table.status === "Occupied") {
      // No active/unpaid order found within 24h.
      const hasPaidOrder = candidates.some((c) => paidTableKeys.has(c));
      if (hasPaidOrder) {
        // Recent paid order → move to Cleaning
        updates.push({
          updateOne: {
            filter: { businessId, tableId: table.tableId },
            update: {
              $set: { status: "Cleaning", guestName: null, guestPhone: null },
            },
          },
        });
      } else {
        // No active or paid order within 24h → orphaned Occupied, reset to Free
        updates.push({
          updateOne: {
            filter: { businessId, tableId: table.tableId },
            update: {
              $set: { status: "Free", guestName: null, guestPhone: null },
            },
          },
        });
      }
    }
  }

  if (updates.length > 0) {
    await Table.bulkWrite(updates, { ordered: false });
  }
}



const statusSchema = z.object({
  status: z.enum(["Free", "Occupied", "Reserved", "Cleaning"]),
});

const guestSchema = z.object({
  guestName: z.string().min(1),
  guestPhone: z.string().optional(),
});

async function autoFreeCleaning(businessId) {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
  const cleaningTables = await Table.find({
    businessId,
    status: "Cleaning",
    updatedAt: { $lte: cutoff },
  })
    .select("tableId")
    .lean();

  if (!cleaningTables.length) return;

  const tableCandidateMap = new Map();
  cleaningTables.forEach((table) => {
    buildTableIdCandidates(table.tableId).forEach((candidate) => {
      tableCandidateMap.set(candidate, table.tableId);
    });
  });

  const candidateTableIds = Array.from(tableCandidateMap.keys());
  if (!candidateTableIds.length) return;

  // Only recent orders (last 24h) can revert a Cleaning table back to Occupied.
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeOrders = await Order.find({
    businessId,
    tableId: { $in: candidateTableIds },
    createdAt: { $gte: since24h },
    paymentStatus: { $ne: "Completed" },
    status: { $in: ["Pending", "Preparing", "Ready", "Served"] },
  })
    .select("tableId guestName guestPhone createdAt")
    .lean();

  const latestOrderByTable = new Map();
  activeOrders.forEach((order) => {
    buildOrderTableCandidates(order).forEach((candidate) => {
      const tableId = tableCandidateMap.get(candidate);
      if (!tableId) return;
      const existing = latestOrderByTable.get(tableId);
      if (
        !existing ||
        new Date(order.createdAt).getTime() >
          new Date(existing.createdAt).getTime()
      ) {
        latestOrderByTable.set(tableId, order);
      }
    });
  });

  const updates = [];
  cleaningTables.forEach((table) => {
    const activeOrder = latestOrderByTable.get(table.tableId);
    if (activeOrder) {
      updates.push({
        updateOne: {
          filter: { businessId, tableId: table.tableId },
          update: {
            $set: {
              status: "Occupied",
              guestName: activeOrder.guestName || null,
              guestPhone: activeOrder.guestPhone || null,
            },
          },
        },
      });
      return;
    }

    updates.push({
      updateOne: {
        filter: { businessId, tableId: table.tableId },
        update: {
          $set: { status: "Free", guestName: null, guestPhone: null },
        },
      },
    });
  });

  if (updates.length > 0) {
    await Table.bulkWrite(updates, { ordered: false });
  }
}

async function getAll(req, res, next) {
  try {
    await reconcileTableOccupancy(req.user.businessId);
    await autoFreeCleaning(req.user.businessId);
    const tables = await Table.find({
      businessId: req.user.businessId,
      isActive: true,
      deletedAt: null,
    })
      .sort({ tableId: 1 })
      .lean();
    res.json(tables);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const table = await Table.findOne({
      tableId: req.params.id,
      businessId: req.user.businessId,
    }).lean();
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.json(table);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = statusSchema.parse(req.body);
    const table = await Table.findOneAndUpdate(
      { tableId: req.params.id, businessId: req.user.businessId },
      {
        $set: {
          status,
          ...(status === "Free" ? { guestName: null, guestPhone: null } : {}),
        },
      },
      { new: true },
    );
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.json(table);
  } catch (err) {
    next(err);
  }
}

async function assignGuest(req, res, next) {
  try {
    const { guestName, guestPhone } = guestSchema.parse(req.body);
    const table = await Table.findOneAndUpdate(
      { tableId: req.params.id, businessId: req.user.businessId },
      { $set: { guestName, guestPhone, status: "Occupied" } },
      { new: true },
    );
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.json(table);
  } catch (err) {
    next(err);
  }
}

const createSchema = z.object({
  tableId: z.string().trim().min(1).max(20),
  seats: z.coerce.number().int().min(1).max(99),
  area: z.string().trim().max(80).optional().default("Main Floor"),
});

const updateSchema = z.object({
  seats: z.coerce.number().int().min(1).max(99).optional(),
  area: z.string().trim().max(80).optional(),
  tableId: z.string().trim().min(1).max(20).optional(),
});

async function create(req, res, next) {
  try {
    const data = createSchema.parse(req.body);
    const existing = await Table.findOne({
      businessId: req.user.businessId,
      tableId: data.tableId,
    });
    if (existing) {
      if (existing.deletedAt == null) {
        return res.status(409).json({ error: "Table ID already exists" });
      } else {
        existing.isActive = true;
        existing.deletedAt = null;
        existing.area = data.area;
        existing.seats = data.seats;
        await existing.save();
        return res.status(201).json(existing);
      }
    }
    const table = await Table.create({
      ...data,
      businessId: req.user.businessId,
    });
    res.status(201).json(table);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = updateSchema.parse(req.body);
    const table = await Table.findOneAndUpdate(
      { tableId: req.params.id, businessId: req.user.businessId },
      { $set: data },
      { new: true },
    );
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.json(table);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const table = await Table.findOneAndUpdate(
      { tableId: req.params.id, businessId: req.user.businessId },
      { $set: { isActive: false, deletedAt: new Date() } },
      { new: true },
    );
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function getDeleted(req, res, next) {
  try {
    const tables = await Table.find({
      businessId: req.user.businessId,
      deletedAt: { $ne: null },
    })
      .sort({ deletedAt: -1, updatedAt: -1 })
      .lean();
    res.json(tables);
  } catch (err) {
    next(err);
  }
}

async function restore(req, res, next) {
  try {
    const table = await Table.findOneAndUpdate(
      { tableId: req.params.id, businessId: req.user.businessId },
      { $set: { isActive: true, deletedAt: null } },
      { new: true },
    );
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.json(table);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getOne,
  updateStatus,
  assignGuest,
  create,
  update,
  remove,
  getDeleted,
  restore,
};

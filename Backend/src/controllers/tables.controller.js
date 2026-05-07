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

  const tables = await Table.find({ businessId, isActive: true })
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

async function syncTablesWithBusinessCount(businessId) {
  const business = await Business.findById(businessId)
    .select("tableCount")
    .lean();
  const targetCount = Math.max(0, Number(business?.tableCount || 0));

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

  if (activeTables.length > targetCount) {
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

  let missing = targetCount - activeTables.length;
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
  const rows = [];
  let pointer = 1;
  while (rows.length < missing) {
    if (!usedIds.has(pointer)) {
      usedIds.add(pointer);
      rows.push({
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

  if (rows.length > 0) {
    await Table.insertMany(rows, { ordered: false });
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
    await syncTablesWithBusinessCount(req.user.businessId);
    await reconcileTableOccupancy(req.user.businessId);
    await autoFreeCleaning(req.user.businessId);
    const tables = await Table.find({
      businessId: req.user.businessId,
      isActive: true,
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
    if (existing)
      return res.status(409).json({ error: "Table ID already exists" });
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
      { _id: req.params.id, businessId: req.user.businessId },
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
      { _id: req.params.id, businessId: req.user.businessId },
      { $set: { isActive: false } },
      { new: true },
    );
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.json({ success: true });
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
};

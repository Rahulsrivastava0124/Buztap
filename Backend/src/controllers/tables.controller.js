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

async function reconcileTableOccupancy(businessId) {
  // Include Served+unpaid orders: table must stay Occupied until payment is done
  const activeOrders = await Order.find({
    businessId,
    tableId: { $ne: null },
    $or: [
      { status: { $in: ["Pending", "Preparing", "Ready"] } },
      { status: "Served", paymentStatus: { $ne: "Completed" } },
    ],
  })
    .sort({ createdAt: -1 })
    .select("tableId guestName guestPhone status paymentStatus")
    .lean();

  if (activeOrders.length === 0) return;

  const latestByTableId = new Map();
  activeOrders.forEach((order) => {
    const key = String(order.tableId || "").trim();
    if (key && !latestByTableId.has(key)) {
      latestByTableId.set(key, order);
    }
  });

  const tables = await Table.find({ businessId, isActive: true })
    .select("tableId")
    .lean();

  const updates = [];
  for (const table of tables) {
    const candidates = buildTableIdCandidates(table.tableId);
    const matchedOrder = candidates
      .map((candidate) => latestByTableId.get(candidate))
      .find(Boolean);

    if (!matchedOrder) continue;

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
  await Table.updateMany(
    {
      businessId,
      status: "Cleaning",
      updatedAt: { $lte: cutoff },
    },
    {
      $set: { status: "Free", guestName: null, guestPhone: null },
    },
  );
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

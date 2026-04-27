const { z } = require("zod");
const Table = require("../models/Table");
const Business = require("../models/Business");

async function backfillTablesIfMissing(businessId) {
  const activeCount = await Table.countDocuments({
    businessId,
    isActive: true,
  });
  if (activeCount > 0) return;

  const business = await Business.findById(businessId)
    .select("tableCount")
    .lean();
  const targetCount = Number(business?.tableCount || 0);
  if (targetCount <= 0) return;

  const rows = Array.from({ length: targetCount }, (_, i) => {
    const n = i + 1;
    return {
      businessId,
      tableId: `T-${String(n).padStart(2, "0")}`,
      seats: 4,
      area: "Main Floor",
      status: "Free",
      guestName: null,
      guestPhone: null,
      isActive: true,
    };
  });

  await Table.insertMany(rows, { ordered: false });
}

const statusSchema = z.object({
  status: z.enum(["Free", "Occupied", "Reserved", "Cleaning"]),
});

const guestSchema = z.object({
  guestName: z.string().min(1),
  guestPhone: z.string().optional(),
});

async function getAll(req, res, next) {
  try {
    await backfillTablesIfMissing(req.user.businessId);
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

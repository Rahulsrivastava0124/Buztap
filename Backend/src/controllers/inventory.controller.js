const { z } = require("zod");
const Inventory = require("../models/Inventory");

const createSchema = z.object({
  itemName: z.string().min(1),
  unit: z.enum(["kg", "liters", "pieces", "grams", "ml"]).optional(),
  inStock: z.number().min(0),
  reorderAt: z.number().min(0),
  supplier: z.string().optional(),
  supplierPhone: z.string().optional(),
  costPerUnit: z.number().min(0).optional(),
});

const stockUpdateSchema = z.object({
  quantity: z.number(),
  reason: z.enum(["Restock", "Usage", "Adjustment"]),
});

async function getAll(req, res, next) {
  try {
    const items = await Inventory.find({ businessId: req.user.businessId }).sort({ itemName: 1 }).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getLowStock(req, res, next) {
  try {
    const items = await Inventory.find({
      businessId: req.user.businessId,
      status: { $in: ["Low", "Out of Stock"] },
    }).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const item = await Inventory.findOne({ _id: req.params.id, businessId: req.user.businessId }).lean();
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = createSchema.parse(req.body);
    const item = await Inventory.create({ ...data, businessId: req.user.businessId });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function updateStock(req, res, next) {
  try {
    const { quantity } = stockUpdateSchema.parse(req.body);
    const item = await Inventory.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!item) return res.status(404).json({ error: "Item not found" });

    item.inStock = Math.max(0, item.inStock + quantity);
    if (quantity > 0) item.lastRestocked = new Date();
    await item.save(); // triggers pre-save status recompute
    res.json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getLowStock, getOne, create, updateStock };

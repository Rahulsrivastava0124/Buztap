const { z } = require("zod");
const MenuItem = require("../models/MenuItem");

const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  price: z.number().min(0),
  priceOptions: z
    .array(
      z.object({
        label: z.string().min(1),
        price: z.number().min(0),
      }),
    )
    .optional(),
  cost: z.number().min(0).optional(),
  image: z.string().optional(),
  isVeg: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  preparationTime: z.number().min(0).optional(),
  spiceLevel: z.number().min(1).max(5).optional(),
  allergens: z.array(z.string()).optional(),
});

async function getAll(req, res, next) {
  try {
    const items = await MenuItem.find({ businessId: req.user.businessId })
      .sort({ category: 1, name: 1 })
      .lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const item = await MenuItem.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    }).lean();
    if (!item) return res.status(404).json({ error: "Menu item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function getCategories(req, res, next) {
  try {
    const cats = await MenuItem.distinct("category", {
      businessId: req.user.businessId,
    });
    res.json({ categories: cats.sort() });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = itemSchema.parse(req.body);
    const item = await MenuItem.create({
      ...data,
      businessId: req.user.businessId,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = itemSchema.partial().parse(req.body);
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ error: "Menu item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const item = await MenuItem.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user.businessId,
    });
    if (!item) return res.status(404).json({ error: "Menu item not found" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function bulkCreate(req, res, next) {
  try {
    const itemsData = z.array(itemSchema).parse(req.body.items);
    const itemsToInsert = itemsData.map(data => ({
      ...data,
      businessId: req.user.businessId,
    }));
    
    if (itemsToInsert.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    const insertedItems = await MenuItem.insertMany(itemsToInsert);
    res.status(201).json({ success: true, count: insertedItems.length, items: insertedItems });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, getCategories, create, bulkCreate, update, remove };

const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");

const createSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(["admin", "manager", "cashier"]),
  shift: z.enum(["Morning", "Evening", "Night"]).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["admin", "manager", "cashier"]).optional(),
  shift: z.enum(["Morning", "Evening", "Night"]).optional(),
  isActive: z.boolean().optional(),
  serviceScore: z.number().min(0).max(100).optional(),
});

async function getAll(req, res, next) {
  try {
    const staff = await User.find({ businessId: req.user.businessId })
      .select("-passwordHash")
      .sort({ name: 1 })
      .lean();
    res.json(staff);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const member = await User.findOne({ _id: req.params.id, businessId: req.user.businessId })
      .select("-passwordHash")
      .lean();
    if (!member) return res.status(404).json({ error: "Staff member not found" });
    res.json(member);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = createSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);
    const member = await User.create({
      ...data,
      passwordHash,
      businessId: req.user.businessId,
    });
    const { passwordHash: _, ...result } = member.toObject();
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = updateSchema.parse(req.body);
    const member = await User.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { $set: data },
      { new: true }
    ).select("-passwordHash");
    if (!member) return res.status(404).json({ error: "Staff member not found" });
    res.json(member);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update };

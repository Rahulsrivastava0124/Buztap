const Role = require("../models/Role");
const { PERMISSIONS } = require("../config/permissions");

// Get all roles for a business
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find({ businessId: req.user.businessId }).sort({ createdAt: 1 });
    res.json(roles);
  } catch (err) {
    next(err);
  }
};

// Create a new custom role
exports.createRole = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Role name is required" });
    }

    // Validate permissions
    const validPermissions = Object.values(PERMISSIONS);
    const isValid = (permissions || []).every((p) => validPermissions.includes(p));
    if (!isValid) {
      return res.status(400).json({ error: "Invalid permissions provided" });
    }

    const existingRole = await Role.findOne({
      businessId: req.user.businessId,
      name: { $regex: `^${name}$`, $options: "i" }
    });

    if (existingRole) {
      return res.status(400).json({ error: "A role with this name already exists" });
    }

    const role = await Role.create({
      businessId: req.user.businessId,
      name,
      description: description || "",
      permissions: permissions || [],
      isSystem: false,
    });

    res.status(201).json(role);
  } catch (err) {
    next(err);
  }
};

// Update an existing role
exports.updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await Role.findOne({ _id: id, businessId: req.user.businessId });
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    if (role.isSystem && req.user.role !== "admin") {
      // Only the primary admin can edit system roles (or maybe even admin shouldn't edit system roles, but let's allow modifying permissions except for Admin role)
      if (role.name === "Admin") {
        return res.status(403).json({ error: "Cannot modify the Admin system role" });
      }
    }

    if (name && name !== role.name) {
      const existingRole = await Role.findOne({
        businessId: req.user.businessId,
        name: { $regex: `^${name}$`, $options: "i" },
      });
      if (existingRole && String(existingRole._id) !== id) {
        return res.status(400).json({ error: "A role with this name already exists" });
      }
      role.name = name;
    }

    if (description !== undefined) {
      role.description = description;
    }

    if (permissions) {
      const validPermissions = Object.values(PERMISSIONS);
      const isValid = permissions.every((p) => validPermissions.includes(p));
      if (!isValid) {
        return res.status(400).json({ error: "Invalid permissions provided" });
      }
      role.permissions = permissions;
    }

    await role.save();
    res.json(role);
  } catch (err) {
    next(err);
  }
};

// Delete a custom role
exports.deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await Role.findOne({ _id: id, businessId: req.user.businessId });
    
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    if (role.isSystem) {
      return res.status(403).json({ error: "Cannot delete system roles" });
    }

    await Role.deleteOne({ _id: id });
    // Note: We might want to handle users who have this role assigned. 
    // Ideally, we shouldn't allow deleting if users are assigned to it.
    
    res.json({ success: true, message: "Role deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get all available permissions (for frontend to render checkboxes)
exports.getAvailablePermissions = async (req, res) => {
  res.json({ permissions: Object.values(PERMISSIONS) });
};

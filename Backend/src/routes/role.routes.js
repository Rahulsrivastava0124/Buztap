const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const authenticate = require("../middleware/auth");

// All role routes require authentication
router.use(authenticate);

// We should also ensure that only admins or users with ROLES_MANAGE permission can access these.
// For now, we will add the requirePermission middleware later, but let's assume the frontend will handle it 
// and we will add backend checks soon.

router.get("/", roleController.getRoles);
router.get("/permissions", roleController.getAvailablePermissions);
router.post("/", roleController.createRole);
router.put("/:id", roleController.updateRole);
router.delete("/:id", roleController.deleteRole);

module.exports = router;

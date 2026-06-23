const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const {
  getAll,
  getLowStock,
  getOne,
  create,
  updateStock,
} = require("../controllers/inventory.controller");

const router = Router();

router.use(authenticate, requirePermission("staff:write"));

router.get("/", getAll);
router.get("/low-stock", getLowStock);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id/stock", updateStock);

module.exports = router;

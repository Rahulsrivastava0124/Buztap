const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const {
  getAll,
  getLowStock,
  getOne,
  create,
  updateStock,
} = require("../controllers/inventory.controller");

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/", getAll);
router.get("/low-stock", getLowStock);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id/stock", updateStock);

module.exports = router;

const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const {
  getAll,
  getOne,
  create,
  updateStatus,
  updatePayment,
  getIncomingQr,
} = require("../controllers/orders.controller");

const router = Router();

router.use(authenticate, requireRole("cashier"));

router.get("/incoming/qr", getIncomingQr);
router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id/status", updateStatus);
router.patch("/:id/status", updateStatus);
router.put("/:id/payment", updatePayment);

module.exports = router;

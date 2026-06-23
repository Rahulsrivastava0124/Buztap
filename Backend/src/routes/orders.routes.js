const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const {
  getAll,
  getOne,
  create,
  updateStatus,
  updatePayment,
  updateItems,
  getIncomingQr,
  getGuestOrders,
} = require("../controllers/orders.controller");

const router = Router();

// Public guest-facing endpoint — no auth required
router.get("/guest", getGuestOrders);

router.use(authenticate, requireRole("cashier"));

router.get("/incoming/qr", getIncomingQr);
router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id/status", updateStatus);
router.patch("/:id/status", updateStatus);
router.put("/:id/payment", updatePayment);
router.put("/:id/items", updateItems);

module.exports = router;

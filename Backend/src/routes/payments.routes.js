const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const {
  getSettlements,
  getChannels,
  settle,
} = require("../controllers/payments.controller");

const router = Router();

router.use(authenticate, requirePermission("menu:manage"));

router.get("/settlements", getSettlements);
router.get("/channels", getChannels);
router.post("/settle", settle);

module.exports = router;

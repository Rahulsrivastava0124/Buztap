const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { getSettlements, getChannels, settle } = require("../controllers/payments.controller");

const router = Router();

router.use(authenticate, requireRole("manager"));

router.get("/settlements", getSettlements);
router.get("/channels", getChannels);
router.post("/settle", settle);

module.exports = router;

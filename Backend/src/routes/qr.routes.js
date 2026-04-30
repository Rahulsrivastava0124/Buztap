const { Router } = require("express");
const { getQr } = require("../controllers/qr.controller");
const optionalAuth = require("../middleware/optionalAuth");

const router = Router();

// Public — scanned by guests; also accepts admin JWT to scope by business
router.get("/:tableId", optionalAuth, getQr);

module.exports = router;

const { Router } = require("express");
const { getQr } = require("../controllers/qr.controller");

const router = Router();

// Public — scanned by guests
router.get("/:tableId", getQr);

module.exports = router;

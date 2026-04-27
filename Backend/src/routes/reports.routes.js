const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { getAvailableReports, getSalesSummary, getCategoryMix, getTaxLedger } = require("../controllers/reports.controller");

const router = Router();

router.use(authenticate, requireRole("manager"));

router.get("/", getAvailableReports);
router.get("/sales-summary", getSalesSummary);
router.get("/category-mix", getCategoryMix);
router.get("/tax-ledger", getTaxLedger);

module.exports = router;

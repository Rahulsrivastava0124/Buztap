const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const {
  getSnapshot,
  getKitchenQueue,
  getAreaLoad,
  getTodayStats,
  getRevenueTrend,
  getVisitorTrend,
} = require("../controllers/dashboard.controller");

const router = Router();

router.use(authenticate, requireRole("cashier"));

router.get("/snapshot", getSnapshot);
router.get("/kitchen-queue", getKitchenQueue);
router.get("/area-load", getAreaLoad);
router.get("/today-stats", getTodayStats);
router.get("/revenue-trend", getRevenueTrend);
router.get("/visitor-trend", getVisitorTrend);

module.exports = router;

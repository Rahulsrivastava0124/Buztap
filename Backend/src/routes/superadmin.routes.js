const { Router } = require("express");
const superadminAuth = require("../middleware/superadminAuth");
const {
  superadminLogin,
  getProfile,
  updateProfile,
  superadminStats,
  listBusinesses,
  getBusinessDetail,
  toggleBusiness,
  deleteBusiness,
  getAnalyticsChart,
  getTopRestaurants,
  getAuditLogs,
  updateBusinessDetails,
  getSystemHealth,
} = require("../controllers/superadmin.controller");

const router = Router();

// Public — no auth required
router.post("/login", superadminLogin);            // Email & Password login

// Protected routes
router.use(superadminAuth);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

router.get("/stats", superadminStats);
router.get("/businesses", listBusinesses);
router.get("/businesses/:id", getBusinessDetail);
router.put("/businesses/:id/toggle", toggleBusiness);
router.delete("/businesses/:id", deleteBusiness);

// Advanced routes
router.get("/analytics/chart", getAnalyticsChart);
router.get("/analytics/top-restaurants", getTopRestaurants);
router.get("/audit-logs", getAuditLogs);
router.put("/businesses/:id", updateBusinessDetails);
router.get("/system/health", getSystemHealth);

module.exports = router;

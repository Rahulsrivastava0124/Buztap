const { Router } = require("express");
const superadminAuth = require("../middleware/superadminAuth");
const {
  superadminSetup,
  superadminCheckProfile,
  superadminRequestOtp,
  superadminVerifyOtp,
  superadminLogin,
  getProfile,
  updateProfile,
  superadminStats,
  listBusinesses,
  getBusinessDetail,
  toggleBusiness,
  getAnalyticsChart,
  getTopRestaurants,
  getAuditLogs,
  updateBusinessDetails,
  getSystemHealth,
} = require("../controllers/superadmin.controller");

const router = Router();

// Public — no auth required
router.post("/login", superadminLogin);            // Legacy secret-key login
router.post("/setup", superadminSetup);             // First-time profile setup
router.get("/check-profile", superadminCheckProfile); // Check if profile exists
router.post("/request-otp", superadminRequestOtp);  // Request OTP email
router.post("/verify-otp", superadminVerifyOtp);    // Verify OTP → get JWT

// Protected routes
router.use(superadminAuth);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

router.get("/stats", superadminStats);
router.get("/businesses", listBusinesses);
router.get("/businesses/:id", getBusinessDetail);
router.put("/businesses/:id/toggle", toggleBusiness);

// Advanced routes
router.get("/analytics/chart", getAnalyticsChart);
router.get("/analytics/top-restaurants", getTopRestaurants);
router.get("/audit-logs", getAuditLogs);
router.put("/businesses/:id", updateBusinessDetails);
router.get("/system/health", getSystemHealth);

module.exports = router;

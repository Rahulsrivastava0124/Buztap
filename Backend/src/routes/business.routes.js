const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const {
  getBusinessProfile,
  updateBusinessProfile,
} = require("../controllers/business.controller");

const router = Router();

router.get(
  "/profile",
  authenticate,
  requireRole("cashier"),
  getBusinessProfile,
);
router.put(
  "/profile",
  authenticate,
  requireRole("manager"),
  updateBusinessProfile,
);

module.exports = router;

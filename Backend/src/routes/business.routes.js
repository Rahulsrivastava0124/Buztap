const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const {
  getBusinessProfile,
  getPublicHeaderImage,
  updateBusinessProfile,
} = require("../controllers/business.controller");

const router = Router();

router.get("/public/header-image", getPublicHeaderImage);

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

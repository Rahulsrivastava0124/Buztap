const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
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
  requirePermission("pos:access"),
  getBusinessProfile,
);
router.put(
  "/profile",
  authenticate,
  requirePermission("menu:manage"),
  updateBusinessProfile,
);

module.exports = router;

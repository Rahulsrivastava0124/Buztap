const { Router } = require("express");
const {
  register,
  getOrders,
  placeOrder,
  lookupGuest,
} = require("../controllers/guests.controller");
const authenticate = require("../middleware/auth");

const router = Router();

// Admin: look up a guest by phone to pre-fill name in POS
router.get("/lookup", authenticate, lookupGuest);

// No admin auth required — guests authenticate by phone
router.post("/register", register);
router.get("/:phone/orders", getOrders);
router.post("/:phone/orders", placeOrder);

module.exports = router;

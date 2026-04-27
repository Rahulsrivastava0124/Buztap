const { Router } = require("express");
const {
  register,
  getOrders,
  placeOrder,
} = require("../controllers/guests.controller");

const router = Router();

// No admin auth required — guests authenticate by phone
router.post("/register", register);
router.get("/:phone/orders", getOrders);
router.post("/:phone/orders", placeOrder);

module.exports = router;

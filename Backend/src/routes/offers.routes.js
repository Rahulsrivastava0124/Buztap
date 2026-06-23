const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const {
  getAll,
  create,
  update,
  remove,
  getPublicOffers,
} = require("../controllers/offers.controller");

const router = Router();

router.get("/public", getPublicOffers);

router.use(authenticate, requirePermission("menu:manage"));
router.get("/", getAll);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);

module.exports = router;

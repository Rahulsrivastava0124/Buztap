const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const {
  getAll,
  getOne,
  updateStatus,
  assignGuest,
  create,
  update,
  remove,
} = require("../controllers/tables.controller");

const router = Router();

router.use(authenticate, requireRole("cashier"));

router.get("/", getAll);
router.post("/", requireRole("manager"), create);
router.get("/:id", getOne);
router.put("/:id", requireRole("manager"), update);
router.delete("/:id", requireRole("manager"), remove);
router.put("/:id/status", updateStatus);
router.put("/:id/guest", assignGuest);

module.exports = router;

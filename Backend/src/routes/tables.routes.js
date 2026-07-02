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
  getDeleted,
  restore,
} = require("../controllers/tables.controller");

const router = Router();

router.use(authenticate, requireRole("cashier"));

router.get("/", getAll);
router.get("/deleted", requireRole("manager"), getDeleted);
router.post("/", requireRole("manager"), create);
router.get("/:id", getOne);
router.put("/:id/restore", requireRole("manager"), restore);
router.put("/:id", requireRole("manager"), update);
router.delete("/:id", requireRole("manager"), remove);
router.put("/:id/status", updateStatus);
router.put("/:id/guest", assignGuest);

module.exports = router;

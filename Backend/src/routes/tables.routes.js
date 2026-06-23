const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
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

router.use(authenticate, requirePermission("pos:access"));

router.get("/", getAll);
router.post("/", requirePermission("menu:manage"), create);
router.get("/:id", getOne);
router.put("/:id", requirePermission("menu:manage"), update);
router.delete("/:id", requirePermission("menu:manage"), remove);
router.put("/:id/status", updateStatus);
router.put("/:id/guest", assignGuest);

module.exports = router;

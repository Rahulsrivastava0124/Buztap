const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const {
  getAll,
  getOne,
  create,
  update,
  remove,
  punchIn,
  punchOut,
} = require("../controllers/staff.controller");

const router = Router();

// All routes require authentication
router.use(authenticate);

// Staff member self-service routes — any authenticated role
router.get("/:id", getOne);
router.post("/:id/punch-in", punchIn);
router.post("/:id/punch-out", punchOut);

// Management routes — manager or above
router.get("/", requireRole("manager"), getAll);
router.post("/", requireRole("admin"), create);
router.put("/:id", requireRole("manager"), update);
router.delete("/:id", requireRole("admin"), remove);

module.exports = router;

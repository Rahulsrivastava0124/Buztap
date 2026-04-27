const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const {
  getAll,
  getOne,
  create,
  update,
} = require("../controllers/staff.controller");

const router = Router();

router.use(authenticate, requireRole("manager"));

router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", requireRole("admin"), create);
router.put("/:id", update);

module.exports = router;

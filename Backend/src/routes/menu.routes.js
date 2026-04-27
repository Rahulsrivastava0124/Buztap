const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { getAll, getOne, getCategories, create, update, remove } = require("../controllers/menu.controller");

const router = Router();

// AdminPanel reads are auth-scoped by businessId.
router.use(authenticate, requireRole("cashier"));

router.get("/", getAll);
router.get("/categories", getCategories);
router.get("/:id", getOne);

// Write operations require manager+
router.post("/", requireRole("manager"), create);
router.put("/:id", requireRole("manager"), update);
router.delete("/:id", requireRole("manager"), remove);

module.exports = router;

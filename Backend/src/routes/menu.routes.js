const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const {
  getAll,
  getOne,
  getCategories,
  create,
  bulkCreate,
  update,
  remove,
} = require("../controllers/menu.controller");
const { parseMenuUpload } = require("../controllers/menuUpload.controller");
const multer = require("multer");

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// AdminPanel reads are auth-scoped by businessId.
router.use(authenticate, requirePermission("pos:access"));

router.get("/", getAll);
router.get("/categories", getCategories);
router.get("/:id", getOne);

// Write operations require manager+
router.post("/", requirePermission("menu:manage"), create);
router.post("/bulk", requirePermission("menu:manage"), bulkCreate);
router.post("/upload-parse", requirePermission("menu:manage"), upload.single("menuFile"), parseMenuUpload);
router.put("/:id", requirePermission("menu:manage"), update);
router.delete("/:id", requirePermission("menu:manage"), remove);

module.exports = router;

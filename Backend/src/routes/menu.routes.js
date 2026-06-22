const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
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
router.use(authenticate, requireRole("cashier"));

router.get("/", getAll);
router.get("/categories", getCategories);
router.get("/:id", getOne);

// Write operations require manager+
router.post("/", requireRole("manager"), create);
router.post("/bulk", requireRole("manager"), bulkCreate);
router.post("/upload-parse", requireRole("manager"), upload.single("menuFile"), parseMenuUpload);
router.put("/:id", requireRole("manager"), update);
router.delete("/:id", requireRole("manager"), remove);

module.exports = router;

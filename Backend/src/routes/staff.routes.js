const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const {
  getAll,
  getOne,
  create,
  update,
  remove,
  punchIn,
  punchOut,
  getAllLeaveRequests,
  getLeaveRequests,
  createLeaveRequest,
  reviewLeaveRequest,
} = require("../controllers/staff.controller");

const router = Router();

// All routes require authentication
router.use(authenticate);

// Leave management routes — manager or above
router.get("/leave-requests", requirePermission("menu:manage"), getAllLeaveRequests);

// Staff member self-service routes — any authenticated role
router.get("/:id/leave-requests", getLeaveRequests);
router.post("/:id/leave-requests", createLeaveRequest);
router.patch(
  "/:id/leave-requests/:requestId",
  requirePermission("menu:manage"),
  reviewLeaveRequest,
);
router.get("/:id", getOne);
router.post("/:id/punch-in", punchIn);
router.post("/:id/punch-out", punchOut);

// Management routes — manager or above
router.get("/", requirePermission("menu:manage"), getAll);
router.post("/", requirePermission("staff:write"), create);
router.put("/:id", requirePermission("menu:manage"), update);
router.delete("/:id", requirePermission("staff:write"), remove);

module.exports = router;

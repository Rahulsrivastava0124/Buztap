const { Router } = require("express");
const authenticate = require("../middleware/auth");
const {
  requestEmailOtp,
  requestLoginOtp,
  requestPhoneLoginOtp,
  verifyEmailOtp,
  resetPassword,
  register,
  login,
  me,
  logout,
} = require("../controllers/auth.controller");

const router = Router();

router.post("/otp/request", requestEmailOtp);
router.post("/otp/request-login", requestLoginOtp);
router.post("/otp/request-by-phone", requestPhoneLoginOtp);
router.post("/otp/verify", verifyEmailOtp);
router.post("/password/reset", resetPassword);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

module.exports = router;

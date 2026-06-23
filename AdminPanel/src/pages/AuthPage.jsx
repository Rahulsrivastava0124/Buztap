import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { requestLoginOtp, verifyEmailOtp } from "../services/api";
import { getDefaultAdminPathByRole } from "../utils/access";
import useSEO from "../hooks/useSEO";
import RegisterForm from "./RegisterForm";
import RegistrationModal from "../components/registration/RegistrationModal";

export default function AuthPage() {
  useSEO("auth");

  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [loginMethod, setLoginMethod] = useState("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [resolvedEmail, setResolvedEmail] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpCooldown, setOtpCooldown] = useState(0);
  const otpTimerRef = useRef(null);
  const otpInputRefs = useRef([]);

  function startCooldown(seconds, setter, timerRef) {
    setter(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setter((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    const timerId = otpTimerRef.current;
    return () => {
      clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    if (showOtpModal) {
      const timer = setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showOtpModal]);

  const { login, subdomain, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !subdomain) return;
    navigate(`/${subdomain}${getDefaultAdminPathByRole(role)}`, {
      replace: true,
    });
  }, [isAuthenticated, navigate, role, subdomain]);

  function validateCredentials() {
    const errs = {};
    if (loginMethod === "phone") {
      const digits = identifier.replace(/\D/g, "");
      if (!identifier.trim()) {
        errs.identifier = "Phone number is required.";
      } else if (digits.length < 10) {
        errs.identifier = "Enter a valid 10-digit phone number.";
      } else if (digits.length > 15) {
        errs.identifier = "Phone number is too long.";
      }
    } else if (loginMethod === "email") {
      if (!identifier.trim()) {
        errs.identifier = "Email address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
        errs.identifier = "Enter a valid email address.";
      }
    }
    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    return errs;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submitting || sendingOtp) return;
    const errs = validateCredentials();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const normalizedIdentifier =
      loginMethod === "phone"
        ? identifier.replace(/\D/g, "")
        : identifier.trim().toLowerCase();

    if (loginMethod === "phone") {
      await completeLogin(normalizedIdentifier, password, undefined, "staff");
      return;
    }

    await handleSendOtp(true);
  };

  const completeLogin = async (loginIdentifier, loginPassword, otpToken, loginMode = "admin") => {
    setErrors({});
    setSubmitting(true);
    const result = await login(
      loginIdentifier,
      loginPassword,
      otpToken || undefined,
      loginMode,
    );
    if (result.success) {
      const targetSlug = result.subdomain || subdomain;
      const targetPath = getDefaultAdminPathByRole(result.role || role);
      if (!targetSlug) {
        toast.error("Could not resolve business URL. Please contact support.");
        setSubmitting(false);
        return;
      }
      toast.dismiss();
      toast.success("Signed in successfully");
      setShowOtpModal(false);
      navigate(`/${targetSlug}${targetPath}`);
    } else {
      toast.error("Invalid phone/email or password");
    }
    setSubmitting(false);
  };


  const completeLoginWithOtp = async (otpToken) => {
    await completeLogin(
      identifier.trim().toLowerCase(),
      password,
      otpToken,
      "admin",
    );
  };
  function handleIdentifierChange(e) {
    const raw = e.target.value;
    const cleaned =
      loginMethod === "phone" ? raw.replace(/[^\d\s+\-().]/g, "") : raw;
    setIdentifier(cleaned);
    setOtp("");
    setResolvedEmail("");
    setShowOtpModal(false);
    setErrors((prev) => ({ ...prev, otp: "" }));
    if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: "" }));
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
  }

  function switchMethod(method) {
    setLoginMethod(method);
    setIdentifier("");
    setOtp("");
    setResolvedEmail("");
    setShowOtpModal(false);
    setOtpCooldown(0);
    clearInterval(otpTimerRef.current);
    setErrors({});
  }

  async function handleSendOtp(openModal = false) {
    const errs = validateCredentials();
    if (Object.keys(errs).length > 0) {
      setErrors((prev) => ({ ...prev, ...errs }));
      return;
    }

    try {
      setSendingOtp(true);
      const res = await requestLoginOtp(identifier.trim(), password);
      setResolvedEmail(res.resolvedEmail);
      toast.success("OTP sent to your registered email");
      if (openModal) {
        setOtp("");
        setShowOtpModal(true);
      }
    } catch (err) {
      if (err?.retryAfterSeconds) {
        startCooldown(err.retryAfterSeconds, setOtpCooldown, otpTimerRef);
        toast.error(`Wait ${err.retryAfterSeconds}s before resending OTP`);
      } else {
        toast.error(err?.message || "Unable to send OTP");
      }
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    const otpValue = otp.trim();
    if (!/^\d{6}$/.test(otpValue)) {
      setErrors((prev) => ({ ...prev, otp: "Enter a valid 6-digit OTP." }));
      return;
    }
    const emailForVerify = resolvedEmail || identifier.trim().toLowerCase();
    if (!emailForVerify) {
      toast.error("Send OTP first");
      return;
    }

    try {
      setVerifyingOtp(true);
      const res = await verifyEmailOtp(emailForVerify, "login", otpValue);
      setErrors((prev) => ({ ...prev, otp: "" }));
      toast.success("OTP verified");
      await completeLoginWithOtp(res.otpToken);
    } catch (err) {
      toast.error(err?.message || "OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  }

  function handleOtpBoxChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const chars = otp.split("");
    chars[index] = digit;
    const nextOtp = chars.join("").slice(0, 6);
    setOtp(nextOtp);
    setErrors((prev) => ({ ...prev, otp: "" }));

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpBoxKeyDown(index, e) {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const chars = otp.split("");
        chars[index] = "";
        setOtp(chars.join(""));
        return;
      }
      if (index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (e.key === "Enter") {
      handleVerifyOtp();
    }
  }

  function handleOtpBoxPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    setOtp(pasted);
    setErrors((prev) => ({ ...prev, otp: "" }));
    const focusIndex = Math.min(pasted.length - 1, 5);
    otpInputRefs.current[focusIndex]?.focus();
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col md:grid md:grid-cols-2 font-[Inter,sans-serif]">
      {/* ── Left Side Image / Brand ── */}
      <div className="hidden md:flex flex-col relative bg-black">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400"
          alt="Restaurant kitchen"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute inset-0 p-12 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 w-fit">
            <span className="rounded-2xl overflow-hidden bg-white/10 border border-white/15 shadow-sm p-1">
              <img
                src="/logo.jpeg"
                alt="BuzTap logo"
                className="h-12 w-auto max-w-52 object-contain"
              />
            </span>
          </Link>

          <div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-6">
              Turn tables faster.
              <br />
              <span className="text-saffron">Delight guests.</span>
            </h2>
            <p className="text-[#e8e0d4] text-lg max-w-md leading-relaxed selection:bg-saffron/30">
              Join thousands of restaurants revolutionizing the dining
              experience with instant digital ordering.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Side Form ── */}
      <div className="flex flex-col justify-center p-6 sm:p-12 lg:p-20 relative bg-white min-h-screen md:min-h-0">
        {/* Mobile Header */}
        <div className="md:hidden absolute top-6 left-6 right-6 flex items-center justify-end">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="rounded-xl overflow-hidden bg-white shadow-sm p-1">
              <img
                src="/logo.jpeg"
                alt="BuzTap logo"
                className="h-9 w-auto max-w-40 object-contain"
              />
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-[#0f0e0b] mb-2">
              {isRegistering ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-[#857c6e] text-sm">
              {isRegistering
                ? "Enter your details to register your restaurant."
                : "Enter your details to access your dashboard."}
            </p>
          </div>

          <div className="flex bg-[#faf7f2] p-1 rounded-xl mb-6">
            <button
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                !isRegistering ? "bg-white text-[#0f0e0b] shadow-sm" : "text-[#857c6e] hover:text-[#0f0e0b]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                isRegistering ? "bg-white text-[#0f0e0b] shadow-sm" : "text-[#857c6e] hover:text-[#0f0e0b]"
              }`}
            >
              Register
            </button>
          </div>

          {isRegistering ? (
            <RegisterForm onRegisterSuccess={() => setRegistrationModalOpen(true)} />
          ) : (
            <form className="space-y-4" onSubmit={handleLogin} noValidate>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0f0e0b]">
                Login Method
              </label>
              <div className="p-1 rounded-lg bg-[#faf7f2] border border-[#e0d9ce] grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => switchMethod("phone")}
                  className={`py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    loginMethod === "phone"
                      ? "bg-[#e8720c] text-white"
                      : "text-[#6f6658] hover:bg-[#f0ebe0]"
                  }`}
                >
                  <Phone size={14} /> Phone
                </button>
                <button
                  type="button"
                  onClick={() => switchMethod("email")}
                  className={`py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    loginMethod === "email"
                      ? "bg-[#e8720c] text-white"
                      : "text-[#6f6658] hover:bg-[#f0ebe0]"
                  }`}
                >
                  <Mail size={14} /> Email
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0f0e0b]">
                {loginMethod === "phone"
                  ? "Phone Number"
                  : "Email Address"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {loginMethod === "phone" ? (
                    <Phone className="h-4 w-4 text-[#b0a898]" />
                  ) : (
                    <Mail className="h-4 w-4 text-[#b0a898]" />
                  )}
                </div>
                <input
                  type={loginMethod === "phone" ? "tel" : "text"}
                  inputMode={
                    loginMethod === "phone"
                      ? "numeric"
                      : "email"
                  }
                  value={identifier}
                  onChange={handleIdentifierChange}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:ring-1 transition-shadow ${
                    errors.identifier
                      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                      : "border-[#e0d9ce] focus:border-[#e8720c] focus:ring-[#e8720c]"
                  }`}
                  placeholder={
                    loginMethod === "phone"
                      ? "+91 98765 43210"
                      : "you@example.com"
                  }
                  autoComplete={
                    loginMethod === "phone"
                      ? "tel"
                      : "email"
                  }
                />
              </div>
              {errors.identifier && (
                <p className="text-xs text-red-500 mt-1">{errors.identifier}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#0f0e0b]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#e8720c] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#b0a898]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full pl-10 pr-10 py-2.5 bg-[#faf7f2] border rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:ring-1 transition-shadow ${
                    errors.password
                      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                      : "border-[#e0d9ce] focus:border-[#e8720c] focus:ring-[#e8720c]"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b0a898] hover:text-[#0f0e0b] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || sendingOtp}
              className="w-full py-3 mt-6 bg-[#e8720c] hover:bg-[#d4620a] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_4px_14px_rgba(232,114,12,0.25)] flex items-center justify-center gap-2"
            >
              {sendingOtp ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending OTP...
                </>
              ) : submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  {loginMethod === "phone" ? "Sign In" : "Send OTP"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          )}
        </div>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#e0d9ce] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-6 sm:p-7">
            <h2 className="font-display text-2xl font-bold text-[#0f0e0b] mb-2">
              Verify OTP
            </h2>
            <p className="text-sm text-[#857c6e] mb-5">
              {loginMethod === "phone"
                ? "We sent a one-time code to the email linked with this phone number."
                : "We sent a one-time code to your email address."}
            </p>

            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index] || ""}
                  onChange={(e) => handleOtpBoxChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpBoxKeyDown(index, e)}
                  onPaste={handleOtpBoxPaste}
                  className="w-11 h-12 sm:w-12 sm:h-12 text-center bg-[#faf7f2] border border-[#cfd5de] rounded-xl text-[#0f0e0b] focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-500 transition-all font-semibold text-lg"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            {errors.otp ? (
              <p className="text-xs text-red-500 mt-2">{errors.otp}</p>
            ) : null}

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSendOtp(false)}
                disabled={sendingOtp || otpCooldown > 0}
                className="text-xs font-semibold text-[#e8720c] hover:underline disabled:opacity-60 disabled:no-underline"
              >
                {sendingOtp
                  ? "Sending..."
                  : otpCooldown > 0
                    ? `Resend in ${otpCooldown}s`
                    : "Resend OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                }}
                className="text-xs font-medium text-[#857c6e] hover:text-[#0f0e0b]"
              >
                Cancel
              </button>
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={verifyingOtp || submitting || otp.length !== 6}
              className="w-full py-3 mt-5 bg-[#e8720c] hover:bg-[#d4620a] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_4px_14px_rgba(232,114,12,0.25)] flex items-center justify-center gap-2"
            >
              {verifyingOtp || submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <RegistrationModal
        isOpen={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        onComplete={(data) => {
          // If we want to save AI menu we can, but they are already registered!
          setRegistrationModalOpen(false);
          // navigate to dashboard
          window.location.reload();
        }}
      />
    </div>
  );
}

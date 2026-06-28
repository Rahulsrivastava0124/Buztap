import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Shield, Loader2, ArrowRight, Mail, Lock, KeyRound } from "lucide-react";
import { superAdminLogin, requestSuperAdminOtp, isSuperAdminLoggedIn } from "../services/superadminApi";
import toast from "react-hot-toast";

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const otpTimerRef = useRef(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const getDashboardPath = () => {
    return window.location.hostname.includes("superadmin") ? "/dashboard" : "/superadmin/dashboard";
  };

  // Redirect if already logged in
  useEffect(() => {
    if (isSuperAdminLoggedIn()) {
      navigate(getDashboardPath(), { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    return () => clearInterval(otpTimerRef.current);
  }, []);

  function startCooldown(seconds) {
    setOtpCooldown(seconds);
    clearInterval(otpTimerRef.current);
    otpTimerRef.current = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(otpTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Enter email and password");
      return;
    }

    setLoading(true);
    try {
      const data = await requestSuperAdminOtp(form.email, form.password);
      toast.success("OTP sent to your email");
      setShowOtp(true);
      startCooldown(60);
    } catch (err) {
      toast.error(err.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const data = await superAdminLogin(form.email, form.password, otp);
      localStorage.setItem("superAdminToken", data.token);
      if (data.profile) {
        localStorage.setItem("superAdminProfile", JSON.stringify(data.profile));
      }
      toast.success("Welcome, Super Admin!");
      navigate(getDashboardPath(), { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    await handleLogin({ preventDefault: () => {} });
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 font-[Inter,sans-serif]">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0f0e0b 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <Motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-1 bg-gradient-to-br from-saffron/20 via-transparent to-saffron/10 rounded-3xl blur-xl" />

        <div className="relative bg-white rounded-2xl border border-border shadow-[0_20px_60px_rgba(15,14,11,0.12)] overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-saffron via-saffron2 to-saffron" />

          <div className="p-8 sm:p-10">
            <div className="flex justify-center mb-6">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-saffron to-saffron2 flex items-center justify-center shadow-lg shadow-saffron/25"
              >
                <Shield size={28} className="text-white" />
              </Motion.div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-ink tracking-tight">
                Super Admin Login
              </h1>
              <p className="text-sm text-muted mt-1.5">
                {showOtp ? "Enter the verification code sent to your email" : "Enter your credentials to access the dashboard"}
              </p>
            </div>
            
            <AnimatePresence mode="wait">
              {!showOtp ? (
                <Motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  <InputField
                    icon={Mail}
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                    placeholder="Admin Email"
                    autoFocus
                  />
                  <InputField
                    icon={Lock}
                    type="password"
                    value={form.password}
                    onChange={(v) => setForm((p) => ({ ...p, password: v }))}
                    placeholder="Password"
                  />
                  <SubmitButton loading={loading} text="Get OTP" />
                </Motion.form>
              ) : (
                <Motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >
                  <InputField
                    icon={KeyRound}
                    type="text"
                    value={otp}
                    onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
                    placeholder="6-digit OTP"
                    autoFocus
                  />
                  <SubmitButton loading={loading} text="Verify & Login" />
                  
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpCooldown > 0 || loading}
                      className="text-sm text-saffron hover:text-saffron2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowOtp(false)}
                      className="text-xs text-muted hover:text-ink transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                </Motion.form>
              )}
            </AnimatePresence>

            <p className="text-center text-xs text-muted2 mt-6">
              Authorized personnel only
            </p>
          </div>
        </div>
      </Motion.div>
    </div>
  );
}

// ── Shared Components ────────────────────────────────────────────────────────

function InputField({
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  autoFocus,
}) {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted2"
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-4 py-3 bg-paper border border-border rounded-xl text-sm text-ink placeholder-muted2 focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition-all"
        />
      </div>
    </div>
  );
}

function SubmitButton({ loading, text }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-saffron to-saffron2 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-saffron/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Please wait...
        </>
      ) : (
        <>
          {text}
          <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}

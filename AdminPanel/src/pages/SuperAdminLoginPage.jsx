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
          <div className="flex items-center gap-2.5 shrink-0 w-fit">
            <span className="rounded-2xl overflow-hidden bg-white/10 border border-white/15 shadow-sm p-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron to-saffron2 flex items-center justify-center shadow-md shadow-saffron/20 shrink-0">
                <Shield size={18} className="text-white" />
              </div>
            </span>
          </div>

          <div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-6">
              Manage BuzTap.
              <br />
              <span className="text-saffron">Empower Growth.</span>
            </h2>
            <p className="text-[#e8e0d4] text-lg max-w-md leading-relaxed selection:bg-saffron/30">
              Super admin portal for platform operations, audit logs, and global analytics.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Side Form ── */}
      <div className="flex flex-col justify-center p-6 sm:p-12 lg:p-20 relative bg-white min-h-screen md:min-h-0">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-[#0f0e0b] mb-2">
              Super Admin Login
            </h1>
            <p className="text-[#857c6e] text-sm">
              {showOtp ? "Enter the verification code sent to your email" : "Enter your credentials to access the dashboard."}
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
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0f0e0b]">
                    Admin Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#b0a898]" />
                    </div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="admin@platform.com"
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-shadow"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0f0e0b]">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#b0a898]" />
                    </div>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-shadow"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#e8720c] hover:bg-[#d06509] text-white text-sm font-semibold rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      Get OTP
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
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
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0f0e0b]">
                    6-digit OTP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-4 w-4 text-[#b0a898]" />
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter OTP"
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-shadow"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#e8720c] hover:bg-[#d06509] text-white text-sm font-semibold rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    "Verify & Login"
                  )}
                </button>
                
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpCooldown > 0 || loading}
                    className="text-sm text-[#e8720c] hover:underline font-medium transition-colors disabled:opacity-50 disabled:no-underline"
                  >
                    {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : "Resend OTP"}
                  </button>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="text-xs text-[#857c6e] hover:text-[#0f0e0b] transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </Motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-[#b0a898] mt-10">
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}


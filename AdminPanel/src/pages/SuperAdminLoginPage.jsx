import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  KeyRound,
  Loader2,
  ArrowRight,
  Mail,
  Lock,
  User,
  ArrowLeft,
} from "lucide-react";
import {
  checkSuperAdminProfile,
  superAdminSetup,
  superAdminRequestOtp,
  superAdminVerifyOtp,
  superAdminLogin,
  isSuperAdminLoggedIn,
} from "../services/superadminApi";
import toast from "react-hot-toast";

// Steps: "checking" → "setup" | "email" → "otp"
export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("checking"); // checking, setup, email, otp
  const [loading, setLoading] = useState(false);

  // Setup form
  const [setupForm, setSetupForm] = useState({
    secretKey: "",
    name: "",
    email: "",
    password: "",
  });

  // OTP form
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (isSuperAdminLoggedIn()) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    // Check if profile exists
    checkSuperAdminProfile()
      .then((data) => {
        if (data.exists) {
          setStep("email");
          if (data.profile?.email) setEmail(data.profile.email);
        } else {
          setStep("setup");
        }
      })
      .catch(() => {
        setStep("setup"); // Fallback to setup if API fails
      });
  }, [navigate]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Setup: first-time profile creation ──
  const handleSetup = async (e) => {
    e.preventDefault();
    const { secretKey, name, email: sEmail, password } = setupForm;
    if (!secretKey || !name || !sEmail || !password) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await superAdminSetup({ secretKey, name, email: sEmail, password });
      toast.success("Profile created! Now login with OTP.");
      setEmail(sEmail);
      setStep("email");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Request OTP ──
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your email");
      return;
    }
    setLoading(true);
    try {
      const data = await superAdminRequestOtp(email.trim());
      toast.success(data.message || "OTP sent!");
      setCountdown(Math.floor((data.expiresInSeconds || 600) / 10)); // ~60s resend
      setStep("otp");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const data = await superAdminVerifyOtp(email.trim(), otp.trim());
      localStorage.setItem("superAdminToken", data.token);
      if (data.profile) {
        localStorage.setItem("superAdminProfile", JSON.stringify(data.profile));
      }
      toast.success("Welcome, Super Admin!");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Render loading check ──
  if (step === "checking") {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-[Inter,sans-serif]">
        <Loader2 size={28} className="animate-spin text-saffron" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 font-[Inter,sans-serif]">
      {/* Subtle background pattern */}
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
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-br from-saffron/20 via-transparent to-saffron/10 rounded-3xl blur-xl" />

        <div className="relative bg-white rounded-2xl border border-border shadow-[0_20px_60px_rgba(15,14,11,0.12)] overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-saffron via-saffron2 to-saffron" />

          <div className="p-8 sm:p-10">
            {/* Icon */}
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

            <AnimatePresence mode="wait">
              {/* ════════ SETUP STEP ════════ */}
              {step === "setup" && (
                <Motion.div
                  key="setup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-ink tracking-tight">
                      First-Time Setup
                    </h1>
                    <p className="text-sm text-muted mt-1.5">
                      Create your Super Admin profile
                    </p>
                  </div>
                  <form onSubmit={handleSetup} className="space-y-4">
                    <InputField
                      icon={KeyRound}
                      type="password"
                      value={setupForm.secretKey}
                      onChange={(v) =>
                        setSetupForm((p) => ({ ...p, secretKey: v }))
                      }
                      placeholder="Super Admin Secret Key"
                    />
                    <InputField
                      icon={User}
                      type="text"
                      value={setupForm.name}
                      onChange={(v) =>
                        setSetupForm((p) => ({ ...p, name: v }))
                      }
                      placeholder="Your Name"
                    />
                    <InputField
                      icon={Mail}
                      type="email"
                      value={setupForm.email}
                      onChange={(v) =>
                        setSetupForm((p) => ({ ...p, email: v }))
                      }
                      placeholder="Your Email"
                    />
                    <InputField
                      icon={Lock}
                      type="password"
                      value={setupForm.password}
                      onChange={(v) =>
                        setSetupForm((p) => ({ ...p, password: v }))
                      }
                      placeholder="Set a Password"
                    />
                    <SubmitButton loading={loading} text="Create Profile" />
                  </form>
                </Motion.div>
              )}

              {/* ════════ EMAIL STEP ════════ */}
              {step === "email" && (
                <Motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-ink tracking-tight">
                      Super Admin
                    </h1>
                    <p className="text-sm text-muted mt-1.5">
                      We&apos;ll send a verification code to your email
                    </p>
                  </div>
                  <form onSubmit={handleRequestOtp} className="space-y-5">
                    <InputField
                      icon={Mail}
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="Enter your admin email"
                      autoFocus
                    />
                    <SubmitButton loading={loading} text="Send OTP" />
                  </form>
                </Motion.div>
              )}

              {/* ════════ OTP STEP ════════ */}
              {step === "otp" && (
                <Motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-ink tracking-tight">
                      Enter OTP
                    </h1>
                    <p className="text-sm text-muted mt-1.5">
                      Code sent to{" "}
                      <span className="font-semibold text-ink">{email}</span>
                    </p>
                  </div>
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                        Verification Code
                      </label>
                      <div className="flex justify-between gap-2 sm:gap-3" onPaste={(e) => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
                        if (pasted) {
                          setOtp(pasted);
                          const nextIndex = Math.min(pasted.length, 5);
                          document.getElementById(`otp-input-${nextIndex}`)?.focus();
                        }
                      }}>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <input
                            key={index}
                            id={`otp-input-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            value={otp[index] || ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (!val) return;
                              
                              // Handle paste within the input or fast typing
                              if (val.length > 1) {
                                // Extract the newly typed digit (if old was "2" and new is "25" -> "5")
                                // If they pasted, just take the whole thing
                                if (val.length >= 6) {
                                  setOtp(val.slice(0, 6));
                                  document.getElementById(`otp-input-5`)?.focus();
                                  return;
                                }
                                val = val.replace(otp[index] || "", "").charAt(0) || val.slice(-1);
                              }
                              
                              let newOtp = otp.split("");
                              newOtp[index] = val;
                              setOtp(newOtp.join(""));
                              if (index < 5) {
                                document.getElementById(`otp-input-${index + 1}`)?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace") {
                                e.preventDefault();
                                let newOtp = otp.split("");
                                if (otp[index]) {
                                  newOtp.splice(index, 1);
                                  setOtp(newOtp.join(""));
                                } else if (index > 0) {
                                  newOtp.splice(index - 1, 1);
                                  setOtp(newOtp.join(""));
                                  document.getElementById(`otp-input-${index - 1}`)?.focus();
                                }
                              } else if (e.key === "ArrowLeft" && index > 0) {
                                e.preventDefault();
                                document.getElementById(`otp-input-${index - 1}`)?.focus();
                              } else if (e.key === "ArrowRight" && index < 5) {
                                e.preventDefault();
                                document.getElementById(`otp-input-${index + 1}`)?.focus();
                              }
                            }}
                            autoFocus={index === 0}
                            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-paper border border-border rounded-xl text-ink focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition-all shadow-sm"
                          />
                        ))}
                      </div>
                    </div>

                    <SubmitButton loading={loading} text="Verify & Login" />

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setOtp("");
                          setStep("email");
                        }}
                        className="text-xs font-semibold text-muted hover:text-ink flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft size={12} /> Change email
                      </button>
                      <button
                        type="button"
                        disabled={countdown > 0 || loading}
                        onClick={async () => {
                          try {
                            const data = await superAdminRequestOtp(
                              email.trim(),
                            );
                            toast.success("New OTP sent!");
                            setCountdown(60);
                            setOtp("");
                          } catch (err) {
                            toast.error(err.message);
                          }
                        }}
                        className="text-xs font-semibold text-saffron hover:text-saffron2 disabled:text-muted2 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {countdown > 0
                          ? `Resend in ${countdown}s`
                          : "Resend OTP"}
                      </button>
                    </div>
                  </form>
                </Motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
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

function InputField({ icon: Icon, type, value, onChange, placeholder, autoFocus }) {
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

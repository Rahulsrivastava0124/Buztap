import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Utensils,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  requestEmailOtp,
  verifyEmailOtp,
  resetAdminPassword,
} from "../services/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);
  const otpInputRefs = useRef([]);

  function startCooldown(seconds) {
    setCooldown(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendOtp() {
    const val = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      toast.error("Enter a valid email address");
      return;
    }
    try {
      setSendingOtp(true);
      await requestEmailOtp(val, "reset-password");
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (err) {
      if (err?.retryAfterSeconds) {
        startCooldown(err.retryAfterSeconds);
        toast.error(`Wait ${err.retryAfterSeconds}s before resending`);
      } else {
        toast.error(err?.message || "Unable to send OTP");
      }
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }
    try {
      setVerifyingOtp(true);
      const res = await verifyEmailOtp(
        email.trim().toLowerCase(),
        "reset-password",
        otp.trim(),
      );
      setOtpToken(res.otpToken);
      toast.success("OTP verified");
      setStep(3);
    } catch (err) {
      setOtpToken("");
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
    const focusIndex = Math.min(pasted.length - 1, 5);
    otpInputRefs.current[focusIndex]?.focus();
  }

  async function handleReset() {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setResetting(true);
      await resetAdminPassword(
        email.trim().toLowerCase(),
        otpToken,
        newPassword,
      );
      setStep(4);
    } catch (err) {
      toast.error(err?.message || "Unable to reset password");
    } finally {
      setResetting(false);
    }
  }

  const steps = ["Email", "Verify OTP", "New Password"];

  return (
    <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center p-4 font-[Inter,sans-serif]">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-10">
          <span className="w-9 h-9 bg-[#e8720c] rounded-xl flex items-center justify-center shadow-[0_2px_12px_rgba(232,114,12,0.35)]">
            <Utensils size={17} className="text-white" strokeWidth={2.3} />
          </span>
          <span className="font-display font-bold text-[#0f0e0b] text-xl tracking-tight">
            BuzTap
          </span>
        </Link>

        {/* Card */}
        <div className="bg-white border border-[#e8e3da] rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] overflow-hidden">
          {/* Card Header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#f0ebe0]">
            <h1 className="text-2xl font-bold text-[#0f0e0b] tracking-tight">
              Reset password
            </h1>
            <p className="text-sm text-[#857c6e] mt-1">
              {step === 1 &&
                "Enter your registered email to receive a one-time code."}
              {step === 2 && `We sent a 6-digit code to ${email}.`}
              {step === 3 && "Choose a new secure password for your account."}
              {step === 4 && "Your password has been updated successfully."}
            </p>
          </div>

          {/* Step Indicator — only steps 1-3 */}
          {step < 4 && (
            <div className="px-8 pt-5 flex items-center gap-0">
              {steps.map((label, i) => {
                const num = i + 1;
                const done = step > num;
                const active = step === num;
                return (
                  <div
                    key={label}
                    className="flex items-center flex-1 last:flex-none"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                          done
                            ? "bg-[#e8720c] text-white"
                            : active
                              ? "bg-[#0f0e0b] text-white"
                              : "bg-[#f0ebe0] text-[#b0a898]"
                        }`}
                      >
                        {done ? "✓" : num}
                      </div>
                      <span
                        className={`text-[10px] font-medium whitespace-nowrap ${active ? "text-[#0f0e0b]" : done ? "text-[#e8720c]" : "text-[#b0a898]"}`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`flex-1 h-px mx-2 mb-4 ${step > num ? "bg-[#e8720c]" : "bg-[#e8e3da]"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Body */}
          <div className="px-8 py-7 space-y-4">
            {/* Step 1 — Email */}
            {step === 1 && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0f0e0b] uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b0a898]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#faf7f2] border border-[#e0d9ce] rounded-xl text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:ring-2 focus:ring-[#e8720c]/20 focus:border-[#e8720c] transition-all"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || cooldown > 0}
                  className="w-full py-3 bg-[#e8720c] hover:bg-[#d4620a] disabled:opacity-55 text-white font-semibold text-sm rounded-xl transition-colors shadow-[0_3px_12px_rgba(232,114,12,0.25)] flex items-center justify-center gap-2"
                >
                  {sendingOtp ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                      Sending...
                    </>
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </>
            )}

            {/* Step 2 — OTP */}
            {step === 2 && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0f0e0b] uppercase tracking-wide">
                    One-Time Code
                  </label>
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
                        onChange={(e) =>
                          handleOtpBoxChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleOtpBoxKeyDown(index, e)}
                        onPaste={handleOtpBoxPaste}
                        className="w-11 h-12 sm:w-12 sm:h-12 text-center bg-[#faf7f2] border border-[#cfd5de] rounded-xl text-[#0f0e0b] focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-500 transition-all font-semibold text-lg"
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || cooldown > 0}
                    className="text-xs text-[#e8720c] hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {cooldown > 0
                      ? `Resend code in ${cooldown}s`
                      : "Resend code"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                    }}
                    className="py-3 border border-[#e0d9ce] bg-white hover:bg-[#faf7f2] text-[#0f0e0b] font-semibold text-sm rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || otp.length !== 6}
                    className="py-3 bg-[#e8720c] hover:bg-[#d4620a] disabled:opacity-55 text-white font-semibold text-sm rounded-xl transition-colors shadow-[0_3px_12px_rgba(232,114,12,0.25)] flex items-center justify-center gap-2"
                  >
                    {verifyingOtp ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Step 3 — New Password */}
            {step === 3 && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0f0e0b] uppercase tracking-wide">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b0a898]" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-3 bg-[#faf7f2] border border-[#e0d9ce] rounded-xl text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:ring-2 focus:ring-[#e8720c]/20 focus:border-[#e8720c] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0a898] hover:text-[#0f0e0b] transition-colors"
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0f0e0b] uppercase tracking-wide">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b0a898]" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReset()}
                      placeholder="Repeat new password"
                      className="w-full pl-10 pr-10 py-3 bg-[#faf7f2] border border-[#e0d9ce] rounded-xl text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:ring-2 focus:ring-[#e8720c]/20 focus:border-[#e8720c] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0a898] hover:text-[#0f0e0b] transition-colors"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetting}
                  className="w-full py-3 bg-[#e8720c] hover:bg-[#d4620a] disabled:opacity-55 text-white font-semibold text-sm rounded-xl transition-colors shadow-[0_3px_12px_rgba(232,114,12,0.25)] flex items-center justify-center gap-2"
                >
                  {resetting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </>
            )}

            {/* Step 4 — Success */}
            {step === 4 && (
              <div className="py-4 flex flex-col items-center gap-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
                  <CheckCircle2
                    size={32}
                    className="text-green-500"
                    strokeWidth={1.8}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0f0e0b]">
                    Password updated!
                  </h2>
                  <p className="text-sm text-[#857c6e] mt-1">
                    You can now sign in with your new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="w-full py-3 bg-[#e8720c] hover:bg-[#d4620a] text-white font-semibold text-sm rounded-xl transition-colors shadow-[0_3px_12px_rgba(232,114,12,0.25)]"
                >
                  Go to Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Back to login */}
        {step < 4 && (
          <Link
            to="/auth"
            className="flex items-center justify-center gap-1.5 mt-6 text-sm text-[#857c6e] hover:text-[#0f0e0b] transition-colors"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        )}
      </div>
    </div>
  );
}

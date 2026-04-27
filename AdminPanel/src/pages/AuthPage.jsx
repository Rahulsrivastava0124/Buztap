import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Utensils,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [loginMethod, setLoginMethod] = useState("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, subdomain } = useAuth();
  const navigate = useNavigate();

  function validate() {
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
    } else {
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
    if (submitting) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const result = await login(identifier, password);
    if (result.success) {
      const targetSlug = result.subdomain || subdomain;
      if (!targetSlug) {
        toast.error("Could not resolve business URL. Please contact support.");
        setSubmitting(false);
        return;
      }
      toast.success("Signed in successfully");
      navigate(`/${targetSlug}/dashboard/overview`);
    } else {
      toast.error("Invalid phone/email or password");
    }
    setSubmitting(false);
  };

  function handleIdentifierChange(e) {
    const raw = e.target.value;
    const cleaned =
      loginMethod === "phone" ? raw.replace(/[^\d\s+\-().]/g, "") : raw;
    setIdentifier(cleaned);
    if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: "" }));
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
  }

  function switchMethod(method) {
    setLoginMethod(method);
    setIdentifier("");
    setErrors({});
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
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0 w-fit"
          >
            <span className="w-10 h-10 bg-[#e8720c] rounded-xl flex items-center justify-center shadow-[0_2px_15px_rgba(232,114,12,0.4)]">
              <Utensils size={20} className="text-white" strokeWidth={2.2} />
            </span>
            <span className="font-display font-bold text-white text-2xl tracking-tight">
              BuzTap
            </span>
          </Link>

          <div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-6">
              Turn tables faster.
              <br />
              <span className="text-[#e8720c]">Delight guests.</span>
            </h2>
            <p className="text-[#e8e0d4] text-lg max-w-md leading-relaxed selection:bg-[#e8720c]/30">
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
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="font-display font-bold text-[#0f0e0b] text-xl tracking-tight">
              BuzTap
            </span>
            <span className="w-8 h-8 bg-[#e8720c] rounded-lg flex items-center justify-center shadow-[0_2px_10px_rgba(232,114,12,0.3)]">
              <Utensils size={16} className="text-white" strokeWidth={2.2} />
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-[#0f0e0b] mb-2">
              Welcome back
            </h1>
            <p className="text-[#857c6e] text-sm">
              Enter your details to access your dashboard.
            </p>
          </div>

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
                {loginMethod === "phone" ? "Phone Number" : "Email Address"}
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
                  type={loginMethod === "phone" ? "tel" : "email"}
                  inputMode={loginMethod === "phone" ? "numeric" : "email"}
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
                  autoComplete={loginMethod === "phone" ? "tel" : "email"}
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
                <a
                  href="#"
                  className="text-xs font-medium text-[#e8720c] hover:underline"
                >
                  Forgot password?
                </a>
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
              disabled={submitting}
              className="w-full py-3 mt-6 bg-[#e8720c] hover:bg-[#d4620a] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_4px_14px_rgba(232,114,12,0.25)] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

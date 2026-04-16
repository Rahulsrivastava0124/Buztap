import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Utensils,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const success = login(email, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid username or password.");
    }
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
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0 w-fit"
          >
            <span className="w-10 h-10 bg-[#e8720c] rounded-xl flex items-center justify-center shadow-[0_2px_15px_rgba(232,114,12,0.4)]">
              <Utensils size={20} className="text-white" strokeWidth={2.2} />
            </span>
            <span className="font-display font-bold text-white text-2xl tracking-tight">
              restroMenu
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
              restroMenu
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

          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0f0e0b]">
                Email Address (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#b0a898]" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-shadow"
                  placeholder="admin"
                  required
                />
              </div>
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-shadow"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b0a898] hover:text-[#0f0e0b] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-6 bg-[#e8720c] hover:bg-[#d4620a] text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_4px_14px_rgba(232,114,12,0.25)] flex items-center justify-center gap-2"
            >
              Sign In <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Utensils, Mail, Lock, Building, User, ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
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
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 w-fit">
            <span className="w-10 h-10 bg-[#e8720c] rounded-xl flex items-center justify-center shadow-[0_2px_15px_rgba(232,114,12,0.4)]">
              <Utensils size={20} className="text-white" strokeWidth={2.2} />
            </span>
            <span className="font-display font-bold text-white text-2xl tracking-tight">
              restroMenu
            </span>
          </Link>

          <div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-6">
              Turn tables faster.<br />
              <span className="text-[#e8720c]">Delight guests.</span>
            </h2>
            <p className="text-[#e8e0d4] text-lg max-w-md leading-relaxed selection:bg-[#e8720c]/30">
              Join thousands of restaurants revolutionizing the dining experience with instant digital ordering.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Side Form ── */}
      <div className="flex flex-col justify-center p-6 sm:p-12 lg:p-20 relative bg-white min-h-screen md:min-h-0">
        
        {/* Desktop Back Button */}
        <button 
          onClick={() => navigate("/")} 
          className="hidden md:flex absolute top-8 right-8 items-center gap-2 text-sm font-semibold text-[#857c6e] hover:text-[#0f0e0b] transition-colors"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        {/* Mobile Header */}
        <div className="md:hidden absolute top-6 left-6 right-6 flex items-center justify-between">
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f5f0e8] text-[#0f0e0b] hover:bg-[#e0d9ce] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          
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
          {/* Toggle Tab */}
          <div className="flex p-1 bg-[#f5f0e8] rounded-lg mb-8 relative">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-md z-10 transition-colors ${
                isLogin ? "text-[#0f0e0b]" : "text-[#857c6e] hover:text-[#0f0e0b]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-md z-10 transition-colors ${
                !isLogin ? "text-[#0f0e0b]" : "text-[#857c6e] hover:text-[#0f0e0b]"
              }`}
            >
              Register
            </button>
            {/* Sliding background */}
            <Motion.div
              layoutId="tabBackground"
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm"
              initial={false}
              animate={{
                left: isLogin ? "4px" : "calc(50%)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <Motion.div
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
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
                    <label className="text-xs font-semibold text-[#0f0e0b]">Email Address (Username)</label>
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
                      <label className="text-xs font-semibold text-[#0f0e0b]">Password</label>
                      <a href="#" className="text-xs font-medium text-[#e8720c] hover:underline">
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
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 mt-6 bg-[#e8720c] hover:bg-[#d4620a] text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_4px_14px_rgba(232,114,12,0.25)] flex items-center justify-center gap-2">
                    Sign In <ArrowRight size={16} />
                  </button>
                </form>
              </Motion.div>
            ) : (
              <Motion.div
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-8">
                  <h1 className="font-display text-3xl font-bold text-[#0f0e0b] mb-2">
                    Create your account
                  </h1>
                  <p className="text-[#857c6e] text-sm">
                    Start your 1 branch free plan. No credit card required.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0f0e0b]">Restaurant Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-4 w-4 text-[#b0a898]" />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-shadow"
                        placeholder="Spice Garden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0f0e0b]">Owner Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-[#b0a898]" />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-shadow"
                        placeholder="Jane Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0f0e0b]">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-[#b0a898]" />
                      </div>
                      <input
                        type="email"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-shadow"
                        placeholder="owner@restaurant.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0f0e0b]">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#b0a898]" />
                      </div>
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        className="w-full pl-10 pr-10 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm text-[#0f0e0b] placeholder-[#b0a898] focus:outline-none focus:border-[#e8720c] focus:ring-1 focus:ring-[#e8720c] transition-shadow"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b0a898] hover:text-[#0f0e0b] transition-colors"
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button onClick={() => navigate("/dashboard")} className="w-full py-3 mt-6 bg-[#e8720c] hover:bg-[#d4620a] text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_4px_14px_rgba(232,114,12,0.25)] flex items-center justify-center gap-2">
                    Create Account <ArrowRight size={16} />
                  </button>
                  
                  <p className="text-center text-xs text-[#857c6e] mt-4">
                    By registering, you agree to our <a href="#" className="underline hover:text-[#0f0e0b]">Terms of Service</a> and <a href="#" className="underline hover:text-[#0f0e0b]">Privacy Policy</a>.
                  </p>
                </form>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

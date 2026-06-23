import { useState, useRef } from "react";
import { Mail, Lock, ArrowRight, Building, User, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { requestEmailOtp, verifyEmailOtp, registerBusiness } from "../services/api";

export default function RegisterForm({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpToken, setOtpToken] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.businessName || !formData.ownerName || !formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await requestEmailOtp(formData.email.trim(), "register");
      toast.success("OTP sent to your email!");
      setShowOtp(true);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const verifyRes = await verifyEmailOtp(formData.email.trim(), "register", otp);
      
      const res = await registerBusiness({
        businessName: formData.businessName.trim(),
        ownerName: formData.ownerName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        username: formData.email.split("@")[0] || formData.ownerName.trim().replace(/\s+/g, ""),
        otpToken: verifyRes.otpToken,
      });

      toast.success("Account created successfully!");
      onRegisterSuccess();
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#0f0e0b]">Enter OTP sent to {formData.email}</label>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm focus:border-[#e8720c] focus:outline-none"
            placeholder="123456"
          />
        </div>
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full py-3 mt-6 bg-[#e8720c] hover:bg-[#d4620a] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? "Verifying..." : "Complete Registration"} <ArrowRight size={16} />
        </button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSendOtp}>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#0f0e0b]">Restaurant Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building className="h-4 w-4 text-[#b0a898]" />
          </div>
          <input
            name="businessName"
            type="text"
            value={formData.businessName}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm focus:border-[#e8720c] focus:outline-none"
            placeholder="The Great Cafe"
            required
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
            name="ownerName"
            type="text"
            value={formData.ownerName}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm focus:border-[#e8720c] focus:outline-none"
            placeholder="John Doe"
            required
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
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm focus:border-[#e8720c] focus:outline-none"
            placeholder="you@example.com"
            required
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
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-10 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-lg text-sm focus:border-[#e8720c] focus:outline-none"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b0a898] hover:text-[#0f0e0b]"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-6 bg-[#e8720c] hover:bg-[#d4620a] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? "Sending OTP..." : "Create Account"} <ArrowRight size={16} />
      </button>
    </form>
  );
}

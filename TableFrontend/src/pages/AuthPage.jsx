import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import RegistrationModal from "../components/registration/RegistrationModal";
import useSEO from "../hooks/useSEO";

export default function AuthPage() {
  useSEO("auth");

  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const loginUrl =
    import.meta.env.VITE_ADMIN_URL || "https://restroadmin.buzingbee.com";

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper flex flex-col md:grid md:grid-cols-2 font-[Inter,sans-serif]">
      {/* ── Left Side Image / Brand ── */}
      <div className="hidden md:flex flex-col relative bg-black">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400"
          alt="Restaurant kitchen"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute inset-0 p-12 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 w-fit">
            <span className="rounded-2xl overflow-hidden">
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
        {/* Desktop Back Button */}
        <button
          onClick={() => navigate("/")}
          className="hidden md:flex absolute top-8 right-8 items-center gap-2 text-sm font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        {/* Mobile Header */}
        <div className="md:hidden absolute top-6 left-6 right-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-cream text-ink hover:bg-border transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="rounded-xl overflow-hidden">
              <img
                src="/logo.jpeg"
                alt="BuzTap logo"
                className="h-9 w-auto max-w-40 object-contain"
              />
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Motion.div
            key="register"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-ink mb-2">
                Get started free
              </h1>
              <p className="text-muted text-sm">
                Set up your restaurant in minutes. No credit card required.
              </p>
            </div>

            <div className="space-y-5">
              {/* Feature highlights */}
              <div className="rounded-2xl bg-paper border border-border p-5 space-y-3">
                {[
                  { icon: "🍽️", text: "Digital menu with QR ordering" },
                  { icon: "📊", text: "Real-time orders & table management" },
                  { icon: "📈", text: "Revenue reports & analytics" },
                  { icon: "👥", text: "Staff & role management" },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-3">
                    <span className="text-lg">{f.icon}</span>
                    <span className="text-sm text-ink2">{f.text}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setRegistrationModalOpen(true)}
                className="w-full py-3 bg-saffron hover:bg-saffron2 text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_4px_14px_rgba(232,114,12,0.25)] flex items-center justify-center gap-2"
              >
                Register your Restaurant <ArrowRight size={16} />
              </button>

              <p className="text-center text-sm text-muted">
                Already have an account?{" "}
                <a
                  href={loginUrl}
                  className="font-semibold text-saffron hover:underline"
                >
                  Sign In
                </a>
              </p>

              <p className="text-center text-xs text-muted">
                By registering, you agree to our{" "}
                <a href="#" className="underline hover:text-ink">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-ink">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </Motion.div>
        </div>
      </div>

      <RegistrationModal
        isOpen={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        onComplete={() => {
          window.location.href = loginUrl;
        }}
      />
    </div>
  );
}

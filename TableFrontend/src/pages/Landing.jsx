import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Globe,
  Menu,
  QrCode,
  ShieldCheck,
  Smartphone,
  Star,
  Users,
  Utensils,
  WandSparkles,
  X,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import {
  NAV_ITEMS,
  STATS,
  FEATURES,
  HOW_STEPS,
  PLANS,
  TESTIMONIALS,
  FAQS,
} from "../data/database";

import {
  FeatureCard,
  AnimatedPhone,
  GuestPhone,
  GuestJourneyAnimation,
  FaqItem,
  DesktopAdminScreen,
  PosWorkflowMock,
} from "../components/landing";

const Motion = motion;

/* ── Framer variants ───────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.48 } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function Landing() {
  const navigate = useNavigate();
  const openRegister = () => {
    navigate("/auth");
  };

  /* scroll-reveal */
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* how-it-works active step */
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setActiveStep((s) => (s + 1) % HOW_STEPS.length),
      3000,
    );
    return () => clearInterval(t);
  }, []);

  /* scroll shadow */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* FAQ */
  const [openFaq, setOpenFaq] = useState(null);

  /* mobile nav */
  const [mobileOpen, setMobileOpen] = useState(false);

  /* smooth-scroll */
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <div className="bg-[#faf7f2] text-[#0f0e0b] font-[Inter,sans-serif] overflow-x-hidden">
      {/* ════════════════ 1. NAVBAR ════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 bg-[#faf7f2] border-b border-[#e0d9ce] transition-shadow duration-300 ${scrolled ? "shadow-[0_4px_24px_rgba(15,14,11,0.09)]" : ""}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-6">
          {/* ── Logo ── */}
          <a href="#" className="flex items-center gap-2.5 flex-shrink-0">
            <span className="w-9 h-9 bg-[#e8720c] rounded-lg flex items-center justify-center shadow-[0_2px_10px_rgba(232,114,12,0.32)]">
              <Utensils size={17} className="text-white" strokeWidth={2.2} />
            </span>
            <span className="font-display font-bold text-[#0f0e0b] text-xl tracking-tight">
              restro<span className="text-[#e8720c]">Menu</span>
            </span>
          </a>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.path) navigate(item.path);
                  else if (item.id) scrollTo(item.id);
                }}
                className="px-3.5 py-2 text-sm font-medium text-[#2a2720] hover:text-[#0f0e0b] hover:bg-[#f0ebe0] transition-colors rounded-md"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* ── Desktop Right Actions ── */}
          <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
            <button
              onClick={openRegister}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#e8720c] hover:bg-[#d4620a] text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_2px_10px_rgba(232,114,12,0.28)]"
            >
              Register <ArrowRight size={14} />
            </button>
          </div>

          {/* ── Mobile Toggle ── */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-[#fef0e4] transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* ── Mobile Drawer ── */}
        <AnimatePresence>
          {mobileOpen && (
            <Motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden absolute top-[68px] left-0 w-full overflow-hidden border-t border-b border-[#e0d9ce] bg-white shadow-2xl"
            >
              <div className="px-4 py-4 flex flex-col gap-0.5">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.path) navigate(item.path);
                      else if (item.id) scrollTo(item.id);
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2.5 text-sm font-semibold text-[#0f0e0b] rounded-lg hover:bg-[#faf7f2] transition-colors text-left"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-[#e0d9ce] mt-3 pt-3 flex flex-col gap-2">
                  <button
                    onClick={openRegister}
                    className="w-full py-3 text-sm font-bold text-white bg-[#e8720c] hover:bg-[#d4620a] rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Register <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ════════════════ 2. HERO ══════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
        {/* text */}
        <div>
          <Motion.span
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#fef0e4] text-[#e8720c] text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8720c] pulse-dot" />
            Trusted by 12 000+ restaurants & hotels across India
          </Motion.span>

          <Motion.h1
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] tracking-wide text-[#0f0e0b] mb-5"
          >
            Digital Menus.
            <br />
            <span className="text-[#e8720c]">Table Orders.</span>
            <br />
            Zero Friction.
          </Motion.h1>

          <Motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-[#857c6e] text-lg leading-relaxed mb-8 max-w-md"
          >
            Give every table its own QR code. Guests scan, browse your live menu
            and order — all from their phone. Plus, manage billing with built-in
            POS for both restaurants and hotels.
          </Motion.p>

          <Motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-wrap gap-3"
          >
            <button
              onClick={openRegister}
              className="bg-[#e8720c] hover:bg-[#d4620a] text-white font-semibold px-7 py-3 rounded-md flex items-center gap-2 transition-colors"
            >
              Start Free <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/demo")}
              className="border border-[#e0d9ce] text-[#0f0e0b] font-semibold px-7 py-3 rounded-md hover:border-[#e8720c] hover:text-[#e8720c] transition-colors"
            >
              View Live Demo
            </button>
          </Motion.div>

          <Motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="flex items-center gap-4 mt-8"
          >
            <div className="flex -space-x-2">
              {["PS", "RM", "AS", "KT"].map((init) => (
                <div
                  key={init}
                  className="w-8 h-8 rounded-full bg-[#e0d9ce] border-2 border-[#faf7f2] flex items-center justify-center"
                >
                  <span className="text-[9px] font-bold text-[#0f0e0b]">
                    {init}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#857c6e]">
              <span className="font-semibold text-[#0f0e0b]">4.9 / 5</span> from
              2 800+ reviews
            </p>
          </Motion.div>
        </div>

        {/* phone mock */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="flex justify-center w-full min-h-[550px]"
        >
          <GuestJourneyAnimation />
        </Motion.div>
      </section>

      {/* ════════════════ 2.5. DEMO QR STRIP ════════════════════════ */}
      <section className="bg-[#e8720c] z-10 relative mt-10 mb-20 w-full overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 blur-[100px] rounded-full pointer-events-none" />

        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-12 relative"
        >
          {/* Left Text */}
          <div className="flex-1 text-left relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pulse-dot"></span>
              <span className="text-[11px] font-bold text-white tracking-widest uppercase bg-white/20 px-2.5 py-1 rounded-md">
                Live Interactive Demo
              </span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-white mb-5 leading-[1.15] tracking-tight drop-shadow-sm">
              Experience the zero-friction guest menu.
            </h3>
            <p className="text-white/90 text-base sm:text-lg max-w-xl leading-relaxed mb-8 font-medium">
              Don't just take our word for it. Point your smartphone camera at
              the QR code to instantly see exactly how your customers will
              browse, order, and interact with the digital menu.
            </p>

            <div className="flex flex-wrap items-center gap-5 sm:gap-8">
              <div className="flex items-center gap-2 text-white text-sm font-bold">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </div>{" "}
                Instant Loading
              </div>
              <div className="flex items-center gap-2 text-white text-sm font-bold">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </div>{" "}
                Native App Feel
              </div>
              <div className="flex items-center gap-2 text-white text-sm font-bold">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </div>{" "}
                Table-Specific
              </div>
            </div>
          </div>

          {/* Right QR Code */}
          <div
            onClick={() => navigate("/demo")}
            className="flex-shrink-0 bg-white p-2.5 sm:p-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative z-10 group overflow-hidden border border-white cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#e8720c]/15 to-transparent scan-line pointer-events-none" />
            <div className="border border-[#e0d9ce]/50 rounded-xl overflow-hidden bg-white group-hover:border-[#e8720c]/50 transition-colors">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(window.location.origin + "/demo")}&bgcolor=ffffff&color=0f0e0b`}
                alt="Live Demo QR"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain mix-blend-multiply"
              />
            </div>
            <div className="text-center mt-3 mb-1">
              <p className="font-bold text-[#0f0e0b] text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                <QrCode size={16} className="text-[#e8720c]" /> Scan or Click
              </p>
              <p className="text-[10px] text-[#857c6e] mt-1 font-medium uppercase tracking-wider">
                Demo Link
              </p>
            </div>
          </div>
        </Motion.div>
      </section>

      {/* ════════════════ 3. STATS BAR ═════════════════════════════ */}
      <section className="bg-white border-y border-[#e0d9ce]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-roboto text-3xl font-bold text-[#e8720c] tracking-tight">
                {s.value}
              </p>
              <p className="text-sm text-[#857c6e] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ 3.5. HOTEL ROOM SERVICE ════════════════ */}
      <section className="py-24 bg-white border-b border-[#e0d9ce] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 order-2 md:order-1">
              <Motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="inline-flex items-center gap-2 bg-[#fef0e4] text-[#e8720c] text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
                  Beyond Restaurants
                </p>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#0f0e0b] mb-6 leading-tight">
                  Seamless Room Service for{" "}
                  <span className="text-[#e8720c]">Modern Hotels</span>
                </h2>
                {/* <p className="text-[#857c6e] text-lg leading-relaxed mb-8">
                  Elevate your guest experience with our QR-based room service
                  solution. Guests scan the QR in their room to place orders
                  directly. 
                </p> */}

                <div className="space-y-4">
                  {[
                    {
                      title: "In-Room QR Scanning",
                      desc: "Guests scan the code from their bedside or desk without picking up the phone.",
                    },
                    {
                      title: "Reception Dashboard",
                      desc: "Front desk receives and verifies the orders, updating room billing automatically.",
                    },
                    {
                      title: "Instant Kitchen Transfer",
                      desc: "Approved orders instantly flow to the kitchen to speed up preparation.",
                    },
                    {
                      title: "Unified Hotel POS",
                      desc: "All room service, dine-in, and outlet orders stay synced in one POS for clean billing and reports.",
                    },
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl border border-[#e0d9ce] bg-[#faf7f2] hover:border-[#e8720c]/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-[#e0d9ce] flex items-center justify-center flex-shrink-0 text-[#e8720c] font-bold text-lg">
                        0{idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-[#0f0e0b]">
                          {feature.title}
                        </p>
                        <p className="text-sm text-[#857c6e] mt-1">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Motion.div>
            </div>
            <div className="flex-1 order-1 md:order-2 flex justify-center w-full">
              <Motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"
                  alt="Luxury Hotel Room"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0b]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] pulse-dot"></span>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/90">
                      Live Integration
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white">
                    Room 304 ordered 2x Club Sandwich. Forwarding to Kitchen
                    queue...
                  </p>
                </div>
              </Motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ 4. FEATURES ══════════════════════════════ */}
      <section
        id="features"
        className="bg-[#faf7f2] py-24 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,114,12,0.08),transparent_40%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 relative z-10">
            <p className="text-xs font-semibold text-[#e8720c] tracking-widest uppercase mb-4">
              Everything Free
            </p>
            <h2 className="font-display text-xl sm:text-2xl lg:text-5xl font-bold text-[#0f0e0b] leading-tight">
              All Features,{" "}
              <span className="bg-linear-to-r text-[#e8720c] ">Zero Cost</span>
            </h2>
            <p className="text-[#857c6e] mt-5 max-w-3xl mx-auto text-lg leading-relaxed">
              Every feature below is completely free. No premium tiers, no
              paywalls, no upgrade-to-unlock nonsense. Your success is our
              success.
            </p>
          </div>

          <Motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 relative z-10"
          >
            {FEATURES.map((feature) => (
              <Motion.div key={feature.title} variants={fadeUp}>
                <FeatureCard feature={feature} />
              </Motion.div>
            ))}
          </Motion.div>

          <div className="mt-10 flex justify-center relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-white/90 px-4 py-2 text-sm font-medium text-[#857c6e] shadow-[0_8px_24px_rgba(15,14,11,0.05)]">
              <span className="w-2 h-2 rounded-full bg-[#3a6348]" />
              No setup fee • No monthly charge • No hidden cost
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ 4.5. ADVANTAGES ════════════════════════════ */}
      <section className="bg-[#e8720c] py-24 relative overflow-hidden">
        {/* Subtle background glow to fit theme */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-white opacity-10 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16 reveal visible">
            <p className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              Features
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-5 max-w-3xl mx-auto leading-tight">
              Transforming Dining with Digital QR Code Menu Advantages
            </h2>
            <p className="text-[#fef0e4] text-lg max-w-2xl mx-auto leading-relaxed">
              Provides a faster, smarter, and more interactive dining experience
              while simplifying restaurant operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1 */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              className="bg-white border border-transparent rounded-2xl overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-[rgba(0,0,0,0.1)] transition-all duration-300"
            >
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80"
                  alt="Staff holding tablet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
              </div>
              <div className="p-8 pt-4 flex-1 flex flex-col relative z-10">
                <h3 className="text-[17px] font-bold text-[#0f0e0b] mb-3 tracking-tight">
                  Enhancing Customer Experience
                </h3>
                <p className="text-[#857c6e] text-sm leading-relaxed mb-6 flex-1">
                  Digital menus load faster, are easier to use, and provide more
                  useful information to customers, including dish ingredients
                  and allergen warnings directly in their hands.
                </p>
                <button className="text-[#e8720c] font-semibold text-[13px] flex items-center gap-1.5 hover:gap-2.5 transition-all self-start">
                  Read more <ArrowRight size={14} />
                </button>
              </div>
            </Motion.div>

            {/* Card 2 */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-transparent rounded-2xl overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-[rgba(0,0,0,0.1)] transition-all duration-300"
            >
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80"
                  alt="Restaurant storefront"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
              </div>
              <div className="p-8 pt-4 flex-1 flex flex-col relative z-10">
                <h3 className="text-[17px] font-bold text-[#0f0e0b] mb-3 tracking-tight">
                  Attracting New Customers
                </h3>
                <p className="text-[#857c6e] text-sm leading-relaxed mb-6 flex-1">
                  Guests can leave reviews directly through the QR menu. Plus,
                  built-in multilingual support helps attract foreign customers
                  and turn foot traffic into loyal dining patrons.
                </p>
                <button className="text-[#e8720c] font-semibold text-[13px] flex items-center gap-1.5 hover:gap-2.5 transition-all self-start">
                  Read more <ArrowRight size={14} />
                </button>
              </div>
            </Motion.div>

            {/* Card 3 */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-transparent rounded-2xl overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-[rgba(0,0,0,0.1)] transition-all duration-300"
            >
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"
                  alt="Customers scanning QR code"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
              </div>
              <div className="p-8 pt-4 flex-1 flex flex-col relative z-10">
                <h3 className="text-[17px] font-bold text-[#0f0e0b] mb-3 tracking-tight">
                  QR Code Menu Increases Sales
                </h3>
                <p className="text-[#857c6e] text-sm leading-relaxed mb-6 flex-1">
                  Food photos and an interactive menu presentation encourage
                  customers to order more items and upsells, meaningfully
                  increasing the average bill amount effortlessly.
                </p>
                <button className="text-[#e8720c] font-semibold text-[13px] flex items-center gap-1.5 hover:gap-2.5 transition-all self-start">
                  Read more <ArrowRight size={14} />
                </button>
              </div>
            </Motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════ 5. HOW IT WORKS ═════════════════════════ */}
      <section id="how-it-works" className="bg-[#f5f0e8] py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-[#e8720c] tracking-widest uppercase mb-3">
              How It Works
            </p>
            <h2 className="font-display text-4xl font-bold text-[#0f0e0b]">
              Live in 5 minutes
            </h2>
            <p className="text-[#857c6e] mt-3 max-w-lg mx-auto">
              Watch how BuzTap works step by step — from creating your menu to
              receiving your first order.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* steps */}
            <div className="space-y-3">
              {HOW_STEPS.map((s, i) => (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(i)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                    activeStep === i
                      ? "border-[#e8720c] bg-white"
                      : "border-[#e0d9ce] bg-transparent hover:border-[#e8720c]/50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      activeStep === i ? "bg-[#e8720c]" : "bg-[#e0d9ce]"
                    }`}
                  >
                    <s.icon
                      size={18}
                      className={
                        activeStep === i ? "text-white" : "text-[#857c6e]"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#e8720c] mb-0.5">
                      {s.step}
                    </p>
                    <p className="font-semibold text-[#0f0e0b]">{s.title}</p>
                    <p className="text-sm text-[#857c6e] mt-0.5">{s.desc}</p>
                  </div>
                  {activeStep === i && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#e8720c] mt-1.5 flex-shrink-0 pulse-dot" />
                  )}
                </button>
              ))}
            </div>

            {/* animated phone */}
            <div className="flex justify-center">
              <AnimatedPhone activeStep={activeStep} />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ 5.5. POS WORKFLOW ══════════════════════ */}
      <section className="bg-white py-24 border-y border-[#e0d9ce]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 reveal">
            <p className="text-xs font-semibold text-[#e8720c] tracking-widest uppercase mb-3">
              POS Steps
            </p>
            <h2 className="font-display text-4xl font-bold text-[#0f0e0b]">
              From menu to payment in seconds
            </h2>
            <p className="text-[#857c6e] mt-3 max-w-2xl mx-auto">
              Track each POS stage live — build the order, confirm checkout, and
              close payment with invoice sharing.
            </p>
          </div>

          <PosWorkflowMock />
        </div>
      </section>

      {/* ════════════════ 6. LIVE DEMO ════════════════════════════ */}
      <section id="live-demo" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-semibold text-[#e8720c] tracking-widest uppercase mb-3">
            Live Demo
          </p>
          <h2 className="font-display text-4xl font-bold text-[#0f0e0b]">
            Try the guest experience
          </h2>
          <p className="text-[#857c6e] mt-3 max-w-lg mx-auto">
            This is exactly what your guests see when they scan a table QR. Tap
            "+ Add" and place a demo order.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-16">
          <div className="float-anim">
            <GuestPhone />
          </div>
          <div className="max-w-sm space-y-6">
            {/* Scannable live demo QR */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              onClick={() => navigate("/demo")}
              className="bg-[#fef0e4] border border-[#e8720c]/30 p-5 rounded-2xl flex items-center gap-5 relative overflow-hidden cursor-pointer"
            >
              {/* Decorative scan line */}
              <div className="absolute top-0 left-6 w-16 h-full bg-gradient-to-b from-transparent via-[#e8720c]/10 to-transparent scan-line" />

              <div className="w-20 h-20 bg-white p-1.5 rounded-xl shadow-[0_2px_10px_rgba(232,114,12,0.15)] flex-shrink-0 relative z-10 border border-[#e8720c]/20">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + "/demo")}&bgcolor=ffffff&color=0f0e0b`}
                  alt="Scan to view responsive demo"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-[#e8720c] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e8720c] pulse-dot" />{" "}
                  Interactive Demo
                </p>
                <p className="font-bold text-[#0f0e0b] text-[15px] mb-1.5 leading-tight tracking-tight">
                  Scan with your phone
                </p>
                <p className="text-xs text-[#857c6e] leading-snug">
                  Experience the fast, responsive guest menu exactly as they do.
                </p>
              </div>
            </Motion.div>

            {[
              {
                icon: Smartphone,
                title: "No app download",
                body: "Opens directly in the guest's default browser after scanning the QR.",
              },
              {
                icon: WandSparkles,
                title: "Real-time menu",
                body: "Every item, price, and availability is live. Change it instantly in the admin panel.",
              },
              {
                icon: ShieldCheck,
                title: "Order confirmed instantly",
                body: 'Kitchen receives the order the moment the guest taps "Confirm".',
              },
              {
                icon: Clock,
                title: "Faster table turns",
                body: "Guests order on their own time. Average wait time drops by 40 %.",
              },
            ].map((item, i) => (
              <Motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-[#fef0e4] flex items-center justify-center flex-shrink-0">
                  <item.icon size={19} className="text-[#e8720c]" />
                </div>
                <div>
                  <p className="font-semibold text-[#0f0e0b]">{item.title}</p>
                  <p className="text-sm text-[#857c6e] mt-0.5">{item.body}</p>
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 7. PRICING ══════════════════════════════ */}
      <section id="pricing" className="bg-[#f5f0e8] py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 reveal">
            <p className="text-xs font-semibold text-[#e8720c] tracking-widest uppercase mb-3">
              Pricing
            </p>
            <h2 className="font-display text-4xl font-bold text-[#0f0e0b]">
              Simple, honest pricing
            </h2>
            <p className="text-[#857c6e] mt-3">
              Start free. Upgrade when you grow. No hidden fees.
            </p>
          </div>

          <Motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid md:grid-cols-2 max-w-3xl lg:max-w-4xl mx-auto gap-8"
          >
            {PLANS.map((plan) => (
              <Motion.div
                key={plan.name}
                variants={fadeUp}
                className={`rounded-xl p-7 flex flex-col ${
                  plan.highlight
                    ? "bg-[#3a6348] text-white shadow-xl"
                    : "bg-white border border-[#e0d9ce] text-[#0f0e0b]"
                }`}
              >
                {plan.badge && (
                  <span className="self-start text-xs font-semibold bg-[#e8720c] text-white px-3 py-1 rounded-full mb-4">
                    {plan.badge}
                  </span>
                )}
                <p
                  className={`font-semibold text-sm mb-1 ${plan.highlight ? "text-[#e8e0d4]" : "text-[#857c6e]"}`}
                >
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="font-roboto text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm mb-1.5 ${plan.highlight ? "text-[#e8e0d4]" : "text-[#857c6e]"}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2
                        size={15}
                        className={
                          plan.highlight
                            ? "text-[#e8720c] flex-shrink-0"
                            : "text-[#3a6348] flex-shrink-0"
                        }
                      />
                      <span
                        className={
                          plan.highlight ? "text-[#e8e0d4]" : "text-[#2a2720]"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={openRegister}
                  className={`w-full py-3 rounded-md font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? "bg-[#e8720c] hover:bg-[#d4620a] text-white"
                      : "border border-[#e0d9ce] hover:border-[#e8720c] hover:text-[#e8720c] text-[#0f0e0b]"
                  }`}
                >
                  {plan.cta}
                </button>
              </Motion.div>
            ))}
          </Motion.div>
        </div>
      </section>

      {/* ════════════════ 8. TESTIMONIALS ═════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-semibold text-[#e8720c] tracking-widest uppercase mb-3">
            Social Proof
          </p>
          <h2 className="font-display text-4xl font-bold text-[#0f0e0b]">
            Loved by restaurateurs
          </h2>
        </div>

        <Motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t) => (
            <Motion.div
              key={t.name}
              variants={fadeUp}
              className="bg-white border border-[#e0d9ce] rounded-xl p-7 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-[#e8720c] fill-[#e8720c]"
                  />
                ))}
              </div>
              <p className="text-sm text-[#2a2720] leading-relaxed flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#fef0e4] border border-[#e8720c]/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#e8720c]">
                    {t.avatar}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0f0e0b]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#857c6e]">{t.role}</p>
                </div>
              </div>
            </Motion.div>
          ))}
        </Motion.div>

        {/* logo strip */}
        <div className="mt-14 border-t border-[#e0d9ce] pt-10">
          <p className="text-center text-xs font-semibold text-[#b0a898] tracking-widest uppercase mb-6">
            Trusted by teams from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-[#b0a898]">
            {[
              "ITC Hotels",
              "Haldiram's",
              "Barbeque Nation",
              "Wow! Momo",
              "Chai Point",
              "Mainland China",
            ].map((brand) => (
              <span key={brand} className="text-sm font-semibold">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 9. ADMIN PANEL MOCKUP ════════════════════ */}
      <section className="bg-[#f5f0e8] py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold text-[#e8720c] tracking-widest uppercase mb-4">
                Analytics Dashboard
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#0f0e0b] mb-5 leading-tight">
                Understand your hotel's
                <br />
                performance instantly
              </h2>
              <p className="text-[#857c6e] leading-relaxed text-lg">
                View live revenue, track order volumes, and identify your
                best-selling items at a glance with our Resporto Hotel
                analytics.
              </p>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => navigate("/demo")}
                className="flex items-center gap-2 bg-[#e8720c] hover:bg-[#d4620a] text-white text-sm font-bold px-6 py-3 rounded-md transition-colors"
              >
                View Live Demo
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center justify-between">
            <div className="w-full lg:w-[300px] flex-shrink-0">
              <ul className="space-y-5 mb-10">
                {[
                  "Real-time revenue tracking and hour-by-hour insights",
                  "Monitor average order value and table turnaround times",
                  "Identify top-performing dishes to boost sales",
                  "Export detailed financial reports with one click",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-base text-[#2a2720]"
                  >
                    <CheckCircle2
                      size={20}
                      className="text-[#e8720c] flex-shrink-0"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden md:flex w-full max-w-[800px] justify-center lg:justify-end overflow-hidden">
              <div className=" w-full shadow-2xl rounded-2xl">
                <DesktopAdminScreen />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ 10. FAQ ══════════════════════════════════ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-12 reveal">
          <p className="text-xs font-semibold text-[#e8720c] tracking-widest uppercase mb-3">
            FAQ
          </p>
          <h2 className="font-display text-4xl font-bold text-[#0f0e0b]">
            Common questions
          </h2>
        </div>
        <div>
          {FAQS.map((faq, i) => (
            <FaqItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              open={openFaq === i}
              onToggle={() => setOpenFaq((prev) => (prev === i ? null : i))}
            />
          ))}
        </div>
      </section>

      {/* ════════════════ 11. FINAL CTA ═══════════════════════════ */}
      <section className="bg-[#e8720c] py-24">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto px-4 sm:px-6 text-center"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Your restaurant goes
            <br />
            digital today.
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-lg mx-auto">
            Free plan, forever. No credit card. Setup in under 5 minutes. Join
            12 000+ restaurants already on BuzTap.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#e8720c] font-bold text-base px-8 py-4 rounded-md hover:bg-[#fef0e4] transition-colors flex items-center justify-center gap-2">
              Create Free Account <ArrowRight size={18} />
            </button>
            <button className="border-2 border-white/40 text-white font-semibold text-base px-8 py-4 rounded-md hover:border-white transition-colors">
              See Full Demo
            </button>
          </div>
          <p className="text-white/60 text-sm mt-6">
            No credit card · Cancel anytime · Free tier always available
          </p>
        </Motion.div>
      </section>

      {/* ════════════════ 12. FOOTER ══════════════════════════════ */}
      <footer className="bg-[#faf7f2] border-t border-[#e0d9ce] text-[#857c6e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-[#e8720c] rounded-md flex items-center justify-center">
                <Utensils size={16} className="text-white" />
              </span>
              <span className="font-display font-bold text-[#0f0e0b] text-lg">
                BuzTap
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Digital QR menus and table ordering for India's restaurants and
              hotels.
            </p>
            <div className="flex gap-2">
              {[Users, Globe, Smartphone].map((Icon, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-md bg-white border border-[#e0d9ce] flex items-center justify-center hover:bg-[#fef0e4] hover:border-[#e8720c] transition-colors cursor-pointer"
                >
                  <Icon size={14} className="text-[#0f0e0b]" />
                </div>
              ))}
            </div>
          </div>

          {/* product */}
          <div>
            <p className="text-xs font-semibold text-[#0f0e0b] tracking-widest uppercase mb-4">
              Product
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                "Features",
                "Pricing",
                "How It Works",
                "Live Demo",
                "Changelog",
              ].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="hover:text-[#e8720c] transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* resources */}
          <div>
            <p className="text-xs font-semibold text-[#0f0e0b] tracking-widest uppercase mb-4">
              Resources
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                "Documentation",
                "API Reference",
                "Blog",
                "Case Studies",
                "Help Center",
              ].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="hover:text-[#e8720c] transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* company */}
          <div>
            <p className="text-xs font-semibold text-[#0f0e0b] tracking-widest uppercase mb-4">
              Company
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "About", to: "#" },
                { label: "Careers", to: "#" },
                { label: "Privacy Policy", to: "#" },
                { label: "Terms of Service", to: "#" },
                { label: "Contact", to: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  {l.to.startsWith("/") ? (
                    <Link
                      to={l.to}
                      className="hover:text-[#e8720c] transition-colors"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.to}
                      className="hover:text-[#e8720c] transition-colors"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#e0d9ce] max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} BuzTap. All rights reserved.</p>
          <p className="flex items-center gap-1 flex-wrap justify-center">
            Made with <span className="text-[#e8720c]">♥</span> for India&apos;s
            restaurants ·
            <a
              href="https://buzingbee.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-saffron hover:underline"
            >
              buzingbee.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

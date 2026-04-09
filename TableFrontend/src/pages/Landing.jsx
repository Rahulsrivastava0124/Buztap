import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  Globe,
  Menu,
  QrCode,
  ShieldCheck,
  Smartphone,
  Star,
  Upload,
  Users,
  Utensils,
  WandSparkles,
  X,
  Zap,
  BookOpen,
  FileText,
  LayoutGrid,
  PlayCircle,
  Monitor,
  TrendingUp,
  PieChart,
  Activity,
} from "lucide-react";

const Motion = motion;

/* ── Framer variants ───────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.48 } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

/* ── Data ──────────────────────────────────────────── */

const NAV_ITEMS = [
  { label: "Home", id: "home" },
  { label: "Features", id: "features" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Live Demo", id: "live-demo" },
  { label: "FAQ", id: "faq" },
  { label: "Contact Us", path: "/contact" },
];

const STATS = [
  { value: "12 000+", label: "Restaurants Live" },
  { value: "₹0", label: "Setup Cost" },
  { value: "5 min", label: "Go-Live Time" },
  { value: "4.9 ★", label: "Avg. Rating" },
];

const FEATURES = [
  {
    icon: QrCode,
    title: "QR Code Menu",
    body: "Customers scan and instantly see your menu. No app download needed.",
    accent: "#e8720c",
    glow: "rgba(232,114,12,0.12)",
    iconBg: "#fef0e4",
  },
  {
    icon: Smartphone,
    title: "Works on All Phones",
    body: "Beautiful menu experience on any smartphone browser.",
    accent: "#3b82f6",
    glow: "rgba(59,130,246,0.12)",
    iconBg: "#eff6ff",
  },
  {
    icon: BarChart3,
    title: "Free Analytics",
    body: "See what items are popular, peak hours, and customer traffic.",
    accent: "#3a6348",
    glow: "rgba(58,99,72,0.12)",
    iconBg: "#e8f2eb",
  },
  {
    icon: WandSparkles,
    title: "Easy Menu Editor",
    body: "Add items, update prices, upload photos — all from your phone.",
    accent: "#8b5cf6",
    glow: "rgba(139,92,246,0.12)",
    iconBg: "#f5f3ff",
  },
  {
    icon: Zap,
    title: "Instant Updates",
    body: "Change a price? It updates for customers immediately.",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.12)",
    iconBg: "#fffbeb",
  },
  {
    icon: ShieldCheck,
    title: "Veg / Non-Veg Badges",
    body: "Clear food type indicators for every item on your menu.",
    accent: "#10b981",
    glow: "rgba(16,185,129,0.12)",
    iconBg: "#ecfdf5",
  },
  {
    icon: Globe,
    title: "Multi-Language Ready",
    body: "Hindi, English, and more — serve customers in their language.",
    accent: "#0ea5e9",
    glow: "rgba(14,165,233,0.12)",
    iconBg: "#f0f9ff",
  },
  {
    icon: CheckCircle2,
    title: "Zero Cost",
    body: "No setup fees, no monthly charges, no hidden costs. Ever.",
    accent: "#f43f5e",
    glow: "rgba(244,63,94,0.12)",
    iconBg: "#fff1f2",
  },
];

const HOW_STEPS = [
  {
    step: "01",
    title: "Create Your Menu",
    desc: "Add categories, items, photos and prices from the admin panel.",
    icon: Upload,
    screen: "create",
  },
  {
    step: "02",
    title: "Generate QR Codes",
    desc: "One click prints table-specific QR codes ready to display.",
    icon: QrCode,
    screen: "qr",
  },
  {
    step: "03",
    title: "Guest Scans & Orders",
    desc: "Guest scans the QR, browses the live menu and places an order from their phone.",
    icon: Smartphone,
    screen: "order",
  },
  {
    step: "04",
    title: "Track & Grow",
    desc: "Monitor orders, revenue, and top dishes in the real-time analytics dashboard.",
    icon: BarChart3,
    screen: "analytics",
  },
];

const PLANS = [
  {
    name: "Single Branch",
    price: "₹0",
    period: "/forever",
    highlight: false,
    badge: null,
    features: [
      "1 branch completely free",
      "Unlimited menu items",
      "Unlimited QR scans",
      "Basic live analytics",
      "Email support",
    ],
    cta: "Start Free",
  },
  {
    name: "Multi-Branch",
    price: "₹50",
    period: "/extra branch /month",
    highlight: true,
    badge: "Pay as you grow",
    features: [
      "2 branches and more",
      "Everything in Single Branch",
      "Unified multi-branch analytics",
      "Centralized menu management",
      "Priority 24/7 support",
    ],
    cta: "Get Started",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Owner, Spice Garden, Pune",
    avatar: "PS",
    stars: 5,
    quote:
      "We went digital in under 10 minutes. Our tables turn 20 % faster because guests order without waiting for a waiter.",
  },
  {
    name: "Rajan Mehra",
    role: "F&B Manager, The Grand Hotel, Delhi",
    avatar: "RM",
    stars: 5,
    quote:
      "The kitchen alert system is a game-changer. Zero missed orders and the analytics help us plan our daily specials.",
  },
  {
    name: "Aisha Siddiqui",
    role: "Co-founder, Bites & Brews, Bangalore",
    avatar: "AS",
    stars: 5,
    quote:
      "Our guests love the experience. Average order value is up 18 % since we added item photos and combos.",
  },
];

const FAQS = [
  {
    q: "Do my guests need to download an app?",
    a: "No. Guests simply scan the QR with any smartphone camera and the menu opens instantly in the browser.",
  },
  {
    q: "Can I update my menu in real time?",
    a: "Yes. Any change you make in the admin panel reflects on every table's QR page within seconds.",
  },
  {
    q: "How many tables / QR codes can I create?",
    a: "Starter supports up to 10 tables. Pro allows unlimited tables. Enterprise adds multi-floor mapping.",
  },
  {
    q: "Is payment collection supported?",
    a: "Online payment at checkout (UPI, card, wallet) is available on Pro and Enterprise plans.",
  },
  {
    q: "Can I use my own branding on the menu page?",
    a: "Pro and above support custom logo, accent color, and a branded subdomain for your menu.",
  },
  {
    q: "What happens if there is no internet on the guest's phone?",
    a: "The menu page is cached via service-worker after the first load, so it remains accessible offline.",
  },
];

/* ── Phone animation screens ───────────────────────── */
const FOOD_ITEMS = [
  {
    name: "Paneer Butter Masala",
    price: 280,
    veg: true,
    desc: "320g",
    color: "#f5e3cc",
    img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=70",
  },
  {
    name: "Dal Makhani",
    price: 220,
    veg: true,
    desc: "280g",
    color: "#e9d4b8",
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=70",
  },
  {
    name: "Chicken Tikka",
    price: 360,
    veg: false,
    desc: "250g",
    color: "#f0d4bb",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&q=70",
  },
  {
    name: "Garlic Naan",
    price: 60,
    veg: true,
    desc: "2 pcs",
    color: "#ede0c8",
    img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&q=70",
  },
];

function FoodCard({ item, compact = false }) {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-[0_1px_5px_rgba(15,14,11,0.08)]`}
    >
      <div
        className="relative overflow-hidden"
        style={{ height: compact ? 52 : 64 }}
      >
        <img
          src={item.img}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <span
          className="absolute top-1.5 left-1.5 w-2 h-2 rounded-sm border-2"
          style={{
            borderColor: item.veg ? "#3a6348" : "#c0392b",
            backgroundColor: item.veg ? "#e8f2eb" : "#fde8e8",
          }}
        />
      </div>
      <div className="p-1.5">
        <p className="text-[8px] font-semibold text-[#0f0e0b] leading-tight">
          {item.name}
        </p>
        <p className="text-[7px] text-[#b0a898]">{item.desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({ feature }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  return (
    <Motion.div
      variants={fadeUp}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative bg-white rounded-2xl p-6 overflow-hidden cursor-default shadow-[0_1px_4px_rgba(15,14,11,0.07)] hover:shadow-[0_8px_32px_rgba(15,14,11,0.12)] transition-shadow duration-300"
      style={{
        background: hovered
          ? `radial-gradient(260px circle at ${pos.x}px ${pos.y}px, ${feature.glow}, #ffffff 65%)`
          : "#ffffff",
        transition: "background 0.08s, box-shadow 0.3s",
      }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
        style={{ backgroundColor: feature.iconBg }}
      >
        <feature.icon
          size={24}
          strokeWidth={1.8}
          style={{ color: feature.accent }}
        />
      </div>
      <h3 className="font-bold text-[#0f0e0b] text-[15px] mb-2">
        {feature.title}
      </h3>
      <p className="text-sm text-[#857c6e] leading-relaxed">{feature.body}</p>
    </Motion.div>
  );
}

function PhoneScreen({ screen }) {
  /* ── Step 1: Restaurant menu home ── */
  if (screen === "create") {
    return (
      <div className="h-full flex flex-col bg-[#faf7f2]">
        {/* hero banner */}
        <div className="relative h-24 flex-shrink-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=70"
            alt="restaurant"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0f0e0b]/45" />
          <div className="absolute bottom-2 left-3">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mb-1">
              <span className="text-[9px] font-black text-[#0f0e0b]">SG</span>
            </div>
            <p className="text-white text-[11px] font-bold leading-tight">
              Spice Garden
            </p>
            <p className="text-white/70 text-[7px]">North Indian · Pune</p>
          </div>
        </div>
        {/* tabs */}

        {/* categories */}
        <div className="flex gap-1.5 px-3 py-2 bg-white flex-shrink-0">
          {["Mains", "Starters", "Breads", "Drinks"].map((cat, i) => (
            <span
              key={cat}
              className="text-[7px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0"
              style={{
                borderColor: i === 0 ? "#e8720c" : "#e0d9ce",
                color: i === 0 ? "#e8720c" : "#857c6e",
              }}
            >
              {cat}
            </span>
          ))}
        </div>
        {/* grid */}
        <div className="flex-1 overflow-hidden px-3 pb-2">
          <p className="text-[9px] font-bold text-[#0f0e0b] py-1.5">Mains</p>
          <div className="grid grid-cols-2 gap-2">
            {FOOD_ITEMS.map((item) => (
              <FoodCard key={item.name} item={item} />
            ))}
          </div>
        </div>
        {/* bottom bar */}
        <div className="bg-[#e8720c] text-white flex items-center justify-between px-3 py-2 flex-shrink-0">
          <span className="text-[8px] font-semibold">Browse full menu</span>
          <ArrowRight size={11} />
        </div>
      </div>
    );
  }

  /* ── Step 2: QR Code ── */
  if (screen === "qr") {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white gap-3 px-5">
        <div className="w-10 h-10 rounded-2xl bg-[#fef0e4] flex items-center justify-center">
          <QrCode size={20} className="text-[#e8720c]" />
        </div>
        <p className="text-[13px] font-bold text-[#0f0e0b]">Table 04</p>
        <div className="w-32 h-32 bg-white border border-[#e0d9ce] rounded-2xl flex items-center justify-center relative overflow-hidden shadow-[0_2px_16px_rgba(15,14,11,0.1)]">
          <QrCode size={84} className="text-[#0f0e0b]" strokeWidth={1} />
          <div className="absolute left-0 right-0 h-0.5 bg-[#e8720c] scan-line opacity-70" />
        </div>
        <p className="text-[9px] text-[#857c6e] text-center leading-relaxed">
          Scan with your camera
          <br />
          to open the live menu
        </p>
        <div className="flex items-center gap-1.5 bg-[#fef0e4] px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-[#e8720c] pulse-dot" />
          <span className="text-[8px] font-semibold text-[#e8720c]">
            restroMenu · Live
          </span>
        </div>
      </div>
    );
  }

  /* ── Step 3: Order details ── */
  if (screen === "order") {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="px-3 pt-3 pb-2 border-b border-[#f0ebe0] flex-shrink-0">
          <p className="text-[12px] font-bold text-[#0f0e0b]">Order details</p>
          <p className="text-[8px] text-[#857c6e]">
            Check or complete your order
          </p>
        </div>

        <p className="text-[9px] font-bold text-[#0f0e0b] px-3 mb-2 flex-shrink-0">
          Order
        </p>
        <div className="flex-1 overflow-hidden px-3 space-y-2">
          {[
            {
              name: "Paneer Butter Masala",
              note: "Medium spicy",
              price: 280,
              qty: 1,
              img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=80&q=70",
            },
            {
              name: "Dal Makhani",
              note: "No garnish",
              price: 220,
              qty: 1,
              img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=80&q=70",
            },
            {
              name: "Garlic Naan",
              note: "Extra butter",
              price: 60,
              qty: 2,
              img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=80&q=70",
            },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-semibold text-[#0f0e0b] leading-tight truncate">
                  {item.name}
                </p>
                <p className="text-[7px] text-[#b0a898]">{item.note}</p>
              </div>
              <div className="flex items-center gap-1 border border-[#e0d9ce] rounded-full px-1.5 py-0.5 flex-shrink-0">
                <span className="text-[9px] font-bold text-[#857c6e] w-3 text-center">
                  −
                </span>
                <span className="text-[9px] font-bold text-[#0f0e0b] w-3 text-center">
                  {item.qty}
                </span>
                <span className="text-[9px] font-bold text-[#857c6e] w-3 text-center">
                  +
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-3 pb-3 pt-3 flex-shrink-0">
          <div className="flex justify-between text-[9px] font-semibold mb-2">
            <span className="text-[#857c6e]">Total</span>
            <span className="text-[#0f0e0b]">₹560</span>
          </div>
          <button className="w-full bg-[#e8720c] text-white text-[9px] font-bold py-2.5 rounded-xl">
            Pay ₹560
          </button>
        </div>
      </div>
    );
  }

  /* ── Step 4: Order confirmed ── */
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white gap-4 px-5">
      <div className="w-16 h-16 rounded-full border-4 border-[#3a6348] flex items-center justify-center">
        <CheckCircle2 size={30} className="text-[#3a6348]" strokeWidth={1.8} />
      </div>
      <div className="text-center">
        <p className="text-[9px] text-[#857c6e] mb-1">
          Order <span className="text-[#e8720c] font-bold">#0051</span> is
          finished
        </p>
        <p className="text-[12px] font-bold text-[#0f0e0b] leading-snug">
          Did everything meet
          <br />
          your expectations?
        </p>
      </div>
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl border-2 border-[#e0d9ce] flex items-center justify-center text-xl">
          👎
        </div>
        <div className="w-12 h-12 rounded-xl border-2 border-[#e8720c] bg-[#fef0e4] flex items-center justify-center text-xl">
          👍
        </div>
      </div>
      <button className="w-full border border-[#e8720c] text-[#e8720c] text-[9px] font-bold py-2 rounded-xl">
        Rate your experience
      </button>
    </div>
  );
}

/* ── Custom phone frame (no border, dark neutral, controlled width) ── */
function PhoneFrame({ children, className = "" }) {
  return (
    <div className={`relative w-[300px] flex-shrink-0 ${className}`}>
      {/* outer shell */}
      <div className="relative bg-[#141210] rounded-[52px] p-3 shadow-[0_40px_90px_rgba(15,14,11,0.28),inset_0_1px_0_rgba(255,255,255,0.07)]">
        {/* volume buttons */}
        <div className="absolute -left-[3px] top-[80px] w-[3px] h-8 bg-[#1e1c18] rounded-l-sm" />
        <div className="absolute -left-[3px] top-[122px] w-[3px] h-8 bg-[#1e1c18] rounded-l-sm" />
        {/* power button */}
        <div className="absolute -right-[3px] top-[100px] w-[3px] h-14 bg-[#1e1c18] rounded-r-sm" />
        {/* dynamic island */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[90px] h-7 bg-[#141210] rounded-full z-10 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2a2722]" />
          <div className="w-[5px] h-[5px] rounded-full bg-[#232120]" />
        </div>
        {/* screen */}
        <div
          className="w-full rounded-[40px] overflow-hidden flex flex-col bg-[#faf7f2]"
          style={{ minHeight: 580 }}
        >
          {/* island spacer */}
          <div className="h-9 flex-shrink-0 " />
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Custom desktop frame (mimics a browser window) ── */
function DesktopFrame({ children, className = "" }) {
  return (
    <div
      className={`mockup-browser bg-base-300 border flex-shrink-0 w-full max-w-[960px] shadow-[0_40px_90px_rgba(15,14,11,0.28)] ${className}`}
    >
      <div className="mockup-browser-toolbar">
        <div className="input">https://admin.restromenu.com/analytics</div>
      </div>
      <div
        className="bg-[#faf7f2] w-full flex flex-col text-left"
        style={{ height: 450 }}
      >
        {children}
      </div>
    </div>
  );
}

function DesktopAdminScreen() {
  return (
    <DesktopFrame>
      <div className="flex h-full bg-[#faf7f2]">
        {/* Sidebar */}
        <div className="w-16 bg-white flex flex-col items-center py-4 gap-6 flex-shrink-0 border-r border-[#e0d9ce]">
          <div className="w-8 h-8 rounded-lg bg-[#e8720c] flex items-center justify-center mb-4">
            <Utensils size={16} className="text-white" />
          </div>
          {[Activity, TrendingUp, PieChart, FileText].map((Icon, i) => (
            <button
              key={i}
              className={`p-2 rounded-lg transition-colors ${i === 0 ? "bg-[#fef0e4] text-[#e8720c]" : "text-[#857c6e] hover:text-[#0f0e0b] hover:bg-[#faf7f2]"}`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="p-4 border-b border-[#e0d9ce] flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-10">
            <div>
              <p className="text-[14px] font-bold text-[#0f0e0b]">
                Resporto Hotel Analytics
              </p>
              <p className="text-[10px] text-[#857c6e]">
                Today's Performance Overview
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-[#857c6e]">
                Last updated: Just now
              </span>
              <div className="w-2 h-2 rounded-full bg-[#27c93f] pulse-dot" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 scroller">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Total Revenue",
                  value: "₹42,850",
                  trend: "+12.5%",
                  positive: true,
                },
                {
                  label: "Orders",
                  value: "128",
                  trend: "+8.2%",
                  positive: true,
                },
                {
                  label: "Avg. Order Value",
                  value: "₹334",
                  trend: "+2.1%",
                  positive: true,
                },
                {
                  label: "Table Turnaround",
                  value: "42m",
                  trend: "-4m",
                  positive: true,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#faf7f2] border border-[#e0d9ce] p-3 rounded-xl shadow-sm hover:border-[#e8720c] transition-colors cursor-pointer"
                >
                  <p className="text-[10px] text-[#857c6e] mb-1 font-semibold">
                    {stat.label}
                  </p>
                  <p className="font-roboto text-xl font-bold text-[#0f0e0b] mb-1 tracking-tight">
                    {stat.value}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.positive ? "bg-[#e8f2eb] text-[#3a6348]" : "bg-[#fde8e8] text-[#c0392b]"}`}
                  >
                    {stat.trend}
                  </span>
                </div>
              ))}
            </div>

            {/* Charts Area */}
            <div className="flex gap-4">
              {/* Main Chart */}
              <div className="flex-[2] bg-white border border-[#e0d9ce] p-4 rounded-xl shadow-sm">
                <p className="text-[11px] font-bold text-[#0f0e0b] mb-4">
                  Revenue by Hour
                </p>
                <div className="h-32 pt-2 relative w-full group cursor-crosshair">
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                  >
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e8720c" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#e8720c" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={`0,100 ${[40, 65, 50, 80, 55, 90, 70, 85, 100, 75, 45, 30]
                        .map((h, i) => `${(i * 100) / 11},${100 - h}`)
                        .join(" ")} 100,100`}
                      fill="url(#chartGrad)"
                      className="transition-all duration-700 ease-in-out"
                    />
                    <polyline
                      points={[40, 65, 50, 80, 55, 90, 70, 85, 100, 75, 45, 30]
                        .map((h, i) => `${(i * 100) / 11},${100 - h}`)
                        .join(" ")}
                      fill="none"
                      stroke="#e8720c"
                      strokeWidth="2.5"
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-sm"
                    />
                  </svg>
                </div>
                <div className="flex justify-between mt-2 text-[8px] text-[#857c6e] font-semibold px-1">
                  <span>10 AM</span>
                  <span>2 PM</span>
                  <span>6 PM</span>
                  <span>10 PM</span>
                </div>
              </div>

              {/* Top Items */}
              <div className="flex-1 bg-white border border-[#e0d9ce] p-4 rounded-xl shadow-sm">
                <p className="text-[11px] font-bold text-[#0f0e0b] mb-4">
                  Top Selling Items
                </p>
                <div className="space-y-3">
                  {[
                    { name: "Butter Chicken", sales: 42, color: "#e8720c" },
                    { name: "Garlic Naan", sales: 86, color: "#f5b041" },
                    { name: "Paneer Tikka", sales: 34, color: "#3a6348" },
                    { name: "Mango Lassi", sales: 28, color: "#b0a898" },
                  ].map((item, i) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-[10px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#857c6e] w-3">
                          {i + 1}.
                        </span>
                        <span className="font-semibold text-[#0f0e0b]">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-[#857c6e]">
                        {item.sales}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

function AnimatedPhone({ activeStep }) {
  return (
    <PhoneFrame>
      {/* app bar */}
      <div className=" px-4 py-2 flex items-center justify-center flex-shrink-0">
        <span className="text-black text-[10px] font-semibold tracking-widest">
          restroMenu
        </span>
      </div>
      {/* animated content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <Motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <PhoneScreen screen={HOW_STEPS[activeStep].screen} />
          </Motion.div>
        </AnimatePresence>
      </div>
    </PhoneFrame>
  );
}

function GuestPhone() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [cart, setCart] = useState([]);
  const total = cart.reduce((s, i) => s + i.price, 0);

  const toggleCart = (item) =>
    setCart((prev) =>
      prev.find((c) => c.name === item.name)
        ? prev.filter((c) => c.name !== item.name)
        : [...prev, item],
    );

  return (
    <PhoneFrame>
      {/* status bar */}
      <div className=" px-4 py-1.5 flex items-center text-black justify-between flex-shrink-0">
        <span className=" text-[9px]">EN ▾</span>
        <span className=" text-[9px] font-bold tracking-widest">
          restroMenu
        </span>
        <div className="flex gap-2">
          <Users size={11} className="" />
          <Menu size={11} className="" />
        </div>
      </div>
      {/* hero banner */}
      <div className="relative h-32 flex-shrink-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"
          alt="restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0f0e0b]/45" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end">
          <div>
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mb-1.5">
              <div className="w-7 h-7 bg-[#0f0e0b] rounded-lg flex items-center justify-center">
                <span className="text-white text-[8px] font-black">SG</span>
              </div>
            </div>
            <p className="text-white text-[13px] font-bold leading-tight">
              Spice Garden
            </p>
            <p className="text-white/70 text-[8px]">
              Exquisite North Indian · Pune
            </p>
          </div>
        </div>
      </div>
      {/* tabs */}

      {/* address bar */}
      <div className="px-3 py-2 bg-white flex-shrink-0">
        <div className="flex items-center gap-2 bg-[#f5f0e8] rounded-xl px-3 py-1.5">
          <span className="text-[8px] text-[#857c6e] truncate flex-1">
            Table 04 · Spice Garden, Pune
          </span>
          <ArrowRight size={9} className="text-[#b0a898] flex-shrink-0" />
        </div>
      </div>
      {/* categories */}
      <div className="flex gap-2 px-3 py-1.5 bg-white flex-shrink-0">
        {["Mains", "Starters", "Breads", "Drinks"].map((cat, i) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(i)}
            className="text-[8px] font-semibold px-3 py-1 rounded-full flex-shrink-0 transition-all"
            style={{
              background: activeCategory === i ? "#e8720c" : "#f5f0e8",
              color: activeCategory === i ? "white" : "#857c6e",
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      {/* menu grid */}
      <div className="flex-1 overflow-y-auto bg-[#faf7f2] px-3 pb-2">
        <p className="text-[10px] font-bold text-[#0f0e0b] py-2">Mains</p>
        <div className="grid grid-cols-2 gap-2">
          {FOOD_ITEMS.map((item) => {
            const inCart = cart.find((c) => c.name === item.name);
            return (
              <div
                key={item.name}
                className="bg-white rounded-xl overflow-hidden shadow-[0_1px_6px_rgba(15,14,11,0.07)]"
              >
                <div
                  className="relative overflow-hidden"
                  style={{ height: 70 }}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-sm border-2"
                    style={{
                      borderColor: item.veg ? "#3a6348" : "#c0392b",
                      backgroundColor: item.veg ? "#e8f2eb" : "#fde8e8",
                    }}
                  />
                </div>
                <div className="p-2">
                  <p className="text-[9px] font-semibold text-[#0f0e0b] leading-tight">
                    {item.name}
                  </p>
                  <p className="text-[7px] text-[#b0a898] mt-0.5">
                    {item.desc}
                  </p>
                  <div className="flex items-center justify-end mt-2">
                    <button
                      onClick={() => toggleCart(item)}
                      className="text-[7px] font-bold h-6 px-2 rounded-lg border transition-all"
                      style={{
                        borderColor: inCart ? "#e8720c" : "#e0d9ce",
                        color: inCart ? "#e8720c" : "#0f0e0b",
                        background: inCart ? "#fef0e4" : "white",
                      }}
                    >
                      {inCart ? "✓" : "+ Add"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* cart bar */}
      {total > 0 ? (
        <div className="bg-white border-t border-[#f0ebe0] px-3 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#e8720c] flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">
                {cart.length}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#0f0e0b]">
              Order details
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#e8720c]">₹{total}</span>
        </div>
      ) : (
        <div className="h-2 flex-shrink-0" />
      )}
    </PhoneFrame>
  );
}

function GuestJourneyAnimation() {
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      while (isMounted) {
        setPhase("idle");
        await new Promise((r) => setTimeout(r, 1000));
        if (!isMounted) break;
        setPhase("scan");
        await new Promise((r) => setTimeout(r, 2200));
        if (!isMounted) break;
        setPhase("menu");
        await new Promise((r) => setTimeout(r, 1500));
        if (!isMounted) break;
        setPhase("add");
        await new Promise((r) => setTimeout(r, 1200));
        if (!isMounted) break;
        setPhase("pay");
        await new Promise((r) => setTimeout(r, 800));
        if (!isMounted) break;
        setPhase("status");
        await new Promise((r) => setTimeout(r, 4500));
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative w-full h-[580px] flex items-center justify-center overflow-visible">
      {/* QR Stand */}
      <div
        className={`absolute top-1/2 -mt-24 left-1/2 -ml-20 w-40 bg-white border border-[#e0d9ce] rounded-xl shadow-xl flex flex-col items-center p-5 transition-all duration-1000 ${phase === "scan" ? "scale-105 shadow-2xl opacity-50 z-20" : "scale-100 opacity-100 z-0"}`}
      >
        <p className="text-[14px] font-bold text-[#0f0e0b] mb-4">Table 04</p>
        <QrCode size={90} className="text-[#0f0e0b]" strokeWidth={1.5} />
        <p className="text-[10px] text-[#857c6e] mt-4 font-semibold text-center leading-tight">
          Scan for
          <br />
          Spice Garden
        </p>
      </div>

      {/* The Phone */}
      <AnimatePresence>
        {phase !== "idle" && (
          <Motion.div
            key="phone"
            initial={{ x: 250, opacity: 0, rotate: 6 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: 250, opacity: 0, rotate: 6 }}
            transition={{ duration: 0.65, type: "spring", bounce: 0.2 }}
            className="absolute left-1/2 -ml-[150px] z-30 shadow-full origin-bottom"
          >
            <PhoneFrame>
              <div className="w-full flex-1 bg-white relative overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                  {phase === "scan" && (
                    <Motion.div
                      key="scan"
                      className="absolute inset-0 flex items-center justify-center overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* camera feed — blurred restaurant photo */}
                      <img
                        src="https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=400&q=60"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: "brightness(0.28) blur(1.5px)" }}
                      />
                      {/* vignette */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.55) 100%)",
                        }}
                      />

                      {/* scanner viewfinder */}
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        {/* corner-bracket outer guides */}
                        <div className="relative w-52 h-52 flex items-center justify-center">
                          {/* top-left bracket */}
                          <span className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-[#27c93f] rounded-tl-lg" />
                          {/* top-right bracket */}
                          <span className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-[#27c93f] rounded-tr-lg" />
                          {/* bottom-left bracket */}
                          <span className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-[#27c93f] rounded-bl-lg" />
                          {/* bottom-right bracket */}
                          <span className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-[#27c93f] rounded-br-lg" />

                          {/* QR card visible through camera — bright, clean, real */}
                          <div className="w-40 h-40 bg-white rounded-2xl flex flex-col items-center justify-center shadow-[0_0_32px_rgba(39,201,63,0.25)] relative overflow-hidden p-3">
                            <p className="text-[8px] font-bold text-[#0f0e0b] mb-2 tracking-wide">
                              TABLE 04
                            </p>
                            <QrCode
                              size={88}
                              className="text-[#0f0e0b]"
                              strokeWidth={1.2}
                            />
                            {/* green scan line sweeping across the QR */}
                            <Motion.div
                              initial={{ y: -44 }}
                              animate={{ y: 104 }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.3,
                                ease: "linear",
                              }}
                              className="absolute left-0 right-0 h-[2px] bg-[#27c93f] shadow-[0_0_10px_3px_rgba(39,201,63,0.7)]"
                            />
                          </div>
                        </div>

                        <p className="text-white/75 text-[10px] tracking-[0.18em] font-semibold uppercase">
                          Scanning QR...
                        </p>
                      </div>
                    </Motion.div>
                  )}

                  {(phase === "menu" || phase === "add" || phase === "pay") && (
                    <Motion.div
                      key="menu"
                      className="absolute inset-0 bg-[#faf7f2] flex flex-col"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <div className="px-4 py-1.5 flex items-center justify-center bg-white border-b border-[#f0ebe0]">
                        <span className="text-[9px] font-bold tracking-widest text-[#0f0e0b]">
                          restroMenu
                        </span>
                      </div>
                      <div className="relative h-32 flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=70"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-3 left-4">
                          <p className="text-white text-[15px] font-bold">
                            Spice Garden
                          </p>
                          <p className="text-white/80 text-[9px]">Table 04</p>
                        </div>
                      </div>
                      <div className="flex-1 p-3 space-y-3 overflow-y-auto scroller">
                        {[
                          {
                            name: "Paneer Butter Masala",
                            price: "280",
                            img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=120&q=70",
                          },
                          {
                            name: "Dal Makhani",
                            price: "220",
                            img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=120&q=70",
                          },
                        ].map((item, i) => (
                          <div
                            key={item.name}
                            className="bg-white p-2.5 border border-[#e0d9ce] rounded-2xl flex gap-3 shadow-sm relative"
                          >
                            <img
                              src={item.img}
                              className="w-14 h-14 rounded-xl object-cover"
                            />
                            <div className="flex-1 flex flex-col justify-center">
                              <p className="text-[11px] font-bold text-[#0f0e0b] leading-tight mb-1">
                                {item.name}
                              </p>
                              <p className="text-[10px] font-bold text-[#e8720c]">
                                ₹{item.price}
                              </p>
                            </div>
                            <div className="flex items-center justify-end">
                              <div
                                className={`border rounded-lg text-[9px] px-2.5 py-1.5 font-bold transition-colors ${phase !== "menu" && i === 0 ? "bg-[#fef0e4] text-[#e8720c] border-[#e8720c]" : "text-[#857c6e] border-[#e0d9ce]"}`}
                              >
                                {phase !== "menu" && i === 0 ? "1" : "+ Add"}
                              </div>
                            </div>
                            {phase === "add" && i === 0 && (
                              <Motion.div
                                initial={{ scale: 2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="absolute right-3 top-8 w-6 h-6 bg-[#e8720c]/30 rounded-full flex items-center justify-center pointer-events-none z-10"
                              >
                                <div className="w-2 h-2 bg-[#e8720c] rounded-full" />
                              </Motion.div>
                            )}
                          </div>
                        ))}
                      </div>

                      <AnimatePresence>
                        {(phase === "add" || phase === "pay") && (
                          <Motion.div
                            initial={{ y: 60 }}
                            animate={{ y: 0 }}
                            exit={{ y: 60 }}
                            className="bg-white p-3 border-t border-[#e0d9ce] shadow-[0_-4px_10px_rgba(0,0,0,0.03)] relative"
                          >
                            <div className="w-full py-3 bg-[#e8720c] text-white rounded-xl flex items-center justify-between px-4 shadow-md">
                              <div className="flex flex-col">
                                <span className="text-[8px] text-white/80 uppercase tracking-wide">
                                  1 Item
                                </span>
                                <span className="text-[11px] font-bold">
                                  ₹280
                                </span>
                              </div>
                              <span className="text-[11px] font-bold flex items-center gap-1">
                                Checkout <ArrowRight size={12} />
                              </span>
                            </div>
                            {phase === "pay" && (
                              <Motion.div
                                initial={{
                                  scale: 2,
                                  opacity: 0,
                                  y: 10,
                                  x: -20,
                                }}
                                animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
                                className="absolute right-10 top-7 w-6 h-6 bg-black/30 rounded-full flex items-center justify-center"
                              >
                                <div className="w-2 h-2 bg-black rounded-full" />
                              </Motion.div>
                            )}
                          </Motion.div>
                        )}
                      </AnimatePresence>
                    </Motion.div>
                  )}

                  {phase === "status" && (
                    <Motion.div
                      key="status"
                      className="absolute inset-0 bg-[#e8f2eb]/60 flex flex-col items-center justify-center p-6 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="w-20 h-20 bg-[#27c93f] text-white rounded-full flex items-center justify-center mb-5 shadow-[0_4px_20px_rgba(39,201,63,0.3)]"
                      >
                        <CheckCircle2 size={40} />
                      </Motion.div>
                      <p className="text-[20px] font-bold text-[#3a6348]">
                        Order Confirmed!
                      </p>
                      <p className="text-[12px] text-[#3a6348] mt-1 mb-8 opacity-80">
                        Kitchen is preparing your food.
                      </p>

                      <div className="bg-white w-full rounded-2xl p-4 shadow-sm border border-[#27c93f]/20">
                        <div className="flex justify-between items-center border-b border-[#f0ebe0] pb-3 mb-3">
                          <span className="text-[11px] text-[#857c6e] font-medium">
                            Table No.
                          </span>
                          <span className="text-[16px] font-black text-[#0f0e0b]">
                            04
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-[11px] text-[#857c6e] font-medium">
                            Status
                          </span>
                          <span className="text-[10px] font-bold text-[#e8720c] bg-[#fef0e4] px-2.5 py-1 rounded-md tracking-wide">
                            PREPARING
                          </span>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col items-center gap-2">
                        <div className="w-3 h-3 bg-[#27c93f] rounded-full pulse-dot" />
                        <p className="text-[9px] font-bold text-[#3a6348] uppercase tracking-widest opacity-80">
                          Live Tracking
                        </p>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </PhoneFrame>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── FAQ item ──────────────────────────────────────── */
function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-[#e0d9ce]">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-4"
        onClick={onToggle}
      >
        <span className="text-sm font-semibold text-[#0f0e0b]">{q}</span>
        <Motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-[#e8720c] flex-shrink-0"
        >
          <ChevronDown size={18} />
        </Motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <Motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-[#857c6e] leading-relaxed">{a}</p>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── App ───────────────────────────────────────────── */
import { useNavigate, Link } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
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
              onClick={() => navigate("/auth")}
              className="px-4 py-2 text-sm font-medium text-[#2a2720] hover:text-[#e8720c] hover:bg-[#fef0e4] rounded-md transition-colors"
            >
              Sign In
            </button>
            <div className="w-px h-5 bg-[#e0d9ce] mx-1" />
            <button
              onClick={() => navigate("/auth")}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#e8720c] hover:bg-[#d4620a] text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_2px_10px_rgba(232,114,12,0.28)]"
            >
              Get Started Free <ArrowRight size={14} />
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
                    onClick={() => navigate("/auth")}
                    className="w-full py-2.5 text-sm font-semibold text-[#0f0e0b] border border-[#e0d9ce] rounded-lg hover:border-[#e8720c] hover:text-[#e8720c] transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/auth")}
                    className="w-full py-3 text-sm font-bold text-white bg-[#e8720c] hover:bg-[#d4620a] rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Get Started Free <ArrowRight size={15} />
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
            Trusted by 12 000+ restaurants across India
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
            and order — all from their phone. No app. No waiter wait.
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
              onClick={() => navigate("/auth")}
              className="bg-[#e8720c] hover:bg-[#d4620a] text-white font-semibold px-7 py-3 rounded-md flex items-center gap-2 transition-colors"
            >
              Start Free <ArrowRight size={16} />
            </button>
            <button className="border border-[#e0d9ce] text-[#0f0e0b] font-semibold px-7 py-3 rounded-md hover:border-[#e8720c] hover:text-[#e8720c] transition-colors">
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
              <span className="text-[11px] font-bold text-white tracking-widest uppercase bg-white/20 px-2.5 py-1 rounded-md">Live Interactive Demo</span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-white mb-5 leading-[1.15] tracking-tight drop-shadow-sm">
              Experience the zero-friction guest menu.
            </h3>
            <p className="text-white/90 text-base sm:text-lg max-w-xl leading-relaxed mb-8 font-medium">
              Don't just take our word for it. Point your smartphone camera at the QR code to instantly see exactly how your customers will browse, order, and interact with the digital menu.
            </p>
            
            <div className="flex flex-wrap items-center gap-5 sm:gap-8">
               <div className="flex items-center gap-2 text-white text-sm font-bold">
                 <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><CheckCircle2 size={12} className="text-white" /></div> Instant Loading
               </div>
               <div className="flex items-center gap-2 text-white text-sm font-bold">
                 <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><CheckCircle2 size={12} className="text-white" /></div> Native App Feel
               </div>
               <div className="flex items-center gap-2 text-white text-sm font-bold">
                 <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><CheckCircle2 size={12} className="text-white" /></div> Table-Specific
               </div>
            </div>
          </div>
          
          {/* Right QR Code */}
          <div className="flex-shrink-0 bg-white p-2.5 sm:p-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative z-10 group overflow-hidden border border-white">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#e8720c]/15 to-transparent scan-line pointer-events-none" />
             <div className="border border-[#e0d9ce]/50 rounded-xl overflow-hidden bg-white">
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(window.location.origin + "/demo")}&bgcolor=ffffff&color=0f0e0b`}
                 alt="Live Demo QR"
                 className="w-56 h-56 sm:w-64 sm:h-64 object-contain mix-blend-multiply"
               />
             </div>
             <div className="text-center mt-3 mb-1">
               <p className="font-bold text-[#0f0e0b] text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                 <QrCode size={16} className="text-[#e8720c]"/> Scan QR Code
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

      {/* ════════════════ 4. FEATURES ══════════════════════════════ */}
      <section id="features" className="bg-[#faf7f2] py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 reveal">
            <p className="text-xs font-semibold text-[#e8720c] tracking-widest uppercase mb-3">
              Start Winning Free
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#0f0e0b]">
              All Features, <span style={{ color: "#e8720c" }}>Zero</span>{" "}
              <span style={{ color: "#0ea5e9" }}>Cost</span>
            </h2>
            <p className="text-[#857c6e] mt-4 max-w-xl mx-auto">
              Every feature below is completely free. No premium tiers, no
              paywalls, no &ldquo;upgrade to unlock&rdquo; nonsense. Your
              success is our success.
            </p>
          </div>

          <Motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </Motion.div>
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
              Provides a faster, smarter, and more interactive dining experience while simplifying restaurant operations.
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
                <h3 className="text-[17px] font-bold text-[#0f0e0b] mb-3 tracking-tight">Enhancing Customer Experience</h3>
                <p className="text-[#857c6e] text-sm leading-relaxed mb-6 flex-1">
                  Digital menus load faster, are easier to use, and provide more useful information to customers, including dish ingredients and allergen warnings directly in their hands.
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
                <h3 className="text-[17px] font-bold text-[#0f0e0b] mb-3 tracking-tight">Attracting New Customers</h3>
                <p className="text-[#857c6e] text-sm leading-relaxed mb-6 flex-1">
                  Guests can leave reviews directly through the QR menu. Plus, built-in multilingual support helps attract foreign customers and turn foot traffic into loyal dining patrons.
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
                <h3 className="text-[17px] font-bold text-[#0f0e0b] mb-3 tracking-tight">QR Code Menu Increases Sales</h3>
                <p className="text-[#857c6e] text-sm leading-relaxed mb-6 flex-1">
                  Food photos and an interactive menu presentation encourage customers to order more items and upsells, meaningfully increasing the average bill amount effortlessly.
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
          <div className="text-center mb-14 reveal">
            <p className="text-xs font-semibold text-[#e8720c] tracking-widest uppercase mb-3">
              How It Works
            </p>
            <h2 className="font-display text-4xl font-bold text-[#0f0e0b]">
              Live in 5 minutes
            </h2>
            <p className="text-[#857c6e] mt-3 max-w-lg mx-auto">
              Watch how restroMenu works step by step — from creating your menu
              to receiving your first order.
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
              className="bg-[#fef0e4] border border-[#e8720c]/30 p-5 rounded-2xl flex items-center gap-5 relative overflow-hidden"
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
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e8720c] pulse-dot" /> Interactive Demo
                </p>
                <p className="font-bold text-[#0f0e0b] text-[15px] mb-1.5 leading-tight tracking-tight">Scan with your phone</p>
                <p className="text-xs text-[#857c6e] leading-snug">Experience the fast, responsive guest menu exactly as they do.</p>
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
                  onClick={() => navigate("/auth")}
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
              <button className="flex items-center gap-2 bg-[#e8720c] hover:bg-[#d4620a] text-white text-sm font-bold px-6 py-3 rounded-md transition-colors">
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
            12 000+ restaurants already on restroMenu.
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
                restroMenu
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
                    <Link to={l.to} className="hover:text-[#e8720c] transition-colors">{l.label}</Link>
                  ) : (
                    <a href={l.to} className="hover:text-[#e8720c] transition-colors">{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#e0d9ce] max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} restroMenu. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-[#e8720c]">♥</span> for India&apos;s
            restaurants
          </p>
        </div>
      </footer>
    </div>
  );
}

import {
  QrCode,
  Smartphone,
  BarChart3,
  WandSparkles,
  Zap,
  ShieldCheck,
  Globe,
  CheckCircle2,
  Upload,
  Banknote,
  UtensilsCrossed,
  BedDouble,
  Monitor,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Home", id: "home" },
  { label: "Features", id: "features" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Live Demo", id: "live-demo" },
  { label: "FAQ", id: "faq" },
  { label: "Contact Us", path: "/contact" },
];

export const STATS = [
  { value: "12 000+", label: "Restaurants Live" },
  { value: "₹0", label: "Setup Cost" },
  { value: "5 min", label: "Go-Live Time" },
  { value: "4.9 ★", label: "Avg. Rating" },
];

export const FEATURES = [
  {
    icon: Monitor,
    title: "Restaurant & Hotel POS",
    body: "Run dine-in, takeaway, and room-service billing from one POS with live kitchen sync.",
    accent: "#2563eb",
    glow: "rgba(37,99,235,0.12)",
    iconBg: "#eff6ff",
  },
  {
    icon: BedDouble,
    title: "Hotel Room Orders",
    body: "No phone calls or waiting. Guests order room service directly from their beds.",
    accent: "#ec4899",
    glow: "rgba(236,72,153,0.12)",
    iconBg: "#fdf2f8",
  },
  {
    icon: QrCode,
    title: "QR Code Menu",
    body: "Customers scan and instantly see your menu. No app download needed.",
    accent: "#e8720c",
    glow: "rgba(232,114,12,0.12)",
    iconBg: "#fef0e4",
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

export const HOW_STEPS = [
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

export const PLANS = [
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

export const TESTIMONIALS = [
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

export const FAQS = [
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

export const FOOD_ITEMS = [
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

export const RECENT_ORDERS = [
  {
    id: "#2849",
    table: "04",
    items: "Paneer Masala, Garlic Naan",
    total: "₹420",
    status: "preparing",
    time: "2m",
  },
  {
    id: "#2848",
    table: "12",
    items: "Veg Biryani, Raita",
    total: "₹280",
    status: "ready",
    time: "8m",
  },
  {
    id: "#2847",
    table: "07",
    items: "Tandoori Chicken",
    total: "₹350",
    status: "served",
    time: "15m",
  },
  {
    id: "#2846",
    table: "02",
    items: "Mango Lassi (2)",
    total: "₹180",
    status: "served",
    time: "22m",
  },
];

export const DASHBOARD_TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "finance", label: "Sales & Finance", icon: Banknote },
  { id: "menu", label: "Menu & Products", icon: UtensilsCrossed },
  { id: "operations", label: "Operations & Tables", icon: Smartphone },
];

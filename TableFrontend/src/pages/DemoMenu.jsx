import React, { useState, useEffect, useRef, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Star,
  ChevronDown,
  Share2,
  UtensilsCrossed,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://restroapi.buzingbee.com/api";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";

const DEFAULT_SOCIAL_LINKS = {
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  x: "https://x.com",
  googleReview: "https://g.page/r/review",
};

function getTableLabel(tableId) {
  if (!tableId) return "Table 04";
  return /^table\b/i.test(tableId) ? tableId : `Table ${tableId}`;
}

function getGuestSessionKey(tableId) {
  return `demo_guest_session_${tableId || "04"}`;
}

function normalizeGuestPhone(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(-10);
}

// ── Veg / Non-veg indicator icons ─────────────────────────────────────────────
const VegIcon = ({ size = 14 }) => (
  <span
    style={{ width: size, height: size, borderColor: "#16a34a" }}
    className="border-2 rounded-[3px] flex items-center justify-center flex-shrink-0"
  >
    <span
      style={{
        width: size * 0.45,
        height: size * 0.45,
        backgroundColor: "#16a34a",
      }}
      className="rounded-full"
    />
  </span>
);
const NonVegIcon = ({ size = 14 }) => (
  <span
    style={{ width: size, height: size, borderColor: "#dc2626" }}
    className="border-2 rounded-[3px] flex items-center justify-center flex-shrink-0"
  >
    <span
      className="w-0 h-0"
      style={{
        borderLeft: `${size * 0.3}px solid transparent`,
        borderRight: `${size * 0.3}px solid transparent`,
        borderBottom: `${size * 0.48}px solid #dc2626`,
      }}
    />
  </span>
);

const FOOD_ITEMS = [
  {
    id: 1,
    name: "Spicy Chicken Craver",
    price: 89,
    originalPrice: 99,
    veg: false,
    rating: 4.7,
    popular: false,
    desc: "Crispy spiced chicken in a soft roll with tangy sauce.",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
    category: "Starters",
  },
  {
    id: 2,
    name: "Aloo Patty Sandwich",
    price: 139,
    originalPrice: 169,
    veg: true,
    rating: 4.4,
    popular: true,
    desc: "Classic aloo tikki sandwich with fresh veggies and green chutney.",
    img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80",
    category: "Mains",
  },
  {
    id: 3,
    name: "Veggie Delite Sandwich",
    price: 139,
    originalPrice: 159,
    veg: true,
    rating: 4.2,
    popular: true,
    desc: "Fresh veggies, herbs and sauces in a soft sandwich.",
    img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",
    category: "Mains",
  },
  {
    id: 4,
    name: "Paneer Tikka Sub",
    price: 199,
    originalPrice: 249,
    veg: true,
    rating: 4.5,
    popular: false,
    desc: "Grilled paneer tikka with pickled onions and mint chutney.",
    img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
    category: "Mains",
  },
  {
    id: 5,
    name: "Dal Makhani",
    price: 199,
    originalPrice: 220,
    veg: true,
    rating: 4.6,
    popular: true,
    desc: "Creamy slow-cooked black lentils with Indian spices.",
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
    category: "Mains",
  },
  {
    id: 6,
    name: "BBQ Chicken Sub",
    price: 199,
    originalPrice: 229,
    veg: false,
    rating: 4.6,
    popular: true,
    desc: "Smoky BBQ chicken with coleslaw in a toasted sub.",
    img: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80",
    category: "Starters",
  },
  {
    id: 7,
    name: "Paneer Butter Masala",
    price: 249,
    originalPrice: null,
    veg: true,
    rating: 4.8,
    popular: true,
    desc: "Soft paneer cubes in rich tomato gravy, slowly cooked to perfection.",
    img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
    category: "Mains",
  },
  {
    id: 8,
    name: "Chicken Tikka",
    price: 299,
    originalPrice: 360,
    veg: false,
    rating: 4.9,
    popular: true,
    desc: "Charcoal grilled chicken chunks marinated in yogurt and spices.",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
    category: "Starters",
  },
  {
    id: 9,
    name: "Garlic Naan",
    price: 60,
    originalPrice: null,
    veg: true,
    rating: 4.3,
    popular: false,
    desc: "Soft traditional Indian bread topped with finely chopped garlic.",
    img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80",
    category: "Breads",
  },
  {
    id: 10,
    name: "Virgin Mojito",
    price: 120,
    originalPrice: 150,
    veg: true,
    rating: 4.5,
    popular: false,
    desc: "Refreshing mint & lemon beverage served chilled.",
    img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
    category: "Drinks",
  },
];

const ScratchCard = ({
  width,
  height,
  children,
  finishPercent = 70,
  onComplete,
}) => {
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "destination-out";
      setCtx(context);
    }
  }, [width, height]);

  const startScratch = (e) => {
    setIsScratching(true);
    scratch(e);
  };

  const scratch = (e) => {
    if (!ctx || !isScratching) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratched percentage
    const imageData = ctx.getImageData(0, 0, width, height);
    let scratchedPixels = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] === 0) scratchedPixels++;
    }
    const percent = (scratchedPixels / (width * height)) * 100;
    setScratchedPercent(percent);

    if (percent >= finishPercent && !isComplete) {
      setIsComplete(true);
      setTimeout(() => onComplete && onComplete(), 500);
    }
  };

  const stopScratch = () => {
    setIsScratching(false);
  };

  return (
    <div className="relative mb-4">
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        {/* Reward Layer (Background) */}
        <div className="absolute inset-0 z-0">{children[1]}</div>

        {/* Scratch Layer (Foreground) */}
        <div className="relative z-10">{children[0]}</div>

        {/* Canvas for scratching */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="absolute inset-0 z-20 cursor-pointer"
          onMouseDown={startScratch}
          onMouseMove={scratch}
          onMouseUp={stopScratch}
          onMouseLeave={stopScratch}
          onTouchStart={(e) => {
            e.preventDefault();
            startScratch(e.touches[0]);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            scratch(e.touches[0]);
          }}
          onTouchEnd={stopScratch}
        />

        {/* Scratch instruction overlay */}
        {!isComplete && scratchedPercent < 10 && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 rounded-xl">
            <div className="text-white text-center">
              <div className="text-2xl mb-2">👆</div>
              <div className="text-sm font-bold">Touch & Drag to Scratch!</div>
            </div>
          </div>
        )}

        {/* Completion effect */}
        {isComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-yellow-400/20 rounded-xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-4xl"
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-[#e8720c] h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(scratchedPercent, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-center text-xs text-[#857c6e] mt-1">
          {isComplete
            ? "🎉 Reward Revealed!"
            : `Scratch Progress: ${Math.round(scratchedPercent)}%`}
        </div>
      </div>
    </div>
  );
};

export default function DemoMenu() {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const currentTableId = queryParams.get("table") || "04";
  const guestSessionKey = getGuestSessionKey(currentTableId);
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [orderStatus, setOrderStatus] = useState(0);
  const [orderNo, setOrderNo] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [visitCount, setVisitCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [freeItemClaimed, setFreeItemClaimed] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  // Menu UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterNonVeg, setFilterNonVeg] = useState(false);
  const [filterRating, setFilterRating] = useState(false);
  const [filterPopular, setFilterPopular] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [restaurantProfile, setRestaurantProfile] = useState({
    name: "Spice Garden",
    eta: "15–20 mins",
    rating: 4.5,
    heroImage: DEFAULT_HERO_IMAGE,
    tableLabel: getTableLabel(currentTableId),
    totalTables: null,
    socialLinks: DEFAULT_SOCIAL_LINKS,
  });
  const [liveMenuItems, setLiveMenuItems] = useState(FOOD_ITEMS);
  const scrollRef = useRef(null);

  const menuItems = liveMenuItems.length > 0 ? liveMenuItems : FOOD_ITEMS;

  const findMenuItemById = (id) =>
    menuItems.find((item) => String(item.id) === String(id));

  const loadOrderHistory = (phone) => {
    const savedHistory = localStorage.getItem(`order_history_${phone}`);
    return savedHistory ? JSON.parse(savedHistory) : [];
  };

  const saveOrderHistory = (phone, history) => {
    localStorage.setItem(`order_history_${phone}`, JSON.stringify(history));
  };

  useEffect(() => {
    const savedSession = localStorage.getItem(guestSessionKey);
    if (!savedSession) return;

    try {
      const parsed = JSON.parse(savedSession);
      const restoredPhone = normalizeGuestPhone(parsed.phone);

      if (restoredPhone.length !== 10) return;

      setGuestPhone(restoredPhone);
      setGuestName(String(parsed.name || ""));
      setIsJoined(true);
    } catch {
      localStorage.removeItem(guestSessionKey);
    }
  }, [guestSessionKey]);

  useEffect(() => {
    if (!isJoined || guestPhone.length !== 10) return;

    localStorage.setItem(
      guestSessionKey,
      JSON.stringify({
        phone: guestPhone,
        name: guestName || "",
      }),
    );
  }, [guestName, guestPhone, guestSessionKey, isJoined]);

  useEffect(() => {
    let cancelled = false;

    async function loadQrMenu() {
      if (!currentTableId) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/qr/${encodeURIComponent(currentTableId)}`,
        );

        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        if (cancelled) return;

        setRestaurantProfile((prev) => ({
          ...prev,
          name: payload.business?.name || prev.name,
          heroImage: DEFAULT_HERO_IMAGE,
          tableLabel: payload.table?.label || getTableLabel(currentTableId),
          totalTables:
            typeof payload.totalTables === "number"
              ? payload.totalTables
              : prev.totalTables,
          socialLinks: {
            instagram:
              payload.business?.socialLinks?.instagram ||
              prev.socialLinks.instagram,
            facebook:
              payload.business?.socialLinks?.facebook ||
              prev.socialLinks.facebook,
            x: payload.business?.socialLinks?.x || prev.socialLinks.x,
            googleReview:
              payload.business?.socialLinks?.googleReview ||
              prev.socialLinks.googleReview,
          },
        }));

        if (Array.isArray(payload.menuItems) && payload.menuItems.length > 0) {
          setLiveMenuItems(payload.menuItems);
        }
      } catch {
        // Keep graceful fallbacks for the demo route when backend data is unavailable.
      }
    }

    loadQrMenu();

    return () => {
      cancelled = true;
    };
  }, [currentTableId]);

  // Load visit count and order history from localStorage when the guest logs in
  useEffect(() => {
    if (isJoined && guestPhone) {
      localStorage.setItem("current_guest_phone", guestPhone);
      localStorage.setItem("current_guest_name", guestName || "Guest");

      const storedVisits = localStorage.getItem(`visits_${guestPhone}`);
      if (storedVisits) {
        const visits = parseInt(storedVisits, 10);
        setVisitCount(visits);
        if (
          visits >= 5 &&
          !localStorage.getItem(`reward_claimed_${guestPhone}`)
        ) {
          setShowReward(true);
        }
      }

      const history = loadOrderHistory(guestPhone);
      setOrderHistory(history);
    }
  }, [isJoined, guestName, guestPhone]);

  const offerOptions = [
    { pct: 5, title: "Saver 5%", subtitle: "5% off", minSubtotal: 500 },
    { pct: 10, title: "Festival 10%", subtitle: "10% off", minSubtotal: 1000 },
  ];

  useEffect(() => {
    if (orderPlaced) {
      setOrderStatus(0);
      const timer1 = setTimeout(() => setOrderStatus(1), 3500);
      const timer2 = setTimeout(() => setOrderStatus(2), 7500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [orderPlaced]);

  const addToCart = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id] -= 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const cartTotalPairs = Object.entries(cart);
  const totalItems = cartTotalPairs.reduce((sum, [, qty]) => sum + qty, 0);
  const totalPrice = cartTotalPairs.reduce((sum, [id, qty]) => {
    const item = findMenuItemById(id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const orderLineItems = cartTotalPairs
    .map(([id, qty]) => {
      const item = findMenuItemById(id);

      if (!item) {
        return null;
      }

      return {
        id: item.id,
        name: item.name,
        qty,
        price: item.price,
        total: item.price * qty,
        veg: item.veg,
      };
    })
    .filter(Boolean);
  const discountAmount = Math.round((totalPrice * selectedOffer) / 100);
  const taxableAmount = Math.max(totalPrice - discountAmount, 0);
  const taxAmount = Math.round(taxableAmount * 0.05);
  const grandTotal = taxableAmount + taxAmount;
  const recommendedItems = menuItems
    .filter((item) => !cart[item.id])
    .slice(0, 3);

  // Scroll detection for sticky compact header
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 200);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, [isJoined]);

  // Menu filtered & grouped by price
  const groupedItems = useMemo(() => {
    let items = menuItems;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q),
      );
    }
    if (filterVeg && !filterNonVeg) items = items.filter((i) => i.veg);
    if (filterNonVeg && !filterVeg) items = items.filter((i) => !i.veg);
    if (filterRating) items = items.filter((i) => i.rating >= 4.0);
    if (filterPopular) items = items.filter((i) => i.popular);
    const groups = {};
    for (const item of items) {
      const key = item.price;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([price, grpItems]) => ({ price: Number(price), items: grpItems }));
  }, [
    menuItems,
    searchQuery,
    filterVeg,
    filterNonVeg,
    filterRating,
    filterPopular,
  ]);

  const toggleSection = (price) => {
    setCollapsedSections((prev) => ({ ...prev, [price]: !prev[price] }));
  };

  useEffect(() => {
    if (selectedOffer) {
      const selected = offerOptions.find(
        (offer) => offer.pct === selectedOffer,
      );
      if (selected && totalPrice < selected.minSubtotal) {
        setSelectedOffer(0);
      }
    }
  }, [selectedOffer, totalPrice]);

  useEffect(() => {
    if (totalItems === 0 && showCart) {
      setShowCart(false);
    }
  }, [totalItems, showCart]);

  const applyCouponCode = () => {
    const normalized = couponCode.trim().toUpperCase();
    const couponMap = {
      SAVE5: { pct: 5, minSubtotal: 500 },
      FEST10: { pct: 10, minSubtotal: 1000 },
    };

    const matched = couponMap[normalized];
    if (!matched) {
      setCouponError("Invalid coupon code");
      return;
    }

    if (totalPrice < matched.minSubtotal) {
      setCouponError(`Minimum bill ₹${matched.minSubtotal} required`);
      return;
    }

    setSelectedOffer(matched.pct);
    setAppliedCoupon(normalized);
    setCouponCode("");
    setCouponError("");
  };

  if (!isJoined) {
    return (
      <div className="relative min-h-[100dvh] bg-[#0f0e0b]">
        {/* Hero image — top portion only */}
        <div className="absolute top-0 left-0 right-0 h-[42vh] overflow-hidden">
          <img
            src={restaurantProfile.heroImage}
            alt="Restaurant"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,11,9,0.18)_0%,rgba(12,11,9,0.55)_60%,rgba(12,11,9,1)_100%)]" />
        </div>

        <div className="relative z-10 flex min-h-[100dvh] flex-col justify-between p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4 text-white">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                Scan And Order
              </p>
              <h1 className="mt-3 max-w-lg text-3xl font-bold leading-tight sm:text-5xl">
                {restaurantProfile.name}
              </h1>
              <p className="mt-2 text-sm text-white/80 sm:text-base">
                {restaurantProfile.tableLabel}
              </p>
            </div>

            <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm">
              {restaurantProfile.eta}
            </div>
          </div>

          <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/92 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e8720c]">
              Guest Entry
            </p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              Open the menu in full screen
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
              Enter your phone number once to start browsing and keep your demo
              session active after refresh.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!guestPhone) return;
                setJoinLoading(true);
                setJoinError("");
                try {
                  await fetch(`${API_BASE_URL}/guests/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      phone: `+91${normalizeGuestPhone(guestPhone)}`,
                      name: guestName || "Guest",
                    }),
                  });
                } catch {
                  // Backend unavailable — allow entry anyway so the demo still works
                } finally {
                  setJoinLoading(false);
                }
                setIsJoined(true);
              }}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Phone Number
                </label>
                <div className="flex overflow-hidden rounded-2xl border border-gray-200 bg-white focus-within:border-[#e8720c] focus-within:ring-1 focus-within:ring-[#e8720c] transition-all">
                  <div className="flex items-center border-r border-gray-200 bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-500">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) =>
                      setGuestPhone(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    placeholder="9999999999"
                    inputMode="numeric"
                    maxLength={10}
                    className="w-full px-4 py-4 text-base font-medium text-gray-900 focus:outline-none"
                    required
                  />
                </div>
              </div>
              {joinError && (
                <p className="text-center text-sm text-red-500">{joinError}</p>
              )}
              <button
                type="submit"
                disabled={joinLoading || guestPhone.length < 10}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e8720c] py-4 font-bold text-white shadow-lg transition-colors hover:bg-[#d4620a] disabled:opacity-60"
              >
                {joinLoading ? (
                  <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    View Menu <ArrowLeft size={18} className="rotate-180" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#faf7f2] px-4 py-3 text-xs text-gray-500">
              <span>Session saved for this table</span>
              <span className="font-semibold text-gray-700">
                {restaurantProfile.tableLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div
        ref={scrollRef}
        className="bg-white max-w-md mx-auto min-h-screen relative overflow-y-auto"
        style={{ height: "100dvh" }}
      >
        {/* ── Sticky compact header (appears on scroll) ────────────────── */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-b border-gray-100 z-50 shadow-sm"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => navigate(-1)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex-1 text-center">
                  <p className="font-bold text-sm text-gray-900">
                    {restaurantProfile.name} • {restaurantProfile.eta}
                  </p>
                </div>
                <button
                  onClick={() =>
                    scrollRef.current?.scrollTo({
                      top: 280,
                      behavior: "smooth",
                    })
                  }
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
                >
                  <Search size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hero image ────────────────────────────────────────────────── */}
        <div className="relative h-40 w-full bg-gray-900 flex-shrink-0">
          <img
            src={restaurantProfile.heroImage}
            alt={restaurantProfile.name}
            className="w-full h-full object-cover"
          />
          {/* gradient: dark at top for buttons, dark at bottom for social row */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/65" />

          {/* Top controls */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={() =>
              navigator.share?.({
                title: restaurantProfile.name,
                url: window.location.href,
              })
            }
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <Share2 size={18} />
          </button>

          {/* Bottom row: social icons + Google review */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 flex items-center justify-between">
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {/* Instagram */}
              <a
                href={restaurantProfile.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors"
                aria-label="Instagram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <circle cx="17.5" cy="6.5" r="1" fill="white" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href={restaurantProfile.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors"
                aria-label="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a
                href={restaurantProfile.socialLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors"
                aria-label="Twitter"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            {/* Google Review button */}
            <a
              href={restaurantProfile.socialLinks.googleReview}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1.5 text-white text-xs font-semibold hover:bg-white/25 transition-colors"
            >
              {/* Google G logo */}
              <svg width="13" height="13" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Rate us
            </a>
          </div>
        </div>

        {/* ── Restaurant info ───────────────────────────────────────────── */}
        <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {restaurantProfile.name}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {restaurantProfile.eta} &nbsp;|&nbsp;{" "}
                {restaurantProfile.tableLabel}
                {restaurantProfile.totalTables
                  ? ` • ${restaurantProfile.totalTables} tables`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {orderHistory.length > 0 && (
                <Link
                  to="/history"
                  className="text-xs text-gray-500 border border-gray-200 rounded-full px-2.5 py-1 hover:bg-gray-50"
                >
                  {orderHistory.length} past order
                  {orderHistory.length > 1 ? "s" : ""}
                </Link>
              )}
              <div className="flex items-center gap-1 bg-green-700 text-white px-3 py-1.5 rounded-full">
                <Star size={12} className="fill-white" />
                <span className="text-sm font-bold">
                  {restaurantProfile.rating}
                </span>
              </div>
            </div>
          </div>

          {/* Loyalty bar */}
          {freeItemClaimed ? (
            <div className="mt-3 bg-green-50 rounded-xl px-3 py-2 flex items-center gap-2">
              <Star size={14} className="text-green-600 fill-green-600" />
              <span className="text-xs text-green-700 font-semibold">
                Free item claimed! 🎉 Added to your cart.
              </span>
            </div>
          ) : visitCount < 5 ? (
            <div className="mt-3 flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2">
              <span className="text-xs text-orange-600 font-medium">
                🎁 {5 - visitCount} more visit{5 - visitCount !== 1 ? "s" : ""}{" "}
                to FREE food!
              </span>
              <div className="flex-1 h-1.5 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e8720c] rounded-full transition-all"
                  style={{ width: `${(visitCount / 5) * 100}%` }}
                />
              </div>
            </div>
          ) : !localStorage.getItem(`reward_claimed_${guestPhone}`) ? (
            <div className="mt-3 bg-orange-50 rounded-xl px-3 py-2 flex items-center gap-2">
              <Star size={14} className="text-[#e8720c] fill-[#e8720c]" />
              <span className="text-xs text-orange-600 font-semibold">
                Reward unlocked! Place an order to claim.
              </span>
            </div>
          ) : null}
        </div>

        {/* ── Search bar ────────────────────────────────────────────────── */}
        <div className="bg-white px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for dishes"
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* ── Filter chips ─────────────────────────────────────────────── */}
        <div className="bg-white px-4 py-2.5 border-b border-gray-200 flex gap-2 overflow-x-auto no-scrollbar">
          {/* Veg toggle */}
          <button
            onClick={() => {
              setFilterVeg(!filterVeg);
              setFilterNonVeg(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${filterVeg ? "border-green-600 bg-green-50" : "border-gray-300 bg-white"}`}
          >
            <VegIcon size={14} />
          </button>
          {/* Non-veg toggle */}
          <button
            onClick={() => {
              setFilterNonVeg(!filterNonVeg);
              setFilterVeg(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${filterNonVeg ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
          >
            <NonVegIcon size={14} />
          </button>
          <button
            onClick={() => setFilterRating(!filterRating)}
            className={`px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${filterRating ? "border-green-600 bg-green-50 text-green-700" : "border-gray-300 bg-white text-gray-700"}`}
          >
            Ratings 4.0+
          </button>
          <button
            onClick={() => setFilterPopular(!filterPopular)}
            className={`px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${filterPopular ? "border-green-600 bg-green-50 text-green-700" : "border-gray-300 bg-white text-gray-700"}`}
          >
            Popular
          </button>
        </div>

        {/* ── Menu sections (grouped by price) ─────────────────────────── */}
        <div className="bg-white pb-32">
          {groupedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <UtensilsCrossed size={40} className="text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No dishes found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try clearing filters or searching something else.
              </p>
            </div>
          ) : (
            groupedItems.map(({ price, items: sectionItems }) => (
              <div key={price} className="border-b border-gray-100">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(price)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left"
                >
                  <h2 className="text-base font-bold text-gray-900">
                    Items at ₹{price}{" "}
                    <span className="text-gray-400 font-medium">
                      ({sectionItems.length})
                    </span>
                  </h2>
                  <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform duration-200 ${collapsedSections[price] ? "-rotate-90" : ""}`}
                  />
                </button>

                {/* Item grid */}
                {!collapsedSections[price] && (
                  <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                    {sectionItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
                      >
                        {/* Image area */}
                        <div className="relative">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full aspect-[4/3] object-cover cursor-pointer"
                            onClick={() => setSelectedItem(item)}
                          />
                          {item.popular && (
                            <span className="absolute top-2 left-2 text-xs font-bold text-green-600 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                              Popular
                            </span>
                          )}
                          {/* Add / qty control */}
                          {!cart[item.id] ? (
                            <button
                              onClick={() => addToCart(item.id)}
                              className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border border-pink-400 text-pink-500 hover:bg-pink-50 transition-colors"
                            >
                              <Plus size={18} strokeWidth={2.5} />
                            </button>
                          ) : (
                            <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-white rounded-full shadow-md border border-pink-400 px-1.5 py-0.5">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-6 h-6 flex items-center justify-center text-pink-500"
                              >
                                <Minus size={13} strokeWidth={2.5} />
                              </button>
                              <span className="text-sm font-bold text-gray-800 min-w-[16px] text-center">
                                {cart[item.id]}
                              </span>
                              <button
                                onClick={() => addToCart(item.id)}
                                className="w-6 h-6 flex items-center justify-center text-pink-500"
                              >
                                <Plus size={13} strokeWidth={2.5} />
                              </button>
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-2.5">
                          <div className="flex items-center gap-1 mb-1">
                            {item.veg ? (
                              <VegIcon size={12} />
                            ) : (
                              <NonVegIcon size={12} />
                            )}
                            <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
                              {item.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 mb-1.5">
                            <Star
                              size={11}
                              className="fill-green-600 text-green-600"
                            />
                            <span className="text-xs font-semibold text-green-700">
                              {item.rating}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{item.originalPrice}
                              </span>
                            )}
                            <span className="text-sm font-bold text-pink-500">
                              ₹{item.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Footer */}
          <div className="pt-6 pb-4 text-center border-t border-gray-100 mt-4">
            <p className="text-xs text-gray-400">Powered by BuzTap © 2026</p>
          </div>
        </div>

        {/* ── Item Detail Modal ──────────────────────────────────────── */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              key="item-detail-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[2px]"
              onClick={() => setSelectedItem(null)}
            />
          )}
          {selectedItem && (
            <motion.div
              key="item-detail-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[71] bg-white rounded-t-3xl overflow-hidden shadow-2xl"
            >
              {/* Close pill */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>

              {/* Large image */}
              <div className="relative w-full h-64 bg-gray-100">
                <img
                  src={selectedItem.img}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
                {selectedItem.popular && (
                  <span className="absolute top-3 left-3 text-xs font-bold text-green-700 bg-white/90 px-2.5 py-1 rounded-full shadow">
                    Popular
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="px-5 pt-4 pb-8">
                {/* Veg / Non-veg + name */}
                <div className="flex items-start gap-2 mb-1">
                  {selectedItem.veg ? (
                    <VegIcon size={16} />
                  ) : (
                    <NonVegIcon size={16} />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {selectedItem.name}
                  </h3>
                </div>

                {/* Price row */}
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{selectedItem.price}
                  </span>
                  {selectedItem.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{selectedItem.originalPrice}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <Star size={14} className="fill-green-600 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">
                    {selectedItem.rating}
                  </span>
                </div>

                {/* Description */}
                {selectedItem.desc && (
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">
                    {selectedItem.desc}
                  </p>
                )}

                {/* ADD / qty control */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    {!cart[selectedItem.id] ? (
                      <button
                        onClick={() => {
                          addToCart(selectedItem.id);
                        }}
                        className="w-full py-3 rounded-2xl border-2 border-pink-400 text-pink-500 font-extrabold text-base tracking-wide hover:bg-pink-50 transition-colors"
                      >
                        ADD
                      </button>
                    ) : (
                      <div className="flex items-center justify-between border-2 border-pink-400 rounded-2xl px-4 py-2.5">
                        <button
                          onClick={() => removeFromCart(selectedItem.id)}
                          className="text-pink-500 font-bold text-xl leading-none"
                        >
                          −
                        </button>
                        <span className="text-base font-extrabold text-gray-900">
                          {cart[selectedItem.id]}
                        </span>
                        <button
                          onClick={() => addToCart(selectedItem.id)}
                          className="text-pink-500 font-bold text-xl leading-none"
                        >
                          +
                        </button>
                      </div>
                    )}
                    <p className="text-center text-xs text-gray-400 mt-1">
                      Customisable
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Cart */}
        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 left-0 w-full px-4 z-50 pointer-events-none"
            >
              <div className="max-w-md mx-auto pointer-events-auto">
                <div className="bg-[#e8720c] rounded-xl shadow-[0_8px_24px_rgba(232,114,12,0.35)] px-3 py-2.5 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center relative">
                      <ShoppingBag size={16} />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0f0e0b] rounded-full flex items-center justify-center text-[9px] font-bold">
                        {totalItems}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest">
                        Total to pay
                      </p>
                      <p className="font-bold text-sm leading-none">
                        ₹{totalPrice}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCart(true)}
                    className="flex items-center gap-1.5 font-bold text-xs bg-[#faf7f2] text-[#e8720c] px-4 py-2 rounded-lg hover:bg-white transition-colors shadow-sm"
                  >
                    View Cart
                    <ArrowLeft size={13} className="rotate-180" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Checkout Modal */}
        <AnimatePresence>
          {showCart && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[60] flex justify-center bg-black/60 backdrop-blur-sm"
            >
              <div className="w-full max-w-md h-[100dvh] bg-[#faf7f2] flex flex-col relative overflow-hidden shadow-2xl">
                {/* Checkout Header */}
                <div className="px-4 py-4 border-b border-[#e0d9ce] bg-white flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      if (orderPlaced) {
                        setCart({});
                        setOrderPlaced(false);
                        setShowCart(false);
                        setRating(0);
                      } else {
                        setShowCart(false);
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center text-[#0f0e0b] hover:bg-[#e0d9ce] transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="font-bold text-xl text-[#0f0e0b]">
                    Your Order {guestName ? `• ${guestName.split(" ")[0]}` : ""}
                  </h2>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 pb-32">
                  {!orderPlaced ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e0d9ce] space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#857c6e] uppercase tracking-wider mb-2">
                            Your Name
                          </label>
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="E.g. Rahul"
                            className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e0d9ce] rounded-xl focus:outline-none focus:border-[#e8720c]"
                          />
                        </div>
                        <p className="text-xs text-[#857c6e]">
                          Name will be used in order and invoice details.
                        </p>
                      </div>

                      {/* Cart Items List */}
                      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                        {cartTotalPairs.map(([id, qty]) => {
                          const item = findMenuItemById(id);
                          if (!item) return null;
                          return (
                            <div
                              key={id}
                              className="flex justify-between items-center gap-3"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#e0d9ce] bg-[#faf7f2]">
                                  <img
                                    src={item.img}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span
                                      className="w-3.5 h-3.5 rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0"
                                      style={{
                                        borderColor: item.veg
                                          ? "#3a6348"
                                          : "#c0392b",
                                      }}
                                    >
                                      <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{
                                          backgroundColor: item.veg
                                            ? "#3a6348"
                                            : "#c0392b",
                                        }}
                                      />
                                    </span>
                                    <h4 className="font-bold text-[#0f0e0b] text-sm leading-tight truncate">
                                      {item.name}
                                    </h4>
                                  </div>
                                  <p className="font-semibold text-xs text-[#857c6e]">
                                    ₹{item.price} x {qty}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 bg-[#f5f0e8] rounded-lg p-1 px-2 border border-[#e0d9ce]">
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-[#e8720c] p-1"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="font-bold text-sm text-[#0f0e0b] w-4 text-center">
                                  {qty}
                                </span>
                                <button
                                  onClick={() => addToCart(item.id)}
                                  className="text-[#e8720c] p-1"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {recommendedItems.length > 0 ? (
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e0d9ce]">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-[#0f0e0b]">
                              Recommended Order
                            </h3>
                            <span className="text-[11px] font-semibold text-[#857c6e]">
                              Add more
                            </span>
                          </div>
                          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pr-1 snap-x snap-mandatory touch-pan-x">
                            {recommendedItems.map((item) => (
                              <div
                                key={item.id}
                                className="w-[148px] min-w-[148px] rounded-xl border border-[#e0d9ce] bg-[#faf7f2] p-2.5 shrink-0 snap-start"
                              >
                                <div className="w-full h-20 rounded-lg overflow-hidden mb-2">
                                  <img
                                    src={item.img}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex items-center gap-1 mb-1">
                                  <span
                                    className="w-3 h-3 rounded-[3px] border flex items-center justify-center shrink-0"
                                    style={{
                                      borderColor: item.veg
                                        ? "#3a6348"
                                        : "#c0392b",
                                    }}
                                  >
                                    <span
                                      className="w-1 h-1 rounded-full"
                                      style={{
                                        backgroundColor: item.veg
                                          ? "#3a6348"
                                          : "#c0392b",
                                      }}
                                    />
                                  </span>
                                  <p className="text-xs font-bold text-[#0f0e0b] truncate">
                                    {item.name}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-2">
                                  <span className="text-xs font-semibold text-[#857c6e]">
                                    ₹{item.price}
                                  </span>
                                  <button
                                    onClick={() => addToCart(item.id)}
                                    className="px-2.5 py-1 rounded-md bg-[#e8720c] text-white text-[11px] font-bold"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e0d9ce] space-y-4">
                        <div>
                          <h3 className="font-bold text-[#0f0e0b] mb-2">
                            Offers
                          </h3>
                          <div className="space-y-2">
                            {offerOptions.map((offer) => {
                              const eligible = totalPrice >= offer.minSubtotal;
                              const isSelected = selectedOffer === offer.pct;
                              return (
                                <div
                                  key={offer.title}
                                  className={`rounded-xl border px-3 py-2.5 flex items-center justify-between gap-3 ${isSelected ? "bg-[#fef0e4] border-[#e8720c]/40" : "bg-[#faf7f2] border-[#e0d9ce]"}`}
                                >
                                  <div className="min-w-0">
                                    <p className="font-bold text-sm text-[#0f0e0b] leading-tight">
                                      {offer.title}
                                    </p>
                                    <p className="text-[11px] text-[#857c6e] leading-tight mt-0.5">
                                      {offer.subtitle} • Min ₹
                                      {offer.minSubtotal}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedOffer(0);
                                      } else {
                                        setSelectedOffer(offer.pct);
                                        setAppliedCoupon("");
                                        setCouponError("");
                                      }
                                    }}
                                    disabled={!eligible && !isSelected}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${isSelected ? "bg-[#e8720c] text-white" : "bg-[#0f0e0b] text-white"} disabled:bg-[#e0d9ce] disabled:text-[#857c6e]`}
                                  >
                                    {isSelected ? "Remove" : "Apply"}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-[#0f0e0b] mb-3">
                            Coupon Code
                          </h3>
                          <div className="flex gap-2">
                            <input
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value);
                                if (couponError) setCouponError("");
                              }}
                              placeholder="Enter code"
                              className="flex-1 px-3 py-2.5 bg-[#faf7f2] border border-[#e0d9ce] rounded-xl focus:outline-none focus:border-[#e8720c]"
                            />
                            <button
                              onClick={applyCouponCode}
                              className="px-4 py-2.5 rounded-xl bg-[#0f0e0b] text-white font-bold text-sm"
                            >
                              Apply
                            </button>
                          </div>
                          {appliedCoupon ? (
                            <p className="text-xs font-bold text-[#3a6348] mt-2">
                              Applied: {appliedCoupon}
                            </p>
                          ) : null}
                          {couponError ? (
                            <p className="text-xs font-bold text-[#c0392b] mt-2">
                              {couponError}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* Bill Summary */}
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e0d9ce]">
                        <h3 className="font-bold text-[#0f0e0b] mb-3">
                          Bill Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between font-medium text-[#857c6e]">
                            <span>Item Total</span>
                            <span>₹{totalPrice}</span>
                          </div>
                          <div className="flex justify-between font-medium text-[#857c6e]">
                            <span>
                              Discount{" "}
                              {selectedOffer ? `(${selectedOffer}%)` : ""}
                            </span>
                            <span>-₹{discountAmount}</span>
                          </div>
                          <div className="flex justify-between font-medium text-[#857c6e]">
                            <span>Taxes & Fees (5%)</span>
                            <span>₹{taxAmount}</span>
                          </div>
                          <div className="border-t border-dashed border-[#e0d9ce] my-2 pt-3 flex justify-between font-black text-lg text-[#0f0e0b]">
                            <span>Grand Total</span>
                            <span>₹{grandTotal}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="min-h-full flex flex-col items-center justify-start text-center p-6 pb-24 pt-10 space-y-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          damping: 15,
                          stiffness: 200,
                        }}
                        className="w-24 h-24 bg-[#e8f2eb] text-[#3a6348] rounded-full flex items-center justify-center mb-2 shadow-[0_4px_30px_rgba(58,99,72,0.2)]"
                      >
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                              duration: 0.6,
                              delay: 0.2,
                              ease: "easeOut",
                            }}
                            d="M20 6L9 17l-5-5"
                          />
                        </svg>
                      </motion.div>
                      <h2 className="text-3xl font-display font-bold text-[#0f0e0b] mt-1">
                        Order Placed
                        {guestName ? `, ${guestName.split(" ")[0]}` : ""}!
                      </h2>
                      <p className="font-bold text-[#e8720c] bg-[#fef0e4] px-4 py-1.5 rounded-md text-sm inline-block tracking-wider">
                        ORDER #{orderNo}
                      </p>
                      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-[#e0d9ce] mt-2 text-left relative overflow-visible">
                        <div className="absolute top-0 left-0 w-full h-1 rounded-full bg-[#f5f0e8]">
                          <motion.div
                            className="h-full rounded-full bg-[#e8720c]"
                            initial={{ width: "0%" }}
                            animate={{
                              width:
                                orderStatus === 0
                                  ? "33%"
                                  : orderStatus === 1
                                    ? "66%"
                                    : "100%",
                            }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-[#857c6e] uppercase tracking-wider mb-5 mt-1">
                          Live Status
                        </p>

                        <div className="relative space-y-6 pb-5">
                          <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[#f5f0e8]" />
                          <div className="relative pl-9">
                            <div
                              className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full transition-all duration-500 ${orderStatus >= 0 ? "bg-[#e8720c] shadow-[0_0_0_8px_rgba(232,114,12,0.15)]" : "bg-[#e0d9ce]"}`}
                            />
                            <h4
                              className={`font-semibold text-base ${orderStatus >= 0 ? "text-[#0f0e0b]" : "text-[#857c6e]"}`}
                            >
                              Sent to Kitchen
                            </h4>
                            <p className="text-[11px] font-medium text-[#857c6e] mt-1 leading-5">
                              Order received by the chef.
                            </p>
                          </div>
                          <div className="relative pl-9">
                            <div
                              className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full transition-all duration-500 ${orderStatus >= 1 ? "bg-[#e8720c] shadow-[0_0_0_8px_rgba(232,114,12,0.15)]" : "bg-[#e0d9ce]"}`}
                            />
                            <h4
                              className={`font-semibold text-base transition-colors duration-500 ${orderStatus >= 1 ? "text-[#0f0e0b]" : "text-[#857c6e]"}`}
                            >
                              Preparing
                            </h4>
                            <p className="text-[11px] font-medium text-[#857c6e] mt-1 leading-5">
                              Your food is being cooked.
                            </p>
                          </div>
                          <div className="relative pl-9">
                            <div
                              className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full transition-all duration-500 ${orderStatus >= 2 ? "bg-[#3a6348] shadow-[0_0_0_8px_rgba(58,99,72,0.15)]" : "bg-[#e0d9ce]"}`}
                            />
                            <h4
                              className={`font-semibold text-base transition-colors duration-500 ${orderStatus >= 2 ? "text-[#0f0e0b]" : "text-[#857c6e]"}`}
                            >
                              Ready to Serve
                            </h4>
                            <p className="text-[11px] font-medium text-[#857c6e] mt-1 leading-5">
                              Chef has completed your order.
                            </p>
                          </div>
                        </div>
                      </div>

                      {orderStatus === 2 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="w-full bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#e0d9ce] mt-4 z-10 relative"
                        >
                          <p className="font-bold text-[#0f0e0b] mb-4 text-[15px]">
                            Rate your experience ✨
                          </p>
                          <div className="flex justify-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-125 active:scale-90"
                              >
                                <Star
                                  className={`transition-colors duration-300 ${rating >= star ? "fill-[#e8720c] text-[#e8720c]" : "text-[#d4cbb8]"}`}
                                  size={32}
                                  strokeWidth={1.5}
                                />
                              </button>
                            ))}
                          </div>
                          {rating > 0 && (
                            <motion.p
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-[#3a6348] font-bold mt-3 bg-[#e8f2eb] inline-block px-3 py-1.5 rounded-md"
                            >
                              Thanks for your feedback! ❤️
                            </motion.p>
                          )}
                        </motion.div>
                      )}

                      <button
                        onClick={() => {
                          setCart({});
                          setOrderPlaced(false);
                          setShowCart(false);
                          setRating(0);
                        }}
                        className="mt-4 w-full text-[#e8720c] font-bold text-sm bg-[#fef0e4] px-6 py-3.5 rounded-xl transition-colors hover:bg-[#fde8e8] hover:shadow-sm"
                      >
                        Start New Order
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Sticky Bottom Place Order */}
                {!orderPlaced && (
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-[#e0d9ce] shrink-0 text-center">
                    <button
                      onClick={() => {
                        if (!guestName.trim()) {
                          setShowCart(true);
                          return;
                        }

                        const nextOrderNo = Math.floor(
                          1000 + Math.random() * 9000,
                        );
                        setOrderNo(nextOrderNo);
                        setOrderPlaced(true);

                        const orderRecord = {
                          id: nextOrderNo,
                          date: new Date().toLocaleString(),
                          total: grandTotal,
                          subtotal: totalPrice,
                          discount: discountAmount,
                          tax: taxAmount,
                          taxableAmount,
                          items: totalItems,
                          itemList: orderLineItems,
                          status: "Placed",
                          couponCode: appliedCoupon,
                          offerPercent: selectedOffer,
                          restaurantName: restaurantProfile.name,
                          tableName: restaurantProfile.tableLabel,
                          guestName: guestName || "Guest",
                          guestPhone,
                        };

                        if (guestPhone) {
                          const history = loadOrderHistory(guestPhone);
                          const updatedHistory = [
                            orderRecord,
                            ...history,
                          ].slice(0, 10);
                          setOrderHistory(updatedHistory);
                          saveOrderHistory(guestPhone, updatedHistory);

                          const newVisitCount = visitCount + 1;
                          setVisitCount(newVisitCount);
                          localStorage.setItem(
                            `visits_${guestPhone}`,
                            newVisitCount.toString(),
                          );

                          if (
                            newVisitCount >= 5 &&
                            !localStorage.getItem(
                              `reward_claimed_${guestPhone}`,
                            )
                          ) {
                            setTimeout(() => setShowReward(true), 3000);
                          }
                        }
                      }}
                      disabled={!guestName.trim()}
                      className="w-full bg-[#e8720c] disabled:bg-[#e0d9ce] disabled:text-[#857c6e] text-white py-3.5 rounded-xl font-bold text-lg shadow-[0_4px_20px_rgba(232,114,12,0.3)] hover:bg-[#d4620a] transition-colors flex items-center justify-center gap-2"
                    >
                      Place Order • ₹{grandTotal}{" "}
                      <ArrowLeft size={18} className="rotate-180" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>

      {/* Loyalty Reward Modal */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReward(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#e8720c] to-[#d4620a] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-10 h-10 text-white fill-white" />
              </div>

              <h3 className="text-2xl font-bold text-[#0f0e0b] mb-2 font-display">
                🎉 Congratulations!
              </h3>

              <p className="text-[#857c6e] text-sm mb-6 leading-relaxed">
                You've visited us {visitCount} times! Scratch to reveal your
                FREE reward!
              </p>

              {/* Scratch Card Component */}
              <ScratchCard
                width={280}
                height={120}
                image="/api/placeholder/280/120"
                finishPercent={50}
                onComplete={() => {
                  // Add a free item to cart (let's give them the most expensive item as reward)
                  const freeItem = menuItems.reduce((prev, current) =>
                    prev.price > current.price ? prev : current,
                  );
                  addToCart(freeItem.id);
                  setFreeItemClaimed(true);
                  localStorage.setItem(`reward_claimed_${guestPhone}`, "true");
                  setTimeout(() => setShowReward(false), 2000); // Close after showing reward
                }}
              >
                {/* Scratch Layer */}
                <div className="w-full h-full bg-gradient-to-br from-[#e8720c] via-[#f97316] to-[#d4620a] rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  <div className="text-white text-center z-10">
                    <div className="text-2xl mb-1">🎁</div>
                    <div className="text-sm font-bold">Scratch Here!</div>
                  </div>
                </div>

                {/* Reward Layer */}
                <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex flex-col items-center justify-center text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  <div className="text-center z-10">
                    <div className="text-3xl mb-2">🎉</div>
                    <div className="text-lg font-bold mb-1">FREE ITEM!</div>
                    <div className="text-sm opacity-90">
                      {
                        menuItems.reduce((prev, current) =>
                          prev.price > current.price ? prev : current,
                        ).name
                      }
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-xs opacity-75 text-center">
                    Added to your cart!
                  </div>
                </div>
              </ScratchCard>

              <p className="text-[#857c6e] text-xs mt-4 leading-relaxed">
                Scratch the card above to claim your free{" "}
                {
                  menuItems.reduce((prev, current) =>
                    prev.price > current.price ? prev : current,
                  ).name
                }
                !
              </p>

              <button
                onClick={() => setShowReward(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#faf7f2] flex items-center justify-center text-[#857c6e] hover:bg-[#f0ebe0] transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { CheckCircle2, ArrowRight, QrCode } from "lucide-react";
import { FOOD_ITEMS } from "../../data/database";
import { FoodCard } from "./FoodCard";

export function PhoneScreen({ screen }) {
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
            BuzTap · Live
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

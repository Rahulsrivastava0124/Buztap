import { useState } from "react";
import { ArrowRight, Users, Menu } from "lucide-react";
import { FOOD_ITEMS } from "../../data/database";
import { PhoneFrame } from "./PhoneFrame";

export function GuestPhone() {
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
      <div className=" px-4 py-1.5 flex items-center text-black justify-between shrink-0">
        <span className=" text-[9px]">EN ▾</span>
        <span className=" text-[9px] font-bold tracking-widest">BuzTap</span>
        <div className="flex gap-2">
          <Users size={11} className="" />
          <Menu size={11} className="" />
        </div>
      </div>
      {/* hero banner */}
      <div className="relative h-32 shrink-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"
          alt="restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end">
          <div>
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mb-1.5">
              <div className="w-7 h-7 bg-ink rounded-lg flex items-center justify-center">
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
      <div className="px-3 py-2 bg-white shrink-0">
        <div className="flex items-center gap-2 bg-[#f5f0e8] rounded-xl px-3 py-1.5">
          <span className="text-[8px] text-muted truncate flex-1">
            Table 04 · Spice Garden, Pune
          </span>
          <ArrowRight size={9} className="text-muted2 shrink-0" />
        </div>
      </div>
      {/* categories */}
      <div className="flex gap-2 px-3 py-1.5 bg-white shrink-0">
        {["Mains", "Starters", "Breads", "Drinks"].map((cat, i) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(i)}
            className="text-[8px] font-semibold px-3 py-1 rounded-full shrink-0 transition-all"
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
      <div className="flex-1 overflow-y-auto bg-paper px-3 pb-2">
        <p className="text-[10px] font-bold text-ink py-2">Mains</p>
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
                  <p className="text-[9px] font-semibold text-ink leading-tight">
                    {item.name}
                  </p>
                  <p className="text-[7px] text-muted2 mt-0.5">{item.desc}</p>
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
        <div className="bg-white border-t border-[#f0ebe0] px-3 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-saffron flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">
                {cart.length}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-ink">
              Order details
            </span>
          </div>
          <span className="text-[10px] font-bold text-saffron">₹{total}</span>
        </div>
      ) : (
        <div className="h-2 shrink-0" />
      )}
    </PhoneFrame>
  );
}

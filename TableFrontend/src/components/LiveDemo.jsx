import { useMemo, useState } from "react";

const demoData = {
  restaurant: {
    title: "🍛 Sharma's Kitchen",
    items: [
      {
        icon: "🍛",
        name: "Dal Makhani",
        sub: "Rich & creamy ● Veg",
        price: "₹220",
      },
      {
        icon: "🍗",
        name: "Butter Chicken",
        sub: "Classic murgh makhani ● Non-Veg",
        price: "₹320",
      },
      {
        icon: "🫓",
        name: "Garlic Naan",
        sub: "Fresh from tandoor ● Veg",
        price: "₹60",
      },
    ],
  },
  foodcourt: {
    title: "🏢 Phoenix Mall Food Court",
    items: [
      {
        icon: "🍚",
        name: "Biryani Blues",
        sub: "North Indian ● Floor 2",
        price: "₹180",
      },
      {
        icon: "🥡",
        name: "Wok Express",
        sub: "Chinese ● Floor 1",
        price: "₹220",
      },
      {
        icon: "🍕",
        name: "Pizza Corner",
        sub: "Italian ● Floor 2",
        price: "₹299",
      },
    ],
  },
  cafe: {
    title: "☕ Chai & Co.",
    items: [
      {
        icon: "☕",
        name: "Masala Chai",
        sub: "Ginger, cardamom ● Veg",
        price: "₹40",
      },
      {
        icon: "🥐",
        name: "Butter Croissant",
        sub: "Fresh baked ● Veg",
        price: "₹80",
      },
      {
        icon: "🍰",
        name: "Chocolate Cake",
        sub: "Slice ● Eggless",
        price: "₹120",
      },
    ],
  },
};

const tabs = [
  ["restaurant", "Restaurant"],
  ["foodcourt", "Food Court"],
  ["cafe", "Café"],
];

export default function LiveDemo() {
  const [active, setActive] = useState("restaurant");
  const current = useMemo(() => demoData[active], [active]);

  return (
    <section id="demo" className="border-y border-white/10 bg-ink">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 py-20 lg:grid-cols-2 lg:gap-20 lg:px-[52px]">
        <div>
          <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            Interactive Preview
          </div>
          <h2 className="mb-4 font-display text-[clamp(30px,4vw,52px)] leading-[1.08] font-black tracking-[-1.5px] text-white">
            See it in
            <br />
            <em className="italic text-primary">action.</em>
          </h2>
          <p className="mb-7 max-w-[500px] text-base leading-7 text-white/50">
            This is exactly what your customers see when they scan your QR code.
            Beautiful, fast, and completely free.
          </p>

          <div className="mb-7 flex overflow-hidden rounded-xl border border-white/10">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={`flex-1 border-r border-white/10 px-4 py-3 text-[13px] font-semibold transition last:border-r-0 ${
                  active === key
                    ? "bg-primary text-white"
                    : "bg-transparent text-white/45"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {[
              "Customers scan once — menu loads in under 1 second",
              "No app download, no account creation for customers",
              "Works on 2G networks, even in basement food courts",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2.5 text-[13px] text-white/50"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-white/7 text-base">
                  ✅
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="reveal overflow-hidden rounded-[20px] border border-white/10 bg-[#1a1916]">
          <div className="flex items-center justify-between border-b border-white/7 px-5 py-4">
            <div className="font-display text-base font-bold text-white">
              {current.title}
            </div>
            <div className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-white">
              FREE MENU
            </div>
          </div>

          <div className="flex gap-0 border-b border-white/7 px-5">
            {["All", "Starters", "Mains", "Drinks"].map((tab, index) => (
              <div
                key={tab}
                className={`cursor-pointer border-b-2 px-3.5 py-2.5 text-xs font-semibold ${index === 0 ? "border-primary text-white" : "border-transparent text-white/35"}`}
              >
                {tab}
              </div>
            ))}
          </div>

          <div className="px-5 py-3">
            {current.items.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between border-b border-white/5 py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-[42px] items-center justify-center rounded-[10px] bg-warm2 text-[22px]">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-white/35">{item.sub}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-primary">
                    {item.price}
                  </div>
                  <button
                    type="button"
                    className="flex size-7 items-center justify-center rounded-full bg-primary text-lg leading-none text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-primary/20 bg-primary/10 px-5 py-3.5">
            <div className="text-xs text-white/50">
              Powered by{" "}
              <span className="font-bold text-primary">MenuDukaan</span> · Free
            </div>
            <button
              type="button"
              className="btn h-auto min-h-0 rounded-full border-none bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-saffron-dark"
            >
              Full Menu →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

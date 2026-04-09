function OutletRow({ icon, name, sub, dashed = false }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition ${
        dashed
          ? "border border-dashed border-black/10 bg-transparent"
          : "cursor-pointer bg-warm hover:bg-warm2"
      }`}
    >
      <span className="shrink-0 text-[22px]">{icon}</span>
      <div>
        <div
          className={`text-[13px] font-bold ${dashed ? "text-muted" : "text-ink"}`}
        >
          {name}
        </div>
        <div className="text-[10px] text-muted">{sub}</div>
      </div>
      {!dashed && <span className="ml-auto text-base text-muted">›</span>}
    </div>
  );
}

function MenuRow({ icon, name, sub, price }) {
  return (
    <div className="flex items-center justify-between border-b border-black/10 py-3.5 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-warm text-2xl">
          {icon}
        </div>
        <div>
          <div className="text-sm font-bold text-ink">{name}</div>
          <div className="text-[11px] text-muted">{sub}</div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="text-[15px] font-extrabold text-ink">{price}</div>
        <button
          type="button"
          className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white"
        >
          Add +
        </button>
      </div>
    </div>
  );
}

export default function PhoneMock({
  variant = "outlets",
  floatingBadge,
  className = "",
}) {
  const isMenu = variant === "menu";

  return (
    <div className={`relative ${className}`}>
      {floatingBadge && (
        <div className="absolute -top-4 -right-3 z-20 flex flex-col items-center gap-0.5 rounded-xl bg-primary px-3.5 py-2.5 text-[11px] font-bold text-white shadow-[0_8px_24px_rgba(244,121,11,0.35)]">
          <span>{floatingBadge.label}</span>
          <span className="text-[22px] leading-none font-black">
            {floatingBadge.value}
          </span>
        </div>
      )}

      <div className="mockup-phone border-[#ff8938] shadow-[0_20px_60px_rgba(17,16,9,0.12)]">
        <div className="mockup-phone-camera" />
        <div className="mockup-phone-display bg-base-100">
          <div className="h-[560px] w-[280px] overflow-hidden rounded-[22px] border border-black/10 bg-white">
            <div className="flex items-center justify-between bg-ink px-4 py-3.5">
              <div className="text-[15px] font-bold text-white">MenuDukaan</div>
              <div className="flex items-center gap-1.5 before:size-1.5 before:rounded-full before:bg-[#4cdb6e] before:content-['']">
                <span className="text-[10px] font-bold text-[#4cdb6e]">
                  LIVE
                </span>
              </div>
            </div>

            {!isMenu ? (
              <>
                <div className="space-y-2.5 px-3.5 pt-3.5">
                  <OutletRow
                    icon="🍚"
                    name="Biryani Blues"
                    sub="North Indian • Floor 2"
                  />
                  <OutletRow
                    icon="🥡"
                    name="Wok Express"
                    sub="Chinese • Floor 1"
                  />
                  <OutletRow
                    icon="🍕"
                    name="Pizza Corner"
                    sub="Italian • Floor 2"
                  />
                  <OutletRow
                    icon="+"
                    name="Add Your Outlet"
                    sub="Free forever"
                    dashed
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between bg-warm px-3.5 py-2.5 text-[10px] font-bold text-muted">
                  <span>Powered by MenuDukaan</span>
                  <span>4 outlets</span>
                </div>
              </>
            ) : (
              <>
                <div className="px-4 pt-4">
                  <div className="mb-1 text-lg font-black text-ink">
                    Sharma&apos;s Kitchen
                  </div>
                  <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                    <span className="rounded-full bg-warm px-2.5 py-1 font-semibold text-ink">
                      North Indian
                    </span>
                    <span className="font-bold text-primary">★ 4.8</span>
                    <span>• Patna, Bihar</span>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto px-4 pb-3">
                  {["All", "Starters", "Mains", "Breads"].map((tab, index) => (
                    <div
                      key={tab}
                      className={`cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-semibold ${
                        index === 0
                          ? "border-ink bg-ink text-white"
                          : "border-black/10 bg-white text-ink"
                      }`}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-2">
                  <MenuRow
                    icon="🥗"
                    name="Paneer Tikka"
                    sub="Starter · Veg ● Best Seller"
                    price="₹260"
                  />
                  <MenuRow
                    icon="🍗"
                    name="Butter Chicken"
                    sub="Main Course · Non-Veg"
                    price="₹320"
                  />
                  <MenuRow
                    icon="🍛"
                    name="Dal Makhani"
                    sub="Main Course · Veg"
                    price="₹220"
                  />
                </div>
                <div className="flex items-center justify-between bg-ink px-4 py-3 text-[10px] font-bold text-white/70">
                  <span>Powered by MenuDukaan</span>
                  <span>Free Forever</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

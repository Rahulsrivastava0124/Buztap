const benefits = [
  [
    "💸",
    "bg-primary",
    "Save ₹5,000+ on reprinting",
    "Update prices, add seasonal items, remove sold-out dishes — all instantly, forever free.",
  ],
  [
    "📈",
    "bg-secondary",
    "30% higher engagement",
    "Digital menus with photos get 3× more time-on-page than paper menus. Customers explore more, order more.",
  ],
  [
    "🕐",
    "bg-ink",
    "Setup in under 5 minutes",
    "Fastest onboarding in the industry. We've timed it. The record is 3 minutes 14 seconds.",
  ],
];

import PhoneMock from "./PhoneMock";

export default function RestaurantShowcase() {
  return (
    <section id="restaurants" className="border-t border-black/10">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 py-20 lg:grid-cols-[1fr_480px] lg:px-[52px]">
        <div>
          <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            For Restaurants & Cafes
          </div>
          <h2 className="mb-5 font-display text-[clamp(30px,4vw,52px)] leading-[1.08] font-black tracking-[-1.5px] text-ink">
            Your restaurant,
            <br />
            beautifully
            <br />
            <em className="italic">presented.</em>
          </h2>
          <p className="mb-7 text-[15px] leading-7 text-muted">
            This is what your customers see. Not a PDF, not a screenshot — a
            proper, interactive, always-up-to-date digital menu.
          </p>

          <div className="mb-9 space-y-3">
            {benefits.map(([icon, bgClass, title, desc]) => (
              <div
                key={title}
                className="flex items-start gap-3.5 rounded-2xl bg-warm p-4"
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-[10px] text-lg text-white ${bgClass}`}
                >
                  {icon}
                </div>
                <div>
                  <div className="mb-1 text-sm font-bold text-ink">{title}</div>
                  <div className="text-[13px] text-muted">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <a
            href="#"
            className="btn rounded-full border-none bg-primary px-9 py-4 text-[15px] font-bold text-white hover:bg-saffron-dark"
          >
            Get Your Free Menu Now
          </a>
        </div>

        <div className="reveal flex items-center justify-center rounded-[32px] border border-black/10 bg-warm px-6 py-8 shadow-[0_24px_64px_rgba(17,16,9,0.08)]">
          <PhoneMock variant="menu" />
        </div>
      </div>
    </section>
  );
}

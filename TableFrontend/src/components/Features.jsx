const featureCards = [
  {
    title: "Instant QR Menu",
    body: "Customers scan, menu opens in the browser. No app, no link-in-bio nonsense. Works on every phone from 2015 onwards.",
    icon: "📱",
    className: "md:col-span-2 bg-primary text-white",
    bigNum: "0ms",
  },
  {
    title: "Real Analytics",
    body: "See peak hours, popular dishes, and daily traffic. Data that actually helps you decide what to cook more of.",
    icon: "📊",
    className: "bg-warm",
  },
  {
    title: "Live Price Updates",
    body: "Change a price and every customer's phone shows it instantly. No reprinting, no awkward corrections.",
    icon: "⚡",
    className: "bg-ink text-white",
  },
  {
    title: "Veg / Non-Veg Badges",
    body: "Automatic green and red dot indicators. Your customers know before they order — no surprises.",
    icon: "🌿",
    className: "bg-secondary text-white",
  },
  {
    title: "Hindi + English",
    body: "Serve customers in the language they're comfortable with. More languages coming.",
    icon: "🗣️",
    className: "bg-warm",
  },
  {
    title: "Food Court Mode",
    body: "One QR for the entire mall. Visitors browse all outlets, pick a restaurant, and see the full menu. Each outlet manages their own listing independently.",
    icon: "🏢",
    className: "md:col-span-2 bg-warm",
  },
  {
    title: "Photo Menus",
    body: "Upload dish photos from your phone. Menus with images get 3× more engagement than text-only ones.",
    icon: "🖼️",
    className: "bg-warm",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-[1240px] px-5 py-16 lg:px-13 lg:py-25"
    >
      <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
        Everything Free
      </div>
      <h2 className="mb-4 font-display text-[clamp(30px,4vw,52px)] leading-[1.08] font-black tracking-[-1.5px] text-ink">
        Every feature.
        <br />
        Not a rupee.
      </h2>
      <p className="mb-15 max-w-[500px] text-base leading-7 text-muted">
        We make money from tasteful ads on menu pages — never from restaurants.
        That&apos;s the whole model.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featureCards.map((card) => {
          const dark = card.className.includes("text-white");
          return (
            <article
              key={card.title}
              className={`bento-card reveal rounded-[20px] border border-black/10 p-7 transition duration-250 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(17,16,9,0.1)] ${card.className}`}
            >
              <div
                className={`mb-5 flex size-11 items-center justify-center rounded-xl text-[22px] ${dark ? "bg-white/15" : "bg-paper"}`}
              >
                {card.icon}
              </div>
              <h3
                className={`mb-2 font-display text-[19px] font-bold ${dark ? "text-white" : "text-ink"}`}
              >
                {card.title}
              </h3>
              <p
                className={`text-sm leading-[1.65] ${dark ? "text-white/70" : "text-muted"}`}
              >
                {card.body}
              </p>
              {card.bigNum && (
                <div className="mt-4 font-display text-7xl leading-none font-black text-white/90">
                  {card.bigNum}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

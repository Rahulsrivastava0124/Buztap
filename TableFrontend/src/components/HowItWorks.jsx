const steps = [
  [
    "01",
    "Sign Up Free",
    "Create your account in 30 seconds. Mobile-friendly. No credit card, ever.",
  ],
  [
    "02",
    "Build Your Menu",
    "Add dishes, set prices, upload photos. All from your phone. Our editor is ridiculously simple.",
  ],
  [
    "03",
    "Get Your QR",
    "Download, print, place on tables. Or order our free acrylic table stand — we'll ship it to you.",
  ],
  [
    "04",
    "Grow & Earn",
    "Watch analytics, discover best-sellers, attract more customers. We handle the rest.",
  ],
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="mx-auto max-w-[1240px] border-t border-black/10 px-5 py-16 lg:px-[52px] lg:py-25"
    >
      <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
        Simple Process
      </div>
      <h2 className="mb-4 font-display text-[clamp(30px,4vw,52px)] leading-[1.08] font-black tracking-[-1.5px] text-ink">
        Live in five
        <br />
        <em className="italic">minutes flat.</em>
      </h2>
      <p className="mb-13 text-base leading-7 text-muted">
        Faster than making a cup of chai.
      </p>

      <div className="grid border border-black/10 md:grid-cols-2 xl:grid-cols-4">
        {steps.map(([num, title, desc], index) => {
          const highlight = index === 3;
          return (
            <article
              key={title}
              className={`reveal px-8 py-10 ${index !== steps.length - 1 ? "border-r border-black/10" : ""} ${highlight ? "bg-primary" : ""}`}
            >
              <div
                className={`mb-4 font-display text-[64px] leading-none font-black transition-colors ${highlight ? "text-white/25" : "text-warm2"}`}
              >
                {num}
              </div>
              <h3
                className={`mb-2.5 font-display text-lg font-bold ${highlight ? "text-white" : "text-ink"}`}
              >
                {title}
              </h3>
              <p
                className={`text-[13px] leading-[1.65] ${highlight ? "text-white/75" : "text-muted"}`}
              >
                {desc}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

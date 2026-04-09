const plans = [
  {
    plan: "Starter",
    price: "₹0",
    desc: "Perfect for a single outlet getting started.",
    features: [
      "Digital QR menu",
      "Up to 50 menu items",
      "Basic analytics",
      "Veg/Non-Veg badges",
      "1 language",
    ],
    cta: "Get Started Free",
  },
  {
    plan: "Restaurant Pro",
    price: "₹0",
    desc: "For restaurants that want the full experience.",
    features: [
      "Unlimited menu items",
      "Dish photos & videos",
      "Full analytics dashboard",
      "Hindi + English menus",
      "Priority support",
      "Free acrylic table stand",
    ],
    cta: "Claim Your Free Menu",
    highlighted: true,
    tag: "MOST POPULAR",
  },
  {
    plan: "Mall / Food Court",
    price: "₹0",
    desc: "Manage 5–100+ outlets under one QR code.",
    features: [
      "All outlets, one scan",
      "Unified analytics",
      "Featured outlet promotions",
      "Outlet manager logins",
      "Dedicated account manager",
    ],
    cta: "Onboard Your Mall",
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="border-y border-secondary/15 bg-sage-light"
    >
      <div className="mx-auto max-w-[1240px] px-5 py-20 lg:px-[52px]">
        <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
          Transparent Pricing
        </div>
        <h2 className="mb-4 font-display text-[clamp(30px,4vw,52px)] leading-[1.08] font-black tracking-[-1.5px] text-ink">
          No hidden charges.
          <br />
          Seriously, none.
        </h2>
        <p className="max-w-[500px] text-base leading-7 text-muted">
          Pick a plan — they&apos;re all free. The difference is just how much
          we can do together.
        </p>

        <div className="mt-12 grid gap-5 xl:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.plan}
              className={`reveal relative overflow-hidden rounded-[20px] border p-9 ${plan.highlighted ? "border-ink bg-ink text-white" : "border-black/10 bg-white text-ink"}`}
            >
              {plan.tag && (
                <div className="absolute top-5 right-5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-white">
                  {plan.tag}
                </div>
              )}
              <div
                className={`mb-3 text-xs font-bold uppercase tracking-[0.12em] ${plan.highlighted ? "text-white/45" : "text-muted"}`}
              >
                {plan.plan}
              </div>
              <div
                className={`mb-1 font-display text-[52px] leading-none font-black ${plan.highlighted ? "text-white" : "text-ink"}`}
              >
                {plan.price}
                <sub
                  className={`text-lg font-normal align-baseline font-body ${plan.highlighted ? "text-white/50" : ""}`}
                >
                  /mo
                </sub>
              </div>
              <p
                className={`mb-7 text-[13px] ${plan.highlighted ? "text-white/50" : "text-muted"}`}
              >
                {plan.desc}
              </p>
              <ul className="mb-8 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-center gap-2.5 text-[13px] font-medium ${plan.highlighted ? "text-white/85" : "text-ink"}`}
                  >
                    <span
                      className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${plan.highlighted ? "bg-white/10 text-white" : "bg-sage-light text-secondary"}`}
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`btn w-full rounded-full border px-4 py-3 text-sm font-bold shadow-none ${plan.highlighted ? "border-primary bg-primary text-white hover:bg-saffron-dark" : "border-black/10 bg-transparent text-ink hover:border-ink hover:bg-warm"}`}
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>

        <div className="mt-7 text-center text-[13px] text-muted">
          We earn through non-intrusive ads shown on menu pages. You get
          everything free.
        </div>
      </div>
    </section>
  );
}

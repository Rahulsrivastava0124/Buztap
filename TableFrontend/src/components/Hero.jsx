import PhoneMock from "./PhoneMock";

export default function Hero() {
  return (
    <section className="grid min-h-[calc(100vh-108px)] border-b border-black/10 lg:grid-cols-[1fr_440px]">
      <div className="flex flex-col justify-center border-r-0 border-black/10 px-5 py-12 lg:border-r lg:px-13 lg:py-18">
        <div className="hero-ch-1 mb-7 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-primary before:h-[2px] before:w-7 before:bg-primary before:content-['']">
          India's Smartest Digital Menu
        </div>
        <h1 className="hero-ch-2 mb-7 font-display text-[clamp(42px,5.5vw,76px)] leading-[1.02] font-black tracking-[-2px] text-ink">
          Your Menu,
          <nobr />
          <br />
          <span className="italic text-primary">Everywhere.</span>
          <br />
          ₹0 Always.
        </h1>
        <p className="hero-ch-3 mb-11 max-w-[460px] text-base leading-7 text-muted">
          One QR code. Every dish. No printing, no apps, no monthly bills.
          MenuDukaan puts your food court or restaurant in every customer's
          pocket — for free, forever.
        </p>
        <div className="hero-ch-4 mb-13 flex flex-wrap gap-3.5">
          <a
            href="#"
            className="btn rounded-full border-none bg-primary px-9 py-4 text-[15px] font-bold text-white hover:bg-saffron-dark"
          >
            Start Free Today
          </a>
          <a
            href="#demo"
            className="btn btn-outline rounded-full border-black/10 bg-transparent px-8 py-4 text-[15px] font-semibold text-ink shadow-none hover:border-ink hover:bg-transparent"
          >
            Live Demo ↓
          </a>
        </div>
        <div className="hero-ch-5 flex flex-wrap gap-7">
          {[
            "No credit card needed",
            "Ready in 5 minutes",
            "500+ restaurants trust us",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-[13px] font-medium text-muted"
            >
              <span className="size-[7px] rounded-full bg-secondary" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-warm px-8 py-10 lg:flex lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute -right-5 bottom-10 text-[120px] leading-none font-black text-black/4 select-none">
          MENU
        </div>

        <div className="float-anim z-10 mx-auto">
          <PhoneMock floatingBadge={{ label: "Scans Today", value: "2.4K" }} />
        </div>
      </div>
    </section>
  );
}

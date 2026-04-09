export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-primary px-5 py-20 text-center lg:px-[52px] lg:py-25">
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_50%,rgba(0,0,0,0.05)_0%,transparent_50%)]" />
      <div className="relative z-10 mx-auto max-w-[680px]">
        <div className="mb-3.5 flex justify-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
          Join 500+ Restaurants
        </div>
        <h2 className="mb-4 font-display text-[clamp(30px,4vw,52px)] leading-[1.08] font-black tracking-[-1.5px] text-white">
          Your menu deserves
          <br />
          to be digital.
        </h2>
        <p className="mb-10 text-base leading-7 text-white/80">
          No monthly fees, no apps to install, no complicated setup. Just a
          beautiful menu your customers can actually use.
        </p>
        <a
          href="#"
          className="btn rounded-full border-none bg-white px-11 py-4 text-base font-extrabold text-primary hover:bg-ink hover:text-white"
        >
          Get Your Free Menu Now
        </a>
        <div className="mt-5 flex flex-wrap justify-center gap-6">
          {[
            "Free forever",
            "No credit card",
            "5 minute setup",
            "Works on all phones",
          ].map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 text-[13px] font-medium text-white/70 before:font-bold before:text-white before:content-['✓']"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

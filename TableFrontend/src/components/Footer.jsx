const footerCols = [
  {
    title: "Product",
    links: [
      "Features",
      "How It Works",
      "For Restaurants",
      "For Malls",
      "Advertise",
    ],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Press"],
  },
  {
    title: "Legal",
    links: [
      "Privacy Policy",
      "Terms of Service",
      "Cookie Policy",
      "Partner Login",
    ],
  },
];

export default function Footer() {
  return (
    <footer id="advertise" className="bg-[#0d0c09]">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-16 pb-8 md:grid-cols-2 xl:grid-cols-[2.2fr_1fr_1fr_1fr] xl:px-[52px]">
        <div>
          <div className="mb-3 font-display text-[22px] font-black text-white">
            MenuDukaan<sup className="text-[11px] text-primary">®</sup>
          </div>
          <p className="mb-5 max-w-[380px] text-[13px] leading-7 text-white/35">
            Free digital menus for India&apos;s restaurants and mall food
            courts. Scan a QR, browse the menu, decide what to eat.
          </p>
          <div className="space-y-1 text-[12px] text-white/35">
            <a
              href="mailto:hello@menudukaan.com"
              className="block transition hover:text-primary"
            >
              hello@menudukaan.com
            </a>
            <a
              href="tel:+918678889224"
              className="block transition hover:text-primary"
            >
              +91 86788 89224
            </a>
            <span className="block text-white/25">Patna, Bihar, India</span>
          </div>
        </div>

        {footerCols.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
              {col.title}
            </h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-[13px] text-white/50 transition hover:text-white"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-2 border-t border-white/7 px-5 py-5 text-[12px] text-white/25 md:flex-row xl:px-[52px]">
        <span>© 2026 MenuDukaan. Made with ❤️ in India.</span>
        <span className="text-primary">Free Forever ●</span>
      </div>
    </footer>
  );
}

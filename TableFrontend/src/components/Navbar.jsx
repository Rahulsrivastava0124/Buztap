const navLinks = [
  ["Features", "#features"],
  ["How It Works", "#how"],
  ["Pricing", "#pricing"],
  ["For Restaurants", "#restaurants"],
  ["Advertise", "#advertise"],
];

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 border-b border-black/10 bg-base-100/95 backdrop-blur">
      <div className="navbar mx-auto min-h-[68px] max-w-[1440px] px-5 lg:px-13">
        <div className="navbar-start">
          <a
            href="#"
            className="font-display text-2xl font-black tracking-[-0.5px] text-ink"
          >
            MenuDukaan<sup className="text-sm text-primary">®</sup>
          </a>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1 rounded-full bg-transparent px-0">
            {navLinks.map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  className="rounded-full px-4 py-2 text-[13px] font-medium text-muted hover:bg-warm hover:text-ink"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-end gap-2">
          <a
            href="#"
            className="btn btn-outline border-black/10 bg-transparent px-5 text-[13px] font-semibold text-ink shadow-none hover:border-ink hover:bg-transparent"
          >
            Sign In
          </a>
          <a
            href="#"
            className="btn btn-neutral rounded-full border-none px-6 text-[13px] font-semibold text-base-100 hover:btn-primary"
          >
            Get Free Menu →
          </a>
        </div>
      </div>
    </div>
  );
}

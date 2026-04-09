const stats = [
  ["500+", "Restaurants & outlets onboarded"],
  ["10K+", "Menu scans every month"],
  ["15+", "Cities across India"],
  ["₹0", "Cost. Not a paisa. Ever."],
];

export default function NumbersRow() {
  return (
    <section className="grid border-b border-black/10 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(([value, label], index) => (
        <div
          key={label}
          className={`num-cell group reveal relative overflow-hidden px-11 py-10 ${index !== stats.length - 1 ? "border-r border-black/10" : ""}`}
        >
          <div className="absolute inset-0 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 font-display text-5xl leading-none font-black text-ink transition-colors duration-300 group-hover:text-white">
            {value}
          </div>
          <div className="relative z-10 mt-1.5 text-[13px] font-medium text-muted transition-colors duration-300 group-hover:text-white">
            {label}
          </div>
        </div>
      ))}
    </section>
  );
}

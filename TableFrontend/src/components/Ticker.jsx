const tickerItems = [
  "100% Free Forever",
  "No App Download",
  "Setup in 5 Minutes",
  "Works on Every Phone",
  "Instant Menu Updates",
  "Veg / Non-Veg Badges",
  "Free Analytics Dashboard",
  "Hindi & English Support",
];

const loopedItems = [...tickerItems, ...tickerItems];

export default function Ticker() {
  return (
    <div className="overflow-hidden bg-primary py-2 text-[12px] font-semibold tracking-[0.05em] text-primary-content whitespace-nowrap">
      <div className="ticker-anim inline-flex gap-16">
        {loopedItems.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-2.5">
            <span className="text-[10px]">★</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

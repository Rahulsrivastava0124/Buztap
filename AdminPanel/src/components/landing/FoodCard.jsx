export function FoodCard({ item, compact = false }) {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-[0_1px_5px_rgba(15,14,11,0.08)]`}
    >
      <div
        className="relative overflow-hidden"
        style={{ height: compact ? 52 : 64 }}
      >
        <img
          src={item.img}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <span
          className="absolute top-1.5 left-1.5 w-2 h-2 rounded-sm border-2"
          style={{
            borderColor: item.veg ? "#3a6348" : "#c0392b",
            backgroundColor: item.veg ? "#e8f2eb" : "#fde8e8",
          }}
        />
      </div>
      <div className="p-1.5">
        <p className="text-[8px] font-semibold text-[#0f0e0b] leading-tight">
          {item.name}
        </p>
        <p className="text-[7px] text-[#b0a898]">{item.desc}</p>
      </div>
    </div>
  );
}

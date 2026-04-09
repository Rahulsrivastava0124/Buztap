import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from "lucide-react";

const RECENT_ORDERS = [
  { id: "#2849", table: "04", items: "Paneer Butter Masala, Garlic Naan", total: "₹420", status: "preparing", time: "2 min ago" },
  { id: "#2848", table: "12", items: "Veg Biryani, Raita", total: "₹280", status: "ready", time: "8 min ago" },
  { id: "#2847", table: "07", items: "Tandoori Chicken (Half)", total: "₹350", status: "served", time: "15 min ago" },
  { id: "#2846", table: "02", items: "Mango Lassi, Samosa (2)", total: "₹180", status: "served", time: "22 min ago" },
];

export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Today's Revenue", value: "₹42,850", change: "+14.5%", up: true },
          { label: "Total Orders", value: "128", change: "+5.2%", up: true },
          { label: "Avg. Order Value", value: "₹334", change: "-2.1%", up: false },
          { label: "Active Tables", value: "14 / 20", change: "70% Full", neutral: true },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#e0d9ce] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#857c6e] mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="font-roboto text-3xl font-bold text-[#0f0e0b] tracking-tight">{stat.value}</p>
              {!stat.neutral ? (
                <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-md ${
                  stat.up ? "bg-[#e8f2eb] text-[#3a6348]" : "bg-red-50 text-red-600"
                }`}>
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-[#f0ebe0] text-[#857c6e]">
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <div className="xl:col-span-2 bg-white border border-[#e0d9ce] rounded-xl shadow-sm p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-[#0f0e0b]">Revenue by Hour</h2>
            <select className="text-xs border border-[#e0d9ce] rounded-md px-2 py-1 bg-[#faf7f2] font-medium text-[#0f0e0b] outline-none">
              <option>Today</option>
              <option>Yesterday</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[240px] relative w-full group cursor-crosshair">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e8720c" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#e8720c" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Data points mapping for the chart line */}
              <polygon
                points={`0,100 ${[20, 35, 30, 55, 45, 80, 65, 95, 70, 85, 30, 15]
                  .map((h, i) => `${(i * 100) / 11},${100 - h}`)
                  .join(" ")} 100,100`}
                fill="url(#dashGrad)"
                className="transition-all duration-700 ease-in-out"
              />
              <polyline
                points={[20, 35, 30, 55, 45, 80, 65, 95, 70, 85, 30, 15]
                  .map((h, i) => `${(i * 100) / 11},${100 - h}`)
                  .join(" ")}
                fill="none"
                stroke="#e8720c"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
              />
            </svg>
            
            {/* X-axis labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] sm:text-xs text-[#857c6e] font-semibold">
              <span>9 AM</span>
              <span>12 PM</span>
              <span>3 PM</span>
              <span>6 PM</span>
              <span>9 PM</span>
              <span>11 PM</span>
            </div>
            
            {/* Y-axis grid lines (simulated) */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="w-full h-px bg-[#857c6e]"></div>
              <div className="w-full h-px bg-[#857c6e]"></div>
              <div className="w-full h-px bg-[#857c6e]"></div>
              <div className="w-full h-px bg-[#857c6e]"></div>
              <div className="w-full h-px bg-[#857c6e]"></div>
            </div>
          </div>
        </div>

        {/* Recent Orders / Feed */}
        <div className="bg-white border border-[#e0d9ce] rounded-xl shadow-sm p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#0f0e0b]">Live Order Feed</h2>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27c93f] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#27c93f]"></span>
              </span>
              <span className="text-[10px] font-bold text-[#27c93f] tracking-wider uppercase">Live</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 -mr-2 pr-2 custom-scrollbar">
            {RECENT_ORDERS.map((order) => (
              <div key={order.id} className="p-3 border border-[#f0ebe0] rounded-lg hover:border-[#e0d9ce] transition-colors">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#faf7f2] font-roboto text-xs font-bold text-[#0f0e0b] px-2 py-0.5 rounded">T-{order.table}</span>
                    <span className="text-xs text-[#857c6e] font-medium">{order.id}</span>
                  </div>
                  <span className="text-xs font-bold text-[#0f0e0b]">{order.total}</span>
                </div>
                
                <p className="text-[11px] text-[#2a2720] leading-tight mb-2 truncate">
                  {order.items}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="flex items-center gap-1 text-[10px] text-[#857c6e]">
                    <Clock size={12} /> {order.time}
                  </span>
                  
                  {order.status === "preparing" && (
                    <span className="text-[10px] font-bold text-[#e8720c] bg-[#fef0e4] px-2 py-0.5 rounded">Preparing</span>
                  )}
                  {order.status === "ready" && (
                    <span className="text-[10px] font-bold text-white bg-[#e8720c] px-2 py-0.5 rounded shadow-sm">Ready to Serve</span>
                  )}
                  {order.status === "served" && (
                    <span className="text-[10px] font-bold text-[#3a6348] bg-[#e8f2eb] px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 size={12} /> Served
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

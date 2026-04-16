import {
  Activity,
  TrendingUp,
  PieChart,
  FileText,
  Utensils,
} from "lucide-react";

export function DesktopFrame({ children, className = "" }) {
  return (
    <div
      className={`mockup-browser bg-base-300 border shrink-0 w-full max-w-[960px] shadow-[0_40px_90px_rgba(15,14,11,0.28)] ${className}`}
    >
      <div className="mockup-browser-toolbar">
        <div className="input">
          https://admin.restro.buzingbee.com/analytics
        </div>
      </div>
      <div
        className="bg-paper w-full flex flex-col text-left"
        style={{ height: 560 }}
      >
        {children}
      </div>
    </div>
  );
}

export function DesktopAdminScreen() {
  return (
    <DesktopFrame>
      <div className="flex h-full bg-paper">
        {/* Sidebar */}
        <div className="w-16 bg-white flex flex-col items-center py-4 gap-6 shrink-0 border-r border-border">
          <div className="w-8 h-8 rounded-lg bg-saffron flex items-center justify-center mb-4">
            <Utensils size={16} className="text-white" />
          </div>
          {[Activity, TrendingUp, PieChart, FileText].map((Icon, i) => (
            <button
              key={i}
              className={`p-2 rounded-lg transition-colors ${i === 0 ? "bg-saffron-lt text-saffron" : "text-muted hover:text-ink hover:bg-paper"}`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="p-4 border-b border-border flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-10">
            <div>
              <p className="text-[14px] font-bold text-ink">
                Resporto Hotel Analytics
              </p>
              <p className="text-[10px] text-muted">
                Today's Performance Overview
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-muted">
                Last updated: Just now
              </span>
              <div className="w-2 h-2 rounded-full bg-[#27c93f] pulse-dot" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 scroller">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Total Revenue",
                  value: "₹42,850",
                  trend: "+12.5%",
                  positive: true,
                },
                {
                  label: "Orders",
                  value: "128",
                  trend: "+8.2%",
                  positive: true,
                },
                {
                  label: "Avg. Order Value",
                  value: "₹334",
                  trend: "+2.1%",
                  positive: true,
                },
                {
                  label: "Table Turnaround",
                  value: "42m",
                  trend: "-4m",
                  positive: true,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-paper border border-border p-3 rounded-xl shadow-sm hover:border-saffron transition-colors cursor-pointer"
                >
                  <p className="text-[10px] text-muted mb-1 font-semibold">
                    {stat.label}
                  </p>
                  <p className="font-roboto text-xl font-bold text-ink mb-1 tracking-tight">
                    {stat.value}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.positive ? "bg-[#e8f2eb] text-[#3a6348]" : "bg-[#fde8e8] text-[#c0392b]"}`}
                  >
                    {stat.trend}
                  </span>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="flex gap-4">
              {/* Chart */}
              <div className="flex-[2] bg-white border border-border p-4 rounded-xl shadow-sm">
                <p className="text-[11px] font-bold text-ink mb-4">
                  Revenue by Hour
                </p>
                <div className="h-32 pt-2 relative w-full group cursor-crosshair">
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                  >
                    <defs>
                      <linearGradient
                        id="chartGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#e8720c"
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="100%"
                          stopColor="#e8720c"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={`0,100 ${[
                        40, 65, 50, 80, 55, 90, 70, 85, 100, 75, 45, 30,
                      ]
                        .map((h, i) => `${(i * 100) / 11},${100 - h}`)
                        .join(" ")} 100,100`}
                      fill="url(#chartGrad)"
                      className="transition-all duration-700 ease-in-out"
                    />
                    <polyline
                      points={[40, 65, 50, 80, 55, 90, 70, 85, 100, 75, 45, 30]
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
                </div>
                <div className="flex justify-between mt-2 text-[8px] text-muted font-semibold px-1">
                  <span>10 AM</span>
                  <span>2 PM</span>
                  <span>6 PM</span>
                  <span>10 PM</span>
                </div>
              </div>

              {/* Top Selling Items */}
              <div className="flex-1 bg-white border border-border p-4 rounded-xl shadow-sm">
                <p className="text-[11px] font-bold text-ink mb-4">
                  Top Selling Items
                </p>
                <div className="space-y-3">
                  {[
                    { name: "Butter Chicken", sales: 42, color: "#e8720c" },
                    { name: "Garlic Naan", sales: 86, color: "#f5b041" },
                    { name: "Paneer Tikka", sales: 34, color: "#3a6348" },
                    { name: "Mango Lassi", sales: 28, color: "#b0a898" },
                  ].map((item, i) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-[10px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-muted w-3">
                          {i + 1}.
                        </span>
                        <span className="font-semibold text-ink">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-muted">{item.sales}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

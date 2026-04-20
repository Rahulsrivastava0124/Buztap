import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Banknote,
  UtensilsCrossed,
  Smartphone,
  CreditCard,
  TrendingUp,
  Receipt,
  Users,
  Clock4,
  Wallet,
  Percent,
  AlertTriangle,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { RECENT_ORDERS } from "../data/database";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSnapshot } from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
);

const SERIES_BY_RANGE = {
  "1D": {
    labels: ["9 AM", "11 AM", "1 PM", "3 PM", "5 PM", "7 PM", "9 PM", "11 PM"],
    data: [1200, 2400, 5800, 3200, 1800, 6500, 8900, 4200],
  },
  "7D": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [12500, 14200, 13800, 15600, 24500, 31000, 28000],
  },
  "1M": {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    data: [85000, 92000, 89000, 105000],
  },
  "6M": {
    labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    data: [420000, 435000, 580000, 410000, 450000, 520000],
  },
};

const MENU_PRODUCTS = [
  {
    n: "Paneer Butter Masala",
    c: "Mains",
    q: 145,
    r: 40600,
    margin: 34,
    stock: "Healthy",
  },
  {
    n: "Garlic Naan",
    c: "Breads",
    q: 420,
    r: 25200,
    margin: 42,
    stock: "Healthy",
  },
  {
    n: "Chicken Tikka",
    c: "Starters",
    q: 98,
    r: 31360,
    margin: 28,
    stock: "Low",
  },
  {
    n: "Mango Lassi",
    c: "Beverage",
    q: 110,
    r: 13200,
    margin: 48,
    stock: "Healthy",
  },
  { n: "Veg Samosa", c: "Starters", q: 76, r: 6080, margin: 36, stock: "Low" },
];

const getChartData = (timeRange) => {
  const series = SERIES_BY_RANGE[timeRange] ?? { labels: [], data: [] };
  return {
    labels: series.labels,
    datasets: [
      {
        fill: true,
        data: series.data,
        borderColor: "#e8720c",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(232,114,12,0.35)");
          gradient.addColorStop(1, "rgba(232,114,12,0.0)");
          return gradient;
        },
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#e8720c",
        pointHoverBorderWidth: 2,
      },
    ],
  };
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0f0e0b",
      titleColor: "#e8e0d4",
      bodyColor: "#fff",
      padding: 12,
      displayColors: false,
      callbacks: { label: (c) => "₹" + c.parsed.y.toLocaleString() },
    },
  },
  scales: {
    y: {
      grid: { color: "#e0d9ce", drawBorder: false },
      ticks: {
        color: "#857c6e",
        font: { size: 10, weight: "600", family: "Inter" },
        callback: (v) => "₹" + (v >= 1000 ? v / 1000 + "k" : v),
      },
      border: { display: false },
    },
    x: {
      grid: { display: false },
      ticks: {
        color: "#857c6e",
        font: { size: 10, weight: "600", family: "Inter" },
      },
      border: { display: false },
    },
  },
  interaction: { intersect: false, mode: "index" },
};

function KpiCard({ title, value, change, isPositive, extraIcon: Icon }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex flex-col justify-between hover:border-cream2 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">
          {title}
        </p>
        {Icon && <Icon size={16} className="text-muted2" />}
      </div>
      <div className="flex items-end justify-between mt-1">
        <p className="font-roboto text-3xl font-black text-ink tracking-tight">
          {value}
        </p>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-0.5 ${isPositive ? "bg-sage-lt text-sage" : "bg-red-50 text-red-600"}`}
          >
            {isPositive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}{" "}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

// ── TAB COMPONENTS EXPORTS ──

export function OverviewTab() {
  const [timeRange, setTimeRange] = useState("1D");
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Today's Revenue"
          value="₹42,850"
          change="+14.5%"
          isPositive={true}
          extraIcon={TrendingUp}
        />
        <KpiCard
          title="Total Orders"
          value="128"
          change="+5.2%"
          isPositive={true}
        />
        <KpiCard
          title="Avg. Order Value"
          value="₹334"
          change="-2.1%"
          isPositive={false}
        />
        <KpiCard
          title="Active Tables"
          value="14 / 20"
          change="70%"
          isPositive={true}
          extraIcon={Users}
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-border rounded-xl shadow-sm p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-ink flex items-center gap-2">
              Revenue Trend
            </h2>
            <div className="flex bg-paper p-1 rounded-lg border border-border">
              {["1D", "7D", "1M", "6M"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${timeRange === range ? "bg-white text-saffron shadow-sm" : "text-muted hover:text-ink"}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full min-h-65 relative">
            <Line data={getChartData(timeRange)} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl shadow-sm p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink">Live Order Feed</h2>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27c93f] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#27c93f]"></span>
              </span>
              <span className="text-xs font-semibold text-[#27c93f] uppercase">
                Live
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {RECENT_ORDERS.map((o) => (
              <div
                key={o.id}
                className="p-3 border border-[#f0ebe0] rounded-lg bg-paper hover:border-border"
              >
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                      T-{o.table}
                    </span>
                    <span className="text-xs text-muted">{o.id}</span>
                  </div>
                  <span className="text-xs font-bold">{o.total}</span>
                </div>
                <p className="text-xs text-ink2 mb-2 truncate">{o.items}</p>
                <div className="flex justify-between mt-auto">
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Clock size={12} /> {o.time}
                  </span>
                  {o.status === "preparing" && (
                    <span className="text-xs font-semibold text-saffron bg-saffron-lt px-2 py-0.5 rounded">
                      Preparing
                    </span>
                  )}
                  {o.status === "ready" && (
                    <span className="text-xs font-semibold text-white bg-saffron px-2 shadow-sm py-0.5 rounded">
                      Ready to Serve
                    </span>
                  )}
                  {o.status === "served" && (
                    <span className="text-xs font-semibold text-sage bg-sage-lt px-2 py-0.5 rounded flex items-center gap-1">
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

export function FinanceTab() {
  const { data } = useQuery({
    queryKey: ["dashboard-snapshot"],
    queryFn: fetchDashboardSnapshot,
  });

  const paymentBreakup = data?.paymentBreakup?.map((item, idx) => ({
    label: item.label,
    amount: item.amount,
    share: item.share,
    color: ["bg-saffron", "bg-sage", "bg-muted2"][idx] ?? "bg-muted2",
  })) ?? [
    { label: "Card & UPI", amount: 32450, share: 75, color: "bg-saffron" },
    { label: "Cash in Drawer", amount: 10400, share: 24, color: "bg-sage" },
    { label: "House Account", amount: 1350, share: 1, color: "bg-muted2" },
  ];

  const settlements = data?.settlements ?? [
    {
      channel: "Razorpay UPI",
      gross: 14850,
      fee: 223,
      net: 14627,
      status: "Settled",
    },
    {
      channel: "Card Terminal",
      gross: 17600,
      fee: 317,
      net: 17283,
      status: "Pending",
    },
    { channel: "Wallets", gross: 4800, fee: 96, net: 4704, status: "Settled" },
  ];

  const totalGross = settlements.reduce((acc, item) => acc + item.gross, 0);
  const totalNet = settlements.reduce((acc, item) => acc + item.net, 0);
  const totalFees = totalGross - totalNet;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Gross Sales"
          value="₹54,200"
          change="+8.3%"
          isPositive={true}
          extraIcon={Banknote}
        />
        <KpiCard
          title="Net Collected"
          value={`₹${totalNet.toLocaleString()}`}
          change="+6.9%"
          isPositive={true}
          extraIcon={Wallet}
        />
        <KpiCard
          title="Total Tax (5% GST)"
          value="₹2,580"
          extraIcon={Receipt}
        />
        <KpiCard
          title="Gateway Fees"
          value={`₹${totalFees.toLocaleString()}`}
          change="-2.4%"
          isPositive={true}
          extraIcon={Percent}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-saffron" /> Payment Methods
            Breakup
          </h2>
          <div className="space-y-4 pt-2">
            {paymentBreakup.map((method) => (
              <div key={method.label}>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span>{method.label}</span>
                  <span>₹{method.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-cream rounded-full h-2.5">
                  <div
                    className={`${method.color} h-2.5 rounded-full`}
                    style={{ width: `${method.share}%` }}
                  />
                </div>
                <p className="text-xs text-muted mt-1">
                  {method.share}% of total sales
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2 text-ink">
            <TrendingUp size={18} className="text-saffron" /> Settlement Summary
          </h2>
          <div className="space-y-3">
            {settlements.map((row) => (
              <div
                key={row.channel}
                className="p-3 rounded-lg border border-cream bg-paper"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">
                    {row.channel}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-md font-semibold ${row.status === "Settled" ? "bg-sage-lt text-sage" : "bg-saffron-lt text-saffron"}`}
                  >
                    {row.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-muted">
                  <p>
                    Gross:{" "}
                    <span className="font-semibold text-ink">
                      ₹{row.gross.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Fee:{" "}
                    <span className="font-semibold text-ink">
                      ₹{row.fee.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Net:{" "}
                    <span className="font-semibold text-sage">
                      ₹{row.net.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm font-semibold">
            <span className="text-muted">Today's Net After Fees</span>
            <span className="text-saffron">₹{totalNet.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MenuTab() {
  const { data } = useQuery({
    queryKey: ["dashboard-snapshot"],
    queryFn: fetchDashboardSnapshot,
  });
  const [category, setCategory] = useState("All");
  const sourceItems =
    data?.productMix?.map((item) => ({
      n: item.name,
      c: item.category,
      q: item.units,
      r: item.revenue,
      margin: item.margin,
      stock: item.stock,
    })) ?? MENU_PRODUCTS;

  const categories = useMemo(
    () => ["All", ...new Set(sourceItems.map((i) => i.c))],
    [sourceItems],
  );
  const filtered = useMemo(() => {
    if (category === "All") return sourceItems;
    return sourceItems.filter((i) => i.c === category);
  }, [category, sourceItems]);

  const totalRevenue = filtered.reduce((acc, item) => acc + item.r, 0);
  const avgMargin = filtered.length
    ? (
        filtered.reduce((acc, item) => acc + item.margin, 0) / filtered.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KpiCard
          title="Total Units Sold"
          value="842"
          change="+12%"
          isPositive={true}
        />
        <KpiCard
          title="Most Popular Cat."
          value="Mains"
          extraIcon={UtensilsCrossed}
        />
        <KpiCard
          title="Avg Margin"
          value={`${avgMargin}%`}
          change="+1.1%"
          isPositive={true}
        />
      </div>

      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
          <h2 className="font-bold">Top Performing Products</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-colors ${category === c ? "bg-saffron text-white border-saffron" : "bg-paper border-border text-muted hover:text-ink"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted">
                <th className="pb-3 pt-2 font-bold select-none">
                  Product Name
                </th>
                <th className="pb-3 pt-2 font-bold select-none">Category</th>
                <th className="pb-3 pt-2 font-bold select-none text-right">
                  Units Sold
                </th>
                <th className="pb-3 pt-2 font-bold select-none text-right">
                  Revenue
                </th>
                <th className="pb-3 pt-2 font-bold select-none text-right">
                  Margin
                </th>
                <th className="pb-3 pt-2 font-bold select-none text-right">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {filtered.map((item, i) => (
                <tr
                  key={`${item.n}-${i}`}
                  className="border-b border-cream hover:bg-paper transition-colors"
                >
                  <td className="py-3 text-ink">{item.n}</td>
                  <td className="py-3">
                    <span className="bg-cream text-muted text-xs px-2 py-1 rounded-md">
                      {item.c}
                    </span>
                  </td>
                  <td className="py-3 text-right">{item.q}</td>
                  <td className="py-3 text-right font-roboto font-bold text-saffron">
                    ₹{item.r.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">{item.margin}%</td>
                  <td className="py-3 text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-semibold ${item.stock === "Low" ? "bg-red-50 text-red-600" : "bg-sage-lt text-sage"}`}
                    >
                      {item.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
          <span className="text-muted">Filtered Revenue</span>
          <span className="font-bold text-saffron">
            ₹{totalRevenue.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function OperationsTab() {
  const { data } = useQuery({
    queryKey: ["dashboard-snapshot"],
    queryFn: fetchDashboardSnapshot,
    refetchInterval: 20_000,
  });
  const [serviceMode, setServiceMode] = useState("Dine-in");
  const tableHealth = data?.areaLoad ?? [
    { area: "Ground Floor", occupied: 9, total: 12, avgTurn: 42 },
    { area: "First Floor", occupied: 6, total: 8, avgTurn: 47 },
    { area: "Patio", occupied: 2, total: 4, avgTurn: 38 },
  ];

  const kitchenQueue = data?.kitchenQueue ?? [
    { ticket: "#K-2849", stage: "Prep", wait: "4m", priority: "Normal" },
    { ticket: "#K-2850", stage: "Cook", wait: "11m", priority: "High" },
    { ticket: "#K-2851", stage: "Plating", wait: "2m", priority: "Normal" },
  ];

  const totalOccupied = tableHealth.reduce((acc, row) => acc + row.occupied, 0);
  const totalCapacity = tableHealth.reduce((acc, row) => acc + row.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Avg Table Turnover"
          value="45m"
          change="-5m"
          isPositive={true}
          extraIcon={Clock4}
        />
        <KpiCard
          title="QR Menu Scans"
          value="214"
          change="+42"
          isPositive={true}
          extraIcon={Smartphone}
        />
        <KpiCard
          title="QR Conv. Rate"
          value="68%"
          change="+3%"
          isPositive={true}
        />
        <KpiCard
          title="Table Occupancy"
          value={`${Math.round((totalOccupied / totalCapacity) * 100)}%`}
          change={`${totalOccupied}/${totalCapacity}`}
          isPositive={true}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink">Operations by Area</h2>
            <div className="bg-paper border border-border rounded-lg p-1 flex">
              {["Dine-in", "Delivery"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setServiceMode(mode)}
                  className={`text-xs px-3 py-1 rounded-md font-semibold ${serviceMode === mode ? "bg-white text-saffron" : "text-muted"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {tableHealth.map((zone) => {
              const percent = Math.round((zone.occupied / zone.total) * 100);
              return (
                <div
                  key={zone.area}
                  className="p-3 rounded-lg border border-cream bg-paper"
                >
                  <div className="flex items-center justify-between text-sm mb-2">
                    <p className="font-semibold text-ink">{zone.area}</p>
                    <p className="text-muted">
                      {zone.occupied}/{zone.total} occupied
                    </p>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-cream overflow-hidden">
                    <div
                      className="h-full bg-saffron rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Avg Turnover: {zone.avgTurn} min ({serviceMode})
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="font-bold text-ink mb-4">Kitchen Queue SLA</h2>
          <div className="space-y-3">
            {kitchenQueue.map((ticket) => (
              <div
                key={ticket.ticket}
                className="p-3 rounded-lg border border-cream"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">
                    {ticket.ticket}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-md font-semibold ${ticket.priority === "High" ? "bg-red-50 text-red-600" : "bg-sage-lt text-sage"}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                  <span>{ticket.stage}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {ticket.wait}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-saffron-lt text-saffron text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={14} /> 1 ticket above 10 minutes. Escalate to
            captain.
          </div>
        </div>
      </div>
    </div>
  );
}

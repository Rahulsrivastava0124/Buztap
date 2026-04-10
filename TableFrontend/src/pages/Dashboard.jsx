import { useState } from "react";
import {
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2,
  BarChart3, Banknote, UtensilsCrossed, Smartphone,
  CreditCard, TrendingUp, Wallet, Receipt, Users, Clock4
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { motion as Motion, AnimatePresence } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

// ── MOCK DATA & CHART SETUP ──
const getChartData = (timeRange) => {
  let labels = [], data = [];
  switch (timeRange) {
    case '1D': labels = ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM', '9 PM', '11 PM']; data = [1200, 2400, 5800, 3200, 1800, 6500, 8900, 4200]; break;
    case '7D': labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; data = [12500, 14200, 13800, 15600, 24500, 31000, 28000]; break;
    case '1M': labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']; data = [85000, 92000, 89000, 105000]; break;
    case '6M': labels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']; data = [420000, 435000, 580000, 410000, 450000, 520000]; break;
    default: labels = []; data = [];
  }
  return {
    labels,
    datasets: [{
      fill: true,
      data: data,
      borderColor: '#e8720c',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(232,114,12,0.35)');
        gradient.addColorStop(1, 'rgba(232,114,12,0.0)');
        return gradient;
      },
      borderWidth: 2.5,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#e8720c',
      pointHoverBorderWidth: 2,
    }],
  };
};

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f0e0b', titleColor: '#e8e0d4', bodyColor: '#fff', padding: 12, displayColors: false, callbacks: { label: (c) => '₹' + c.parsed.y.toLocaleString() } } },
  scales: {
    y: { grid: { color: '#e0d9ce', drawBorder: false }, ticks: { color: '#857c6e', font: { size: 10, weight: '600', family: 'Inter' }, callback: (v) => '₹' + (v >= 1000 ? (v / 1000) + 'k' : v) }, border: { display: false } },
    x: { grid: { display: false }, ticks: { color: '#857c6e', font: { size: 10, weight: '600', family: 'Inter' } }, border: { display: false } },
  },
  interaction: { intersect: false, mode: 'index' },
};

import { RECENT_ORDERS, DASHBOARD_TABS as TABS } from "../data/database";

function KpiCard({ title, value, change, isPositive, extraIcon: Icon }) {
  return (
    <div className="bg-white rounded-xl border border-[#e0d9ce] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#d4cbb8] transition-colors">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-bold text-[#857c6e] uppercase tracking-wider">{title}</p>
        {Icon && <Icon size={16} className="text-[#b0a898]" />}
      </div>
      <div className="flex items-end justify-between mt-1">
        <p className="font-roboto text-3xl font-black text-[#0f0e0b] tracking-tight">{value}</p>
        {change && (
          <span className={`text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-0.5 ${isPositive ? "bg-[#e8f2eb] text-[#3a6348]" : "bg-red-50 text-red-600"}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {change}
          </span>
        )}
      </div>
    </div>
  );
}

// ── TAB COMPONENTS EXPORTS ──

export function OverviewTab() {
  const [timeRange, setTimeRange] = useState('1D');
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard title="Today's Revenue" value="₹42,850" change="+14.5%" isPositive={true} extraIcon={TrendingUp} />
        <KpiCard title="Total Orders" value="128" change="+5.2%" isPositive={true} />
        <KpiCard title="Avg. Order Value" value="₹334" change="-2.1%" isPositive={false} />
        <KpiCard title="Active Tables" value="14 / 20" change="70%" isPositive={true} extraIcon={Users} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-[#e0d9ce] rounded-xl shadow-sm p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-[#0f0e0b] flex items-center gap-2">Revenue Trend</h2>
            <div className="flex bg-[#faf7f2] p-1 rounded-lg border border-[#e0d9ce]">
              {['1D', '7D', '1M', '6M'].map(range => (
                <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${timeRange === range ? "bg-white text-[#e8720c] shadow-sm" : "text-[#857c6e] hover:text-[#0f0e0b]"}`}>{range}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full min-h-[260px] relative"><Line data={getChartData(timeRange)} options={chartOptions} /></div>
        </div>
        <div className="bg-white border border-[#e0d9ce] rounded-xl shadow-sm p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#0f0e0b]">Live Order Feed</h2>
            <div className="flex items-center gap-1.5"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27c93f] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#27c93f]"></span></span><span className="text-[10px] font-bold text-[#27c93f] uppercase">Live</span></div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {RECENT_ORDERS.map((o) => (
              <div key={o.id} className="p-3 border border-[#f0ebe0] rounded-lg bg-[#faf7f2] hover:border-[#e0d9ce]">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-2"><span className="bg-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">T-{o.table}</span><span className="text-xs text-[#857c6e]">{o.id}</span></div>
                  <span className="text-xs font-bold">{o.total}</span>
                </div>
                <p className="text-[11px] text-[#2a2720] mb-2 truncate">{o.items}</p>
                <div className="flex justify-between mt-auto">
                  <span className="flex items-center gap-1 text-[10px] text-[#857c6e]"><Clock size={12} /> {o.time}</span>
                  {o.status === "preparing" && <span className="text-[10px] font-bold text-[#e8720c] bg-[#fef0e4] px-2 py-0.5 rounded">Preparing</span>}
                  {o.status === "ready" && <span className="text-[10px] font-bold text-white bg-[#e8720c] px-2 shadow-sm py-0.5 rounded">Ready to Serve</span>}
                  {o.status === "served" && <span className="text-[10px] font-bold text-[#3a6348] bg-[#e8f2eb] px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 size={12} /> Served</span>}
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
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard title="Gross Sales" value="₹54,200" change="+8.3%" isPositive={true} extraIcon={Banknote} />
        <KpiCard title="Net Profit Margin" value="28.4%" change="+1.2%" isPositive={true} extraIcon={TrendingUp} />
        <KpiCard title="Total Tax (5% GST)" value="₹2,580" extraIcon={Receipt} />
        <KpiCard title="Discounts Given" value="₹1,250" change="-12%" isPositive={true} extraIcon={ArrowDownRight} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e0d9ce] rounded-xl p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2"><CreditCard size={18} className="text-[#e8720c]" /> Payment Methods Breakup</h2>
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1"><span>Card & UPI</span><span>₹32,450</span></div>
              <div className="w-full bg-[#f0ebe0] rounded-full h-2.5"><div className="bg-[#e8720c] h-2.5 rounded-full" style={{ width: '75%' }}></div></div>
              <p className="text-xs text-[#857c6e] mt-1">75% of total sales</p>
            </div>
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1"><span>Cash in Drawer</span><span>₹10,400</span></div>
              <div className="w-full bg-[#f0ebe0] rounded-full h-2.5"><div className="bg-[#3a6348] h-2.5 rounded-full" style={{ width: '25%' }}></div></div>
              <p className="text-xs text-[#857c6e] mt-1">25% of total sales</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MenuTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KpiCard title="Total Units Sold" value="842" change="+12%" isPositive={true} />
        <KpiCard title="Most Popular Cat." value="Mains" extraIcon={UtensilsCrossed} />
        <KpiCard title="Most Cancelled" value="Soup" change="-5%" isPositive={false} />
      </div>
      <div className="bg-white border border-[#e0d9ce] rounded-xl p-6">
        <h2 className="font-bold mb-4">Top Performing Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e0d9ce] text-xs uppercase text-[#857c6e]">
                <th className="pb-3 pt-2 font-bold select-none">Product Name</th>
                <th className="pb-3 pt-2 font-bold select-none">Category</th>
                <th className="pb-3 pt-2 font-bold select-none text-right">Units Sold</th>
                <th className="pb-3 pt-2 font-bold select-none text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {[
                { n: "Paneer Butter Masala", c: "Mains", q: 145, r: "₹40,600" },
                { n: "Garlic Naan", c: "Breads", q: 420, r: "₹25,200" },
                { n: "Chicken Tikka", c: "Starters", q: 98, r: "₹31,360" },
                { n: "Mango Lassi", c: "Beverage", q: 110, r: "₹13,200" },
              ].map((item, i) => (
                <tr key={i} className="border-b border-[#f5f0e8] hover:bg-[#faf7f2] transition-colors">
                  <td className="py-3 text-[#0f0e0b]">{item.n}</td>
                  <td className="py-3"><span className="bg-[#f0ebe0] text-[#857c6e] text-[10px] px-2 py-1 rounded-md">{item.c}</span></td>
                  <td className="py-3 text-right">{item.q}</td>
                  <td className="py-3 text-right font-roboto font-bold text-[#e8720c]">{item.r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function OperationsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard title="Avg Table Turnover" value="45m" change="-5m" isPositive={true} extraIcon={Clock4} />
        <KpiCard title="QR Menu Scans" value="214" change="+42" isPositive={true} extraIcon={Smartphone} />
        <KpiCard title="QR Conv. Rate" value="68%" change="+3%" isPositive={true} />
        <KpiCard title="Avg Waiter Resp." value="2.5m" change="OK" isPositive={true} />
      </div>
    </div>
  );
}



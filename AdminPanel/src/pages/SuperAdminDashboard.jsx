import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Store,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  IndianRupee,
  Users2,
  ArrowRight,
  Loader2,
  TrendingUp,
  BarChart3,
  Award,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchSuperAdminStats,
  fetchAnalyticsChart,
  fetchTopRestaurants,
} from "../services/superadminApi";

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" },
  }),
};

function StatCard({ icon: Icon, label, value, sub, color, gradient, index }) {
  return (
    <Motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-ink">{value}</p>
          {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient}`}
        >
          <Icon size={20} className={color} />
        </div>
      </div>
    </Motion.div>
  );
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topRestros, setTopRestros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchSuperAdminStats().catch(() => null),
      fetchAnalyticsChart(7).catch(() => []),
      fetchTopRestaurants().catch(() => []),
    ])
      .then(([s, c, t]) => {
        if (s) setStats(s);
        if (c) setChartData(c);
        if (t) setTopRestros(t);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={28} className="animate-spin text-saffron" />
      </div>
    );
  }

  const cards = [
    {
      icon: Store,
      label: "Total Restaurants",
      value: stats?.totalBusinesses || 0,
      gradient: "bg-saffron-lt",
      color: "text-saffron",
    },
    {
      icon: CheckCircle2,
      label: "Active",
      value: stats?.activeBusinesses || 0,
      gradient: "bg-sage-lt",
      color: "text-sage",
    },
    {
      icon: XCircle,
      label: "Inactive",
      value: stats?.inactiveBusinesses || 0,
      gradient: "bg-red-50",
      color: "text-red-500",
    },
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: (stats?.totalOrders || 0).toLocaleString("en-IN"),
      gradient: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      icon: IndianRupee,
      label: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      gradient: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      icon: Users2,
      label: "Total Staff",
      value: stats?.totalStaff || 0,
      gradient: "bg-purple-50",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-ink">Platform Overview</h2>
        <p className="text-sm text-muted mt-0.5">
          Monitor all registered businesses on BuzTap
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <StatCard key={card.label} {...card} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="bg-white rounded-xl border border-border lg:col-span-2 flex flex-col"
        >
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <BarChart3 size={16} className="text-saffron" />
            <h3 className="text-sm font-bold text-ink">
              Revenue Over Time (7 Days)
            </h3>
          </div>
          <div className="p-5 flex-1 min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="_id" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                    dy={10}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#F97316" 
                    strokeWidth={3} 
                    dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted">
                No revenue data available for the last 7 days.
              </div>
            )}
          </div>
        </Motion.div>

        {/* Top Restaurants */}
        <Motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="bg-white rounded-xl border border-border"
        >
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Award size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold text-ink">
              Top Restaurants
            </h3>
          </div>
          <div className="divide-y divide-border/60">
            {topRestros.length > 0 ? (
              topRestros.map((biz, idx) => (
                <div
                  key={biz._id}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-paper/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-paper flex items-center justify-center shrink-0 border border-border">
                      <span className="text-xs font-bold text-muted">{idx + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">
                        {biz.name}
                      </p>
                      <p className="text-[10px] text-muted truncate">
                        {biz.orders} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-emerald-600">
                      ₹{(biz.revenue || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
               <div className="p-5 text-center text-sm text-muted">
                 No active restaurants found.
               </div>
            )}
          </div>
        </Motion.div>
      </div>

      {/* Recent Restaurants */}
      {stats?.recentBusinesses?.length > 0 && (
        <Motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className="bg-white rounded-xl border border-border"
        >
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-saffron" />
              <h3 className="text-sm font-bold text-ink">
                Recently Registered
              </h3>
            </div>
            <Link
              to="/superadmin/restaurants"
              className="text-xs font-semibold text-saffron hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border/60">
            {stats.recentBusinesses.map((biz) => (
              <div
                key={biz._id}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-paper/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-saffron-lt flex items-center justify-center shrink-0">
                    <Store size={16} className="text-saffron" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      {biz.name}
                    </p>
                    <p className="text-xs text-muted truncate">{biz.email}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      biz.isActive
                        ? "bg-sage-lt text-sage"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {biz.isActive ? "Active" : "Inactive"}
                  </span>
                  <p className="text-[10px] text-muted2 mt-0.5">
                    {new Date(biz.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Motion.div>
      )}
    </div>
  );
}

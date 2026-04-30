import { lazy, Suspense, useMemo, useState } from "react";
import {
  Clock,
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
  UserCheck,
  UserPlus,
  QrCode,
  MonitorSmartphone,
  Armchair,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
const TrendLineChart = lazy(
  () => import("../components/shared/TrendLineChart"),
);
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardSnapshot,
  fetchOrders,
  fetchRecentOrders,
  fetchRevenueTrend,
  fetchVisitorTrend,
  fetchTodayStats,
} from "../services/api";
import ProtectedRoute from "../components/ProtectedRoute";
import KpiCard from "../components/shared/KpiCard";
import OrderStatusBadge from "../components/shared/OrderStatusBadge";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import PageShell from "../components/layout/PageShell";

const CHART_COLORS = {
  borderColor: "#e8720c",
  gradientStart: "rgba(232,114,12,0.35)",
  gradientEnd: "rgba(232,114,12,0.0)",
};

const buildChartData = (trend) => {
  const labels = trend?.labels ?? [];
  const data = trend?.data ?? [];
  return {
    labels,
    datasets: [
      {
        fill: true,
        data,
        borderColor: CHART_COLORS.borderColor,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, CHART_COLORS.gradientStart);
          gradient.addColorStop(1, CHART_COLORS.gradientEnd);
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

export default function Dashboard() {
  return (
    <Routes>
      <Route index element={<Navigate to="overview" replace />} />
      <Route
        path="overview"
        element={
          <PageShell>
            <ErrorBoundary label="Overview">
              <OverviewTab />
            </ErrorBoundary>
          </PageShell>
        }
      />

      <Route element={<ProtectedRoute minimumRole="manager" />}>
        <Route
          path="finance"
          element={
            <PageShell>
              <ErrorBoundary label="Finance">
                <FinanceTab />
              </ErrorBoundary>
            </PageShell>
          }
        />
        <Route
          path="menu"
          element={
            <PageShell>
              <ErrorBoundary label="Menu Analytics">
                <MenuTab />
              </ErrorBoundary>
            </PageShell>
          }
        />
      </Route>

      <Route
        path="operations"
        element={
          <PageShell>
            <ErrorBoundary label="Operations">
              <OperationsTab />
            </ErrorBoundary>
          </PageShell>
        }
      />

      <Route
        path="visitors"
        element={
          <PageShell>
            <ErrorBoundary label="Visitors">
              <VisitorsTab />
            </ErrorBoundary>
          </PageShell>
        }
      />
    </Routes>
  );
}

// ── TAB COMPONENTS EXPORTS ──

const visitorChartOptions = {
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
      callbacks: { label: (c) => c.parsed.y + " visitors" },
    },
  },
  scales: {
    y: {
      min: 0,
      suggestedMax: 5,
      beginAtZero: true,
      grid: { color: "#e0d9ce", drawBorder: false },
      ticks: {
        color: "#857c6e",
        font: { size: 10, weight: "600", family: "Inter" },
        callback: (v) => (Number.isInteger(v) ? v : ""),
        stepSize: 1,
        precision: 0,
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

const buildVisitorChartData = (trend) => {
  const labels = trend?.labels ?? [];
  const data = trend?.data ?? [];
  return {
    labels,
    datasets: [
      {
        fill: true,
        data,
        borderColor: "#6366f1",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(99,102,241,0.30)");
          gradient.addColorStop(1, "rgba(99,102,241,0.00)");
          return gradient;
        },
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#6366f1",
        pointHoverBorderWidth: 2,
      },
    ],
  };
};

export function OverviewTab() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("1D");
  const [visitorTimeRange, setVisitorTimeRange] = useState("1D");
  const [detailsView, setDetailsView] = useState(null);
  const {
    data: recentOrders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-recent-orders"],
    queryFn: fetchRecentOrders,
    refetchInterval: 12_000,
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard-today-stats"],
    queryFn: fetchTodayStats,
    refetchInterval: 30_000,
  });

  const { data: revenueTrend } = useQuery({
    queryKey: ["dashboard-revenue-trend", timeRange],
    queryFn: () => fetchRevenueTrend(timeRange),
    staleTime: 2 * 60 * 1000,
  });

  const { data: visitorTrend } = useQuery({
    queryKey: ["dashboard-visitor-trend", visitorTimeRange],
    queryFn: () => fetchVisitorTrend(visitorTimeRange),
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: detailOrders = [],
    isLoading: detailsLoading,
    isError: detailsError,
    error: detailsErrorMessage,
    refetch: refetchDetails,
  } = useQuery({
    queryKey: ["dashboard-card-details", detailsView],
    queryFn: fetchOrders,
    enabled: Boolean(detailsView),
    refetchInterval: detailsView ? 12_000 : false,
    staleTime: 10_000,
  });

  const filteredDetailOrders = useMemo(() => {
    if (detailsView === "qr") {
      return detailOrders.filter((order) => order.channel === "QR");
    }
    if (detailsView === "active") {
      return detailOrders.filter((order) =>
        ["Pending", "Preparing", "Ready"].includes(order.status),
      );
    }
    return [];
  }, [detailOrders, detailsView]);

  // Bar chart max for scaling
  const maxHourly = stats
    ? Math.max(...stats.hourlyVisits.map((h) => h.count), 1)
    : 1;

  // Format last updated time
  const lastUpdatedTime = stats?.lastUpdated
    ? new Date(stats.lastUpdated).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Today's Revenue"
          value={stats ? `₹${stats.totalRevenue.toLocaleString()}` : "₹0"}
          extraIcon={TrendingUp}
        />
        <KpiCard
          title="Total Orders"
          value={stats ? String(stats.servedToday + stats.activeOrders) : "0"}
        />
        <KpiCard
          title="Avg. Spend / Guest"
          value={stats ? `₹${stats.avgSpendPerVisitor}` : "₹0"}
        />
        <KpiCard
          title="Table Occupancy"
          value={
            stats ? `${stats.occupiedTables} / ${stats.totalTables}` : "— / —"
          }
          change={
            stats && stats.totalTables > 0
              ? `${Math.round((stats.occupiedTables / stats.totalTables) * 100)}%`
              : "0%"
          }
          isPositive={true}
          extraIcon={Users}
        />
      </div>

      {/* Today's Visitor Intelligence */}
      <div className="bg-white border border-border rounded-xl shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-saffron/10 flex items-center justify-center">
              <Activity size={16} className="text-saffron" />
            </div>
            <div>
              <h2 className="font-bold text-ink text-base leading-none">
                Today&apos;s Visitor Intelligence
              </h2>
              <p className="text-[11px] text-muted mt-0.5">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
                {lastUpdatedTime && (
                  <span className="ml-2 text-[10px] text-muted/70">
                    · updated {lastUpdatedTime}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">
              Live
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {/* Total Visitors */}
          <button
            type="button"
            onClick={() => navigate("../visitors")}
            className="col-span-1 bg-linear-to-br from-saffron to-orange-500 rounded-xl p-4 text-white text-left hover:brightness-105 transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <Users size={16} className="opacity-80" />
              <span className="text-[10px] font-bold uppercase opacity-80 tracking-wider">
                Total
              </span>
            </div>
            <p className="text-2xl font-black leading-none">
              {stats?.totalVisitors ?? "—"}
            </p>
            <p className="text-[11px] mt-1 opacity-80">Visitors today</p>
            <p className="text-[10px] mt-0.5 opacity-75 truncate">
              {stats?.restaurantName || "Restaurant"}
            </p>
          </button>

          {/* New Guests */}
          <div className="bg-paper rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <UserPlus size={15} className="text-blue-500" />
              <ArrowUpRight size={13} className="text-green-500" />
            </div>
            <p className="text-xl font-black text-ink leading-none">
              {stats?.newGuests ?? "—"}
            </p>
            <p className="text-[11px] text-muted mt-1">New guests</p>
          </div>

          {/* Returning Guests */}
          <div className="bg-paper rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <UserCheck size={15} className="text-purple-500" />
              <span className="text-[10px] font-bold text-purple-500">
                {stats && stats.totalVisitors > 0
                  ? `${Math.round((stats.returningGuests / stats.totalVisitors) * 100)}%`
                  : "—"}
              </span>
            </div>
            <p className="text-xl font-black text-ink leading-none">
              {stats?.returningGuests ?? "—"}
            </p>
            <p className="text-[11px] text-muted mt-1">Returning</p>
          </div>

          {/* POS vs QR */}
          <div className="bg-paper rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <MonitorSmartphone size={15} className="text-saffron" />
              <span className="text-[10px] font-bold text-saffron">POS</span>
            </div>
            <p className="text-xl font-black text-ink leading-none">
              {stats?.posOrders ?? "—"}
            </p>
            <p className="text-[11px] text-muted mt-1">Walk-in orders</p>
          </div>

          <button
            type="button"
            onClick={() => setDetailsView("qr")}
            className="bg-paper rounded-xl p-4 border border-border text-left hover:border-saffron/60 hover:shadow-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <QrCode size={15} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600">QR</span>
            </div>
            <p className="text-xl font-black text-ink leading-none">
              {stats?.qrOrders ?? "—"}
            </p>
            <p className="text-[11px] text-muted mt-1">QR scan orders</p>
            <p className="text-[10px] text-muted/80 mt-0.5 truncate">
              {stats?.restaurantName || "Restaurant"}
            </p>
          </button>

          {/* Active right now */}
          <button
            type="button"
            onClick={() => setDetailsView("active")}
            className="bg-paper rounded-xl p-4 border border-border text-left hover:border-saffron/60 hover:shadow-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <Armchair size={15} className="text-rose-500" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            </div>
            <p className="text-xl font-black text-ink leading-none">
              {stats?.activeOrders ?? "—"}
            </p>
            <p className="text-[11px] text-muted mt-1">Active orders</p>
          </button>
        </div>

        {/* Hourly visit bar chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-muted uppercase tracking-wider">
              Hourly Visit Pattern
            </p>
            {stats?.peakHour?.count > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-saffron bg-saffron/10 px-2.5 py-1 rounded-full">
                <TrendingUp size={10} />
                Peak: {stats.peakHour.label} ({stats.peakHour.count} orders)
              </span>
            )}
          </div>
          <div className="flex items-end gap-1 h-16">
            {(
              stats?.hourlyVisits ?? [
                { label: "8AM", count: 0 },
                { label: "9AM", count: 0 },
                { label: "10AM", count: 0 },
                { label: "11AM", count: 0 },
                { label: "12PM", count: 0 },
                { label: "1PM", count: 0 },
                { label: "2PM", count: 0 },
                { label: "3PM", count: 0 },
                { label: "4PM", count: 0 },
                { label: "5PM", count: 0 },
                { label: "6PM", count: 0 },
                { label: "7PM", count: 0 },
                { label: "8PM", count: 0 },
                { label: "9PM", count: 0 },
                { label: "10PM", count: 0 },
                { label: "11PM", count: 0 },
              ]
            ).map((h) => {
              const isPeak = stats?.peakHour?.label === h.label && h.count > 0;
              const heightPct =
                maxHourly > 0 ? Math.round((h.count / maxHourly) * 100) : 0;
              return (
                <div
                  key={h.label}
                  className="flex-1 flex flex-col items-center gap-1 group"
                  title={`${h.label}: ${h.count} orders`}
                >
                  <div className="w-full flex items-end justify-center h-12">
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        isPeak
                          ? "bg-saffron"
                          : h.count > 0
                            ? "bg-saffron/30 group-hover:bg-saffron/50"
                            : "bg-border"
                      }`}
                      style={{
                        height:
                          h.count === 0 ? "4px" : `${Math.max(heightPct, 8)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[8px] text-muted leading-none hidden sm:block">
                    {h.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary footer */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
                <ArrowUpRight size={13} className="text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted leading-none">Served</p>
                <p className="text-sm font-bold text-ink">
                  {stats?.servedToday ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                <ArrowDownRight size={13} className="text-red-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted leading-none">Cancelled</p>
                <p className="text-sm font-bold text-ink">
                  {stats?.cancelledToday ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-saffron/10 flex items-center justify-center">
                <Banknote size={13} className="text-saffron" />
              </div>
              <div>
                <p className="text-[10px] text-muted leading-none">Avg Spend</p>
                <p className="text-sm font-bold text-ink">
                  ₹{stats?.avgSpendPerVisitor ?? "—"}
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                <Armchair size={13} className="text-purple-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted leading-none">Occupancy</p>
                <p className="text-sm font-bold text-ink">
                  {stats
                    ? `${stats.occupiedTables}/${stats.totalTables} tables`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue + Visitor Trend charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-xl shadow-sm p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-ink flex items-center gap-2">
              Revenue Trend
            </h2>
            <div className="flex bg-paper p-1 rounded-lg border border-border">
              {["1D", "7D", "1M", "6M"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    timeRange === range
                      ? "bg-white text-saffron shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full h-64 relative">
            <Suspense
              fallback={
                <div className="h-64 animate-pulse rounded-xl bg-paper" />
              }
            >
              <TrendLineChart
                data={buildChartData(revenueTrend)}
                options={chartOptions}
              />
            </Suspense>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-ink flex items-center gap-2">
              Visitor Trend
            </h2>
            <div className="flex bg-paper p-1 rounded-lg border border-border">
              {["1D", "7D", "1M", "6M"].map((range) => (
                <button
                  key={range}
                  onClick={() => setVisitorTimeRange(range)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    visitorTimeRange === range
                      ? "bg-white text-indigo-500 shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full h-64 relative">
            <Suspense
              fallback={
                <div className="h-64 animate-pulse rounded-xl bg-paper" />
              }
            >
              <TrendLineChart
                data={buildVisitorChartData(visitorTrend)}
                options={visitorChartOptions}
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Live feed */}
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
          {isLoading ? (
            <div className="text-xs text-muted">Loading recent orders...</div>
          ) : null}
          {isError ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-red-600">
                {error?.message || "Failed to load live orders."}
              </span>
              <button
                onClick={() => refetch()}
                className="text-xs px-2 py-1 rounded border border-border hover:bg-white"
              >
                Retry
              </button>
            </div>
          ) : null}
          {!isLoading && !isError && recentOrders.length === 0 ? (
            <div className="text-xs text-muted">No recent orders yet.</div>
          ) : null}
          {recentOrders.map((o) => (
            <div
              key={o.id}
              className="p-3 border border-[#f0ebe0] rounded-lg bg-paper hover:border-border"
            >
              <div className="flex justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="bg-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                    {o.table}
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
                <OrderStatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {detailsView ? (
        <>
          <button
            type="button"
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setDetailsView(null)}
            aria-label="Close details"
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl border-l border-border flex flex-col">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-ink text-base">
                {detailsView === "qr"
                  ? "QR Order Details"
                  : "Active Order Details"}
              </h3>
              <button
                type="button"
                className="text-sm font-semibold text-muted hover:text-ink"
                onClick={() => setDetailsView(null)}
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {detailsLoading ? (
                <p className="text-sm text-muted">Loading order details...</p>
              ) : null}
              {detailsError ? (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-red-600">
                    {detailsErrorMessage?.message ||
                      "Failed to load order details."}
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchDetails()}
                    className="text-xs px-2 py-1 rounded border border-border hover:bg-paper"
                  >
                    Retry
                  </button>
                </div>
              ) : null}
              {!detailsLoading &&
              !detailsError &&
              filteredDetailOrders.length === 0 ? (
                <p className="text-sm text-muted">
                  No orders found for this card.
                </p>
              ) : null}

              {filteredDetailOrders.map((order) => (
                <div
                  key={order._id}
                  className="border border-border rounded-xl p-3 bg-paper"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-ink">{order.id}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {order.channel} • {order.source}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-ink">
                      ₹{order.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-muted">
                      {order.items} item{order.items === 1 ? "" : "s"} •{" "}
                      {order.eta}
                    </p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function VisitorsTab() {
  const [visitorTimeRange, setVisitorTimeRange] = useState("1D");

  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-today-stats", visitorTimeRange],
    queryFn: () => fetchTodayStats(visitorTimeRange),
    refetchInterval: 30_000,
  });

  const { data: visitorTrend } = useQuery({
    queryKey: ["dashboard-visitor-trend", visitorTimeRange],
    queryFn: () => fetchVisitorTrend(visitorTimeRange),
    staleTime: 2 * 60 * 1000,
  });

  const { data: visitorOrders = [] } = useQuery({
    queryKey: ["visitors-orders"],
    queryFn: fetchOrders,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const visitorUsers = useMemo(() => {
    const usersByKey = new Map();

    for (const order of visitorOrders) {
      const hasUsefulGuest = order.guestPhone || order.guestName;
      if (!hasUsefulGuest) continue;

      const guestName = order.guestName || "Guest";
      const guestPhone = order.guestPhone || "—";
      const key = order.guestPhone || `${guestName}-${order.channel}`;

      if (!usersByKey.has(key)) {
        usersByKey.set(key, {
          name: guestName,
          phone: guestPhone,
          channel: order.channel,
          source: order.source,
          lastSeen: order.createdAt,
          orders: 1,
          status: order.status,
        });
      } else {
        const prev = usersByKey.get(key);
        usersByKey.set(key, {
          ...prev,
          orders: prev.orders + 1,
          status: order.status,
        });
      }
    }

    return Array.from(usersByKey.values()).slice(0, 12);
  }, [visitorOrders]);

  const returningRate =
    stats && stats.totalVisitors > 0
      ? Math.round((stats.returningGuests / stats.totalVisitors) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-xl shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-ink text-lg">Visitors Details</h2>
            <p className="text-xs text-muted mt-1">
              Live visitor metrics with hourly pattern and trend.
            </p>
          </div>
          <div className="flex bg-paper p-1 rounded-lg border border-border">
            {["1D", "7D", "1M", "6M"].map((range) => (
              <button
                key={range}
                onClick={() => setVisitorTimeRange(range)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  visitorTimeRange === range
                    ? "bg-white text-indigo-500 shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted">Loading visitors data...</p>
        ) : null}
        {isError ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-red-600">
              {error?.message || "Failed to load visitor details."}
            </p>
            <button
              onClick={() => refetch()}
              className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-paper"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="bg-paper border border-border rounded-xl p-4">
                <p className="text-xs text-muted">Total Visitors</p>
                <p className="text-2xl font-black text-ink mt-1">
                  {stats?.totalVisitors ?? 0}
                </p>
              </div>
              <div className="bg-paper border border-border rounded-xl p-4">
                <p className="text-xs text-muted">New Guests</p>
                <p className="text-2xl font-black text-ink mt-1">
                  {stats?.newGuests ?? 0}
                </p>
              </div>
              <div className="bg-paper border border-border rounded-xl p-4">
                <p className="text-xs text-muted">Returning Guests</p>
                <p className="text-2xl font-black text-ink mt-1">
                  {stats?.returningGuests ?? 0}
                </p>
              </div>
              <div className="bg-paper border border-border rounded-xl p-4">
                <p className="text-xs text-muted">Returning Rate</p>
                <p className="text-2xl font-black text-ink mt-1">
                  {returningRate}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-border rounded-xl p-4 lg:col-span-2">
                <p className="text-sm font-bold text-ink mb-3">Visitor Trend</p>
                <div className="h-64">
                  <Suspense
                    fallback={
                      <div className="h-64 animate-pulse rounded-xl bg-paper" />
                    }
                  >
                    <TrendLineChart
                      data={buildVisitorChartData(visitorTrend)}
                      options={visitorChartOptions}
                    />
                  </Suspense>
                </div>
              </div>

              <div className="bg-white border border-border rounded-xl p-4">
                <p className="text-sm font-bold text-ink mb-3">Hourly Visits</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(stats?.hourlyVisits || []).map((entry) => (
                    <div
                      key={entry.label}
                      className="flex items-center justify-between text-sm border border-border rounded-lg px-3 py-2"
                    >
                      <span className="text-muted">{entry.label}</span>
                      <span className="font-semibold text-ink">
                        {entry.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white border border-border rounded-xl p-4">
              <p className="text-sm font-bold text-ink mb-3">
                Visitor User Details
              </p>

              {visitorUsers.length === 0 ? (
                <p className="text-sm text-muted">
                  No visitor user details available yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase text-muted">
                        <th className="text-left py-2 pr-3">Name</th>
                        <th className="text-left py-2 pr-3">Phone</th>
                        <th className="text-left py-2 pr-3">Source</th>
                        <th className="text-right py-2 pr-3">Orders</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitorUsers.map((user, index) => (
                        <tr
                          key={`${user.phone}-${index}`}
                          className="border-b border-cream"
                        >
                          <td className="py-2 pr-3 font-medium text-ink">
                            {user.name}
                          </td>
                          <td className="py-2 pr-3 text-muted">{user.phone}</td>
                          <td className="py-2 pr-3 text-muted">
                            {user.channel} • {user.source}
                          </td>
                          <td className="py-2 pr-3 text-right font-semibold text-ink">
                            {user.orders}
                          </td>
                          <td className="py-2">
                            <OrderStatusBadge status={user.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function FinanceTab() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard-snapshot"],
    queryFn: fetchDashboardSnapshot,
  });

  const paymentBreakup = (data?.paymentBreakup ?? []).map((item, idx) => ({
    label: item.label,
    amount: item.amount,
    share: item.share,
    color: ["bg-saffron", "bg-sage", "bg-muted2"][idx] ?? "bg-muted2",
  }));

  const settlements = data?.settlements ?? [];

  const totalNet = settlements.reduce((acc, item) => acc + item.net, 0);
  const totalGross = settlements.reduce((acc, item) => acc + item.gross, 0);
  const totalFees = totalGross - totalNet;

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="text-sm text-muted">Loading finance data...</div>
      ) : null}
      {isError ? (
        <div className="flex items-center justify-between gap-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <p className="text-sm text-red-600">
            {error?.message || "Failed to load finance snapshot."}
          </p>
          <button
            onClick={() => refetch()}
            className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-white"
          >
            Retry
          </button>
        </div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Gross Sales"
          value={`₹${(data?.grossSales ?? 0).toLocaleString()}`}
          extraIcon={Banknote}
        />
        <KpiCard
          title="Net Collected"
          value={`₹${totalNet.toLocaleString()}`}
          extraIcon={Wallet}
        />
        <KpiCard
          title="Total Tax (5% GST)"
          value={`₹${(data?.gstAmount ?? 0).toLocaleString()}`}
          extraIcon={Receipt}
        />
        <KpiCard
          title="Gateway Fees"
          value={`₹${totalFees.toLocaleString()}`}
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
            {paymentBreakup.length === 0 && !isLoading ? (
              <p className="text-sm text-muted py-4 text-center">
                No payment channel data yet.
              </p>
            ) : null}
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
            {settlements.length === 0 && !isLoading ? (
              <p className="text-sm text-muted py-4 text-center">
                No settlement records yet.
              </p>
            ) : null}
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
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard-snapshot"],
    queryFn: fetchDashboardSnapshot,
  });
  const [category, setCategory] = useState("All");
  const sourceItems = (data?.productMix ?? []).map((item) => ({
    n: item.name,
    c: item.category,
    q: item.units,
    r: item.revenue,
    margin: item.margin,
    stock: item.stock,
  }));

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
      {isLoading ? (
        <div className="text-sm text-muted">Loading menu analytics...</div>
      ) : null}
      {isError ? (
        <div className="flex items-center justify-between gap-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <p className="text-sm text-red-600">
            {error?.message || "Failed to load menu analytics."}
          </p>
          <button
            onClick={() => refetch()}
            className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-white"
          >
            Retry
          </button>
        </div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KpiCard
          title="Total Units Sold"
          value={String(data?.totalUnitsSold ?? 0)}
        />
        <KpiCard
          title="Most Popular Cat."
          value={data?.topCategory ?? "—"}
          extraIcon={UtensilsCrossed}
        />
        <KpiCard title="Avg Margin" value={`${avgMargin}%`} />
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
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard-snapshot"],
    queryFn: fetchDashboardSnapshot,
    refetchInterval: 20_000,
  });
  const [serviceMode, setServiceMode] = useState("Dine-in");
  const tableHealth = data?.areaLoad ?? [];
  const kitchenQueue = data?.kitchenQueue ?? [];

  const totalOccupied = tableHealth.reduce((acc, row) => acc + row.occupied, 0);
  const totalCapacity = tableHealth.reduce((acc, row) => acc + row.total, 0);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="text-sm text-muted">Loading operations data...</div>
      ) : null}
      {isError ? (
        <div className="flex items-center justify-between gap-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <p className="text-sm text-red-600">
            {error?.message || "Failed to load operations data."}
          </p>
          <button
            onClick={() => refetch()}
            className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-white"
          >
            Retry
          </button>
        </div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Avg Table Turnover"
          value={
            data
              ? data.avgTableTurnover > 0
                ? `${data.avgTableTurnover}m`
                : "—"
              : "—"
          }
          extraIcon={Clock4}
        />
        <KpiCard
          title="QR Menu Scans"
          value={String(data?.qrScans ?? 0)}
          extraIcon={Smartphone}
        />
        <KpiCard title="QR Conv. Rate" value={`${data?.qrConvRate ?? 0}%`} />
        <KpiCard
          title="Table Occupancy"
          value={
            totalCapacity > 0
              ? `${Math.round((totalOccupied / totalCapacity) * 100)}%`
              : "0%"
          }
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
            {tableHealth.length === 0 && !isLoading ? (
              <p className="text-sm text-muted">
                No table areas configured yet.
              </p>
            ) : null}
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
            {kitchenQueue.length === 0 && !isLoading ? (
              <p className="text-sm text-muted">No active kitchen tickets.</p>
            ) : null}
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
          {kitchenQueue.some((t) => parseInt(t.wait) >= 10) && (
            <div className="mt-4 p-3 rounded-lg bg-saffron-lt text-saffron text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={14} />
              {kitchenQueue.filter((t) => parseInt(t.wait) >= 10).length} ticket
              {kitchenQueue.filter((t) => parseInt(t.wait) >= 10).length > 1
                ? "s"
                : ""}{" "}
              above 10 minutes. Escalate to captain.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

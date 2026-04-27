import { Clock3, CookingPot, PackageCheck, Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "../services/api";
import StatCard from "../components/shared/StatCard";
import OrderStatusBadge from "../components/shared/OrderStatusBadge";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import PageShell from "../components/layout/PageShell";

export default function OrdersPage() {
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchInterval: 12_000,
  });

  const openOrders = orders.filter((o) => o.status === "Preparing").length;
  const inKitchen = orders.filter((o) => o.status === "Preparing").length;
  const readyToServe = orders.filter((o) => o.status === "Ready").length;
  const outForDelivery = orders.filter(
    (o) => o.source.toLowerCase().includes("delivery") && o.status !== "Served",
  ).length;

  return (
    <PageShell>
      <ErrorBoundary label="Orders">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Open Orders"
            value={String(openOrders)}
            icon={Clock3}
          />
          <StatCard
            title="In Kitchen"
            value={String(inKitchen)}
            icon={CookingPot}
          />
          <StatCard
            title="Ready to Serve"
            value={String(readyToServe)}
            icon={PackageCheck}
          />
          <StatCard
            title="Out for Delivery"
            value={String(outForDelivery)}
            icon={Truck}
          />
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-bold text-ink">Live Order Queue</h2>
          </div>
          {isLoading ? (
            <div className="px-5 py-10 text-sm text-muted">
              Loading live orders...
            </div>
          ) : null}
          {isError ? (
            <div className="px-5 py-6 flex items-center justify-between gap-4">
              <p className="text-sm text-error">
                {error?.message || "Failed to load orders."}
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-paper"
              >
                Retry
              </button>
            </div>
          ) : null}
          {!isLoading && !isError && orders.length === 0 ? (
            <div className="px-5 py-10 text-sm text-muted">No orders yet.</div>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-paper text-muted uppercase text-xs">
                <tr>
                  <th className="text-left py-3 px-5">Order</th>
                  <th className="text-left py-3 px-5">Source</th>
                  <th className="text-right py-3 px-5">Items</th>
                  <th className="text-right py-3 px-5">Amount</th>
                  <th className="text-left py-3 px-5">Status</th>
                  <th className="text-right py-3 px-5">ETA</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-cream hover:bg-paper/60"
                  >
                    <td className="py-3 px-5 font-semibold text-ink">
                      {row.id}
                    </td>
                    <td className="py-3 px-5">{row.source}</td>
                    <td className="py-3 px-5 text-right">{row.items}</td>
                    <td className="py-3 px-5 text-right font-semibold">
                      ₹{row.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-5">
                      <OrderStatusBadge status={row.status} />
                    </td>
                    <td className="py-3 px-5 text-right">{row.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ErrorBoundary>
    </PageShell>
  );
}

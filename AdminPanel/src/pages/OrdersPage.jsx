import { useState } from "react";
import { Clock3, CookingPot, PackageCheck, Truck, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchOrders,
  fetchOrderById,
  updateOrderStatus,
} from "../services/api";
import StatCard from "../components/shared/StatCard";
import OrderStatusBadge from "../components/shared/OrderStatusBadge";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import PageShell from "../components/layout/PageShell";

function OrderDetailDrawer({ orderId, onClose }) {
  const queryClient = useQueryClient();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: Boolean(orderId),
    staleTime: 30_000,
  });

  const nextStatus =
    order?.status === "Preparing"
      ? "Ready"
      : order?.status === "Ready"
        ? "Served"
        : null;

  const nextStatusLabel =
    nextStatus === "Ready"
      ? "Mark Ready to Serve"
      : nextStatus === "Served"
        ? "Mark Served"
        : "";

  const handleStatusUpdate = async () => {
    if (!order || !nextStatus || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(order._id, nextStatus);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order", orderId] }),
      ]);
      toast.success(`Order ${order.orderId} marked ${nextStatus}`);
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-bold text-ink text-base">
            {order ? `Order ${order.orderId}` : "Order Details"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-paper text-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isLoading && (
            <p className="text-sm text-muted py-8 text-center">Loading…</p>
          )}
          {isError && (
            <p className="text-sm text-error py-8 text-center">
              Failed to load order details.
            </p>
          )}
          {order && (
            <>
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted uppercase mb-0.5">Source</p>
                  <p className="font-medium text-ink">{order.source}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase mb-0.5">Status</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                {order.tableId && (
                  <div>
                    <p className="text-xs text-muted uppercase mb-0.5">Table</p>
                    <p className="font-medium text-ink">{order.tableId}</p>
                  </div>
                )}
                {order.roomId && (
                  <div>
                    <p className="text-xs text-muted uppercase mb-0.5">Room</p>
                    <p className="font-medium text-ink">{order.roomId}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted uppercase mb-0.5">Guest</p>
                  <p className="font-medium text-ink">
                    {order.guestName || "—"}
                  </p>
                </div>
                {order.guestPhone && (
                  <div>
                    <p className="text-xs text-muted uppercase mb-0.5">Phone</p>
                    <p className="font-medium text-ink">{order.guestPhone}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted uppercase mb-0.5">Payment</p>
                  <p className="font-medium text-ink">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase mb-0.5">Placed</p>
                  <p className="font-medium text-ink">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {nextStatus ? (
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus}
                  className="w-full rounded-lg bg-saffron text-white text-sm font-semibold py-2.5 hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isUpdatingStatus ? "Updating..." : nextStatusLabel}
                </button>
              ) : null}

              {/* Items */}
              <div>
                <p className="text-xs text-muted uppercase mb-2">Items</p>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start gap-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-ink">
                          {item.quantity}× {item.name}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-muted">{item.notes}</p>
                        )}
                      </div>
                      <p className="font-semibold text-ink shrink-0">
                        ₹{item.total.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>GST</span>
                  <span>₹{order.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-ink text-base pt-1 border-t border-border">
                  <span>Total</span>
                  <span>₹{order.total.toLocaleString()}</span>
                </div>
              </div>

              {order.cancelReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                  <span className="font-medium">Cancel reason: </span>
                  {order.cancelReason}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
                    onClick={() => setSelectedOrderId(row._id)}
                    className="border-t border-cream hover:bg-paper/60 cursor-pointer"
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

        {selectedOrderId && (
          <OrderDetailDrawer
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
          />
        )}
      </ErrorBoundary>
    </PageShell>
  );
}

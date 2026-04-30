import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  CookingPot,
  PackageCheck,
  Printer,
  Truck,
  X,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchBusinessProfile,
  fetchOrderById,
  fetchOrders,
  updateOrderStatus,
} from "../services/api";
import StatCard from "../components/shared/StatCard";
import OrderStatusBadge from "../components/shared/OrderStatusBadge";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import PageShell from "../components/layout/PageShell";

function OrderDetailDrawer({ orderId, onClose }) {
  const queryClient = useQueryClient();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

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

  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: fetchBusinessProfile,
    staleTime: 300_000,
  });

  const formatTableLabel = (raw) => {
    const value = String(raw || "").trim();
    const digits = value.replace(/\D/g, "");
    if (!digits) return value || "-";
    return `T-${String(Number(digits)).padStart(2, "0")}`;
  };

  const printInvoice = () => {
    if (!order) return;
    const popup = window.open("", "_blank", "width=860,height=920");
    if (!popup) {
      toast.error("Please allow popups to print invoice.");
      return;
    }
    const lineRows = (order.items || [])
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">₹${Number(item.price || 0).toFixed(2)}</td>
            <td style="text-align:right;">₹${Number(item.total || 0).toFixed(2)}</td>
          </tr>`,
      )
      .join("");
    popup.document.write(`
      <html>
        <head>
          <title>Invoice ${order.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 22px; color: #222; }
            .head { display:flex; justify-content:space-between; margin-bottom: 14px; }
            .title { font-size: 22px; font-weight: 700; margin: 0; }
            .muted { color: #666; font-size: 12px; }
            table { width:100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border-bottom: 1px solid #ddd; padding: 8px; font-size: 13px; }
            th { text-align:left; background: #f8f8f8; }
            .totals { margin-top: 14px; width: 280px; margin-left: auto; }
            .totals p { display:flex; justify-content:space-between; margin: 6px 0; font-size: 13px; }
            .grand { font-size: 16px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="head">
            <div>
              <p class="title">${businessProfile?.name || "Restaurant"}</p>
              <p class="muted">${businessProfile?.address || ""}</p>
            </div>
            <div style="text-align:right;">
              <p class="title">INVOICE</p>
              <p class="muted">Order: ${order.orderId || "-"}</p>
              <p class="muted">Table: ${formatTableLabel(order.tableId)}</p>
              <p class="muted">GST No: ${businessProfile?.gstNo || "-"}</p>
              <p class="muted">Date: ${new Date(order.createdAt).toLocaleString("en-IN")}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>${lineRows}</tbody>
          </table>
          <div class="totals">
            <p><span>Subtotal</span><span>₹${Number(order.subtotal || 0).toFixed(2)}</span></p>
            <p><span>Discount</span><span>₹${Number(order.discount || 0).toFixed(2)}</span></p>
            <p><span>Tax</span><span>₹${Number(order.tax || 0).toFixed(2)}</span></p>
            <p class="grand"><span>Grand Total</span><span>₹${Number(order.total || 0).toFixed(2)}</span></p>
            <p><span>Payment</span><span>${order.paymentMethod || "-"} / ${order.paymentStatus || "-"}</span></p>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    popup.document.close();
  };

  useEffect(() => {
    if (order?.status) {
      setSelectedStatus(order.status);
    }
  }, [order?.status]);

  const handleStatusUpdate = async () => {
    if (!order || !selectedStatus || isUpdatingStatus) return;
    if (selectedStatus === order.status) return;
    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(order._id, selectedStatus);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order", orderId] }),
      ]);
      toast.success(`Order ${order.orderId} marked ${selectedStatus}`);
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
                    <p className="font-medium text-ink">
                      {formatTableLabel(order.tableId)}
                    </p>
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

              <div className="space-y-2">
                <p className="text-xs text-muted uppercase">Status</p>
                {/* Quick step navigation */}
                {(() => {
                  const STATUS_STEPS = [
                    "Pending",
                    "Preparing",
                    "Ready",
                    "Served",
                  ];
                  const currentIdx = STATUS_STEPS.indexOf(order.status);
                  const canGoBack = currentIdx > 0;
                  const canGoForward =
                    currentIdx >= 0 && currentIdx < STATUS_STEPS.length - 1;
                  const stepTo = async (status) => {
                    if (isUpdatingStatus) return;
                    setIsUpdatingStatus(true);
                    try {
                      await updateOrderStatus(order._id, status);
                      queryClient.invalidateQueries({ queryKey: ["orders"] });
                      queryClient.invalidateQueries({
                        queryKey: ["order", orderId],
                      });
                      setSelectedStatus(status);
                      toast.success(`Order ${order.orderId} → ${status}`);
                    } catch {
                      toast.error("Failed to update status");
                    } finally {
                      setIsUpdatingStatus(false);
                    }
                  };
                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => stepTo(STATUS_STEPS[currentIdx - 1])}
                        disabled={!canGoBack || isUpdatingStatus}
                        title={
                          canGoBack
                            ? `Back to ${STATUS_STEPS[currentIdx - 1]}`
                            : "Already at first step"
                        }
                        className="px-4 py-2 rounded-lg border border-border text-muted hover:text-ink hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <div className="flex-1 flex justify-center">
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <button
                        onClick={() => stepTo(STATUS_STEPS[currentIdx + 1])}
                        disabled={!canGoForward || isUpdatingStatus}
                        title={
                          canGoForward
                            ? `Advance to ${STATUS_STEPS[currentIdx + 1]}`
                            : "Already at last step"
                        }
                        className="px-4 py-2 rounded-lg border border-border text-muted hover:text-ink hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  );
                })()}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready to Serve</option>
                    <option value="Served">Served</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={
                      isUpdatingStatus ||
                      !selectedStatus ||
                      selectedStatus === order.status
                    }
                    className="rounded-lg bg-saffron text-white text-sm font-semibold px-4 py-2.5 hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {isUpdatingStatus ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>

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

              {/* Print Invoice */}
              <button
                type="button"
                onClick={printInvoice}
                className="w-full border border-border hover:bg-paper text-ink rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer size={14} />
                Print Invoice
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const formatGeneratedTime = (value) => {
    if (!value) return "-";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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
                  <th className="text-right py-3 px-5">Generated</th>
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
                    <td className="py-3 px-5 text-right">
                      {formatGeneratedTime(row.createdAt)}
                    </td>
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

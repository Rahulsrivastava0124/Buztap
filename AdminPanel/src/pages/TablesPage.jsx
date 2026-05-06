import { useMemo, useState } from "react";
import {
  Armchair,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Sparkles,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchBusinessProfile,
  fetchOrderById,
  fetchOrders,
  fetchTables,
  updateOrderPayment,
  updateTableStatus,
} from "../services/api";
import StatCard from "../components/shared/StatCard";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import PageShell from "../components/layout/PageShell";

const COLORS = {
  Occupied: "border-warning bg-warning/10 text-ink",
  Free: "border-sage bg-sage-lt text-sage",
  Reserved: "border-saffron bg-saffron-lt text-saffron",
  Cleaning: "border-muted2 bg-base-200 text-muted",
};

function Kpi(props) {
  return <StatCard {...props} />;
}

function buildTableIdCandidates(rawTableId) {
  const value = String(rawTableId || "").trim();
  if (!value) return [];

  const set = new Set([value]);
  const digits = value.replace(/\D/g, "");
  if (digits) {
    const n = Number(digits);
    if (Number.isFinite(n) && n > 0) {
      const plain = String(n);
      const padded = String(n).padStart(2, "0");
      set.add(plain);
      set.add(padded);
      set.add(`T-${plain}`);
      set.add(`T-${padded}`);
    }
  }

  return Array.from(set);
}

function kitchenResponseText(status) {
  if (status === "Pending") return "Waiting for kitchen acceptance";
  if (status === "Preparing") return "Kitchen accepted and preparing";
  if (status === "Ready") return "Kitchen marked order ready";
  if (status === "Served") return "Served by kitchen";
  if (status === "Cancelled") return "Kitchen declined/cancelled";
  return "No kitchen response yet";
}

export default function TablesPage() {
  const queryClient = useQueryClient();
  const {
    data: tables = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
    refetchInterval: 20_000,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchInterval: 12_000,
  });

  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: fetchBusinessProfile,
  });

  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedTableId, setSelectedTableId] = useState("T-01");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");

  const tableMutation = useMutation({
    mutationFn: ({ tableId, status }) => updateTableStatus(tableId, status),
    onMutate: async ({ tableId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tables"] });
      const previous = queryClient.getQueryData(["tables"]);
      queryClient.setQueryData(["tables"], (old = []) =>
        old.map((t) => (t.id === tableId ? { ...t, status } : t)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(["tables"], context.previous);
      toast.error("Unable to update table status");
    },
    onSuccess: (table) => {
      toast.success(`${table.id} marked ${table.status}`);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tables"] }),
  });

  const paymentMutation = useMutation({
    mutationFn: ({ orderId, payload }) => updateOrderPayment(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Payment updated successfully.");
      setTransactionId("");
    },
    onError: (err) => {
      toast.error(err?.message || "Unable to update payment.");
    },
  });

  const selectedTable =
    tables.find((t) => t.id === selectedTableId) ?? tables[0] ?? null;

  const selectedTableOrder = useMemo(() => {
    if (!selectedTable) return null;
    const tableIdCandidates = buildTableIdCandidates(selectedTable.id);
    const candidateSet = new Set(tableIdCandidates);

    const activeStatuses = new Set(["Pending", "Preparing", "Ready", "Served"]);

    const matched = orders
      .filter((order) => {
        const tableId = String(order.tableId || "").trim();
        if (!candidateSet.has(tableId)) return false;
        if (order.status === "Served" && order.paymentStatus === "Completed") return false;
        return activeStatuses.has(order.status);
      })
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

    return matched[0] || null;
  }, [orders, selectedTable]);

  const selectedTableLatestOrder = useMemo(() => {
    if (!selectedTable) return null;
    const tableIdCandidates = buildTableIdCandidates(selectedTable.id);
    const candidateSet = new Set(tableIdCandidates);

    const matched = orders
      .filter((order) => {
        const tableId = String(order.tableId || "").trim();
        return candidateSet.has(tableId);
      })
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

    return matched[0] || null;
  }, [orders, selectedTable]);

  const selectedTableActiveOrder = selectedTableOrder || selectedTableLatestOrder;
  const selectedOrderIsServed = selectedTableActiveOrder?.status === "Served";
  const selectedOrderPaymentStatus =
    selectedTableActiveOrder?.paymentStatus || "Pending";
  const selectedOrderPaymentDone = selectedOrderPaymentStatus === "Completed";

  const upiId = businessProfile?.restroUpi || "";

  const upiPaymentLink = useMemo(() => {
    if (!selectedTableActiveOrder || !upiId) return "";
    const params = new URLSearchParams({
      pa: upiId,
      pn: businessProfile?.name || "Restaurant",
      am: String(Number(selectedTableActiveOrder.amount || 0).toFixed(2)),
      cu: "INR",
      tn: selectedTableActiveOrder.id || "Table Payment",
    });
    return `upi://pay?${params.toString()}`;
  }, [businessProfile?.name, selectedTableActiveOrder, upiId]);

  const upiQrUrl = upiPaymentLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
        upiPaymentLink,
      )}`
    : "";

  const selectedTableElapsed = useMemo(() => {
    if (!selectedTableActiveOrder?.createdAt) return "-";
    const createdAtMs = new Date(selectedTableActiveOrder.createdAt).getTime();
    if (!Number.isFinite(createdAtMs)) return "-";
    const totalMinutes = Math.max(
      1,
      Math.round((Date.now() - createdAtMs) / 60000),
    );

    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return `${days}d ${hours}h`;
    }

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }

    return `${minutes}m`;
  }, [selectedTableActiveOrder]);

  const nextTableStatus = useMemo(() => {
    if (!selectedTable) return null;
    if (selectedTable.status === "Reserved") return "Cleaning";
    if (selectedTable.status === "Cleaning") return "Free";
    return null;
  }, [selectedTable]);

  const canMoveToNextStatus = useMemo(() => {
    if (!selectedTable || !nextTableStatus) return false;
    return true;
  }, [nextTableStatus, selectedTable]);

  const nextStepDisabledReason = useMemo(() => {
    if (!selectedTable) return "";
    if (selectedTable.status === "Free") {
      return "Reserved is assigned automatically by the system.";
    }
    if (selectedTable.status === "Occupied") {
      return "Reserved is assigned automatically by the system; manual action is only for Reserved/Cleaning.";
    }
    return "";
  }, [selectedTable]);
  const filteredTables = useMemo(() => {
    if (activeFilter === "All") return tables;
    return tables.filter((table) => table.status === activeFilter);
  }, [activeFilter, tables]);

  const occupiedCount = tables.filter((t) => t.status === "Occupied").length;
  const freeCount = tables.filter((t) => t.status === "Free").length;
  const reservedCount = tables.filter((t) => t.status === "Reserved").length;
  const cleaningCount = tables.filter((t) => t.status === "Cleaning").length;

  const cycleTableStatus = () => {
    if (!selectedTable || !nextTableStatus || !canMoveToNextStatus) return;
    tableMutation.mutate({
      tableId: selectedTable.id,
      status: nextTableStatus,
    });
  };

  const markPayment = () => {
    if (!selectedTableActiveOrder?._id) return;
    if (!selectedOrderIsServed) {
      toast.error("Payment can be recorded only after order is served.");
      return;
    }
    if (selectedOrderPaymentDone) {
      toast.error("Payment is already completed for this order.");
      return;
    }

    const payload = {
      paymentMethod: paymentMode === "UPI" ? "Card/UPI" : "Cash",
      paymentStatus: "Completed",
      transactionId:
        paymentMode === "UPI"
          ? transactionId.trim() || `UPI-${Date.now()}`
          : transactionId.trim() || undefined,
    };

    paymentMutation.mutate({
      orderId: selectedTableActiveOrder._id,
      payload,
    });
  };

  const printInvoice = async () => {
    if (!selectedTableActiveOrder?._id) return;

    try {
      const order = await fetchOrderById(selectedTableActiveOrder._id);
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
            </tr>
          `,
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
                <p class="muted">Table: ${order.tableId || "-"}</p>
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
    } catch (err) {
      toast.error(err?.message || "Unable to generate invoice.");
    }
  };

  return (
    <PageShell>
      <ErrorBoundary label="Tables">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Kpi
            title="Total Tables"
            value={String(tables.length)}
            icon={Armchair}
          />
          <Kpi title="Occupied" value={String(occupiedCount)} icon={Clock3} />
          <Kpi title="Free" value={String(freeCount)} icon={CheckCircle2} />
          <Kpi
            title="Reserved / Cleaning"
            value={`${reservedCount} / ${cleaningCount}`}
            icon={DoorOpen}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h2 className="font-bold text-ink">Floor Map Snapshot</h2>
              <div className="flex items-center gap-2">
                {["All", "Occupied", "Free", "Reserved", "Cleaning"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setActiveFilter(status)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${activeFilter === status ? "bg-saffron text-white border-saffron" : "bg-paper text-muted border-border"}`}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>
            </div>

            {isLoading ? (
              <p className="text-sm text-muted mb-3">Loading tables...</p>
            ) : null}
            {isError ? (
              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="text-sm text-error">
                  {error?.message || "Failed to load tables."}
                </p>
                <button
                  onClick={() => refetch()}
                  className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-paper"
                >
                  Retry
                </button>
              </div>
            ) : null}
            {!isLoading && !isError && filteredTables.length === 0 ? (
              <p className="text-sm text-muted mb-3">
                No tables match the selected filter.
              </p>
            ) : null}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  className={`rounded-xl border p-3 text-left transition-colors ${COLORS[table.status]} ${selectedTableId === table.id ? "ring-2 ring-saffron" : ""}`}
                >
                  <p className="font-bold text-sm">{table.id}</p>
                  <p className="text-xs opacity-80 mt-1">{table.seats} seats</p>
                  <p className="text-xs mt-2 font-semibold">{table.status}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="font-bold text-ink">Table Actions</h3>
            <p className="text-xs text-muted mt-1">
              Update reservation or occupancy state in one click.
            </p>

            <div className="mt-4 p-4 rounded-lg border border-cream bg-paper">
              <p className="text-sm font-semibold text-ink">
                {selectedTable?.id ?? "-"}
              </p>
              <p className="text-xs text-muted mt-1">
                {selectedTable?.seats ?? 0} seats
              </p>
              <p className="text-xs mt-3">
                Status:{" "}
                <span className="font-bold text-saffron">
                  {selectedTable?.status ?? "-"}
                </span>
              </p>
              <p className="text-xs mt-1 text-muted">
                Guest: {selectedTable?.guestName || "-"}
              </p>

              {selectedTable?.status === "Occupied" ? (
                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  <p className="text-xs text-muted">
                    Time:{" "}
                    <span className="font-semibold text-ink">
                      {selectedTableElapsed}
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    Bill Amount:{" "}
                    <span className="font-semibold text-ink">
                      {selectedTableActiveOrder
                        ? `₹${Number(selectedTableActiveOrder.amount || 0).toLocaleString("en-IN")}`
                        : "-"}
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    Kitchen Response:{" "}
                    <span className="font-semibold text-ink">
                      {kitchenResponseText(selectedTableActiveOrder?.status)}
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    Order Status:{" "}
                    <span className="font-bold text-saffron">
                      {selectedTableActiveOrder?.status || "-"}
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    Payment Status:{" "}
                    <span
                      className={`font-bold ${selectedOrderPaymentDone ? "text-green-700" : "text-orange-600"}`}
                    >
                      {selectedTableActiveOrder?.paymentStatus || "Pending"}
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    Payment Method:{" "}
                    <span className="font-semibold text-ink">
                      {selectedTableActiveOrder?.paymentMethod || "Pending"}
                    </span>
                  </p>
                </div>
              ) : null}
            </div>

            {selectedOrderIsServed ? (
              <div className="mt-4 rounded-lg border border-border p-3 bg-white">
                <p className="text-xs font-semibold text-ink">Payment</p>
                {selectedOrderPaymentDone ? (
                  <p className="mt-2 text-xs text-green-700 font-semibold">
                    Payment completed.
                  </p>
                ) : (
                  <>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMode("UPI")}
                        className={`text-xs px-2.5 py-1 rounded-md border ${paymentMode === "UPI" ? "bg-saffron text-white border-saffron" : "border-border text-muted"}`}
                      >
                        UPI
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode("Cash")}
                        className={`text-xs px-2.5 py-1 rounded-md border ${paymentMode === "Cash" ? "bg-saffron text-white border-saffron" : "border-border text-muted"}`}
                      >
                        Cash
                      </button>
                    </div>

                    {paymentMode === "UPI" ? (
                      <div className="mt-3">
                        {upiId ? (
                          <div className="rounded-md border border-border bg-paper p-2 flex justify-center">
                            <img
                              src={upiQrUrl}
                              alt="UPI payment QR"
                              className="w-32 h-32 object-contain"
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-error">
                            Set Restaurant UPI ID in Settings to generate UPI
                            QR.
                          </p>
                        )}
                      </div>
                    ) : null}

                    <input
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Transaction ID (optional)"
                      className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={markPayment}
                      disabled={
                        paymentMutation.isPending ||
                        (paymentMode === "UPI" && !upiId)
                      }
                      className="mt-3 w-full bg-saffron hover:bg-saffron2 disabled:bg-border disabled:text-muted text-white rounded-lg py-2 text-xs font-bold"
                    >
                      {paymentMutation.isPending
                        ? "Updating..."
                        : "Mark Payment Completed"}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={printInvoice}
                  className="mt-3 w-full border border-border hover:bg-paper text-ink rounded-lg py-2 text-xs font-bold"
                >
                  Create Invoice
                </button>
              </div>
            ) : null}

            {nextTableStatus ? (
              <button
                onClick={cycleTableStatus}
                disabled={
                  tableMutation.isPending ||
                  !selectedTable ||
                  !canMoveToNextStatus
                }
                className="w-full mt-4 bg-saffron hover:bg-saffron2 disabled:bg-border disabled:text-muted text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                {tableMutation.isPending
                  ? "Updating..."
                  : `Next Step: ${nextTableStatus}`}
              </button>
            ) : null}
            {nextStepDisabledReason ? (
              <p className="mt-4 text-xs text-muted">
                {nextStepDisabledReason}
              </p>
            ) : null}

            <div className="mt-4 text-xs text-muted space-y-1">
              <p>Reserved → Cleaning → Free</p>
              <p>Reserved is assigned automatically by the system.</p>
              <p>Optimistic UI enabled for quick floor operations.</p>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </PageShell>
  );
}

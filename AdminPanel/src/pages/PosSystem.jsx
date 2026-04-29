import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Utensils,
  ReceiptText,
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Printer,
  X,
  User,
  Phone,
  PlusCircle,
  Clock3,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  fetchPosCatalog,
  fetchTables,
  fetchOrders,
  fetchOrderById,
  fetchBusinessProfile,
  updateTableStatus,
  updateOrderPayment,
} from "../services/api";
import { usePosStore } from "../features/pos/store/usePosStore";
import usePOSHotkeys from "../hooks/usePOSHotkeys";
import { useAuth } from "../context/AuthContext";

const TABLE_STATUS_STYLES = {
  Occupied: "border-warning bg-warning/10 text-ink",
  Free: "border-sage bg-sage-lt text-sage",
  Reserved: "border-saffron bg-saffron-lt text-saffron",
  Cleaning: "border-muted2 bg-base-200 text-muted",
};

const TABLE_STATUS_DOT = {
  Occupied: "bg-warning",
  Free: "bg-sage",
  Reserved: "bg-saffron",
  Cleaning: "bg-muted2",
};

const CLEANING_WINDOW_MS = 15 * 60 * 1000;

function buildTableIdCandidates(rawTableId) {
  const value = String(rawTableId || "").trim();
  if (!value) return [];
  const set = new Set([value]);
  const digits = value.replace(/\D/g, "");
  if (digits) {
    const n = Number(digits);
    if (Number.isFinite(n) && n > 0) {
      set.add(String(n));
      set.add(String(n).padStart(2, "0"));
      set.add(`T-${String(n)}`);
      set.add(`T-${String(n).padStart(2, "0")}`);
    }
  }
  return Array.from(set);
}

export default function PosSystem() {
  // step: "table" | "menu"
  const [step, setStep] = useState("table");
  const [activeCat, setActiveCat] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  // Occupied table detail panel
  const [detailTable, setDetailTable] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const { businessType } = useAuth();
  const isHotelMode = businessType === "hotel";
  const locationLabel = isHotelMode ? "Room" : "Table";

  const {
    cart,
    orderType,
    setOrderType,
    addToCart,
    setItemNotes,
    updateQty,
    removeItem,
    clearCart,
    setTaxRates,
    getTotals,
  } = usePosStore();

  // ── Tables query ──
  const {
    data: tables = [],
    isLoading: tablesLoading,
    isError: tablesError,
    refetch: refetchTables,
    dataUpdatedAt: tablesUpdatedAt,
  } = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
    refetchInterval: 20_000,
  });

  const getCleaningTimeLabel = (table) => {
    if (table?.status !== "Cleaning") return null;
    const updatedMs = new Date(table?.updatedAt || "").getTime();
    if (!Number.isFinite(updatedMs) || !tablesUpdatedAt) return "15m left";
    const remainingMs = CLEANING_WINDOW_MS - (tablesUpdatedAt - updatedMs);
    if (remainingMs <= 0) return "finishing soon";
    return `${Math.ceil(remainingMs / 60000)}m left`;
  };

  // ── Orders query (for occupied table detail) ──
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchInterval: 15_000,
  });

  // ── Menu query ──
  const {
    data: menuItems = [],
    isLoading: menuLoading,
    isError: menuError,
    error: menuErrorMessage,
    refetch: refetchMenu,
  } = useQuery({
    queryKey: ["pos-catalog"],
    queryFn: fetchPosCatalog,
    enabled: step === "menu",
  });

  // Active order summary (from queue) for the detail panel table
  const detailOrderSummary = useMemo(() => {
    if (!detailTable) return null;
    const candidates = new Set(buildTableIdCandidates(detailTable.id));
    const activeStatuses = new Set(["Pending", "Preparing", "Ready", "Served"]);
    return (
      orders
        .filter(
          (o) =>
            candidates.has(String(o.tableId || "").trim()) &&
            activeStatuses.has(o.status),
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0] || null
    );
  }, [detailTable, orders]);

  // Full order detail (with real items array) fetched when panel opens
  const { data: detailOrder, isLoading: detailOrderLoading } = useQuery({
    queryKey: ["order-detail", detailOrderSummary?._id],
    queryFn: () => fetchOrderById(detailOrderSummary._id),
    enabled: !!detailOrderSummary?._id,
  });

  // Table status mutation (Occupied → Cleaning → Free)
  const statusMutation = useMutation({
    mutationFn: ({ tableId, status }) => updateTableStatus(tableId, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success(`${updated.id} marked ${updated.status}`);
    },
    onError: () => toast.error("Unable to update table status"),
  });

  // Business profile (for UPI id)
  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: fetchBusinessProfile,
    staleTime: 300_000,
  });

  useEffect(() => {
    setTaxRates({
      gstPct: Number(businessProfile?.gstPct ?? 5),
      taxPct: Number(businessProfile?.taxPct ?? 0),
    });
  }, [businessProfile?.gstPct, businessProfile?.taxPct, setTaxRates]);

  const upiId = businessProfile?.restroUpi || "";

  const upiPaymentLink = useMemo(() => {
    if (!detailOrder || !upiId) return "";
    const params = new URLSearchParams({
      pa: upiId,
      pn: businessProfile?.name || "Restaurant",
      am: String(
        Number(detailOrder.total || detailOrderSummary?.amount || 0).toFixed(2),
      ),
      cu: "INR",
      tn: detailOrder.orderId || "Table Payment",
    });
    return `upi://pay?${params.toString()}`;
  }, [businessProfile, detailOrder, detailOrderSummary, upiId]);

  const upiQrUrl = upiPaymentLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiPaymentLink)}`
    : "";

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: ({ id, payload }) => updateOrderPayment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: ["order-detail", detailOrderSummary?._id],
      });
      toast.success("Payment recorded.");
      setTransactionId("");
    },
    onError: (err) => toast.error(err?.message || "Unable to update payment."),
  });

  const isPaymentDone =
    detailOrderSummary?.paymentStatus === "Completed" ||
    detailOrder?.paymentStatus === "Completed";

  const markPayment = async () => {
    if (!detailOrderSummary?._id) return false;
    const targetTableId = detailTable?.id;
    const paymentMethodMap = {
      UPI: "Card/UPI",
      Cash: "Cash",
    };
    const payload = {
      paymentMethod: paymentMethodMap[paymentMode] || paymentMode,
      paymentStatus: "Completed",
      transactionId:
        paymentMode === "UPI"
          ? transactionId.trim() || `UPI-${Date.now()}`
          : transactionId.trim() || undefined,
    };
    try {
      await paymentMutation.mutateAsync({
        id: detailOrderSummary._id,
        payload,
      });
      if (targetTableId) {
        await statusMutation.mutateAsync({
          tableId: targetTableId,
          status: "Cleaning",
        });
      }
      return true;
    } catch {
      return false;
    }
  };

  const printInvoice = () => {
    const order = detailOrder;
    if (!order) return;
    const popup = window.open("", "_blank", "width=860,height=920");
    if (!popup) {
      toast.error("Please allow popups to print invoice.");
      return;
    }
    const lineRows = (order.items || [])
      .map(
        (item) => `<tr>
          <td>${item.name}</td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">₹${Number(item.price || 0).toFixed(2)}</td>
          <td style="text-align:right;">₹${Number(item.total || 0).toFixed(2)}</td>
        </tr>`,
      )
      .join("");
    popup.document.write(`
      <html><head><title>Invoice ${order.orderId}</title>
      <style>
        body{font-family:Arial,sans-serif;margin:22px;color:#222}
        .head{display:flex;justify-content:space-between;margin-bottom:14px}
        .title{font-size:22px;font-weight:700;margin:0}
        .muted{color:#666;font-size:12px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{border-bottom:1px solid #ddd;padding:8px;font-size:13px}
        th{text-align:left;background:#f8f8f8}
        .totals{margin-top:14px;width:280px;margin-left:auto}
        .totals p{display:flex;justify-content:space-between;margin:6px 0;font-size:13px}
        .grand{font-size:16px;font-weight:700}
      </style></head>
      <body>
        <div class="head">
          <div><p class="title">${businessProfile?.name || "Restaurant"}</p><p class="muted">${businessProfile?.address || ""}</p></div>
          <div style="text-align:right;"><p class="title">INVOICE</p>
            <p class="muted">Order: ${order.orderId || "-"}</p>
            <p class="muted">Table: ${order.tableId || "-"}</p>
            <p class="muted">GST No: ${businessProfile?.gstNo || "-"}</p>
            <p class="muted">Date: ${new Date(order.createdAt).toLocaleString("en-IN")}</p>
          </div>
        </div>
        <table><thead><tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr></thead>
        <tbody>${lineRows}</tbody></table>
        <div class="totals">
          <p><span>Subtotal</span><span>₹${Number(order.subtotal || 0).toFixed(2)}</span></p>
          <p><span>Discount</span><span>₹${Number(order.discount || 0).toFixed(2)}</span></p>
          <p><span>Tax</span><span>₹${Number(order.tax || 0).toFixed(2)}</span></p>
          <p class="grand"><span>Grand Total</span><span>₹${Number(order.total || 0).toFixed(2)}</span></p>
          <p><span>Payment</span><span>${order.paymentMethod || "-"} / ${order.paymentStatus || "-"}</span></p>
        </div>
        <script>window.onload=function(){window.print()};</script>
      </body></html>
    `);
    popup.document.close();
  };

  const categories = useMemo(
    () => ["All", ...new Set(menuItems.map((item) => item.cat))],
    [menuItems],
  );

  const modeOptions = useMemo(
    () =>
      isHotelMode
        ? ["Room Service", "Takeaway", "Delivery"]
        : ["Dine-in", "Takeaway", "Delivery"],
    [isHotelMode],
  );

  useEffect(() => {
    if (!modeOptions.includes(orderType)) {
      setOrderType(modeOptions[0]);
    }
  }, [modeOptions, orderType, setOrderType]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat = activeCat === "All" || item.cat === activeCat;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeCat, menuItems, searchTerm]);

  const { subtotal, tax, total, itemCount } = getTotals();
  const taxLabel = `Tax (${Number(businessProfile?.gstPct ?? 5)}% GST${Number(businessProfile?.taxPct ?? 0) > 0 ? ` + ${Number(businessProfile?.taxPct ?? 0)}% Tax` : ""})`;

  function getLatestTableOrder(table) {
    const candidates = new Set(buildTableIdCandidates(table?.id));
    const activeStatuses = new Set(["Pending", "Preparing", "Ready", "Served"]);
    return (
      orders
        .filter(
          (o) =>
            candidates.has(String(o.tableId || "").trim()) &&
            activeStatuses.has(o.status),
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0] || null
    );
  }

  function handleTableClick(table) {
    if (table.status === "Occupied") {
      const activeOrder = getLatestTableOrder(table);
      setGuestName(activeOrder?.guestName || "");
      setGuestPhone(activeOrder?.guestPhone || "");
      setDetailTable(table);
    } else {
      selectTable(table);
    }
  }

  function selectTable(table) {
    setSelectedTable(table);
    setDetailTable(null);
    setStep("menu");
  }

  function changeTable() {
    setDetailTable(null);
    setStep("table");
  }

  const goToCheckout = () => {
    if (!cart.length) return;
    navigate(`/${slug}/pos/checkout`, {
      state: {
        selectedTable: selectedTable?.id,
        orderType,
        locationLabel,
      },
    });
  };

  usePOSHotkeys({
    onFocusSearch: () => step === "menu" && searchRef.current?.focus(),
    onCheckout: () => goToCheckout(),
    onClear: () => clearCart(),
  });

  // ── Step 1: Table Picker ──
  if (step === "table") {
    return (
      <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-paper">
        {/* Table Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 bg-white border-b border-border shadow-sm">
            <h2 className="font-bold text-lg text-ink flex items-center gap-2">
              <Utensils size={20} className="text-saffron" />
              Select a {locationLabel}
            </h2>
            {/* <p className="text-sm text-muted mt-0.5">
              {locationLabel === "Table"
                ? "Occupied tables show the active order. Tap to view or add items."
                : `Choose a ${locationLabel.toLowerCase()} to start the order.`}
            </p> */}
          </div>

          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {tablesLoading ? (
              <p className="text-sm text-muted">
                Loading {locationLabel.toLowerCase()}s…
              </p>
            ) : tablesError ? (
              <div className="flex items-center gap-4">
                <p className="text-sm text-error">Failed to load tables.</p>
                <button
                  onClick={() => refetchTables()}
                  className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-white"
                >
                  Retry
                </button>
              </div>
            ) : tables.length === 0 ? (
              <p className="text-sm text-muted">
                No tables found. Add tables in the Tables page.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {tables.map((table) => {
                  const isActive = detailTable?.id === table.id;
                  const cleaningTimeLabel = getCleaningTimeLabel(table);
                  return (
                    <Motion.button
                      key={table.id}
                      onClick={() => handleTableClick(table)}
                      whileTap={{ scale: 0.96 }}
                      className={`relative flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 font-semibold transition-all hover:shadow-md ${
                        isActive
                          ? "border-saffron ring-2 ring-saffron/30 shadow-md"
                          : TABLE_STATUS_STYLES[table.status] ||
                            "border-border bg-white text-ink"
                      }`}
                    >
                      <span className="text-2xl font-black">{table.id}</span>
                      <span className="flex items-center gap-1.5 text-xs font-medium">
                        <span
                          className={`w-2 h-2 rounded-full ${TABLE_STATUS_DOT[table.status] || "bg-muted2"}`}
                        />
                        {table.status}
                      </span>
                      {table.seats > 0 && (
                        <span className="text-xs text-muted">
                          {table.seats} seats
                        </span>
                      )}
                      {cleaningTimeLabel && (
                        <span className="text-[11px] font-semibold text-muted">
                          Cleaning: {cleaningTimeLabel}
                        </span>
                      )}
                      {table.status !== "Occupied" && (
                        <ChevronRight
                          size={14}
                          className="absolute top-2 right-2 opacity-30"
                        />
                      )}
                      {table.status === "Occupied" && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-warning animate-pulse" />
                      )}
                    </Motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Occupied Table Detail Panel */}
        <AnimatePresence>
          {detailTable && (
            <Motion.div
              key="detail-panel"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-sm bg-white border-l border-border flex flex-col shadow-xl shrink-0"
            >
              {/* Panel Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-paper">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${TABLE_STATUS_STYLES[detailTable.status]}`}
                  >
                    {detailTable.id}
                  </span>
                  {detailTable.seats > 0 && (
                    <span className="text-xs text-muted">
                      {detailTable.seats} seats
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setDetailTable(null)}
                  className="p-1.5 rounded-md text-muted hover:bg-border transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Active Order */}
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Clock3 size={12} /> Active Order
                  </p>
                  {detailOrderLoading ? (
                    <div className="rounded-lg border border-border bg-paper p-3 text-sm text-muted text-center">
                      Loading order…
                    </div>
                  ) : !detailOrderSummary ? (
                    <div className="rounded-lg border border-border bg-paper p-3 text-sm text-muted text-center">
                      No active order found for this table.
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-paper overflow-hidden">
                      <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-white">
                        <span className="text-xs font-semibold text-ink">
                          {detailOrderSummary.id ||
                            `#${detailOrderSummary._id?.slice(-6)}`}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning font-medium">
                          {detailOrderSummary.status}
                        </span>
                      </div>
                      <div className="divide-y divide-border">
                        {(detailOrder?.items || []).map((item, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 flex justify-between items-center"
                          >
                            <div>
                              <p className="text-sm font-medium text-ink">
                                {item.name}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-muted italic">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className="text-xs text-muted">
                                x{item.quantity}
                              </p>
                              <p className="text-sm font-bold text-ink">
                                ₹
                                {Number(
                                  item.total ?? item.price * item.quantity,
                                ).toFixed(0)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {detailOrderLoading && (
                          <div className="px-3 py-2 text-xs text-muted text-center">
                            Loading items…
                          </div>
                        )}
                      </div>
                      <div className="px-3 py-2 border-t border-border bg-white flex justify-between items-center">
                        <span className="text-xs text-muted font-medium">
                          Total
                        </span>
                        <span className="text-sm font-black text-saffron">
                          ₹
                          {Number(
                            detailOrder?.total ??
                              detailOrderSummary.amount ??
                              0,
                          ).toFixed(0)}
                        </span>
                      </div>
                      <div className="px-3 py-2 border-t border-border bg-white flex justify-between items-center">
                        <span className="text-xs text-muted font-medium">
                          Payment
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            (detailOrder?.paymentStatus ||
                              detailOrderSummary?.paymentStatus ||
                              "Pending") === "Completed"
                              ? "text-green-700"
                              : "text-orange-600"
                          }`}
                        >
                          {detailOrder?.paymentStatus ||
                            detailOrderSummary?.paymentStatus ||
                            "Pending"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Guest Info */}
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    Guest Info
                  </p>
                  <div className="space-y-2">
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3 top-2.5 text-muted2"
                      />
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Guest name"
                        className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-paper focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron"
                      />
                    </div>
                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-3 top-2.5 text-muted2"
                      />
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="Guest phone number"
                        className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-paper focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron"
                      />
                    </div>
                  </div>
                </div>

                {/* Pay section — inside scrollable area */}
                {detailOrderSummary && (
                  <div className="rounded-xl border border-border bg-white overflow-hidden">
                    {/* Total row */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="text-base font-black text-ink">
                        Total
                      </span>
                      <span className="text-base font-black text-ink">
                        ₹
                        {Number(
                          detailOrder?.total ?? detailOrderSummary?.amount ?? 0,
                        ).toFixed(0)}
                      </span>
                    </div>
                    <div className="p-3">
                      {isPaymentDone ? (
                        <p className="text-xs text-green-700 font-semibold text-center py-1">
                          ✓ Payment completed
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowPayModal(true)}
                          className="w-full bg-saffron hover:bg-saffron2 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <CreditCard size={16} />
                          Mark Payment Completed
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Panel Actions — fixed footer with action buttons only */}
              <div className="p-4 border-t border-border space-y-2 bg-paper shrink-0">
                {/* Add Items / Print — show Print only after payment */}
                {isPaymentDone ? (
                  <button
                    type="button"
                    onClick={printInvoice}
                    className="w-full py-2.5 rounded-xl border border-border bg-white hover:bg-paper text-sm font-semibold text-ink flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer size={14} /> Print Invoice
                  </button>
                ) : (
                  <button
                    onClick={() => selectTable(detailTable)}
                    className="w-full py-2.5 rounded-xl bg-saffron hover:bg-saffron2 text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-colors shadow-md"
                  >
                    <PlusCircle size={15} /> Add Items
                  </button>
                )}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPayModal && (
            <Motion.div
              key="pay-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setShowPayModal(false)}
            >
              <Motion.div
                key="pay-modal"
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div>
                    <p className="font-bold text-ink text-sm">Payment</p>
                    <p className="text-xs text-muted mt-0.5">
                      Total: ₹
                      {Number(
                        detailOrder?.total ?? detailOrderSummary?.amount ?? 0,
                      ).toFixed(0)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="p-1.5 rounded-md text-muted hover:bg-border transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-4">
                  {/* Mode toggle */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMode("UPI")}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${paymentMode === "UPI" ? "bg-saffron text-white border-saffron" : "border-border text-muted hover:bg-paper"}`}
                    >
                      UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode("Cash")}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${paymentMode === "Cash" ? "bg-saffron text-white border-saffron" : "border-border text-muted hover:bg-paper"}`}
                    >
                      Cash
                    </button>
                  </div>

                  {/* QR code for UPI */}
                  {paymentMode === "UPI" &&
                    (upiId ? (
                      <div className="rounded-xl border border-border bg-paper p-4 flex justify-center">
                        <img
                          src={upiQrUrl}
                          alt="UPI payment QR"
                          className="w-52 h-52 object-contain"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-error text-center">
                        Set UPI ID in Settings to show QR.
                      </p>
                    ))}

                  {/* Transaction ID */}
                  <input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Transaction ID (optional)"
                    className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-saffron/25"
                  />

                  {/* Confirm button */}
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await markPayment();
                      if (ok) {
                        setShowPayModal(false);
                      }
                    }}
                    disabled={
                      paymentMutation.isPending ||
                      (paymentMode === "UPI" && !upiId)
                    }
                    className="w-full bg-saffron hover:bg-saffron2 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <CreditCard size={16} />
                    {paymentMutation.isPending
                      ? "Updating..."
                      : "Confirm Payment"}
                  </button>
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Step 2: Menu + Cart ──
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden bg-paper">
      {/* ── Left Area: Menu Grid ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative border-r border-border">
        {/* Top Controls */}
        <div className="p-4 bg-white border-b border-border flex flex-col gap-3 z-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={changeTable}
                className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink transition-colors"
              >
                <ArrowLeft size={16} />
                {locationLabel}s
              </button>
              <span className="text-muted2">/</span>
              <span className="text-sm font-bold text-saffron">
                {selectedTable?.id}
              </span>
              {selectedTable?.status && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    TABLE_STATUS_STYLES[selectedTable.status] ||
                    "border-border bg-paper text-muted"
                  }`}
                >
                  {selectedTable.status}
                </span>
              )}
            </div>

            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-2.5 text-muted2"
                size={18}
              />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search items by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-paper focus:outline-none focus:ring-1 focus:ring-saffron focus:border-saffron transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeCat === cat
                    ? "bg-saffron text-white shadow-sm"
                    : "bg-cream text-muted hover:bg-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {menuLoading ? (
              <p className="col-span-full text-sm text-muted">
                Loading menu...
              </p>
            ) : null}
            {menuError ? (
              <div className="col-span-full flex items-center justify-between gap-4">
                <p className="text-sm text-error">
                  {menuErrorMessage?.message || "Failed to load menu catalog."}
                </p>
                <button
                  onClick={() => refetchMenu()}
                  className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-paper"
                >
                  Retry
                </button>
              </div>
            ) : null}
            {!menuLoading && !menuError && filteredItems.length === 0 ? (
              <p className="col-span-full text-sm text-muted">
                No menu items found.
              </p>
            ) : null}
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white border border-border rounded-xl overflow-hidden hover:border-saffron hover:shadow-md transition-all text-left flex flex-col group relative"
              >
                <div className="h-28 w-full overflow-hidden bg-gray-100">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-ink leading-tight mb-1 line-clamp-2">
                    {item.name}
                  </p>
                  <p className="font-roboto font-bold text-saffron">
                    ₹{item.price}
                  </p>
                  <p className="text-xs mt-1 text-muted">{item.cat}</p>
                </div>
                <div className="absolute inset-0 bg-saffron/10 opacity-0 group-active:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Area: Ticket (Cart) ── */}
      <div className="w-full lg:w-96 bg-white flex flex-col shadow-xl z-20 shrink-0">
        {/* Ticket Header */}
        <div className="p-4 border-b border-border bg-paper flex items-center justify-between">
          <h2 className="font-bold text-ink flex items-center gap-2">
            <Utensils size={18} className="text-saffron" />
            Current Order
          </h2>
          <button
            onClick={changeTable}
            className="flex items-center gap-1.5 text-sm font-bold text-saffron hover:text-saffron2 transition-colors border border-saffron/30 rounded-lg px-2.5 py-1"
          >
            {selectedTable?.id}
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white">
          <AnimatePresence>
            {cart.length === 0 ? (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50"
              >
                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center">
                  <Utensils size={32} className="text-muted2" />
                </div>
                <p className="text-sm font-semibold text-muted">
                  No items in order.
                </p>
                <p className="text-xs text-muted2">
                  Tap an item on the left to add it.
                </p>
              </Motion.div>
            ) : (
              cart.map((item) => (
                <Motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col gap-2 p-3 bg-paper border border-border rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm text-ink max-w-50 leading-tight">
                      {item.name}
                    </p>
                    <p className="font-roboto font-bold text-ink">
                      ₹{item.price * item.qty}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center gap-3 bg-white border border-border rounded-md px-1.5 h-8">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="text-muted hover:text-ink"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="text-saffron hover:text-saffron2"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <input
                    value={item.notes || ""}
                    onChange={(event) =>
                      setItemNotes(item.id, event.target.value)
                    }
                    placeholder="Add note (e.g. extra spicy)"
                    className="text-sm border border-border rounded-md px-2 py-1 bg-white"
                  />
                </Motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer Settings & Payment */}
        <div className="p-4 border-t border-border bg-paper space-y-4 shadow-[0_-4px_15px_rgba(0,0,0,0.03)]">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span className="font-roboto font-medium text-ink">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted">
              <span>{taxLabel}</span>
              <span className="font-roboto font-medium text-ink">
                ₹{tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-end pt-2 border-t border-border mt-2">
              <span className="font-bold text-ink flex items-center gap-1">
                <ReceiptText size={14} /> Total ({itemCount} items)
              </span>
              <span className="font-roboto text-2xl font-black text-saffron">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              disabled={cart.length === 0}
              onClick={goToCheckout}
              className="col-span-2 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-saffron hover:bg-saffron2 text-white shadow-md transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              Go to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

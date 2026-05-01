import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ChefHat,
  CreditCard,
  FileDown,
  Loader2,
  Phone,
  ReceiptText,
  TicketPercent,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Utensils,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { usePosStore } from "../features/pos/store/usePosStore";
import { useAuth } from "../context/AuthContext";
import {
  createPosOrder,
  fetchBusinessProfile,
  fetchGuestByPhone,
  updateOrderPayment,
} from "../services/api";
import { useQuery } from "@tanstack/react-query";

// steps: "review" → "payment" → "done"
export default function PosCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const { businessType } = useAuth();
  const isHotelMode = businessType === "hotel";

  const {
    cart,
    discountPct,
    setDiscountPct,
    setTaxRates,
    setItemNotes,
    updateQty,
    updateItemPortion,
    removeItem,
    clearCart,
    getTotals,
  } = usePosStore();

  // ── Checkout steps ──
  const [step, setStep] = useState("review"); // "review" | "payment" | "done"
  const [kotOrder, setKotOrder] = useState(null); // response from createPosOrder

  // ── Guest info ──
  const [guestName, setGuestName] = useState(location.state?.guestName || "");
  const [guestPhone, setGuestPhone] = useState(
    location.state?.guestPhone || "",
  );
  const [guestLookupState, setGuestLookupState] = useState("idle"); // "idle" | "loading" | "found" | "new"

  // Auto-lookup when phone reaches 10 digits
  useEffect(() => {
    const digits = guestPhone.replace(/\D/g, "");
    if (digits.length !== 10) {
      if (guestLookupState !== "idle") setGuestLookupState("idle");
      return;
    }
    let cancelled = false;
    setGuestLookupState("loading");
    fetchGuestByPhone(digits).then((guest) => {
      if (cancelled) return;
      if (guest?.name) {
        setGuestName(guest.name);
        setGuestLookupState("found");
      } else {
        setGuestLookupState("new");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [guestPhone]);

  // ── Offers / coupon ──
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  // ── Payment ──
  const [selectedPayment, setSelectedPayment] = useState("Card/UPI");
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const selectedTable =
    location.state?.selectedTable || (isHotelMode ? "101" : "01");
  const locationLabel =
    location.state?.locationLabel || (isHotelMode ? "Room" : "Table");
  const orderType =
    location.state?.orderType || (isHotelMode ? "Room Service" : "Dine-in");

  const resolvedTableId = useMemo(() => {
    const raw = String(selectedTable || "").trim();
    if (!raw) return "";
    if (/^T-\d+$/i.test(raw)) {
      const digits = raw.replace(/\D/g, "");
      return `T-${String(Number(digits)).padStart(2, "0")}`;
    }
    if (/^\d+$/.test(raw)) {
      return `T-${raw.padStart(2, "0")}`;
    }
    return raw;
  }, [selectedTable]);

  const { subtotal, discount, tax, total, itemCount } = getTotals();

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

  const taxLabel = `Tax (${Number(businessProfile?.gstPct ?? 5)}% GST${Number(businessProfile?.taxPct ?? 0) > 0 ? ` + ${Number(businessProfile?.taxPct ?? 0)}% Tax` : ""})`;

  const offerOptions = [
    { pct: 0, title: "No Offer", minSubtotal: 0 },
    { pct: 5, title: "Saver 5%", minSubtotal: 500 },
    { pct: 10, title: "Festival 10%", minSubtotal: 1000 },
    { pct: 100, title: "Comped", minSubtotal: 0 },
  ];

  const paymentOptions = isHotelMode
    ? ["Cash", "Card/UPI", "Room Charge"]
    : ["Cash", "Card/UPI"];

  const invoiceNumber = useMemo(() => {
    if (kotOrder?.orderId) return kotOrder.orderId;
    const seed = `${locationLabel}-${selectedTable}-${orderType}-${cart
      .map((i) => `${i.id}:${i.portion || "Full"}:${i.qty}`)
      .join("|")}-${subtotal.toFixed(2)}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) % 1000000;
    }
    return `INV-${String(hash).padStart(6, "0")}`;
  }, [kotOrder, cart, locationLabel, orderType, selectedTable, subtotal]);

  // ── Send to KOT ──
  const handleSendToKOT = async () => {
    if (!cart.length || submitting) return;
    const phoneDigits = guestPhone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setSubmitting(true);
    setCheckoutError("");
    try {
      const result = await createPosOrder({
        tableId: isHotelMode ? undefined : resolvedTableId || undefined,
        roomId: isHotelMode ? String(selectedTable) : undefined,
        guestName: guestName.trim() || undefined,
        guestPhone: guestPhone.trim() || undefined,
        orderType,
        source: "POS",
        discountPct,
        items: cart.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          quantity: item.qty,
          price: item.price,
          portion: item.portion,
          notes: item.notes,
          modifiers: item.modifiers,
        })),
      });
      setKotOrder(result);
      toast.success("KOT sent to kitchen!");
      setStep("payment");
    } catch (err) {
      toast.error(err?.message || "Unable to send KOT");
      setCheckoutError(err?.message || "Unable to send KOT. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirm Payment ──
  const handleConfirmPayment = async () => {
    if (!kotOrder?._id || submitting) return;
    setSubmitting(true);
    setCheckoutError("");
    try {
      await updateOrderPayment(kotOrder._id, {
        paymentMethod: selectedPayment,
        paymentStatus: "Completed",
      });
      toast.success("Payment confirmed!");
      setStep("done");
    } catch (err) {
      toast.error(err?.message || "Unable to confirm payment");
      setCheckoutError(err?.message || "Unable to confirm payment.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Download Invoice ──
  const downloadInvoice = () => {
    const lines = [
      `Invoice: ${invoiceNumber}`,
      `Business: ${isHotelMode ? "Hotel" : "Restaurant"}`,
      `${locationLabel}: ${selectedTable}`,
      `Order Type: ${orderType}`,
      `Guest: ${guestName || "-"} | ${guestPhone || "-"}`,
      `Payment: ${selectedPayment}`,
      "",
      "Items:",
      ...cart.map(
        (item) =>
          `- ${item.name}${item.portion ? ` (${item.portion})` : ""} x${item.qty} = ₹${(item.price * item.qty).toFixed(2)}${item.notes ? ` (${item.notes})` : ""}`,
      ),
      "",
      `Subtotal: ₹${subtotal.toFixed(2)}`,
      `Discount (${discountPct}%): -₹${discount.toFixed(2)}`,
      `${taxLabel}: ₹${tax.toFixed(2)}`,
      `Total: ₹${total.toFixed(2)}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${invoiceNumber}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const applyCouponCode = () => {
    const normalized = couponCode.trim().toUpperCase();
    const couponMap = {
      SAVE5: { pct: 5, minSubtotal: 500 },
      FEST10: { pct: 10, minSubtotal: 1000 },
      COMP100: { pct: 100, minSubtotal: 0 },
    };
    const matched = couponMap[normalized];
    if (!matched) {
      toast.error("Invalid coupon code");
      setCouponError("Invalid coupon code");
      return;
    }
    if (subtotal < matched.minSubtotal) {
      toast.error(`Minimum bill ₹${matched.minSubtotal} required`);
      setCouponError(`Minimum bill ₹${matched.minSubtotal} required`);
      return;
    }
    setDiscountPct(matched.pct);
    setAppliedCoupon(normalized);
    setCouponError("");
    setCouponCode("");
    setCouponModalOpen(false);
    toast.success(`${normalized} applied successfully`);
  };

  // ─────────────────────────────────────────────
  // Step: DONE
  // ─────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-paper p-6">
        <div className="bg-white border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-lg">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-ink">Order Complete!</h2>
            <p className="text-sm text-muted mt-1">
              {locationLabel} {selectedTable} • {orderType}
            </p>
            {(guestName || guestPhone) && (
              <p className="text-sm text-muted mt-0.5">
                {guestName && <span className="font-medium">{guestName}</span>}
                {guestName && guestPhone && " · "}
                {guestPhone && <span>{guestPhone}</span>}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-paper p-4 text-left space-y-1.5">
            <div className="flex justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-muted">
                <span>Discount ({discountPct}%)</span>
                <span className="text-saffron">-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-muted">
              <span>{taxLabel}</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-ink text-lg pt-2 border-t border-border mt-1">
              <span>Total</span>
              <span className="text-saffron">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted pt-1">
              <span>Payment</span>
              <span className="font-medium">{selectedPayment}</span>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Order ID</span>
              <span className="font-medium">{invoiceNumber}</span>
            </div>
          </div>

          <button
            onClick={downloadInvoice}
            className="w-full py-3 rounded-xl border-2 border-saffron text-saffron font-bold flex items-center justify-center gap-2 hover:bg-saffron hover:text-white transition-colors"
          >
            <FileDown size={18} /> Download Invoice
          </button>

          <button
            onClick={() => {
              clearCart();
              navigate(`/${slug}/pos`, { replace: true });
            }}
            className="w-full py-2.5 rounded-xl border border-border bg-paper text-sm font-semibold text-muted hover:text-ink transition-colors"
          >
            Start New Order
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Step: PAYMENT (after KOT sent)
  // ─────────────────────────────────────────────
  if (step === "payment") {
    return (
      <div className="w-full max-w-none h-[calc(100vh-64px)] flex flex-col p-3 sm:p-4 overflow-hidden">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold">
          <span className="text-sage flex items-center gap-1">
            <CheckCircle2 size={13} /> Order Sent
          </span>
          <span className="text-muted2">›</span>
          <span className="text-saffron font-bold">Payment</span>
          <span className="text-muted2">›</span>
          <span className="text-muted2">Done</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
          {/* Order summary (read-only) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white border border-border rounded-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                <ChefHat size={14} className="text-green-600" />
              </span>
              <div>
                <p className="font-bold text-sm text-ink">
                  KOT Sent — {locationLabel} {selectedTable}
                </p>
                <p className="text-xs text-muted">
                  Order ID: {invoiceNumber} · {itemCount} items
                  {guestName ? ` · ${guestName}` : ""}
                  {guestPhone ? ` · ${guestPhone}` : ""}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {cart.map((item) => (
                <div
                  key={item.cartKey || item.id}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {item.name}
                    </p>
                    {item.portion && (
                      <p className="text-[11px] text-saffron font-semibold mt-0.5">
                        {item.portion}
                      </p>
                    )}
                    {item.portion && (
                      <p className="text-[11px] text-saffron font-semibold">
                        {item.portion}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-muted italic">{item.notes}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs text-muted">x{item.qty}</p>
                    <p className="text-sm font-bold text-ink">
                      ₹{(item.price * item.qty).toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment panel */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 space-y-5 h-full overflow-y-auto custom-scrollbar">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                  Select Payment Method
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {paymentOptions.map((method) => (
                    <button
                      key={method}
                      onClick={() => setSelectedPayment(method)}
                      className={`px-3 py-3 rounded-xl border-2 text-sm font-bold flex items-center gap-3 transition-colors ${
                        selectedPayment === method
                          ? "bg-saffron text-white border-saffron"
                          : "bg-paper text-ink border-border hover:border-saffron/50"
                      }`}
                    >
                      {method === "Cash" ? (
                        <Banknote size={18} />
                      ) : (
                        <CreditCard size={18} />
                      )}
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-border pt-4">
                <div className="flex justify-between text-sm text-muted">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-muted">
                    <span>Discount ({discountPct}%)</span>
                    <span className="text-saffron">
                      -₹{discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted">
                  <span>{taxLabel}</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-ink text-xl pt-2 border-t border-border">
                  <span className="text-base font-bold flex items-center gap-1">
                    <ReceiptText size={15} /> Total
                  </span>
                  <span className="text-saffron">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {checkoutError && (
                <p className="text-xs text-red-500">{checkoutError}</p>
              )}

              <button
                onClick={handleConfirmPayment}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-saffron hover:bg-saffron2 text-white font-bold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {selectedPayment === "Cash" ? (
                  <Banknote size={16} />
                ) : (
                  <CreditCard size={16} />
                )}
                {submitting ? "Confirming…" : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Step: REVIEW (default)
  // ─────────────────────────────────────────────
  return (
    <div className="w-full max-w-none h-[calc(100vh-64px)] min-h-0 box-border flex flex-col p-3 sm:p-4 overflow-hidden">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-4 text-xs font-semibold">
        <span className="text-saffron font-bold">Review & Guest</span>
        <span className="text-muted2">›</span>
        <span className="text-muted2">Payment</span>
        <span className="text-muted2">›</span>
        <span className="text-muted2">Done</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 h-full">
        {/* Items list */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-border rounded-2xl h-full min-h-0 flex flex-col overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => navigate(`/${slug}/pos`)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted hover:text-ink hover:bg-paper"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <h2 className="text-lg font-bold text-ink">Order Review</h2>
              <div className="text-right">
                <p className="text-sm font-semibold text-muted">
                  {locationLabel} {selectedTable} · {orderType}
                </p>
                <p className="text-xs text-muted">{itemCount} items</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {cart.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-paper border border-border flex items-center justify-center mb-2">
                  <Utensils size={24} className="text-muted2" />
                </div>
                <p className="text-sm font-semibold text-muted">
                  No items selected
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartKey || item.id}
                  className="p-3 sm:p-4 rounded-xl border border-border bg-paper"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-semibold text-ink">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {item.portion ? `${item.portion} • ` : ""}₹{item.price}{" "}
                        each
                      </p>
                      {Array.isArray(item.priceOptions) &&
                        item.priceOptions.filter((opt) => {
                          const label = String(opt?.label || "").toLowerCase();
                          return label === "full" || label === "half";
                        }).length > 1 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            {item.priceOptions
                              .filter((opt) => {
                                const label = String(
                                  opt?.label || "",
                                ).toLowerCase();
                                return label === "full" || label === "half";
                              })
                              .map((opt) => {
                                const isActive =
                                  String(item.portion || "").toLowerCase() ===
                                  String(opt.label || "").toLowerCase();
                                return (
                                  <button
                                    key={`${item.cartKey || item.id}-checkout-${opt.label}`}
                                    type="button"
                                    onClick={() =>
                                      updateItemPortion(
                                        item.cartKey || item.id,
                                        opt.label,
                                        Number(opt.price || item.price || 0),
                                      )
                                    }
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                      isActive
                                        ? "bg-saffron-lt text-saffron border-saffron/50"
                                        : "bg-white text-muted border-border"
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                          </div>
                        )}
                      <input
                        value={item.notes || ""}
                        onChange={(e) =>
                          setItemNotes(item.cartKey || item.id, e.target.value)
                        }
                        placeholder="Add note"
                        className="mt-2.5 w-full text-xs sm:text-sm border border-border rounded-md px-3 py-1.5 bg-white"
                      />
                    </div>
                    <div className="sm:min-w-45">
                      <p className="text-base font-bold text-ink text-left sm:text-right">
                        ₹{(item.qty * item.price).toFixed(2)}
                      </p>
                      <div className="mt-2 flex items-center sm:justify-end gap-2">
                        <button
                          onClick={() => updateQty(item.cartKey || item.id, -1)}
                          className="h-8 w-8 rounded-md border border-border text-sm font-bold text-muted hover:text-ink"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-ink">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.cartKey || item.id, 1)}
                          className="h-8 w-8 rounded-md border border-border text-sm font-bold text-muted hover:text-ink"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.cartKey || item.id)}
                          className="h-8 w-8 rounded-md text-red-500 hover:bg-red-50 flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel: guest + offers + send to KOT */}
        <div className="lg:col-span-5 xl:col-span-4 min-h-0">
          <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 space-y-5 h-full overflow-y-auto custom-scrollbar">
            {/* Guest Info */}
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Guest Info
              </p>
              <div className="space-y-2">
                {/* Phone — required */}
                <div className="relative">
                  <Phone
                    size={14}
                    className="absolute left-3 top-2.5 text-muted2"
                  />
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => {
                      const raw = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setGuestPhone(raw);
                      if (raw.length < 10) {
                        setGuestName("");
                        setGuestLookupState("idle");
                      }
                    }}
                    placeholder="Phone number *"
                    maxLength={10}
                    className={`w-full pl-8 pr-8 py-2 text-sm border rounded-lg bg-paper focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron ${
                      guestPhone.replace(/\D/g, "").length === 10
                        ? "border-sage"
                        : "border-border"
                    }`}
                  />
                  {guestLookupState === "loading" && (
                    <Loader2
                      size={15}
                      className="absolute right-3 top-2.5 text-muted2 animate-spin"
                    />
                  )}
                  {guestLookupState === "found" && (
                    <UserCheck
                      size={15}
                      className="absolute right-3 top-2.5 text-sage"
                    />
                  )}
                  {guestLookupState === "new" && (
                    <UserPlus
                      size={15}
                      className="absolute right-3 top-2.5 text-saffron"
                    />
                  )}
                </div>

                {/* Name — shows once phone is 10 digits */}
                {(guestLookupState === "found" ||
                  guestLookupState === "new") && (
                  <div className="relative">
                    <User
                      size={14}
                      className="absolute left-3 top-2.5 text-muted2"
                    />
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={
                        guestLookupState === "new"
                          ? "Guest name (new customer)"
                          : "Guest name"
                      }
                      autoFocus={guestLookupState === "new"}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-paper focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron"
                    />
                    {guestLookupState === "found" && (
                      <p className="text-[10px] text-sage mt-0.5 pl-1 flex items-center gap-1">
                        <UserCheck size={10} /> Returning customer
                      </p>
                    )}
                    {guestLookupState === "new" && (
                      <p className="text-[10px] text-saffron mt-0.5 pl-1 flex items-center gap-1">
                        <UserPlus size={10} /> New customer — enter name
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Offers */}
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Offers
              </p>
              <button
                onClick={() => setCouponModalOpen(true)}
                className="mt-2 w-full py-2 rounded-lg border border-border text-sm font-semibold text-muted hover:text-ink hover:bg-paper flex items-center justify-center gap-2"
              >
                <TicketPercent size={15} /> Apply Coupon
              </button>
              {appliedCoupon && (
                <p className="text-xs text-sage mt-1.5">
                  Applied: {appliedCoupon}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {offerOptions.map((offer) => {
                  const eligible = subtotal >= offer.minSubtotal;
                  return (
                    <button
                      key={offer.pct}
                      onClick={() => setDiscountPct(offer.pct)}
                      disabled={!eligible && offer.pct !== 0}
                      className={`text-left px-2.5 py-2.5 rounded-lg border transition-colors ${
                        discountPct === offer.pct
                          ? "bg-saffron text-white border-saffron"
                          : "bg-paper text-muted border-border"
                      } disabled:opacity-50`}
                    >
                      <p className="font-semibold text-xs sm:text-sm">
                        {offer.title}
                      </p>
                      <p className="text-xs">
                        {offer.pct === 0 ? "No discount" : `${offer.pct}% off`}
                      </p>
                      {offer.minSubtotal > 0 && (
                        <p className="text-[10px]">Min ₹{offer.minSubtotal}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bill summary */}
            <div className="space-y-1.5 border-t border-border pt-4">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-muted">
                  <span>Discount ({discountPct}%)</span>
                  <span className="text-saffron">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-muted">
                <span>{taxLabel}</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-ink text-xl pt-2 border-t border-border">
                <span className="text-base font-bold flex items-center gap-1">
                  <ReceiptText size={15} /> Total
                </span>
                <span className="text-saffron">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {checkoutError && (
              <p className="text-xs text-red-500">{checkoutError}</p>
            )}

            {/* Send to KOT */}
            <button
              onClick={handleSendToKOT}
              disabled={!cart.length || submitting}
              className="w-full py-3 rounded-xl bg-saffron hover:bg-saffron2 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              <ChefHat size={18} />
              {submitting ? "Sending to Kitchen…" : "Send to KOT"}
            </button>
          </div>
        </div>
      </div>

      {/* Coupon modal */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-xl">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">Apply Coupon</h3>
              <button
                onClick={() => setCouponModalOpen(false)}
                className="p-1.5 rounded-md text-muted hover:bg-paper"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  if (couponError) setCouponError("");
                }}
                placeholder="Enter coupon code (e.g. SAVE5)"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm"
              />
              {couponError && (
                <p className="text-xs text-red-500">{couponError}</p>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted bg-paper border border-border rounded-lg p-2">
                <p>SAVE5 (min ₹500)</p>
                <p>FEST10 (min ₹1000)</p>
                <p className="col-span-2">COMP100 (no minimum)</p>
              </div>
              <button
                onClick={applyCouponCode}
                className="w-full py-2.5 rounded-lg bg-saffron hover:bg-saffron2 text-white font-bold"
              >
                Apply Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  FileDown,
  ReceiptText,
  TicketPercent,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { usePosStore } from "../features/pos/store/usePosStore";
import { useAuth } from "../context/AuthContext";
import { createPosOrder } from "../services/api";

export default function PosCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessType } = useAuth();
  const isHotelMode = businessType === "hotel";

  const {
    cart,
    discountPct,
    setDiscountPct,
    setItemNotes,
    updateQty,
    removeItem,
    clearCart,
    getTotals,
  } = usePosStore();

  const [selectedPayment, setSelectedPayment] = useState("Card/UPI");
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const selectedTable =
    location.state?.selectedTable || (isHotelMode ? "101" : "01");
  const locationLabel =
    location.state?.locationLabel || (isHotelMode ? "Room" : "Table");
  const orderType =
    location.state?.orderType || (isHotelMode ? "Room Service" : "Dine-in");

  const { subtotal, discount, tax, total, itemCount } = getTotals();

  const offerOptions = [
    { pct: 0, title: "No Offer", minSubtotal: 0 },
    { pct: 5, title: "Saver 5%", minSubtotal: 500 },
    { pct: 10, title: "Festival 10%", minSubtotal: 1000 },
    { pct: 100, title: "Comped", minSubtotal: 0 },
  ];

  const invoiceNumber = useMemo(() => {
    const seed = `${locationLabel}-${selectedTable}-${orderType}-${cart.map((item) => `${item.id}:${item.qty}:${item.notes || ""}`).join("|")}-${subtotal.toFixed(2)}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) % 1000000;
    }
    return `INV-${String(hash).padStart(6, "0")}`;
  }, [cart, locationLabel, orderType, selectedTable, subtotal]);

  const downloadInvoice = () => {
    const lines = [
      `Invoice: ${invoiceNumber}`,
      `Business: ${isHotelMode ? "Hotel" : "Restaurant"}`,
      `${locationLabel}: ${selectedTable}`,
      `Order Type: ${orderType}`,
      `Payment: ${selectedPayment}`,
      "",
      "Items:",
      ...cart.map(
        (item) =>
          `- ${item.name} x${item.qty} = ₹${(item.price * item.qty).toFixed(2)}${item.notes ? ` (${item.notes})` : ""}`,
      ),
      "",
      `Subtotal: ₹${subtotal.toFixed(2)}`,
      `Discount (${discountPct}%): -₹${discount.toFixed(2)}`,
      `Tax (5% GST): ₹${tax.toFixed(2)}`,
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

  const paymentOptions = isHotelMode
    ? ["Cash", "Card/UPI", "Room Charge"]
    : ["Cash", "Card/UPI"];

  const handlePayAndGenerate = async () => {
    if (!cart.length) return;
    if (submittingOrder) return;

    try {
      setSubmittingOrder(true);
      setCheckoutError("");

      await createPosOrder({
        tableId: isHotelMode
          ? undefined
          : `T-${String(selectedTable).padStart(2, "0")}`,
        roomId: isHotelMode ? String(selectedTable) : undefined,
        orderType,
        source: "POS",
        discountPct,
        paymentMethod: selectedPayment,
        items: cart.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          quantity: item.qty,
          price: item.price,
          notes: item.notes,
          modifiers: item.modifiers,
        })),
      });

      downloadInvoice();
      toast.success("Order placed and invoice generated");
      clearCart();
      navigate("/pos", { replace: true });
    } catch (error) {
      toast.error(error?.message || "Unable to place order");
      setCheckoutError(
        error?.message || "Unable to place order. Please try again.",
      );
    } finally {
      setSubmittingOrder(false);
    }
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

  return (
    <div className="w-full max-w-none h-[calc(100vh-64px)] min-h-0 box-border flex flex-col p-3 sm:p-4 lg:p-4 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 h-full">
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-border rounded-2xl h-full min-h-0 flex flex-col overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => navigate("/pos")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted hover:text-ink hover:bg-paper"
              >
                <ArrowLeft size={16} /> Back to POS
              </button>
              <h2 className="text-lg font-bold text-ink">
                Checkout Item Preview
              </h2>
              <div className="text-right">
                <p className="text-sm font-semibold text-muted">
                  {locationLabel} {selectedTable} • {orderType}
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
                  key={item.id}
                  className="p-3 sm:p-4 rounded-xl border border-border bg-paper"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-semibold text-ink">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        ₹{item.price} each
                      </p>
                      <input
                        value={item.notes || ""}
                        onChange={(event) =>
                          setItemNotes(item.id, event.target.value)
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
                          onClick={() => updateQty(item.id, -1)}
                          className="h-8 w-8 rounded-md border border-border text-sm font-bold text-muted hover:text-ink"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-ink">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="h-8 w-8 rounded-md border border-border text-sm font-bold text-muted hover:text-ink"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
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

        <div className="lg:col-span-5 xl:col-span-4 min-h-0">
          <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 space-y-5 h-full overflow-y-auto custom-scrollbar">
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
              {appliedCoupon ? (
                <p className="text-xs text-sage mt-1.5">
                  Applied coupon: {appliedCoupon}
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {offerOptions.map((offer) => {
                  const eligible = subtotal >= offer.minSubtotal;
                  return (
                    <button
                      key={offer.pct}
                      onClick={() => setDiscountPct(offer.pct)}
                      disabled={!eligible && offer.pct !== 0}
                      className={`text-left px-2.5 py-2.5 rounded-lg border transition-colors ${discountPct === offer.pct ? "bg-saffron text-white border-saffron" : "bg-paper text-muted border-border"} disabled:opacity-50`}
                    >
                      <p className="font-semibold text-xs sm:text-sm">
                        {offer.title}
                      </p>
                      <p className="text-xs">
                        {offer.pct === 0 ? "No discount" : `${offer.pct}% off`}
                      </p>
                      {offer.minSubtotal > 0 ? (
                        <p className="text-[10px]">Min ₹{offer.minSubtotal}</p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Payment
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {paymentOptions.map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedPayment(method)}
                    className={`px-2.5 py-2.5 rounded-lg border text-sm font-semibold ${selectedPayment === method ? "bg-saffron text-white border-saffron" : "bg-paper text-muted border-border"}`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>Discount ({discountPct}%)</span>
                <span className="text-saffron">-₹{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>Tax (5% GST)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-ink pt-2 border-t border-border">
                <span className="text-base font-bold flex items-center gap-1">
                  <ReceiptText size={15} /> Total
                </span>
                <span className="text-saffron">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {checkoutError ? (
                <p className="text-xs text-red-500">{checkoutError}</p>
              ) : null}
              <button
                onClick={downloadInvoice}
                disabled={!cart.length}
                className="py-2.5 rounded-xl border border-border text-muted font-semibold hover:text-ink disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FileDown size={16} /> Download Invoice
              </button>
              <button
                onClick={handlePayAndGenerate}
                disabled={!cart.length || submittingOrder}
                className="py-3 rounded-xl bg-saffron hover:bg-saffron2 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {selectedPayment === "Cash" ? (
                  <Banknote size={16} />
                ) : (
                  <CreditCard size={16} />
                )}
                {submittingOrder
                  ? "Placing Order..."
                  : "Pay & Generate Invoice"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {couponModalOpen ? (
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
                onChange={(event) => {
                  setCouponCode(event.target.value);
                  if (couponError) setCouponError("");
                }}
                placeholder="Enter coupon code (e.g. SAVE5)"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm"
              />
              {couponError ? (
                <p className="text-xs text-red-500">{couponError}</p>
              ) : null}
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
      ) : null}
    </div>
  );
}

import { useEffect, useState } from "react";
import { ClipboardList, Flame, BellRing, Receipt } from "lucide-react";
import { fetchGuestOrders } from "../../services/api";

const ACTIVE_STATUSES = ["Pending", "Preparing", "Ready"];
const POLL_INTERVAL = 8000;

// Per-status config
const STATUS_CONFIG = {
  Pending: {
    label: "Order Received",
    sublabel: "Sent to kitchen",
    Icon: ClipboardList,
    accentBar: "linear-gradient(90deg,#e8720c,#f4a84a)",
    iconBg: "#fff7ed",
    iconColor: "#e8720c",
    pulse: true,
  },
  Preparing: {
    label: "Being Prepared",
    sublabel: "Chef is cooking your order",
    Icon: Flame,
    accentBar: "linear-gradient(90deg,#e8720c,#f4a84a)",
    iconBg: "#fff7ed",
    iconColor: "#e8720c",
    pulse: true,
  },
  Ready: {
    label: "Ready to Serve",
    sublabel: "Your order is at the counter",
    Icon: BellRing,
    accentBar: "linear-gradient(90deg,#3a6348,#5a9e72)",
    iconBg: "#edf7f2",
    iconColor: "#3a6348",
    pulse: true,
  },
  Served: {
    label: "Invoice Ready",
    sublabel: "",
    Icon: Receipt,
    accentBar: "linear-gradient(90deg,#e8720c,#f4a84a)",
    iconBg: "#fff7ed",
    iconColor: "#e8720c",
    pulse: false,
  },
};

function isPayableOrder(order) {
  return order?.status === "Served" && order?.paymentStatus !== "Completed";
}

function stripHash(id) {
  return String(id || "").replace(/^#+/, "");
}

export default function ActiveOrderBanner({
  phone,
  businessId,
  onPayInvoice,
  onOpenOrder,
}) {
  const [orders, setOrders] = useState([]);
  const [visible, setVisible] = useState(false);

  const normalized = String(phone || "")
    .replace(/\D/g, "")
    .slice(-10);

  async function poll() {
    if (normalized.length < 10 || !businessId) return;
    try {
      const { orders: fetched = [] } = await fetchGuestOrders(
        normalized,
        businessId,
      );
      const visibleOrders = fetched
        .filter(
          (order) =>
            ACTIVE_STATUSES.includes(order?.status) || isPayableOrder(order),
        )
        .sort((a, b) => Number(isPayableOrder(b)) - Number(isPayableOrder(a)));
      setOrders(visibleOrders);
      setVisible(visibleOrders.length > 0);
    } catch {
      // silent
    }
  }

  useEffect(() => {
    if (normalized.length < 10 || !businessId) return;
    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized, businessId]);

  if (!visible || orders.length === 0) return null;

  const topOrder = orders[0];
  const isPayable = isPayableOrder(topOrder);
  const cfg = STATUS_CONFIG[topOrder.status] || STATUS_CONFIG.Pending;
  const { Icon } = cfg;

  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          animation: "slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
          background: "#fff",
          border: "1.5px solid #f0e6da",
          boxShadow:
            "0 8px 32px rgba(232,114,12,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* Coloured top accent bar */}
        <div className="h-[3px] w-full" style={{ background: cfg.accentBar }} />

        <div className="px-4 pt-3 pb-3">
          {/* Row 1: icon + text + CTA */}
          <div className="flex items-center gap-3">
            {/* Status icon */}
            <div
              className="relative shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: cfg.iconBg }}
            >
              {cfg.pulse && (
                <span
                  className="absolute inset-0 rounded-xl animate-ping opacity-20"
                  style={{ background: cfg.iconColor }}
                />
              )}
              <Icon size={18} style={{ color: cfg.iconColor }} />
            </div>

            {/* Labels */}
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5"
                style={{ color: cfg.iconColor }}
              >
                {cfg.label}
              </p>
              <p className="font-bold text-[14px] leading-tight text-[#0f0e0b]">
                #{stripHash(topOrder.orderId)}
                {topOrder.tableId && (
                  <span className="ml-1.5 font-normal text-[12px] text-[#857c6e]">
                    · Table {topOrder.tableId.replace(/^T-0?/, "")}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-[#857c6e] mt-0.5 leading-none">
                {cfg.sublabel}
              </p>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isPayable ? (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenOrder?.(topOrder)}
                    className="rounded-xl px-4 py-2.5 text-[13px] font-bold transition"
                    style={{ background: "#f5f0e8", color: "#0f0e0b" }}
                  >
                    Status
                  </button>
                  <button
                    type="button"
                    onClick={() => onPayInvoice?.(topOrder)}
                    className="rounded-xl px-4 py-2.5 text-[13px] font-bold transition hover:brightness-95"
                    style={{ background: "#e8720c", color: "#fff" }}
                  >
                    Pay
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenOrder?.(topOrder)}
                  className="rounded-xl px-3 py-2 text-[11px] font-bold transition hover:brightness-95"
                  style={{ background: "#e8720c", color: "#fff" }}
                >
                  Track
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

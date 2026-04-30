import { useEffect, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { fetchGuestOrders } from "../../services/api";

const ACTIVE_STATUSES = ["Pending", "Preparing", "Ready"];
const POLL_INTERVAL = 8000;

const THEME = {
  progress: {
    bg: "#30473d",
    glow: "rgba(232, 167, 86, 0.28)",
    ring: "#f4dfb7",
    surface: "rgba(255, 248, 239, 0.12)",
    surfaceStrong: "rgba(255, 248, 239, 0.16)",
    text: "#fffaf4",
    muted: "rgba(255, 250, 244, 0.72)",
    line: "rgba(255, 248, 239, 0.18)",
  },
  payable: {
    bg: "#1f2522",
    glow: "rgba(255, 194, 92, 0.3)",
    ring: "#ffc25c",
    surface: "rgba(255, 248, 239, 0.1)",
    surfaceStrong: "#fffaf4",
    text: "#fffaf4",
    muted: "rgba(255, 250, 244, 0.72)",
    soft: "rgba(255, 250, 244, 0.48)",
    line: "rgba(255, 248, 239, 0.16)",
    ctaBg: "#ffc25c",
    ctaText: "#1f2522",
  },
};

function isPayableOrder(order) {
  return order?.status === "Served" && order?.paymentStatus !== "Completed";
}

function stripHash(id) {
  return String(id || "").replace(/^#+/, "");
}

export default function ActiveOrderBanner({ phone, businessId, onPayInvoice }) {
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
  const theme = isPayable ? THEME.payable : THEME.progress;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(36,32,24,0.18)]"
        style={{
          animation: "slideUp 0.25s ease",
          background: theme.bg,
        }}
      >
        <div className="px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center shrink-0">
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ background: theme.glow }}
              />
              <span
                className="relative w-8 h-8 rounded-full flex items-center justify-center bg-white/20"
                style={{
                  background:
                    theme.surfaceStrong === "#fffaf4"
                      ? "rgba(255, 248, 239, 0.14)"
                      : theme.surfaceStrong,
                }}
              >
                <UtensilsCrossed size={14} style={{ color: theme.text }} />
              </span>
            </div>

            <div className="flex-1 text-left min-w-0">
              <p
                className="text-[9px] font-bold uppercase tracking-wide leading-none mb-0.5"
                style={{ color: theme.muted }}
              >
                {isPayable ? "Invoice ready" : "Order in progress"}
              </p>
              <p
                className="font-bold text-[13px] leading-none"
                style={{ color: theme.text }}
              >
                #{stripHash(topOrder.orderId)}
                {topOrder.tableId && (
                  <span
                    className="ml-1.5 font-normal text-[11px]"
                    style={{ color: theme.muted }}
                  >
                    · Table {topOrder.tableId.replace(/^T-0?/, "")}
                  </span>
                )}
              </p>
            </div>
          </div>

          {isPayable ? (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPayInvoice?.()}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold shadow-sm transition hover:brightness-95"
                style={{ background: theme.ctaBg, color: theme.ctaText }}
              >
                Pay Invoice
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

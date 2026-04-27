import { CheckCircle2 } from "lucide-react";

/**
 * OrderStatusBadge — renders a coloured status pill for order status values.
 * Supports: Preparing | Ready | Served | Cancelled | Dispatch
 */
const STATUS_CONFIG = {
  Preparing: { cls: "bg-warning/20 text-ink" },
  Ready: { cls: "bg-saffron-lt text-saffron" },
  Served: { cls: "bg-sage-lt text-sage", icon: CheckCircle2 },
  Dispatch: { cls: "bg-info/15 text-info" },
  Cancelled: { cls: "bg-error/15 text-error" },
  // lowercase aliases used by the live-feed
  preparing: { cls: "bg-saffron-lt text-saffron" },
  ready: { cls: "bg-saffron text-white shadow-sm" },
  served: { cls: "bg-sage-lt text-sage", icon: CheckCircle2 },
};

export default function OrderStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { cls: "bg-cream text-ink" };
  const Icon = config.icon ?? null;
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 w-fit ${config.cls}`}
    >
      {Icon && <Icon size={12} />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

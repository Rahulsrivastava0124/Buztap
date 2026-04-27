import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * KpiCard — a dashboard KPI card with optional trend indicator.
 * Props: title, value, change (string e.g. "+14.5%"), isPositive (bool), extraIcon (LucideIcon)
 */
export default function KpiCard({
  title,
  value,
  change,
  isPositive,
  extraIcon: Icon,
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex flex-col justify-between hover:border-cream2 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">
          {title}
        </p>
        {Icon && <Icon size={16} className="text-muted2" />}
      </div>
      <div className="flex items-end justify-between mt-1">
        <p className="font-roboto text-3xl font-black text-ink tracking-tight">
          {value}
        </p>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-0.5 ${isPositive ? "bg-sage-lt text-sage" : "bg-red-50 text-red-600"}`}
          >
            {isPositive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}{" "}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

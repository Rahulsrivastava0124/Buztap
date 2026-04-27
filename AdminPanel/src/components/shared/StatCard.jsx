/**
 * StatCard — a compact KPI tile used across Orders, Staff, Tables, and Inventory pages.
 * Props: title (string), value (string), icon (LucideIcon component)
 */
export default function StatCard({ title, value, icon: Icon }) {
  const IconComponent = Icon;
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase font-bold tracking-wide text-muted">
          {title}
        </p>
        <IconComponent size={16} className="text-muted2" />
      </div>
      <p className="text-3xl font-roboto font-black mt-3 text-ink">{value}</p>
    </div>
  );
}

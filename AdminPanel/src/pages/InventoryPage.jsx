import { AlertTriangle, Boxes, ShoppingCart, Warehouse } from "lucide-react";

const STOCK = [
  { item: "Paneer", unit: "kg", inStock: 18, reorderAt: 8, status: "Healthy" },
  { item: "Chicken", unit: "kg", inStock: 9, reorderAt: 10, status: "Low" },
  { item: "Rice", unit: "kg", inStock: 52, reorderAt: 20, status: "Healthy" },
  { item: "Cooking Oil", unit: "L", inStock: 7, reorderAt: 8, status: "Low" },
];

function Stat(props) {
  const Icon = props.icon;
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-muted">
          {props.title}
        </span>
        <Icon size={16} className="text-muted2" />
      </div>
      <p className="text-3xl font-roboto font-black mt-3 text-ink">
        {props.value}
      </p>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat title="SKUs" value="124" icon={Boxes} />
        <Stat title="Low Stock" value="17" icon={AlertTriangle} />
        <Stat title="Today's Usage" value="32" icon={Warehouse} />
        <Stat title="Pending PO" value="4" icon={ShoppingCart} />
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-bold text-ink">Stock Levels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper text-muted uppercase text-xs">
              <tr>
                <th className="text-left py-3 px-5">Item</th>
                <th className="text-left py-3 px-5">Unit</th>
                <th className="text-right py-3 px-5">In Stock</th>
                <th className="text-right py-3 px-5">Reorder At</th>
                <th className="text-left py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {STOCK.map((row) => (
                <tr key={row.item} className="border-t border-cream">
                  <td className="py-3 px-5 font-semibold text-ink">
                    {row.item}
                  </td>
                  <td className="py-3 px-5">{row.unit}</td>
                  <td className="py-3 px-5 text-right">{row.inStock}</td>
                  <td className="py-3 px-5 text-right">{row.reorderAt}</td>
                  <td className="py-3 px-5">
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-semibold ${row.status === "Low" ? "bg-error/15 text-error" : "bg-sage-lt text-sage"}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

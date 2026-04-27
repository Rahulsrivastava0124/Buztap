import { AlertTriangle, Boxes, ShoppingCart, Warehouse } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchInventory } from "../services/api";
import StatCard from "../components/shared/StatCard";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import PageShell from "../components/layout/PageShell";

export default function InventoryPage() {
  const {
    data: stock = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
    refetchInterval: 30_000,
  });

  const lowStock = stock.filter((row) => row.status !== "Healthy").length;
  const usage = stock.reduce((acc, row) => acc + row.reorderAt, 0);

  return (
    <PageShell>
      <ErrorBoundary label="Inventory">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="SKUs" value={String(stock.length)} icon={Boxes} />
          <StatCard
            title="Low Stock"
            value={String(lowStock)}
            icon={AlertTriangle}
          />
          <StatCard
            title="Today's Usage"
            value={String(usage)}
            icon={Warehouse}
          />
          <StatCard
            title="Pending PO"
            value={String(lowStock)}
            icon={ShoppingCart}
          />
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-bold text-ink">Stock Levels</h2>
          </div>
          {isLoading ? (
            <div className="px-5 py-10 text-sm text-muted">
              Loading inventory...
            </div>
          ) : null}
          {isError ? (
            <div className="px-5 py-6 flex items-center justify-between gap-4">
              <p className="text-sm text-error">
                {error?.message || "Failed to load inventory."}
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-paper"
              >
                Retry
              </button>
            </div>
          ) : null}
          {!isLoading && !isError && stock.length === 0 ? (
            <div className="px-5 py-10 text-sm text-muted">
              No inventory items found.
            </div>
          ) : null}
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
                {stock.map((row) => (
                  <tr key={row.id} className="border-t border-cream">
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
      </ErrorBoundary>
    </PageShell>
  );
}

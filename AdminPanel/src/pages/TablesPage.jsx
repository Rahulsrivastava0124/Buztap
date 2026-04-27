import { useMemo, useState } from "react";
import {
  Armchair,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Printer,
  QrCode,
  Sparkles,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchTableQr, fetchTables, updateTableStatus } from "../services/api";
import StatCard from "../components/shared/StatCard";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import PageShell from "../components/layout/PageShell";

const COLORS = {
  Occupied: "border-warning bg-warning/10 text-ink",
  Free: "border-sage bg-sage-lt text-sage",
  Reserved: "border-saffron bg-saffron-lt text-saffron",
  Cleaning: "border-muted2 bg-base-200 text-muted",
};

function Kpi(props) {
  return <StatCard {...props} />;
}

export default function TablesPage() {
  const queryClient = useQueryClient();
  const {
    data: tables = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
    refetchInterval: 20_000,
  });

  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedTableId, setSelectedTableId] = useState("T-01");
  const [qrData, setQrData] = useState(null);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const qrImageUrl = qrData?.menuUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
        qrData.menuUrl,
      )}`
    : "";

  const tableMutation = useMutation({
    mutationFn: ({ tableId, status }) => updateTableStatus(tableId, status),
    onMutate: async ({ tableId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tables"] });
      const previous = queryClient.getQueryData(["tables"]);
      queryClient.setQueryData(["tables"], (old = []) =>
        old.map((t) => (t.id === tableId ? { ...t, status } : t)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(["tables"], context.previous);
      toast.error("Unable to update table status");
    },
    onSuccess: (table) => {
      toast.success(`${table.id} marked ${table.status}`);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tables"] }),
  });

  const selectedTable =
    tables.find((t) => t.id === selectedTableId) ?? tables[0] ?? null;
  const filteredTables = useMemo(() => {
    if (activeFilter === "All") return tables;
    return tables.filter((table) => table.status === activeFilter);
  }, [activeFilter, tables]);

  const occupiedCount = tables.filter((t) => t.status === "Occupied").length;
  const freeCount = tables.filter((t) => t.status === "Free").length;
  const reservedCount = tables.filter((t) => t.status === "Reserved").length;
  const cleaningCount = tables.filter((t) => t.status === "Cleaning").length;

  const cycleTableStatus = () => {
    if (!selectedTable) return;

    const next =
      selectedTable.status === "Free"
        ? "Reserved"
        : selectedTable.status === "Reserved"
          ? "Occupied"
          : selectedTable.status === "Occupied"
            ? "Cleaning"
            : "Free";

    tableMutation.mutate({ tableId: selectedTable.id, status: next });
  };

  const openQrSheet = async () => {
    if (!selectedTable) return;

    try {
      const data = await fetchTableQr(selectedTable.id);
      setQrData(data);
      setIsQrOpen(true);
    } catch (err) {
      toast.error(err?.message || "Unable to generate table QR");
    }
  };

  const printQrSheet = () => {
    if (!qrData || !qrImageUrl) return;

    const popup = window.open("", "_blank", "width=760,height=840");
    if (!popup) {
      toast.error("Please allow popups to print QR");
      return;
    }

    const title = `${qrData.businessName || "BuzTap"} - ${qrData.table?.label || qrData.tableId}`;
    popup.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 24px; text-align: center; color: #222; }
            .card { border: 1px solid #ddd; border-radius: 16px; padding: 24px; max-width: 520px; margin: 0 auto; }
            h1 { margin: 0 0 6px; font-size: 24px; }
            p { margin: 4px 0; color: #555; }
            img { width: 320px; height: 320px; margin: 16px auto; display: block; }
            .url { word-break: break-all; font-size: 12px; color: #666; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${qrData.businessName || "BuzTap"}</h1>
            <p><strong>${qrData.table?.label || qrData.tableId}</strong></p>
            <p>Seats: ${qrData.table?.seats ?? "-"}</p>
            <img src="${qrImageUrl}" alt="Table QR" />
            <p>Scan to view menu and place order</p>
            <p class="url">${qrData.menuUrl}</p>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    popup.document.close();
  };

  return (
    <PageShell>
      <ErrorBoundary label="Tables">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Kpi
            title="Total Tables"
            value={String(tables.length)}
            icon={Armchair}
          />
          <Kpi title="Occupied" value={String(occupiedCount)} icon={Clock3} />
          <Kpi title="Free" value={String(freeCount)} icon={CheckCircle2} />
          <Kpi
            title="Reserved / Cleaning"
            value={`${reservedCount} / ${cleaningCount}`}
            icon={DoorOpen}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h2 className="font-bold text-ink">Floor Map Snapshot</h2>
              <div className="flex items-center gap-2">
                {["All", "Occupied", "Free", "Reserved", "Cleaning"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setActiveFilter(status)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${activeFilter === status ? "bg-saffron text-white border-saffron" : "bg-paper text-muted border-border"}`}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>
            </div>

            {isLoading ? (
              <p className="text-sm text-muted mb-3">Loading tables...</p>
            ) : null}
            {isError ? (
              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="text-sm text-error">
                  {error?.message || "Failed to load tables."}
                </p>
                <button
                  onClick={() => refetch()}
                  className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-paper"
                >
                  Retry
                </button>
              </div>
            ) : null}
            {!isLoading && !isError && filteredTables.length === 0 ? (
              <p className="text-sm text-muted mb-3">
                No tables match the selected filter.
              </p>
            ) : null}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  className={`rounded-xl border p-3 text-left transition-colors ${COLORS[table.status]} ${selectedTableId === table.id ? "ring-2 ring-saffron" : ""}`}
                >
                  <p className="font-bold text-sm">{table.id}</p>
                  <p className="text-xs opacity-80 mt-1">{table.seats} seats</p>
                  <p className="text-xs mt-2 font-semibold">{table.status}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="font-bold text-ink">Table Actions</h3>
            <p className="text-xs text-muted mt-1">
              Update reservation or occupancy state in one click.
            </p>

            <div className="mt-4 p-4 rounded-lg border border-cream bg-paper">
              <p className="text-sm font-semibold text-ink">
                {selectedTable?.id ?? "-"}
              </p>
              <p className="text-xs text-muted mt-1">
                {selectedTable?.seats ?? 0} seats
              </p>
              <p className="text-xs mt-3">
                Status:{" "}
                <span className="font-bold text-saffron">
                  {selectedTable?.status ?? "-"}
                </span>
              </p>
              <p className="text-xs mt-1 text-muted">
                Guest: {selectedTable?.guestName || "-"}
              </p>
            </div>

            <button
              onClick={cycleTableStatus}
              disabled={tableMutation.isPending || !selectedTable}
              className="w-full mt-4 bg-saffron hover:bg-saffron2 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              {tableMutation.isPending ? "Updating..." : "Cycle Status"}
            </button>

            <button
              onClick={openQrSheet}
              disabled={!selectedTable}
              className="w-full mt-3 border border-border hover:bg-paper text-ink rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              <QrCode size={16} />
              Generate Table QR
            </button>

            <div className="mt-4 text-xs text-muted space-y-1">
              <p>Free → Reserved → Occupied → Cleaning → Free</p>
              <p>Optimistic UI enabled for quick floor operations.</p>
            </div>
          </div>
        </div>

        {isQrOpen && qrData ? (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white border border-border shadow-[0_16px_50px_rgba(15,14,11,0.2)] p-5">
              <h3 className="text-lg font-bold text-ink">Table QR Ready</h3>
              <p className="text-xs text-muted mt-1">
                {qrData.businessName || "BuzTap"} •{" "}
                {qrData.table?.label || qrData.tableId}
              </p>

              <div className="mt-4 rounded-xl border border-border bg-paper p-4 flex justify-center">
                <img
                  src={qrImageUrl}
                  alt={`QR for ${qrData.table?.label || qrData.tableId}`}
                  className="w-56 h-56 object-contain"
                />
              </div>

              <p className="mt-3 text-[11px] text-muted break-all">
                {qrData.menuUrl}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={printQrSheet}
                  className="flex-1 bg-saffron hover:bg-saffron2 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Printer size={15} /> Print QR
                </button>
                <button
                  onClick={() => setIsQrOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-paper"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </ErrorBoundary>
    </PageShell>
  );
}

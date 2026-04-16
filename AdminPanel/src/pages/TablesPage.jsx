import { useMemo, useState } from "react";
import {
  Armchair,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Sparkles,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTables, updateTableStatus } from "../services/api";

const COLORS = {
  Occupied: "border-warning bg-warning/10 text-ink",
  Free: "border-sage bg-sage-lt text-sage",
  Reserved: "border-saffron bg-saffron-lt text-saffron",
  Cleaning: "border-muted2 bg-base-200 text-muted",
};

function Kpi(props) {
  const Icon = props.icon;
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wide text-muted">
          {props.title}
        </span>
        <Icon size={16} className="text-muted2" />
      </div>
      <p className="text-3xl font-roboto font-black mt-3">{props.value}</p>
    </div>
  );
}

export default function TablesPage() {
  const queryClient = useQueryClient();
  const { data: tables = [] } = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
    refetchInterval: 20_000,
  });

  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedTableId, setSelectedTableId] = useState("T-01");

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
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
            className="w-full mt-4 bg-saffron hover:bg-saffron2 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2"
          >
            <Sparkles size={16} /> Cycle Status
          </button>

          <div className="mt-4 text-xs text-muted space-y-1">
            <p>Free → Reserved → Occupied → Cleaning → Free</p>
            <p>Optimistic UI enabled for quick floor operations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

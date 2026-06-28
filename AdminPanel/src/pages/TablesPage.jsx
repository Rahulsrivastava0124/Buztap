import { useState, useMemo } from "react";
import { Armchair, Plus, Trash2, Edit2, Sparkles, X, MapPin } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchTables, createTable, deleteTable, updateTableArea } from "../services/api";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import PageShell from "../components/layout/PageShell";

export default function TablesPage() {
  const queryClient = useQueryClient();
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ tableId: "", seats: 4, area: "Main Floor", customArea: "" });
  const [isCustomArea, setIsCustomArea] = useState(false);

  const createMutation = useMutation({
    mutationFn: createTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table created successfully");
      setIsAddOpen(false);
      setFormData({ tableId: "", seats: 4, area: "Main Floor", customArea: "" });
      setIsCustomArea(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create table");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table deleted");
    },
    onError: () => toast.error("Failed to delete table"),
  });

  const areaMutation = useMutation({
    mutationFn: ({ tableId, area }) => updateTableArea(tableId, area),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table area updated");
    },
    onError: () => toast.error("Failed to update area"),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.tableId.trim()) return toast.error("Table ID is required");
    
    const finalArea = isCustomArea ? formData.customArea.trim() : formData.area;
    if (!finalArea) return toast.error("Area is required");

    createMutation.mutate({
      ...formData,
      area: finalArea,
    });
  };

  const areas = useMemo(() => {
    const map = new Map();
    for (const t of tables) {
      const area = t.area || "Main Floor";
      if (!map.has(area)) map.set(area, []);
      map.get(area)?.push(t);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tables]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex h-[50vh] items-center justify-center text-muted">
          Loading Floor Plan...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-ink">
              Floor Plan & Tables
            </h1>
            <p className="text-sm text-muted mt-1">
              Manage your restaurant areas and table arrangements
            </p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-saffron hover:bg-saffron2 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            <Plus size={16} /> Add Table
          </button>
        </div>

        {isAddOpen && (
          <form onSubmit={handleCreate} className="bg-white border border-border rounded-xl p-5 shadow-sm animate-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ink">Add New Table</h2>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-muted hover:text-ink"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase">Table ID / Name</label>
                <input
                  value={formData.tableId}
                  onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                  placeholder="e.g. G-01"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-saffron"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-saffron"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase">Area / Zone</label>
                <select
                  value={isCustomArea ? "__CUSTOM__" : formData.area}
                  onChange={(e) => {
                    if (e.target.value === "__CUSTOM__") {
                      setIsCustomArea(true);
                      setFormData({ ...formData, customArea: "" });
                    } else {
                      setIsCustomArea(false);
                      setFormData({ ...formData, area: e.target.value });
                    }
                  }}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-saffron bg-white"
                >
                  {areas.map(([areaName]) => (
                    <option key={areaName} value={areaName}>{areaName}</option>
                  ))}
                  {areas.length === 0 && <option value="Main Floor">Main Floor</option>}
                  <option value="__CUSTOM__" className="font-bold text-saffron">+ Add New Custom Area</option>
                </select>
                
                {isCustomArea && (
                  <input
                    value={formData.customArea}
                    onChange={(e) => setFormData({ ...formData, customArea: e.target.value })}
                    placeholder="Enter Custom Area Name"
                    className="w-full mt-2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-saffron"
                    autoFocus
                  />
                )}
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-ink hover:bg-ink/90 text-white px-5 py-2 rounded-lg font-bold text-sm"
              >
                {createMutation.isPending ? "Creating..." : "Save Table"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-8">
          {areas.map(([areaName, areaTables]) => (
            <div key={areaName} className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-paper border-b border-border px-5 py-3 flex items-center gap-2">
                <MapPin size={18} className="text-saffron" />
                <h3 className="font-bold text-ink text-base">{areaName}</h3>
                <span className="ml-auto text-xs font-semibold text-muted bg-base-200 px-2 py-0.5 rounded-full">
                  {areaTables.length} Tables
                </span>
              </div>
              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {areaTables.map((table) => (
                  <div key={table.id} className="relative group border border-border rounded-lg p-4 flex flex-col items-center justify-center hover:border-saffron transition-colors bg-white">
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete table ${table.id}?`)) {
                          deleteMutation.mutate(table.id);
                        }
                      }}
                      className="absolute top-1.5 right-1.5 p-1.5 text-muted hover:bg-error/10 hover:text-error rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Table"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        const newArea = window.prompt(`Change area for ${table.id}:`, table.area);
                        if (newArea && newArea !== table.area) {
                          areaMutation.mutate({ tableId: table.id, area: newArea });
                        }
                      }}
                      className="absolute top-1.5 left-1.5 p-1.5 text-muted hover:bg-saffron/10 hover:text-saffron rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit Area"
                    >
                      <Edit2 size={14} />
                    </button>
                    <Armchair size={24} className="text-saffron mb-2" strokeWidth={1.5} />
                    <span className="font-black text-lg text-ink leading-none">{table.id}</span>
                    <span className="text-xs font-medium text-muted mt-1">{table.seats} Seats</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {areas.length === 0 && (
            <div className="text-center py-12 bg-white border border-border rounded-xl shadow-sm">
              <Armchair size={32} className="mx-auto text-muted/50 mb-3" />
              <h3 className="text-sm font-bold text-ink">No tables found</h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                You haven't set up your floor plan yet. Click "Add Table" to start designing your layout.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

import { useState, useMemo } from "react";
import { Armchair, Plus, Trash2, Edit2, Sparkles, X, MapPin, RotateCcw, Pencil } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchTables, createTable, deleteTable, updateTable, fetchDeletedTables, restoreTable } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { downloadQRCodes } from "../utils/qrDownloader";
import { QrCode } from "lucide-react";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import PageShell from "../components/layout/PageShell";

export default function TablesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ tableId: "", seats: 4, area: "Main Floor", customArea: "" });
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editTableData, setEditTableData] = useState(null);

  const { data: deletedTables = [], isLoading: isLoadingDeleted } = useQuery({
    queryKey: ["deletedTables"],
    queryFn: fetchDeletedTables,
    enabled: showDeleted,
  });

  const restoreMutation = useMutation({
    mutationFn: restoreTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["deletedTables"] });
      toast.success("Table restored successfully");
    },
    onError: () => toast.error("Failed to restore table"),
  });

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

  const updateMutation = useMutation({
    mutationFn: ({ oldId, data }) => updateTable(oldId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table updated successfully");
      setEditTableData(null);
    },
    onError: (err) => toast.error(err.message || "Failed to update table"),
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    const val = formData.tableId.trim();
    if (!val) return toast.error("Table ID / Number is required");
    
    const finalArea = isCustomArea ? formData.customArea.trim() : formData.area;
    if (!finalArea) return toast.error("Area is required");

    const isNumber = /^\d+$/.test(val);
    if (!isNumber) {
      return toast.error("Please enter a valid number of tables (digits only)");
    }

    const count = parseInt(val, 10);
    if (count > 50) return toast.error("Cannot create more than 50 tables at once");
    if (count <= 0) return toast.error("Enter a valid number greater than 0");

    // Use full area name as prefix with T (e.g., "Main Floor" -> "Main Floor-T")
    const prefix = `${finalArea.trim()}-T`;

    // Find the next available table number for this specific prefix
    const existingPrefixTables = tables
      .map(t => t.id)
      .filter(id => id.startsWith(prefix))
      .map(id => parseInt(id.replace(prefix, ""), 10))
      .filter(n => !isNaN(n));
      
    let nextNum = existingPrefixTables.length > 0 ? Math.max(...existingPrefixTables) + 1 : 1;

    const toastId = toast.loading(`Creating ${count} tables...`);
    try {
      for (let i = 0; i < count; i++) {
        const tId = `${prefix}${nextNum + i}`; // e.g. GT-1, GT-2
        await createTable({ tableId: tId, seats: formData.seats, area: finalArea });
      }
      toast.success(`${count} tables created successfully!`, { id: toastId });
      
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setIsAddOpen(false);
      setFormData({ tableId: "", seats: 4, area: "Main Floor", customArea: "" });
      setIsCustomArea(false);
    } catch (error) {
      toast.error("Some tables failed to create", { id: toastId });
    }
  };

  const handleDeleteArea = async (areaName, areaTables) => {
    if (
      window.confirm(
        `Are you sure you want to delete the entire '${areaName}' zone? This will delete ${areaTables.length} tables inside it.`
      )
    ) {
      const toastId = toast.loading(`Deleting ${areaTables.length} tables...`);
      try {
        const promises = areaTables.map((t) => deleteTable(t.id));
        await Promise.all(promises);
        toast.success(`'${areaName}' deleted successfully!`, { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["tables"] });
      } catch (error) {
        toast.error("Failed to delete some tables", { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["tables"] });
      }
    }
  };

  const handleEditAreaName = async (oldAreaName, areaTables) => {
    const newAreaName = window.prompt(`Rename Area '${oldAreaName}' to:`, oldAreaName);
    if (!newAreaName || newAreaName.trim() === oldAreaName) return;
    
    const finalNewName = newAreaName.trim();
    
    // Prevent merging into an existing area to avoid conflicts right now
    const exists = tables.some(t => t.area?.toLowerCase() === finalNewName.toLowerCase());
    if (exists) {
      return toast.error(`Area '${finalNewName}' already exists. Please choose a unique name.`);
    }

    const oldPrefixWithT = `${oldAreaName.trim()}-T`;
    const oldPrefixWithoutT = `${oldAreaName.trim()}-`;
    const newPrefix = `${finalNewName}-T`;
    
    const toastId = toast.loading(`Renaming area to ${finalNewName}...`);
    try {
      const promises = areaTables.map((t) => {
        let newTableId = t.id;
        // Auto-update the prefix if they hadn't custom named it
        if (t.id.startsWith(oldPrefixWithT)) {
          newTableId = t.id.replace(oldPrefixWithT, newPrefix);
        } else if (t.id.startsWith(oldPrefixWithoutT)) {
          newTableId = t.id.replace(oldPrefixWithoutT, newPrefix);
        }
        return updateTable(t.id, { area: finalNewName, tableId: newTableId });
      });
      await Promise.all(promises);
      toast.success(`Area renamed to '${finalNewName}'!`, { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    } catch (error) {
      toast.error("Failed to rename area", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editTableData) return;
    const finalArea = editTableData.isCustomArea ? editTableData.customArea.trim() : editTableData.area;
    if (!finalArea) return toast.error("Area is required");
    if (!editTableData.tableId.trim()) return toast.error("Table Name is required");

    updateMutation.mutate({
      oldId: editTableData.originalId,
      data: {
        tableId: editTableData.tableId.trim(),
        seats: editTableData.seats,
        area: finalArea
      }
    });
  };

  const areas = useMemo(() => {
    const map = new Map();
    for (const t of tables) {
      const area = t.area || "Main Floor";
      if (!map.has(area)) map.set(area, []);
      map.get(area)?.push(t);
    }
    
    const sortedEntries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
    for (const [areaName, areaTables] of sortedEntries) {
      areaTables.sort((a, b) => {
        return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
      });
    }
    
    return sortedEntries;
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
          <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  const toastId = toast.loading("Generating ZIP...");
                  try {
                    await downloadQRCodes(tables, user?.businessId, "All-Tables-QR.zip");
                    toast.success("Downloaded successfully!", { id: toastId });
                  } catch (err) {
                    toast.error("Failed to generate QRs", { id: toastId });
                  }
                }}
                className="flex items-center gap-2 bg-saffron/10 hover:bg-saffron/20 text-saffron px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                title="Download All QRs"
              >
                <QrCode size={16} /> Download All QRs
              </button>
              <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${
                showDeleted 
                  ? "bg-ink text-white border-ink" 
                  : "bg-white text-ink border-border hover:border-ink"
              }`}
            >
              <Trash2 size={16} /> {showDeleted ? "Back to Floor Plan" : "View Trash"}
            </button>
            {!showDeleted && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2 bg-saffron hover:bg-saffron2 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                <Plus size={16} /> Add Table
              </button>
            )}
          </div>
        </div>

        {isAddOpen && (
          <form onSubmit={handleCreate} className="bg-white border border-border rounded-xl p-5 shadow-sm animate-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ink">Add New Table</h2>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-muted hover:text-ink"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase">Number of Tables to Add</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.tableId}
                  onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                  placeholder="e.g. '6' to add 6 tables"
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
                className="bg-ink hover:bg-ink/90 text-white px-5 py-2 rounded-lg font-bold text-sm"
              >
                Save Table
              </button>
            </div>
          </form>
        )}

        <div className="space-y-8">
          {showDeleted ? (
            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-paper border-b border-border px-5 py-3 flex items-center gap-2">
                <Trash2 size={18} className="text-muted" />
                <h3 className="font-bold text-ink text-base">Deleted Tables</h3>
                <span className="ml-auto text-xs font-semibold text-muted bg-base-200 px-2 py-0.5 rounded-full">
                  {deletedTables.length} Tables
                </span>
              </div>
              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {isLoadingDeleted && <p className="text-sm text-muted">Loading...</p>}
                {!isLoadingDeleted && deletedTables.map((table) => (
                  <div key={table.id} className="relative group border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center bg-paper/50 opacity-80 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        if (window.confirm(`Restore table ${table.id}?`)) {
                          restoreMutation.mutate(table.id);
                        }
                      }}
                      className="absolute top-1.5 right-1.5 p-1.5 text-ink bg-white border border-border hover:border-ink rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      title="Restore Table"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <Armchair size={24} className="text-muted mb-2" strokeWidth={1.5} />
                    <span className="font-black text-lg text-muted leading-none line-through">{table.id}</span>
                    <span className="text-xs font-medium text-muted mt-1">{table.seats} Seats</span>
                  </div>
                ))}
              </div>
              {!isLoadingDeleted && deletedTables.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles size={32} className="mx-auto text-muted/50 mb-3" />
                  <h3 className="text-sm font-bold text-ink">Trash is empty</h3>
                  <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                    There are no deleted tables.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {areas.map(([areaName, areaTables]) => (
                <div key={areaName} className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-paper border-b border-border px-5 py-3 flex items-center gap-2">
                    <MapPin size={18} className="text-saffron" />
                    <h3 className="font-bold text-ink text-base">{areaName}</h3>
                    <span className="ml-auto text-xs font-semibold text-muted bg-base-200 px-2 py-0.5 rounded-full mr-2">
                      {areaTables.length} Tables
                    </span>
                    <button
                      onClick={async () => {
                        const toastId = toast.loading(`Generating ZIP for ${areaName}...`);
                        try {
                          await downloadQRCodes(areaTables, user?.businessId, `${areaName}-Tables-QR.zip`);
                          toast.success("Downloaded successfully!", { id: toastId });
                        } catch (err) {
                          toast.error("Failed to generate QRs", { id: toastId });
                        }
                      }}
                      className="p-1.5 text-muted hover:bg-saffron/10 hover:text-saffron rounded-md transition-colors"
                      title={`Download QRs for ${areaName}`}
                    >
                      <QrCode size={16} />
                    </button>
                    <button
                      onClick={() => handleEditAreaName(areaName, areaTables)}
                      className="p-1.5 text-muted hover:bg-saffron/10 hover:text-saffron rounded-md transition-colors"
                      title="Edit Area Name"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteArea(areaName, areaTables)}
                      className="p-1.5 text-muted hover:bg-error/10 hover:text-error rounded-md transition-colors"
                      title="Delete Entire Area"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {areaTables.map((table) => (
                      <div key={table.id} className="relative group border border-border rounded-lg p-4 flex flex-col items-center justify-center hover:border-saffron transition-colors bg-white">
                        <button
                          onClick={async () => {
                            const toastId = toast.loading(`Generating QR...`);
                            try {
                              await downloadQRCodes([table], user?.businessId);
                              toast.success("Downloaded successfully!", { id: toastId });
                            } catch (err) {
                              toast.error("Failed to generate QR", { id: toastId });
                            }
                          }}
                          className="absolute top-1.5 right-10 p-1.5 text-muted hover:bg-saffron/10 hover:text-saffron rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Download QR"
                        >
                          <QrCode size={14} />
                        </button>
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
                            setEditTableData({
                              originalId: table.id,
                              tableId: table.id,
                              seats: table.seats,
                              area: table.area || "Main Floor",
                              isCustomArea: false,
                              customArea: "",
                            });
                          }}
                          className="absolute top-1.5 left-1.5 p-1.5 text-muted hover:bg-saffron/10 hover:text-saffron rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit Table"
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
            </>
          )}
        </div>
      </div>

      {editTableData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-black text-ink">Edit Table</h2>
              <button
                onClick={() => setEditTableData(null)}
                className="p-2 text-muted hover:bg-paper hover:text-ink rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase">Table Name / ID</label>
                <input
                  value={editTableData.tableId}
                  onChange={(e) => setEditTableData({ ...editTableData, tableId: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-saffron"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={editTableData.seats}
                  onChange={(e) => setEditTableData({ ...editTableData, seats: Number(e.target.value) })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-saffron"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase">Area / Zone</label>
                <select
                  value={editTableData.isCustomArea ? "__CUSTOM__" : editTableData.area}
                  onChange={(e) => {
                    if (e.target.value === "__CUSTOM__") {
                      setEditTableData({ ...editTableData, isCustomArea: true, customArea: "" });
                    } else {
                      setEditTableData({ ...editTableData, isCustomArea: false, area: e.target.value });
                    }
                  }}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-saffron bg-white"
                >
                  <option value="Main Floor">Main Floor</option>
                  <option value="Garden">Garden</option>
                  <option value="Terrace">Terrace</option>
                  <option value="VIP Lounge">VIP Lounge</option>
                  <option value="Bar">Bar</option>
                  <option value="__CUSTOM__">+ Create Custom Area</option>
                </select>
              </div>

              {editTableData.isCustomArea && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-xs font-semibold text-muted mb-1.5 uppercase">Custom Area Name</label>
                  <input
                    value={editTableData.customArea}
                    onChange={(e) => setEditTableData({ ...editTableData, customArea: e.target.value })}
                    placeholder="e.g. Poolside"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-saffron"
                    autoFocus
                  />
                </div>
              )}
              
              <div className="pt-4 border-t border-border flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditTableData(null)}
                  className="px-4 py-2 text-sm font-bold text-muted hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 text-sm font-bold bg-saffron text-white rounded-lg hover:bg-saffron2 transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}

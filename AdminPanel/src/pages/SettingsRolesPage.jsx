import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Shield, Plus, Edit2, Trash2, X, Check,
  LayoutDashboard, MonitorSmartphone, UtensilsCrossed, Users2, Settings
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchRoles,
  fetchRolePermissions,
  createRole,
  updateRole,
  deleteRole,
} from "../services/api";
import PageShell from "../components/layout/PageShell";

const PERMISSION_GROUPS = [
  {
    name: "Dashboard & Analytics",
    icon: LayoutDashboard,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    permissions: [
      { id: "dashboard.overview", label: "View Overview Stats" },
      { id: "dashboard.finance", label: "View Sales & Finance" },
      { id: "dashboard.operations", label: "View Operations Data" },
      { id: "dashboard.visitors", label: "View Visitor Analytics" }
    ]
  },
  {
    name: "Orders & POS",
    icon: MonitorSmartphone,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    permissions: [
      { id: "pos.access", label: "Access POS System" },
      { id: "orders.view", label: "View KOTs & Orders" },
      { id: "orders.manage", label: "Manage Orders (Update/Cancel)" },
      { id: "kds.access", label: "Access Kitchen Display (KDS)" }
    ]
  },
  {
    name: "Menu & Inventory",
    icon: UtensilsCrossed,
    color: "bg-orange-50 text-saffron border-saffron-lt",
    permissions: [
      { id: "menu.view", label: "View Menu Items" },
      { id: "menu.manage", label: "Manage Menu (Add/Edit)" }
    ]
  },
  {
    name: "Staff & Tables",
    icon: Users2,
    color: "bg-purple-50 text-purple-600 border-purple-200",
    permissions: [
      { id: "tables.manage", label: "Manage Tables & QR" },
      { id: "staff.view", label: "View Staff" },
      { id: "staff.manage", label: "Manage Staff" },
      { id: "roles.manage", label: "Manage Custom Roles" }
    ]
  },
  {
    name: "Business Settings",
    icon: Settings,
    color: "bg-gray-100 text-gray-700 border-gray-300",
    permissions: [
      { id: "settings.manage", label: "Manage Business Settings" },
      { id: "billing.manage", label: "Manage Subscriptions" }
    ]
  }
];

export default function SettingsRolesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  
  // Form State
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPermissions, setFormPermissions] = useState([]);

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  const { data: availablePermissions = [] } = useQuery({
    queryKey: ["role-permissions"],
    queryFn: fetchRolePermissions,
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
      toast.success("Role created successfully");
      closeModal();
    },
    onError: (err) => toast.error(err.message || "Failed to create role"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
      toast.success("Role updated successfully");
      closeModal();
    },
    onError: (err) => toast.error(err.message || "Failed to update role"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
      toast.success("Role deleted successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to delete role"),
  });

  const openCreateModal = () => {
    setEditingRole(null);
    setFormName("");
    setFormDesc("");
    setFormPermissions([]);
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormDesc(role.description || "");
    setFormPermissions(role.permissions || []);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const togglePermission = (perm) => {
    setFormPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = () => {
    if (!formName.trim()) {
      return toast.error("Role name is required");
    }

    if (editingRole) {
      updateMutation.mutate({
        id: editingRole._id,
        payload: {
          name: formName,
          description: formDesc,
          permissions: formPermissions,
        },
      });
    } else {
      createMutation.mutate({
        name: formName,
        description: formDesc,
        permissions: formPermissions,
      });
    }
  };

  return (
    <PageShell title="Roles & Permissions">
      <div className="bg-white border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">Custom Roles</h2>
            <p className="text-sm text-muted">Manage staff access levels and permissions.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-saffron text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-saffron/90"
          >
            <Plus size={16} /> New Role
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 font-semibold text-muted">Role Name</th>
                <th className="pb-3 font-semibold text-muted">Description</th>
                <th className="pb-3 font-semibold text-muted">Type</th>
                <th className="pb-3 font-semibold text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingRoles ? (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-muted">Loading roles...</td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-muted">No roles found.</td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role._id} className="hover:bg-paper/50 transition-colors">
                    <td className="py-3 font-medium text-ink flex items-center gap-2">
                      <Shield size={16} className={role.isSystem ? "text-saffron" : "text-muted"} />
                      {role.name}
                    </td>
                    <td className="py-3 text-muted">{role.description || "-"}</td>
                    <td className="py-3">
                      {role.isSystem ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-saffron-lt text-saffron">System</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-paper text-muted border border-border">Custom</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {(!role.isSystem || role.name !== "Admin") && (
                          <button
                            onClick={() => openEditModal(role)}
                            className="p-1.5 text-muted hover:text-ink hover:bg-border rounded-md"
                            title="Edit Role"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {!role.isSystem && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete the role ${role.name}?`)) {
                                deleteMutation.mutate(role._id);
                              }
                            }}
                            className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete Role"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-bold text-ink">
                {editingRole ? "Edit Role" : "Create New Role"}
              </h3>
              <button onClick={closeModal} className="text-muted hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Role Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={editingRole?.isSystem}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-saffron/30 disabled:opacity-50"
                    placeholder="e.g. Head Chef"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                    placeholder="Briefly describe what this role does"
                  />
                </div>

                <div className="pt-4 border-t border-border mt-4">
                  <h4 className="font-semibold text-ink mb-3 text-lg">Granular Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PERMISSION_GROUPS.map((group) => {
                      const Icon = group.icon;
                      const groupIds = group.permissions.map(p => p.id);
                      const isAllChecked = groupIds.every(id => formPermissions.includes(id));
                      const isSomeChecked = groupIds.some(id => formPermissions.includes(id));

                      const toggleGroup = () => {
                        if (isAllChecked) {
                          setFormPermissions(prev => prev.filter(p => !groupIds.includes(p)));
                        } else {
                          setFormPermissions(prev => {
                            const newPerms = new Set([...prev, ...groupIds]);
                            return Array.from(newPerms);
                          });
                        }
                      };

                      return (
                        <div key={group.name} className="rounded-xl border border-border overflow-hidden bg-white hover:shadow-md transition-shadow">
                          <div 
                            className="px-4 py-3 border-b border-border flex items-center justify-between cursor-pointer select-none bg-paper/50 hover:bg-paper transition-colors"
                            onClick={toggleGroup}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg border ${group.color}`}>
                                <Icon size={16} strokeWidth={2.5} />
                              </div>
                              <span className="font-bold text-ink">{group.name}</span>
                            </div>
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                ${isAllChecked ? 'bg-saffron border-saffron text-white' : 
                                  isSomeChecked ? 'bg-saffron/20 border-saffron/50 text-saffron' : 'border-border bg-white'}`}
                              >
                                {isAllChecked ? <Check size={14} strokeWidth={3} /> : 
                                 isSomeChecked ? <div className="w-2.5 h-0.5 bg-saffron rounded-full" /> : null}
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-2 flex flex-col gap-1 bg-white">
                            {group.permissions.map((perm) => (
                              <label key={perm.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-paper cursor-pointer transition-colors group">
                                <div className="flex-shrink-0 relative">
                                  <input
                                    type="checkbox"
                                    checked={formPermissions.includes(perm.id)}
                                    onChange={() => togglePermission(perm.id)}
                                    className="w-4 h-4 text-saffron rounded border-border focus:ring-saffron/30 transition-colors"
                                  />
                                </div>
                                <span className="text-sm font-medium text-muted group-hover:text-ink transition-colors">
                                  {perm.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-border bg-paper rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 text-sm font-bold text-white bg-saffron rounded-lg hover:bg-saffron/90 disabled:opacity-50 flex items-center gap-2"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

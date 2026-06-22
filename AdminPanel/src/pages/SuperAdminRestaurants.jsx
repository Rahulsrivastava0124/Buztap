import { useEffect, useState, useMemo, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Store,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users2,
  ShoppingCart,
  IndianRupee,
  Filter,
  X,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  ChevronDown,
  Globe,
  Shield,
  User,
} from "lucide-react";
import {
  fetchAllBusinesses,
  fetchBusinessDetail,
  toggleBusiness,
  updateBusinessDetails,
} from "../services/superadminApi";
import toast from "react-hot-toast";

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
        active ? "bg-sage-lt text-sage" : "bg-red-50 text-red-500"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-sage" : "bg-red-400"}`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-paper text-muted border border-border uppercase tracking-wider">
      {type === "hotel" ? "Hotel" : "Restaurant"}
    </span>
  );
}

function PlanBadge({ plan }) {
  const colors = {
    free: "bg-gray-100 text-gray-600",
    pro: "bg-blue-50 text-blue-600",
    enterprise: "bg-purple-50 text-purple-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${colors[plan] || colors.free}`}
    >
      {plan || "Free"}
    </span>
  );
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ business, onClose, onToggle, onUpdate }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ plan: "", subdomain: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!business?._id) return;
    setLoading(true);
    fetchBusinessDetail(business._id)
      .then((data) => {
        setDetail(data);
        setEditForm({
          plan: data.plan || "free",
          subdomain: data.subdomain || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      })
      .catch(() => toast.error("Failed to load details"))
      .finally(() => setLoading(false));
  }, [business?._id]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const result = await toggleBusiness(business._id);
      toast.success(result.message);
      onToggle(business._id, result.isActive);
      setDetail((prev) => (prev ? { ...prev, isActive: result.isActive } : prev));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToggling(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateBusinessDetails(business._id, editForm);
      toast.success("Business details updated!");
      setDetail(prev => ({ ...prev, ...res.business }));
      setIsEditing(false);
      if (onUpdate) onUpdate(res.business);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <Motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl border border-border shadow-[0_25px_80px_rgba(15,14,11,0.2)]"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-saffron-lt flex items-center justify-center">
              <Store size={18} className="text-saffron" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">
                {business?.name || "Business"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <TypeBadge type={business?.type} />
                <PlanBadge plan={detail?.plan || business?.plan} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!loading && detail && (
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={saving}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  isEditing ? "bg-saffron text-white hover:bg-saffron2" : "bg-paper text-ink border border-border hover:bg-paper/80"
                }`}
              >
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Edit"}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-paper text-muted hover:text-ink transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-saffron" />
          </div>
        ) : detail ? (
          <div className="p-6 space-y-5">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Email</label>
                    <input type="email" value={editForm.email} onChange={e => setEditForm(prev => ({...prev, email: e.target.value}))} className="w-full px-3 py-1.5 bg-white border border-border rounded-lg text-sm focus:border-saffron focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Phone</label>
                    <input type="text" value={editForm.phone} onChange={e => setEditForm(prev => ({...prev, phone: e.target.value}))} className="w-full px-3 py-1.5 bg-white border border-border rounded-lg text-sm focus:border-saffron focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Subdomain</label>
                    <input type="text" value={editForm.subdomain} onChange={e => setEditForm(prev => ({...prev, subdomain: e.target.value}))} className="w-full px-3 py-1.5 bg-white border border-border rounded-lg text-sm focus:border-saffron focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Plan</label>
                    <select value={editForm.plan} onChange={e => setEditForm(prev => ({...prev, plan: e.target.value}))} className="w-full px-3 py-1.5 bg-white border border-border rounded-lg text-sm focus:border-saffron focus:outline-none">
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <InfoItem icon={Mail} label="Email" value={detail.email} />
                  <InfoItem icon={Phone} label="Phone" value={detail.phone || "—"} />
                  <InfoItem icon={Globe} label="Subdomain" value={detail.subdomain || "—"} />
                  <InfoItem icon={MapPin} label="Address" value={detail.address || "—"} />
                </>
              )}
              
              <InfoItem
                icon={Calendar}
                label="Registered"
                value={new Date(detail.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              />
              <InfoItem
                icon={Store}
                label="Tables"
                value={detail.tableCount || 0}
              />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <MiniStat
                icon={ShoppingCart}
                label="Orders"
                value={detail.totalOrders?.toLocaleString("en-IN") || "0"}
                gradient="bg-blue-50"
                color="text-blue-600"
              />
              <MiniStat
                icon={IndianRupee}
                label="Revenue"
                value={`₹${(detail.totalRevenue || 0).toLocaleString("en-IN")}`}
                gradient="bg-emerald-50"
                color="text-emerald-600"
              />
              <MiniStat
                icon={Users2}
                label="Staff"
                value={detail.staff?.length || 0}
                gradient="bg-purple-50"
                color="text-purple-600"
              />
            </div>

            {/* Staff List */}
            {detail.staff?.length > 0 && (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-paper border-b border-border">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                    Staff Members ({detail.staff.length})
                  </h3>
                </div>
                <div className="divide-y divide-border/60 max-h-56 overflow-y-auto">
                  {detail.staff.map((s) => (
                    <div
                      key={s._id}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-paper/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-saffron-lt flex items-center justify-center shrink-0">
                          <User size={12} className="text-saffron" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-ink truncate">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-muted">
                            {s.designation || s.role}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          s.role === "admin"
                            ? "bg-saffron-lt text-saffron"
                            : s.role === "manager"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-paper text-muted"
                        }`}
                      >
                        {s.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toggle Button */}
            <div className="flex items-center justify-between p-4 bg-paper rounded-xl border border-border">
              <div>
                <p className="text-sm font-semibold text-ink">Business Status</p>
                <p className="text-xs text-muted mt-0.5">
                  {detail.isActive
                    ? "This business is currently active"
                    : "This business is currently disabled"}
                </p>
              </div>
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  detail.isActive
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                    : "bg-sage-lt text-sage hover:bg-green-100 border border-green-200"
                } disabled:opacity-50`}
              >
                {toggling ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : detail.isActive ? (
                  <ToggleRight size={14} />
                ) : (
                  <ToggleLeft size={14} />
                )}
                {detail.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-muted py-16">
            Failed to load details.
          </p>
        )}
      </Motion.div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={14} className="text-muted2 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm text-ink truncate">{value}</p>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, gradient, color }) {
  return (
    <div className={`rounded-xl p-3 ${gradient}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} className={color} />
        <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function SuperAdminRestaurants() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedBiz, setSelectedBiz] = useState(null);

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllBusinesses({
        search: search.trim(),
        status: statusFilter,
        type: typeFilter,
      });
      setBusinesses(data);
    } catch {
      toast.error("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(loadBusinesses, 300);
    return () => clearTimeout(timer);
  }, [loadBusinesses]);

  const handleToggleFromModal = (id, isActive) => {
    setBusinesses((prev) =>
      prev.map((b) => (b._id === id ? { ...b, isActive } : b)),
    );
  };

  const handleUpdateFromModal = (updatedBiz) => {
    setBusinesses((prev) =>
      prev.map((b) => (b._id === updatedBiz._id ? { ...b, ...updatedBiz } : b)),
    );
  };

  const hasFilters = search || statusFilter || typeFilter;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">All Restaurants</h2>
          <p className="text-sm text-muted mt-0.5">
            {businesses.length} registered{" "}
            {businesses.length === 1 ? "business" : "businesses"}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted2"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-ink placeholder-muted2 focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition-all"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-border rounded-xl text-xs font-medium text-ink focus:outline-none focus:border-saffron cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted2 pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-border rounded-xl text-xs font-medium text-ink focus:outline-none focus:border-saffron cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="restro">Restaurant</option>
              <option value="hotel">Hotel</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted2 pointer-events-none"
            />
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setTypeFilter("");
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink hover:bg-paper border border-border transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-saffron" />
        </div>
      ) : businesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-paper flex items-center justify-center mb-4">
            <Store size={28} className="text-muted2" />
          </div>
          <p className="text-sm font-semibold text-ink">
            No restaurants found
          </p>
          <p className="text-xs text-muted mt-1">
            {hasFilters
              ? "Try adjusting your filters"
              : "No businesses have registered yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-3 px-5 py-3 bg-paper border-b border-border">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Restaurant
            </p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Contact
            </p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Plan
            </p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Stats
            </p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Registered
            </p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider text-center">
              Status
            </p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/60">
            {businesses.map((biz, i) => (
              <Motion.div
                key={biz._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onClick={() => setSelectedBiz(biz)}
                className="group px-5 py-4 cursor-pointer hover:bg-saffron-lt/30 transition-colors md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] md:gap-3 md:items-center"
              >
                {/* Restaurant Name */}
                <div className="flex items-center gap-3 min-w-0 mb-2 md:mb-0">
                  <div className="w-9 h-9 rounded-lg bg-saffron-lt flex items-center justify-center shrink-0 group-hover:bg-saffron/10 transition-colors">
                    <Store size={16} className="text-saffron" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate group-hover:text-saffron transition-colors">
                      {biz.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TypeBadge type={biz.type} />
                      {biz.subdomain && (
                        <span className="text-[10px] text-muted2">
                          /{biz.subdomain}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="min-w-0 mb-2 md:mb-0">
                  <p className="text-xs text-ink truncate">{biz.email}</p>
                  <p className="text-[10px] text-muted">{biz.phone || "—"}</p>
                </div>

                {/* Plan */}
                <div className="mb-2 md:mb-0">
                  <PlanBadge plan={biz.plan} />
                </div>

                {/* Stats */}
                <div className="mb-2 md:mb-0">
                  <p className="text-xs text-ink">
                    <span className="font-semibold">
                      {(biz.totalOrders || 0).toLocaleString("en-IN")}
                    </span>{" "}
                    <span className="text-muted">orders</span>
                  </p>
                  <p className="text-[10px] text-muted">
                    ₹{(biz.totalRevenue || 0).toLocaleString("en-IN")} ·{" "}
                    {biz.staffCount || 0} staff
                  </p>
                </div>

                {/* Date */}
                <div className="mb-2 md:mb-0">
                  <p className="text-xs text-ink">
                    {new Date(biz.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Status */}
                <div className="flex md:justify-center">
                  <StatusBadge active={biz.isActive} />
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedBiz && (
          <DetailModal
            business={selectedBiz}
            onClose={() => setSelectedBiz(null)}
            onToggle={handleToggleFromModal}
            onUpdate={handleUpdateFromModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

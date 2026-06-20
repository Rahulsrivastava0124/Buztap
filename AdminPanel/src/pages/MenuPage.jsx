import { useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  UtensilsCrossed,
  Leaf,
  Flame,
  Clock,
  Tag,
  Star,
  X,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ImagePlus,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuImage,
} from "../services/api";
import StatCard from "../components/shared/StatCard";
import PageShell from "../components/layout/PageShell";

const SPICE_LABELS = ["", "Mild", "Low", "Medium", "Hot", "Extra Hot"];

const ALLERGEN_OPTIONS = [
  "Gluten",
  "Dairy",
  "Nuts",
  "Egg",
  "Soy",
  "Shellfish",
  "Sesame",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  price: "",
  isHalfAvailable: false,
  halfPrice: "",
  isPcsAvailable: false,
  pcsPrice: "",
  cost: "",
  image: "",
  isVeg: true,
  isAvailable: true,
  preparationTime: 15,
  spiceLevel: 2,
  allergens: [],
};

function SpiceDots({ level }) {
  return (
    <span className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i <= level ? "bg-red-500" : "bg-gray-200"}`}
        />
      ))}
    </span>
  );
}

function ItemModal({ item, categories, onClose, onSave, saving }) {
  const isEdit = Boolean(item?.id);
  const [form, setForm] = useState(
    item
      ? {
          name: item.name,
          description: item.description,
          category: item.category,
          price: String(item.price),
          isHalfAvailable: Boolean(
            item.priceOptions?.find((opt) =>
              String(opt.label).toLowerCase().includes("half"),
            ),
          ),
          halfPrice: String(
            item.priceOptions?.find((opt) =>
              String(opt.label).toLowerCase().includes("half"),
            )?.price ?? "",
          ),
          isPcsAvailable: Boolean(
            item.priceOptions?.find((opt) => {
              const label = String(opt.label).toLowerCase();
              return label === "pcs" || label === "pc" || label.includes("pcs");
            }),
          ),
          pcsPrice: String(
            item.priceOptions?.find((opt) => {
              const label = String(opt.label).toLowerCase();
              return label === "pcs" || label === "pc" || label.includes("pcs");
            })?.price ?? "",
          ),
          cost: String(item.cost),
          image: item.image,
          isVeg: item.isVeg,
          isAvailable: item.isAvailable,
          preparationTime: item.preparationTime,
          spiceLevel: item.spiceLevel,
          allergens: [...item.allergens],
        }
      : { ...EMPTY_FORM },
  );
  const [newCat, setNewCat] = useState("");
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const allCategories = useMemo(() => {
    const set = new Set(categories);
    if (newCat.trim()) set.add(newCat.trim());
    return [...set].sort();
  }, [categories, newCat]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toHalfPrice(value) {
    const n = parseFloat(value);
    if (!Number.isFinite(n) || n <= 0) return "";
    return String(Math.round((n / 2) * 100) / 100);
  }

  async function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMenuImage(file);
      set("image", url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function toggleAllergen(a) {
    setForm((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(a)
        ? prev.allergens.filter((x) => x !== a)
        : [...prev.allergens, a],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.category.trim()) return toast.error("Category is required");
    const price = parseFloat(form.price);
    if (!price || price <= 0) return toast.error("Enter a valid price");
    const halfPrice = parseFloat(form.halfPrice);
    const pcsPrice = parseFloat(form.pcsPrice);

    const priceOptions = [{ label: "Full", price }];
    if (form.isHalfAvailable && Number.isFinite(halfPrice) && halfPrice > 0) {
      priceOptions.push({ label: "Half", price: halfPrice });
    }
    if (form.isPcsAvailable && Number.isFinite(pcsPrice) && pcsPrice > 0) {
      priceOptions.push({ label: "Pcs", price: pcsPrice });
    }

    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price,
      priceOptions,
      cost: parseFloat(form.cost) || 0,
      image: form.image.trim(),
      isVeg: form.isVeg,
      isAvailable: form.isAvailable,
      preparationTime: Number(form.preparationTime),
      spiceLevel: Number(form.spiceLevel),
      allergens: form.allergens,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="font-display font-bold text-ink text-lg">
            {isEdit ? "Edit Item" : "Add Menu Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-paper text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Item Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Paneer Butter Masala"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Short description (optional)"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCatDropOpen((v) => !v)}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron"
              >
                <span className={form.category ? "text-ink" : "text-muted"}>
                  {form.category || "Select or type a category"}
                </span>
                <ChevronDown size={14} className="text-muted" />
              </button>
              {catDropOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-border rounded-xl shadow-md overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <input
                      value={newCat}
                      onChange={(e) => {
                        setNewCat(e.target.value);
                        set("category", e.target.value);
                      }}
                      placeholder="Type new category…"
                      className="w-full text-sm px-3 py-1.5 border border-border rounded-lg focus:outline-none"
                    />
                  </div>
                  <ul className="max-h-40 overflow-y-auto py-1">
                    {allCategories.map((cat) => (
                      <li key={cat}>
                        <button
                          type="button"
                          onClick={() => {
                            set("category", cat);
                            setCatDropOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-paper"
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Price & Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.price}
                onChange={(e) => {
                  const nextPrice = e.target.value;
                  set("price", nextPrice);
                  if (form.isHalfAvailable) {
                    set("halfPrice", toHalfPrice(nextPrice));
                  }
                }}
                placeholder="0.00"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Cost Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.cost}
                onChange={(e) => set("cost", e.target.value)}
                placeholder="0.00"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Half Option
              </label>
              <div className="w-full border border-border rounded-xl px-3 py-2.5 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const next = !form.isHalfAvailable;
                    set("isHalfAvailable", next);
                    if (next) {
                      set(
                        "halfPrice",
                        form.halfPrice || toHalfPrice(form.price),
                      );
                    } else {
                      set("halfPrice", "");
                    }
                  }}
                  className="shrink-0"
                  title={form.isHalfAvailable ? "Disable half" : "Enable half"}
                >
                  {form.isHalfAvailable ? (
                    <ToggleRight size={22} className="text-saffron" />
                  ) : (
                    <ToggleLeft size={22} className="text-muted" />
                  )}
                </button>
                <span
                  className={`text-xs font-semibold uppercase tracking-wide shrink-0 ${
                    form.isHalfAvailable ? "text-ink" : "text-muted"
                  }`}
                >
                  Half
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.halfPrice}
                  onChange={(e) => set("halfPrice", e.target.value)}
                  placeholder="Auto"
                  disabled={!form.isHalfAvailable}
                  className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron disabled:bg-paper disabled:text-muted"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Pcs Option
              </label>
              <div className="w-full border border-border rounded-xl px-3 py-2.5 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const next = !form.isPcsAvailable;
                    set("isPcsAvailable", next);
                    if (!next) set("pcsPrice", "");
                  }}
                  className="shrink-0"
                  title={form.isPcsAvailable ? "Disable pcs" : "Enable pcs"}
                >
                  {form.isPcsAvailable ? (
                    <ToggleRight size={22} className="text-saffron" />
                  ) : (
                    <ToggleLeft size={22} className="text-muted" />
                  )}
                </button>
                <span
                  className={`text-xs font-semibold uppercase tracking-wide shrink-0 ${
                    form.isPcsAvailable ? "text-ink" : "text-muted"
                  }`}
                >
                  Pcs
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.pcsPrice}
                  onChange={(e) => set("pcsPrice", e.target.value)}
                  placeholder="Price"
                  disabled={!form.isPcsAvailable}
                  className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron disabled:bg-paper disabled:text-muted"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Item Image
            </label>
            <div className="flex items-center gap-3">
              {/* Preview */}
              <div className="w-20 h-20 rounded-xl border border-border bg-paper flex items-center justify-center overflow-hidden shrink-0">
                {form.image ? (
                  <img
                    src={form.image}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <ImagePlus size={22} className="text-muted/40" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImagePick}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-saffron rounded-xl text-sm font-medium text-saffron hover:bg-saffron/5 transition-colors disabled:opacity-60 w-full justify-center"
                >
                  <ImagePlus size={15} />
                  {uploading
                    ? "Uploading…"
                    : form.image
                      ? "Change Image"
                      : "Upload Image"}
                </button>
                {form.image && (
                  <button
                    type="button"
                    onClick={() => set("image", "")}
                    className="mt-1.5 text-xs text-muted hover:text-red-500 w-full text-center"
                  >
                    Remove image
                  </button>
                )}
                <p className="text-[10px] text-muted mt-1 text-center">
                  JPG, PNG, WebP · max 5 MB
                </p>
              </div>
            </div>
          </div>

          {/* Prep time & Spice */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Prep Time (min)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={form.preparationTime}
                onChange={(e) => set("preparationTime", e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Spice Level — {SPICE_LABELS[form.spiceLevel]}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={form.spiceLevel}
                onChange={(e) => set("spiceLevel", Number(e.target.value))}
                className="w-full accent-saffron mt-1"
              />
              <div className="flex justify-between text-[10px] text-muted mt-0.5">
                <span>Mild</span>
                <span>Extra Hot</span>
              </div>
            </div>
          </div>

          {/* Veg / Available toggles */}
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => set("isVeg", !form.isVeg)}
              className="flex items-center gap-2.5 text-sm font-medium"
            >
              {form.isVeg ? (
                <ToggleRight size={28} className="text-green-500" />
              ) : (
                <ToggleLeft size={28} className="text-muted" />
              )}
              <Leaf
                size={16}
                className={form.isVeg ? "text-green-500" : "text-muted"}
              />
              Vegetarian
            </button>
            <button
              type="button"
              onClick={() => set("isAvailable", !form.isAvailable)}
              className="flex items-center gap-2.5 text-sm font-medium"
            >
              {form.isAvailable ? (
                <ToggleRight size={28} className="text-saffron" />
              ) : (
                <ToggleLeft size={28} className="text-muted" />
              )}
              Available
            </button>
          </div>

          {/* Allergens */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Allergens
            </label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAllergen(a)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.allergens.includes(a)
                      ? "bg-red-50 border-red-300 text-red-700"
                      : "border-border text-muted hover:border-saffron hover:text-saffron"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-ink hover:bg-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-5 py-2.5 rounded-xl bg-saffron text-white text-sm font-semibold hover:bg-saffron/90 disabled:opacity-60"
            >
              {uploading
                ? "Uploading…"
                : saving
                  ? "Saving…"
                  : isEdit
                    ? "Save Changes"
                    : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ item, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-ink text-base">Delete Item</h3>
            <p className="text-muted text-sm">This cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-ink mb-6">
          Are you sure you want to delete{" "}
          <strong className="font-semibold">{item.name}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-paper"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const qc = useQueryClient();
  const { slug } = useParams();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["menu-items"],
    queryFn: fetchMenuItems,
    staleTime: 30_000,
  });

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit'|'delete', item? }
  const favoritesStorageKey = useMemo(
    () => `menu-favorites:${slug || "default"}`,
    [slug],
  );
  const [favoriteItemIds, setFavoriteItemIds] = useState(() => {
    try {
      const raw = window.localStorage.getItem(favoritesStorageKey);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      const ids = Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
      return new Set(ids);
    } catch {
      return new Set();
    }
  });

  const categories = useMemo(() => {
    const cats = [...new Set(items.map((i) => i.category))].sort();
    return ["All", ...cats];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat =
        activeCategory === "All" || item.category === activeCategory;
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, activeCategory, search]);

  // KPI stats
  const totalItems = items.length;
  const available = items.filter((i) => i.isAvailable).length;
  const catCount = categories.length - 1; // subtract "All"
  const avgPrice =
    items.length > 0
      ? Math.round(items.reduce((s, i) => s + i.price, 0) / items.length)
      : 0;

  // Mutations
  const createMut = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Item added");
      setModal(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateMenuItem(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Item updated");
      setModal(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Item deleted");
      setModal(null);
    },
    onError: (err) => toast.error(err.message),
  });

  function handleToggleAvailability(item) {
    updateMut.mutate({
      id: item.id,
      payload: { isAvailable: !item.isAvailable },
    });
  }

  function toggleFavorite(itemId) {
    const normalizedItemId = String(itemId);
    setFavoriteItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(normalizedItemId)) next.delete(normalizedItemId);
      else next.add(normalizedItemId);
      window.localStorage.setItem(
        favoritesStorageKey,
        JSON.stringify(Array.from(next)),
      );
      return next;
    });
  }

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <PageShell>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-ink text-2xl">
            Menu & Products
          </h1>
          <p className="text-muted text-sm mt-0.5">
            Manage your restaurant menu items
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-4 py-2.5 bg-saffron text-white rounded-xl text-sm font-semibold hover:bg-saffron/90 transition-colors"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Items"
          value={String(totalItems)}
          icon={UtensilsCrossed}
        />
        <StatCard
          title="Available"
          value={String(available)}
          icon={ToggleRight}
        />
        <StatCard title="Categories" value={String(catCount)} icon={Tag} />
        <StatCard title="Avg Price" value={`₹${avgPrice}`} icon={Flame} />
      </div>

      {/* Search + category filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items or categories…"
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-saffron text-white border-saffron"
                  : "border-border text-muted hover:border-saffron hover:text-saffron"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted text-sm">
          Loading menu…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
          <UtensilsCrossed size={36} className="opacity-30" />
          <p className="text-sm">No items found. Add your first menu item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border transition-all ${
                item.isAvailable
                  ? "border-border"
                  : "border-border opacity-60 grayscale-[0.3]"
              }`}
            >
              {/* Image */}
              <div className="relative h-32 rounded-t-xl overflow-hidden bg-paper">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed size={22} className="text-muted/30" />
                  </div>
                )}
                {/* Veg badge */}
                <span
                  className={`absolute top-1.5 left-1.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                    item.isVeg
                      ? "border-green-600 bg-white"
                      : "border-red-600 bg-white"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`}
                  />
                </span>
                {/* Favorite toggle */}
                <button
                  title={
                    favoriteItemIds.has(String(item.id))
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute top-1.5 right-9 p-1 rounded-lg bg-white/90 shadow-sm hover:bg-white transition-colors"
                >
                  <Star
                    size={13}
                    className={
                      favoriteItemIds.has(String(item.id))
                        ? "fill-saffron text-saffron"
                        : "text-muted"
                    }
                  />
                </button>
                {/* Availability toggle */}
                <button
                  title={
                    item.isAvailable ? "Mark unavailable" : "Mark available"
                  }
                  onClick={() => handleToggleAvailability(item)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-white/90 shadow-sm hover:bg-white transition-colors"
                >
                  {item.isAvailable ? (
                    <ToggleRight size={13} className="text-saffron" />
                  ) : (
                    <ToggleLeft size={13} className="text-muted" />
                  )}
                </button>
              </div>

              {/* Body */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-1 mb-0.5">
                  <h3 className="font-semibold text-ink text-xs leading-tight line-clamp-1">
                    {item.name}
                  </h3>
                  <span className="text-saffron font-bold text-xs whitespace-nowrap">
                    ₹{item.price.toLocaleString()}
                  </span>
                </div>

                {Array.isArray(item.priceOptions) &&
                  item.priceOptions.length > 1 && (
                    <p className="text-[10px] text-muted mt-0.5 line-clamp-1">
                      {item.priceOptions
                        .filter((opt) =>
                          ["half", "pcs", "pc"].includes(
                            String(opt.label).toLowerCase(),
                          ),
                        )
                        .map((opt) => `${opt.label}: ₹${opt.price}`)
                        .join(" • ")}
                    </p>
                  )}

                <div className="flex items-center gap-2 text-[10px] text-muted">
                  <span className="flex items-center gap-0.5">
                    <Clock size={9} />
                    {item.preparationTime}m
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Flame size={9} />
                    <SpiceDots level={item.spiceLevel} />
                  </span>
                  {item.cost > 0 && (
                    <span className="text-green-600 font-medium">
                      {Math.round(
                        ((item.price - item.cost) / item.price) * 100,
                      )}
                      %
                    </span>
                  )}
                </div>

                {item.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-1.5">
                    {item.allergens.slice(0, 2).map((a) => (
                      <span
                        key={a}
                        className="px-1 py-0.5 rounded bg-red-50 text-red-600 text-[9px] font-medium"
                      >
                        {a}
                      </span>
                    ))}
                    {item.allergens.length > 2 && (
                      <span className="text-[9px] text-muted">
                        +{item.allergens.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-1.5 mt-2 pt-2 border-t border-border">
                  <button
                    onClick={() => setModal({ mode: "edit", item })}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-border text-xs font-medium text-ink hover:bg-paper transition-colors"
                  >
                    <Pencil size={11} />
                    Edit
                  </button>
                  <button
                    onClick={() => setModal({ mode: "delete", item })}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {(modal?.mode === "add" || modal?.mode === "edit") && (
        <ItemModal
          item={modal.item ?? null}
          categories={categories.filter((c) => c !== "All")}
          onClose={() => setModal(null)}
          saving={saving}
          onSave={(payload) => {
            if (modal.mode === "edit") {
              updateMut.mutate({ id: modal.item.id, payload });
            } else {
              createMut.mutate(payload);
            }
          }}
        />
      )}

      {/* Delete confirm modal */}
      {modal?.mode === "delete" && (
        <DeleteConfirm
          item={modal.item}
          onClose={() => setModal(null)}
          deleting={deleteMut.isPending}
          onConfirm={() => deleteMut.mutate(modal.item.id)}
        />
      )}
    </PageShell>
  );
}

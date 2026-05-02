import { lazy, Suspense, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  TicketPercent,
  Eye,
  EyeOff,
  Trash2,
  PencilLine,
} from "lucide-react";
const DatePicker = lazy(() => import("react-datepicker"));
import "react-datepicker/dist/react-datepicker.css";
import {
  createOffer,
  deleteOffer,
  fetchMenuItems,
  fetchOffers,
  updateOffer,
} from "../services/api";
import PageShell from "../components/layout/PageShell";

const OFFER_TYPE_OPTIONS = [
  { value: "coupon", label: "Coupon (cart level)" },
  { value: "festival", label: "Festival Offer (auto apply)" },
  { value: "category", label: "Category Offer" },
  { value: "item", label: "Selected Item Offer" },
];

const OFFER_AUDIENCE_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "new", label: "New Users" },
  { value: "returning", label: "Old Users" },
];

const EMPTY_FORM = {
  title: "",
  code: "",
  description: "",
  offerType: "coupon",
  audience: "all",
  discountPct: 10,
  minSubtotal: 0,
  targetCategory: "",
  targetItemIds: [],
  expiresAt: null,
};

function buildOfferPayload(form) {
  const offerType = String(form.offerType || "coupon");

  return {
    title: form.title.trim(),
    code: form.code.trim().toUpperCase(),
    description: form.description.trim(),
    offerType,
    audience: String(form.audience || "all"),
    discountPct: Number(form.discountPct || 0),
    minSubtotal: Number(form.minSubtotal || 0),
    targetCategory: offerType === "category" ? form.targetCategory.trim() : "",
    targetItemIds:
      offerType === "item"
        ? Array.from(new Set((form.targetItemIds || []).map(String)))
        : [],
    expiresAt: form.expiresAt ? form.expiresAt.toISOString() : null,
  };
}

function formFromOffer(offer) {
  return {
    title: offer.title || "",
    code: offer.code || "",
    description: offer.description || "",
    offerType: offer.offerType || "coupon",
    audience: offer.audience || "all",
    discountPct: Number(offer.discountPct || 0),
    minSubtotal: Number(offer.minSubtotal || 0),
    targetCategory: offer.targetCategory || "",
    targetItemIds: Array.isArray(offer.targetItemIds)
      ? offer.targetItemIds
      : [],
    expiresAt: offer.expiresAt ? new Date(offer.expiresAt) : null,
  };
}

function getOfferTypeLabel(offerType) {
  switch (offerType) {
    case "festival":
      return "Festival";
    case "category":
      return "Category";
    case "item":
      return "Selected Items";
    default:
      return "Coupon";
  }
}

function getOfferAudienceLabel(audience) {
  switch (String(audience || "all")) {
    case "new":
      return "New Users";
    case "returning":
      return "Old Users";
    default:
      return "All Users";
  }
}

function getOfferTargetLabel(offer) {
  const type = String(offer.offerType || "coupon");
  if (type === "category") {
    return offer.targetCategory
      ? `Category: ${offer.targetCategory}`
      : "Category target missing";
  }
  if (type === "item") {
    const count = Array.isArray(offer.targetItemIds)
      ? offer.targetItemIds.length
      : 0;
    return count > 0 ? `Items: ${count} selected` : "Items target missing";
  }
  if (type === "festival") return "Applies on QR menu cards";
  return "Applied with coupon code";
}

function getOfferMeta(offer) {
  const expiryDate = offer.expiresAt ? new Date(offer.expiresAt) : null;
  const hasExpiry = Boolean(expiryDate && !Number.isNaN(expiryDate.getTime()));
  const isExpired = hasExpiry && expiryDate.getTime() < Date.now();

  return {
    hasExpiry,
    isExpired,
    expiryLabel: hasExpiry ? expiryDate.toLocaleDateString() : "No expiry",
  };
}

function StatusChip({
  active,
  activeClass,
  inactiveClass,
  activeLabel,
  inactiveLabel,
}) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full border ${active ? activeClass : inactiveClass}`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export default function OffersPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingOfferId, setEditingOfferId] = useState("");
  const [formError, setFormError] = useState("");
  const isEditMode = Boolean(editingOfferId);

  const {
    data: offers = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["offers"],
    queryFn: fetchOffers,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["menu-items-for-offers"],
    queryFn: fetchMenuItems,
  });

  const menuCategories = useMemo(
    () =>
      Array.from(
        new Set(
          menuItems
            .map((item) => String(item.category || "").trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [menuItems],
  );

  const createMutation = useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, payload }) => updateOffer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      if (isEditMode) {
        setEditingOfferId("");
        setForm(EMPTY_FORM);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["offers"] }),
  });

  const isSubmitting = createMutation.isPending || patchMutation.isPending;
  const mutationError =
    createMutation.error?.message || patchMutation.error?.message;

  function onSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (
      form.offerType === "category" &&
      !String(form.targetCategory || "").trim()
    ) {
      setFormError("Please choose a category for this offer.");
      return;
    }

    if (form.offerType === "item" && form.targetItemIds.length === 0) {
      setFormError("Please choose at least one menu item for this offer.");
      return;
    }

    const payload = buildOfferPayload(form);

    if (isEditMode) {
      patchMutation.mutate({
        id: editingOfferId,
        payload,
      });
      return;
    }

    createMutation.mutate({
      ...payload,
      isVisible: true,
      isActive: true,
    });
  }

  function startEdit(offer) {
    setEditingOfferId(offer.id);
    setForm(formFromOffer(offer));
  }

  function cancelEdit() {
    setEditingOfferId("");
    setForm(EMPTY_FORM);
  }

  function onChange(e) {
    const { name, value } = e.target;

    if (name === "offerType") {
      setForm((prev) => ({
        ...prev,
        offerType: value,
        targetCategory: "",
        targetItemIds: [],
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "discountPct" || name === "minSubtotal"
          ? Number(value || 0)
          : value,
    }));
  }

  function toggleTargetItem(itemId) {
    setForm((prev) => {
      const current = Array.isArray(prev.targetItemIds)
        ? prev.targetItemIds
        : [];
      const id = String(itemId);
      return {
        ...prev,
        targetItemIds: current.includes(id)
          ? current.filter((value) => value !== id)
          : [...current, id],
      };
    });
  }

  return (
    <PageShell>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form
          onSubmit={onSubmit}
          className="xl:col-span-1 bg-white border border-border rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-paper border border-border flex items-center justify-center">
              <TicketPercent size={18} className="text-saffron" />
            </div>
            <h2 className="font-bold text-ink">
              {isEditMode ? "Edit Coupon / Offer" : "Add Coupon / Offer"}
            </h2>
          </div>

          <div className="space-y-3">
            <label className="block text-sm">
              <span className="text-muted">Offer Title</span>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="Festive Saver"
              />
            </label>

            <label className="block text-sm">
              <span className="text-muted">Coupon Code</span>
              <input
                name="code"
                value={form.code}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm uppercase outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="SAVE10"
              />
            </label>

            <label className="block text-sm">
              <span className="text-muted">Description</span>
              <input
                name="description"
                value={form.description}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="10% off on orders"
              />
            </label>

            <label className="block text-sm">
              <span className="text-muted">Offer Type</span>
              <select
                name="offerType"
                value={form.offerType}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
              >
                {OFFER_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-muted">Apply For</span>
              <select
                name="audience"
                value={form.audience}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
              >
                {OFFER_AUDIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {form.offerType === "category" ? (
              <label className="block text-sm">
                <span className="text-muted">Target Category</span>
                <select
                  name="targetCategory"
                  value={form.targetCategory}
                  onChange={onChange}
                  required
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                >
                  <option value="">Select category</option>
                  {menuCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {form.offerType === "item" ? (
              <div className="block text-sm">
                <p className="text-muted">Target Items</p>
                <div className="mt-1 max-h-40 overflow-auto rounded-lg border border-border p-2.5 space-y-2">
                  {menuItems.length === 0 ? (
                    <p className="text-xs text-muted">
                      No menu items available.
                    </p>
                  ) : (
                    menuItems.map((item) => {
                      const checked = form.targetItemIds.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 text-xs text-ink"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTargetItem(item.id)}
                            className="accent-saffron"
                          />
                          <span>
                            {item.name}{" "}
                            <span className="text-muted">
                              ({item.category})
                            </span>
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                {form.targetItemIds.length === 0 ? (
                  <p className="mt-1 text-[11px] text-muted">
                    Select at least one item for selected-item offers.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-muted">Discount %</span>
                <input
                  name="discountPct"
                  type="number"
                  min={1}
                  max={90}
                  value={form.discountPct}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none"
                />
              </label>

              <label className="block text-sm">
                <span className="text-muted">Min Bill</span>
                <input
                  name="minSubtotal"
                  type="number"
                  min={0}
                  value={form.minSubtotal}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="block text-muted mb-1">Expiry Date</span>{" "}
              <Suspense
                fallback={
                  <input
                    type="text"
                    placeholder="Select expiry date"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
                    disabled
                  />
                }
              >
                {" "}
                <DatePicker
                  selected={form.expiresAt}
                  onChange={(date) =>
                    setForm((prev) => ({
                      ...prev,
                      expiresAt: date,
                    }))
                  }
                  minDate={new Date()}
                  isClearable
                  placeholderText="Select expiry date"
                  dateFormat="dd MMM yyyy"
                  wrapperClassName="w-full"
                  popperClassName="z-80"
                  popperPlacement="bottom-start"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                />
              </Suspense>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg bg-saffron text-white hover:bg-saffron2 disabled:opacity-60"
          >
            <Plus size={14} />
            {createMutation.isPending
              ? "Adding..."
              : patchMutation.isPending
                ? "Updating..."
                : isEditMode
                  ? "Update Offer"
                  : "Add Offer"}
          </button>

          {isEditMode ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="mt-2 w-full text-sm px-4 py-2 rounded-lg border border-border text-ink hover:bg-paper"
            >
              Cancel Edit
            </button>
          ) : null}

          {mutationError ? (
            <p className="mt-2 text-xs text-error">{mutationError}</p>
          ) : null}

          {formError ? (
            <p className="mt-2 text-xs text-error">{formError}</p>
          ) : null}
        </form>

        <div className="xl:col-span-2 bg-white border border-border rounded-xl p-5">
          <h2 className="font-bold text-ink mb-4">
            Offers for Your Restaurant
          </h2>

          {isLoading ? (
            <p className="text-sm text-muted">Loading offers...</p>
          ) : null}

          {isError ? (
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="text-sm text-error">
                {error?.message || "Failed to load offers."}
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-paper"
              >
                Retry
              </button>
            </div>
          ) : null}

          {!isLoading && !isError && offers.length === 0 ? (
            <p className="text-sm text-muted">No offers added yet.</p>
          ) : null}

          <div className="space-y-3">
            {offers.map((offer) => (
              <OfferRow
                key={offer.id}
                offer={offer}
                onEdit={startEdit}
                onToggleVisibility={() =>
                  patchMutation.mutate({
                    id: offer.id,
                    payload: { isVisible: !offer.isVisible },
                  })
                }
                onToggleActive={() =>
                  patchMutation.mutate({
                    id: offer.id,
                    payload: { isActive: !offer.isActive },
                  })
                }
                onDelete={() => deleteMutation.mutate(offer.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function OfferRow({
  offer,
  onEdit,
  onToggleVisibility,
  onToggleActive,
  onDelete,
}) {
  const meta = getOfferMeta(offer);

  return (
    <div className="border border-cream rounded-lg p-4 flex items-start justify-between gap-4">
      <div>
        <p className="font-semibold text-ink">{offer.title}</p>
        <p className="text-xs text-muted mt-1">
          Code: <span className="font-bold text-ink">{offer.code}</span> •{" "}
          {offer.discountPct}% off • Min ₹{offer.minSubtotal}
        </p>
        <p className="text-xs text-muted mt-1">
          Type: {getOfferTypeLabel(offer.offerType)} •{" "}
          {getOfferTargetLabel(offer)}
        </p>
        <p className="text-xs text-muted mt-1">
          Audience: {getOfferAudienceLabel(offer.audience)}
        </p>
        <p className="text-xs text-muted mt-1">{offer.description || "-"}</p>
        <p className="text-xs text-muted mt-1">
          Expiry: {meta.expiryLabel}
          {meta.isExpired ? " (Expired)" : ""}
        </p>
        <p className="text-xs mt-2">
          <StatusChip
            active={offer.isVisible}
            activeClass="border-sage text-sage"
            inactiveClass="border-muted2 text-muted"
            activeLabel="Visible"
            inactiveLabel="Hidden"
          />
          <span className="ml-2">
            <StatusChip
              active={offer.isActive}
              activeClass="border-saffron text-saffron"
              inactiveClass="border-muted2 text-muted"
              activeLabel="Active"
              inactiveLabel="Inactive"
            />
          </span>
          {meta.isExpired ? (
            <span className="ml-2 px-2 py-0.5 rounded-full border border-red-200 text-red-600">
              Expired
            </span>
          ) : null}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(offer)}
          className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-paper inline-flex items-center gap-1"
        >
          <PencilLine size={13} /> Edit
        </button>
        <button
          onClick={onToggleVisibility}
          className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-paper inline-flex items-center gap-1"
        >
          {offer.isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
          {offer.isVisible ? "Hide" : "Show"}
        </button>
        <button
          onClick={onToggleActive}
          className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-paper"
        >
          {offer.isActive ? "Disable" : "Enable"}
        </button>
        <button
          onClick={onDelete}
          className="text-xs px-2.5 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 inline-flex items-center gap-1"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}

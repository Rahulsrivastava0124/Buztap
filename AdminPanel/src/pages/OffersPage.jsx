import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, TicketPercent, Eye, EyeOff, Trash2 } from "lucide-react";
import {
  createOffer,
  deleteOffer,
  fetchOffers,
  updateOffer,
} from "../services/api";
import PageShell from "../components/layout/PageShell";

const EMPTY_FORM = {
  title: "",
  code: "",
  description: "",
  discountPct: 10,
  minSubtotal: 0,
};

export default function OffersPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);

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

  const createMutation = useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, payload }) => updateOffer(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["offers"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["offers"] }),
  });

  function onSubmit(e) {
    e.preventDefault();
    createMutation.mutate({
      title: form.title.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discountPct: Number(form.discountPct || 0),
      minSubtotal: Number(form.minSubtotal || 0),
      isVisible: true,
      isActive: true,
    });
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "discountPct" || name === "minSubtotal"
          ? Number(value || 0)
          : value,
    }));
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
            <h2 className="font-bold text-ink">Add Coupon / Offer</h2>
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
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg bg-saffron text-white hover:bg-saffron2 disabled:opacity-60"
          >
            <Plus size={14} />
            {createMutation.isPending ? "Adding..." : "Add Offer"}
          </button>

          {createMutation.error?.message ? (
            <p className="mt-2 text-xs text-error">
              {createMutation.error.message}
            </p>
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
              <div
                key={offer.id}
                className="border border-cream rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-ink">{offer.title}</p>
                  <p className="text-xs text-muted mt-1">
                    Code:{" "}
                    <span className="font-bold text-ink">{offer.code}</span> •{" "}
                    {offer.discountPct}% off • Min ₹{offer.minSubtotal}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {offer.description || "-"}
                  </p>
                  <p className="text-xs mt-2">
                    <span
                      className={`px-2 py-0.5 rounded-full border ${offer.isVisible ? "border-sage text-sage" : "border-muted2 text-muted"}`}
                    >
                      {offer.isVisible ? "Visible" : "Hidden"}
                    </span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full border ${offer.isActive ? "border-saffron text-saffron" : "border-muted2 text-muted"}`}
                    >
                      {offer.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      patchMutation.mutate({
                        id: offer.id,
                        payload: { isVisible: !offer.isVisible },
                      })
                    }
                    className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-paper inline-flex items-center gap-1"
                  >
                    {offer.isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                    {offer.isVisible ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() =>
                      patchMutation.mutate({
                        id: offer.id,
                        payload: { isActive: !offer.isActive },
                      })
                    }
                    className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-paper"
                  >
                    {offer.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(offer.id)}
                    className="text-xs px-2.5 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 inline-flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

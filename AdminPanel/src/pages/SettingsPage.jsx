import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Building2, Globe2, Save, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { fetchBusinessProfile, updateBusinessProfile } from "../services/api";
import PageShell from "../components/layout/PageShell";

const MENU_BASE = import.meta.env.VITE_MENU_BASE_URL || "http://localhost:5173";

function buildGuestMenuUrl(baseUrl, businessId, tableId = "04") {
  const base = String(baseUrl || "").replace(/\/$/, "");
  const params = new URLSearchParams({ table: tableId });

  if (businessId) {
    params.set("biz", String(businessId));
  }

  return `${base}/menu?${params.toString()}`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const SETTINGS = [
  {
    title: "Notifications",
    desc: "Kitchen alerts, order SLA, and payout messages",
    icon: Bell,
  },
  {
    title: "Access & Security",
    desc: "Roles, PIN lock, and device permissions",
    icon: ShieldCheck,
  },
  {
    title: "Regional Preferences",
    desc: "Timezone, language, currency and taxes",
    icon: Globe2,
  },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  socialLinks: {
    instagram: "",
    facebook: "",
    x: "",
    googleReview: "",
  },
  subdomain: "",
  branches: 1,
  tableCount: 0,
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [edited, setEdited] = useState({});
  const [saveMessage, setSaveMessage] = useState("");

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["business-profile"],
    queryFn: fetchBusinessProfile,
  });

  const form = useMemo(() => {
    return {
      ...EMPTY_FORM,
      ...(profile
        ? {
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            socialLinks: {
              instagram: profile.socialLinks?.instagram || "",
              facebook: profile.socialLinks?.facebook || "",
              x: profile.socialLinks?.x || "",
              googleReview: profile.socialLinks?.googleReview || "",
            },
            subdomain: profile.subdomain || slugify(profile.name) || "",
            branches: Number(profile.branches || 1),
            tableCount: Number(profile.tableCount ?? 0),
          }
        : {}),
      ...edited,
    };
  }, [profile, edited]);

  const mutation = useMutation({
    mutationFn: updateBusinessProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(["business-profile"], updated);
      setEdited({});
      setSaveMessage("Profile saved.");
      toast.success("Restaurant profile updated successfully.");
      setTimeout(() => setSaveMessage(""), 2500);
    },
    onError: (err) => {
      const msg = err?.message || "Failed to save restaurant profile.";
      toast.error(
        msg === "Route not found"
          ? "Profile update service is not available right now."
          : msg,
      );
    },
  });

  const previewMenuUrl = useMemo(
    () => buildGuestMenuUrl(MENU_BASE, profile?.id, "04"),
    [profile?.id],
  );

  function onChange(e) {
    const { name, value } = e.target;

    if (name.startsWith("socialLinks.")) {
      const socialKey = name.split(".")[1];
      setEdited((prev) => ({
        ...prev,
        socialLinks: {
          ...(prev.socialLinks || form.socialLinks),
          [socialKey]: value,
        },
      }));
      return;
    }

    setEdited((prev) => {
      const next = {
        ...prev,
        [name]: name === "branches" ? Number(value || 1) : value,
      };
      // Auto-fill subdomain from restaurant name (only when subdomain hasn't been manually overridden)
      if (name === "name") {
        const autoSlug = slugify(value);
        const currentSubdomain = prev.subdomain ?? form.subdomain;
        const expectedSlug = slugify(prev.name ?? form.name);
        // Only auto-update if subdomain still matches the previous auto-slug (not manually edited)
        if (!currentSubdomain || currentSubdomain === expectedSlug) {
          next.subdomain = autoSlug;
        }
      }
      return next;
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    setSaveMessage("");
    mutation.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      socialLinks: {
        instagram: form.socialLinks.instagram.trim(),
        facebook: form.socialLinks.facebook.trim(),
        x: form.socialLinks.x.trim(),
        googleReview: form.socialLinks.googleReview.trim(),
      },
      subdomain: form.subdomain.trim().toLowerCase(),
      branches: Math.max(1, Number(form.branches || 1)),
    });
  }

  return (
    <PageShell>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form
          onSubmit={onSubmit}
          className="xl:col-span-2 bg-white border border-border rounded-xl p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-paper border border-border flex items-center justify-center">
                <Building2 size={18} className="text-saffron" />
              </div>
              <div>
                <h3 className="font-bold text-ink">Restaurant Profile</h3>
                <p className="text-xs text-muted">
                  This data is used in dashboard and reports.
                </p>
              </div>
            </div>
            {profile ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-paper border border-border text-muted">
                Plan: {profile.plan}
              </span>
            ) : null}
          </div>

          {isLoading ? (
            <div className="text-sm text-muted py-6">Loading profile...</div>
          ) : null}

          {isError ? (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => refetch()}
                className="text-xs px-3 py-1.5 rounded-md border border-border bg-white text-muted hover:text-ink"
              >
                Retry loading profile
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="text-muted">Restaurant Name</span>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="e.g. Spice Route"
              />
            </label>

            <label className="text-sm">
              <span className="text-muted">Official Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="owner@restaurant.com"
              />
            </label>

            <label className="text-sm">
              <span className="text-muted">Phone Number</span>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="+91 98xxxxxxx"
              />
            </label>

            <label className="text-sm">
              <span className="text-muted">Branches</span>
              <input
                name="branches"
                type="number"
                min={1}
                value={form.branches}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
              />
            </label>

            <label className="text-sm">
              <span className="text-muted">Table Count</span>
              <input
                name="tableCount"
                type="number"
                min={0}
                value={form.tableCount}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
              />
            </label>

            <label className="text-sm md:col-span-2">
              <span className="text-muted">Address</span>
              <textarea
                name="address"
                value={form.address}
                onChange={onChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30 resize-none"
                placeholder="Complete outlet address"
              />
            </label>

            <label className="text-sm">
              <span className="text-muted">Instagram URL</span>
              <input
                name="socialLinks.instagram"
                value={form.socialLinks.instagram}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="https://instagram.com/yourrestaurant"
              />
            </label>

            <label className="text-sm">
              <span className="text-muted">Facebook URL</span>
              <input
                name="socialLinks.facebook"
                value={form.socialLinks.facebook}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="https://facebook.com/yourrestaurant"
              />
            </label>

            <label className="text-sm">
              <span className="text-muted">X URL</span>
              <input
                name="socialLinks.x"
                value={form.socialLinks.x}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="https://x.com/yourrestaurant"
              />
            </label>

            <label className="text-sm">
              <span className="text-muted">Google Review URL</span>
              <input
                name="socialLinks.googleReview"
                value={form.socialLinks.googleReview}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="https://g.page/r/your-review-link"
              />
            </label>

            <label className="text-sm md:col-span-2">
              <span className="text-muted">Restaurant Slug</span>
              <div className="mt-1 flex items-center rounded-lg border border-border overflow-hidden">
                <span className="px-3 py-2.5 text-xs bg-paper border-r border-border text-muted shrink-0">
                  slug
                </span>
                <input
                  name="subdomain"
                  value={form.subdomain}
                  onChange={onChange}
                  className="w-full px-3 py-2.5 text-sm outline-none"
                  placeholder="spice-route"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted">
                This slug identifies your restaurant. The live guest menu opens
                in the menu route below.
              </p>
              {previewMenuUrl ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-xs text-muted">Menu link:</span>
                  <a
                    href={previewMenuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-saffron font-medium hover:underline break-all"
                  >
                    {previewMenuUrl}
                  </a>
                </div>
              ) : null}
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="text-xs text-muted min-h-4">
              {saveMessage || mutation.error?.message || ""}
            </div>
            <button
              type="submit"
              disabled={mutation.isPending || isLoading}
              className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-saffron text-white hover:bg-saffron2 disabled:opacity-60"
            >
              <Save size={14} />
              {mutation.isPending ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {SETTINGS.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-border rounded-xl p-5"
            >
              <div className="w-10 h-10 rounded-lg bg-paper border border-border flex items-center justify-center mb-3">
                <item.icon size={18} className="text-saffron" />
              </div>
              <h3 className="font-semibold text-ink">{item.title}</h3>
              <p className="text-sm text-muted mt-1">{item.desc}</p>
              <button
                type="button"
                className="mt-4 text-sm px-3 py-1.5 rounded-md border border-border text-muted"
              >
                Coming Soon
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

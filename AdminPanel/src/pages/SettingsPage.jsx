import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Building2,
  Globe2,
  ImageUp,
  Printer,
  QrCode,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchBusinessProfile,
  fetchTableQr,
  fetchTables,
  updateBusinessProfile,
  uploadMenuImage,
  parseMenuFile,
  bulkCreateMenuItems,
} from "../services/api";
import PageShell from "../components/layout/PageShell";

const MENU_BASE = import.meta.env.VITE_MENU_BASE_URL || "http://localhost:5173";

function normalizeMenuBase(baseUrl) {
  const raw = String(baseUrl || "").trim();
  if (!raw) return "";

  // Ensure absolute URL; prevents browser from treating domain-like text as relative path.
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let url;
  try {
    url = new URL(withProtocol);
  } catch {
    return "";
  }

  // Admin host should never be used for guest menu links.
  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || "buzingbee.com";
  if (url.hostname === `restroadmin.${baseDomain}`) {
    url.hostname = `restro.${baseDomain}`;
  }

  return url.toString().replace(/\/$/, "");
}

function buildGuestMenuUrl(baseUrl, businessId, tableId = "04", slug = "") {
  const base = normalizeMenuBase(baseUrl);
  if (!base) return "";
  const params = new URLSearchParams();
  if (slug) params.set("restro", slug);
  params.set("table", tableId);
  if (businessId) params.set("biz", String(businessId));
  return `${base}/order?${params.toString()}`;
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
  gstPct: 5,
  taxPct: 0,
  gstNo: "",
  restroUpi: "",
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

function TableQrCard() {
  const [selectedTableId, setSelectedTableId] = useState("");
  const [qrData, setQrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: fetchBusinessProfile,
    staleTime: 60_000,
  });

  const { data: tables = [] } = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
    staleTime: 60_000,
  });

  const qrImageUrl = qrData?.menuUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData.menuUrl)}`
    : "";
  const qrRestroName = String(qrData?.businessName || "BuzTap").trim();
  const qrTableLabel = qrData?.table?.label || qrData?.tableId || "Table";
  const qrPinLabel =
    qrRestroName.length > 24 ? `${qrRestroName.slice(0, 24)}...` : qrRestroName;
  const qrLogoUrl =
    String(qrData?.business?.logoImage || profile?.logoImage || "").trim() ||
    "";

  const handleGenerate = async () => {
    const tableId = selectedTableId || tables[0]?.id;
    if (!tableId) {
      toast.error("No table selected.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchTableQr(tableId);
      setQrData(data);
    } catch (err) {
      toast.error(err?.message || "Unable to generate QR.");
    } finally {
      setIsLoading(false);
    }
  };

  const printQr = () => {
    if (!qrData || !qrImageUrl) return;
    const popup = window.open("", "_blank", "width=760,height=840");
    if (!popup) {
      toast.error("Please allow popups to print QR.");
      return;
    }
    const title = `${qrRestroName} — ${qrTableLabel}`;
    popup.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 24px; text-align: center; color: #222; background: #f5f0e8; }
            .card { border: 1px solid #e5ddd1; border-radius: 22px; padding: 24px; max-width: 560px; margin: 0 auto; background: #fff; box-shadow: 0 14px 38px rgba(15,14,11,0.08); }
            .meta { margin: 0 0 12px; color: #7b756b; font-size: 14px; }
            h1 { margin: 0 0 6px; font-size: 26px; }
            p { margin: 4px 0; color: #555; }
            .qr-wrap { position: relative; width: 320px; height: 320px; margin: 16px auto; border-radius: 18px; padding: 10px; background: #faf7f2; border: 1px solid #e5ddd1; }
            .qr-wrap .qr-main { width: 100%; height: 100%; display: block; border-radius: 10px; }
            .pin { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; border: 1px solid #f2d5b9; border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 700; color: #e8720c; max-width: 72%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 6px 18px rgba(232,114,12,0.16); }
            .pin-logo { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 44px; height: 44px; border-radius: 12px; overflow: hidden; display: block; object-fit: contain; background: #fff; padding: 4px; border: 1px solid #f2d5b9; box-shadow: 0 6px 18px rgba(232,114,12,0.16); }
            .hint { margin-top: 8px; font-size: 13px; color: #7b756b; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${qrRestroName}</h1>
            <p class="meta"><strong>${qrTableLabel}</strong> · Seats: ${qrData.table?.seats ?? "-"}</p>
            <div class="qr-wrap">
              <img class="qr-main" src="${qrImageUrl}" alt="Table QR" />
              ${qrLogoUrl ? `<img class="pin-logo" src="${qrLogoUrl}" alt="Logo" />` : `<div class="pin">${qrPinLabel}</div>`}
            </div>
            <p class="hint">Scan to view menu and place order</p>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    popup.document.close();
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="w-10 h-10 rounded-lg bg-paper border border-border flex items-center justify-center mb-3">
        <QrCode size={18} className="text-saffron" />
      </div>
      <h3 className="font-semibold text-ink">Table QR Codes</h3>
      <p className="text-sm text-muted mt-1">
        Generate and print QR codes for any table.
      </p>

      <div className="mt-4 space-y-3">
        <select
          value={selectedTableId}
          onChange={(e) => {
            setSelectedTableId(e.target.value);
            setQrData(null);
          }}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
        >
          <option value="">Select a table…</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.id} ({t.seats} seats)
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-saffron hover:brightness-95 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-bold flex items-center justify-center gap-2"
        >
          <QrCode size={15} />
          {isLoading ? "Generating..." : "Generate QR"}
        </button>

        {qrData && qrImageUrl && (
          <>
            <div className="rounded-2xl border border-border bg-linear-to-b from-white to-paper p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm font-bold text-ink leading-none">
                  {qrRestroName}
                </p>
                <span className="text-[11px] font-semibold text-saffron bg-saffron-lt px-2 py-1 rounded-full">
                  {qrTableLabel}
                </span>
              </div>

              <div className="relative rounded-xl border border-border bg-white p-2 flex justify-center">
                <img
                  src={qrImageUrl}
                  alt={`QR for ${qrTableLabel}`}
                  className="w-52 h-52 object-contain"
                />
                {qrLogoUrl ? (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl border border-saffron/30 bg-white shadow-[0_6px_16px_rgba(232,114,12,0.14)] p-1.5 overflow-hidden">
                    <img
                      src={qrLogoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </span>
                ) : (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[70%] truncate rounded-full border border-saffron/30 bg-white px-3 py-1 text-[11px] font-bold text-saffron shadow-[0_6px_16px_rgba(232,114,12,0.14)]">
                    {qrPinLabel}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-muted text-center mt-2">
                Scan to open menu and place order
              </p>
            </div>
            <button
              type="button"
              onClick={printQr}
              className="w-full border border-border hover:bg-paper text-ink rounded-lg py-2 text-sm font-bold flex items-center justify-center gap-2"
            >
              <Printer size={15} />
              Print QR
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AiMenuUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    if (selected.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selected));
    } else if (selected.type === "application/pdf") {
      setPreview("pdf");
    } else {
      setPreview(null);
    }
    setParsedData(null);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsParsing(true);
    try {
      const data = await parseMenuFile(file);
      if (data && data.categories) {
        setParsedData(data);
        toast.success("Menu extracted successfully. Please review.");
      } else {
        throw new Error("Invalid AI response structure.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to parse menu using AI.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedData?.categories) return;
    setIsSaving(true);
    try {
      // Flatten categories into items
      const itemsToCreate = [];
      for (const cat of parsedData.categories) {
        if (!cat.items || !Array.isArray(cat.items)) continue;
        for (const item of cat.items) {
          itemsToCreate.push({
            category: cat.name || "Uncategorized",
            name: item.name || "Unknown Item",
            description: item.description || "",
            price: Number(item.price) || 0,
            isVeg: Boolean(item.isVeg),
          });
        }
      }
      
      if (itemsToCreate.length === 0) {
        toast.error("No valid items found to save.");
        return;
      }

      const res = await bulkCreateMenuItems(itemsToCreate);
      toast.success(`${res.count} items added to your menu!`);
      setFile(null);
      setPreview(null);
      setParsedData(null);
    } catch (err) {
      toast.error(err?.message || "Failed to save menu items.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-ink text-lg">AI Menu Digitization ✨</h3>
      </div>
      <p className="text-sm text-muted mb-4">
        Upload a photo or PDF of your physical menu. Our AI will automatically extract categories and items for you.
      </p>

      {!parsedData ? (
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm px-4 py-2 rounded-lg border border-border text-ink hover:bg-paper font-medium"
            >
              Select Menu File
            </button>
            {file && (
              <span className="text-sm text-muted truncate max-w-[200px]">
                {file.name}
              </span>
            )}
          </div>

          {preview && (
            <div className="mt-4 p-3 border border-border rounded-lg bg-paper">
              {preview === "pdf" ? (
                <div className="text-center p-6 bg-white rounded border border-border text-saffron font-bold">
                  PDF Document
                </div>
              ) : (
                <img src={preview} alt="Menu preview" className="max-h-64 object-contain rounded mx-auto" />
              )}
            </div>
          )}

          {file && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isParsing}
              className="w-full bg-saffron hover:bg-saffron2 text-white font-bold py-2.5 rounded-lg disabled:opacity-60 flex justify-center items-center gap-2"
            >
              {isParsing ? "Analyzing with AI..." : "Extract Menu Items"}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="max-h-80 overflow-y-auto border border-border rounded-lg p-4 bg-paper space-y-4">
            {parsedData.categories.map((cat, i) => (
              <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-border">
                <h4 className="font-bold text-saffron border-b border-border pb-1 mb-2">
                  {cat.name}
                </h4>
                <div className="space-y-2">
                  {cat.items?.map((item, j) => (
                    <div key={j} className="flex justify-between items-start text-sm">
                      <div>
                        <p className="font-semibold text-ink">
                          {item.name} {item.isVeg && <span className="text-green-600 text-[10px] ml-1">● VEG</span>}
                        </p>
                        {item.description && <p className="text-muted text-xs">{item.description}</p>}
                      </div>
                      <span className="font-bold text-ink">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setParsedData(null);
                setFile(null);
                setPreview(null);
              }}
              className="flex-1 py-2 rounded-lg border border-border text-ink hover:bg-paper font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSaving}
              className="flex-1 bg-saffron hover:bg-saffron2 text-white font-bold py-2 rounded-lg disabled:opacity-60 text-sm"
            >
              {isSaving ? "Saving..." : "Confirm & Add to Menu"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [edited, setEdited] = useState({});
  const [saveMessage, setSaveMessage] = useState("");
  const [headerPreview, setHeaderPreview] = useState(null);
  const [headerFile, setHeaderFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const headerInputRef = useRef(null);
  const logoInputRef = useRef(null);

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
            gstPct: Number(profile.gstPct ?? 5),
            taxPct: Number(profile.taxPct ?? 0),
            gstNo: profile.gstNo || "",
            restroUpi: profile.restroUpi || "",
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

  const headerMutation = useMutation({
    mutationFn: async (file) => {
      const url = await uploadMenuImage(file);
      return updateBusinessProfile({ headerImage: url });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["business-profile"], updated);
      setHeaderFile(null);
      setHeaderPreview(null);
      toast.success("Header image updated.");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to upload header image.");
    },
  });

  const logoMutation = useMutation({
    mutationFn: async (file) => {
      const url = await uploadMenuImage(file);
      return updateBusinessProfile({ logoImage: url });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["business-profile"], updated);
      setLogoFile(null);
      setLogoPreview(null);
      toast.success("Logo updated.");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to upload logo.");
    },
  });

  const previewMenuUrl = useMemo(
    () => buildGuestMenuUrl(MENU_BASE, profile?.id, "04", form.subdomain),
    [profile?.id, form.subdomain],
  );

  function normalizeNumericField(name, rawValue) {
    const num = Number(rawValue);
    if (!Number.isFinite(num)) {
      return name === "branches" ? 1 : 0;
    }

    if (name === "branches") {
      return Math.max(1, Math.round(num));
    }

    if (name === "tableCount") {
      return Math.max(0, Math.round(num));
    }

    if (name === "gstPct" || name === "taxPct") {
      return Math.min(100, Math.max(0, Number(num.toFixed(2))));
    }

    return num;
  }

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
      const isNumericField =
        name === "branches" ||
        name === "tableCount" ||
        name === "gstPct" ||
        name === "taxPct";
      const normalizedValue = isNumericField
        ? normalizeNumericField(name, value)
        : name === "gstNo"
          ? value.toUpperCase()
          : value;

      const next = {
        ...prev,
        [name]: normalizedValue,
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

  function onNumericBlur(e) {
    const { name } = e.target;
    if (
      name !== "branches" &&
      name !== "tableCount" &&
      name !== "gstPct" &&
      name !== "taxPct"
    ) {
      return;
    }

    setEdited((prev) => {
      const currentValue = prev[name] ?? form[name];
      return {
        ...prev,
        [name]: normalizeNumericField(name, currentValue),
      };
    });
  }

  function validateSelectedImage(file) {
    if (!file.type?.startsWith("image/")) {
      toast.error("Only image files are supported.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5 MB.");
      return false;
    }
    return true;
  }

  function onHeaderFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateSelectedImage(file)) {
      e.target.value = "";
      return;
    }
    setHeaderFile(file);
    setHeaderPreview(URL.createObjectURL(file));
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  function onLogoFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateSelectedImage(file)) {
      e.target.value = "";
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function onSubmit(e) {
    e.preventDefault();
    setSaveMessage("");
    mutation.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      gstPct: Math.min(100, Math.max(0, Number(form.gstPct || 0))),
      taxPct: Math.min(100, Math.max(0, Number(form.taxPct || 0))),
      gstNo: form.gstNo.trim().toUpperCase(),
      restroUpi: form.restroUpi.trim(),
      socialLinks: {
        instagram: form.socialLinks.instagram.trim(),
        facebook: form.socialLinks.facebook.trim(),
        x: form.socialLinks.x.trim(),
        googleReview: form.socialLinks.googleReview.trim(),
      },
      subdomain: form.subdomain.trim().toLowerCase(),
      branches: Math.max(1, Number(form.branches || 1)),
      tableCount: Math.max(0, Number(form.tableCount || 0)),
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

          <div className="mb-5 p-4 rounded-lg border border-border bg-paper">
            <p className="text-sm font-medium text-ink mb-3">Brand Images</p>
            <p className="text-xs text-muted mb-3">
              Compact upload controls for menu header and logo. Max size 5 MB
              per image.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-white p-3">
                <p className="text-xs font-semibold text-ink">Header Image</p>
                <div className="mt-2 h-20 rounded-md border border-border overflow-hidden bg-paper flex items-center justify-center">
                  {headerPreview || profile?.headerImage ? (
                    <img
                      src={headerPreview || profile.headerImage}
                      alt="Header preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageUp size={18} className="text-muted" />
                  )}
                </div>
                <input
                  ref={headerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onHeaderFileChange}
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => headerInputRef.current?.click()}
                    className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-paper"
                  >
                    Choose
                  </button>
                  <button
                    type="button"
                    disabled={!headerFile || headerMutation.isPending}
                    onClick={() => headerMutation.mutate(headerFile)}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-saffron text-white hover:bg-saffron2 disabled:opacity-60"
                  >
                    {headerMutation.isPending ? "Uploading..." : "Upload"}
                  </button>
                  {headerFile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderFile(null);
                        setHeaderPreview(null);
                      }}
                      className="p-1.5 rounded-md border border-border text-muted hover:text-ink"
                    >
                      <X size={12} />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-white p-3">
                <p className="text-xs font-semibold text-ink">Logo</p>
                <div className="mt-2 h-20 rounded-md border border-border overflow-hidden bg-paper flex items-center justify-center">
                  {logoPreview || profile?.logoImage ? (
                    <img
                      src={logoPreview || profile.logoImage}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageUp size={18} className="text-muted" />
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onLogoFileChange}
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-paper"
                  >
                    Choose
                  </button>
                  <button
                    type="button"
                    disabled={!logoFile || logoMutation.isPending}
                    onClick={() => logoMutation.mutate(logoFile)}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-saffron text-white hover:bg-saffron2 disabled:opacity-60"
                  >
                    {logoMutation.isPending ? "Uploading..." : "Upload"}
                  </button>
                  {logoFile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="p-1.5 rounded-md border border-border text-muted hover:text-ink"
                    >
                      <X size={12} />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

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
              <span className="text-muted">Restaurant UPI ID</span>
              <input
                name="restroUpi"
                value={form.restroUpi}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="yourupi@bank"
              />
            </label>

            <label className="text-sm">
              <span className="text-muted">GST No (GSTIN)</span>
              <input
                name="gstNo"
                value={form.gstNo}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="22AAAAA0000A1Z5"
              />
            </label>

            <label className="text-sm">
              <span className="text-muted">GST %</span>
              <input
                name="gstPct"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={form.gstPct === 0 ? "" : form.gstPct}
                onChange={onChange}
                onBlur={onNumericBlur}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="5"
              />
            </label>

            <label className="text-sm">
              <span className="text-muted">Additional Tax %</span>
              <input
                name="taxPct"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={form.taxPct === 0 ? "" : form.taxPct}
                onChange={onChange}
                onBlur={onNumericBlur}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-saffron/30"
                placeholder="0"
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
                onBlur={onNumericBlur}
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
                onBlur={onNumericBlur}
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
          <AiMenuUpload />
          <TableQrCard />
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

const Table = require("../models/Table");
const Business = require("../models/Business");
const MenuItem = require("../models/MenuItem");

const DEFAULT_MENU_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";

function getTableLabel(tableId) {
  if (!tableId) return "";
  return /^table\b/i.test(tableId) ? tableId : `Table ${tableId}`;
}

function mapPublicBusiness(business) {
  if (!business) return null;

  return {
    id: String(business._id),
    name: business.name || "",
    phone: business.phone || "",
    address: business.address || "",
    restroUpi: business.restroUpi || "",
    headerImage: business.headerImage || "",
    logoImage: business.logoImage || "",
    socialLinks: {
      instagram: business.socialLinks?.instagram || "",
      facebook: business.socialLinks?.facebook || "",
      x: business.socialLinks?.x || "",
      googleReview: business.socialLinks?.googleReview || "",
    },
  };
}

function mapPublicMenuItem(item) {
  const options = Array.isArray(item.priceOptions)
    ? item.priceOptions
        .map((opt) => ({
          label: String(opt?.label || "").trim(),
          price: Number(opt?.price || 0),
        }))
        .filter((opt) => opt.label && opt.price > 0)
    : [];

  return {
    id: String(item._id),
    name: item.name || "",
    price: Number(item.price || 0),
    priceOptions: options,
    originalPrice: null,
    veg: Boolean(item.isVeg),
    rating: 4.5,
    popular: false,
    desc: item.description || "",
    img: item.image || DEFAULT_MENU_IMAGE,
    category: item.category || "Menu",
  };
}

function normalizeBaseUrl(value) {
  const base = String(value || "").trim();
  if (!base) return "";
  return base.replace(/\/$/, "");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getRequestOrigin(req) {
  const explicitOrigin = normalizeBaseUrl(req.get("origin"));
  if (explicitOrigin) return explicitOrigin;

  const forwardedProto = String(req.get("x-forwarded-proto") || "").trim();
  const forwardedHost = String(req.get("x-forwarded-host") || "").trim();
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = String(req.get("host") || "").trim();
  if (!host) return "";
  const proto = req.protocol || "https";
  return `${proto}://${host}`;
}

function buildMenuUrl({ req, tableId, businessId, subdomain, slug }) {
  const appBaseDomain = process.env.APP_BASE_DOMAIN || "";

  function makeUrl(base) {
    const params = new URLSearchParams();
    if (slug) params.set("restro", slug);
    params.set("table", tableId);
    params.set("biz", String(businessId));
    return `${base}/order?${params.toString()}`;
  }

  // Priority 1 — Subdomain routing (e.g. rahulrestro.buztap.com)
  if (subdomain && appBaseDomain) {
    return makeUrl(`https://${subdomain}.${appBaseDomain}`);
  }

  // Priority 2 — Explicitly set public customer-facing menu URL
  const publicMenuBase = normalizeBaseUrl(process.env.PUBLIC_MENU_BASE_URL);
  if (publicMenuBase) return makeUrl(publicMenuBase);

  // Priority 3 — Local dev: use request origin only when it's localhost
  const baseFromRequest = getRequestOrigin(req);
  const isLocalOrigin = /localhost|127\.0\.0\.1/i.test(baseFromRequest);
  if (isLocalOrigin && baseFromRequest) return makeUrl(baseFromRequest);

  // Priority 4 — Legacy MENU_APP_BASE_URL, skip if it's an admin domain
  const legacyBase =
    normalizeBaseUrl(process.env.MENU_APP_BASE_URL) ||
    normalizeBaseUrl(process.env.MENU_WEB_BASE_URL);
  const isAdminDomain = /admin/i.test(legacyBase);
  if (legacyBase && !isAdminDomain) return makeUrl(legacyBase);

  // Final fallback — hardcoded production guest app domain
  return makeUrl("https://buztap.com");
}

function buildTableIdCandidates(rawTableId) {
  const value = String(rawTableId || "").trim();
  if (!value) return [];

  const set = new Set([value]);
  const digits = value.replace(/\D/g, "");

  if (digits) {
    const n = Number(digits);
    if (Number.isFinite(n) && n > 0) {
      const plain = String(n);
      const padded = String(n).padStart(2, "0");
      set.add(plain);
      set.add(padded);
      set.add(`T-${plain}`);
      set.add(`T-${padded}`);
    }
  }

  return Array.from(set);
}

async function getQr(req, res, next) {
  try {
    const tableId = String(req.params.tableId || "").trim();
    const bizParam = String(req.query.biz || req.query.businessId || "").trim();
    const restroParam = String(req.query.restro || req.query.slug || "").trim();

    let scopedBusinessId = null;

    if (bizParam) {
      scopedBusinessId = bizParam;
    } else if (restroParam) {
      const businessFromSlug = await Business.findOne({
        subdomain: restroParam,
      })
        .select("_id")
        .lean();
      scopedBusinessId = businessFromSlug?._id || null;
    } else if (req.user?.businessId) {
      // Admin calling from the dashboard — scope to their own business
      scopedBusinessId = req.user.businessId;
    }

    const tableIdCandidates = buildTableIdCandidates(tableId);

    const tableQuery = scopedBusinessId
      ? { tableId: { $in: tableIdCandidates }, businessId: scopedBusinessId }
      : { tableId: { $in: tableIdCandidates } };

    const table = await Table.findOne(tableQuery)
      .select("tableId seats area businessId")
      .lean();
    if (!table) return res.status(404).json({ error: "Table not found" });

    const [business, totalTables, availableMenuItems] = await Promise.all([
      Business.findById(table.businessId)
        .select(
          "name phone address socialLinks subdomain headerImage logoImage restroUpi",
        )
        .lean(),
      Table.countDocuments({ businessId: table.businessId, isActive: true }),
      MenuItem.find({ businessId: table.businessId, isAvailable: true })
        .select("name price priceOptions isVeg description image category")
        .sort({ category: 1, name: 1 })
        .lean(),
    ]);

    // Fallback: if all items are marked unavailable, still expose the catalog
    // so customer menu does not appear blank.
    const menuItems =
      availableMenuItems.length > 0
        ? availableMenuItems
        : await MenuItem.find({ businessId: table.businessId })
            .select("name price priceOptions isVeg description image category")
            .sort({ category: 1, name: 1 })
            .lean();
    const resolvedSlug = slugify(business?.subdomain || business?.name || "");
    const menuUrl = buildMenuUrl({
      req,
      tableId: table.tableId,
      businessId: table.businessId,
      subdomain: business?.subdomain || "",
      slug: resolvedSlug,
    });

    res.set("Cache-Control", "public, max-age=30");

    res.json({
      tableId: table.tableId,
      qrValue: menuUrl,
      menuUrl,
      businessName: business?.name || "",
      totalTables,
      table: {
        id: table.tableId,
        label: getTableLabel(table.tableId),
        seats: Number(table.seats || 0),
        area: table.area || "",
      },
      business: mapPublicBusiness(business),
      menuItems: menuItems.map(mapPublicMenuItem),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getQr };

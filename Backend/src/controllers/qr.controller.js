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
    socialLinks: {
      instagram: business.socialLinks?.instagram || "",
      facebook: business.socialLinks?.facebook || "",
      x: business.socialLinks?.x || "",
      googleReview: business.socialLinks?.googleReview || "",
    },
  };
}

function mapPublicMenuItem(item) {
  return {
    id: String(item._id),
    name: item.name || "",
    price: Number(item.price || 0),
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
  return makeUrl("https://restro.buzingbee.com");
}

async function getQr(req, res, next) {
  try {
    const table = await Table.findOne({ tableId: req.params.tableId })
      .select("tableId seats area businessId")
      .lean();
    if (!table) return res.status(404).json({ error: "Table not found" });

    const [business, totalTables, menuItems] = await Promise.all([
      Business.findById(table.businessId)
        .select("name phone address socialLinks subdomain")
        .lean(),
      Table.countDocuments({ businessId: table.businessId, isActive: true }),
      MenuItem.find({ businessId: table.businessId, isAvailable: true })
        .select("name price isVeg description image category")
        .sort({ category: 1, name: 1 })
        .lean(),
    ]);
    const menuUrl = buildMenuUrl({
      req,
      tableId: table.tableId,
      businessId: table.businessId,
      subdomain: business?.subdomain || "",
      slug: business?.subdomain || "",
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

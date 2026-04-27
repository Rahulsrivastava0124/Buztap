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

function buildMenuUrl({ tableId, businessId, subdomain }) {
  const localMenuBase =
    process.env.MENU_APP_BASE_URL || "http://localhost:5173";
  const appBaseDomain = process.env.APP_BASE_DOMAIN || "";

  if (subdomain && appBaseDomain) {
    return `https://${subdomain}.${appBaseDomain}/demo?table=${encodeURIComponent(tableId)}&biz=${encodeURIComponent(String(businessId))}`;
  }

  return `${localMenuBase}/demo?table=${encodeURIComponent(tableId)}&biz=${encodeURIComponent(String(businessId))}`;
}

async function getQr(req, res, next) {
  try {
    const table = await Table.findOne({ tableId: req.params.tableId }).lean();
    if (!table) return res.status(404).json({ error: "Table not found" });

    const [business, totalTables, menuItems] = await Promise.all([
      Business.findById(table.businessId).lean(),
      Table.countDocuments({ businessId: table.businessId, isActive: true }),
      MenuItem.find({ businessId: table.businessId, isAvailable: true })
        .sort({ category: 1, name: 1 })
        .lean(),
    ]);
    const menuUrl = buildMenuUrl({
      tableId: table.tableId,
      businessId: table.businessId,
      subdomain: business?.subdomain || "",
    });

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

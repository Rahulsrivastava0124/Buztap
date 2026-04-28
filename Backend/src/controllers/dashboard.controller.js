const Order = require("../models/Order");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItem");
const Inventory = require("../models/Inventory");
const Analytics = require("../models/Analytics");
const PaymentChannel = require("../models/PaymentChannel");
const Guest = require("../models/Guest");
const Business = require("../models/Business");

async function getSnapshot(req, res, next) {
  try {
    const { businessId } = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all today's orders and menu items in parallel
    const [liveOrders, todayOrders, tables, channels, menuItems] =
      await Promise.all([
        Order.find({ businessId, status: { $in: ["Preparing", "Ready"] } })
          .sort({ createdAt: 1 })
          .limit(10)
          .lean(),
        Order.find({ businessId, createdAt: { $gte: today } }).lean(),
        Table.find({ businessId, isActive: true }).lean(),
        PaymentChannel.find({ businessId }).lean(),
        MenuItem.find({ businessId }).select("name category cost").lean(),
      ]);

    // Build name→{category, cost} lookup from menu items
    const menuMap = {};
    for (const m of menuItems) {
      menuMap[m.name] = {
        category: m.category || "Other",
        cost: Number(m.cost || 0),
      };
    }

    // Kitchen queue
    const kitchenQueue = liveOrders.map((o, i) => ({
      ticket: o.orderId,
      stage: o.status === "Preparing" ? "Prep" : "Ready",
      wait: `${Math.ceil((Date.now() - new Date(o.createdAt).getTime()) / 60000)}m`,
      priority: i === 0 ? "High" : "Normal",
    }));

    // Area load from tables
    const areaMap = {};
    for (const t of tables) {
      const key = t.area || "Main Floor";
      if (!areaMap[key])
        areaMap[key] = { area: key, occupied: 0, total: 0, avgTurn: 0 };
      areaMap[key].total++;
      if (t.status === "Occupied") areaMap[key].occupied++;
    }
    const areaLoad = Object.values(areaMap);

    // Payment breakup from payment channels
    const paymentBreakup = channels.map((c) => ({
      label: c.channel,
      amount: c.gross,
      share: 0,
    }));
    const totalGrossChannels = paymentBreakup.reduce((s, c) => s + c.amount, 0);
    paymentBreakup.forEach((p) => {
      p.share =
        totalGrossChannels > 0
          ? Math.round((p.amount / totalGrossChannels) * 100)
          : 0;
    });

    const settlements = channels.map((c) => ({
      channel: c.channel,
      gross: c.gross,
      fee: c.fee,
      net: c.net,
      status: c.settleStatus,
    }));

    // Today's financial KPIs
    const completedOrders = todayOrders.filter(
      (o) => o.status === "Served" || o.paymentStatus === "Completed",
    );
    const grossSales = completedOrders.reduce((s, o) => s + (o.total || 0), 0);
    const gstAmount = Math.round(grossSales * 0.05);

    // Total units sold today
    const totalUnitsSold = todayOrders.reduce((s, o) => {
      return (
        s + (o.items || []).reduce((a, item) => a + (item.quantity || 0), 0)
      );
    }, 0);

    // Product mix with real category + margin
    const productMap = {};
    for (const order of todayOrders) {
      for (const item of order.items) {
        const key = item.name;
        const meta = menuMap[key] || { category: "Other", cost: 0 };
        if (!productMap[key]) {
          productMap[key] = {
            name: key,
            units: 0,
            revenue: 0,
            category: meta.category,
            cost: meta.cost,
          };
        }
        productMap[key].units += item.quantity || 0;
        productMap[key].revenue += item.total || 0;
      }
    }
    const productMix = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p) => {
        const margin =
          p.revenue > 0
            ? Math.round(((p.revenue - p.cost * p.units) / p.revenue) * 100)
            : 0;
        const lowStock = (menuMap[p.name]?.cost || 0) === 0;
        return {
          name: p.name,
          category: p.category,
          units: p.units,
          revenue: p.revenue,
          margin: Math.max(0, margin),
          stock: lowStock ? "Low" : "Healthy",
        };
      });

    // Top category by revenue
    const catRevMap = {};
    for (const p of Object.values(productMap)) {
      catRevMap[p.category] = (catRevMap[p.category] || 0) + p.revenue;
    }
    const topCategory =
      Object.entries(catRevMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    // Avg table turnover (creation → served, in minutes)
    const servedOrders = todayOrders.filter((o) => o.status === "Served");
    const avgTableTurnover =
      servedOrders.length > 0
        ? Math.round(
            servedOrders.reduce((s, o) => {
              const diff =
                new Date(o.updatedAt).getTime() -
                new Date(o.createdAt).getTime();
              return s + diff / 60000;
            }, 0) / servedOrders.length,
          )
        : 0;

    // QR KPIs
    const qrOrdersToday = todayOrders.filter((o) => o.source === "QR");
    const qrScans = qrOrdersToday.length;
    const qrConvRate =
      todayOrders.length > 0
        ? Math.round((qrScans / todayOrders.length) * 100)
        : 0;

    const channelSplit = [
      {
        channel: "POS Walk-in",
        value: todayOrders.filter((o) => o.source === "POS").length,
      },
      { channel: "QR Dine-in", value: qrScans },
    ];

    res.json({
      paymentBreakup,
      settlements,
      productMix,
      areaLoad,
      kitchenQueue,
      channelSplit,
      grossSales,
      gstAmount,
      totalUnitsSold,
      topCategory,
      avgTableTurnover,
      qrScans,
      qrConvRate,
      dailyRevenue: grossSales,
      totalOrders: todayOrders.length,
    });
  } catch (err) {
    next(err);
  }
}

async function getRevenueTrend(req, res, next) {
  try {
    const { businessId } = req.user;
    const { range = "1D" } = req.query;
    const now = new Date();

    let labels = [];
    let since = new Date();
    const buckets = [];

    if (range === "1D") {
      since = new Date(now);
      since.setHours(0, 0, 0, 0);
      // 2-hour slots: 9AM, 11AM, 1PM, 3PM, 5PM, 7PM, 9PM, 11PM
      const SLOTS = [9, 11, 13, 15, 17, 19, 21, 23];
      labels = [
        "9 AM",
        "11 AM",
        "1 PM",
        "3 PM",
        "5 PM",
        "7 PM",
        "9 PM",
        "11 PM",
      ];
      const orders = await Order.find({
        businessId,
        createdAt: { $gte: since },
      }).lean();
      for (const slot of SLOTS) {
        const rev = orders
          .filter((o) => {
            const h = new Date(o.createdAt).getHours();
            return h >= slot && h < slot + 2;
          })
          .reduce((s, o) => s + (o.total || 0), 0);
        buckets.push(Math.round(rev));
      }
    } else if (range === "7D") {
      since = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      since.setHours(0, 0, 0, 0);
      const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const orders = await Order.find({
        businessId,
        createdAt: { $gte: since },
      }).lean();
      // Build last 7 days in order
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
        labels.push(DAYS[d.getDay()]);
        const rev = orders
          .filter(
            (o) => new Date(o.createdAt) >= d && new Date(o.createdAt) < next,
          )
          .reduce((s, o) => s + (o.total || 0), 0);
        buckets.push(Math.round(rev));
      }
    } else if (range === "1M") {
      since = new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000);
      since.setHours(0, 0, 0, 0);
      const orders = await Order.find({
        businessId,
        createdAt: { $gte: since },
      }).lean();
      for (let w = 0; w < 4; w++) {
        const start = new Date(since.getTime() + w * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        labels.push(`Week ${w + 1}`);
        const rev = orders
          .filter(
            (o) =>
              new Date(o.createdAt) >= start && new Date(o.createdAt) < end,
          )
          .reduce((s, o) => s + (o.total || 0), 0);
        buckets.push(Math.round(rev));
      }
    } else if (range === "6M") {
      const MONTHS = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      since = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const orders = await Order.find({
        businessId,
        createdAt: { $gte: since },
      }).lean();
      for (let m = 5; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        labels.push(MONTHS[d.getMonth()]);
        const rev = orders
          .filter(
            (o) => new Date(o.createdAt) >= d && new Date(o.createdAt) < end,
          )
          .reduce((s, o) => s + (o.total || 0), 0);
        buckets.push(Math.round(rev));
      }
    }

    res.json({ labels, data: buckets });
  } catch (err) {
    next(err);
  }
}

async function getKitchenQueue(req, res, next) {
  try {
    const { businessId } = req.user;
    const orders = await Order.find({
      businessId,
      status: { $in: ["Preparing", "Ready"] },
    })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    const queue = orders.map((o, i) => ({
      ticket: o.orderId,
      stage: o.status === "Preparing" ? "Prep" : "Ready",
      wait: `${Math.ceil((Date.now() - new Date(o.createdAt).getTime()) / 60000)}m`,
      priority: i === 0 ? "High" : "Normal",
      tableId: o.tableId,
      items: o.items.map((item) => item.name).join(", "),
    }));

    res.json({ kitchenQueue: queue });
  } catch (err) {
    next(err);
  }
}

async function getAreaLoad(req, res, next) {
  try {
    const { businessId } = req.user;
    const tables = await Table.find({ businessId, isActive: true }).lean();
    const areaMap = {};
    for (const t of tables) {
      if (!areaMap[t.area])
        areaMap[t.area] = { area: t.area, occupied: 0, total: 0, avgTurn: 20 };
      areaMap[t.area].total++;
      if (t.status === "Occupied") areaMap[t.area].occupied++;
    }
    res.json({ areaLoad: Object.values(areaMap) });
  } catch (err) {
    next(err);
  }
}

async function getVisitorTrend(req, res, next) {
  try {
    const { businessId } = req.user;
    const { range = "1D" } = req.query;
    const now = new Date();

    let labels = [];
    const buckets = [];

    if (range === "1D") {
      const since = new Date(now);
      since.setHours(0, 0, 0, 0);
      // 3-hour buckets covering all 24 hours so no visit is missed regardless of timezone
      const SLOTS = [0, 3, 6, 9, 12, 15, 18, 21];
      labels = [
        "12 AM",
        "3 AM",
        "6 AM",
        "9 AM",
        "12 PM",
        "3 PM",
        "6 PM",
        "9 PM",
      ];
      const guests = await Guest.find({
        businessId,
        lastSeenAt: { $gte: since },
      }).lean();
      for (const slot of SLOTS) {
        const count = guests.filter((g) => {
          const h = new Date(g.lastSeenAt).getHours();
          return h >= slot && h < slot + 3;
        }).length;
        buckets.push(count);
      }
    } else if (range === "7D") {
      const since = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      since.setHours(0, 0, 0, 0);
      const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const guests = await Guest.find({
        businessId,
        lastSeenAt: { $gte: since },
      }).lean();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
        labels.push(DAYS[d.getDay()]);
        const count = guests.filter(
          (g) => new Date(g.lastSeenAt) >= d && new Date(g.lastSeenAt) < next,
        ).length;
        buckets.push(count);
      }
    } else if (range === "1M") {
      const since = new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000);
      since.setHours(0, 0, 0, 0);
      const guests = await Guest.find({
        businessId,
        lastSeenAt: { $gte: since },
      }).lean();
      for (let w = 0; w < 4; w++) {
        const start = new Date(since.getTime() + w * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        labels.push(`Week ${w + 1}`);
        const count = guests.filter(
          (g) =>
            new Date(g.lastSeenAt) >= start && new Date(g.lastSeenAt) < end,
        ).length;
        buckets.push(count);
      }
    } else if (range === "6M") {
      const MONTHS = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const since = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const guests = await Guest.find({
        businessId,
        lastSeenAt: { $gte: since },
      }).lean();
      for (let m = 5; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        labels.push(MONTHS[d.getMonth()]);
        const count = guests.filter(
          (g) => new Date(g.lastSeenAt) >= d && new Date(g.lastSeenAt) < end,
        ).length;
        buckets.push(count);
      }
    }

    res.json({ labels, data: buckets });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSnapshot,
  getKitchenQueue,
  getAreaLoad,
  getTodayStats,
  getRevenueTrend,
  getVisitorTrend,
};

async function getTodayStats(req, res, next) {
  try {
    const { businessId } = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    // All today's orders
    const todayOrders = await Order.find({
      businessId,
      createdAt: { $gte: today },
    }).lean();

    const activeOrders = todayOrders.filter(
      (o) => o.status === "Preparing" || o.status === "Ready",
    );
    const servedOrders = todayOrders.filter((o) => o.status === "Served");
    const cancelledOrders = todayOrders.filter((o) => o.status === "Cancelled");

    // Unique guests from orders (by guestPhone or guestName)
    const uniqueGuestPhones = new Set(
      todayOrders.map((o) => o.guestPhone).filter(Boolean),
    );
    const uniqueGuestNames = new Set(
      todayOrders.map((o) => o.guestName).filter(Boolean),
    );
    const orderVisitorEstimate = Math.max(
      uniqueGuestPhones.size,
      uniqueGuestNames.size,
      todayOrders.length,
    );

    // Guest logins via QR join flow (register API)
    const qrLoginGuests = await Guest.find({
      businessId,
      lastSeenAt: { $gte: today },
      lastSource: "QR",
    })
      .select("firstSeenAt qrLoginCount")
      .lean();

    const qrLoginVisitors = qrLoginGuests.length;
    const totalVisitors = Math.max(orderVisitorEstimate, qrLoginVisitors);

    // Channel split
    const posOrders = todayOrders.filter((o) => o.source === "POS");
    const qrOrders = todayOrders.filter((o) => o.source === "QR");

    // Hourly visit buckets (8 AM – 11 PM)
    const HOURS = [
      8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    ];
    const hourlyMap = {};
    HOURS.forEach((h) => {
      hourlyMap[h] = 0;
    });
    for (const order of todayOrders) {
      const h = new Date(order.createdAt).getHours();
      if (hourlyMap[h] !== undefined) hourlyMap[h]++;
    }
    const hourlyVisits = HOURS.map((h) => ({
      label: h < 12 ? `${h}AM` : h === 12 ? "12PM" : `${h - 12}PM`,
      count: hourlyMap[h],
    }));

    // Peak hour
    const peakHour = hourlyVisits.reduce(
      (max, cur) => (cur.count > max.count ? cur : max),
      { label: "—", count: 0 },
    );

    // Revenue
    const totalRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
    const avgSpendPerVisitor =
      totalVisitors > 0 ? Math.round(totalRevenue / totalVisitors) : 0;

    // New vs returning guests from QR login records
    const returningGuests = qrLoginGuests.filter(
      (g) =>
        (g.qrLoginCount || 0) > 1 || (g.firstSeenAt && g.firstSeenAt < today),
    ).length;
    const newGuests = Math.max(0, qrLoginVisitors - returningGuests);

    // Current occupancy
    const tables = await Table.find({ businessId, isActive: true }).lean();
    const occupiedTables = tables.filter((t) => t.status === "Occupied").length;
    const totalTables = tables.length;

    const business = await Business.findById(businessId)
      .select("name subdomain")
      .lean();

    res.json({
      restaurantName: business?.name || "",
      restaurantSlug: business?.subdomain || "",
      totalVisitors,
      activeOrders: activeOrders.length,
      servedToday: servedOrders.length,
      cancelledToday: cancelledOrders.length,
      posOrders: posOrders.length,
      qrOrders: qrOrders.length,
      hourlyVisits,
      peakHour,
      totalRevenue,
      avgSpendPerVisitor,
      newGuests,
      returningGuests,
      occupiedTables,
      totalTables,
      lastUpdated: now.toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

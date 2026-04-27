const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

async function getAvailableReports(_req, res) {
  const reports = [
    { id: "sales-summary", name: "Daily Sales Summary", period: "Today" },
    { id: "category-mix", name: "Category Mix Report", period: "Last 7 days" },
    { id: "tax-ledger", name: "Tax & GST Ledger", period: "This month" },
    {
      id: "cancellations",
      name: "Cancellation Analysis",
      period: "Last 30 days",
    },
  ];
  res.json(reports);
}

async function getSalesSummary(req, res, next) {
  try {
    const { period = "daily" } = req.query;
    const { businessId } = req.user;

    const daysMap = { daily: 1, weekly: 7, monthly: 30 };
    const days = daysMap[period] || 1;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      businessId,
      createdAt: { $gte: since },
      paymentStatus: "Completed",
    }).lean();

    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const count = orders.length;
    res.json({
      period,
      revenue,
      orders: count,
      avgOrder: count > 0 ? Math.round(revenue / count) : 0,
    });
  } catch (err) {
    next(err);
  }
}

async function getCategoryMix(req, res, next) {
  try {
    const { businessId } = req.user;
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const orders = await Order.find({
      businessId,
      createdAt: { $gte: since },
    }).lean();

    const catMap = {};
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.name;
        if (!catMap[key]) catMap[key] = { name: key, units: 0, revenue: 0 };
        catMap[key].units += item.quantity;
        catMap[key].revenue += item.total;
      }
    }

    res.json(Object.values(catMap).sort((a, b) => b.revenue - a.revenue));
  } catch (err) {
    next(err);
  }
}

async function getTaxLedger(req, res, next) {
  try {
    const { businessId } = req.user;
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const orders = await Order.find({
      businessId,
      createdAt: { $gte: firstOfMonth },
      paymentStatus: "Completed",
    }).lean();

    const rows = orders.map((o) => ({
      orderId: o.orderId,
      date: o.createdAt,
      taxable: o.taxableAmount,
      gst: o.tax,
      total: o.total,
    }));

    const totals = rows.reduce(
      (acc, r) => ({ taxable: acc.taxable + r.taxable, gst: acc.gst + r.gst }),
      { taxable: 0, gst: 0 },
    );

    res.json({ rows, totals });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAvailableReports,
  getSalesSummary,
  getCategoryMix,
  getTaxLedger,
};

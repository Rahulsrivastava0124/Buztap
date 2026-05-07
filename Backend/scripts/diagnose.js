require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../src/models/Order");
const Table = require("../src/models/Table");

function buildTableIdCandidates(rawTableId) {
  const value = String(rawTableId || "").trim();
  if (!value) return [];
  const set = new Set([value]);
  const digits = value.replace(/\D/g, "");
  if (digits) {
    const n = Number(digits);
    if (Number.isFinite(n) && n > 0) {
      set.add(String(n));
      set.add(String(n).padStart(2, "0"));
      set.add("T-" + String(n));
      set.add("T-" + String(n).padStart(2, "0"));
    }
  }
  return Array.from(set);
}

function buildOrderTableCandidates(order) {
  const tableId = String(order?.tableId || "").trim();
  const source = String(order?.source || "").trim();
  return Array.from(
    new Set([
      ...buildTableIdCandidates(tableId),
      ...buildTableIdCandidates(source),
    ]),
  );
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("=== FULL DIAGNOSTIC ===\n");

    // 1. All tables
    const allTables = await Table.find({ isActive: true })
      .select("tableId status businessId guestName updatedAt")
      .lean();
    console.log("ALL ACTIVE TABLES:");
    allTables.forEach((t) =>
      console.log(
        `  ${t.tableId} → ${t.status} (guest: ${t.guestName || "none"}) businessId=${t.businessId}`,
      ),
    );

    // 2. All recent active orders
    // NEW query — 24h window + excludes paymentStatus=Completed
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeOrders = await Order.find({
      paymentStatus: { $ne: "Completed" },
      status: { $in: ["Pending", "Preparing", "Ready", "Served"] },
      tableId: { $ne: null },
      createdAt: { $gte: since24h },
    })
      .select("tableId source status paymentStatus orderId businessId")
      .lean();
    console.log("\nACTIVE/UNPAID ORDERS:");
    activeOrders.forEach((o) =>
      console.log(
        `  ${o.orderId} tableId="${o.tableId}" source="${o.source}" status=${o.status} pay=${o.paymentStatus} biz=${o.businessId}`,
      ),
    );

    // 3. Per occupied table — check if any order matches
    const occupiedTables = allTables.filter((t) => t.status === "Occupied");
    console.log("\nOCCUPIED TABLES CHECK:");
    for (const table of occupiedTables) {
      const candidates = new Set(buildTableIdCandidates(table.tableId));
      const matching = activeOrders.filter((o) => {
        const oCandidates = buildOrderTableCandidates(o);
        return (
          String(o.businessId) === String(table.businessId) &&
          oCandidates.some((c) => candidates.has(c))
        );
      });
      if (matching.length > 0) {
        console.log(
          `  ✅ ${table.tableId}: ${matching.length} active order(s) → ${matching.map((o) => o.orderId).join(", ")}`,
        );
      } else {
        console.log(
          `  ❌ ${table.tableId}: NO matching active order — should be Cleaning, not Occupied`,
        );
        // Check if there's a paid order
        const paidOrders = await Order.find({
          businessId: table.businessId,
          tableId: { $in: Array.from(candidates) },
          paymentStatus: "Completed",
        })
          .sort({ completedAt: -1 })
          .limit(1)
          .select("orderId status paymentStatus completedAt")
          .lean();
        if (paidOrders.length > 0) {
          console.log(
            `     → Latest paid order: ${paidOrders[0].orderId} completedAt=${paidOrders[0].completedAt}`,
          );
        } else {
          console.log(
            `     → No paid order found either — orphaned Occupied status`,
          );
        }
      }
    }

    console.log("\n=== DONE ===");
    await mongoose.disconnect();
  })
  .catch((e) => {
    console.error("DB ERROR:", e.message);
    process.exit(1);
  });

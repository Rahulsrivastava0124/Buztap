import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, History, Search } from "lucide-react";
import { fetchGuestOrders } from "../services/api";

const formatCurrency = (value = 0) => `₹${Number(value || 0)}`;

function normalizeGuestPhone(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(-10);
}

function getRestaurantScopeKey(restroSlug, businessId) {
  const restro = String(restroSlug || "")
    .trim()
    .toLowerCase();
  const biz = String(businessId || "").trim();
  if (restro) return `restro_${restro}`;
  if (biz) return `biz_${biz}`;
  return "";
}

const normalizeOrder = (order, fallbackGuestName) => {
  // Local orders (DemoMenu) store items as an array in `order.items`
  // Remote orders store items as a count; item details are in `order.itemList`
  const normItemList = Array.isArray(order.itemList)
    ? order.itemList
    : Array.isArray(order.items)
      ? order.items
      : [];
  return {
    ...order,
    subtotal: order.subtotal ?? order.total ?? 0,
    discount: order.discount ?? 0,
    tax: order.tax ?? 0,
    taxableAmount:
      order.taxableAmount ??
      Math.max((order.subtotal ?? order.total ?? 0) - (order.discount ?? 0), 0),
    itemList: normItemList,
    items: typeof order.items === "number" ? order.items : normItemList.length,
    restaurantName: order.restaurantName || "Spice Garden",
    tableName: order.tableName || "Table 04",
    guestName: order.guestName || fallbackGuestName || "Guest",
  };
};

const buildInvoiceDocument = (order) => {
  const itemRows = order.itemList.length
    ? order.itemList
        .map(
          (item) => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #ece7de;">${item.name}</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ece7de; text-align:center;">${item.qty}</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ece7de; text-align:right;">₹${item.price}</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ece7de; text-align:right;">₹${item.total}</td>
            </tr>
          `,
        )
        .join("")
    : `
      <tr>
        <td colspan="4" style="padding: 14px 0; text-align:center; color:#857c6e; border-bottom: 1px solid #ece7de;">
          Item-level details are unavailable for this older order.
        </td>
      </tr>
    `;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invoice-${order.id}</title>
      </head>
      <body style="margin:0; background:#faf7f2; font-family: Arial, sans-serif; color:#0f0e0b;">
        <div style="max-width:720px; margin:0 auto; padding:32px 24px;">
          <div style="background:#fff; border-radius:24px; padding:28px; box-shadow:0 8px 30px rgba(15,14,11,0.06);">
            <div style="display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom:28px;">
              <div>
                <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#857c6e; font-weight:700; margin-bottom:8px;">Invoice</div>
                <h1 style="margin:0; font-size:34px;">${order.restaurantName}</h1>
                <p style="margin:8px 0 0; color:#857c6e;">${order.tableName}</p>
              </div>
              <div style="text-align:right;">
                <div style="font-size:28px; font-weight:700; color:#e8720c; margin-bottom:8px;">#${order.id}</div>
                <div style="color:#857c6e;">${order.date}</div>
                <div style="color:#857c6e; margin-top:8px;">${order.guestName}</div>
              </div>
            </div>

            <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
              <thead>
                <tr>
                  <th style="text-align:left; padding-bottom:12px; color:#857c6e; font-size:12px; text-transform:uppercase; letter-spacing:0.12em;">Item</th>
                  <th style="text-align:center; padding-bottom:12px; color:#857c6e; font-size:12px; text-transform:uppercase; letter-spacing:0.12em;">Qty</th>
                  <th style="text-align:right; padding-bottom:12px; color:#857c6e; font-size:12px; text-transform:uppercase; letter-spacing:0.12em;">Price</th>
                  <th style="text-align:right; padding-bottom:12px; color:#857c6e; font-size:12px; text-transform:uppercase; letter-spacing:0.12em;">Total</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>

            <div style="margin-left:auto; max-width:280px;">
              <div style="display:flex; justify-content:space-between; padding:6px 0; color:#857c6e;">
                <span>Subtotal</span>
                <span>₹${order.subtotal}</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:6px 0; color:#857c6e;">
                <span>Discount${order.offerPercent ? ` (${order.offerPercent}%)` : ""}</span>
                <span>-₹${order.discount}</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:6px 0; color:#857c6e;">
                <span>Tax</span>
                <span>₹${order.tax}</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:14px 0 0; margin-top:10px; border-top:1px dashed #e0d9ce; font-size:22px; font-weight:700;">
                <span>Grand Total</span>
                <span>₹${order.total}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Find the guest phone from any scoped or legacy key in localStorage.
 * DemoMenu writes `current_guest_phone_{scopeKey}` per restaurant.
 */
function resolveGuestPhone(scopeKey = "") {
  if (scopeKey) {
    const scoped = localStorage.getItem(`current_guest_phone_${scopeKey}`);
    if (scoped) return normalizeGuestPhone(scoped);
  }
  const legacy = localStorage.getItem("current_guest_phone");
  if (legacy) return normalizeGuestPhone(legacy);
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("current_guest_phone_")) {
      return normalizeGuestPhone(localStorage.getItem(key) || "");
    }
  }
  return null;
}

/**
 * Find the guest name from any scoped or legacy key in localStorage.
 */
function resolveGuestName(scopeKey = "") {
  if (scopeKey) {
    const scoped = localStorage.getItem(`current_guest_name_${scopeKey}`);
    if (scoped) return scoped;
  }
  const legacy = localStorage.getItem("current_guest_name");
  if (legacy) return legacy;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("current_guest_name_")) {
      return localStorage.getItem(key) || null;
    }
  }
  return null;
}

/**
 * Collect all order_history entries across every scoped key, deduplicating
 * by order ID and sorting newest-first.
 */
function collectAllOrders(phone, scopeKey = "") {
  const seenIds = new Set();
  const all = [];

  const normalizedPhone = normalizeGuestPhone(phone);
  if (!normalizedPhone) return all;

  if (scopeKey) {
    const scopedKey = `order_history_${scopeKey}_${normalizedPhone}`;
    try {
      const parsed = JSON.parse(localStorage.getItem(scopedKey) || "[]");
      if (Array.isArray(parsed)) {
        for (const order of parsed) {
          if (order.id && !seenIds.has(order.id)) {
            seenIds.add(order.id);
            all.push(order);
          }
        }
      }
    } catch {
      // ignore malformed scoped history
    }
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    // Match both legacy `order_history_{phone}` and scoped `order_history_{scope}_{phone}`
    const isHistory =
      key === `order_history_${normalizedPhone}` ||
      (key.startsWith(`order_history_`) &&
        key.endsWith(`_${normalizedPhone}`) &&
        (!scopeKey || key.includes(`order_history_${scopeKey}_`)));
    if (!isHistory) continue;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(parsed)) {
        for (const order of parsed) {
          if (order.id && !seenIds.has(order.id)) {
            seenIds.add(order.id);
            all.push(order);
          }
        }
      }
    } catch {
      // corrupted entry — skip
    }
  }

  // Sort newest first by date string (ISO or locale)
  all.sort((a, b) => new Date(b.date) - new Date(a.date));
  return all;
}

export default function OrderHistory() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const currentBusinessId = queryParams.get("biz") || "";
  const currentRestroSlug = queryParams.get("restro") || "";
  const restaurantScopeKey = useMemo(
    () => getRestaurantScopeKey(currentRestroSlug, currentBusinessId),
    [currentRestroSlug, currentBusinessId],
  );

  const [orders, setOrders] = useState(() => {
    const phone = resolveGuestPhone(restaurantScopeKey);
    return phone ? collectAllOrders(phone, restaurantScopeKey) : [];
  });
  const [guestName] = useState(
    () => resolveGuestName(restaurantScopeKey) || "Guest",
  );
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const phone = resolveGuestPhone(restaurantScopeKey);
    if (!phone) return;

    const bizMatch =
      currentBusinessId ||
      (() => {
        if (restaurantScopeKey.startsWith("biz_")) {
          return restaurantScopeKey.slice(4);
        }
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k) continue;
          const m = k.match(new RegExp(`^order_history_biz_([^_]+)_${phone}$`));
          if (m) return m[1];
        }
        return null;
      })();

    if (!bizMatch) return;

    fetchGuestOrders(phone, bizMatch)
      .then(({ orders: remote = [] }) => {
        if (!remote.length) return;
        // Normalize remote orders to match local shape
        const remoteNorm = remote.map((o) => {
          const rawId = o.orderId ?? o._id ?? "";
          const cleanId = String(rawId).replace(/^#+/, "");
          const itemList = (o.items || []).map((it) => ({
            name: it.name,
            qty: it.quantity ?? it.qty ?? 1,
            price: it.price ?? 0,
            total: it.total ?? (it.price ?? 0) * (it.quantity ?? it.qty ?? 1),
          }));
          return {
            id: cleanId,
            orderId: cleanId,
            date: o.createdAt
              ? new Date(o.createdAt).toLocaleString()
              : "Unknown date",
            tableId: o.tableId,
            tableName: o.tableId || null,
            restaurantName: null,
            status: o.status,
            guestName:
              o.guestName || resolveGuestName(restaurantScopeKey) || "Guest",
            itemList,
            items: itemList.length,
            subtotal: o.total ?? 0,
            discount: 0,
            tax: 0,
            taxableAmount: o.total ?? 0,
            total: o.total ?? 0,
            paymentMethod: o.paymentMethod ?? "Pending",
            paymentStatus: o.paymentStatus ?? "Pending",
            source: "backend",
          };
        });

        setOrders((prev) => {
          const normalizeId = (id) => String(id || "").replace(/^#+/, "");
          const remoteMap = new Map(
            remoteNorm.map((r) => [normalizeId(r.id), r]),
          );

          const updated = prev.map((p) => {
            const nid = normalizeId(p.id);
            const remoteOrder = remoteMap.get(nid);
            if (!remoteOrder) return p;

            remoteMap.delete(nid);
            return {
              ...p,
              status: remoteOrder.status ?? p.status,
              paymentStatus: remoteOrder.paymentStatus ?? p.paymentStatus,
              itemList: p.itemList?.length ? p.itemList : remoteOrder.itemList,
              items: p.itemList?.length ? p.items : remoteOrder.items,
            };
          });

          for (const r of remoteMap.values()) {
            updated.push(r);
          }

          updated.sort((a, b) => new Date(b.date) - new Date(a.date));
          return updated;
        });
      })
      .catch(() => {
        /* silent */
      });
  }, [currentBusinessId, restaurantScopeKey]);

  const normalizedOrders = useMemo(
    () => orders.map((order) => normalizeOrder(order, guestName)),
    [orders, guestName],
  );

  const selectedOrder =
    normalizedOrders.find((order) => order.id === selectedOrderId) || null;

  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(normalizedOrders.length / PAGE_SIZE));
  const pagedOrders = normalizedOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const downloadInvoice = (order) => {
    const invoiceContent = buildInvoiceDocument(order);
    const invoiceBlob = new Blob([invoiceContent], { type: "text/html" });
    const invoiceUrl = URL.createObjectURL(invoiceBlob);
    const link = document.createElement("a");

    link.href = invoiceUrl;
    link.download = `invoice-${order.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(invoiceUrl);
  };

  const statusStyle = (status) => {
    switch (status) {
      case "Served":
      case "Paid":
        return "bg-[#eaf4ea] text-[#2e6b45]";
      case "Cancelled":
        return "bg-[#faeaea] text-[#8c2e2e]";
      case "Ready":
        return "bg-[#fff8e6] text-[#9a6200]";
      default:
        return "bg-[#f0ebe0] text-[#7a6040]";
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f4f0]">
      <div className="max-w-md mx-auto min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#f6f4f0] px-4 pt-2 pb-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-white border border-[#e8e2d8] flex items-center justify-center text-[#1a1814]"
            >
              <ArrowLeft size={17} strokeWidth={2} />
            </button>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#a09080] font-semibold">
                Order History
              </p>
              <h1 className="text-base font-bold text-[#1a1814] leading-tight">
                {guestName ? guestName.split(" ")[0] : "Guest"}
              </h1>
            </div>
            <Link
              to="/search"
              className="w-9 h-9 rounded-full bg-white border border-[#e8e2d8] flex items-center justify-center text-[#1a1814]"
            >
              <Search size={17} strokeWidth={2} />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-10 pt-2">
          <p className="text-xs text-[#a09080] mb-4">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>

          {normalizedOrders.length > 0 ? (
            <>
            <div className="space-y-2.5">
              {pagedOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className="w-full text-left bg-white rounded-2xl px-4 py-4 border border-[#ece7de] active:scale-[0.99] transition-transform"
                >
                  {order.restaurantName ? (
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4602a] mb-2">
                      {order.restaurantName}
                    </p>
                  ) : null}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-bold text-[#1a1814] text-[15px]">
                        #{order.id}
                      </p>
                      <p className="text-[11px] text-[#a09080] mt-0.5">
                        {order.date}
                      </p>
                    </div>
                    <p className="font-bold text-[#1a1814] text-[15px]">
                      ₹{order.total}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#f0ebe0]">
                    <p className="text-xs text-[#a09080]">
                      {order.items} item{order.items !== 1 ? "s" : ""}
                      {order.tableName ? ` · ${order.tableName}` : ""}
                    </p>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyle(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 px-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="w-9 h-9 rounded-full bg-white border border-[#e8e2d8] flex items-center justify-center text-[#1a1814] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                >
                  <ChevronLeft size={17} strokeWidth={2} />
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                        p === page
                          ? "bg-saffron text-white"
                          : "bg-white border border-[#e8e2d8] text-[#a09080] hover:border-saffron hover:text-saffron"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-9 h-9 rounded-full bg-white border border-[#e8e2d8] flex items-center justify-center text-[#1a1814] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                >
                  <ChevronRight size={17} strokeWidth={2} />
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-[#edeae3] flex items-center justify-center mx-auto mb-4">
                <History size={22} className="text-[#a09080]" />
              </div>
              <p className="font-semibold text-[#1a1814] mb-1">No orders yet</p>
              <p className="text-sm text-[#a09080] mb-6">
                Your orders will appear here.
              </p>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl bg-saffron text-white text-sm font-semibold"
              >
                Go to Menu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Sheet */}
      {selectedOrder ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl px-5 pt-5 pb-8 max-h-[88vh] overflow-y-auto">
            {/* Pull handle */}
            <div className="w-10 h-1 rounded-full bg-[#ddd8d0] mx-auto mb-5 sm:hidden" />

            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#a09080] font-semibold mb-1">
                  Receipt
                </p>
                <h2 className="text-xl font-bold text-[#1a1814]">
                  #{selectedOrder.id}
                </h2>
                <p className="text-xs text-[#a09080] mt-0.5">
                  {selectedOrder.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="w-8 h-8 rounded-full bg-[#f0ebe0] text-[#1a1814] flex items-center justify-center text-base font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Items */}
            {selectedOrder.itemList.length > 0 ? (
              <div className="mb-4">
                {selectedOrder.itemList.map((item, idx) => (
                  <div
                    key={`${selectedOrder.id}-item-${idx}`}
                    className="flex items-center justify-between py-3 border-b border-[#f0ebe0] last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1a1814]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#a09080] mt-0.5">
                        {item.qty} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#1a1814]">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#a09080] mb-4">
                Item details unavailable for this order.
              </p>
            )}

            {/* Bill summary */}
            <div className="border-t border-[#f0ebe0] pt-4 space-y-2">
              <div className="flex justify-between text-sm text-[#a09080]">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-sm text-[#a09080]">
                  <span>
                    Discount
                    {selectedOrder.offerPercent
                      ? ` (${selectedOrder.offerPercent}%)`
                      : ""}
                  </span>
                  <span>-{formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              {selectedOrder.tax > 0 && (
                <div className="flex justify-between text-sm text-[#a09080]">
                  <span>Tax</span>
                  <span>{formatCurrency(selectedOrder.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[#1a1814] pt-3 border-t border-[#f0ebe0]">
                <span>Total</span>
                <span>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="py-3 rounded-xl bg-[#f0ebe0] text-[#1a1814] text-sm font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => downloadInvoice(selectedOrder)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-saffron text-white text-sm font-semibold"
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, History, Search } from "lucide-react";

const formatCurrency = (value = 0) => `₹${Number(value || 0)}`;

const normalizeOrder = (order, fallbackGuestName) => ({
  ...order,
  subtotal: order.subtotal ?? order.total ?? 0,
  discount: order.discount ?? 0,
  tax: order.tax ?? 0,
  taxableAmount:
    order.taxableAmount ??
    Math.max((order.subtotal ?? order.total ?? 0) - (order.discount ?? 0), 0),
  itemList: Array.isArray(order.itemList) ? order.itemList : [],
  restaurantName: order.restaurantName || "Spice Garden",
  tableName: order.tableName || "Table 04",
  guestName: order.guestName || fallbackGuestName || "Guest",
});

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

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [guestName, setGuestName] = useState("Guest");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const currentPhone = localStorage.getItem("current_guest_phone");
    const currentName = localStorage.getItem("current_guest_name");

    if (currentName) {
      setGuestName(currentName);
    }

    if (currentPhone) {
      const savedHistory = localStorage.getItem(
        `order_history_${currentPhone}`,
      );
      const parsedOrders = savedHistory ? JSON.parse(savedHistory) : [];
      setOrders(parsedOrders);
    }
  }, []);

  const normalizedOrders = useMemo(
    () => orders.map((order) => normalizeOrder(order, guestName)),
    [orders, guestName],
  );

  const selectedOrder =
    normalizedOrders.find((order) => order.id === selectedOrderId) || null;

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

  return (
    <div className="min-h-screen bg-[#faf7f2] font-body">
      <div className="max-w-md mx-auto min-h-screen px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/demo"
            className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center border border-[#e0d9ce] text-[#0f0e0b]"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#857c6e] font-bold">
              Order History
            </p>
            <h1 className="text-lg font-bold text-[#0f0e0b]">
              {guestName ? guestName.split(" ")[0] : "Guest"}
            </h1>
          </div>
          <Link
            to="/search"
            className="w-11 h-11 rounded-full bg-white shadow-md border border-[#e0d9ce] flex items-center justify-center text-[#0f0e0b]"
          >
            <Search size={20} />
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#e0d9ce] mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#f5f0e8] flex items-center justify-center text-[#857c6e]">
              <History size={22} />
            </div>
            <div>
              <h2 className="text-[#0f0e0b] font-bold text-lg">Past Orders</h2>
              <p className="text-sm text-[#857c6e]">
                {orders.length} saved order{orders.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        {normalizedOrders.length > 0 ? (
          <div className="space-y-4">
            {normalizedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl shadow-sm border border-[#e0d9ce] p-4"
              >
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-lg text-[#0f0e0b]">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-[#857c6e] mt-1">
                        {order.date}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-[#3a6348]">
                      ₹{order.total}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-[#857c6e]">
                    <span>
                      {order.items} item{order.items === 1 ? "" : "s"}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-[#eaf4ea] text-[#3a6348] font-semibold">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-bold text-[#857c6e] uppercase tracking-wider">
                    Tap to open order details & invoice
                  </p>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-[#e0d9ce] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f5f0e8] text-[#857c6e] flex items-center justify-center mx-auto mb-4">
              <History size={28} />
            </div>
            <h2 className="text-xl font-bold text-[#0f0e0b] mb-2">
              No order history yet
            </h2>
            <p className="text-sm text-[#857c6e] mb-5">
              Place your first order from the menu and it will appear here.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-[#e8720c] text-white font-bold"
            >
              Go to Menu
            </Link>
          </div>
        )}

        {selectedOrder ? (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[28px] p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#857c6e] font-bold mb-1">
                    Order Details
                  </p>
                  <h2 className="text-2xl font-bold text-[#0f0e0b]">
                    Order #{selectedOrder.id}
                  </h2>
                  <p className="text-sm text-[#857c6e] mt-1">
                    {selectedOrder.date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="w-10 h-10 rounded-full bg-[#f5f0e8] text-[#0f0e0b] font-bold"
                >
                  ×
                </button>
              </div>

              <div className="bg-[#faf7f2] rounded-3xl p-4 border border-[#eee7db] space-y-4">
                {selectedOrder.itemList.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#857c6e] font-bold">
                      Items You Ordered
                    </p>
                    {selectedOrder.itemList.map((item) => (
                      <div
                        key={`invoice-${selectedOrder.id}-${item.id}`}
                        className="flex items-center justify-between gap-3 bg-white rounded-2xl px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-[#0f0e0b]">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#857c6e]">
                            {item.qty} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <span className="font-bold text-[#0f0e0b]">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl px-4 py-3 text-sm text-[#857c6e]">
                    Itemized details are unavailable for this older order.
                  </div>
                )}

                <div className="bg-white rounded-2xl px-4 py-4 space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#857c6e] font-bold">
                    Bill Details
                  </p>
                  <div className="flex items-center justify-between text-sm text-[#857c6e]">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#857c6e]">
                    <span>
                      Discount{" "}
                      {selectedOrder.offerPercent
                        ? `(${selectedOrder.offerPercent}%)`
                        : ""}
                    </span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#857c6e]">
                    <span>Tax</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                  <div className="border-t border-dashed border-[#e0d9ce] pt-3 mt-3 flex items-center justify-between text-lg font-bold text-[#0f0e0b]">
                    <span>Grand Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="px-4 py-3 rounded-2xl bg-[#f5f0e8] text-[#0f0e0b] font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => downloadInvoice(selectedOrder)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#e8720c] text-white font-semibold"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

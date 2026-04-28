import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Utensils,
  ReceiptText,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchPosCatalog } from "../services/api";
import { usePosStore } from "../features/pos/store/usePosStore";
import usePOSHotkeys from "../hooks/usePOSHotkeys";
import { useAuth } from "../context/AuthContext";

export default function PosSystem() {
  const [activeCat, setActiveCat] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState("01");
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { businessType } = useAuth();
  const isHotelMode = businessType === "hotel";
  const locationLabel = isHotelMode ? "Room" : "Table";

  const {
    cart,
    orderType,
    setOrderType,
    addToCart,
    setItemNotes,
    updateQty,
    removeItem,
    clearCart,
    getTotals,
  } = usePosStore();

  const {
    data: menuItems = [],
    isLoading: menuLoading,
    isError: menuError,
    error: menuErrorMessage,
    refetch: refetchMenu,
  } = useQuery({
    queryKey: ["pos-catalog"],
    queryFn: fetchPosCatalog,
  });

  const categories = useMemo(
    () => ["All", ...new Set(menuItems.map((item) => item.cat))],
    [menuItems],
  );

  const modeOptions = useMemo(
    () =>
      isHotelMode
        ? ["Room Service", "Takeaway", "Delivery"]
        : ["Dine-in", "Takeaway", "Delivery"],
    [isHotelMode],
  );

  useEffect(() => {
    if (!modeOptions.includes(orderType)) {
      setOrderType(modeOptions[0]);
    }
  }, [modeOptions, orderType, setOrderType]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat = activeCat === "All" || item.cat === activeCat;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeCat, menuItems, searchTerm]);

  const { subtotal, tax, total, itemCount } = getTotals();

  const goToCheckout = () => {
    if (!cart.length) return;
    navigate("/pos/checkout", {
      state: {
        selectedTable,
        orderType,
        locationLabel,
      },
    });
  };

  usePOSHotkeys({
    onFocusSearch: () => searchRef.current?.focus(),
    onCheckout: () => goToCheckout(),
    onClear: () => clearCart(),
  });

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden bg-paper">
      {/* ── Left Area: Menu Grid ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative border-r border-border">
        {/* Top Controls */}
        <div className="p-4 bg-white border-b border-border flex flex-col gap-3 z-10 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-muted2" size={18} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search items by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-paper focus:outline-none focus:ring-1 focus:ring-saffron focus:border-saffron transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeCat === cat
                    ? "bg-saffron text-white shadow-sm"
                    : "bg-cream text-muted hover:bg-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {menuLoading ? (
              <p className="col-span-full text-sm text-muted">
                Loading menu...
              </p>
            ) : null}
            {menuError ? (
              <div className="col-span-full flex items-center justify-between gap-4">
                <p className="text-sm text-error">
                  {menuErrorMessage?.message || "Failed to load menu catalog."}
                </p>
                <button
                  onClick={() => refetchMenu()}
                  className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-paper"
                >
                  Retry
                </button>
              </div>
            ) : null}
            {!menuLoading && !menuError && filteredItems.length === 0 ? (
              <p className="col-span-full text-sm text-muted">
                No menu items found.
              </p>
            ) : null}
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white border border-border rounded-xl overflow-hidden hover:border-saffron hover:shadow-md transition-all text-left flex flex-col group relative"
              >
                <div className="h-28 w-full overflow-hidden bg-gray-100">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-ink leading-tight mb-1 line-clamp-2">
                    {item.name}
                  </p>
                  <p className="font-roboto font-bold text-saffron">
                    ₹{item.price}
                  </p>
                  <p className="text-xs mt-1 text-muted">{item.cat}</p>
                </div>
                <div className="absolute inset-0 bg-saffron/10 opacity-0 group-active:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Area: Ticket (Cart) ── */}
      <div className="w-full lg:w-96 bg-white flex flex-col shadow-xl z-20 shrink-0">
        {/* Ticket Header */}
        <div className="p-4 border-b border-border bg-paper flex items-center justify-between">
          <h2 className="font-bold text-ink flex items-center gap-2">
            <Utensils size={18} className="text-saffron" />
            Current Order
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted">
              {locationLabel}
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="bg-white border border-border rounded-md px-2 py-1 text-sm font-bold text-saffron outline-none"
            >
              {[...Array(20)].map((_, i) => (
                <option
                  key={i}
                  value={
                    isHotelMode
                      ? String(101 + i)
                      : String(i + 1).padStart(2, "0")
                  }
                >
                  {isHotelMode
                    ? String(101 + i)
                    : String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white">
          <AnimatePresence>
            {cart.length === 0 ? (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50"
              >
                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center">
                  <Utensils size={32} className="text-muted2" />
                </div>
                <p className="text-sm font-semibold text-muted">
                  No items in order.
                </p>
                <p className="text-xs text-muted2">
                  Tap an item on the left to add it.
                </p>
              </Motion.div>
            ) : (
              cart.map((item) => (
                <Motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col gap-2 p-3 bg-paper border border-border rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm text-ink max-w-50 leading-tight">
                      {item.name}
                    </p>
                    <p className="font-roboto font-bold text-ink">
                      ₹{item.price * item.qty}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center gap-3 bg-white border border-border rounded-md px-1.5 h-8">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="text-muted hover:text-ink"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="text-saffron hover:text-saffron2"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <input
                    value={item.notes || ""}
                    onChange={(event) =>
                      setItemNotes(item.id, event.target.value)
                    }
                    placeholder="Add note (e.g. extra spicy)"
                    className="text-sm border border-border rounded-md px-2 py-1 bg-white"
                  />
                </Motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer Settings & Payment */}
        <div className="p-4 border-t border-border bg-paper space-y-4 shadow-[0_-4px_15px_rgba(0,0,0,0.03)]">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span className="font-roboto font-medium text-ink">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted">
              <span>Tax (5% GST)</span>
              <span className="font-roboto font-medium text-ink">
                ₹{tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-end pt-2 border-t border-border mt-2">
              <span className="font-bold text-ink flex items-center gap-1">
                <ReceiptText size={14} /> Total ({itemCount} items)
              </span>
              <span className="font-roboto text-2xl font-black text-saffron">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              disabled={cart.length === 0}
              onClick={goToCheckout}
              className="col-span-2 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-saffron hover:bg-saffron2 text-white shadow-md transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              Go to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

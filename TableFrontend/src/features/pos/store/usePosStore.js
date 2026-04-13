import { create } from "zustand";

const TAX_RATE = 0.05;

export const usePosStore = create((set, get) => ({
  cart: [],
  heldOrders: [],
  orderType: "Dine-in",
  discountPct: 0,

  setOrderType: (orderType) => set({ orderType }),
  setDiscountPct: (discountPct) => set({ discountPct }),

  addToCart: (item) => {
    const { cart } = get();
    const existing = cart.find((x) => x.id === item.id);
    if (existing) {
      set({
        cart: cart.map((x) =>
          x.id === item.id ? { ...x, qty: x.qty + 1 } : x,
        ),
      });
      return;
    }
    set({ cart: [...cart, { ...item, qty: 1, notes: "", modifiers: [] }] });
  },

  setItemNotes: (id, notes) => {
    const { cart } = get();
    set({ cart: cart.map((x) => (x.id === id ? { ...x, notes } : x)) });
  },

  updateQty: (id, delta) => {
    const { cart } = get();
    set({
      cart: cart
        .map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x))
        .filter((x) => x.qty > 0),
    });
  },

  removeItem: (id) => {
    const { cart } = get();
    set({ cart: cart.filter((x) => x.id !== id) });
  },

  holdCurrentOrder: (tableId) => {
    const { cart, heldOrders, orderType, discountPct } = get();
    if (!cart.length) return;
    set({
      heldOrders: [
        ...heldOrders,
        {
          id: `H-${Date.now()}`,
          tableId,
          orderType,
          discountPct,
          cart,
          createdAt: new Date().toISOString(),
        },
      ],
      cart: [],
      discountPct: 0,
    });
  },

  restoreHeldOrder: (heldId) => {
    const { heldOrders } = get();
    const found = heldOrders.find((h) => h.id === heldId);
    if (!found) return;
    set({
      cart: found.cart,
      orderType: found.orderType,
      discountPct: found.discountPct,
      heldOrders: heldOrders.filter((h) => h.id !== heldId),
    });
  },

  clearCart: () => set({ cart: [], discountPct: 0 }),

  getTotals: () => {
    const { cart, discountPct } = get();
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const discount = (subtotal * discountPct) / 100;
    const taxable = subtotal - discount;
    const tax = taxable * TAX_RATE;
    const total = taxable + tax;
    const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);
    return { subtotal, discount, taxable, tax, total, itemCount };
  },

  splitEvenly: (people) => {
    const safePeople = Math.max(1, Number(people) || 1);
    const { total } = get().getTotals();
    return Number((total / safePeople).toFixed(2));
  },
}));

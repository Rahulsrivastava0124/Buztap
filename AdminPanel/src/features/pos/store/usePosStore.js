import { create } from "zustand";

export const usePosStore = create((set, get) => ({
  cart: [],
  heldOrders: [],
  orderType: "Dine-in",
  discountPct: 0,
  gstPct: 5,
  taxPct: 0,

  setOrderType: (orderType) => set({ orderType }),
  setDiscountPct: (discountPct) => set({ discountPct }),
  setTaxRates: ({ gstPct = 5, taxPct = 0 }) =>
    set({
      gstPct: Math.min(100, Math.max(0, Number(gstPct || 0))),
      taxPct: Math.min(100, Math.max(0, Number(taxPct || 0))),
    }),

  setCart: (cart = []) =>
    set({
      cart: Array.isArray(cart) ? cart : [],
    }),

  addToCart: (item) => {
    const { cart } = get();
    const key = item.cartKey || item.id;
    const existing = cart.find((x) => (x.cartKey || x.id) === key);
    if (existing) {
      set({
        cart: cart.map((x) =>
          (x.cartKey || x.id) === key ? { ...x, qty: x.qty + 1 } : x,
        ),
      });
      return;
    }
    set({
      cart: [
        ...cart,
        { ...item, cartKey: key, qty: 1, notes: "", modifiers: [] },
      ],
    });
  },

  setItemNotes: (id, notes) => {
    const { cart } = get();
    set({
      cart: cart.map((x) => ((x.cartKey || x.id) === id ? { ...x, notes } : x)),
    });
  },

  updateQty: (id, delta) => {
    const { cart } = get();
    set({
      cart: cart
        .map((x) =>
          (x.cartKey || x.id) === id ? { ...x, qty: x.qty + delta } : x,
        )
        .filter((x) => x.qty > 0),
    });
  },

  updateItemPortion: (id, portion, price) => {
    const { cart } = get();
    const index = cart.findIndex((x) => (x.cartKey || x.id) === id);
    if (index < 0) return;

    const current = cart[index];
    const nextPortion = String(portion || current.portion || "Full");
    const nextPrice = Number(price || current.price || 0);
    const nextKey = `${current.id}::${nextPortion}`;
    const currentKey = current.cartKey || current.id;

    if (nextKey === currentKey) {
      set({
        cart: cart.map((x, i) =>
          i === index ? { ...x, portion: nextPortion, price: nextPrice } : x,
        ),
      });
      return;
    }

    const existingIndex = cart.findIndex(
      (x, i) => i !== index && (x.cartKey || x.id) === nextKey,
    );

    if (existingIndex >= 0) {
      const existing = cart[existingIndex];
      const merged = {
        ...existing,
        qty: Number(existing.qty || 0) + Number(current.qty || 0),
        portion: nextPortion,
        price: nextPrice,
      };
      const nextCart = cart.filter(
        (_, i) => i !== index && i !== existingIndex,
      );
      nextCart.push(merged);
      set({ cart: nextCart });
      return;
    }

    set({
      cart: cart.map((x, i) =>
        i === index
          ? {
              ...x,
              cartKey: nextKey,
              portion: nextPortion,
              price: nextPrice,
            }
          : x,
      ),
    });
  },

  removeItem: (id) => {
    const { cart } = get();
    set({ cart: cart.filter((x) => (x.cartKey || x.id) !== id) });
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
    const { cart, discountPct, gstPct, taxPct } = get();
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const discount = (subtotal * discountPct) / 100;
    const taxable = subtotal - discount;
    const gstAmount = (taxable * gstPct) / 100;
    const extraTaxAmount = (taxable * taxPct) / 100;
    const tax = gstAmount + extraTaxAmount;
    const total = taxable + tax;
    const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);
    return {
      subtotal,
      discount,
      taxable,
      gstAmount,
      extraTaxAmount,
      tax,
      total,
      itemCount,
    };
  },

  splitEvenly: (people) => {
    const safePeople = Math.max(1, Number(people) || 1);
    const { total } = get().getTotals();
    return Number((total / safePeople).toFixed(2));
  },
}));

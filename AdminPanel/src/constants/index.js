/** GST rate applied to POS and invoice totals */
export const TAX_RATE = 0.05;

/** Tailwind class map for order status values from the backend */
export const ORDER_STATUS_CLASS = {
  Preparing: "bg-warning/20 text-ink",
  Ready: "bg-saffron-lt text-saffron",
  Served: "bg-sage-lt text-sage",
  Dispatch: "bg-info/15 text-info",
  Cancelled: "bg-error/15 text-error",
};

/** Role strings used for ProtectedRoute and hasRoleAccess */
export const ROLES = {
  CASHIER: "cashier",
  MANAGER: "manager",
  ADMIN: "admin",
};

/** Business types */
export const BUSINESS_TYPE = {
  RESTRO: "restro",
  HOTEL: "hotel",
};

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("restroToken");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

// ── Auth ────────────────────────────────────────────────────────────────────
export function registerRestro(payload) {
  return request("POST", "/auth/register", payload);
}

export function loginRestro(identifier, password, otpToken) {
  return request("POST", "/auth/login", { identifier, password, otpToken });
}

export function requestEmailOtp(email, purpose) {
  return request("POST", "/auth/otp/request", { email, purpose });
}

export function verifyEmailOtp(email, purpose, otp) {
  return request("POST", "/auth/otp/verify", { email, purpose, otp });
}

// ── Business Profile ─────────────────────────────────────────────────────────
export function fetchProfile() {
  return request("GET", "/business/profile");
}

export function updateProfile(payload) {
  return request("PUT", "/business/profile", payload);
}

// ── Menu ─────────────────────────────────────────────────────────────────────
export function fetchMenuItems() {
  return request("GET", "/menu");
}

export function createMenuItem(payload) {
  return request("POST", "/menu", payload);
}

export function updateMenuItem(id, payload) {
  return request("PUT", `/menu/${id}`, payload);
}

export function deleteMenuItem(id) {
  return request("DELETE", `/menu/${id}`);
}

export function fetchMenuCategories() {
  return request("GET", "/menu/categories");
}

// ── Tables ───────────────────────────────────────────────────────────────────
export function fetchTables() {
  return request("GET", "/tables");
}

export function createTable(payload) {
  return request("POST", "/tables", payload);
}

export function updateTable(id, payload) {
  return request("PUT", `/tables/${id}`, payload);
}

export function deleteTable(id) {
  return request("DELETE", `/tables/${id}`);
}

// ── Orders ───────────────────────────────────────────────────────────────────
export function fetchOrders() {
  return request("GET", "/orders");
}

export function updateOrderStatus(id, status) {
  return request("PATCH", `/orders/${id}/status`, { status });
}

// ── Guests ───────────────────────────────────────────────────────────────────
// No auth required — upserts the guest record by phone number.
export function registerGuest(phone, name) {
  return request("POST", "/guests/register", { phone, name: name || "Guest" });
}

// Fetch orders placed (via POS or QR) for a guest phone — no auth required.
export async function fetchGuestOrders(phone, businessId) {
  const normalized = String(phone || "")
    .replace(/\D/g, "")
    .slice(-10);
  if (normalized.length < 10 || !businessId) return { orders: [] };
  const res = await fetch(
    `${BASE}/orders/guest?phone=${encodeURIComponent(normalized)}&businessId=${encodeURIComponent(businessId)}`,
  );
  if (!res.ok) return { orders: [] };
  return res.json();
}

// ── Guest public API (no auth) ───────────────────────────────────────────────

/**
 * Register a guest visit for a specific restaurant.
 * Fire-and-forget — errors are swallowed.
 */
export async function registerGuestVisitApi(
  phone,
  name,
  { businessId, restroSlug, tableId } = {},
  signal,
) {
  const normalized = String(phone || "")
    .replace(/\D/g, "")
    .slice(-10);
  if (normalized.length !== 10) return;
  const params = new URLSearchParams();
  if (businessId) params.set("biz", businessId);
  if (restroSlug) params.set("restro", restroSlug);
  const qs = params.toString() ? `?${params.toString()}` : "";
  try {
    await fetch(`${BASE}/guests/register${qs}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: `+91${normalized}`,
        name: String(name || "Guest").trim() || "Guest",
        ...(businessId ? { businessId } : {}),
        tableId,
        source: "QR",
      }),
      signal,
    });
  } catch {
    // non-blocking
  }
}

/**
 * Fetch QR table payload (business info + menu items).
 * Returns null on failure.
 */
export async function fetchQrTable(
  tableId,
  { businessId, restroSlug } = {},
  signal,
) {
  const params = new URLSearchParams();
  if (businessId) params.set("biz", businessId);
  if (restroSlug) params.set("restro", restroSlug);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${BASE}/qr/${encodeURIComponent(tableId)}${qs}`, {
    signal,
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Fetch public offers for a restaurant.
 * Returns an empty array on failure.
 */
export async function fetchPublicOffers(
  { businessId, restroSlug } = {},
  signal,
) {
  const params = new URLSearchParams();
  if (restroSlug) params.set("restro", restroSlug);
  if (businessId) params.set("biz", businessId);
  if (!params.toString()) return [];
  const res = await fetch(`${BASE}/offers/public?${params.toString()}`, {
    signal,
  });
  if (!res.ok) return [];
  const rows = await res.json();
  return Array.isArray(rows) ? rows : [];
}

/**
 * Poll the status of a single active order.
 * Uses the guest orders endpoint filtered by orderId to avoid auth requirement.
 * Returns { status, paymentStatus } or null.
 */
export async function pollOrderStatus(
  phone,
  orderId,
  { businessId, restroSlug } = {},
  signal,
) {
  const normalized = String(phone || "")
    .replace(/\D/g, "")
    .slice(-10);
  if (normalized.length !== 10 || !orderId) return null;
  const params = new URLSearchParams();
  if (businessId) params.set("biz", businessId);
  if (restroSlug) params.set("restro", restroSlug);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const encodedPhone = encodeURIComponent(`+91${normalized}`);
  const res = await fetch(`${BASE}/guests/${encodedPhone}/orders${qs}`, {
    signal,
  });
  if (!res.ok) return null;
  const orders = await res.json();
  if (!Array.isArray(orders)) return null;
  const order = orders.find((o) => String(o._id) === String(orderId));
  if (!order) return null;
  return {
    status: order.status,
    paymentStatus: order.paymentStatus || "Pending",
  };
}

/**
 * Place an order for a guest.
 * Returns the created order data or null on failure.
 */
export async function placeGuestOrder(
  phone,
  payload,
  { businessId, restroSlug } = {},
) {
  const normalized = String(phone || "")
    .replace(/\D/g, "")
    .slice(-10);
  if (normalized.length !== 10) return null;
  const params = new URLSearchParams();
  if (businessId) params.set("biz", businessId);
  if (restroSlug) params.set("restro", restroSlug);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const encodedPhone = encodeURIComponent(`+91${normalized}`);
  const res = await fetch(`${BASE}/guests/${encodedPhone}/orders${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  return res.json();
}

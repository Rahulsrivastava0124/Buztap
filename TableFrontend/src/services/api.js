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

export function loginRestro(username, password) {
  return request("POST", "/auth/login", { username, password });
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

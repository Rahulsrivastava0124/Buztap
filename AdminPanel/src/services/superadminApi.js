const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function getSuperAdminToken() {
  return localStorage.getItem("superAdminToken");
}

function superAdminHeaders() {
  const token = getSuperAdminToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function saRequest(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: superAdminHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      superAdminLogout();
      window.location.href = "/admin";
    }
    throw new Error(data?.error || "Request failed");
  }
  return data;
}

// ── Auth: Email Login (ENV) ──────────────────────────────────────────────
export function superAdminLogin(email, password) {
  return saRequest("POST", "/superadmin/login", { email, password });
}

// ── Profile ────────────────────────────────────────────────────────────────
export function fetchSuperAdminProfile() {
  return saRequest("GET", "/superadmin/profile");
}

export function fetchSuperAdminStats() {
  return saRequest("GET", "/superadmin/stats");
}

export function fetchAllBusinesses(params = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.type) qs.set("type", params.type);
  const qsStr = qs.toString();
  return saRequest("GET", `/superadmin/businesses${qsStr ? `?${qsStr}` : ""}`);
}

export function fetchBusinessDetail(id) {
  return saRequest("GET", `/superadmin/businesses/${id}`);
}

export function toggleBusiness(id) {
  return saRequest("PUT", `/superadmin/businesses/${id}/toggle`);
}

export function superAdminLogout() {
  localStorage.removeItem("superAdminToken");
  localStorage.removeItem("superAdminProfile");
}

export function isSuperAdminLoggedIn() {
  return !!localStorage.getItem("superAdminToken");
}

// ── Advanced Features ──────────────────────────────────────────────────────

export function fetchAnalyticsChart(days = 7) {
  return saRequest("GET", `/superadmin/analytics/chart?days=${days}`);
}

export function fetchTopRestaurants() {
  return saRequest("GET", "/superadmin/analytics/top-restaurants");
}

export function fetchAuditLogs(params = {}) {
  const qs = new URLSearchParams({ page: params.page || 1, limit: params.limit || 50 });
  if (params.search) qs.set("search", params.search);
  if (params.method) qs.set("method", params.method);
  if (params.status) qs.set("status", params.status);
  return saRequest("GET", `/superadmin/audit-logs?${qs.toString()}`);
}

export function updateBusinessDetails(id, data) {
  return saRequest("PUT", `/superadmin/businesses/${id}`, data);
}

export function fetchSystemHealth() {
  return saRequest("GET", "/superadmin/system/health");
}

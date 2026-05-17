export type UserRole = "admin" | "manager" | "cashier";

export type PaymentMethod = "Cash" | "Card/UPI" | "Room Charge";

export interface TodayStats {
  restaurantName?: string;
  restaurantSlug?: string;
  totalVisitors: number;
  activeOrders: number;
  servedToday: number;
  cancelledToday: number;
  posOrders: number;
  qrOrders: number;
  hourlyVisits: Array<{ label: string; count: number }>;
  peakHour: { label: string; count: number };
  totalRevenue: number;
  avgSpendPerVisitor: number;
  newGuests: number;
  returningGuests: number;
  occupiedTables: number;
  totalTables: number;
  lastUpdated: string;
}

export interface RevenueTrend {
  labels: string[];
  data: number[];
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  x: string;
  googleReview: string;
}

export interface DashboardSnapshot {
  paymentBreakup: Array<{ label: string; amount: number; share: number }>;
  settlements: Array<{
    channel: string;
    gross: number;
    fee: number;
    net: number;
    status: "Settled" | "Pending";
  }>;
  productMix: Array<{
    name: string;
    category: string;
    units: number;
    revenue: number;
    margin: number;
    stock: "Healthy" | "Low";
  }>;
  areaLoad: Array<{
    area: string;
    occupied: number;
    total: number;
    avgTurn: number;
  }>;
  kitchenQueue: Array<{
    ticket: string;
    stage: string;
    wait: string;
    priority: "Normal" | "High";
  }>;
  channelSplit: Array<{ channel: string; value: number }>;
  grossSales: number;
  gstAmount: number;
  totalUnitsSold: number;
  topCategory: string;
  avgTableTurnover: number;
  qrScans: number;
  qrConvRate: number;
  dailyRevenue: number;
  totalOrders: number;
}

export interface BusinessProfile {
  id: string;
  name: string;
  type: "restro" | "hotel";
  email: string;
  phone: string;
  address: string;
  socialLinks: SocialLinks;
  plan: "free" | "pro" | "enterprise";
  subdomain: string;
  branches: number;
  tableCount: number;
  gstPct: number;
  taxPct: number;
  gstNo: string;
  restroUpi: string;
  headerImage: string;
  logoImage: string;
  holidays: Array<{ date: string; name: string }>;
  isActive: boolean;
}

export interface UpdateBusinessProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialLinks?: Partial<SocialLinks>;
  subdomain?: string;
  branches?: number;
  tableCount?: number;
  gstPct?: number;
  taxPct?: number;
  gstNo?: string;
  restroUpi?: string;
  headerImage?: string;
  logoImage?: string;
  holidays?: Array<{ date: string; name?: string }>;
}

export interface PosMenuItem {
  id: string;
  name: string;
  price: number;
  priceOptions: Array<{ label: string; price: number }>;
  cat: string;
  img: string;
}

export interface TableRecord {
  id: string;
  seats: number;
  status: "Occupied" | "Free" | "Reserved" | "Cleaning";
  guestName: string | null;
  updatedAt: string | null;
}

export interface TableQrPayload {
  tableId: string;
  qrValue: string;
  menuUrl: string;
  businessName: string;
  totalTables: number;
  table: {
    id: string;
    label: string;
    seats: number;
    area: string;
  };
}

export interface AdminLoginResponse {
  token: string;
  role: UserRole;
  businessType: "restro" | "hotel";
  businessName?: string;
  subdomain?: string;
  name?: string;
  businessId?: string;
}

export interface OtpRequestResponse {
  success: boolean;
  expiresInSeconds: number;
}

export interface PhoneOtpRequestResponse {
  success: boolean;
  resolvedEmail: string;
  expiresInSeconds: number;
}

export interface LoginOtpRequestResponse {
  success: boolean;
  resolvedEmail: string;
  expiresInSeconds: number;
}

export interface OtpVerifyResponse {
  success: boolean;
  otpToken: string;
}

export interface OrderQueueItem {
  _id: string;
  id: string;
  channel: "POS" | "QR";
  tableId?: string | null;
  roomId?: string | null;
  source: string;
  guestName?: string;
  guestPhone?: string | null;
  createdAt?: string;
  items: number;
  amount: number;
  status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled";
  paymentStatus?: "Pending" | "Completed" | "Failed";
  paymentMethod?: string;
  transactionId?: string | null;
  eta: string;
}

export interface UpdateOrderPaymentInput {
  paymentMethod: PaymentMethod;
  paymentStatus: "Completed" | "Failed";
  transactionId?: string;
}

export interface OrderDetailItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  portion?: string;
  notes?: string;
}

export interface OrderDetail {
  _id: string;
  orderId: string;
  tableId: string | null;
  roomId: string | null;
  guestName: string;
  guestPhone: string | null;
  orderType: string;
  source: "POS" | "QR";
  items: OrderDetailItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  cancelReason?: string | null;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  item: string;
  unit: string;
  inStock: number;
  reorderAt: number;
  status: "Healthy" | "Low" | "Out of Stock";
}

export type StaffDesignation =
  | "Admin"
  | "Manager"
  | "Receptionist"
  | "Kitchen"
  | "Waiter"
  | "Employee";

export type StaffSystemRole = "admin" | "manager" | "cashier";
export type StaffAttendanceStatus =
  | "work"
  | "absent"
  | "holiday"
  | "weekOff"
  | "halfDay";

export interface ShiftTiming {
  name: "Morning" | "Evening" | "Night" | "Custom";
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface StaffAttendanceRecord {
  date: string;
  status: StaffAttendanceStatus;
  note?: string;
  punchIn?: string;
  punchOut?: string;
  isLate?: boolean;
  lateMinutes?: number;
  isBusinessHoliday?: boolean;
}

export type StaffLeaveStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";
export type StaffLeaveType = "Casual" | "Sick" | "Paid" | "Unpaid" | "Other";

export interface StaffLeaveRequest {
  id: string;
  staffId?: string;
  staffName?: string;
  staffDesignation?: string;
  startDate: string;
  endDate: string;
  leaveType: StaffLeaveType;
  reason: string;
  status: StaffLeaveStatus;
  requestedAt?: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  managerNote?: string;
}

export interface StaffRecord {
  id: string;
  username: string;
  name: string;
  role: StaffSystemRole;
  designation: StaffDesignation;
  shiftTiming: ShiftTiming;
  email: string;
  phone: string;
  salaryMonthly: number;
  leaveAllowance: number;
  leavesTaken: number;
  joiningDate?: string | null;
  leaveRequests?: StaffLeaveRequest[];
  attendanceRecords: StaffAttendanceRecord[];
  score: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateStaffInput {
  username: string;
  password: string;
  name: string;
  designation: StaffDesignation;
  role?: StaffSystemRole;
  shiftTiming?: ShiftTiming;
  email?: string;
  phone?: string;
  salaryMonthly?: number;
  leaveAllowance?: number;
  leavesTaken?: number;
  joiningDate?: string;
  attendanceRecords?: StaffAttendanceRecord[];
}

export interface UpdateStaffInput {
  name?: string;
  designation?: StaffDesignation;
  role?: StaffSystemRole;
  shiftTiming?: ShiftTiming;
  email?: string;
  phone?: string;
  salaryMonthly?: number;
  leaveAllowance?: number;
  leavesTaken?: number;
  joiningDate?: string;
  attendanceRecords?: StaffAttendanceRecord[];
  isActive?: boolean;
  serviceScore?: number;
  password?: string;
}

export interface ReportRecord {
  id: string;
  name: string;
  period: string;
  owner?: string;
}

export type OfferType = "coupon" | "festival" | "category" | "item";
export type OfferAudience = "all" | "new" | "returning";

export interface OfferRecord {
  id: string;
  title: string;
  code: string;
  description: string;
  offerType: OfferType;
  audience: OfferAudience;
  discountPct: number;
  minSubtotal: number;
  targetCategory: string;
  targetItemIds: string[];
  expiresAt?: string | null;
  isVisible: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOfferInput {
  title: string;
  code: string;
  description?: string;
  offerType?: OfferType;
  audience?: OfferAudience;
  discountPct: number;
  minSubtotal?: number;
  targetCategory?: string;
  targetItemIds?: string[];
  expiresAt?: string | null;
  isVisible?: boolean;
  isActive?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  priceOptions: Array<{ label: string; price: number }>;
  cost: number;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime: number;
  spiceLevel: number;
  allergens: string[];
}

export interface CreateMenuItemInput {
  name: string;
  description?: string;
  category: string;
  price: number;
  priceOptions?: Array<{ label: string; price: number }>;
  cost?: number;
  image?: string;
  isVeg?: boolean;
  isAvailable?: boolean;
  preparationTime?: number;
  spiceLevel?: number;
  allergens?: string[];
}

export interface PosOrderItemInput {
  menuItemId?: string;
  name: string;
  quantity: number;
  price: number;
  portion?: string;
  notes?: string;
  modifiers?: string[];
}

export interface CreatePosOrderInput {
  tableId?: string;
  roomId?: string;
  guestName?: string;
  guestPhone?: string;
  orderType?: "Dine-in" | "Takeaway" | "Delivery" | "Room Service";
  source?: "POS" | "QR";
  items: PosOrderItemInput[];
  discountPct?: number;
  discountReason?: string;
  paymentMethod?: PaymentMethod;
}

export interface UpdateOrderItemsInput {
  items: PosOrderItemInput[];
  guestName?: string;
  guestPhone?: string;
  orderType?: "Dine-in" | "Takeaway" | "Delivery" | "Room Service";
  discountPct?: number;
  discountReason?: string;
}

export interface PosOrderResponse {
  orderId: string;
  total: number;
  status: "Preparing" | "Ready" | "Served" | "Cancelled";
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AUTH_TOKEN_KEY = "adminAuthToken";
const AUTH_EXPIRES_AT_KEY = "adminAuthExpiresAt";

function getStoredValue(key: string) {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function setStoredValue(key: string, value: string) {
  localStorage.setItem(key, value);
  sessionStorage.setItem(key, value);
}

function removeStoredValue(key: string) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

function getFallbackBusinessProfile(): BusinessProfile {
  const businessType =
    (getStoredValue("adminBusinessType") as "restro" | "hotel") || "restro";

  return {
    id: "fallback-profile",
    name: "",
    type: businessType,
    email: "",
    phone: "",
    address: "",
    socialLinks: {
      instagram: "",
      facebook: "",
      x: "",
      googleReview: "",
    },
    plan: "free",
    subdomain: "",
    branches: 1,
    tableCount: 0,
    gstPct: 5,
    taxPct: 0,
    gstNo: "",
    restroUpi: "",
    headerImage: "",
    logoImage: "",
    holidays: [],
    isActive: true,
  };
}

function buildApiErrorMessage(payload: any, status: number): string {
  if (payload?.error && payload?.details?.length > 0) {
    const first = payload.details[0];
    const path = Array.isArray(first?.path) ? first.path.join(".") : "";
    const detailMsg = first?.message || "Invalid input";
    return path
      ? `${payload.error}: ${path} - ${detailMsg}`
      : `${payload.error}: ${detailMsg}`;
  }
  return payload?.error || `Request failed: ${status}`;
}

function getAuthToken() {
  return getStoredValue(AUTH_TOKEN_KEY);
}

export function clearAuthSession() {
  removeStoredValue("adminAuth");
  removeStoredValue("adminAuthRole");
  removeStoredValue("adminBusinessType");
  removeStoredValue("adminBusinessName");
  removeStoredValue("adminUserName");
  removeStoredValue("adminSubdomain");
  removeStoredValue(AUTH_TOKEN_KEY);
  removeStoredValue(AUTH_EXPIRES_AT_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  useAuth = true,
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (useAuth) {
    const token = getAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      // Notify the app so AuthContext can redirect to login
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
    const err = new Error(
      buildApiErrorMessage(payload, response.status),
    ) as Error & { retryAfterSeconds?: number };
    if (typeof payload?.retryAfterSeconds === "number") {
      err.retryAfterSeconds = payload.retryAfterSeconds;
    }
    throw err;
  }

  return payload as T;
}

export async function loginAdmin(
  identifier: string,
  password: string,
  otpToken?: string,
): Promise<AdminLoginResponse> {
  const data = await request<AdminLoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ identifier, password, otpToken }),
    },
    false,
  );

  setStoredValue(AUTH_TOKEN_KEY, data.token);
  return data;
}

export async function requestEmailOtp(
  email: string,
  purpose: "register" | "login" | "reset-password",
): Promise<OtpRequestResponse> {
  return request<OtpRequestResponse>(
    "/auth/otp/request",
    {
      method: "POST",
      body: JSON.stringify({ email, purpose }),
    },
    false,
  );
}

export async function requestPhoneLoginOtp(
  phone: string,
): Promise<PhoneOtpRequestResponse> {
  return request<PhoneOtpRequestResponse>(
    "/auth/otp/request-by-phone",
    { method: "POST", body: JSON.stringify({ phone }) },
    false,
  );
}

export async function requestLoginOtp(
  identifier: string,
  password: string,
): Promise<LoginOtpRequestResponse> {
  return request<LoginOtpRequestResponse>(
    "/auth/otp/request-login",
    {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    },
    false,
  );
}

export async function verifyEmailOtp(
  email: string,
  purpose: "register" | "login" | "reset-password",
  otp: string,
): Promise<OtpVerifyResponse> {
  return request<OtpVerifyResponse>(
    "/auth/otp/verify",
    {
      method: "POST",
      body: JSON.stringify({ email, purpose, otp }),
    },
    false,
  );
}

export async function resetAdminPassword(
  email: string,
  otpToken: string,
  newPassword: string,
): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>(
    "/auth/password/reset",
    {
      method: "POST",
      body: JSON.stringify({ email, otpToken, newPassword }),
    },
    false,
  );
}

export async function fetchAuthMe(): Promise<{
  role: UserRole;
  businessType: "restro" | "hotel";
  businessName?: string;
  subdomain?: string;
  name?: string;
}> {
  return request("/auth/me");
}

export async function logoutAdmin(): Promise<void> {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    clearAuthSession();
  }
}

export async function fetchDashboardSnapshot(): Promise<DashboardSnapshot> {
  return request("/dashboard/snapshot");
}

export async function fetchBusinessProfile(): Promise<BusinessProfile> {
  try {
    return await request("/business/profile");
  } catch (err: any) {
    const message = err?.message || "";
    // Backward compatible fallback when backend does not yet expose /business/profile
    if (
      message === "Route not found" ||
      message === "Business profile not found"
    ) {
      return getFallbackBusinessProfile();
    }
    throw err;
  }
}

export async function updateBusinessProfile(
  payload: UpdateBusinessProfileInput,
): Promise<BusinessProfile> {
  return request("/business/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchRevenueTrend(
  range: "1D" | "7D" | "1M" | "6M",
): Promise<RevenueTrend> {
  return request(`/dashboard/revenue-trend?range=${range}`);
}

export async function fetchVisitorTrend(
  range: "1D" | "7D" | "1M" | "6M",
): Promise<RevenueTrend> {
  return request(`/dashboard/visitor-trend?range=${range}`);
}

export async function fetchPosCatalog(): Promise<PosMenuItem[]> {
  const rows = await request<Array<any>>("/menu");
  const items = Array.isArray(rows)
    ? rows
    : Array.isArray((rows as any)?.items)
      ? (rows as any).items
      : [];

  return items.map((item) => ({
    id: item._id,
    name: item.name,
    price: Number(item.price || 0),
    priceOptions: Array.isArray(item.priceOptions)
      ? item.priceOptions
          .map((opt: any) => ({
            label: String(opt?.label || "").trim(),
            price: Number(opt?.price || 0),
          }))
          .filter((opt: { label: string; price: number }) =>
            Boolean(opt.label && opt.price > 0),
          )
      : [],
    cat: item.category || "Uncategorized",
    img: item.image || "",
  }));
}

export async function fetchTables(): Promise<TableRecord[]> {
  const rows = await request<Array<any>>("/tables");
  return rows.map((table) => ({
    id: table.tableId,
    seats: Number(table.seats || 0),
    status: table.status,
    guestName: table.guestName ?? null,
    updatedAt: table.updatedAt ?? null,
  }));
}

export async function updateTableStatus(
  tableId: string,
  status: TableRecord["status"],
): Promise<TableRecord> {
  const table = await request<any>(`/tables/${tableId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  return {
    id: table.tableId,
    seats: Number(table.seats || 0),
    status: table.status,
    guestName: table.guestName ?? null,
    updatedAt: table.updatedAt ?? null,
  };
}

export async function fetchIncomingQrOrders(): Promise<
  Array<{ _id: string; id: string; source: string; amount: number }>
> {
  return request("/orders/incoming/qr");
}
export async function approveQrOrder(orderId: string): Promise<void> {
  await request(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "Preparing" }),
  });
}

export async function declineQrOrder(orderId: string): Promise<void> {
  await request(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "Cancelled",
      cancelReason: "Declined by kitchen",
    }),
  });
}

export async function fetchTableQr(tableId: string): Promise<TableQrPayload> {
  // useAuth=true so the backend can scope the lookup to this admin's business
  return request(`/qr/${encodeURIComponent(tableId)}`);
}

export async function fetchGuestByPhone(
  phone: string,
): Promise<{ name: string; phone: string } | null> {
  try {
    return await request<{ name: string; phone: string }>(
      `/guests/lookup?phone=${encodeURIComponent(phone)}`,
    );
  } catch {
    return null; // 404 = new guest, any other error = graceful no-op
  }
}

export async function saveGuest(
  phone: string,
  name: string,
  slug: string,
): Promise<void> {
  try {
    await request(
      `/guests/register?restro=${encodeURIComponent(slug)}`,
      { method: "POST", body: JSON.stringify({ phone, name, source: "POS" }) },
      true,
    );
  } catch {
    // Non-critical — saving guest name should never block the order flow
  }
}

export async function fetchOrders(): Promise<OrderQueueItem[]> {
  const data = await request<{ orders: Array<any> }>("/orders?limit=100");
  const now = Date.now();
  const normalizeTableId = (raw: any) => {
    const value = String(raw || "").trim();
    if (!value) return null;
    const digits = value.replace(/\D/g, "");
    if (!digits) return null;
    return `T-${String(Number(digits)).padStart(2, "0")}`;
  };

  return (data.orders || []).map((order) => {
    const minutes = Math.max(
      1,
      Math.round((now - new Date(order.createdAt).getTime()) / 60000),
    );
    const sourceLabel = order.tableId
      ? order.tableId
      : order.roomId
        ? `Room ${order.roomId}`
        : order.orderType;
    const items = Array.isArray(order.items)
      ? order.items.reduce(
          (acc: number, item: any) => acc + (item.quantity || 0),
          0,
        )
      : 0;
    const normalizedTableId =
      normalizeTableId(order.tableId) || normalizeTableId(order.source);
    const orderId = order.orderId || String(order._id || "");
    return {
      _id: String(order._id),
      id: orderId,
      orderId,
      channel: order.source === "QR" ? "QR" : "POS",
      tableId: normalizedTableId,
      roomId: order.roomId || null,
      source: sourceLabel,
      guestName: order.guestName || "Guest",
      guestPhone: order.guestPhone || null,
      createdAt: order.createdAt || null,
      items,
      amount: Number(order.total || 0),
      status: order.status,
      paymentStatus: order.paymentStatus || "Pending",
      paymentMethod: order.paymentMethod || "Pending",
      transactionId: order.transactionId || null,
      eta: order.status === "Served" ? "Done" : `${minutes}m`,
    };
  });
}

export async function fetchOrderById(id: string): Promise<OrderDetail> {
  return request<OrderDetail>(`/orders/${encodeURIComponent(id)}`);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderQueueItem["status"],
): Promise<OrderDetail> {
  return request<OrderDetail>(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateOrderPayment(
  orderId: string,
  payload: UpdateOrderPaymentInput,
): Promise<OrderDetail> {
  return request<OrderDetail>(
    `/orders/${encodeURIComponent(orderId)}/payment`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateOrderItems(
  orderId: string,
  payload: UpdateOrderItemsInput,
): Promise<OrderDetail> {
  return request<OrderDetail>(`/orders/${encodeURIComponent(orderId)}/items`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchRecentOrders(): Promise<
  Array<{
    id: string;
    table: string;
    items: string;
    total: string;
    status: string;
    time: string;
  }>
> {
  const orders = await fetchOrders();
  return orders.slice(0, 8).map((order) => ({
    id: order.id,
    table: order.source,
    items: `${order.items} item${order.items === 1 ? "" : "s"}`,
    total: `₹${order.amount.toLocaleString()}`,
    status: order.status.toLowerCase(),
    time: order.eta,
  }));
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const rows = await request<Array<any>>("/inventory");
  return rows.map((item) => ({
    id: item._id,
    item: item.itemName,
    unit: item.unit,
    inStock: Number(item.inStock || 0),
    reorderAt: Number(item.reorderAt || 0),
    status: item.status,
  }));
}

function mapStaff(member: any): StaffRecord {
  const shift = ["Morning", "Evening", "Night"].includes(member.shift)
    ? member.shift
    : "Morning";

  // Deduplicate attendance records by date to prevent duplicate data display
  const recordMap: Record<string, any> = {};
  const attendanceRecords = Array.isArray(member.attendanceRecords)
    ? member.attendanceRecords.reduce((acc: Array<any>, record: any) => {
        const d = new Date(record.date);
        if (!Number.isNaN(d.getTime())) {
          // Convert to UTC date key to ensure consistency
          const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
          // Keep only the latest record for each date (last one wins)
          recordMap[dateKey] = {
            date: record.date,
            status: record.status,
            note: record.note || "",
            punchIn: record.punchIn || undefined,
            punchOut: record.punchOut || undefined,
            isLate: record.isLate === true,
            lateMinutes: Number(record.lateMinutes || 0),
            isBusinessHoliday: record.isBusinessHoliday === true,
          };
        }
        return acc;
      }, [])
    : [];

  // Convert map back to array
  const deduplicatedRecords = Object.values(recordMap);

  return {
    id: member._id || member.id,
    username: member.username || "",
    name: member.name,
    role: member.role,
    designation: member.designation || "Employee",
    shift,
    email: member.email || "",
    phone: member.phone || "",
    salaryMonthly: Number(member.salaryMonthly || 0),
    leaveAllowance: Number(member.leaveAllowance ?? 12),
    leavesTaken: Number(member.leavesTaken || 0),
    joiningDate: member.joiningDate || null,
    leaveRequests: Array.isArray(member.leaveRequests)
      ? member.leaveRequests.map(mapStaffLeaveRequest)
      : [],
    attendanceRecords: deduplicatedRecords,
    score: Number(member.serviceScore ?? 80),
    isActive: member.isActive !== false,
    createdAt: member.createdAt,
  };
}

function mapStaffLeaveRequest(request: any): StaffLeaveRequest {
  return {
    id: request.id || request._id,
    staffId: request.staffId || request.userId,
    staffName: request.staffName || request.name || "",
    staffDesignation: request.staffDesignation || request.designation || "",
    startDate: request.startDate,
    endDate: request.endDate,
    leaveType: request.leaveType || "Casual",
    reason: request.reason || "",
    status: request.status || "pending",
    requestedAt: request.requestedAt,
    reviewedAt: request.reviewedAt || null,
    reviewedBy: request.reviewedBy || null,
    managerNote: request.managerNote || "",
  };
}

export async function fetchStaff(): Promise<StaffRecord[]> {
  const rows = await request<Array<any>>("/staff");
  return rows.map(mapStaff);
}

export async function createStaffMember(
  payload: CreateStaffInput,
): Promise<StaffRecord> {
  const result = await request<any>("/staff", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapStaff(result);
}

export async function updateStaffMember(
  id: string,
  payload: UpdateStaffInput,
): Promise<StaffRecord> {
  const result = await request<any>(`/staff/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return mapStaff(result);
}

export async function deleteStaffMember(id: string): Promise<void> {
  await request<any>(`/staff/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function punchInStaff(id: string): Promise<StaffRecord> {
  const result = await request<any>(
    `/staff/${encodeURIComponent(id)}/punch-in`,
    {
      method: "POST",
    },
  );
  return mapStaff(result);
}

export async function punchOutStaff(id: string): Promise<StaffRecord> {
  const result = await request<any>(
    `/staff/${encodeURIComponent(id)}/punch-out`,
    {
      method: "POST",
    },
  );
  return mapStaff(result);
}

export async function fetchStaffLeaveRequests(): Promise<StaffLeaveRequest[]> {
  const result = await request<any>("/staff/leave-requests");
  const rows = Array.isArray(result) ? result : result.leaveRequests || [];
  return rows.map(mapStaffLeaveRequest);
}

export async function reviewStaffLeaveRequest(
  staffId: string,
  requestId: string,
  payload: { status: "approved" | "rejected"; managerNote?: string },
): Promise<{ leaveRequest: StaffLeaveRequest; staff?: StaffRecord }> {
  const result = await request<any>(
    `/staff/${encodeURIComponent(staffId)}/leave-requests/${encodeURIComponent(
      requestId,
    )}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  return {
    leaveRequest: mapStaffLeaveRequest(result.leaveRequest || result),
    staff: result.staff ? mapStaff(result.staff) : undefined,
  };
}

export async function fetchReports(): Promise<ReportRecord[]> {
  const rows = await request<Array<any>>("/reports");
  return rows.map((report) => ({
    id: report.id || report._id || report.name,
    name: report.name,
    period: report.period || "N/A",
    owner: report.owner || "System",
  }));
}

export async function fetchOffers(): Promise<OfferRecord[]> {
  return request<OfferRecord[]>("/offers");
}

export async function createOffer(
  payload: CreateOfferInput,
): Promise<OfferRecord> {
  return request<OfferRecord>("/offers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOffer(
  id: string,
  payload: Partial<CreateOfferInput> & {
    isVisible?: boolean;
    isActive?: boolean;
  },
): Promise<OfferRecord> {
  return request<OfferRecord>(`/offers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteOffer(id: string): Promise<void> {
  await request(`/offers/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createPosOrder(
  payload: CreatePosOrderInput,
): Promise<PosOrderResponse> {
  const order = await request<any>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    orderId: order.orderId,
    total: Number(order.total || 0),
    status: order.status,
  };
}

function mapMenuItem(item: any): MenuItem {
  const priceOptions = Array.isArray(item.priceOptions)
    ? item.priceOptions
        .map((opt: any) => ({
          label: String(opt?.label || "").trim(),
          price: Number(opt?.price || 0),
        }))
        .filter((opt: { label: string; price: number }) =>
          Boolean(opt.label && opt.price > 0),
        )
    : [];

  return {
    id: item._id,
    name: item.name,
    description: item.description || "",
    category: item.category,
    price: Number(item.price || 0),
    priceOptions,
    cost: Number(item.cost || 0),
    image: item.image || "",
    isVeg: item.isVeg !== false,
    isAvailable: item.isAvailable !== false,
    preparationTime: Number(item.preparationTime || 15),
    spiceLevel: Number(item.spiceLevel || 2),
    allergens: Array.isArray(item.allergens) ? item.allergens : [],
  };
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const rows = await request<Array<any>>("/menu");
  return rows.map(mapMenuItem);
}

export async function fetchMenuCategories(): Promise<string[]> {
  const data = await request<{ categories: string[] }>("/menu/categories");
  return data.categories;
}

export async function createMenuItem(
  payload: CreateMenuItemInput,
): Promise<MenuItem> {
  const item = await request<any>("/menu", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapMenuItem(item);
}

export async function updateMenuItem(
  id: string,
  payload: Partial<CreateMenuItemInput>,
): Promise<MenuItem> {
  const item = await request<any>(`/menu/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return mapMenuItem(item);
}

export async function deleteMenuItem(id: string): Promise<void> {
  await request(`/menu/${id}`, { method: "DELETE" });
}

export async function fetchTodayStats(range = "1D"): Promise<TodayStats> {
  return request(`/dashboard/today-stats?range=${range}`);
}

export async function uploadMenuImage(file: File): Promise<string> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) clearAuthSession();
    throw new Error(buildApiErrorMessage(payload, response.status));
  }

  // R2 returns an absolute URL directly
  return payload.url as string;
}

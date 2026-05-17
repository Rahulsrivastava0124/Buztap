import axios, { AxiosInstance } from "axios";
import { Platform } from "react-native";
import { useAuthStore } from "../store/authStore";

const API_PREFIX = "/api";

// On Android, `localhost` / `127.0.0.1` points to the device itself.
// The host machine is reachable via 10.0.2.2 (emulator) or the LAN IP
// (physical device). We auto-swap so .env can stay as `localhost`.
function resolveHost(hostname: string): string {
  if (Platform.OS === "android") {
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "10.0.2.2";
    }
  }
  return hostname;
}

function normalizeBaseUrl(rawUrl?: string): string {
  const value = String(rawUrl || "")
    .trim()
    .replace(/\/+$/, "");

  if (!value) return "";

  try {
    const parsed = new URL(value);
    parsed.hostname = resolveHost(parsed.hostname);
    const trimmedPath = parsed.pathname.replace(/\/+$/, "");
    parsed.pathname = trimmedPath.toLowerCase().endsWith("/api")
      ? trimmedPath.slice(0, -4) || "/"
      : trimmedPath || "/";
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
}

// Types
export interface ShiftTiming {
  name: string;
  startTime: string;
  endTime: string;
}

export interface AttendanceRecord {
  date: string;
  status: "work" | "absent" | "holiday" | "halfDay" | "unmarked";
  note?: string;
  punchIn?: string;
  punchOut?: string;
  isLate?: boolean;
  lateMinutes?: number;
}

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  leaveType: "Casual" | "Sick" | "Paid" | "Unpaid" | "Other";
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  requestedAt?: string;
  reviewedAt?: string | null;
  managerNote?: string;
}

export interface Staff {
  id: string;
  name: string;
  username: string;
  designation: string;
  email: string;
  phone: string;
  shiftTiming: ShiftTiming;
  salaryMonthly: number;
  leaveAllowance: number;
  leavesTaken: number;
  leaveRequests?: LeaveRequest[];
  attendanceRecords: AttendanceRecord[];
  isActive: boolean;
}

const RAW_ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_URL = normalizeBaseUrl(RAW_ENV_API_URL);

let api: AxiosInstance;

export const initializeAPI = () => {
  if (!BASE_URL) {
    console.warn(
      "[API] EXPO_PUBLIC_API_URL is missing or invalid. Set it in StaffApp/.env",
    );
  }

  api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
  });

  // Add auth token to requests
  api.interceptors.request.use((config) => {
    if (!BASE_URL) {
      return Promise.reject(
        new Error("EXPO_PUBLIC_API_URL is missing or invalid in .env"),
      );
    }

    config.baseURL = BASE_URL;

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle responses
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    },
  );

  return api;
};

export const getAPI = () => {
  if (!api) {
    initializeAPI();
  }
  return api;
};

// Auth APIs
export const authAPI = {
  /** Step 1 – request OTP; returns maskedEmail + expiresInSeconds */
  requestOtp: (phone: string) =>
    getAPI().post(`${API_PREFIX}/auth/staff/request-otp`, { phone }),

  /** Step 2 – verify OTP; returns token + staff */
  verifyOtp: (phone: string, otp: string) =>
    getAPI().post(`${API_PREFIX}/auth/staff/verify-otp`, { phone, otp }),

  getProfile: (staffId: string) =>
    getAPI().get(`${API_PREFIX}/staff/${staffId}`),
};

// Attendance APIs
export const attendanceAPI = {
  punchIn: (staffId: string, deviceId: string | null, dateKey?: string) =>
    getAPI().post(`${API_PREFIX}/staff/${staffId}/punch-in`, {
      deviceId,
      dateKey,
    }),

  punchOut: (staffId: string, deviceId: string | null, dateKey?: string) =>
    getAPI().post(`${API_PREFIX}/staff/${staffId}/punch-out`, {
      deviceId,
      dateKey,
    }),

  getAttendance: (staffId: string) =>
    getAPI().get(`${API_PREFIX}/staff/${staffId}`),
};

export const leaveAPI = {
  getLeaveRequests: (staffId: string) =>
    getAPI().get(`${API_PREFIX}/staff/${staffId}/leave-requests`),

  createLeaveRequest: (
    staffId: string,
    payload: {
      startDate: string;
      endDate: string;
      leaveType: LeaveRequest["leaveType"];
      reason: string;
    },
  ) => getAPI().post(`${API_PREFIX}/staff/${staffId}/leave-requests`, payload),
};

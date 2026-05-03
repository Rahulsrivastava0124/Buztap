import axios, { AxiosInstance } from "axios";
import { NativeModules } from "react-native";
import { useAuthStore } from "../store/authStore";

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
  attendanceRecords: AttendanceRecord[];
  isActive: boolean;
}

// @ts-ignore
const ENV_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";
const PORT_CANDIDATES = [5000, 5001, 5002, 5003];
const DEFAULT_HOSTS = ["localhost", "127.0.0.1", "10.0.2.2"];

const normalizeEnvBaseUrl = (raw: string) => {
  try {
    const base = raw.includes("://") ? raw : `http://${raw}`;
    const url = new URL(base);
    const trimmedPath = url.pathname.replace(/\/+$/, "");

    if (!trimmedPath || trimmedPath === "/") {
      url.pathname = "/api";
    } else if (!trimmedPath.endsWith("/api")) {
      url.pathname = `${trimmedPath}/api`;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
};

const buildBaseUrlsForHost = (host: string) =>
  PORT_CANDIDATES.map((port) => `http://${host}:${port}/api`);

const getMetroHost = () => {
  try {
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (!scriptURL) return "";
    const host = new URL(scriptURL).hostname;
    return host || "";
  } catch {
    return "";
  }
};

const envBaseUrls = ENV_BASE_URL.split(",")
  .map((v) => normalizeEnvBaseUrl(v.trim()))
  .filter(Boolean);

const metroHost = getMetroHost();
const metroHostBaseUrls = metroHost ? buildBaseUrlsForHost(metroHost) : [];

const defaultBaseUrls = DEFAULT_HOSTS.flatMap((host) =>
  buildBaseUrlsForHost(host),
);

const API_BASE_URLS = [...envBaseUrls, ...metroHostBaseUrls, ...defaultBaseUrls]
  .filter(Boolean)
  .filter((value, index, array) => array.indexOf(value) === index);

let activeBaseUrlIndex = 0;

let api: AxiosInstance;

export const initializeAPI = () => {
  if (__DEV__) {
    console.log("[API] Base URLs:", API_BASE_URLS.join(" | "));
    console.log("[API] Active Base URL:", API_BASE_URLS[activeBaseUrlIndex]);
  }

  api = axios.create({
    baseURL: API_BASE_URLS[activeBaseUrlIndex] || "http://localhost:5000/api",
    timeout: 10000,
  });

  // Add auth token to requests
  api.interceptors.request.use((config) => {
    const candidateBaseUrls = API_BASE_URLS.length
      ? API_BASE_URLS
      : ["http://localhost:5000/api"];

    const attempt = Number((config as any).__baseUrlRetryAttempt || 0);
    const selectedBaseUrl = candidateBaseUrls[attempt] || candidateBaseUrls[0];

    config.baseURL = selectedBaseUrl;
    (config as any).__candidateBaseUrls = candidateBaseUrls;
    (config as any).__baseUrlRetryAttempt = attempt;

    if (__DEV__) {
      const method = String(config.method || "get").toUpperCase();
      console.log(
        "[API] Request",
        method,
        `${selectedBaseUrl}${config.url || ""}`,
      );
    }

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle responses
  api.interceptors.response.use(
    (response) => {
      if (__DEV__) {
        console.log(
          "[API] Response",
          response.status,
          `${response.config.baseURL || ""}${response.config.url || ""}`,
        );
      }
      const usedBaseUrl = String(response.config.baseURL || "");
      const index = API_BASE_URLS.indexOf(usedBaseUrl);
      if (index >= 0) {
        activeBaseUrlIndex = index;
      }
      return response;
    },
    (error) => {
      const config: any = error.config;
      const hasNetworkError = !error.response;
      const candidateBaseUrls: string[] =
        config?.__candidateBaseUrls || API_BASE_URLS;
      const attempt = Number(config?.__baseUrlRetryAttempt || 0);

      // Retry request on next local base URL when current one is unreachable.
      if (hasNetworkError && config) {
        const nextAttempt = attempt + 1;

        if (nextAttempt < candidateBaseUrls.length) {
          activeBaseUrlIndex = nextAttempt;
          config.__baseUrlRetryAttempt = nextAttempt;
          config.baseURL = candidateBaseUrls[nextAttempt];

          if (__DEV__) {
            console.log(
              "[API] Network error, retrying with Base URL:",
              config.baseURL,
            );
          }

          return api(config);
        }
      }

      if (__DEV__) {
        const status = error.response?.status;
        const data = error.response?.data;
        console.log("[API] Error", {
          message: error.message,
          code: error.code,
          status,
          data,
          attemptedBaseUrls: candidateBaseUrls,
          finalAttempt: attempt,
        });
      }

      (error as any).attemptedBaseUrls = candidateBaseUrls;

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
    getAPI().post("/auth/staff/request-otp", { phone }),

  /** Step 2 – verify OTP; returns token + staff */
  verifyOtp: (phone: string, otp: string) =>
    getAPI().post("/auth/staff/verify-otp", { phone, otp }),

  getProfile: (staffId: string) => getAPI().get(`/staff/${staffId}`),
};

// Attendance APIs
export const attendanceAPI = {
  punchIn: (staffId: string) => getAPI().post(`/staff/${staffId}/punch-in`),

  punchOut: (staffId: string) => getAPI().post(`/staff/${staffId}/punch-out`),

  getAttendance: (staffId: string) => getAPI().get(`/staff/${staffId}`),
};

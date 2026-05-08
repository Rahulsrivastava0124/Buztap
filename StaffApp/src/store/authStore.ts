import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export interface Staff {
  id: string;
  username: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  shiftTiming: {
    name: string;
    startTime: string;
    endTime: string;
  };
  salaryMonthly: number;
  leaveAllowance: number;
  leavesTaken: number;
  attendanceRecords: Array<{
    date: string;
    status: string;
    punchIn?: string;
    punchOut?: string;
    isLate?: boolean;
    lateMinutes?: number;
  }>;
  isActive: boolean;
}

interface AuthStore {
  token: string | null;
  staff: Staff | null;
  selectedAttendanceDate: string | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setStaff: (staff: Staff | null) => void;
  setSelectedAttendanceDate: (date: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  staff: null,
  selectedAttendanceDate: null,
  isLoading: false,

  setToken: (token) => {
    if (token) {
      SecureStore.setItemAsync("staffToken", token).catch(console.error);
    } else {
      SecureStore.deleteItemAsync("staffToken").catch(console.error);
    }
    set({ token });
  },

  setStaff: (staff) => {
    if (staff) {
      SecureStore.setItemAsync("staffData", JSON.stringify(staff)).catch(
        console.error,
      );
    } else {
      SecureStore.deleteItemAsync("staffData").catch(console.error);
    }
    set({ staff });
  },

  setSelectedAttendanceDate: (selectedAttendanceDate) => {
    set({ selectedAttendanceDate });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  logout: () => {
    SecureStore.deleteItemAsync("staffToken").catch(console.error);
    SecureStore.deleteItemAsync("staffData").catch(console.error);
    set({ token: null, staff: null, selectedAttendanceDate: null });
  },
}));

// Load token and staff from secure storage on app start
export const loadStoredToken = async () => {
  try {
    const [token, staffJson] = await Promise.all([
      SecureStore.getItemAsync("staffToken"),
      SecureStore.getItemAsync("staffData"),
    ]);
    const updates: Partial<{ token: string; staff: Staff }> = {};
    if (token) updates.token = token;
    if (staffJson) {
      try {
        updates.staff = JSON.parse(staffJson);
      } catch {}
    }
    if (Object.keys(updates).length) {
      useAuthStore.setState(updates);
    }
  } catch (error) {
    console.error("Failed to load stored session:", error);
  }
};

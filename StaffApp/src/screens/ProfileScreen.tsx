import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { attendanceAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { endOfMonth, format, startOfMonth } from "date-fns";

export const ProfileScreen = ({ navigation }: any) => {
  const { staff, setStaff, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonthAttendance, setCurrentMonthAttendance] =
    useState<any>(null);

  const fetchAttendanceStats = useCallback(async () => {
    if (!staff?.id) return;

    try {
      const response = await attendanceAPI.getAttendance(staff.id);
      const toDateKey = (value: unknown): string => {
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
            return trimmed.slice(0, 10);
          }
        }

        const parsed = new Date(value as string | number | Date);
        if (Number.isNaN(parsed.getTime())) return "";
        return [
          parsed.getFullYear(),
          String(parsed.getMonth() + 1).padStart(2, "0"),
          String(parsed.getDate()).padStart(2, "0"),
        ].join("-");
      };

      const normalizeStatus = (status: unknown): string => {
        const normalized = String(status || "")
          .trim()
          .toLowerCase();

        if (normalized === "work" || normalized === "present") return "present";
        if (
          normalized === "halfday" ||
          normalized === "half_day" ||
          normalized === "half-day"
        ) {
          return "halfDay";
        }
        if (normalized === "holiday" || normalized === "weekoff")
          return "holiday";
        if (normalized === "absent" || normalized === "unmarked")
          return "absent";
        return "";
      };

      const payload =
        response?.data?.staff || response?.data?.data?.staff || response?.data;
      const records = Array.isArray(payload?.attendanceRecords)
        ? payload.attendanceRecords
        : [];

      const recordMap = new Map<string, any>();
      records.forEach((record: any) => {
        const key = toDateKey(
          record?.date || record?.punchIn || record?.punchOut,
        );
        if (key) recordMap.set(key, record);
      });

      const today = new Date();
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      const untilDate = monthEnd > today ? today : monthEnd;
      const todayKey = toDateKey(today);
      const joinKey = toDateKey(payload?.joiningDate || payload?.joinDate);

      const stats = { present: 0, absent: 0, holiday: 0, halfDay: 0 };

      for (
        let day = new Date(monthStart);
        day <= untilDate;
        day.setDate(day.getDate() + 1)
      ) {
        const dayKey = toDateKey(day);
        if (!dayKey) continue;
        if (joinKey && dayKey < joinKey) continue;

        const record = recordMap.get(dayKey);
        const dayStatus = normalizeStatus(record?.status);
        const isSunday = day.getDay() === 0;
        const hasPunch = Boolean(record?.punchIn || record?.punchOut);
        const isPastOrToday = dayKey <= todayKey;

        if (dayStatus === "present") {
          stats.present += 1;
          continue;
        }

        if (dayStatus === "halfDay") {
          stats.halfDay += 1;
          continue;
        }

        if (dayStatus === "holiday") {
          stats.holiday += 1;
          continue;
        }

        if (dayStatus === "absent") {
          stats.absent += 1;
          continue;
        }

        if (hasPunch) {
          stats.present += 1;
          continue;
        }

        if (isPastOrToday && !isSunday) {
          stats.absent += 1;
        }
      }

      setCurrentMonthAttendance(stats);
      if (payload) setStaff(payload);
    } catch (error) {
      console.error("Failed to fetch attendance stats:", error);
    }
  }, [staff?.id, setStaff]);

  useEffect(() => {
    void fetchAttendanceStats();

    const unsubscribe = navigation?.addListener?.("focus", () => {
      fetchAttendanceStats();
    });

    return () => {
      unsubscribe?.();
    };
  }, [fetchAttendanceStats, navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendanceStats();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: () => {
          logout();
        },
        style: "destructive",
      },
    ]);
  };

  const formatSalary =
    typeof staff?.salaryMonthly === "number"
      ? `INR ${staff.salaryMonthly.toLocaleString()}`
      : "-";

  const profileInitial = staff?.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <SafeAreaView
      className="flex-1 bg-slate-100"
      edges={["top", "left", "right"]}
    >
      <StatusBar backgroundColor="#0F172A" barStyle="light-content" />

      <View className="bg-slate-900 px-4 pb-4 rounded-b-3xl overflow-hidden">
        <View className="absolute -right-12 -top-5 w-44 h-44 rounded-full bg-blue-500/20" />
        <Text className="text-2xl font-extrabold text-white">Settings</Text>

        <View className="mt-4 bg-white/10 border border-white/20 rounded-2xl p-3 flex-row items-center gap-3">
          <View className="w-14 h-14 rounded-full bg-white/20 border border-white/30 items-center justify-center">
            <Text className="text-white text-xl font-extrabold">
              {profileInitial}
            </Text>
          </View>

          <View className="flex-1">
            <Text className="text-white text-lg font-bold">
              {staff?.name || "Staff"}
            </Text>
            <Text className="text-slate-200 text-xs mt-0.5">
              {staff?.designation || "-"}
            </Text>

            <View className="mt-2 flex-row items-center justify-between gap-2">
              <View className="rounded-full border border-white/25 bg-slate-900/45 px-2.5 py-1">
                <Text className="text-slate-200 text-[11px] font-semibold">
                  @{staff?.username || "-"}
                </Text>
              </View>

              <TouchableOpacity
                className="rounded-full border border-red-200/60 bg-red-600 px-3.5 py-1.5 flex-row items-center gap-2"
                onPress={handleLogout}
                activeOpacity={0.85}
              >
                <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                <Text className="text-white text-md font-bold">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-3 pt-3 pb-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="mt-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Text className="text-slate-900 text-base font-bold">
            Personal Information
          </Text>
          <Text className="mt-1 mb-3 text-xs text-slate-500">
            Contact and account identity
          </Text>

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-slate-500 text-[13px] font-medium">
              Phone
            </Text>
            <Text className="max-w-[60%] text-right text-slate-900 text-sm font-semibold">
              {staff?.phone || "-"}
            </Text>
          </View>
          <View className="h-px bg-slate-200" />

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-slate-500 text-[13px] font-medium">
              Email
            </Text>
            <Text className="max-w-[60%] text-right text-slate-900 text-sm font-semibold">
              {staff?.email || "-"}
            </Text>
          </View>
          <View className="h-px bg-slate-200" />

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-slate-500 text-[13px] font-medium">
              Username
            </Text>
            <Text className="max-w-[60%] text-right text-slate-900 text-sm font-semibold">
              {staff?.username}
            </Text>
          </View>
        </View>

        <View className="mt-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Text className="text-slate-900 text-base font-bold">
            Employment Details
          </Text>
          <Text className="mt-1 mb-3 text-xs text-slate-500">
            Compensation and leave policy
          </Text>

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-slate-500 text-[13px] font-medium">
              Designation
            </Text>
            <Text className="max-w-[60%] text-right text-slate-900 text-sm font-semibold">
              {staff?.designation || "-"}
            </Text>
          </View>
          <View className="h-px bg-slate-200" />

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-slate-500 text-[13px] font-medium">
              Monthly Salary
            </Text>
            <Text className="max-w-[60%] text-right text-slate-900 text-sm font-semibold">
              {formatSalary}
            </Text>
          </View>
          <View className="h-px bg-slate-200" />

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-slate-500 text-[13px] font-medium">
              Leave Allowance
            </Text>
            <Text className="max-w-[60%] text-right text-slate-900 text-sm font-semibold">
              {staff?.leaveAllowance || 0} days
            </Text>
          </View>
        </View>

        <View className="mt-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Text className="text-slate-900 text-base font-bold">
            Shift Information
          </Text>
          <Text className="mt-1 mb-3 text-xs text-slate-500">
            Assigned schedule details
          </Text>

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-slate-500 text-[13px] font-medium">
              Shift Name
            </Text>
            <Text className="max-w-[60%] text-right text-slate-900 text-sm font-semibold">
              {staff?.shiftTiming?.name || "-"}
            </Text>
          </View>
          <View className="h-px bg-slate-200" />

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-slate-500 text-[13px] font-medium">
              Shift Timing
            </Text>
            <Text className="max-w-[60%] text-right text-slate-900 text-sm font-semibold">
              {staff?.shiftTiming?.startTime || "-"} -{" "}
              {staff?.shiftTiming?.endTime || "-"}
            </Text>
          </View>
        </View>

        {currentMonthAttendance && (
          <View className="mt-3 p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Text className="text-slate-900 text-base font-bold mb-2">
              {format(new Date(), "MMMM yyyy")} Attendance
            </Text>

            <View className="flex-row items-center justify-between gap-1.5">
              <View className="flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 py-2 px-1">
                <Text className="text-[11px] text-slate-500 mb-0.5">
                  Present
                </Text>
                <Text className="text-base font-extrabold text-green-600">
                  {currentMonthAttendance.present}
                </Text>
              </View>

              <View className="flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 py-2 px-1">
                <Text className="text-[11px] text-slate-500 mb-0.5">
                  Absent
                </Text>
                <Text className="text-base font-extrabold text-red-600">
                  {currentMonthAttendance.absent}
                </Text>
              </View>

              <View className="flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 py-2 px-1">
                <Text className="text-[11px] text-slate-500 mb-0.5">
                  Holiday
                </Text>
                <Text className="text-base font-extrabold text-amber-500">
                  {currentMonthAttendance.holiday}
                </Text>
              </View>

              <View className="flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 py-2 px-1">
                <Text className="text-[11px] text-slate-500 mb-0.5">
                  Half Day
                </Text>
                <Text className="text-base font-extrabold text-sky-600">
                  {currentMonthAttendance.halfDay}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

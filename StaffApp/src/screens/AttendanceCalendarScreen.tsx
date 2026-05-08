import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  addMonths,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { attendanceAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const { width } = Dimensions.get("window");
const GRID_PADDING = 24;
const CELL_GAP = 6;
const CELL_SIZE = Math.floor((width - GRID_PADDING * 2 - CELL_GAP * 6) / 7);

const toDateKey = (value: Date | string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

type AttendanceRecord = {
  date: string;
  status?: "work" | "absent" | "holiday" | "weekOff" | "halfDay" | string;
  punchIn?: string | null;
  punchOut?: string | null;
  note?: string;
  isLate?: boolean;
  lateMinutes?: number;
};

const statusStyle = (status?: string) => {
  switch (status) {
    case "work":
      return { bg: "#2EA63A", text: "#FFFFFF" };
    case "absent":
      return { bg: "#CF1D34", text: "#FFFFFF" };
    case "halfDay":
      return { bg: "#E9D48A", text: "#1F2937" };
    case "holiday":
      return { bg: "#95E3E6", text: "#083344" };
    case "weekOff":
      return { bg: "#E6DEFF", text: "#5B21B6" };
    default:
      return { bg: "#D1D5DB", text: "#1F2937" };
  }
};

export const AttendanceCalendarScreen = ({ navigation }: any) => {
  const { staff, setStaff, selectedAttendanceDate, setSelectedAttendanceDate } =
    useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const loadAttendance = useCallback(async () => {
    if (!staff?.id) return;
    try {
      const response = await attendanceAPI.getAttendance(staff.id);
      setRecords(response.data.attendanceRecords || []);
      setStaff(response.data);
    } catch (err) {
      console.error("Failed to load attendance history:", err);
    }
  }, [staff?.id]);

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [loadAttendance]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttendance();
    setRefreshing(false);
  };

  const recordMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    records.forEach((r) => {
      const key = toDateKey(r.date);
      if (key) map.set(key, r);
    });
    return map;
  }, [records]);

  const monthHolidays = useMemo(() => {
    const month = visibleMonth.getMonth();
    const year = visibleMonth.getFullYear();
    return records
      .filter((record) => record.status === "holiday")
      .map((record) => {
        const date = new Date(record.date);
        return {
          date,
          note: record.note || "Holiday",
        };
      })
      .filter(
        (record) =>
          record.date.getMonth() === month &&
          record.date.getFullYear() === year,
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [records, visibleMonth]);

  const joinKey = useMemo(() => {
    if (!staff?.joiningDate) return null;
    const joinDate = new Date(staff.joiningDate);
    if (Number.isNaN(joinDate.getTime())) return null;
    return toDateKey(joinDate);
  }, [staff?.joiningDate]);

  const days = useMemo(() => {
    const start = startOfMonth(visibleMonth);
    const end = endOfMonth(visibleMonth);
    const startWeekDay = start.getDay();
    const daysInMonth = end.getDate();

    const cells: Array<{ date: Date | null; inMonth: boolean }> = [];

    for (let i = 0; i < startWeekDay; i += 1) {
      cells.push({ date: null, inMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push({
        date: new Date(start.getFullYear(), start.getMonth(), d),
        inMonth: true,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ date: null, inMonth: false });
    }

    return cells;
  }, [visibleMonth]);

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 pt-4 pb-2">
          <View className="bg-white rounded-2xl border border-slate-200 px-3 py-3 shadow-sm">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                className="w-9 h-9 rounded-xl border border-slate-200 items-center justify-center bg-slate-50"
                onPress={() => setVisibleMonth((m) => subMonths(m, 1))}
              >
                <Ionicons name="chevron-back" size={18} color="#0E8ACB" />
              </TouchableOpacity>

              <View className="items-center">
                <Text className="text-[10px] font-semibold uppercase tracking-[1px] text-slate-500">
                  Month
                </Text>
                <Text className="text-[20px] font-bold tracking-[0.2px] text-slate-800 mt-0.5">
                  {format(visibleMonth, "MMMM yyyy")}
                </Text>
              </View>

              <TouchableOpacity
                className="w-9 h-9 rounded-xl border border-slate-200 items-center justify-center bg-slate-50"
                onPress={() => setVisibleMonth((m) => addMonths(m, 1))}
              >
                <Ionicons name="chevron-forward" size={18} color="#0E8ACB" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-6 pt-2 pb-4">
          <View className="flex-row justify-between mb-3">
            {WEEK_DAYS.map((day) => (
              <Text
                key={day}
                className="text-slate-600 text-[14px] font-semibold"
                style={{ width: CELL_SIZE, textAlign: "center" }}
              >
                {day}
              </Text>
            ))}
          </View>

          <View className="flex-row flex-wrap" style={{ gap: CELL_GAP }}>
            {days.map((cell, index) => {
              if (!cell.date || !cell.inMonth) {
                return (
                  <View
                    key={`blank-${index}`}
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                  />
                );
              }

              const key = toDateKey(cell.date);
              const record = recordMap.get(key);
              const isCurrentMonth = isSameMonth(cell.date, visibleMonth);
              const workedOnDate = Boolean(record?.punchIn || record?.punchOut);
              const hasIncompletePunch =
                (!!record?.punchIn && !record?.punchOut) ||
                (!!record?.punchOut && !record?.punchIn);
              const todayKey = toDateKey(new Date());
              const isPastDate = key < todayKey;
              const isWeekOff = cell.date.getDay() === 0;
              const isBeforeJoinDate = joinKey != null && key < joinKey;
              // Use the real record status (halfDay, work, etc.) when available;
              // fall back to derived status only when no record exists.
              const effectiveStatus = record?.status
                ? record.status
                : workedOnDate
                  ? "work"
                  : isWeekOff
                    ? "weekOff"
                    : isBeforeJoinDate
                      ? undefined
                      : isPastDate
                        ? "absent"
                        : undefined;
              const style = statusStyle(effectiveStatus);
              const showPunchError =
                (effectiveStatus === "work" || effectiveStatus === "halfDay") &&
                hasIncompletePunch;
              // Show late mark if backend flagged isLate, OR if lateMinutes > 0
              const showLateMark =
                (record?.isLate === true || (record?.lateMinutes ?? 0) > 0) &&
                !hasIncompletePunch;
              const isSelected = selectedAttendanceDate === key;

              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    navigation.push("AttendanceDayPreview", { dateKey: key });
                  }}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: isCurrentMonth ? style.bg : "#D1D5DB",
                    borderRadius: 14,
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? "#2563EB" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <Text
                    style={{
                      color: style.text,
                      fontSize: 13,
                      fontWeight: "700",
                    }}
                  >
                    {cell.date.getDate()}
                  </Text>
                  {showPunchError ? (
                    <Ionicons
                      name="warning"
                      size={14}
                      color="#FACC15"
                      style={{ position: "absolute", bottom: 6 }}
                    />
                  ) : null}
                  {showLateMark ? (
                    <Ionicons
                      name="alert-circle"
                      size={14}
                      color="#DC2626"
                      style={{ position: "absolute", top: 4, right: 4 }}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text className="text-slate-500 text-[11px] text-center px-6 -mt-1 mb-3">
          Tap any date to view its attendance details on Home.
        </Text>

        <View className="mx-6 mt-3 mb-8 space-y-4">
          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row flex-wrap" style={{ gap: 16 }}>
              <View className="flex-row items-center">
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: "#2EA63A",
                    marginRight: 8,
                  }}
                />
                <Text className="text-slate-700 text-[12px]">Present</Text>
              </View>
              <View className="flex-row items-center">
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: "#CF1D34",
                    marginRight: 8,
                  }}
                />
                <Text className="text-slate-700 text-[12px]">Absent</Text>
              </View>
              <View className="flex-row items-center">
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: "#E9D48A",
                    marginRight: 8,
                  }}
                />
                <Text className="text-slate-700 text-[12px]">Half Day</Text>
              </View>
              <View className="flex-row items-center">
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: "#95E3E6",
                    marginRight: 8,
                  }}
                />
                <Text className="text-slate-700 text-[12px]">Holiday</Text>
              </View>
              <View className="flex-row items-center">
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: "#E6DEFF",
                    marginRight: 8,
                  }}
                />
                <Text className="text-slate-700 text-[12px]">Week Off</Text>
              </View>
              <View className="flex-row items-center">
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: "#D1D5DB",
                    marginRight: 8,
                  }}
                />
                <Text className="text-slate-700 text-[12px]">No Record</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons
                  name="warning"
                  size={14}
                  color="#FACC15"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-slate-700 text-[12px]">Punch Error</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color="#DC2626"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-slate-700 text-[12px]">Late Mark</Text>
              </View>
            </View>
          </View>

          {monthHolidays.length > 0 ? (
            <View className="bg-white rounded-2xl p-4 mt-3">
              <Text className="text-slate-900 font-semibold mb-3">
                Holiday details
              </Text>
              {monthHolidays.map((holiday, index) => (
                <View
                  key={holiday.date.toISOString()}
                  className={`flex-row items-center gap-3 py-2 ${
                    index < monthHolidays.length - 1
                      ? "border-b border-slate-200"
                      : ""
                  }`}
                >
                  <View className="min-w-[72px] rounded-lg px-2 py-1">
                    <Text className="text-[11px] font-semibold text-slate-700">
                      {format(holiday.date, "dd MMM")}
                    </Text>
                  </View>
                  <Text className="text-slate-700 text-[13px] flex-1">
                    {holiday.note}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

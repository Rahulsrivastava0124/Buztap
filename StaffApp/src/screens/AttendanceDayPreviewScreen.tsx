import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { attendanceAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";

const toDateKey = (value: Date | string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

const getAttendanceRecordKey = (record: any) =>
  toDateKey(record?.date || record?.punchIn || record?.punchOut);

const formatDurationLabel = (secs: number) => {
  const hours = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
};

export const AttendanceDayPreviewScreen = ({ route, navigation }: any) => {
  const { dateKey } = route.params as { dateKey: string };
  const { staff } = useAuthStore();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dateObj = new Date(`${dateKey}T00:00:00`);

  const fetchRecord = useCallback(async () => {
    if (!staff?.id) return;
    try {
      const response = await attendanceAPI.getAttendance(staff.id);
      const found =
        (response.data.attendanceRecords || []).find(
          (r: any) => getAttendanceRecordKey(r) === dateKey,
        ) ?? null;
      setRecord(found);
    } catch (err) {
      console.error("Failed to fetch record:", err);
    } finally {
      setLoading(false);
    }
  }, [staff?.id, dateKey]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecord();
    setRefreshing(false);
  };

  // ── Derived display ───────────────────────────────────────────────────────
  const isPunchedIn = !!record?.punchIn;
  const isPunchedOut = !!record?.punchOut;

  const workedSeconds =
    isPunchedIn && isPunchedOut
      ? Math.floor(
          (new Date(record.punchOut).getTime() -
            new Date(record.punchIn).getTime()) /
            1000,
        )
      : isPunchedIn
        ? Math.floor((Date.now() - new Date(record.punchIn).getTime()) / 1000)
        : 0;

  const workedDurationText = isPunchedIn
    ? formatDurationLabel(workedSeconds)
    : "--h --m";

  const totalSecs = workedSeconds;
  const hh = String(Math.floor(totalSecs / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSecs % 60).padStart(2, "0");

  const shift = staff?.shiftTiming;
  const shiftLabel = shift
    ? `${shift.name ?? ""} shift timing is ${shift.startTime ?? "--"} - ${shift.endTime ?? "--"}`
    : null;

  const activities: {
    time: string;
    label: string;
    color: string;
    meta?: string;
  }[] = [];
  if (record?.punchIn) {
    activities.push({
      time: format(new Date(record.punchIn), "hh:mm:ss a"),
      label: "Punched In",
      color: "#16A34A",
      meta: `Status: ${record.status ?? "work"}`,
    });
  }
  if (record?.punchOut) {
    activities.push({
      time: format(new Date(record.punchOut), "hh:mm:ss a"),
      label: "Punched Out",
      color: "#DC2626",
      meta: `Worked: ${workedDurationText}`,
    });
  }
  if (!!record?.punchOut && !record?.punchIn) {
    activities.push({
      time: "--:--:--",
      label: "Punch Error",
      color: "#F59E0B",
      meta: "Attendance marked as work, but punch times are incomplete.",
    });
  }

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-sky-50"
        edges={["top", "left", "right"]}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sky-50" edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header — same as Dashboard but with back button */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-5 bg-sky-50">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={18} color="#1E293B" />
            </TouchableOpacity>
            <View>
              <Text className="text-slate-500 text-xs">Attendance</Text>
              <Text
                className="text-slate-800 text-2xl font-semibold"
                numberOfLines={1}
              >
                {format(dateObj, "dd MMM yyyy")}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center bg-blue-100 rounded-full px-3 py-1.5">
            <Ionicons name="calendar-outline" size={16} color="#2563EB" />
            <Text className="text-blue-600 text-xs font-semibold ml-1.5">
              {format(dateObj, "EEEE")}
            </Text>
          </View>
        </View>

        {/* Working Hours block — identical to Dashboard */}
        <View className="mx-5 rounded-3xl bg-slate-900 px-5 py-6 items-center">
          <Text className="text-slate-50 text-2xl font-semibold mb-5">
            Working Hours
          </Text>
          <View className="flex-row items-center">
            <View className="w-20 h-[72px] bg-slate-700 rounded-2xl items-center justify-center">
              <Text className="text-slate-50 text-[28px] font-bold tracking-wider">
                {hh}
              </Text>
            </View>
            <Text className="text-slate-400 text-[28px] font-bold mx-2">:</Text>
            <View className="w-20 h-[72px] bg-slate-700 rounded-2xl items-center justify-center">
              <Text className="text-slate-50 text-[28px] font-bold tracking-wider">
                {mm}
              </Text>
            </View>
            <Text className="text-slate-400 text-[28px] font-bold mx-2">:</Text>
            <View className="w-20 h-[72px] bg-slate-700 rounded-2xl items-center justify-center">
              <Text className="text-slate-50 text-[28px] font-bold tracking-wider">
                {ss}
              </Text>
            </View>
          </View>
          <View className="w-full flex-row justify-around px-1 mt-2 mb-4">
            <Text className="text-slate-400 text-xs w-20 text-center">
              Hour
            </Text>
            <Text className="text-slate-400 text-xs w-20 text-center">Min</Text>
            <Text className="text-slate-400 text-xs w-20 text-center">Sec</Text>
          </View>
          <View className="w-full bg-amber-100 rounded-full px-4 py-2.5 flex-row items-center justify-center">
            <Ionicons name="cafe-outline" size={16} color="#D97706" />
            <Text className="text-amber-600 text-sm font-medium ml-2">
              Worked {workedDurationText}
            </Text>
          </View>
        </View>

        {/* Shift label */}
        {shiftLabel && (
          <View className="mx-5 bg-white px-4 py-3 rounded-b-2xl border-t border-slate-200 flex-row items-center">
            <Ionicons name="time-outline" size={15} color="#64748B" />
            <Text className="text-slate-600 text-xs ml-2">{shiftLabel}</Text>
          </View>
        )}

        {/* Activity list — identical to Dashboard */}
        <Text className="text-slate-700 text-2xl font-semibold mx-5 mt-8 mb-3">
          Activity
        </Text>

        {activities.length === 0 ? (
          <View className="items-center py-10 px-6">
            <Ionicons name="search-outline" size={72} color="#94A3B8" />
            <Text className="text-slate-400 text-base text-center mt-3">
              Oops! We couldn't find anything to show
            </Text>
          </View>
        ) : (
          <View className="mx-5 bg-white rounded-2xl overflow-hidden">
            {activities.map((a, i) => (
              <View
                key={i}
                className="flex-row items-center px-4 py-3"
                style={{
                  borderBottomWidth: i === activities.length - 1 ? 0 : 1,
                  borderBottomColor: "#F1F5F9",
                }}
              >
                <View
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: a.color }}
                />
                <View className="flex-1 ml-3">
                  <Text className="text-slate-800 text-sm font-medium">
                    {a.label}
                  </Text>
                  {a.meta ? (
                    <Text className="text-slate-400 text-[11px] mt-0.5">
                      {a.meta}
                    </Text>
                  ) : null}
                </View>
                <Text className="text-slate-500 text-xs">{a.time}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  RefreshControl,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import Ionicons from "@expo/vector-icons/Ionicons";
import { attendanceAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { getDeviceId } from "../utils/deviceId";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_TRACK_WIDTH = SCREEN_WIDTH - 48;
const THUMB_WIDTH = 72;
const THUMB_HEIGHT = 50;
const SWIPE_THRESHOLD = SWIPE_TRACK_WIDTH - THUMB_WIDTH - 8;
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const toDateKey = (value: Date | string | null | undefined) => {
  if (!value) return "";

  if (typeof value === "string") {
    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnly) return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

const getAttendanceRecordKeys = (record: any) => {
  const candidates = [
    record?.date,
    record?.attendanceDate,
    record?.dateKey,
    record?.punchIn,
    record?.punchOut,
    record?.createdAt,
    record?.updatedAt,
  ];

  return candidates.map(toDateKey).filter(Boolean);
};

const getStaffPayload = (payload: any) => {
  const candidate =
    payload?.staff || payload?.data?.staff || payload?.data || payload;
  if (
    candidate &&
    (candidate.id ||
      candidate._id ||
      candidate.name ||
      Array.isArray(candidate.attendanceRecords))
  ) {
    return candidate;
  }

  return null;
};

const getRecordByDate = (attendanceRecords: any[] = [], dateKey: string) => {
  return (
    attendanceRecords.find((r) => getAttendanceRecordKeys(r).includes(dateKey)) ||
    null
  );
};

const resolveHomeRecord = (attendanceRecords: any[] = [], dateKey: string) => {
  if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
    return null;
  }

  return getRecordByDate(attendanceRecords, dateKey);
};

export const DashboardScreen = ({ navigation }: any) => {
  const { staff, setStaff } = useAuthStore();
  const staffId = staff?.id || (staff as any)?._id;
  const [refreshing, setRefreshing] = useState(false);
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [swipeLoading, setSwipeLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number>(0); // seconds since punch-in

  // Swipe animation
  const swipeX = useRef(new Animated.Value(0)).current;
  const swipeCompleted = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPunchedInRef = useRef(false);
  const isPunchedOutRef = useRef(false);
  const handlePunchInRef = useRef<() => Promise<void>>(async () => {});
  const handlePunchOutRef = useRef<() => Promise<void>>(async () => {});
  const fallbackRecordsRef = useRef<any[]>(staff?.attendanceRecords || []);
  const fetchPromiseRef = useRef<Promise<any> | null>(null);

  const todayDateKey = toDateKey(new Date());
  const activeDateObj = new Date();

  useEffect(() => {
    fallbackRecordsRef.current = staff?.attendanceRecords || [];
  }, [staff?.attendanceRecords]);

  // ── Working Hours Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (todayStatus?.punchIn && !todayStatus?.punchOut) {
      const start = new Date(todayStatus.punchIn).getTime();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else if (todayStatus?.punchIn && todayStatus?.punchOut) {
      const start = new Date(todayStatus.punchIn).getTime();
      const end = new Date(todayStatus.punchOut).getTime();
      setElapsed(Math.floor((end - start) / 1000));
    } else {
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [todayStatus]);

  const formatElapsed = (secs: number, isPunchedIn: boolean) => {
    if (!isPunchedIn && secs === 0) {
      return { h: "--", m: "--", s: "--" };
    }
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return {
      h: String(h).padStart(2, "0"),
      m: String(m).padStart(2, "0"),
      s: String(s).padStart(2, "0"),
    };
  };

  const formatDurationLabel = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
  };

  // ── Data ─────────────────────────────────────────────────────────────────────
  const fetchTodayAttendance = useCallback(async () => {
    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }

    if (!staffId) {
      setTodayStatus(null);
      return null;
    }

    fetchPromiseRef.current = (async () => {
      try {
        const response = await attendanceAPI.getAttendance(staffId);
        const staffPayload = getStaffPayload(response.data);
        const attendanceRecords =
          staffPayload?.attendanceRecords || fallbackRecordsRef.current;
        fallbackRecordsRef.current = attendanceRecords;
        const todayRecord = resolveHomeRecord(attendanceRecords, todayDateKey);
        setTodayStatus(todayRecord ?? null);
        if (staffPayload) setStaff(staffPayload);
        return todayRecord ?? null;
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        const fallbackRecord = resolveHomeRecord(
          fallbackRecordsRef.current,
          todayDateKey,
        );
        setTodayStatus(fallbackRecord);
        return fallbackRecord;
      } finally {
        fetchPromiseRef.current = null;
      }
    })();

    return fetchPromiseRef.current;
  }, [todayDateKey, setStaff, staffId]);

  useEffect(() => {
    void fetchTodayAttendance();

    const unsubscribe = navigation?.addListener?.("focus", () => {
      void fetchTodayAttendance();
    });

    return () => {
      unsubscribe?.();
    };
  }, [fetchTodayAttendance, navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodayAttendance();
    setRefreshing(false);
  };

  // ── Swipe-to-Punch ───────────────────────────────────────────────────────────
  const resetSwipe = () => {
    swipeCompleted.current = false;
    Animated.spring(swipeX, { toValue: 0, useNativeDriver: false }).start();
  };

  const handlePunchIn = async () => {
    if (!staffId) {
      Alert.alert(
        "Error",
        "Session not loaded. Please log out and log in again.",
      );
      resetSwipe();
      return;
    }
    setSwipeLoading(true);
    try {
      const deviceId = await getDeviceId();
      if (!deviceId) {
        Alert.alert(
          "Device ID Required",
          "Unable to read your device identifier. Please restart the app and try again.",
        );
        return;
      }
      const response = await attendanceAPI.punchIn(
        staffId,
        deviceId,
        toDateKey(new Date()),
      );
      const staffPayload = getStaffPayload(response.data);
      if (staffPayload) {
        fallbackRecordsRef.current =
          staffPayload?.attendanceRecords || fallbackRecordsRef.current;
        setStaff(staffPayload);
      }
      setTodayStatus(
        resolveHomeRecord(
          staffPayload?.attendanceRecords || fallbackRecordsRef.current,
          todayDateKey,
        ),
      );
      await fetchTodayAttendance();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to punch in");
    } finally {
      setSwipeLoading(false);
      resetSwipe();
    }
  };

  const handlePunchOut = async () => {
    if (!staffId) {
      Alert.alert(
        "Error",
        "Session not loaded. Please log out and log in again.",
      );
      resetSwipe();
      return;
    }
    if (!todayStatus?.punchIn) {
      Alert.alert("Error", "Please punch in first.");
      resetSwipe();
      return;
    }
    if (todayStatus?.punchOut) {
      Alert.alert("Info", "You have already punched out for today.");
      resetSwipe();
      return;
    }
    setSwipeLoading(true);
    try {
      const deviceId = await getDeviceId();
      if (!deviceId) {
        Alert.alert(
          "Device ID Required",
          "Unable to read your device identifier. Please restart the app and try again.",
        );
        return;
      }
      const response = await attendanceAPI.punchOut(
        staffId,
        deviceId,
        toDateKey(new Date()),
      );
      const staffPayload = getStaffPayload(response.data);
      if (staffPayload) {
        fallbackRecordsRef.current =
          staffPayload?.attendanceRecords || fallbackRecordsRef.current;
        setStaff(staffPayload);
      }
      setTodayStatus(
        resolveHomeRecord(
          staffPayload?.attendanceRecords || fallbackRecordsRef.current,
          todayDateKey,
        ),
      );
      await fetchTodayAttendance();
    } catch (error: any) {
      const code = error.response?.data?.code;
      if (code === "DEVICE_MISMATCH") {
        Alert.alert(
          "Device Mismatch",
          "You must punch out from the same device you used to punch in. Contact your manager if you need assistance.",
        );
      } else if (code === "DEVICE_ID_REQUIRED") {
        Alert.alert(
          "Device ID Required",
          "Your device identifier could not be verified. Please retry from this device.",
        );
      } else if (code === "PUNCHIN_DEVICE_MISSING") {
        Alert.alert(
          "Security Check Failed",
          "Your earlier punch-in is missing device verification. Please contact your manager.",
        );
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.error || "Failed to punch out",
        );
      }
    } finally {
      setSwipeLoading(false);
      resetSwipe();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !swipeLoading,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
      onPanResponderMove: (_, g) => {
        const x = Math.max(0, Math.min(g.dx, SWIPE_THRESHOLD));
        swipeX.setValue(x);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx >= SWIPE_THRESHOLD * 0.75) {
          Animated.spring(swipeX, {
            toValue: SWIPE_THRESHOLD,
            useNativeDriver: false,
          }).start(() => {
            if (!swipeCompleted.current) {
              swipeCompleted.current = true;
              if (!isPunchedInRef.current) handlePunchInRef.current();
              else if (!isPunchedOutRef.current) handlePunchOutRef.current();
              else resetSwipe();
            }
          });
        } else {
          resetSwipe();
        }
      },
    }),
  ).current;

  // ── Derived display ───────────────────────────────────────────────────────────
  const isPunchedIn = !!todayStatus?.punchIn;
  const isPunchedOut = !!todayStatus?.punchOut;

  useEffect(() => {
    isPunchedInRef.current = isPunchedIn;
    isPunchedOutRef.current = isPunchedOut;
  }, [isPunchedIn, isPunchedOut]);

  useEffect(() => {
    handlePunchInRef.current = handlePunchIn;
    handlePunchOutRef.current = handlePunchOut;
  }, [handlePunchIn, handlePunchOut]);

  const { h, m, s } = formatElapsed(elapsed, isPunchedIn);
  const shift = staff?.shiftTiming;
  const shiftLabel = shift
    ? `${shift.name ?? ""} shift timing is ${shift.startTime ?? "--"} - ${shift.endTime ?? "--"}`
    : null;

  const swipeLabel = isPunchedOut
    ? " Done for today"
    : isPunchedIn
      ? "Swipe To Punch Out"
      : "Swipe To Punch In";

  const swipeColor = isPunchedOut
    ? "#6B7280"
    : isPunchedIn
      ? "#F97316"
      : "#2563EB";

  const swipeIcon: IoniconName = isPunchedOut
    ? "checkmark"
    : isPunchedIn
      ? "log-out-outline"
      : "log-in-outline";

  const workedDurationText = isPunchedIn
    ? formatDurationLabel(elapsed)
    : "--h --m";
  const hasPunchOutWithoutPunchIn =
    !!todayStatus?.punchOut && !todayStatus?.punchIn;
  const hasPunchError = hasPunchOutWithoutPunchIn;

  // Activity items from real attendance fields for today
  const activities: {
    time: string;
    label: string;
    color: string;
    icon: IoniconName;
    meta?: string;
  }[] = [];
  if (todayStatus?.punchIn) {
    activities.push({
      time: format(new Date(todayStatus.punchIn), "hh:mm a"),
      label: "Punched In",
      color: "#16A34A",
      icon: "log-in-outline",
      meta: `Status: ${todayStatus.status ?? "work"}`,
    });
  }
  if (todayStatus?.punchOut) {
    activities.push({
      time: format(new Date(todayStatus.punchOut), "hh:mm a"),
      label: "Punched Out",
      color: "#DC2626",
      icon: "log-out-outline",
      meta: `Worked: ${workedDurationText}`,
    });
  }
  if (hasPunchError) {
    activities.push({
      time: "--:--",
      label: "Punch Error",
      color: "#F59E0B",
      icon: "alert-circle-outline",
      meta: "Attendance marked as work, but punch times are incomplete.",
    });
  }

  const goToCalendar = () => {
    const parent = navigation?.getParent?.();
    if (parent?.navigate) {
      parent.navigate("AttendanceTab");
      return;
    }
    navigation?.navigate?.("AttendanceTab");
  };

  return (
    <SafeAreaView className="flex-1 bg-sky-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between px-5 pt-4 pb-5 bg-sky-50">
          <View className="flex-row items-center flex-1">
            <View>
              <Text className="text-slate-500 text-xs">Welcome</Text>
              <Text
                className="text-slate-800 text-2xl font-semibold max-w-[210px]"
                numberOfLines={1}
              >
                {staff?.name ?? "—"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex-row items-center bg-blue-100 rounded-full px-3 py-1.5"
            onPress={goToCalendar}
          >
            <Ionicons name="calendar-outline" size={16} color="#2563EB" />
            <Text className="text-blue-600 text-xs font-semibold ml-1.5">
              {format(activeDateObj, "dd MMM yyyy")}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mx-5 rounded-3xl bg-slate-900 px-5 py-6 items-center">
          <Text className="text-slate-50 text-2xl font-semibold mb-5">
            Working Hours
          </Text>
          <View className="flex-row items-center">
            <View className="w-20 h-[72px] bg-slate-700 rounded-2xl items-center justify-center">
              <Text className="text-slate-50 text-[28px] font-bold tracking-wider">
                {h}
              </Text>
            </View>
            <Text className="text-slate-400 text-[28px] font-bold mx-2">:</Text>
            <View className="w-20 h-[72px] bg-slate-700 rounded-2xl items-center justify-center">
              <Text className="text-slate-50 text-[28px] font-bold tracking-wider">
                {m}
              </Text>
            </View>
            <Text className="text-slate-400 text-[28px] font-bold mx-2">:</Text>
            <View className="w-20 h-[72px] bg-slate-700 rounded-2xl items-center justify-center">
              <Text className="text-slate-50 text-[28px] font-bold tracking-wider">
                {s}
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

        {shiftLabel && (
          <View className="mx-5 bg-white px-4 py-3 rounded-b-2xl border-t border-slate-200 flex-row items-center">
            <Ionicons name="time-outline" size={15} color="#64748B" />
            <Text className="text-slate-600 text-xs ml-2">{shiftLabel}</Text>
          </View>
        )}

        <Text className="text-slate-700 text-2xl font-semibold mx-5 mt-8 mb-3">
          Today's activity
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
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${a.color}1A` }}
                >
                  <Ionicons name={a.icon} size={18} color={a.color} />
                </View>
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

      <View className="absolute bottom-6 left-6 right-6">
        <View
          className="h-[60px] rounded-full justify-center px-1"
          style={{ backgroundColor: swipeColor }}
        >
          <Animated.View
            style={{
              width: THUMB_WIDTH,
              height: THUMB_HEIGHT,
              borderRadius: THUMB_HEIGHT / 2,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              left: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
              transform: [{ translateX: swipeX }],
            }}
            {...panResponder.panHandlers}
          >
            {swipeLoading ? (
              <ActivityIndicator size="small" color={swipeColor} />
            ) : (
              <Ionicons name={swipeIcon} size={24} color={swipeColor} />
            )}
          </Animated.View>
          <Text className="text-white text-base font-semibold tracking-wide ml-16 text-center">
            {swipeLabel}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { leaveAPI, LeaveRequest } from "../services/api";
import { useAuthStore } from "../store/authStore";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LEAVE_TYPES: LeaveRequest["leaveType"][] = [
  "Casual",
  "Sick",
  "Paid",
  "Unpaid",
  "Other",
];

const isDateInput = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const toDateInputValue = (date: Date) => format(date, "yyyy-MM-dd");

const toInputDateLabel = (value: string) => {
  if (!value) return "Select date";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "dd MMM yyyy");
};

const getPickerMonth = (value: string) => {
  if (!value) return new Date();
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

export const LeaveRequestFormScreen = ({ navigation }: any) => {
  const { staff, setStaff } = useAuthStore();
  const staffId = staff?.id || (staff as any)?._id;
  const [leaveType, setLeaveType] =
    useState<LeaveRequest["leaveType"]>("Casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [datePickerTarget, setDatePickerTarget] = useState<
    "start" | "end" | null
  >(null);
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const pickerDays = useMemo(() => {
    const monthStart = startOfMonth(pickerMonth);
    const monthEnd = endOfMonth(pickerMonth);
    const cells: Array<Date | null> = [];

    for (let i = 0; i < monthStart.getDay(); i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= monthEnd.getDate(); day += 1) {
      cells.push(
        new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), day),
      );
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [pickerMonth]);

  const openDatePicker = (target: "start" | "end") => {
    setDatePickerTarget(target);
    setPickerMonth(getPickerMonth(target === "start" ? startDate : endDate));
  };

  const selectPickerDate = (date: Date) => {
    const value = toDateInputValue(date);
    if (datePickerTarget === "start") {
      setStartDate(value);
      if (!endDate || new Date(`${endDate}T00:00:00`) < date) {
        setEndDate(value);
      }
    } else {
      setEndDate(value);
    }
    setDatePickerTarget(null);
  };

  const submitLeaveRequest = async () => {
    if (!staffId || loading) return;
    const trimmedReason = reason.trim();

    if (!isDateInput(startDate) || !isDateInput(endDate)) {
      Alert.alert("Invalid date", "Please select both From and To dates.");
      return;
    }

    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      Alert.alert("Invalid dates", "End date must be after start date.");
      return;
    }

    if (trimmedReason.length < 3) {
      Alert.alert("Reason required", "Please enter a short leave reason.");
      return;
    }

    setLoading(true);
    try {
      const response = await leaveAPI.createLeaveRequest(staffId, {
        startDate,
        endDate,
        leaveType,
        reason: trimmedReason,
      });

      const requests =
        response.data?.leaveRequests ||
        (response.data?.leaveRequest
          ? [response.data.leaveRequest, ...(staff?.leaveRequests || [])]
          : staff?.leaveRequests || []);
      if (staff) {
        setStaff({ ...staff, leaveRequests: requests });
      }
      Alert.alert("Leave requested", "Your leave request is pending approval.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Request failed",
        error.response?.data?.error || "Could not submit leave request.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sky-50" edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center px-5 pt-4 pb-3">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white border border-slate-200 items-center justify-center mr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text className="text-slate-500 text-xs">Staff Leave</Text>
            <Text className="text-slate-900 text-2xl font-semibold mt-1">
              New Request
            </Text>
          </View>
        </View>

        <View className="mx-5 mt-2 bg-white rounded-2xl p-4 border border-slate-100">
          <Text className="text-slate-900 font-semibold text-base">
            Leave type
          </Text>
          <View className="flex-row flex-wrap mt-3" style={{ gap: 8 }}>
            {LEAVE_TYPES.map((type) => {
              const selected = leaveType === type;
              return (
                <TouchableOpacity
                  key={type}
                  className={`px-3 py-2 rounded-full border ${
                    selected
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-slate-200"
                  }`}
                  onPress={() => setLeaveType(type)}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selected ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex-row mt-4" style={{ gap: 10 }}>
            <View className="flex-1">
              <Text className="text-slate-500 text-xs mb-1.5">From</Text>
              <TouchableOpacity
                className="border border-slate-200 rounded-xl px-3 py-2.5 flex-row items-center justify-between"
                onPress={() => openDatePicker("start")}
              >
                <Text
                  className={startDate ? "text-slate-800" : "text-slate-400"}
                >
                  {toInputDateLabel(startDate)}
                </Text>
                <Ionicons name="calendar-outline" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View className="flex-1">
              <Text className="text-slate-500 text-xs mb-1.5">To</Text>
              <TouchableOpacity
                className="border border-slate-200 rounded-xl px-3 py-2.5 flex-row items-center justify-between"
                onPress={() => openDatePicker("end")}
              >
                <Text className={endDate ? "text-slate-800" : "text-slate-400"}>
                  {toInputDateLabel(endDate)}
                </Text>
                <Ionicons name="calendar-outline" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-slate-500 text-xs mb-1.5">Reason</Text>
            <TextInput
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 min-h-[110px]"
              placeholder="Write the reason for leave"
              placeholderTextColor="#94A3B8"
              value={reason}
              onChangeText={setReason}
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            className={`mt-4 h-12 rounded-xl items-center justify-center ${
              loading ? "bg-blue-300" : "bg-blue-600"
            }`}
            onPress={submitLeaveRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white font-semibold">Send Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={datePickerTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerTarget(null)}
      >
        <View className="flex-1 bg-black/40 justify-center px-5">
          <View className="bg-white rounded-3xl p-4">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
                onPress={() => setPickerMonth((month) => subMonths(month, 1))}
              >
                <Ionicons name="chevron-back" size={18} color="#334155" />
              </TouchableOpacity>
              <View className="items-center">
                <Text className="text-slate-500 text-xs">
                  {datePickerTarget === "start" ? "From date" : "To date"}
                </Text>
                <Text className="text-slate-900 text-base font-semibold">
                  {format(pickerMonth, "MMMM yyyy")}
                </Text>
              </View>
              <TouchableOpacity
                className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
                onPress={() => setPickerMonth((month) => addMonths(month, 1))}
              >
                <Ionicons name="chevron-forward" size={18} color="#334155" />
              </TouchableOpacity>
            </View>

            <View className="flex-row mb-2">
              {WEEK_DAYS.map((day) => (
                <Text
                  key={day}
                  className="flex-1 text-center text-[11px] font-semibold text-slate-400"
                >
                  {day}
                </Text>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {pickerDays.map((date, index) => {
                if (!date) {
                  return (
                    <View
                      key={`blank-${index}`}
                      className="h-10"
                      style={{ width: "14.285%" }}
                    />
                  );
                }

                const value = toDateInputValue(date);
                const selected =
                  value ===
                  (datePickerTarget === "start" ? startDate : endDate);

                return (
                  <TouchableOpacity
                    key={value}
                    className="h-10 items-center justify-center"
                    style={{ width: "14.285%" }}
                    onPress={() => selectPickerDate(date)}
                  >
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        selected ? "bg-blue-600" : "bg-white"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selected ? "text-white" : "text-slate-700"
                        }`}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              className="mt-4 h-11 rounded-xl bg-slate-100 items-center justify-center"
              onPress={() => setDatePickerTarget(null)}
            >
              <Text className="text-slate-700 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { leaveAPI, LeaveRequest } from "../services/api";
import { useAuthStore } from "../store/authStore";

const toDateLabel = (value?: string) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "dd MMM yyyy");
};

const statusColor = (status: LeaveRequest["status"]) => {
  switch (status) {
    case "approved":
      return { bg: "#DCFCE7", text: "#15803D" };
    case "rejected":
      return { bg: "#FEE2E2", text: "#B91C1C" };
    case "cancelled":
      return { bg: "#F1F5F9", text: "#64748B" };
    default:
      return { bg: "#FEF3C7", text: "#B45309" };
  }
};

export const LeaveScreen = ({ navigation }: any) => {
  const { staff } = useAuthStore();
  const staffId = staff?.id || (staff as any)?._id;
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(
    staff?.leaveRequests || [],
  );
  const [refreshing, setRefreshing] = useState(false);

  const pendingRequests = useMemo(
    () => leaveRequests.filter((request) => request.status === "pending"),
    [leaveRequests],
  );
  const historyRequests = useMemo(
    () => leaveRequests.filter((request) => request.status !== "pending"),
    [leaveRequests],
  );

  const fetchLeaveRequests = useCallback(async () => {
    if (!staffId) return;
    try {
      const response = await leaveAPI.getLeaveRequests(staffId);
      const requests =
        response.data?.leaveRequests ||
        response.data?.staff?.leaveRequests ||
        response.data?.data?.leaveRequests ||
        [];
      setLeaveRequests(requests);
    } catch (error) {
      console.error("Failed to fetch leave requests:", error);
    }
  }, [staffId]);

  useEffect(() => {
    void fetchLeaveRequests();

    const unsubscribe = navigation?.addListener?.("focus", () => {
      void fetchLeaveRequests();
    });

    return () => {
      unsubscribe?.();
    };
  }, [fetchLeaveRequests, navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaveRequests();
    setRefreshing(false);
  };

  const visibleRequests =
    activeTab === "pending" ? pendingRequests : historyRequests;

  return (
    <SafeAreaView className="flex-1 bg-sky-50" edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-4 pb-3">
          <Text className="text-slate-500 text-xs">Staff Leave</Text>
          <Text className="text-slate-900 text-2xl font-semibold mt-1">
            Leave Request
          </Text>
        </View>

        <View className="mx-5 mt-2">
          <View className="bg-white rounded-full p-1 flex-row border border-slate-100">
            {(["pending", "history"] as const).map((tab) => {
              const selected = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  className={`flex-1 rounded-full py-2.5 items-center ${
                    selected ? "bg-blue-600" : "bg-white"
                  }`}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selected ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {tab === "pending"
                      ? `Pending (${pendingRequests.length})`
                      : `History (${historyRequests.length})`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="mt-3">
            {visibleRequests.length === 0 ? (
              <View className="items-center py-10">
                <Ionicons
                  name={
                    activeTab === "pending"
                      ? "hourglass-outline"
                      : "document-text-outline"
                  }
                  size={54}
                  color="#94A3B8"
                />
                <Text className="text-slate-400 text-sm mt-3">
                  {activeTab === "pending"
                    ? "No pending leave requests"
                    : "No leave history yet"}
                </Text>
              </View>
            ) : (
              visibleRequests.map((request) => {
                const colors = statusColor(request.status);
                return (
                  <View
                    key={request.id}
                    className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
                  >
                    <View className="flex-row items-start">
                      <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#2563EB"
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-slate-900 font-semibold">
                            {request.leaveType} Leave
                          </Text>
                          <View
                            className="rounded-full px-2.5 py-1"
                            style={{ backgroundColor: colors.bg }}
                          >
                            <Text
                              className="text-[10px] font-semibold capitalize"
                              style={{ color: colors.text }}
                            >
                              {request.status}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-slate-500 text-xs mt-1">
                          {toDateLabel(request.startDate)} -{" "}
                          {toDateLabel(request.endDate)}
                        </Text>
                        <Text className="text-slate-700 text-sm mt-2">
                          {request.reason}
                        </Text>
                        {request.managerNote ? (
                          <Text className="text-slate-400 text-xs mt-2">
                            Note: {request.managerNote}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute right-7 bottom-8 w-16 h-16 rounded-full bg-blue-600 items-center justify-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.28,
          shadowRadius: 14,
          elevation: 10,
        }}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("LeaveRequestForm")}
      >
        <Ionicons name="add" size={34} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

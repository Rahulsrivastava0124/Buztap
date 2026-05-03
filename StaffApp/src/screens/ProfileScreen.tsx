import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { attendanceAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { format } from "date-fns";

export const ProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { staff, setStaff, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonthAttendance, setCurrentMonthAttendance] =
    useState<any>(null);

  useEffect(() => {
    fetchAttendanceStats();
  }, []);

  const fetchAttendanceStats = async () => {
    if (!staff?.id) return;

    try {
      const response = await attendanceAPI.getAttendance(staff.id);
      const currentMonth = format(new Date(), "yyyy-MM");
      const monthRecords =
        response.data.attendanceRecords?.filter(
          (record: any) =>
            format(new Date(record.date), "yyyy-MM") === currentMonth,
        ) || [];

      const stats = {
        present: monthRecords.filter((r: any) => r.status === "work").length,
        absent: monthRecords.filter((r: any) => r.status === "absent").length,
        holiday: monthRecords.filter((r: any) => r.status === "holiday").length,
        halfDay: monthRecords.filter((r: any) => r.status === "halfDay").length,
      };

      setCurrentMonthAttendance(stats);
      setStaff(response.data);
    } catch (error) {
      console.error("Failed to fetch attendance stats:", error);
    }
  };

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

  return (
    <View style={styles.container}>
      <View style={[styles.profileHeader, { paddingTop: insets.top + 16 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {staff?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{staff?.name}</Text>
          <Text style={styles.designation}>{staff?.designation}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{staff?.phone || "-"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{staff?.email || "-"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{staff?.username}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Employment Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Designation</Text>
            <Text style={styles.value}>{staff?.designation}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Monthly Salary</Text>
            <Text style={styles.value}>
              ₹{staff?.salaryMonthly?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Leave Allowance</Text>
            <Text style={styles.value}>{staff?.leaveAllowance} days</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shift Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Shift Name</Text>
            <Text style={styles.value}>{staff?.shiftTiming?.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Shift Timing</Text>
            <Text style={styles.value}>
              {staff?.shiftTiming?.startTime} - {staff?.shiftTiming?.endTime}
            </Text>
          </View>
        </View>

        {currentMonthAttendance && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {format(new Date(), "MMMM yyyy")} Attendance
            </Text>
            <View style={styles.attendanceGrid}>
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Present</Text>
                <Text style={[styles.attendanceValue, { color: "#4CAF50" }]}>
                  {currentMonthAttendance.present}
                </Text>
              </View>
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Absent</Text>
                <Text style={[styles.attendanceValue, { color: "#F44336" }]}>
                  {currentMonthAttendance.absent}
                </Text>
              </View>
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Holiday</Text>
                <Text style={[styles.attendanceValue, { color: "#FFC107" }]}>
                  {currentMonthAttendance.holiday}
                </Text>
              </View>
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Half Day</Text>
                <Text style={[styles.attendanceValue, { color: "#2196F3" }]}>
                  {currentMonthAttendance.halfDay}
                </Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileHeader: {
    backgroundColor: "#007AFF",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  designation: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  card: {
    margin: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
  },
  attendanceGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  attendanceItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  attendanceLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  attendanceValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutBtn: {
    margin: 12,
    padding: 14,
    backgroundColor: "#F44336",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { useAuthStore, loadStoredToken } from "../store/authStore";
import { initializeAPI } from "../services/api";
import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { AttendanceCalendarScreen } from "../screens/AttendanceCalendarScreen";
import { AttendanceDayPreviewScreen } from "../screens/AttendanceDayPreviewScreen";
import { LeaveScreen } from "../screens/LeaveScreen";
import { LeaveRequestFormScreen } from "../screens/LeaveRequestFormScreen";
import Ionicons from "@expo/vector-icons/Ionicons";

Ionicons.loadFont().catch(() => {});

const RootStack = createStackNavigator();
const AppStack = createStackNavigator();
const TabNavigator = createBottomTabNavigator();


const DashboardStack = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="DashboardHome" component={DashboardScreen} />
  </AppStack.Navigator>
);

const AttendanceStack = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen
      name="AttendanceCalendarHome"
      component={AttendanceCalendarScreen}
    />
    <AppStack.Screen
      name="AttendanceDayPreview"
      component={AttendanceDayPreviewScreen}
    />
  </AppStack.Navigator>
);

const LeaveStack = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="LeaveHome" component={LeaveScreen} />
    <AppStack.Screen
      name="LeaveRequestForm"
      component={LeaveRequestFormScreen}
    />
  </AppStack.Navigator>
);

const ProfileStack = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="ProfileHome" component={ProfileScreen} />
  </AppStack.Navigator>
);

type TabIcon = { focused: boolean; color: string; size: number };

const TAB_ICONS: Record<string, [string, string]> = {
  AttendanceTab: ["calendar", "calendar-outline"],
  HomeTab: ["home", "home-outline"],
  LeaveTab: ["document-text", "document-text-outline"],
  ProfileTab: ["person", "person-outline"],
};

const AppTabs = () => (
  <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
    <TabNavigator.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }: TabIcon) => {
          const [active, inactive] = TAB_ICONS[route.name] ?? [
            "ellipse",
            "ellipse-outline",
          ];
          return (
            <Ionicons
              name={(focused ? active : inactive) as any}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          borderTopColor: "#E2E8F0",
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: "#fff",
        },
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
      })}
    >
      <TabNavigator.Screen
        name="AttendanceTab"
        component={AttendanceStack}
        options={{ tabBarLabel: "Calendar" }}
      />
      <TabNavigator.Screen
        name="HomeTab"
        component={DashboardStack}
        options={{ tabBarLabel: "Home" }}
      />
      <TabNavigator.Screen
        name="LeaveTab"
        component={LeaveStack}
        options={{ tabBarLabel: "Leave" }}
      />
      <TabNavigator.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ tabBarLabel: "Profile" }}
      />
    </TabNavigator.Navigator>
  </SafeAreaView>
);

export const RootNavigator = () => {
  const { token } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        initializeAPI();
        await loadStoredToken();
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Image
            source={require("../../assets/designarena_image_eewduh3n.png")}
            style={{ width: 118, height: 118, marginBottom: 22 }}
            resizeMode="contain"
          />
          <Text style={{ color: "#0F172A", fontSize: 24, fontWeight: "700", textAlign: "center" }}>BazTap</Text>
          <Text style={{ color: "#64748B", fontSize: 14, fontWeight: "500", marginTop: 8, textAlign: "center" }}>Staff Attendance</Text>
          <ActivityIndicator
            size="small"
            color="#2563EB"
            style={{ marginTop: 24 }}
          />
        </View>
      </View>
    );
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      {token ? (
        <RootStack.Screen
          name="App"
          component={AppTabs}
          options={{ animationEnabled: false }}
        />
      ) : (
        <RootStack.Screen
          name="Auth"
          component={LoginScreen}
          options={{ animationEnabled: false }}
        />
      )}
    </RootStack.Navigator>
  );
};

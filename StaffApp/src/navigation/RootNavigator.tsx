import React, { useEffect, useRef } from "react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "../store/authStore";
import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { AttendanceCalendarScreen } from "../screens/AttendanceCalendarScreen";
import Ionicons from "@expo/vector-icons/Ionicons";

Ionicons.loadFont().catch(() => {});

const RootStack = createStackNavigator();
const AppStack = createStackNavigator();
const TabNavigator = createBottomTabNavigator();

const linking: LinkingOptions<any> = {
  prefixes: ["staffattendance://", "exp://"],
  config: {
    screens: {
      App: "app",
      Auth: "auth",
    },
  },
};

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
  ProfileTab: ["person", "person-outline"],
};

const AppTabs = () => (
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
      name="ProfileTab"
      component={ProfileStack}
      options={{ tabBarLabel: "Profile" }}
    />
  </TabNavigator.Navigator>
);

export const RootNavigator = () => {
  const { token } = useAuthStore();
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    if (token) {
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: "App" }],
      });
    } else {
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: "Auth" }],
      });
    }
  }, [token]);

  return (
    <NavigationContainer ref={navigationRef}>
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
    </NavigationContainer>
  );
};

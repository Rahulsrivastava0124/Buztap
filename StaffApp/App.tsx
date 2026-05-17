import React, { useEffect } from "react";
import {
  AppRegistry,
  Platform,
  StyleSheet,
} from "react-native";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import * as SplashScreen from "expo-splash-screen";
import * as NavigationBar from "expo-navigation-bar";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RootNavigator } from "./src/navigation/RootNavigator";

SplashScreen.preventAutoHideAsync();
Ionicons.loadFont().catch(() => {});

function App() {
  const [fontsLoaded, fontError] = useFonts(Ionicons.font);

  useEffect(() => {
    if (fontError) {
      console.error("Failed to load Ionicons font:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync("dark").catch(() => {});
    }
  }, []);

  const linking: LinkingOptions<any> = {
    prefixes: ["staffattendance://", "exp://"],
    config: {
      screens: {
        App: "app",
        Auth: "auth",
      },
    },
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <StatusBar animated={true} style="dark" backgroundColor="#ffffff" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  splashContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  splashContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  splashLogo: {
    width: 118,
    height: 118,
    marginBottom: 22,
  },
  splashTitle: {
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  splashSubtitle: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  splashLoader: {
    marginTop: 24,
  },
});

AppRegistry.registerComponent("main", () => App);

export default App;

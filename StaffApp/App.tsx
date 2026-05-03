import React, { useEffect, useState } from "react";
import { StyleSheet, View, AppRegistry } from "react-native";
import "./global.css";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { initializeAPI } from "./src/services/api";
import { loadStoredToken } from "./src/store/authStore";
import { RootNavigator } from "./src/navigation/RootNavigator";

SplashScreen.preventAutoHideAsync();
Ionicons.loadFont().catch(() => {});

function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts(Ionicons.font);

  useEffect(() => {
    const initRuntime = async () => {
      try {
        // Initialize API with base URL
        initializeAPI();

        // Load stored authentication token
        await loadStoredToken();
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsAppReady(true);
      }
    };

    initRuntime();
  }, []);

  useEffect(() => {
    if (fontError) {
      console.error("Failed to load Ionicons font:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (isAppReady && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isAppReady, fontsLoaded, fontError]);

  if (!isAppReady || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar animated={true} />
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

AppRegistry.registerComponent("main", () => App);

export default App;

import { Platform } from "react-native";
import * as Application from "expo-application";

/**
 * Returns a stable, unique device identifier.
 * - Android: androidId (resets on factory reset / new installation)
 * - iOS: identifierForVendor (resets only when all apps from the vendor are removed)
 *
 * Note: IMEI is not accessible on modern Android (requires privileged permission)
 * and is completely unavailable on iOS. This is the closest secure equivalent
 * that works cross-platform without special permissions.
 */
export async function getDeviceId(): Promise<string | null> {
  try {
    if (Platform.OS === "android") {
      return Application.getAndroidId();
    }
    if (Platform.OS === "ios") {
      return await Application.getIosIdForVendorAsync();
    }
    return null;
  } catch {
    return null;
  }
}

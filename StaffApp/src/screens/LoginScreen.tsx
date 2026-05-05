import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { authAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";

type Step = "phone" | "otp";

export const LoginScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { setToken, setStaff, logout } = useAuthStore();

  const startCooldown = (seconds: number) => {
    setResendCooldown(seconds);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestOtp = async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.requestOtp(trimmed);
      const { maskedEmail: email, expiresInSeconds } = response.data;
      setMaskedEmail(email);
      setStep("otp");
      startCooldown(60);
      Alert.alert("OTP Sent", `A 6-digit OTP has been sent to ${email}`);
    } catch (error: any) {
      if (__DEV__) {
        console.log("[LOGIN] requestOtp failed", {
          message: error?.message,
          code: error?.code,
          status: error?.response?.status,
          data: error?.response?.data,
          attemptedBaseUrls: error?.attemptedBaseUrls,
        });
      }
      const message =
        error.response?.data?.error ||
        "Cannot reach backend. Make sure API server is running and EXPO_PUBLIC_API_URL is correct.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.verifyOtp(phone.trim(), otp.trim());
      const { token, staff } = response.data;
      setToken(token);
      setStaff(staff);
      Alert.alert("Success", `Welcome ${staff.name}!`);
    } catch (error: any) {
      const message =
        error.response?.data?.error || "Invalid OTP. Please try again.";
      Alert.alert("Login Error", message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setOtp("");
    await handleRequestOtp();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
          <Image
            source={require("../../assets/Secure data-pana.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === "phone" ? "Sign In" : "Verify OTP"}
            </Text>
            <Text style={styles.subtitle}>
              {step === "phone"
                ? "Enter your mobile number to continue"
                : "Enter the 6-digit code sent to your email"}
            </Text>
          </View>

          <View style={styles.form}>
            {step === "phone" ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryBox}>
                    <Text style={styles.flag}>🇮🇳</Text>
                    <Text style={styles.countryCode}>+91</Text>
                    <Text style={styles.chevron}>▾</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="9876543210"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    editable={!loading}
                    placeholderTextColor="#a0a8b3"
                  />
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.otpHint}>
                  OTP sent to <Text style={styles.otpEmail}>{maskedEmail}</Text>
                </Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>One-Time Password</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="••••••"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    editable={!loading}
                    placeholderTextColor="#a0a8b3"
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={step === "phone" ? handleRequestOtp : handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {step === "phone" ? "Submit" : "Verify & Login"}
                </Text>
              )}
            </TouchableOpacity>

            {step === "otp" && (
              <View style={styles.otpActions}>
                <TouchableOpacity
                  onPress={() => {
                    setStep("phone");
                    setOtp("");
                  }}
                  disabled={loading}
                >
                  <Text style={styles.linkText}>Change number</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resendCooldown > 0 || loading}
                >
                  <Text
                    style={[
                      styles.linkText,
                      resendCooldown > 0 && styles.linkDisabled,
                    ]}
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerLink}>
              Terms & Conditions | Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d9e6f2",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  topSection: {
    flex: 1,
    minHeight: 280,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 20,
  },
  heroImage: {
    width: "100%",
    height: 280,
  },
  card: {
    width: "100%",
    backgroundColor: "#f6f8fb",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f2740",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: "#5f6f80",
  },
  form: {
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3e4f63",
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d8dee7",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    minHeight: 54,
  },
  countryBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#e2e7ef",
    minHeight: 54,
  },
  flag: {
    fontSize: 24,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6f7b8a",
    marginRight: 6,
  },
  chevron: {
    fontSize: 14,
    color: "#6f7b8a",
    marginTop: 2,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#23384e",
    minHeight: 62,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8dee7",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#23384e",
    backgroundColor: "#fff",
    minHeight: 54,
  },
  otpInput: {
    letterSpacing: 8,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },
  otpHint: {
    fontSize: 14,
    color: "#5f6f80",
    marginBottom: 16,
  },
  otpEmail: {
    fontWeight: "600",
    color: "#1778b8",
  },
  primaryBtn: {
    backgroundColor: "#1778b8",
    minHeight: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  primaryBtnText: {
    color: "#f6fbff",
    fontSize: 17,
    fontWeight: "700",
  },
  otpActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  linkText: {
    fontSize: 13,
    color: "#1778b8",
    fontWeight: "600",
  },
  linkDisabled: {
    color: "#9eb2c5",
  },
  footer: {
    alignItems: "center",
    marginTop: 10,
  },
  footerLink: {
    fontSize: 13,
    color: "#1778b8",
    textAlign: "center",
    fontWeight: "500",
  },
});

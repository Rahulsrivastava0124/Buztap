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
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Staff Attendance</Text>
          <Text style={styles.subtitle}>
            {step === "phone" ? "Enter your phone number" : "Enter the OTP"}
          </Text>
        </View>

        <View style={styles.form}>
          {step === "phone" ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 9876543210"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
                placeholderTextColor="#999"
              />
            </View>
          ) : (
            <>
              <Text style={styles.otpHint}>
                OTP sent to <Text style={styles.otpEmail}>{maskedEmail}</Text>
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>6-Digit OTP</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="••••••"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  editable={!loading}
                  placeholderTextColor="#999"
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
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {step === "phone" ? "Send OTP" : "Login"}
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
                <Text style={styles.linkText}>← Change phone number</Text>
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
          <Text style={styles.footerText}>
            OTP will be sent to the email linked to your phone number
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  otpInput: {
    letterSpacing: 8,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },
  otpHint: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  otpEmail: {
    fontWeight: "600",
    color: "#007AFF",
  },
  primaryBtn: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  otpActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  linkText: {
    fontSize: 13,
    color: "#007AFF",
  },
  linkDisabled: {
    color: "#aaa",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});

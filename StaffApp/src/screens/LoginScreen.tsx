import React, { useRef, useState } from "react";
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
  const otpInputRef = useRef<TextInput>(null);
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
    } catch (error: any) {
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

  const handleOtpChange = (value: string) => {
    const normalized = value.replace(/\D/g, "").slice(0, 6);
    setOtp(normalized);
  };

  const isOtpStep = step === "otp";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isOtpStep && styles.scrollContentOtp,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!isOtpStep ? (
          <View style={styles.topSection}>
            <Image
              source={require("../../assets/Secure data-pana.png")}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.otpTopSpace} />
        )}

        <View style={[styles.card, isOtpStep && styles.cardOtp]}>
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

          <View style={[styles.form, isOtpStep && styles.formOtp]}>
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
                  <Text style={styles.label}>Enter OTP</Text>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => otpInputRef.current?.focus()}
                    style={styles.otpBoxRow}
                  >
                    {Array.from({ length: 6 }).map((_, index) => {
                      const digit = otp[index] ?? "";
                      const isActive = index === otp.length && otp.length < 6;
                      return (
                        <View
                          key={`otp-box-${index}`}
                          style={[
                            styles.otpBox,
                            isActive && styles.otpBoxActive,
                            digit ? styles.otpBoxFilled : null,
                          ]}
                        >
                          <Text style={styles.otpBoxText}>{digit || "-"}</Text>
                        </View>
                      );
                    })}
                  </TouchableOpacity>
                  <TextInput
                    ref={otpInputRef}
                    style={styles.otpHiddenInput}
                    placeholder=""
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={handleOtpChange}
                    editable={!loading}
                    textContentType="oneTimeCode"
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
                  {step === "phone" ? "Submit" : "Submit OTP"}
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

          <View style={[styles.footer, isOtpStep && styles.footerOtp]}>
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
    backgroundColor: "#eaf1fb",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  scrollContentOtp: {
    justifyContent: "flex-start",
    backgroundColor: "#ffffff",
  },
  topSection: {
    flex: 1,
    minHeight: 300,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 18,
  },
  heroImage: {
    width: "92%",
    height: 290,
  },
  otpTopSpace: {
    minHeight: 14,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 36,
    shadowColor: "#0f2740",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 8,
  },
  cardOtp: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 8,
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 22,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0f2240",
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 15,
    color: "#5f7086",
    lineHeight: 22,
  },
  form: {
    marginBottom: 16,
  },
  formOtp: {
    flexGrow: 1,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#33465d",
    marginBottom: 10,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d7e1ee",
    borderRadius: 16,
    backgroundColor: "#f9fbff",
    minHeight: 58,
  },
  countryBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: "#e3e9f3",
    minHeight: 58,
  },
  flag: {
    fontSize: 24,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#607187",
    marginRight: 6,
  },
  chevron: {
    fontSize: 14,
    color: "#7a8898",
    marginTop: 2,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#23374f",
    minHeight: 58,
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
  otpBoxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d5deea",
    backgroundColor: "#f9fbff",
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxActive: {
    borderColor: "#5e68f2",
    backgroundColor: "#f2f4ff",
    shadowColor: "#5e68f2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: "#6b74f5",
    backgroundColor: "#eef1ff",
  },
  otpBoxText: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "700",
    color: "#313b5a",
  },
  otpHiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpHint: {
    fontSize: 15,
    color: "#627387",
    marginBottom: 18,
  },
  otpEmail: {
    fontWeight: "700",
    color: "#1f7fc0",
  },
  primaryBtn: {
    backgroundColor: "#247eb8",
    minHeight: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#247eb8",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  primaryBtnText: {
    color: "#f6fbff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  otpActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    color: "#1f7fc0",
    fontWeight: "700",
  },
  linkDisabled: {
    color: "#9eb2c5",
  },
  footer: {
    alignItems: "center",
    marginTop: 10,
  },
  footerOtp: {
    marginTop: "auto",
    paddingTop: 10,
  },
  footerLink: {
    fontSize: 15,
    color: "#1f7fc0",
    textAlign: "center",
    fontWeight: "700",
  },
});

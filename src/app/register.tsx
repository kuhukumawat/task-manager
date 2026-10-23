import Google from "@/assets/google.svg";
import Selection from "@/components/selection";
import { useSettings } from "@/context/SettingsContext";
import { User } from "@/types/interface";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeColor, fontScale } = useSettings();

  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [focusedField, setFocusedField] = useState<
    "identifier" | "email" | "password" | "confirmPassword" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/start");
    }
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    setErrorMessage("");

    const trimmedUsername = identifier.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (
      !trimmedUsername ||
      !trimmedEmail ||
      !trimmedPassword ||
      !trimmedConfirmPassword
    ) {
      const msg = "Please fill in all fields.";
      setErrorMessage(msg);
      if (Platform.OS === "android") {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      }
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      const msg = "Please enter a valid email address.";
      setErrorMessage(msg);
      if (Platform.OS === "android") {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      }
      return;
    }

    if (trimmedPassword.length < 6) {
      const msg = "Password must be at least 6 characters.";
      setErrorMessage(msg);
      if (Platform.OS === "android") {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      }
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      const msg = "Passwords do not match.";
      setErrorMessage(msg);
      if (Platform.OS === "android") {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      }
      return;
    }

    try {
      const newUser: User = {
        identifier: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword,
        isLoggedIn: true,
      };
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      router.replace("/home");
    } catch (e) {
      console.log("Error saving user:", e);
      setErrorMessage("Could not save account. Please try again.");
    }
  };

  const isFormValid =
    identifier.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0;

  const isUsernameError =
    Boolean(errorMessage) &&
    (!identifier.trim() || errorMessage.includes("all"));

  const isEmailError =
    Boolean(errorMessage) &&
    (!email.trim() ||
      errorMessage.includes("email") ||
      errorMessage.includes("all"));

  const isPasswordError =
    Boolean(errorMessage) &&
    (!password.trim() ||
      errorMessage.includes("Password") ||
      errorMessage.includes("match") ||
      errorMessage.includes("all"));

  const isConfirmPasswordError =
    Boolean(errorMessage) &&
    (!confirmPassword.trim() ||
      errorMessage.includes("match") ||
      errorMessage.includes("all"));

  const getBorderColor = (
    field: "identifier" | "email" | "password" | "confirmPassword",
    hasError: boolean,
  ) => {
    if (hasError) return "#FF4949";
    if (focusedField === field) return "#FFFFFF";
    return "#979797";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#121212" }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          paddingTop: Math.max(insets.top, 16) + 12,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Form Section */}
        <View>
          {/* Back Button */}
          <View style={{ height: 40, justifyContent: "center" }}>
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              style={{
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "flex-start",
              }}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={28} color="white" />
            </Pressable>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: Math.round(32 * fontScale),
              lineHeight: Math.round(38 * fontScale),
              fontWeight: "700",
              color: "rgba(255, 255, 255, 0.87)",
              marginTop: 16,
              marginBottom: 20,
            }}
          >
            Register
          </Text>

          {/* Form Fields */}
          <View>
            {/* Username Field */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.87)",
                  marginBottom: 8,
                }}
              >
                Username
              </Text>
              <View
                style={{
                  height: 48,
                  backgroundColor: "#1D1D1D",
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: getBorderColor("identifier", isUsernameError),
                  paddingHorizontal: 12,
                  justifyContent: "center",
                }}
              >
                <TextInput
                  placeholder="Enter your Username"
                  placeholderTextColor="#535353"
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onFocus={() => setFocusedField("identifier")}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  style={{
                    color: "#FFFFFF",
                    fontSize: 16,
                    height: "100%",
                    paddingVertical: 0,
                  }}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.87)",
                  marginBottom: 8,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  height: 48,
                  backgroundColor: "#1D1D1D",
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: getBorderColor("email", isEmailError),
                  paddingHorizontal: 12,
                  justifyContent: "center",
                }}
              >
                <TextInput
                  placeholder="Enter your Email"
                  placeholderTextColor="#535353"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    color: "#FFFFFF",
                    fontSize: 16,
                    height: "100%",
                    paddingVertical: 0,
                  }}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.87)",
                  marginBottom: 8,
                }}
              >
                Password
              </Text>
              <View
                style={{
                  height: 48,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1D1D1D",
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: getBorderColor("password", isPasswordError),
                  paddingHorizontal: 12,
                }}
              >
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#535353"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    flex: 1,
                    color: "#FFFFFF",
                    fontSize: 16,
                    height: "100%",
                    paddingVertical: 0,
                  }}
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={12}
                  style={{
                    height: 48,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingLeft: 8,
                  }}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="white"
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.87)",
                  marginBottom: 8,
                }}
              >
                Confirm Password
              </Text>
              <View
                style={{
                  height: 48,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1D1D1D",
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: getBorderColor(
                    "confirmPassword",
                    isConfirmPasswordError,
                  ),
                  paddingHorizontal: 12,
                }}
              >
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#535353"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    flex: 1,
                    color: "#FFFFFF",
                    fontSize: 16,
                    height: "100%",
                    paddingVertical: 0,
                  }}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  hitSlop={12}
                  style={{
                    height: 48,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingLeft: 8,
                  }}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color="white"
                  />
                </Pressable>
              </View>
            </View>

            {/* Error Message Box */}
            {errorMessage ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 73, 73, 0.15)",
                  borderColor: "rgba(255, 73, 73, 0.5)",
                  borderWidth: 1,
                  borderRadius: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  marginBottom: 8,
                }}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#FF4949"
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={{
                    color: "#FF4949",
                    fontSize: 12,
                    fontWeight: "500",
                    flex: 1,
                  }}
                >
                  {errorMessage}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Bottom Actions Section */}
        <View style={{ marginTop: 20 }}>
          {/* REGISTER Button */}
          <Pressable
            disabled={!isFormValid}
            onPress={handleRegister}
            style={{
              height: 48,
              borderRadius: 4,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isFormValid ? themeColor : "#8687E7",
              opacity: isFormValid ? 1 : 0.5,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "400",
                lineHeight: 24,
              }}
            >
              REGISTER
            </Text>
          </Pressable>

          {/* Selection (or divider) */}
          <View style={{ marginBottom: 16 }}>
            <Selection />
          </View>

          {/* Register with Google */}
          <Pressable
            style={{
              height: 48,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: "#8E7CFF",
              backgroundColor: "transparent",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <View style={{ marginRight: 8 }}>
              <Google />
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "400",
                lineHeight: 24,
              }}
            >
              Register with Google
            </Text>
          </Pressable>

          {/* Register with Apple */}
          <Pressable
            style={{
              height: 48,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: "#8E7CFF",
              backgroundColor: "transparent",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#283544",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              <Ionicons name="logo-apple" size={16} color="white" />
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "400",
                lineHeight: 24,
              }}
            >
              Register with Apple
            </Text>
          </Pressable>

          {/* Already have an account? Login */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#979797",
                fontSize: 12,
                fontWeight: "400",
                marginRight: 8,
              }}
            >
              Already have an account?
            </Text>
            <Pressable
              onPress={() => router.push("/login")}
              hitSlop={8}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                Login
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

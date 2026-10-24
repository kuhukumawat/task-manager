import Google from "@/assets/google.svg";
import Selection from "@/components/selection";
import { User } from "@/types/interface";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/start");
    }
  };
  const handleTouchOut = () => {
    Keyboard.dismiss();
    setIsUsernameFocused(false);
    setIsPasswordFocused(false);
  };
  const handleLogin = async () => {
    if (!identifier.trim() && !password.trim()) {
      setErrorMessage("Please enter your username/email and password");
      return;
    }
    if (!identifier.trim()) {
      setErrorMessage("Please enter your username or email");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Please enter your password");
      return;
    }

    try {
      const data = await AsyncStorage.getItem("user");
      if (!data) {
        setErrorMessage("User not found. Please register first.");
        if (Platform.OS === "android") {
          ToastAndroid.show(
            "User not found. Please register first.",
            ToastAndroid.SHORT,
          );
        }
        return;
      }

      const user: User = JSON.parse(data);
      const trimmedIdentifier = identifier.trim().toLowerCase();
      const isIdentifierMatch =
        user.identifier?.trim().toLowerCase() === trimmedIdentifier ||
        user.email?.trim().toLowerCase() === trimmedIdentifier;
      const isPasswordMatch = user.password === password;

      if (!isIdentifierMatch) {
        setErrorMessage("User not found with this username or email");
        if (Platform.OS === "android") {
          ToastAndroid.show(
            "User not found with this username or email",
            ToastAndroid.SHORT,
          );
        }
        return;
      }

      if (!isPasswordMatch) {
        setErrorMessage("Incorrect password. Please try again.");
        if (Platform.OS === "android") {
          ToastAndroid.show(
            "Incorrect password. Please try again.",
            ToastAndroid.SHORT,
          );
        }
        return;
      }

      setErrorMessage("");
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({ ...user, isLoggedIn: true }),
      );
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      router.replace("/home");
    } catch (error) {
      console.log("Login error:", error);
      setErrorMessage("An error occurred during login. Please try again.");
      if (Platform.OS === "android") {
        ToastAndroid.show("Login error", ToastAndroid.SHORT);
      }
    }
  };
  useEffect(() => {
    const check = async () => {
      try {
        const data = await AsyncStorage.getItem("user");
        if (data) {
          const user: User = JSON.parse(data);
          if (user.isLoggedIn) {
            router.replace("/home");
          }
        }
      } catch (error) {
        console.log("Check error:", error);
      }
    };
    check();
  }, [router]);

  const isFormValid =
    identifier.trim().length > 0 && password.trim().length > 0;

  const isIdentifierError =
    Boolean(errorMessage) &&
    (!identifier.trim() ||
      errorMessage.includes("username") ||
      errorMessage.includes("User not found") ||
      errorMessage.includes("all"));

  const isPasswordError =
    Boolean(errorMessage) &&
    (!password.trim() ||
      errorMessage.includes("password") ||
      errorMessage.includes("all"));

  return (
    <Pressable
      className="flex-1  justify-between "
      style={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: insets.left + 20,
      }}
      onPress={handleTouchOut}
    >
      <View className="gap-12">
        <View className="h-10 justify-center">
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            className="w-10 h-10 justify-center items-start active:opacity-60"
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </Pressable>
        </View>

        <View className=" gap-10">
          <Text className="text-[32px] leading-[38px] font-bold text-start max-w-[288px] text-[#FFFFFFDE]">
            Login
          </Text>

          <View className="gap-6">
            <Text className="text-base font-normal text-[#FFFFFFDE]">
              Username/Email
            </Text>

            <TextInput
              placeholder="Enter your Username/Email"
              placeholderTextColor="#535353"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (errorMessage) setErrorMessage("");
              }}
              onFocus={() => setIsUsernameFocused(true)}
              onBlur={() => setIsUsernameFocused(false)}
              className={`h-[48px] w-full bg-[#1D1D1D] rounded-[6px] px-[12px] text-white border-[1px] text-base font-normal ${
                isIdentifierError
                  ? "border-[#FF4949]"
                  : isUsernameFocused
                  ? "border-white"
                  : "border-[#979797]"
              }`}
            />
            <Text className="text-base font-normal text-[#FFFFFFDE]">
              Password
            </Text>
            <View className="relative">
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#535353"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage("");
                }}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className={`h-[48px] w-full bg-[#1D1D1D] rounded-[6px] px-[12px] pr-[45px] text-white border-[1px] text-base ${
                  isPasswordError
                    ? "border-[#FF4949]"
                    : isPasswordFocused
                    ? "border-white"
                    : "border-[#979797]"
                }`}
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[14px] z-20"
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="white"
                />
              </Pressable>
            </View>

            {errorMessage ? (
              <View className="bg-[#FF4949]/15 border border-[#FF4949]/50 rounded-[6px] px-3.5 py-2.5 flex-row items-center gap-2.5 mt-1">
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#FF4949"
                />
                <Text className="text-[#FF4949] text-xs font-medium flex-1">
                  {errorMessage}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View className="gap-[28px]">
        <Pressable
          onPress={handleLogin}
          className={`w-full h-[48px] rounded-[4px] items-center justify-center active:opacity-80 ${
            isFormValid ? "button" : "button/60"
          }`}
        >
          <Text className="text-base leading-[24px]  text-white font-normal">
            LOGIN
          </Text>
        </Pressable>

        <Selection />

        <Pressable className="w-full h-[48px] flex-row items-center gap-2 bg-transparent border-[1px] border-[#8E7CFF] rounded-[4px] items-center justify-center active:opacity-80">
          <Google />
          <Text className="text-base leading-[24px]  text-white font-normal">
            Login with Google
          </Text>
        </Pressable>
        <Pressable className="w-full h-[48px] bg-transparent border-[1px] border-[#8E7CFF] rounded-[4px] items-center justify-center active:opacity-80">
          <View className="flex-row items-center justify-center gap-2">
            <View className="w-8 h-8 rounded-full bg-[#283544] flex items-center justify-center">
              <Ionicons name="logo-apple" size={16} color="white" />
            </View>
            <Text className="text-base leading-[24px]  text-white font-normal">
              Login with Apple
            </Text>
          </View>
        </Pressable>

        <View className="w-full flex-row items-center justify-center gap-2">
          <Text className="text-xs  text-[#979797] font-normal">
            Don’t have an account?
          </Text>
          <Pressable onPress={() => router.push("/register")}>
            <Text className="text-xs  text-white font-normal">Register</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

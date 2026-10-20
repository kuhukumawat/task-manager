import Google from "@/assets/google.svg";
import Selection from "@/components/selection";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";
export default function Login() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const handleBack = () => {
    router.back();
  };
  const handleTouchOut = () => {
    Keyboard.dismiss();
    setIsUsernameFocused(false);
    setIsPasswordFocused(false);
  };
  return (
    <Pressable
      className="flex-1  justify-between px-10 py-20"
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
              onChangeText={setIdentifier}
              onFocus={() => setIsUsernameFocused(true)}
              className="h-[48px] w-full bg-[#1D1D1D] rounded-[6px] px-[12px] text-white border-[#979797] border-[1px] text-base font-normal"
            />
            <Text className="text-base font-normal text-[#FFFFFFDE]">
              Password
            </Text>
            <View className="relative">
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#535353"
                secureTextEntry={showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setIsPasswordFocused(true)}
                className="h-[48px] w-full bg-[#1D1D1D] rounded-[6px] px-[12px] pr-[45px]  text-white border-[#979797] border-[1px] text-base"
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
          </View>
        </View>
      </View>

      <View className="gap-[28px]">
        <Pressable
          disabled={!identifier && !password}
          onPress={() => router.push("/fingerprint")}
          className={`w-full h-[48px] rounded-[4px] items-center justify-center active:opacity-80 ${
            identifier && password ? "button" : "bg-[#8687E7]/50"
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

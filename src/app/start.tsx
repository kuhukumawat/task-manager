import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Start() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 justify-between px-10 py-20">
      {/* Top Section: Back Button + Title & Subtitle */}
      <View className="gap-12">
        {/* Back Button (Figma: left: 24px, top: 57px, 24x24) */}
        <View className="h-10 justify-center">
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            className="w-10 h-10 justify-center items-start active:opacity-60"
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </Pressable>
        </View>

        {/* Title & Description Container (Figma: top 139px, 58px below back button) */}
        <View className="items-center gap-10">
          {/* Welcome to UpTodo (Figma: 32px / 38px, font-weight: 700, max-w: 288px) */}
          <Text
            style={{ color: "rgba(255, 255, 255, 0.87)" }}
            className="text-[32px] leading-[38px] font-bold text-center max-w-[288px]"
          >
            Welcome to UpTodo
          </Text>

          {/* Subtitle (Figma: top 203px, 26px below title, 16px / 24px, max-w: 287px) */}
          <Text
            style={{ color: "rgba(255, 255, 255, 0.67)" }}
            className="text-base text-center"
          >
            Please login to your account or create new account to continue
          </Text>
        </View>
      </View>

      {/* Bottom Actions: Login & Create Account (Figma: Frame 121 & 122) */}
      <View className="gap-[28px]">
        {/* LOGIN Button (Figma Frame 121: 327x48, bg: #8875FF, radius: 4px) */}
        <Pressable
          onPress={() => router.push("/login")}
          className="w-full h-[48px] bg-[#8875FF] rounded-[4px] items-center justify-center active:opacity-80"
        >
          <Text className="text-base leading-[24px] uppercase text-white font-normal">
            LOGIN
          </Text>
        </Pressable>

        {/* CREATE ACCOUNT Button (Figma Frame 122: 327x48, border: 2px solid #8E7CFF, radius: 4px) */}
        <Pressable
          onPress={() => router.push("/register")}
          className="w-full h-[48px] bg-transparent border-[1px] border-[#8E7CFF] rounded-[4px] items-center justify-center active:opacity-80"
        >
          <Text className="text-base leading-[24px] uppercase text-white font-normal">
            CREATE ACCOUNT
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

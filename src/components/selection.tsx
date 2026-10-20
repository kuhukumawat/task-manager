import { Text, View } from "react-native";

export default function Selection() {
  return (
    <View className="w-full px-8 flex-row items-center">
      <View className="flex-1 h-[1px] bg-[#979797]" />

      <Text className="mx-5 text-base leading-[24px] text-[#979797]">or</Text>

      <View className="flex-1 h-[1px] bg-[#979797]" />
    </View>
  );
}

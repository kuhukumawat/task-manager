import HomeImage from "@/assets/home.svg";
import Profile from "@/assets/image.png";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1  justify-start px-10 py-20 ">
      <View className="gap-6">
        <View className="h-10 flex-row items-center justify-between">
          <Pressable
            onPress={() => {}}
            hitSlop={12}
            className="w-10 h-10 justify-center items-start active:opacity-60"
          >
            <Ionicons name="filter-outline" size={28} color="white" />
          </Pressable>
          <Text className="text-xl font-normal text-white">Index</Text>
          <View className="rounded-full overflow-hidden w-[42px] h-[42px]">
            <Image source={Profile} style={{ width: 50, height: 50 }} />
          </View>
        </View>
      </View>
      <View className="gap-[10px] items-center h-full justify-center">
        <View className="w-full items-center">
          <HomeImage />
        </View>
        <View className="gap-4 items-center">
          <Text className="text-2xl font-normal text-[#ffffff80]">
            What do you want to do today?
          </Text>
          <Text className="text-lg font-normal text-[#ffffff80]">
            Tap + to add your tasks
          </Text>
        </View>
      </View>
    </View>
  );
}

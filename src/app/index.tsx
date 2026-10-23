import Logo from "@/assets/uptodo.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const data = await AsyncStorage.getItem("user");
        if (data) {
          const user = JSON.parse(data);
          if (user.isLoggedIn) {
            router.replace("/home");
            return;
          }
        }
      } catch (error) {
        console.log("Error checking user session:", error);
      }
      router.replace("/onboarding");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 bg-[#121212] justify-center items-center">
      <View className="flex flex-col justify-center items-center gap-3">
        <Logo width={95} height={95} />

        <Text className="text-white text-4xl font-bold tracking-wider">UpTodo</Text>
      </View>
    </View>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#121212",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 12,
//   },

//   title: {
//     color: "#FFFFFF",
//     fontSize: 28,
//     fontWeight: "700",
//   },
// });
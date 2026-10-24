import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Fingerprint() {
  const router = useRouter();

  useEffect(() => {
    const authenticate = async () => {
      try {
        const data = await AsyncStorage.getItem("user");
        const user = data ? JSON.parse(data) : null;
        const isLoggedIn = Boolean(user && user.isLoggedIn);

        const hasHardware = await LocalAuthentication.hasHardwareAsync();

        if (!hasHardware) {
          router.replace(isLoggedIn ? "/home" : "/login");
          return;
        }

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!isEnrolled) {
          router.replace(isLoggedIn ? "/home" : "/login");
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Verify your identity",
          cancelLabel: "Cancel",
          fallbackLabel: "Use Password",
        });

        if (result.success) {
          router.replace("/home");
        } else {
          console.log("Authentication failed or cancelled");
          router.replace(isLoggedIn ? "/home" : "/login");
        }
      } catch (error) {
        console.log("Biometric error:", error);
        router.replace("/home");
      }
    };

    authenticate();
  }, [router]);

  return null;
}

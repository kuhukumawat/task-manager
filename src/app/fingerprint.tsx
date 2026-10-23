import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Fingerprint() {
  const router = useRouter();

  useEffect(() => {
    const authenticate = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();

        if (!hasHardware) {
          router.replace("/home");
          return;
        }

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!isEnrolled) {
          router.replace("/home");
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
          router.replace("/login");
        }
      } catch (error) {
        console.log("Biometric error:", error);

        router.replace("/login");
      }
    };

    authenticate();
  }, [router]);

  return null;
}

import AppTabs from "@/components/app-tabs";
import "@/global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#121212" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="start" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="home" />
        <Stack.Screen name="calender" />
        <Stack.Screen name="focus" />
        <Stack.Screen name="profile" />
        <Stack.Screen
          name="fingerprint"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
      </Stack>

      <AppTabs />
    </>
  );
}

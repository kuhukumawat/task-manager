import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import AddATask from "./add-a-task";

// --- Exact Native SVG Icons from Figma ---

// 1. Home / Index Icon (viewBox: 0 0 21 20)
function HomeIcon({
  color = "white",
  size = 24,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={(size * 20) / 21} viewBox="0 0 21 20" fill="none">
      <Path
        d="M18.05 4.81774L12.29 0.78774C10.72 -0.31226 8.31 -0.252259 6.8 0.917741L1.79 4.82774C0.79 5.60774 0 7.20774 0 8.46774V15.3677C0 17.9177 2.07 19.9977 4.62 19.9977H15.4C17.95 19.9977 20.02 17.9277 20.02 15.3777V8.59774C20.02 7.24774 19.15 5.58774 18.05 4.81774ZM10.76 15.9977C10.76 16.4077 10.42 16.7477 10.01 16.7477C9.6 16.7477 9.26 16.4077 9.26 15.9977V12.9977C9.26 12.5877 9.6 12.2477 10.01 12.2477C10.42 12.2477 10.76 12.5877 10.76 12.9977V15.9977Z"
        fill={color}
      />
    </Svg>
  );
}

// 2. Calendar Icon (viewBox: 0 0 24 24)
function CalendarIcon({
  color = "white",
  size = 24,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 5.75C7.59 5.75 7.25 5.41 7.25 5V2C7.25 1.59 7.59 1.25 8 1.25C8.41 1.25 8.75 1.59 8.75 2V5C8.75 5.41 8.41 5.75 8 5.75Z"
        fill={color}
      />
      <Path
        d="M16 5.75C15.59 5.75 15.25 5.41 15.25 5V2C15.25 1.59 15.59 1.25 16 1.25C16.41 1.25 16.75 1.59 16.75 2V5C16.75 5.41 16.41 5.75 16 5.75Z"
        fill={color}
      />
      <Path
        d="M8.5 14.5001C8.37 14.5001 8.24 14.4701 8.12 14.4201C7.99 14.3701 7.89 14.3001 7.79 14.2101C7.61 14.0201 7.5 13.7701 7.5 13.5001C7.5 13.3701 7.53 13.2401 7.58 13.1201C7.63 13.0001 7.7 12.8901 7.79 12.7901C7.89 12.7001 7.99 12.6301 8.12 12.5801C8.48 12.4301 8.93 12.5101 9.21 12.7901C9.39 12.9801 9.5 13.2401 9.5 13.5001C9.5 13.5601 9.49 13.6301 9.48 13.7001C9.47 13.7601 9.45 13.8201 9.42 13.8801C9.4 13.9401 9.37 14.0001 9.33 14.0601C9.3 14.1101 9.25 14.1601 9.21 14.2101C9.02 14.3901 8.76 14.5001 8.5 14.5001Z"
        fill={color}
      />
      <Path
        d="M12 14.4999C11.87 14.4999 11.74 14.4699 11.62 14.4199C11.49 14.3699 11.39 14.2999 11.29 14.2099C11.11 14.0199 11 13.7699 11 13.4999C11 13.3699 11.03 13.2399 11.08 13.1199C11.13 12.9999 11.2 12.8899 11.29 12.7899C11.39 12.6999 11.49 12.6299 11.62 12.5799C11.98 12.4199 12.43 12.5099 12.71 12.7899C12.89 12.9799 13 13.2399 13 13.4999C13 13.5599 12.99 13.6299 12.98 13.6999C12.97 13.7599 12.95 13.8199 12.92 13.8799C12.9 13.9399 12.87 13.9999 12.83 14.0599C12.8 14.1099 12.75 14.1599 12.71 14.2099C12.52 14.3899 12.26 14.4999 12 14.4999Z"
        fill={color}
      />
      <Path
        d="M15.5 14.4999C15.37 14.4999 15.24 14.4699 15.12 14.4199C14.99 14.3699 14.89 14.2999 14.79 14.2099C14.75 14.1599 14.71 14.1099 14.67 14.0599C14.63 13.9999 14.6 13.9399 14.58 13.8799C14.55 13.8199 14.53 13.7599 14.52 13.6999C14.51 13.6299 14.5 13.5599 14.5 13.4999C14.5 13.2399 14.61 12.9799 14.79 12.7899C14.89 12.6999 14.99 12.6299 15.12 12.5799C15.49 12.4199 15.93 12.5099 16.21 12.7899C16.39 12.9799 16.5 13.2399 16.5 13.4999C16.5 13.5599 16.49 13.6299 16.48 13.6999C16.47 13.7599 16.45 13.8199 16.42 13.8799C16.4 13.9399 16.37 13.9999 16.33 14.0599C16.3 14.1099 16.25 14.1599 16.21 14.2099C16.02 14.3899 15.76 14.4999 15.5 14.4999Z"
        fill={color}
      />
      <Path
        d="M8.5 17.9999C8.37 17.9999 8.24 17.97 8.12 17.92C8 17.87 7.89 17.7999 7.79 17.7099C7.61 17.5199 7.5 17.2599 7.5 16.9999C7.5 16.8699 7.53 16.7399 7.58 16.6199C7.63 16.4899 7.7 16.38 7.79 16.29C8.16 15.92 8.84 15.92 9.21 16.29C9.39 16.48 9.5 16.7399 9.5 16.9999C9.5 17.2599 9.39 17.5199 9.21 17.7099C9.02 17.8899 8.76 17.9999 8.5 17.9999Z"
        fill={color}
      />
      <Path
        d="M12 17.9999C11.74 17.9999 11.48 17.8899 11.29 17.7099C11.11 17.5199 11 17.2599 11 16.9999C11 16.8699 11.03 16.7399 11.08 16.6199C11.13 16.4899 11.2 16.38 11.29 16.29C11.66 15.92 12.34 15.92 12.71 16.29C12.8 16.38 12.87 16.4899 12.92 16.6199C12.97 16.7399 13 16.8699 13 16.9999C13 17.2599 12.89 17.5199 12.71 17.7099C12.52 17.8899 12.26 17.9999 12 17.9999Z"
        fill={color}
      />
      <Path
        d="M15.5 17.9999C15.24 17.9999 14.98 17.8899 14.79 17.7099C14.7 17.6199 14.63 17.5099 14.58 17.3799C14.53 17.2599 14.5 17.1299 14.5 16.9999C14.5 16.8699 14.53 16.7399 14.58 16.6199C14.63 16.4899 14.7 16.3799 14.79 16.2899C15.02 16.0599 15.37 15.9499 15.69 16.0199C15.76 16.0299 15.82 16.0499 15.88 16.0799C15.94 16.0999 16 16.1299 16.06 16.1699C16.11 16.1999 16.16 16.2499 16.21 16.2899C16.39 16.4799 16.5 16.7399 16.5 16.9999C16.5 17.2599 16.39 17.5199 16.21 17.7099C16.02 17.8899 15.76 17.9999 15.5 17.9999Z"
        fill={color}
      />
      <Path
        d="M20.5 9.83984H3.5C3.09 9.83984 2.75 9.49984 2.75 9.08984C2.75 8.67984 3.09 8.33984 3.5 8.33984H20.5C20.91 8.33984 21.25 8.67984 21.25 9.08984C21.25 9.49984 20.91 9.83984 20.5 9.83984Z"
        fill={color}
      />
      <Path
        d="M16 22.75H8C4.35 22.75 2.25 20.65 2.25 17V8.5C2.25 4.85 4.35 2.75 8 2.75H16C19.65 2.75 21.75 4.85 21.75 8.5V17C21.75 20.65 19.65 22.75 16 22.75ZM8 4.25C5.14 4.25 3.75 5.64 3.75 8.5V17C3.75 19.86 5.14 21.25 8 21.25H16C18.86 21.25 20.25 19.86 20.25 17V8.5C20.25 5.64 18.86 4.25 16 4.25H8Z"
        fill={color}
      />
    </Svg>
  );
}

// 3. Profile Icon (viewBox: 0 0 19 22)
function ProfileIcon({
  color = "white",
  size = 22,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <Svg width={(size * 19) / 22} height={size} viewBox="0 0 19 22" fill="none">
      <Path
        d="M9.33984 11.5C6.16984 11.5 3.58984 8.92 3.58984 5.75C3.58984 2.58 6.16984 0 9.33984 0C12.5098 0 15.0898 2.58 15.0898 5.75C15.0898 8.92 12.5098 11.5 9.33984 11.5ZM9.33984 1.5C6.99984 1.5 5.08984 3.41 5.08984 5.75C5.08984 8.09 6.99984 10 9.33984 10C11.6798 10 13.5898 8.09 13.5898 5.75C13.5898 3.41 11.6798 1.5 9.33984 1.5Z"
        fill={color}
      />
      <Path
        d="M17.93 21.5C17.52 21.5 17.18 21.16 17.18 20.75C17.18 17.3 13.66 14.5 9.34 14.5C5.02 14.5 1.5 17.3 1.5 20.75C1.5 21.16 1.16 21.5 0.75 21.5C0.34 21.5 0 21.16 0 20.75C0 16.48 4.19 13 9.34 13C14.49 13 18.68 16.48 18.68 20.75C18.68 21.16 18.34 21.5 17.93 21.5Z"
        fill={color}
      />
    </Svg>
  );
}

// 4. Focus Icon (Clock from Figma: viewBox: 0 0 24 24)
function FocusIcon({
  color = "white",
  size = 24,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 6V12L16 14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// --- Your HomeIcon, CalendarIcon, ProfileIcon and FocusIcon stay exactly as they are ---

export default function AppTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const [isModalVisible, setModalVisible] = useState(false);

  const hiddenRoutes = [
    "/",
    "/index",
    "/onboarding",
    "/start",
    "/login",
    "/register",
    "/fingerprint",
  ];

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  const isHomeActive = pathname === "/home";
  const isCalendarActive = pathname === "/calender";
  const isFocusActive = pathname === "/focus";
  const isProfileActive = pathname === "/profile";

  const activeColor = "#FFFFFF";
  const inactiveColor = "rgba(255,255,255,0.5)";

  const handleOpenModal = () => {
    setModalVisible(true);
  };
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <View
        style={{
          width: "100%",
          height: 100 + insets.bottom,
          position: "relative",
        }}
      >
        {/* Background */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 100 + insets.bottom,
            backgroundColor: "#363636",
          }}
        />

        {/* Navigation */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 24,
            height: 76,
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          {/* HOME */}
          <Pressable
            onPress={() => router.replace("/home")}
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <HomeIcon
              size={24}
              color={isHomeActive ? activeColor : inactiveColor}
            />

            <Text
              style={{
                marginTop: 2,
                fontSize: 12,
                lineHeight: 18,
                color: isHomeActive ? activeColor : inactiveColor,
              }}
            >
              Index
            </Text>
          </Pressable>

          {/* CALENDAR */}
          <Pressable
            onPress={() => router.replace("/calender")}
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <CalendarIcon
              size={24}
              color={isCalendarActive ? activeColor : inactiveColor}
            />

            <Text
              style={{
                marginTop: 2,
                fontSize: 12,
                lineHeight: 18,
                color: isCalendarActive ? activeColor : inactiveColor,
              }}
            >
              Calendar
            </Text>
          </Pressable>

          {/* ADD BUTTON */}
          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <Pressable
              onPress={() => handleOpenModal()}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "#8687E7",
                marginTop: -58,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 32,
                  fontWeight: "300",
                  lineHeight: 36,
                }}
              >
                +
              </Text>
            </Pressable>
          </View>

          {/* FOCUS */}
          <Pressable
            onPress={() => router.replace("/focus")}
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <FocusIcon
              size={24}
              color={isFocusActive ? activeColor : inactiveColor}
            />

            <Text
              style={{
                marginTop: 2,
                fontSize: 12,
                lineHeight: 18,
                color: isFocusActive ? activeColor : inactiveColor,
              }}
            >
              Focuse
            </Text>
          </Pressable>

          {/* PROFILE */}
          <Pressable
            onPress={() => router.replace("/profile")}
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <ProfileIcon
              size={24}
              color={isProfileActive ? activeColor : inactiveColor}
            />

            <Text
              style={{
                marginTop: 2,
                fontSize: 12,
                lineHeight: 18,
                color: isProfileActive ? activeColor : inactiveColor,
              }}
            >
              Profile
            </Text>
          </Pressable>
        </View>
      </View>
      {isModalVisible && <AddATask onClose={handleCloseModal} />}
    </>
  );
}

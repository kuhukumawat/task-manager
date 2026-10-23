import DefaultProfileImage from "@/assets/image.png";
import { Task, User } from "@/types/interface";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "@/context/SettingsContext";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Sample cool avatar presets for quick selection
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
];

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { themeColor, fontScale, t } = useSettings();

  // User State
  const [user, setUser] = useState<User | null>(null);
  const [tasksLeftCount, setTasksLeftCount] = useState(10);
  const [tasksDoneCount, setTasksDoneCount] = useState(5);

  // Modals visibility
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // Form Inputs
  const [newName, setNewName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("", message);
    }
  };

  // Load User and Task stats from AsyncStorage
  const loadUserData = useCallback(async () => {
    try {
      // 1. Load User
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setNewName(parsedUser.name || parsedUser.identifier || "Martha Hays");
      } else {
        const defaultUser: User = {
          identifier: "Martha Hays",
          email: "marthahays@example.com",
          password: "password123",
          name: "Martha Hays",
          isLoggedIn: true,
        };
        setUser(defaultUser);
        setNewName("Martha Hays");
      }

      // 2. Load Tasks stats
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        const tasks: Task[] = JSON.parse(storedTasks);
        const left = tasks.filter((t) => !t.completed).length;
        const done = tasks.filter((t) => t.completed).length;
        setTasksLeftCount(left || 10);
        setTasksDoneCount(done || 5);
      }
    } catch (error) {
      console.log("Error loading profile data:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData]),
  );

  // Save new account name
  const handleSaveName = async () => {
    if (!newName.trim()) {
      showToast("Please enter a valid name");
      return;
    }
    try {
      const updatedUser: User = {
        ...(user || {
          identifier: newName.trim(),
          email: "user@example.com",
          password: "password123",
        }),
        name: newName.trim(),
        identifier: newName.trim(),
      };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsNameModalVisible(false);
      showToast("Account name updated successfully!");
    } catch (err) {
      console.log("Error updating name:", err);
      showToast("Failed to update name");
    }
  };

  // Change password
  const handleSavePassword = async () => {
    setPasswordError("");
    if (!oldPassword.trim() || !newPassword.trim()) {
      setPasswordError("Please fill in both fields");
      return;
    }

    if (user && user.password && user.password !== oldPassword.trim()) {
      setPasswordError("Old password is incorrect");
      return;
    }

    if (newPassword.trim().length < 4) {
      setPasswordError("New password must be at least 4 characters");
      return;
    }

    try {
      const updatedUser: User = {
        ...(user || {
          identifier: "Martha Hays",
          email: "user@example.com",
        }),
        password: newPassword.trim(),
      };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setOldPassword("");
      setNewPassword("");
      setIsPasswordModalVisible(false);
      showToast("Password updated successfully!");
    } catch (err) {
      console.log("Error updating password:", err);
      setPasswordError("Failed to update password");
    }
  };

  // Change avatar image
  const handleSelectAvatar = async (avatarUri: string) => {
    try {
      const updatedUser: User = {
        ...(user || {
          identifier: "Martha Hays",
          email: "user@example.com",
          password: "password123",
        }),
        avatarUri,
      };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsImageModalVisible(false);
      showToast("Profile image updated!");
    } catch (err) {
      console.log("Error updating profile image:", err);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      if (user) {
        const updatedUser: User = { ...user, isLoggedIn: false };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      }
      setIsLogoutModalVisible(false);
      router.replace("/login");
    } catch (err) {
      console.log("Error logging out:", err);
    }
  };

  const displayName = user?.name || user?.identifier || "Martha Hays";

  return (
    <View className="flex-1 bg-[#121212] pt-16">
      {/* Top Header */}
      <View className="h-10 items-center justify-center">
        <Text
          style={{
            fontFamily: "Lato",
            fontSize: Math.round(20 * fontScale),
            lineHeight: Math.round(22 * fontScale),
            color: "rgba(255, 255, 255, 0.87)",
            letterSpacing: -0.5,
          }}
          className="font-normal text-center"
        >
          {t("profile_title", "Profile")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: insets.bottom + 120,
        }}
        className="flex-1"
      >
        {/* Profile Avatar & Name */}
        <View className="items-center">
          <Pressable
            onPress={() => setIsImageModalVisible(true)}
            className="relative active:opacity-85"
          >
            <View
              className="h-[85px] w-[85px] overflow-hidden rounded-full border-2 bg-[#363636]"
              style={{ borderColor: themeColor }}
            >
              {user?.avatarUri ? (
                <Image
                  source={{ uri: user.avatarUri }}
                  style={{ width: 85, height: 85 }}
                  contentFit="cover"
                />
              ) : (
                <Image
                  source={DefaultProfileImage}
                  style={{ width: 85, height: 85 }}
                  contentFit="cover"
                />
              )}
            </View>
            {/* Camera badge icon */}
            <View
              className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: themeColor }}
            >
              <Ionicons name="camera" size={13} color="#FFFFFF" />
            </View>
          </Pressable>

          <Text
            style={{
              fontFamily: "Lato",
              fontSize: 20,
              lineHeight: 30,
              fontWeight: "500",
              color: "rgba(255, 255, 255, 0.87)",
              marginTop: 10,
            }}
            className="text-center"
          >
            {displayName}
          </Text>
        </View>

        {/* Task Counters: Frame 202 & Frame 203 */}
        <View className="mt-6 flex-row items-center justify-between gap-3">
          {/* Card 1: Task left */}
          <View className="h-[58px] flex-1 items-center justify-center rounded-[4px] bg-[#363636]">
            <Text
              style={{
                fontFamily: "Lato",
                fontSize: Math.round(16 * fontScale),
                lineHeight: Math.round(24 * fontScale),
                color: "#FFFFFF",
              }}
              className="font-normal"
            >
              {tasksLeftCount} {t("task_left", "Task left")}
            </Text>
          </View>

          {/* Card 2: Task done */}
          <View className="h-[58px] flex-1 items-center justify-center rounded-[4px] bg-[#363636]">
            <Text
              style={{
                fontFamily: "Lato",
                fontSize: Math.round(16 * fontScale),
                lineHeight: Math.round(24 * fontScale),
                color: "#FFFFFF",
              }}
              className="font-normal"
            >
              {tasksDoneCount} {t("task_done", "Task done")}
            </Text>
          </View>
        </View>

        {/* Section 1: Settings */}
        <View className="mt-8">
          <Text
            style={{
              fontFamily: "Lato",
              fontSize: Math.round(14 * fontScale),
              lineHeight: Math.round(21 * fontScale),
              color: "#AFAFAF",
            }}
            className="font-normal"
          >
            {t("section_settings", "Settings")}
          </Text>

          {/* Group 333 / App Settings */}
          <Pressable
            onPress={() => router.push("/settings")}
            className="mt-3 h-12 flex-row items-center justify-between rounded-[4px] active:bg-white/5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="settings-outline"
                size={24}
                color="rgba(255, 255, 255, 0.87)"
              />
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: Math.round(16 * fontScale),
                  lineHeight: Math.round(24 * fontScale),
                  color: "rgba(255, 255, 255, 0.87)",
                }}
                className="font-normal"
              >
                {t("app_settings", "App Settings")}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="rgba(255, 255, 255, 0.87)"
            />
          </Pressable>
        </View>

        {/* Section 2: Account */}
        <View className="mt-6">
          <Text
            style={{
              fontFamily: "Lato",
              fontSize: Math.round(14 * fontScale),
              lineHeight: Math.round(21 * fontScale),
              color: "#AFAFAF",
            }}
            className="font-normal"
          >
            {t("section_account", "Account")}
          </Text>

          {/* Group 316 / Change account name */}
          <Pressable
            onPress={() => {
              setNewName(displayName);
              setIsNameModalVisible(true);
            }}
            className="mt-3 h-12 flex-row items-center justify-between rounded-[4px] active:bg-white/5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="person-outline"
                size={24}
                color="rgba(255, 255, 255, 0.87)"
              />
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: Math.round(16 * fontScale),
                  lineHeight: Math.round(24 * fontScale),
                  color: "rgba(255, 255, 255, 0.87)",
                }}
                className="font-normal"
              >
                {t("change_account_name", "Change account name")}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="rgba(255, 255, 255, 0.87)"
            />
          </Pressable>

          {/* Group 317 / Change account password */}
          <Pressable
            onPress={() => {
              setOldPassword("");
              setNewPassword("");
              setPasswordError("");
              setIsPasswordModalVisible(true);
            }}
            className="mt-2 h-12 flex-row items-center justify-between rounded-[4px] active:bg-white/5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="key-outline"
                size={24}
                color="rgba(255, 255, 255, 0.87)"
              />
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: Math.round(16 * fontScale),
                  lineHeight: Math.round(24 * fontScale),
                  color: "rgba(255, 255, 255, 0.87)",
                }}
                className="font-normal"
              >
                {t("change_account_password", "Change account password")}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="rgba(255, 255, 255, 0.87)"
            />
          </Pressable>

          {/* Group 318 / Change account Image */}
          <Pressable
            onPress={() => setIsImageModalVisible(true)}
            className="mt-2 h-12 flex-row items-center justify-between rounded-[4px] active:bg-white/5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="camera-outline"
                size={24}
                color="rgba(255, 255, 255, 0.87)"
              />
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: Math.round(16 * fontScale),
                  lineHeight: Math.round(24 * fontScale),
                  color: "rgba(255, 255, 255, 0.87)",
                }}
                className="font-normal"
              >
                {t("change_account_image", "Change account Image")}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="rgba(255, 255, 255, 0.87)"
            />
          </Pressable>
        </View>

        {/* Section 3: Uptodo */}
        <View className="mt-6">
          <Text
            style={{
              fontFamily: "Lato",
              fontSize: Math.round(14 * fontScale),
              lineHeight: Math.round(21 * fontScale),
              color: "#AFAFAF",
            }}
            className="font-normal"
          >
            {t("section_uptodo", "Uptodo")}
          </Text>

          {/* Group 325 / About US */}
          <Pressable
            onPress={() =>
              setInfoModalContent({
                title: t("about_us", "About US"),
                description:
                  "Uptodo is your smart companion to manage tasks, boost daily focus, and organize your schedule effortlessly.",
              })
            }
            className="mt-3 h-12 flex-row items-center justify-between rounded-[4px] active:bg-white/5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="grid-outline"
                size={24}
                color="rgba(255, 255, 255, 0.87)"
              />
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: Math.round(16 * fontScale),
                  lineHeight: Math.round(24 * fontScale),
                  color: "rgba(255, 255, 255, 0.87)",
                }}
                className="font-normal"
              >
                {t("about_us", "About US")}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="rgba(255, 255, 255, 0.87)"
            />
          </Pressable>

          {/* Group 324 / FAQ */}
          <Pressable
            onPress={() =>
              setInfoModalContent({
                title: t("faq", "FAQ"),
                description:
                  "1. How to create tasks? Tap the '+' button on the bottom navigation bar.\n\n2. How does focus mode work? Use the circular timer to track concentration periods without distractions.",
              })
            }
            className="mt-2 h-12 flex-row items-center justify-between rounded-[4px] active:bg-white/5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="rgba(255, 255, 255, 0.87)"
              />
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: Math.round(16 * fontScale),
                  lineHeight: Math.round(24 * fontScale),
                  color: "rgba(255, 255, 255, 0.87)",
                }}
                className="font-normal"
              >
                {t("faq", "FAQ")}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="rgba(255, 255, 255, 0.87)"
            />
          </Pressable>

          {/* Group 323 / Help & Feedback */}
          <Pressable
            onPress={() =>
              setInfoModalContent({
                title: t("help_feedback", "Help & Feedback"),
                description:
                  "We love hearing from you! Please reach out to support@uptodo.app with any suggestions or questions.",
              })
            }
            className="mt-2 h-12 flex-row items-center justify-between rounded-[4px] active:bg-white/5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="flash-outline"
                size={24}
                color="rgba(255, 255, 255, 0.87)"
              />
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: Math.round(16 * fontScale),
                  lineHeight: Math.round(24 * fontScale),
                  color: "rgba(255, 255, 255, 0.87)",
                }}
                className="font-normal"
              >
                {t("help_feedback", "Help & Feedback")}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="rgba(255, 255, 255, 0.87)"
            />
          </Pressable>

          {/* Group 322 / Support US */}
          <Pressable
            onPress={() =>
              setInfoModalContent({
                title: t("support_us", "Support US"),
                description:
                  "Thank you for using Uptodo! Rate us 5 stars on the App Store or share with your friends to support our journey.",
              })
            }
            className="mt-2 h-12 flex-row items-center justify-between rounded-[4px] active:bg-white/5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="thumbs-up-outline"
                size={24}
                color="rgba(255, 255, 255, 0.87)"
              />
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: Math.round(16 * fontScale),
                  lineHeight: Math.round(24 * fontScale),
                  color: "rgba(255, 255, 255, 0.87)",
                }}
                className="font-normal"
              >
                {t("support_us", "Support US")}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="rgba(255, 255, 255, 0.87)"
            />
          </Pressable>
        </View>

        {/* Group 314: Log out */}
        <Pressable
          onPress={() => setIsLogoutModalVisible(true)}
          className="mt-8 h-12 flex-row items-center gap-2.5 active:opacity-75"
        >
          <Ionicons name="log-out-outline" size={24} color="#FF4949" />
          <Text
            style={{
              fontFamily: "Lato",
              fontSize: Math.round(16 * fontScale),
              lineHeight: Math.round(24 * fontScale),
              color: "#FF4949",
            }}
            className="font-normal"
          >
            {t("log_out", "Log out")}
          </Text>
        </Pressable>
      </ScrollView>

      {/* ---------------- MODALS (Per Figma Spec) ---------------- */}

      {/* Modal 1: Group 330 - Change Account Name Modal */}
      <Modal
        visible={isNameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNameModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/75 px-6">
          <View className="w-full max-w-[327px] rounded-[4px] bg-[#363636] p-5">
            <Text
              style={{
                fontFamily: "Lato",
                fontSize: 16,
                lineHeight: 24,
                color: "rgba(255, 255, 255, 0.87)",
              }}
              className="font-bold text-center"
            >
              Change account name
            </Text>

            {/* Divider */}
            <View className="my-3.5 h-[1px] w-full bg-[#979797]/40" />

            {/* Name Input Field */}
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              placeholderTextColor="#979797"
              className="h-[43px] w-full rounded-[4px] border border-[#979797] px-3.5 text-base text-white"
              style={{ fontFamily: "Lato" }}
            />

            {/* Action Buttons */}
            <View className="mt-5 flex-row items-center gap-3">
              <Pressable
                onPress={() => setIsNameModalVisible(false)}
                className="h-12 flex-1 items-center justify-center rounded-[4px] active:opacity-70"
              >
                <Text
                  style={{
                    fontFamily: "Lato",
                    fontSize: 16,
                    lineHeight: 24,
                    color: themeColor,
                  }}
                  className="font-normal"
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveName}
                style={{ backgroundColor: themeColor }}
                className="h-12 flex-1 items-center justify-center rounded-[4px] active:opacity-85"
              >
                <Text
                  style={{
                    fontFamily: "Lato",
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#FFFFFF",
                  }}
                  className="font-normal"
                >
                  Edit
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Group 331 - Change Account Password Modal */}
      <Modal
        visible={isPasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/75 px-6">
          <View className="w-full max-w-[327px] rounded-[4px] bg-[#363636] p-5">
            <Text
              style={{
                fontFamily: "Lato",
                fontSize: 16,
                lineHeight: 24,
                color: "rgba(255, 255, 255, 0.87)",
              }}
              className="font-bold text-center"
            >
              Change account Password
            </Text>

            {/* Divider */}
            <View className="my-3.5 h-[1px] w-full bg-[#979797]/40" />

            {/* Error Message if any */}
            {!!passwordError && (
              <Text className="mb-2 text-xs text-[#FF4949]">
                {passwordError}
              </Text>
            )}

            {/* Enter old password */}
            <Text
              style={{
                fontFamily: "Lato",
                fontSize: 14,
                lineHeight: 21,
                color: "rgba(255, 255, 255, 0.87)",
                marginBottom: 6,
              }}
              className="font-normal"
            >
              Enter old password
            </Text>
            <TextInput
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              placeholder="••••••••••••"
              placeholderTextColor="#979797"
              className="mb-4 h-12 w-full rounded-[4px] border border-[#979797] px-3.5 text-base text-white"
            />

            {/* Enter new password */}
            <Text
              style={{
                fontFamily: "Lato",
                fontSize: 14,
                lineHeight: 21,
                color: "rgba(255, 255, 255, 0.87)",
                marginBottom: 6,
              }}
              className="font-normal"
            >
              Enter new password
            </Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="••••••••••••"
              placeholderTextColor="#979797"
              className="h-12 w-full rounded-[4px] border border-[#979797] px-3.5 text-base text-white"
            />

            {/* Action Buttons */}
            <View className="mt-5 flex-row items-center gap-3">
              <Pressable
                onPress={() => setIsPasswordModalVisible(false)}
                className="h-12 flex-1 items-center justify-center rounded-[4px] active:opacity-70"
              >
                <Text
                  style={{
                    fontFamily: "Lato",
                    fontSize: 16,
                    lineHeight: 24,
                    color: themeColor,
                  }}
                  className="font-normal"
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSavePassword}
                style={{ backgroundColor: themeColor }}
                className="h-12 flex-1 items-center justify-center rounded-[4px] active:opacity-85"
              >
                <Text
                  style={{
                    fontFamily: "Lato",
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#FFFFFF",
                  }}
                  className="font-normal"
                >
                  Edit
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Group 332 - Change Account Image Bottom Sheet */}
      <Modal
        visible={isImageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <Pressable
          onPress={() => setIsImageModalVisible(false)}
          className="flex-1 justify-end bg-black/75"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full rounded-t-[16px] bg-[#363636] px-6 pt-4 pb-10"
          >
            <Text
              style={{
                fontFamily: "Lato",
                fontSize: 16,
                lineHeight: 24,
                color: "rgba(255, 255, 255, 0.87)",
              }}
              className="font-bold text-center"
            >
              Change account Image
            </Text>

            <View className="my-3.5 h-[1px] w-full bg-[#979797]/40" />

            {/* Options per Figma */}
            {/* Group 319 / Take picture */}
            <Pressable
              onPress={() => {
                handleSelectAvatar(AVATAR_PRESETS[0]);
              }}
              className="h-12 flex-row items-center gap-3 active:opacity-75"
            >
              <Ionicons
                name="camera-outline"
                size={22}
                color="rgba(255, 255, 255, 0.87)"
              />
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.87)",
                }}
                className="font-normal"
              >
                Take picture
              </Text>
            </Pressable>

            {/* Group 320 / Import from gallery */}
            <Pressable
              onPress={() => {
                handleSelectAvatar(AVATAR_PRESETS[1]);
              }}
              className="h-12 flex-row items-center gap-3 active:opacity-75"
            >
              <Ionicons
                name="images-outline"
                size={22}
                color="rgba(255, 255, 255, 0.87)"
              />
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.87)",
                }}
                className="font-normal"
              >
                Import from gallery
              </Text>
            </Pressable>

            {/* Group 321 / Import from Google Drive */}
            <Pressable
              onPress={() => {
                handleSelectAvatar(AVATAR_PRESETS[2]);
              }}
              className="h-12 flex-row items-center gap-3 active:opacity-75"
            >
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color="rgba(255, 255, 255, 0.87)"
              />
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.87)",
                }}
                className="font-normal"
              >
                Import from Google Drive
              </Text>
            </Pressable>

            {/* Avatar Presets Selection Row */}
            <View className="mt-3">
              <Text className="mb-2 text-xs text-[#AFAFAF]">
                Or select an avatar preset:
              </Text>
              <View className="flex-row items-center justify-between">
                {AVATAR_PRESETS.map((uri, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleSelectAvatar(uri)}
                    className="h-14 w-14 overflow-hidden rounded-full border-2 border-transparent active:border-[#8687E7]"
                  >
                    <Image
                      source={{ uri }}
                      style={{ width: 56, height: 56 }}
                      contentFit="cover"
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal 4: Generic Info Dialog for Uptodo Items */}
      {infoModalContent && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setInfoModalContent(null)}
        >
          <View className="flex-1 items-center justify-center bg-black/75 px-6">
            <View className="w-full max-w-[327px] rounded-2xl bg-[#363636] p-5">
              <Text className="text-lg font-bold text-white">
                {infoModalContent.title}
              </Text>
              <Text className="mt-3 text-sm leading-6 text-white/80">
                {infoModalContent.description}
              </Text>

              <Pressable
                onPress={() => setInfoModalContent(null)}
                style={{ backgroundColor: themeColor }}
                className="mt-6 h-10 items-center justify-center rounded-[4px] active:opacity-85"
              >
                <Text className="font-semibold text-white">Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal 5: Log Out Confirmation Dialog */}
      <Modal
        visible={isLogoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/75 px-6">
          <View className="w-full max-w-[327px] rounded-[4px] bg-[#363636] p-5">
            <Text className="text-base font-bold text-white text-center">
              Log out
            </Text>
            <View className="my-3 h-[1px] w-full bg-[#979797]/40" />

            <Text className="my-2 text-sm text-center text-white/80">
              Are you sure you want to log out of your account?
            </Text>

            <View className="mt-5 flex-row items-center gap-3">
              <Pressable
                onPress={() => setIsLogoutModalVisible(false)}
                className="h-12 flex-1 items-center justify-center rounded-[4px] active:opacity-70"
              >
                <Text style={{ color: themeColor }} className="text-base">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                className="h-12 flex-1 items-center justify-center rounded-[4px] bg-[#FF4949] active:opacity-85"
              >
                <Text className="text-base font-semibold text-white">
                  Log out
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

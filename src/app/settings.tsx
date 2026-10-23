import {
  LANGUAGE_OPTIONS,
  LanguageOption,
  SAMPLE_GOOGLE_EVENTS,
  THEME_COLORS,
  TYPOGRAPHY_OPTIONS,
  TypographyOption,
  useSettings,
} from "@/context/SettingsContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const {
    themeColor,
    setThemeColor,
    typography,
    fontScale,
    setTypography,
    language,
    setLanguage,
    t,
    importGoogleCalendar,
  } = useSettings();

  // Modals state
  const [isColorModalVisible, setIsColorModalVisible] = useState(false);
  const [isTypographyModalVisible, setIsTypographyModalVisible] =
    useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);

  // Google Calendar import selection state
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(
    SAMPLE_GOOGLE_EVENTS.map((e) => e.id),
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("", message);
    }
  };

  const handleSelectColor = async (hex: string) => {
    await setThemeColor(hex);
    setIsColorModalVisible(false);
    showToast(t("color_saved", "Theme color updated!"));
  };

  const handleSelectTypography = async (id: TypographyOption) => {
    await setTypography(id);
    setIsTypographyModalVisible(false);
    showToast(t("typo_saved", "Typography updated!"));
  };

  const handleSelectLanguage = async (id: LanguageOption) => {
    await setLanguage(id);
    setIsLanguageModalVisible(false);
    showToast(t("lang_saved", "Language updated!"));
  };

  const toggleEventSelection = (id: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedEventIds.length === SAMPLE_GOOGLE_EVENTS.length) {
      setSelectedEventIds([]);
    } else {
      setSelectedEventIds(SAMPLE_GOOGLE_EVENTS.map((e) => e.id));
    }
  };

  const handleRunCalendarImport = async () => {
    if (selectedEventIds.length === 0) {
      showToast("Please select at least 1 event to import.");
      return;
    }
    setIsSyncing(true);
    try {
      const count = await importGoogleCalendar(selectedEventIds);
      setIsSyncing(false);
      setIsImportModalVisible(false);
      showToast(
        `${count} ${t("events_imported", "events imported to Uptodo!")}`,
      );
    } catch {
      setIsSyncing(false);
      showToast("Failed to import events.");
    }
  };

  const currentColorName =
    THEME_COLORS.find((c) => c.hex === themeColor)?.name || "Default Purple";
  const currentTypoName =
    TYPOGRAPHY_OPTIONS.find((t) => t.id === typography)?.name ||
    "Lato (Default)";
  const currentLangName =
    LANGUAGE_OPTIONS.find((l) => l.id === language)?.name || "English";

  return (
    <View className="flex-1 bg-[#121212] pt-16">
      {/* Top Header with Back Button */}
      <View className="h-12 flex-row items-center justify-between px-6">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="h-12 w-10 items-center justify-center -ml-2 rounded-full active:bg-white/10"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color="rgba(255, 255, 255, 0.87)"
          />
        </Pressable>

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
          {t("settings_title", "Settings")}
        </Text>

        {/* Placeholder to balance header back button */}
        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
        }}
        className="flex-1"
      >
        {/* Section 1: Settings */}
        <View>
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

          {/* Group 326: Change app color */}
          <Pressable
            onPress={() => setIsColorModalVisible(true)}
            className="mt-3 h-12 flex-row items-center justify-between rounded-[4px] active:bg-white/5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="color-palette-outline"
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
                {t("change_app_color", "Change app color")}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <View
                className="h-4 w-4 rounded-full border border-white/20"
                style={{ backgroundColor: themeColor }}
              />
              <Text
                style={{ fontSize: Math.round(12 * fontScale) }}
                className="text-[#AFAFAF]"
              >
                {currentColorName}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color="rgba(255, 255, 255, 0.87)"
              />
            </View>
          </Pressable>

          {/* Group 327: Change app typography */}
          <Pressable
            onPress={() => setIsTypographyModalVisible(true)}
            className="mt-2 h-12 flex-row items-center justify-between rounded-[4px] active:bg-white/5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="text-outline"
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
                {t("change_app_typography", "Change app typography")}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <Text
                style={{ fontSize: Math.round(12 * fontScale) }}
                className="text-[#AFAFAF]"
              >
                {currentTypoName}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color="rgba(255, 255, 255, 0.87)"
              />
            </View>
          </Pressable>

          {/* Group 328: Change app language */}
          <Pressable
            onPress={() => setIsLanguageModalVisible(true)}
            className="mt-2 h-12 flex-row items-center justify-between rounded-[4px] active:bg-white/5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="language-outline"
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
                {t("change_app_language", "Change app language")}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <Text
                style={{ fontSize: Math.round(12 * fontScale) }}
                className="text-[#AFAFAF]"
              >
                {currentLangName}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color="rgba(255, 255, 255, 0.87)"
              />
            </View>
          </Pressable>
        </View>

        {/* Section 2: Import */}
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
            {t("section_import", "Import")}
          </Text>

          {/* Group 329: Import from Google calendar */}
          <Pressable
            onPress={() => setIsImportModalVisible(true)}
            className="mt-3 h-12 flex-row items-center justify-between rounded-[4px] active:bg-white/5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name="calendar-outline"
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
                {t("import_google_calendar", "Import from Google calendar")}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="rgba(255, 255, 255, 0.87)"
            />
          </Pressable>
        </View>
      </ScrollView>

      {/* ---------------- MODALS ---------------- */}

      {/* Modal 1: Color Picker */}
      <Modal
        visible={isColorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsColorModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/75 px-6">
          <View className="w-full max-w-[327px] rounded-[8px] bg-[#363636] p-5">
            <Text
              style={{ fontSize: Math.round(16 * fontScale) }}
              className="font-bold text-white text-center"
            >
              {t("modal_color_title", "Change App Color")}
            </Text>
            <View className="my-3.5 h-[1px] w-full bg-[#979797]/40" />

            <View className="gap-2.5">
              {THEME_COLORS.map((color) => {
                const isSelected = themeColor === color.hex;
                return (
                  <Pressable
                    key={color.hex}
                    onPress={() => handleSelectColor(color.hex)}
                    className="flex-row items-center justify-between rounded px-3 py-2.5 active:bg-white/5"
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className="h-6 w-6 rounded-full border border-white/20"
                        style={{ backgroundColor: color.hex }}
                      />
                      <Text
                        style={{ fontSize: Math.round(14 * fontScale) }}
                        className={`${
                          isSelected ? "font-bold text-white" : "text-white/80"
                        }`}
                      >
                        {color.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={themeColor} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => setIsColorModalVisible(false)}
              className="mt-4 h-10 items-center justify-center rounded-[4px] bg-[#272727] active:opacity-75"
            >
              <Text
                style={{ fontSize: Math.round(14 * fontScale) }}
                className="font-medium text-white/90"
              >
                {t("cancel", "Cancel")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Typography Picker */}
      <Modal
        visible={isTypographyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTypographyModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/75 px-6">
          <View className="w-full max-w-[327px] rounded-[8px] bg-[#363636] p-5">
            <Text
              style={{ fontSize: Math.round(16 * fontScale) }}
              className="font-bold text-white text-center"
            >
              {t("modal_typo_title", "Change App Typography")}
            </Text>
            <View className="my-3.5 h-[1px] w-full bg-[#979797]/40" />

            <View className="gap-2">
              {TYPOGRAPHY_OPTIONS.map((typo) => {
                const isSelected = typography === typo.id;
                return (
                  <Pressable
                    key={typo.id}
                    onPress={() => handleSelectTypography(typo.id)}
                    className="rounded-[6px] border border-transparent p-3 active:bg-white/5"
                    style={{
                      borderColor: isSelected ? themeColor : "transparent",
                      backgroundColor: isSelected
                        ? "rgba(255,255,255,0.04)"
                        : "transparent",
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        style={{
                          fontSize: Math.round(15 * typo.scale),
                          fontWeight: isSelected ? "bold" : "normal",
                          color: "#FFFFFF",
                        }}
                      >
                        {typo.name}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={themeColor}
                        />
                      )}
                    </View>
                    <Text
                      style={{ fontSize: Math.round(11 * typo.scale) }}
                      className="mt-1 text-[#AFAFAF]"
                    >
                      {typo.description}
                    </Text>
                    <Text
                      style={{ fontSize: Math.round(13 * typo.scale) }}
                      className="mt-1.5 text-white/70 italic"
                    >
                      Sample: {typo.sample}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => setIsTypographyModalVisible(false)}
              className="mt-4 h-10 items-center justify-center rounded-[4px] bg-[#272727] active:opacity-75"
            >
              <Text
                style={{ fontSize: Math.round(14 * fontScale) }}
                className="font-medium text-white/90"
              >
                {t("cancel", "Cancel")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Language Picker */}
      <Modal
        visible={isLanguageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/75 px-6">
          <View className="w-full max-w-[327px] rounded-[8px] bg-[#363636] p-5">
            <Text
              style={{ fontSize: Math.round(16 * fontScale) }}
              className="font-bold text-white text-center"
            >
              {t("modal_lang_title", "Change App Language")}
            </Text>
            <View className="my-3.5 h-[1px] w-full bg-[#979797]/40" />

            <View className="gap-2">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = language === lang.id;
                return (
                  <Pressable
                    key={lang.id}
                    onPress={() => handleSelectLanguage(lang.id)}
                    className="flex-row items-center justify-between rounded px-3 py-2.5 active:bg-white/5"
                  >
                    <View>
                      <Text
                        style={{ fontSize: Math.round(14 * fontScale) }}
                        className={`${
                          isSelected ? "font-bold text-white" : "text-white/80"
                        }`}
                      >
                        {lang.name}
                      </Text>
                      <Text
                        style={{ fontSize: Math.round(12 * fontScale) }}
                        className="text-[#AFAFAF]"
                      >
                        {lang.native}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={themeColor} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => setIsLanguageModalVisible(false)}
              className="mt-4 h-10 items-center justify-center rounded-[4px] bg-[#272727] active:opacity-75"
            >
              <Text
                style={{ fontSize: Math.round(14 * fontScale) }}
                className="font-medium text-white/90"
              >
                {t("cancel", "Cancel")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal 4: Google Calendar Import Modal */}
      <Modal
        visible={isImportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isSyncing && setIsImportModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/75 px-6">
          <View className="w-full max-w-[340px] rounded-[10px] bg-[#363636] p-5">
            {/* Header */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text
                  style={{ fontSize: Math.round(16 * fontScale) }}
                  className="font-bold text-white"
                >
                  {t("modal_import_title", "Import Google Calendar")}
                </Text>
              </View>
              <Pressable
                disabled={isSyncing}
                onPress={() => setIsImportModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={20} color="#AFAFAF" />
              </Pressable>
            </View>

            <View className="my-3 h-[1px] w-full bg-[#979797]/40" />

            {/* Connected Account status */}
            <View className="mb-3 flex-row items-center justify-between rounded-md bg-[#272727] px-3 py-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="mail-outline" size={16} color="#AFAFAF" />
                <Text
                  style={{ fontSize: Math.round(12 * fontScale) }}
                  className="text-white/90"
                >
                  user@gmail.com
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="h-2 w-2 rounded-full bg-[#41B883]" />
                <Text
                  style={{ fontSize: Math.round(11 * fontScale) }}
                  className="text-[#41B883]"
                >
                  {t("connected", "Connected")}
                </Text>
              </View>
            </View>

            <View className="mb-2 flex-row items-center justify-between">
              <Text
                style={{ fontSize: Math.round(13 * fontScale) }}
                className="text-white/90 font-medium"
              >
                Events to sync:
              </Text>
              <Pressable onPress={toggleSelectAll}>
                <Text
                  style={{
                    color: themeColor,
                    fontSize: Math.round(12 * fontScale),
                  }}
                  className="font-medium"
                >
                  {selectedEventIds.length === SAMPLE_GOOGLE_EVENTS.length
                    ? t("deselect_all", "Deselect All")
                    : t("select_all", "Select All")}
                </Text>
              </Pressable>
            </View>

            {/* Events List */}
            <View className="gap-2">
              {SAMPLE_GOOGLE_EVENTS.map((item) => {
                const isSelected = selectedEventIds.includes(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleEventSelection(item.id)}
                    className="flex-row items-center justify-between rounded-lg border border-white/10 bg-[#272727] p-2.5 active:bg-white/5"
                  >
                    <View className="flex-1 pr-2">
                      <Text
                        numberOfLines={1}
                        style={{ fontSize: Math.round(13 * fontScale) }}
                        className="font-medium text-white"
                      >
                        {item.title}
                      </Text>
                      <View className="mt-1 flex-row items-center gap-2">
                        <Text
                          style={{ fontSize: Math.round(11 * fontScale) }}
                          className="text-[#AFAFAF]"
                        >
                          {item.date} • {item.time}
                        </Text>
                        <View
                          className="rounded px-1.5 py-0.5"
                          style={{ backgroundColor: item.category.bg }}
                        >
                          <Text className="text-[10px] font-bold text-black">
                            {item.category.name}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Checkbox */}
                    <View
                      className="h-5 w-5 items-center justify-center rounded-[4px] border"
                      style={{
                        borderColor: isSelected ? themeColor : "#AFAFAF",
                        backgroundColor: isSelected
                          ? themeColor
                          : "transparent",
                      }}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Buttons */}
            <View className="mt-5 flex-row items-center gap-3">
              <Pressable
                disabled={isSyncing}
                onPress={() => setIsImportModalVisible(false)}
                className="h-11 flex-1 items-center justify-center rounded-[4px] bg-[#272727] active:opacity-75"
              >
                <Text
                  style={{ fontSize: Math.round(14 * fontScale) }}
                  className="font-medium text-white/90"
                >
                  {t("cancel", "Cancel")}
                </Text>
              </Pressable>

              <Pressable
                disabled={isSyncing}
                onPress={handleRunCalendarImport}
                className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-[4px] active:opacity-85"
                style={{ backgroundColor: themeColor }}
              >
                {isSyncing ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text
                      style={{ fontSize: Math.round(13 * fontScale) }}
                      className="font-medium text-white"
                    >
                      {t("syncing", "Syncing...")}
                    </Text>
                  </>
                ) : (
                  <Text
                    style={{ fontSize: Math.round(13 * fontScale) }}
                    className="font-medium text-white"
                  >
                    {t("import_btn", "Import Events")} (
                    {selectedEventIds.length})
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

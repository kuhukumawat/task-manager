import AsyncStorage from "@react-native-async-storage/async-storage";
import { rem, vars } from "nativewind";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform, View, ViewStyle } from "react-native";
import translationsData from "../../language/translation.json";
import { Task } from "@/types/interface";

export type TypographyOption = "lato" | "compact" | "large";
export type LanguageOption = "en" | "es" | "fr" | "de" | "hi";

export interface ThemeColorItem {
  name: string;
  hex: string;
}

export const THEME_COLORS: ThemeColorItem[] = [
  { name: "Default Purple", hex: "#8687E7" },
  { name: "Ocean Blue", hex: "#47ACDF" },
  { name: "Emerald Green", hex: "#41B883" },
  { name: "Sunset Orange", hex: "#FB8A2E" },
  { name: "Rose Pink", hex: "#E2425C" },
];

export const TYPOGRAPHY_OPTIONS = [
  {
    id: "lato" as const,
    name: "Lato (Default)",
    scale: 1.0,
    sample: "Aa Bb Cc 123",
    description: "Standard balanced typography",
  },
  {
    id: "compact" as const,
    name: "Compact Display",
    scale: 0.9,
    sample: "Aa Bb Cc 123",
    description: "High density text for maximum screen content",
  },
  {
    id: "large" as const,
    name: "Large Accessible",
    scale: 1.15,
    sample: "Aa Bb Cc 123",
    description: "Higher contrast, larger sizing for readability",
  },
];

export const LANGUAGE_OPTIONS = [
  { id: "en" as const, name: "English (US)", native: "English" },
  { id: "es" as const, name: "Spanish", native: "Español" },
  { id: "fr" as const, name: "French", native: "Français" },
  { id: "de" as const, name: "German", native: "Deutsch" },
  { id: "hi" as const, name: "Hindi", native: "हिन्दी" },
];

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  category: {
    name: string;
    iconColor: string;
    bg?: string;
    background?: string;
  };
  priority: number;
}

export const SAMPLE_GOOGLE_EVENTS: GoogleCalendarEvent[] = [
  {
    id: "gcal-1",
    title: "Sprint Planning & Roadmap Sync",
    description: "Review quarterly objectives and backlog with the team.",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    category: {
      name: "Work",
      iconColor: "#FFFFFF",
      bg: "#FF8080",
      background: "#FF8080",
    },
    priority: 1,
  },
  {
    id: "gcal-2",
    title: "Quarterly Design Critique",
    description: "Review mobile UI interactions and accessibility specs.",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "02:30 PM",
    category: {
      name: "Design",
      iconColor: "#FFFFFF",
      bg: "#809CFF",
      background: "#809CFF",
    },
    priority: 2,
  },
  {
    id: "gcal-3",
    title: "Doctor Appointment & Health Check",
    description: "Annual physical checkup at Central Medical Clinic.",
    date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    time: "04:30 PM",
    category: {
      name: "Health",
      iconColor: "#FFFFFF",
      bg: "#80FFA3",
      background: "#80FFA3",
    },
    priority: 3,
  },
];

const applyTypography = (scale: number) => {
  try {
    rem.set(16 * scale);
  } catch (e) {
    console.log("Error updating rem scale:", e);
  }
};

const applyCssVariable = (color: string) => {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    try {
      document.documentElement.style.setProperty("--color-button", color);
    } catch {}
  }
  try {
    const globalInterop = (globalThis as any).__css_interop;
    if (globalInterop) {
      const rootVar = globalInterop.rootVariables?.get("--color-button");
      if (rootVar && typeof rootVar.set === "function") {
        rootVar.set(color);
      }
      const univVar = globalInterop.universalVariables?.get("--color-button");
      if (univVar && typeof univVar.set === "function") {
        univVar.set(color);
      }
    }
  } catch (e) {
    console.log("Error updating CSS variable:", e);
  }
};

interface SettingsContextValue {
  themeColor: string;
  buttonStyle: ViewStyle;
  setThemeColor: (color: string) => Promise<void>;
  typography: TypographyOption;
  fontScale: number;
  setTypography: (typo: TypographyOption) => Promise<void>;
  language: LanguageOption;
  setLanguage: (lang: LanguageOption) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  importGoogleCalendar: (selectedEventIds?: string[]) => Promise<number>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<string>("#8687E7");
  const [typography, setTypographyState] = useState<TypographyOption>("lato");
  const [language, setLanguageState] = useState<LanguageOption>("en");

  // Load preferences from storage on launch
  useEffect(() => {
    const loadStoredPreferences = async () => {
      try {
        const [savedColor, savedTypo, savedLang] = await Promise.all([
          AsyncStorage.getItem("app_theme_color"),
          AsyncStorage.getItem("app_typography"),
          AsyncStorage.getItem("app_language"),
        ]);
        if (savedColor) {
          setThemeColorState(savedColor);
          applyCssVariable(savedColor);
        } else {
          applyCssVariable("#8687E7");
        }
        if (
          savedTypo === "lato" ||
          savedTypo === "compact" ||
          savedTypo === "large"
        ) {
          setTypographyState(savedTypo);
          const scale =
            savedTypo === "compact" ? 0.9 : savedTypo === "large" ? 1.15 : 1.0;
          applyTypography(scale);
        } else {
          applyTypography(1.0);
        }
        if (
          savedLang === "en" ||
          savedLang === "es" ||
          savedLang === "fr" ||
          savedLang === "de" ||
          savedLang === "hi"
        ) {
          setLanguageState(savedLang);
        }
      } catch (err) {
        console.log("Error loading app settings:", err);
      }
    };
    loadStoredPreferences();
  }, []);

  const setThemeColor = useCallback(async (color: string) => {
    setThemeColorState(color);
    applyCssVariable(color);
    await AsyncStorage.setItem("app_theme_color", color);
  }, []);

  const setTypography = useCallback(async (typo: TypographyOption) => {
    setTypographyState(typo);
    const scale = typo === "compact" ? 0.9 : typo === "large" ? 1.15 : 1.0;
    applyTypography(scale);
    await AsyncStorage.setItem("app_typography", typo);
  }, []);

  const setLanguage = useCallback(async (lang: LanguageOption) => {
    setLanguageState(lang);
    await AsyncStorage.setItem("app_language", lang);
  }, []);

  const fontScale = useMemo(() => {
    switch (typography) {
      case "compact":
        return 0.9;
      case "large":
        return 1.15;
      case "lato":
      default:
        return 1.0;
    }
  }, [typography]);

  const buttonStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: themeColor,
    }),
    [themeColor],
  );

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const allTranslations = translationsData as Record<
        string,
        Record<string, string>
      >;
      const langDict = allTranslations[language] || allTranslations.en;
      return langDict?.[key] || allTranslations.en?.[key] || fallback || key;
    },
    [language],
  );

  // Real Google Calendar Importer: Reads existing tasks from AsyncStorage,
  // creates new unique Task objects, and saves them back to AsyncStorage.
  const importGoogleCalendar = useCallback(
    async (selectedEventIds?: string[]): Promise<number> => {
      try {
        const existingRaw = await AsyncStorage.getItem("tasks");
        const existingTasks: Task[] = existingRaw ? JSON.parse(existingRaw) : [];

        const targetEvents = selectedEventIds
          ? SAMPLE_GOOGLE_EVENTS.filter((e) => selectedEventIds.includes(e.id))
          : SAMPLE_GOOGLE_EVENTS;

        if (targetEvents.length === 0) return 0;

        const newTasks: Task[] = targetEvents.map((event) => ({
          id: `gcal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: event.title,
          description: event.description,
          priority: event.priority,
          category: {
            name: event.category.name,
            iconColor: event.category.iconColor,
            background: event.category.background,
            bg: event.category.bg,
            icon:
              event.category.name === "Work"
                ? "briefcase-outline"
                : event.category.name === "Design"
                  ? "color-palette-outline"
                  : "heart-outline",
          },
          date: event.date,
          time: event.time,
          completed: false,
        }));

        const combinedTasks = [...existingTasks, ...newTasks];
        await AsyncStorage.setItem("tasks", JSON.stringify(combinedTasks));
        return newTasks.length;
      } catch (err) {
        console.log("Error importing google calendar events:", err);
        return 0;
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      themeColor,
      buttonStyle,
      setThemeColor,
      typography,
      fontScale,
      setTypography,
      language,
      setLanguage,
      t,
      importGoogleCalendar,
    }),
    [
      themeColor,
      buttonStyle,
      setThemeColor,
      typography,
      fontScale,
      setTypography,
      language,
      setLanguage,
      t,
      importGoogleCalendar,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      <View
        style={[
          { flex: 1, backgroundColor: "#121212" },
          vars({
            "--color-button": themeColor,
          }),
        ]}
      >
        {children}
      </View>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

import { useSettings } from "@/context/SettingsContext";
import { APP_ICONS } from "@/types/icons";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, SvgXml } from "react-native-svg";

export interface DayStat {
  day: string;
  time: string;
  hours: number;
  height: number;
  isWeekend: boolean;
  dateStr: string;
}

export interface FocusSession {
  id: string;
  date: string; // "YYYY-MM-DD"
  duration: number; // in seconds
  timestamp: number;
}

interface AppUsage {
  id: string;
  name: string;
  duration: string;
  subtitle: string;
  iconBg: string;
  type: "instagram" | "twitter" | "facebook" | "telegram" | "gmail";
}

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

const FILTER_PERIODS = ["This Week", "Today", "This Month"] as const;
type FilterPeriod = (typeof FILTER_PERIODS)[number];

/* ---------------------------- Date & Time Helpers ---------------------------- */

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

const getStartOfWeek = (d: Date) => {
  const copy = new Date(d);
  const day = copy.getDay(); // 0 is Sunday
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const addDays = (d: Date, days: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const formatDailyTime = (totalSec: number) => {
  if (totalSec <= 0) return "0h";
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.round((totalSec % 3600) / 60);
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
};

const formatTotalHoursMinutes = (totalSec: number) => {
  if (totalSec <= 0) return "0h 0m";
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.round((totalSec % 3600) / 60);
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
};

// Seed realistic initial sessions across the current week if none exist in storage
const getInitialSeedSessions = (): FocusSession[] => {
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  const sampleHours = [2.5, 3.5, 5.0, 3.0, 4.0, 4.5, 2.0];
  const sessions: FocusSession[] = [];

  for (let i = 0; i < 7; i++) {
    const day = addDays(startOfWeek, i);
    const hours = sampleHours[i];
    if (hours > 0) {
      sessions.push({
        id: `seed-${toDateStr(day)}`,
        date: toDateStr(day),
        duration: Math.round(hours * 3600),
        timestamp: day.getTime() + 10 * 3600 * 1000,
      });
    }
  }
  return sessions;
};

const APPLICATIONS_DATA: AppUsage[] = [
  {
    id: "app-1",
    name: "Instagram",
    duration: "4h",
    subtitle: "You spent 4h on Instagram today",
    iconBg: "#B13589",
    type: "instagram",
  },
  {
    id: "app-2",
    name: "Twitter",
    duration: "3h",
    subtitle: "You spent 3h on Twitter today",
    iconBg: "#47ACDF",
    type: "twitter",
  },
  {
    id: "app-3",
    name: "Facebook",
    duration: "1h",
    subtitle: "You spent 1h on Facebook today",
    iconBg: "#18ACFE",
    type: "facebook",
  },
  {
    id: "app-4",
    name: "Telegram",
    duration: "30m",
    subtitle: "You spent 30m on Telegram today",
    iconBg: "#37BBFE",
    type: "telegram",
  },
  {
    id: "app-5",
    name: "Gmail",
    duration: "45m",
    subtitle: "You spent 45m on Gmail today",
    iconBg: "#FFFFFF",
    type: "gmail",
  },
];

export default function Focus() {
  const insets = useSafeAreaInsets();
  const { themeColor, fontScale, t } = useSettings();

  // Focus sessions state loaded from AsyncStorage
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  // Focus Timer: starts from 00:00 and counts up as user focuses
  const [seconds, setSeconds] = useState(0);
  const [isFocusing, setIsFocusing] = useState(false);
  const [lastSavedSeconds, setLastSavedSeconds] = useState(0);

  // Overview Bar Chart filter & day selection
  const [selectedPeriod, setSelectedPeriod] =
    useState<FilterPeriod>("This Week");
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(
    new Date().getDay(),
  );

  // App Info Modal
  const [selectedApp, setSelectedApp] = useState<AppUsage | null>(null);

  // Load sessions from AsyncStorage (or seed default data on first launch)
  const loadSessions = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("focus_sessions");
      if (stored) {
        setSessions(JSON.parse(stored));
      } else {
        const seed = getInitialSeedSessions();
        await AsyncStorage.setItem("focus_sessions", JSON.stringify(seed));
        setSessions(seed);
      }
    } catch (err) {
      console.log("Error loading focus sessions:", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions]),
  );

  // Timer Count-up Effect
  useEffect(() => {
    if (!isFocusing) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFocusing]);

  // Format mm:ss (or hh:mm:ss if >= 1 hour)
  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Save new session delta to AsyncStorage and update state
  const saveFocusDuration = async (durationSec: number) => {
    if (durationSec <= 0) return;
    const todayStr = toDateStr(new Date());
    const newSession: FocusSession = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: todayStr,
      duration: durationSec,
      timestamp: Date.now(),
    };
    try {
      const stored = await AsyncStorage.getItem("focus_sessions");
      const currentList: FocusSession[] = stored ? JSON.parse(stored) : [];
      const updated = [...currentList, newSession];
      await AsyncStorage.setItem("focus_sessions", JSON.stringify(updated));
      setSessions(updated);
    } catch (err) {
      console.log("Error saving focus session:", err);
    }
  };

  const handleToggleFocus = async () => {
    if (isFocusing) {
      setIsFocusing(false);
      const delta = seconds - lastSavedSeconds;
      if (delta >= 1) {
        await saveFocusDuration(delta);
        setLastSavedSeconds(seconds);
      }
    } else {
      setIsFocusing(true);
    }
  };

  const handleResetFocus = () => {
    setIsFocusing(false);
    setSeconds(0);
    setLastSavedSeconds(0);
  };

  const handleSelectPeriod = (period: FilterPeriod) => {
    setSelectedPeriod(period);
    setIsPeriodMenuOpen(false);
    if (period === "Today") {
      setSelectedDayIndex(new Date().getDay());
    }
  };

  // SVG Circular progress dimensions (fills smoothly across 1 hour = 3600s)
  const circleRadius = 94;
  const circumference = 2 * Math.PI * circleRadius;
  const maxCycle = 3600; // 1 hour full ring
  const progressRatio = Math.min(1, seconds / maxCycle);
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Dynamically compute DayStat for each day of the week (Sun-Sat) & totals
  const { chartData, totalPeriodSeconds, dailyAverageSeconds } = useMemo(() => {
    const today = new Date();
    const todayStr = toDateStr(today);

    if (selectedPeriod === "This Month") {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      // Filter all sessions in current month
      const monthSessions = sessions.filter((s) => {
        const [y, m] = s.date.split("-").map(Number);
        return y === currentYear && m - 1 === currentMonth;
      });

      const totalMonthSec = monthSessions.reduce(
        (acc, s) => acc + s.duration,
        0,
      );

      // Aggregate by day of week (0 to 6)
      const dayTotals = [0, 0, 0, 0, 0, 0, 0];
      monthSessions.forEach((s) => {
        const [y, m, d] = s.date.split("-").map(Number);
        const dayOfWeek = new Date(y, m - 1, d).getDay();
        dayTotals[dayOfWeek] += s.duration;
      });

      const maxMonthHours = Math.max(6, ...dayTotals.map((sec) => sec / 3600));

      const stats: DayStat[] = DAY_NAMES.map((name, i) => {
        const sec = dayTotals[i];
        const hours = sec / 3600;
        const height =
          hours > 0
            ? Math.max(
                6,
                Math.min(188, Math.round((hours / maxMonthHours) * 188)),
              )
            : 0;

        return {
          day: name,
          time: formatDailyTime(sec),
          hours,
          height,
          isWeekend: i === 0 || i === 6,
          dateStr: "",
        };
      });

      const daysPassed = Math.max(1, today.getDate());

      return {
        chartData: stats,
        totalPeriodSeconds: totalMonthSec,
        dailyAverageSeconds: Math.round(totalMonthSec / daysPassed),
      };
    }

    // "This Week" and "Today" both use the 7 days of the current week (Sun–Sat)
    const startOfWeek = getStartOfWeek(today);
    let totalWeekSec = 0;

    const stats: DayStat[] = DAY_NAMES.map((name, i) => {
      const dayDate = addDays(startOfWeek, i);
      const dateStr = toDateStr(dayDate);
      const daySessions = sessions.filter((s) => s.date === dateStr);
      const sec = daySessions.reduce((acc, s) => acc + s.duration, 0);
      const hours = sec / 3600;
      totalWeekSec += sec;

      // Max chart height is 188px corresponding to 6h scale
      const height =
        hours > 0
          ? Math.max(6, Math.min(188, Math.round((hours / 6) * 188)))
          : 0;

      return {
        day: name,
        time: formatDailyTime(sec),
        hours,
        height,
        isWeekend: i === 0 || i === 6,
        dateStr,
      };
    });

    if (selectedPeriod === "Today") {
      const todaySessions = sessions.filter((s) => s.date === todayStr);
      const todaySec = todaySessions.reduce((acc, s) => acc + s.duration, 0);
      return {
        chartData: stats,
        totalPeriodSeconds: todaySec,
        dailyAverageSeconds: todaySec,
      };
    }

    // "This Week"
    const activeDaysCount = Math.max(1, today.getDay() + 1);
    return {
      chartData: stats,
      totalPeriodSeconds: totalWeekSec,
      dailyAverageSeconds: Math.round(totalWeekSec / activeDaysCount),
    };
  }, [selectedPeriod, sessions]);

  // Render App Brand Icon
  const renderAppIcon = (app: AppUsage) => {
    const xml = APP_ICONS[app.type];
    if (xml) {
      return (
        <View className="h-8 w-8 items-center justify-center overflow-hidden rounded-[6px]">
          <SvgXml xml={xml} width={32} height={32} />
        </View>
      );
    }
    return (
      <View className="h-8 w-8 items-center justify-center rounded-[6px] bg-white/20">
        <Ionicons name="apps" size={18} color="white" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#121212] pt-16">
      {/* Top Header: Focus Mode */}
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
          {t("focus_title", "Focus Mode")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: insets.bottom + 110,
        }}
        className="flex-1"
      >
        {/* Section 1: Circular Focus Timer */}
        <View className="items-center">
          {/* Circular Progress Container (213 x 213 per Figma Ellipse 26/27) */}
          <View className="relative h-[213px] w-[213px] items-center justify-center">
            <Svg width="213" height="213" viewBox="0 0 213 213">
              {/* Ellipse 26: Background Circle */}
              <Circle
                cx="106.5"
                cy="106.5"
                r={circleRadius}
                stroke="#555555"
                strokeWidth="14"
                fill="none"
              />
              {/* Ellipse 27: Primary Color Progress Arc */}
              <Circle
                cx="106.5"
                cy="106.5"
                r={circleRadius}
                stroke={themeColor}
                strokeWidth="14"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 106.5 106.5)"
              />
            </Svg>

            {/* Timer digits overlay */}
            <View className="absolute inset-0 items-center justify-center">
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: 40,
                  lineHeight: 60,
                  fontWeight: "500",
                  color: "rgba(255, 255, 255, 0.87)",
                  textAlign: "center",
                }}
              >
                {formatTimer(seconds)}
              </Text>
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: 12,
                  color: isFocusing ? themeColor : "#AFAFAF",
                  marginTop: -4,
                }}
              >
                {isFocusing ? "FOCUSING" : seconds > 0 ? "PAUSED" : "READY"}
              </Text>
            </View>
          </View>

          {/* Helper caption: While your focus mode is on... */}
          <Text
            style={{
              fontFamily: "Lato",
              fontSize: Math.round(16 * fontScale),
              lineHeight: Math.round(24 * fontScale),
              color: "rgba(255, 255, 255, 0.87)",
              textAlign: "center",
            }}
            className="mt-6 max-w-[325px] font-normal"
          >
            {t("focus_notif_warning", "While your focus mode is on, all of your notifications will be off")}
          </Text>

          {/* Action Button: Stop Focusing / Start Focusing / Resume Focusing */}
          <View className="mt-6 flex-row items-center justify-center gap-3">
            <Pressable
              onPress={handleToggleFocus}
              className="h-12 w-[177px] items-center justify-center rounded-[4px] button active:opacity-85"
            >
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: Math.round(16 * fontScale),
                  lineHeight: Math.round(24 * fontScale),
                  color: "#FFFFFF",
                }}
                className="font-normal text-center"
              >
                {isFocusing
                  ? t("stop_focusing", "Stop Focusing")
                  : seconds > 0
                    ? t("resume_focusing", "Resume Focusing")
                    : t("start_focusing", "Start Focusing")}
              </Text>
            </Pressable>

            {seconds > 0 && !isFocusing && (
              <Pressable
                onPress={handleResetFocus}
                hitSlop={8}
                className="h-12 w-12 items-center justify-center rounded-[4px] border border-[#979797] bg-[#363636] active:opacity-75"
              >
                <Ionicons name="refresh-outline" size={20} color="white" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Section 2: Overview Section */}
        <View className="mt-10">
          {/* Header row: Overview + Filter Dropdown */}
          <View className="flex-row items-center justify-between">
            <Text
              style={{
                fontFamily: "Lato",
                fontSize: Math.round(20 * fontScale),
                lineHeight: Math.round(22 * fontScale),
                letterSpacing: -0.5,
                color: "rgba(255, 255, 255, 0.87)",
              }}
              className="font-normal"
            >
              {t("overview", "Overview")}
            </Text>

            {/* Dropdown Button (Frame 159) */}
            <View className="relative z-50">
              <Pressable
                onPress={() => setIsPeriodMenuOpen((prev) => !prev)}
                className="h-[31px] flex-row items-center gap-2 rounded-[6px] bg-white/20 px-2.5 py-1 active:opacity-70"
              >
                <Text
                  style={{
                    fontFamily: "Lato",
                    fontSize: 12,
                    lineHeight: 21,
                    letterSpacing: -0.32,
                    color: "rgba(255, 255, 255, 0.87)",
                  }}
                  className="font-normal"
                >
                  {selectedPeriod}
                </Text>
                <Ionicons
                  name={isPeriodMenuOpen ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="rgba(255, 255, 255, 0.87)"
                />
              </Pressable>

              {/* Dropdown Menu */}
              {isPeriodMenuOpen && (
                <View className="absolute top-[35px] right-0 z-50 min-w-[130px] rounded-[6px] border border-[#979797]/30 bg-[#363636] p-1.5 shadow-xl">
                  {FILTER_PERIODS.map((period) => {
                    const isSelected = selectedPeriod === period;
                    return (
                      <Pressable
                        key={period}
                        onPress={() => handleSelectPeriod(period)}
                        className={`flex-row items-center justify-between rounded px-3 py-2 ${
                          isSelected ? "bg-white/10" : "active:bg-white/5"
                        }`}
                      >
                        <Text
                          style={{
                            color: isSelected ? themeColor : "rgba(255, 255, 255, 0.9)",
                            fontWeight: isSelected ? "bold" : "normal",
                          }}
                          className="text-xs"
                        >
                          {period}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={themeColor}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {/* Total Focus Time: Weekly / Period Total Card above the Chart */}
          <View className="mt-4 flex-row items-center justify-between rounded-lg bg-[#272727] px-4 py-3 border border-white/5">
            <View>
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: 11,
                  lineHeight: 14,
                  letterSpacing: 0.5,
                  color: "#AFAFAF",
                  textTransform: "uppercase",
                }}
                className="font-medium"
              >
                {selectedPeriod === "This Week"
                  ? "Weekly Total Focus Time"
                  : selectedPeriod === "Today"
                    ? "Today's Focus Time"
                    : "Monthly Total Focus Time"}
              </Text>
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: 24,
                  lineHeight: 30,
                  fontWeight: "700",
                  color: "#FFFFFF",
                  marginTop: 2,
                }}
              >
                {formatTotalHoursMinutes(totalPeriodSeconds)}
              </Text>
            </View>
            <View className="items-end">
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: 12,
                  lineHeight: 16,
                  color: themeColor,
                }}
                className="font-medium"
              >
                {selectedPeriod === "Today"
                  ? `${
                      sessions.filter((s) => s.date === toDateStr(new Date()))
                        .length
                    } session${
                      sessions.filter((s) => s.date === toDateStr(new Date()))
                        .length === 1
                        ? ""
                        : "s"
                    }`
                  : `Daily Avg: ${formatTotalHoursMinutes(dailyAverageSeconds)}`}
              </Text>
              <Text
                style={{
                  fontFamily: "Lato",
                  fontSize: 11,
                  lineHeight: 14,
                  color: "#AFAFAF",
                  marginTop: 2,
                }}
              >
                {selectedPeriod === "This Week"
                  ? "Sun – Sat"
                  : selectedPeriod === "Today"
                    ? "Current Day"
                    : "Current Month"}
              </Text>
            </View>
          </View>

          {/* Bar Chart Container (Group 303) */}
          <View className="mt-5 h-[240px] flex-row">
            {/* Left: Y-Axis Scale (6h to 1h per Figma) */}
            <View className="h-[188px] w-7 justify-between pr-2">
              {["6h", "5h", "4h", "3h", "2h", "1h"].map((label) => (
                <Text
                  key={label}
                  style={{
                    fontFamily: "Lato",
                    fontSize: 12,
                    lineHeight: 20,
                    letterSpacing: -0.5,
                    color: "rgba(255, 255, 255, 0.87)",
                  }}
                  className="text-right"
                >
                  {label}
                </Text>
              ))}
            </View>

            {/* Right: Chart Bars & Days */}
            <View className="flex-1 justify-end">
              {/* Bars Row */}
              <View className="h-[188px] flex-row items-end justify-between px-1">
                {chartData.map((item, index) => {
                  const isSelected = selectedDayIndex === index;
                  const barColor = isSelected ? themeColor : "#A5A5A5";

                  return (
                    <Pressable
                      key={item.day}
                      onPress={() => setSelectedDayIndex(index)}
                      className="items-center"
                      style={{ width: 32 }}
                    >
                      {/* Tooltip / Value above bar (e.g. 4h 30m, Daily Total) */}
                      <Text
                        numberOfLines={1}
                        style={{
                          fontFamily: "Lato",
                          fontSize: 10,
                          lineHeight: 14,
                          letterSpacing: -0.5,
                          color: isSelected
                            ? "#FFFFFF"
                            : "rgba(255, 255, 255, 0.87)",
                          marginBottom: 4,
                        }}
                        className={`text-center ${
                          isSelected
                            ? "font-bold text-[#8687E7]"
                            : "font-normal"
                        }`}
                      >
                        {item.time}
                      </Text>

                      {/* Bar (Rectangle 127-133: width ~28px) */}
                      <View
                        style={{
                          height: item.height,
                          width: 28,
                          backgroundColor: barColor,
                          borderRadius: 4,
                        }}
                      />
                    </Pressable>
                  );
                })}
              </View>

              {/* Horizontal Divider / Baseline (Vector 3) */}
              <View className="my-1.5 h-[1.5px] w-full bg-white/30" />

              {/* Days labels row (SUN to SAT) */}
              <View className="flex-row items-center justify-between px-1">
                {chartData.map((item, index) => {
                  const isSelected = selectedDayIndex === index;
                  let dayColor = "rgba(255, 255, 255, 0.87)";
                  if (item.isWeekend) {
                    dayColor = "#FF4949";
                  } else if (isSelected) {
                    dayColor = themeColor;
                  }

                  return (
                    <Pressable
                      key={item.day}
                      onPress={() => setSelectedDayIndex(index)}
                      style={{ width: 32 }}
                      className="items-center"
                    >
                      <Text
                        style={{
                          fontFamily: "Lato",
                          fontSize: 12,
                          lineHeight: 20,
                          letterSpacing: -0.5,
                          color: dayColor,
                        }}
                        className={isSelected ? "font-bold" : "font-normal"}
                      >
                        {item.day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Selected Day Detail Callout */}
          {chartData[selectedDayIndex] && (
            <View className="mt-3 flex-row items-center justify-between rounded bg-[#1E1E1E] px-3.5 py-2 border border-white/5">
              <View className="flex-row items-center gap-2">
                <View
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: chartData[selectedDayIndex].isWeekend
                      ? "#FF4949"
                      : "#8687E7",
                  }}
                />
                <Text className="text-xs text-[#AFAFAF]">
                  {selectedPeriod === "This Month"
                    ? `All ${chartData[selectedDayIndex].day}s this month`
                    : `${chartData[selectedDayIndex].day} focus time`}
                </Text>
              </View>
              <Text className="text-xs font-bold text-white">
                {chartData[selectedDayIndex].time}
              </Text>
            </View>
          )}
        </View>

        {/* Section 3: Applications Section */}
        <View className="mt-8">
          <Text
            style={{
              fontFamily: "Lato",
              fontSize: Math.round(20 * fontScale),
              lineHeight: Math.round(30 * fontScale),
              color: "rgba(255, 255, 255, 0.87)",
            }}
            className="font-normal"
          >
            {t("applications", "Applications")}
          </Text>

          {/* List of Applications (Frame 201, 200, 199, 198, 197) */}
          <View className="mt-4 gap-3">
            {APPLICATIONS_DATA.map((app) => (
              <View
                key={app.id}
                className="h-14 w-full flex-row items-center rounded-[4px] bg-[#4C4C4C] px-3 active:opacity-90"
              >
                {/* App Brand Icon */}
                {renderAppIcon(app)}

                {/* App Names & Time Info */}
                <View className="ml-3 flex-1 justify-center">
                  <Text
                    style={{
                      fontFamily: "Lato",
                      fontSize: 14,
                      lineHeight: 20,
                      color: "#FFFFFF",
                    }}
                    className="font-normal"
                  >
                    {app.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: "Lato",
                      fontSize: 12,
                      lineHeight: 18,
                      color: "#FFFFFF",
                    }}
                    className="font-normal opacity-90"
                  >
                    {app.subtitle}
                  </Text>
                </View>

                {/* Vertical Divider (Vector 4: border 1px solid #979797) */}
                <View className="mx-3 h-[41px] w-[1px] bg-[#979797]" />

                {/* Info Circle Icon Button */}
                <Pressable
                  onPress={() => setSelectedApp(app)}
                  hitSlop={10}
                  className="items-center justify-center active:opacity-60"
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={24}
                    color="rgba(255, 255, 255, 0.87)"
                  />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* App Info Modal */}
      {selectedApp && (
        <Modal
          animationType="fade"
          transparent
          visible={true}
          onRequestClose={() => setSelectedApp(null)}
        >
          <View className="flex-1 items-center justify-center bg-black/70 px-6">
            <View className="w-full max-w-[320px] rounded-2xl bg-[#363636] p-5">
              <View className="flex-row items-center gap-3">
                {renderAppIcon(selectedApp)}
                <View>
                  <Text className="text-lg font-bold text-white">
                    {selectedApp.name}
                  </Text>
                  <Text className="text-xs text-[#AFAFAF]">
                    Daily Usage Statistics
                  </Text>
                </View>
              </View>

              <View className="my-4 rounded-lg bg-[#272727] p-3 gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-white/70">
                    Time Spent Today:
                  </Text>
                  <Text className="text-sm font-semibold text-white">
                    {selectedApp.duration}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-white/70">Daily Limit:</Text>
                  <Text style={{ color: themeColor }} className="text-sm font-semibold">
                    1h 30m
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-white/70">Status:</Text>
                  <Text className="text-sm font-semibold text-[#FF4949]">
                    Limit Exceeded
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => setSelectedApp(null)}
                className="h-10 items-center justify-center rounded-lg button active:opacity-80"
              >
                <Text className="font-semibold text-white">Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

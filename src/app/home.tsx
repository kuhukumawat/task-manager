import HomeImage from "@/assets/home.svg";
import Profile from "@/assets/image.png";
import ViewTaskDetail from "@/components/ViewTaskDetail";
import { Task } from "@/types/interface";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "@/context/SettingsContext";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILTER_OPTIONS = ["Today", "Tomorrow", "This Week", "Overdue", "All"];

/* ---------------------------- Date helpers ---------------------------- */

// Always save/compare dates as local YYYY-MM-DD (never toISOString, which is UTC)
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addDays = (d: Date, days: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const parseTaskDate = (task: Task): Date => {
  if (task.date) {
    // "YYYY-MM-DD" -> parse as LOCAL date
    if (/^\d{4}-\d{2}-\d{2}$/.test(task.date)) {
      const [y, m, d] = task.date.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    // timestamp in ms
    const num = Number(task.date);
    if (!isNaN(num) && num > 1000000) {
      return new Date(num);
    }
    // ISO or other parseable string
    const parsed = new Date(task.date);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Fallback: guess from the label stored in task.time
  if (task.time) {
    const lower = task.time.toLowerCase();
    const now = new Date();
    if (lower.includes("tomorrow")) return addDays(now, 1);
    if (lower.includes("yesterday")) return addDays(now, -1);
    if (lower.includes("today")) return now;
  }

  // Unparseable date: lands in "Today" (check your add-task screen if you see this)
  return new Date();
};

const getTaskExactDateTime = (task: Task): Date => {
  const result = startOfDay(parseTaskDate(task));

  if (task.time) {
    const match = task.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      const period = match[3]?.toUpperCase();
      if (period === "AM" && hour === 12) hour = 0;
      if (period === "PM" && hour !== 12) hour += 12;
      result.setHours(hour, minute, 0, 0);
      return result;
    }
  }

  // No time given: overdue only after the day ends
  result.setHours(23, 59, 59, 999);
  return result;
};

const isTaskOverdue = (task: Task): boolean => {
  if (task.completed) return false;
  return getTaskExactDateTime(task).getTime() < Date.now();
};

const formatTaskSubtitle = (task: Task): string => {
  const taskDate = parseTaskDate(task);
  const now = new Date();

  const taskDay = startOfDay(taskDate).getTime();
  const today = startOfDay(now).getTime();
  const tomorrow = startOfDay(addDays(now, 1)).getTime();
  const yesterday = startOfDay(addDays(now, -1)).getTime();

  let cleanTime = "";
  if (task.time) {
    const match = task.time.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    cleanTime = match
      ? match[1]
      : task.time.replace(/^(today|tomorrow|yesterday|this week)\s+at\s+/i, "");
  }

  let prefix = "Today";
  if (taskDay === tomorrow) prefix = "Tomorrow";
  else if (taskDay === yesterday) prefix = "Yesterday";
  else if (taskDay !== today) {
    prefix = taskDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return cleanTime ? `${prefix} At ${cleanTime}` : prefix;
};

const matchesFilter = (task: Task, filter: string): boolean => {
  if (filter === "All") return true;
  if (filter === "Overdue") return isTaskOverdue(task);

  const now = new Date();
  const taskDay = startOfDay(parseTaskDate(task)).getTime();
  const today = startOfDay(now).getTime();
  const tomorrow = startOfDay(addDays(now, 1)).getTime();

  if (filter === "Today") return taskDay === today;
  if (filter === "Tomorrow") return taskDay === tomorrow;

  if (filter === "This Week") {
    const daysUntilSunday = (7 - now.getDay()) % 7;
    const sunday = startOfDay(addDays(now, daysUntilSunday)).getTime();
    return taskDay >= today && taskDay <= sunday;
  }

  return false;
};

/* ------------------------------ Component ------------------------------ */

export default function Home() {
  const insets = useSafeAreaInsets();
  const { fontScale, t } = useSettings();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isCompletedOpen, setIsCompletedOpen] = useState(true);
  const [viewTaskModal, setViewTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  // Load tasks. Only seed sample data when nothing has ever been stored.
  const fetchTasks = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("tasks");
      if (stored !== null) {
        setTasks(JSON.parse(stored));
        return;
      }
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  }, []);

  // Reload every time this screen gains focus (picks up tasks added elsewhere)
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks]),
  );

  const toggleTaskCompleted = async (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    setTasks(updated);
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(updated));
    } catch (e) {
      console.log("Error saving tasks:", e);
    }
  };

  const visibleTasks = tasks
    .filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase().trim()),
    )
    .filter((t) => matchesFilter(t, selectedFilter));

  const activeTasks = visibleTasks.filter((t) => !t.completed);
  const completedTasks = visibleTasks.filter((t) => t.completed);

  const handleViewTaskDetail = (id: string) => {
    setSelectedTaskId(id);
    setViewTaskModal(true);
  };

  const iconName = (task: Task) =>
    (task.category?.icon ?? "help-outline") as keyof typeof Ionicons.glyphMap;

  return (
    <>
      <ViewTaskDetail
        visible={viewTaskModal}
        onClose={() => {
          setViewTaskModal(false);
          fetchTasks();
        }}
        selectedTaskId={selectedTaskId}
      />
      <View
        className="flex-1 bg-[#121212] px-6"
        style={{
          paddingTop: Math.max(insets.top, 24) + 12,
          paddingBottom: insets.bottom + 90,
        }}
      >
        {/* Top Header */}
        <View className="h-10 flex-row items-center justify-between">
          <Pressable
            onPress={() => {}}
            hitSlop={12}
            className="h-10 w-10 items-start justify-center active:opacity-60"
          >
            <Ionicons name="filter-outline" size={28} color="white" />
          </Pressable>
          <Text
            style={{ fontSize: Math.round(20 * fontScale) }}
            className="font-normal text-white"
          >
            {t("home_title", "Index")}
          </Text>
          <View className="h-[42px] w-[42px] overflow-hidden rounded-full">
            <Image source={Profile} style={{ width: 42, height: 42 }} />
          </View>
        </View>

        {tasks.length < 1 ? (
          <View className="h-full items-center justify-center gap-[10px]">
            <View className="w-full items-center">
              <HomeImage />
            </View>
            <View className="items-center gap-4">
              <Text
                style={{ fontSize: Math.round(22 * fontScale) }}
                className="font-normal text-center text-[#ffffff80]"
              >
                {t("home_empty_title", "What do you want to do today?")}
              </Text>
              <Text
                style={{ fontSize: Math.round(16 * fontScale) }}
                className="font-normal text-[#ffffff80]"
              >
                {t("home_empty_desc", "Tap + to add your tasks")}
              </Text>
            </View>
          </View>
        ) : (
          <View className="mt-4 flex-1">
            {/* Search Bar */}
            <View className="h-12 flex-row items-center rounded border border-[#979797] bg-[#1D1D1D] px-4">
              <Ionicons name="search-outline" size={24} color="#AFAFAF" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t("search_placeholder", "Search for your task...")}
                placeholderTextColor="#AFAFAF"
                className="ml-3 flex-1 text-base text-white"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color="#AFAFAF" />
                </Pressable>
              )}
            </View>

            {/* Filter select (menu is in normal layout flow so taps work on Android) */}
            <View className="mt-5 self-start">
              <Pressable
                onPress={() => setIsSelectOpen((prev) => !prev)}
                className="h-[31px] flex-row items-center gap-[10px] rounded-[6px] bg-white/20 px-[10px] py-[5px] active:opacity-70"
              >
                <Text className="text-xs font-normal text-white/90">
                  {selectedFilter}
                </Text>
                <Ionicons
                  name={isSelectOpen ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="rgba(255, 255, 255, 0.87)"
                />
              </Pressable>

              {isSelectOpen && (
                <View className="mt-1 min-w-[130px] rounded-[6px] border border-[#979797]/30 bg-[#363636] p-1.5">
                  {FILTER_OPTIONS.map((option) => {
                    const isSelected = selectedFilter === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => {
                          setSelectedFilter(option);
                          setIsSelectOpen(false);
                        }}
                        className={`flex-row items-center justify-between rounded px-3 py-2 ${
                          isSelected ? "button/25" : "active:bg-white/10"
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            isSelected
                              ? "font-semibold text-[#8687E7]"
                              : "text-white/90"
                          }`}
                        >
                          {option}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#8687E7"
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Tasks list */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="mt-4 flex-1"
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Active tasks */}
              <View className="gap-4">
                {activeTasks.map((task) => (
                  <Pressable
                    key={task.id}
                    className="min-h-[72px] justify-center rounded-[4px] bg-[#363636] px-3.5 py-3"
                    onPress={() => handleViewTaskDetail(task.id)}
                  >
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => toggleTaskCompleted(task.id)}
                        hitSlop={10}
                        className="h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-white/90 bg-[#363636] active:opacity-60"
                      />

                      <View className="ml-3 flex-1 justify-center">
                        <Text
                          numberOfLines={1}
                          className="text-[16px] font-normal leading-5 text-white/90"
                        >
                          {task.title}
                        </Text>

                        <View className="mt-1 flex-row items-center justify-between">
                          <Text className="text-[14px] font-normal text-[#AFAFAF]">
                            {formatTaskSubtitle(task)}
                          </Text>

                          <View className="flex-row items-center gap-2">
                            {task.category && (
                              <View
                                className="h-[29px] flex-row items-center gap-1.5 rounded-[4px] px-2"
                                style={{
                                  backgroundColor:
                                    task.category.background ||
                                    task.category.bg,
                                }}
                              >
                                <Ionicons
                                  name={iconName(task)}
                                  size={14}
                                  color={task.category.iconColor}
                                />
                                <Text className="text-[12px] font-normal text-white">
                                  {task.category.name}
                                </Text>
                              </View>
                            )}

                            {task.priority !== undefined && (
                              <View className="h-[29px] flex-row items-center gap-1.5 rounded-[4px] border border-[#8687E7] px-2">
                                <Ionicons
                                  name="flag-outline"
                                  size={14}
                                  color="rgba(255, 255, 255, 0.87)"
                                />
                                <Text className="text-[12px] font-normal text-[#E8E8E8]">
                                  {task.priority}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>

              {/* Completed section */}
              {completedTasks.length > 0 && (
                <View className="mt-8">
                  <Pressable
                    onPress={() => setIsCompletedOpen(!isCompletedOpen)}
                    className="h-[31px] min-w-[102px] flex-row items-center justify-center gap-[10px] self-start rounded-[6px] bg-white/20 px-[10px] py-[5px] active:opacity-70"
                  >
                    <Text className="text-xs font-normal text-white/90">
                      {t("filter_completed", "Completed")}
                    </Text>
                    <Ionicons
                      name={isCompletedOpen ? "chevron-up" : "chevron-down"}
                      size={14}
                      color="rgba(255, 255, 255, 0.87)"
                    />
                  </Pressable>

                  {isCompletedOpen && (
                    <View className="mt-4 gap-4">
                      {completedTasks.map((task) => (
                        <Pressable
                          key={task.id}
                          onPress={() => handleViewTaskDetail(task.id)}
                          className="min-h-[72px] justify-center rounded-[4px] bg-[#363636] px-3.5 py-3 opacity-80 active:opacity-70"
                        >
                          <View className="flex-row items-center">
                            <Pressable
                              onPress={() => toggleTaskCompleted(task.id)}
                              hitSlop={10}
                              className="h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-[#8687E7] button active:opacity-60"
                            >
                              <Ionicons
                                name="checkmark"
                                size={10}
                                color="#FFFFFF"
                              />
                            </Pressable>

                            <View className="ml-3 flex-1 justify-center">
                              <Text
                                numberOfLines={1}
                                className="text-[16px] font-normal leading-5 text-white/70 line-through"
                              >
                                {task.title}
                              </Text>
                              <View className="mt-1 flex-row items-center justify-between">
                                <Text className="text-[14px] font-normal text-[#AFAFAF]">
                                  {formatTaskSubtitle(task)}
                                </Text>

                                <View className="flex-row items-center gap-2">
                                  {task.category && (
                                    <View
                                      className="h-[29px] flex-row items-center gap-1.5 rounded-[4px] px-2 opacity-60"
                                      style={{
                                        backgroundColor:
                                          task.category.background ||
                                          task.category.bg,
                                      }}
                                    >
                                      <Ionicons
                                        name={iconName(task)}
                                        size={14}
                                        color={task.category.iconColor}
                                      />
                                      <Text className="text-[12px] font-normal text-white">
                                        {task.category.name}
                                      </Text>
                                    </View>
                                  )}

                                  {task.priority !== undefined && (
                                    <View className="h-[29px] flex-row items-center gap-1.5 rounded-[4px] border border-[#8687E7]/50 px-2 opacity-60">
                                      <Ionicons
                                        name="flag-outline"
                                        size={14}
                                        color="rgba(255, 255, 255, 0.6)"
                                      />
                                      <Text className="text-[12px] font-normal text-[#E8E8E8]/70">
                                        {task.priority}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {activeTasks.length === 0 && completedTasks.length === 0 && (
                <View className="items-center justify-center gap-2 py-16">
                  <Ionicons
                    name="clipboard-outline"
                    size={40}
                    color="#535353"
                  />
                  <Text className="text-sm font-normal text-[#AFAFAF]">
                    No tasks found for &quot;{selectedFilter}&quot;
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </>
  );
}

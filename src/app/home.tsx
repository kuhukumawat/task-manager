import HomeImage from "@/assets/home.svg";
import Profile from "@/assets/image.png";
import ViewTaskDetail from "@/components/ViewTaskDetail";
import { useSettings } from "@/context/SettingsContext";
import { Task } from "@/types/interface";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILTER_OPTIONS = ["Today", "Tomorrow", "This Week", "Overdue", "All"];

type SortOption =
  | "default"
  | "priorityDesc"
  | "priorityAsc"
  | "dueDateAsc"
  | "dueDateDesc"
  | "titleAsc";

interface AvailableCategory {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  iconColor: string;
}

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addDays = (d: Date, days: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const parseTaskDate = (task: Task): Date => {
  if (task.date) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(task.date)) {
      const [y, m, d] = task.date.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    const num = Number(task.date);
    if (!isNaN(num) && num > 1000000) {
      return new Date(num);
    }
    const parsed = new Date(task.date);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  if (task.time) {
    const lower = task.time.toLowerCase();
    const now = new Date();
    if (lower.includes("tomorrow")) return addDays(now, 1);
    if (lower.includes("yesterday")) return addDays(now, -1);
    if (lower.includes("today")) return now;
  }

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
  const { fontScale, t, themeColor } = useSettings();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter & Sort State
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<number | "All">(
    "All",
  );
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Filter & Sort Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState("Today");
  const [tempCategory, setTempCategory] = useState<string>("All");
  const [tempPriority, setTempPriority] = useState<number | "All">("All");
  const [tempSortBy, setTempSortBy] = useState<SortOption>("default");

  const [categoriesList, setCategoriesList] = useState<AvailableCategory[]>([]);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isCompletedOpen, setIsCompletedOpen] = useState(true);
  const [viewTaskModal, setViewTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  // Load tasks and categories
  const fetchTasks = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("tasks");
      if (stored !== null) {
        setTasks(JSON.parse(stored));
      }
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("categories");
      if (stored) {
        setCategoriesList(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Reload every time this screen gains focus (picks up tasks added elsewhere)
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      loadCategories();
    }, [fetchTasks, loadCategories]),
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

  // Compile all available categories across presets, custom categories & task records
  const allAvailableCategories = useMemo<AvailableCategory[]>(() => {
    const map = new Map<string, AvailableCategory>();

    const defaults: AvailableCategory[] = [
      {
        name: "Grocery",
        icon: "cart-outline",
        background: "#CCFF80",
        iconColor: "#21A300",
      },
      {
        name: "Work",
        icon: "briefcase-outline",
        background: "#FF9680",
        iconColor: "#A31D00",
      },
      {
        name: "Sport",
        icon: "football-outline",
        background: "#80FFFF",
        iconColor: "#00A3A3",
      },
      {
        name: "Design",
        icon: "color-palette-outline",
        background: "#80FFD9",
        iconColor: "#00A368",
      },
      {
        name: "University",
        icon: "school-outline",
        background: "#809CFF",
        iconColor: "#0055A3",
      },
      {
        name: "Social",
        icon: "megaphone-outline",
        background: "#FF80EB",
        iconColor: "#A30089",
      },
      {
        name: "Music",
        icon: "musical-notes-outline",
        background: "#FC80FF",
        iconColor: "#A000A3",
      },
      {
        name: "Health",
        icon: "heart-outline",
        background: "#80FFA3",
        iconColor: "#00A32F",
      },
      {
        name: "Movie",
        icon: "videocam-outline",
        background: "#80D1FF",
        iconColor: "#006FA3",
      },
      {
        name: "Home",
        icon: "home-outline",
        background: "#FF8080",
        iconColor: "#A30000",
      },
    ];
    defaults.forEach((c) => map.set(c.name.toLowerCase(), c));

    categoriesList.forEach((c) => {
      if (c && c.name) {
        map.set(c.name.toLowerCase(), {
          name: c.name,
          icon: (c.icon || "help-outline") as keyof typeof Ionicons.glyphMap,
          background: c.background || "#8687E7",
          iconColor: c.iconColor || "#FFFFFF",
        });
      }
    });

    tasks.forEach((t) => {
      if (t.category && t.category.name) {
        map.set(t.category.name.toLowerCase(), {
          name: t.category.name,
          icon: (t.category.icon ||
            "help-outline") as keyof typeof Ionicons.glyphMap,
          background: t.category.background || t.category.bg || "#8687E7",
          iconColor: t.category.iconColor || "#FFFFFF",
        });
      }
    });

    return Array.from(map.values());
  }, [categoriesList, tasks]);

  // Check if any non-default filter/sort is active
  const hasActiveFilters =
    selectedFilter !== "Today" ||
    selectedCategory !== "All" ||
    selectedPriority !== "All" ||
    sortBy !== "default";

  // Filtered & sorted tasks list
  const visibleTasks = useMemo(() => {
    let result = tasks.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase().trim()),
    );

    // 1. Due date / time period
    result = result.filter((t) => matchesFilter(t, selectedFilter));

    // 2. Category
    if (selectedCategory !== "All") {
      result = result.filter(
        (t) =>
          t.category?.name?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // 3. Priority
    if (selectedPriority !== "All") {
      result = result.filter((t) => t.priority === selectedPriority);
    }

    // 4. Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "priorityDesc") {
        return (b.priority ?? 0) - (a.priority ?? 0);
      }
      if (sortBy === "priorityAsc") {
        return (a.priority ?? 0) - (b.priority ?? 0);
      }
      if (sortBy === "dueDateAsc") {
        return (
          getTaskExactDateTime(a).getTime() - getTaskExactDateTime(b).getTime()
        );
      }
      if (sortBy === "dueDateDesc") {
        return (
          getTaskExactDateTime(b).getTime() - getTaskExactDateTime(a).getTime()
        );
      }
      if (sortBy === "titleAsc") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [
    tasks,
    searchQuery,
    selectedFilter,
    selectedCategory,
    selectedPriority,
    sortBy,
  ]);

  // Live count for filter modal preview
  const previewTasksCount = useMemo(() => {
    let count = tasks.filter((t) => matchesFilter(t, tempFilter));
    if (tempCategory !== "All") {
      count = count.filter(
        (t) => t.category?.name?.toLowerCase() === tempCategory.toLowerCase(),
      );
    }
    if (tempPriority !== "All") {
      count = count.filter((t) => t.priority === tempPriority);
    }
    return count.length;
  }, [tasks, tempFilter, tempCategory, tempPriority]);

  const activeTasks = visibleTasks.filter((t) => !t.completed);
  const completedTasks = visibleTasks.filter((t) => t.completed);

  const handleViewTaskDetail = (id: string) => {
    setSelectedTaskId(id);
    setViewTaskModal(true);
  };

  const handleOpenFilterModal = () => {
    setTempFilter(selectedFilter);
    setTempCategory(selectedCategory);
    setTempPriority(selectedPriority);
    setTempSortBy(sortBy);
    setIsFilterModalOpen(true);
  };

  const handleApplyModalFilters = () => {
    setSelectedFilter(tempFilter);
    setSelectedCategory(tempCategory);
    setSelectedPriority(tempPriority);
    setSortBy(tempSortBy);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedFilter("Today");
    setSelectedCategory("All");
    setSelectedPriority("All");
    setSortBy("default");
    setTempFilter("Today");
    setTempCategory("All");
    setTempPriority("All");
    setTempSortBy("default");
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

      {/* Filter & Sort Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/75 px-4"
          onPress={() => setIsFilterModalOpen(false)}
        >
          <Pressable
            className="w-full max-w-[360px] max-h-[85%] rounded-[12px] bg-[#363636] p-5 border border-white/10"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-[#979797]/30">
              <View className="flex-row items-center gap-2">
                <Ionicons name="filter" size={20} color={themeColor} />
                <Text
                  style={{ fontSize: Math.round(18 * fontScale) }}
                  className="font-bold text-white"
                >
                  {t("filter_and_sort", "Filter & Sort")}
                </Text>
              </View>
              <Pressable
                onPress={() => setIsFilterModalOpen(false)}
                hitSlop={8}
                className="h-8 w-8 items-center justify-center rounded-full bg-white/10 active:opacity-60"
              >
                <Ionicons name="close" size={18} color="white" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="mt-3"
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {/* Section 1: Time Period */}
              <View className="mb-4">
                <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t("filter_period", "Time Period")}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {FILTER_OPTIONS.map((opt) => {
                    const isSelected = tempFilter === opt;
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => setTempFilter(opt)}
                        style={
                          isSelected
                            ? { backgroundColor: themeColor }
                            : undefined
                        }
                        className={`rounded-[6px] px-3 py-1.5 active:opacity-70 ${
                          isSelected ? "" : "bg-[#272727]"
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            isSelected
                              ? "font-semibold text-white"
                              : "text-white/80"
                          }`}
                        >
                          {opt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Section 2: Category */}
              <View className="mb-4">
                <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t("filter_category", "Category")}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <Pressable
                    onPress={() => setTempCategory("All")}
                    style={
                      tempCategory === "All"
                        ? { backgroundColor: themeColor }
                        : undefined
                    }
                    className={`rounded-[6px] px-3 py-1.5 active:opacity-70 ${
                      tempCategory === "All" ? "" : "bg-[#272727]"
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        tempCategory === "All"
                          ? "font-semibold text-white"
                          : "text-white/80"
                      }`}
                    >
                      {t("all", "All")}
                    </Text>
                  </Pressable>

                  {allAvailableCategories.map((cat) => {
                    const isSelected =
                      tempCategory.toLowerCase() === cat.name.toLowerCase();
                    return (
                      <Pressable
                        key={cat.name}
                        onPress={() => setTempCategory(cat.name)}
                        className={`flex-row items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 active:opacity-70 ${
                          isSelected
                            ? "border border-white"
                            : "border border-transparent"
                        }`}
                        style={{
                          backgroundColor: isSelected
                            ? cat.background
                            : "#272727",
                        }}
                      >
                        <Ionicons
                          name={cat.icon}
                          size={14}
                          color={isSelected ? cat.iconColor : "#AFAFAF"}
                        />
                        <Text
                          className={`text-xs ${
                            isSelected
                              ? "font-semibold text-white"
                              : "text-white/80"
                          }`}
                        >
                          {cat.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Section 3: Priority */}
              <View className="mb-4">
                <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t("filter_priority", "Priority")}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <Pressable
                    onPress={() => setTempPriority("All")}
                    style={
                      tempPriority === "All"
                        ? { backgroundColor: themeColor }
                        : undefined
                    }
                    className={`rounded-[6px] px-3 py-1.5 active:opacity-70 ${
                      tempPriority === "All" ? "" : "bg-[#272727]"
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        tempPriority === "All"
                          ? "font-semibold text-white"
                          : "text-white/80"
                      }`}
                    >
                      {t("all", "All")}
                    </Text>
                  </Pressable>

                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => {
                    const isSelected = tempPriority === p;
                    return (
                      <Pressable
                        key={p}
                        onPress={() => setTempPriority(p)}
                        style={
                          isSelected
                            ? { backgroundColor: themeColor }
                            : undefined
                        }
                        className={`flex-row items-center gap-1 rounded-[6px] px-2.5 py-1.5 active:opacity-70 ${
                          isSelected ? "" : "bg-[#272727]"
                        }`}
                      >
                        <Ionicons
                          name="flag"
                          size={12}
                          color={isSelected ? "white" : "#AFAFAF"}
                        />
                        <Text
                          className={`text-xs ${
                            isSelected
                              ? "font-semibold text-white"
                              : "text-white/80"
                          }`}
                        >
                          {p}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Section 4: Sort By */}
              <View className="mb-2">
                <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t("sort_by", "Sort By")}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    {
                      id: "default" as const,
                      label: t("sort_default", "Default"),
                    },
                    {
                      id: "priorityDesc" as const,
                      label: t("sort_priority_high", "Priority: High to Low"),
                    },
                    {
                      id: "priorityAsc" as const,
                      label: t("sort_priority_low", "Priority: Low to High"),
                    },
                    {
                      id: "dueDateAsc" as const,
                      label: t("sort_due_date_asc", "Due Date: Earliest"),
                    },
                    {
                      id: "dueDateDesc" as const,
                      label: t("sort_due_date_desc", "Due Date: Latest"),
                    },
                    {
                      id: "titleAsc" as const,
                      label: t("sort_title_az", "Title: A to Z"),
                    },
                  ].map((s) => {
                    const isSelected = tempSortBy === s.id;
                    return (
                      <Pressable
                        key={s.id}
                        onPress={() => setTempSortBy(s.id)}
                        style={
                          isSelected
                            ? { backgroundColor: themeColor }
                            : undefined
                        }
                        className={`rounded-[6px] px-3 py-1.5 active:opacity-70 ${
                          isSelected ? "" : "bg-[#272727]"
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            isSelected
                              ? "font-semibold text-white"
                              : "text-white/80"
                          }`}
                        >
                          {s.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View className="mt-3 flex-row items-center gap-3 pt-3 border-t border-[#979797]/30">
              <Pressable
                onPress={() => {
                  setTempFilter("Today");
                  setTempCategory("All");
                  setTempPriority("All");
                  setTempSortBy("default");
                }}
                className="flex-1 h-11 items-center justify-center rounded-[6px] border border-white/20 active:opacity-60"
              >
                <Text className="text-xs font-medium text-white/80">
                  {t("reset", "Reset")}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleApplyModalFilters}
                style={{ backgroundColor: themeColor }}
                className="flex-1 h-11 items-center justify-center rounded-[6px] active:opacity-80"
              >
                <Text className="text-xs font-semibold text-white">
                  {t("apply", "Apply")} ({previewTasksCount})
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
            onPress={handleOpenFilterModal}
            hitSlop={12}
            className="relative h-10 w-10 items-start justify-center active:opacity-60"
            accessibilityLabel={t("filter_and_sort", "Filter & Sort")}
          >
            <Ionicons
              name={hasActiveFilters ? "filter" : "filter-outline"}
              size={26}
              color={hasActiveFilters ? themeColor : "white"}
            />
            {hasActiveFilters && (
              <View
                style={{ backgroundColor: themeColor }}
                className="absolute top-1 right-2 h-2.5 w-2.5 rounded-full border border-[#121212]"
              />
            )}
          </Pressable>
          <Text
            style={{ fontSize: Math.round(20 * fontScale) }}
            className="font-normal text-white"
          >
            {t("home_title", "Index")}
          </Text>
          <Pressable
            onPress={() => router.push("/profile")}
            hitSlop={8}
            className="h-[42px] w-[42px] overflow-hidden rounded-full active:opacity-70"
          >
            <Image source={Profile} style={{ width: 42, height: 42 }} />
          </Pressable>
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

            {/* Filter select row */}
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
                <View className="mt-1 min-w-[130px] rounded-[6px] border border-[#979797]/30 bg-[#363636] p-1.5 z-20">
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

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <View className="mt-3 flex-row flex-wrap items-center gap-2">
                {selectedFilter !== "Today" && (
                  <Pressable
                    onPress={() => setSelectedFilter("Today")}
                    className="flex-row items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 active:opacity-60"
                  >
                    <Text className="text-xs text-white/90">
                      {selectedFilter}
                    </Text>
                    <Ionicons name="close" size={14} color="#AFAFAF" />
                  </Pressable>
                )}
                {selectedCategory !== "All" && (
                  <Pressable
                    onPress={() => setSelectedCategory("All")}
                    className="flex-row items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 active:opacity-60"
                  >
                    <Text className="text-xs text-white/90">
                      {selectedCategory}
                    </Text>
                    <Ionicons name="close" size={14} color="#AFAFAF" />
                  </Pressable>
                )}
                {selectedPriority !== "All" && (
                  <Pressable
                    onPress={() => setSelectedPriority("All")}
                    className="flex-row items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 active:opacity-60"
                  >
                    <Ionicons name="flag" size={12} color={themeColor} />
                    <Text className="text-xs text-white/90">
                      {selectedPriority}
                    </Text>
                    <Ionicons name="close" size={14} color="#AFAFAF" />
                  </Pressable>
                )}
                {sortBy !== "default" && (
                  <Pressable
                    onPress={() => setSortBy("default")}
                    className="flex-row items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 active:opacity-60"
                  >
                    <Ionicons name="swap-vertical" size={12} color="#AFAFAF" />
                    <Text className="text-xs text-white/90">
                      {sortBy === "priorityDesc"
                        ? "Priority ↓"
                        : sortBy === "priorityAsc"
                          ? "Priority ↑"
                          : sortBy === "dueDateAsc"
                            ? "Date ↑"
                            : sortBy === "dueDateDesc"
                              ? "Date ↓"
                              : "A-Z"}
                    </Text>
                    <Ionicons name="close" size={14} color="#AFAFAF" />
                  </Pressable>
                )}
                <Pressable
                  onPress={handleResetFilters}
                  className="rounded-full px-2 py-1 active:opacity-60"
                >
                  <Text
                    style={{ color: themeColor }}
                    className="text-xs font-medium"
                  >
                    {t("reset", "Reset")}
                  </Text>
                </Pressable>
              </View>
            )}

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
                <View className="items-center justify-center gap-3 py-16 px-4">
                  <View className="h-16 w-16 items-center justify-center rounded-full bg-white/5">
                    <Ionicons name="filter-outline" size={32} color="#AFAFAF" />
                  </View>
                  <Text
                    style={{ fontSize: Math.round(16 * fontScale) }}
                    className="font-medium text-center text-white/90"
                  >
                    {hasActiveFilters
                      ? t("no_tasks_filtered", "No tasks match your filters")
                      : `No tasks found for "${selectedFilter}"`}
                  </Text>
                  <Text className="text-xs text-center text-[#AFAFAF]">
                    {hasActiveFilters
                      ? "Try adjusting your date, category, or priority filters."
                      : "Tap + below to add a new task."}
                  </Text>
                  {hasActiveFilters && (
                    <Pressable
                      onPress={handleResetFilters}
                      style={{ backgroundColor: themeColor }}
                      className="mt-2 rounded-[6px] px-4 py-2 active:opacity-80"
                    >
                      <Text className="text-xs font-semibold text-white">
                        {t("clear_filters", "Clear all filters")}
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </>
  );
}

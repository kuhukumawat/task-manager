import ViewTaskDetail from "@/components/ViewTaskDetail";
import { useSettings } from "@/context/SettingsContext";
import { Task } from "@/types/interface";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DayItem {
  date: Date;
  dayName: string;
  dayNumber: number;
  isWeekend: boolean;
  dateKey: string;
}

const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function Calender() {
  const insets = useSafeAreaInsets();
  const { themeColor, fontScale, t } = useSettings();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"Today" | "Completed">("Today");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [viewTaskModal, setViewTaskModal] = useState<boolean>(false);

  const flatListRef = useRef<FlatList<DayItem>>(null);

  // Fetch tasks from storage or fallback to Figma defaults
  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem("tasks");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
          return;
        }
      }
      setTasks([]);
      await AsyncStorage.setItem("tasks", JSON.stringify([]));
    } catch (e) {
      console.log("Error loading tasks for calendar:", e);
      setTasks([]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem("tasks")
      .then((stored) => {
        if (!isMounted) return;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTasks(parsed);
            return;
          }
        }
        setTasks([]);
      })
      .catch((e) => {
        console.log("Error loading tasks for calendar:", e);
        if (isMounted) setTasks([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Generate days for the viewed month
  const getDaysInMonth = (year: number, month: number): DayItem[] => {
    const days: DayItem[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      const dayOfWeek = date.getDay();
      const dayName = DAY_NAMES[dayOfWeek];
      const dayNumber = date.getDate();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      days.push({
        date: new Date(date),
        dayName,
        dayNumber,
        isWeekend,
        dateKey,
      });

      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const daysList = useMemo(
    () => getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth],
  );

  // Scroll to selected date when days list updates
  useEffect(() => {
    const selectedIndex = daysList.findIndex(
      (d) =>
        d.date.getDate() === selectedDate.getDate() &&
        d.date.getMonth() === selectedDate.getMonth() &&
        d.date.getFullYear() === selectedDate.getFullYear(),
    );
    if (selectedIndex >= 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: Math.max(0, selectedIndex - 2),
          animated: true,
        });
      }, 150);
    }
  }, [daysList, selectedDate]);

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const toggleTaskCompleted = async (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    setTasks(updated);
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(updated));
    } catch (e) {
      console.log("Error updating task completion:", e);
    }
  };

  const handleOpenDetail = (id: string) => {
    setSelectedTaskId(id);
    setViewTaskModal(true);
  };

  const handleCloseDetail = () => {
    setViewTaskModal(false);
    loadTasks();
  };

  // Check if a day has tasks
  const hasTasksOnDay = (dateKey: string, dayDate: Date): boolean => {
    const isToday = dayDate.toDateString() === new Date().toDateString();
    return tasks.some((t) => {
      if (t.date === dateKey) return true;
      if (!t.date && isToday) return true;
      return false;
    });
  };

  // Filter tasks based on activeTab (Today / Completed)
  const filteredTasks = tasks.filter((t) => {
    const matchesTab = activeTab === "Today" ? !t.completed : t.completed;

    // If task has explicit date, match dateKey; otherwise match if selected date is today
    const selectedKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    return matchesTab && t.date === selectedKey;
  });

  return (
    <View
      className="flex-1 bg-[#121212]"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      {/* Top Title: Calendar */}
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
          {t("calendar_title", "Calendar")}
        </Text>
      </View>

      {/* Month & Week Strip Container (Group 260 / Rectangle 124) */}
      <View className="mt-4 bg-[#363636] py-3">
        {/* Month Navigation Row */}
        <View className="flex-row items-center justify-between px-6">
          {/* Arrow Left */}
          <Pressable
            onPress={handlePrevMonth}
            hitSlop={12}
            className="w-8 h-8 items-center justify-center active:opacity-60"
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color="rgba(255, 255, 255, 0.87)"
            />
          </Pressable>

          {/* Month & Year Title */}
          <View className="items-center">
            <Text
              style={{
                fontFamily: "Lato",
                fontSize: 14,
                lineHeight: 21,
                color: "rgba(255, 255, 255, 0.87)",
              }}
              className="font-normal uppercase tracking-wider"
            >
              {MONTH_NAMES[currentMonth.getMonth()]}
            </Text>
            <Text
              style={{
                fontFamily: "Lato",
                fontSize: 10,
                lineHeight: 15,
                color: "#AFAFAF",
              }}
              className="font-normal mt-0.5"
            >
              {currentMonth.getFullYear()}
            </Text>
          </View>

          {/* Arrow Right */}
          <Pressable
            onPress={handleNextMonth}
            hitSlop={12}
            className="w-8 h-8 items-center justify-center active:opacity-60"
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255, 255, 255, 0.87)"
            />
          </Pressable>
        </View>

        {/* Horizontal Date Picker Strip (Frame 193) */}
        <View className="mt-3">
          <FlatList
            ref={flatListRef}
            data={daysList}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.dateKey}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            getItemLayout={(_, index) => ({
              length: 50,
              offset: 50 * index,
              index,
            })}
            renderItem={({ item }) => {
              const isSelected =
                item.date.getDate() === selectedDate.getDate() &&
                item.date.getMonth() === selectedDate.getMonth() &&
                item.date.getFullYear() === selectedDate.getFullYear();

              const dayHasTasks = hasTasksOnDay(item.dateKey, item.date);

              // Text color for day name
              let dayTextColor = "rgba(255, 255, 255, 0.87)";
              if (isSelected) {
                dayTextColor = "#FFFFFF";
              } else if (item.isWeekend) {
                dayTextColor = "#FF4949";
              }

              return (
                <Pressable
                  onPress={() => setSelectedDate(item.date)}
                  className={`w-[40px] h-[52px] rounded-[4px] items-center justify-center active:opacity-80 ${
                    isSelected ? "button" : "bg-[#272727]"
                  }`}
                >
                  <Text
                    style={{
                      fontFamily: "Lato",
                      fontSize: 12,
                      lineHeight: 18,
                      color: dayTextColor,
                    }}
                    className="font-bold"
                  >
                    {item.dayName}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Lato",
                      fontSize: 14,
                      lineHeight: 21,
                      color: isSelected
                        ? "#FFFFFF"
                        : "rgba(255, 255, 255, 0.87)",
                    }}
                    className="font-bold"
                  >
                    {item.dayNumber}
                  </Text>

                  {/* Indicator Dot (Ellipse 25) */}
                  {dayHasTasks && !isSelected ? (
                    <View className="w-1 h-1 rounded-full button mt-0.5" />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}
        className="flex-1 mt-4"
      >
        {/* Segmented Filter Control (Group 261 / Rectangle 125) */}
        <View className="w-full h-[80px] bg-[#4C4C4C] rounded-[4px] flex-row items-center justify-between px-3.5">
          {/* Today Button (Frame 194) */}
          <Pressable
            onPress={() => setActiveTab("Today")}
            style={{
              backgroundColor: activeTab === "Today" ? themeColor : "transparent",
            }}
            className={`flex-1 h-[49px] rounded-[4px] items-center justify-center mr-2 active:opacity-80 ${
              activeTab === "Today"
                ? ""
                : "border-[2px] border-[#979797]"
            }`}
          >
            <Text
              style={{
                fontFamily: "Lato",
                fontSize: Math.round(16 * fontScale),
                lineHeight: Math.round(21 * fontScale),
                letterSpacing: -0.32,
              }}
              className="text-white font-normal"
            >
              {t("today", "Today")}
            </Text>
          </Pressable>

          {/* Completed Button (Frame 195) */}
          <Pressable
            onPress={() => setActiveTab("Completed")}
            style={{
              backgroundColor: activeTab === "Completed" ? themeColor : "transparent",
            }}
            className={`flex-1 h-[49px] rounded-[4px] items-center justify-center ml-2 active:opacity-80 ${
              activeTab === "Completed"
                ? ""
                : "border-[2px] border-[#979797]"
            }`}
          >
            <Text
              style={{
                fontFamily: "Lato",
                fontSize: Math.round(16 * fontScale),
                lineHeight: Math.round(21 * fontScale),
                letterSpacing: -0.32,
              }}
              className="text-white font-normal"
            >
              {t("completed", "Completed")}
            </Text>
          </Pressable>
        </View>

        {/* Task Cards List (Group 248, Group 247, Group 246) */}
        <View className="mt-4 gap-3.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.completed;
            const categoryBg =
              task.category?.background || task.category?.bg || "#809CFF";
            const categoryIconColor = task.category?.iconColor || "#FFFFFF";

            return (
              <Pressable
                key={task.id}
                onPress={() => handleOpenDetail(task.id)}
                className="w-full min-h-[72px] bg-[#363636] rounded-[4px] px-3.5 py-3 flex-row items-center active:opacity-80"
              >
                {/* Ellipse 15 (Checkbox) */}
                <Pressable
                  onPress={() => toggleTaskCompleted(task.id)}
                  hitSlop={10}
                  className={`w-4 h-4 rounded-full items-center justify-center active:opacity-60 ${
                    isCompleted
                      ? "button border border-[#8687E7]"
                      : "bg-[#363636] border-[1.5px] border-white/90"
                  }`}
                >
                  {isCompleted && (
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  )}
                </Pressable>

                {/* Task Info & Badges */}
                <View className="ml-3 flex-1 justify-center">
                  {/* Title */}
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: "Lato",
                      fontSize: 16,
                      lineHeight: 21,
                      letterSpacing: -0.32,
                    }}
                    className={`font-normal ${
                      isCompleted
                        ? "text-white/60 line-through"
                        : "text-white/90"
                    }`}
                  >
                    {task.title}
                  </Text>

                  {/* Bottom Row: Time + Category + Priority */}
                  <View className="mt-1 flex-row items-center justify-between">
                    <Text
                      style={{
                        fontFamily: "Lato",
                        fontSize: 14,
                        lineHeight: 21,
                        letterSpacing: -0.32,
                      }}
                      className="text-[#AFAFAF] font-normal"
                    >
                      {task.time || "Today At 16:45"}
                    </Text>

                    <View className="flex-row items-center gap-2">
                      {/* Category Pill (Frame 187 / 189 / 191) */}
                      {task.category && (
                        <View
                          className="h-[29px] flex-row items-center gap-1.5 rounded-[4px] px-2"
                          style={{ backgroundColor: categoryBg }}
                        >
                          <Ionicons
                            name={task.category.icon ?? "folder-outline"}
                            size={14}
                            color={categoryIconColor}
                          />
                          <Text
                            style={{
                              fontFamily: "Lato",
                              fontSize: 12,
                              lineHeight: 21,
                              letterSpacing: -0.32,
                            }}
                            className="text-white font-normal"
                          >
                            {task.category.name}
                          </Text>
                        </View>
                      )}

                      {/* Priority Badge (Frame 188 / 190 / 192) */}
                      {task.priority !== undefined && (
                        <View className="h-[29px] flex-row items-center gap-1.5 rounded-[4px] border border-[#8687E7] px-2">
                          <Ionicons
                            name="flag-outline"
                            size={14}
                            color="rgba(255, 255, 255, 0.87)"
                          />
                          <Text
                            style={{
                              fontFamily: "Lato",
                              fontSize: 12,
                              lineHeight: 21,
                              letterSpacing: -0.32,
                            }}
                            className="text-[#E8E8E8] font-normal"
                          >
                            {task.priority}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}

          {filteredTasks.length === 0 && (
            <View className="items-center justify-center py-12 gap-2">
              <Ionicons
                name={
                  activeTab === "Completed"
                    ? "checkmark-done-circle-outline"
                    : "calendar-outline"
                }
                size={44}
                color="#535353"
              />
              <Text className="text-[#AFAFAF] text-base font-normal">
                {activeTab === "Completed"
                  ? "No completed tasks yet"
                  : "No tasks scheduled for this day"}
              </Text>
              <Text className="text-[#535353] text-xs font-normal">
                Tap + below to add a new task
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Task Detail Modal */}
      {viewTaskModal && (
        <ViewTaskDetail
          visible={viewTaskModal}
          selectedTaskId={selectedTaskId}
          onClose={handleCloseDetail}
        />
      )}
    </View>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from "react-native";

type ChooseTimeModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave?: (time: string) => void;
  editId?: string;
  initialTime?: string;
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ["AM", "PM"] as const;

const ITEM_HEIGHT = 36;

// Robust parser that handles "16:45", "04:30 PM", "Today At 16:45", etc.
const parseTime = (timeStr?: string) => {
  const now = new Date();
  const defaultHour = now.getHours() % 12 || 12;
  const defaultMinute = now.getMinutes();
  const defaultPeriod: "AM" | "PM" = now.getHours() >= 12 ? "PM" : "AM";

  if (!timeStr) {
    return { hour: defaultHour, minute: defaultMinute, period: defaultPeriod };
  }

  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) {
    return { hour: defaultHour, minute: defaultMinute, period: defaultPeriod };
  }

  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  let p = match[3]?.toUpperCase() as "AM" | "PM" | undefined;

  if (p) {
    h = h % 12 || 12;
  } else {
    p = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
  }

  return {
    hour: isNaN(h) ? defaultHour : h,
    minute: isNaN(m) ? defaultMinute : m,
    period: p ?? defaultPeriod,
  };
};

export default function ChooseTimeModal({
  visible,
  onClose,
  onSave,
  editId,
  initialTime,
}: ChooseTimeModalProps) {
  const initial = parseTime(initialTime);

  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(initial.period);

  const hourRef = useRef<FlatList<number>>(null);
  const minuteRef = useRef<FlatList<number>>(null);
  const periodRef = useRef<FlatList<string>>(null);
  // Sync state and scroll position whenever the modal opens
  useEffect(() => {
    if (!visible) return;

    const parsed = parseTime(initialTime);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);

    setTimeout(() => {
      hourRef.current?.scrollToOffset({
        offset: (parsed.hour - 1) * ITEM_HEIGHT,
        animated: false,
      });
      minuteRef.current?.scrollToOffset({
        offset: parsed.minute * ITEM_HEIGHT,
        animated: false,
      });
      periodRef.current?.scrollToOffset({
        offset: period === "AM" ? 0 : ITEM_HEIGHT,
        animated: false,
      });
    }, 80);
  }, [visible, initialTime]);

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    type: "hour" | "minute",
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);

    if (type === "hour") {
      setHour(HOURS[index] ?? 1);
    } else {
      setMinute(MINUTES[index] ?? 0);
    }
  };

  const handleSave = () => {
    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0",
    )} ${period}`;

    onSave?.(time);
    onClose();
  };

  const handlePeriodScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const selectedPeriod = PERIODS[index] ?? "AM";
    setPeriod(selectedPeriod);
  };
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/70">
        <View className="h-[206px] w-[327px] rounded bg-[#363636]">
          {/* Title */}
          <Text className="mt-2 text-center text-base font-medium text-white/90">
            {editId ? "Edit Time" : "Choose Time"}
          </Text>

          {/* Divider */}
          <View className="absolute left-2 right-2 top-[44px] border-t border-[#979797]" />

          {/* Time Picker */}
          <View className="mt-8 flex-row items-center justify-center gap-2">
            {/* ================= HOUR ================= */}
            <View className="h-[78px] w-[62px] overflow-hidden rounded bg-[#272727]">
              <FlatList
                ref={hourRef}
                data={HOURS}
                extraData={hour} //   Forces re-render when hour changes
                keyExtractor={(item) => item.toString()}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: 21 }}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                onMomentumScrollEnd={(e) => handleScrollEnd(e, "hour")}
                onScrollEndDrag={(e) => handleScrollEnd(e, "hour")}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setHour(item);
                      hourRef.current?.scrollToOffset({
                        offset: (item - 1) * ITEM_HEIGHT,
                        animated: true,
                      });
                    }}
                    className="items-center justify-center"
                    style={{ height: ITEM_HEIGHT }}
                  >
                    <Text
                      className={`text-2xl font-semibold ${
                        item === hour ? "text-white/90" : "text-white/10"
                      }`}
                    >
                      {String(item).padStart(2, "0")}
                    </Text>
                  </Pressable>
                )}
              />
            </View>

            {/* ================= COLON ================= */}
            <Text className="text-xl font-semibold text-white/90">:</Text>

            {/* ================= MINUTE ================= */}
            <View className="h-[78px] w-[62px] overflow-hidden rounded bg-[#272727]">
              <FlatList
                ref={minuteRef}
                data={MINUTES}
                extraData={minute} //   Forces re-render when minute changes
                keyExtractor={(item) => item.toString()}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: 21 }}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                onMomentumScrollEnd={(e) => handleScrollEnd(e, "minute")}
                onScrollEndDrag={(e) => handleScrollEnd(e, "minute")}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setMinute(item);
                      minuteRef.current?.scrollToOffset({
                        offset: item * ITEM_HEIGHT,
                        animated: true,
                      });
                    }}
                    className="items-center justify-center"
                    style={{ height: ITEM_HEIGHT }}
                  >
                    <Text
                      className={`text-2xl font-semibold ${
                        item === minute ? "text-white/90" : "text-white/10"
                      }`}
                    >
                      {String(item).padStart(2, "0")}
                    </Text>
                  </Pressable>
                )}
              />
            </View>

            {/* ================= AM / PM ================= */}
            <View className="h-[78px] w-[62px] overflow-hidden rounded bg-[#272727]">
              <FlatList
                ref={periodRef} // Pass ref
                data={PERIODS}
                extraData={period}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: 21 }}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                onMomentumScrollEnd={handlePeriodScroll} //   Snap on drag
                onScrollEndDrag={handlePeriodScroll}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setPeriod(item as "AM" | "PM");
                      //  Smoothly center whichever one was tapped
                      periodRef.current?.scrollToOffset({
                        offset: item === "AM" ? 0 : ITEM_HEIGHT,
                        animated: true,
                      });
                    }}
                    className="items-center justify-center"
                    style={{ height: ITEM_HEIGHT }}
                  >
                    <Text
                      className={`text-2xl font-semibold ${
                        item === period ? "text-white/90" : "text-white/10"
                      }`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          </View>

          {/* ================= BUTTONS ================= */}
          <View className="absolute bottom-2 left-2 right-2 flex-row">
            <Pressable
              onPress={onClose}
              className="flex-1 items-center rounded px-6 py-3"
            >
              <Text className="text-base text-[#8687E7]">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              className="flex-1 items-center rounded button px-6 py-3"
            >
              <Text className="text-base text-white">
                {editId ? "Edit" : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

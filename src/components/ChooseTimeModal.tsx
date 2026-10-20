import { useRef, useState } from "react";
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
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ["AM", "PM"] as const;

const ITEM_HEIGHT = 36;

export default function ChooseTimeModal({
  visible,
  onClose,
  onSave,
}: ChooseTimeModalProps) {
  // Current time
  const now = new Date();
  const currentHour24 = now.getHours();

  const currentHour = currentHour24 % 12 || 12;
  const currentMinute = now.getMinutes();

  const currentPeriod: "AM" | "PM" = currentHour24 >= 12 ? "PM" : "AM";

  const [hour, setHour] = useState(currentHour);
  const [minute, setMinute] = useState(currentMinute);
  const [period, setPeriod] = useState<"AM" | "PM">(currentPeriod);

  const hourRef = useRef<FlatList<number>>(null);
  const minuteRef = useRef<FlatList<number>>(null);

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
  const handleMinuteScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);

    setMinute(MINUTES[index] ?? 0);
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
            Choose Time
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
                keyExtractor={(item) => item.toString()}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{
                  paddingVertical: 21,
                }}
                initialScrollIndex={currentHour - 1}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                onMomentumScrollEnd={(event) => handleScrollEnd(event, "hour")}
                renderItem={({ item }) => (
                  <View
                    className="items-center justify-center"
                    style={{
                      height: ITEM_HEIGHT,
                    }}
                  >
                    <Text
                      className={`text-2xl font-semibold ${
                        item === hour ? "text-white/90" : "text-white/10"
                      }`}
                    >
                      {String(item).padStart(2, "0")}
                    </Text>
                  </View>
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
                keyExtractor={(item) => item.toString()}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{
                  paddingVertical: 21,
                }}
                initialScrollIndex={currentMinute}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                onMomentumScrollEnd={handleMinuteScroll}
                renderItem={({ item }) => (
                  <View
                    className="items-center justify-center"
                    style={{
                      height: ITEM_HEIGHT,
                    }}
                  >
                    <Text
                      className={`text-2xl font-semibold ${
                        item === minute ? "text-white/90" : "text-white/10"
                      }`}
                    >
                      {String(item).padStart(2, "0")}
                    </Text>
                  </View>
                )}
              />
            </View>

            {/* ================= AM / PM ================= */}
            <View className="h-[78px] w-[62px] overflow-hidden rounded bg-[#272727]">
              <FlatList
                data={PERIODS}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{
                  paddingVertical: 21,
                }}
                initialScrollIndex={currentPeriod === "AM" ? 0 : 1}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setPeriod(item)}
                    className="items-center justify-center"
                    style={{
                      height: ITEM_HEIGHT,
                    }}
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
            {/* Cancel */}
            <Pressable
              onPress={onClose}
              className="flex-1 items-center rounded px-6 py-3"
            >
              <Text className="text-base text-[#8687E7]">Cancel</Text>
            </Pressable>

            {/* Save */}
            <Pressable
              onPress={handleSave}
              className="flex-1 items-center rounded bg-[#8687E7] px-6 py-3"
            >
              <Text className="text-base text-white">Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

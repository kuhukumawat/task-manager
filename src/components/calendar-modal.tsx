import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import ChooseTimeModal from "./ChooseTimeModal";

type CalendarModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onSelectTime?: (time: string) => void;
};

const isValidDate = (val?: string): boolean => {
  if (!val) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(new Date(val).getTime());
};

export default function CalendarModal({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
  onSelectTime,
}: CalendarModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const initialDate = isValidDate(selectedDate) ? selectedDate! : today;

  const [currentDate, setCurrentDate] = useState(initialDate);
  const [openTimeModal, setOpenTimeModal] = useState(false);

  useEffect(() => {
    if (isValidDate(selectedDate)) {
      setCurrentDate(selectedDate!);
    } else {
      setCurrentDate(today);
    }
  }, [selectedDate, visible, today]);

  const safeCurrentDate = isValidDate(currentDate) ? currentDate : today;

  const handleDayPress = (day: DateData) => {
    setCurrentDate(day.dateString);
    if (onSelectDate) {
      onSelectDate(day.dateString);
    }
  };

  const handleOpenTimeModal = () => {
    setOpenTimeModal(true);
  };

  const handleCloseTimeModal = () => {
    setOpenTimeModal(false);
  };

  const handleSaveTime = (time: string) => {
    onSelectTime?.(time);
    setOpenTimeModal(false);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full max-w-[327px] overflow-hidden rounded-2xl bg-[#363636] p-4">
          <Calendar
            current={safeCurrentDate}
            minDate={today}
            onDayPress={handleDayPress}
            renderHeader={(date) => (
              <View className="items-center">
                <Text className="text-sm font-semibold text-white/90">
                  {date.toString("MMMM").toUpperCase()}
                </Text>
                <Text className="text-[10px] text-[#AFAFAF]">
                  {date.toString("yyyy")}
                </Text>
              </View>
            )}
            theme={{
              backgroundColor: "#363636",
              calendarBackground: "#363636",
              textSectionTitleColor: "#FFFFFFDE",
              dayTextColor: "#FFFFFFDE",
              monthTextColor: "#FFFFFFDE",
              textDisabledColor: "#AFAFAF",
              selectedDayBackgroundColor: "#8687E7",
              selectedDayTextColor: "#FFFFFF",
              arrowColor: "#FFFFFF",
              textDayFontSize: 12,
              textMonthFontSize: 14,
              textDayHeaderFontSize: 10,
            }}
            markedDates={{
              [safeCurrentDate]: {
                selected: true,
                selectedColor: "#8687E7",
              },
            }}
          />

          <View className="mt-4 flex-row items-center justify-end gap-4 pt-2">
            <Pressable onPress={onClose} hitSlop={8} className="px-3 py-2">
              <Text className="text-sm font-medium text-[#8687E7]">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleOpenTimeModal}
              hitSlop={8}
              className="rounded-lg bg-[#8687E7] px-4 py-2"
            >
              <Text className="text-sm font-medium text-white">
                Choose Time
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ChooseTimeModal
        visible={openTimeModal}
        onClose={handleCloseTimeModal}
        onSave={handleSaveTime}
      />
    </Modal>
  );
}

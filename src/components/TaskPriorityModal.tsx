import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type TaskPriorityModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave?: (priority: number) => void;
};

const PRIORITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function TaskPriorityModal({
  visible,
  onClose,
  onSave,
}: TaskPriorityModalProps) {
  const [selectedPriority, setSelectedPriority] = useState(1);

  const handleSave = () => {
    onSave?.(selectedPriority);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Dark overlay */}
      <View className="flex-1 items-center justify-center bg-black/70">
        {/* Main modal */}
        <View className="h-[360px] w-[327px] rounded-[4px] bg-[#363636] gap-y-3 px-3 py-5">
          {/* Title */}
          <Text className="  text-center text-base font-bold tracking-[-0.5px] text-white/90">
            Task Priority
          </Text>

          {/* Divider */}
          <View className=" h-[1px] bg-[#979797]" />

          {/* Priority Grid */}
          <View className="flex-row flex-wrap gap-4">
            {PRIORITIES.map((priority) => {
              const isSelected = priority === selectedPriority;

              return (
                <Pressable
                  key={priority}
                  onPress={() => setSelectedPriority(priority)}
                  className={` h-[64px] w-[64px] items-center justify-center rounded-[4px] ${
                    isSelected ? "bg-[#8687E7]" : "bg-[#272727]"
                  }`}
                >
                  {/* Flag */}
                  <Ionicons name="flag-outline" size={24} color="#FFFFFFDE" />

                  {/* Number */}
                  <Text className="mt-[4px] text-base tracking-[-0.32px] text-white/90">
                    {priority}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Cancel */}
          <Pressable
            onPress={onClose}
            className="absolute bottom-[6px] left-[28px] h-[48px] w-[126px] items-center justify-center rounded-[4px]"
          >
            <Text className="text-base text-[#8687E7]">Cancel</Text>
          </Pressable>

          {/* Save */}
          <Pressable
            onPress={handleSave}
            className="absolute bottom-[6px] right-[28px] h-[48px] w-[126px] items-center justify-center rounded-[4px] bg-[#8687E7]"
          >
            <Text className="text-base text-white">Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

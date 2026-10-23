import { Modal, Pressable, Text, View } from "react-native";

type DeleteModalProps = {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  taskTitle?: string;
};

export default function DeleteModal({
  visible,
  onClose,
  onDelete,
  taskTitle,
}: DeleteModalProps) {
  const deleteTask = async () => {
    await onDelete();
    onClose();
  };
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/70 px-6"
        onPress={onClose}
      >
        <Pressable
          className="w-[327px] rounded-[4px] bg-[#363636] px-4 py-3 justify-between flex-col gap-4"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header & Divider */}
          <View>
            {/* Title */}
            <Text className="text-center text-base font-bold text-white/90">
              Delete Task
            </Text>
          </View>

          {/* Divider */}
          <View className=" h-[1px] w-full bg-[#979797]" />
          {/* Confirmation Message */}
          <Text className="text-center text-lg font-medium   text-white/90">
            Are You sure you want to delete this task?
            {"\n"}
            {/* Task title : {taskTitle ?? "Do math homework"} */}
          </Text>

          {/* Action Buttons (Group 238) */}
          <View className="flex-row items-center justify-between gap-3">
            {/* Cancel Button */}
            <Pressable
              onPress={onClose}
              className="h-12 flex-1 items-center justify-center rounded-[4px] active:opacity-70"
            >
              <Text className="text-[16px] font-normal leading-6 text-[#8687E7]">
                Cancel
              </Text>
            </Pressable>

            {/* Delete Button */}
            <Pressable
              onPress={deleteTask}
              className="h-12 flex-1 items-center justify-center rounded-[4px] button active:opacity-80"
            >
              <Text className="text-[16px] font-normal leading-6 text-white">
                Delete
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

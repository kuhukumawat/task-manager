import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import CalendarModal from "./calendar-modal";
import CategoryModal from "./CategoryModal";
import TaskPriorityModal from "./TaskPriorityModal";

type AddATaskProps = {
  onClose: () => void;
};

export default function AddATask({ onClose }: AddATaskProps) {
  const [openCalender, setOpenCalender] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [openPriorityModal, setOpenPriorityModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const handleOpenCalender = () => {
    setOpenCalender(true);
  };

  const handleCloseCalender = () => {
    setOpenCalender(false);
  };
  const handleOpenPriorityModal = () => {
    setOpenPriorityModal(true);
  };
  const handleClosePriorityModal = () => {
    setOpenPriorityModal(false);
  };
  const handleOpenCategoryModal = () => {
    setOpenCategoryModal(true);
  };
  const handleCloseCategoryModal = () => {
    setOpenCategoryModal(false);
  };
  return (
    <>
      <Modal
        animationType="slide"
        transparent
        visible={true}
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-end">
          {/* Backdrop: click outside to dismiss */}
          <Pressable
            className="absolute inset-0 bg-black/60"
            onPress={onClose}
          />

          {/* Bottom Sheet */}
          <View className="rounded-t-2xl bg-[#363636] px-6 pt-6 pb-6">
            {/* Title */}
            <Text className="text-xl font-bold text-white/90">Add Task</Text>

            {/* Task Title Input */}
            <TextInput
              placeholder="Do math homework"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={taskTitle}
              onChangeText={setTaskTitle}
              className="mt-4 h-11 rounded border border-[#979797] px-4 text-base text-white"
            />

            {/* Description Input */}
            <TextInput
              placeholder="Description"
              placeholderTextColor="#AFAFAF"
              value={description}
              onChangeText={setDescription}
              className="mt-3 text-base text-white"
            />

            {/* Bottom Icons Row */}
            <View className="mt-6 flex-row items-center justify-between">
              <View className="flex-row items-center gap-6">
                {/* Timer/Calendar Button */}
                <Pressable
                  onPress={handleOpenCalender}
                  hitSlop={8}
                  className="active:opacity-60"
                >
                  <Ionicons
                    name="time-outline"
                    size={24}
                    color={
                      openCalender || selectedDate || selectedTime
                        ? "#8687E7"
                        : "rgba(255,255,255,0.87)"
                    }
                  />
                </Pressable>

                {/* Tag Button */}
                <Pressable
                  onPress={handleOpenCategoryModal}
                  hitSlop={8}
                  className="active:opacity-60"
                >
                  <Ionicons
                    name="pricetag-outline"
                    size={24}
                    color={
                      openCategoryModal ? "#8687E7" : "rgba(255,255,255,0.87)"
                    }
                    className="-rotate-90"
                  />
                </Pressable>

                {/* Flag Button */}
                <Pressable
                  onPress={handleOpenPriorityModal}
                  hitSlop={8}
                  className="active:opacity-60"
                >
                  <Ionicons
                    name="flag-outline"
                    size={24}
                    color={
                      openPriorityModal ? "#8687E7" : "rgba(255,255,255,0.87)"
                    }
                  />
                </Pressable>
              </View>

              {/* Submit / Send Button */}
              <Pressable
                onPress={onClose}
                hitSlop={8}
                className="active:opacity-60"
              >
                <Ionicons name="send" size={24} color="#8687E7" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Separated Calendar Modal */}
      <CalendarModal
        visible={openCalender}
        onClose={handleCloseCalender}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onSelectTime={setSelectedTime}
      />
      <TaskPriorityModal
        onClose={handleClosePriorityModal}
        visible={openPriorityModal}
      />
      <CategoryModal
        visible={openCategoryModal}
        onClose={handleCloseCategoryModal}
      />
    </>
  );
}

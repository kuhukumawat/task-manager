import { Category, Task } from "@/types/interface";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import CalendarModal from "./calendar-modal";
import CategoryModal from "./CategoryModal";
import TaskPriorityModal from "./TaskPriorityModal";
type AddATaskProps = {
  onClose: () => void;
  editId?: string;
  initialTitle?: string;
  initialDescription?: string;
  updateTitleAndDescription?: (title: string, description: string) => void;
};

export default function AddATask({
  onClose,
  editId,
  initialTitle,
  initialDescription,
  updateTitleAndDescription,
}: AddATaskProps) {
  const [openCalender, setOpenCalender] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [taskTitle, setTaskTitle] = useState(initialTitle ?? "");
  const [priority, setPriority] = useState<number>();
  const [category, setCategory] = useState<Category>();
  const [description, setDescription] = useState(initialDescription ?? "");
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

  const addTask = async () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskTitle,
      description: description,
      priority: priority ?? 1,
      category: category ?? {
        bg: "#000000",
        iconColor: "#ffffff",
        name: "",
        icon: "folder-outline",
      },
      date: selectedDate ?? "",
      time: selectedTime ?? "",
      completed: false,
    };
    const existingTasks = await AsyncStorage.getItem("tasks");

    const tasks: Task[] = existingTasks ? JSON.parse(existingTasks) : [];

    tasks.push(newTask);

    await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
    ToastAndroid.show("Task added successfully", ToastAndroid.SHORT);
    console.log(tasks, "tasks data");
    setTaskTitle("");
    setDescription("");
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setPriority(undefined);
    setCategory(undefined);
    onClose();
  };
  useEffect(() => {
    const fetchTask = async () => {
      if (initialTitle !== undefined) {
        setTaskTitle(initialTitle);
        setDescription(initialDescription ?? "");
      } else if (editId) {
        const existingTasks = await AsyncStorage.getItem("tasks");
        const tasks: Task[] = existingTasks ? JSON.parse(existingTasks) : [];
        const task = tasks.find((task) => task.id === editId);
        if (task) {
          setTaskTitle(task.title);
          setDescription(task.description);
          setSelectedDate(task.date);
          setSelectedTime(task.time);
          setPriority(task.priority);
          setCategory(task.category);
        }
      }
    };
    fetchTask();
  }, [editId, initialTitle, initialDescription]);

  const updateTitleAndDescriptionLocal = () => {
    updateTitleAndDescription?.(taskTitle, description);
    onClose();
  };
  return (
    <>
      <Modal
        animationType="slide"
        transparent
        visible={true}
        onRequestClose={onClose}
      >
        <View className={`flex-1 ${editId ? "justify-center" : "justify-end"}`}>
          {/* Backdrop: click outside to dismiss */}
          <Pressable
            className="absolute inset-0 bg-black/60"
            onPress={onClose}
          />

          {/* Bottom Sheet */}
          <View
            className={`${editId ? "rounded-2xl mx-4" : "rounded-t-2xl"} bg-[#363636] px-6 pt-6 pb-6`}
          >
            {/* Title */}
            <Text className="text-xl font-bold text-white/90">
              {editId ? "Edit Task" : "Add Task"}
            </Text>

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
            {!editId ? (
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
                  onPress={addTask}
                  hitSlop={8}
                  className="active:opacity-60"
                >
                  <Ionicons name="send" size={24} color="#8687E7" />
                </Pressable>
              </View>
            ) : (
              <View className="mt-6 w-full flex-row items-center gap-4">
                <Pressable
                  onPress={onClose}
                  className="h-[48px] flex-1 items-center justify-center rounded-[4px]"
                >
                  <Text className="text-white">Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={updateTitleAndDescriptionLocal}
                  className="h-[48px] flex-1 items-center justify-center rounded-[4px] button"
                >
                  <Text className="text-white">Edit</Text>
                </Pressable>
              </View>
            )}
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
        priority={priority}
        setPriority={setPriority}
      />
      <CategoryModal
        visible={openCategoryModal}
        onClose={handleCloseCategoryModal}
        setCategory={setCategory}
      />
    </>
  );
}

import { edit_icon } from "@/types/icons";
import { Categories, Task } from "@/types/interface";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, ToastAndroid, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import AddATask from "./add-a-task";
import CalendarModal from "./calendar-modal";
import CategoryModal from "./CategoryModal";
import DeleteModal from "./DeleteModal";
import TaskPriorityModal from "./TaskPriorityModal";
type ViewTaskDetailProps = {
  visible: boolean;
  onClose: () => void;
  selectedTaskId: string;
};

export default function ViewTaskDetail({
  visible,
  onClose,
  selectedTaskId,
}: ViewTaskDetailProps) {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [task, setTask] = useState<Task>();
  const [initialTask, setInitialTask] = useState<Task>();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openTimeEditModal, setOpenTimeEditModal] = useState(false);
  const [openCategoryEditModal, setOpenCategoryEditModal] = useState(false);
  const [openPriorityEditModal, setOpenPriorityEditModal] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await AsyncStorage.getItem("tasks");

        if (data) {
          const allTasks: Task[] = JSON.parse(data);
          const currentTask = allTasks.find((t) => t.id === selectedTaskId);
          if (currentTask) {
            setTask(currentTask);
            setInitialTask(currentTask);
          }
        }
      } catch (error) {
        console.log("Error fetching task detail:", error);
      }
    };

    if (selectedTaskId) {
      fetchTask();
    }
  }, [selectedTaskId, visible]);

  if (!task) {
    return null;
  }

  const getDateLabel = (date: string | Date) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(d, today)) return "Today";
    if (isSameDay(d, tomorrow)) return "Tomorrow";
    return d.toLocaleDateString();
  };
  console.log(task);

  const deleteTask = async () => {
    try {
      const data = await AsyncStorage.getItem("tasks");

      if (data) {
        const allTasks: Task[] = JSON.parse(data);
        const tasks = allTasks.filter((t) => t.id !== selectedTaskId);
        ToastAndroid.show("Task deleted successfully", ToastAndroid.SHORT);
        await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
        onClose();
      }
    } catch (error) {
      console.log("Error deleting task:", error);
    }
  };
  const updateTitleAndDescription = (title: string, description: string) => {
    setTask((prevTask) => {
      if (!prevTask) return prevTask;
      return {
        ...prevTask,
        title,
        description,
      };
    });
  };

  const updateTask = async () => {
    try {
      const data = await AsyncStorage.getItem("tasks");

      if (data) {
        const allTasks: Task[] = JSON.parse(data);
        const tasks = allTasks.map((t) => (t.id === task.id ? task : t));
        await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
        ToastAndroid.show("Task updated successfully", ToastAndroid.SHORT);
        router.push("/home");
      }
    } catch (error) {
      console.log("Error updating task:", error);
    }
  };

  const isChanged = Boolean(
    initialTask &&
    (task.title !== initialTask.title ||
      task.description !== initialTask.description ||
      task.date !== initialTask.date ||
      task.time !== initialTask.time ||
      task.priority !== initialTask.priority ||
      task.category?.id !== initialTask.category?.id ||
      task.category?.name !== initialTask.category?.name ||
      task.category?.background !== initialTask.category?.background),
  );

  const isSaveDisabled =
    !isChanged || !task.title?.trim() || !task.time?.trim();

  return (
    <>
      <DeleteModal
        visible={deleteModalVisible}
        taskTitle={task.title}
        onDelete={deleteTask}
        onClose={() => {
          setDeleteModalVisible(false);
        }}
      />
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={onClose}
      >
        <View
          className="flex-1 bg-[#121212] px-8 justify-between"
          style={{
            paddingTop: Math.max(insets.top, 4) + 4,
            paddingBottom: Math.max(insets.bottom, 4) + 4,
          }}
        >
          {/* Top buttons */}
          <View className="flex-row items-center justify-between">
            {/* Close */}
            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded bg-[#1D1D1D]"
            >
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.87)" />
            </Pressable>

            {/* Repeat */}
            <Pressable
              onPress={() => {
                // open repeat modal here
              }}
              className="h-8 w-8 items-center justify-center rounded bg-[#1D1D1D]"
            >
              <Ionicons
                name="repeat-outline"
                size={24}
                color="rgba(255,255,255,0.87)"
              />
            </Pressable>
          </View>

          {/* Task information */}
          <View className="mt-8 flex-row items-center justify-between">
            <View>
              {/* Title */}
              <View className="flex-row items-center">
                <View className="h-4 w-4 rounded-full border-[1.5px] border-white" />

                <Text className="ml-5 text-xl text-white/90">{task.title}</Text>
              </View>

              {/* Description */}
              {!!task.description && (
                <Text className="ml-9 mt-3 text-base text-[#AFAFAF]">
                  {task.description}
                </Text>
              )}
            </View>
            <Pressable onPress={() => setOpenEditModal(true)}>
              <SvgXml xml={edit_icon} width={24} height={24} />
            </Pressable>
          </View>
          {/* Task details */}
          <View className="mt-12 gap-6">
            {/* Task Time */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name="timer-outline"
                  size={24}
                  color="rgba(255,255,255,0.87)"
                />

                <Text className="ml-2 text-base text-white/90">
                  Task Time :
                </Text>
              </View>

              <Pressable
                onPress={() => setOpenTimeEditModal(true)}
                className="rounded-md bg-white/20 px-4 py-2"
              >
                <Text className="text-xs text-white/90">
                  {getDateLabel(task.date) + " " + task.time}
                </Text>
              </Pressable>
            </View>

            {/* Task Category */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name="pricetag-outline"
                  size={24}
                  color="rgba(255,255,255,0.87)"
                  className="-rotate-90"
                />

                <Text className="ml-2 text-base text-white/90">
                  Task Category :
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  setOpenCategoryEditModal(true);
                }}
                className="flex-row items-center rounded-md bg-white/20 px-4 py-2 gap-2"
              >
                <Ionicons
                  name={task.category?.icon}
                  size={16}
                  color={task.category?.background ?? "#FFFFFF"}
                />
                <Text className="text-xs text-white/90">
                  {task.category?.name}
                </Text>
              </Pressable>
            </View>

            {/* Task Priority */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name="flag-outline"
                  size={24}
                  color="rgba(255,255,255,0.87)"
                />

                <Text className="ml-2 text-base text-white/90">
                  Task Priority :
                </Text>
              </View>

              <Pressable
                onPress={() => setOpenPriorityEditModal(true)}
                className="rounded-md bg-white/20 px-4 py-2"
              >
                <Text className="text-xs text-white/90">
                  {task.priority ?? "Default"}
                </Text>
              </Pressable>
            </View>

            {/* Sub Task */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name="git-branch-outline"
                  size={24}
                  color="rgba(255,255,255,0.87)"
                />

                <Text className="ml-2 text-base text-white/90">Sub - Task</Text>
              </View>

              <Pressable className="rounded-md bg-white/20 px-4 py-2">
                <Text className="text-xs text-white/90">Add Sub - Task</Text>
              </Pressable>
            </View>
          </View>

          {/* Delete */}
          <Pressable
            onPress={() => {
              setDeleteModalVisible(true);
            }}
            className="mt-8 flex-row items-center"
          >
            <Ionicons name="trash-outline" size={24} color="#FF4949" />

            <Text className="ml-3 text-base text-[#FF4949]">Delete Task</Text>
          </Pressable>

          {/* Edit */}
          <Pressable
            onPress={() => {
              updateTask();
            }}
            disabled={isSaveDisabled}
            className={`mt-auto h-12 items-center justify-center rounded button ${
              isSaveDisabled ? "opacity-50" : "active:opacity-80"
            }`}
          >
            <Text className="text-base text-white">Edit Task</Text>
          </Pressable>
        </View>
      </Modal>
      {openEditModal && (
        <AddATask
          onClose={() => {
            setOpenEditModal(false);
          }}
          editId={selectedTaskId}
          initialTitle={task?.title}
          initialDescription={task?.description}
          updateTitleAndDescription={updateTitleAndDescription}
        />
      )}
      {openTimeEditModal && (
        <CalendarModal
          visible={openTimeEditModal}
          onClose={() => {
            setOpenTimeEditModal(false);
          }}
          selectedDate={task.date}
          onSelectDate={(newDate) => {
            setTask((prev) => (prev ? { ...prev, date: newDate } : prev));
          }}
          onSelectTime={(newTime) => {
            setTask((prev) => (prev ? { ...prev, time: newTime } : prev));
          }}
          initialTime={task.time}
          editId={task.id}
        />
      )}

      {openCategoryEditModal && (
        <CategoryModal
          visible={openCategoryEditModal}
          onClose={() => {
            setOpenCategoryEditModal(false);
          }}
          editId={task.id}
          initialCategory={task?.category as Categories}
          setCategory={(cat) =>
            setTask((prev) => (prev ? { ...prev, category: cat } : prev))
          }
        />
      )}

      {openPriorityEditModal && (
        <TaskPriorityModal
          visible={openPriorityEditModal}
          onClose={() => {
            setOpenPriorityEditModal(false);
          }}
          editId={task.id}
          initialPriority={task?.priority}
          setPriority={(priority) =>
            setTask((prev) => (prev ? { ...prev, priority } : prev))
          }
        />
      )}
    </>
  );
}

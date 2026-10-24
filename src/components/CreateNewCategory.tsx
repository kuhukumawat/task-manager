import { Categories } from "@/types/interface";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export type NewCategoryData = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  iconColor: string;
};

type CreateNewCategoryProps = {
  visible?: boolean;
  onClose?: () => void;
  onCreate?: (category: NewCategoryData) => void;
};

// Figma Color Palette
const PALETTE_COLORS = [
  "#6B6D1A", // olive
  "#2F7A1A", // green
  "#1A7A63", // teal
  "#1A4A80", // deep blue
  "#1A5F7A", // dark cyan
  "#8A4A14", // brown-orange
  "#9B2F2F", // dark red
  "#9B2F85", // dark pink
  "#7A1F80", // dark magenta
  "#1F7A3A", // forest green
  "#1F7A64", // dark mint
  "#1F5F8A", // steel blue
];

// Icons for category selection
const AVAILABLE_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  "restaurant-outline",
  "briefcase-outline",
  "football-outline",
  "color-palette-outline",
  "school-outline",
  "megaphone-outline",
  "musical-notes-outline",
  "heart-outline",
  "videocam-outline",
  "home-outline",
  "cart-outline",
  "book-outline",
  "fitness-outline",
  "car-outline",
  "game-controller-outline",
  "airplane-outline",
  "cafe-outline",
  "cash-outline",
  "code-slash-outline",
  "construct-outline",
  "flower-outline",
  "gift-outline",
  "laptop-outline",
  "medkit-outline",
];

export default function CreateNewCategory({
  visible = true,
  onClose,
  onCreate,
}: CreateNewCategoryProps) {
  const insets = useSafeAreaInsets();

  const [categoryName, setCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] =
    useState<keyof typeof Ionicons.glyphMap>("restaurant-outline");
  const [selectedColor, setSelectedColor] = useState(PALETTE_COLORS[0]);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleCreate = async () => {
    if (!categoryName.trim()) return;
    const cate = await AsyncStorage.getItem("categories");
    const newCate: Categories[] = cate ? JSON.parse(cate) : [];
    const matchedCate = newCate.filter(
      (i) => i.name.toLowerCase() === categoryName.trim().toLowerCase(),
    );
    if (matchedCate.length > 0) {
      ToastAndroid.show("Category already exists", ToastAndroid.SHORT);
      return;
    }
    const Id =
      categoryName.toLowerCase().replace(/\s+/g, "-") + new Date().getTime();
    newCate.push({
      id: Id,
      name: categoryName.trim(),
      icon: selectedIcon,
      background: selectedColor,
      iconColor: "#FFFFFF",
    });

    await AsyncStorage.setItem("categories", JSON.stringify(newCate));
    onCreate?.({
      id: Id,
      name: categoryName.trim(),
      icon: selectedIcon,
      background: selectedColor,
      iconColor: "#FFFFFF",
    });

    onClose?.();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-[#121212] px-6 justify-between"
        style={{
          paddingTop: Math.max(insets.top, 24) + 16,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Title */}
          <Text className="text-xl font-bold tracking-tight text-white/90">
            Create new category
          </Text>

          {/* 1. Category name */}
          <View className="mt-8">
            <Text className="text-base text-white/90">Category name :</Text>

            <View className="mt-4 h-12 flex-row items-center rounded border border-[#979797] bg-[#1D1D1D] px-3">
              <TextInput
                placeholder="Category name"
                placeholderTextColor="#AFAFAF"
                value={categoryName}
                onChangeText={setCategoryName}
                className="flex-1 text-base text-white"
              />
            </View>
          </View>

          {/* 2. Category icon */}
          <View className="mt-8">
            <Text className="text-base text-white/90">Category icon :</Text>

            <View className="mt-4 flex-row items-center gap-3">
              {selectedIcon && (
                <Pressable
                  onPress={() => setShowIconPicker(true)}
                  className="flex-row items-center rounded-md bg-white/20 px-4 py-2 active:opacity-70"
                >
                  <Text className="text-xs text-white/90">
                    Choose icon from library
                  </Text>
                </Pressable>
              )}

              {/* Icon Preview */}
              <View
                className="h-10 w-10 items-center justify-center rounded-[4px]"
                style={{ backgroundColor: selectedColor }}
              >
                <Ionicons name={selectedIcon} size={22} color="#FFFFFF" />
              </View>
            </View>
          </View>

          {/* 3. Category color */}
          <View className="mt-8">
            <Text className="text-base text-white/90">Category color :</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4"
              contentContainerStyle={{ gap: 12 }}
            >
              {PALETTE_COLORS.map((color) => {
                const isSelected = selectedColor === color;

                return (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    className="h-9 w-9 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: color,
                      borderWidth: isSelected ? 3 : 0,
                      borderColor: "#FFFFFF",
                    }}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View className="flex-row items-center gap-4 pt-4">
          {/* Cancel */}
          <Pressable
            onPress={onClose}
            className="h-12 flex-1 items-center justify-center rounded active:opacity-60"
          >
            <Text className="text-base font-normal text-[#8687E7]">Cancel</Text>
          </Pressable>

          {/* Create Category */}
          <Pressable
            onPress={handleCreate}
            disabled={!categoryName.trim()}
            className={`h-12 flex-1 items-center justify-center rounded button active:opacity-80 ${
              !categoryName.trim() ? "opacity-50" : ""
            }`}
          >
            <Text className="text-base font-normal text-white">
              Create Category
            </Text>
          </Pressable>
        </View>

        {/* Icon Picker Dialog */}
        <Modal
          animationType="fade"
          transparent
          visible={showIconPicker}
          onRequestClose={() => setShowIconPicker(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/70 px-6">
            <View className="w-full max-w-[327px] rounded bg-[#363636] p-5">
              <Text className="text-center text-base font-bold text-white/90">
                Choose Icon
              </Text>

              <View className="my-3 h-[1px] bg-[#979797]" />

              <View className="flex-row flex-wrap justify-between gap-y-3">
                {AVAILABLE_ICONS.map((iconName) => {
                  const isSelected = selectedIcon === iconName;

                  return (
                    <Pressable
                      key={iconName}
                      onPress={() => {
                        setSelectedIcon(iconName);
                        setShowIconPicker(false);
                      }}
                      className={`h-12 w-12 items-center justify-center rounded-[4px] ${
                        isSelected ? "button" : "bg-[#272727]"
                      }`}
                    >
                      <Ionicons
                        name={iconName}
                        size={24}
                        color={
                          isSelected ? "#FFFFFF" : "rgba(255,255,255,0.87)"
                        }
                      />
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={() => setShowIconPicker(false)}
                className="mt-4 items-center py-2"
              >
                <Text className="text-sm font-medium text-[#8687E7]">
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

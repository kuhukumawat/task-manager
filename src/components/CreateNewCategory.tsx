import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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
  "#C9CC41",
  "#66CC41",
  "#41CCA7",
  "#4181CC",
  "#41A2CC",
  "#CC8441",
  "#FF8080",
  "#FF80EB",
  "#FC80FF",
  "#80FFA3",
  "#80FFD1",
  "#80D1FF",
];

// Icons for category selection
const AVAILABLE_ICONS: Array<keyof typeof Ionicons.glyphMap> = [
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

  const handleCreate = () => {
    if (!categoryName.trim()) return;

    onCreate?.({
      id: categoryName.toLowerCase().replace(/\s+/g, "-"),
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
              {!selectedIcon && (
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
            className={`h-12 flex-1 items-center justify-center rounded bg-[#8687E7] active:opacity-80 ${
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
                        isSelected ? "bg-[#8687E7]" : "bg-[#272727]"
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

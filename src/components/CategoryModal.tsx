import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import CreateNewCategory, { NewCategoryData } from "./CreateNewCategory";

type Category = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  iconColor: string;
};

const CATEGORIES: Category[] = [
  {
    id: "grocery",
    name: "Grocery",
    icon: "restaurant-outline",
    background: "#CCFF80",
    iconColor: "#21A300",
  },
  {
    id: "work",
    name: "Work",
    icon: "briefcase-outline",
    background: "#FF9680",
    iconColor: "#A31D00",
  },
  {
    id: "sport",
    name: "Sport",
    icon: "football-outline",
    background: "#80FFFF",
    iconColor: "#00A32F",
  },
  {
    id: "design",
    name: "Design",
    icon: "color-palette-outline",
    background: "#80FFD9",
    iconColor: "#00A372",
  },
  {
    id: "university",
    name: "University",
    icon: "school-outline",
    background: "#809CFF",
    iconColor: "#0055A3",
  },
  {
    id: "social",
    name: "Social",
    icon: "megaphone-outline",
    background: "#FF80EB",
    iconColor: "#A30089",
  },
  {
    id: "music",
    name: "Music",
    icon: "musical-notes-outline",
    background: "#FC80FF",
    iconColor: "#A000A3",
  },
  {
    id: "health",
    name: "Health",
    icon: "heart-outline",
    background: "#80FFA3",
    iconColor: "#00A3A3",
  },

  {
    id: "movie",
    name: "Movie",
    icon: "videocam-outline",
    background: "#80D1FF",
    iconColor: "#0069A3",
  },
  {
    id: "home",
    name: "Home",
    icon: "home-outline",
    background: "#FF8080",
    iconColor: "#A30000",
  },
];

type CategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (category: string) => void;
};

export default function CategoryModal({
  visible,
  onClose,
  onSelect,
}: CategoryModalProps) {
  const [categoriesList, setCategoriesList] = useState<Category[]>(CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSelect = (category: Category | NewCategoryData) => {
    setSelectedCategory(category.id);
    onSelect?.(category.name);
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
        {/* Category Box */}
        <View className="h-[556px] w-[327px] rounded-[4px] bg-[#363636] flex gap-6 py-6 px-5 overflow-auto">
          {/* Title */}
          <Text className=" text-center text-base font-bold text-white/90">
            Choose Category
          </Text>

          {/* Divider */}
          <View className="h-[1px] bg-[#979797]" />

          {/* Categories */}
          <View className="flex-row flex-wrap gap-x-12 gap-y-3">
            {categoriesList.map((category) => {
              const isSelected = selectedCategory === category.id;

              return (
                <Pressable
                  key={category.id}
                  onPress={() => handleSelect(category)}
                  className=" h-[90px] w-[64px] items-center"
                >
                  {/* Category icon box */}
                  <View
                    className={`h-[64px] w-[64px] items-center justify-center rounded-[4px] ${
                      isSelected ? "border-2 border-white" : ""
                    }`}
                    style={{
                      backgroundColor: category.background,
                    }}
                  >
                    <Ionicons
                      name={category.icon}
                      size={32}
                      color={category.iconColor}
                    />
                  </View>

                  {/* Category name */}
                  <Text
                    numberOfLines={1}
                    className="mt-[5px] text-center text-sm font-medium text-white/90"
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}

            {/* Create New */}
            <Pressable
              onPress={() => setShowCreateModal(true)}
              className="mb-[16px] mr-[49px] h-[90px] w-[64px] items-center active:opacity-70"
            >
              <View className="h-[64px] w-[64px] items-center justify-center rounded-[4px] bg-[#80FFD1]">
                <Ionicons name="add" size={32} color="#00A369" />
              </View>

              <Text
                numberOfLines={1}
                className="mt-[5px] text-center text-sm font-medium text-white/90 w-full"
              >
                Create
              </Text>
            </Pressable>
          </View>

          {/* Add Category */}
          <Pressable
            onPress={onClose}
            className="absolute bottom-[11px] left-[19px] h-[48px] w-[289px] items-center justify-center rounded-[4px] bg-[#8687E7] active:opacity-80"
          >
            <Text className="text-base text-white">Add Category</Text>
          </Pressable>
        </View>
      </View>

      <CreateNewCategory
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(newCat) => {
          setCategoriesList((prev) => [...prev, newCat]);
          handleSelect(newCat);
          setShowCreateModal(false);
        }}
      />
    </Modal>
  );
}

import { Categories } from "@/types/interface";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import CreateNewCategory, { NewCategoryData } from "./CreateNewCategory";

type Category = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  iconColor: string;
};

type CategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  category?: Categories;
  setCategory?: (category: Categories) => void;
  editId?: string;
  initialCategory?: Category;
};

export default function CategoryModal({
  visible,
  onClose,
  category,
  setCategory,
  editId,
  initialCategory,
}: CategoryModalProps) {
  const [categoriesList, setCategoriesList] = useState<Categories[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cat, setCat] = useState(initialCategory);
  const handleSelect = (cat: Category | NewCategoryData) => {
    setSelectedCategory(cat.id);
    // setCategory?.(cat as Categories);
    setCategory?.(cat as Categories);
    setCat(cat as Categories);
  };
  const loadCategories = async () => {
    const existing = await AsyncStorage.getItem("categories");
    const categories = existing ? JSON.parse(existing) : [];
    setCategoriesList(categories);
    console.log(categories);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Dark overlay */}
      <Pressable
        className="flex-1 items-center justify-center absolute inset-0 bg-black/60"
        onPress={() => onClose()}
      >
        {/* Category Box */}

        <Pressable
          className="h-[556px] w-[327px] rounded-[4px] bg-[#363636] flex gap-6 py-6 px-4 overflow-hidden"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <Text className="text-center text-base font-bold text-white/90">
            {editId ? "Edit Category" : "Choose Category"}
          </Text>

          {/* Divider */}
          <View className="h-[1px] bg-[#979797]" />

          {/* Categories */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            <View className="flex-row flex-wrap">
              {categoriesList.map((category) => {
                const isSelected = cat?.id === category.id;

                return (
                  <View key={category.id} className="w-1/3 items-center mb-4">
                    <Pressable
                      onPress={() => handleSelect(category)}
                      className="items-center"
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
                        className="mt-[5px] w-[80px] text-center text-sm font-medium text-white/90"
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}

              {/* Create New */}
              <View className="w-1/3 items-center mb-4">
                <Pressable
                  onPress={() => setShowCreateModal(true)}
                  className="items-center active:opacity-70"
                >
                  <View className="h-[64px] w-[64px] items-center justify-center rounded-[4px] bg-[#80FFD1]">
                    <Ionicons name="add" size={32} color="#00A369" />
                  </View>

                  <Text
                    numberOfLines={1}
                    className="mt-[5px] w-[80px] text-center text-sm font-medium text-white/90"
                  >
                    Create
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          {/* Add Category */}
          <Pressable
            onPress={onClose}
            className="absolute bottom-[11px] left-[19px] h-[48px] w-[289px] items-center justify-center rounded-[4px] button active:opacity-80"
          >
            <Text className="text-base text-white">
              {editId ? "Edit Category" : "Add Category"}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>

      <CreateNewCategory
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(newCat) => {
          handleSelect(newCat);
          setShowCreateModal(false);
        }}
      />
    </Modal>
  );
}

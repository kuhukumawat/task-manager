import { Ionicons } from "@expo/vector-icons";

export type Category = {
  id?: string;
  bg?: string;
  background?: string;
  iconColor: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: number;
  category: Category;
  date: string;
  time: string;
  completed: boolean;
};
export type Categories = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  iconColor: string;
};
export type User = {
  identifier: string;
  password: string;
  email: string;
  isLoggedIn?: boolean;
  name?: string;
  avatarUri?: string;
};

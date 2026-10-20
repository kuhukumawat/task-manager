import create from "@/assets/create.svg";
import manage from "@/assets/manage.svg";
import organize from "@/assets/organise.svg";
import { useRouter } from "expo-router";
import { FC, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgProps } from "react-native-svg";

interface OnboardingSlide {
  id: string;
  image: FC<SvgProps>;
  imageWidth: number;
  imageHeight: number;
  title: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    image: manage,
    imageWidth: 277,
    imageHeight: 213,
    title: "Manage your tasks",
    description:
      "You can easily manage all of your daily tasks in DoMe for free",
  },
  {
    id: "2",
    image: create,
    imageWidth: 296,
    imageHeight: 271,
    title: "Create daily routine",
    description:
      "In Uptodo you can create your personalized routine to stay productive",
  },
  {
    id: "3",
    image: organize,
    imageWidth: 251,
    imageHeight: 251,
    title: "Organize your tasks",
    description:
      "You can organize your daily tasks by adding your tasks into separate categories",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === SLIDES.length - 1;
  const currentSlide = SLIDES[currentIndex];

  const handleNext = () => {
    if (isLastSlide) {
      router.push("/start");
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstSlide) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    router.push("/start");
  };

  return (
    <View
      className="flex-1  justify-between py-20 px-10"
      // style={{
      //     paddingTop: Math.max(insets.top, 16),
      //     paddingBottom: Math.max(insets.bottom, 24),
      // }}
    >
      {/* Top Header: SKIP button */}
      <View className="h-10 flex-row items-center justify-between">
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text className="text-sm text-white/45 font-medium">SKIP</Text>
        </Pressable>
      </View>

      {/* Main Content Area */}
      <View className="items-center   justify-center">
        {/* Illustration */}
        <View className="rounded-3xl overflow-hidden justify-center items-center mb-8">
          <currentSlide.image
            width={currentSlide.imageWidth}
            height={currentSlide.imageHeight}
          />
        </View>

        {/* Step Indicators (Figma NAV Rectangles 100, 101, 102) */}
        <View className="flex-row items-center justify-center gap-2 mb-10">
          {SLIDES.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                style={{
                  width: 26,
                  height: 4,
                  borderRadius: 56,
                  backgroundColor: isActive
                    ? "rgba(255, 255, 255, 0.87)"
                    : "#AFAFAF",
                  opacity: isActive ? 1 : 0.4,
                }}
              />
            );
          })}
        </View>

        {/* Title */}
        <Text className="text-[32px] leading-[38px] font-bold text-center text-white/90 mb-6">
          {currentSlide.title}
        </Text>

        {/* Subtitle / Description */}
        <Text className="text-base leading-[24px] text-center text-white/85 px-4 max-w-[320px]">
          {currentSlide.description}
        </Text>
      </View>

      {/* Bottom Controls: BACK and NEXT / GET STARTED */}
      <View className="flex-row items-center justify-between  pt-4">
        {/* BACK button */}
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          disabled={isFirstSlide}
          style={{ opacity: isFirstSlide ? 0 : 1 }}
        >
          <Text className="text-base  text-white/45 font-medium">BACK</Text>
        </Pressable>

        {/* NEXT / GET STARTED button (Figma Frame 121) */}
        <Pressable
          onPress={handleNext}
          className="button px-10 py-3 items-center justify-center active:opacity-80"
        >
          <Text className="text-base  text-white font-medium">
            {isLastSlide ? "GET STARTED" : "NEXT"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

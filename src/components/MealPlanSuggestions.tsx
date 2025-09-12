import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { FoodItem } from "../types";

interface MealPlanSuggestionsProps {
  onAddMeal: (meal: FoodItem, mealType: "breakfast" | "lunch" | "dinner" | "snack") => void;
  onViewFullPlan: () => void;
}

// Sample meal suggestions based on time of day
const getMealSuggestions = () => {
  const hour = new Date().getHours();
  
  if (hour < 10) {
    // Morning suggestions
    return {
      title: "早餐建議",
      mealType: "breakfast" as const,
           suggestions: [
            {
              id: "breakfast_quick_1",
              name: "Quick Breakfast",
              nameZh: "燕麥配香蕉",
              calories: 280,
              protein: 12,
              carbs: 52,
              fat: 6,
              servingSize: "1 bowl",
              servingNameZh: "1 碗",
              isCustom: false,
           cookingMethod: "boiled" as const,
          portionHints: ["半份", "1 份", "大份"],
          sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
            },
        {
          id: "breakfast_quick_2",
          name: "Egg Toast",
          nameZh: "雞蛋吐司",
          calories: 320,
          protein: 18,
          carbs: 35,
          fat: 12,
          servingSize: "1 set",
          servingNameZh: "1 份",
          isCustom: false,
          cookingMethod: "boiled" as const,
          portionHints: ["半份", "1 份", "大份"],
          sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
        }
      ]
    };
  } else if (hour < 14) {
    // Lunch suggestions
    return {
      title: "午餐建議",
      mealType: "lunch" as const,
      suggestions: [
        {
          id: "lunch_quick_1",
          name: "Chicken Rice Bowl",
          nameZh: "雞肉飯",
          calories: 520,
          protein: 35,
          carbs: 58,
          fat: 12,
          servingSize: "1 bowl",
          servingNameZh: "1 碗",
          isCustom: false,
          cookingMethod: "boiled" as const,
          portionHints: ["半份", "1 份", "大份"],
          sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
        },
        {
          id: "lunch_quick_2",
          name: "Vegetable Stir-fry",
          nameZh: "蔬菜炒飯",
          calories: 420,
          protein: 15,
          carbs: 65,
          fat: 12,
          servingSize: "1 plate",
          servingNameZh: "1 盤",
          isCustom: false,
          cookingMethod: "boiled" as const,
          portionHints: ["半份", "1 份", "大份"],
          sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
        }
      ]
    };
  } else if (hour < 18) {
    // Afternoon snack suggestions
    return {
      title: "下午茶建議",
      mealType: "snack" as const,
      suggestions: [
        {
          id: "snack_quick_1",
          name: "Greek Yogurt",
          nameZh: "希臘優格",
          calories: 150,
          protein: 15,
          carbs: 18,
          fat: 3,
          servingSize: "1 cup",
          servingNameZh: "1 杯",
          isCustom: false,
          cookingMethod: "boiled" as const,
          portionHints: ["半份", "1 份", "大份"],
          sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
        },
        {
          id: "snack_quick_2",
          name: "Mixed Nuts",
          nameZh: "綜合堅果",
          calories: 180,
          protein: 6,
          carbs: 8,
          fat: 16,
          servingSize: "1 handful",
          servingNameZh: "1 把",
          isCustom: false,
          cookingMethod: "boiled" as const,
          portionHints: ["半份", "1 份", "大份"],
          sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
        }
      ]
    };
  } else {
    // Dinner suggestions
    return {
      title: "晚餐建議",
      mealType: "dinner" as const,
      suggestions: [
        {
          id: "dinner_quick_1",
          name: "Steamed Fish",
          nameZh: "清蒸魚配菜",
          calories: 450,
          protein: 38,
          carbs: 25,
          fat: 22,
          servingSize: "1 serving",
          servingNameZh: "1 份",
          isCustom: false,
          cookingMethod: "boiled" as const,
          portionHints: ["半份", "1 份", "大份"],
          sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
        },
        {
          id: "dinner_quick_2",
          name: "Tofu Soup",
          nameZh: "豆腐湯",
          calories: 320,
          protein: 22,
          carbs: 28,
          fat: 14,
          servingSize: "1 bowl",
          servingNameZh: "1 碗",
          isCustom: false,
          cookingMethod: "boiled" as const,
          portionHints: ["半份", "1 份", "大份"],
          sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
        }
      ]
    };
  }
};

export default function MealPlanSuggestions({ onAddMeal, onViewFullPlan }: MealPlanSuggestionsProps) {
  const mealData = getMealSuggestions();

  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="restaurant-outline" size={20} color="#000" />
            <Text className="text-lg font-semibold text-black ml-2">{mealData.title}</Text>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onViewFullPlan();
            }}
            className="flex-row items-center"
            accessibilityRole="button"
            accessibilityLabel="查看完整餐點計畫"
          >
            <Text allowFontScaling={false} className="text-blue-600 text-sm font-medium mr-1">查看完整計畫</Text>
            <Ionicons name="chevron-forward" size={16} color="#2563EB" />
          </Pressable>
        </View>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-4">
          <View className="flex-row">
            {mealData.suggestions.map((meal, idx) => (
              <View key={meal.id} className={`bg-gray-50 rounded-xl p-3 w-48 ${idx < mealData.suggestions.length - 1 ? "mr-3" : ""}`}>
                <Text allowFontScaling={false} className="font-medium text-black mb-1" numberOfLines={1}>
                  {meal.nameZh}
                </Text>
                <Text allowFontScaling={false} className="text-gray-600 text-sm">
                  {meal.calories} kcal • 蛋白質 {meal.protein}g
                </Text>
                <View className="flex-row flex-wrap mt-2 mb-2">
                  {meal.cookingMethod && (
                    <View className="px-2 py-1 bg-gray-100 rounded-lg mr-2 mb-2">
                      <Text className="text-xs text-gray-700">烹煮方式：{meal.cookingMethod === "boiled"?"水煮": meal.cookingMethod === "steamed"?"清蒸": meal.cookingMethod === "grilled"?"烤": meal.cookingMethod === "baked"?"烘烤": meal.cookingMethod === "stir_fry"?"快炒": meal.cookingMethod === "deep_fry"?"油炸":"其他"}</Text>
                    </View>
                  )}
                  {meal.portionHints?.slice(0,2).map((h, i) => (
                    <View key={i} className="px-2 py-1 bg-white border border-gray-200 rounded-lg mr-2 mb-2">
                      <Text className="text-xs text-gray-700">份量建議：{h}</Text>
                    </View>
                  ))}
                </View>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onAddMeal(meal, mealData.mealType);
                  }}
                  className="bg-black px-3 py-2 rounded-lg"
                  accessibilityRole="button"
                  accessibilityLabel={`新增 ${meal.nameZh} 到今日飲食記錄`}
                >
                  <Text allowFontScaling={false} className="text-white text-sm font-medium text-center">
                    快速新增
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
      </ScrollView>
    </View>
  );
}
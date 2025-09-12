import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";

// Components
import BrandLogo from "../components/BrandLogo";

// Stores
import { useUserStore } from "../state/userStore";
import { useFoodStore } from "../state/foodStore";

// Types
import { FoodItem } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MealPlan {
  id: string;
  day: string;
  dayZh: string;
  meals: {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
    snack: FoodItem[];
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

const daysOfWeek = [
  { id: "monday", label: "週一", labelEn: "Monday" },
  { id: "tuesday", label: "週二", labelEn: "Tuesday" },
  { id: "wednesday", label: "週三", labelEn: "Wednesday" },
  { id: "thursday", label: "週四", labelEn: "Thursday" },
  { id: "friday", label: "週五", labelEn: "Friday" },
  { id: "saturday", label: "週六", labelEn: "Saturday" },
  { id: "sunday", label: "週日", labelEn: "Sunday" },
];

const mealTypes = [
  { id: "breakfast", label: "早餐", icon: "sunny" as const },
  { id: "lunch", label: "午餐", icon: "partly-sunny" as const },
  { id: "dinner", label: "晚餐", icon: "moon" as const },
  { id: "snack", label: "點心", icon: "cafe" as const },
];

// Sample meal suggestions for Taiwan users
const sampleMeals: Record<string, FoodItem[]> = {
  breakfast: [
    {
      id: "breakfast_1",
      name: "Taiwanese Breakfast Set",
      nameZh: "台式早餐組合",
      calories: 420,
      protein: 18,
      carbs: 45,
      fat: 16,
      servingSize: "1 set",
      servingNameZh: "1 份",
      isCustom: false,
      cookingMethod: "boiled",
      portionHints: ["半份", "1 份", "大份"],
      sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
    },
    {
      id: "breakfast_2", 
      name: "Oatmeal with Fruits",
      nameZh: "水果燕麥粥",
      calories: 280,
      protein: 12,
      carbs: 52,
      fat: 6,
      servingSize: "1 bowl",
      servingNameZh: "1 碗",
      isCustom: false,
      cookingMethod: "boiled",
      portionHints: ["半份", "1 份", "大份"],
      sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
    },
  ],
  lunch: [
    {
      id: "lunch_1",
      name: "Grilled Chicken Rice Bowl",
      nameZh: "烤雞肉飯",
      calories: 520,
      protein: 35,
      carbs: 58,
      fat: 12,
      servingSize: "1 bowl",
      servingNameZh: "1 碗",
      isCustom: false,
      cookingMethod: "boiled",
      portionHints: ["半份", "1 份", "大份"],
      sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
    },
    {
      id: "lunch_2",
      name: "Vegetable Stir-fry with Tofu",
      nameZh: "豆腐炒青菜",
      calories: 380,
      protein: 22,
      carbs: 35,
      fat: 18,
      servingSize: "1 plate",
      servingNameZh: "1 盤",
      isCustom: false,
      cookingMethod: "boiled",
      portionHints: ["半份", "1 份", "大份"],
      sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
    },
  ],
  dinner: [
    {
      id: "dinner_1",
      name: "Steamed Fish with Vegetables",
      nameZh: "清蒸魚配蔬菜",
      calories: 450,
      protein: 38,
      carbs: 25,
      fat: 22,
      servingSize: "1 serving",
      servingNameZh: "1 份",
      isCustom: false,
      cookingMethod: "boiled",
      portionHints: ["半份", "1 份", "大份"],
      sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
    },
    {
      id: "dinner_2",
      name: "Lean Pork Soup with Rice",
      nameZh: "瘦肉湯配飯",
      calories: 420,
      protein: 28,
      carbs: 48,
      fat: 10,
      servingSize: "1 bowl",
      servingNameZh: "1 碗",
      isCustom: false,
      cookingMethod: "boiled",
      portionHints: ["半份", "1 份", "大份"],
      sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
    },
  ],
  snack: [
    {
      id: "snack_1",
      name: "Greek Yogurt with Berries",
      nameZh: "希臘優格配莓果",
      calories: 150,
      protein: 15,
      carbs: 18,
      fat: 3,
      servingSize: "1 cup",
      servingNameZh: "1 杯",
      isCustom: false,
      cookingMethod: "boiled",
      portionHints: ["半份", "1 份", "大份"],
      sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
    },
    {
      id: "snack_2",
      name: "Mixed Nuts",
      nameZh: "綜合堅果",
      calories: 180,
      protein: 6,
      carbs: 8,
      fat: 16,
      servingSize: "1 handful",
      servingNameZh: "1 把",
      isCustom: false,
      cookingMethod: "boiled",
      portionHints: ["半份", "1 份", "大份"],
      sizeOptions: [{ label: "小份", factor: 0.75, zh: "小份" }, { label: "中份", factor: 1, zh: "中份" }, { label: "大份", factor: 1.5, zh: "大份" }],
    },
  ],
};

export default function MealPlanScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useUserStore();
  const { addFoodLog } = useFoodStore();
  
  const [selectedDay, setSelectedDay] = useState("monday");
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, MealPlan>>({});

  const generateWeeklyPlan = () => {
    if (!user) return;

    const newWeeklyPlan: Record<string, MealPlan> = {};
    
    daysOfWeek.forEach(day => {
      const meals = {
        breakfast: [sampleMeals.breakfast[Math.floor(Math.random() * sampleMeals.breakfast.length)]],
        lunch: [sampleMeals.lunch[Math.floor(Math.random() * sampleMeals.lunch.length)]],
        dinner: [sampleMeals.dinner[Math.floor(Math.random() * sampleMeals.dinner.length)]],
        snack: [sampleMeals.snack[Math.floor(Math.random() * sampleMeals.snack.length)]],
      };
      
      const totalCalories = Object.values(meals).flat().reduce((sum, food) => sum + food.calories, 0);
      const totalProtein = Object.values(meals).flat().reduce((sum, food) => sum + food.protein, 0);
      const totalCarbs = Object.values(meals).flat().reduce((sum, food) => sum + food.carbs, 0);
      const totalFat = Object.values(meals).flat().reduce((sum, food) => sum + food.fat, 0);
      
      newWeeklyPlan[day.id] = {
        id: day.id,
        day: day.id,
        dayZh: day.label,
        meals,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      };
    });
    
    setWeeklyPlan(newWeeklyPlan);
    Alert.alert("計畫生成完成", "已為您生成本週的個人化餐點計畫");
  };

  const addMealToToday = (meal: FoodItem, mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    if (!user) return;
    const defaultSize = meal.sizeOptions?.find(s => s.factor === 1) || meal.sizeOptions?.[0];
    const foodLog = {
      userId: user.id,
      foodId: meal.id,
      foodName: meal.nameZh,
      servings: 1,
      calories: meal.calories * (defaultSize?.factor || 1),
      protein: meal.protein * (defaultSize?.factor || 1),
      carbs: meal.carbs * (defaultSize?.factor || 1),
      fat: meal.fat * (defaultSize?.factor || 1),
      mealType,
      loggedAt: new Date().toISOString(),
      source: "meal_plan" as const,
      selectedCookingMethod: meal.cookingMethod,
      selectedServingLabel: defaultSize?.zh || defaultSize?.label || meal.servingNameZh,
      sizeFactor: defaultSize?.factor || 1,
    };
    addFoodLog(foodLog);
    Alert.alert("已新增", `${meal.nameZh} 已新增到今日的${mealTypes.find(m => m.id === mealType)?.label}`);
  };

  const currentDayPlan = weeklyPlan[selectedDay];

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-semibold text-black">請先完成設定</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <BrandLogo size="small" />
          <Pressable onPress={generateWeeklyPlan}>
            <Ionicons name="refresh" size={24} color="#000000" />
          </Pressable>
        </View>
        <Text className="text-2xl font-bold text-black mt-4">週間餐點計畫</Text>
        <Text className="text-gray-600">個人化營養規劃</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Generate Plan Button */}
        {Object.keys(weeklyPlan).length === 0 && (
          <View className="px-6 py-8">
            <View className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 items-center">
              <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
              <Text className="text-xl font-semibold text-black mt-4 mb-2">
                開始您的餐點計畫
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                根據您的目標和偏好，為您生成個人化的週間餐點計畫
              </Text>
              <Pressable
                onPress={generateWeeklyPlan}
                className="bg-black px-8 py-4 rounded-xl"
              >
                <Text className="text-white font-semibold text-lg">生成餐點計畫</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Day Selector */}
        {Object.keys(weeklyPlan).length > 0 && (
          <>
            <View className="px-6 py-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {daysOfWeek.map((day, idx) => (
                    <Pressable
                      key={day.id}
                      onPress={() => setSelectedDay(day.id)}
                      className={`px-4 py-2 rounded-xl border-2 ${
                        selectedDay === day.id
                          ? "border-black bg-gray-50"
                          : "border-gray-200 bg-white"
                      } ${idx < daysOfWeek.length - 1 ? "mr-3" : ""}`}
                    >
                      <Text className={`font-medium ${
                        selectedDay === day.id ? "text-black" : "text-gray-600"
                      }`}>
                        {day.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Daily Summary */}
            {currentDayPlan && (
              <View className="px-6 mb-4">
                <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <Text className="text-lg font-semibold text-black mb-3">
                    {currentDayPlan.dayZh} 營養總計
                  </Text>
                  <View className="flex-row justify-between">
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-black">
                        {currentDayPlan.totalCalories}
                      </Text>
                      <Text className="text-gray-600 text-sm">大卡</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-lg font-semibold text-blue-600">
                        {currentDayPlan.totalProtein}g
                      </Text>
                      <Text className="text-gray-600 text-sm">蛋白質</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-lg font-semibold text-green-600">
                        {currentDayPlan.totalCarbs}g
                      </Text>
                      <Text className="text-gray-600 text-sm">碳水</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-lg font-semibold text-orange-600">
                        {currentDayPlan.totalFat}g
                      </Text>
                      <Text className="text-gray-600 text-sm">脂肪</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Meal Plan Details */}
            {currentDayPlan && (
              <View className="px-6 pb-8">
                {mealTypes.map((mealType) => (
                  <View key={mealType.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center">
                        <Ionicons name={mealType.icon} size={20} color="#000000" />
                        <Text className="text-lg font-semibold text-black ml-2">
                          {mealType.label}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          const meal = currentDayPlan.meals[mealType.id as keyof typeof currentDayPlan.meals][0];
                          if (meal) {
                            addMealToToday(meal, mealType.id as "breakfast" | "lunch" | "dinner" | "snack");
                          }
                        }}
                        className="bg-black px-3 py-1 rounded-lg"
                      >
                        <Text className="text-white text-sm font-medium">新增到今日</Text>
                      </Pressable>
                    </View>
                    
                    {currentDayPlan.meals[mealType.id as keyof typeof currentDayPlan.meals].map((food, index) => (
                      <View key={index} className="border-t border-gray-100 pt-3 mt-3">
                        <Text className="font-medium text-black">{food.nameZh}</Text>
                        <Text className="text-gray-600 text-sm mt-1">
                          {food.calories} kcal • 蛋白質 {food.protein}g • 碳水 {food.carbs}g • 脂肪 {food.fat}g
                        </Text>
                        <View className="flex-row flex-wrap mt-2">
                          {food.cookingMethod && (
                            <View className="px-2 py-1 bg-gray-100 rounded-lg mr-2 mb-2">
                              <Text className="text-xs text-gray-700">烹煮方式：{food.cookingMethod === "boiled"?"水煮": food.cookingMethod === "steamed"?"清蒸": food.cookingMethod === "grilled"?"烤": food.cookingMethod === "baked"?"烘烤": food.cookingMethod === "stir_fry"?"快炒": food.cookingMethod === "deep_fry"?"油炸":"其他"}</Text>
                            </View>
                          )}
                          {food.portionHints?.slice(0,3).map((h, i) => (
                            <View key={i} className="px-2 py-1 bg-white border border-gray-200 rounded-lg mr-2 mb-2">
                              <Text className="text-xs text-gray-700">份量建議：{h}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
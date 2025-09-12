import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SectionList,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import BrandLogo from "../components/BrandLogo";
import SegmentedGroup from "../components/SegmentedGroup";
import StackedNutritionBars from "../components/charts/StackedNutritionBars";
import MealPlanSuggestions from "../components/MealPlanSuggestions";
import ExercisePlanSuggestions from "../components/ExercisePlanSuggestions";
import { FoodItem } from "../types";
import { useFoodStore } from "../state/foodStore";
import { useExerciseStore } from "../state/exerciseStore";
import { useUserStore } from "../state/userStore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function FoodLogScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { getLogsByDate, deleteFoodLog, addFoodLog } = useFoodStore();
  const { getLogsByDate: getExerciseByDate } = useExerciseStore();
  const { getDailyCalorieTarget, getMacroTargets, user } = useUserStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [range, setRange] = useState<"day" | "week" | "month">("day");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const dateLabel = selectedDate.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const iso = toDateString(selectedDate);
  const dayFoodLogs = useMemo(() => getLogsByDate(iso), [getLogsByDate, iso]);
  const dayExerciseLogs = useMemo(() => getExerciseByDate(iso), [getExerciseByDate, iso]);

  const filteredFoodLogs = useMemo(() => {
    if (!query.trim()) return dayFoodLogs;
    const q = query.trim().toLowerCase();
    return dayFoodLogs.filter((l) => l.foodName.toLowerCase().includes(q));
  }, [dayFoodLogs, query]);

  const dailySummary = useMemo(() => {
    const totalCalories = dayFoodLogs.reduce((sum, log) => sum + log.calories, 0);
    const totalProtein = dayFoodLogs.reduce((sum, log) => sum + log.protein, 0);
    const totalCarbs = dayFoodLogs.reduce((sum, log) => sum + log.carbs, 0);
    const totalFat = dayFoodLogs.reduce((sum, log) => sum + log.fat, 0);

    const exerciseCalories = dayExerciseLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
    const netCalories = totalCalories - exerciseCalories;

    const calorieTarget = getDailyCalorieTarget();
    const macroTargets = getMacroTargets();

    return {
      calories: totalCalories,
      netCalories,
      exerciseCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      calorieTarget,
      proteinTarget: macroTargets.protein,
      carbTarget: macroTargets.carbs,
      fatTarget: macroTargets.fat,
    };
  }, [dayFoodLogs, dayExerciseLogs, getDailyCalorieTarget, getMacroTargets]);

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };
  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAddMealFromSuggestion = useCallback((
    meal: FoodItem,
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
  ) => {
    if (!user) return;
    const defaultSize = meal.sizeOptions?.find((s) => s.factor === 1) || meal.sizeOptions?.[0];
    const factor = defaultSize?.factor || 1;
    const foodLog = {
      userId: user.id,
      foodId: meal.id,
      foodName: meal.nameZh,
      servings: 1,
      calories: meal.calories * factor,
      protein: meal.protein * factor,
      carbs: meal.carbs * factor,
      fat: meal.fat * factor,
      mealType,
      loggedAt: new Date().toISOString(),
      source: "meal_plan" as const,
      selectedCookingMethod: meal.cookingMethod,
      selectedServingLabel: defaultSize?.zh || defaultSize?.label || meal.servingNameZh,
      sizeFactor: factor,
    };
    addFoodLog(foodLog);
  }, [user, addFoodLog]);

  const days = range === "week" ? 7 : 30;
  const points = useMemo(() => {
    if (range === "day") return [] as Array<any>;
    return Array.from({ length: days }).map((_, i) => {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - (days - 1 - i));
      const ds = toDateString(d);
      const foods = getLogsByDate(ds);
      const calories = foods.reduce((s, l) => s + l.calories, 0);
      const protein = foods.reduce((s, l) => s + l.protein, 0);
      const fat = foods.reduce((s, l) => s + l.fat, 0);
      const carbs = foods.reduce((s, l) => s + l.carbs, 0);
      return {
        dateLabel: d.toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" }),
        calories,
        protein,
        fat,
        carbs,
      };
    });
  }, [range, days, selectedDate, getLogsByDate]);

  const avg = useMemo(() => {
    if (range === "day" || points.length === 0) return 0;
    return Math.round(points.reduce((s, p) => s + p.calories, 0) / Math.max(1, points.length));
  }, [range, points]);

  const mealSections = useMemo(
    () =>
      range === "day"
        ? [
            { title: "早餐", key: "breakfast", data: filteredFoodLogs.filter((l) => l.mealType === "breakfast") },
            { title: "午餐", key: "lunch", data: filteredFoodLogs.filter((l) => l.mealType === "lunch") },
            { title: "晚餐", key: "dinner", data: filteredFoodLogs.filter((l) => l.mealType === "dinner") },
            { title: "點心", key: "snack", data: filteredFoodLogs.filter((l) => l.mealType === "snack") },
          ].filter((s) => s.data.length > 0)
        : [],
    [range, filteredFoodLogs]
  );

  const hasAnyDayLogs = range === "day" && filteredFoodLogs.length > 0;

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1">
            {/* Top Header (non-scrollable) */}
            <View className="px-6 pt-4 pb-2 bg-white border-b border-slate-100">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-1">
                  <Text allowFontScaling={false} className="text-2xl font-extrabold text-blue-900">
                    飲食記錄
                  </Text>
                  <Text allowFontScaling={false} className="text-slate-600">查看您的飲食歷史</Text>
                </View>
                <View className="flex-row items-center">
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      navigation.navigate("MealPlan");
                    }}
                    className="bg-slate-100 p-2 rounded-xl mr-3"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="開啟餐點計畫"
                  >
                    <Ionicons name="restaurant-outline" size={20} color="#000" />
                  </Pressable>
                  <BrandLogo size="medium" />
                </View>
              </View>
            </View>

            {/* Root SectionList */}
            <SectionList
              sections={mealSections as any}
              keyExtractor={(item: any) => item.id}
              renderSectionHeader={({ section }) => (
                <View className="flex-row items-center mb-2 mt-2 px-6">
                  <Text className="text-slate-700 font-semibold">{section.title}</Text>
                  <View className="flex-1" />
                  <Text className="text-slate-500 text-sm">
                    {Math.round(section.data.reduce((s: number, l: any) => s + l.calories, 0))} kcal
                  </Text>
                </View>
              )}
              renderItem={({ item }: any) => (
                <View className="px-6">
                  <Pressable
                    onPress={() => navigation.navigate("EditFood", { foodLog: item } as any)}
                    className="flex-row items-center justify-between py-3 px-4 bg-slate-50 rounded-2xl mb-2 border border-slate-100"
                  >
                    <View className="flex-1">
                      <Text className="text-blue-900 font-semibold text-base">{item.foodName}</Text>
                      <Text className="text-slate-500 text-sm mt-1">
                        {item.servings} 份 • {Math.round(item.calories)} kcal
                        {item.selectedServingLabel ? ` • ${item.selectedServingLabel}` : ""}
                        {item.selectedCookingMethod ? ` • ${item.selectedCookingMethod}` : ""}
                        {item.aiDetectedNameZh || item.aiDetectedName ? ` • AI: ${item.aiDetectedNameZh || item.aiDetectedName}` : ""}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => deleteFoodLog(item.id)}
                      className="p-2 ml-2"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle" size={22} color="#EF4444" />
                    </Pressable>
                  </Pressable>
                </View>
              )}
              stickySectionHeadersEnabled={range === "day"}
              removeClippedSubviews={Platform.OS === "android"}
              initialNumToRender={12}
              maxToRenderPerBatch={16}
              windowSize={7}
              scrollEventThrottle={16}
              ListHeaderComponentStyle={{ paddingBottom: 8 }}
              ListHeaderComponent={
                <View>
                  {/* Date Switcher */}
                  <View className="mx-6 mt-4 mb-3 flex-row items-center justify-between">
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        prevDay();
                      }}
                      className="p-2"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel="前一天"
                    >
                      <Ionicons name="chevron-back" size={22} color="#000" />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowPicker(true);
                      }}
                      onLongPress={() => setShowPicker(true)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel={`選擇日期，目前選擇 ${dateLabel}`}
                    >
                      <Text allowFontScaling={false} className="text-black font-semibold">
                        {dateLabel}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        nextDay();
                      }}
                      className="p-2"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel="下一天"
                    >
                      <Ionicons name="chevron-forward" size={22} color="#000" />
                    </Pressable>
                  </View>
                  {showPicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={(_, d) => {
                        setShowPicker(false);
                        if (d) setSelectedDate(d);
                      }}
                    />
                  )}

                  {/* Segmented control */}
                  <View className="mx-6 mb-3">
                    <SegmentedGroup
                      testID="foodlog-range"
                      segments={[
                        { label: "日", value: "day" },
                        { label: "週", value: "week" },
                        { label: "月", value: "month" },
                      ]}
                      value={range}
                      onChange={(v) => setRange(v as any)}
                    />
                  </View>

                  {/* Search */}
                  <View className="mx-6 mb-4">
                    <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                      <Ionicons name="search" size={18} color="#64748B" />
                      <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="搜尋今天的飲食..."
                        className="flex-1 ml-2"
                        returnKeyType="search"
                      />
                      {query.length > 0 && (
                        <Pressable onPress={() => setQuery("")} className="p-1">
                          <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </Pressable>
                      )}
                    </View>
                  </View>

                  {/* Range specific content */}
                  {range === "day" ? (
                    <View className="mx-6 mb-4">
                      <MealPlanSuggestions
                        onAddMeal={handleAddMealFromSuggestion}
                        onViewFullPlan={() => navigation.navigate("MealPlan")}
                      />

                      {/* Daily Summary Card */}
                      <View className="bg-white rounded-2xl shadow-sm border border-slate-100 mt-4">
                        <View className="p-5 border-b border-slate-100">
                          <Text allowFontScaling={false} className="text-lg font-bold text-blue-900">
                            今日營養總計
                          </Text>
                        </View>

                        <View className="p-5">
                          {/* Calories Row */}
                          <View className="flex-row items-center justify-between mb-6">
                            <View className="flex-1">
                              <Text allowFontScaling={false} className="text-slate-600 text-sm font-medium">
                                熱量
                              </Text>
                              <Text allowFontScaling={false} className="text-2xl font-extrabold text-blue-900 mt-1">
                                {dailySummary.netCalories}
                              </Text>
                              <Text allowFontScaling={false} className="text-slate-500 text-sm">
                                目標 {dailySummary.calorieTarget} kcal
                              </Text>
                              <Text allowFontScaling={false} className="text-slate-400 text-xs mt-1">
                                攝取 {dailySummary.calories} - 消耗 {dailySummary.exerciseCalories}
                              </Text>
                            </View>
                            <View className="w-20 h-20 rounded-full bg-slate-100 items-center justify-center border-4 border-orange-500">
                              <Text allowFontScaling={false} className="text-sm font-bold text-orange-600">
                                {dailySummary.calorieTarget > 0
                                  ? Math.round((dailySummary.netCalories / dailySummary.calorieTarget) * 100)
                                  : 0}%
                              </Text>
                            </View>
                          </View>

                          {/* Macros with Progress Bars */}
                          <View className="space-y-4">
                            {/* Protein */}
                            <View>
                              <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-slate-700 text-sm font-medium">蛋白質</Text>
                                <Text className="text-slate-600 text-sm font-bold">
                                  {Math.round(dailySummary.protein)}g / {dailySummary.proteinTarget}g
                                </Text>
                              </View>
                              <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <View
                                  className="h-full bg-green-500 rounded-full"
                                  style={{
                                    width: `${Math.min((dailySummary.protein / dailySummary.proteinTarget) * 100, 100)}%`,
                                  }}
                                />
                              </View>
                            </View>

                            {/* Carbs */}
                            <View>
                              <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-slate-700 text-sm font-medium">碳水化合物</Text>
                                <Text className="text-slate-600 text-sm font-bold">
                                  {Math.round(dailySummary.carbs)}g / {dailySummary.carbTarget}g
                                </Text>
                              </View>
                              <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <View
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{
                                    width: `${Math.min((dailySummary.carbs / dailySummary.carbTarget) * 100, 100)}%`,
                                  }}
                                />
                              </View>
                            </View>

                            {/* Fat */}
                            <View>
                              <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-slate-700 text-sm font-medium">脂肪</Text>
                                <Text className="text-slate-600 text-sm font-bold">
                                  {Math.round(dailySummary.fat)}g / {dailySummary.fatTarget}g
                                </Text>
                              </View>
                              <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <View
                                  className="h-full bg-yellow-500 rounded-full"
                                  style={{
                                    width: `${Math.min((dailySummary.fat / dailySummary.fatTarget) * 100, 100)}%`,
                                  }}
                                />
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Exercise Plan Suggestions */}
                      <View className="mt-4">
                        <ExercisePlanSuggestions />
                      </View>

                      {/* List label */}
                      <Text className="text-lg font-bold text-blue-900 mt-6">今日清單</Text>
                    </View>
                  ) : (
                    <View className="mx-6 mb-4">
                      <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                        <Text className="text-slate-400 text-sm">平均熱量</Text>
                        <Text className="text-2xl font-extrabold text-blue-900">{avg} kcal</Text>
                        <View className="mt-2">
                          <StackedNutritionBars data={points} />
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              }
              ListFooterComponent={
                range === "day" && !hasAnyDayLogs ? (
                  <View className="items-center py-8">
                    <Ionicons name="restaurant-outline" size={48} color="#CBD5E1" />
                    <Text className="text-slate-500 mt-2">今天還沒有記錄</Text>
                  </View>
                ) : null
              }
              keyboardShouldPersistTaps="handled"
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
            />

            {/* Bottom add button */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  navigation.navigate("AddFood", {});
                }}
                className="w-full bg-orange-500 py-4 rounded-2xl flex-row items-center justify-center shadow-lg"
                accessibilityRole="button"
                accessibilityLabel="新增飲食記錄"
              >
                <Ionicons name="restaurant" size={22} color="white" />
                <Text allowFontScaling={false} className="text-white font-bold ml-2 text-lg">
                  新增飲食
                </Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

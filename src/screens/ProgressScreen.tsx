import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

// Components
import BrandLogo from "../components/BrandLogo";
import MasterProgressBar from "../components/MasterProgressBar";
import SegmentedGroup from "../components/SegmentedGroup";
import StreakCard from "../components/StreakCard";
import AchievementBadges from "../components/AchievementBadges";
import StackedNutritionBars from "../components/charts/StackedNutritionBars";


// Stores
import { useUserStore } from "../state/userStore";
import { useFoodStore } from "../state/foodStore";
import { useExerciseStore } from "../state/exerciseStore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TimeRange = "week" | "month" | "3months";

const timeRanges = [
  { id: "week" as const, label: "週", days: 7 },
  { id: "month" as const, label: "月", days: 30 },
  { id: "3months" as const, label: "3個月", days: 90 },
];


export default function ProgressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useUserStore();
  const { foodLogs, getTodayCalories } = useFoodStore();
  const { getTodayCaloriesBurned } = useExerciseStore();

  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("week");

  // Master progress derived values
  const weightHistory = useUserStore.getState().getWeightHistory?.() || [];
  const startEntry = weightHistory.length ? weightHistory[weightHistory.length - 1] : (null as any);
  const masterStartWeight = startEntry ? startEntry.weight : (user?.weight || 0);
  const masterStartDate = startEntry ? startEntry.loggedAt : user?.createdAt;
  const masterTargetWeight = user?.targetWeight || user?.weight || 0;
  const masterTargetDate = user?.targetDate;

  // Helpers
  const toISO = (d: Date) => d.toISOString().split("T")[0];
  const buildNutritionPoints = (days: number) => {
    return Array.from({ length: days }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      const iso = toISO(d);
      const dayLogs = foodLogs.filter(l => l.loggedAt.startsWith(iso));
      const calories = dayLogs.reduce((s, l) => s + l.calories, 0);
      const protein = dayLogs.reduce((s, l) => s + l.protein, 0);
      const fat = dayLogs.reduce((s, l) => s + l.fat, 0);
      const carbs = dayLogs.reduce((s, l) => s + l.carbs, 0);
      const dateLabel = String(days <= 7 ? d.toLocaleDateString("zh-TW", { weekday: "short" }) : d.toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" }));
      return { dateLabel, calories, protein, fat, carbs };
    });
  };

  const calcAdherence = () => {
    const currentRange = timeRanges.find(r => r.id === selectedTimeRange)!;
    const target = user?.dailyCalorieTarget || 2000;
    let adherent = 0;
    for (let i = 0; i < currentRange.days; i++) {
      const d = new Date(); d.setDate(d.getDate() - (currentRange.days - 1 - i));
      const iso = toISO(d);
      const consumed = foodLogs.filter(l => l.loggedAt.startsWith(iso)).reduce((s, l) => s + l.calories, 0);
      const percentage = (consumed / target) * 100;
      if (percentage >= 85 && percentage <= 115) adherent++;
    }
    return Math.round((adherent / currentRange.days) * 100);
  };

  const calcStreak = () => {
    const target = user?.dailyCalorieTarget || 2000;
    const days = 30;
    let currentStreak = 0, longestStreak = 0, temp = 0;
    let totalCaloriesLogged = foodLogs.reduce((s, l) => s + l.calories, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      const iso = toISO(d);
      const consumed = foodLogs.filter(l => l.loggedAt.startsWith(iso)).reduce((s, l) => s + l.calories, 0);
      const percentage = (consumed / target) * 100;
      const ok = percentage >= 85 && percentage <= 115;
      if (ok) { temp++; if (i === days - 1) currentStreak = temp; } else { if (temp > longestStreak) longestStreak = temp; temp = 0; }
    }
    if (temp > longestStreak) longestStreak = temp;
    return { currentStreak, longestStreak, weeklyGoalsMet: Math.floor(longestStreak / 7), totalWeeks: Math.ceil(foodLogs.length / 7), totalDays: foodLogs.length, totalCaloriesLogged };
  };

  const streakData = calcStreak();

  // Nutrition points for selected range
  const days = selectedTimeRange === "week" ? 7 : selectedTimeRange === "month" ? 30 : 90;
  const nutritionPoints = buildNutritionPoints(days);
  const nutritionAvg = Math.round(nutritionPoints.reduce((s, p) => s + p.calories, 0) / Math.max(1, nutritionPoints.length));
  const start = new Date(); start.setDate(start.getDate() - (days - 1));
  const nutritionSpan = `${start.toLocaleDateString("zh-TW", { month: "short", day: "numeric" })} - ${new Date().toLocaleDateString("zh-TW", { month: "short", day: "numeric" })}`;

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-semibold text-black">請先完成設定</Text>
          <Text className="text-gray-600 mt-2 text-center">點擊下方按鈕重新開始設定流程</Text>
          <Pressable onPress={() => navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] })} className="mt-6 bg-black px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">開始設定</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>

        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-black">進度追蹤</Text>
              <Text className="text-gray-600">追蹤您的減脂成果</Text>
            </View>
            <BrandLogo size="medium" />
          </View>
        </View>

        {/* Master Progress Bar */}
          <View className="px-6 mb-4">
            <MasterProgressBar
              startWeight={masterStartWeight || 0}
              currentWeight={user.weight || 0}
              targetWeight={masterTargetWeight || 0}
              startDate={masterStartDate}
              targetDate={masterTargetDate}
            />
          </View>

        {/* Streak Card */}
          <View className="px-6">
            <StreakCard
              currentStreak={streakData.currentStreak}
              longestStreak={streakData.longestStreak}
              weeklyGoalsMet={streakData.weeklyGoalsMet}
              totalWeeks={streakData.totalWeeks}
            />
          </View>

        {/* Achievement Badges */}
          <View className="px-6">
            <AchievementBadges
              totalDays={streakData.totalDays}
              longestStreak={streakData.longestStreak}
              totalCaloriesLogged={streakData.totalCaloriesLogged}
              weeklyGoalsMet={streakData.weeklyGoalsMet}
            />
          </View>

        {/* Time Range Selector */}
          <View className="px-6 mb-4">
            <SegmentedGroup
              testID="progress-range"
              segments={[
                { label: "週", value: "week" },
                { label: "月", value: "month" },
                { label: "3個月", value: "3months" },
              ]}
              value={selectedTimeRange}
              onChange={(v) => setSelectedTimeRange(v as TimeRange)}
            />
          </View>

        {/* Nutrition Card */}
          <View className="bg-white mx-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-black">營養</Text>
            </View>
            <View className="px-4 pt-4">
              <Text className="text-slate-400 text-sm">平均熱量</Text>
              <Text className="text-3xl font-extrabold text-blue-900">{String(nutritionAvg || 0)} kcal</Text>
              <Text className="text-slate-500 mt-1">{nutritionSpan || ""}</Text>
            </View>
            <View className="mt-2">
              <StackedNutritionBars data={nutritionPoints} />
            </View>
          </View>

        {/* Stats Cards */}
          <View className="px-6 mb-4">
            <View className="flex-row">
              <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mr-3">
                <Text className="text-gray-600 text-sm">目前體重</Text>
                <Text className="text-2xl font-bold text-black">{String(user?.weight || 0)}kg</Text>
                <Text className="text-green-600 text-sm">距離目標 {String(Math.abs((user?.weight || 0) - (user?.targetWeight || 0)).toFixed(1))}kg</Text>
              </View>
              <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <Text className="text-gray-600 text-sm">週遵守率</Text>
                <Text className="text-2xl font-bold text-black">{String(calcAdherence() || 0)}%</Text>
                <Text className="text-blue-600 text-sm">{calcAdherence() >= 60 ? "表現良好" : "需要加油"}</Text>
              </View>
            </View>
          </View>

          <View className="px-6 mb-8">
            <View className="flex-row">
              <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mr-3">
                <Text className="text-gray-600 text-sm">今日攝取</Text>
                <Text className="text-2xl font-bold text-black">{String(getTodayCalories() || 0)}</Text>
                <Text className="text-gray-500 text-sm">kcal</Text>
              </View>
              <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <Text className="text-gray-600 text-sm">今日消耗</Text>
                <Text className="text-2xl font-bold text-black">{String(getTodayCaloriesBurned() || 0)}</Text>
                <Text className="text-gray-500 text-sm">kcal</Text>
              </View>
            </View>
          </View>

        {/* Progress Summary */}
          <View className="px-6 mb-8">
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <Text className="text-lg font-semibold text-black mb-4">進度總結</Text>
              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-700">開始日期</Text>
                  <Text className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("zh-TW") : "—"}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-700">目標日期</Text>
                  <Text className="font-medium">{user?.targetDate ? new Date(user.targetDate).toLocaleDateString("zh-TW") : "—"}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-700">減重速度</Text>
                  <Text className="font-medium">{String(user?.weightLossSpeed || 0)} kg/週</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-700">BMI</Text>
                  <Text className="font-medium">{String(((user?.weight || 0) / Math.pow((user?.height || 1) / 100, 2)).toFixed(1))}</Text>
                </View>
              </View>
            </View>
          </View>

      </ScrollView>
    </SafeAreaView>
  );
}

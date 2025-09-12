import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";

// Components
import CalorieProgressBar from "../components/CalorieProgressBar";
import FoodEquivalentChips from "../components/FoodEquivalentChips";
import WeightReminder from "../components/WeightReminder";
import TodayLogsList from "../components/TodayLogsList";
import ExercisePlanSuggestions from "../components/ExercisePlanSuggestions";
import BrandLogo from "../components/BrandLogo";

// Stores
import { useUserStore } from "../state/userStore";
import { useFoodStore } from "../state/foodStore";
import { useExerciseStore } from "../state/exerciseStore";

// AI
import { getOpenAIChatResponse } from "../api/chat-service";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  const { user } = useUserStore();
  const { getTodayLogs, getTodayCalories, getTodayMacros, taiwanFoodEquivs, deleteFoodLog } = useFoodStore();
  const { getTodayLogs: getTodayExerciseLogs, getTodayCaloriesBurned, deleteExerciseLog } = useExerciseStore();
  
  const [showAIAdvice, setShowAIAdvice] = useState(false);
  const [aiAdvice, setAiAdvice] = useState("");
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  
  // Get today's data
  const todayFoodLogs = getTodayLogs();
  const todayExerciseLogs = getTodayExerciseLogs();
  const caloriesConsumed = getTodayCalories();
  const caloriesBurned = getTodayCaloriesBurned();
  const todayMacros = getTodayMacros();
  
  // Calculate net calories and targets
  const dailyTarget = user?.dailyCalorieTarget || 2000;
  const netCaloriesConsumed = caloriesConsumed - caloriesBurned;
  const remainingCalories = Math.max(dailyTarget - netCaloriesConsumed, 0);
  
  // Calculate macro gaps
  const macroTargets = {
    protein: user?.proteinTarget || 0,
    carbs: user?.carbTarget || 0,
    fat: user?.fatTarget || 0,
  };
  
  const macroGaps = {
    protein: Math.max(macroTargets.protein - todayMacros.protein, 0),
    carbs: Math.max(macroTargets.carbs - todayMacros.carbs, 0),
    fat: Math.max(macroTargets.fat - todayMacros.fat, 0),
  };
  
  const handleProgressBarPress = async () => {
    const percentage = Math.round((netCaloriesConsumed / dailyTarget) * 100);
    
    if (percentage >= 100) {
      // Auto-show advice for overeating
      await generateAIAdvice("overeating");
    } else {
      // Show general advice
      await generateAIAdvice("progress");
    }
  };
  
  const handleProgressBarLongPress = () => {
    // Show macro details - could implement a modal here
    Alert.alert(
      "營養素詳情",
      `蛋白質: ${todayMacros.protein.toFixed(1)}g / ${macroTargets.protein}g\n` +
      `碳水化合物: ${todayMacros.carbs.toFixed(1)}g / ${macroTargets.carbs}g\n` +
      `脂肪: ${todayMacros.fat.toFixed(1)}g / ${macroTargets.fat}g`
    );
  };
  
  const generateAIAdvice = async (context: "progress" | "overeating") => {
    setIsLoadingAdvice(true);
    setShowAIAdvice(true);
    
    try {
      const percentage = Math.round((netCaloriesConsumed / dailyTarget) * 100);
      const prompt = context === "overeating" 
        ? `用戶今天已攝取 ${caloriesConsumed} 大卡，運動消耗 ${caloriesBurned} 大卡，淨攝取 ${netCaloriesConsumed} 大卡，目標是 ${dailyTarget} 大卡，已達到 ${percentage}%，超標了。請給出3句內的台灣化建議，包含減量選項和輕量活動建議。語氣中立不責備。最後一行加上免責聲明：此為一般性健康資訊，非醫療建議；如有疾病或特殊需求請諮詢醫師。`
        : `用戶今天已攝取 ${caloriesConsumed} 大卡，運動消耗 ${caloriesBurned} 大卡，淨攝取 ${netCaloriesConsumed} 大卡，目標是 ${dailyTarget} 大卡，已達到 ${percentage}%。蛋白質還需 ${macroGaps.protein.toFixed(1)}g，碳水還需 ${macroGaps.carbs.toFixed(1)}g，脂肪還需 ${macroGaps.fat.toFixed(1)}g。請給出3句內的台灣化飲食建議。最後一行加上免責聲明：此為一般性健康資訊，非醫療建議；如有疾病或特殊需求請諮詢醫師。`;
      
      const response = await getOpenAIChatResponse(prompt);
      setAiAdvice(response.content);
    } catch (error) {
      setAiAdvice("無法獲取建議，請稍後再試。");
    } finally {
      setIsLoadingAdvice(false);
    }
  };
  
  const handleWeightReminderPress = () => {
    navigation.navigate("WeightLog");
  };
  
  const handleAddFood = () => {
    navigation.navigate("AddFood", {});
  };
  
  const handleAddExercise = () => {
    navigation.navigate("AddExercise");
  };
  
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-semibold text-black">請先完成設定</Text>
          <Text className="text-gray-600 mt-2 text-center">點擊下方按鈕重新開始設定流程</Text>
          <Pressable
            onPress={() => navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] })}
            className="mt-6 bg-black px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">開始設定</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-black">
                今日進度
              </Text>
              <Text className="text-gray-600">
                {new Date().toLocaleDateString("zh-TW", { 
                  month: "long", 
                  day: "numeric",
                  weekday: "long" 
                })}
              </Text>
            </View>
            <BrandLogo size="medium" />
          </View>
        </View>
        
        {/* Weight Reminder */}
        <View className="px-6 mb-4">
          <WeightReminder 
            lastWeightLoggedAt={user.lastWeightLoggedAt}
            onPress={handleWeightReminderPress}
          />
        </View>
        
        {/* Calorie Progress */}
        <View className="px-6 mb-4">
          <CalorieProgressBar
            consumed={netCaloriesConsumed}
            target={dailyTarget}
            onPress={handleProgressBarPress}
            onLongPress={handleProgressBarLongPress}
          />
          
          {/* Food Equivalent Chips */}
          {remainingCalories > 0 && (
            <FoodEquivalentChips
              remainingCalories={remainingCalories}
              macroGaps={macroGaps}
              taiwanFoodEquivs={taiwanFoodEquivs}
            />
          )}
        </View>
        
        {/* AI Advice Modal */}
        {showAIAdvice && (
          <View className="px-6 mb-4">
            <View className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-blue-800 font-semibold">AI 建議</Text>
                <Pressable onPress={() => setShowAIAdvice(false)}>
                  <Ionicons name="close" size={20} color="#3B82F6" />
                </Pressable>
              </View>
              {isLoadingAdvice ? (
                <Text className="text-blue-700">正在分析您的數據...</Text>
              ) : (
                <Text className="text-blue-700 leading-5">{aiAdvice}</Text>
              )}
            </View>
          </View>
        )}
        
        {/* Today's Logs */}
        <View className="px-6 mb-4">
          <TodayLogsList
            foodLogs={todayFoodLogs}
            exerciseLogs={todayExerciseLogs}
            onEditFood={(log) => {
              navigation.navigate("EditFood", { foodLog: log });
            }}
            onEditExercise={(log) => {
              // Navigate to edit exercise (to be implemented)
              Alert.alert("編輯運動", `編輯 ${log.name}`);
            }}
            onDeleteFood={deleteFoodLog}
            onDeleteExercise={deleteExerciseLog}
          />
        </View>

        {/* Exercise Recommendations */}
        <View className="px-6 mb-6">
          <ExercisePlanSuggestions />
        </View>
      </ScrollView>
      
      {/* Fixed Bottom Action Bar */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-row">
          <Pressable
            onPress={handleAddFood}
            className="flex-1 bg-black py-4 rounded-xl flex-row items-center justify-center mr-4"
          >
            <Ionicons name="restaurant" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">新增飲食</Text>
          </Pressable>
          
          <Pressable
            onPress={handleAddExercise}
            className="flex-1 bg-gray-800 py-4 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="fitness" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">新增運動</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
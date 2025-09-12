import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { FoodLog, ExerciseLog } from "../types";

interface TodayLogsListProps {
  foodLogs: FoodLog[];
  exerciseLogs: ExerciseLog[];
  onEditFood: (log: FoodLog) => void;
  onEditExercise: (log: ExerciseLog) => void;
  onDeleteFood: (id: string) => void;
  onDeleteExercise: (id: string) => void;
}

const TodayLogsList = React.memo(function TodayLogsList({
  foodLogs,
  exerciseLogs,
  onEditFood,
  onEditExercise,
  onDeleteFood,
  onDeleteExercise,
}: TodayLogsListProps) {
  
  const groupedFoodLogs = {
    breakfast: foodLogs.filter(log => log.mealType === "breakfast"),
    lunch: foodLogs.filter(log => log.mealType === "lunch"),
    dinner: foodLogs.filter(log => log.mealType === "dinner"),
    snack: foodLogs.filter(log => log.mealType === "snack"),
  };
  
  const mealTypeLabels = {
    breakfast: "早餐",
    lunch: "午餐", 
    dinner: "晚餐",
    snack: "點心",
  };
  
  const mealTypeIcons = {
    breakfast: "sunny-outline" as const,
    lunch: "partly-sunny-outline" as const,
    dinner: "moon-outline" as const,
    snack: "cafe-outline" as const,
  };
  
  const renderFoodSection = (mealType: keyof typeof groupedFoodLogs) => {
    const logs = groupedFoodLogs[mealType];
    if (logs.length === 0) return null;
    
    const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
    
    return (
      <View key={mealType} className="mb-5">
        <View className="flex-row items-center mb-3 pb-2 border-b border-slate-100">
          <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Ionicons 
              name={mealTypeIcons[mealType]} 
              size={16} 
              color="#1E40AF" 
            />
          </View>
          <Text className="text-blue-900 font-bold text-base flex-1">
            {mealTypeLabels[mealType]}
          </Text>
          <Text className="text-orange-600 text-sm font-bold">
            {totalCalories} kcal
          </Text>
        </View>
        
        {logs.map((log) => (
          <Pressable
            key={log.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onEditFood(log);
            }}
            className="flex-row items-center justify-between py-3 px-4 bg-slate-50 rounded-2xl mb-2 border border-slate-100"
          >
            <View className="flex-1">
              <Text className="text-blue-900 font-semibold text-base">
                {log.foodName}
              </Text>
               <Text className="text-slate-500 text-sm mt-1">
                 {log.servings} 份 • {Math.round(log.calories)} kcal{log.selectedServingLabel ? ` • ${log.selectedServingLabel}` : ""}{log.selectedCookingMethod ? ` • ${log.selectedCookingMethod}` : ""}{log.aiDetectedNameZh || log.aiDetectedName ? ` • AI: ${log.aiDetectedNameZh || log.aiDetectedName}` : ""}
               </Text>
            </View>
            
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onDeleteFood(log.id);
              }}
              className="p-2 ml-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={22} color="#EF4444" />
            </Pressable>
          </Pressable>
        ))}
      </View>
    );
  };
  
  const renderExerciseSection = () => {
    if (exerciseLogs.length === 0) return null;
    
    const totalCaloriesBurned = exerciseLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
    
    return (
      <View className="mb-5">
        <View className="flex-row items-center mb-3 pb-2 border-b border-slate-100">
          <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="fitness-outline" size={16} color="#059669" />
          </View>
          <Text className="text-blue-900 font-bold text-base flex-1">運動</Text>
          <Text className="text-green-600 text-sm font-bold">
            -{totalCaloriesBurned} kcal
          </Text>
        </View>
        
        {exerciseLogs.map((log) => (
          <Pressable
            key={log.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onEditExercise(log);
            }}
            className="flex-row items-center justify-between py-3 px-4 bg-green-50 rounded-2xl mb-2 border border-green-100"
          >
            <View className="flex-1">
              <Text className="text-green-800 font-semibold text-base">
                {log.name}
              </Text>
              <Text className="text-green-600 text-sm mt-1">
                {log.duration} 分鐘 • -{log.caloriesBurned} kcal
                {log.distance && ` • ${log.distance} km`}
              </Text>
            </View>
            
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onDeleteExercise(log.id);
              }}
              className="p-2 ml-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={22} color="#EF4444" />
            </Pressable>
          </Pressable>
        ))}
      </View>
    );
  };
  
  if (foodLogs.length === 0 && exerciseLogs.length === 0) {
    return (
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <Text className="text-lg font-bold text-blue-900 mb-2">今日清單</Text>
        <View className="items-center py-8">
          <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="restaurant-outline" size={32} color="#64748B" />
          </View>
          <Text className="text-slate-500 text-center font-medium">
            還沒有記錄{"\n"}開始記錄您的第一餐吧！
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <Text className="text-lg font-bold text-blue-900 mb-4">今日清單</Text>
      
      <View className="max-h-64">
        {Object.keys(groupedFoodLogs).map(mealType => 
          renderFoodSection(mealType as keyof typeof groupedFoodLogs)
        )}
        {renderExerciseSection()}
      </View>
    </View>
  );
});

export default TodayLogsList;
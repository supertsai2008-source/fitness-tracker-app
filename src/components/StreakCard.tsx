import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  weeklyGoalsMet: number;
  totalWeeks: number;
}

export default function StreakCard({ 
  currentStreak, 
  longestStreak, 
  weeklyGoalsMet, 
  totalWeeks 
}: StreakCardProps) {
  const weeklySuccessRate = totalWeeks > 0 ? Math.round((weeklyGoalsMet / totalWeeks) * 100) : 0;
  
  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <Ionicons name="flame" size={20} color="#F59E0B" />
          <Text allowFontScaling={false} className="text-lg font-semibold text-black ml-2">連續達標</Text>
        </View>
      </View>
      
      <View className="p-4">
        <View className="flex-row">
          {/* Current Streak */}
          <View className="flex-1 items-center mr-4">
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-2">
              <Text allowFontScaling={false} className="text-2xl font-bold text-orange-600">{String(currentStreak)}</Text>
            </View>
            <Text allowFontScaling={false} className="text-gray-600 text-sm text-center">目前連續</Text>
            <Text allowFontScaling={false} className="text-gray-600 text-sm text-center">達標天數</Text>
          </View>
          
          {/* Longest Streak */}
          <View className="flex-1 items-center mr-4">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2">
              <Text allowFontScaling={false} className="text-2xl font-bold text-blue-600">{String(longestStreak)}</Text>
            </View>
            <Text allowFontScaling={false} className="text-gray-600 text-sm text-center">最長連續</Text>
            <Text allowFontScaling={false} className="text-gray-600 text-sm text-center">達標紀錄</Text>
          </View>
          
          {/* Weekly Success Rate */}
          <View className="flex-1 items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-2">
              <Text allowFontScaling={false} className="text-2xl font-bold text-green-600">{String(weeklySuccessRate)}%</Text>
            </View>
            <Text allowFontScaling={false} className="text-gray-600 text-sm text-center">週目標</Text>
            <Text allowFontScaling={false} className="text-gray-600 text-sm text-center">達成率</Text>
          </View>
        </View>
        
        {/* Motivational Message */}
        <View className="mt-4 p-3 bg-gray-50 rounded-xl">
          <Text allowFontScaling={false} className="text-gray-700 text-sm text-center">
            {currentStreak === 0 
              ? "開始您的達標之旅！每天達成目標來建立連續紀錄。"
              : currentStreak < 7
              ? `太棒了！您已經連續達標 ${String(currentStreak)} 天，繼續保持！`
              : currentStreak < 30
              ? `驚人的毅力！${String(currentStreak)} 天連續達標，您正在建立健康習慣。`
              : `不可思議！${String(currentStreak)} 天的連續達標展現了您的決心和毅力！`
            }
          </Text>
        </View>
      </View>
    </View>
  );
}
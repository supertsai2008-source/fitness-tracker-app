import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

interface AchievementBadgesProps {
  totalDays: number;
  longestStreak: number;
  totalCaloriesLogged: number;
  weeklyGoalsMet: number;
}

export default function AchievementBadges(props: AchievementBadgesProps) {
  const totalDays = Number((props as any)?.totalDays ?? 0);
  const longestStreak = Number((props as any)?.longestStreak ?? 0);
  const totalCaloriesLogged = Number((props as any)?.totalCaloriesLogged ?? 0);
  const weeklyGoalsMet = Number((props as any)?.weeklyGoalsMet ?? 0);
  
  const achievements: Achievement[] = [
    {
      id: "first_log",
      title: "初次記錄",
      description: "記錄第一筆飲食",
      icon: "restaurant",
      color: "#10B981",
      bgColor: "#D1FAE5",
      unlocked: totalDays > 0
    },
    {
      id: "week_warrior",
      title: "週間戰士",
      description: "連續7天達標",
      icon: "calendar",
      color: "#3B82F6",
      bgColor: "#DBEAFE",
      unlocked: longestStreak >= 7
    },
    {
      id: "month_master",
      title: "月度大師",
      description: "連續30天達標",
      icon: "trophy",
      color: "#F59E0B",
      bgColor: "#FEF3C7",
      unlocked: longestStreak >= 30
    },
    {
      id: "calorie_counter",
      title: "熱量計算師",
      description: "記錄10,000大卡",
      icon: "calculator",
      color: "#8B5CF6",
      bgColor: "#EDE9FE",
      unlocked: totalCaloriesLogged >= 10000,
      progress: Math.min(totalCaloriesLogged, 10000),
      target: 10000
    },
    {
      id: "consistency_king",
      title: "持續之王",
      description: "達成10個週目標",
      icon: "checkmark-circle",
      color: "#EF4444",
      bgColor: "#FEE2E2",
      unlocked: weeklyGoalsMet >= 10,
      progress: Math.min(weeklyGoalsMet, 10),
      target: 10
    },
    {
      id: "streak_legend",
      title: "連續傳奇",
      description: "連續100天達標",
      icon: "flame",
      color: "#F97316",
      bgColor: "#FED7AA",
      unlocked: longestStreak >= 100,
      progress: Math.min(longestStreak, 100),
      target: 100
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="medal" size={20} color="#F59E0B" />
            <Text allowFontScaling={false} className="text-lg font-semibold text-black ml-2">成就徽章</Text>
          </View>
          <Text allowFontScaling={false} className="text-gray-600 text-sm">
            {String(unlockedAchievements.length)}/{String(achievements.length)}
          </Text>
        </View>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-4">
        <View className="flex-row">
          {/* Unlocked Achievements */}
          {unlockedAchievements.map((achievement, index) => (
            <View key={achievement.id} className={`items-center w-20 ${index < unlockedAchievements.length - 1 ? "mr-3" : ""}`}>
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: achievement.bgColor }}
              >
                <Ionicons 
                  name={achievement.icon} 
                  size={24} 
                  color={achievement.color} 
                />
              </View>
              <Text allowFontScaling={false} className="text-xs font-medium text-black text-center" numberOfLines={2}>
                {achievement.title}
              </Text>
            </View>
          ))}
          
          {/* Locked Achievements with Progress */}
          {lockedAchievements.map((achievement, index) => (
            <View key={achievement.id} className={`items-center w-20 ${index < lockedAchievements.length - 1 || unlockedAchievements.length > 0 ? "mr-3" : ""}`}>
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-2 relative">
                <Ionicons 
                  name={achievement.icon} 
                  size={24} 
                  color="#9CA3AF" 
                />
                {achievement.progress && achievement.target && (
                  <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 items-center justify-center">
                    <Text allowFontScaling={false} className="text-xs font-bold text-gray-600">
                      {String(Math.round((achievement.progress / achievement.target) * 100))}%
                    </Text>
                  </View>
                )}
              </View>
              <Text allowFontScaling={false} className="text-xs text-gray-500 text-center" numberOfLines={2}>
                {achievement.title}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {unlockedAchievements.length > 0 && (
        <View className="px-4 pb-4">
          <Text allowFontScaling={false} className="text-gray-600 text-sm text-center">
            🎉 恭喜解鎖 {String(unlockedAchievements.length)} 個成就！
          </Text>
        </View>
      )}
    </View>
  );
}
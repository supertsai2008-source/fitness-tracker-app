import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming
} from "react-native-reanimated";

interface WeightReminderProps {
  lastWeightLoggedAt?: string;
  onPress: () => void;
}

export default function WeightReminder({ lastWeightLoggedAt, onPress }: WeightReminderProps) {
  const opacity = useSharedValue(1);
  
  // Check if reminder should show (3+ days since last weight log)
  const shouldShowReminder = () => {
    if (!lastWeightLoggedAt) return true;
    
    const lastLog = new Date(lastWeightLoggedAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 3;
  };
  
  useEffect(() => {
    if (shouldShowReminder()) {
      // Start subtle blinking animation
      opacity.value = withRepeat(
        withTiming(0.6, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [lastWeightLoggedAt]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  if (!shouldShowReminder()) {
    return null;
  }
  
  return (
    <Animated.View style={animatedStyle}>
      <Pressable 
        onPress={onPress}
        className="flex-row items-center bg-blue-50 p-3 rounded-xl border border-blue-200"
      >
        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
          <Ionicons name="scale-outline" size={16} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-blue-800 font-medium text-sm">
            記錄體重
          </Text>
          <Text className="text-blue-600 text-xs">
            已經 3 天沒有記錄體重了
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
      </Pressable>
    </Animated.View>
  );
}
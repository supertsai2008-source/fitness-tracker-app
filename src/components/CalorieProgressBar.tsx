import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolateColor 
} from "react-native-reanimated";

interface CalorieProgressBarProps {
  consumed: number;
  target: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export default function CalorieProgressBar({ 
  consumed, 
  target, 
  onPress, 
  onLongPress 
}: CalorieProgressBarProps) {
  const progress = Math.min(consumed / target, 1.2); // Allow up to 120% for visual feedback
  const percentage = Math.round((consumed / target) * 100);
  const remaining = Math.max(target - consumed, 0);
  
  // Determine status and emoji
  const getStatus = () => {
    if (percentage < 85) return { emoji: "😊", status: "good" };
    if (percentage < 100) return { emoji: "😐", status: "warning" };
    return { emoji: "🙁", status: "over" };
  };
  
  const { emoji, status } = getStatus();
  
  const progressValue = useSharedValue(0);
  
  React.useEffect(() => {
    progressValue.value = withSpring(progress, {
      damping: 15,
      stiffness: 100,
    });
  }, [progress]);
  
  const animatedProgressStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progressValue.value,
      [0, 0.85, 1.0, 1.2],
      ["#000000", "#000000", "#EF4444", "#DC2626"]
    );
    
    return {
      width: `${Math.min(progressValue.value * 100, 100)}%`,
      backgroundColor,
    };
  });
  
  return (
    <Pressable 
      onPress={onPress}
      onLongPress={onLongPress}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-black">今日熱量</Text>
        <Text className="text-3xl">{emoji}</Text>
      </View>
      
      {/* Progress Bar Container */}
      <View className="mb-4">
        <View className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
          {/* Background markers */}
          <View className="absolute left-0 top-0 bottom-0 w-full flex-row">
            {/* 90% sweet spot line */}
            <View 
              className="absolute top-0 bottom-0 w-0.5 bg-gray-400 opacity-60"
              style={{ left: "90%" }}
            />
            {/* 100% limit line */}
            <View 
              className="absolute top-0 bottom-0 w-0.5 bg-gray-600"
              style={{ left: "100%" }}
            />
          </View>
          
          {/* Progress fill */}
          <Animated.View 
            className="h-full rounded-full"
            style={animatedProgressStyle}
          />
          
          {/* Progress text overlay */}
          <View className="absolute inset-0 flex-row items-center justify-center">
            <Text className="text-white font-bold text-sm">
              {percentage}%
            </Text>
          </View>
        </View>
        
        {/* Progress labels */}
        <View className="flex-row justify-between mt-2">
          <Text className="text-xs text-gray-500">0</Text>
          <Text className="text-xs text-gray-400">甜蜜帶 90%</Text>
          <Text className="text-xs text-gray-600">目標 100%</Text>
        </View>
      </View>
      
      {/* Calorie Info */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-black">
            {consumed.toLocaleString()}
          </Text>
          <Text className="text-gray-500 text-sm">
            已攝取 / {target.toLocaleString()} kcal
          </Text>
        </View>
        
        <View className="items-end">
          <Text className={`text-lg font-semibold ${
            status === "over" ? "text-red-500" : "text-green-600"
          }`}>
            {status === "over" ? `+${consumed - target}` : remaining}
          </Text>
          <Text className="text-gray-500 text-sm">
            {status === "over" ? "超標" : "剩餘"} kcal
          </Text>
        </View>
      </View>
      
      {/* Sweet spot indicator */}
      {status === "good" && (
        <View className="mt-3 p-2 bg-green-50 rounded-lg">
          <Text className="text-green-700 text-sm text-center">
            👍 保持在甜蜜帶，繼續加油！
          </Text>
        </View>
      )}
      
      {/* Over limit warning */}
      {status === "over" && (
        <View className="mt-3 p-2 bg-red-50 rounded-lg">
          <Text className="text-red-700 text-sm text-center">
            ⚠️ 已超過目標，點擊查看建議
          </Text>
        </View>
      )}
    </Pressable>
  );
}
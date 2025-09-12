import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

interface MasterProgressBarProps {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  startDate?: string | number | Date;
  targetDate?: string | number | Date;
  weightLossSpeedPerWeek?: number; // kg/week fallback for ETA
}

export default function MasterProgressBar({ startWeight, currentWeight, targetWeight, startDate, targetDate, weightLossSpeedPerWeek = 0.5 }: MasterProgressBarProps) {
  const totalDelta = Math.max(startWeight - targetWeight, 0.0001);
  const achieved = Math.max(startWeight - currentWeight, 0);
  const pct = Math.min(Math.max(achieved / totalDelta, 0), 1);

  const pctValue = useSharedValue(0);
  React.useEffect(() => {
    pctValue.value = withSpring(pct, { damping: 15, stiffness: 120 });
  }, [pct]);

  const barStyle = useAnimatedStyle(() => ({ width: `${Math.min(pctValue.value * 100, 100)}%` }));

  const remainingKg = Math.max(targetWeight - currentWeight, 0);

  // ETA: prefer targetDate; else compute by speed
  let etaText = "";
  if (targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const daysLeft = Math.max(Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)), 0);
    etaText = `${daysLeft} 天`;
  } else if (weightLossSpeedPerWeek > 0) {
    const weeks = Math.ceil(remainingKg / weightLossSpeedPerWeek);
    etaText = `${weeks * 7} 天`;
  }

  return (
    <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-3">
        <Text allowFontScaling={false} className="text-lg font-semibold text-black">總進度</Text>
        <Text allowFontScaling={false} className="text-2xl font-bold text-black">{String(Math.round(pct * 100))}%</Text>
      </View>

      <View style={styles.track}>
        <Animated.View className="h-full bg-black" style={[styles.fill, barStyle]} />
      </View>

      <View className="flex-row items-center justify-between mt-3">
        <Text allowFontScaling={false} className="text-gray-600 text-sm">剩餘 {String(remainingKg.toFixed(1))} kg</Text>
        {!!etaText && <Text allowFontScaling={false} className="text-gray-600 text-sm">預估剩餘 {String(etaText)}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, backgroundColor: "#F3F4F6", borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%" },
});
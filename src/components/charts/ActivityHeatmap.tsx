import React from "react";
import { View, Text } from "react-native";

interface ActivityHeatmapProps {
  title?: string;
  weeks: number; // columns
  data: number[][]; // [7][weeks] intensity 0-1
}

export default function ActivityHeatmap({ title, weeks, data }: ActivityHeatmapProps) {
  const dayLabels = ["一", "二", "三", "四", "五", "六", "日"];
  const colorFor = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    const a = 0.15 + clamped * 0.65;
    return `rgba(16,185,129,${a})`;
  };

  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {title && (
        <View className="p-4 border-b border-gray-100">
          <Text allowFontScaling={false} className="text-lg font-semibold text-black">{title}</Text>
        </View>
      )}
      <View className="p-4">
        {data.length === 0 ? (
          <View className="items-center py-12"><Text className="text-gray-500">暫無數據</Text></View>
        ) : (
          <View className="flex-row">
            {/* Y labels */}
            <View className="mr-2 justify-between">
              {dayLabels.map((d, i) => (
                <Text key={i} allowFontScaling={false} className="text-xs text-gray-500" style={{ height: 18 }}>{d}</Text>
              ))}
            </View>
            {/* Grid */}
            <View className="flex-row">
              {Array.from({ length: weeks }).map((_, c) => (
                <View key={c} className="mr-1">
                  {Array.from({ length: 7 }).map((__, r) => (
                    <View key={r} style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: colorFor((data[r] && data[r][c]) || 0), marginBottom: 4 }} />
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

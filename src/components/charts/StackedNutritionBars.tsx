import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";

export interface StackedNutritionPoint {
  dateLabel: string; // e.g. Mon
  calories: number;
  protein: number; // g
  fat: number; // g
  carbs: number; // g
  other?: number; // calories not from macros or rounding
}

interface Props {
  data: StackedNutritionPoint[];
  height?: number;
}

// Lightweight stacked bars using Views. No external charts.
export default function StackedNutritionBars({ data, height = 180 }: Props) {
  const [active, setActive] = useState<number | null>(null);

  // Convert grams to kcal estimates for stack proportions (4/9/4)
  const bars = useMemo(() => {
    return data.map((d) => {
      const p = d.protein * 4;
      const f = d.fat * 9;
      const c = d.carbs * 4;
      const other = Math.max(0, d.calories - (p + f + c));
      const total = Math.max(d.calories, 1);
      return { ...d, kcal: { p, f, c, o: other }, total };
    });
  }, [data]);

  const maxY = useMemo(() => Math.max(100, ...bars.map((b) => b.total)), [bars]);
  const barWidth = Math.max(18, Math.min(32, Math.floor(300 / Math.max(1, bars.length))));
  const gap = 10;

  return (
    <View className="w-full">
      <View style={{ height }} className="flex-row items-end justify-start px-12 pt-2">
        {bars.map((b, idx) => {
          const scale = (val: number) => Math.max(2, Math.round((val / maxY) * (height - 24)));
          const hp = scale(b.kcal.p);
          const hf = scale(b.kcal.f);
          const hc = scale(b.kcal.c);
          const ho = scale(b.kcal.o);
          const isActive = active === idx;
          return (
            <Pressable key={idx} onPress={() => setActive(isActive ? null : idx)}
              className="items-center"
              style={{ width: barWidth, marginRight: gap }}
              accessibilityRole="button"
              accessibilityLabel={`${b.dateLabel} 總熱量 ${b.total} kcal`}
            >
              <View className={`w-full rounded-t-md ${isActive ? "opacity-90" : "opacity-100"}`} style={{ height: hp, backgroundColor: "#F97316" }} />
              <View className="w-full" style={{ height: hf, backgroundColor: "#F59E0B" }} />
              <View className="w-full" style={{ height: hc, backgroundColor: "#10B981" }} />
              {ho > 2 && <View className="w-full" style={{ height: ho, backgroundColor: "#64748B" }} />}
              <Text className="text-xs text-slate-500 mt-1">{b.dateLabel}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tooltip */}
      {active !== null && bars[active] && (
        <View className="absolute left-0 right-0 items-center" style={{ top: 8 }}>
          <View className="bg-slate-900/95 px-4 py-3 rounded-xl max-w-[280px]">
            <Text className="text-white font-semibold mb-1 text-sm">{bars[active].dateLabel}</Text>
            <Text className="text-white">Calories: {String(Math.round(bars[active].total))}</Text>
            <Text className="text-white">Protein: {String(Math.round(bars[active].kcal.p/4))}g</Text>
            <Text className="text-white">Fat: {String(Math.round(bars[active].kcal.f/9))}g</Text>
            <Text className="text-white">Carbs: {String(Math.round(bars[active].kcal.c/4))}g</Text>
          </View>
        </View>
      )}

      {/* Legend */}
      <View className="flex-row items-center justify-start px-6 mt-3">
        <LegendDot color="#4F46E5" label="Calories" muted />
        <LegendDot color="#F97316" label="Protein" />
        <LegendDot color="#F59E0B" label="Fat" />
        <LegendDot color="#10B981" label="Carbs" />
      </View>
    </View>
  );
}

function LegendDot({ color, label, muted = false }: { color: string; label: string; muted?: boolean }) {
  return (
    <View className="flex-row items-center mr-4">
      <View style={{ backgroundColor: color }} className={`w-3 h-3 rounded-sm mr-1 ${muted ? "opacity-60" : ""}`} />
      <Text className="text-slate-600 text-xs">{label}</Text>
    </View>
  );
}

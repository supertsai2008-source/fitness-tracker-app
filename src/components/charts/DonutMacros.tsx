import React, { useMemo, useState } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import Svg, { Path, Text as SvgText } from "react-native-svg";

interface DonutMacrosProps {
  title?: string;
  data: { protein: number; carbs: number; fat: number };
  height?: number;
}

export default function DonutMacros({ title, data, height = 220 }: DonutMacrosProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  const innerRadius = radius * 0.6;

  const segments = useMemo(() => {
    const entries = [
      { label: "蛋白質", value: Math.max(0, data.protein), color: "#3B82F6" },
      { label: "碳水", value: Math.max(0, data.carbs), color: "#10B981" },
      { label: "脂肪", value: Math.max(0, data.fat), color: "#F59E0B" },
    ];
    const total = entries.reduce((s, e) => s + e.value, 0) || 1;
    let current = -Math.PI / 2;
    return entries.map(e => {
      const angle = (e.value / total) * 2 * Math.PI;
      const start = current;
      const end = current + angle;
      current += angle;

      const sx = centerX + radius * Math.cos(start);
      const sy = centerY + radius * Math.sin(start);
      const ex = centerX + radius * Math.cos(end);
      const ey = centerY + radius * Math.sin(end);

      const isLarge = angle > Math.PI ? 1 : 0;

      const outer = `M ${sx} ${sy} A ${radius} ${radius} 0 ${isLarge} 1 ${ex} ${ey}`;
      const ix = centerX + innerRadius * Math.cos(end);
      const iy = centerY + innerRadius * Math.sin(end);
      const sx2 = centerX + innerRadius * Math.cos(start);
      const sy2 = centerY + innerRadius * Math.sin(start);
      const inner = `L ${ix} ${iy} A ${innerRadius} ${innerRadius} 0 ${isLarge} 0 ${sx2} ${sy2} Z`;

      return { ...e, d: `${outer} ${inner}`, pct: Math.round((e.value / total) * 100) };
    });
  }, [width, height, data]);

  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {title && (
        <View className="p-4 border-b border-gray-100">
          <Text allowFontScaling={false} className="text-lg font-semibold text-black">{title}</Text>
        </View>
      )}
      <View className="p-4" onLayout={onLayout}>
        {width === 0 ? (
          <View style={{ height }} className="items-center justify-center">
            <Text className="text-gray-500">暫無數據</Text>
          </View>
        ) : (
          <View>
            <Svg width={width} height={height} pointerEvents="none">
              {segments.map((s) => (
                <Path key={s.label} d={s.d} fill={s.color} />
              ))}
              <SvgText x={centerX} y={centerY - 4} fontSize="16" fill="#111111" textAnchor="middle">營養素</SvgText>
              <SvgText x={centerX} y={centerY + 14} fontSize="12" fill="#6B7280" textAnchor="middle">
                P {data.protein}g / C {data.carbs}g / F {data.fat}g
              </SvgText>
            </Svg>
            <View className="flex-row justify-center mt-3">
              {segments.map((s, i) => (
                <View key={i} className={`flex-row items-center ${i < segments.length - 1 ? "mr-4" : ""}`}>
                  <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: s.color }} />
                  <Text allowFontScaling={false} className="text-xs text-gray-600">{s.label} {s.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

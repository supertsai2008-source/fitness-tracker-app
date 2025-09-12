import React, { useMemo, useState } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import Svg, { Rect, Line, Text as SvgText, G } from "react-native-svg";

interface CaloriePoint { x: string; consumed: number; burned: number; }

interface StackedCalorieBarsProps {
  title?: string;
  unit?: string;
  data: CaloriePoint[];
  target?: number;
  height?: number;
  yMin?: number;
  yMax?: number;
}

export default function StackedCalorieBars({ title, unit = "kcal", data, target = 2000, height = 220, yMin = 0, yMax }: StackedCalorieBarsProps) {
  const [width, setWidth] = useState(0);
  const padding = { top: 16, right: 16, bottom: 28, left: 40 };
  const chartW = Math.max(0, width - padding.left - padding.right);
  const chartH = height - padding.top - padding.bottom;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const { maxYCalc, bars } = useMemo(() => {
    if (data.length === 0) return { maxYCalc: typeof yMax === "number" ? yMax : 1, bars: [] as any[] };
    const totals = data.map(d => Math.max(0, d.consumed) + Math.max(0, d.burned));
    const autoMax = Math.max(target, ...totals) * 1.1;
    const maxYCalc = typeof yMax === "number" ? yMax : autoMax;
    const step = data.length > 0 ? chartW / data.length : chartW;
    const barW = Math.min(20, step * 0.6);
    const bars = data.map((d, i) => {
      const x = padding.left + step * i + (step - barW) / 2;
      const consumedH = (Math.max(yMin, d.consumed) / maxYCalc) * chartH;
      const burnedH = (Math.max(0, d.burned) / maxYCalc) * chartH;
      const consumedY = padding.top + chartH - consumedH;
      const burnedY = consumedY - burnedH;
      return { x, barW, consumedY, consumedH, burnedY, burnedH };
    });
    return { maxYCalc, bars };
  }, [data, chartW, chartH, target, yMax, yMin]);

  const yToPx = (y: number) => padding.top + chartH - ((y - yMin) / (maxYCalc - yMin)) * chartH;

  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {title && (
        <View className="p-4 border-b border-gray-100">
          <Text allowFontScaling={false} className="text-lg font-semibold text-black">{title}</Text>
        </View>
      )}
      <View className="p-4" onLayout={onLayout}>
        {width === 0 || data.length === 0 ? (
          <View style={{ height }} className="items-center justify-center">
            <Text className="text-gray-500">暫無數據</Text>
          </View>
        ) : (
          <Svg width={width} height={height} pointerEvents="none">
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
              <Line key={`g-${i}`} x1={padding.left} x2={width - padding.right} y1={padding.top + chartH * (1 - t)} y2={padding.top + chartH * (1 - t)} stroke="#F3F4F6" strokeWidth={1} />
            ))}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
              <SvgText key={`yl-${i}`} x={8} y={padding.top + chartH * (1 - t) + 4} fill="#6B7280" fontSize="10">{`${Math.round(maxYCalc * t)}${unit}`}</SvgText>
            ))}
            {/* Target line */}
            <Line x1={padding.left} x2={width - padding.right} y1={yToPx(target)} y2={yToPx(target)} stroke="#10B981" strokeDasharray="4 4" strokeWidth={2} />
            {bars.map((b, i) => (
              <G key={`col-${data[i].x || i}`}>
                <Rect x={b.x} y={b.consumedY} width={b.barW} height={Math.max(2, b.consumedH)} fill="#1F2937" rx={3} />
                <Rect x={b.x} y={b.burnedY} width={b.barW} height={Math.max(2, b.burnedH)} fill="#F59E0B" rx={3} />
                <SvgText x={b.x + b.barW / 2} y={height - 6} fill="#6B7280" fontSize="10" textAnchor="middle">{data[i].x}</SvgText>
              </G>
            ))}
          </Svg>
        )}
      </View>
    </View>
  );
}

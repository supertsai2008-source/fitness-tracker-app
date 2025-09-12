import React, { useMemo, useState } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import Svg, { Path, Line, Text as SvgText, Defs, LinearGradient, Stop, Circle } from "react-native-svg";

export interface TrendPoint { x: string; y: number }

interface TrendAreaChartProps {
  title?: string;
  unit?: string;
  data: TrendPoint[];
  height?: number;
  yMin?: number;
  yMax?: number;
}

export default function TrendAreaChart({ title, unit = "", data, height = 220, yMin, yMax }: TrendAreaChartProps) {
  const [width, setWidth] = useState(0);
  const padding = { top: 16, right: 16, bottom: 28, left: 40 };
  const chartW = Math.max(0, width - padding.left - padding.right);
  const chartH = height - padding.top - padding.bottom;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const { minY, maxY, pathD, areaD, ticks } = useMemo(() => {
    if (data.length === 0) {
      const minY0 = typeof yMin === "number" ? yMin : 0;
      const maxY0 = typeof yMax === "number" ? yMax : 1;
      return { minY: minY0, maxY: maxY0, pathD: "", areaD: "", ticks: [0, 0.25, 0.5, 0.75, 1].map(t => minY0 + (maxY0 - minY0) * t) };
    }
    let minYc = Math.min(...data.map(d => d.y));
    let maxYc = Math.max(...data.map(d => d.y));
    const margin = (maxYc - minYc) * 0.1 || 1;
    minYc -= margin;
    maxYc += margin;

    const minYf = typeof yMin === "number" ? yMin : minYc;
    const maxYf = typeof yMax === "number" ? yMax : maxYc;

    const xToPx = (i: number) => padding.left + (chartW * i) / Math.max(data.length - 1, 1);
    const yToPx = (y: number) => padding.top + chartH - ((y - minYf) / (maxYf - minYf || 1)) * chartH;

    const path = data.map((p, i) => `${i === 0 ? "M" : "L"}${xToPx(i)},${yToPx(p.y)}`).join(" ");
    const area = `${path} L ${padding.left + chartW},${padding.top + chartH} L ${padding.left},${padding.top + chartH} Z`;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => minYf + (maxYf - minYf) * t);

    return { minY: minYf, maxY: maxYf, pathD: path, areaD: area, ticks };
  }, [data, chartW, chartH, yMin, yMax]);

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
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.25" />
                <Stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            {ticks.map((t, i) => {
              const y = padding.top + chartH - ((t - minY) / (maxY - minY || 1)) * chartH;
              return <Line key={`g-${i}`} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#F3F4F6" strokeWidth={1} />;
            })}
            {ticks.map((t, i) => {
              const y = padding.top + chartH - ((t - minY) / (maxY - minY || 1)) * chartH;
              return <SvgText key={`yl-${i}`} x={8} y={y + 4} fill="#6B7280" fontSize="10">{`${Math.round(t)}${unit}`}</SvgText>;
            })}
            <Path d={areaD} fill="url(#grad)" />
            <Path d={pathD} stroke="#1F2937" strokeWidth={2} fill="none" />
            {data.length > 0 && (
              <Circle cx={padding.left + chartW} cy={padding.top + chartH - ((data[data.length-1].y - minY) / (maxY - minY || 1)) * chartH} r={3} fill="#1F2937" />
            )}
            {data.map((p, i) => (
              (i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) ? (
                <SvgText key={`xl-${i}`} x={padding.left + (chartW * i) / Math.max(data.length - 1, 1)} y={height - 6} fill="#6B7280" fontSize="10" textAnchor="middle">{p.x}</SvgText>
              ) : null
            ))}
          </Svg>
        )}
      </View>
    </View>
  );
}

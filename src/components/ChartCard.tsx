import React, { useMemo, useState } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import Svg, { Line, Rect, Circle, Path, Text as SvgText, G } from "react-native-svg";

export type TimeRange = "week" | "month" | "3months";
export type Metric = "weight" | "calories" | "macros" | "exercise";

export interface Point { 
  x: number | string; 
  y: number; 
  label?: string;
  // For macro/stacked data
  protein?: number;
  carbs?: number;
  fat?: number;
  // For pie chart data
  segments?: Array<{ value: number; color: string; label: string }>;
}

interface ChartCardProps {
  title: string;
  metric: Metric;
  range: TimeRange;
  unit: string; // "kg" | "kcal" | "g"
  data: Point[]; // already sized for the range (7, 30, or ~12)
  type?: "bar" | "line" | "bar+line" | "pie" | "stacked-bar";
}

export default function ChartCard({ title, metric, range, unit, data, type = "bar+line" }: ChartCardProps) {
  const [width, setWidth] = useState(0);
  const height = 200;
  const padding = { top: 10, right: 16, bottom: 26, left: 40 };

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const { minY, maxY, yTicks, points } = useMemo(() => {
    if (data.length === 0) {
      return { minY: 0, maxY: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], points: [] as Point[] };
    }
    let localMin = Math.min(...data.map((d) => d.y));
    let localMax = Math.max(...data.map((d) => d.y));

    if (metric !== "weight") {
      localMin = Math.min(0, localMin);
      localMax = Math.max(10, localMax);
    } else {
      const margin = (localMax - localMin) * 0.1 || 1;
      localMin -= margin;
      localMax += margin;
    }

    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => localMin + (localMax - localMin) * t);

    return { minY: localMin, maxY: localMax, yTicks: ticks, points: data };
  }, [data, metric]);

  const chartW = Math.max(0, width - padding.left - padding.right);
  const chartH = height - padding.top - padding.bottom;

  const xStep = points.length > 1 ? chartW / (points.length - 1) : chartW;
  const barW = Math.max(6, chartW / Math.max(points.length * 1.6, 6));

  const yToPx = (y: number) => {
    const ratio = (y - minY) / (maxY - minY || 1);
    return padding.top + chartH - ratio * chartH;
  };

  const xToPx = (i: number) => padding.left + i * xStep;

  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"}${xToPx(i)},${yToPx(p.y)}`)
      .join(" ");
  }, [points, chartW, chartH, minY, maxY]);

  // Pie chart calculations
  const pieData = useMemo(() => {
    if (type !== "pie" || points.length === 0) return [];
    
    // Use the first data point's segments or create default macro breakdown
    const firstPoint = points[0];
    const segments = firstPoint.segments || [
      { value: firstPoint.protein || 0, color: "#3B82F6", label: "蛋白質" },
      { value: firstPoint.carbs || 0, color: "#10B981", label: "碳水" },
      { value: firstPoint.fat || 0, color: "#F59E0B", label: "脂肪" }
    ];
    
    const total = segments.reduce((sum, seg) => sum + seg.value, 0);
    if (total === 0) return [];
    
    let currentAngle = -Math.PI / 2; // Start at top
    const radius = Math.min(chartW, chartH) / 3;
    const centerX = width / 2;
    const centerY = height / 2;
    
    return segments.map(segment => {
      const angle = (segment.value / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      currentAngle += angle;
      
      return {
        ...segment,
        pathData,
        percentage: Math.round((segment.value / total) * 100)
      };
    });
  }, [type, points, chartW, chartH, width, height]);

  // Stacked bar calculations
  const stackedBarData = useMemo(() => {
    if (type !== "stacked-bar") return [];
    
    return points.map((point, i) => {
      const protein = point.protein || 0;
      const carbs = point.carbs || 0;
      const fat = point.fat || 0;
      const total = protein + carbs + fat;
      
      if (total === 0) return { x: xToPx(i), bars: [] };
      
      const barHeight = chartH * 0.8;
      const proteinHeight = (protein / total) * barHeight;
      const carbsHeight = (carbs / total) * barHeight;
      const fatHeight = (fat / total) * barHeight;
      
      return {
        x: xToPx(i),
        bars: [
          { height: proteinHeight, y: padding.top + chartH - proteinHeight, color: "#3B82F6", label: "蛋白質" },
          { height: carbsHeight, y: padding.top + chartH - proteinHeight - carbsHeight, color: "#10B981", label: "碳水" },
          { height: fatHeight, y: padding.top + chartH - proteinHeight - carbsHeight - fatHeight, color: "#F59E0B", label: "脂肪" }
        ]
      };
    });
  }, [type, points, chartH, padding.top]);

  return (
    <View className="bg-white mx-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
      <View className="p-4 border-b border-gray-100">
        <Text className="text-lg font-semibold text-black">{title}</Text>
      </View>
      <View className="p-4" onLayout={onLayout} pointerEvents="box-none">
        {data.length === 0 || width === 0 ? (
          <View style={{ height }} className="items-center justify-center">
            <Text className="text-gray-500">暫無數據</Text>
          </View>
        ) : (
          <Svg width={width} height={height} pointerEvents="none">
            {/* Pie Chart */}
            {type === "pie" && pieData.map((segment, i) => (
              <G key={`pie-${i}`}>
                <Path d={segment.pathData} fill={segment.color} stroke="#FFFFFF" strokeWidth={2} />
              </G>
            ))}
            
            {/* Stacked Bar Chart */}
            {type === "stacked-bar" && stackedBarData.map((item, i) => (
              <G key={`stack-${i}`}>
                {item.bars.map((bar, j) => (
                  <Rect
                    key={`bar-${i}-${j}`}
                    x={item.x - barW / 2}
                    y={bar.y}
                    width={barW}
                    height={bar.height}
                    fill={bar.color}
                    rx={j === 0 ? 2 : 0}
                  />
                ))}
              </G>
            ))}
            
            {/* Traditional Charts */}
            {(type === "bar" || type === "line" || type === "bar+line") && (
              <G>
                {/* Grid */}
                {yTicks.map((t, idx) => (
                  <Line key={`g-${idx}`} x1={padding.left} x2={width - padding.right} y1={yToPx(t)} y2={yToPx(t)} stroke="#F3F4F6" strokeWidth={1} />
                ))}
                {/* Y axis labels */}
                {yTicks.map((t, idx) => (
                  <SvgText key={`yl-${idx}`} x={8} y={yToPx(t) + 4} fill="#6B7280" fontSize="10">{`${Math.round(t)}${unit}`}</SvgText>
                ))}
                {/* Bars */}
                {(type === "bar" || type === "bar+line") && points.map((p, i) => (
                  <Rect key={`b-${i}`} x={xToPx(i) - barW / 2} y={yToPx(Math.max(p.y, 0))} width={barW} height={Math.max(2, yToPx(Math.min(p.y, 0)) - yToPx(p.y))} fill="#11111122" rx={2} />
                ))}
                {/* Line */}
                {(type === "line" || type === "bar+line") && (
                  <Path d={linePath} stroke="#2563EB" strokeWidth={2} fill="none" />
                )}
                {/* Last point highlight */}
                {points.length > 0 && (
                  <Circle cx={xToPx(points.length - 1)} cy={yToPx(points[points.length - 1].y)} r={3} fill="#2563EB" />
                )}
                {/* X labels (sparse) */}
                {points.map((p, i) => {
                  const every = range === "3months" ? 1 : Math.ceil(points.length / 7);
                  if (i % every !== 0 && i !== points.length - 1) return null;
                  const text = typeof p.x === "string" ? p.x : String(p.x);
                  return (
                    <SvgText key={`xl-${i}`} x={xToPx(i)} y={height - 6} fill="#6B7280" fontSize="10" textAnchor="middle">
                      {text}
                    </SvgText>
                  );
                })}
              </G>
            )}
          </Svg>
        )}
        
        {/* Legend for pie and stacked charts */}
        {(type === "pie" && pieData.length > 0) && (
          <View className="flex-row justify-center mt-4">
            {pieData.map((segment, i) => (
              <View key={`legend-${i}`} className="flex-row items-center">
                <View 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: segment.color }}
                />
                <Text className="text-xs text-gray-600">
                  {segment.label} {segment.percentage}%
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {(type === "stacked-bar" && stackedBarData.length > 0) && (
          <View className="flex-row justify-center mt-4">
            {stackedBarData[0]?.bars.map((bar, i) => (
              <View key={`legend-${i}`} className="flex-row items-center">
                <View 
                  className="w-3 h-3 rounded mr-2" 
                  style={{ backgroundColor: bar.color }}
                />
                <Text className="text-xs text-gray-600">{bar.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

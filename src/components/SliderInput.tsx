import React from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";

interface SliderInputProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
}

export default function SliderInput({
  label,
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step = 1,
  unit = "",
  formatValue,
}: SliderInputProps) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;
  
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-medium text-black">{label}</Text>
        <Text className="text-lg font-bold text-black">{displayValue}</Text>
      </View>
      <Slider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        minimumTrackTintColor="#000000"
        maximumTrackTintColor="#E5E5E5"
        thumbTintColor="#000000"
      />
      <View className="flex-row justify-between mt-2">
        <Text className="text-sm text-gray-500">{minimumValue}{unit}</Text>
        <Text className="text-sm text-gray-500">{maximumValue}{unit}</Text>
      </View>
    </View>
  );
}
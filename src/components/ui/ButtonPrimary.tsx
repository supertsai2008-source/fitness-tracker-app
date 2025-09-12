import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
  disabled?: boolean;
}

export default function ButtonPrimary({ title, onPress, icon, className, disabled }: Props) {
  return (
    <Pressable onPress={onPress} disabled={disabled} className={`w-full py-4 rounded-2xl items-center justify-center ${disabled ? "bg-slate-300" : "bg-black"} ${className || ""}`} accessibilityRole="button" accessibilityLabel={title}>
      {icon && <Ionicons name={icon} size={18} color="#fff" />}
      <Text allowFontScaling={false} className="text-white font-bold text-base">{title}</Text>
    </Pressable>
  );
}

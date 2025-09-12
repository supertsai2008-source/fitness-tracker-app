import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  provider: "google" | "apple" | "email";
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const providerStyles: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap; color?: string }> = {
  google: { bg: "bg-white", text: "text-slate-900", icon: "logo-google", color: "#1F2937" },
  apple: { bg: "bg-black", text: "text-white", icon: "logo-apple" },
  email: { bg: "bg-slate-100", text: "text-slate-900", icon: "mail" },
};

export default function SocialButton({ provider, title, onPress, disabled }: Props) {
  const s = providerStyles[provider];
  return (
    <Pressable onPress={onPress} disabled={disabled} className={`w-full py-3 rounded-xl flex-row items-center justify-center border ${provider==="google"?"border-slate-200":"border-transparent"} ${s.bg} ${disabled?"opacity-60":""}`} accessibilityRole="button" accessibilityLabel={title}>
      <Ionicons name={s.icon} size={18} color={s.color || (provider === "apple" ? "#fff" : "#111827")} />
      <Text className={`ml-2 font-semibold ${s.text}`}>{title}</Text>
    </Pressable>
  );
}

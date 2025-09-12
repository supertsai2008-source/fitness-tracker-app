import React from "react";
import { Text } from "react-native";

export default function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <Text className="text-red-600 text-sm mt-2">{message}</Text>;
}

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrandLogo from "../components/BrandLogo";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "載入中..." }: LoadingScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        {/* Brand Logo */}
        <View className="mb-8">
          <BrandLogo size="large" showText />
        </View>
        
        {/* Loading Indicator */}
        <ActivityIndicator size="large" color="#000000" />
        
        {/* Loading Message */}
        <Text className="text-gray-600 text-center mt-4 text-lg">
          {message}
        </Text>
        
        {/* App Version */}
        <View className="absolute bottom-8">
          <Text className="text-gray-400 text-sm">
            版本 1.0.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
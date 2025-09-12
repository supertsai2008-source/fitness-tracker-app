import React from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface OnboardingStepProps {
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
  nextDisabled?: boolean;
  logo?: React.ReactNode;
  children: React.ReactNode;
}

export default function OnboardingStep({
  title,
  subtitle,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  nextDisabled = false,
  logo,
  children,
}: OnboardingStepProps) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View className="px-6 py-4">
              <View className="flex-row items-center justify-between mb-4">
                {onBack ? (
                  <Pressable onPress={onBack} className="p-2">
                    <Ionicons name="chevron-back" size={24} color="#000000" />
                  </Pressable>
                ) : (
                  <View className="w-10" />
                )}
                <Text className="text-sm text-gray-500 font-medium">
                  {currentStep} / {totalSteps}
                </Text>
              </View>
              
              {/* Progress Bar */}
              <View className="w-full h-2 bg-gray-200 rounded-full mb-6">
                <View 
                  className="h-2 bg-black rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </View>
              
              {/* Logo */}
              {logo && (
                <View className="items-center mb-6">
                  {logo}
                </View>
              )}
              
              <Text className="text-2xl font-bold text-black mb-2">{title}</Text>
              {subtitle && (
                <Text className="text-gray-600 text-base leading-6">{subtitle}</Text>
              )}
            </View>
            
            {/* Content */}
            <ScrollView
              className="flex-1"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
            
            {/* Footer */}
            <View className="px-6 pb-8" style={{ paddingBottom: insets.bottom + 12 }}>
              <Pressable
                onPress={onNext}
                disabled={nextDisabled}
                className={`w-full py-4 rounded-xl ${
                  nextDisabled 
                    ? "bg-gray-200" 
                    : "bg-black"
                }`}
              >
                <Text className={`text-center font-semibold text-lg ${
                  nextDisabled 
                    ? "text-gray-400" 
                    : "text-white"
                }`}>
                  繼續
                </Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
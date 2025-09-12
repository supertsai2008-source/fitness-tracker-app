import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useUserStore } from "../state/userStore";
import { User } from "../types";
import OnboardingStep from "../components/OnboardingStep";
import SliderInput from "../components/SliderInput";
import BrandLogo from "../components/BrandLogo";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Onboarding">;

interface OnboardingData {
  gender: "male" | "female" | null;
  age: string;
  height: string;
  weight: string;
  bodyFat: string;
  activityLevel: number;
  targetWeight: string;
  targetDate: string;
  dietExerciseRatio: number;
  weightLossSpeed: number;
  allergies: string;
  reminderFrequency: number;
}

const activityLevels = [
  { value: 1.2, label: "久坐不動", description: "辦公室工作，很少運動" },
  { value: 1.375, label: "輕度活動", description: "每週輕度運動1-3天" },
  { value: 1.55, label: "中度活動", description: "每週中度運動3-5天" },
  { value: 1.725, label: "高度活動", description: "每週高強度運動6-7天" },
  { value: 1.9, label: "極高活動", description: "體力勞動或每日訓練" },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { setUser, completeOnboarding } = useUserStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    gender: null,
    age: "",
    height: "",
    weight: "",
    bodyFat: "",
    activityLevel: 1.375,
    targetWeight: "",
    targetDate: "",
    dietExerciseRatio: 70,
    weightLossSpeed: 0.5,
    allergies: "",
    reminderFrequency: 7,
  });

  const totalSteps = 8;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Validate required fields
    if (!data.gender || !data.age || !data.height || !data.weight || !data.bodyFat || !data.targetWeight) {
      Alert.alert("錯誤", "請填寫所有必填欄位");
      return;
    }

    // Calculate target date if not provided (default to 3 months)
    const targetDate = data.targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const user: User = {
      id: Date.now().toString(),
      gender: data.gender,
      age: parseInt(data.age),
      height: parseInt(data.height),
      weight: parseFloat(data.weight),
      bodyFat: parseFloat(data.bodyFat),
      activityLevel: data.activityLevel,
      targetWeight: parseFloat(data.targetWeight),
      targetDate,
      dietExerciseRatio: data.dietExerciseRatio,
      weightLossSpeed: data.weightLossSpeed,
      allergies: data.allergies,
      reminderFrequency: data.reminderFrequency,
      bmr: 0, // Will be calculated in store
      tdee: 0, // Will be calculated in store
      dailyCalorieTarget: 0, // Will be calculated in store
      proteinTarget: 0, // Will be calculated in store
      carbTarget: 0, // Will be calculated in store
      fatTarget: 0, // Will be calculated in store
      createdAt: new Date().toISOString(),
    };

    setUser(user);
    completeOnboarding();
    navigation.navigate("Paywall");
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return data.gender !== null;
      case 2: return data.age !== "" && parseInt(data.age) > 0;
      case 3: return data.height !== "" && parseInt(data.height) > 0;
      case 4: return data.weight !== "" && parseFloat(data.weight) > 0;
      case 5: return data.bodyFat !== "" && parseFloat(data.bodyFat) > 0;
      case 6: return true; // Activity level always has a default
      case 7: return data.targetWeight !== "" && parseFloat(data.targetWeight) > 0;
      case 8: return true; // Optional fields
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep
            title="您的性別是？"
            subtitle="這將幫助我們計算更準確的基礎代謝率"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            nextDisabled={!isStepValid()}
            logo={<BrandLogo size="large" showText />}
          >
            <View className="flex-1 justify-center">
              <View>
                <Pressable
                  onPress={() => setData({ ...data, gender: "male" })}
                  className={`p-4 rounded-xl border-2 ${
                    data.gender === "male" ? "border-black bg-gray-50" : "border-gray-200"
                  }`}
                >
                  <Text className={`text-center text-lg font-medium ${
                    data.gender === "male" ? "text-black" : "text-gray-600"
                  }`}>
                    男性
                  </Text>
                </Pressable>
                
                <Pressable
                  onPress={() => setData({ ...data, gender: "female" })}
                  className={`p-4 rounded-xl border-2 ${
                    data.gender === "female" ? "border-black bg-gray-50" : "border-gray-200"
                  }`}
                >
                  <Text className={`text-center text-lg font-medium ${
                    data.gender === "female" ? "text-black" : "text-gray-600"
                  }`}>
                    女性
                  </Text>
                </Pressable>
              </View>
            </View>
          </OnboardingStep>
        );

      case 2:
        return (
          <OnboardingStep
            title="您的年齡是？"
            subtitle="年齡會影響基礎代謝率的計算"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!isStepValid()}
          >
            <View className="flex-1 justify-center">
              <TextInput
                value={data.age}
                onChangeText={(text) => setData({ ...data, age: text })}
                placeholder="請輸入年齡"
                keyboardType="numeric"
                inputMode="numeric"
                returnKeyType="done"
                onSubmitEditing={handleNext}
                blurOnSubmit
                className="text-2xl font-bold text-center p-4 border-b-2 border-gray-200 focus:border-black"
                autoFocus
              />
              <Text className="text-center text-gray-500 mt-2">歲</Text>
            </View>
          </OnboardingStep>
        );

      case 3:
        return (
          <OnboardingStep
            title="您的身高是？"
            subtitle="身高用於計算BMI和基礎代謝率"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!isStepValid()}
          >
            <View className="flex-1 justify-center">
              <TextInput
                value={data.height}
                onChangeText={(text) => setData({ ...data, height: text })}
                placeholder="請輸入身高"
                keyboardType="numeric"
                inputMode="numeric"
                returnKeyType="done"
                onSubmitEditing={handleNext}
                className="text-2xl font-bold text-center p-4 border-b-2 border-gray-200 focus:border-black"
                autoFocus
              />
              <Text className="text-center text-gray-500 mt-2">公分</Text>
            </View>
          </OnboardingStep>
        );

      case 4:
        return (
          <OnboardingStep
            title="您的體重是？"
            subtitle="目前的體重，用於計算每日熱量需求"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!isStepValid()}
          >
            <View className="flex-1 justify-center">
              <TextInput
                value={data.weight}
                onChangeText={(text) => setData({ ...data, weight: text })}
                placeholder="請輸入體重"
                keyboardType="numeric"
                inputMode="numeric"
                returnKeyType="done"
                onSubmitEditing={handleNext}
                className="text-2xl font-bold text-center p-4 border-b-2 border-gray-200 focus:border-black"
                autoFocus
              />
              <Text className="text-center text-gray-500 mt-2">公斤</Text>
            </View>
          </OnboardingStep>
        );

      case 5:
        return (
          <OnboardingStep
            title="您的體脂率是？"
            subtitle="如果不確定，可以估算或使用體脂計測量"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!isStepValid()}
          >
            <View className="flex-1 justify-center">
              <TextInput
                value={data.bodyFat}
                onChangeText={(text) => setData({ ...data, bodyFat: text })}
                placeholder="請輸入體脂率"
                keyboardType="numeric"
                inputMode="numeric"
                returnKeyType="done"
                onSubmitEditing={handleNext}
                className="text-2xl font-bold text-center p-4 border-b-2 border-gray-200 focus:border-black"
                autoFocus
              />
              <Text className="text-center text-gray-500 mt-2">%</Text>
            </View>
          </OnboardingStep>
        );

      case 6:
        return (
          <OnboardingStep
            title="您的活動程度？"
            subtitle="選擇最符合您日常生活的活動程度"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!isStepValid()}
          >
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View className="py-4">
                {activityLevels.map((level) => (
                  <Pressable
                    key={level.value}
                    onPress={() => setData({ ...data, activityLevel: level.value })}
                    className={`p-4 rounded-xl border-2 ${
                      data.activityLevel === level.value ? "border-black bg-gray-50" : "border-gray-200"
                    }`}
                  >
                    <Text className={`font-medium text-lg mb-1 ${
                      data.activityLevel === level.value ? "text-black" : "text-gray-800"
                    }`}>
                      {level.label}
                    </Text>
                    <Text className="text-gray-600 text-sm">{level.description}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </OnboardingStep>
        );

      case 7:
        return (
          <OnboardingStep
            title="您的目標體重？"
            subtitle="設定一個健康且可達成的目標"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!isStepValid()}
          >
            <View className="flex-1 justify-center">
              <TextInput
                value={data.targetWeight}
                onChangeText={(text) => setData({ ...data, targetWeight: text })}
                placeholder="請輸入目標體重"
                keyboardType="numeric"
                inputMode="numeric"
                returnKeyType="done"
                onSubmitEditing={handleNext}
                className="text-2xl font-bold text-center p-4 border-b-2 border-gray-200 focus:border-black"
                autoFocus
              />
              <Text className="text-center text-gray-500 mt-2">公斤</Text>
            </View>
          </OnboardingStep>
        );

      case 8:
        return (
          <OnboardingStep
            title="個人化設定"
            subtitle="最後的設定，讓我們為您量身打造計畫"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!isStepValid()}
          >
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View className="py-4">
                <SliderInput
                  label="飲食 vs 運動偏好"
                  value={data.dietExerciseRatio}
                  onValueChange={(value) => setData({ ...data, dietExerciseRatio: value })}
                  minimumValue={30}
                  maximumValue={90}
                  step={10}
                  formatValue={(value) => `飲食 ${value}% / 運動 ${100-value}%`}
                />
                
                <SliderInput
                  label="減重速度"
                  value={data.weightLossSpeed}
                  onValueChange={(value) => setData({ ...data, weightLossSpeed: value })}
                  minimumValue={0.25}
                  maximumValue={1.0}
                  step={0.25}
                  formatValue={(value) => `${value} 公斤/週`}
                />
                
                <SliderInput
                  label="提醒頻率"
                  value={data.reminderFrequency}
                  onValueChange={(value) => setData({ ...data, reminderFrequency: value })}
                  minimumValue={1}
                  maximumValue={14}
                  step={1}
                  formatValue={(value) => `每 ${value} 天`}
                />
                
                <View className="mt-4">
                  <Text className="text-lg font-medium text-black mb-3">食物過敏或限制</Text>
                  <TextInput
                    value={data.allergies}
                    onChangeText={(text) => setData({ ...data, allergies: text })}
                    placeholder="例如：堅果過敏、素食主義者..."
                    multiline
                    numberOfLines={3}
                    className="p-4 border-2 border-gray-200 rounded-xl text-base"
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </ScrollView>
          </OnboardingStep>
        );

      default:
        return null;
    }
  };

  return renderStep();
}
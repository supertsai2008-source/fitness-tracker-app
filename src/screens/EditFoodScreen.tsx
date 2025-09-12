import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";

// Components
import BrandLogo from "../components/BrandLogo";

// Stores
import { useFoodStore } from "../state/foodStore";

// Types
import { FoodLog } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;



const mealTypes = [
  { id: "breakfast", label: "早餐", icon: "sunny" as const },
  { id: "lunch", label: "午餐", icon: "partly-sunny" as const },
  { id: "dinner", label: "晚餐", icon: "moon" as const },
  { id: "snack", label: "點心", icon: "cafe" as const },
];

export default function EditFoodScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { updateFoodLog, deleteFoodLog } = useFoodStore();
  
  // Get the food log from route params
  const foodLog = (route.params as any)?.foodLog as FoodLog;
  
  const [servings, setServings] = useState(foodLog?.servings.toString() || "1");
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">(foodLog?.mealType || "breakfast");
  const [calories, setCalories] = useState((foodLog?.calories / foodLog?.servings || 0).toString());
  const [protein, setProtein] = useState((foodLog?.protein / foodLog?.servings || 0).toString());
  const [carbs, setCarbs] = useState((foodLog?.carbs / foodLog?.servings || 0).toString());
  const [fat, setFat] = useState((foodLog?.fat / foodLog?.servings || 0).toString());
  const [isLoading, setIsLoading] = useState(false);

  if (!foodLog) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-semibold text-black">找不到食物記錄</Text>
          <Pressable onPress={() => navigation.goBack()} className="mt-4 px-6 py-3 bg-black rounded-xl">
            <Text className="text-white font-semibold">返回</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveChanges = async () => {
    setIsLoading(true);
    
    try {
      const servingCount = parseFloat(servings) || 1;
      const caloriesPerServing = parseFloat(calories) || 0;
      const proteinPerServing = parseFloat(protein) || 0;
      const carbsPerServing = parseFloat(carbs) || 0;
      const fatPerServing = parseFloat(fat) || 0;
      
      updateFoodLog(foodLog.id, {
        servings: servingCount,
        mealType: selectedMealType as "breakfast" | "lunch" | "dinner" | "snack",
        calories: caloriesPerServing * servingCount,
        protein: proteinPerServing * servingCount,
        carbs: carbsPerServing * servingCount,
        fat: fatPerServing * servingCount,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert("錯誤", "更新失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFood = () => {
    Alert.alert(
      "刪除食物記錄",
      `確定要刪除「${foodLog.foodName}」嗎？`,
      [
        { text: "取消", style: "cancel" },
        { 
          text: "刪除", 
          style: "destructive",
          onPress: () => {
            deleteFoodLog(foodLog.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const adjustNutrition = (field: "calories" | "protein" | "carbs" | "fat", delta: number) => {
    const currentValue = parseFloat(
      field === "calories" ? calories :
      field === "protein" ? protein :
      field === "carbs" ? carbs : fat
    ) || 0;
    
    const newValue = Math.max(0, currentValue + delta);
    
    if (field === "calories") setCalories(newValue.toString());
    else if (field === "protein") setProtein(newValue.toString());
    else if (field === "carbs") setCarbs(newValue.toString());
    else if (field === "fat") setFat(newValue.toString());
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Header */}
            <View className="bg-white px-6 py-4 border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <Pressable onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={24} color="#000000" />
                </Pressable>
                <BrandLogo size="small" />
                <Pressable onPress={handleDeleteFood}>
                  <Ionicons name="trash-outline" size={24} color="#EF4444" />
                </Pressable>
              </View>
              <Text className="text-2xl font-bold text-black mt-4">編輯食物</Text>
              <Text className="text-gray-600">{foodLog.foodName}</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Meal Type Selection */}
              <View className="bg-white mx-6 mt-4 p-6 rounded-2xl shadow-sm border border-gray-100">
                <Text className="text-lg font-semibold text-black mb-3">餐別</Text>
                <View className="flex-row">
                  {mealTypes.map((meal, idx) => (
                    <Pressable
                      key={meal.id}
                      onPress={() => setSelectedMealType(meal.id as "breakfast" | "lunch" | "dinner" | "snack")}
                      className={`flex-1 p-3 rounded-xl border-2 items-center ${
                        selectedMealType === meal.id
                          ? "border-black bg-gray-50"
                          : "border-gray-200"
                      } ${idx < mealTypes.length - 1 ? "mr-3" : ""}`}
                    >
                      <Ionicons 
                        name={meal.icon} 
                        size={20} 
                        color={selectedMealType === meal.id ? "#000000" : "#6B7280"} 
                      />
                      <Text className={`text-sm font-medium mt-1 ${
                        selectedMealType === meal.id ? "text-black" : "text-gray-600"
                      }`}>
                        {meal.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Servings */}
              <View className="bg-white mx-6 mt-4 p-6 rounded-2xl shadow-sm border border-gray-100">
                <Text className="text-lg font-semibold text-black mb-3">份數</Text>
                <TextInput
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-medium"
                  placeholder="1"
                />
              </View>

              {/* Nutrition Details */}
              <View className="bg-white mx-6 mt-4 p-6 rounded-2xl shadow-sm border border-gray-100">
                <Text className="text-lg font-semibold text-black mb-4">營養素 (每份)</Text>
                
                <View>
                  {/* Calories */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-700 font-medium">熱量</Text>
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => adjustNutrition("calories", -10)}
                        className="p-2"
                      >
                        <Ionicons name="remove-circle-outline" size={24} color="#6B7280" />
                      </Pressable>
                      <TextInput
                        value={calories}
                        onChangeText={setCalories}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                        className="mx-2 text-center font-semibold text-lg min-w-20 bg-gray-50 rounded-lg px-2 py-1"
                      />
                      <Text className="text-gray-600 mr-2">kcal</Text>
                      <Pressable
                        onPress={() => adjustNutrition("calories", 10)}
                        className="p-2"
                      >
                        <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
                      </Pressable>
                    </View>
                  </View>

                  {/* Protein */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-700 font-medium">蛋白質</Text>
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => adjustNutrition("protein", -1)}
                        className="p-2"
                      >
                        <Ionicons name="remove-circle-outline" size={24} color="#6B7280" />
                      </Pressable>
                      <TextInput
                        value={protein}
                        onChangeText={setProtein}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                        className="mx-2 text-center font-semibold text-lg min-w-16 bg-gray-50 rounded-lg px-2 py-1"
                      />
                      <Text className="text-gray-600 mr-2">g</Text>
                      <Pressable
                        onPress={() => adjustNutrition("protein", 1)}
                        className="p-2"
                      >
                        <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
                      </Pressable>
                    </View>
                  </View>

                  {/* Carbs */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-700 font-medium">碳水化合物</Text>
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => adjustNutrition("carbs", -1)}
                        className="p-2"
                      >
                        <Ionicons name="remove-circle-outline" size={24} color="#6B7280" />
                      </Pressable>
                      <TextInput
                        value={carbs}
                        onChangeText={setCarbs}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                        className="mx-2 text-center font-semibold text-lg min-w-16 bg-gray-50 rounded-lg px-2 py-1"
                      />
                      <Text className="text-gray-600 mr-2">g</Text>
                      <Pressable
                        onPress={() => adjustNutrition("carbs", 1)}
                        className="p-2"
                      >
                        <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
                      </Pressable>
                    </View>
                  </View>

                  {/* Fat */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-700 font-medium">脂肪</Text>
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => adjustNutrition("fat", -1)}
                        className="p-2"
                      >
                        <Ionicons name="remove-circle-outline" size={24} color="#6B7280" />
                      </Pressable>
                      <TextInput
                        value={fat}
                        onChangeText={setFat}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                        className="mx-2 text-center font-semibold text-lg min-w-16 bg-gray-50 rounded-lg px-2 py-1"
                      />
                      <Text className="text-gray-600 mr-2">g</Text>
                      <Pressable
                        onPress={() => adjustNutrition("fat", 1)}
                        className="p-2"
                      >
                        <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>

              {/* Total Nutrition Preview */}
              <View className="bg-black mx-6 mt-4 mb-6 p-6 rounded-2xl">
                <Text className="text-white font-semibold mb-3">總計 ({servings} 份)</Text>
                <View className="flex-row justify-between">
                  <Text className="text-white">
                    {Math.round((parseFloat(calories) || 0) * (parseFloat(servings) || 1))} kcal
                  </Text>
                  <Text className="text-white">
                    蛋白質 {Math.round((parseFloat(protein) || 0) * (parseFloat(servings) || 1))}g
                  </Text>
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-white">
                    碳水 {Math.round((parseFloat(carbs) || 0) * (parseFloat(servings) || 1))}g
                  </Text>
                  <Text className="text-white">
                    脂肪 {Math.round((parseFloat(fat) || 0) * (parseFloat(servings) || 1))}g
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View className="px-6 pb-8 bg-white border-t border-gray-100">
              <Pressable
                onPress={handleSaveChanges}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl ${
                  isLoading ? "bg-gray-300" : "bg-black"
                }`}
              >
                <Text className={`text-center font-semibold text-lg ${
                  isLoading ? "text-gray-500" : "text-white"
                }`}>
                  {isLoading ? "儲存中..." : "儲存變更"}
                </Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";

// Components
import FoodSearchBar from "../components/FoodSearchBar";
import PhotoFoodAnalysis from "../components/PhotoFoodAnalysis";
import BarcodeScanner from "../components/BarcodeScanner";

// Stores
import { useFoodStore } from "../state/foodStore";
import { useUserStore } from "../state/userStore";

// Types
import { FoodItem } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "AddFood">;
type RouteProp = NativeStackScreenProps<RootStackParamList, "AddFood">["route"];

const mealTypes = [
  { id: "breakfast", label: "早餐", icon: "sunny" as const },
  { id: "lunch", label: "午餐", icon: "partly-sunny" as const },
  { id: "dinner", label: "晚餐", icon: "moon" as const },
  { id: "snack", label: "點心", icon: "cafe" as const },
];

export default function AddFoodScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { addFoodLog } = useFoodStore();
  const { user } = useUserStore();
  
  const [selectedMealType, setSelectedMealType] = useState<string>(
    route.params?.mealType || "breakfast"
  );
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState("1");
  const [selectedSize, setSelectedSize] = useState<{ label: string; factor: number; zh?: string } | null>(null);
  const [selectedCooking, setSelectedCooking] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [errorRate, setErrorRate] = useState<number>(0);
  
  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setErrorRate(0);
    setSelectedSize(food.sizeOptions?.[0] || null);
    setSelectedCooking(food.cookingMethod || null);
  };
  
  const handlePhotoAnalysis = (food: FoodItem, analysisErrorRate: number) => {
    setSelectedFood(food);
    setErrorRate(analysisErrorRate);
    setShowCamera(false);
  };
  
  const handleSaveFood = () => {
    if (!selectedFood || !user) {
      Alert.alert("錯誤", "請選擇食物");
      return;
    }
    
    const servingCount = parseFloat(servings) || 1;
    const factor = selectedSize?.factor || 1;
    
    const foodLog = {
      userId: user.id,
      foodId: selectedFood.id,
      foodName: selectedFood.nameZh,
      servings: servingCount,
      calories: selectedFood.calories * servingCount * factor,
      protein: selectedFood.protein * servingCount * factor,
      carbs: selectedFood.carbs * servingCount * factor,
      fat: selectedFood.fat * servingCount * factor,
      mealType: selectedMealType as "breakfast" | "lunch" | "dinner" | "snack",
      loggedAt: new Date().toISOString(),
      source: selectedFood.isCustom ? "photo" as const : "search" as const,
      errorRate: errorRate > 0 ? errorRate : undefined,
      selectedCookingMethod: selectedCooking || undefined,
      selectedServingLabel: selectedSize?.zh || selectedSize?.label,
      sizeFactor: factor,
      aiDetectedName: selectedFood.aiDetectedName,
      aiDetectedNameZh: selectedFood.aiDetectedNameZh,
      aiConfidence: selectedFood.aiConfidence,
    };
    
    addFoodLog(foodLog);
    navigation.goBack();
  };
  
  const adjustNutrition = (field: "calories" | "protein" | "carbs" | "fat", delta: number) => {
    if (!selectedFood) return;
    
    setSelectedFood({
      ...selectedFood,
      [field]: Math.max(0, selectedFood[field] + delta)
    });
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Meal Type Selection */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-black mb-3">選擇餐別</Text>
          <View className="flex-row">
            {mealTypes.map((meal, idx) => (
              <Pressable
                key={meal.id}
                onPress={() => setSelectedMealType(meal.id)}
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
        
        {/* Food Search */}
        <View className="px-6 mb-4">
          <Text className="text-lg font-semibold text-black mb-3">搜尋食物</Text>
          <FoodSearchBar onFoodSelect={handleFoodSelect} />
        </View>
        
        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-black mb-3">快速新增</Text>
          <View className="flex-row">
            <Pressable
              onPress={() => setShowCamera(true)}
              className="flex-1 bg-blue-50 p-4 rounded-xl items-center border border-blue-200 mr-3"
            >
              <Ionicons name="camera" size={24} color="#3B82F6" />
              <Text className="text-blue-800 font-medium mt-2">拍照分析</Text>
            </Pressable>
            
            <Pressable
              onPress={() => setShowBarcodeScanner(true)}
              className="flex-1 bg-green-50 p-4 rounded-xl items-center border border-green-200"
            >
              <Ionicons name="barcode" size={24} color="#10B981" />
              <Text className="text-green-800 font-medium mt-2">掃描條碼</Text>
            </Pressable>
          </View>
        </View>
        
        {/* Selected Food Details */}
        {selectedFood && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-black mb-3">食物詳情</Text>
            {selectedFood.aiDetectedName || selectedFood.aiDetectedNameZh ? (
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                <Text className="text-blue-800 text-xs">AI 辨識品項：{selectedFood.aiDetectedNameZh || selectedFood.aiDetectedName}</Text>
                {typeof selectedFood.aiConfidence === "number" && (
                  <Text className="text-blue-700 text-xs mt-1">AI 置信度 {selectedFood.aiConfidence}%</Text>
                )}
              </View>
            ) : null}
            {/* Portion hints */}
            {selectedFood.portionHints && selectedFood.portionHints.length > 0 && (
              <View className="bg-white border border-gray-200 rounded-xl p-3 mb-3">
                <Text className="text-gray-700 text-sm">份量建議：</Text>
                <View className="flex-row flex-wrap mt-2">
                  {selectedFood.portionHints.map((h, idx) => (
                    <View key={idx} className="px-2 py-1 bg-gray-100 rounded-lg mr-2 mb-2">
                      <Text className="text-xs text-gray-600">{h}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {/* Cooking method */}
            <View className="bg-white border border-gray-200 rounded-xl p-3 mb-3">
              <Text className="text-gray-700 text-sm mb-2">烹煮方式</Text>
              <View className="flex-row flex-wrap">
                {(["raw","boiled","steamed","grilled","baked","stir_fry","deep_fry","other"] as const).map((m) => (
                  <Pressable key={m} onPress={() => setSelectedCooking(m)} className={`px-3 py-2 rounded-lg mr-2 mb-2 border ${selectedCooking===m?"bg-gray-900 border-gray-900":"border-gray-200"}`}>
                    <Text className={`${selectedCooking===m?"text-white":"text-gray-700"} text-xs`}>
                      {m === "raw"?"生食": m==="boiled"?"水煮": m==="steamed"?"清蒸": m==="grilled"?"烤": m==="baked"?"烘烤": m==="stir_fry"?"快炒": m==="deep_fry"?"油炸":"其他"}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {selectedFood.cookingInstructions && (
                <Text className="text-gray-500 text-xs mt-2">{selectedFood.cookingInstructions}</Text>
              )}
            </View>
            {/* Size options */}
            {selectedFood.sizeOptions && selectedFood.sizeOptions.length > 0 && (
              <View className="bg-white border border-gray-200 rounded-xl p-3 mb-3">
                <Text className="text-gray-700 text-sm mb-2">尺寸</Text>
                <View className="flex-row flex-wrap">
                  {selectedFood.sizeOptions.map((s, idx) => (
                    <Pressable key={idx} onPress={() => setSelectedSize(s)} className={`px-3 py-2 rounded-lg mr-2 mb-2 border ${selectedSize?.label===s.label?"bg-gray-900 border-gray-900":"border-gray-200"}`}>
                      <Text className={`${selectedSize?.label===s.label?"text-white":"text-gray-700"} text-xs`}>{s.zh || s.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
            
            <View className="bg-gray-50 p-4 rounded-xl mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl font-bold text-black">
                  {selectedFood.nameZh}
                </Text>
                {errorRate > 0 && (
                  <View className="bg-yellow-100 px-2 py-1 rounded">
                    <Text className="text-yellow-800 text-xs">
                      誤差 ±{errorRate}%
                    </Text>
                  </View>
                )}
              </View>
              
               <Text className="text-gray-600 mb-1">
                 每{selectedFood.servingNameZh}{selectedSize?.zh ? `（${selectedSize.zh}）` : selectedSize?.label ? `（${selectedSize.label}）` : ""}
               </Text>
               <Text className="text-gray-500 text-xs mb-3">已套用尺寸係數 {selectedSize?.factor || 1}x</Text>
              
              {/* Nutrition Info with Adjustment */}
              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-700">熱量</Text>
                  <View className="flex-row items-center">
                    {errorRate > 0 && (
                      <>
                        <Pressable
                          onPress={() => adjustNutrition("calories", -10)}
                          className="p-1"
                        >
                          <Ionicons name="remove-circle-outline" size={20} color="#6B7280" />
                        </Pressable>
                           <Text className="mx-2 font-semibold min-w-16 text-center">
                             {Math.round(selectedFood.calories * (selectedSize?.factor || 1))} kcal
                           </Text>
                        <Pressable
                          onPress={() => adjustNutrition("calories", 10)}
                          className="p-1"
                        >
                          <Ionicons name="add-circle-outline" size={20} color="#6B7280" />
                        </Pressable>
                      </>
                    )}
                    {errorRate === 0 && (
                       <Text className="font-semibold">{Math.round(selectedFood.calories * (selectedSize?.factor || 1))} kcal</Text>
                    )}
                  </View>
                </View>
                
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-700">蛋白質</Text>
                  <View className="flex-row items-center">
                    {errorRate > 0 && (
                      <>
                        <Pressable
                          onPress={() => adjustNutrition("protein", -1)}
                          className="p-1"
                        >
                          <Ionicons name="remove-circle-outline" size={20} color="#6B7280" />
                        </Pressable>
                         <Text className="mx-2 font-semibold min-w-12 text-center">
                           {Math.round(selectedFood.protein * (selectedSize?.factor || 1))}g
                         </Text>
                        <Pressable
                          onPress={() => adjustNutrition("protein", 1)}
                          className="p-1"
                        >
                          <Ionicons name="add-circle-outline" size={20} color="#6B7280" />
                        </Pressable>
                      </>
                    )}
                     {errorRate === 0 && (
                       <Text className="font-semibold">{Math.round(selectedFood.protein * (selectedSize?.factor || 1))}g</Text>
                     )}
                  </View>
                </View>
                
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-700">碳水化合物</Text>
                  <View className="flex-row items-center">
                    {errorRate > 0 && (
                      <>
                        <Pressable
                          onPress={() => adjustNutrition("carbs", -1)}
                          className="p-1"
                        >
                          <Ionicons name="remove-circle-outline" size={20} color="#6B7280" />
                        </Pressable>
                         <Text className="mx-2 font-semibold min-w-12 text-center">
                           {Math.round(selectedFood.carbs * (selectedSize?.factor || 1))}g
                         </Text>
                        <Pressable
                          onPress={() => adjustNutrition("carbs", 1)}
                          className="p-1"
                        >
                          <Ionicons name="add-circle-outline" size={20} color="#6B7280" />
                        </Pressable>
                      </>
                    )}
                     {errorRate === 0 && (
                       <Text className="font-semibold">{Math.round(selectedFood.carbs * (selectedSize?.factor || 1))}g</Text>
                     )}
                  </View>
                </View>
                
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-700">脂肪</Text>
                  <View className="flex-row items-center">
                    {errorRate > 0 && (
                      <>
                        <Pressable
                          onPress={() => adjustNutrition("fat", -1)}
                          className="p-1"
                        >
                          <Ionicons name="remove-circle-outline" size={20} color="#6B7280" />
                        </Pressable>
                         <Text className="mx-2 font-semibold min-w-12 text-center">
                           {Math.round(selectedFood.fat * (selectedSize?.factor || 1))}g
                         </Text>
                        <Pressable
                          onPress={() => adjustNutrition("fat", 1)}
                          className="p-1"
                        >
                          <Ionicons name="add-circle-outline" size={20} color="#6B7280" />
                        </Pressable>
                      </>
                    )}
                     {errorRate === 0 && (
                       <Text className="font-semibold">{Math.round(selectedFood.fat * (selectedSize?.factor || 1))}g</Text>
                     )}
                  </View>
                </View>
              </View>
            </View>
            
            {/* Servings */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">份數</Text>
              <TextInput
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg"
                placeholder="1"
              />
            </View>
            
            {/* Total Nutrition */}
            <View className="bg-black p-4 rounded-xl">
              <Text className="text-white font-semibold mb-2">總計</Text>
              <View className="flex-row justify-between">
                 <Text className="text-white">
                   {Math.round(selectedFood.calories * (parseFloat(servings) || 1) * (selectedSize?.factor || 1))} kcal
                 </Text>
                 <Text className="text-white">
                   蛋白質 {Math.round(selectedFood.protein * (parseFloat(servings) || 1) * (selectedSize?.factor || 1))}g
                 </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Save Button */}
      {selectedFood && (
        <View className="px-6 pb-8 bg-white border-t border-gray-100">
          <Pressable
            onPress={handleSaveFood}
            className="w-full bg-black py-4 rounded-xl"
          >
            <Text className="text-white text-center font-semibold text-lg">
              新增到{mealTypes.find(m => m.id === selectedMealType)?.label}
            </Text>
          </Pressable>
        </View>
      )}
      
      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide">
        <PhotoFoodAnalysis
          onFoodAnalyzed={handlePhotoAnalysis}
          onClose={() => setShowCamera(false)}
        />
      </Modal>
      
      {/* Barcode Scanner Modal */}
      <Modal visible={showBarcodeScanner} animationType="slide">
        <BarcodeScanner
          onFoodScanned={(food: FoodItem) => {
            handleFoodSelect(food);
            setShowBarcodeScanner(false);
          }}
          onClose={() => setShowBarcodeScanner(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}
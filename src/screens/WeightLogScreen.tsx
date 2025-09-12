import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";

// Components
import BrandLogo from "../components/BrandLogo";

// Stores
import { useUserStore } from "../state/userStore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WeightLogScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, updateUser, addWeightLog } = useUserStore();
  
  const [weight, setWeight] = useState(user?.weight.toString() || "");
  const [bodyFat, setBodyFat] = useState(user?.bodyFat?.toString() || "");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveWeight = async () => {
    if (!user) return;
    
    const weightValue = parseFloat(weight);
    const bodyFatValue = bodyFat ? parseFloat(bodyFat) : undefined;
    
    if (!weightValue || weightValue <= 0 || weightValue > 300) {
      Alert.alert("錯誤", "請輸入有效的體重 (0.1 - 300 kg)");
      return;
    }
    
    if (bodyFatValue && (bodyFatValue < 3 || bodyFatValue > 50)) {
      Alert.alert("錯誤", "請輸入有效的體脂率 (3% - 50%)");
      return;
    }

    setIsLoading(true);
    
    try {
      // Add weight log entry
      addWeightLog({
        id: `weight_${Date.now()}`,
        userId: user.id,
        weight: weightValue,
        bodyFat: bodyFatValue,
        loggedAt: new Date().toISOString(),
        notes,
      });
      
      // Update user's current weight and last logged date
      updateUser({
        weight: weightValue,
        bodyFat: bodyFatValue || user.bodyFat,
        lastWeightLoggedAt: new Date().toISOString(),
      });
      
      Alert.alert(
        "記錄成功",
        `體重已記錄：${weightValue} kg${bodyFatValue ? `\n體脂率：${bodyFatValue}%` : ""}`,
        [
          { text: "確定", onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      Alert.alert("錯誤", "記錄失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const getWeightTrend = () => {
    if (!user) return null;
    
    const currentWeight = parseFloat(weight) || user.weight;
    const previousWeight = user.weight;
    const difference = currentWeight - previousWeight;
    
    if (Math.abs(difference) < 0.1) return null;
    
    return {
      direction: difference > 0 ? "up" : "down",
      amount: Math.abs(difference),
      color: difference > 0 ? "#EF4444" : "#10B981",
      icon: difference > 0 ? "trending-up" : "trending-down",
    };
  };

  const trend = getWeightTrend();

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
                <View style={{ width: 24 }} />
              </View>
              <Text className="text-2xl font-bold text-black mt-4">記錄體重</Text>
              <Text className="text-gray-600">
                {new Date().toLocaleDateString("zh-TW", { 
                  year: "numeric",
                  month: "long", 
                  day: "numeric",
                  weekday: "long" 
                })}
              </Text>
            </View>

            {/* Content */}
            <View className="flex-1 px-6 py-6">
              {/* Weight Input */}
              <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
                <Text className="text-lg font-semibold text-black mb-4">體重</Text>
                
                <View className="flex-row items-center">
                  <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="輸入體重"
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    className="flex-1 text-4xl font-bold text-black text-center"
                    style={{ fontSize: 48 }}
                  />
                  <Text className="text-2xl font-semibold text-gray-500 ml-2">kg</Text>
                </View>
                
                {trend && (
                  <View className="flex-row items-center justify-center mt-4 p-3 rounded-xl" style={{ backgroundColor: `${trend.color}15` }}>
                    <Ionicons name={trend.icon as any} size={20} color={trend.color} />
                    <Text style={{ color: trend.color }} className="font-medium ml-2">
                      {trend.direction === "up" ? "增加" : "減少"} {trend.amount.toFixed(1)} kg
                    </Text>
                  </View>
                )}
              </View>

              {/* Body Fat Input (Optional) */}
              <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
                <Text className="text-lg font-semibold text-black mb-4">體脂率 (選填)</Text>
                
                <View className="flex-row items-center">
                  <TextInput
                    value={bodyFat}
                    onChangeText={setBodyFat}
                    placeholder="輸入體脂率"
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    className="flex-1 text-3xl font-bold text-black text-center"
                  />
                  <Text className="text-xl font-semibold text-gray-500 ml-2">%</Text>
                </View>
                
                <Text className="text-gray-500 text-sm text-center mt-2">
                  可使用體脂秤或健身房設備測量
                </Text>
              </View>

              {/* Notes Input (Optional) */}
              <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <Text className="text-lg font-semibold text-black mb-4">備註 (選填)</Text>
                
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="記錄今天的感受或特殊情況..."
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  className="text-gray-800 text-base"
                  textAlignVertical="top"
                />
              </View>

              {/* Quick Stats */}
              {user && (
                <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                  <Text className="text-lg font-semibold text-black mb-4">目標進度</Text>
                  
                  <View className="flex-row justify-between">
                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm">目標體重</Text>
                      <Text className="text-xl font-bold text-black">{user.targetWeight} kg</Text>
                    </View>
                    
                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm">還需減重</Text>
                      <Text className="text-xl font-bold text-orange-600">
                        {Math.max((parseFloat(weight) || user.weight) - user.targetWeight, 0).toFixed(1)} kg
                      </Text>
                    </View>
                    
                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm">目標日期</Text>
                      <Text className="text-sm font-medium text-gray-800">
                        {new Date(user.targetDate).toLocaleDateString("zh-TW", { month: "short", day: "numeric" })}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Save Button */}
            <View className="px-6 pb-8 bg-white border-t border-gray-100">
              <Pressable
                onPress={handleSaveWeight}
                disabled={isLoading || !weight}
                className={`w-full py-4 rounded-xl ${
                  isLoading || !weight ? "bg-gray-300" : "bg-black"
                }`}
              >
                <Text className={`text-center font-semibold text-lg ${
                  isLoading || !weight ? "text-gray-500" : "text-white"
                }`}>
                  {isLoading ? "記錄中..." : "儲存記錄"}
                </Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
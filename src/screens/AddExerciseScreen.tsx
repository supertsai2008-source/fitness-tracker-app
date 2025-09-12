import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";

// Stores
import { useExerciseStore } from "../state/exerciseStore";
import { useUserStore } from "../state/userStore";

// Health Integration
import { syncHealthData, requestHealthPermissions } from "../api/health-integration";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "AddExercise">;

interface ExerciseType {
  id: string;
  name: string;
  nameZh: string;
  icon: keyof typeof Ionicons.glyphMap;
  metValue: number; // Metabolic Equivalent of Task
  hasDistance?: boolean;
}

const exerciseTypes: ExerciseType[] = [
  {
    id: "walking",
    name: "Walking",
    nameZh: "快走",
    icon: "walk",
    metValue: 4.0,
    hasDistance: true,
  },
  {
    id: "jogging",
    name: "Jogging",
    nameZh: "慢跑",
    icon: "fitness",
    metValue: 7.0,
    hasDistance: true,
  },
  {
    id: "running",
    name: "Running",
    nameZh: "跑步",
    icon: "flash",
    metValue: 9.8,
    hasDistance: true,
  },
  {
    id: "cycling",
    name: "Cycling",
    nameZh: "騎車",
    icon: "bicycle",
    metValue: 6.8,
    hasDistance: true,
  },
  {
    id: "swimming",
    name: "Swimming",
    nameZh: "游泳",
    icon: "water",
    metValue: 8.0,
  },
  {
    id: "weightlifting",
    name: "Weight Lifting",
    nameZh: "重量訓練",
    icon: "barbell",
    metValue: 6.0,
  },
  {
    id: "yoga",
    name: "Yoga",
    nameZh: "瑜珈",
    icon: "leaf",
    metValue: 2.5,
  },
  {
    id: "dancing",
    name: "Dancing",
    nameZh: "跳舞",
    icon: "musical-notes",
    metValue: 4.8,
  },
];

export default function AddExerciseScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "AddExercise">>();
  const { addExerciseLog } = useExerciseStore();
  const { user } = useUserStore();
  
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [showCustomExercise, setShowCustomExercise] = useState(false);
  
  React.useEffect(() => {
    const p = route.params;
    if (p?.exerciseId) {
      const ex = exerciseTypes.find(e => e.id === p.exerciseId);
      if (ex) {
        setSelectedExercise(ex);
        setShowCustomExercise(false);
      }
    }
    if (p?.duration) {
      setDuration(String(p.duration));
    }
  }, [route.params]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Calculate calories burned using MET formula
  // Calories = MET × weight (kg) × time (hours)
  const calculateCaloriesBurned = (met: number, weightKg: number, durationMinutes: number): number => {
    const hours = durationMinutes / 60;
    return Math.round(met * weightKg * hours);
  };
  
  const handleSaveExercise = () => {
    if (!user) {
      Alert.alert("錯誤", "用戶資料不完整");
      return;
    }
    
    if (!selectedExercise && !showCustomExercise) {
      Alert.alert("錯誤", "請選擇運動類型");
      return;
    }
    
    if (!duration || parseFloat(duration) <= 0) {
      Alert.alert("錯誤", "請輸入有效的運動時間");
      return;
    }
    
    const durationMinutes = parseFloat(duration);
    const exerciseName = showCustomExercise ? customExerciseName : selectedExercise!.nameZh;
    const metValue = showCustomExercise ? 5.0 : selectedExercise!.metValue; // Default MET for custom exercises
    
    if (showCustomExercise && !customExerciseName.trim()) {
      Alert.alert("錯誤", "請輸入運動名稱");
      return;
    }
    
    const caloriesBurned = calculateCaloriesBurned(metValue, user.weight, durationMinutes);
    
    const exerciseLog = {
      userId: user.id,
      type: showCustomExercise ? "custom" : selectedExercise!.id,
      name: exerciseName,
      duration: durationMinutes,
      caloriesBurned,
      distance: distance ? parseFloat(distance) : undefined,
      loggedAt: new Date().toISOString(),
      source: "manual" as const,
    };
    
    addExerciseLog(exerciseLog);
    navigation.goBack();
  };
  
  const getEstimatedCalories = (): number => {
    if (!user || !duration || parseFloat(duration) <= 0) return 0;
    
    const durationMinutes = parseFloat(duration);
    const metValue = showCustomExercise ? 5.0 : selectedExercise?.metValue || 0;
    
    return calculateCaloriesBurned(metValue, user.weight, durationMinutes);
  };

  const handleHealthSync = async () => {
    setIsSyncing(true);
    
    try {
      const hasPermission = await requestHealthPermissions();
      if (!hasPermission) {
        Alert.alert("權限被拒絕", "無法同步健康數據，請在設定中開啟權限");
        return;
      }
      
      const { exerciseLogs } = await syncHealthData();
      
      if (exerciseLogs.length > 0) {
        // Add synced exercises to store
        exerciseLogs.forEach(log => {
          addExerciseLog({
            userId: user?.id || "current_user",
            type: log.type,
            name: log.name,
            duration: log.duration,
            caloriesBurned: log.caloriesBurned,
            distance: log.distance,
            loggedAt: log.loggedAt,
            source: log.source,
          });
        });
        
        Alert.alert(
          "同步成功",
          `已同步 ${exerciseLogs.length} 筆運動記錄`,
          [{ text: "確定", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("同步完成", "沒有找到新的運動記錄");
      }
    } catch (error) {
      Alert.alert("同步失敗", "無法同步健康數據，請稍後再試");
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Exercise Type Selection */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-black mb-3">選擇運動類型</Text>
          
          <View className="grid grid-cols-2 gap-3 mb-4">
            {exerciseTypes.map((exercise) => (
              <Pressable
                key={exercise.id}
                onPress={() => {
                  setSelectedExercise(exercise);
                  setShowCustomExercise(false);
                }}
                className={`p-4 rounded-xl border-2 items-center ${
                  selectedExercise?.id === exercise.id && !showCustomExercise
                    ? "border-black bg-gray-50"
                    : "border-gray-200"
                }`}
              >
                <Ionicons 
                  name={exercise.icon} 
                  size={24} 
                  color={selectedExercise?.id === exercise.id && !showCustomExercise ? "#000000" : "#6B7280"} 
                />
                <Text className={`text-sm font-medium mt-2 text-center ${
                  selectedExercise?.id === exercise.id && !showCustomExercise ? "text-black" : "text-gray-600"
                }`}>
                  {exercise.nameZh}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {exercise.metValue} MET
                </Text>
              </Pressable>
            ))}
          </View>
          
          {/* Custom Exercise Option */}
          <Pressable
            onPress={() => {
              setShowCustomExercise(true);
              setSelectedExercise(null);
            }}
            className={`p-4 rounded-xl border-2 items-center ${
              showCustomExercise
                ? "border-black bg-gray-50"
                : "border-gray-200"
            }`}
          >
            <Ionicons 
              name="add-circle-outline" 
              size={24} 
              color={showCustomExercise ? "#000000" : "#6B7280"} 
            />
            <Text className={`text-sm font-medium mt-2 ${
              showCustomExercise ? "text-black" : "text-gray-600"
            }`}>
              其他運動
            </Text>
          </Pressable>
        </View>
        
        {/* Exercise Details */}
        {(selectedExercise || showCustomExercise) && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-black mb-3">運動詳情</Text>
            
            {/* Custom Exercise Name */}
            {showCustomExercise && (
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">運動名稱</Text>
                <TextInput
                  value={customExerciseName}
                  onChangeText={setCustomExerciseName}
                  placeholder="例如：爬山、打籃球..."
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg"
                />
              </View>
            )}
            
            {/* Duration */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">運動時間（分鐘）</Text>
              <TextInput
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholder="30"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg"
              />
            </View>
            
            {/* Distance (for applicable exercises) */}
            {selectedExercise?.hasDistance && (
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">距離（公里）</Text>
                <TextInput
                  value={distance}
                  onChangeText={setDistance}
                  keyboardType="numeric"
                  placeholder="5.0"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg"
                />
              </View>
            )}
            
            {/* Calories Estimate */}
            <View className="bg-green-50 p-4 rounded-xl border border-green-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-green-800 font-medium">預估消耗熱量</Text>
                <Text className="text-green-800 font-bold text-xl">
                  {getEstimatedCalories()} kcal
                </Text>
              </View>
              <Text className="text-green-600 text-sm mt-1">
                基於您的體重 {user?.weight}kg 計算
              </Text>
            </View>
            
            {/* MET Information */}
            <View className="mt-4 p-3 bg-gray-50 rounded-xl">
              <Text className="text-gray-600 text-sm">
                💡 MET (代謝當量) 是衡量運動強度的標準單位
              </Text>
              <Text className="text-gray-500 text-xs mt-1">
                數值越高代表運動強度越大，消耗熱量越多
              </Text>
            </View>
          </View>
        )}
        
        {/* Health Kit Integration */}
        <View className="px-6 mb-6">
          <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <View className="flex-row items-center mb-2">
              <Ionicons name="fitness" size={20} color="#3B82F6" />
              <Text className="text-blue-800 font-medium ml-2">健康數據同步</Text>
            </View>
            <Text className="text-blue-700 text-sm mb-3">
              連接 Apple Health 或 Google Fit 自動記錄運動數據
            </Text>
            <Pressable 
              onPress={handleHealthSync}
              disabled={isSyncing}
              className={`py-2 px-4 rounded-lg ${isSyncing ? "bg-gray-400" : "bg-blue-600"}`}
            >
              <Text className="text-white text-sm font-medium text-center">
                {isSyncing ? "同步中..." : "立即同步"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      
      {/* Save Button */}
      {(selectedExercise || showCustomExercise) && (
        <View className="px-6 pb-8 bg-white border-t border-gray-100">
          <Pressable
            onPress={handleSaveExercise}
            className="w-full bg-black py-4 rounded-xl"
          >
            <Text className="text-white text-center font-semibold text-lg">
              記錄運動
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { FoodItem } from "../types";

interface BarcodeScannerProps {
  onFoodScanned: (food: FoodItem) => void;
  onClose: () => void;
}

// Mock barcode to food mapping - in production this would call a real API
const mockBarcodeDatabase: Record<string, Partial<FoodItem>> = {
  "4710088610041": {
    name: "Uni-President Bread",
    nameZh: "統一麵包",
    calories: 280,
    protein: 8.5,
    carbs: 52.0,
    fat: 4.2,
    servingNameZh: "片",
    servingSize: "1 slice",
  },
  "4710088610058": {
    name: "Kuang Chuan Milk",
    nameZh: "光泉牛奶",
    calories: 150,
    protein: 8.0,
    carbs: 12.0,
    fat: 8.0,
    servingNameZh: "杯",
    servingSize: "1 cup",
  },
  "4710088610065": {
    name: "I-Mei Puff",
    nameZh: "義美小泡芙",
    calories: 520,
    protein: 6.8,
    carbs: 58.0,
    fat: 28.0,
    servingNameZh: "包",
    servingSize: "1 pack",
  },
};

export default function BarcodeScanner({ onFoodScanned, onClose }: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    // Look up barcode in mock database
    const foodData = mockBarcodeDatabase[data];
    
    if (foodData) {
      const food: FoodItem = {
        id: `barcode_${data}`,
        name: foodData.name || "Unknown Food",
        nameZh: foodData.nameZh || "未知食品",
        calories: foodData.calories || 0,
        protein: foodData.protein || 0,
        carbs: foodData.carbs || 0,
        fat: foodData.fat || 0,
        servingSize: foodData.servingSize || "1 serving",
        servingNameZh: foodData.servingNameZh || "份",
        barcode: data,
        isCustom: false,
      };
      
      onFoodScanned(food);
    } else {
      Alert.alert(
        "找不到食品資料",
        `條碼 ${data} 在資料庫中找不到對應的食品資訊。您可以手動輸入營養資訊。`,
        [
          { text: "重新掃描", onPress: () => setScanned(false) },
          { text: "手動輸入", onPress: onClose },
        ]
      );
    }
  };

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg">請求相機權限中...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center px-6">
        <Ionicons name="camera-outline" size={64} color="white" />
        <Text className="text-white text-xl font-semibold mt-4 text-center">
          需要相機權限
        </Text>
        <Text className="text-gray-300 text-center mt-2 mb-6">
          掃描食品條碼需要使用相機功能
        </Text>
        <Pressable
          onPress={requestPermission}
          className="bg-white px-6 py-3 rounded-xl"
        >
          <Text className="text-black font-semibold">授予權限</Text>
        </Pressable>
        <Pressable
          onPress={onClose}
          className="mt-4"
        >
          <Text className="text-gray-300">取消</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        enableTorch={flashEnabled}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
        }}
      >
        {/* Overlay UI */}
        <View className="absolute top-0 left-0 right-0 bottom-0">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 pt-12">
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={28} color="white" />
            </Pressable>
            <Text className="text-white text-lg font-semibold">掃描條碼</Text>
            <Pressable 
              onPress={() => setFlashEnabled(!flashEnabled)}
              className="p-2"
            >
              <Ionicons 
                name={flashEnabled ? "flash" : "flash-off"} 
                size={28} 
                color="white" 
              />
            </Pressable>
          </View>

          {/* Scanning Frame */}
          <View className="flex-1 items-center justify-center">
            <View className="w-64 h-40 border-2 border-white rounded-2xl">
              <View className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-2xl" />
              <View className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-2xl" />
              <View className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-2xl" />
              <View className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-2xl" />
            </View>
            <Text className="text-white text-center mt-6 px-8">
              將條碼對準框內進行掃描
            </Text>
          </View>

          {/* Bottom Instructions */}
          <View className="p-6 pb-12">
            <View className="bg-black/50 p-4 rounded-xl">
              <Text className="text-white text-center text-sm">
                支援 EAN-13、EAN-8、UPC-A、UPC-E、Code 128、Code 39 格式條碼
              </Text>
            </View>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}
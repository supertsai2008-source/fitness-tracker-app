import React, { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import { analyzeFoodImage } from "../api/vision-analyze";
import { FoodItem } from "../types";

interface PhotoFoodAnalysisProps {
  onFoodAnalyzed: (food: FoodItem, errorRate: number) => void;
  onClose: () => void;
}

interface AnalysisResult {
  name: string;
  nameZh: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  servingNameZh: string;
  errorRate: number; // 0-100
  detectedName?: string;
  detectedNameZh?: string;
  confidence?: number; // 0-100
}

export default function PhotoFoodAnalysis({ onFoodAnalyzed, onClose }: PhotoFoodAnalysisProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastBase64, setLastBase64] = useState<string | null>(null);
  
  const cameraRef = React.useRef<CameraView>(null);
  
  if (!permission) {
    return <View />;
  }
  
  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-center mb-4">
          需要相機權限來拍攝食物
        </Text>
        <Pressable
          onPress={requestPermission}
          className="bg-white px-6 py-3 rounded-xl"
        >
          <Text className="text-black font-semibold">授予權限</Text>
        </Pressable>
      </View>
    );
  }
  
  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      if (!photo?.uri) return;
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setCapturedImage(manipulated.uri || photo.uri);
      if (manipulated.base64) {
        setLastBase64(manipulated.base64);
        await analyzeFood(manipulated.base64);
      }
    } catch (error) {
      setErrorMessage("拍照失敗，請重試或改用搜尋/手動輸入");
    }
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: false,
    });
    
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setCapturedImage(manipulated.uri || asset.uri);
      if (manipulated.base64) {
        setLastBase64(manipulated.base64);
        await analyzeFood(manipulated.base64);
      }
    }
  };
  
  const analyzeFood = async (_base64Image: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const ai = await analyzeFoodImage(_base64Image);
      const mapped: AnalysisResult = {
        name: ai.name,
        nameZh: ai.nameZh,
        calories: ai.calories,
        protein: ai.protein,
        carbs: ai.carbs,
        fat: ai.fat,
        servingSize: ai.servingSize,
        servingNameZh: ai.servingNameZh,
        errorRate: ai.errorRate,
        detectedName: ai.detectedName,
        detectedNameZh: ai.detectedNameZh,
        confidence: ai.confidence,
      };
      setAnalysisResult(mapped);
    } catch (e) {
      setAnalysisResult(null);
      setErrorMessage("分析失敗，無法取得營養資訊。請重試或改用搜尋/手動輸入。");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleConfirmAnalysis = () => {
    if (!analysisResult) return;
    
    const foodItem: FoodItem = {
      id: Date.now().toString(),
      name: analysisResult.name,
      nameZh: analysisResult.nameZh,
      calories: analysisResult.calories,
      protein: analysisResult.protein,
      carbs: analysisResult.carbs,
      fat: analysisResult.fat,
      servingSize: analysisResult.servingSize,
      servingNameZh: analysisResult.servingNameZh,
      isCustom: true,
      aiDetectedName: analysisResult.detectedName,
      aiDetectedNameZh: analysisResult.detectedNameZh,
      aiConfidence: typeof analysisResult.confidence === "number" ? analysisResult.confidence : (100 - analysisResult.errorRate),
    };
    
    onFoodAnalyzed(foodItem, analysisResult.errorRate);
  };
  
  const retakePicture = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };
  
  const toggleCameraFacing = () => {
    setFacing(current => (current === "back" ? "front" : "back"));
  };
  
  if (capturedImage) {
    return (
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="absolute top-0 left-0 right-0 z-10 pt-12 px-6">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
            <Text className="text-white font-semibold">食物分析</Text>
            <View className="w-10" />
          </View>
        </View>
        
        {/* Image */}
        <Image source={{ uri: capturedImage }} className="flex-1" resizeMode="contain" />
        
        {/* Analysis Result */}
        {isAnalyzing ? (
          <View className="absolute bottom-0 left-0 right-0 bg-white p-6 rounded-t-3xl">
            <View className="items-center py-8">
              <Text className="text-lg font-semibold text-black mb-2">
                正在分析食物...
              </Text>
              <Text className="text-gray-600">請稍候，AI 正在識別營養資訊</Text>
            </View>
          </View>
        ) : analysisResult ? (
          <View className="absolute bottom-0 left-0 right-0 bg-white p-6 rounded-t-3xl">
            <Text className="text-lg font-semibold text-black mb-4">分析結果</Text>
            
            <View className="bg-gray-50 p-4 rounded-xl mb-4">
              <Text className="text-xl font-bold text-black mb-2">
                {analysisResult.nameZh}
              </Text>
              <Text className="text-gray-600 mb-1">
                {analysisResult.servingNameZh}
              </Text>
              {(analysisResult.detectedNameZh || analysisResult.detectedName) && (
                <Text className="text-gray-500 text-sm mb-3">
                  辨識品項：{analysisResult.detectedNameZh || analysisResult.detectedName}
                </Text>
              )}
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-700">熱量</Text>
                <Text className="font-semibold">{analysisResult.calories} kcal</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-700">蛋白質</Text>
                <Text className="font-semibold">{analysisResult.protein}g</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-700">碳水化合物</Text>
                <Text className="font-semibold">{analysisResult.carbs}g</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">脂肪</Text>
                <Text className="font-semibold">{analysisResult.fat}g</Text>
              </View>
            </View>
            
            {/* Error Rate Warning */}
            <View className="bg-yellow-50 p-3 rounded-xl mb-4">
              <Text className="text-yellow-800 text-sm">
                ⚠️ 估計誤差率：±{analysisResult.errorRate}% {typeof analysisResult.confidence === "number" ? `• AI 置信度 ${analysisResult.confidence}%` : ""}
              </Text>
              <Text className="text-yellow-700 text-xs mt-1">
                您可以在下一步調整數值
              </Text>
            </View>
            
            <View className="flex-row">
              <Pressable
                onPress={retakePicture}
                className="flex-1 bg-gray-200 py-3 rounded-xl mr-3"
              >
                <Text className="text-center font-semibold text-gray-800">
                  重新拍攝
                </Text>
              </Pressable>
              
              <Pressable
                onPress={handleConfirmAnalysis}
                className="flex-1 bg-black py-3 rounded-xl"
              >
                <Text className="text-center font-semibold text-white">
                  確認使用
                </Text>
              </Pressable>
            </View>
          </View>
        ) : errorMessage ? (
          <View className="absolute bottom-0 left-0 right-0 bg-white p-6 rounded-t-3xl">
            <Text className="text-lg font-semibold text-black mb-2">分析失敗</Text>
            <View className="bg-red-50 p-3 rounded-xl mb-4">
              <Text className="text-red-800 text-sm">{errorMessage}</Text>
              <Text className="text-red-700 text-xs mt-1">建議：保持光線充足、避免反光，或改用搜尋與手動輸入。</Text>
            </View>
            <View className="flex-row">
              <Pressable onPress={retakePicture} className="flex-1 bg-gray-200 py-3 rounded-xl mr-3">
                <Text className="text-center font-semibold text-gray-800">重新拍攝</Text>
              </Pressable>
              <Pressable onPress={() => { if (lastBase64) analyzeFood(lastBase64); }} className="flex-1 bg-black py-3 rounded-xl">
                <Text className="text-center font-semibold text-white">重試分析</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    );
  }
  
  return (
    <View className="flex-1">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
      >
        {/* Header */}
        <View className="absolute top-0 left-0 right-0 z-10 pt-12 px-6">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
            <Text className="text-white font-semibold">拍攝食物</Text>
            <Pressable onPress={toggleCameraFacing} className="p-2">
              <Ionicons name="camera-reverse" size={24} color="white" />
            </Pressable>
          </View>
        </View>
        
        {/* Instructions */}
        <View className="absolute top-32 left-6 right-6 z-10">
          <View className="bg-black bg-opacity-50 p-4 rounded-xl">
            <Text className="text-white text-center">
              將食物置於畫面中央，確保光線充足
            </Text>
          </View>
        </View>
        
        {/* Bottom Controls */}
        <View className="absolute bottom-0 left-0 right-0 z-10 pb-12 px-6">
          <View className="flex-row items-center justify-center">
            <Pressable onPress={pickImage} className="p-4 mr-8">
              <Ionicons name="images" size={32} color="white" />
            </Pressable>
            
            <Pressable
              onPress={takePicture}
              className="w-20 h-20 bg-white rounded-full items-center justify-center"
            >
              <View className="w-16 h-16 bg-black rounded-full" />
            </Pressable>
            
            <View className="w-12" />
          </View>
        </View>
      </CameraView>
    </View>
  );
}
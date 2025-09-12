import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAppStore } from "../state/appStore";
import { syncEntitlements } from "../lib/instantdbSync";
import { Ionicons } from "@expo/vector-icons";
import BrandLogo from "../components/BrandLogo";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Paywall">;

interface PricingPlan {
  id: "monthly" | "yearly";
  title: string;
  price: string;
  originalPrice?: string;
  period: string;
  savings?: string;
  features: string[];
  isPopular?: boolean;
  trialText?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "yearly",
    title: "年度方案",
    price: "NT$ 2,388",
    originalPrice: "NT$ 3,588",
    period: "每年",
    savings: "省下 NT$ 1,200",
    trialText: "3 天免費試用",
    isPopular: true,
    features: [
      "個人化減脂計畫",
      "AI 智能飲食建議",
      "拍照食物分析",
      "進度追蹤與分析",
      "無限制食物記錄",
      "運動整合同步",
      "專業營養師建議",
      "優先客服支援"
    ]
  },
  {
    id: "monthly",
    title: "月度方案",
    price: "NT$ 299",
    period: "每月",
    features: [
      "個人化減脂計畫",
      "AI 智能飲食建議",
      "拍照食物分析",
      "進度追蹤與分析",
      "無限制食物記錄",
      "運動整合同步"
    ]
  }
];

export default function PaywallScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { updateSubscription } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate subscription process
      // In a real app, this would integrate with react-native-purchases or similar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update subscription status
      updateSubscription({
        isActive: true,
        plan: selectedPlan,
        expiresAt: selectedPlan === "yearly" 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isTrialActive: selectedPlan === "yearly",
        trialExpiresAt: selectedPlan === "yearly" 
          ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      });
      
      // Sync entitlements to InstantDB
      try {
        await syncEntitlements();
      } catch (error) {
        console.warn("Failed to sync entitlements:", error);
      }
      
      navigation.navigate("MainTabs");
    } catch (error) {
      Alert.alert("訂閱失敗", "請稍後再試或聯繫客服");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipTrial = () => {
    // For demo purposes, allow skipping to main app
    Alert.alert(
      "跳過訂閱",
      "您將無法使用完整功能。確定要繼續嗎？",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "繼續", 
          onPress: () => navigation.navigate("MainTabs")
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-8 pb-6">
          <View className="items-center mb-8">
            <View className="mb-6">
              <BrandLogo size="large" showText />
            </View>
            <Text className="text-3xl font-bold text-black text-center mb-2">
              開始您的減脂之旅
            </Text>
            <Text className="text-gray-600 text-center text-lg leading-6">
              科學化追蹤，個人化建議{"\n"}讓減脂變得簡單有效
            </Text>
          </View>
        </View>

        {/* Pricing Plans */}
        <View className="px-6 mb-8">
          <View>
            {pricingPlans.map((plan) => (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-2xl border-2 ${
                  selectedPlan === plan.id 
                    ? "border-black bg-gray-50" 
                    : "border-gray-200"
                } ${plan.isPopular ? "border-black" : ""}`}
              >
                {plan.isPopular && (
                  <View className="absolute -top-3 left-6 bg-black px-3 py-1 rounded-full">
                    <Text className="text-white text-sm font-medium">最受歡迎</Text>
                  </View>
                )}
                
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-black mb-1">
                      {plan.title}
                    </Text>
                    {plan.trialText && (
                      <Text className="text-green-600 font-medium text-sm">
                        {plan.trialText}
                      </Text>
                    )}
                  </View>
                  
                  <View className="items-end">
                    <View className="flex-row items-baseline">
                      <Text className="text-2xl font-bold text-black">
                        {plan.price}
                      </Text>
                      <Text className="text-gray-500 ml-1">
                        {plan.period}
                      </Text>
                    </View>
                    {plan.originalPrice && (
                      <Text className="text-gray-400 line-through text-sm">
                        {plan.originalPrice}
                      </Text>
                    )}
                    {plan.savings && (
                      <Text className="text-green-600 text-sm font-medium">
                        {plan.savings}
                      </Text>
                    )}
                  </View>
                </View>

                <View>
                  {plan.features.map((feature, index) => (
                    <View key={index} className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text className="text-gray-700 ml-2 flex-1">{feature}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Value Proposition */}
        <View className="px-6 mb-8">
          <View className="bg-gray-50 p-6 rounded-2xl">
            <Text className="text-lg font-semibold text-black mb-4 text-center">
              為什麼選擇我們？
            </Text>
            <View>
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">☕</Text>
                <Text className="text-gray-700 flex-1">
                  每天不到一杯咖啡的價格，投資健康的自己
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🍱</Text>
                <Text className="text-gray-700 flex-1">
                  比一份便當還便宜，獲得專業營養師級別的指導
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">📱</Text>
                <Text className="text-gray-700 flex-1">
                  台灣本土化設計，最懂台灣人的飲食習慣
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-6 pb-8 bg-white border-t border-gray-100">
        <Pressable
          onPress={handleSubscribe}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl mb-3 ${
            isProcessing ? "bg-gray-400" : "bg-black"
          }`}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isProcessing 
              ? "處理中..." 
              : selectedPlan === "yearly" 
                ? "開始 3 天免費試用" 
                : "立即訂閱"
            }
          </Text>
        </Pressable>
        
        <Pressable onPress={handleSkipTrial}>
          <Text className="text-gray-500 text-center text-sm">
            暫時跳過
          </Text>
        </Pressable>
        
        <Text className="text-gray-400 text-center text-xs mt-4 leading-4">
          訂閱將自動續約，您可以隨時在設定中取消。{"\n"}
          3 天試用期結束後將開始收費。
        </Text>
      </View>
    </SafeAreaView>
  );
}
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Switch, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NAV_PERSISTENCE_KEY } from "../navigation/constants";

// Components
import SliderInput from "../components/SliderInput";
import BrandLogo from "../components/BrandLogo";

// Stores
import { useUserStore } from "../state/userStore";
import { useAppStore } from "../state/appStore";
import { useAccountStore } from "../state/accountStore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, updateUser, clearUser } = useUserStore();
  const { settings, subscription, updateSettings } = useAppStore();
  
  const [editingProfile, setEditingProfile] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | undefined>(undefined);
  const [profileData, setProfileData] = useState({
    weight: user?.weight.toString() || "",
    targetWeight: user?.targetWeight.toString() || "",
    activityLevel: user?.activityLevel || 1.375,
    weightLossSpeed: user?.weightLossSpeed || 0.5,
    dietExerciseRatio: user?.dietExerciseRatio || 70,
    allergies: user?.allergies || "",
  });
  
  const handleSaveProfile = () => {
    if (!user) return;
    
    const updates = {
      weight: parseFloat(profileData.weight) || user.weight,
      targetWeight: parseFloat(profileData.targetWeight) || user.targetWeight,
      activityLevel: profileData.activityLevel,
      weightLossSpeed: profileData.weightLossSpeed,
      dietExerciseRatio: profileData.dietExerciseRatio,
      allergies: profileData.allergies,
    };
    
    updateUser(updates);
    setEditingProfile(false);
    setSaveMessage("個人資料已更新");
    setTimeout(() => setSaveMessage(undefined), 1600);
  };
  
  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      // Use the new signOut function that handles InstantDB and local state
      const { signOut } = await import("../api/auth/password");
      await signOut();
      await AsyncStorage.removeItem(NAV_PERSISTENCE_KEY);
      navigation.reset({ index: 0, routes: [{ name: "AuthWelcome" }] });
    } catch (e) {
      // Fallback: clear local state manually
      clearUser();
      useAccountStore.getState().signOut();
      navigation.reset({ index: 0, routes: [{ name: "AuthWelcome" }] });
    } finally {
      setShowConfirm(false);
    }
  };
  
  const activityLevels = [
    { value: 1.2, label: "久坐不動" },
    { value: 1.375, label: "輕度活動" },
    { value: 1.55, label: "中度活動" },
    { value: 1.725, label: "高度活動" },
    { value: 1.9, label: "極高活動" },
  ];
  
  const getCurrentActivityLabel = () => {
    const level = activityLevels.find(l => l.value === profileData.activityLevel);
    return level?.label || "中度活動";
  };
  
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-semibold text-black">請先完成設定</Text>
          <Text className="text-gray-600 mt-2 text-center">點擊下方按鈕重新開始設定流程</Text>
          <Pressable
            onPress={() => navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] })}
            className="mt-6 bg-black px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">開始設定</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-black">設定</Text>
              <Text className="text-gray-600">管理您的個人資料和偏好</Text>
            </View>
            <BrandLogo size="medium" />
          </View>
        </View>
        
        {saveMessage && (
          <View className="mx-6 mb-3 bg-green-50 border border-green-200 rounded-xl p-3">
            <Text className="text-green-800 text-sm text-center">{saveMessage}</Text>
          </View>
        )}
        
        {/* Profile Section */}
        <View className="bg-white mx-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
          <View className="p-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-black">個人資料</Text>
              <Pressable
                onPress={() => {
                  if (editingProfile) {
                    handleSaveProfile();
                  } else {
                    setEditingProfile(true);
                  }
                }}
                className="px-3 py-1 bg-black rounded-lg"
              >
                <Text className="text-white text-sm font-medium">
                  {editingProfile ? "儲存" : "編輯"}
                </Text>
              </Pressable>
            </View>
          </View>
          
          <View className="p-4">
            {editingProfile ? (
              <View>
                <View>
                  <Text className="text-gray-700 font-medium mb-2">目前體重 (kg)</Text>
                  <TextInput
                    value={profileData.weight}
                    onChangeText={(text) => setProfileData({ ...profileData, weight: text })}
                    keyboardType="numeric"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  />
                </View>
                
                <View>
                  <Text className="text-gray-700 font-medium mb-2">目標體重 (kg)</Text>
                  <TextInput
                    value={profileData.targetWeight}
                    onChangeText={(text) => setProfileData({ ...profileData, targetWeight: text })}
                    keyboardType="numeric"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  />
                </View>
                
                <SliderInput
                  label="活動程度"
                  value={profileData.activityLevel}
                  onValueChange={(value) => setProfileData({ ...profileData, activityLevel: value })}
                  minimumValue={1.2}
                  maximumValue={1.9}
                  step={0.175}
                  formatValue={() => getCurrentActivityLabel()}
                />
                
                <SliderInput
                  label="減重速度"
                  value={profileData.weightLossSpeed}
                  onValueChange={(value) => setProfileData({ ...profileData, weightLossSpeed: value })}
                  minimumValue={0.25}
                  maximumValue={1.0}
                  step={0.25}
                  formatValue={(value) => `${value} 公斤/週`}
                />
                
                <SliderInput
                  label="飲食 vs 運動偏好"
                  value={profileData.dietExerciseRatio}
                  onValueChange={(value) => setProfileData({ ...profileData, dietExerciseRatio: value })}
                  minimumValue={30}
                  maximumValue={90}
                  step={10}
                  formatValue={(value) => `飲食 ${value}% / 運動 ${100-value}%`}
                />
                
                <View>
                  <Text className="text-gray-700 font-medium mb-2">食物過敏或限制</Text>
                  <TextInput
                    value={profileData.allergies}
                    onChangeText={(text) => setProfileData({ ...profileData, allergies: text })}
                    placeholder="例如：堅果過敏、素食主義者..."
                    multiline
                    numberOfLines={3}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                    textAlignVertical="top"
                  />
                </View>
              </View>
            ) : (
              <View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-700">目前體重</Text>
                  <Text className="font-medium">{user.weight} kg</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-700">目標體重</Text>
                  <Text className="font-medium">{user.targetWeight} kg</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-700">活動程度</Text>
                  <Text className="font-medium">{getCurrentActivityLabel()}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-700">減重速度</Text>
                  <Text className="font-medium">{user.weightLossSpeed} kg/週</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        
        {/* App Settings */}
        <View className="bg-white mx-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-black">應用程式設定</Text>
          </View>
          
            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">推播通知</Text>
                  <Text className="text-gray-500 text-sm">接收提醒和建議</Text>
                </View>
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
                  trackColor={{ false: "#E5E7EB", true: "#000000" }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">深色模式</Text>
                  <Text className="text-gray-500 text-sm">切換應用程式外觀</Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => updateSettings({ darkMode: value })}
                  trackColor={{ false: "#E5E7EB", true: "#000000" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <Pressable className="flex-row items-center justify-between py-3" onPress={() => navigation.navigate("AccountSwitcher")}> 
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">帳號與資料庫</Text>
                  <Text className="text-gray-500 text-sm">切換或管理不同帳號的本機資料</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
              
              <Pressable className="flex-row items-center justify-between py-2">
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">語言</Text>
                  <Text className="text-gray-500 text-sm">繁體中文</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            </View>
        </View>
        
        {/* Subscription */}
        <View className="bg-white mx-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-black">訂閱狀態</Text>
          </View>
          
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-700">方案</Text>
              <Text className="font-medium">
                {subscription.isActive 
                  ? subscription.plan === "yearly" ? "年度方案" : "月度方案"
                  : "未訂閱"
                }
              </Text>
            </View>
            
            {subscription.isActive && subscription.expiresAt && (
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700">到期日</Text>
                <Text className="font-medium">
                  {new Date(subscription.expiresAt).toLocaleDateString("zh-TW")}
                </Text>
              </View>
            )}
            
            {subscription.isTrialActive && subscription.trialExpiresAt && (
              <View className="bg-green-50 p-3 rounded-xl">
                <Text className="text-green-800 font-medium">免費試用中</Text>
                <Text className="text-green-600 text-sm">
                  試用至 {new Date(subscription.trialExpiresAt).toLocaleDateString("zh-TW")}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Support & Info */}
        <View className="bg-white mx-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-black">支援與資訊</Text>
          </View>
          
          <View className="p-4">
            <Pressable className="flex-row items-center justify-between py-3">
              <Text className="text-gray-800">幫助中心</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
            
            <Pressable className="flex-row items-center justify-between py-3">
              <Text className="text-gray-800">聯絡客服</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
            
            <Pressable className="flex-row items-center justify-between py-3">
              <Text className="text-gray-800">隱私政策</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
            
            <Pressable className="flex-row items-center justify-between py-3">
              <Text className="text-gray-800">服務條款</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
            
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-gray-800">版本</Text>
              <Text className="text-gray-500">1.0.0</Text>
            </View>
          </View>
        </View>
        
        {/* Logout */}
        <View className="px-6 mb-8">
          <Pressable
            onPress={handleLogout}
            className="bg-red-50 border border-red-200 p-4 rounded-xl"
          >
            <Text className="text-red-600 font-medium text-center">登出</Text>
          </Pressable>
        </View>
        
        {/* Disclaimer */}
        <View className="px-6 mb-8">
          <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <Text className="text-yellow-800 text-sm text-center">
              此應用程式提供的資訊僅供參考，不構成醫療建議。如有健康疑慮或特殊需求，請諮詢專業醫師。
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={showConfirm} animationType="fade" onRequestClose={() => setShowConfirm(false)}>
        <View className="flex-1 bg-black/40 items-center justify-center">
          <View className="bg-white w-11/12 rounded-2xl p-6">
            <Text className="text-lg font-semibold text-black mb-2">登出</Text>
            <Text className="text-gray-600 mb-4">確定要登出嗎？這將清除所有本機數據。</Text>
            <View className="flex-row justify-end">
              <Pressable onPress={() => setShowConfirm(false)} className="px-4 py-2 mr-2 rounded-lg border border-gray-200">
                <Text className="text-gray-700">取消</Text>
              </Pressable>
              <Pressable onPress={confirmLogout} className="px-4 py-2 rounded-lg bg-red-600">
                <Text className="text-white font-medium">確定</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
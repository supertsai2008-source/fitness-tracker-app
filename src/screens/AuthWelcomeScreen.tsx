import React, { useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialButton from "../components/ui/SocialButton";
import ErrorText from "../components/ui/ErrorText";
import { signInWithGoogle } from "../api/auth/google";
import { isAppleAvailable, signInWithApple } from "../api/auth/apple";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

export default function AuthWelcomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [error, setError] = useState<string | undefined>();
  const appleOk = isAppleAvailable();

  const doGoogle = async () => {
    setError(undefined);
    try {
      await signInWithGoogle();
      const user = (await import("../state/userStore")).useUserStore.getState().user;
      const sub = (await import("../state/appStore")).useAppStore.getState().subscription;
      if (!user) {
        nav.reset({ index: 0, routes: [{ name: "Onboarding" }] });
      } else if (!sub.isActive) {
        nav.reset({ index: 0, routes: [{ name: "Paywall" }] });
      } else {
        nav.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      }
    } catch (e: any) {
      setError(e?.message || "登入失敗");
    }
  };

  const doApple = async () => {
    setError(undefined);
    try {
      await signInWithApple();
    } catch (e: any) {
      setError(e?.message || "Apple 登入未啟用");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-12">
          <Text className="text-3xl font-extrabold text-blue-900 mb-3">歡迎使用</Text>
          <Text className="text-slate-600 text-center text-base leading-6">
            開始您的健康管理之旅{"\n"}選擇最適合的登入方式
          </Text>
        </View>

        <View className="space-y-4">
          <SocialButton 
            provider="email" 
            title="使用 Email 登入/註冊" 
            onPress={() => nav.navigate("EmailAuth", { initialMode: "login" })} 
          />
          
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-500 text-sm">或使用社交帳號</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>
          
          <SocialButton 
            provider="google" 
            title="使用 Google 登入" 
            onPress={doGoogle} 
          />
          
          {appleOk && (
            <SocialButton 
              provider="apple" 
              title="使用 Apple 登入" 
              onPress={doApple} 
            />
          )}
          
          <ErrorText message={error} />
        </View>

        <View className="mt-12 items-center">
          <Text className="text-xs text-gray-500 text-center leading-5">
            登入即表示您同意我們的服務條款和隱私政策{"\n"}
            您的數據將安全地存儲在雲端
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

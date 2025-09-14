import React, { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useUserStore } from "../state/userStore";
import { useAppStore } from "../state/appStore";
import ErrorText from "../components/ui/ErrorText";
import * as Haptics from "expo-haptics";
import { signInWithEmail, registerWithEmail } from "../api/auth/instantdb";

export default function EmailAuthScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "EmailAuth">>();
  const [mode, setMode] = useState<"login"|"register"|"verify">((route.params as any)?.initialMode || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | undefined>();
  const [pendingEmail, setPendingEmail] = useState<string>("");

  const validateInput = () => {
    if (!email.trim()) {
      setError("請輸入 Email 地址");
      return false;
    }
    if (!email.includes("@")) {
      setError("請輸入有效的 Email 地址");
      return false;
    }
    if (!password.trim()) {
      setError("請輸入密碼");
      return false;
    }
    if (password.length < 6) {
      setError("密碼至少需要 6 個字符");
      return false;
    }
    return true;
  };

  const submit = async () => {
    setError(undefined);
    setSuccess(undefined);
    
    if (!validateInput()) return;
    
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email.trim().toLowerCase(), password);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSuccess("登入成功！");
        
        // Check user profile and subscription status
        const user = useUserStore.getState().user;
        const sub = useAppStore.getState().subscription;
        
        setTimeout(() => {
          if (!user) {
            nav.reset({ index: 0, routes: [{ name: "Onboarding" }] });
          } else if (!sub.isActive) {
            nav.reset({ index: 0, routes: [{ name: "Paywall" }] });
          } else {
            nav.reset({ index: 0, routes: [{ name: "MainTabs" }] });
          }
        }, 1000);
        
      } else {
        await registerWithEmail(email.trim().toLowerCase(), password, displayName);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // With InstantDB magic codes, user is immediately signed in
        setSuccess("註冊成功！正在設定您的帳戶...");
        setTimeout(() => {
          nav.reset({ index: 0, routes: [{ name: "Onboarding" }] });
        }, 1500);
      }
    } catch (e: any) {
      let errorMessage = "發生錯誤，請稍後再試";
      
      // Handle specific authentication errors
      if (e.message?.includes("Invalid login credentials")) {
        errorMessage = "Email 或密碼不正確";
      } else if (e.message?.includes("User already registered")) {
        errorMessage = "此 Email 已經註冊，請直接登入";
        setMode("login");
      } else if (e.message?.includes("Password should be at least")) {
        errorMessage = "密碼至少需要 6 個字符";
      } else if (e.message?.includes("Unable to validate email address")) {
        errorMessage = "請輸入有效的 Email 地址";
      } else if (e.message?.includes("Email not confirmed")) {
        errorMessage = "請先驗證您的 Email 地址，然後再嘗試登入";
      } else if (e.message?.includes("Email rate limit exceeded")) {
        errorMessage = "發送郵件過於頻繁，請稍後再試";
      } else if (e.message?.includes("Signup is disabled")) {
        errorMessage = "目前暫停新用戶註冊，請稍後再試";
      } else if (e.message?.includes("Invalid email")) {
        errorMessage = "請輸入有效的 Email 地址";
      } else if (e.message?.includes("Password is too weak")) {
        errorMessage = "密碼強度不足，請使用更複雜的密碼";
      } else if (e.message?.includes("Network request failed")) {
        errorMessage = "網絡連接失敗，請檢查您的網絡連接";
      } else if (e.message?.includes("timeout")) {
        errorMessage = "請求超時，請稍後再試";
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      setError(errorMessage);
    } finally { 
      setLoading(false); 
    }
  };

  // Email verification not needed with InstantDB magic codes

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-6">
          <View className="mb-8">
            <Text className="text-2xl font-extrabold text-blue-900 mb-2">
              {mode === "login" ? "歡迎回來" : mode === "register" ? "建立新帳戶" : "驗證您的 Email"}
            </Text>
            <Text className="text-slate-600">
              {mode === "login" 
                ? "登入您的帳戶以繼續使用" 
                : mode === "register"
                ? "註冊新帳戶，開始您的健康之旅"
                : "我們已發送驗證郵件到您的信箱"
              }
            </Text>
          </View>

          {success && (
            <View className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3">
              <Text className="text-green-800 text-sm text-center">{success}</Text>
            </View>
          )}

          {mode === "register" && (
            <View className="mb-4">
              <Text className="text-slate-700 mb-2 font-medium">暱稱</Text>
              <TextInput 
                value={displayName} 
                onChangeText={setDisplayName} 
                placeholder="您的暱稱（可選）" 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base"
                returnKeyType="next"
              />
            </View>
          )}

          {mode === "verify" && (
            <View className="mb-6">
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <Text className="text-blue-800 text-sm text-center mb-2">
                  📧 請檢查您的信箱
                </Text>
                <Text className="text-blue-700 text-sm text-center">
                  我們已發送驗證郵件到：{"\n"}
                  <Text className="font-medium">{pendingEmail}</Text>
                </Text>
              </View>
              
              <View className="space-y-3">
                <Text className="text-slate-600 text-sm text-center">
                  • 點擊郵件中的驗證連結完成註冊{"\n"}
                  • 如果沒收到郵件，請檢查垃圾郵件資料夾{"\n"}
                  • 驗證連結將在 1 小時後過期
                </Text>
              </View>
            </View>
          )}

          {mode !== "verify" && (
            <>
              <View className="mb-4">
                <Text className="text-slate-700 mb-2 font-medium">Email 地址</Text>
                <TextInput 
                  value={email} 
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(undefined);
                  }}
                  keyboardType="email-address" 
                  autoCapitalize="none" 
                  placeholder="your@email.com" 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base"
                  returnKeyType="next"
                  autoComplete="email"
                />
              </View>

              <View className="mb-2">
                <Text className="text-slate-700 mb-2 font-medium">密碼</Text>
                <TextInput 
                  value={password} 
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(undefined);
                  }}
                  secureTextEntry 
                  placeholder="至少 6 個字符" 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base"
                  returnKeyType="done"
                  onSubmitEditing={submit}
                  autoComplete="password"
                />
              </View>
            </>
          )}

          <ErrorText message={error} />

          {mode !== "verify" && (
            <Pressable 
              onPress={submit} 
              disabled={loading}
              className={`w-full py-4 rounded-2xl mt-6 items-center ${
                loading ? "bg-slate-300" : "bg-black"
              }`} 
              accessibilityRole="button" 
              accessibilityLabel={mode === "login" ? "登入" : "註冊"}
            >
              <Text className="text-white font-bold text-base">
                {loading 
                  ? (mode === "login" ? "登入中..." : "註冊中...") 
                  : (mode === "login" ? "登入" : "註冊")
                }
              </Text>
            </Pressable>
          )}

          {mode === "verify" && (
            <View className="space-y-3">
              <Pressable 
                onPress={() => {
                  // Email verification not needed with InstantDB magic codes
                  setSuccess("InstantDB 使用魔法代碼，無需郵件驗證");
                }} 
                disabled={loading}
                className={`w-full py-4 rounded-2xl items-center ${
                  loading ? "bg-slate-300" : "bg-blue-600"
                }`} 
                accessibilityRole="button" 
                accessibilityLabel="重新發送驗證郵件"
              >
                <Text className="text-white font-bold text-base">
                  {loading ? "發送中..." : "重新發送驗證郵件"}
                </Text>
              </Pressable>

              <Pressable 
                onPress={() => {
                  setMode("login");
                  setError(undefined);
                  setSuccess(undefined);
                  setPendingEmail("");
                }}
                className="w-full py-3 items-center"
              >
                <Text className="text-slate-600 font-medium">
                  已經驗證了？返回登入
                </Text>
              </Pressable>
            </View>
          )}

          <View className="flex-1" />

          {mode !== "verify" && (
            <Pressable 
              onPress={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(undefined);
                setSuccess(undefined);
              }} 
              className="mt-6 mb-8 items-center py-3"
            >
              <Text className="text-blue-600 font-medium text-base">
                {mode === "login" 
                  ? "還沒有帳號？立即註冊" 
                  : "已有帳號？直接登入"
                }
              </Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

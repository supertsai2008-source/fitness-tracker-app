import React, { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signInWithEmail, registerWithEmail } from "../api/auth/instantdb";

export default function Auth() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await signInWithEmail(email, password);
      setMessage("登入成功");
    } catch (e: any) {
      setMessage(e?.message || "登入失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await registerWithEmail(email, password);
      setMessage("註冊成功");
    } catch (e: any) {
      setMessage(e?.message || "註冊失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ paddingBottom: insets.bottom }}>
      <View className="px-6 py-4 bg-white rounded-2xl border border-gray-200">
        <Text className="text-xl font-bold text-black mb-2">InstantDB 登入</Text>
        {!!message && <Text className="text-blue-700 mb-2">{message}</Text>}
        <View className="mb-3">
          <Text className="text-gray-700 mb-1">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@address.com"
            autoCapitalize="none"
            keyboardType="email-address"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
          />
        </View>
        <View className="mb-4">
          <Text className="text-gray-700 mb-1">密碼</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            autoCapitalize="none"
            secureTextEntry
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
          />
        </View>
        <View className="flex-row">
          <Pressable onPress={handleSignIn} disabled={loading} className={`flex-1 py-3 rounded-xl ${loading ? "bg-slate-300" : "bg-black"} mr-3`}>
            <Text className="text-white text-center font-semibold">登入</Text>
          </Pressable>
          <Pressable onPress={handleSignUp} disabled={loading} className={`flex-1 py-3 rounded-xl ${loading ? "bg-slate-300" : "bg-gray-800"}`}>
            <Text className="text-white text-center font-semibold">註冊</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

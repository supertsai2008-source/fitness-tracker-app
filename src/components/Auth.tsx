import React, { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "../lib/instantdb";

export default function Auth() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const signInWithEmail = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await db.auth.sendMagicLink(email);
      if (error) setMessage("登入失敗，請稍後再試");
      else setMessage("已發送登入連結到您的信箱！");
    } catch (e: any) {
      setMessage(e?.message || "登入失敗");
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await db.auth.sendMagicLink(email);
      if (error) setMessage("註冊失敗，請稍後再試");
      else setMessage("已發送註冊連結到您的信箱！");
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
          <Pressable onPress={signInWithEmail} disabled={loading} className={`flex-1 py-3 rounded-xl ${loading ? "bg-slate-300" : "bg-black"} mr-3`}>
            <Text className="text-white text-center font-semibold">登入</Text>
          </Pressable>
          <Pressable onPress={signUpWithEmail} disabled={loading} className={`flex-1 py-3 rounded-xl ${loading ? "bg-slate-300" : "bg-gray-800"}`}>
            <Text className="text-white text-center font-semibold">註冊</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

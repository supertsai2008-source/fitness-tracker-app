import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAccountStore } from "../state/accountStore";
import { saveAllSnapshots, loadAllSnapshots } from "../state/multiTenant";

export default function AccountSwitcherScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { accounts, currentAccountId, signInAs, removeAccount } = useAccountStore();

  const switchTo = async (id: string) => {
    if (currentAccountId && currentAccountId !== id) {
      await saveAllSnapshots(currentAccountId);
    }
    await loadAllSnapshots(id);
    signInAs(id);
    nav.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-6">
        <Text className="text-2xl font-extrabold text-blue-900 mb-1">帳號與資料庫</Text>
        <Text className="text-slate-600 mb-6">為每個帳號維持獨立的記錄與設定</Text>

        {accounts.map((a) => (
          <View key={a.id} className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 border ${currentAccountId===a.id?"border-blue-300 bg-blue-50":"border-slate-200 bg-white"}`}>
            <View className="flex-row items-center">
              {a.avatarUrl ? <Image source={{ uri: a.avatarUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} /> : <View className="w-9 h-9 rounded-full bg-slate-200" />}
              <View className="ml-3">
                <Text className="text-slate-900 font-semibold">{a.displayName || a.email || a.id}</Text>
                <Text className="text-slate-500 text-xs">{a.provider}</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              {currentAccountId!==a.id && (
                <Pressable onPress={() => switchTo(a.id)} className="px-3 py-2 bg-black rounded-xl mr-2"><Text className="text-white font-semibold">切換</Text></Pressable>
              )}
              <Pressable onPress={() => removeAccount(a.id)} className="px-3 py-2 bg-slate-100 rounded-xl"><Text className="text-slate-700">刪除</Text></Pressable>
            </View>
          </View>
        ))}

        <Pressable onPress={() => nav.navigate("AuthWelcome")} className="mt-4 w-full py-4 rounded-2xl bg-orange-500 items-center">
          <Text className="text-white font-bold">新增帳號</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

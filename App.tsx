import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("初始化中...");
  const [currentScreen, setCurrentScreen] = useState("home");
  const [weight, setWeight] = useState(0);
  const [showWeightPrompt, setShowWeightPrompt] = useState(false);
  const [weightInput, setWeightInput] = useState("");

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoadingMessage("載入設定...");
        
        // 模擬一些初始化工作
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setLoadingMessage("準備完成...");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsReady(true);
      } catch (error) {
        console.error("初始化錯誤:", error);
        setIsReady(true); // 即使出錯也繼續
      }
    };

    initializeApp();
  }, []);

  const handleButtonPress = (action: string) => {
    Alert.alert("按鈕被點擊", `你點擊了: ${action}`);
  };

  const handleWeightInput = () => {
    setWeightInput("");
    setShowWeightPrompt(true);
  };

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContent}>
            <Text style={styles.title}>VibeCode</Text>
            <Text style={styles.subtitle}>Weight Loss Tracker</Text>
            <ActivityIndicator size="large" color="#000000" style={styles.spinner} />
            <Text style={styles.loadingMessage}>{loadingMessage}</Text>
          </View>
          <StatusBar style="auto" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (currentScreen === "home") {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>VibeCode</Text>
            <Text style={styles.subtitle}>Weight Loss Tracker</Text>
            <Text style={styles.message}>✅ 初始化完成</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleWeightInput}
              >
                <Text style={styles.buttonText}>📊 記錄體重</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => setCurrentScreen("profile")}
              >
                <Text style={styles.buttonText}>👤 個人資料</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => handleButtonPress("設定")}
              >
                <Text style={styles.buttonText}>⚙️ 設定</Text>
              </TouchableOpacity>
            </View>
            
            {weight > 0 && (
              <Text style={styles.weightText}>當前體重: {weight} kg</Text>
            )}
          </View>
          {/* Cross-platform weight input modal */}
          <Modal
            visible={showWeightPrompt}
            transparent
            animationType="fade"
            onRequestClose={() => setShowWeightPrompt(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>輸入體重</Text>
                <Text style={styles.modalSubtitle}>請輸入你的體重 (kg)</Text>
                <TextInput
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="numeric"
                  placeholder="70"
                  style={styles.modalInput}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.button, { backgroundColor: '#E5E7EB' }]} onPress={() => setShowWeightPrompt(false)}>
                    <Text style={[styles.buttonText, { color: '#111827' }]}>取消</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      const val = parseFloat(weightInput);
                      if (!isNaN(val) && val > 0) {
                        setWeight(val);
                        setShowWeightPrompt(false);
                        Alert.alert("成功", `體重已記錄: ${val} kg`);
                      } else {
                        Alert.alert("無效輸入", "請輸入有效的數值");
                      }
                    }}
                  >
                    <Text style={styles.buttonText}>儲存</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <StatusBar style="auto" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (currentScreen === "profile") {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>個人資料</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => setCurrentScreen("home")}
              >
                <Text style={styles.buttonText}>🏠 回到首頁</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => handleButtonPress("編輯資料")}
              >
                <Text style={styles.buttonText}>✏️ 編輯資料</Text>
              </TouchableOpacity>
            </View>
          </View>
          <StatusBar style="auto" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  weightText: {
    fontSize: 18,
    color: '#059669',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
  spinner: {
    marginVertical: 16,
  },
  loadingMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

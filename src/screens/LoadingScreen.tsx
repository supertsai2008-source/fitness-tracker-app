import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "載入中..." }: LoadingScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Loading Indicator */}
        <ActivityIndicator size="large" color="#000000" />
        
        {/* Loading Message */}
        <Text style={styles.message}>
          {message}
        </Text>
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            版本 1.0.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
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
  message: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 18,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 32,
  },
  versionText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
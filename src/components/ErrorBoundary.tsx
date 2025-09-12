import React, { Component, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // 在生產環境中，這裡可以發送到錯誤追蹤服務
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 items-center justify-center px-6">
            <View className="items-center mb-8">
              <Ionicons name="warning" size={64} color="#EF4444" />
              <Text className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                發生錯誤
              </Text>
              <Text className="text-gray-600 text-center leading-6">
                應用程式遇到意外錯誤，請重新啟動或聯繫技術支援
              </Text>
            </View>

            {__DEV__ && this.state.error && (
              <View className="bg-red-50 p-4 rounded-xl mb-6 w-full">
                <Text className="text-red-800 font-semibold mb-2">錯誤詳情:</Text>
                <Text className="text-red-700 text-sm font-mono">
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <Pressable
              onPress={this.handleRetry}
              className="bg-black px-8 py-4 rounded-xl"
            >
              <Text className="text-white font-semibold text-lg">重試</Text>
            </Pressable>

            <Text className="text-gray-400 text-sm mt-4 text-center">
              如果問題持續發生，請重新啟動應用程式
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

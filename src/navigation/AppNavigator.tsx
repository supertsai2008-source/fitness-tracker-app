import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// App State
import { useAppState } from "../providers/AppStateProvider";


// Screens
import DashboardScreen from "../screens/DashboardScreen";
import FoodLogScreen from "../screens/FoodLogScreen";
import ProgressScreen from "../screens/ProgressScreen";
import SettingsScreen from "../screens/SettingsScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import PaywallScreen from "../screens/PaywallScreen";
import AuthWelcomeScreen from "../screens/AuthWelcomeScreen";
import EmailAuthScreen from "../screens/EmailAuthScreen";
import AccountSwitcherScreen from "../screens/AccountSwitcherScreen";
import AddFoodScreen from "../screens/AddFoodScreen";
import AddExerciseScreen from "../screens/AddExerciseScreen";
import WeightLogScreen from "../screens/WeightLogScreen";
import EditFoodScreen from "../screens/EditFoodScreen";
import MealPlanScreen from "../screens/MealPlanScreen";

// Navigation types
export type RootStackParamList = {
  AuthWelcome: undefined;
  EmailAuth: { initialMode?: "login" | "register" } | undefined;
  AccountSwitcher: undefined;
  Onboarding: undefined;
  Paywall: undefined;
  MainTabs: undefined;
  AddFood: { mealType?: string };
  AddExercise: { exerciseId?: string; duration?: number } | undefined;
  WeightLog: undefined;
  EditFood: { foodLog: any };
  EditExercise: { exerciseLog: any };
  MealPlan: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  FoodLog: undefined;
  Progress: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "FoodLog") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "Progress") {
            iconName = focused ? "analytics" : "analytics-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else {
            iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#666666",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0.5,
          borderTopColor: "#e0e0e0",
          paddingTop: 8,
          paddingBottom: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: "首頁" }}
      />
      <Tab.Screen 
        name="FoodLog" 
        component={FoodLogScreen}
        options={{ tabBarLabel: "飲食" }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ tabBarLabel: "進度" }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: "設定" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { appState } = useAppState();

  
  // Determine initial route based on app state
  const getInitialRouteName = (): keyof RootStackParamList => {
    if (!appState.user) return "AuthWelcome";
    if (!appState.isOnboardingComplete) return "Onboarding";
    if (!appState.hasActiveSubscription) return "Paywall";
    return "MainTabs";
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRouteName()}
      screenOptions={{ headerShown: false, presentation: "card" }}
    >
      <Stack.Screen name="AuthWelcome" component={AuthWelcomeScreen} />
      <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
      <Stack.Screen name="AccountSwitcher" component={AccountSwitcherScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ presentation: "modal", headerShown: true, headerTitle: "新增食物", headerTitleStyle: { color: "#000000" }, headerStyle: { backgroundColor: "#ffffff" } }} />
      <Stack.Screen name="AddExercise" component={AddExerciseScreen} options={{ presentation: "modal", headerShown: true, headerTitle: "新增運動", headerTitleStyle: { color: "#000000" }, headerStyle: { backgroundColor: "#ffffff" } }} />
      <Stack.Screen name="WeightLog" component={WeightLogScreen} options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="EditFood" component={EditFoodScreen} options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="MealPlan" component={MealPlanScreen} options={{ presentation: "modal", headerShown: false }} />
    </Stack.Navigator>
  );
}
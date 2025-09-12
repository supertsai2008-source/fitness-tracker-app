import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/AppNavigator";
import { useUserStore } from "../state/userStore";
import { useExerciseStore } from "../state/exerciseStore";
import { ExercisePlan, ExerciseItem } from "../types";
import { exercisePlans, calculatePersonalizedCalorieBurn, getUserFitnessLevel } from "../data/exercisePlans";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ExercisePlanSuggestionsProps {
  maxItems?: number;
}

function estimateItemDurationMin(item: ExerciseItem): number {
  if (typeof item.duration === "number") return item.duration;
  if (typeof item.sets === "number" && typeof item.reps === "number") {
    // Estimate: 3 seconds per rep + 30 seconds rest per set
    const work = item.sets * item.reps * 3;
    const rest = item.sets * 30;
    return Math.round((work + rest) / 60);
  }
  // Fallback
  return 5;
}

function estimateItemCalories(item: ExerciseItem, userWeight: number): number {
  const duration = estimateItemDurationMin(item);
  // kcal = MET * 3.5 * weight(kg) / 200 * minutes
  const perMin = (item.metValue * 3.5 * userWeight) / 200;
  return Math.round(perMin * duration);
}

export default function ExercisePlanSuggestions({ maxItems = 4 }: ExercisePlanSuggestionsProps) {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useUserStore();
  const addExerciseLog = useExerciseStore((s) => s.addExerciseLog);
  const [loggingPlanId, setLoggingPlanId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const bmi = useMemo(() => {
    if (!user) return 0;
    return user.weight / Math.pow(user.height / 100, 2);
  }, [user]);

  const recs = useMemo(() => {
    if (!user) return [] as Array<{ plan: ExercisePlan; estKcal: number; score: number }>;

    const level = getUserFitnessLevel(bmi, user.activityLevel);
    const base = exercisePlans.filter((p) => p.difficulty === level);

    // Always consider quick or low-impact options as alternatives
    const extras = exercisePlans.filter((p) => p.id === "quick_15min" || p.id === "low_impact");
    // Deduplicate by id to avoid duplicate keys
    const poolMap = new Map<string, ExercisePlan>();
    [...base, ...extras].forEach((p) => { if (!poolMap.has(p.id)) poolMap.set(p.id, p); });
    const pool = Array.from(poolMap.values());

    // Score by exercise preference (100 - dietExerciseRatio) and calories/time
    const exercisePref = Math.max(0, Math.min(100, 100 - (user.dietExerciseRatio || 50)));

    const scored = pool.map((plan) => {
      const est = calculatePersonalizedCalorieBurn(plan, user.weight);
      // Higher calories and moderate duration preferred when exercisePref high
      const calorieScore = est / 5; // scale
      const durationScore = plan.duration <= 20 ? 60 : plan.duration <= 35 ? 80 : 60;
      const baseScore = (calorieScore * (exercisePref / 100)) + durationScore * (1 - exercisePref / 100);
      return { plan, estKcal: est, score: Math.round(baseScore) };
    });

    scored.sort((a, b) => (b.score - a.score) || a.plan.id.localeCompare(b.plan.id));
    return scored.slice(0, maxItems);
  }, [user, bmi, maxItems]);

  function mapPlanItemToExerciseId(item: ExerciseItem): string {
    const id = item.id;
    if (id.includes("jogging")) return "jogging";
    if (id.includes("running")) return "running";
    if (id.includes("cycling")) return "cycling";
    if (id.includes("swimming")) return "swimming";
    if (id.includes("walking")) return "walking";
    if (id.includes("yoga") || id.includes("stretch")) return "yoga";
    return "weightlifting";
  }

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("AddExercise");
  };

  const handleStartWithPlan = (plan: ExercisePlan) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (plan.exercises.length > 0) {
      const first = plan.exercises[0];
      navigation.navigate("AddExercise", {
        exerciseId: mapPlanItemToExerciseId(first),
        duration: typeof first.duration === "number" ? first.duration : undefined,
      });
      return;
    }
    navigation.navigate("AddExercise");
  };

  const handleLogPlan = async (plan: ExercisePlan) => {
    if (!user) return;
    try {
      setLoggingPlanId(plan.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      for (const item of plan.exercises) {
        const duration = estimateItemDurationMin(item);
        const caloriesBurned = estimateItemCalories(item, user.weight);
        addExerciseLog({
          userId: user.id,
          type: item.type,
          name: item.nameZh || item.name,
          duration: duration,
          caloriesBurned,
          loggedAt: new Date().toISOString(),
          source: "manual",
        } as any);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const kcal = calculatePersonalizedCalorieBurn(plan, user.weight);
      setToast(`已加入 ${plan.exercises.length} 項運動，約 ${kcal} kcal`);
      setTimeout(() => setToast(null), 2500);
    } finally {
      setLoggingPlanId(null);
    }
  };

  if (!user) return null;
  if (recs.length === 0) return null;

  return (
    <View className="bg-white rounded-2xl border border-gray-100 relative">
      <View className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-black font-semibold">運動計畫建議</Text>
        <Pressable onPress={handleStart} className="flex-row items-center px-2 py-1 rounded-lg bg-gray-900">
          <Ionicons name="play" size={14} color="#fff" />
          <Text className="text-white text-xs ml-1">開始</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}>
        {recs.map(({ plan, estKcal }) => (
          <View key={plan.id} className="w-64 mr-3 p-4 rounded-xl border border-gray-200 bg-white">
            <View className="flex-row items-center mb-2">
              <Ionicons name="fitness" size={18} color="#111827" />
              <Text className="text-black font-semibold ml-2">{plan.nameZh || plan.name}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <View className="px-2 py-1 bg-gray-100 rounded-full mr-2">
                <Text className="text-gray-700 text-xs">{plan.duration} 分鐘</Text>
              </View>
              <View className="px-2 py-1 bg-gray-100 rounded-full">
                <Text className="text-gray-700 text-xs">約 {estKcal} kcal</Text>
              </View>
            </View>
            {plan.descriptionZh ? (
              <Text className="text-gray-600 text-sm mb-3">{plan.descriptionZh}</Text>
            ) : null}

            <View className="flex-row">
              <Pressable onPress={() => handleLogPlan(plan)} className="flex-1 bg-black py-2 rounded-lg items-center justify-center mr-2" disabled={loggingPlanId === plan.id}>
                <Text className="text-white text-sm">加入今天</Text>
              </Pressable>
              <Pressable onPress={() => handleStartWithPlan(plan)} className="w-10 h-10 rounded-lg bg-gray-900 items-center justify-center">
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      {toast && (
        <View className="absolute left-0 right-0 -bottom-2 items-center">
          <View className="bg-black px-4 py-2 rounded-full shadow-lg">
            <Text className="text-white text-sm">{toast}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

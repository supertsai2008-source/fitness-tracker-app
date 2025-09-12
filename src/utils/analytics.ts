import { useFoodStore } from "../state/foodStore";
import { useExerciseStore } from "../state/exerciseStore";
import { useUserStore } from "../state/userStore";

export const toDate = (d: Date) => d.toISOString().split("T")[0];

export function getWeightSeries(days: number) {
  const user = useUserStore.getState().user;
  const logs = useUserStore.getState().getWeightHistory?.() || [];
  const series: { x: string; y: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = toDate(d);
    const entry = logs.find(l => l.loggedAt.startsWith(iso));
    const y = entry ? entry.weight : (user?.weight || 0);
    series.push({ x: d.toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" }), y });
  }
  return series;
}

export function getCaloriesSeries(days: number) {
  const foodLogs = useFoodStore.getState().foodLogs;
  const exerciseLogs = useExerciseStore.getState().exerciseLogs;
  const target = useUserStore.getState().user?.dailyCalorieTarget || 2000;

  const series: { x: string; consumed: number; burned: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = toDate(d);
    const consumed = foodLogs.filter(l => l.loggedAt.startsWith(iso)).reduce((s, l) => s + l.calories, 0);
    const burned = exerciseLogs.filter(l => l.loggedAt.startsWith(iso)).reduce((s, l) => s + l.caloriesBurned, 0);
    series.push({ x: d.toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" }), consumed, burned });
  }
  return { series, target };
}

export function getMacrosToday() {
  const iso = toDate(new Date());
  const foodLogs = useFoodStore.getState().foodLogs.filter(l => l.loggedAt.startsWith(iso));
  const protein = foodLogs.reduce((s, l) => s + l.protein, 0);
  const carbs = foodLogs.reduce((s, l) => s + l.carbs, 0);
  const fat = foodLogs.reduce((s, l) => s + l.fat, 0);
  return { protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
}

export function getExerciseHeatmap(weeks: number) {
  const exerciseLogs = useExerciseStore.getState().exerciseLogs;
  // data[dayOfWeek][week]
  const data: number[][] = Array.from({ length: 7 }).map(() => Array.from({ length: weeks }).map(() => 0));
  const today = new Date();
  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (weeks - 1 - w) * 7 - (6 - d)); // align Monday->Sunday mapping
      const iso = toDate(date);
      const total = exerciseLogs.filter(l => l.loggedAt.startsWith(iso)).reduce((s, l) => s + l.caloriesBurned, 0);
      // normalize 0..1 assuming 600 kcal max per day
      data[d][w] = Math.max(0, Math.min(1, total / 600));
    }
  }
  return data;
}

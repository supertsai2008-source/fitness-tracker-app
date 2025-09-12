import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "./userStore";
import { useFoodStore } from "./foodStore";
import { useExerciseStore } from "./exerciseStore";
import { useAccountStore } from "./accountStore";

const keysFor = (id: string) => ({
  user: `account:${id}:user-storage`,
  food: `account:${id}:food-storage`,
  exercise: `account:${id}:exercise-storage`,
});

export async function saveAllSnapshots(accountId: string) {
  if (!accountId) return;
  const user = useUserStore.getState();
  const food = useFoodStore.getState();
  const exercise = useExerciseStore.getState();
  const keys = keysFor(accountId);
  await AsyncStorage.setItem(keys.user, JSON.stringify({
    state: {
      user: user.user,
      isOnboardingComplete: user.isOnboardingComplete,
      hasActiveSubscription: user.hasActiveSubscription,
      weightLogs: user.weightLogs,
      _hasHydrated: true,
    }
  }));
  await AsyncStorage.setItem(keys.food, JSON.stringify({
    state: {
      foodLogs: food.foodLogs,
      favoriteFood: food.favoriteFood,
      taiwanFoodEquivs: food.taiwanFoodEquivs,
    }
  }));
  await AsyncStorage.setItem(keys.exercise, JSON.stringify({
    state: {
      exerciseLogs: exercise.exerciseLogs,
    }
  }));
}

export async function loadAllSnapshots(accountId: string) {
  const keys = keysFor(accountId);
  const [u, f, e] = await Promise.all([
    AsyncStorage.getItem(keys.user),
    AsyncStorage.getItem(keys.food),
    AsyncStorage.getItem(keys.exercise),
  ]);

  if (u) {
    try {
      const parsed = JSON.parse(u);
      useUserStore.setState({ ...useUserStore.getState(), ...parsed.state });
    } catch {}
  } else {
    // empty init
    useUserStore.setState({ user: null, isOnboardingComplete: false, hasActiveSubscription: false, weightLogs: [], _hasHydrated: true } as any);
  }

  if (f) {
    try {
      const parsed = JSON.parse(f);
      useFoodStore.setState({ ...useFoodStore.getState(), ...parsed.state });
    } catch {}
  } else {
    useFoodStore.setState({ foodLogs: [], favoriteFood: useFoodStore.getState().favoriteFood, taiwanFoodEquivs: useFoodStore.getState().taiwanFoodEquivs } as any);
  }

  if (e) {
    try {
      const parsed = JSON.parse(e);
      useExerciseStore.setState({ ...useExerciseStore.getState(), ...parsed.state });
    } catch {}
  } else {
    useExerciseStore.setState({ exerciseLogs: [] } as any);
  }
}

export async function migrateGenericToLocal() {
  const { currentAccountId, signInAs, upsertAccount } = useAccountStore.getState();
  if (currentAccountId) return; // already migrated
  // If user store has any data after hydration, move into local:default
  const user = useUserStore.getState();
  const food = useFoodStore.getState();
  const exercise = useExerciseStore.getState();
  const hasAny = !!(user.user || (food.foodLogs && food.foodLogs.length) || (exercise.exerciseLogs && exercise.exerciseLogs.length));
  const localId = "local:default";
  if (hasAny) {
    upsertAccount({ id: localId, provider: "local", displayName: "本機帳號", createdAt: new Date().toISOString() });
    await saveAllSnapshots(localId);
    signInAs(localId);
  }
}

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, WeightLog } from "../types";

interface UserState {
  user: User | null;
  isOnboardingComplete: boolean;
  hasActiveSubscription: boolean;
  weightLogs: WeightLog[];
  _hasHydrated: boolean;
  
  // Actions
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  addWeightLog: (weightLog: WeightLog) => void;
  completeOnboarding: () => void;
  setSubscriptionStatus: (isActive: boolean) => void;
  clearUser: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  
  // Computed values
  getDailyCalorieTarget: () => number;
  getMacroTargets: () => { protein: number; carbs: number; fat: number };
  getWeightHistory: () => WeightLog[];
}

// BMR calculation using Mifflin-St Jeor equation
const calculateBMR = (user: User): number => {
  const { gender, weight, height, age } = user;
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

// TDEE calculation
const calculateTDEE = (bmr: number, activityLevel: number): number => {
  return bmr * activityLevel;
};

// Daily calorie target with deficit
const calculateDailyCalorieTarget = (user: User): number => {
  const bmr = calculateBMR(user);
  const tdee = calculateTDEE(bmr, user.activityLevel);
  
  // Calculate weekly deficit based on weight loss speed (0.25-1.0 kg/week)
  // 1 kg fat = ~7700 calories
  const weeklyDeficit = user.weightLossSpeed * 7700;
  const dailyDeficit = weeklyDeficit / 7;
  
  return Math.max(1200, tdee - dailyDeficit); // Minimum 1200 calories
};

// Macro targets calculation
const calculateMacroTargets = (user: User, dailyCalories: number) => {
  // Protein: 1.8g per kg body weight (default)
  const protein = user.weight * 1.8;
  
  // Fat: 25-30% of total calories (default 27.5%)
  const fatCalories = dailyCalories * 0.275;
  const fat = fatCalories / 9; // 9 calories per gram of fat
  
  // Carbs: remaining calories
  const proteinCalories = protein * 4; // 4 calories per gram of protein
  const remainingCalories = dailyCalories - proteinCalories - fatCalories;
  const carbs = remainingCalories / 4; // 4 calories per gram of carbs
  
  return {
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
  };
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isOnboardingComplete: false,
      hasActiveSubscription: false,
      weightLogs: [],
      _hasHydrated: false,
      
      setUser: (user: User) => {
        const bmr = calculateBMR(user);
        const tdee = calculateTDEE(bmr, user.activityLevel);
        const dailyCalorieTarget = calculateDailyCalorieTarget(user);
        const macros = calculateMacroTargets(user, dailyCalorieTarget);
        
        const updatedUser: User = {
          ...user,
          bmr,
          tdee,
          dailyCalorieTarget,
          proteinTarget: macros.protein,
          carbTarget: macros.carbs,
          fatTarget: macros.fat,
        };
        
        set({ user: updatedUser });
      },
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        const updatedUser = { ...currentUser, ...updates };
        
        // Recalculate if metabolic data changed
        if (updates.weight || updates.height || updates.age || updates.activityLevel || updates.weightLossSpeed) {
          const bmr = calculateBMR(updatedUser);
          const tdee = calculateTDEE(bmr, updatedUser.activityLevel);
          const dailyCalorieTarget = calculateDailyCalorieTarget(updatedUser);
          const macros = calculateMacroTargets(updatedUser, dailyCalorieTarget);
          
          updatedUser.bmr = bmr;
          updatedUser.tdee = tdee;
          updatedUser.dailyCalorieTarget = dailyCalorieTarget;
          updatedUser.proteinTarget = macros.protein;
          updatedUser.carbTarget = macros.carbs;
          updatedUser.fatTarget = macros.fat;
        }
        
        set({ user: updatedUser });
      },
      
      addWeightLog: (weightLog: WeightLog) => {
        const currentLogs = get().weightLogs;
        set({ weightLogs: [...currentLogs, weightLog] });
      },
      
      completeOnboarding: () => set({ isOnboardingComplete: true }),
      
      setSubscriptionStatus: (isActive: boolean) => set({ hasActiveSubscription: isActive }),
      
      clearUser: () => set({ 
        user: null, 
        isOnboardingComplete: false, 
        hasActiveSubscription: false,
        weightLogs: [],
        _hasHydrated: true // Keep hydrated state when clearing user
      }),
      
      getDailyCalorieTarget: () => {
        const user = get().user;
        return user?.dailyCalorieTarget || 0;
      },
      
      getMacroTargets: () => {
        const user = get().user;
        return {
          protein: user?.proteinTarget || 0,
          carbs: user?.carbTarget || 0,
          fat: user?.fatTarget || 0,
        };
      },
      
      getWeightHistory: () => {
        return get().weightLogs.sort((a, b) => 
          new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
        );
      },
      
      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
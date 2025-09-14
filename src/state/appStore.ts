import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppSettings, SubscriptionStatus } from "../types";

interface AppState {
  settings: AppSettings;
  subscription: SubscriptionStatus;
  _hasHydrated: boolean;
  
  // Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateSubscription: (updates: Partial<SubscriptionStatus>) => void;
  activateSubscription: (plan: "monthly" | "yearly") => void;
  cancelSubscription: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  resetApp: () => void;
}

const defaultSettings: AppSettings = {
  language: "zh",
  darkMode: false,
  notificationsEnabled: true,
  reminderTime: "09:00",
  units: "metric",
};

const defaultSubscription: SubscriptionStatus = {
  isActive: false,
  plan: null,
  isTrialActive: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      subscription: defaultSubscription,
      _hasHydrated: false,
      
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates }
        }));
      },
      
      updateSubscription: (updates) => {
        set((state) => ({
          subscription: { ...state.subscription, ...updates }
        }));
      },
      
      activateSubscription: (plan: "monthly" | "yearly") => {
        const expiresAt = new Date();
        if (plan === "yearly") {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }
        
        set((state) => ({
          subscription: {
            ...state.subscription,
            isActive: true,
            plan,
            expiresAt: expiresAt.toISOString(),
            isTrialActive: false,
          }
        }));
      },
      
      cancelSubscription: () => {
        set((state) => ({
          subscription: {
            ...state.subscription,
            isActive: false,
            plan: null,
            expiresAt: undefined,
          }
        }));
      },
      
      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
      
      resetApp: () => {
        set({
          settings: defaultSettings,
          subscription: defaultSubscription,
          _hasHydrated: true,
        });
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
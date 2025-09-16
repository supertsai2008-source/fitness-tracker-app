import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useUserStore } from "../state/userStore";
import { useAppStore } from "../state/appStore";
import { useAccountStore } from "../state/accountStore";
import { migrateGenericToLocal } from "../state/multiTenant";
import { useQuery } from "../lib/instantdb";
import LoadingScreen from "../screens/LoadingScreen";

interface AppState {
  isInitialized: boolean;
  isOnboardingComplete: boolean;
  hasActiveSubscription: boolean;
  user: any;
}

interface AppStateContextType {
  appState: AppState;
  isLoading: boolean;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};

interface AppStateProviderProps {
  children: React.ReactNode;
}

export default function AppStateProvider({ children }: AppStateProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Store hooks
  const { user, isOnboardingComplete, hasActiveSubscription, _hasHydrated: userHydrated } = useUserStore();
  const { subscription, _hasHydrated: appHydrated } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Wait for stores to hydrate from AsyncStorage
        const checkHydration = () => {
          return new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
              if (userHydrated && appHydrated) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
            
            // Fallback timeout after 5 seconds
            setTimeout(() => {
              clearInterval(checkInterval);
              resolve();
            }, 5000);
          });
        };
        
        // Wait for hydration or timeout
        await checkHydration();

        // One-time migration to local account snapshot if needed
        await migrateGenericToLocal();
        
        // Wait a minimum time to show loading screen
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsInitialized(true);
      } catch (error) {
        console.error("App initialization error:", error);
        // Even if there's an error, we should still initialize to prevent infinite loading
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [userHydrated, appHydrated]);

  // Track account via selector and hydrate InstantDB data using hooks
  const currentAccountId = useAccountStore((s) => s.currentAccountId);
  const instantUserId = useMemo(() => (
    currentAccountId && currentAccountId.startsWith('instantdb:')
      ? currentAccountId.replace('instantdb:', '')
      : null
  ), [currentAccountId]);

  // Always call hooks; query for a non-existent id if not active
  const profileQuery = useMemo(() => ({
    profiles: { $: { where: { id: instantUserId || '__none__' } } }
  }), [instantUserId]);
  const entitlementsQuery = useMemo(() => ({
    entitlements: { $: { where: { user_id: instantUserId || '__none__' } } }
  }), [instantUserId]);

  const { data: profileData } = useQuery(profileQuery as any);
  const { data: entData } = useQuery(entitlementsQuery as any);

  useEffect(() => {
    if (!instantUserId) {
      // No InstantDB account active; clear user
      useUserStore.getState().clearUser();
      return;
    }

    const prof = (profileData as any)?.profiles?.[0];
    if (prof) {
      const { setUser, completeOnboarding } = useUserStore.getState();
      setUser({
        id: prof.id,
        gender: prof.gender,
        age: prof.age,
        height: prof.height,
        weight: prof.weight,
        bodyFat: prof.bodyFat,
        activityLevel: prof.activityLevel,
        targetWeight: prof.targetWeight,
        targetDate: prof.targetDate,
        dietExerciseRatio: prof.dietExerciseRatio,
        weightLossSpeed: prof.weightLossSpeed,
        allergies: prof.allergies,
        reminderFrequency: prof.reminderFrequency,
        createdAt: prof.created_at,
        lastWeightLoggedAt: prof.lastWeightLoggedAt,
        bmr: prof.bmr,
        tdee: prof.tdee,
        dailyCalorieTarget: prof.dailyCalorieTarget,
        proteinTarget: prof.proteinTarget,
        carbTarget: prof.carbTarget,
        fatTarget: prof.fatTarget,
      });
      if (prof.onboarding_complete) completeOnboarding();
    }

    const ents = (entData as any)?.entitlements || [];
    if (Array.isArray(ents)) {
      const activeEnt = ents.find((e: any) => e.active && (!e.expires_at || new Date(e.expires_at) > new Date()));
      if (activeEnt) {
        useUserStore.getState().setSubscriptionStatus(true);
        useAppStore.getState().updateSubscription({
          isActive: true,
          plan: activeEnt.product_id?.includes('yearly') ? 'yearly' : 'monthly',
          expiresAt: activeEnt.expires_at || undefined,
        });
      } else {
        useUserStore.getState().setSubscriptionStatus(false);
        useAppStore.getState().updateSubscription({ isActive: false, plan: null, expiresAt: undefined });
      }
    }
  }, [instantUserId, profileData, entData]);

  const appState: AppState = {
    isInitialized,
    isOnboardingComplete,
    hasActiveSubscription: hasActiveSubscription || subscription.isActive,
    user,
  };

  const contextValue: AppStateContextType = {
    appState,
    isLoading,
  };

  // Show loading screen while initializing
  if (isLoading || !isInitialized) {
    return <LoadingScreen message="初始化應用程式..." />;
  }

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUserStore } from "../state/userStore";
import { useAppStore } from "../state/appStore";
import { useAccountStore } from "../state/accountStore";
import { migrateGenericToLocal } from "../state/multiTenant";
import { db } from "../lib/instantdb";
import { initializeSync } from "../lib/instantdbSync";
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

        // Check for existing InstantDB session
        const { user } = db.auth;
        if (user) {
          const accountId = `instantdb:${user.email || user.id}`;
          const { upsertAccount, signInAs } = useAccountStore.getState();
          
          // Update account store with InstantDB user data
          upsertAccount({
            id: accountId,
            provider: "password",
            email: user.email || "",
            displayName: user.email?.split("@")[0] || "User",
            createdAt: new Date().toISOString(),
          });
          
          signInAs(accountId);
        }

        // One-time migration to local account snapshot if needed
        await migrateGenericToLocal();
        
        // Initialize InstantDB sync if user is authenticated
        if (user) {
          try {
            await initializeSync();
          } catch (error) {
            console.warn("Failed to initialize InstantDB sync:", error);
          }
        }
        
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

  // Listen for InstantDB auth state changes
  useEffect(() => {
    const unsubscribe = db.auth.onAuthChange(async (user) => {
      console.log("Auth state changed:", user?.email);
      
      if (user) {
        const accountId = `instantdb:${user.email || user.id}`;
        const { upsertAccount, signInAs } = useAccountStore.getState();
        
        upsertAccount({
          id: accountId,
          provider: "password",
          email: user.email || "",
          displayName: user.email?.split("@")[0] || "User",
          createdAt: new Date().toISOString(),
        });
        
        signInAs(accountId);
      } else {
        useAccountStore.getState().signOut();
        useUserStore.getState().clearUser();
      }
    });

    return unsubscribe;
  }, []);

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
import { db } from "./instantdb";
import { useUserStore } from "../state/userStore";
import { useAppStore } from "../state/appStore";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  username?: string;
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  target_weight: number;
  target_date?: string;
  activity_level: number;
  weight_loss_speed: number;
  diet_exercise_ratio: number;
  allergies?: string;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Entitlement {
  id: string;
  user_id: string;
  product_id: string;
  provider: string;
  active: boolean;
  expires_at?: string;
  last_synced_at: string;
}

/**
 * Sync local user data to InstantDB
 */
export async function syncUserProfile(): Promise<void> {
  try {
    const { user } = db.auth;
    if (!user) {
      console.log("No authenticated user for sync");
      return;
    }

    const localUser = useUserStore.getState().user;
    if (!localUser) {
      console.log("No local user data to sync");
      return;
    }

    const userProfile: Partial<UserProfile> = {
      id: user.id,
      email: user.email || "",
      display_name: localUser.displayName || user.email?.split("@")[0] || "User",
      username: user.email?.split("@")[0] || "User",
      weight: localUser.weight,
      height: localUser.height,
      age: localUser.age,
      gender: localUser.gender,
      target_weight: localUser.targetWeight,
      target_date: localUser.targetDate,
      activity_level: localUser.activityLevel,
      weight_loss_speed: localUser.weightLossSpeed,
      diet_exercise_ratio: localUser.dietExerciseRatio,
      allergies: localUser.allergies,
      onboarding_complete: useUserStore.getState().isOnboardingComplete,
      updated_at: new Date().toISOString(),
    };

    // Upsert user profile using InstantDB
    await db.transact([
      db.tx.profiles[user.id].update(userProfile)
    ]);

    console.log("User profile synced successfully");
  } catch (error) {
    console.error("Failed to sync user profile:", error);
    throw error;
  }
}

/**
 * Load user profile from InstantDB
 */
export async function loadUserProfile(): Promise<void> {
  try {
    const { user } = db.auth;
    if (!user) return;

    const { data } = await db.query({ profiles: { $: { where: { id: user.id } } } });
    
    if (data.profiles && data.profiles.length > 0) {
      const profile = data.profiles[0];
      const { setUser, completeOnboarding } = useUserStore.getState();
      
      setUser({
        id: profile.id,
        gender: profile.gender as "male" | "female",
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        bodyFat: 0, // Default value
        activityLevel: profile.activity_level,
        targetWeight: profile.target_weight,
        targetDate: profile.target_date || "",
        dietExerciseRatio: profile.diet_exercise_ratio,
        weightLossSpeed: profile.weight_loss_speed,
        allergies: profile.allergies || "",
        reminderFrequency: 1, // Default value
        createdAt: profile.created_at,
        // Calculated fields will be set by the store
        bmr: 0,
        tdee: 0,
        dailyCalorieTarget: 0,
        proteinTarget: 0,
        carbTarget: 0,
        fatTarget: 0,
      });

      if (profile.onboarding_complete) {
        completeOnboarding();
      }

      console.log("User profile loaded from InstantDB");
    } else {
      console.log("No user profile found in InstantDB - using local data");
    }
  } catch (error) {
    console.error("Failed to load user profile:", error);
  }
}

/**
 * Sync entitlements to InstantDB
 */
export async function syncEntitlements(): Promise<void> {
  try {
    const { user } = db.auth;
    if (!user) return;

    const subscription = useAppStore.getState().subscription;
    
    if (subscription.isActive) {
      const entitlement: Partial<Entitlement> = {
        id: `entitlement_${user.id}`,
        user_id: user.id,
        product_id: subscription.plan || "unknown",
        provider: "revenuecat",
        active: subscription.isActive,
        expires_at: subscription.expiresAt,
        last_synced_at: new Date().toISOString(),
      };

      await db.transact([
        db.tx.entitlements[entitlement.id].update(entitlement)
      ]);

      console.log("Entitlements synced successfully");
    }
  } catch (error) {
    console.error("Failed to sync entitlements:", error);
    throw error;
  }
}

/**
 * Load entitlements from InstantDB
 */
export async function loadEntitlements(): Promise<void> {
  try {
    const { user } = db.auth;
    if (!user) return;

    const { data } = await db.query({ 
      entitlements: { 
        $: { 
          where: { 
            user_id: user.id,
            active: true
          } 
        } 
      } 
    });
    
    if (data.entitlements && data.entitlements.length > 0) {
      const entitlement = data.entitlements[0];
      const { updateSubscription } = useAppStore.getState();
      
      // Check if entitlement is still valid
      const now = new Date();
      const expiresAt = entitlement.expires_at ? new Date(entitlement.expires_at) : null;
      const isActive = entitlement.active && (!expiresAt || expiresAt > now);
      
      updateSubscription({
        isActive,
        plan: entitlement.product_id as "monthly" | "yearly" | null,
        expiresAt: entitlement.expires_at,
        isTrialActive: false,
      });

      console.log("Entitlements loaded from InstantDB");
    } else {
      console.log("No active entitlements found in InstantDB");
    }
  } catch (error) {
    console.error("Failed to load entitlements:", error);
  }
}

/**
 * Full sync - upload all local data to InstantDB
 */
export async function fullSync(): Promise<void> {
  try {
    console.log("Starting full sync to InstantDB...");
    
    await syncUserProfile();
    await syncEntitlements();
    
    console.log("Full sync completed");
  } catch (error) {
    console.error("Full sync failed:", error);
    throw error;
  }
}

/**
 * Initialize sync - load data from InstantDB on app start
 */
export async function initializeSync(): Promise<void> {
  try {
    console.log("Initializing data sync...");
    
    await loadUserProfile();
    await loadEntitlements();
    
    console.log("Data sync initialized");
  } catch (error) {
    console.error("Failed to initialize sync:", error);
  }
}

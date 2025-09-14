import { db, Profile, Entitlement } from "./instantdb";
import { useUserStore } from "../state/userStore";
import { useFoodStore } from "../state/foodStore";
import { useExerciseStore } from "../state/exerciseStore";
import { useAccountStore } from "../state/accountStore";
import { updateUserProfile, updateUserEntitlements } from "../api/auth/instantdb";

/**
 * Sync local user data to InstantDB
 */
export async function syncUserProfile(): Promise<void> {
  try {
    // For now, we'll use the account store to get the current user ID
    const { currentAccountId } = useAccountStore.getState();
    if (!currentAccountId || !currentAccountId.startsWith('instantdb:')) {
      console.log("No authenticated user for sync");
      return;
    }
    
    const userId = currentAccountId.replace('instantdb:', '');

    const localUser = useUserStore.getState().user;
    if (!localUser) {
      console.log("No local user data to sync");
      return;
    }

    const profileUpdate: Partial<Profile> = {
      username: localUser.id, // Using ID as username for now
      onboarding_complete: useUserStore.getState().isOnboardingComplete,
      weight: localUser.weight,
      height: localUser.height,
      age: localUser.age,
      gender: localUser.gender,
      bodyFat: localUser.bodyFat,
      activityLevel: localUser.activityLevel,
      targetWeight: localUser.targetWeight,
      targetDate: localUser.targetDate,
      dietExerciseRatio: localUser.dietExerciseRatio,
      weightLossSpeed: localUser.weightLossSpeed,
      allergies: localUser.allergies,
      reminderFrequency: localUser.reminderFrequency,
      bmr: localUser.bmr,
      tdee: localUser.tdee,
      dailyCalorieTarget: localUser.dailyCalorieTarget,
      proteinTarget: localUser.proteinTarget,
      carbTarget: localUser.carbTarget,
      fatTarget: localUser.fatTarget,
      lastWeightLoggedAt: localUser.lastWeightLoggedAt,
    };

    await updateUserProfile(userId, profileUpdate);
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
    const { currentAccountId } = useAccountStore.getState();
    if (!currentAccountId || !currentAccountId.startsWith('instantdb:')) {
      return;
    }
    
    const userId = currentAccountId.replace('instantdb:', '');

    const { data } = await db.useQuery({
      profiles: {
        $: {
          where: { id: userId }
        }
      }
    });

    if (data && data.profiles && data.profiles.length > 0) {
      const profile = data.profiles[0];
      const { setUser, completeOnboarding } = useUserStore.getState();
      
      setUser({
        id: profile.id,
        gender: profile.gender,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        bodyFat: profile.bodyFat,
        activityLevel: profile.activityLevel,
        targetWeight: profile.targetWeight,
        targetDate: profile.targetDate,
        dietExerciseRatio: profile.dietExerciseRatio,
        weightLossSpeed: profile.weightLossSpeed,
        allergies: profile.allergies,
        reminderFrequency: profile.reminderFrequency,
        createdAt: profile.created_at,
        lastWeightLoggedAt: profile.lastWeightLoggedAt,
        // Calculated fields will be set by the store
        bmr: profile.bmr,
        tdee: profile.tdee,
        dailyCalorieTarget: profile.dailyCalorieTarget,
        proteinTarget: profile.proteinTarget,
        carbTarget: profile.carbTarget,
        fatTarget: profile.fatTarget,
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
 * Sync food logs to InstantDB (basic implementation)
 */
export async function syncFoodLogs(): Promise<void> {
  try {
    const { currentAccountId } = useAccountStore.getState();
    if (!currentAccountId || !currentAccountId.startsWith('instantdb:')) {
      return;
    }

    const localFoodLogs = useFoodStore.getState().foodLogs;
    
    // For now, just log the count - full implementation would batch upload
    console.log(`Would sync ${localFoodLogs.length} food logs to InstantDB`);
    
    // TODO: Implement batch upload with conflict resolution
    // This would involve creating a food_logs table in InstantDB
  } catch (error) {
    console.error("Failed to sync food logs:", error);
  }
}

/**
 * Sync exercise logs to InstantDB (basic implementation)
 */
export async function syncExerciseLogs(): Promise<void> {
  try {
    const { currentAccountId } = useAccountStore.getState();
    if (!currentAccountId || !currentAccountId.startsWith('instantdb:')) {
      return;
    }

    const localExerciseLogs = useExerciseStore.getState().exerciseLogs;
    
    // For now, just log the count - full implementation would batch upload
    console.log(`Would sync ${localExerciseLogs.length} exercise logs to InstantDB`);
    
    // TODO: Implement batch upload with conflict resolution
    // This would involve creating an exercise_logs table in InstantDB
  } catch (error) {
    console.error("Failed to sync exercise logs:", error);
  }
}

/**
 * Full sync - upload all local data to InstantDB
 */
export async function fullSync(): Promise<void> {
  try {
    console.log("Starting full sync to InstantDB...");
    
    await syncUserProfile();
    await syncFoodLogs();
    await syncExerciseLogs();
    
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
    
    console.log("Data sync initialized");
  } catch (error) {
    console.error("Failed to initialize sync:", error);
  }
}

/**
 * Sync RevenueCat subscription status to InstantDB
 */
export async function syncSubscriptionStatus(
  userId: string,
  productId: string,
  isActive: boolean,
  expiresAt?: string
): Promise<void> {
  try {
    await updateUserEntitlements(userId, {
      product_id: productId,
      active: isActive,
      expires_at: expiresAt || null,
    });

    console.log("Subscription status synced to InstantDB");
  } catch (error) {
    console.error("Failed to sync subscription status:", error);
    throw error;
  }
}

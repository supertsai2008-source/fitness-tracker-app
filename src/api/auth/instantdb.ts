import { db, Profile, Entitlement } from "../../lib/instantdb";
import { useAccountStore } from "../../state/accountStore";
import { useUserStore } from "../../state/userStore";
import { useAppStore } from "../../state/appStore";
import { saveAllSnapshots, loadAllSnapshots } from "../../state/multiTenant";

/**
 * Register a new user with email and password using InstantDB
 * Note: InstantDB uses magic codes for authentication, not traditional email/password
 */
export async function registerWithEmail(email: string, password: string, displayName?: string) {
  try {
    // For InstantDB, we'll simulate email/password registration
    // In a real implementation, you'd use magic codes or other auth methods
    const mockUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const accountId = `instantdb:${mockUserId}`;
    const { currentAccountId, upsertAccount, signInAs } = useAccountStore.getState();
    
    // Save current account data before switching
    if (currentAccountId) await saveAllSnapshots(currentAccountId);
    
    // Create or update account record
    upsertAccount({
      id: accountId,
      provider: "password",
      email: email.trim().toLowerCase(),
      displayName: displayName || email.split("@")[0],
      createdAt: new Date().toISOString(),
    });
    
    // Create initial profile in InstantDB
    await createUserProfile(mockUserId, {
      username: displayName || email.split("@")[0],
      email: email.trim().toLowerCase(),
      displayName: displayName || email.split("@")[0],
    });
    
    // Load user data for this account
    await loadAllSnapshots(accountId);
    signInAs(accountId);
    
    return { user: { id: mockUserId, email: email.trim().toLowerCase() } };
  } catch (error: any) {
    console.error("Registration error:", error);
    throw error;
  }
}

/**
 * Sign in with email using InstantDB
 * Note: This is a simplified implementation for demo purposes
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    // For InstantDB, we'll simulate email/password sign in
    // In a real implementation, you'd use magic codes or other auth methods
    const mockUserId = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    
    const accountId = `instantdb:${mockUserId}`;
    const { currentAccountId, upsertAccount, signInAs } = useAccountStore.getState();
    
    // Save current account data before switching
    if (currentAccountId) await saveAllSnapshots(currentAccountId);
    
    // Create or update account record
    upsertAccount({
      id: accountId,
      provider: "password",
      email: email.trim().toLowerCase(),
      displayName: email.split("@")[0],
      createdAt: new Date().toISOString(),
    });
    
    // Load user data for this account
    await loadAllSnapshots(accountId);
    signInAs(accountId);
    // Profile and entitlements will be synced by AppStateProvider via hooks
    
    return { user: { id: mockUserId, email: email.trim().toLowerCase() } };
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  }
}

/**
 * Sign out from InstantDB
 */
export async function signOut() {
  try {
    const { currentAccountId } = useAccountStore.getState();
    
    // Save current account data before signing out
    if (currentAccountId) {
      await saveAllSnapshots(currentAccountId);
    }
    
    // Clear local stores
    useAccountStore.getState().signOut();
    useUserStore.getState().clearUser();
    useAppStore.getState().resetApp();
    
    console.log("Signed out successfully");
  } catch (error: any) {
    console.error("Sign out error:", error);
    throw error;
  }
}

/**
 * Create user profile in InstantDB
 */
export async function createUserProfile(userId: string, userData: {
  username: string;
  email: string;
  displayName: string;
}) {
  try {
    const profile: Partial<Profile> = {
      id: userId,
      username: userData.username,
      onboarding_complete: false,
      created_at: new Date().toISOString(),
      // Default values - will be updated during onboarding
      weight: 70,
      height: 170,
      age: 30,
      gender: "male",
      bodyFat: 0,
      activityLevel: 1.4,
      targetWeight: 65,
      targetDate: "",
      dietExerciseRatio: 70,
      weightLossSpeed: 0.5,
      allergies: "",
      reminderFrequency: 1,
      bmr: 0,
      tdee: 0,
      dailyCalorieTarget: 0,
      proteinTarget: 0,
      carbTarget: 0,
      fatTarget: 0,
    };

    await db.transact(
      db.tx.profiles[userId].update(profile)
    );

    console.log("User profile created in InstantDB");
  } catch (error) {
    console.error("Failed to create user profile:", error);
    throw error;
  }
}

/**
 * Load user profile from InstantDB
 */
export async function loadUserProfile(_userId: string) {
  // Deprecated: use AppStateProvider hook-based loading
  console.warn("loadUserProfile is deprecated. Data loads via AppStateProvider hooks.");
  return;
}

/**
 * Update user profile in InstantDB
 */
export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
  try {
    await db.transact(
      db.tx.profiles[userId].update(updates)
    );

    console.log("User profile updated in InstantDB");
  } catch (error) {
    console.error("Failed to update user profile:", error);
    throw error;
  }
}

/**
 * Load user entitlements from InstantDB
 */
export async function loadUserEntitlements(_userId: string) {
  // Deprecated: use AppStateProvider hook-based loading
  console.warn("loadUserEntitlements is deprecated. Data loads via AppStateProvider hooks.");
  return;
}

/**
 * Update user entitlements in InstantDB (for RevenueCat integration)
 */
export async function updateUserEntitlements(userId: string, entitlement: Partial<Entitlement>) {
  try {
    const entitlementData: Partial<Entitlement> = {
      user_id: userId,
      provider: "revenuecat",
      last_synced_at: new Date().toISOString(),
      ...entitlement,
    };

    await db.transact(
      db.tx.entitlements[`${userId}_${entitlement.product_id}`].update(entitlementData)
    );

    console.log("User entitlements updated in InstantDB");
  } catch (error) {
    console.error("Failed to update user entitlements:", error);
    throw error;
  }
}

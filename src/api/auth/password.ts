import { db } from "../../lib/instantdb";
import { useAccountStore } from "../../state/accountStore";
import { useUserStore } from "../../state/userStore";
import { saveAllSnapshots, loadAllSnapshots } from "../../state/multiTenant";
import { initializeSync } from "../../lib/instantdbSync";

export async function registerWithEmail(email: string, password: string, displayName?: string) {
  try {
    // InstantDB uses magic link authentication, so we'll send a magic link
    const { data, error } = await db.auth.sendMagicLink(email.trim().toLowerCase());

    if (error) throw error;

    if (data) {
      const accountId = `instantdb:${email.trim().toLowerCase()}`;
      const { currentAccountId, upsertAccount, signInAs } = useAccountStore.getState();
      
      // Save current account data before switching
      if (currentAccountId) await saveAllSnapshots(currentAccountId);
      
      // Create account record
      upsertAccount({
        id: accountId,
        provider: "password",
        email: email.trim().toLowerCase(),
        displayName: displayName || email.split("@")[0],
        createdAt: new Date().toISOString(),
      });
      
      // Load user data for this account
      await loadAllSnapshots(accountId);
      signInAs(accountId);
      
      return data;
    }
    
    throw new Error("註冊失敗，請稍後再試");
  } catch (error: any) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    // InstantDB uses magic link authentication, so we'll send a magic link
    const { data, error } = await db.auth.sendMagicLink(email.trim().toLowerCase());

    if (error) throw error;

    if (data) {
      const accountId = `instantdb:${email.trim().toLowerCase()}`;
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
      
      // Initialize sync with InstantDB
      try {
        await initializeSync();
      } catch (error) {
        console.warn("Failed to initialize sync:", error);
      }
      
      return data;
    }
    
    throw new Error("登入失敗，請檢查您的憑證");
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { currentAccountId } = useAccountStore.getState();
    
    // Save current data before signing out
    if (currentAccountId) {
      await saveAllSnapshots(currentAccountId);
    }
    
    // Sign out from InstantDB
    await db.auth.signOut();
    
    // Clear local account state
    useAccountStore.getState().signOut();
    useUserStore.getState().clearUser();
    
  } catch (error: any) {
    console.error("Sign out error:", error);
    throw error;
  }
}

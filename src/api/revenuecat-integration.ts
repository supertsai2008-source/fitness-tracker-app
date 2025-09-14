import { updateUserEntitlements } from "./auth/instantdb";
import { useAccountStore } from "../state/accountStore";
import { getCustomerInfo, hasActiveSubscription } from "./revenuecat-config";

/**
 * RevenueCat integration for InstantDB
 * This service handles subscription updates and syncs them to InstantDB
 */

/**
 * Sync RevenueCat subscription status to InstantDB
 */
export async function syncRevenueCatToInstantDB(
  productId: string,
  isActive: boolean,
  expiresAt?: string
) {
  try {
    const { currentAccountId } = useAccountStore.getState();
    
    if (!currentAccountId || !currentAccountId.startsWith('instantdb:')) {
      console.log("No InstantDB account found for RevenueCat sync");
      return;
    }
    
    const userId = currentAccountId.replace('instantdb:', '');
    
    await updateUserEntitlements(userId, {
      product_id: productId,
      active: isActive,
      expires_at: expiresAt || null,
    });
    
    console.log("RevenueCat subscription synced to InstantDB");
  } catch (error) {
    console.error("Failed to sync RevenueCat to InstantDB:", error);
    throw error;
  }
}

/**
 * Handle RevenueCat purchase success
 */
export async function handleRevenueCatPurchase(
  productId: string,
  expiresAt?: string
) {
  try {
    await syncRevenueCatToInstantDB(productId, true, expiresAt);
    console.log("RevenueCat purchase synced to InstantDB");
  } catch (error) {
    console.error("Failed to sync RevenueCat purchase:", error);
    throw error;
  }
}

/**
 * Handle RevenueCat purchase restore
 */
export async function handleRevenueCatRestore(
  productId: string,
  expiresAt?: string
) {
  try {
    await syncRevenueCatToInstantDB(productId, true, expiresAt);
    console.log("RevenueCat restore synced to InstantDB");
  } catch (error) {
    console.error("Failed to sync RevenueCat restore:", error);
    throw error;
  }
}

/**
 * Handle RevenueCat subscription cancellation
 */
export async function handleRevenueCatCancellation(productId: string) {
  try {
    await syncRevenueCatToInstantDB(productId, false);
    console.log("RevenueCat cancellation synced to InstantDB");
  } catch (error) {
    console.error("Failed to sync RevenueCat cancellation:", error);
    throw error;
  }
}

/**
 * Sync current RevenueCat subscription status to InstantDB
 * Call this when the app starts or when subscription status changes
 */
export async function syncCurrentSubscriptionStatus() {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) {
      console.log("No customer info available for sync");
      return;
    }

    const isActive = await hasActiveSubscription();
    
    // Get the active entitlement (assuming one main subscription)
    const activeEntitlements = Object.values(customerInfo.entitlements.active);
    const activeEntitlement = activeEntitlements[0];
    
    if (activeEntitlement) {
      await syncRevenueCatToInstantDB(
        activeEntitlement.productIdentifier,
        isActive,
        activeEntitlement.expirationDate
      );
      console.log("Current subscription status synced to InstantDB");
    } else {
      // No active subscription
      await syncRevenueCatToInstantDB("premium", false);
      console.log("No active subscription - status synced to InstantDB");
    }
  } catch (error) {
    console.error("Failed to sync current subscription status:", error);
    throw error;
  }
}

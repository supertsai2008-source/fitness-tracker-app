import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

/**
 * RevenueCat Configuration
 * Configure your RevenueCat API keys and product IDs here
 */

// RevenueCat API Keys
// Get these from your RevenueCat dashboard: https://app.revenuecat.com/
export const REVENUECAT_CONFIG = {
  // iOS API Key (get from RevenueCat dashboard)
  ios: {
    apiKey: 'YOUR_IOS_API_KEY_HERE', // Replace with your actual iOS API key
  },
  // Android API Key (get from RevenueCat dashboard)
  android: {
    apiKey: 'YOUR_ANDROID_API_KEY_HERE', // Replace with your actual Android API key
  },
};

// Product IDs for your subscriptions
// These should match what you set up in App Store Connect and Google Play Console
export const PRODUCT_IDS = {
  // Monthly subscription
  monthly: 'vibecode_premium_monthly',
  // Yearly subscription (with discount)
  yearly: 'vibecode_premium_yearly',
  // Weekly subscription (optional)
  weekly: 'vibecode_premium_weekly',
} as const;

// Offering IDs (optional, for organizing products)
export const OFFERING_IDS = {
  default: 'default',
  premium: 'premium',
} as const;

/**
 * Initialize RevenueCat
 * Call this in your App.tsx or main component
 */
export async function initializeRevenueCat(userId?: string) {
  try {
    const apiKey = Platform.OS === 'ios' 
      ? REVENUECAT_CONFIG.ios.apiKey 
      : REVENUECAT_CONFIG.android.apiKey;

    if (!apiKey || apiKey.includes('YOUR_')) {
      console.warn('RevenueCat API key not configured. Please update REVENUECAT_CONFIG.');
      return;
    }

    // Configure RevenueCat
    await Purchases.configure({ apiKey });

    // Set user ID if provided (for user identification)
    if (userId) {
      await Purchases.logIn(userId);
    }

    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel('debug');
    }

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

/**
 * Get available offerings (subscription packages)
 */
export async function getOfferings(): Promise<PurchasesOffering[]> {
  try {
    const offerings = await Purchases.getOfferings();
    return Object.values(offerings.all);
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
}

/**
 * Get the default offering
 */
export async function getDefaultOffering(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get default offering:', error);
    return null;
  }
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(packageToPurchase: PurchasesPackage) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    // Check if purchase was successful
    const isActive = customerInfo.entitlements.active[packageToPurchase.identifier] !== undefined;
    
    if (isActive) {
      console.log('Purchase successful:', packageToPurchase.identifier);
      return { success: true, customerInfo };
    } else {
      console.log('Purchase failed or not active');
      return { success: false, customerInfo };
    }
  } catch (error) {
    console.error('Purchase failed:', error);
    return { success: false, error };
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases() {
  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log('Purchases restored successfully');
    return { success: true, customerInfo };
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return { success: false, error };
  }
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    
    // Check if any entitlement is active
    const activeEntitlements = Object.values(customerInfo.entitlements.active);
    return activeEntitlements.length > 0;
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return false;
  }
}

/**
 * Get customer info
 */
export async function getCustomerInfo() {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
}

/**
 * Log out user
 */
export async function logOutUser() {
  try {
    await Purchases.logOut();
    console.log('User logged out from RevenueCat');
  } catch (error) {
    console.error('Failed to log out user:', error);
  }
}

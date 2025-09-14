import { init } from '@instantdb/react-native';

// Initialize InstantDB client
export const db = init({
  appId: "d10db7a8-30ac-4fdb-82a1-87cc0e993acd",
});

// Data model types for InstantDB
export interface Profile {
  id: string; // user ID
  username: string;
  onboarding_complete: boolean;
  created_at: string;
  // User data from current User interface
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  bodyFat: number;
  activityLevel: number;
  targetWeight: number;
  targetDate: string;
  dietExerciseRatio: number;
  weightLossSpeed: number;
  allergies: string;
  reminderFrequency: number;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  lastWeightLoggedAt?: string;
}

export interface Entitlement {
  user_id: string;
  product_id: string;
  provider: "revenuecat";
  active: boolean;
  expires_at: string | null;
  last_synced_at: string;
}

// Auth helpers
export const auth = db.auth;

// Query helpers
export const useQuery = db.useQuery;
export const transact = db.transact;
export const tx = db.tx;

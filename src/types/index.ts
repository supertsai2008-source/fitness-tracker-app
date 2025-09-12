// Core types for the weight loss tracking app

export interface User {
  id: string;
  gender: "male" | "female";
  age: number;
  height: number; // cm
  weight: number; // kg
  bodyFat: number; // percentage
  activityLevel: number; // 1.2 - 1.9
  targetWeight: number; // kg
  targetDate: string; // ISO date
  dietExerciseRatio: number; // 0-100, diet preference
  weightLossSpeed: number; // 0.25-1.0 kg per week
  allergies: string;
  reminderFrequency: number; // days
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  proteinTarget: number; // g
  carbTarget: number; // g
  fatTarget: number; // g
  createdAt: string;
  lastWeightLoggedAt?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  nameZh: string;
  calories: number; // per base serving
  protein: number; // g per base serving
  carbs: number; // g per base serving
  fat: number; // g per base serving
  servingSize: string;
  servingNameZh: string;
  brand?: string;
  barcode?: string;
  isCustom: boolean;
  cookingMethod?: "raw" | "boiled" | "steamed" | "grilled" | "baked" | "stir_fry" | "deep_fry" | "other";
  cookingInstructions?: string;
  portionHints?: string[];
  sizeOptions?: Array<{ label: string; factor: number; zh?: string }>;
  // AI detection metadata (from photo analysis)
  aiDetectedName?: string;
  aiDetectedNameZh?: string;
  aiConfidence?: number; // 0-100
}

export interface FoodLog {
  id: string;
  userId: string;
  foodId: string;
  foodName: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  loggedAt: string;
  source: "search" | "barcode" | "photo" | "custom" | "meal_plan";
  photoUri?: string;
  errorRate?: number; // for photo analysis
  selectedCookingMethod?: string;
  selectedServingLabel?: string; // e.g. 中杯 / 大份
  sizeFactor?: number; // applied multiplier
  // AI detection metadata snapshot at logging time
  aiDetectedName?: string;
  aiDetectedNameZh?: string;
  aiConfidence?: number; // 0-100
}

export interface ExerciseLog {
  id: string;
  userId: string;
  type: string;
  name: string;
  duration: number; // minutes
  caloriesBurned: number;
  distance?: number; // km for running/walking
  loggedAt: string;
  source: "manual" | "health_kit" | "google_fit" | "garmin";
}

export interface WeightLog {
  id: string;
  userId: string;
  weight: number; // kg
  bodyFat?: number; // percentage
  loggedAt: string;
  notes?: string;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  caloriesConsumed: number;
  caloriesBurned: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  adherenceScore: number; // 0-3
  netCaloriePercentage: number;
  exerciseMet: boolean;
}

export interface TaiwanFoodEquiv {
  name: string;
  nameZh: string;
  kcalPerServing: number;
  carbG: number;
  proteinG: number;
  fatG: number;
  servingNameZh: string;
}

export interface AIAdvice {
  id: string;
  context: "progress" | "overeating" | "meal_suggestion" | "weekly_review";
  message: string;
  suggestions: string[];
  timestamp: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: "monthly" | "yearly" | null;
  expiresAt?: string;
  isTrialActive: boolean;
  trialExpiresAt?: string;
}

export interface AppSettings {
  language: "zh" | "en";
  darkMode: boolean;
  notificationsEnabled: boolean;
  reminderTime: string; // HH:MM
  units: "metric" | "imperial";
}

export interface ExerciseItem {
  id: string;
  name: string;
  nameZh: string;
  type: "cardio" | "strength" | "flexibility" | "sports";
  duration?: number; // minutes for cardio
  sets?: number; // for strength
  reps?: number; // for strength
  metValue: number;
  instructions?: string;
  instructionsZh?: string;
  equipment?: string[];
  targetMuscles?: string[];
}

export interface ExercisePlan {
  id: string;
  name: string;
  nameZh: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number; // total minutes
  exercises: ExerciseItem[];
  totalCaloriesBurn: number; // estimated for 70kg person
  equipment: string[];
  targetAreas: string[];
  description?: string;
  descriptionZh?: string;
}

export interface ExerciseRecommendation {
  id: string;
  planId: string;
  plan: ExercisePlan;
  reason: string;
  reasonZh: string;
  priority: number; // 1-5, higher is more recommended
  estimatedCaloriesBurn: number; // personalized for user's weight
}
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FoodLog, FoodItem, TaiwanFoodEquiv } from "../types";

interface FoodState {
  foodLogs: FoodLog[];
  favoriteFood: FoodItem[];
  taiwanFoodEquivs: TaiwanFoodEquiv[];
  
  // Actions
  addFoodLog: (foodLog: Omit<FoodLog, "id">) => void;
  updateFoodLog: (id: string, updates: Partial<FoodLog>) => void;
  deleteFoodLog: (id: string) => void;
  addFavoriteFood: (food: FoodItem) => void;
  removeFavoriteFood: (foodId: string) => void;
  
  // Computed values
  getTodayLogs: () => FoodLog[];
  getTodayCalories: () => number;
  getTodayMacros: () => { protein: number; carbs: number; fat: number };
  getLogsByDate: (date: string) => FoodLog[];
}

// Taiwan food equivalents for calorie suggestions
const defaultTaiwanFoodEquivs: TaiwanFoodEquiv[] = [
  {
    name: "White Rice",
    nameZh: "白飯",
    kcalPerServing: 240,
    carbG: 53,
    proteinG: 4,
    fatG: 0,
    servingNameZh: "1 碗飯"
  },
  {
    name: "Half Bowl Rice",
    nameZh: "半碗飯",
    kcalPerServing: 120,
    carbG: 26,
    proteinG: 2,
    fatG: 0,
    servingNameZh: "半碗飯"
  },
  {
    name: "Chicken Breast",
    nameZh: "雞胸肉",
    kcalPerServing: 165,
    carbG: 0,
    proteinG: 31,
    fatG: 3.6,
    servingNameZh: "雞胸 1 份"
  },
  {
    name: "Fish Fillet",
    nameZh: "魚排",
    kcalPerServing: 200,
    carbG: 0,
    proteinG: 25,
    fatG: 9,
    servingNameZh: "魚排 1 份"
  },
  {
    name: "Braised Egg",
    nameZh: "滷蛋",
    kcalPerServing: 80,
    carbG: 1,
    proteinG: 6,
    fatG: 5,
    servingNameZh: "滷蛋 1 顆"
  },
  {
    name: "Tofu",
    nameZh: "豆腐",
    kcalPerServing: 80,
    carbG: 2,
    proteinG: 8,
    fatG: 4,
    servingNameZh: "豆腐 1 份"
  },
  {
    name: "Sweet Potato",
    nameZh: "地瓜",
    kcalPerServing: 180,
    carbG: 41,
    proteinG: 2,
    fatG: 0,
    servingNameZh: "地瓜 1 根"
  },
  {
    name: "Noodle Soup",
    nameZh: "麵線",
    kcalPerServing: 360,
    carbG: 70,
    proteinG: 12,
    fatG: 2,
    servingNameZh: "麵線 1 碗"
  },
  {
    name: "Mixed Nuts",
    nameZh: "堅果",
    kcalPerServing: 170,
    carbG: 6,
    proteinG: 5,
    fatG: 15,
    servingNameZh: "堅果 一小把"
  },
  {
    name: "Light Bento",
    nameZh: "清爽便當",
    kcalPerServing: 800,
    carbG: 90,
    proteinG: 35,
    fatG: 25,
    servingNameZh: "1 個便當"
  }
];

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 11);

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD
};

export const useFoodStore = create<FoodState>()(
  persist(
    (set, get) => ({
      foodLogs: [],
      favoriteFood: [],
      taiwanFoodEquivs: defaultTaiwanFoodEquivs,
      
      addFoodLog: (foodLog) => {
        const newLog: FoodLog = {
          ...foodLog,
          id: generateId(),
        };
        set((state) => ({
          foodLogs: [...state.foodLogs, newLog]
        }));
      },
      
      updateFoodLog: (id, updates) => {
        set((state) => ({
          foodLogs: state.foodLogs.map(log => 
            log.id === id ? { ...log, ...updates } : log
          )
        }));
      },
      
      deleteFoodLog: (id) => {
        set((state) => ({
          foodLogs: state.foodLogs.filter(log => log.id !== id)
        }));
      },
      
      addFavoriteFood: (food) => {
        set((state) => ({
          favoriteFood: [...state.favoriteFood, food]
        }));
      },
      
      removeFavoriteFood: (foodId) => {
        set((state) => ({
          favoriteFood: state.favoriteFood.filter(food => food.id !== foodId)
        }));
      },
      
      getTodayLogs: () => {
        const today = getTodayDateString();
        return get().foodLogs.filter(log => 
          log.loggedAt.startsWith(today)
        );
      },
      
      getTodayCalories: () => {
        const todayLogs = get().getTodayLogs();
        return todayLogs.reduce((total, log) => total + log.calories, 0);
      },
      
      getTodayMacros: () => {
        const todayLogs = get().getTodayLogs();
        return todayLogs.reduce(
          (totals, log) => ({
            protein: totals.protein + log.protein,
            carbs: totals.carbs + log.carbs,
            fat: totals.fat + log.fat,
          }),
          { protein: 0, carbs: 0, fat: 0 }
        );
      },
      
      getLogsByDate: (date) => {
        return get().foodLogs.filter(log => 
          log.loggedAt.startsWith(date)
        );
      },
    }),
    {
      name: "food-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
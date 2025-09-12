import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ExerciseLog } from "../types";

interface ExerciseState {
  exerciseLogs: ExerciseLog[];
  
  // Actions
  addExerciseLog: (exerciseLog: Omit<ExerciseLog, "id">) => void;
  updateExerciseLog: (id: string, updates: Partial<ExerciseLog>) => void;
  deleteExerciseLog: (id: string) => void;
  
  // Computed values
  getTodayLogs: () => ExerciseLog[];
  getTodayCaloriesBurned: () => number;
  getLogsByDate: (date: string) => ExerciseLog[];
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 11);

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD
};

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      exerciseLogs: [],
      
      addExerciseLog: (exerciseLog) => {
        const newLog: ExerciseLog = {
          ...exerciseLog,
          id: generateId(),
        };
        set((state) => ({
          exerciseLogs: [...state.exerciseLogs, newLog]
        }));
      },
      
      updateExerciseLog: (id, updates) => {
        set((state) => ({
          exerciseLogs: state.exerciseLogs.map(log => 
            log.id === id ? { ...log, ...updates } : log
          )
        }));
      },
      
      deleteExerciseLog: (id) => {
        set((state) => ({
          exerciseLogs: state.exerciseLogs.filter(log => log.id !== id)
        }));
      },
      
      getTodayLogs: () => {
        const today = getTodayDateString();
        return get().exerciseLogs.filter(log => 
          log.loggedAt.startsWith(today)
        );
      },
      
      getTodayCaloriesBurned: () => {
        const todayLogs = get().getTodayLogs();
        return todayLogs.reduce((total, log) => total + log.caloriesBurned, 0);
      },
      
      getLogsByDate: (date) => {
        return get().exerciseLogs.filter(log => 
          log.loggedAt.startsWith(date)
        );
      },
    }),
    {
      name: "exercise-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
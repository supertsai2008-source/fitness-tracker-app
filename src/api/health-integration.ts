import { Alert } from "react-native";
import * as Device from "expo-device";
import { ExerciseLog, WeightLog } from "../types";

// Health integration service for Apple Health and Google Fit
export interface HealthData {
  weight?: number;
  bodyFat?: number;
  steps?: number;
  activeCalories?: number;
  workouts?: {
    type: string;
    duration: number; // minutes
    calories: number;
    startTime: string;
    endTime: string;
  }[];
}

export interface HealthIntegrationService {
  requestPermissions: () => Promise<boolean>;
  isAvailable: () => Promise<boolean>;
  syncWeightData: () => Promise<WeightLog[]>;
  syncExerciseData: () => Promise<ExerciseLog[]>;
  writeWeightData: (weight: number, bodyFat?: number) => Promise<boolean>;
  writeExerciseData: (exercise: ExerciseLog) => Promise<boolean>;
}

// Mock implementation for development
class MockHealthService implements HealthIntegrationService {
  private hasPermissions = false;

  async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        "健康數據同步",
        "是否允許存取健康數據？\n\n• 體重和體脂率\n• 運動和活動數據\n• 消耗的卡路里",
        [
          { 
            text: "拒絕", 
            style: "cancel",
            onPress: () => {
              this.hasPermissions = false;
              resolve(false);
            }
          },
          { 
            text: "允許", 
            onPress: () => {
              this.hasPermissions = true;
              resolve(true);
            }
          }
        ]
      );
    });
  }

  async isAvailable(): Promise<boolean> {
    // Check if device supports health integration
    return Device.osName === "iOS" || Device.osName === "Android";
  }

  async syncWeightData(): Promise<WeightLog[]> {
    if (!this.hasPermissions) return [];
    
    // Mock weight data from the last 7 days
    const mockWeightLogs: WeightLog[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate realistic weight data with small variations
      const baseWeight = 70 + Math.random() * 20; // 70-90kg range
      const weight = parseFloat((baseWeight + (Math.random() - 0.5) * 2).toFixed(1));
      const bodyFat = Math.random() > 0.5 ? parseFloat((15 + Math.random() * 15).toFixed(1)) : undefined;
      
      mockWeightLogs.push({
        id: `health_weight_${date.getTime()}`,
        userId: "current_user",
        weight,
        bodyFat,
        loggedAt: date.toISOString(),
        notes: "從健康應用程式同步",
      });
    }
    
    return mockWeightLogs;
  }

  async syncExerciseData(): Promise<ExerciseLog[]> {
    if (!this.hasPermissions) return [];
    
    // Mock exercise data from the last 3 days
    const mockExerciseLogs: ExerciseLog[] = [];
    const today = new Date();
    
    const exerciseTypes = [
      { type: "walking", name: "步行", metValue: 4.0 },
      { type: "running", name: "跑步", metValue: 9.8 },
      { type: "cycling", name: "騎車", metValue: 7.5 },
      { type: "swimming", name: "游泳", metValue: 8.0 },
    ];
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random number of exercises per day (0-2)
      const exerciseCount = Math.floor(Math.random() * 3);
      
      for (let j = 0; j < exerciseCount; j++) {
        const exercise = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
        const duration = 20 + Math.random() * 40; // 20-60 minutes
        const caloriesBurned = Math.round(duration * exercise.metValue * 0.8); // Rough calculation
        
        mockExerciseLogs.push({
          id: `health_exercise_${date.getTime()}_${j}`,
          userId: "current_user",
          type: exercise.type,
          name: exercise.name,
          duration: Math.round(duration),
          caloriesBurned,
          distance: exercise.type === "walking" || exercise.type === "running" ? 
            parseFloat((duration * 0.1).toFixed(1)) : undefined, // Rough distance calculation
          loggedAt: date.toISOString(),
          source: Device.osName === "iOS" ? "health_kit" : "google_fit",
        });
      }
    }
    
    return mockExerciseLogs;
  }

  async writeWeightData(weight: number, bodyFat?: number): Promise<boolean> {
    if (!this.hasPermissions) return false;
    
    // Simulate writing to health app
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Writing to health app: Weight ${weight}kg${bodyFat ? `, Body Fat ${bodyFat}%` : ""}`);
    return true;
  }

  async writeExerciseData(exercise: ExerciseLog): Promise<boolean> {
    if (!this.hasPermissions) return false;
    
    // Simulate writing to health app
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Writing to health app: ${exercise.name} for ${exercise.duration} minutes, ${exercise.caloriesBurned} calories`);
    return true;
  }
}

// Production implementation would use actual health APIs
class AppleHealthService implements HealthIntegrationService {
  async requestPermissions(): Promise<boolean> {
    // In production, this would use react-native-health or similar
    Alert.alert("功能開發中", "Apple Health 整合功能即將推出");
    return false;
  }

  async isAvailable(): Promise<boolean> {
    return Device.osName === "iOS";
  }

  async syncWeightData(): Promise<WeightLog[]> {
    return [];
  }

  async syncExerciseData(): Promise<ExerciseLog[]> {
    return [];
  }

  async writeWeightData(): Promise<boolean> {
    return false;
  }

  async writeExerciseData(): Promise<boolean> {
    return false;
  }
}

class GoogleFitService implements HealthIntegrationService {
  async requestPermissions(): Promise<boolean> {
    // In production, this would use react-native-google-fit or similar
    Alert.alert("功能開發中", "Google Fit 整合功能即將推出");
    return false;
  }

  async isAvailable(): Promise<boolean> {
    return Device.osName === "Android";
  }

  async syncWeightData(): Promise<WeightLog[]> {
    return [];
  }

  async syncExerciseData(): Promise<ExerciseLog[]> {
    return [];
  }

  async writeWeightData(): Promise<boolean> {
    return false;
  }

  async writeExerciseData(): Promise<boolean> {
    return false;
  }
}

// Factory function to get the appropriate health service
export const getHealthService = (): HealthIntegrationService => {
  // For development, always return mock service
  if (__DEV__) {
    return new MockHealthService();
  }
  
  // In production, return platform-specific service
  if (Device.osName === "iOS") {
    return new AppleHealthService();
  } else if (Device.osName === "Android") {
    return new GoogleFitService();
  } else {
    return new MockHealthService();
  }
};

// Convenience functions
export const requestHealthPermissions = async (): Promise<boolean> => {
  const service = getHealthService();
  return await service.requestPermissions();
};

export const syncHealthData = async (): Promise<{
  weightLogs: WeightLog[];
  exerciseLogs: ExerciseLog[];
}> => {
  const service = getHealthService();
  
  const [weightLogs, exerciseLogs] = await Promise.all([
    service.syncWeightData(),
    service.syncExerciseData(),
  ]);
  
  return { weightLogs, exerciseLogs };
};

export const writeHealthData = async (data: {
  weight?: { value: number; bodyFat?: number };
  exercise?: ExerciseLog;
}): Promise<{ weightSuccess: boolean; exerciseSuccess: boolean }> => {
  const service = getHealthService();
  
  let weightSuccess = true;
  let exerciseSuccess = true;
  
  if (data.weight) {
    weightSuccess = await service.writeWeightData(data.weight.value, data.weight.bodyFat);
  }
  
  if (data.exercise) {
    exerciseSuccess = await service.writeExerciseData(data.exercise);
  }
  
  return { weightSuccess, exerciseSuccess };
};
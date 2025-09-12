import { ExercisePlan, ExerciseItem } from "../types";

// Exercise database with MET values and instructions
export const exerciseItems: ExerciseItem[] = [
  // Cardio exercises
  {
    id: "walking_light",
    name: "Light Walking",
    nameZh: "輕鬆散步",
    type: "cardio",
    duration: 30,
    metValue: 3.5,
    instructions: "Walk at a comfortable pace, maintain steady breathing",
    instructionsZh: "以舒適的步調行走，保持穩定呼吸",
    equipment: [],
    targetMuscles: ["legs", "core"],
  },
  {
    id: "walking_brisk",
    name: "Brisk Walking",
    nameZh: "快走",
    type: "cardio",
    duration: 30,
    metValue: 4.0,
    instructions: "Walk at a fast pace, pump your arms",
    instructionsZh: "快步行走，擺動手臂",
    equipment: [],
    targetMuscles: ["legs", "core", "arms"],
  },
  {
    id: "jogging",
    name: "Jogging",
    nameZh: "慢跑",
    type: "cardio",
    duration: 25,
    metValue: 7.0,
    instructions: "Maintain steady pace, land on midfoot",
    instructionsZh: "保持穩定節奏，用腳掌中部著地",
    equipment: [],
    targetMuscles: ["legs", "core", "cardiovascular"],
  },
  {
    id: "running",
    name: "Running",
    nameZh: "跑步",
    type: "cardio",
    duration: 20,
    metValue: 9.8,
    instructions: "Run at moderate to high intensity",
    instructionsZh: "以中高強度跑步",
    equipment: [],
    targetMuscles: ["legs", "core", "cardiovascular"],
  },
  {
    id: "cycling_light",
    name: "Light Cycling",
    nameZh: "輕鬆騎車",
    type: "cardio",
    duration: 30,
    metValue: 6.0,
    instructions: "Cycle at comfortable pace on flat terrain",
    instructionsZh: "在平地以舒適速度騎車",
    equipment: ["bicycle"],
    targetMuscles: ["legs", "core"],
  },
  {
    id: "swimming",
    name: "Swimming",
    nameZh: "游泳",
    type: "cardio",
    duration: 30,
    metValue: 8.0,
    instructions: "Swim at moderate pace, focus on technique",
    instructionsZh: "以中等速度游泳，注重技巧",
    equipment: ["pool"],
    targetMuscles: ["full_body", "cardiovascular"],
  },

  // Strength exercises
  {
    id: "pushups",
    name: "Push-ups",
    nameZh: "伏地挺身",
    type: "strength",
    sets: 3,
    reps: 12,
    metValue: 3.8,
    instructions: "Keep body straight, lower chest to ground",
    instructionsZh: "保持身體挺直，胸部下降至地面",
    equipment: [],
    targetMuscles: ["chest", "arms", "core"],
  },
  {
    id: "squats",
    name: "Squats",
    nameZh: "深蹲",
    type: "strength",
    sets: 3,
    reps: 15,
    metValue: 5.0,
    instructions: "Keep knees behind toes, lower until thighs parallel",
    instructionsZh: "膝蓋不超過腳尖，下蹲至大腿平行",
    equipment: [],
    targetMuscles: ["legs", "glutes", "core"],
  },
  {
    id: "lunges",
    name: "Lunges",
    nameZh: "弓箭步",
    type: "strength",
    sets: 3,
    reps: 12,
    metValue: 4.0,
    instructions: "Step forward, lower back knee toward ground",
    instructionsZh: "向前跨步，後膝蓋向地面下降",
    equipment: [],
    targetMuscles: ["legs", "glutes", "core"],
  },
  {
    id: "plank",
    name: "Plank",
    nameZh: "棒式",
    type: "strength",
    duration: 60,
    metValue: 3.5,
    instructions: "Hold straight body position, engage core",
    instructionsZh: "保持身體挺直，收緊核心",
    equipment: [],
    targetMuscles: ["core", "shoulders"],
  },
  {
    id: "burpees",
    name: "Burpees",
    nameZh: "波比跳",
    type: "strength",
    sets: 3,
    reps: 10,
    metValue: 8.0,
    instructions: "Squat, jump back, push-up, jump forward, jump up",
    instructionsZh: "深蹲、向後跳、伏地挺身、向前跳、跳起",
    equipment: [],
    targetMuscles: ["full_body", "cardiovascular"],
  },

  // Flexibility exercises
  {
    id: "yoga_basic",
    name: "Basic Yoga",
    nameZh: "基礎瑜珈",
    type: "flexibility",
    duration: 20,
    metValue: 2.5,
    instructions: "Focus on breathing and gentle stretching",
    instructionsZh: "專注於呼吸和溫和伸展",
    equipment: ["yoga_mat"],
    targetMuscles: ["full_body", "flexibility"],
  },
  {
    id: "stretching",
    name: "Stretching",
    nameZh: "伸展運動",
    type: "flexibility",
    duration: 15,
    metValue: 2.3,
    instructions: "Hold each stretch for 30 seconds",
    instructionsZh: "每個伸展動作保持30秒",
    equipment: [],
    targetMuscles: ["full_body", "flexibility"],
  },
];

// Pre-defined exercise plans for different fitness levels
export const exercisePlans: ExercisePlan[] = [
  // Beginner plans
  {
    id: "beginner_walk",
    name: "Beginner Walking Plan",
    nameZh: "初學者散步計畫",
    difficulty: "beginner",
    duration: 30,
    exercises: [
      exerciseItems.find(e => e.id === "walking_light")!,
      exerciseItems.find(e => e.id === "stretching")!,
    ],
    totalCaloriesBurn: 150, // for 70kg person
    equipment: [],
    targetAreas: ["cardiovascular", "legs"],
    description: "Perfect for beginners starting their fitness journey",
    descriptionZh: "適合剛開始健身旅程的初學者",
  },
  {
    id: "beginner_bodyweight",
    name: "Beginner Bodyweight Workout",
    nameZh: "初學者徒手訓練",
    difficulty: "beginner",
    duration: 25,
    exercises: [
      exerciseItems.find(e => e.id === "squats")!,
      exerciseItems.find(e => e.id === "pushups")!,
      exerciseItems.find(e => e.id === "plank")!,
      exerciseItems.find(e => e.id === "stretching")!,
    ],
    totalCaloriesBurn: 120,
    equipment: [],
    targetAreas: ["strength", "core"],
    description: "Build basic strength with bodyweight exercises",
    descriptionZh: "用徒手運動建立基礎力量",
  },

  // Intermediate plans
  {
    id: "intermediate_cardio",
    name: "Intermediate Cardio Mix",
    nameZh: "中級有氧混合訓練",
    difficulty: "intermediate",
    duration: 35,
    exercises: [
      exerciseItems.find(e => e.id === "jogging")!,
      exerciseItems.find(e => e.id === "burpees")!,
      exerciseItems.find(e => e.id === "stretching")!,
    ],
    totalCaloriesBurn: 280,
    equipment: [],
    targetAreas: ["cardiovascular", "full_body"],
    description: "Boost your cardio fitness with varied exercises",
    descriptionZh: "透過多樣化運動提升心肺功能",
  },
  {
    id: "intermediate_strength",
    name: "Intermediate Strength Training",
    nameZh: "中級力量訓練",
    difficulty: "intermediate",
    duration: 40,
    exercises: [
      exerciseItems.find(e => e.id === "squats")!,
      exerciseItems.find(e => e.id === "pushups")!,
      exerciseItems.find(e => e.id === "lunges")!,
      exerciseItems.find(e => e.id === "plank")!,
      exerciseItems.find(e => e.id === "burpees")!,
      exerciseItems.find(e => e.id === "stretching")!,
    ],
    totalCaloriesBurn: 220,
    equipment: [],
    targetAreas: ["strength", "muscle_building"],
    description: "Build muscle and strength with compound movements",
    descriptionZh: "透過複合動作建立肌肉和力量",
  },

  // Advanced plans
  {
    id: "advanced_hiit",
    name: "Advanced HIIT Workout",
    nameZh: "高級高強度間歇訓練",
    difficulty: "advanced",
    duration: 30,
    exercises: [
      exerciseItems.find(e => e.id === "burpees")!,
      exerciseItems.find(e => e.id === "running")!,
      exerciseItems.find(e => e.id === "squats")!,
      exerciseItems.find(e => e.id === "pushups")!,
      exerciseItems.find(e => e.id === "stretching")!,
    ],
    totalCaloriesBurn: 350,
    equipment: [],
    targetAreas: ["cardiovascular", "fat_burning", "strength"],
    description: "High-intensity workout for maximum calorie burn",
    descriptionZh: "高強度訓練，最大化卡路里燃燒",
  },
  {
    id: "advanced_endurance",
    name: "Advanced Endurance Training",
    nameZh: "高級耐力訓練",
    difficulty: "advanced",
    duration: 45,
    exercises: [
      exerciseItems.find(e => e.id === "running")!,
      exerciseItems.find(e => e.id === "cycling_light")!,
      exerciseItems.find(e => e.id === "yoga_basic")!,
    ],
    totalCaloriesBurn: 400,
    equipment: ["bicycle"],
    targetAreas: ["endurance", "cardiovascular"],
    description: "Build endurance and cardiovascular fitness",
    descriptionZh: "建立耐力和心血管健康",
  },

  // Specialized plans
  {
    id: "quick_15min",
    name: "Quick 15-Minute Workout",
    nameZh: "快速15分鐘訓練",
    difficulty: "intermediate",
    duration: 15,
    exercises: [
      exerciseItems.find(e => e.id === "burpees")!,
      exerciseItems.find(e => e.id === "squats")!,
      exerciseItems.find(e => e.id === "pushups")!,
    ],
    totalCaloriesBurn: 120,
    equipment: [],
    targetAreas: ["time_efficient", "full_body"],
    description: "Perfect for busy schedules",
    descriptionZh: "適合忙碌的時間安排",
  },
  {
    id: "low_impact",
    name: "Low Impact Workout",
    nameZh: "低衝擊運動",
    difficulty: "beginner",
    duration: 30,
    exercises: [
      exerciseItems.find(e => e.id === "walking_brisk")!,
      exerciseItems.find(e => e.id === "yoga_basic")!,
      exerciseItems.find(e => e.id === "stretching")!,
    ],
    totalCaloriesBurn: 160,
    equipment: ["yoga_mat"],
    targetAreas: ["joint_friendly", "flexibility"],
    description: "Gentle on joints while still effective",
    descriptionZh: "對關節溫和但仍然有效",
  },
];

// Calculate personalized calorie burn based on user weight
export const calculatePersonalizedCalorieBurn = (
  plan: ExercisePlan,
  userWeight: number // in kg
): number => {
  // Base calculation is for 70kg person
  const baseWeight = 70;
  const weightFactor = userWeight / baseWeight;
  return Math.round(plan.totalCaloriesBurn * weightFactor);
};

// Get user's fitness level based on BMI and activity level
export const getUserFitnessLevel = (
  bmi: number,
  activityLevel: number
): "beginner" | "intermediate" | "advanced" => {
  if (bmi > 30 || activityLevel < 1.4) {
    return "beginner";
  } else if (bmi > 25 || activityLevel < 1.7) {
    return "intermediate";
  } else {
    return "advanced";
  }
};
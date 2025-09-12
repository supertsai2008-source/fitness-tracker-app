import React from "react";
import { View, Text } from "react-native";
import { TaiwanFoodEquiv } from "../types";

interface FoodEquivalentChipsProps {
  remainingCalories: number;
  macroGaps: {
    protein: number;
    carbs: number;
    fat: number;
  };
  taiwanFoodEquivs: TaiwanFoodEquiv[];
}

export default function FoodEquivalentChips({
  remainingCalories,
  macroGaps,
  taiwanFoodEquivs,
}: FoodEquivalentChipsProps) {
  
  const generateFoodSuggestions = (): string[] => {
    if (remainingCalories <= 0) return [];
    
    const suggestions: string[] = [];
    const tolerance = 80; // ±80 kcal tolerance
    
    // Priority logic based on macro gaps
    let priorityMacro = "balanced";
    if (macroGaps.protein >= 30) {
      priorityMacro = "protein";
    } else if (macroGaps.carbs >= 50) {
      priorityMacro = "carbs";
    } else if (macroGaps.fat >= 15) {
      priorityMacro = "fat";
    }
    
    // Filter foods based on priority
    let candidateFoods = taiwanFoodEquivs;
    
    if (priorityMacro === "protein") {
      candidateFoods = taiwanFoodEquivs.filter(food => food.proteinG >= 15);
    } else if (priorityMacro === "carbs") {
      candidateFoods = taiwanFoodEquivs.filter(food => food.carbG >= 30);
    } else if (priorityMacro === "fat") {
      candidateFoods = taiwanFoodEquivs.filter(food => food.fatG >= 10);
    }
    
    // Find single food that matches remaining calories
    const singleMatch = candidateFoods.find(food => 
      Math.abs(food.kcalPerServing - remainingCalories) <= tolerance
    );
    
    if (singleMatch) {
      suggestions.push(singleMatch.servingNameZh);
      return suggestions.slice(0, 2);
    }
    
    // Try two-food combination
    for (let i = 0; i < candidateFoods.length && suggestions.length < 2; i++) {
      const food1 = candidateFoods[i];
      const remaining = remainingCalories - food1.kcalPerServing;
      
      if (remaining > 0) {
        const food2 = candidateFoods.find(food => 
          Math.abs(food.kcalPerServing - remaining) <= tolerance
        );
        
        if (food2) {
          suggestions.push(food1.servingNameZh);
          suggestions.push(food2.servingNameZh);
          break;
        }
      }
    }
    
    // Fallback: closest single food
    if (suggestions.length === 0) {
      const closest = candidateFoods.reduce((prev, curr) => 
        Math.abs(curr.kcalPerServing - remainingCalories) < 
        Math.abs(prev.kcalPerServing - remainingCalories) ? curr : prev
      );
      suggestions.push(closest.servingNameZh);
    }
    
    return suggestions.slice(0, 2);
  };
  
  const suggestions = generateFoodSuggestions();
  
  if (suggestions.length === 0) {
    return null;
  }
  
  return (
    <View className="mt-4">
      <Text className="text-sm text-gray-600 mb-2">建議食物：</Text>
      <View className="flex-row flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <View 
            key={index}
            className="bg-gray-100 px-3 py-2 rounded-full"
          >
            <Text className="text-sm font-medium text-gray-800">
              {suggestion}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
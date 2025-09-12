import React, { useState } from "react";
import { View, TextInput, Pressable, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FoodItem } from "../types";
import { FOODS } from "../data/foods";

interface FoodSearchBarProps {
  onFoodSelect: (food: FoodItem) => void;
  placeholder?: string;
}

// Data source expanded with international chains
const mockFoodDatabase: FoodItem[] = FOODS;

export default function FoodSearchBar({ onFoodSelect, placeholder = "搜尋食物..." }: FoodSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("全部");
  
  const brands = ["全部", ...Array.from(new Set(mockFoodDatabase.map(f => f.brand).filter(Boolean) as string[]))].slice(0, 20);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    // Filter foods based on search query + brand
    const q = query.toLowerCase();
    const results = mockFoodDatabase.filter(food => {
      const hit = food.nameZh.toLowerCase().includes(q) || food.name.toLowerCase().includes(q) || (food.brand && food.brand.toLowerCase().includes(q));
      const brandOk = selectedBrand === "全部" || (food.brand === selectedBrand);
      return hit && brandOk;
    });
    
    setSearchResults(results);
    setShowResults(true);
  };
  
  const handleFoodSelect = (food: FoodItem) => {
    setSearchQuery("");
    setShowResults(false);
    onFoodSelect(food);
  };
  
  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <Pressable
      onPress={() => handleFoodSelect(item)}
      className="flex-row items-center p-4 border-b border-gray-100"
    >
      <View className="flex-1">
        <Text className="text-gray-900 font-medium">
          {item.nameZh}
          {item.brand && (
            <Text className="text-gray-500 text-sm"> • {item.brand}</Text>
          )}
        </Text>
         <Text className="text-gray-500 text-sm">
           {item.calories} kcal / {item.servingNameZh}{item.sizeOptions && item.sizeOptions.length>0 ? `（${(item.sizeOptions.map(s=> s.zh || s.label)).join("/")}）` : ""}
         </Text>
        <Text className="text-gray-400 text-xs">
          蛋白質 {item.protein}g • 碳水 {item.carbs}g • 脂肪 {item.fat}g
        </Text>
      </View>
      <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
    </Pressable>
  );
  
  return (
    <View className="relative">
      {/* Brand filter */}
      <View className="mb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row items-center">
            {brands.map((b) => (
              <Pressable key={b} onPress={() => { setSelectedBrand(b); handleSearch(searchQuery); }} className={`px-3 py-1 rounded-full mr-2 border ${selectedBrand===b?"bg-black border-black":"border-gray-300"}`}>
                <Text className={`${selectedBrand===b?"text-white":"text-gray-700"} text-xs`}>{b}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Search Input */}
      <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder={placeholder}
          className="flex-1 ml-3 text-gray-900"
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </Pressable>
        )}
      </View>
      
      {/* Search Results */}
      {showResults && (
        <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 z-10">
          {searchResults.length > 0 ? (
            <ScrollView style={{ maxHeight: 256 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {searchResults.map((item) => (
                <View key={item.id}>{renderFoodItem({ item })}</View>
              ))}
            </ScrollView>
          ) : (
            <View className="p-4 items-center">
              <Ionicons name="search" size={32} color="#D1D5DB" />
              <Text className="text-gray-500 mt-2">找不到相關食物</Text>
              <Text className="text-gray-400 text-sm">試試其他關鍵字或使用拍照功能</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
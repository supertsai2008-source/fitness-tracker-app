import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BrandLogoProps {
  variant?: "circular" | "square";
  size?: "small" | "medium" | "large";
  showText?: boolean;
  color?: string;
  textColor?: string;
}

const sizeMap = {
  small: { icon: 20, container: 32, text: 12 },
  medium: { icon: 32, container: 56, text: 16 },
  large: { icon: 48, container: 80, text: 20 },
};

export default function BrandLogo({
  variant = "circular",
  size = "medium",
  showText = false,
  color = "#000000",
  textColor = "#000000",
}: BrandLogoProps) {
  const dimensions = sizeMap[size];
  
  const containerStyle = variant === "circular" 
    ? {
        width: dimensions.container,
        height: dimensions.container,
        borderRadius: dimensions.container / 2,
        backgroundColor: color === "#000000" ? "#F3F4F6" : "#FFFFFF",
        borderWidth: 2,
        borderColor: color,
      }
    : {
        width: dimensions.container,
        height: dimensions.container,
        borderRadius: 8,
        backgroundColor: color === "#000000" ? "#F3F4F6" : "#FFFFFF",
        borderWidth: 2,
        borderColor: color,
      };

  return (
    <View className="items-center">
      <View 
        style={containerStyle}
        className="items-center justify-center"
      >
        <Ionicons 
          name="restaurant" 
          size={dimensions.icon} 
          color={color} 
        />
      </View>
      
      {showText && (
        <Text 
          style={{ 
            fontSize: dimensions.text,
            color: textColor,
            marginTop: 8,
            fontWeight: "600",
          }}
        >
          減脂追蹤
        </Text>
      )}
    </View>
  );
}
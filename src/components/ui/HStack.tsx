import React from "react";
import { View, ViewProps } from "react-native";
import { cn } from "../../utils/cn";

interface HStackProps extends ViewProps {
  spacing?: number;
  children: React.ReactNode;
}

export default function HStack({ spacing = 3, children, className, ...props }: HStackProps) {
  const spacingClass = `mr-${spacing}`;
  
  return (
    <View className={cn("flex-row", className)} {...props}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const isLast = index === React.Children.count(children) - 1;
        const childProps = child.props as any;
        const childClassName = isLast ? childProps.className : cn(childProps.className, spacingClass);
        
        return React.cloneElement(child, {
          ...childProps,
          className: childClassName,
        });
      })}
    </View>
  );
}
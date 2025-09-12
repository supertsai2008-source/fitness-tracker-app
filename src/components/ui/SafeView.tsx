import React from "react";
import { View, Text, ViewProps } from "react-native";

function sanitize(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children as any, (child: any) => {
    if (child === null || child === undefined || typeof child === "boolean") return null;
    if (typeof child === "string" || typeof child === "number") {
      return <Text>{String(child)}</Text>;
    }
    if (React.isValidElement(child) && (child as any).props && (child as any).props.children !== undefined) {
      return React.cloneElement(child as any, {
        children: sanitize((child as any).props.children),
      } as any);
    }
    return child;
  });
}

export default function SafeView({ children, ...rest }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View {...rest}>
      {sanitize(children)}
    </View>
  );
}

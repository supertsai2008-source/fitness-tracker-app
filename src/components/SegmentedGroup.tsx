import React from "react";
import { View } from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

interface Segment {
  label: string;
  value: string;
}

interface SegmentedGroupProps {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
  testID?: string;
}

export default function SegmentedGroup({ segments, value, onChange, testID }: SegmentedGroupProps) {
  const selectedIndex = Math.max(0, segments.findIndex(s => s.value === value));

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-2">
      <SegmentedControl
        testID={testID}
        values={segments.map(s => s.label)}
        selectedIndex={selectedIndex}
        onChange={(event) => {
          const idx = event.nativeEvent.selectedSegmentIndex;
          const selected = segments[idx];
          if (selected) onChange(selected.value);
        }}
        appearance="dark"
        style={{ height: 36 }}
      />

    </View>
  );
}

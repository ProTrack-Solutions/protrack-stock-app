import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BrandColor } from "@/constants/theme";

type OptionChipsProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: string;
  onChange: (value: T) => void;
};

export function OptionChips<T extends string>({ options, value, onChange }: OptionChipsProps<T>) {
  return (
    <View className="flex-row flex-wrap gap-two">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className="min-w-12 items-center rounded-two px-three py-three active:opacity-70"
            style={{
              borderWidth: 1,
              borderColor: selected ? BrandColor : "#E0E1E6",
              backgroundColor: selected ? "#EEF5FF" : "#ffffff",
            }}
          >
            <ThemedText type="smallBold" style={selected ? { color: BrandColor } : undefined}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

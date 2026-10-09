import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

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
            className={`min-w-12 items-center rounded-two border px-three py-three active:opacity-70 ${
              selected ? "border-brand bg-brand-soft" : "border-line bg-paper"
            }`}
          >
            <ThemedText type="smallBold" className={selected ? "text-brand" : undefined}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

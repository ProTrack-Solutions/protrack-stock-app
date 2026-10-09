import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className="flex-row items-center gap-two self-start active:opacity-70"
      hitSlop={6}
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-one border-[1.5px] ${
          checked ? "border-brand bg-brand" : "border-placeholder bg-paper"
        }`}
      >
        {checked && <Ionicons name="checkmark" size={14} color="#ffffff" />}
      </View>
      <ThemedText type="small">{label}</ThemedText>
    </Pressable>
  );
}

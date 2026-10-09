import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

type QuantityStepperProps = {
  value: string;
  onChangeText: (text: string) => void;
  unit: string;
};

const MAX_QUANTITY = 2_147_483_647; // int32 da API

export function QuantityStepper({ value, onChangeText, unit }: QuantityStepperProps) {
  const quantity = parseInt(value, 10) || 0;
  const step = (delta: number) =>
    onChangeText(String(Math.min(Math.max(quantity + delta, 0), MAX_QUANTITY)));

  return (
    <View className="flex-row gap-two">
      <StepButton icon="remove" label="Diminuir" disabled={quantity <= 0} onPress={() => step(-1)} />
      <View
        className="flex-1 flex-row items-center rounded-two bg-[#F6F7F9] px-three"
        style={{ borderWidth: 1, borderColor: "#E0E1E6" }}
      >
        <TextInput
          value={value}
          onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, "").slice(0, 10))}
          keyboardType="number-pad"
          selectTextOnFocus
          placeholder="0"
          placeholderTextColor="#8B8D98"
          className="flex-1 py-three text-center text-base font-bold text-ink"
          accessibilityLabel="Quantidade em estoque"
        />
        <ThemedText type="small" className="text-xs" style={{ color: "#5B6B8C" }}>
          {unit}
        </ThemedText>
      </View>
      <StepButton icon="add" label="Aumentar" onPress={() => step(1)} />
    </View>
  );
}

function StepButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`w-12 items-center justify-center rounded-two bg-paper active:bg-surface ${disabled ? "opacity-40" : ""}`}
      style={{ borderWidth: 1, borderColor: "#E0E1E6" }}
    >
      <Ionicons name={icon} size={20} color="#000000" />
    </Pressable>
  );
}

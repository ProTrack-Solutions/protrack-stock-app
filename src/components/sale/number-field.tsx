import { Ionicons } from "@expo/vector-icons";
import { TextInput, View } from "react-native";

import { FieldLabel } from "@/components/sale/section-card";
import { ThemedText } from "@/components/themed-text";

type NumberFieldProps = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  /** Aceita casas decimais (vírgula ou ponto). */
  decimal?: boolean;
  placeholder?: string;
  error?: string;
  className?: string;
};

export function NumberField({
  label,
  icon,
  value,
  onChangeText,
  decimal = false,
  placeholder = "0",
  error,
  className,
}: NumberFieldProps) {
  return (
    <View className={["gap-two", className].filter(Boolean).join(" ")}>
      <View className="flex-row items-center gap-one">
        {icon && <Ionicons name={icon} size={14} color="#60646C" />}
        <FieldLabel>{label}</FieldLabel>
      </View>
      <TextInput
        value={value}
        onChangeText={(t) => onChangeText(t.replace(decimal ? /[^0-9.,]/g : /[^0-9]/g, ""))}
        keyboardType={decimal ? "decimal-pad" : "number-pad"}
        placeholder={placeholder}
        placeholderTextColor="#60646C"
        selectTextOnFocus
        className="rounded-two bg-paper px-three py-three text-base text-ink"
        style={{ borderWidth: 1, borderColor: error ? "#DC2626" : "#E0E1E6" }}
      />
      {error && (
        <ThemedText type="small" className="text-xs" style={{ color: "#DC2626" }}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

/** "12,5" -> 12.5; texto vazio ou inválido -> 0. */
export function parseNumber(text: string) {
  const parsed = parseFloat(text.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

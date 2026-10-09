import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { ThemedText } from "@/components/themed-text";

export const INPUT_BORDER = "#E0E1E6";
export const ERROR_COLOR = "#DC2626";

type FieldLabelProps = {
  label: string;
  required?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function FormLabel({ label, required, icon }: FieldLabelProps) {
  return (
    <View className="flex-row items-center gap-one">
      {icon && <Ionicons name={icon} size={14} color="#000000" />}
      <ThemedText type="smallBold">
        {label}
        {required && <ThemedText type="smallBold" style={{ color: "#F43F5E" }}> *</ThemedText>}
      </ThemedText>
    </View>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <ThemedText type="small" className="text-xs" style={{ color: ERROR_COLOR }}>
      {message}
    </ThemedText>
  );
}

type FormInputProps = TextInputProps & {
  error?: string;
  /** Texto fixo à esquerda do campo, ex: "R$". */
  prefix?: string;
  /** Texto fixo à direita do campo, ex: "un". */
  suffix?: ReactNode;
};

export function FormInput({ error, prefix, suffix, editable = true, multiline, className, ...inputProps }: FormInputProps) {
  return (
    <View
      className={`flex-row gap-two rounded-two px-three ${multiline ? "items-start py-three" : "items-center"} ${
        editable ? "bg-[#F6F7F9]" : "bg-surface opacity-60"
      }`}
      style={{ borderWidth: 1, borderColor: error ? ERROR_COLOR : INPUT_BORDER }}
    >
      {prefix && (
        <ThemedText type="small" themeColor="textSecondary">
          {prefix}
        </ThemedText>
      )}
      <TextInput
        placeholderTextColor="#8B8D98"
        editable={editable}
        multiline={multiline}
        className={["flex-1 text-base text-ink", multiline ? "min-h-16" : "py-three", className]
          .filter(Boolean)
          .join(" ")}
        style={multiline ? { textAlignVertical: "top" } : undefined}
        {...inputProps}
      />
      {suffix}
    </View>
  );
}

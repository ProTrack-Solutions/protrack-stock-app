import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { ThemedText } from "@/components/themed-text";

/** Cor do placeholder (`placeholderTextColor` não aceita classe). Igual ao token `placeholder`. */
export const PLACEHOLDER_COLOR = "#8B8D98";

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
        {required && <ThemedText className="text-rose-500" type="smallBold"> *</ThemedText>}
      </ThemedText>
    </View>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <ThemedText type="small" className="text-xs text-danger">
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
        editable ? "bg-field" : "bg-surface opacity-60"
      } border ${error ? "border-danger" : "border-line"}`}
    >
      {prefix && (
        <ThemedText type="small" themeColor="textSecondary">
          {prefix}
        </ThemedText>
      )}
      <TextInput
        placeholderTextColor={PLACEHOLDER_COLOR}
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

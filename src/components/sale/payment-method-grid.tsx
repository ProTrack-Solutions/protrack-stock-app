import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { PaymentMethod } from "@/interfaces/sale.interface";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; color: string }[] = [
  { value: "cash", label: "Dinheiro", color: "#10B981" },
  { value: "pix", label: "Pix", color: "#14B8A6" },
  { value: "credit_card", label: "Cartão de Crédito", color: "#2563EB" },
  { value: "debit_card", label: "Cartão de Débito", color: "#0EA5E9" },
  { value: "bank_transfer", label: "Transferência", color: "#4F46E5" },
  { value: "installments", label: "Crediário", color: "#F59E0B" },
  { value: "other", label: "Outro", color: "#6B7280" },
];

export function paymentMethodLabel(value: PaymentMethod) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? "";
}

type PaymentMethodGridProps = {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
};

export function PaymentMethodGrid({ value, onChange }: PaymentMethodGridProps) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-two">
      {PAYMENT_METHODS.map((method) => {
        const selected = method.value === value;
        return (
          <Pressable
            key={method.value}
            onPress={() => onChange(method.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={`w-[48.5%] flex-row items-center gap-two rounded-two px-three py-three active:opacity-70 ${
              selected ? "border-brand bg-[#EEF5FF]" : "border-surface-selected bg-paper"
            }`}
            style={{ borderWidth: 1 }}
          >
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: method.color }} />
            <ThemedText
              type="smallBold"
              className="flex-1"
              style={selected ? { color: "#1D4E9E" } : undefined}
              numberOfLines={1}
            >
              {method.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

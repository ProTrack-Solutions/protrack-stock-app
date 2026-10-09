import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientButton } from "@/components/login/gradient-button";
import { ThemedText } from "@/components/themed-text";
import { Gradients, Spacing } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

type SaleFooterProps = {
  total: number;
  paymentLabel: string;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export function SaleFooter({ total, paymentLabel, submitting, onCancel, onSubmit }: SaleFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="gap-three bg-paper px-four pt-three"
      style={{
        paddingBottom: insets.bottom + Spacing.three,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: "#E0E1E6",
      }}
    >
      <View className="flex-row items-end justify-between">
        <View>
          <ThemedText type="small" themeColor="textSecondary" className="text-[11px] tracking-widest">
            TOTAL DA VENDA
          </ThemedText>
          <ThemedText className="text-2xl font-bold">{formatCurrency(total)}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {paymentLabel}
        </ThemedText>
      </View>

      <View className="flex-row gap-three">
        <Pressable
          onPress={onCancel}
          className="items-center justify-center rounded-two bg-paper px-four active:bg-surface"
          style={{ borderWidth: 1, borderColor: "#E0E1E6" }}
          accessibilityRole="button"
        >
          <ThemedText type="smallBold">Cancelar</ThemedText>
        </Pressable>
        <GradientButton
          label={submitting ? "Cadastrando..." : "Cadastrar Venda"}
          icon="arrow-forward"
          colors={Gradients.primary}
          disabled={submitting}
          onPress={onSubmit}
          className={`flex-1 ${submitting ? "opacity-60" : ""}`}
        />
      </View>
    </View>
  );
}

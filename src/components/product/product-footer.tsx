import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientButton } from "@/components/login/gradient-button";
import { ThemedText } from "@/components/themed-text";
import { Gradients, Spacing } from "@/constants/theme";

type ProductFooterProps = {
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export function ProductFooter({ submitting, onCancel, onSubmit }: ProductFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row gap-three border-t-hairline border-line bg-paper px-four pt-three"
      style={{ paddingBottom: insets.bottom + Spacing.three }}
    >
      <Pressable
        onPress={onCancel}
        className="items-center justify-center rounded-two bg-paper px-four active:bg-surface border border-line"
        accessibilityRole="button"
      >
        <ThemedText type="smallBold">Cancelar</ThemedText>
      </Pressable>
      <GradientButton
        label={submitting ? "Cadastrando..." : "Cadastrar Produto"}
        icon="checkmark"
        colors={Gradients.primary}
        disabled={submitting}
        onPress={onSubmit}
        className={`flex-1 ${submitting ? "opacity-60" : ""}`}
      />
    </View>
  );
}

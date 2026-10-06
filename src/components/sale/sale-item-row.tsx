import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { SaleItem } from "@/interfaces/sale.interface";
import { formatCurrency } from "@/utils/format";

type SaleItemRowProps = {
  item: SaleItem;
  onChangeQuantity: (quantity: number) => void;
  onRemove: () => void;
};

export function SaleItemRow({ item, onChangeQuantity, onRemove }: SaleItemRowProps) {
  const { product, quantity } = item;
  const atStockLimit = quantity >= product.quantity;

  return (
    <View className="gap-two rounded-two bg-surface p-three">
      <View className="flex-row items-start justify-between gap-two">
        <View className="flex-1 gap-half">
          <ThemedText type="smallBold">{product.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" className="text-xs">
            {formatCurrency(product.sale_price)} / {product.unit || "un."}
          </ThemedText>
        </View>
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${product.name}`}
        >
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-three">
          <StepperButton
            icon="remove"
            label="Diminuir quantidade"
            disabled={quantity <= 1}
            onPress={() => onChangeQuantity(quantity - 1)}
          />
          <ThemedText type="smallBold" className="min-w-6 text-center">
            {quantity}
          </ThemedText>
          <StepperButton
            icon="add"
            label="Aumentar quantidade"
            disabled={atStockLimit}
            onPress={() => onChangeQuantity(quantity + 1)}
          />
        </View>
        <ThemedText type="smallBold">{formatCurrency(product.sale_price * quantity)}</ThemedText>
      </View>
    </View>
  );
}

function StepperButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`h-8 w-8 items-center justify-center rounded-two bg-paper active:opacity-60 ${disabled ? "opacity-40" : ""}`}
    >
      <Ionicons name={icon} size={16} color="#000000" />
    </Pressable>
  );
}

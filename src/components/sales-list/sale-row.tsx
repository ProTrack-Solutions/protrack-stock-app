import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { SaleListItem } from "@/interfaces/sale.interface";
import { formatCurrency } from "@/utils/format";

import { hasCustomer, salePaymentLabel, SaleStatusBadge } from "./sale-status";

export function SaleRow({
  item,
  onPress,
}: {
  item: SaleListItem;
  onPress: () => void;
}) {
  const { sale } = item;
  const withCustomer =
    hasCustomer(sale.customer_id) && Boolean(sale.customer_name);
  const canceled = sale.sale_status === "canceled";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`gap-two rounded-three bg-paper p-three border border-line active:bg-surface ${canceled ? "opacity-70" : ""}`}
    >
      <View className="flex-row items-center justify-between gap-two">
        <ThemedText
          className={`flex-1 font-bold ${withCustomer ? "" : "text-muted"}`}
          numberOfLines={1}
        >
          {withCustomer ? sale.customer_name : "Consumidor final"}
        </ThemedText>
        <ThemedText className="text-base font-bold">
          {formatCurrency(sale.total_amount)}
        </ThemedText>
      </View>
      <View className="flex-row items-center justify-between gap-two">
        <ThemedText
          type="small"
          themeColor="textSecondary"
          className="flex-1"
          numberOfLines={1}
        >
          <ThemedText type="code" themeColor="textSecondary">
            #{sale.sale_id.slice(0, 8)}
          </ThemedText>
          {"  •  "}
          {salePaymentLabel(sale.payment_method)}
        </ThemedText>
        {sale.discount_amount > 0 && (
          <ThemedText type="smallBold" className="text-xs text-danger">
            −{formatCurrency(sale.discount_amount)}
          </ThemedText>
        )}
        <SaleStatusBadge status={sale.sale_status} />
      </View>
    </Pressable>
  );
}

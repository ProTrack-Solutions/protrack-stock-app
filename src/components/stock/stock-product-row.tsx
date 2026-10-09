import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BrandColor } from "@/constants/theme";
import type { StockProduct } from "@/interfaces/product.interface";
import { formatCurrency, formatNumber } from "@/utils/format";

/** Mesmas faixas do `getQuantityStyle` do protrack-web. */
function quantityStyle(quantity: number) {
  if (quantity >= 10) return { box: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" };
  if (quantity >= 5) return { box: "bg-amber-50 border-amber-200", text: "text-amber-700" };
  return { box: "bg-rose-50 border-rose-200", text: "text-rose-700" };
}

/** Mesmas cores do `getUnitBadgeStyle` do protrack-web: peso roxo, volume azul. */
function unitStyle(unit: string) {
  if (unit === "KG" || unit === "G") return { box: "bg-purple-50 border-purple-200", text: "text-purple-700" };
  if (unit === "L" || unit === "ML") return { box: "bg-sky-50 border-sky-200", text: "text-sky-700" };
  return { box: "bg-slate-50 border-slate-200", text: "text-slate-700" };
}

type StockProductRowProps = {
  product: StockProduct;
  categoryColor?: string;
};

export function StockProductRow({ product, categoryColor = "#64748B" }: StockProductRowProps) {
  const badge = product.sell_in_bulk ? unitStyle(product.unit) : quantityStyle(product.quantity);
  const unit = product.unit.toLowerCase();

  return (
    <View
      className="flex-row items-center gap-three rounded-three bg-paper p-three border border-line"
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-two bg-brand-soft border border-brand-line"
      >
        <Ionicons name="cube-outline" size={20} color={BrandColor} />
      </View>

      <View className="flex-1 gap-one">
        <View className="flex-row items-start justify-between gap-two">
          <ThemedText className="flex-1 font-bold" numberOfLines={1}>
            {product.name}
          </ThemedText>
          <ThemedText className="font-bold">
            {formatCurrency(product.sale_price)}
            {product.sell_in_bulk ? `/${unit}` : ""}
          </ThemedText>
        </View>

        {product.barcode ? (
          <ThemedText type="small" themeColor="textSecondary" className="font-mono text-xs">
            {product.barcode}
          </ThemedText>
        ) : null}

        <View className="flex-row items-center justify-between gap-two">
          <View className="flex-1 flex-row flex-wrap items-center gap-one">
            {product.category_name ? (
              <View className="rounded-full px-two py-half" style={{ backgroundColor: `${categoryColor}26` }}>
                <ThemedText type="smallBold" className="text-xs" style={{ color: categoryColor }}>
                  {product.category_name}
                </ThemedText>
              </View>
            ) : null}
            {product.size ? (
              <View className="rounded-one px-two py-half border border-[#C9CCD3]">
                <ThemedText type="smallBold" className="text-xs">
                  {product.size}
                </ThemedText>
              </View>
            ) : null}
          </View>
          <View className={`rounded-full border px-two py-half ${badge.box}`}>
            <ThemedText type="smallBold" className={`text-xs ${badge.text}`}>
              {product.sell_in_bulk ? `A granel (${unit})` : `${formatNumber(product.quantity)} un`}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

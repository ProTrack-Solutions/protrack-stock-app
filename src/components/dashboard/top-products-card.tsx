import { View } from "react-native";

import { SectionCard } from "@/components/sale/section-card";
import { ThemedText } from "@/components/themed-text";
import { BrandColor } from "@/constants/theme";
import type { TopProduct } from "@/interfaces/dashboard.interface";
import { formatNumber } from "@/utils/format";

export function TopProductsCard({ products }: { products: TopProduct[] }) {
  const max = Math.max(...products.map((p) => p.total_sale), 0);

  return (
    <SectionCard title="Top Produtos">
      {products.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Nenhuma venda registrada
        </ThemedText>
      ) : (
        <View className="gap-three">
          {products.map((product) => (
            <View key={product.product_name} className="gap-two">
              <View className="flex-row items-center justify-between gap-two">
                <ThemedText type="small" className="flex-1" numberOfLines={1}>
                  {product.product_name}
                </ThemedText>
                <ThemedText type="smallBold">{formatNumber(product.total_sale)}</ThemedText>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-surface">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${max > 0 ? (product.total_sale / max) * 100 : 0}%`,
                    backgroundColor: BrandColor,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BrandColor } from "@/constants/theme";
import { formatCurrency, formatNumber } from "@/utils/format";

type ProductPreviewProps = {
  name: string;
  /** `null` na venda a granel, quando o estoque não é informado. */
  quantity: number | null;
  unit: string;
  salePrice: number;
  categoryName?: string;
  size?: string;
};

export function ProductPreview({ name, quantity, unit, salePrice, categoryName, size }: ProductPreviewProps) {
  return (
    <View className="gap-three rounded-three bg-paper p-three border border-line">
      <View className="flex-row items-center gap-three">
        <View className="h-10 w-10 items-center justify-center rounded-two bg-brand-soft">
          <Ionicons name="pricetag-outline" size={20} color={BrandColor} />
        </View>
        <View className="flex-1">
          <ThemedText type="smallBold" themeColor="textSecondary" className="text-[11px] tracking-widest">
            RESUMO · PRÉ-VISUALIZAÇÃO
          </ThemedText>
          <ThemedText className="font-bold" numberOfLines={1}>
            {name.trim() || "—"}
          </ThemedText>
        </View>
      </View>
      {(categoryName || size) && (
        <View className="flex-row flex-wrap gap-two">
          {categoryName && <Badge label={categoryName} className="bg-brand-soft" textClassName="text-brand" />}
          {size && <Badge label={`Tam: ${size}`} className="bg-surface" textClassName="text-ink" />}
        </View>
      )}
      <View className="flex-row gap-three">
        <PreviewStat
          label="ESTOQUE"
          value={quantity === null ? `A granel (${unit})` : formatNumber(quantity)}
        />
        <PreviewStat label="VENDA" value={formatCurrency(salePrice)} />
      </View>
    </View>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-half rounded-two p-three border border-line">
      <ThemedText type="smallBold" themeColor="textSecondary" className="text-[11px] tracking-widest">
        {label}
      </ThemedText>
      <ThemedText className="font-bold" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </ThemedText>
    </View>
  );
}

function Badge({ label, className, textClassName }: { label: string; className: string; textClassName: string }) {
  return (
    <View className={`rounded-full px-two py-half ${className}`}>
      <ThemedText type="smallBold" className={`text-xs ${textClassName}`}>
        {label}
      </ThemedText>
    </View>
  );
}

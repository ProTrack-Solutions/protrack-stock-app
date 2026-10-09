import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { formatCurrency } from "@/utils/format";

type MarginCardProps = {
  costPrice: number;
  salePrice: number;
};

/** Mesmas faixas de cor do cadastro de produtos do protrack-web. */
function marginGradient(percent: number): readonly [string, string] {
  if (percent >= 50) return ["#10B981", "#0D9488"];
  if (percent >= 20) return ["#3B82F6", "#4F46E5"];
  if (percent > 0) return ["#F59E0B", "#F97316"];
  return ["#F43F5E", "#E11D48"];
}

export function MarginCard({ costPrice, salePrice }: MarginCardProps) {
  const margin = salePrice - costPrice;
  const percent = costPrice > 0 ? (margin / costPrice) * 100 : 0;

  return (
    <LinearGradient
      colors={marginGradient(percent)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-row items-center justify-between gap-three rounded-three p-three"
    >
      <View className="flex-1 flex-row items-center gap-three">
        <View className="h-10 w-10 items-center justify-center rounded-two bg-white/20">
          <Ionicons name="trending-up" size={20} color="#ffffff" />
        </View>
        <View className="flex-1">
          <ThemedText type="smallBold" className="text-[11px] tracking-widest text-white/85">
            MARGEM DE LUCRO
          </ThemedText>
          <ThemedText className="text-xl font-bold text-white" numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(margin)}
          </ThemedText>
        </View>
      </View>
      <View className="rounded-full bg-white/20 px-three py-one">
        <ThemedText type="smallBold" className="text-white">
          % {percent.toFixed(1)}%
        </ThemedText>
      </View>
    </LinearGradient>
  );
}

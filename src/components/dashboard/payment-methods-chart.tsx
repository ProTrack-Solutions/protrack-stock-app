import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { PAYMENT_METHODS } from "@/components/sale/payment-method-grid";
import { SectionCard } from "@/components/sale/section-card";
import { ThemedText } from "@/components/themed-text";
import type { PaymentMethodStat } from "@/interfaces/dashboard.interface";
import { formatPercent } from "@/utils/format";

const SIZE = 124;
const STROKE = 20;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Espaço entre as fatias, em pixels do contorno. */
const GAP = 3;

function methodInfo(method: string) {
  return PAYMENT_METHODS.find((m) => m.value === method) ?? { label: "Outro", color: "#94A3B8" };
}

export function PaymentMethodsChart({ stats }: { stats: PaymentMethodStat[] }) {
  const sorted = [...stats].sort((a, b) => b.percentage_method - a.percentage_method);
  const total = sorted.reduce((sum, s) => sum + s.percentage_method, 0);

  let offset = 0;
  const slices = sorted.map((stat) => {
    const length = total > 0 ? (stat.percentage_method / total) * CIRCUMFERENCE : 0;
    const slice = { stat, length, offset };
    offset += length;
    return slice;
  });

  return (
    <SectionCard title="Formas de Pagamento">
      {sorted.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Nenhuma venda registrada
        </ThemedText>
      ) : (
        <View className="flex-row items-center gap-three">
          <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
            {slices.map(({ stat, length, offset: start }) => (
              <Circle
                key={stat.payment_method}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={methodInfo(stat.payment_method).color}
                strokeWidth={STROKE}
                strokeDasharray={`${Math.max(length - GAP, 0)} ${CIRCUMFERENCE}`}
                strokeDashoffset={-start}
              />
            ))}
          </Svg>

          <View className="flex-1 gap-two">
            {sorted.map((stat) => {
              const { label, color } = methodInfo(stat.payment_method);
              return (
                <View key={stat.payment_method} className="flex-row items-center gap-two">
                  <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  <ThemedText type="small" themeColor="textSecondary" className="flex-1 text-xs" numberOfLines={1}>
                    {label}
                  </ThemedText>
                  <ThemedText type="smallBold" className="text-xs">
                    {formatPercent(stat.percentage_method)}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </SectionCard>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryCard } from "@/components/cash-flow/category-card";
import { HistoryChart } from "@/components/cash-flow/history-chart";
import { PeriodComparison } from "@/components/cash-flow/period-comparison";
import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { ScreenHeader } from "@/components/ui/screen-header";
import { CashFlowSkeleton } from "@/components/cash-flow/cash-flow-skeleton";
import { BrandColor, Gradients } from "@/constants/theme";
import { useSideMenu } from "@/contexts/side-menu-context";
import { useCashFlow } from "@/hooks/use-cash-flow";
import { formatCurrency } from "@/utils/format";

const PERIODS = [7, 15, 30] as const;

// Sombra via `style`: classes `shadow-*` adicionadas depois da primeira renderização
// fazem o NativeWind remontar o componente (erro "navigation context").
const SELECTED_SHADOW = {
  shadowColor: "#000000",
  shadowOpacity: 0.08,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 2,
};

export default function CashFlowScreen() {
  const insets = useSafeAreaInsets();
  const sideMenu = useSideMenu();
  const [days, setDays] = useState<(typeof PERIODS)[number]>(7);
  const { data, loading, refreshing, error, refresh } = useCashFlow(days);

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Fluxo de Caixa"
        subtitle="Entradas, saídas e projeções."
        leading={{ type: "menu", onPress: sideMenu.open }}
      />

      <View className="px-three py-three border-b-hairline border-line">
        <View className="flex-row rounded-three bg-surface-selected p-one">
          {PERIODS.map((value) => {
            const selected = value === days;
            return (
              <Pressable
                key={value}
                onPress={() => setDays(value)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                className={`flex-1 items-center rounded-two py-two ${selected ? "bg-paper" : ""}`}
                style={selected ? SELECTED_SHADOW : undefined}
              >
                <ThemedText
                  type="smallBold"
                  className={selected ? "text-ink" : "text-muted"}
                >
                  {value} dias
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading && !data ? (
        <CashFlowSkeleton />
      ) : error && !data ? (
        <View className="flex-1 items-center justify-center gap-two p-four">
          <Ionicons name="cloud-offline-outline" size={28} color="#60646C" />
          <ThemedText type="small" className="text-center text-danger">
            {error}
          </ThemedText>
        </View>
      ) : data ? (
        <ScrollView
          contentContainerClassName="w-full max-w-content self-center gap-three p-three"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={BrandColor}
            />
          }
        >
          <View className={loading ? "opacity-60" : undefined}>
            <LinearGradient
              colors={Gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="gap-three rounded-four p-four"
            >
              <View className="flex-row items-start justify-between">
                <View className="gap-half">
                  <ThemedText type="small" className="text-white/85">
                    Saldo do período
                  </ThemedText>
                  <ThemedText
                    className="text-[28px] leading-9 font-bold text-white"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatCurrency(data.balance)}
                  </ThemedText>
                </View>
                <View className="h-10 w-10 items-center justify-center rounded-two bg-white/20">
                  <Ionicons name="logo-usd" size={20} color="#ffffff" />
                </View>
              </View>
              <View className="flex-row items-center gap-two rounded-three bg-white/15 px-three py-three">
                <Ionicons name="calendar-outline" size={16} color="#ffffff" />
                <ThemedText type="small" className="flex-1 text-white/90">
                  Previsão · entrada por dia
                </ThemedText>
                <ThemedText type="smallBold" className="text-white">
                  {formatCurrency(data.projection)}
                </ThemedText>
              </View>
            </LinearGradient>
          </View>

          <View className="flex-row gap-two">
            <TotalCard
              label="Total entradas"
              value={data.totalInflow}
              icon="trending-up"
              color="#2F855A"
              valueClass="text-success"
            />
            <TotalCard
              label="Total saídas"
              value={data.totalOutflow}
              icon="trending-down"
              color="#DC2626"
              valueClass="text-danger"
            />
          </View>

          <HistoryChart periods={data.periods} projection={data.projection} />
          <CategoryCard
            title="Entradas por Categoria"
            categories={data.inflowCategories}
            kind="inflow"
          />
          <CategoryCard
            title="Saídas por Categoria"
            categories={data.outflowCategories}
            kind="outflow"
          />
          <PeriodComparison months={data.months} />
        </ScrollView>
      ) : null}
    </View>
  );
}

function TotalCard({
  label,
  value,
  icon,
  color,
  valueClass,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  valueClass: string;
}) {
  return (
    <View className="flex-1 gap-two rounded-three bg-paper p-three border border-line">
      <View className="flex-row items-center justify-between">
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <ThemedText
        className={`text-lg font-bold ${valueClass}`}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatCurrency(value)}
      </ThemedText>
    </View>
  );
}

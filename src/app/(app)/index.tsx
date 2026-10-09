import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";

import { AccountsPayableCard } from "@/components/dashboard/accounts-payable-card";
import { AlertsCard } from "@/components/dashboard/alerts-card";
import { BalanceCards } from "@/components/dashboard/balance-cards";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { PaymentMethodsChart } from "@/components/dashboard/payment-methods-chart";
import { QUICK_ACTION_COLORS, QuickActions, type QuickAction } from "@/components/dashboard/quick-actions";
import { SalesSummaryCard } from "@/components/dashboard/sales-summary-card";
import { StockValueCard } from "@/components/dashboard/stock-value-card";
import { TopProductsCard } from "@/components/dashboard/top-products-card";
import { ThemedText } from "@/components/themed-text";
import { GradientHeader } from "@/components/ui/gradient-header";
import { BrandColor } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useDashboard } from "@/hooks/use-dashboard";

const comingSoon = () => Alert.alert("Em breve", "Esta funcionalidade ainda não está disponível no app.");

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Nova Venda", icon: "cart-outline", onPress: () => router.push("/nova-venda") },
  { label: "Novo Produto", icon: "cube-outline", color: QUICK_ACTION_COLORS.blue, onPress: () => router.push("/novo-produto") },
  { label: "Novo Cliente", icon: "person-add-outline", color: QUICK_ACTION_COLORS.purple, onPress: comingSoon },
  { label: "Caixa", icon: "calculator-outline", color: QUICK_ACTION_COLORS.cyan, onPress: comingSoon },
];

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const { data, loading, refreshing, refresh } = useDashboard();

  const firstName = user?.name?.split(" ")[0];
  const cashBalance = data?.cashFlow.reduce((sum, d) => sum + d.total_inflow - d.total_outflow, 0) ?? 0;

  const confirmSignOut = () => {
    Alert.alert("Sair da conta?", "Você precisará entrar novamente.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          await signOut();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-surface">
      <GradientHeader className="gap-one">
        <View className="flex-row items-center justify-between">
          <ThemedText type="small" className="text-white/85">
            {firstName ? `Olá, ${firstName}` : "Olá"}
          </ThemedText>
          <Pressable
            onPress={confirmSignOut}
            disabled={signingOut}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Sair"
            className="flex-row items-center gap-one rounded-full bg-white/[0.18] px-three py-one active:opacity-70"
          >
            <Ionicons name="log-out-outline" size={16} color="#ffffff" />
            <ThemedText type="smallBold" className="text-white">
              {signingOut ? "Saindo..." : "Sair"}
            </ThemedText>
          </Pressable>
        </View>
        <ThemedText className="text-[26px] font-semibold leading-8 text-white">
          ProTrack Gerencial
        </ThemedText>
        {user?.department_name ? (
          <ThemedText type="small" className="text-white/85">
            {user.department_name}
          </ThemedText>
        ) : null}
      </GradientHeader>

      {loading || !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={BrandColor} />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="w-full max-w-content self-center gap-three p-four"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={BrandColor} />
          }
        >
          <BalanceCards
            totalReceivable={data.totalReceivable}
            totalPayable={data.totalPayable}
            cashBalance={cashBalance}
          />
          <QuickActions actions={QUICK_ACTIONS} />
          <SalesSummaryCard summary={data.salesSummary} />
          <AlertsCard announcements={data.announcements} onSeeAll={comingSoon} />
          <CashFlowChart data={data.cashFlow} />
          <TopProductsCard products={data.topProducts} />
          <PaymentMethodsChart stats={data.paymentMethods} />
          <StockValueCard
            stockCost={data.stockCost}
            inventoryTurnover={data.inventoryTurnover}
            onSeeDetails={comingSoon}
          />
          <AccountsPayableCard summary={data.billsPayable} onManage={comingSoon} />
        </ScrollView>
      )}
    </View>
  );
}

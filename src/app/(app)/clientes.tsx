import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CustomerDetailSheet } from "@/components/customer/customer-detail-sheet";
import { CustomerRow } from "@/components/customer/customer-row";
import {
  CustomerListSkeleton,
  CustomerStatsSkeleton,
} from "@/components/customer/customer-skeleton";
import { SearchInput } from "@/components/sale/search-input";
import {
  periodStartDate,
  StockFilterSheet,
  type CreatedPeriod,
  type StockOrder,
} from "@/components/stock/stock-filter-sheet";
import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "@/components/ui/linear-gradient";
import { ScreenHeader } from "@/components/ui/screen-header";
import { BrandColor, Gradients, Spacing } from "@/constants/theme";
import { useSideMenu } from "@/contexts/side-menu-context";
import { useCustomers } from "@/hooks/use-customers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type {
  Customer,
  CustomerStats,
  CustomerStatusFilter,
} from "@/interfaces/customer.interface";
import { formatNumber } from "@/utils/format";

const STATUSES: { value: CustomerStatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const sideMenu = useSideMenu();
  const [searchText, setSearchText] = useState("");
  const search = useDebouncedValue(searchText.trim(), 400);
  const [status, setStatus] = useState<CustomerStatusFilter>("all");
  const [order, setOrder] = useState<StockOrder>("desc");
  const [period, setPeriod] = useState<CreatedPeriod>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);

  const startDate = useMemo(() => periodStartDate(period), [period]);
  const {
    customers,
    stats,
    statsLoading,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh,
    loadMore,
  } = useCustomers({
    search,
    status,
    orderBy: order,
    startDate,
  });

  // Recarrega ao voltar para a tela (ex: depois de cadastrar um cliente).
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) refresh();
      focusedOnce.current = true;
    }, [refresh]),
  );

  const hasFilters = order !== "desc" || period !== "all";
  const count = countLabel(
    customers.length,
    hasMore,
    stats,
    status,
    Boolean(search) || period !== "all",
  );

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Clientes"
        subtitle="Clientes cadastrados no sistema."
        leading={{ type: "menu", onPress: sideMenu.open }}
      />

      <View className="flex-row gap-two px-three py-three border-b-hairline border-line">
        <View className="flex-1">
          <SearchInput
            placeholder="Nome, CPF ou email..."
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
        </View>
        <Pressable
          onPress={() => setFilterOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Filtros"
          className="w-12 items-center justify-center rounded-two bg-paper active:bg-surface border border-line"
        >
          <Ionicons name="filter-outline" size={20} color="#000000" />
          {hasFilters && (
            <View className="absolute right-two top-two h-2 w-2 rounded-full bg-brand" />
          )}
        </Pressable>
      </View>

      <FlatList
        data={loading ? [] : customers}
        keyExtractor={(c) => c.id}
        contentContainerClassName="w-full max-w-content self-center gap-two p-three"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={BrandColor}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View className="mb-one gap-three">
            {!stats && statsLoading && <CustomerStatsSkeleton />}
            {stats && (
              <View className="flex-row gap-two">
                <StatCard
                  label="TOTAL"
                  value={stats.total}
                  valueClass="text-ink"
                />
                <StatCard
                  label="ATIVOS"
                  value={stats.active}
                  valueClass="text-emerald-700"
                />
                <StatCard
                  label="NOVOS NO MÊS"
                  value={stats.newThisMonth}
                  valueClass="text-blue-600"
                />
              </View>
            )}
            <View className="flex-row gap-two">
              {STATUSES.map((option) => {
                const selected = option.value === status;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setStatus(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`rounded-full border px-four py-two active:opacity-70 ${
                      selected
                        ? "border-blue-600 bg-blue-600"
                        : "border-line bg-paper"
                    }`}
                  >
                    <ThemedText
                      type="smallBold"
                      className={selected ? "text-white" : "text-ink"}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            {!loading && !error && (
              <ThemedText type="smallBold" themeColor="textSecondary">
                {count}
              </ThemedText>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <CustomerListSkeleton />
          ) : (
            <View className="items-center gap-two py-five">
              <Ionicons
                name={error ? "cloud-offline-outline" : "people-outline"}
                size={28}
                color="#60646C"
              />
              <ThemedText
                type="small"
                themeColor="textSecondary"
                className={`text-center ${error ? "text-red-700" : ""}`}
              >
                {error ?? "Nenhum cliente encontrado."}
              </ThemedText>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-three">
              <ActivityIndicator color={BrandColor} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <CustomerRow customer={item} onPress={() => setSelected(item)} />
        )}
      />

      <Pressable
        onPress={() => router.push("/novo-cliente")}
        accessibilityRole="button"
        className="absolute right-four active:opacity-85"
        style={{
          bottom: insets.bottom + Spacing.four,
          shadowColor: "#2563EB",
          shadowOpacity: 0.35,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
      >
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-row items-center gap-two rounded-full px-four py-three"
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <ThemedText type="smallBold" className="text-white">
            Novo cliente
          </ThemedText>
        </LinearGradient>
      </Pressable>

      <CustomerDetailSheet
        customer={selected}
        onClose={() => setSelected(null)}
        onChanged={refresh}
      />

      <StockFilterSheet
        visible={filterOpen}
        order={order}
        period={period}
        defaultOrder="desc"
        onChangeOrder={setOrder}
        onChangePeriod={setPeriod}
        onClose={() => setFilterOpen(false)}
      />
    </View>
  );
}

/**
 * Sem busca/período, usa os números dos cards; com eles, conta o que foi carregado
 * (a API não informa o total filtrado).
 */
function countLabel(
  loaded: number,
  hasMore: boolean,
  stats: CustomerStats | null,
  status: CustomerStatusFilter,
  filtered: boolean,
) {
  let count = loaded;
  let more = hasMore;
  if (!filtered && stats) {
    count =
      status === "all"
        ? stats.total
        : status === "active"
          ? stats.active
          : stats.total - stats.active;
    more = false;
  }
  return `${formatNumber(count)}${more ? "+" : ""} ${count === 1 && !more ? "cliente" : "clientes"}`;
}

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: number;
  valueClass: string;
}) {
  return (
    <View className="flex-1 gap-two rounded-three bg-paper p-three border border-line">
      <ThemedText
        type="smallBold"
        themeColor="textSecondary"
        className="text-[10px] tracking-wider"
        numberOfLines={1}
      >
        {label}
      </ThemedText>
      <ThemedText
        className={`text-[26px] leading-8 font-bold ${valueClass}`}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatNumber(value)}
      </ThemedText>
    </View>
  );
}

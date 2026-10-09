import { View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";

/** Mesmo formato dos cards Total de Vendas / Faturado / Pendente / Canceladas. */
export function SalesStatsSkeleton() {
  return (
    <View className="gap-two">
      {[0, 1].map((row) => (
        <View key={row} className="flex-row gap-two">
          {[0, 1].map((i) => (
            <View
              key={i}
              className="flex-1 gap-two rounded-three bg-paper p-three border border-line"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Mesmo formato do `SaleRow`. */
function SaleRowSkeleton() {
  return (
    <View className="gap-three rounded-three bg-paper p-three border border-line">
      <View className="flex-row justify-between gap-two">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-4 w-20" />
      </View>
      <View className="flex-row items-center justify-between gap-two">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </View>
    </View>
  );
}

/** Lista agrupada por dia: cabeçalho do dia + vendas. */
export function SalesListSkeleton() {
  return (
    <View className="gap-two">
      {[2, 3].map((count, group) => (
        <View key={group} className="gap-two">
          <View className="mt-two flex-row justify-between px-one">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </View>
          {Array.from({ length: count }, (_, i) => (
            <SaleRowSkeleton key={i} />
          ))}
        </View>
      ))}
    </View>
  );
}

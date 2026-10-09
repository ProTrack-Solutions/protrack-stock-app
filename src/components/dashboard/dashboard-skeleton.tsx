import { View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View className="gap-three rounded-three bg-paper p-four border border-line">
      {children}
    </View>
  );
}

/** Mesma sequência de cards do dashboard. */
export function DashboardSkeleton() {
  return (
    <View className="w-full max-w-content gap-three self-center p-four">
      {/* Saldo total */}
      <View className="gap-four rounded-four bg-paper p-four border border-line">
        <View className="flex-row items-start justify-between">
          <View className="gap-two">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-40" />
          </View>
          <Skeleton className="h-10 w-10" />
        </View>
        <Skeleton className="h-12 w-full rounded-three" />
      </View>

      {/* A pagar / A receber */}
      <View className="flex-row gap-three">
        {[0, 1].map((i) => (
          <View
            key={i}
            className="flex-1 gap-two rounded-three bg-paper p-four border border-line"
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-24" />
          </View>
        ))}
      </View>

      {/* Ações rápidas */}
      <Card>
        <Skeleton className="h-4 w-32" />
        <View className="flex-row justify-between">
          {[0, 1, 2, 3].map((i) => (
            <View key={i} className="items-center gap-two">
              <Skeleton className="h-14 w-14 rounded-three" />
              <Skeleton className="h-3 w-14" />
            </View>
          ))}
        </View>
      </Card>

      {/* Resumo de vendas */}
      <Card>
        <Skeleton className="h-4 w-40" />
        <View className="flex-row gap-four">
          {[0, 1].map((i) => (
            <View key={i} className="flex-1 gap-two">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
            </View>
          ))}
        </View>
        <Skeleton className="h-6 w-36 rounded-full" />
      </Card>

      {/* Gráfico */}
      <Card>
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-48 w-full rounded-three" />
      </Card>
    </View>
  );
}

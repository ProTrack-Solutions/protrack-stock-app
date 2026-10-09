import { View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";

/** Mesma sequência da tela de fluxo de caixa. */
export function CashFlowSkeleton() {
  return (
    <View className="w-full max-w-content gap-three self-center p-three">
      <View className="gap-three rounded-four bg-paper p-four border border-line">
        <View className="flex-row items-start justify-between">
          <View className="gap-two">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-40" />
          </View>
          <Skeleton className="h-10 w-10" />
        </View>
        <Skeleton className="h-11 w-full rounded-three" />
      </View>

      <View className="flex-row gap-two">
        {[0, 1].map((i) => (
          <View
            key={i}
            className="flex-1 gap-two rounded-three bg-paper p-three border border-line"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-28" />
          </View>
        ))}
      </View>

      <View className="gap-three rounded-three bg-paper p-three border border-line">
        <View className="flex-row items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </View>
        <Skeleton className="h-52 w-full rounded-three" />
      </View>

      <View className="gap-three rounded-three bg-paper p-three border border-line">
        <Skeleton className="h-4 w-44" />
        {[0, 1, 2].map((i) => (
          <View key={i} className="gap-two">
            <View className="flex-row justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </View>
            <Skeleton className="h-2 w-full rounded-full" />
          </View>
        ))}
      </View>
    </View>
  );
}

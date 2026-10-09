import { View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";

/** Mesmo formato do `StockStats` (2x2). */
export function StockStatsSkeleton() {
  return (
    <View className="gap-three">
      {[0, 1].map((row) => (
        <View key={row} className="flex-row gap-three">
          {[0, 1].map((i) => (
            <View
              key={i}
              className="flex-1 gap-three rounded-three bg-paper p-three border border-line"
            >
              <View className="flex-row items-start justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-7" />
              </View>
              <Skeleton className="h-6 w-24" />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Mesmo formato do `StockProductRow`. */
export function StockProductRowSkeleton() {
  return (
    <View className="flex-row items-center gap-three rounded-three bg-paper p-three border border-line">
      <Skeleton className="h-11 w-11" />
      <View className="flex-1 gap-two">
        <View className="flex-row justify-between gap-two">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-4 w-16" />
        </View>
        <Skeleton className="h-3 w-28" />
        <View className="flex-row items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </View>
      </View>
    </View>
  );
}

export function StockListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View className="gap-two">
      {Array.from({ length: count }, (_, i) => (
        <StockProductRowSkeleton key={i} />
      ))}
    </View>
  );
}

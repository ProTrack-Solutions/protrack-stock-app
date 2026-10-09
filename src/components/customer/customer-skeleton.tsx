import { View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";

/** Mesmo formato do `CustomerRow`. */
export function CustomerRowSkeleton() {
  return (
    <View className="gap-three rounded-three bg-paper p-three border border-line">
      <View className="flex-row items-center gap-three">
        <Skeleton className="h-11 w-11 rounded-full" />
        <View className="flex-1 gap-two">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-28" />
        </View>
        <Skeleton className="h-5 w-12 self-start rounded-full" />
      </View>
      <View className="gap-two border-t-hairline border-line pt-three">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-5/6" />
      </View>
    </View>
  );
}

/** Mesmo formato dos cards Total / Ativos / Novos no mês. */
export function CustomerStatsSkeleton() {
  return (
    <View className="flex-row gap-two">
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          className="flex-1 gap-three rounded-three bg-paper p-three border border-line"
        >
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-7 w-10" />
        </View>
      ))}
    </View>
  );
}

export function CustomerListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="gap-two">
      {Array.from({ length: count }, (_, i) => (
        <CustomerRowSkeleton key={i} />
      ))}
    </View>
  );
}

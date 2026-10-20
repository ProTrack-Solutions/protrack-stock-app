import { View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";

/** Mesmo formato do card de resumo. */
export function BillSummarySkeleton() {
  return (
    <View className="gap-three rounded-four bg-paper p-four border border-line">
      <View className="flex-row items-start justify-between">
        <View className="gap-two">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-40" />
        </View>
        <Skeleton className="h-10 w-10" />
      </View>
      <View className="flex-row gap-two">
        <Skeleton className="h-14 flex-1 rounded-three" />
        <Skeleton className="h-14 flex-1 rounded-three" />
        <Skeleton className="h-14 flex-1 rounded-three" />
      </View>
    </View>
  );
}

/** Mesmo formato do `BillCard`. */
function BillCardSkeleton() {
  return (
    <View className="gap-two rounded-three bg-paper p-three border border-line">
      <View className="flex-row items-start justify-between gap-two">
        <View className="flex-1 gap-two">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-40" />
        </View>
        <Skeleton className="h-5 w-16 rounded-full" />
      </View>
      <Skeleton className="h-5 w-28 rounded-full" />
      <View className="flex-row items-center justify-between">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-5 w-24" />
      </View>
    </View>
  );
}

export function BillListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="gap-two">
      {Array.from({ length: count }, (_, i) => (
        <BillCardSkeleton key={i} />
      ))}
    </View>
  );
}

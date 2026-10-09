import { View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";

/** Mesmo formato do card azul de resumo. */
export function ReceivableSummarySkeleton() {
  return (
    <View className="gap-three rounded-four bg-paper p-four border border-line">
      <View className="flex-row items-start justify-between">
        <View className="gap-two">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-36" />
        </View>
        <Skeleton className="h-10 w-10" />
      </View>
      <View className="flex-row gap-two">
        <Skeleton className="h-14 flex-1 rounded-three" />
        <Skeleton className="h-14 flex-1 rounded-three" />
      </View>
    </View>
  );
}

/** Mesmo formato do `ReceivableCard`. */
function ReceivableCardSkeleton() {
  return (
    <View className="gap-three rounded-three bg-paper p-three border border-line">
      <View className="flex-row items-start justify-between gap-two">
        <View className="flex-1 gap-two">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-40" />
        </View>
        <Skeleton className="h-5 w-16 rounded-full" />
      </View>
      <View className="flex-row gap-two">
        {[0, 1, 2].map((i) => (
          <View key={i} className="flex-1 gap-two">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-4 w-20" />
          </View>
        ))}
      </View>
    </View>
  );
}

export function ReceivableListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="gap-two">
      {Array.from({ length: count }, (_, i) => (
        <ReceivableCardSkeleton key={i} />
      ))}
    </View>
  );
}

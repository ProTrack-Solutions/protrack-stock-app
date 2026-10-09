import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ScreenHeader } from "@/components/ui/screen-header";
import { formatShortDate } from "@/utils/format";

type SaleHeaderProps = {
  date: Date;
  onBack: () => void;
};

export function SaleHeader({ date, onBack }: SaleHeaderProps) {
  return (
    <ScreenHeader
      title="Nova Venda"
      subtitle="Cadastre uma venda em poucos toques."
      onBack={onBack}
      right={
        <View className="flex-row items-center gap-one rounded-full bg-white/[0.18] px-two py-one">
          <View className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
          <ThemedText type="smallBold" className="text-xs text-white">
            {formatShortDate(date)}
          </ThemedText>
        </View>
      }
    />
  );
}

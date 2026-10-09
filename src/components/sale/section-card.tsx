import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BrandColor } from "@/constants/theme";

type SectionCardProps = ViewProps & {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Rendered on the right side of the header, e.g. a counter badge. */
  right?: ReactNode;
};

export function SectionCard({
  title,
  icon,
  right,
  className,
  children,
  ...viewProps
}: SectionCardProps) {
  return (
    <View
      className={["gap-three rounded-three bg-paper p-three", className]
        .filter(Boolean)
        .join(" ")}
      {...viewProps}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-two">
          {icon && <Ionicons name={icon} size={18} color={BrandColor} />}
          <ThemedText className="font-bold">{title}</ThemedText>
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <ThemedText type="small" themeColor="textSecondary">
      {children}
    </ThemedText>
  );
}

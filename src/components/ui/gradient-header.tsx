import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LinearGradient } from "@/components/ui/linear-gradient";
import { Gradients, Spacing } from "@/constants/theme";

type GradientHeaderProps = {
  children: ReactNode;
  className?: string;
};

/** Cabeçalho com o gradiente da marca usado no topo de todas as telas do app. */
export function GradientHeader({ children, className }: GradientHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={Gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={["rounded-b-four px-four pb-four", className].filter(Boolean).join(" ")}
      style={{ paddingTop: insets.top + Spacing.four }}
    >
      <StatusBar style="light" />
      {children}
    </LinearGradient>
  );
}

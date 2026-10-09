import { useEffect } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

// Uma única animação para todos os skeletons, para pulsarem em sincronia.
const pulse = new Animated.Value(0);
const loop = Animated.loop(
  Animated.sequence([
    Animated.timing(pulse, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(pulse, {
      toValue: 0,
      duration: 800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
  ]),
);
let subscribers = 0;

function usePulse() {
  useEffect(() => {
    if (subscribers++ === 0) loop.start();
    return () => {
      if (--subscribers === 0) {
        loop.stop();
        pulse.setValue(0);
      }
    };
  }, []);
  return pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] });
}

type SkeletonProps = ViewProps & {
  /** Tamanho, forma e posição do bloco, ex. "h-4 w-32 rounded-full", "h-14 flex-1". */
  className?: string;
};

/** Mesmo valor do token `surface-selected` (o `Animated.View` recebe cor por `style`). */
const SKELETON_COLOR = "#E0E1E6";

/**
 * Bloco cinza pulsando, no lugar do conteúdo enquanto ele carrega.
 *
 * As classes ficam na `View` de fora, que participa do layout (aceita `w-1/2`, `flex-1`
 * etc.); só o preenchimento interno pulsa. Usa o `Animated` do React Native: o
 * `Animated.View` do Reanimated passa pelo `cssInterop` do NativeWind e perde estilos.
 */
export function Skeleton({ className = "", ...rest }: SkeletonProps) {
  const opacity = usePulse();
  // Arredondamento padrão só sem `rounded-*` próprio: no NativeWind a classe que
  // vence o conflito depende da folha de estilos, não da ordem no `className`.
  const radius = /\brounded/.test(className) ? "" : "rounded-two";
  return (
    <View
      className={`overflow-hidden ${radius} ${className}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      {...rest}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: SKELETON_COLOR, opacity },
        ]}
      />
    </View>
  );
}

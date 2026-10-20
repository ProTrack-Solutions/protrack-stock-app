import { useEffect, type ReactNode } from "react";
import { View } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Animated } from "@/components/ui/animated";

/** Atraso base entre itens que entram em sequência (ms). */
export const STAGGER = 90;

type OrbProps = {
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  /** Duração de meia volta do movimento (ms). */
  duration: number;
  /** Deslocamento vertical máximo (px). */
  travel: number;
};

function Orb({ size, duration, travel, ...position }: OrbProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [duration, progress, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: progress.value * travel },
      { translateX: progress.value * travel * -0.4 },
      { scale: 1 + progress.value * 0.12 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute rounded-full bg-white/10"
      style={[{ width: size, height: size, ...position }, style]}
    />
  );
}

/** Círculos translúcidos que flutuam devagar atrás do conteúdo do hero. */
export function FloatingOrbs() {
  return (
    <View pointerEvents="none" className="absolute inset-0">
      <Orb size={220} top={-80} right={-70} duration={5200} travel={18} />
      <Orb size={140} top={140} left={-60} duration={6400} travel={-22} />
      <Orb size={90} bottom={30} right={30} duration={4300} travel={14} />
    </View>
  );
}

/** Faz o conteúdo subir e descer suavemente, em loop. */
export function Float({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const offset = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    offset.value = withRepeat(
      withTiming(-5, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [offset, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Escala ao pressionar: espalhe `handlers` no Pressable e `style` no wrapper. */
export function usePressScale(pressedScale = 0.96) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return {
    style,
    handlers: {
      onPressIn: () => {
        scale.value = withSpring(pressedScale, { damping: 15, stiffness: 300 });
      },
      onPressOut: () => {
        scale.value = withSpring(1, { damping: 12, stiffness: 220 });
      },
    },
  };
}

/** Balança horizontalmente sempre que `trigger` muda para um valor verdadeiro. */
export function useShake(trigger: unknown) {
  const x = useSharedValue(0);

  useEffect(() => {
    if (!trigger) return;
    x.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 70 }),
      withTiming(-6, { duration: 70 }),
      withTiming(6, { duration: 70 }),
      withTiming(0, { duration: 50 }),
    );
  }, [trigger, x]);

  return useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
}

import { Ionicons } from "@expo/vector-icons";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { scheduleOnRN } from "react-native-worklets";

import { ThemedText } from "@/components/themed-text";
import { Animated } from "@/components/ui/animated";
import { Gradients } from "@/constants/theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const FILL_MS = 1100;
const DRAIN_MS = 950;
/** Tempo coberto antes de escoar, para a tela de destino montar por baixo. */
const HOLD_MS = 380;
/** Pontos amostrados em cada borda do líquido. */
const SAMPLES = 40;
const WAVE = 10;

type Drip = { x: number; width: number; length: number };

/** Línguas que escorrem na frente da borda inferior (frações da tela). */
const DRIPS: Drip[] = [
  { x: 0.08, width: 0.05, length: 0.1 },
  { x: 0.27, width: 0.06, length: 0.22 },
  { x: 0.5, width: 0.08, length: 0.3 },
  { x: 0.7, width: 0.05, length: 0.14 },
  { x: 0.9, width: 0.06, length: 0.24 },
];

/** Restos que ficam para trás, presos ao topo, enquanto o líquido escoa. */
const TAILS: Drip[] = [
  { x: 0.18, width: 0.07, length: 0.2 },
  { x: 0.42, width: 0.05, length: 0.12 },
  { x: 0.63, width: 0.07, length: 0.26 },
  { x: 0.86, width: 0.05, length: 0.15 },
];

/** Gotas que se soltam das línguas maiores (índice em DRIPS). */
const DROPS = [
  { drip: 1, radius: 7, start: 0.35 },
  { drip: 2, radius: 9, start: 0.25 },
  { drip: 4, radius: 6, start: 0.45 },
];

const MAX_DRIP = Math.max(...DRIPS.map((d) => d.length));
const MAX_TAIL = Math.max(...TAILS.map((d) => d.length));

function dripOffset(x: number, drips: Drip[], width: number, height: number) {
  "worklet";
  let sum = 0;
  for (let i = 0; i < drips.length; i++) {
    const d = drips[i];
    const z = (x - d.x * width) / (d.width * width);
    sum += d.length * height * Math.exp(-z * z);
  }
  return sum;
}

/** Curva suave pelos pontos: quadráticas com controle em cada ponto. */
function smooth(points: number[][]) {
  "worklet";
  let d = "";
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    d += ` Q${x.toFixed(1)},${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)},${((y + ny) / 2).toFixed(1)}`;
  }
  const [lx, ly] = points[points.length - 1];
  return `${d} L${lx.toFixed(1)},${ly.toFixed(1)}`;
}

function easeInOutCubic(t: number) {
  "worklet";
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type Geometry = {
  /** y da borda inferior (antes das línguas). */
  front: number;
  /** y da borda superior (antes dos restos). */
  back: number;
  /** 0..1: quanto as línguas já cresceram. */
  dripGrow: number;
  /** 0..1: quanto os restos já cresceram. */
  tailGrow: number;
  phase: number;
};

/** `progress`: 0→1 enche a tela de cima para baixo; 1→2 escoa para baixo. */
function geometry(progress: number, height: number): Geometry {
  "worklet";
  const fill = easeInOutCubic(Math.min(progress, 1));
  const drain = Math.max(progress - 1, 0);
  const drainEased = drain * drain;
  const hidden = -(MAX_DRIP * height + WAVE + 20);
  return {
    front:
      progress <= 1
        ? interpolate(fill, [0, 1], [hidden, height + 40])
        : height + 40 + drainEased * height,
    back:
      progress <= 1
        ? -height
        : interpolate(
            drainEased,
            [0, 1],
            [-WAVE - 20, height + MAX_TAIL * height + WAVE + 20],
          ),
    dripGrow: 0.35 + 0.65 * fill,
    tailGrow: Math.min(drain * 2.5, 1),
    phase: progress * Math.PI * 2.2,
  };
}

function LiquidOverlay({ progress }: { progress: SharedValue<number> }) {
  const { width } = Dimensions.get("window");
  const height = Math.max(
    Dimensions.get("window").height,
    Dimensions.get("screen").height,
  );

  const pathProps = useAnimatedProps(() => {
    const g = geometry(progress.value, height);
    const top: number[][] = [];
    const bottom: number[][] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const x = -10 + ((width + 20) * i) / SAMPLES;
      const wave = Math.sin((x / width) * Math.PI * 3 + g.phase) * WAVE;
      top.push([
        x,
        g.back - g.tailGrow * dripOffset(x, TAILS, width, height) + wave * 0.6,
      ]);
      bottom.push([
        x,
        g.front + g.dripGrow * dripOffset(x, DRIPS, width, height) + wave,
      ]);
    }
    bottom.reverse();
    const d =
      `M${top[0][0].toFixed(1)},${top[0][1].toFixed(1)}` +
      smooth(top) +
      ` L${bottom[0][0].toFixed(1)},${bottom[0][1].toFixed(1)}` +
      smooth(bottom) +
      " Z";
    return { d };
  });

  const brandStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: interpolate(p, [0.65, 0.95, 1.1, 1.4], [0, 1, 1, 0], "clamp"),
      transform: [
        { scale: interpolate(p, [0.65, 0.95, 1.4], [0.85, 1, 1.08], "clamp") },
        { translateY: interpolate(p, [1, 1.4], [0, 40], "clamp") },
      ],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="auto">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient
            id="liquid"
            x1="0"
            y1="0"
            x2={width}
            y2={height}
            gradientUnits="userSpaceOnUse"
          >
            {Gradients.brand.map((color, i) => (
              <Stop
                key={color}
                offset={i / (Gradients.brand.length - 1)}
                stopColor={color}
              />
            ))}
          </LinearGradient>
        </Defs>
        <AnimatedPath
          animatedProps={pathProps}
          fill="url(#liquid)"
          // Brilho na borda, como a superfície de um líquido.
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={3}
        />
        {DROPS.map((drop) => (
          <Drop
            key={drop.drip}
            {...drop}
            progress={progress}
            width={width}
            height={height}
          />
        ))}
      </Svg>

      <Animated.View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center gap-three"
        style={brandStyle}
      >
        <View className="h-16 w-16 items-center justify-center rounded-three bg-white/[0.18]">
          <Ionicons name="trending-up" size={34} color="#ffffff" />
        </View>
        <ThemedText className="text-2xl font-bold text-white">
          ProTrack
        </ThemedText>
      </Animated.View>
    </View>
  );
}

function Drop({
  drip,
  radius,
  start,
  progress,
  width,
  height,
}: (typeof DROPS)[number] & {
  progress: SharedValue<number>;
  width: number;
  height: number;
}) {
  const props = useAnimatedProps(() => {
    const p = progress.value;
    const g = geometry(Math.min(p, 1), height);
    const d = DRIPS[drip];
    const tip = g.front + g.dripGrow * d.length * height;
    const t = Math.min(p, 1);
    // Antes de se soltar a gota fica escondida dentro da ponta.
    const fall = Math.max(t - start, 0) / (1 - start);
    return {
      cx: d.x * width,
      cy: tip + radius + fall * fall * height * 0.45,
      r: p > 1 || t < start ? 0 : radius * Math.min(fall * 6, 1),
    };
  });
  return <AnimatedCircle animatedProps={props} fill={Gradients.brand[1]} />;
}

type LiquidTransitionValue = {
  /**
   * Escorre o gradiente até cobrir a tela e resolve nesse momento. Troque a
   * tela em seguida: o líquido escoa sozinho e revela o destino.
   */
  cover: () => Promise<void>;
};

const LiquidTransitionContext = createContext<LiquidTransitionValue | null>(
  null,
);

export function LiquidTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const [active, setActive] = useState(false);
  const resolveRef = useRef<(() => void) | null>(null);

  const drain = useCallback(() => {
    progress.value = withTiming(
      2,
      { duration: DRAIN_MS, easing: Easing.linear },
      (finished) => {
        if (finished) scheduleOnRN(setActive, false);
      },
    );
  }, [progress]);

  const onCovered = useCallback(() => {
    resolveRef.current?.();
    resolveRef.current = null;
    setTimeout(drain, HOLD_MS);
  }, [drain]);

  const cover = useCallback(
    () =>
      new Promise<void>((resolve) => {
        if (reduceMotion) return resolve();
        resolveRef.current = resolve;
        progress.value = 0;
        setActive(true);
        progress.value = withTiming(
          1,
          { duration: FILL_MS, easing: Easing.linear },
          (finished) => {
            if (finished) scheduleOnRN(onCovered);
          },
        );
      }),
    [onCovered, progress, reduceMotion],
  );

  const value = useMemo(() => ({ cover }), [cover]);

  return (
    <LiquidTransitionContext.Provider value={value}>
      {children}
      {active && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 2000 }]}>
          <LiquidOverlay progress={progress} />
        </View>
      )}
    </LiquidTransitionContext.Provider>
  );
}

export function useLiquidTransition() {
  const context = useContext(LiquidTransitionContext);
  if (!context) {
    throw new Error(
      "useLiquidTransition deve ser usado dentro de <LiquidTransitionProvider>",
    );
  }
  return context;
}

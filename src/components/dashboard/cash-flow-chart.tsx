import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";

import { SectionCard } from "@/components/sale/section-card";
import { ThemedText } from "@/components/themed-text";
import type { CashFlowPoint } from "@/interfaces/dashboard.interface";

const INFLOW_COLOR = "#38A169";
const OUTFLOW_COLOR = "#E53E3E";
const HEIGHT = 200;
const PADDING = { top: 12, bottom: 12, left: 8, right: 8 };
const GRID_LINES = 4;

type Point = { x: number; y: number };

/** Curva suave (Catmull-Rom convertida em Bézier) passando por todos os pontos. */
function smoothPath(points: Point[]) {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  const [width, setWidth] = useState(0);

  const max = Math.max(...data.flatMap((d) => [d.total_inflow, d.total_outflow]), 1);
  const plotWidth = width - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const baseline = PADDING.top + plotHeight;

  const toPoints = (key: "total_inflow" | "total_outflow"): Point[] =>
    data.map((d, i) => ({
      x: PADDING.left + (data.length > 1 ? (i / (data.length - 1)) * plotWidth : plotWidth / 2),
      y: PADDING.top + plotHeight - (Math.max(d[key], 0) / max) * plotHeight,
    }));

  const inflow = toPoints("total_inflow");
  const outflow = toPoints("total_outflow");
  const inflowPath = smoothPath(inflow);
  const areaPath =
    inflow.length > 0
      ? `${inflowPath} L ${inflow[inflow.length - 1].x} ${baseline} L ${inflow[0].x} ${baseline} Z`
      : "";

  return (
    <SectionCard title={`Fluxo de Caixa (${data.length} meses)`}>
      <View className="flex-row gap-three">
        <LegendItem color={INFLOW_COLOR} label="Entradas" />
        <LegendItem color={OUTFLOW_COLOR} label="Saídas" />
      </View>

      {data.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Sem movimentações no período
        </ThemedText>
      ) : (
        <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: HEIGHT }}>
          {width > 0 && (
            <Svg width={width} height={HEIGHT}>
              <Defs>
                <LinearGradient id="inflowArea" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={INFLOW_COLOR} stopOpacity={0.15} />
                  <Stop offset="1" stopColor={INFLOW_COLOR} stopOpacity={0.05} />
                </LinearGradient>
              </Defs>

              {Array.from({ length: GRID_LINES + 1 }, (_, i) => {
                const y = PADDING.top + (plotHeight / GRID_LINES) * i;
                return (
                  <Line
                    key={i}
                    x1={PADDING.left}
                    x2={width - PADDING.right}
                    y1={y}
                    y2={y}
                    stroke="#E0E1E6"
                    strokeDasharray="4 4"
                  />
                );
              })}

              <Path d={areaPath} fill="url(#inflowArea)" />
              <Path d={inflowPath} stroke={INFLOW_COLOR} strokeWidth={2} fill="none" />
              <Path d={smoothPath(outflow)} stroke={OUTFLOW_COLOR} strokeWidth={2} fill="none" />

              {inflow.map((p, i) => (
                <Circle key={`in-${i}`} cx={p.x} cy={p.y} r={3.5} fill="#ffffff" stroke={INFLOW_COLOR} strokeWidth={1.5} />
              ))}
              {outflow.map((p, i) => (
                <Circle key={`out-${i}`} cx={p.x} cy={p.y} r={3.5} fill="#ffffff" stroke={OUTFLOW_COLOR} strokeWidth={1.5} />
              ))}
            </Svg>
          )}
        </View>
      )}
    </SectionCard>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-one">
      <View className="h-0.5 w-3 rounded-full" style={{ backgroundColor: color }} />
      <ThemedText type="small" themeColor="textSecondary" className="text-xs">
        {label}
      </ThemedText>
    </View>
  );
}

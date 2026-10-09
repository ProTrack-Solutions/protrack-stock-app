import { useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { G, Line, Path, Rect, Text as SvgText } from "react-native-svg";

import { ThemedText } from "@/components/themed-text";
import type { CashFlowPeriod } from "@/interfaces/cash-flow.interface";

const INFLOW_COLOR = "#38A169";
const OUTFLOW_COLOR = "#E53E3E";
const BALANCE_COLOR = "#3c87f7";
const HEIGHT = 200;
const LABEL_HEIGHT = 18;
const PADDING = { top: 20, bottom: 8, left: 4, right: 4 };
const GRID_LINES = 4;

type HistoryChartProps = {
  periods: CashFlowPeriod[];
  /** Tendência de entrada por dia, usada para projetar o saldo. */
  projection: number;
};

/** "05/10/2026" -> "05/10" */
const shortLabel = (period: string) => period.slice(0, 5);

export function HistoryChart({ periods, projection }: HistoryChartProps) {
  const [width, setWidth] = useState(0);
  const [showHistory, setShowHistory] = useState(true);
  const [showProjection, setShowProjection] = useState(true);

  // Projeta ~1/3 do período: saldo final + tendência diária de entrada.
  const projectionSlots = showProjection
    ? Math.min(Math.max(Math.ceil(periods.length / 3), 2), 10)
    : 0;
  const lastBalance = periods[periods.length - 1]?.total_period ?? 0;
  const projected = Array.from(
    { length: projectionSlots },
    (_, i) => lastBalance + Math.max(projection, 0) * (i + 1),
  );

  const values = [
    0,
    ...periods.flatMap((p) => [
      p.total_period_inflow,
      p.total_period_outflow,
      p.total_period,
    ]),
    ...projected,
  ];
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const slots = periods.length + projectionSlots;
  const plotWidth = width - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const slotWidth = slots > 0 ? plotWidth / slots : 0;
  const x = (i: number) => PADDING.left + slotWidth * (i + 0.5);
  const y = (v: number) =>
    PADDING.top + ((max - v) / (max - min || 1)) * plotHeight;
  const zeroY = y(0);

  const balancePath = periods
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.total_period)}`)
    .join(" ");
  const projectionPath =
    projected.length > 0 && periods.length > 0
      ? [
          `M ${x(periods.length - 1)} ${y(lastBalance)}`,
          ...projected.map((v, i) => `L ${x(periods.length + i)} ${y(v)}`),
        ].join(" ")
      : "";
  const barWidth = Math.min(Math.max(slotWidth * 0.28, 3), 14);
  const labelIndexes = new Set([
    0,
    Math.floor((periods.length - 1) / 2),
    periods.length - 1,
  ]);

  return (
    <View className="gap-three rounded-three bg-paper p-three border border-line">
      <View className="flex-row items-center justify-between gap-two">
        <ThemedText className="flex-1 font-bold">
          Histórico e Projeções
        </ThemedText>
        <Toggle
          label="Histórico"
          active={showHistory}
          activeClass="bg-emerald-600"
          onPress={() => setShowHistory((v) => !v)}
        />
        <Toggle
          label="Projeção"
          active={showProjection}
          activeClass="bg-brand"
          onPress={() => setShowProjection((v) => !v)}
        />
      </View>

      <View className="flex-row flex-wrap gap-three">
        <Legend color={INFLOW_COLOR} label="Entradas" square />
        <Legend color={OUTFLOW_COLOR} label="Saídas" square />
        <Legend color={BALANCE_COLOR} label="Saldo" />
      </View>

      {periods.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Sem movimentações no período.
        </ThemedText>
      ) : (
        <View
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          style={{ height: HEIGHT + LABEL_HEIGHT }}
        >
          {width > 0 && (
            <Svg width={width} height={HEIGHT + LABEL_HEIGHT}>
              {projectionSlots > 0 && (
                <>
                  <Rect
                    x={PADDING.left + slotWidth * periods.length}
                    y={PADDING.top - 14}
                    width={slotWidth * projectionSlots}
                    height={plotHeight + 14}
                    fill="#EEF5FF"
                  />
                  <SvgText
                    x={
                      PADDING.left +
                      slotWidth * (periods.length + projectionSlots / 2)
                    }
                    y={PADDING.top - 4}
                    fontSize={9}
                    fontWeight="bold"
                    fill={BALANCE_COLOR}
                    textAnchor="middle"
                  >
                    PROJEÇÃO
                  </SvgText>
                </>
              )}

              {Array.from({ length: GRID_LINES + 1 }, (_, i) => {
                const gy = PADDING.top + (plotHeight / GRID_LINES) * i;
                return (
                  <Line
                    key={i}
                    x1={PADDING.left}
                    x2={width - PADDING.right}
                    y1={gy}
                    y2={gy}
                    stroke="#E0E1E6"
                    strokeDasharray="4 4"
                  />
                );
              })}
              <Line
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={zeroY}
                y2={zeroY}
                stroke="#C9CCD3"
              />

              {showHistory &&
                periods.map((p, i) => (
                  <G key={p.period}>
                    {p.total_period_inflow > 0 && (
                      <Rect
                        x={x(i) - barWidth - 1}
                        y={y(p.total_period_inflow)}
                        width={barWidth}
                        height={zeroY - y(p.total_period_inflow)}
                        rx={2}
                        fill={INFLOW_COLOR}
                      />
                    )}
                    {p.total_period_outflow > 0 && (
                      <Rect
                        x={x(i) + 1}
                        y={y(p.total_period_outflow)}
                        width={barWidth}
                        height={zeroY - y(p.total_period_outflow)}
                        rx={2}
                        fill={OUTFLOW_COLOR}
                      />
                    )}
                  </G>
                ))}

              {showHistory && (
                <Path
                  d={balancePath}
                  stroke={BALANCE_COLOR}
                  strokeWidth={2}
                  fill="none"
                />
              )}
              {projectionPath ? (
                <Path
                  d={projectionPath}
                  stroke={BALANCE_COLOR}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="none"
                />
              ) : null}

              {periods.map((p, i) =>
                labelIndexes.has(i) ? (
                  <SvgText
                    key={`label-${p.period}`}
                    x={i === 0 ? PADDING.left : x(i)}
                    y={HEIGHT + 12}
                    fontSize={10}
                    fill="#60646C"
                    // O primeiro rótulo ancora à esquerda para não cortar na borda.
                    textAnchor={i === 0 ? "start" : "middle"}
                  >
                    {shortLabel(p.period)}
                  </SvgText>
                ) : null,
              )}
            </Svg>
          )}
        </View>
      )}
    </View>
  );
}

function Toggle({
  label,
  active,
  activeClass,
  onPress,
}: {
  label: string;
  active: boolean;
  activeClass: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}
      className={`rounded-full px-three py-one active:opacity-70 ${active ? activeClass : "border border-line bg-paper"}`}
    >
      <ThemedText
        type="smallBold"
        className={`text-xs ${active ? "text-white" : "text-muted"}`}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

function Legend({
  color,
  label,
  square,
}: {
  color: string;
  label: string;
  square?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-one">
      <View
        className={square ? "h-2.5 w-2.5 rounded-sm" : "h-0.5 w-3 rounded-full"}
        style={{ backgroundColor: color }}
      />
      <ThemedText type="small" themeColor="textSecondary" className="text-xs">
        {label}
      </ThemedText>
    </View>
  );
}

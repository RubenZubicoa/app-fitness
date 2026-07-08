import { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export type BarDatum = {
  label: string;
  value: number;
  /** Marca la barra como "completada" o destacada. */
  highlight?: boolean;
};

type BarChartProps = {
  data: BarDatum[];
  height?: number;
  max?: number;
  colors?: readonly [string, string];
};

/**
 * Gráfico de barras verticales con esquinas redondeadas y degradado.
 * Solo presentación (datos estáticos).
 */
export function BarChart({ data, height = 180, max, colors }: BarChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const gradient = colors ?? ([theme.primary, theme.primaryDark] as const);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const padBottom = 22;
  const chartH = height - padBottom;
  const maxVal = max ?? Math.max(...data.map((d) => d.value), 1);
  const slot = data.length > 0 ? width / data.length : 0;
  const barW = Math.min(slot * 0.5, 26);
  const gid = 'bar-grad';
  const trackId = 'bar-track';

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={gradient[0]} />
              <Stop offset="1" stopColor={gradient[1]} />
            </LinearGradient>
            <LinearGradient id={trackId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.track} stopOpacity={0.9} />
              <Stop offset="1" stopColor={theme.track} stopOpacity={0.4} />
            </LinearGradient>
          </Defs>
          {data.map((_, i) => {
            const x = slot * i + (slot - barW) / 2;
            return (
              <Rect
                key={`t-${i}`}
                x={x}
                y={4}
                width={barW}
                height={chartH - 4}
                rx={barW / 2}
                fill={`url(#${trackId})`}
              />
            );
          })}
          {data.map((d, i) => {
            const x = slot * i + (slot - barW) / 2;
            const barH = Math.max((d.value / maxVal) * (chartH - 8), 3);
            const y = chartH - barH;
            return (
              <Rect
                key={`b-${i}`}
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={barW / 2}
                fill={d.highlight === false ? theme.border : `url(#${gid})`}
              />
            );
          })}
        </Svg>
      )}
      <View style={styles.labels} pointerEvents="none">
        {data.map((d, i) => (
          <ThemedText key={i} type="caption" themeColor="textMuted" style={styles.label}>
            {d.label}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  label: {
    flex: 1,
    textAlign: 'center',
  },
});

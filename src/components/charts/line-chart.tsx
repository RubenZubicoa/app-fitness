import { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
  Line,
} from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type LineChartProps = {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  fillColor?: string;
  /** Muestra el punto final resaltado. */
  highlightLast?: boolean;
  showDots?: boolean;
};

/** Construye una curva suave (Catmull-Rom → Bézier). */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * Gráfico de línea con área degradada. Solo presentación (datos estáticos).
 */
export function LineChart({
  data,
  labels,
  height = 180,
  color,
  fillColor,
  highlightLast = true,
  showDots = true,
}: LineChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const stroke = color ?? theme.primary;
  const fill = fillColor ?? stroke;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const padX = 8;
  const padTop = 16;
  const padBottom = labels ? 24 : 12;
  const chartW = Math.max(width - padX * 2, 1);
  const chartH = height - padTop - padBottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: padX + (data.length === 1 ? chartW / 2 : (chartW * i) / (data.length - 1)),
    y: padTop + chartH - ((v - min) / range) * chartH,
  }));

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${
          padTop + chartH
        } Z`
      : '';

  const gid = `line-${stroke}`.replace(/[^a-zA-Z0-9]/g, '');
  const fillId = `fill-${fill}`.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={fill} stopOpacity={0.28} />
              <Stop offset="1" stopColor={fill} stopOpacity={0.02} />
            </LinearGradient>
            <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={stroke} stopOpacity={0.7} />
              <Stop offset="1" stopColor={stroke} stopOpacity={1} />
            </LinearGradient>
          </Defs>

          {[0.25, 0.5, 0.75].map((g) => (
            <Line
              key={g}
              x1={padX}
              x2={width - padX}
              y1={padTop + chartH * g}
              y2={padTop + chartH * g}
              stroke={theme.border}
              strokeWidth={1}
              strokeDasharray="4 6"
            />
          ))}

          <Path d={areaPath} fill={`url(#${fillId})`} />
          <Path d={linePath} stroke={`url(#${gid})`} strokeWidth={3} fill="none" strokeLinecap="round" />

          {showDots &&
            points.map((p, i) => {
              const isLast = i === points.length - 1;
              if (isLast && highlightLast) {
                return (
                  <Circle key={i} cx={p.x} cy={p.y} r={6} fill={stroke} stroke={theme.card} strokeWidth={3} />
                );
              }
              return <Circle key={i} cx={p.x} cy={p.y} r={3} fill={stroke} opacity={0.5} />;
            })}
        </Svg>
      )}
      {labels && (
        <View style={styles.labels} pointerEvents="none">
          {labels.map((l, i) => (
            <ThemedText key={i} type="caption" themeColor="textMuted" style={styles.label}>
              {l}
            </ThemedText>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  label: {
    flex: 1,
    textAlign: 'center',
  },
});

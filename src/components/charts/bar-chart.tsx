import { useMemo, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent, Platform } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop, G } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';
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
  /** Si es true, todas las barras usan el color activo (ninguna en gris). */
  allHighlighted?: boolean;
  /** Unidad opcional en el tooltip (ej. "pasos"). */
  unit?: string;
};

/**
 * Gráfico de barras verticales con tooltip al pasar el ratón / pulsar.
 */
export function BarChart({
  data,
  height = 180,
  max,
  colors,
  allHighlighted = false,
  unit,
}: BarChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const gradient = colors ?? ([theme.primary, theme.primaryDark] as const);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const padBottom = 22;
  const chartH = height - padBottom;
  const maxVal = max ?? Math.max(...data.map((d) => d.value), 1);
  const slot = data.length > 0 ? width / data.length : 0;
  const barW = Math.min(slot * 0.5, 26);
  const gid = 'bar-grad';
  const trackId = 'bar-track';

  const bars = useMemo(
    () =>
      data.map((d, i) => {
        const x = slot * i + (slot - barW) / 2;
        const barH = Math.max((d.value / maxVal) * (chartH - 8), d.value > 0 ? 3 : 0);
        const y = chartH - barH;
        return { ...d, x, y, barH, index: i };
      }),
    [data, slot, barW, maxVal, chartH],
  );

  const tooltip = useMemo(() => {
    if (activeIndex === null || !bars[activeIndex] || width <= 0) return null;
    const bar = bars[activeIndex];
    const tooltipWidth = 88;
    const left = Math.min(
      Math.max(bar.x + barW / 2 - tooltipWidth / 2, 4),
      Math.max(width - tooltipWidth - 4, 4),
    );
    const top = Math.max(bar.y - 48, 2);
    const valueLabel =
      unit != null && unit !== '' ? `${bar.value.toLocaleString('es-ES')} ${unit}` : bar.value.toLocaleString('es-ES');
    return {
      left,
      top,
      label: bar.label,
      value: valueLabel,
    };
  }, [activeIndex, bars, barW, width, unit]);

  const clearActive = () => setActiveIndex(null);

  return (
    <View
      onLayout={onLayout}
      style={{ height }}
      {...(Platform.OS === 'web' ? ({ onMouseLeave: clearActive } as object) : {})}>
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
          {bars.map((bar) => (
            <Rect
              key={`t-${bar.index}`}
              x={bar.x}
              y={4}
              width={barW}
              height={chartH - 4}
              rx={barW / 2}
              fill={`url(#${trackId})`}
              pointerEvents="none"
            />
          ))}
          {bars.map((bar) => {
            const highlighted = allHighlighted || bar.highlight !== false;
            const isActive = activeIndex === bar.index;
            return (
              <G key={`b-${bar.index}`}>
                {/* Hit area amplia para hover / tap */}
                <Rect
                  x={slot * bar.index}
                  y={0}
                  width={slot}
                  height={chartH}
                  fill="transparent"
                  onPress={() => setActiveIndex(bar.index)}
                  {...(Platform.OS === 'web'
                    ? ({
                        onMouseEnter: () => setActiveIndex(bar.index),
                        style: { cursor: 'pointer' },
                      } as object)
                    : {})}
                />
                {bar.barH > 0 ? (
                  <Rect
                    x={bar.x}
                    y={bar.y}
                    width={barW}
                    height={bar.barH}
                    rx={barW / 2}
                    fill={highlighted ? `url(#${gid})` : theme.border}
                    opacity={isActive ? 1 : highlighted ? 0.95 : 0.85}
                    pointerEvents="none"
                  />
                ) : null}
              </G>
            );
          })}
        </Svg>
      )}

      {tooltip ? (
        <View
          pointerEvents="none"
          style={[
            styles.tooltip,
            Shadow.floating,
            {
              left: tooltip.left,
              top: tooltip.top,
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}>
          <ThemedText type="caption" themeColor="textMuted" style={styles.tooltipLabel}>
            {tooltip.label}
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: gradient[0] }}>
            {tooltip.value}
          </ThemedText>
        </View>
      ) : null}

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
  tooltip: {
    position: 'absolute',
    minWidth: 72,
    maxWidth: 120,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 1,
    zIndex: 10,
  },
  tooltipLabel: {
    textAlign: 'center',
  },
});

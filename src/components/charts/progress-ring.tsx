import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type ProgressRingProps = {
  /** Progreso entre 0 y 1. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  colors?: readonly [string, string];
  trackColor?: string;
  label?: string;
  value?: string;
  children?: React.ReactNode;
};

/**
 * Anillo de progreso circular con degradado. Solo presentación (sin lógica).
 */
export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 12,
  colors,
  trackColor,
  label,
  value,
  children,
}: ProgressRingProps) {
  const theme = useTheme();
  const gradient = colors ?? ([theme.primary, theme.primaryDark] as const);
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);
  const gradientId = `ring-${gradient[0]}-${gradient[1]}`.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={gradient[0]} />
            <Stop offset="1" stopColor={gradient[1]} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor ?? theme.track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {children ?? (
          <>
            {value != null && (
              <ThemedText type="subtitle" style={styles.value}>
                {value}
              </ThemedText>
            )}
            {label != null && (
              <ThemedText type="caption" themeColor="textSecondary">
                {label}
              </ThemedText>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontWeight: '800',
  },
});

import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '@/theme';

export interface ProgressBarProps {
  /** Nilai persentase progres (0 - 100) */
  progress: number;
  /** Tinggi progress bar dalam pixel (default: 4) */
  height?: number;
  /** Warna latar track (default: colors.neutral[200]) */
  trackColor?: string;
  /** Warna batang isian (default: colors.secondary[500]) */
  fillColor?: string;
  /** ClassName untuk styling via NativeWind */
  className?: string;
  /** Style tambahan bila diperlukan */
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  progress,
  height = 4,
  trackColor = colors.neutral[200],
  fillColor = colors.secondary[500],
  className,
  style,
}: ProgressBarProps): React.JSX.Element {
  const clampedProgress = Math.max(0, Math.min(100, isNaN(progress) ? 0 : progress));

  return (
    <View
      className={`w-full rounded-full overflow-hidden ${className ?? ''}`}
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor,
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clampedProgress }}>
      <View
        className="h-full rounded-full"
        style={{
          width: `${clampedProgress}%`,
          backgroundColor: fillColor,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: radius.full,
    overflow: 'hidden',
  },
});


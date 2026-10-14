import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, radius} from '@/theme';

interface QuranProgressBarProps {
  percentage: number; // 0..100
  /** Warna track — dipakai saat bar berdiri di atas card gelap. */
  trackColor?: string;
  fillColor?: string;
}

export function QuranProgressBar({
  percentage,
  trackColor = colors.neutral[200],
  fillColor = colors.primary[500],
}: QuranProgressBarProps): React.JSX.Element {
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <View
      style={[styles.track, {backgroundColor: trackColor}]}
      accessibilityRole="progressbar"
      accessibilityValue={{min: 0, max: 100, now: clamped}}>
      <View
        style={[styles.fill, {width: `${clamped}%`, backgroundColor: fillColor}]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});

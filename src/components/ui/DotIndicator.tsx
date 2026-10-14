import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, radius, spacing} from '@/theme';

interface DotIndicatorProps {
  count: number;
  activeIndex: number;
}

export function DotIndicator({count, activeIndex}: DotIndicatorProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {Array.from({length: count}).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === activeIndex && styles.dotActive]}
          accessibilityElementsHidden
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[300],
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary[500],
  },
});

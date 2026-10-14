import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, radius, spacing} from '@/theme';

const ROW_COUNT = 7;

export function PrayerScheduleSkeleton(): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityLabel="Memuat jadwal sholat">
      <View style={styles.dateBlock} />
      {Array.from({length: ROW_COUNT}).map((_, index) => (
        <View key={index} style={styles.row} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  dateBlock: {
    width: '60%',
    height: 40,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
  },
  row: {
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
});

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, spacing, radius} from '@/theme';

// Skeleton pemuatan, bukan ActivityIndicator layar penuh: bentuknya mengikuti
// kartu yang akan muncul supaya isi tidak melompat saat data datang.
export function DistributionProgramCardSkeleton(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.title} />
      <View style={styles.tags} />
      <View style={styles.line} />
      <View style={styles.line} />
      <View style={styles.bar} />
    </View>
  );
}

// Placeholder empat kartu ringkasan. Dipisah dari kartu program karena
// bentuknya beda: dua baris berisi dua kotak, bukan satu kartu memanjang.
export function DistributionSummarySkeleton(): React.JSX.Element {
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard} />
        <View style={styles.summaryCard} />
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard} />
        <View style={styles.summaryCard} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
  container: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  title: {
    height: 16,
    width: '75%',
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  tags: {
    height: 14,
    width: '55%',
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[100],
  },
  line: {
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[100],
  },
  bar: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
});

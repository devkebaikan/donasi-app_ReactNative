import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, spacing, radius} from '@/theme';

// Skeleton pemuatan awal, bukan ActivityIndicator layar penuh: bentuknya
// mengikuti tata letak yang akan muncul supaya halaman tidak melompat saat
// data datang. Pola yang sama dipakai DonasiBersamaGroupCardSkeleton.
export function ImpactMapSkeleton(): React.JSX.Element {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Memuat peta">
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem} />
        <View style={styles.summaryItem} />
        <View style={styles.summaryItem} />
      </View>
      <View style={styles.map} />
      <View style={styles.listRow} />
      <View style={styles.asnafBlock} />
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  summaryItem: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
  },
  map: {
    width: '100%',
    // Rasio kira-kira sama dengan viewBox peta (1000x368) supaya pergantian
    // dari skeleton ke peta tidak menggeser isi di bawahnya.
    aspectRatio: 1000 / 368,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
  listRow: {
    height: 48,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
  asnafBlock: {
    height: 180,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
});

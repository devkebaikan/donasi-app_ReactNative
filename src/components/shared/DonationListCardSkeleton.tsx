import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, spacing, radius} from '@/theme';

// Kerangka kartu program saat pemuatan awal tab "Pilihan Rutin". Bentuknya
// mengikuti DonationListCard varian list: thumbnail di kiri, judul + mitra +
// bar progres + footer di kanan. Pola sama dengan
// DonasiBersamaGroupCardSkeleton.
export function DonationListCardSkeleton(): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.thumbnail} />
      <View style={styles.content}>
        <View style={styles.title} />
        <View style={[styles.line, styles.lineShort]} />
        <View style={styles.bar} />
        <View style={styles.footerRow}>
          <View style={styles.footerItem} />
          <View style={styles.footerItemSmall} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  thumbnail: {
    // Landscape 16:9, sama persis dengan thumbnail DonationListCard varian list.
    width: 160,
    height: (160 * 9) / 16,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    width: '85%',
    height: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  line: {
    width: '100%',
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  lineShort: {
    width: '55%',
  },
  bar: {
    width: '100%',
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerItem: {
    width: 110,
    height: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  footerItemSmall: {
    width: 40,
    height: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
});

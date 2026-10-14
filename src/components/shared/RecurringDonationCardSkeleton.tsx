import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, spacing, radius} from '@/theme';

// Kerangka kartu rutinitas saat pemuatan awal. Ukuran dan jaraknya mengikuti
// RecurringDonationCard persis supaya daftar tidak melompat saat data datang.
export function RecurringDonationCardSkeleton(): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.thumbnail} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.title} />
          <View style={styles.badge} />
        </View>
        <View style={styles.line} />
        <View style={styles.footerRow}>
          <View style={styles.amount} />
          <View style={styles.button} />
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
    // Landscape 16:9, sama persis dengan thumbnail RecurringDonationCard.
    width: 100,
    height: (100 * 9) / 16,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    height: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  badge: {
    width: 48,
    height: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  line: {
    width: '60%',
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  amount: {
    width: 120,
    height: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  button: {
    width: 72,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
});

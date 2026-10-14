import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, spacing, radius} from '@/theme';

// Kerangka kartu tantangan saat pemuatan awal. Ukuran dan jaraknya mengikuti
// TantanganCard persis supaya daftar tidak melompat saat data datang.
export function TantanganCardSkeleton(): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badge} />
        <View style={styles.days} />
      </View>
      <View style={styles.title} />
      <View style={styles.line} />
      <View style={[styles.line, styles.lineShort]} />
      <View style={styles.bar} />
      <View style={styles.bottomRow}>
        <View style={styles.avatars} />
        <View style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    width: 84,
    height: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  days: {
    width: 64,
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  title: {
    width: '70%',
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
    width: '60%',
  },
  bar: {
    width: '100%',
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
    marginTop: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  avatars: {
    width: 76,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
  },
  button: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
});

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, spacing, radius} from '@/theme';

// Tinggi, radius, dan tata letaknya menyamai DonasiBersamaMemberRow supaya
// daftar tidak melompat saat data datang.
export function DonasiBersamaMemberRowSkeleton(): React.JSX.Element {
  return (
    <View style={styles.row}>
      <View style={styles.avatar} />
      <View style={styles.body}>
        <View style={styles.lineLong} />
        <View style={styles.lineShort} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
  },
  body: {
    flex: 1,
    gap: spacing.sm,
  },
  lineLong: {
    width: '55%',
    height: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  lineShort: {
    width: 72,
    height: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
});

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import {formatCurrency} from '@/utils/formatCurrency';

interface DonasiRutinSummaryProps {
  amount: number;
  repeatCount: number;
  adminFee: number;
}

export function DonasiRutinSummary({
  amount,
  repeatCount,
  adminFee,
}: DonasiRutinSummaryProps): React.JSX.Element {
  const subtotal = amount * repeatCount;
  const total = subtotal + adminFee;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>
          Nominal: {formatCurrency(amount)} × {repeatCount}
        </Text>
        <Text style={styles.value}>{formatCurrency(subtotal)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Biaya Admin</Text>
        <Text style={styles.value}>{formatCurrency(adminFee)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total Pembayaran</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  value: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[200],
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  totalValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
  },
});

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {CloseCircle} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {Button} from '@/components/ui/Button';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

// Label & pesan sesuai Ketentuan Status Donasi (payment-invoice.md) — cuma
// dua status yang berujung ke tampilan ini, jadi tidak perlu Record 4 status.
const STATUS_CONTENT = {
  gagal: {
    label: 'GAGAL',
    title: 'Pembayaran Gagal',
    subtitle: 'Pembayaran tidak berhasil diproses. Silakan coba lagi.',
  },
  expired: {
    label: 'EXPIRED',
    title: 'Waktu Pembayaran Habis',
    subtitle: 'Batas waktu pembayaran telah berakhir. Silakan coba lagi.',
  },
} as const;

interface PaymentFailedStateProps {
  status: 'gagal' | 'expired';
  paymentMethod: string;
  totalAmount: number;
  onDonateAgain: () => void;
}

export function PaymentFailedState({
  status,
  paymentMethod,
  totalAmount,
  onDonateAgain,
}: PaymentFailedStateProps): React.JSX.Element {
  const content = STATUS_CONTENT[status];

  return (
    <View style={styles.container}>
      <Icon icon={CloseCircle} size={64} color={colors.semantic.error} />

      <View style={styles.titleWrapper}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Metode Pembayaran</Text>
          <Text style={styles.rowValue}>{paymentMethod}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Nominal</Text>
          <Text style={styles.rowValue}>{formatCurrency(totalAmount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{content.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <Button label="Donasi Lagi" onPress={onDonateAgain} size="lg" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  titleWrapper: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  card: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[0],
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  rowValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.semantic.error,
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.neutral[0],
  },
  buttonWrapper: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
});

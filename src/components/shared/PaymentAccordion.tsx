import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {AltArrowUp, AltArrowDown, Wallet} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatDate} from '@/utils/formatDate';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DonationPaymentStatus, TrackingPayment} from '@/types/tracking';

interface PaymentAccordionProps {
  payment: TrackingPayment;
  paymentStatus: DonationPaymentStatus;
  isExpanded: boolean;
  onToggle: () => void;
}

const PAYMENT_STATUS_LABEL: Record<DonationPaymentStatus, string> = {
  menunggu: 'MENUNGGU PEMBAYARAN',
  gagal: 'GAGAL',
  expired: 'EXPIRED',
  sukses: 'SUKSES',
};

const PAYMENT_STATUS_COLOR: Record<DonationPaymentStatus, string> = {
  menunggu: colors.semantic.warning,
  gagal: colors.semantic.error,
  expired: colors.semantic.error,
  sukses: colors.semantic.success,
};

export function PaymentAccordion({
  payment,
  paymentStatus,
  isExpanded,
  onToggle,
}: PaymentAccordionProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel="Detail Pembayaran"
        accessibilityState={{expanded: isExpanded}}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconWrapper}>
            <Icon icon={Wallet} size={16} color={colors.primary[600]} />
          </View>
          <Text style={styles.title}>Detail Pembayaran</Text>
        </View>
        <Icon
          icon={isExpanded ? AltArrowUp : AltArrowDown}
          size={20}
          color={colors.neutral[400]}
        />
      </TouchableOpacity>
      {isExpanded ? (
        <View style={styles.body}>
          <PaymentRow label="Metode" value={payment.method} />
          <PaymentRow label="Nominal" value={formatCurrency(payment.amount)} />
          <PaymentRow label="Tanggal Bayar" value={formatDate(payment.date)} />
          <PaymentRow
            label="Status Bayar"
            value={PAYMENT_STATUS_LABEL[paymentStatus]}
            valueColor={PAYMENT_STATUS_COLOR[paymentStatus]}
          />
        </View>
      ) : null}
    </View>
  );
}

function PaymentRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? {color: valueColor} : null]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    // Warna & ketebalan border disamakan dengan item "Project Salur
    // Terdekat" di DetailProgramScreen (ProjectSalurTerdekatSection) —
    // referensi resmi border kartu di halaman Status Donasi.
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neutral[200],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  body: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});

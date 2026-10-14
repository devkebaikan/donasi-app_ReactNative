import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Button} from '@/components/ui/Button';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import {formatCurrency} from '@/utils/formatCurrency';

interface ZakatHasilCardProps {
  amount: number;
  isWajib: boolean;
  onPressPilihProgram: () => void;
}

export function ZakatHasilCard({
  amount,
  isWajib,
  onPressPilihProgram,
}: ZakatHasilCardProps): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.label}>Hasil Perhitungan Zakat</Text>
      <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      <View
        style={[
          styles.statusBadge,
          isWajib ? styles.statusBadgeWajib : styles.statusBadgeTidakWajib,
        ]}>
        <Text
          style={[
            styles.statusText,
            isWajib ? styles.statusTextWajib : styles.statusTextTidakWajib,
          ]}>
          {isWajib ? 'Anda Wajib Zakat' : 'Anda Tidak Wajib Zakat'}
        </Text>
      </View>
      <Button label="Pilih Program" onPress={onPressPilihProgram} size="lg" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  amount: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusBadgeWajib: {
    backgroundColor: colors.semantic.warningLight,
  },
  statusBadgeTidakWajib: {
    backgroundColor: colors.semantic.successLight,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
  },
  statusTextWajib: {
    color: colors.semantic.warning,
  },
  statusTextTidakWajib: {
    color: colors.semantic.success,
  },
});

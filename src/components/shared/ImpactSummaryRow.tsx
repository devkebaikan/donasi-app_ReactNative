import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {MapPoint} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {formatNumberWithSeparator} from '@/utils/formatCurrency';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

interface ImpactSummaryRowProps {
  countryName: string;
  participantCount: number;
  serviceCount: number;
}

// Angka peserta dan layanan ditulis UTUH dengan pemisah titik — "200.539",
// bukan "200,5 Ribu". Yang diringkas hanya nominal rupiah, dan itu ada di
// screen laporan.
export function ImpactSummaryRow({
  countryName,
  participantCount,
  serviceCount,
}: ImpactSummaryRowProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <Icon icon={MapPoint} size={22} color={colors.secondary[500]} />
        <Text style={styles.regionLabel}>{countryName}</Text>
      </View>
      <View style={styles.column}>
        <Text style={styles.value}>
          {formatNumberWithSeparator(participantCount)}
        </Text>
        <Text style={styles.label}>Peserta Program</Text>
      </View>
      <View style={styles.column}>
        <Text style={styles.value}>
          {formatNumberWithSeparator(serviceCount)}
        </Text>
        <Text style={styles.label}>Layanan Program</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  regionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.secondary[500],
    textAlign: 'center',
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});

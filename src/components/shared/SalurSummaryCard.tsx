import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {SalurSummary} from '@/types/programDetail';

interface SalurSummaryCardProps {
  summary: SalurSummary;
}

interface SummaryRow {
  label: string;
  value: number;
}

export function SalurSummaryCard({
  summary,
}: SalurSummaryCardProps): React.JSX.Element {
  const rows: SummaryRow[] = [
    {label: 'Jumlah Project Salur', value: summary.totalProjects},
    {label: 'Project Akan Tergalang', value: summary.akanTergalangCount},
    {label: 'Project Sedang Tergalang', value: summary.sedangTergalangCount},
    {label: 'Project Selesai', value: summary.selesaiCount},
    {label: 'Total Penerima Manfaat', value: summary.totalBeneficiaryCount},
  ];

  return (
    <View style={styles.container}>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[styles.row, index === rows.length - 1 && styles.rowLast]}
          accessibilityRole="text"
          accessibilityLabel={`${row.label}: ${row.value.toLocaleString('id-ID')}`}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value.toLocaleString('id-ID')}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[700],
  },
  value: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
